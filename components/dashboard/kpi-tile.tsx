import type { LucideIcon } from "lucide-react";

export function KpiTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl border border-line bg-paper p-5 shadow-card">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 font-display text-2xl font-extrabold text-ink tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
