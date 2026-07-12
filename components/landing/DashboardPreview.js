"use client";

import { Ruler, Sprout, Leaf, TrendingUp } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { useLanding } from "@/components/landing/copy";

export default function DashboardPreview() {
  const c = useLanding();
  const { t } = usePrefs();

  const stats = [
    { label: c.preview.area, value: "420 м²", icon: <Ruler size={18} strokeWidth={1.75} />, accent: false },
    { label: c.preview.crops, value: "6", icon: <Sprout size={18} strokeWidth={1.75} />, accent: false },
    { label: c.preview.ready, value: "73%", icon: <Leaf size={18} strokeWidth={1.75} />, accent: true },
    { label: c.preview.revenue, value: "1.2M ₸", icon: <TrendingUp size={18} strokeWidth={1.75} />, accent: true },
  ];
  const rows = [
    { key: "tomato", pct: 78, days: 12 },
    { key: "cucumber", pct: 45, days: 26 },
    { key: "strawberry", pct: 96, days: 0 },
  ];

  return (
    <section className="lp-section">
      <div className="container">
        <div className="lp-center">
          <div className="lp-eyebrow">{c.preview.eyebrow}</div>
          <h2 className="lp-h2">{c.preview.title}</h2>
          <p className="lp-sub">{c.preview.sub}</p>
        </div>

        <div className="card-soft" style={{ padding: 24, marginTop: 40, maxWidth: 900, marginLeft: "auto", marginRight: "auto" }}>
          <div className="stat-grid" style={{ marginBottom: 20 }}>
            {stats.map((s, i) => (
              <div key={i} className="card-soft" style={{ padding: 16, background: "var(--surface-2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>{s.label}</span>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "var(--radius)",
                      display: "grid",
                      placeItems: "center",
                      background: s.accent ? "var(--accent-weak)" : "var(--surface)",
                      color: s.accent ? "var(--accent-strong)" : "var(--ink-2)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    {s.icon}
                  </span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8, letterSpacing: "-0.02em" }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{c.preview.ripening}</h3>
            <span className="chip chip-accent">
              <span className="chip-dot" /> {c.preview.live}
            </span>
          </div>
          <div style={{ display: "grid", gap: 16 }}>
            {rows.map((r) => (
              <div key={r.key}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{t.crops[r.key]}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: r.pct >= 95 ? "var(--accent-strong)" : "var(--ink-2)" }}>
                    {r.pct >= 95 ? c.preview.ready2 : `${r.days} ${c.preview.daysLeft}`}
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
