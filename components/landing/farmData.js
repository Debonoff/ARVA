// Данные фермы для интерактивной карты лендинга. Только клиентское состояние,
// без бэкенда. Названия культур берём из i18n (t.crops[key]); названия и заметки
// участков — из landing copy (c.map.names / c.map.notes). Геометрия — в системе
// координат SVG viewBox "0 0 1000 640".

import { CROP_PALETTE } from "@/lib/crops";

export const VIEW_W = 1000;
export const VIEW_H = 640;

export const STATUSES = ["planted", "growing", "ready", "empty"];

// ~9 участков: 4 теплицы (скруглённые прямоугольники со стеклением) и 5 полей
// (органичные скруглённые формы). Координаты подобраны так, чтобы не пересекаться.
export const PARCELS = [
  { id: "gh1", type: "greenhouse", status: "planted", cropKey: "tomato",     plantedOn: "2026-05-10", harvestOn: "2026-08-13", areaM2: 240,  x: 70,  y: 90,  w: 156, h: 104, rx: 8 },
  { id: "gh2", type: "greenhouse", status: "growing", cropKey: "cucumber",   plantedOn: "2026-06-01", harvestOn: "2026-07-26", areaM2: 180,  x: 240, y: 90,  w: 156, h: 104, rx: 8 },
  { id: "gh3", type: "greenhouse", status: "ready",   cropKey: "strawberry", plantedOn: "2026-04-20", harvestOn: "2026-07-15", areaM2: 160,  x: 70,  y: 214, w: 156, h: 104, rx: 8 },
  { id: "gh4", type: "greenhouse", status: "empty",   plannedCropKey: "pepper",                                                 areaM2: 200,  x: 240, y: 214, w: 156, h: 104, rx: 8 },
  { id: "f1",  type: "field",      status: "growing", cropKey: "watermelon", plantedOn: "2026-05-15", harvestOn: "2026-08-20", areaM2: 8000, x: 440, y: 80,  w: 500, h: 168, rx: 30 },
  { id: "f2",  type: "field",      status: "planted", cropKey: "zucchini",   plantedOn: "2026-06-10", harvestOn: "2026-07-30", areaM2: 5200, x: 70,  y: 388, w: 350, h: 182, rx: 30 },
  { id: "f3",  type: "field",      status: "ready",   cropKey: "melon",      plantedOn: "2026-04-25", harvestOn: "2026-07-18", areaM2: 9500, x: 610, y: 300, w: 330, h: 150, rx: 30 },
  { id: "f4",  type: "field",      status: "empty",   plannedCropKey: "radish",                                                 areaM2: 3000, x: 440, y: 300, w: 150, h: 150, rx: 28 },
  { id: "f5",  type: "field",      status: "planted", cropKey: "lettuce",    plantedOn: "2026-06-20", harvestOn: "2026-08-05", areaM2: 4200, x: 440, y: 470, w: 500, h: 108, rx: 30 },
];

export const localeOf = { ru: "ru-RU", kk: "kk-KZ", en: "en-US" };

export function cropColor(index) {
  return CROP_PALETTE[index % CROP_PALETTE.length];
}

export function parcelCenter(p) {
  return { cx: p.x + p.w / 2, cy: p.y + p.h / 2 };
}

// Площадь: до 1 га показываем в м², дальше — в гектарах.
export function fmtArea(m2, locale, units) {
  if (m2 >= 10000) {
    return { value: (m2 / 10000).toLocaleString(locale, { maximumFractionDigits: 1 }), unit: units.ha };
  }
  return { value: m2.toLocaleString(locale), unit: units.m2 };
}

// Детерминированное форматирование даты (без Date.now, чтобы не ломать гидрацию).
export function fmtDate(iso, locale) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(Date.UTC(y, m - 1, d))
  );
}

// Ближайшая дата сбора среди засаженных участков (минимальная harvestOn).
export function nextHarvestISO(parcels) {
  const dates = parcels.filter((p) => p.harvestOn).map((p) => p.harvestOn).sort();
  return dates[0] || null;
}
