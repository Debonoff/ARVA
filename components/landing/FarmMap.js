"use client";

// Интерактивная карта теплиц и полей — центр лендинга. Инлайновый SVG: каждый
// участок кликабелен и доступен с клавиатуры. Наведение — подсказка; клик —
// приближение к участку, затемнение остальных и панель с деталями справа.
// «Режим планирования»: клик по свободному участку назначает культуру вживую.

import { useEffect, useMemo, useState } from "react";
import { Sprout, X } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { useLanding } from "@/components/landing/copy";
import { useFarm } from "@/components/landing/FarmProvider";
import { CROP_KEYS } from "@/lib/crops";
import {
  STATUSES,
  VIEW_W,
  VIEW_H,
  localeOf,
  parcelCenter,
  fmtArea,
  fmtDate,
} from "@/components/landing/farmData";

const ZOOM = 1.3;
const FOCUS_X = 400; // цель приближения левее центра — панель занимает правую часть
const FOCUS_Y = 300;

export default function FarmMap() {
  const { t, lang } = usePrefs();
  const c = useLanding();
  const { parcels, assignCrop, cropFilter, setCropFilter } = useFarm();

  const [selectedId, setSelectedId] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [planMode, setPlanMode] = useState(false);

  const locale = localeOf[lang] || "ru-RU";
  const selected = useMemo(() => parcels.find((p) => p.id === selectedId) || null, [parcels, selectedId]);

  // Esc закрывает панель.
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e) => e.key === "Escape" && setSelectedId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  // Подсветка по культуре (клик в полосе культур) закрывает открытую панель,
  // иначе затемнение от выбора перекрыло бы фильтр.
  useEffect(() => {
    if (cropFilter) setSelectedId(null);
  }, [cropFilter]);

  const cropName = (key) => (key ? t.crops[key] || key : null);

  // Название культуры для подписи участка / подсказки.
  const parcelCrop = (p) => {
    if (p.cropKey) return cropName(p.cropKey);
    if (p.plannedCropKey) return "→ " + cropName(p.plannedCropKey);
    return c.map.status.empty;
  };

  const isDimmed = (p) => {
    if (selectedId) return p.id !== selectedId;
    if (statusFilter !== "all" && p.status !== statusFilter) return true;
    if (cropFilter && p.cropKey !== cropFilter) return true;
    return false;
  };

  const handleSelect = (p) => {
    setSelectedId((prev) => (prev === p.id ? null : p.id));
  };

  const pickStatus = (s) => {
    setStatusFilter(s);
    setSelectedId(null);
    setCropFilter(null);
  };

  // Трансформация приближения выбранного участка.
  const zoomStyle = {};
  if (selected) {
    const { cx, cy } = parcelCenter(selected);
    const tx = FOCUS_X - ZOOM * cx;
    const ty = FOCUS_Y - ZOOM * cy;
    zoomStyle.transform = `translate(${tx}px, ${ty}px) scale(${ZOOM})`;
  }

  const hovered = !selectedId && hoverId ? parcels.find((p) => p.id === hoverId) : null;

  return (
    <section id="map" className="lp-section">
      <div className="container">
        <div className="lp-center">
          <div className="lp-eyebrow">{c.map.eyebrow}</div>
          <h2 className="lp-h2">{c.map.title}</h2>
          <p className="lp-sub">{c.map.sub}</p>
        </div>

        <div className="map-wrap">
          {/* фильтры по статусу + переключатель режима планирования */}
          <div className="map-toolbar">
            <div className="map-chips">
              <button
                className={`map-chip ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => pickStatus("all")}
              >
                {c.map.all}
              </button>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  className={`map-chip ${statusFilter === s ? "active" : ""}`}
                  onClick={() => pickStatus(s)}
                >
                  <span className="dot" style={{ background: `var(--map-${s})` }} />
                  {c.map.status[s]}
                </button>
              ))}
            </div>

            <label className={`map-planswitch ${planMode ? "on" : ""}`}>
              <input
                type="checkbox"
                checked={planMode}
                onChange={(e) => setPlanMode(e.target.checked)}
                style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
              />
              <span className="map-switch" aria-hidden="true" />
              {c.map.planMode}
            </label>
          </div>

          {planMode && (
            <p className="map-choose-hint" style={{ marginTop: -4, marginBottom: 12 }}>
              {c.map.planHint}
            </p>
          )}

          <div className={`map-stage ${selectedId ? "has-sel" : ""}`}>
            <div className="map-canvas">
              <svg
                className="map-svg"
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                role="group"
                aria-label={c.map.title}
              >
                <g className="map-zoom" style={zoomStyle}>
                  {parcels.map((p, i) => {
                    const { cx, cy } = parcelCenter(p);
                    const statusClass = p.planned ? "planned" : p.status;
                    const dim = isDimmed(p);
                    const isSel = p.id === selectedId;
                    const isGh = p.type === "greenhouse";
                    const nameSize = isGh ? 13 : 15;
                    const cropSize = isGh ? 10.5 : 12;
                    const label = `${c.map.names[p.id]}, ${c.map.type[p.type]}, ${c.map.status[p.status]}`;
                    return (
                      <g
                        key={p.id}
                        className={`parcel ${statusClass} ${isSel ? "selected" : ""} ${dim ? "dim" : ""}`}
                        style={{ "--i": i }}
                        role="button"
                        tabIndex={0}
                        aria-label={label}
                        aria-pressed={isSel}
                        onClick={() => handleSelect(p)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelect(p);
                          }
                        }}
                        onMouseEnter={() => setHoverId(p.id)}
                        onMouseLeave={() => setHoverId((h) => (h === p.id ? null : h))}
                      >
                        <rect
                          className="parcel-body"
                          x={p.x}
                          y={p.y}
                          width={p.w}
                          height={p.h}
                          rx={p.rx}
                        />
                        {isGh &&
                          [1, 2, 3, 4].map((k) => (
                            <line
                              key={k}
                              className="roof"
                              x1={p.x + (p.w * k) / 5}
                              y1={p.y + 8}
                              x2={p.x + (p.w * k) / 5}
                              y2={p.y + p.h - 8}
                            />
                          ))}

                        {p.status === "ready" && (
                          <>
                            <circle
                              className="ready-pulse"
                              cx={p.x + p.w - 18}
                              cy={p.y + 18}
                              r={5}
                              fill="var(--map-ready)"
                            />
                            <circle cx={p.x + p.w - 18} cy={p.y + 18} r={4} fill="var(--map-ready)" />
                          </>
                        )}

                        <text
                          className="p-name"
                          x={cx}
                          y={cy - 5}
                          textAnchor="middle"
                          style={{ fontSize: nameSize }}
                        >
                          {c.map.names[p.id]}
                        </text>
                        <text
                          className="p-crop"
                          x={cx}
                          y={cy + cropSize + 4}
                          textAnchor="middle"
                          style={{ fontSize: cropSize }}
                        >
                          {parcelCrop(p)}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>

              {hovered &&
                (() => {
                  const { cx, cy } = parcelCenter(hovered);
                  const leftPct = Math.min(92, Math.max(8, (cx / VIEW_W) * 100));
                  const topPct = (cy / VIEW_H) * 100;
                  const below = cy < 150;
                  return (
                    <div
                      className={`map-tip ${below ? "below" : ""}`}
                      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                    >
                      <b>{c.map.names[hovered.id]}</b>
                      <br />
                      <span>{parcelCrop(hovered)}</span>
                    </div>
                  );
                })()}
            </div>

            {/* панель деталей */}
            <aside className={`map-panel ${selected ? "open" : ""}`}>
              {selected && (
                <DetailPanel
                  parcel={selected}
                  c={c}
                  locale={locale}
                  cropName={cropName}
                  planMode={planMode}
                  onAssign={(key) => assignCrop(selected.id, key)}
                  onClose={() => setSelectedId(null)}
                />
              )}
            </aside>
          </div>

          {/* легенда */}
          <div className="map-legend">
            {STATUSES.map((s) => (
              <span className="map-leg-item" key={s}>
                <span
                  className="map-leg-dot"
                  style={{ borderColor: `var(--map-${s})`, background: `var(--map-${s}-weak)` }}
                />
                {c.map.status[s]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailPanel({ parcel: p, c, locale, cropName, planMode, onAssign, onClose }) {
  const isEmpty = p.status === "empty";
  const badgeColor = p.planned ? "var(--accent)" : `var(--map-${p.status})`;
  const badgeBg = p.planned ? "var(--accent-weak)" : `var(--map-${p.status}-weak)`;

  const areaFmt = fmtArea(p.areaM2, locale, c.map.units);
  const planted = fmtDate(p.plantedOn, locale);
  const harvest = fmtDate(p.harvestOn, locale);

  const showChooser = planMode && isEmpty;
  const cropLbl = p.cropKey ? c.map.panel.crop : c.map.panel.planned;
  const cropVal = p.cropKey ? cropName(p.cropKey) : p.plannedCropKey ? cropName(p.plannedCropKey) : c.map.panel.free;

  return (
    <>
      <div className="map-panel-head">
        <div>
          <div className="map-panel-type">{c.map.type[p.type]}</div>
          <h3>{c.map.names[p.id]}</h3>
        </div>
        <button className="btn btn-ghost btn-icon btn-sm map-panel-close" onClick={onClose} aria-label="Close">
          <X size={18} strokeWidth={1.75} />
        </button>
      </div>

      <span className="map-badge" style={{ color: badgeColor, background: badgeBg, borderColor: badgeColor }}>
        <span className="dot" />
        {p.planned ? c.map.panel.planned : c.map.status[p.status]}
      </span>

      <div className="map-crophero">
        <span className="ic">
          <Sprout size={20} strokeWidth={1.75} color="var(--accent-strong)" />
        </span>
        <div>
          <div className="lbl">{cropLbl}</div>
          <div className="val">{cropVal}</div>
        </div>
      </div>

      {showChooser ? (
        <>
          <div className="map-choose-hint">{c.map.choose}</div>
          <div className="map-choose">
            {CROP_KEYS.map((key) => (
              <button
                key={key}
                className={`map-choose-chip ${p.plannedCropKey === key ? "active" : ""}`}
                onClick={() => onAssign(key)}
              >
                {cropName(key)}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          {planted && (
            <div className="map-kv">
              <span className="k">{c.map.panel.plantedOn}</span>
              <span className="v">{planted}</span>
            </div>
          )}
          {harvest && (
            <div className="map-kv">
              <span className="k">{c.map.panel.harvestOn}</span>
              <span className="v">{harvest}</span>
            </div>
          )}
          <div className="map-kv">
            <span className="k">{c.map.panel.area}</span>
            <span className="v">
              {areaFmt.value} {areaFmt.unit}
            </span>
          </div>
          {c.map.notes[p.id] && <p className="map-note">{c.map.notes[p.id]}</p>}
        </>
      )}
    </>
  );
}
