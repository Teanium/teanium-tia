// Teanium TIA — Vercel Edge Function
// POST /api/chat  { messages: [...], lang: "ru"|"en"|"ka" }
// Response: Server-Sent Events stream

export const config = { runtime: 'edge' };

// ── In-memory cache для knowledge base ──────────────────────────────────────
let kbCache = { content: null, fetchedAt: 0 };
const KB_TTL_MS = 5 * 60 * 1000; // 5 минут

async function getKnowledgeBase() {
  const now = Date.now();
  if (kbCache.content && now - kbCache.fetchedAt < KB_TTL_MS) {
    return kbCache.content;
  }

  const url = process.env.KNOWLEDGE_BASE_URL;
  if (url) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        kbCache = { content: await res.text(), fetchedAt: now };
        return kbCache.content;
      }
    } catch {
      // fallback ниже
    }
  }

  // Fallback: вернуть минимальную заглушку (в проде всегда будет URL)
  return '# Teanium Knowledge Base\nTeanium — Georgian organic tea brand. Ask about our teas and experiences.';
}

// ── CORS helper ──────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://teanium.com',
  'https://www.teanium.com',
];

function getAllowedOrigin(request) {
  const origin = request.headers.get('origin') || '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (origin.endsWith('.myshopify.com')) return origin;
  // Разрешить localhost для локальной разработки
  if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return origin;
  return ALLOWED_ORIGINS[0];
}

function corsHeaders(request) {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(request),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

// ── System prompt ────────────────────────────────────────────────────────────
function buildSystemPrompt(knowledgeBase, lang) {
  const langInstructions = {
    ru: 'Отвечай на русском языке.',
    en: 'Respond in English.',
    ka: 'უპასუხე ქართულად.',
  };
  const langInstruction = langInstructions[lang] || 'Detect the user\'s language and respond accordingly (Russian, English, or Georgian).';

  return `You are TIA (Teanium Intelligent Assistant) — an expert tea sommelier and consultant for Teanium, Georgia's only premium organic tea brand.

${langInstruction}

PERSONA:
- Speak like a trusted sommelier: authoritative yet warm, never snobbish
- Be poetic about flavors: "the honeyed sweetness of Imereti limestone soils"
- Be scientifically precise when needed, but never lecture
- Always focus on the person, not the product
- Keep responses concise (2-5 sentences typical, longer only if detailed brewing/science asked)

RESPONSE STRUCTURE for recommendations:
1. Name the tea
2. Why it suits this specific person
3. How to brew it perfectly (T-Precision parameters)
4. Gentle invitation to next step

NEVER say:
- "I'm an AI" or "as a language model"
- Generic marketing clichés ("best tea in the world!")
- Dry lists without context

KNOWLEDGE BASE:
${knowledgeBase}`;
}

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders(request) });
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
    });
  }

  const { messages, lang = 'auto' } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages array required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
    });
  }

  // Load knowledge base
  const knowledgeBase = await getKnowledgeBase();
  const systemPrompt = buildSystemPrompt(knowledgeBase, lang);

  // Sanitize messages: only role + content strings
  const sanitizedMessages = messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }))
    .slice(-20); // последние 20 сообщений максимум

  // Call Claude API with streaming
  let claudeRes;
  try {
    claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: sanitizedMessages,
        stream: true,
      }),
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to reach AI service' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
    });
  }

  if (!claudeRes.ok) {
    const errText = await claudeRes.text();
    console.error('Claude API error:', claudeRes.status, errText);
    return new Response(JSON.stringify({ error: 'AI service error', upstream: claudeRes.status }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
    });
  }

  // Stream SSE back to client
  // Claude sends: data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"..."}}
  // We re-emit simplified: data: {"token":"..."}  and  data: [DONE]
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      const reader = claudeRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // держать незавершённую строку

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const event = JSON.parse(data);
            if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
              const token = event.delta.text;
              await writer.write(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      await writer.write(encoder.encode('data: [DONE]\n\n'));
    } catch (err) {
      console.error('Stream error:', err);
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
      ...corsHeaders(request),
    },
  });
}
