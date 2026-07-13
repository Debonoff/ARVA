"use client";

// Полоса культур: по карточке на каждую растущую культуру с числом участков.
// Клик подсвечивает участки этой культуры на карте (через общий FarmProvider).

import { Sprout } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/dictionaries";
import { useFarm } from "@/components/landing/farm-provider";
import { cropColorOf, cropName } from "@/lib/farm-data";
import { cn } from "@/lib/utils";

// Плюрализатор: 3 формы для ru, 2 для en, инвариант для kk.
function pluralKey(n: number, locale: Locale): "plotsOne" | "plotsFew" | "plotsMany" {
  if (locale === "kk") return "plotsMany";
  if (locale === "en") return n === 1 ? "plotsOne" : "plotsMany";
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "plotsOne";
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "plotsFew";
  return "plotsMany";
}

export function CropsStrip() {
  const { t, locale } = useI18n();
  const { parcels, cropFilter, setCropFilter } = useFarm();

  const counts: Record<string, number> = {};
  for (const p of parcels) if (p.cropId) counts[p.cropId] = (counts[p.cropId] ?? 0) + 1;
  const crops = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

  const onPick = (id: string) => {
    setCropFilter(cropFilter === id ? null : id);
    if (cropFilter !== id) {
      document.getElementById("map")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="crops" className="mx-auto max-w-6xl px-5 pb-20">
      <div className="max-w-2xl">
        <p className="font-display text-sm font-bold tracking-wide text-brand uppercase">{t("cropsStrip.eyebrow")}</p>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {t("cropsStrip.title")}
        </h2>
        <p className="mt-3 text-lg text-muted">{t("cropsStrip.sub")}</p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {crops.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            aria-pressed={cropFilter === id}
            className={cn(
              "flex items-center gap-3 rounded-[2px] border p-4 text-left transition-colors",
              cropFilter === id ? "border-ink" : "border-line hover:border-muted",
            )}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[2px] border border-line bg-paper-soft">
              <Sprout className="h-5 w-5" style={{ color: cropColorOf(id) }} />
            </span>
            <span>
              <span className="block text-[15px] font-semibold tracking-tight text-ink">{cropName(id, locale)}</span>
              <span className="block text-sm text-muted">
                {counts[id]} {t(`cropsStrip.${pluralKey(counts[id], locale)}`)}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
