import { CROP_DB } from "./crops";

/* =====================================================================
   МОДЕЛЬ РОСТА  (Индекс Суточного Роста)
   G_i = (1 / DaysToMature) * K_hydro * K_temp * K_hum
   Урожай готов, когда сумма G_i по дням достигает 100% (Σ G_i >= 1.0).
   ===================================================================== */

// K_hydro — коэффициент гидропоники (ускоряет рост на 20%).
export function kHydro(isHydro) {
  return isHydro ? 1.2 : 1.0;
}

// K_temp — коэффициент температуры относительно оптимума культуры.
// < +12°C — критический минимум, рост = 0 (корни «засыпают»).
export function kTemp(t, opt = [22, 26]) {
  const [lo, hi] = opt;
  if (t < 12) return 0.0;
  if (t >= lo && t <= hi) return 1.0; // идеал
  const d = t < lo ? lo - t : t - hi; // отклонение от оптимума
  if (d <= 3) return 0.85;
  if (d <= 6) return 0.7; // похолодание, рост замедлен на 30%
  if (d <= 9) return 0.5;
  return 0.4;
}

// K_hum — коэффициент влажности. Норма 60–80%, иначе стресс.
export function kHum(h) {
  return h >= 60 && h <= 80 ? 1.0 : 0.9;
}

// Индекс суточного роста за конкретный день.
export function growthIndex(daysToMature, isHydro, temp, hum, tempOpt) {
  return (
    (1 / daysToMature) * kHydro(isHydro) * kTemp(Number(temp), tempOpt) * kHum(Number(hum))
  );
}

/* ------------------------------ даты ------------------------------ */
export function isoDate(d = new Date()) {
  return new Date(d).toISOString().slice(0, 10);
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function daysBetween(dateStr, from = new Date()) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  return Math.max(0, Math.floor((from.getTime() - d.getTime()) / 86400000));
}

/* ------------------------- статус грядки -------------------------
   Возвращает прогресс созревания, дни до сбора, прогнозную дату и
   сдвиг относительно идеального плана. Если движок роста уже
   накопил прогресс (bed.progress > 0) — используем его; иначе живая
   оценка «как будто сегодняшние условия держались всё время».
------------------------------------------------------------------ */
export function bedStatus(bed, gh) {
  const ref = CROP_DB[bed.crop_type];
  if (!ref) return null;
  const gi = growthIndex(ref.daysToMature, gh.hydro, gh.temp, gh.humidity, ref.tempOpt);
  const elapsed = daysBetween(bed.plant_date);
  const accumulated = Number(bed.progress) || 0;

  const liveProgress = gi > 0 ? Math.min(1, elapsed * gi) : accumulated;
  const progress = accumulated > 0 ? Math.min(1, accumulated) : liveProgress;

  const ready = progress >= 1;
  const stalled = gi <= 0 && !ready;

  let daysLeft;
  if (ready) daysLeft = 0;
  else if (gi > 0) daysLeft = Math.max(0, Math.ceil((1 - progress) / gi));
  else daysLeft = Infinity;

  const predictedDate = Number.isFinite(daysLeft) ? addDays(new Date(), daysLeft) : null;
  const baselineDate = bed.plant_date ? addDays(new Date(bed.plant_date), ref.daysToMature) : null;
  const shiftDays =
    predictedDate && baselineDate
      ? Math.round((predictedDate.getTime() - baselineDate.getTime()) / 86400000)
      : 0;

  return { gi, elapsed, progress, daysLeft, ready, stalled, predictedDate, baselineDate, shiftDays, ref };
}

/* =====================================================================
   ПРИБЫЛЬ
   TotalYield     = PlantsCount * AvgFruitsPerPlant * AvgFruitWeight * 0.9
   EstimatedProfit = TotalYield * PricePerKg - OperatingCosts
   ===================================================================== */
export const MARKETABLE = 0.9; // MarketableYieldFactor (−10% на брак)

export function bedYieldKg(bed) {
  const ref = CROP_DB[bed.crop_type];
  if (!ref) return 0;
  return (Number(bed.plants_count) || 0) * ref.fruitsPerPlant * ref.fruitWeight * MARKETABLE;
}

export function bedProfit(bed) {
  const yieldKg = bedYieldKg(bed);
  const revenue = yieldKg * (Number(bed.price_per_kg) || 0);
  const profit = revenue - (Number(bed.costs) || 0);
  return { yieldKg, revenue, profit };
}

export function fmt(n) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(Number(n) || 0));
}

/* =====================================================================
   УМНЫЕ УВЕДОМЛЕНИЯ (Arva AI)
   renderNotification рендерит текст по коду + параметрам на языке
   интерфейса. Один и тот же код используют и живой дашборд, и cron
   (который сохраняет code + params в таблицу notifications).
   ===================================================================== */
export function renderNotification(code, params, t) {
  const fn = t.ai[code];
  return typeof fn === "function" ? fn(params || {}) : "";
}

function alert(code, level, params, t) {
  return { code, level, params, text: renderNotification(code, params, t) };
}

// Список уведомлений по всем теплицам: климат + график созревания.
export function aiAlerts(greenhouses, t) {
  const climate = [];
  const harvest = [];

  greenhouses.forEach((gh) => {
    if (!gh.beds || gh.beds.length === 0) return;
    const p = { name: gh.name };

    // --- климат теплицы ---
    if (gh.temp < 12) climate.push(alert("critical", "critical", p, t));
    else if (gh.temp < 20) {
      // оценка задержки по любой активной грядке
      let days = 4;
      const st = bedStatus(gh.beds[0], gh);
      if (st && st.shiftDays > 0) days = st.shiftDays;
      climate.push(alert("cooling", "warn", { ...p, days }, t));
    }
    if (gh.humidity < 60) climate.push(alert("drought", "warn", p, t));
    else if (gh.humidity > 80) climate.push(alert("humid", "warn", p, t));
    if (gh.temp >= 22 && gh.temp <= 26 && gh.humidity >= 60 && gh.humidity <= 80)
      climate.push(alert("ideal", "good", p, t));

    // --- график созревания по грядкам ---
    gh.beds.forEach((b) => {
      if (!b.plant_date) return;
      const st = bedStatus(b, gh);
      if (!st) return;
      const cp = { name: gh.name, crop: t.crops[b.crop_type] || b.crop_type, days: 0 };
      if (st.ready) harvest.push(alert("harvestReady", "good", cp, t));
      else if (Number.isFinite(st.daysLeft) && st.daysLeft <= 7)
        harvest.push(alert("harvestSoon", "warn", { ...cp, days: st.daysLeft }, t));
      else if (st.shiftDays <= -2)
        harvest.push(alert("earlier", "good", { ...cp, days: Math.abs(st.shiftDays) }, t));
    });
  });

  const order = { critical: 0, warn: 1, good: 2 };
  const out = [...climate, ...harvest].sort((a, b) => order[a.level] - order[b.level]);
  if (out.length === 0) out.push(alert("allGood", "good", {}, t));
  return out.slice(0, 5);
}
