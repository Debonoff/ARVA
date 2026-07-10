"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Droplets, Ruler } from "lucide-react";
import { useGreenhouse, useStoreReady } from "@/lib/store";
import { GreenhouseGrid, type Rect } from "@/components/map/greenhouse-grid";
import { AreaPanel } from "@/components/map/area-panel";
import { EnvControls } from "@/components/map/env-controls";
import { SummaryTable } from "@/components/map/summary-table";

export default function GreenhouseMapPage() {
  const params = useParams<{ id: string }>();
  const ready = useStoreReady();
  const greenhouse = useGreenhouse(params.id);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Rect | null>(null);

  if (!ready) {
    return <div className="mx-auto h-96 max-w-6xl animate-pulse rounded-3xl bg-paper-soft" />;
  }

  if (!greenhouse) {
    return (
      <div className="mx-auto max-w-6xl">
        <Link
          href="/greenhouses"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Все теплицы
        </Link>
        <p className="mt-8 text-muted">Теплица не найдена.</p>
      </div>
    );
  }

  const selectedArea = greenhouse.areas.find((a) => a.id === selectedAreaId) ?? null;

  const selectArea = (id: string | null) => {
    setSelectedAreaId(id);
    setDraft(null);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/greenhouses"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Все теплицы
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
          {greenhouse.name}
        </h1>
        <span className="flex items-center gap-1 text-sm text-muted">
          <Ruler className="h-4 w-4" />
          {greenhouse.lengthM} × {greenhouse.widthM} м
          {greenhouse.hydroponic && <Droplets className="ml-1 h-4 w-4 text-brand" />}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-line bg-paper p-5 shadow-card lg:col-span-2">
          <p className="mb-3 text-sm text-muted">
            Потяните мышью по сетке, чтобы выделить грядку. Каждая ячейка — 1 м².
          </p>
          <GreenhouseGrid
            greenhouse={greenhouse}
            selectedAreaId={selectedAreaId}
            onSelectArea={selectArea}
            onCreateSelection={(rect) => {
              setDraft(rect);
              setSelectedAreaId(null);
            }}
          />
        </div>

        <div className="space-y-6">
          <AreaPanel
            greenhouse={greenhouse}
            area={selectedArea}
            draft={draft}
            onSelectArea={selectArea}
            onCancelDraft={() => setDraft(null)}
          />
          <EnvControls greenhouse={greenhouse} />
        </div>
      </div>

      <div className="mt-6">
        <SummaryTable greenhouse={greenhouse} />
      </div>
    </div>
  );
}
