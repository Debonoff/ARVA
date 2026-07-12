# 🌱 Arva

Облачное веб‑приложение для отслеживания посевов и теплиц. Работает в браузере с любого устройства (адаптивный интерфейс).

**Стек:** Next.js 14 (App Router, JavaScript) · Supabase (Auth + Postgres) · Vercel (хостинг + Cron) · Tailwind.

## Возможности

- **Регистрация** по email/паролю с именем и фамилией (Supabase Auth).
- **Интерактивная карта‑сетка теплиц.** Фермер задаёт длину и ширину — генерируется сетка 1 клетка = 1 м². Клик или выделение мышью прямоугольной области распределяет территорию под культуру (свой цвет + подпись). Клик по грядке показывает, что и когда посажено. Внизу — таблица «культура · площадь · количество растений».
- **Дашборд** со статус‑барами созревания, днями до сбора и виджетом **Arva AI** с умными уведомлениями.
- **Учёт расходов и прибыль.** Цена ₸/кг и операционные расходы вводятся по каждой грядке; ИИ‑справочник даёт среднее число плодов и их вес, программа считает урожай, выручку и чистую прибыль, показывает «в плюсе / в минусе».
- **Движок даты созревания.** Ежедневный cron считает Индекс Суточного Роста и сдвигает прогнозную дату сбора в зависимости от температуры, влажности и типа выращивания.
- **Языки:** русский (по умолчанию), қазақша, English.

## Формулы

**Прогресс созревания** (накапливается по дням, урожай готов при Σ ≥ 1.0):

```
G_i = (1 / DaysToMature) × K_hydro × K_temp × K_hum
```

- `K_hydro` — 1.2 гидропоника / 1.0 грунт
- `K_temp` — 1.0 в оптимуме культуры · 0.7 при похолодании · 0.0 при < +12 °C (рост стоп)
- `K_hum` — 1.0 при 60–80 % · 0.9 при стрессе

**Прибыль:**

```
TotalYield      = PlantsCount × AvgFruitsPerPlant × AvgFruitWeight × 0.9
EstimatedProfit = TotalYield × PricePerKg − OperatingCosts
```

Проверка: 1000 кустов черри × 30 плодов × 0.02 кг × 0.9 = **540 кг**; × 1200 ₸ = 648 000 ₸; − 150 000 ₸ = **498 000 ₸** чистой прибыли.

---

# 🚀 Запуск с нуля

У вас есть аккаунты Supabase, Vercel и GitHub, но проекты ещё не созданы. Ниже — пошагово.

## 1. Supabase — база данных

1. [supabase.com](https://supabase.com) → **New project**. Задайте имя (`arva`) и пароль БД, регион — ближе к вам. Дождитесь создания (~2 мин).
2. Слева **SQL Editor** → **New query**. Откройте файл `supabase/schema.sql` из этого проекта, скопируйте **всё** содержимое, вставьте и нажмите **Run**. Создадутся таблицы, политики доступа (RLS), справочник культур и триггеры.
3. Слева **Project Settings → API**. Скопируйте:
   - `Project URL` → это `NEXT_PUBLIC_SUPABASE_URL`
   - ключ `anon public` → это `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ключ `service_role` (секретный!) → это `SUPABASE_SERVICE_ROLE_KEY`
4. (Опционально, но удобно для теста) **Authentication → Providers → Email** → выключите *Confirm email*, чтобы входить сразу без письма.

## 2. Локальный запуск (по желанию)

```bash
npm install
cp .env.local.example .env.local      # затем впишите ключи из шага 1
npm run dev                            # http://localhost:3000
```

В `.env.local` заполните `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` (любая длинная строка).

## 3. GitHub — репозиторий

```bash
git init
git add .
git commit -m "Arva: initial"
git branch -M main
git remote add origin https://github.com/<ваш-логин>/arva.git
git push -u origin main
```

(Сначала создайте пустой репозиторий `arva` на GitHub — без README/gitignore.)

## 4. Vercel — деплой

1. [vercel.com](https://vercel.com) → **Add New → Project** → импортируйте репозиторий `arva`. Framework определится как **Next.js** автоматически.
2. Перед деплоем откройте **Environment Variables** и добавьте четыре переменные:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL из Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ключ anon public |
   | `SUPABASE_SERVICE_ROLE_KEY` | ключ service_role |
   | `CRON_SECRET` | та же длинная строка, что в .env.local |

3. **Deploy**. Через минуту получите ссылку `https://arva-….vercel.app`.
4. **Cron уже настроен** в `vercel.json` — Vercel будет вызывать `/api/cron/growth` каждый день в 03:00 UTC и пересчитывать прогресс. Vercel сам добавляет заголовок `Authorization: Bearer <CRON_SECRET>`.

> Проверить движок вручную: откройте `https://<ваш-домен>/api/cron/growth?secret=<CRON_SECRET>` — вернётся JSON с числом обработанных грядок.

## 5. Готово

Откройте домен → **Зарегистрироваться** (имя, фамилия, email, пароль) → создайте теплицу → распределите грядки на сетке → задайте цены и расходы во вкладке «Учёт расходов» → вносите суточные замеры во вкладке «Замеры».

---

## Структура

```
app/
  (app)/            защищённые страницы: dashboard, greenhouses, expenses, readings, settings
  api/cron/growth/  ежедневный движок роста (serverless)
  login/            вход и регистрация
components/          UI: Shell, Dashboard, GreenhouseGrid, Expenses, Readings, Settings …
lib/
  crops.js          справочник культур (плоды/куст, вес, дни до созревания)
  calc.js           формулы роста и прибыли, генератор уведомлений
  i18n.js           переводы ru / kk / en
  supabase.js       клиентский Supabase (anon)
  supabaseServer.js серверный Supabase (service_role) — только для cron
supabase/schema.sql SQL для создания базы
vercel.json         расписание cron
```

## Замечания

- Редактор сетки рассчитан на мышь (выделение прямоугольником); на телефоне доступно назначение по тапу.
- Первый расчёт прогресса на дашборде — «живая» оценка по текущим условиям; после первого запуска cron используются накопленные суточные данные.
- Папка `.backup/` (предыдущая версия проекта) в git не попадает — можно удалить.
