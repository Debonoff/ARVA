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
