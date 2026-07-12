"use client";

// Полоса статистики под картой: 4 карточки, числа «набегают» при появлении в
// зоне видимости. Значения выводятся из данных карты (FarmProvider).

import { useEffect, useRef, useState } from "react";
import { Maximize2, Warehouse, Sprout, CalendarClock } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { useLanding } from "@/components/landing/copy";
import { useFarm } from "@/components/landing/FarmProvider";
import { localeOf, fmtDate, nextHarvestISO } from "@/components/landing/farmData";

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
  const ref = useRef(null);
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
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return [ref, seen];
}

function CountUp({ value, decimals = 0, locale, run, reduce }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (reduce) {
      setN(value);
      return;
    }
    let raf;
    let start = null;
    const dur = 1100;
    const tick = (ts) => {
      if (start == null) start = ts;
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

export default function FarmStats() {
  const { lang } = usePrefs();
  const c = useLanding();
  const { parcels } = useFarm();
  const reduce = useReducedMotion();
  const [ref, inView] = useInView();
  const locale = localeOf[lang] || "ru-RU";

  const totalHa = parcels.reduce((s, p) => s + p.areaM2, 0) / 10000;
  const activeGh = parcels.filter((p) => p.type === "greenhouse" && p.status !== "empty").length;
  const growing = parcels.filter((p) => p.status !== "empty").length;
  const nextISO = nextHarvestISO(parcels);
  const nextDate = fmtDate(nextISO, locale) || c.stats.none;

  const items = [
    {
      icon: <Maximize2 size={17} strokeWidth={1.75} />,
      value: <CountUp value={totalHa} decimals={1} locale={locale} run={inView} reduce={reduce} />,
      unit: c.map.units.ha,
      label: c.stats.totalArea,
    },
    {
      icon: <Warehouse size={17} strokeWidth={1.75} />,
      value: <CountUp value={activeGh} locale={locale} run={inView} reduce={reduce} />,
      unit: null,
      label: c.stats.activeGh,
    },
    {
      icon: <Sprout size={17} strokeWidth={1.75} />,
      value: <CountUp value={growing} locale={locale} run={inView} reduce={reduce} />,
      unit: null,
      label: c.stats.growing,
    },
    {
      icon: <CalendarClock size={17} strokeWidth={1.75} />,
      value: nextDate,
      unit: null,
      label: c.stats.nextHarvest,
    },
  ];

  return (
    <section className="lp-section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="lp-stats-grid" ref={ref}>
          {items.map((it, i) => (
            <div className="lp-stat" key={i}>
              <div className="lp-stat-top">
                <span className="lp-stat-lbl" style={{ marginTop: 0 }}>
                  {it.label}
                </span>
                <span className="lp-stat-ic">{it.icon}</span>
              </div>
              <div className="lp-stat-val">
                {it.value}
                {it.unit && <span className="lp-stat-unit">{it.unit}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
