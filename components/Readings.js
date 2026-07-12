"use client";

import { useState } from "react";
import { Thermometer, Droplets, Check, Save } from "lucide-react";
import { useData } from "@/components/data-provider";
import { usePrefs } from "@/components/providers";
import { Spinner } from "@/components/ui";
import { bedStatus } from "@/lib/calc";

export default function Readings() {
  const { greenhouses, loading } = useData();
  const { t } = usePrefs();

  if (loading) return <Spinner />;

  return (
    <div className="fadein">
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>{t.readings.title}</h1>
      <p className="muted" style={{ marginTop: 6, marginBottom: 6 }}>{t.readings.sub}</p>
      <p className="muted" style={{ fontSize: 12.5, marginTop: 0, marginBottom: 22 }}>{t.readings.enterHint}</p>

      {greenhouses.length === 0 ? (
        <div className="card-soft" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>{t.readings.noGreenhouses}</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {greenhouses.map((g) => (
            <ReadingCard key={g.id} gh={g} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReadingCard({ gh }) {
  const { t } = usePrefs();
  const { addReading } = useData();
  const [temp, setTemp] = useState(gh.temp);
  const [hum, setHum] = useState(gh.humidity);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    await addReading(gh.id, Number(temp), Number(hum));
    setBusy(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Мини-сводка: как текущий микроклимат влияет на созревание грядок.
  const preview = gh.beds
    .filter((b) => b.plant_date)
    .slice(0, 3)
    .map((b) => {
      const st = bedStatus(b, { ...gh, temp: Number(temp), humidity: Number(hum) });
      return { crop: t.crops[b.crop_type], color: b.color, st };
    });

  return (
    <div className="card-soft" style={{ padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{gh.name}</h3>
        <span className={`chip ${gh.hydro ? "chip-accent" : "chip-neutral"}`}>{gh.hydro ? t.gh.hydro : t.gh.soil}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Thermometer size={14} strokeWidth={1.75} /> {t.readings.temp}
          </label>
          <input className="inp" type="number" value={temp} onChange={(e) => setTemp(e.target.value)} />
        </div>
        <div>
          <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Droplets size={14} strokeWidth={1.75} /> {t.readings.hum}
          </label>
          <input className="inp" type="number" value={hum} onChange={(e) => setHum(e.target.value)} />
        </div>
      </div>

      {preview.length > 0 && (
        <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
          {preview.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12.5, color: "var(--ink-2)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 9, height: 9, borderRadius: "var(--radius-sm)", background: p.color }} /> {p.crop}
              </span>
              <span style={{ fontWeight: 600, color: p.st?.stalled ? "var(--ink)" : "var(--accent-strong)" }}>
                {p.st?.stalled ? t.dash.stalled : p.st?.ready ? t.dash.ready : `${p.st.daysLeft} ${t.dash.daysLeft}`}
              </span>
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-accent btn-block" onClick={save} disabled={busy}>
        {saved ? (
          <>
            <Check size={16} strokeWidth={2} /> {t.readings.saved}
          </>
        ) : (
          <>
            <Save size={16} strokeWidth={1.75} /> {t.readings.save}
          </>
        )}
      </button>
    </div>
  );
}
