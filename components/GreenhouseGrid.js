"use client";

import { useEffect, useRef, useState } from "react";
import { LayoutGrid, Trash2, X } from "lucide-react";
import { useData } from "@/components/data-provider";
import { usePrefs } from "@/components/providers";
import { CROP_DB, CROP_KEYS } from "@/lib/crops";
import { fmt } from "@/lib/calc";

const EMPTY_CELL = "#efefef"; // нейтральная пустая клетка (монохром)

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function GreenhouseGrid({ gh }) {
  const { t } = usePrefs();
  const { createBed, updateBed, deleteBed } = useData();
  const [sel, setSel] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const dragging = useRef(false);
  const startRC = useRef(null);
  const moved = useRef(false);

  const cellSize = Math.max(20, Math.min(46, Math.floor(560 / Math.max(gh.length, gh.width))));

  // карта клетка -> грядка
  const cellOwner = {};
  gh.beds.forEach((b) => b.cells.forEach((c) => (cellOwner[c] = b.id)));
  const bedById = (id) => gh.beds.find((b) => b.id === id);

  const start = (r, c) => {
    dragging.current = true;
    startRC.current = { r, c };
    moved.current = false;
    setSel({ sr: r, sc: c, er: r, ec: c });
  };
  const over = (r, c) => {
    if (!dragging.current) return;
    if (startRC.current && (startRC.current.r !== r || startRC.current.c !== c)) moved.current = true;
    setSel((s) => (s ? { ...s, er: r, ec: c } : s));
  };

  useEffect(() => {
    const up = () => {
      if (dragging.current && sel) {
        dragging.current = false;
        const cells = rectCells(sel);
        // Одиночный клик по занятой клетке — открыть грядку (что и когда посажено).
        if (!moved.current && cells.length === 1) {
          const ownerId = cellOwner[cells[0]];
          const bed = ownerId ? bedById(ownerId) : null;
          if (bed) {
            setDrawer({
              mode: "edit",
              bed,
              cells: bed.cells,
              cropType: bed.crop_type,
              plantsCount: bed.plants_count,
              plantDate: bed.plant_date || today(),
            });
            setSel(null);
            return;
          }
        }
        // Иначе — новая грядка на выделенной территории.
        setDrawer({ mode: "new", cells, cropType: "cherry", plantsCount: 100, plantDate: today() });
      }
      dragging.current = false;
    };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, gh]);

  function rectCells(s) {
    const r0 = Math.min(s.sr, s.er),
      r1 = Math.max(s.sr, s.er);
    const c0 = Math.min(s.sc, s.ec),
      c1 = Math.max(s.sc, s.ec);
    const out = [];
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) out.push(`${r}-${c}`);
    return out;
  }

  const inSel = (r, c) => {
    if (!sel) return false;
    const r0 = Math.min(sel.sr, sel.er),
      r1 = Math.max(sel.sr, sel.er);
    const c0 = Math.min(sel.sc, sel.ec),
      c1 = Math.max(sel.sc, sel.ec);
    return r >= r0 && r <= r1 && c >= c0 && c <= c1;
  };

  const bedArea = (id) => gh.beds.find((b) => b.id === id)?.cells.length ?? 0;

  const onSaveNew = async (d) => {
    await createBed(gh.id, {
      crop_type: d.cropType,
      plants_count: Number(d.plantsCount) || 0,
      plant_date: d.plantDate,
      cells: d.cells,
    });
    setDrawer(null);
    setSel(null);
  };
  const onSaveEdit = async (bed, d) => {
    await updateBed(bed.id, {
      crop_type: d.cropType,
      plants_count: Number(d.plantsCount) || 0,
      plant_date: d.plantDate,
    });
    setDrawer(null);
  };
  const onDelete = async (bed) => {
    await deleteBed(bed.id);
    setDrawer(null);
  };

  return (
    <div style={{ display: "flex", gap: 22, alignItems: "flex-start", flexWrap: "wrap" }}>
      {/* сетка */}
      <div className="card-soft" style={{ padding: 22, flex: "1 1 420px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            <LayoutGrid size={18} strokeWidth={1.75} /> {t.gh.grid}
          </h3>
          <span className="muted" style={{ fontSize: 12 }}>
            {gh.length} × {gh.width} · {gh.length * gh.width} {t.gh.cells}
          </span>
        </div>
        <p className="muted" style={{ fontSize: 12.5, margin: "4px 0 16px" }}>{t.gh.gridHint}</p>

        <div style={{ overflow: "auto", paddingBottom: 4 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gh.length}, ${cellSize}px)`,
              gap: 3,
              width: "fit-content",
              userSelect: "none",
            }}
          >
            {Array.from({ length: gh.width }).map((_, r) =>
              Array.from({ length: gh.length }).map((__, c) => {
                const key = `${r}-${c}`;
                const bId = cellOwner[key];
                const bed = bId ? bedById(bId) : null;
                const selected = inSel(r, c);
                let bg = EMPTY_CELL;
                if (bed) bg = bed.color;
                if (selected) bg = bed ? bed.color : "rgba(22,163,74,0.30)";
                return (
                  <div
                    key={key}
                    className="gridcell"
                    onMouseDown={() => start(r, c)}
                    onMouseEnter={() => over(r, c)}
                    title={bed ? `${t.crops[bed.crop_type]}${bed.plant_date ? " · " + bed.plant_date : ""}` : ""}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      borderRadius: "var(--radius)",
                      background: bg,
                      boxShadow: selected
                        ? "inset 0 0 0 2px var(--ink)"
                        : bed
                        ? "inset 0 0 0 1px rgba(10,10,10,0.08)"
                        : "inset 0 0 0 1px rgba(10,10,10,0.05)",
                    }}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* легенда с подписями культур */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 16 }}>
          <span className="muted" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5 }}>
            <span style={{ width: 12, height: 12, borderRadius: "var(--radius-sm)", background: EMPTY_CELL, boxShadow: "inset 0 0 0 1px rgba(10,10,10,0.08)" }} />{" "}
            {t.gh.free}
          </span>
          {gh.beds.map((b) => (
            <span key={b.id} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--ink-2)" }}>
              <span style={{ width: 12, height: 12, borderRadius: "var(--radius-sm)", background: b.color }} /> {t.crops[b.crop_type]}
            </span>
          ))}
        </div>
      </div>

      {/* таблица грядок: культура | площадь | растений */}
      <div className="card-soft" style={{ padding: 22, flex: "1 1 320px", minWidth: 300 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 17, fontWeight: 600 }}>{t.gh.table}</h3>
        {gh.beds.length === 0 ? (
          <p className="muted" style={{ fontSize: 14 }}>{t.gh.noBeds}</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.8fr 1fr", fontSize: 13 }}>
            <div className="muted" style={{ fontWeight: 500, paddingBottom: 8 }}>{t.gh.culture}</div>
            <div className="muted" style={{ fontWeight: 500, paddingBottom: 8, textAlign: "right" }}>{t.gh.areaM2}</div>
            <div className="muted" style={{ fontWeight: 500, paddingBottom: 8, textAlign: "right" }}>{t.gh.plants}</div>
            {gh.beds.map((b) => (
              <GridRow
                key={b.id}
                bed={b}
                area={bedArea(b.id)}
                label={t.crops[b.crop_type]}
                onEdit={() =>
                  setDrawer({
                    mode: "edit",
                    bed: b,
                    cells: b.cells,
                    cropType: b.crop_type,
                    plantsCount: b.plants_count,
                    plantDate: b.plant_date || today(),
                  })
                }
              />
            ))}
          </div>
        )}
      </div>

      {drawer && (
        <BedDrawer
          data={drawer}
          onClose={() => {
            setDrawer(null);
            setSel(null);
          }}
          onSaveNew={onSaveNew}
          onSaveEdit={onSaveEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}

function GridRow({ bed, area, label, onEdit }) {
  const border = "1px solid var(--line)";
  return (
    <>
      <div onClick={onEdit} style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 0", borderTop: border, cursor: "pointer" }}>
        <span style={{ width: 12, height: 12, borderRadius: "var(--radius-sm)", background: bed.color }} />
        <span style={{ fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ padding: "11px 0", borderTop: border, textAlign: "right", color: "var(--ink-2)" }}>{area}</div>
      <div style={{ padding: "11px 0", borderTop: border, textAlign: "right", color: "var(--ink-2)" }}>{fmt(bed.plants_count)}</div>
    </>
  );
}

function BedDrawer({ data, onClose, onSaveNew, onSaveEdit, onDelete }) {
  const { t } = usePrefs();
  const [cropType, setCropType] = useState(data.cropType);
  const [plantsCount, setPlantsCount] = useState(data.plantsCount);
  const [plantDate, setPlantDate] = useState(data.plantDate);
  const isNew = data.mode === "new";
  const ref = CROP_DB[cropType];

  const save = () => {
    const d = { ...data, cropType, plantsCount: Number(plantsCount) || 0, plantDate };
    if (isNew) onSaveNew(d);
    else if (data.bed) onSaveEdit(data.bed, d);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.35)", zIndex: 40 }} />
      <div
        className="drawer"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: 380,
          maxWidth: "90vw",
          zIndex: 50,
          background: "var(--surface)",
          borderLeft: "1px solid var(--line)",
          boxShadow: "-24px 0 60px rgba(10,10,10,0.12)",
          padding: 26,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ margin: 0, fontSize: 19, fontWeight: 600 }}>{isNew ? t.gh.assign : t.gh.editBed}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <label className="field-label">{t.gh.cropType}</label>
        <select className="inp" value={cropType} onChange={(e) => setCropType(e.target.value)} style={{ marginBottom: 16 }}>
          {CROP_KEYS.map((k) => (
            <option key={k} value={k}>
              {t.crops[k]}
            </option>
          ))}
        </select>

        <label className="field-label">{t.gh.plantsCount}</label>
        <input className="inp" type="number" value={plantsCount} onChange={(e) => setPlantsCount(e.target.value)} style={{ marginBottom: 16 }} />

        <label className="field-label">{t.gh.plantDate}</label>
        <input className="inp" type="date" value={plantDate} onChange={(e) => setPlantDate(e.target.value)} style={{ marginBottom: 20 }} />

        <div
          style={{
            background: "var(--accent-weak)",
            border: "1px solid var(--line)",
            borderLeft: "3px solid var(--accent)",
            borderRadius: "var(--radius)",
            padding: 14,
            marginBottom: "auto",
          }}
        >
          <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>
            {t.gh.ref} · {t.crops[cropType]}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink-2)" }}>
            {ref.fruitsPerPlant} {t.gh.perPlant} · {ref.fruitWeight} {t.gh.kg} · {ref.daysToMature} {t.gh.toMature}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button className="btn btn-accent" style={{ flex: 1 }} onClick={save}>
            {t.gh.save}
          </button>
          {!isNew && data.bed && (
            <button className="btn btn-secondary btn-icon" onClick={() => onDelete(data.bed)} title={t.gh.save}>
              <Trash2 size={16} strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
