"use client";

import { useMemo } from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { useData } from "@/components/data-provider";
import { usePrefs } from "@/components/providers";
import { Spinner } from "@/components/ui";
import { bedProfit, fmt } from "@/lib/calc";

export default function Expenses() {
  const { greenhouses, loading, updateBed } = useData();
  const { t } = usePrefs();

  const allBeds = useMemo(
    () => greenhouses.flatMap((g) => g.beds.map((b) => ({ ...b, _gh: g }))),
    [greenhouses]
  );

  if (loading) return <Spinner />;

  const totals = allBeds.reduce(
    (acc, b) => {
      const p = bedProfit(b);
      acc.revenue += p.revenue;
      acc.costs += Number(b.costs) || 0;
      acc.profit += p.profit;
      return acc;
    },
    { revenue: 0, costs: 0, profit: 0 }
  );

  const positive = totals.profit >= 0;

  return (
    <div className="fadein">
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>{t.exp.title}</h1>
      <p className="muted" style={{ marginTop: 6, marginBottom: 22 }}>{t.exp.sub}</p>

      {allBeds.length === 0 ? (
        <div className="card-soft" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>{t.exp.empty}</div>
      ) : (
        <>
          {/* итог по хозяйству */}
          <div className="card-soft" style={{ padding: 24, marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <Wallet size={18} strokeWidth={1.75} color="var(--accent)" />
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{t.exp.total}</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
              <div>
                <div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>{t.exp.totalRevenue}</div>
                <div style={{ fontSize: 26, fontWeight: 700 }}>{fmt(totals.revenue)} ₸</div>
              </div>
              <div>
                <div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>{t.exp.totalCosts}</div>
                <div style={{ fontSize: 26, fontWeight: 700 }}>{fmt(totals.costs)} ₸</div>
              </div>
              <div>
                <div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>{t.exp.totalProfit}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: positive ? "var(--accent-strong)" : "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
                  {positive ? <TrendingUp size={22} strokeWidth={2} /> : <TrendingDown size={22} strokeWidth={2} />}
                  {positive ? "+" : ""}
                  {fmt(totals.profit)} ₸
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{positive ? t.exp.inProfit : t.exp.inLoss}</div>
              </div>
            </div>
          </div>

          <p className="muted" style={{ fontSize: 13, margin: "0 0 12px" }}>{t.exp.hint}</p>

          {/* таблица по грядкам */}
          <div className="card-soft" style={{ padding: 8, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 720 }}>
              <thead>
                <tr style={{ color: "var(--muted)", textAlign: "left" }}>
                  <th style={th}>{t.exp.bed}</th>
                  <th style={{ ...th, textAlign: "right" }}>{t.exp.plants}</th>
                  <th style={{ ...th, textAlign: "right" }}>{t.exp.yieldKg}</th>
                  <th style={{ ...th, textAlign: "right" }}>{t.exp.price}</th>
                  <th style={{ ...th, textAlign: "right" }}>{t.exp.costs}</th>
                  <th style={{ ...th, textAlign: "right" }}>{t.exp.revenue}</th>
                  <th style={{ ...th, textAlign: "right" }}>{t.exp.profit}</th>
                </tr>
              </thead>
              <tbody>
                {allBeds.map((b) => {
                  const p = bedProfit(b);
                  const pos = p.profit >= 0;
                  return (
                    <tr key={b.id} style={{ borderTop: "1px solid var(--line)" }}>
                      <td style={td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <span style={{ width: 11, height: 11, borderRadius: "var(--radius-sm)", background: b.color }} />
                          <div>
                            <div style={{ fontWeight: 500 }}>{t.crops[b.crop_type]}</div>
                            <div className="muted" style={{ fontSize: 11.5 }}>{b._gh.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...td, textAlign: "right", color: "var(--ink-2)" }}>{fmt(b.plants_count)}</td>
                      <td style={{ ...td, textAlign: "right", color: "var(--ink-2)" }}>{fmt(p.yieldKg)}</td>
                      <td style={{ ...td, textAlign: "right" }}>
                        <input type="number" defaultValue={b.price_per_kg} onBlur={(e) => updateBed(b.id, { price_per_kg: Number(e.target.value) || 0 })} style={numInp} />
                      </td>
                      <td style={{ ...td, textAlign: "right" }}>
                        <input type="number" defaultValue={b.costs} onBlur={(e) => updateBed(b.id, { costs: Number(e.target.value) || 0 })} style={numInp} />
                      </td>
                      <td style={{ ...td, textAlign: "right", color: "var(--ink)" }}>{fmt(p.revenue)}</td>
                      <td style={{ ...td, textAlign: "right", fontWeight: 700, color: pos ? "var(--accent-strong)" : "var(--ink)" }}>
                        {pos ? "+" : ""}
                        {fmt(p.profit)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

const th = { padding: "12px 14px", fontWeight: 500 };
const td = { padding: "12px 14px" };
const numInp = {
  width: 96,
  textAlign: "right",
  fontFamily: "inherit",
  fontSize: 13.5,
  border: "1px solid var(--line-strong)",
  borderRadius: "var(--radius)",
  padding: "7px 10px",
  outline: "none",
  background: "var(--surface)",
  color: "inherit",
};
