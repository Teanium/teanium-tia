/**
 * TIA — Teanium Intelligent Assistant Widget
 * Встраивается в Shopify через один <script> тег.
 * Конфигурация: window.TIA_CONFIG = { apiUrl: '...' }
 */
(function () {
  'use strict';

  // ── Конфигурация ────────────────────────────────────────────────────────────
  const CFG = Object.assign({
    apiUrl: 'https://teanium-tia.vercel.app/api/chat',
    showAfterMs: 3000,
  }, window.TIA_CONFIG || {});

  // ── Определение языка ───────────────────────────────────────────────────────
  function detectLang() {
    const l = (navigator.language || 'en').toLowerCase();
    if (l.startsWith('ru') || l.startsWith('uk') || l.startsWith('be')) return 'ru';
    if (l.startsWith('ka')) return 'ka';
    return 'en';
  }

  const LANG = detectLang();

  const I18N = {
    ru: {
      greeting: 'Добро пожаловать в Teanium',
      subtitle: 'Позвольте подобрать ваш идеальный чай',
      placeholder: 'Спросите о чаях, заварке, пользе...',
      quickPrompts: [
        'Какой чай для концентрации?',
        'Расскажи о методе T-Precision',
        'Хочу подарочный набор',
        'Забронировать дегустацию',
      ],
      status: '● ТИА — ЧАЙНЫЙ КОНСУЛЬТАНТ',
      footer: 'TEANIUM.COM · ОРГАНИЧЕСКИЙ ГРУЗИНСКИЙ ЧАЙ · БАТУМИ',
      sending: 'Отправка...',
      error: 'Не удалось получить ответ. Попробуйте ещё раз.',
    },
    en: {
      greeting: 'Welcome to Teanium',
      subtitle: 'Let me find your perfect tea',
      placeholder: 'Ask about teas, brewing, wellness...',
      quickPrompts: [
        'Tea for focus & concentration?',
        'Tell me about T-Precision method',
        'I need a gift set',
        'Book a tasting session',
      ],
      status: '● TIA — TEA CONSULTANT',
      footer: 'TEANIUM.COM · ORGANIC GEORGIAN TEA · BATUMI',
      sending: 'Sending...',
      error: 'Could not get a response. Please try again.',
    },
    ka: {
      greeting: 'კეთილი იყოს თქვენი მობრძანება Teanium-ში',
      subtitle: 'მოდი ვიპოვოთ თქვენი სრულყოფილი ჩაი',
      placeholder: 'იკითხეთ ჩაიზე, დახარშვაზე...',
      quickPrompts: [
        'ჩაი კონცენტრაციისთვის?',
        'T-Precision მეთოდი',
        'მინდა საჩუქრის ნაკრები',
        'დეგუსტაციის დაჯავშნა',
      ],
      status: '● ТИА — ЧАЙ-ᲙᲝᲜᲡᲣᲚᲢᲐᲜᲢᲘ',
      footer: 'TEANIUM.COM · ორგანული ქართული ჩაი · ბათუმი',
      sending: 'გაგზავნა...',
      error: 'პასუხი ვერ მივიღეთ. სცადეთ კვლავ.',
    },
  };

  const T = I18N[LANG] || I18N.en;

  // ── Fonts ───────────────────────────────────────────────────────────────────
  if (!document.getElementById('tia-fonts')) {
    const link = document.createElement('link');
    link.id = 'tia-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=DM+Sans:wght@300;400;500&display=swap';
    document.head.appendChild(link);
  }

  // ── Стили ───────────────────────────────────────────────────────────────────
  const CSS = `
:root {
  --tia-bg-widget:      #13110d;
  --tia-bg-header:      #1a1610;
  --tia-bg-bubble-ai:   #1a1610;
  --tia-bg-bubble-user: #1a2415;
  --tia-bg-footer:      #0f0d0a;
  --tia-bg-input:       #1a1610;
  --tia-border:         #2a2319;
  --tia-gold:           #c9a84c;
  --tia-gold-h:         #d4b45a;
  --tia-gold-d:         #a8893a;
  --tia-green:          #8aab6b;
  --tia-text:           #c8bfa8;
  --tia-text-user:      #a8c49a;
  --tia-muted:          #6b7a5e;
  --tia-faint:          #3d3828;
  --tia-footer-text:    #2d2820;
}

#tia-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--tia-gold), var(--tia-gold-d));
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,168,76,0.3);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999998;
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 300ms ease, transform 300ms ease, box-shadow 200ms ease;
}
#tia-btn.tia-visible {
  opacity: 1;
  transform: scale(1);
}
#tia-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.5);
}
#tia-btn svg { pointer-events: none; }

#tia-panel {
  position: fixed;
  bottom: 90px;
  right: 24px;
  width: 420px;
  height: 680px;
  max-height: calc(100vh - 110px);
  background: var(--tia-bg-widget);
  border: 1px solid var(--tia-border);
  border-radius: 2px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,100,0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 999999;
  opacity: 0;
  transform: translateY(12px) scale(0.98);
  pointer-events: none;
  transition: opacity 300ms ease, transform 300ms ease;
  font-family: 'DM Sans', -apple-system, sans-serif;
}
#tia-panel.tia-open {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: all;
}

/* Header */
.tia-header {
  position: relative;
  height: 72px;
  min-height: 72px;
  background: linear-gradient(135deg, #1a1610 0%, #13110d 100%);
  border-bottom: 1px solid var(--tia-border);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
}
.tia-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--tia-gold), var(--tia-green), var(--tia-gold), transparent);
}
.tia-logo-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}
.tia-logo-text {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 400;
  font-size: 18px;
  letter-spacing: 0.18em;
  color: var(--tia-gold);
  text-transform: uppercase;
}
.tia-status-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tia-status-line {
  font-size: 10px;
  color: var(--tia-muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 4px;
}
.tia-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--tia-green);
  animation: tia-pulse 2s ease-in-out infinite;
  display: inline-block;
}
@keyframes tia-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.tia-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--tia-muted);
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 2px;
  transition: color 150ms;
}
.tia-close-btn:hover { color: var(--tia-text); }

/* Messages area */
.tia-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;
}
.tia-messages::-webkit-scrollbar { width: 4px; }
.tia-messages::-webkit-scrollbar-track { background: transparent; }
.tia-messages::-webkit-scrollbar-thumb { background: var(--tia-border); border-radius: 2px; }

/* Welcome block */
.tia-welcome {
  text-align: center;
  padding: 20px 8px 8px;
}
.tia-welcome-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 1px solid rgba(201,168,76,0.3);
  border-radius: 2px;
  margin-bottom: 12px;
}
.tia-welcome h3 {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 400;
  font-size: 20px;
  color: var(--tia-gold);
  letter-spacing: 0.08em;
  margin: 0 0 6px;
}
.tia-welcome p {
  font-size: 12px;
  color: var(--tia-muted);
  margin: 0 0 16px;
  letter-spacing: 0.02em;
}

/* Quick prompts */
.tia-quick-prompts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 4px;
}
.tia-qp {
  background: none;
  border: 1px solid var(--tia-border);
  color: var(--tia-muted);
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  letter-spacing: 0.03em;
  border-radius: 1px;
  padding: 8px 10px;
  cursor: pointer;
  text-align: left;
  line-height: 1.4;
  transition: border-color 150ms, color 150ms, background 150ms;
}
.tia-qp:hover {
  border-color: rgba(201,168,76,0.4);
  color: var(--tia-gold);
  background: var(--tia-bg-header);
}

/* Message bubbles */
.tia-msg {
  display: flex;
  gap: 8px;
  animation: tia-fadeUp 250ms ease both;
}
@keyframes tia-fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.tia-msg.tia-user { flex-direction: row-reverse; }

.tia-avatar {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  align-self: flex-end;
}
.tia-avatar-ai {
  border: 1px solid rgba(201,168,76,0.27);
  color: var(--tia-gold);
  font-family: 'Cormorant Garamond', serif;
  font-size: 15px;
}
.tia-avatar-user {
  border: 1px solid rgba(138,171,107,0.2);
  color: var(--tia-green);
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 500;
}

.tia-bubble {
  max-width: calc(100% - 44px);
  padding: 10px 13px;
  border-radius: 2px;
  font-size: 13.5px;
  line-height: 1.65;
  font-weight: 300;
}
.tia-bubble-ai {
  background: var(--tia-bg-bubble-ai);
  border: 1px solid var(--tia-border);
  border-left: 2px solid rgba(201,168,76,0.27);
  color: var(--tia-text);
}
.tia-bubble-user {
  background: linear-gradient(135deg, #1a2415, #1b261a);
  border: 1px solid rgba(138,171,107,0.13);
  color: var(--tia-text-user);
  text-align: right;
}

/* Typing indicator */
.tia-typing {
  display: flex;
  gap: 8px;
  animation: tia-fadeUp 250ms ease both;
}
.tia-typing-dots {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  background: var(--tia-bg-bubble-ai);
  border: 1px solid var(--tia-border);
  border-left: 2px solid rgba(201,168,76,0.27);
  border-radius: 2px;
}
.tia-dot-anim {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  animation: tia-typing 1.2s ease infinite;
}
.tia-dot-anim:nth-child(1) { background: var(--tia-gold); animation-delay: 0s; }
.tia-dot-anim:nth-child(2) { background: var(--tia-green); animation-delay: 0.2s; }
.tia-dot-anim:nth-child(3) { background: var(--tia-gold); animation-delay: 0.4s; }
@keyframes tia-typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30%           { transform: translateY(-4px); opacity: 1; }
}

/* Input area */
.tia-input-area {
  background: var(--tia-bg-footer);
  border-top: 1px solid var(--tia-border);
  padding: 12px 14px;
}
.tia-input-wrap {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: var(--tia-bg-input);
  border: 1px solid var(--tia-border);
  border-radius: 2px;
  padding: 6px 6px 6px 12px;
  transition: border-color 200ms;
}
.tia-input-wrap:focus-within { border-color: rgba(201,168,76,0.27); }
.tia-textarea {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--tia-text);
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 300;
  line-height: 1.5;
  resize: none;
  max-height: 100px;
  min-height: 24px;
  placeholder-color: var(--tia-faint);
}
.tia-textarea::placeholder { color: var(--tia-faint); }
.tia-send-btn {
  width: 40px;
  height: 40px;
  min-width: 40px;
  background: linear-gradient(135deg, var(--tia-gold), var(--tia-gold-d));
  border: none;
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 200ms;
}
.tia-send-btn:hover { opacity: 0.85; }
.tia-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.tia-footer-text {
  text-align: center;
  font-size: 10px;
  color: var(--tia-footer-text);
  letter-spacing: 0.08em;
  margin-top: 8px;
}

/* Mobile */
@media (max-width: 480px) {
  #tia-panel {
    width: 100vw;
    height: 100dvh;
    max-height: 100dvh;
    bottom: 0;
    right: 0;
    border-radius: 0;
    border: none;
  }
  #tia-btn {
    bottom: 16px;
    right: 16px;
  }
}
`;

  function injectStyles() {
    if (document.getElementById('tia-styles')) return;
    const style = document.createElement('style');
    style.id = 'tia-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // ── SVG ─────────────────────────────────────────────────────────────────────
  const SVG_LEAF = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 3C14 3 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 3 14 3Z" fill="#c9a84c" opacity="0.15"/>
  <path d="M14 3C14 3 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 3 14 3Z" stroke="#c9a84c" stroke-width="1" fill="none"/>
  <path d="M14 8C14 8 10 12 14 20" stroke="#8aab6b" stroke-width="0.8" stroke-linecap="round"/>
  <path d="M14 8C15 10 17 13 15.5 18" stroke="#8aab6b" stroke-width="0.6" stroke-linecap="round" opacity="0.6"/>
</svg>`;

  const SVG_LEAF_SM = `<svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 3C14 3 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 3 14 3Z" fill="#c9a84c" opacity="0.15"/>
  <path d="M14 3C14 3 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 3 14 3Z" stroke="#c9a84c" stroke-width="1" fill="none"/>
  <path d="M14 8C14 8 10 12 14 20" stroke="#8aab6b" stroke-width="0.8" stroke-linecap="round"/>
  <path d="M14 8C15 10 17 13 15.5 18" stroke="#8aab6b" stroke-width="0.6" stroke-linecap="round" opacity="0.6"/>
</svg>`;

  const SVG_CLOSE = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
</svg>`;

  const SVG_SEND = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M15.5 9H2.5M15.5 9L10 3.5M15.5 9L10 14.5" stroke="#13110d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  // ── State ────────────────────────────────────────────────────────────────────
  let isOpen = false;
  let isStreaming = false;
  let messages = []; // { role, content }
  let showedQuickPrompts = true;

  // ── DOM refs ─────────────────────────────────────────────────────────────────
  let $btn, $panel, $messages, $textarea, $sendBtn, $welcomeBlock;

  function build() {
    injectStyles();

    // Floating button
    $btn = document.createElement('button');
    $btn.id = 'tia-btn';
    $btn.setAttribute('aria-label', 'Open Teanium chat');
    $btn.innerHTML = SVG_LEAF;
    $btn.addEventListener('click', togglePanel);

    // Panel
    $panel = document.createElement('div');
    $panel.id = 'tia-panel';
    $panel.setAttribute('role', 'dialog');
    $panel.setAttribute('aria-label', 'TIA Tea Consultant');
    $panel.innerHTML = `
      <div class="tia-header">
        <div class="tia-logo-wrap">
          ${SVG_LEAF_SM}
          <span class="tia-logo-text">TEANIUM</span>
        </div>
        <div class="tia-status-wrap">
          <span class="tia-status-line"><span class="tia-dot"></span>${T.status.replace('● ', '')}</span>
        </div>
        <button class="tia-close-btn" aria-label="Close">${SVG_CLOSE}</button>
      </div>

      <div class="tia-messages" id="tia-messages">
        <div class="tia-welcome" id="tia-welcome">
          <div class="tia-welcome-icon">${SVG_LEAF_SM}</div>
          <h3>${T.greeting}</h3>
          <p>${T.subtitle}</p>
          <div class="tia-quick-prompts">
            ${T.quickPrompts.map(q => `<button class="tia-qp">${q}</button>`).join('')}
          </div>
        </div>
      </div>

      <div class="tia-input-area">
        <div class="tia-input-wrap">
          <textarea class="tia-textarea" id="tia-textarea"
            placeholder="${T.placeholder}"
            rows="1"
            maxlength="1000"></textarea>
          <button class="tia-send-btn" id="tia-send" aria-label="Send">${SVG_SEND}</button>
        </div>
        <div class="tia-footer-text">${T.footer}</div>
      </div>
    `;

    document.body.appendChild($btn);
    document.body.appendChild($panel);

    $messages = document.getElementById('tia-messages');
    $textarea = document.getElementById('tia-textarea');
    $sendBtn = document.getElementById('tia-send');
    $welcomeBlock = document.getElementById('tia-welcome');

    // Bind events
    $panel.querySelector('.tia-close-btn').addEventListener('click', closePanel);
    $sendBtn.addEventListener('click', handleSend);
    $textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
    $textarea.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });

    // Quick prompts
    $panel.querySelectorAll('.tia-qp').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const text = this.textContent;
        hideWelcome();
        sendMessage(text);
      });
    });

    // Show button after delay or scroll
    const showBtn = function () {
      $btn.classList.add('tia-visible');
      window.removeEventListener('scroll', showBtn);
    };
    setTimeout(showBtn, CFG.showAfterMs);
    window.addEventListener('scroll', showBtn, { passive: true, once: true });

    // Restore session history
    restoreSession();
  }

  // ── Session storage ──────────────────────────────────────────────────────────
  const SESSION_KEY = 'tia_session_v1';

  function saveSession() {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages));
    } catch {}
  }

  function restoreSession() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      if (Array.isArray(saved) && saved.length > 0) {
        messages = saved;
        showedQuickPrompts = false;
        hideWelcome();
        saved.forEach(function (m) {
          appendBubble(m.role, m.content);
        });
      }
    } catch {}
  }

  // ── Panel open/close ─────────────────────────────────────────────────────────
  function togglePanel() {
    isOpen ? closePanel() : openPanel();
  }

  function openPanel() {
    isOpen = true;
    $panel.classList.add('tia-open');
    setTimeout(function () { $textarea.focus(); }, 320);
    scrollToBottom();
  }

  function closePanel() {
    isOpen = false;
    $panel.classList.remove('tia-open');
  }

  function hideWelcome() {
    if ($welcomeBlock && $welcomeBlock.parentNode) {
      $welcomeBlock.remove();
      $welcomeBlock = null;
    }
    showedQuickPrompts = false;
  }

  // ── Messaging ────────────────────────────────────────────────────────────────
  function handleSend() {
    const text = $textarea.value.trim();
    if (!text || isStreaming) return;
    $textarea.value = '';
    $textarea.style.height = 'auto';
    hideWelcome();
    sendMessage(text);
  }

  function sendMessage(text) {
    messages.push({ role: 'user', content: text });
    saveSession();
    appendBubble('user', text);

    const typingEl = appendTyping();
    setStreaming(true);

    streamRequest(messages.slice(), function onToken(token) {
      removeTyping(typingEl);
      streamToken(token);
    }, function onDone(fullText) {
      finalizeStream(fullText);
      setStreaming(false);
    }, function onError() {
      removeTyping(typingEl);
      appendBubble('assistant', T.error);
      setStreaming(false);
    });
  }

  // ── Streaming ────────────────────────────────────────────────────────────────
  let currentStreamBubble = null;
  let currentStreamText = '';

  function streamToken(token) {
    if (!currentStreamBubble) {
      const wrap = document.createElement('div');
      wrap.className = 'tia-msg';
      const avatar = document.createElement('div');
      avatar.className = 'tia-avatar tia-avatar-ai';
      avatar.textContent = 'Т';
      const bubble = document.createElement('div');
      bubble.className = 'tia-bubble tia-bubble-ai';
      wrap.appendChild(avatar);
      wrap.appendChild(bubble);
      $messages.appendChild(wrap);
      currentStreamBubble = bubble;
      currentStreamText = '';
    }
    currentStreamText += token;
    currentStreamBubble.textContent = currentStreamText;
    scrollToBottom();
  }

  function finalizeStream(fullText) {
    if (currentStreamBubble) {
      currentStreamBubble = null;
    }
    messages.push({ role: 'assistant', content: fullText });
    saveSession();
    currentStreamText = '';
  }

  function streamRequest(msgs, onToken, onDone, onError) {
    const fullText = { v: '' };
    let typingRemoved = false;

    fetch(CFG.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: msgs, lang: LANG }),
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      function pump() {
        reader.read().then(function (chunk) {
          if (chunk.done) {
            onDone(fullText.v);
            return;
          }
          buffer += decoder.decode(chunk.value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') { onDone(fullText.v); return; }
            try {
              const parsed = JSON.parse(data);
              if (parsed.token) {
                if (!typingRemoved) { typingRemoved = true; }
                onToken(parsed.token);
                fullText.v += parsed.token;
              }
            } catch {}
          }
          pump();
        }).catch(onError);
      }
      pump();
    }).catch(onError);
  }

  // ── DOM helpers ──────────────────────────────────────────────────────────────
  function appendBubble(role, text) {
    const wrap = document.createElement('div');
    wrap.className = 'tia-msg' + (role === 'user' ? ' tia-user' : '');

    const avatar = document.createElement('div');
    const isAI = role !== 'user';
    avatar.className = 'tia-avatar ' + (isAI ? 'tia-avatar-ai' : 'tia-avatar-user');
    avatar.textContent = isAI ? 'Т' : (LANG === 'en' ? 'You' : LANG === 'ka' ? 'თქვ' : 'Вы');

    const bubble = document.createElement('div');
    bubble.className = 'tia-bubble ' + (isAI ? 'tia-bubble-ai' : 'tia-bubble-user');
    bubble.textContent = text;

    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
    $messages.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }

  function appendTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'tia-typing';
    const avatar = document.createElement('div');
    avatar.className = 'tia-avatar tia-avatar-ai';
    avatar.textContent = 'Т';
    const dots = document.createElement('div');
    dots.className = 'tia-typing-dots';
    dots.innerHTML = '<div class="tia-dot-anim"></div><div class="tia-dot-anim"></div><div class="tia-dot-anim"></div>';
    wrap.appendChild(avatar);
    wrap.appendChild(dots);
    $messages.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }

  function removeTyping(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function setStreaming(val) {
    isStreaming = val;
    $sendBtn.disabled = val;
    $textarea.disabled = val;
  }

  function scrollToBottom() {
    requestAnimationFrame(function () {
      if ($messages) $messages.scrollTop = $messages.scrollHeight;
    });
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }

})();
