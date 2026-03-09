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
      status: 'ТИА — ЧАЙНЫЙ КОНСУЛЬТАНТ',
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
      status: 'TIA — TEA CONSULTANT',
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
      status: 'ТИА — ЧАЙ-ᲙᲝᲜᲡᲣᲚᲢᲐᲜᲢᲘ',
      footer: 'TEANIUM.COM · ორგანული ქართული ჩაი · ბათუმი',
      sending: 'გაგზავნა...',
      error: 'პასუხი ვერ მივიღეთ. სცადეთ კვლავ.',
    },
  };

  const T = I18N[LANG] || I18N.en;

  // ── Стили ───────────────────────────────────────────────────────────────────
  const CSS = `
#tia-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: #2C1810;
  box-shadow: 0 4px 16px rgba(44,24,16,0.25), 0 1px 4px rgba(44,24,16,0.15);
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
  transform: scale(1.04);
  box-shadow: 0 6px 24px rgba(44,24,16,0.35), 0 1px 4px rgba(44,24,16,0.15);
}
#tia-btn svg { pointer-events: none; }

#tia-panel {
  position: fixed;
  bottom: 86px;
  right: 24px;
  width: 400px;
  height: 640px;
  max-height: calc(100vh - 106px);
  background: #F1F0E9;
  border: 1px solid #E0D9D0;
  border-radius: 12px;
  box-shadow: 0 8px 40px rgba(44,24,16,0.12), 0 2px 8px rgba(44,24,16,0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 999999;
  opacity: 0;
  transform: translateY(10px) scale(0.98);
  pointer-events: none;
  transition: opacity 280ms ease, transform 280ms ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}
#tia-panel.tia-open {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: all;
}

/* Header */
.tia-header {
  position: relative;
  height: 64px;
  min-height: 64px;
  background: #FFFFFF;
  border-bottom: 1px solid #E0D9D0;
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 10px;
  border-radius: 12px 12px 0 0;
}
.tia-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 20%;
  right: 20%;
  height: 2px;
  background: #2C1810;
  border-radius: 0 0 2px 2px;
  opacity: 0.15;
}
.tia-logo-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}
.tia-logo-text {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: #2C1810;
  text-transform: uppercase;
}
.tia-status-wrap {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.tia-status-line {
  font-size: 10px;
  color: #8C837A;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 5px;
}
.tia-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #5A8A4A;
  animation: tia-pulse 2.5s ease-in-out infinite;
  display: inline-block;
  flex-shrink: 0;
}
@keyframes tia-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.35; }
}
.tia-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #8C837A;
  padding: 6px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: color 150ms, background 150ms;
  margin-left: 4px;
}
.tia-close-btn:hover {
  color: #2C1810;
  background: #F1F0E9;
}

/* Messages area */
.tia-messages {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scroll-behavior: smooth;
}
.tia-messages::-webkit-scrollbar { width: 3px; }
.tia-messages::-webkit-scrollbar-track { background: transparent; }
.tia-messages::-webkit-scrollbar-thumb { background: #D5CEC5; border-radius: 4px; }

/* Welcome block */
.tia-welcome {
  text-align: center;
  padding: 16px 8px 8px;
}
.tia-welcome-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: #2C1810;
  border-radius: 50%;
  margin-bottom: 12px;
}
.tia-welcome h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 0.01em;
  margin: 0 0 5px;
}
.tia-welcome p {
  font-size: 13px;
  color: #8C837A;
  margin: 0 0 14px;
  line-height: 1.5;
}

/* Quick prompts */
.tia-quick-prompts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 2px;
}
.tia-qp {
  background: #FFFFFF;
  border: 1px solid #E0D9D0;
  color: #4A4340;
  font-family: inherit;
  font-size: 11.5px;
  letter-spacing: 0.01em;
  border-radius: 4px;
  padding: 9px 10px;
  cursor: pointer;
  text-align: left;
  line-height: 1.4;
  transition: border-color 150ms, color 150ms, background 150ms, box-shadow 150ms;
}
.tia-qp:hover {
  border-color: #2C1810;
  color: #2C1810;
  background: #FDFCFA;
  box-shadow: 0 1px 4px rgba(44,24,16,0.08);
}

/* Message bubbles */
.tia-msg {
  display: flex;
  gap: 7px;
  animation: tia-fadeUp 220ms ease both;
}
@keyframes tia-fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.tia-msg.tia-user { flex-direction: row-reverse; }

.tia-avatar {
  width: 26px;
  height: 26px;
  min-width: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  align-self: flex-end;
  flex-shrink: 0;
}
.tia-avatar-ai {
  background: #2C1810;
  color: #FFFFFF;
}
.tia-avatar-user {
  background: #E0D9D0;
  color: #4A4340;
}

.tia-bubble {
  max-width: calc(100% - 40px);
  padding: 10px 13px;
  border-radius: 4px;
  font-size: 13.5px;
  line-height: 1.6;
  font-weight: 400;
}
.tia-bubble-ai {
  background: #FFFFFF;
  border: 1px solid #E0D9D0;
  color: #1a1a1a;
  border-radius: 4px 12px 12px 4px;
}
.tia-bubble-user {
  background: #2C1810;
  color: #FFFFFF;
  border-radius: 12px 4px 4px 12px;
}

/* Typing indicator */
.tia-typing {
  display: flex;
  gap: 7px;
  animation: tia-fadeUp 220ms ease both;
}
.tia-typing-dots {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  background: #FFFFFF;
  border: 1px solid #E0D9D0;
  border-radius: 4px 12px 12px 4px;
}
.tia-dot-anim {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  animation: tia-typing 1.2s ease infinite;
}
.tia-dot-anim:nth-child(1) { background: #2C1810; animation-delay: 0s; }
.tia-dot-anim:nth-child(2) { background: #8C837A; animation-delay: 0.2s; }
.tia-dot-anim:nth-child(3) { background: #2C1810; animation-delay: 0.4s; }
@keyframes tia-typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
  30%           { transform: translateY(-4px); opacity: 1; }
}

/* Input area */
.tia-input-area {
  background: #FFFFFF;
  border-top: 1px solid #E0D9D0;
  padding: 10px 12px;
  border-radius: 0 0 12px 12px;
}
.tia-input-wrap {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: #F8F7F2;
  border: 1px solid #E0D9D0;
  border-radius: 4px;
  padding: 6px 6px 6px 12px;
  transition: border-color 200ms, box-shadow 200ms;
}
.tia-input-wrap:focus-within {
  border-color: #2C1810;
  box-shadow: 0 0 0 2px rgba(44,24,16,0.08);
}
.tia-textarea {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: #1a1a1a;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 400;
  line-height: 1.5;
  resize: none;
  max-height: 100px;
  min-height: 24px;
}
.tia-textarea::placeholder { color: #B0A89E; }
.tia-send-btn {
  width: 36px;
  height: 36px;
  min-width: 36px;
  background: #2C1810;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 200ms, transform 150ms;
  flex-shrink: 0;
}
.tia-send-btn:hover { opacity: 0.85; transform: scale(1.03); }
.tia-send-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

.tia-footer-text {
  text-align: center;
  font-size: 10px;
  color: #C5BDB5;
  letter-spacing: 0.06em;
  margin-top: 7px;
}

/* Mobile */
@media (max-width: 480px) {
  #tia-panel {
    /* JS перезапишет top/left/width/height через visualViewport API */
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    max-height: none;
    border-radius: 0;
    border: none;
    box-shadow: none;
  }
  #tia-btn {
    bottom: 16px;
    right: 16px;
  }
  .tia-header { border-radius: 0; }
  .tia-input-area { border-radius: 0; }
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
  // Листик — светлая версия для тёмной кнопки (белый)
  const SVG_LEAF_BTN = `<svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 3C14 3 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 3 14 3Z" fill="white" opacity="0.2"/>
  <path d="M14 3C14 3 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 3 14 3Z" stroke="white" stroke-width="1.2" fill="none"/>
  <path d="M14 8C14 8 10 12 14 20" stroke="white" stroke-width="0.9" stroke-linecap="round" opacity="0.8"/>
  <path d="M14 8C15 10 17 13 15.5 18" stroke="white" stroke-width="0.7" stroke-linecap="round" opacity="0.5"/>
</svg>`;

  // Листик — для хедера (тёмно-коричневый)
  const SVG_LEAF_HDR = `<svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 3C14 3 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 3 14 3Z" fill="#2C1810" opacity="0.12"/>
  <path d="M14 3C14 3 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 3 14 3Z" stroke="#2C1810" stroke-width="1.2" fill="none"/>
  <path d="M14 8C14 8 10 12 14 20" stroke="#2C1810" stroke-width="0.9" stroke-linecap="round" opacity="0.6"/>
  <path d="M14 8C15 10 17 13 15.5 18" stroke="#2C1810" stroke-width="0.7" stroke-linecap="round" opacity="0.35"/>
</svg>`;

  // Листик — для welcome иконки (белый на тёмном фоне)
  const SVG_LEAF_WLC = `<svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 3C14 3 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 3 14 3Z" fill="white" opacity="0.2"/>
  <path d="M14 3C14 3 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 3 14 3Z" stroke="white" stroke-width="1.2" fill="none"/>
  <path d="M14 8C14 8 10 12 14 20" stroke="white" stroke-width="0.9" stroke-linecap="round" opacity="0.8"/>
  <path d="M14 8C15 10 17 13 15.5 18" stroke="white" stroke-width="0.7" stroke-linecap="round" opacity="0.5"/>
</svg>`;

  const SVG_CLOSE = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
</svg>`;

  const SVG_SEND = `<svg width="17" height="17" viewBox="0 0 18 18" fill="none">
  <path d="M15.5 9H2.5M15.5 9L10 3.5M15.5 9L10 14.5" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  // ── State ────────────────────────────────────────────────────────────────────
  let isOpen = false;
  let isStreaming = false;
  let messages = [];
  let showedQuickPrompts = true;

  // ── DOM refs ─────────────────────────────────────────────────────────────────
  let $btn, $panel, $messages, $textarea, $sendBtn, $welcomeBlock;

  function build() {
    injectStyles();

    // Floating button
    $btn = document.createElement('button');
    $btn.id = 'tia-btn';
    $btn.setAttribute('aria-label', 'Open Teanium chat');
    $btn.innerHTML = SVG_LEAF_BTN;
    $btn.addEventListener('click', togglePanel);

    // Panel
    $panel = document.createElement('div');
    $panel.id = 'tia-panel';
    $panel.setAttribute('role', 'dialog');
    $panel.setAttribute('aria-label', 'TIA Tea Consultant');
    $panel.innerHTML = `
      <div class="tia-header">
        <div class="tia-logo-wrap">
          ${SVG_LEAF_HDR}
          <span class="tia-logo-text">TEANIUM</span>
        </div>
        <div class="tia-status-wrap">
          <span class="tia-status-line"><span class="tia-dot"></span>${T.status}</span>
        </div>
        <button class="tia-close-btn" aria-label="Close">${SVG_CLOSE}</button>
      </div>

      <div class="tia-messages" id="tia-messages">
        <div class="tia-welcome" id="tia-welcome">
          <div class="tia-welcome-icon">${SVG_LEAF_WLC}</div>
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

    // Show button after delay or first scroll
    const showBtn = function () {
      $btn.classList.add('tia-visible');
      window.removeEventListener('scroll', showBtn);
    };
    setTimeout(showBtn, CFG.showAfterMs);
    window.addEventListener('scroll', showBtn, { passive: true, once: true });

    restoreSession();
  }

  // ── Session storage ──────────────────────────────────────────────────────────
  const SESSION_KEY = 'tia_session_v1';

  function saveSession() {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages)); } catch {}
  }

  function restoreSession() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      if (Array.isArray(saved) && saved.length > 0) {
        messages = saved;
        showedQuickPrompts = false;
        hideWelcome();
        saved.forEach(function (m) { appendBubble(m.role, m.content); });
      }
    } catch {}
  }

  // ── visualViewport / keyboard handler (mobile only) ─────────────────────────

  function isMobileLayout() {
    return window.innerWidth <= 480;
  }

  function updatePanelGeometry() {
    if (!$panel || !isOpen) return;

    if (!isMobileLayout()) {
      $panel.style.top    = '';
      $panel.style.left   = '';
      $panel.style.right  = '';
      $panel.style.bottom = '';
      $panel.style.width  = '';
      $panel.style.height = '';
      return;
    }

    var vv = window.visualViewport;
    if (vv) {
      $panel.style.top    = vv.offsetTop  + 'px';
      $panel.style.left   = vv.offsetLeft + 'px';
      $panel.style.width  = vv.width      + 'px';
      $panel.style.height = vv.height     + 'px';
      $panel.style.bottom = 'auto';
      $panel.style.right  = 'auto';
    } else {
      $panel.style.top    = '0px';
      $panel.style.left   = '0px';
      $panel.style.width  = window.innerWidth  + 'px';
      $panel.style.height = window.innerHeight + 'px';
      $panel.style.bottom = 'auto';
      $panel.style.right  = 'auto';
    }

    scrollToBottom();
  }

  function setupViewportHandler() {
    if (!isMobileLayout()) return;
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updatePanelGeometry);
      window.visualViewport.addEventListener('scroll', updatePanelGeometry);
    } else {
      window.addEventListener('resize', updatePanelGeometry);
    }
    updatePanelGeometry();
  }

  function teardownViewportHandler() {
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', updatePanelGeometry);
      window.visualViewport.removeEventListener('scroll', updatePanelGeometry);
    } else {
      window.removeEventListener('resize', updatePanelGeometry);
    }
    if ($panel) {
      $panel.style.top    = '';
      $panel.style.left   = '';
      $panel.style.right  = '';
      $panel.style.bottom = '';
      $panel.style.width  = '';
      $panel.style.height = '';
    }
  }

  // ── Panel open/close ─────────────────────────────────────────────────────────
  function togglePanel() {
    isOpen ? closePanel() : openPanel();
  }

  function openPanel() {
    isOpen = true;
    $panel.classList.add('tia-open');
    setupViewportHandler();
    setTimeout(function () { $textarea.focus(); }, 320);
    scrollToBottom();
  }

  function closePanel() {
    isOpen = false;
    $panel.classList.remove('tia-open');
    teardownViewportHandler();
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
      avatar.textContent = 'T';
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
    currentStreamBubble = null;
    messages.push({ role: 'assistant', content: fullText });
    saveSession();
    currentStreamText = '';
  }

  function streamRequest(msgs, onToken, onDone, onError) {
    const fullText = { v: '' };

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
          if (chunk.done) { onDone(fullText.v); return; }
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
              if (parsed.token) { onToken(parsed.token); fullText.v += parsed.token; }
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
    avatar.textContent = isAI ? 'T' : (LANG === 'en' ? 'U' : LANG === 'ka' ? 'თ' : 'Я');

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
    avatar.textContent = 'T';
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
