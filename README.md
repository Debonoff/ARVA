# Arva 🌱

Облачная платформа для умного учёта тепличных хозяйств: интерактивная карта грядок,
прогноз даты сбора с учётом условий среды и расчёт себестоимости и прибыли.

Доступна на русском, казахском и английском языках.

## Возможности

- **Карта теплиц** — сетка 1 м², выделение грядок прямоугольником, цветовая кодировка культур, сводная таблица.
- **Калькулятор урожая** — дневной индекс роста `Gi = (1/DaysToMature) × K_hydro × K_temp × K_hum`, прогноз даты сбора и адаптивные сообщения при изменении условий.
- **Учёт экономики** — `TotalYield = plant_count × avg_fruits × weight × 0.9`, `EstimatedProfit = (TotalYield × PricePerKg) − OperatingCosts`.
- **Аутентификация** — email/пароль через Supabase Auth, защита приватных маршрутов.
- **Мультиязычность** — RU / KZ / EN.

## Технологии

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase · Vercel.

## Быстрый старт

```bash
npm install
npm run dev      # http://localhost:3000
```

Скрипты:

| Команда          | Действие                     |
| ---------------- | ---------------------------- |
| `npm run dev`    | Дев-сервер                   |
| `npm run build`  | Продакшн-сборка              |
| `npm run start`  | Запуск собранного приложения |
| `npm run test`   | Юнит-тесты (Vitest)          |
| `npm run lint`   | ESLint                       |
| `npm run format` | Prettier                     |

> Без переменных Supabase приложение работает в **демо-режиме**: данные теплиц
> хранятся в браузере (localStorage), аутентификация не требуется.

## Supabase

1. Создайте проект на [supabase.com](https://supabase.com/dashboard).
2. Скопируйте `.env.example` в `.env.local` и заполните:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. Примените схему и сиды из папки `supabase/`:
   - `supabase/migrations/0001_init.sql` — таблицы, RLS, триггер профиля;
   - `supabase/seed.sql` — справочник культур.

   Через SQL-редактор Supabase или CLI: `supabase db push`.

## Деплой на Vercel

1. Импортируйте репозиторий на [vercel.com/new](https://vercel.com/new) — Next.js определяется автоматически.
2. Добавьте переменные `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` в **Settings → Environment Variables**.
3. Push в `main` → production-деплой; для каждого Pull Request создаётся preview-деплой.

## Структура

```
app/            маршруты (лендинг, (auth), (app): dashboard, greenhouses)
components/     ui/, site/, landing/, app/, map/, dashboard/
lib/            calc, store, crops, format, i18n/, supabase/
supabase/       migrations/, seed.sql
proxy.ts        обновление сессии и защита маршрутов (Next 16)
```
