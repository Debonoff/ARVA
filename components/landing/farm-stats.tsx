"use client";

// Полоса статистики под картой: 4 карточки, числа «набегают» при появлении в
// зоне видимости. Значения выводятся из данных карты (FarmProvider).

import { useEffect, useRef, useState } from "react";
import { CalendarClock, Maximize2, Sprout, Warehouse } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useFarm } from "@/components/landing/farm-provider";
import { fmtDate, localeMap, nextHarvestISO } from "@/lib/farm-data";

function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(m.matches);
    const on = () => setReduce(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return reduce;
}

function useInView() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return [ref, seen] as const;
}

function CountUp({
  value,
  decimals = 0,
  locale,
  run,
  reduce,
}: {
  value: number;
  decimals?: number;
  locale: string;
  run: boolean;
  reduce: boolean;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (reduce) {
      setN(value);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const dur = 1100;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, value, reduce]);
  return <>{n.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>;
}

export function FarmStats() {
  const { t, locale } = useI18n();
  const { parcels } = useFarm();
  const reduce = useReducedMotion();
  const [ref, inView] = useInView();
  const intlLocale = localeMap[locale] ?? "ru-RU";

  const totalHa = parcels.reduce((s, p) => s + p.areaM2, 0) / 10000;
  const activeGh = parcels.filter((p) => p.type === "greenhouse" && p.status !== "empty").length;
  const growing = parcels.filter((p) => p.status !== "empty").length;
  const nextDate = fmtDate(nextHarvestISO(parcels), intlLocale) ?? t("stats.none");

  const items = [
    {
      icon: <Maximize2 className="h-[17px] w-[17px]" />,
      value: <CountUp value={totalHa} decimals={1} locale={intlLocale} run={inView} reduce={reduce} />,
      unit: t("map.units.ha"),
      label: t("stats.totalArea"),
    },
    {
      icon: <Warehouse className="h-[17px] w-[17px]" />,
      value: <CountUp value={activeGh} locale={intlLocale} run={inView} reduce={reduce} />,
      unit: null,
      label: t("stats.activeGh"),
    },
    {
      icon: <Sprout className="h-[17px] w-[17px]" />,
      value: <CountUp value={growing} locale={intlLocale} run={inView} reduce={reduce} />,
      unit: null,
      label: t("stats.growing"),
    },
    {
      icon: <CalendarClock className="h-[17px] w-[17px]" />,
      value: nextDate,
      unit: null,
      label: t("stats.nextHarvest"),
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 pb-14">
      <div ref={ref} className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((it, i) => (
          <div key={i} className="rounded-[2px] border border-line bg-paper p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted">{it.label}</span>
              <span className="grid h-8 w-8 place-items-center rounded-[2px] border border-line bg-brand-50 text-brand-dark">
                {it.icon}
              </span>
            </div>
            <div className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink">
              {it.value}
              {it.unit && <span className="ml-1 text-base font-semibold text-muted">{it.unit}</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
