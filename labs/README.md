# Лабораторные работы — Geo Steam

Проект адаптирован под курс веб-разработки. Стек: **HTML/CSS/JS** (статика) + **React** (SPA) + **Express MVC** (API) + **SQLite** + **Docker**.

## Быстрый старт

```bash
npm run install-all
npm run dev
```

- React-приложение: http://localhost:3000
- API: http://localhost:5000
- Статические лабы: http://localhost:5000/labs/static/index.html
- MVC-портал (Лаб. 4): http://localhost:5000/mvc

---

## Лабораторная 1 — HTML + CSS

**Папка:** `labs/static/`

| Файл | Описание |
|------|----------|
| `index.html` | Главная: h1–h6, p/span/div, em/strong, br, ol/ul, img, video, якоря |
| `about.html` | О проекте |
| `gallery.html` | Слайдшоу (CSS+JS) |
| `css/main.css` | Внешние стили: box model, селекторы, анимации, фикс. меню |
| `js/main.js` | Бургер-меню, слайдшоу |

**Требования 2.1:** inline (`style=""`), internal (`<style>`), external (`main.css`)  
**Требования 2.5:** Google Fonts (ссылка), web-safe stack, локальный `@font-face`  
**Требования 2.7:** фиксированное раскрывающееся меню

---

## Лабораторная 2 — Формы и валидация

| Файл | Описание |
|------|----------|
| `labs/static/auth.html` | HTML-форма с CSS `:valid/:invalid/:required/:optional` |
| `labs/static/js/validation.js` | JS: маска телефона, min/max возраст, имя/фамилия |
| `client/src/pages/Register.tsx` | React-форма с теми же правилами |

---

## Лабораторная 3 — REST API + Telegram

| Компонент | Описание |
|-----------|----------|
| `POST /api/feedback` | Форма обратной связи → Telegram Bot API |
| `labs/static/feedback.html` | Статическая форма |
| `client/src/pages/Feedback.tsx` | React-форма |
| `postman/GeoSteam.postman_collection.json` | Коллекция Postman |

**Настройка Telegram:**
1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Скопируйте `.env.example` → `server/.env`
3. Укажите `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`

---

## Лабораторная 4 — MVC (Express)

Аналог Django на Node.js:

```
server/
├── models/       # Модели (работа с БД)
├── views/        # EJS-шаблоны
├── controllers/  # Бизнес-логика
├── routes/       # Маршруты
└── middleware/   # Auth, и др.
```

Портал: http://localhost:5000/mvc

---

## Лабораторная 5 — База данных

- **СУБД:** SQLite (`server/geo_data.db`)
- **Миграции:** `server/db/migrations.js`
- **Регистрация:** `POST /api/auth/register` — создание пользователя из формы
- **Шифрование:** bcrypt (12 раундов), демо: `POST /api/auth/demo-hash`
- **Модели:** users, location_records, country_stats, city_stats, comments, feedback

---

## Лабораторная 6 — Real-time JSON

- **Комментарии + лайки/дизлайки** без перезагрузки
- **WebSocket:** `ws://localhost:5000/ws`
- **JSON API:** `GET/POST /api/comments`, `POST /api/comments/:id/like`
- **Страница:** http://localhost:3000/comments

---

## Лабораторная 7 — Docker + микросервисы

```bash
docker-compose up --build
```

| Сервис | Порт | Описание |
|--------|------|----------|
| `api` | 5000 | Backend (Express) |
| `client` | 3000 | Frontend (Nginx + React build) |

Файлы: `docker-compose.yml`, `server/Dockerfile`, `client/Dockerfile`

---

## Postman

Импортируйте `postman/GeoSteam.postman_collection.json` в Postman.
