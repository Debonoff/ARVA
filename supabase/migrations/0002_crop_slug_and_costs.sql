-- Align schema with the app model:
--  • areas.crop_id stores the crop slug (matches lib/crops.ts), not a uuid FK
--  • greenhouses gain per-greenhouse operating_costs (used in profit estimation)

alter table public.areas drop column if exists crop_id;
alter table public.areas add column if not exists crop_id text;

alter table public.greenhouses
  add column if not exists operating_costs numeric not null default 0;
