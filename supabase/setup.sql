-- Arva - one-shot setup: schema + RLS + crop seed.
-- Paste into Supabase Dashboard -> SQL Editor -> Run.

-- Arva — initial schema
-- Apply in the Supabase SQL editor, or via the Supabase CLI: `supabase db push`.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  surname text not null default '',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile for every new auth user (name/surname from sign-up metadata).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, surname)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'surname', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------- crops (shared reference)
create table if not exists public.crops (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  name_kk text not null default '',
  name_en text not null default '',
  color text not null default '#16a34a',
  days_to_mature int not null,
  avg_fruits_per_plant numeric not null,
  avg_fruit_weight_g numeric not null,
  price_per_kg numeric not null
);
alter table public.crops enable row level security;
create policy "crops: read for authenticated" on public.crops
  for select using (auth.role() = 'authenticated');

-- ------------------------------------------------------------ greenhouses
create table if not exists public.greenhouses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  length_m numeric not null check (length_m > 0),
  width_m numeric not null check (width_m > 0),
  hydroponic boolean not null default false,
  temp_state text not null default 'optimal',    -- optimal | cold | critical
  humidity_state text not null default 'normal',  -- normal | stressed
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.greenhouses enable row level security;
create index if not exists greenhouses_user_idx on public.greenhouses (user_id);

create policy "greenhouses: crud own" on public.greenhouses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------- areas (beds / plantings)
-- A rectangular bed on the 1 m² grid with an assigned crop and plant count.
-- `planted_on` doubles as the planting record for MVP.
create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  greenhouse_id uuid not null references public.greenhouses (id) on delete cascade,
  crop_id uuid references public.crops (id) on delete set null,
  x int not null,
  y int not null,
  width int not null check (width > 0),
  height int not null check (height > 0),
  plant_count int not null default 0 check (plant_count >= 0),
  planted_on date not null default current_date,
  color text not null default '#16a34a',
  created_at timestamptz not null default now()
);
alter table public.areas enable row level security;
create index if not exists areas_greenhouse_idx on public.areas (greenhouse_id);

create policy "areas: crud via owned greenhouse" on public.areas
  for all
  using (
    exists (
      select 1 from public.greenhouses g
      where g.id = greenhouse_id and g.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.greenhouses g
      where g.id = greenhouse_id and g.user_id = auth.uid()
    )
  );

-- -------------------------------------------- environment readings (history)
create table if not exists public.env_readings (
  id uuid primary key default gen_random_uuid(),
  greenhouse_id uuid not null references public.greenhouses (id) on delete cascade,
  recorded_at timestamptz not null default now(),
  temp_c numeric,
  humidity numeric
);
alter table public.env_readings enable row level security;
create index if not exists env_readings_greenhouse_idx on public.env_readings (greenhouse_id);

create policy "env_readings: crud via owned greenhouse" on public.env_readings
  for all
  using (
    exists (
      select 1 from public.greenhouses g
      where g.id = greenhouse_id and g.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.greenhouses g
      where g.id = greenhouse_id and g.user_id = auth.uid()
    )
  );


-- Align schema with the app model:
--  • areas.crop_id stores the crop slug (matches lib/crops.ts), not a uuid FK
--  • greenhouses gain per-greenhouse operating_costs (used in profit estimation)

alter table public.areas drop column if exists crop_id;
alter table public.areas add column if not exists crop_id text;

alter table public.greenhouses
  add column if not exists operating_costs numeric not null default 0;


-- Arva — crop reference seed data.
-- price_per_kg is in ₸ (KZT). Values are indicative averages for greenhouse crops.

insert into public.crops
  (slug, name, name_kk, name_en, color, days_to_mature, avg_fruits_per_plant, avg_fruit_weight_g, price_per_kg)
values
  ('strawberry', 'Клубника', 'Құлпынай', 'Strawberry', '#ef4444',  60, 20,  25, 2000),
  ('tomato',     'Томат',    'Қызанақ',  'Tomato',     '#f59e0b',  90, 35, 110,  800),
  ('cucumber',   'Огурец',   'Қияр',     'Cucumber',   '#16a34a',  55, 25, 120,  700),
  ('lettuce',    'Салат',    'Салат',    'Lettuce',    '#84cc16',  45,  1, 300,  900),
  ('pepper',     'Перец',    'Бұрыш',    'Pepper',     '#db2777', 100, 15, 150, 1200),
  ('eggplant',   'Баклажан', 'Баялды',   'Eggplant',   '#7c3aed', 110, 12, 250, 1000),
  ('basil',      'Базилик',  'Райхан',   'Basil',      '#059669',  40,  1,  50, 2500),
  ('radish',     'Редис',    'Шомыр',    'Radish',     '#f43f5e',  30,  1,  25,  600)
on conflict (slug) do nothing;
