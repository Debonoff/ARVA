/**
 * Arva growth & economics engine.
 *
 * Harvest date is driven by a daily Growth Index (per spec):
 *   Gi = (1 / DaysToMature) × K_hydro × K_temp × K_hum
 * The index accumulates each day until it reaches 1.0 (maturity). Under
 * constant conditions that means: totalDays = DaysToMature / (K_hydro·K_temp·K_hum).
 */

export type TempState = "optimal" | "cold" | "critical";
export type HumidityState = "normal" | "stressed";

export type GrowthConditions = {
  hydroponic: boolean;
  temp: TempState;
  humidity: HumidityState;
};

export const K_TEMP: Record<TempState, number> = {
  optimal: 1.0,
  cold: 0.7,
  critical: 0.0,
};

export const K_HUM: Record<HumidityState, number> = {
  normal: 1.0,
  stressed: 0.9,
};

export const K_HYDRO = { on: 1.2, off: 1.0 } as const;

/** Combined environmental coefficient K_hydro × K_temp × K_hum. */
export function conditionFactor(c: GrowthConditions): number {
  return (c.hydroponic ? K_HYDRO.on : K_HYDRO.off) * K_TEMP[c.temp] * K_HUM[c.humidity];
}

/** Daily growth index Gi. Returns 0 when growth is halted (critical temp). */
export function dailyGrowthIndex(daysToMature: number, c: GrowthConditions): number {
  if (daysToMature <= 0) return 0;
  return (1 / daysToMature) * conditionFactor(c);
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function diffInDays(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / DAY_MS);
}

export type HarvestForecast = {
  factor: number;
  dailyIndex: number;
  /** Days from planting to maturity under current conditions (Infinity if halted). */
  totalDays: number;
  daysElapsed: number;
  daysRemaining: number;
  progress: number; // 0..1
  harvestDate: Date | null; // null if halted
  /** Shift vs the greenhouse's own optimal conditions: + later, − earlier. */
  shiftDays: number;
  isHalted: boolean;
  isReady: boolean;
};

/** Forecast maturity for one planting assuming conditions hold constant. */
export function forecastHarvest(params: {
  daysToMature: number;
  plantedOn: Date;
  conditions: GrowthConditions;
  today?: Date;
}): HarvestForecast {
  const { daysToMature, plantedOn, conditions } = params;
  const today = params.today ?? new Date();

  const factor = conditionFactor(conditions);
  const dailyIndex = dailyGrowthIndex(daysToMature, conditions);
  const isHalted = factor <= 0;

  const totalDays = isHalted ? Infinity : Math.ceil(daysToMature / factor);

  // Baseline = same hydroponics, but temperature/humidity optimal.
  const optimalDays = daysToMature / (conditions.hydroponic ? K_HYDRO.on : K_HYDRO.off);
  const shiftDays = isHalted ? Infinity : Math.round(daysToMature / factor - optimalDays);

  const daysElapsed = Math.max(0, diffInDays(today, plantedOn));
  const progress = isHalted ? 0 : Math.min(1, daysElapsed / totalDays);
  const daysRemaining = isHalted ? Infinity : Math.max(0, totalDays - daysElapsed);
  const harvestDate = isHalted ? null : addDays(plantedOn, totalDays);
  const isReady = !isHalted && daysElapsed >= totalDays;

  return {
    factor,
    dailyIndex,
    totalDays,
    daysElapsed,
    daysRemaining,
    progress,
    harvestDate,
    shiftDays,
    isHalted,
    isReady,
  };
}

/* --------------------------------- economics -------------------------------- */

export const MARKETABLE_FACTOR = 0.9; // 10% waste allowance

export type YieldParams = {
  plantCount: number;
  avgFruitsPerPlant: number;
  avgFruitWeightG: number;
  marketableFactor?: number;
};

/** Total marketable yield in kilograms. */
export function totalYieldKg(p: YieldParams): number {
  const factor = p.marketableFactor ?? MARKETABLE_FACTOR;
  const grams = p.plantCount * p.avgFruitsPerPlant * p.avgFruitWeightG * factor;
  return grams / 1000;
}

export function estimatedRevenue(yieldKg: number, pricePerKg: number): number {
  return yieldKg * pricePerKg;
}

/** EstimatedProfit = (TotalYield × PricePerKg) − OperatingCosts. */
export function estimatedProfit(
  yieldKg: number,
  pricePerKg: number,
  operatingCosts: number,
): number {
  return estimatedRevenue(yieldKg, pricePerKg) - operatingCosts;
}
