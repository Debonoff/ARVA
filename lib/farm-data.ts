// Данные фермы для интерактивной карты лендинга. Только клиентское состояние,
// без бэкенда. Культуры ссылаются на id из lib/crops.ts (там же цвета и названия
// на трёх языках). Геометрия — в системе координат SVG viewBox "0 0 1000 640".

import { getCrop } from "@/lib/crops";
import type { Locale } from "@/lib/i18n/dictionaries";

export const VIEW_W = 1000;
export const VIEW_H = 640;

export type ParcelStatus = "planted" | "growing" | "ready" | "empty";
export type ParcelType = "greenhouse" | "field";

export type Parcel = {
  id: string;
  type: ParcelType;
  status: ParcelStatus;
  cropId?: string; // текущая культура (когда засажено)
  plannedCropId?: string; // для пустых участков — что будет посажено
  planned?: boolean; // назначено пользователем в режиме планирования
  plantedOn?: string;
  harvestOn?: string;
  areaM2: number;
  x: number;
  y: number;
  w: number;
  h: number;
  rx: number;
};

export const STATUSES: ParcelStatus[] = ["planted", "growing", "ready", "empty"];

// ~9 участков: 4 теплицы (скруглённые прямоугольники со стеклением) и 5 полей.
// Культуры — только те, что есть в lib/crops.ts (8 позиций).
export const PARCELS: Parcel[] = [
  { id: "gh1", type: "greenhouse", status: "planted", cropId: "tomato",     plantedOn: "2026-05-10", harvestOn: "2026-08-13", areaM2: 240,  x: 70,  y: 90,  w: 156, h: 104, rx: 8 },
  { id: "gh2", type: "greenhouse", status: "growing", cropId: "cucumber",   plantedOn: "2026-06-01", harvestOn: "2026-07-26", areaM2: 180,  x: 240, y: 90,  w: 156, h: 104, rx: 8 },
  { id: "gh3", type: "greenhouse", status: "ready",   cropId: "strawberry", plantedOn: "2026-04-20", harvestOn: "2026-07-15", areaM2: 160,  x: 70,  y: 214, w: 156, h: 104, rx: 8 },
  { id: "gh4", type: "greenhouse", status: "empty",   plannedCropId: "pepper",                                                 areaM2: 200,  x: 240, y: 214, w: 156, h: 104, rx: 8 },
  { id: "f1",  type: "field",      status: "growing", cropId: "eggplant",   plantedOn: "2026-05-15", harvestOn: "2026-08-20", areaM2: 8000, x: 440, y: 80,  w: 500, h: 168, rx: 30 },
  { id: "f2",  type: "field",      status: "planted", cropId: "basil",      plantedOn: "2026-06-10", harvestOn: "2026-07-30", areaM2: 5200, x: 70,  y: 388, w: 350, h: 182, rx: 30 },
  { id: "f3",  type: "field",      status: "ready",   cropId: "pepper",     plantedOn: "2026-04-25", harvestOn: "2026-07-18", areaM2: 9500, x: 610, y: 300, w: 330, h: 150, rx: 30 },
  { id: "f4",  type: "field",      status: "empty",   plannedCropId: "radish",                                                 areaM2: 3000, x: 440, y: 300, w: 150, h: 150, rx: 28 },
  { id: "f5",  type: "field",      status: "planted", cropId: "lettuce",    plantedOn: "2026-06-20", harvestOn: "2026-08-05", areaM2: 4200, x: 440, y: 470, w: 500, h: 108, rx: 30 },
];

export const localeMap: Record<Locale, string> = { ru: "ru-RU", kk: "kk-KZ", en: "en-US" };

// Локализованное имя культуры по её id (из справочника crops.ts).
export function cropName(id: string | undefined, locale: Locale): string {
  if (!id) return "";
  const c = getCrop(id);
  if (!c) return id;
  return locale === "kk" ? c.nameKk : locale === "en" ? c.nameEn : c.name;
}

// Цвет культуры (из справочника crops.ts) — приглушённая землистая палитра.
export function cropColorOf(id: string | undefined): string {
  return getCrop(id)?.color ?? "#64726b";
}

export function parcelCenter(p: Parcel): { cx: number; cy: number } {
  return { cx: p.x + p.w / 2, cy: p.y + p.h / 2 };
}

// Площадь: до 1 га показываем в м², дальше — в гектарах.
export function fmtArea(
  m2: number,
  locale: string,
  units: { m2: string; ha: string },
): { value: string; unit: string } {
  if (m2 >= 10000) {
    return { value: (m2 / 10000).toLocaleString(locale, { maximumFractionDigits: 1 }), unit: units.ha };
  }
  return { value: m2.toLocaleString(locale), unit: units.m2 };
}

// Детерминированное форматирование даты (без Date.now, чтобы не ломать гидрацию).
export function fmtDate(iso: string | null | undefined, locale: string): string | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

// Ближайшая дата сбора среди засаженных участков (минимальная harvestOn).
export function nextHarvestISO(parcels: Parcel[]): string | null {
  const dates = parcels
    .map((p) => p.harvestOn)
    .filter((d): d is string => Boolean(d))
    .sort();
  return dates[0] ?? null;
}
