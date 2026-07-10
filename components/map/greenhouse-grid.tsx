"use client";

import { useRef, useState } from "react";
import type { Greenhouse } from "@/lib/store";
import { getCrop } from "@/lib/crops";
import { cn } from "@/lib/utils";

const CELL = 44;

export type Rect = { x: number; y: number; width: number; height: number };

function overlaps(a: Rect, b: Rect) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function GreenhouseGrid({
  greenhouse,
  selectedAreaId,
  onSelectArea,
  onCreateSelection,
}: {
  greenhouse: Greenhouse;
  selectedAreaId: string | null;
  onSelectArea: (id: string | null) => void;
  onCreateSelection: (rect: Rect) => void;
}) {
  const cols = greenhouse.widthM;
  const rows = greenhouse.lengthM;
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{
    start: { c: number; r: number };
    cur: { c: number; r: number };
  } | null>(null);

  function cellFromEvent(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return null;
    const box = el.getBoundingClientRect();
    const c = Math.floor((e.clientX - box.left) / CELL);
    const r = Math.floor((e.clientY - box.top) / CELL);
    if (c < 0 || r < 0 || c >= cols || r >= rows) return null;
    return { c, r };
  }

  const selRect: Rect | null = drag
    ? {
        x: Math.min(drag.start.c, drag.cur.c),
        y: Math.min(drag.start.r, drag.cur.r),
        width: Math.abs(drag.start.c - drag.cur.c) + 1,
        height: Math.abs(drag.start.r - drag.cur.r) + 1,
      }
    : null;

  const selInvalid = selRect ? greenhouse.areas.some((a) => overlaps(selRect, a)) : false;

  function onPointerDown(e: React.PointerEvent) {
    const cell = cellFromEvent(e);
    if (!cell) return;
    const hit = greenhouse.areas.find(
      (a) => cell.c >= a.x && cell.c < a.x + a.width && cell.r >= a.y && cell.r < a.y + a.height,
    );
    if (hit) {
      onSelectArea(hit.id);
      return;
    }
    ref.current?.setPointerCapture(e.pointerId);
    onSelectArea(null);
    setDrag({ start: cell, cur: cell });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const cell = cellFromEvent(e);
    if (cell) setDrag((d) => (d ? { ...d, cur: cell } : d));
  }

  function onPointerUp() {
    if (drag && selRect && !selInvalid) onCreateSelection(selRect);
    setDrag(null);
  }

  return (
    <div className="overflow-auto">
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative touch-none rounded-2xl border border-line bg-white select-none"
        style={{
          width: cols * CELL,
          height: rows * CELL,
          backgroundImage:
            "linear-gradient(#eceee9 1px, transparent 1px), linear-gradient(90deg, #eceee9 1px, transparent 1px)",
          backgroundSize: `${CELL}px ${CELL}px`,
        }}
      >
        {greenhouse.areas.map((a) => {
          const crop = getCrop(a.cropId);
          const selected = a.id === selectedAreaId;
          return (
            <button
              key={a.id}
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onSelectArea(a.id)}
              className={cn(
                "absolute overflow-hidden rounded-lg border-2 p-1 text-left transition",
                selected && "ring-2 ring-ink ring-offset-2",
              )}
              style={{
                left: a.x * CELL,
                top: a.y * CELL,
                width: a.width * CELL,
                height: a.height * CELL,
                backgroundColor: `${a.color}26`,
                borderColor: a.color,
              }}
            >
              <span
                className="inline-flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold shadow-sm"
                style={{ color: a.color }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: a.color }} />
                {crop?.name ?? "—"}
              </span>
            </button>
          );
        })}

        {selRect && (
          <div
            className="pointer-events-none absolute rounded-lg border-2 border-dashed"
            style={{
              left: selRect.x * CELL,
              top: selRect.y * CELL,
              width: selRect.width * CELL,
              height: selRect.height * CELL,
              borderColor: selInvalid ? "#ef4444" : "#16a34a",
              backgroundColor: selInvalid ? "#ef44441f" : "#16a34a1f",
            }}
          />
        )}
      </div>
    </div>
  );
}
