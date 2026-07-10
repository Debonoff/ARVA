import { cn } from "@/lib/utils";

const rows = [
  { label: "Клубника", pct: 82 },
  { label: "Томаты", pct: 45 },
  { label: "Огурцы", pct: 30 },
];

/** Floating dark card previewing crop-status progress. */
export function StatsCard({ className }: { className?: string }) {
  return (
    <div className={cn("w-60 rounded-3xl bg-ink p-5 text-paper shadow-float", className)}>
      <p className="text-xs font-semibold tracking-wider text-white/50 uppercase">Статус культур</p>
      <div className="mt-4 space-y-3.5">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">{r.label}</span>
              <span className="font-semibold">{r.pct}%</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-brand-light" style={{ width: `${r.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
