-- ============================================================
-- ARVA — схема Supabase (Postgres)
-- Запустите этот скрипт целиком в Supabase → SQL Editor → New query → Run.
-- Таблицы: profiles, greenhouses, beds, crops_reference,
--          daily_readings, notifications.
-- Row Level Security: каждый фермер видит только свои данные.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- profiles (расширяет auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '',
  last_name  text not null default '',
  lang       text not null default 'ru',    -- ru | kk | en
  theme      text not null default 'light', -- light | dark
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles select own" on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles select own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles insert own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id);

-- Триггер: авто-создание профиля при регистрации (берёт имя, фамилию и язык из метаданных).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, first_name, last_name, lang)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'lang', 'ru')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- greenhouses (теплицы) ----------
create table if not exists public.greenhouses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  length     int  not null check (length between 1 and 100),  -- метры (клетки по X)
  width      int  not null check (width between 1 and 100),    -- метры (клетки по Y)
  hydro      boolean not null default false,                   -- гидропоника / грунт
  temp       numeric not null default 24,                      -- текущая температура, °C
  humidity   numeric not null default 70,                      -- текущая влажность, %
  created_at timestamptz not null default now()
);

alter table public.greenhouses enable row level security;
drop policy if exists "greenhouses own" on public.greenhouses;
create policy "greenhouses own" on public.greenhouses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- beds (грядки внутри теплицы) ----------
-- cells: занятые клетки как массив строк "row-col", напр. ["0-0","0-1","1-0"].
create table if not exists public.beds (
  id            uuid primary key default gen_random_uuid(),
  greenhouse_id uuid not null references public.greenhouses (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  crop_type     text not null,               -- ключ из crops_reference
  color         text not null default '#BAF91A',
  plants_count  int  not null default 0,     -- PlantsCount
  plant_date    date,                         -- дата посадки
  price_per_kg  numeric not null default 0,   -- цена ₸/кг (вводит фермер)
  costs         numeric not null default 0,   -- операционные расходы ₸ (семена, вода, свет)
  cells         jsonb   not null default '[]'::jsonb,
  -- поля движка роста (заполняет ежедневный cron):
  progress            numeric not null default 0,   -- накопленный прогресс 0..1 (Σ G_i)
  predicted_harvest   date,                          -- прогнозная дата сбора
  status              text not null default 'growing', -- growing | ready | stalled
  last_progress_at    date,                          -- дата последнего пересчёта (защита от двойного счёта)
  created_at    timestamptz not null default now()
);

alter table public.beds enable row level security;
drop policy if exists "beds own" on public.beds;
create policy "beds own" on public.beds
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists beds_greenhouse_idx on public.beds (greenhouse_id);

-- ---------- daily_readings (суточные замеры температуры/влажности) ----------
create table if not exists public.daily_readings (
  id            uuid primary key default gen_random_uuid(),
  greenhouse_id uuid not null references public.greenhouses (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  reading_date  date not null default current_date,
  temp          numeric not null,   -- средняя температура за сутки, °C
  humidity      numeric not null,   -- средняя влажность за сутки, %
  created_at    timestamptz not null default now(),
  unique (greenhouse_id, reading_date)
);

alter table public.daily_readings enable row level security;
drop policy if exists "readings own" on public.daily_readings;
create policy "readings own" on public.daily_readings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- notifications (умные уведомления от движка) ----------
create table if not exists public.notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  greenhouse_id uuid references public.greenhouses (id) on delete cascade,
  bed_id        uuid references public.beds (id) on delete cascade,
  level         text not null default 'good',  -- good | warn | critical
  code          text not null,                 -- ключ сообщения (рендерится на языке интерфейса)
  params        jsonb not null default '{}'::jsonb,  -- { name, crop, days }
  read          boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table public.notifications enable row level security;
drop policy if exists "notifications own" on public.notifications;
create policy "notifications own" on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);

-- ---------- crops_reference (справочник ИИ: общий, только чтение) ----------
create table if not exists public.crops_reference (
  crop_type        text primary key,
  name_ru          text not null,
  name_kk          text not null,
  name_en          text not null,
  category         text not null default 'vegetable', -- vegetable | fruit | berry | green
  fruits_per_plant numeric not null,  -- AvgFruitsPerPlant
  fruit_weight     numeric not null,  -- AvgFruitWeight, кг
  days_to_mature   int not null,      -- DaysToMature
  temp_opt_min     numeric not null default 22,
  temp_opt_max     numeric not null default 26
);

alter table public.crops_reference enable row level security;
drop policy if exists "crops readable by all" on public.crops_reference;
create policy "crops readable by all" on public.crops_reference
  for select using (true);

insert into public.crops_reference
  (crop_type, name_ru, name_kk, name_en, category, fruits_per_plant, fruit_weight, days_to_mature, temp_opt_min, temp_opt_max) values
  ('cherry',     'Томаты черри', 'Черри қызанағы', 'Cherry tomatoes', 'vegetable', 30, 0.020, 90, 22, 26),
  ('tomato',     'Томаты',       'Қызанақ',         'Tomatoes',        'vegetable', 20, 0.140, 95, 21, 26),
  ('cucumber',   'Огурцы',       'Қияр',            'Cucumber',        'vegetable', 25, 0.150, 55, 22, 28),
  ('pepper',     'Перец',        'Бұрыш',           'Pepper',          'vegetable', 12, 0.120, 75, 22, 28),
  ('eggplant',   'Баклажаны',    'Баялды',          'Eggplant',        'vegetable', 10, 0.250, 85, 22, 28),
  ('strawberry', 'Клубника',     'Құлпынай',        'Strawberry',      'berry',     15, 0.025, 60, 18, 24),
  ('lettuce',    'Салат',        'Салат',           'Lettuce',         'green',      1, 0.300, 45, 16, 22),
  ('arugula',    'Руккола',      'Руккола',         'Arugula',         'green',      1, 0.100, 30, 16, 22),
  ('basil',      'Базилик',      'Райхан',          'Basil',           'green',      1, 0.080, 50, 20, 26),
  ('dill',       'Укроп',        'Аскөк',           'Dill',            'green',      1, 0.050, 40, 16, 22),
  ('radish',     'Редис',        'Шомыр',           'Radish',          'vegetable',  1, 0.030, 28, 15, 20),
  ('zucchini',   'Кабачки',      'Асқабақ',         'Zucchini',        'vegetable',  8, 0.500, 50, 20, 26),
  ('melon',      'Дыня',         'Қауын',           'Melon',           'fruit',      4, 1.500, 80, 24, 30),
  ('watermelon', 'Арбуз',        'Қарбыз',          'Watermelon',      'fruit',      2, 5.000, 90, 24, 30)
on conflict (crop_type) do nothing;

-- ============================================================
-- Представление для расчётов прибыли (по желанию, дублирует lib/calc.js):
--   TotalYield = plants_count * fruits_per_plant * fruit_weight * 0.9
--   Profit     = TotalYield * price_per_kg - costs
-- ============================================================
create or replace view public.bed_economics as
select
  b.id,
  b.greenhouse_id,
  b.user_id,
  b.crop_type,
  b.plants_count,
  b.price_per_kg,
  b.costs,
  round((b.plants_count * cr.fruits_per_plant * cr.fruit_weight * 0.9)::numeric, 2) as total_yield_kg,
  round((b.plants_count * cr.fruits_per_plant * cr.fruit_weight * 0.9 * b.price_per_kg)::numeric, 2) as revenue,
  round((b.plants_count * cr.fruits_per_plant * cr.fruit_weight * 0.9 * b.price_per_kg - b.costs)::numeric, 2) as profit
from public.beds b
join public.crops_reference cr on cr.crop_type = b.crop_type;
