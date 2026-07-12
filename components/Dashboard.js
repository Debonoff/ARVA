"use client";

import { useMemo } from "react";
import { Ruler, Sprout, Leaf, TrendingUp, Sparkles } from "lucide-react";
import { useData } from "@/components/data-provider";
import { usePrefs, useAuth } from "@/components/providers";
import { Stat, Spinner } from "@/components/ui";
import { aiAlerts, bedStatus, bedProfit, fmt, renderNotification } from "@/lib/calc";

export default function Dashboard() {
  const { greenhouses, notifications, loading } = useData();
  const { t } = usePrefs();
  const { user } = useAuth();

  const allBeds = useMemo(
    () => greenhouses.flatMap((g) => g.beds.map((b) => ({ ...b, _gh: g }))),
    [greenhouses]
  );

  const liveAlerts = useMemo(() => aiAlerts(greenhouses, t), [greenhouses, t]);
  const persisted = useMemo(
    () =>
      (notifications ?? [])
        .map((n) => {
          const params = { ...(n.params || {}) };
          // cron сохраняет crop как ключ культуры — переводим в подпись на языке интерфейса
          if (params.crop && t.crops[params.crop]) params.crop = t.crops[params.crop];
          return { level: n.level, text: renderNotification(n.code, params, t) };
        })
        .filter((a) => a.text),
    [notifications, t]
  );
  const alerts = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const a of [...persisted, ...liveAlerts]) {
      if (!a.text || seen.has(a.text)) continue;
      seen.add(a.text);
      out.push(a);
      if (out.length >= 5) break;
    }
    return out;
  }, [persisted, liveAlerts]);

  if (loading) return <Spinner />;

  const meta = user?.user_metadata ?? {};
  const name = meta.first_name || (user?.email?.split("@")[0] ?? "");

  const totalArea = greenhouses.reduce((s, g) => s + g.beds.reduce((a, b) => a + b.cells.length, 0), 0);
  const activeCrops = allBeds.length;
  const avgReady = allBeds.length
    ? Math.round((allBeds.reduce((s, b) => s + (bedStatus(b, b._gh)?.progress ?? 0), 0) / allBeds.length) * 100)
    : 0;
  const estRevenue = allBeds.reduce((s, b) => s + bedProfit(b).revenue, 0);

  // Уровень алерта в монохром плюс акцент: critical -> ink, warn -> muted, good -> accent.
  const levelColor = (lvl) =>
    lvl === "critical" ? "var(--ink)" : lvl === "warn" ? "var(--muted)" : "var(--accent)";

  return (
    <div className="fadein">
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
        {t.dash.hi}, {name}
      </h1>
      <p className="muted" style={{ marginTop: 6, marginBottom: 24 }}>{t.dash.sub}</p>

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <Stat label={t.dash.area} value={`${totalArea} м²`} icon={<Ruler size={18} strokeWidth={1.75} />} />
        <Stat label={t.dash.crops} value={activeCrops} icon={<Sprout size={18} strokeWidth={1.75} />} />
        <Stat label={t.dash.ready2} value={`${avgReady}%`} accent icon={<Leaf size={18} strokeWidth={1.75} />} />
        <Stat label={t.dash.revenue} value={`${fmt(estRevenue)} ₸`} accent icon={<TrendingUp size={18} strokeWidth={1.75} />} />
      </div>

      {allBeds.length === 0 ? (
        <div className="card-soft" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
          {t.dash.empty}
        </div>
      ) : (
        <div className="dash-cols">
          {/* Созревание */}
          <div className="card-soft" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{t.dash.ripening}</h3>
              <span className="chip chip-accent">
                <span className="chip-dot" /> live
              </span>
            </div>
            <p className="muted" style={{ fontSize: 13, marginTop: 2, marginBottom: 22 }}>{t.dash.ripeningSub}</p>

            <div style={{ display: "grid", gap: 18 }}>
              {allBeds.slice(0, 7).map((b) => {
                const st = bedStatus(b, b._gh);
                const pct = Math.round((st?.progress ?? 0) * 100);
                return (
                  <div key={b.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "var(--radius-sm)", background: b.color }} />
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{t.crops[b.crop_type]}</span>
                        <span className="muted" style={{ fontSize: 12 }}>· {b._gh.name}</span>
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: st?.stalled ? "var(--ink)" : pct >= 100 ? "var(--accent-strong)" : "var(--ink-2)",
                        }}
                      >
                        {st?.stalled ? t.dash.stalled : pct >= 100 ? t.dash.ready : `${st.daysLeft} ${t.dash.daysLeft}`}
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%`, background: st?.stalled ? "var(--muted)" : "var(--accent)" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Arva AI */}
          <div className="card-soft" style={{ padding: 24, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <div className="sphere" />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Sparkles size={16} strokeWidth={1.75} color="var(--accent)" />
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{t.dash.ai}</h3>
                </div>
                <p className="muted" style={{ fontSize: 12, margin: "3px 0 0" }}>{t.dash.aiSub}</p>
              </div>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {alerts.map((a, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--line)",
                    borderLeft: `3px solid ${levelColor(a.level)}`,
                    borderRadius: "var(--radius)",
                    padding: "12px 14px",
                  }}
                >
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--ink-2)" }}>{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
