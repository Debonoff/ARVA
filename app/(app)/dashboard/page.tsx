"use client";

import Link from "next/link";
import { AlertTriangle, CalendarClock, Coins, Leaf, Sprout, TrendingUp } from "lucide-react";
import { updateGreenhouse, useGreenhouses, useStoreReady } from "@/lib/store";
import { getCrop } from "@/lib/crops";
import { estimatedRevenue, forecastHarvest, totalYieldKg, type HarvestForecast } from "@/lib/calc";
import { formatDate, formatKg, formatMoney } from "@/lib/format";
import { KpiTile } from "@/components/dashboard/kpi-tile";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function adaptiveMessage(f: HarvestForecast): {
  text: string;
  tone: "ok" | "warn" | "danger";
} {
  if (f.isHalted)
    return {
      text: "Рост остановлен: критическая температура. Урожай не созреет, пока условия не улучшатся.",
      tone: "danger",
    };
  if (f.isReady) return { text: "Готово к сбору!", tone: "ok" };
  if (f.shiftDays > 0)
    return {
      text: `Из-за условий среды созреет на ${f.shiftDays} дн позже — пересмотрите график поставок.`,
      tone: "warn",
    };
  return { text: "Растёт по плану, в оптимальных условиях.", tone: "ok" };
}

export default function DashboardPage() {
  const greenhouses = useGreenhouses();
  const ready = useStoreReady();

  if (!ready) {
    return (
      <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-3xl bg-paper-soft" />
        ))}
      </div>
    );
  }

  const today = new Date();
  const plantings = greenhouses.flatMap((gh) =>
    gh.areas
      .map((a) => {
        const crop = getCrop(a.cropId);
        if (!crop) return null;
        const forecast = forecastHarvest({
          daysToMature: crop.daysToMature,
          plantedOn: new Date(a.plantedOn),
          conditions: {
            hydroponic: gh.hydroponic,
            temp: gh.temp,
            humidity: gh.humidity,
          },
          today,
        });
        const yieldKg = totalYieldKg({
          plantCount: a.plantCount,
          avgFruitsPerPlant: crop.avgFruitsPerPlant,
          avgFruitWeightG: crop.avgFruitWeightG,
        });
        return {
          id: a.id,
          gh,
          crop,
          area: a,
          forecast,
          yieldKg,
          revenue: estimatedRevenue(yieldKg, crop.pricePerKg),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null),
  );

  const totalPlants = greenhouses.reduce(
    (s, g) => s + g.areas.reduce((t, a) => t + a.plantCount, 0),
    0,
  );
  const totalYield = plantings.reduce((s, p) => s + p.yieldKg, 0);
  const totalRevenue = plantings.reduce((s, p) => s + p.revenue, 0);
  const totalOperating = greenhouses.reduce((s, g) => s + g.operatingCosts, 0);
  const totalProfit = totalRevenue - totalOperating;

  if (greenhouses.length === 0) {
    return (
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">Дашборд</h1>
        <div className="mt-6 rounded-3xl border border-dashed border-line p-12 text-center text-muted">
          <Sprout className="mx-auto h-8 w-8 opacity-40" />
          <p className="mt-3">
            Нет данных. Создайте теплицу и грядки на{" "}
            <Link href="/greenhouses" className="font-medium text-brand">
              странице теплиц
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">Дашборд</h1>
        <p className="mt-1 text-muted">
          Статус культур, прогноз сбора и экономика по всем теплицам.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile icon={Sprout} label="Теплицы" value={String(greenhouses.length)} />
        <KpiTile icon={Leaf} label="Растений" value={String(totalPlants)} />
        <KpiTile icon={TrendingUp} label="Прогноз урожая" value={formatKg(totalYield)} />
        <KpiTile
          icon={Coins}
          label="Прогноз прибыли"
          value={formatMoney(totalProfit)}
          hint={`выручка ${formatMoney(totalRevenue)}`}
        />
      </div>

      {/* Crop status */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-ink">
          <CalendarClock className="h-5 w-5 text-brand" /> Статус культур
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {plantings.map((p) => {
            const msg = adaptiveMessage(p.forecast);
            const pct = Math.round(p.forecast.progress * 100);
            return (
              <div key={p.id} className="rounded-3xl border border-line bg-paper p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: p.crop.color }}
                    />
                    {p.crop.name}
                  </span>
                  <span className="text-xs text-muted">{p.gh.name}</span>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted">Готовность</span>
                  <span className="font-semibold text-ink tabular-nums">{pct}%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-[2px] bg-paper-soft">
                  <div
                    className="h-full rounded-[2px] bg-brand transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-muted">
                  <span>
                    {p.forecast.isReady
                      ? "Готово"
                      : p.forecast.isHalted
                        ? "Рост остановлен"
                        : `Осталось ${p.forecast.daysRemaining} дн`}
                  </span>
                  {p.forecast.harvestDate && (
                    <span className="text-ink">{formatDate(p.forecast.harvestDate)}</span>
                  )}
                </div>

                <div
                  className={cn(
                    "mt-4 flex items-start gap-2 rounded-xl p-3 text-xs",
                    msg.tone === "danger" && "bg-paper-soft text-ink",
                    msg.tone === "warn" && "bg-paper-soft text-ink",
                    msg.tone === "ok" && "bg-brand-50 text-brand-dark",
                  )}
                >
                  {msg.tone !== "ok" && <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                  <span>{msg.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Economics */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-ink">
          <Coins className="h-5 w-5 text-brand" /> Себестоимость и прибыль
        </h2>
        <div className="space-y-6">
          {greenhouses.map((gh) => {
            const rows = plantings.filter((p) => p.gh.id === gh.id);
            const revenue = rows.reduce((s, p) => s + p.revenue, 0);
            const profit = revenue - gh.operatingCosts;
            return (
              <div
                key={gh.id}
                className="overflow-hidden rounded-3xl border border-line bg-paper shadow-card"
              >
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                  <h3 className="font-display font-bold text-ink">{gh.name}</h3>
                </div>
                {rows.length === 0 ? (
                  <p className="p-5 text-sm text-muted">Нет засаженных грядок.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                      <thead>
                        <tr className="text-left text-xs text-muted uppercase">
                          <th className="px-5 py-2 font-semibold">Культура</th>
                          <th className="px-5 py-2 text-right font-semibold">Растений</th>
                          <th className="px-5 py-2 text-right font-semibold">Урожай</th>
                          <th className="px-5 py-2 text-right font-semibold">Выручка</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((p) => (
                          <tr key={p.id} className="border-t border-line">
                            <td className="px-5 py-2.5">
                              <span className="flex items-center gap-2">
                                <span
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: p.crop.color }}
                                />
                                {p.crop.name}
                              </span>
                            </td>
                            <td className="px-5 py-2.5 text-right tabular-nums">
                              {p.area.plantCount}
                            </td>
                            <td className="px-5 py-2.5 text-right tabular-nums">
                              {formatKg(p.yieldKg)}
                            </td>
                            <td className="px-5 py-2.5 text-right text-ink tabular-nums">
                              {formatMoney(p.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="grid gap-4 border-t border-line px-5 py-4 sm:grid-cols-3">
                  <label className="text-sm">
                    <span className="mb-1 block text-xs text-muted">Операционные затраты, ₸</span>
                    <Input
                      type="number"
                      min={0}
                      value={gh.operatingCosts}
                      onChange={(e) =>
                        updateGreenhouse(gh.id, {
                          operatingCosts: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                    />
                  </label>
                  <div className="text-sm sm:text-right">
                    <span className="block text-xs text-muted">Выручка</span>
                    <span className="mt-1 block font-display text-lg font-bold text-ink tabular-nums">
                      {formatMoney(revenue)}
                    </span>
                  </div>
                  <div className="text-sm sm:text-right">
                    <span className="block text-xs text-muted">Ожидаемая прибыль</span>
                    <span
                      className={cn(
                        "mt-1 block font-display text-lg font-bold tabular-nums",
                        profit >= 0 ? "text-brand-dark" : "text-ink",
                      )}
                    >
                      {formatMoney(profit)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
