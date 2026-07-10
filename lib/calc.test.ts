import { describe, expect, it } from "vitest";
import {
  conditionFactor,
  dailyGrowthIndex,
  estimatedProfit,
  forecastHarvest,
  totalYieldKg,
} from "./calc";

describe("conditionFactor", () => {
  it("is 1.0 in optimal non-hydroponic conditions", () => {
    expect(conditionFactor({ hydroponic: false, temp: "optimal", humidity: "normal" })).toBe(1);
  });

  it("applies the 1.2 hydroponic boost", () => {
    expect(conditionFactor({ hydroponic: true, temp: "optimal", humidity: "normal" })).toBeCloseTo(
      1.2,
    );
  });

  it("slows to 0.7 when cold and 0.9 when humidity-stressed", () => {
    expect(conditionFactor({ hydroponic: false, temp: "cold", humidity: "normal" })).toBeCloseTo(
      0.7,
    );
    expect(
      conditionFactor({ hydroponic: false, temp: "optimal", humidity: "stressed" }),
    ).toBeCloseTo(0.9);
  });

  it("halts growth (0) at critical temperature", () => {
    expect(conditionFactor({ hydroponic: true, temp: "critical", humidity: "normal" })).toBe(0);
  });
});

describe("dailyGrowthIndex", () => {
  it("equals 1/DaysToMature in optimal conditions", () => {
    expect(
      dailyGrowthIndex(60, {
        hydroponic: false,
        temp: "optimal",
        humidity: "normal",
      }),
    ).toBeCloseTo(1 / 60);
  });
});

describe("forecastHarvest", () => {
  const plantedOn = new Date("2026-01-01");
  const today = plantedOn;

  it("matures in DaysToMature days under optimal conditions", () => {
    const f = forecastHarvest({
      daysToMature: 60,
      plantedOn,
      today,
      conditions: { hydroponic: false, temp: "optimal", humidity: "normal" },
    });
    expect(f.totalDays).toBe(60);
    expect(f.shiftDays).toBe(0);
    expect(f.isHalted).toBe(false);
    expect(f.harvestDate?.toISOString().slice(0, 10)).toBe("2026-03-02"); // +60 days
  });

  it("pushes maturity later when cold", () => {
    const f = forecastHarvest({
      daysToMature: 60,
      plantedOn,
      today,
      conditions: { hydroponic: false, temp: "cold", humidity: "normal" },
    });
    expect(f.totalDays).toBe(Math.ceil(60 / 0.7)); // 86
    expect(f.shiftDays).toBe(26); // round(60/0.7 - 60)
  });

  it("halts at critical temperature", () => {
    const f = forecastHarvest({
      daysToMature: 60,
      plantedOn,
      today,
      conditions: { hydroponic: false, temp: "critical", humidity: "normal" },
    });
    expect(f.isHalted).toBe(true);
    expect(f.harvestDate).toBeNull();
    expect(f.totalDays).toBe(Infinity);
  });

  it("reports progress from elapsed days", () => {
    const f = forecastHarvest({
      daysToMature: 60,
      plantedOn: new Date("2026-01-01"),
      today: new Date("2026-01-31"), // 30 days later
      conditions: { hydroponic: false, temp: "optimal", humidity: "normal" },
    });
    expect(f.daysElapsed).toBe(30);
    expect(f.progress).toBeCloseTo(0.5);
  });
});

describe("economics", () => {
  it("computes marketable yield with the 0.9 waste factor", () => {
    // 100 plants × 20 fruits × 25 g × 0.9 = 45 000 g = 45 kg
    expect(
      totalYieldKg({
        plantCount: 100,
        avgFruitsPerPlant: 20,
        avgFruitWeightG: 25,
      }),
    ).toBeCloseTo(45);
  });

  it("computes EstimatedProfit = yield × price − costs", () => {
    expect(estimatedProfit(45, 2000, 10_000)).toBe(80_000);
  });
});
