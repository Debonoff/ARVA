"use client";

// Полоса культур: по карточке на каждую растущую культуру с числом участков.
// Клик подсвечивает участки этой культуры на карте (через общий FarmProvider).

import { Sprout } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { useLanding } from "@/components/landing/copy";
import { useFarm } from "@/components/landing/FarmProvider";
import { cropColor } from "@/components/landing/farmData";

// Простой плюрализатор: 3 формы для ru, 2 для en, 1 инвариант для kk.
function plural(n, forms) {
  if (forms.length === 1) return forms[0];
  if (forms.length === 2) return n === 1 ? forms[0] : forms[1];
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return forms[1];
  return forms[2];
}

export default function CropsStrip() {
  const { t } = usePrefs();
  const c = useLanding();
  const { parcels, cropFilter, setCropFilter } = useFarm();

  // Считаем участки по культуре среди засаженных.
  const counts = {};
  parcels.forEach((p) => {
    if (p.cropKey) counts[p.cropKey] = (counts[p.cropKey] || 0) + 1;
  });
  const crops = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

  const onPick = (key) => {
    setCropFilter(cropFilter === key ? null : key);
    if (cropFilter !== key) {
      document.getElementById("map")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="crops" className="lp-section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="lp-center">
          <div className="lp-eyebrow">{c.cropsStrip.eyebrow}</div>
          <h2 className="lp-h2">{c.cropsStrip.title}</h2>
          <p className="lp-sub">{c.cropsStrip.sub}</p>
        </div>

        <div className="crops-grid">
          {crops.map((key, i) => (
            <button
              key={key}
              className={`crop-card ${cropFilter === key ? "active" : ""}`}
              onClick={() => onPick(key)}
              aria-pressed={cropFilter === key}
            >
              <span className="ic">
                <Sprout size={19} strokeWidth={1.75} style={{ color: cropColor(i) }} />
              </span>
              <span>
                <span className="nm">{t.crops[key] || key}</span>
                <span className="ct">
                  {counts[key]} {plural(counts[key], c.cropsStrip.plots)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
