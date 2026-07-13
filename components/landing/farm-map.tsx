"use client";

// Интерактивная карта теплиц и полей — центр лендинга. Инлайновый SVG: каждый
// участок кликабелен и доступен с клавиатуры. Наведение — подсказка; клик —
// приближение к участку, затемнение остальных и панель справа. «Режим
// планирования»: клик по свободному участку назначает культуру вживую.

import { useEffect, useMemo, useState } from "react";
import { Sprout, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/dictionaries";
import { useFarm } from "@/components/landing/farm-provider";
import { CROPS } from "@/lib/crops";
import {
  STATUSES,
  VIEW_W,
  VIEW_H,
  localeMap,
  cropName,
  parcelCenter,
  fmtArea,
  fmtDate,
  type Parcel,
  type ParcelStatus,
} from "@/lib/farm-data";

const ZOOM = 1.3;
const FOCUS_X = 400; // цель приближения левее центра — панель занимает правую часть
const FOCUS_Y = 300;

export function FarmMap() {
  const { t, locale } = useI18n();
  const { parcels, assignCrop, cropFilter, setCropFilter } = useFarm();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | ParcelStatus>("all");
  const [planMode, setPlanMode] = useState(false);

  const intlLocale = localeMap[locale] ?? "ru-RU";
  const selected = useMemo(() => parcels.find((p) => p.id === selectedId) ?? null, [parcels, selectedId]);

  // Esc закрывает панель.
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  // Подсветка по культуре (клик в полосе культур) закрывает открытую панель.
  useEffect(() => {
    if (cropFilter) setSelectedId(null);
  }, [cropFilter]);

  const parcelCrop = (p: Parcel): string => {
    if (p.cropId) return cropName(p.cropId, locale);
    if (p.plannedCropId) return "→ " + cropName(p.plannedCropId, locale);
    return t("map.status.empty");
  };

  const isDimmed = (p: Parcel): boolean => {
    if (selectedId) return p.id !== selectedId;
    if (statusFilter !== "all" && p.status !== statusFilter) return true;
    if (cropFilter && p.cropId !== cropFilter) return true;
    return false;
  };

  const handleSelect = (p: Parcel) => setSelectedId((prev) => (prev === p.id ? null : p.id));

  const pickStatus = (s: "all" | ParcelStatus) => {
    setStatusFilter(s);
    setSelectedId(null);
    setCropFilter(null);
  };

  const zoomStyle: React.CSSProperties = {};
  if (selected) {
    const { cx, cy } = parcelCenter(selected);
    zoomStyle.transform = `translate(${FOCUS_X - ZOOM * cx}px, ${FOCUS_Y - ZOOM * cy}px) scale(${ZOOM})`;
  }

  const hovered = !selectedId && hoverId ? (parcels.find((p) => p.id === hoverId) ?? null) : null;

  return (
    <section id="map" className="mx-auto max-w-6xl px-5 pt-20 pb-12">
      <div className="max-w-2xl">
        <p className="font-display text-sm font-bold tracking-wide text-brand uppercase">{t("map.eyebrow")}</p>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {t("map.title")}
        </h2>
        <p className="mt-3 text-lg text-muted">{t("map.sub")}</p>
      </div>

      <div className="map-wrap">
        {/* фильтры по статусу + режим планирования */}
        <div className="map-toolbar">
          <div className="map-chips">
            <button
              type="button"
              className={`map-chip ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => pickStatus("all")}
            >
              {t("map.all")}
            </button>
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                className={`map-chip ${statusFilter === s ? "active" : ""}`}
                onClick={() => pickStatus(s)}
              >
                <span className="dot" style={{ background: `var(--map-${s})` }} />
                {t(`map.status.${s}`)}
              </button>
            ))}
          </div>

          <label className={`map-planswitch ${planMode ? "on" : ""}`}>
            <input
              type="checkbox"
              checked={planMode}
              onChange={(e) => setPlanMode(e.target.checked)}
              className="pointer-events-none absolute opacity-0"
            />
            <span className="map-switch" aria-hidden="true" />
            {t("map.planMode")}
          </label>
        </div>

        {planMode && (
          <p className="map-choose-hint" style={{ marginTop: -4, marginBottom: 12 }}>
            {t("map.planHint")}
          </p>
        )}

        <div className={`map-stage ${selectedId ? "has-sel" : ""}`}>
          <div className="map-canvas">
            <svg className="map-svg" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="group" aria-label={t("map.title")}>
              <g className="map-zoom" style={zoomStyle}>
                {parcels.map((p, i) => {
                  const { cx, cy } = parcelCenter(p);
                  const statusClass = p.planned ? "planned" : p.status;
                  const isSel = p.id === selectedId;
                  const isGh = p.type === "greenhouse";
                  const nameSize = isGh ? 13 : 15;
                  const cropSize = isGh ? 10.5 : 12;
                  const label = `${t(`map.names.${p.id}`)}, ${t(`map.type.${p.type}`)}, ${t(`map.status.${p.status}`)}`;
                  return (
                    <g
                      key={p.id}
                      className={`parcel ${statusClass} ${isSel ? "selected" : ""} ${isDimmed(p) ? "dim" : ""}`}
                      style={{ animationDelay: `${i * 55}ms` }}
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
                      <rect className="parcel-body" x={p.x} y={p.y} width={p.w} height={p.h} rx={p.rx} />
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
                          <circle className="ready-pulse" cx={p.x + p.w - 18} cy={p.y + 18} r={5} fill="var(--map-ready)" />
                          <circle cx={p.x + p.w - 18} cy={p.y + 18} r={4} fill="var(--map-ready)" />
                        </>
                      )}
                      <text className="p-name" x={cx} y={cy - 5} textAnchor="middle" style={{ fontSize: nameSize }}>
                        {t(`map.names.${p.id}`)}
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
                    <b>{t(`map.names.${hovered.id}`)}</b>
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
                t={t}
                locale={locale}
                intlLocale={intlLocale}
                planMode={planMode}
                onAssign={(cropId) => assignCrop(selected.id, cropId)}
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
              {t(`map.status.${s}`)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function DetailPanel({
  parcel: p,
  t,
  locale,
  intlLocale,
  planMode,
  onAssign,
  onClose,
}: {
  parcel: Parcel;
  t: (k: string) => string;
  locale: Locale;
  intlLocale: string;
  planMode: boolean;
  onAssign: (cropId: string) => void;
  onClose: () => void;
}) {
  const isEmpty = p.status === "empty";
  const badgeColor = p.planned ? "var(--color-brand)" : `var(--map-${p.status})`;
  const badgeBg = p.planned ? "var(--color-brand-50)" : `var(--map-${p.status}-weak)`;

  const areaFmt = fmtArea(p.areaM2, intlLocale, { m2: t("map.units.m2"), ha: t("map.units.ha") });
  const planted = fmtDate(p.plantedOn, intlLocale);
  const harvest = fmtDate(p.harvestOn, intlLocale);

  const showChooser = planMode && isEmpty;
  const cropLbl = p.cropId ? t("map.panel.crop") : t("map.panel.planned");
  const cropVal = p.cropId
    ? cropName(p.cropId, locale)
    : p.plannedCropId
      ? cropName(p.plannedCropId, locale)
      : t("map.panel.free");
  const noteKey = `map.notes.${p.id}`;
  const noteText = t(noteKey);

  return (
    <>
      <div className="map-panel-head">
        <div>
          <div className="map-panel-type">{t(`map.type.${p.type}`)}</div>
          <h3 className="font-display">{t(`map.names.${p.id}`)}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] text-muted transition-colors hover:bg-paper-soft hover:text-ink"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>

      <span className="map-badge" style={{ color: badgeColor, background: badgeBg, borderColor: badgeColor }}>
        <span className="dot" />
        {p.planned ? t("map.panel.planned") : t(`map.status.${p.status}`)}
      </span>

      <div className="map-crophero">
        <span className="ic">
          <Sprout className="h-5 w-5" style={{ color: "var(--color-brand-dark)" }} />
        </span>
        <div>
          <div className="lbl">{cropLbl}</div>
          <div className="val">{cropVal}</div>
        </div>
      </div>

      {showChooser ? (
        <>
          <div className="map-choose-hint">{t("map.choose")}</div>
          <div className="map-choose">
            {CROPS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`map-choose-chip ${p.plannedCropId === c.id ? "active" : ""}`}
                onClick={() => onAssign(c.id)}
              >
                {cropName(c.id, locale)}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          {planted && (
            <div className="map-kv">
              <span className="k">{t("map.panel.plantedOn")}</span>
              <span className="v">{planted}</span>
            </div>
          )}
          {harvest && (
            <div className="map-kv">
              <span className="k">{t("map.panel.harvestOn")}</span>
              <span className="v">{harvest}</span>
            </div>
          )}
          <div className="map-kv">
            <span className="k">{t("map.panel.area")}</span>
            <span className="v">
              {areaFmt.value} {areaFmt.unit}
            </span>
          </div>
          {noteText !== noteKey && <p className="map-note">{noteText}</p>}
        </>
      )}
    </>
  );
}
