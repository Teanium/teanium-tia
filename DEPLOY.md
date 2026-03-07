# DEPLOY.md — Инструкция по деплою ТИА

## Требования
- Node.js 18+
- Аккаунт Vercel (бесплатный tier достаточен)
- Аккаунт GitHub
- API ключ Anthropic (console.anthropic.com)

---

## Шаг 1 — Подготовка репозитория

```bash
cd teanium-tia
git init
git add .
git commit -m "feat: TIA initial implementation"
```

Создать репозиторий на GitHub (например `teanium-tia`), затем:

```bash
git remote add origin https://github.com/YOUR_USER/teanium-tia.git
git branch -M main
git push -u origin main
```

---

## Шаг 2 — Подключение к Vercel

1. Открыть [vercel.com](https://vercel.com) → **Add New Project**
2. Импортировать репозиторий `teanium-tia`
3. Framework Preset: **Other** (не менять)
4. Нажать **Deploy** (первый деплой без API ключа — для проверки)

---

## Шаг 3 — Переменные окружения

В Vercel → Settings → Environment Variables добавить:

| Name | Value | Environment |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Production, Preview |
| `KNOWLEDGE_BASE_URL` | `https://raw.githubusercontent.com/YOUR_USER/teanium-tia/main/knowledge-base.md` | Production, Preview |

После добавления переменных — **Redeploy** последний деплой.

---

## Шаг 4 — Проверка API

```bash
curl -X POST https://YOUR_PROJECT.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Привет, какой чай посоветуешь для утра?"}],"lang":"ru"}'
```

Ожидаемый ответ: SSE поток с `data: {"token":"..."}` строками.

---

## Шаг 5 — Встройка в Shopify

### 5.1 Добавить скрипт в theme.liquid

В Shopify Admin → Online Store → Themes → Edit code → `theme.liquid`

Найти закрывающий тег `</body>` и вставить перед ним:

```html
<!-- TIA — Teanium Intelligent Assistant -->
<script>
  window.TIA_CONFIG = {
    apiUrl: 'https://YOUR_PROJECT.vercel.app/api/chat'
  };
</script>
<script src="https://YOUR_PROJECT.vercel.app/widget/tia-widget.js" defer></script>
```

### 5.2 Настройка CORS

В `vercel.json` уже настроены заголовки для `teanium.com` и `*.myshopify.com`.
Если магазин на кастомном домене — добавить его в массив `ALLOWED_ORIGINS` в `api/chat.js`.

### 5.3 Раздача виджета через Vercel

Vercel не раздаёт статические файлы из `/widget/` автоматически без конфигурации.
Добавить в `vercel.json` раздел routes:

```json
{
  "routes": [
    {
      "src": "/widget/(.*)",
      "dest": "/widget/$1"
    }
  ]
}
```

**Или** (проще): загрузить `tia-widget.js` в Shopify Files и использовать прямой URL из Shopify CDN.

---

## Шаг 6 — Обновление базы знаний

Редактировать `knowledge-base.md` и сделать `git push` — изменения применятся автоматически через 5 минут (TTL кеша) без редеплоя.

---

## Локальная разработка

```bash
npm install
cp .env.example .env.local
# Заполнить .env.local своим API ключом

vercel dev
# Открыть http://localhost:3000
```

Для теста виджета локально открыть `widget/test.html` или добавить скрипт на любую HTML страницу:

```html
<script>
  window.TIA_CONFIG = { apiUrl: 'http://localhost:3000/api/chat' };
</script>
<script src="/widget/tia-widget.js"></script>
```

---

## Чеклист готовности

- [ ] `vercel dev` запускается без ошибок
- [ ] `curl` к `/api/chat` возвращает SSE поток
- [ ] Виджет появляется на странице через 3 секунды
- [ ] Чат отвечает на вопросы о продуктах
- [ ] API ключ не виден в исходном коде страницы
- [ ] Работает на iPhone (проверить в DevTools → Mobile)
- [ ] Дизайн соответствует DESIGN.md
