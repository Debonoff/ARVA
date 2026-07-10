"use client";

import { Droplets } from "lucide-react";
import { updateGreenhouse, type Greenhouse } from "@/lib/store";
import type { HumidityState, TempState } from "@/lib/calc";
import { cn } from "@/lib/utils";

const temps: { v: TempState; label: string }[] = [
  { v: "optimal", label: "Оптимум" },
  { v: "cold", label: "Холодно" },
  { v: "critical", label: "Критично" },
];
const hums: { v: HumidityState; label: string }[] = [
  { v: "normal", label: "Норма" },
  { v: "stressed", label: "Стресс" },
];

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { v: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-xl bg-paper-soft p-1">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={cn(
            "flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
            value === o.v ? "bg-paper text-ink shadow-sm" : "text-muted hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function EnvControls({ greenhouse }: { greenhouse: Greenhouse }) {
  return (
    <div className="space-y-4 rounded-3xl border border-line bg-paper p-5 shadow-card">
      <h3 className="font-display font-bold text-ink">Условия среды</h3>

      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line p-3">
        <span className="flex items-center gap-2 text-sm">
          <Droplets className="h-4 w-4 text-brand" /> Гидропоника
        </span>
        <input
          type="checkbox"
          checked={greenhouse.hydroponic}
          onChange={(e) => updateGreenhouse(greenhouse.id, { hydroponic: e.target.checked })}
          className="h-4 w-4 accent-brand"
        />
      </label>

      <div>
        <p className="mb-1.5 text-xs font-medium text-muted">Температура</p>
        <Segmented
          value={greenhouse.temp}
          options={temps}
          onChange={(v) => updateGreenhouse(greenhouse.id, { temp: v })}
        />
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-muted">Влажность</p>
        <Segmented
          value={greenhouse.humidity}
          options={hums}
          onChange={(v) => updateGreenhouse(greenhouse.id, { humidity: v })}
        />
      </div>
    </div>
  );
}
