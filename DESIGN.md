# DESIGN.md — Дизайн-спецификация ТИА

## Концепция

**Стиль:** Dark luxury / Fine dining / Premium tea ceremony
**Настроение:** Элегантно, тепло, авторитетно — как доверенный чайный сомелье
**Не:** корпоративный, холодный, generic AI

---

## Цветовая палитра

```css
/* Фоны */
--bg-deepest:     #0e0c09;   /* самый тёмный фон страницы */
--bg-widget:      #13110d;   /* фон виджета */
--bg-header:      #1a1610;   /* фон хедера */
--bg-bubble-ai:   #1a1610;   /* фон пузыря ассистента */
--bg-bubble-user: #1a2415;   /* фон пузыря пользователя (зелёный тон) */
--bg-input:       #1a1610;   /* фон поля ввода */
--bg-footer:      #0f0d0a;   /* фон нижней панели */

/* Границы */
--border-main:    #2a2319;   /* основные границы */
--border-accent:  #c9a84c44; /* золотые акценты (полупрозрачные) */
--border-green:   #8aab6b22; /* зелёные акценты (полупрозрачные) */

/* Текст */
--text-primary:   #c8bfa8;   /* основной текст */
--text-user:      #a8c49a;   /* текст пользователя */
--text-muted:     #6b7a5e;   /* приглушённый текст */
--text-faint:     #3d3828;   /* placeholder */
--text-footer:    #2d2820;   /* футер */

/* Акценты */
--gold:           #c9a84c;   /* золото — основной бренд-цвет */
--gold-hover:     #d4b45a;   /* золото hover */
--gold-dark:      #a8893a;   /* золото тёмное */
--green:          #8aab6b;   /* зелёный — вторичный */

/* Статус */
--status-online:  #8aab6b;   /* онлайн индикатор */
```

---

## Типографика

```css
/* Дисплейный шрифт — название бренда, заголовки */
font-family: 'Cormorant Garamond', serif;
/* Использование: TEANIUM логотип, крупные акценты */
/* Weights: 300 (light), 400 (regular), 500 (medium) */
/* Стиль: uppercase, letter-spacing: 0.18em */

/* Основной шрифт — интерфейс, текст чата */
font-family: 'DM Sans', sans-serif;
/* Использование: всё остальное */
/* Weights: 300 (light), 400 (regular), 500 (medium) */
```

Google Fonts import:
```
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap
```

---

## Структура виджета (floating button mode)

### Floating Button (закрытое состояние)
```
Позиция: fixed, bottom: 24px, right: 24px
Размер: 56x56px, border-radius: 50%
Background: linear-gradient(135deg, #c9a84c, #a8893a)
Shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,168,76,0.3)
Иконка: листик чая (SVG) или "Т" в Cormorant Garamond
Hover: scale(1.05), shadow усиливается
Анимация открытия: scale + fadeIn, 300ms ease
```

### Открытый виджет
```
Позиция: fixed, bottom: 90px, right: 24px
Размер: 420x680px
border-radius: 2px (почти квадратный — luxury feel)
border: 1px solid #2a2319
box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,100,0.08)
```

---

## Компоненты

### Header
```
height: ~72px
background: linear-gradient(135deg, #1a1610 0%, #13110d 100%)
border-bottom: 1px solid #2a2319

Декоративная линия сверху (2px):
background: linear-gradient(90deg, transparent, #c9a84c, #8aab6b, #c9a84c, transparent)

Логотип: SVG листик (28x28) + "TEANIUM" в Cormorant Garamond gold
Подзаголовок: "● ТИА — ЧАЙНЫЙ КОНСУЛЬТАНТ" (DM Sans 11px, #6b7a5e, uppercase)
Статус-точка: 5px, #8aab6b, pulse анимация 2s
```

### Пузыри сообщений
```
Ассистент:
- background: #1a1610
- border: 1px solid #2a2319
- border-left: 2px solid #c9a84c44  ← золотой акцент слева
- border-radius: 2px
- color: #c8bfa8
- font-size: 13.5px, line-height: 1.65, font-weight: 300

Пользователь:
- background: linear-gradient(135deg, #1a2415, #1b261a)
- border: 1px solid #8aab6b22
- border-radius: 2px
- color: #a8c49a
- text-align: right

Аватар ассистента: "Т" в Cormorant Garamond, border: 1px solid #c9a84c44
Аватар пользователя: "Вы" в DM Sans 11px, border: 1px solid #8aab6b33
```

### Typing Indicator
```
3 точки: gold (#c9a84c), green (#8aab6b), gold
Анимация: translateY(-4px) с задержкой 0s, 0.2s, 0.4s
```

### Quick Prompts (только первый экран)
```
Кнопки: border: 1px solid #2a2319, color: #6b7a5e
Hover: border-color: #c9a84c44, color: #c9a84c, background: #1a1610
font-size: 11px, letter-spacing: 0.03em, border-radius: 1px
```

### Input Area
```
background: #0f0d0a
Input wrapper: background: #1a1610, border: 1px solid #2a2319
Focus: border-color: #c9a84c44
Placeholder: color: #3d3828

Кнопка отправки: 40x40px
background: linear-gradient(135deg, #c9a84c, #a8893a)
border-radius: 2px
Иконка: стрелка отправки, fill: #13110d
```

### Footer
```
"TEANIUM.COM · ORGANIC GEORGIAN TEA · BATUMI"
font-size: 10px, color: #2d2820, letter-spacing: 0.08em
```

---

## Анимации

```css
/* Появление сообщений */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Пульс статус-точки */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

/* Typing dots */
@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30%           { transform: translateY(-4px); opacity: 1; }
}

/* Открытие виджета */
transition: transform 300ms ease, opacity 300ms ease;
```

---

## SVG Логотип (листик чая)

```svg
<svg viewBox="0 0 28 28" fill="none">
  <path d="M14 3C14 3 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 3 14 3Z"
        fill="#c9a84c" opacity="0.15"/>
  <path d="M14 3C14 3 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 3 14 3Z"
        stroke="#c9a84c" stroke-width="1" fill="none"/>
  <path d="M14 8C14 8 10 12 14 20"
        stroke="#8aab6b" stroke-width="0.8" stroke-linecap="round"/>
  <path d="M14 8C15 10 17 13 15.5 18"
        stroke="#8aab6b" stroke-width="0.6" stroke-linecap="round" opacity="0.6"/>
</svg>
```

---

## Важно при реализации

1. **border-radius: 2px** везде — не скруглять как обычный чат
2. **font-weight: 300** для основного текста — лёгкость и элегантность
3. Золото (#c9a84c) — только для акцентов, не злоупотреблять
4. Зелень (#8aab6b) — вторичный акцент, природа, органика
5. Тени глубокие и мягкие — depth без агрессии
6. Анимации тонкие — не отвлекают, но добавляют жизнь
