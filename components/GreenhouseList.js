"use client";

import { useState } from "react";
import { Plus, ArrowLeft, Sprout, ChevronRight, Ruler, Thermometer, Droplets, X } from "lucide-react";
import { useData } from "@/components/data-provider";
import { usePrefs } from "@/components/providers";
import { Spinner } from "@/components/ui";
import GreenhouseGrid from "@/components/GreenhouseGrid";

export default function GreenhouseList() {
  const { greenhouses, loading } = useData();
  const { t } = usePrefs();
  const [openId, setOpenId] = useState(null);
  const [creating, setCreating] = useState(false);

  if (loading) return <Spinner />;

  const gh = greenhouses.find((g) => g.id === openId);

  if (gh) {
    return (
      <div className="fadein">
        <button className="btn btn-secondary" onClick={() => setOpenId(null)} style={{ marginBottom: 18 }}>
          <ArrowLeft size={16} strokeWidth={1.75} /> {t.gh.back}
        </button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>{gh.name}</h1>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className={`chip ${gh.hydro ? "chip-accent" : "chip-neutral"}`}>
              <Droplets size={13} strokeWidth={1.75} /> {gh.hydro ? t.gh.hydro : t.gh.soil}
            </span>
            <span className="chip chip-neutral">
              <Thermometer size={13} strokeWidth={1.75} /> {gh.temp}°C
            </span>
            <span className="chip chip-neutral">
              <Droplets size={13} strokeWidth={1.75} /> {gh.humidity}%
            </span>
          </div>
        </div>
        <p className="muted" style={{ marginTop: 0, marginBottom: 22, fontSize: 14 }}>
          {gh.length} × {gh.width} м · {gh.length * gh.width} м²
        </p>

        <GreenhouseGrid gh={gh} />
      </div>
    );
  }

  return (
    <div className="fadein">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>{t.gh.title}</h1>
        <button className="btn btn-accent" onClick={() => setCreating(true)}>
          <Plus size={18} strokeWidth={1.75} /> {t.gh.add}
        </button>
      </div>

      {greenhouses.length === 0 ? (
        <div className="card-soft" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>{t.dash.empty}</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {greenhouses.map((g) => {
            const used = g.beds.reduce((a, b) => a + b.cells.length, 0);
            const total = g.length * g.width;
            const owner = {};
            g.beds.forEach((b) => b.cells.forEach((c) => (owner[c] = b.color)));
            return (
              <button
                key={g.id}
                onClick={() => setOpenId(g.id)}
                className="card-soft card-hover"
                style={{ padding: 20, textAlign: "left", cursor: "pointer", display: "block" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ width: 42, height: 42, borderRadius: "var(--radius)", background: "var(--accent-weak)", display: "grid", placeItems: "center" }}>
                    <Sprout size={22} strokeWidth={1.75} color="var(--accent-strong)" />
                  </div>
                  <ChevronRight size={18} strokeWidth={1.75} color="var(--faint)" />
                </div>
                <h3 style={{ margin: "16px 0 4px", fontSize: 18, fontWeight: 600 }}>{g.name}</h3>
                <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                  {g.length} × {g.width} м · {g.beds.length} {t.gh.beds}
                </p>

                {/* мини-превью сетки */}
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${g.length}, 1fr)`, gap: 2, marginTop: 16, maxWidth: 170 }}>
                  {Array.from({ length: g.width }).map((_, r) =>
                    Array.from({ length: g.length }).map((__, c) => {
                      const color = owner[`${r}-${c}`];
                      return <span key={`${r}-${c}`} style={{ paddingTop: "100%", borderRadius: "var(--radius-sm)", background: color || "var(--line)" }} />;
                    })
                  )}
                </div>

                <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                  <span className="chip chip-neutral">
                    <Ruler size={12} strokeWidth={1.75} /> {used}/{total} м²
                  </span>
                  <span className="chip chip-neutral">
                    <Thermometer size={12} strokeWidth={1.75} /> {g.temp}°C
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {creating && <CreateGreenhouse onClose={() => setCreating(false)} onCreated={(id) => setOpenId(id)} />}
    </div>
  );
}

function CreateGreenhouse({ onClose, onCreated }) {
  const { t } = usePrefs();
  const { createGreenhouse } = useData();
  const [f, setF] = useState({ name: "", length: 8, width: 6, hydro: false, temp: 24, humidity: 70 });
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!f.name) return;
    setBusy(true);
    const g = await createGreenhouse({
      name: f.name,
      length: Math.max(1, Math.min(100, Number(f.length))),
      width: Math.max(1, Math.min(100, Number(f.width))),
      hydro: f.hydro,
      temp: Number(f.temp),
      humidity: Number(f.humidity),
    });
    setBusy(false);
    onClose();
    if (g) onCreated(g.id);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.35)", zIndex: 40 }} />
      <div
        className="fadein"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 50,
          width: 420,
          maxWidth: "92vw",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius)",
          padding: 26,
          boxShadow: "0 30px 80px rgba(10,10,10,0.18)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{t.gh.add}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <div>
          <label className="field-label">{t.gh.name}</label>
          <input className="inp" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={{ marginBottom: 14 }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label className="field-label">{t.gh.length}</label>
              <input className="inp" type="number" value={f.length} onChange={(e) => setF({ ...f, length: Number(e.target.value) })} />
            </div>
            <div>
              <label className="field-label">{t.gh.width}</label>
              <input className="inp" type="number" value={f.width} onChange={(e) => setF({ ...f, width: Number(e.target.value) })} />
            </div>
          </div>

          <label className="field-label">{t.gh.type}</label>
          <div style={{ display: "flex", gap: 10, margin: "0 0 14px" }}>
            {[false, true].map((h) => (
              <button
                key={String(h)}
                onClick={() => setF({ ...f, hydro: h })}
                className={`btn ${f.hydro === h ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1 }}
              >
                {h ? t.gh.hydro : t.gh.soil}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
            <div>
              <label className="field-label">{t.gh.temp}</label>
              <input className="inp" type="number" value={f.temp} onChange={(e) => setF({ ...f, temp: Number(e.target.value) })} />
            </div>
            <div>
              <label className="field-label">{t.gh.hum}</label>
              <input className="inp" type="number" value={f.humidity} onChange={(e) => setF({ ...f, humidity: Number(e.target.value) })} />
            </div>
          </div>

          <button className="btn btn-accent btn-block btn-lg" onClick={create} disabled={busy}>
            {busy ? "..." : t.gh.create}
          </button>
        </div>
      </div>
    </>
  );
}
