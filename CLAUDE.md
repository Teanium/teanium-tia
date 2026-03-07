# CLAUDE.md — Проект ТИА (Teanium Intelligent Assistant)

## Контекст проекта

**Teanium** — Georgia's only premium organic tea brand.
- 56-гектарная органическая плантация в регионе Имерети, Грузия
- Фирменный магазин: 22 Noe Zhordania St, Old Town Batumi
- Сайт: **teanium.com** (Shopify)
- Основатель: Alexander (Lithuanian entrepreneur, Batumi)

## Что мы строим

**ТИА (Teanium Intelligent Assistant)** — AI-консультант по чаям, встроенный на teanium.com.

- Отвечает на вопросы о продуктах, заварке, здоровье, бронировании
- Работает на Claude API (claude-sonnet-4-20250514)
- База знаний хранится в `knowledge-base.md` и инжектируется в system prompt
- Дизайн: тёмная luxury-эстетика (золото + зелень), см. `DESIGN.md`

## Архитектура

```
knowledge-base.md (Google Drive / GitHub)
        ↓ загружается при старте
Vercel Edge Function (/api/chat)
        ↓ инжектирует в system prompt
Claude API (200k context window)
        ↓
Floating widget на teanium.com (Shopify)
```

## Стек

- **Бэкенд:** Vercel Edge Functions (Node.js)
- **Фронтенд:** Vanilla JS виджет (один `<script>` тег для Shopify)
- **API:** Anthropic Claude API
- **База знаний:** Markdown файл (легко редактировать)
- **Деплой:** GitHub → Vercel (автодеплой)

## Файловая структура

```
teanium-tia/
├── CLAUDE.md              ← этот файл
├── DESIGN.md              ← описание дизайна
├── knowledge-base.md      ← база знаний Teanium
├── TASK.md                ← техническое задание
├── api/
│   └── chat.js            ← Vercel Edge Function
├── widget/
│   └── tia-widget.js      ← встраиваемый виджет
├── .env.example           ← пример переменных окружения
├── vercel.json            ← конфиг деплоя
└── package.json
```

## Команды

```bash
npm install          # установка зависимостей
vercel dev           # локальная разработка
vercel deploy        # деплой в продакшен
```

## Переменные окружения (Vercel)

```
ANTHROPIC_API_KEY=sk-ant-...
KNOWLEDGE_BASE_URL=https://raw.githubusercontent.com/.../knowledge-base.md
```

## Важные заметки

- API ключ НИКОГДА не попадает во фронтенд — только через Vercel Edge Function
- База знаний обновляется редактированием одного Markdown файла
- Виджет встраивается в Shopify через один `<script>` тег в theme.liquid
- Язык ответов ТИА: авто-определение (RU / EN / KA)
