import { cn } from "@/lib/utils";

const beds = [
  { label: "Клубника", color: "#ef4444", pos: "left-[6%] top-[9%] h-[32%] w-[40%]" },
  { label: "Томаты", color: "#16a34a", pos: "left-[52%] top-[9%] h-[46%] w-[42%]" },
  { label: "Огурцы", color: "#22c55e", pos: "left-[6%] top-[49%] h-[42%] w-[40%]" },
  { label: "Салат", color: "#84cc16", pos: "left-[52%] top-[63%] h-[28%] w-[42%]" },
];

/** Stylised preview of the greenhouse grid map (the core product screen). */
export function GreenhousePreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-line bg-white",
        className,
      )}
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(#e6e9e3 1px, transparent 1px), linear-gradient(90deg, #e6e9e3 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {beds.map((b) => (
        <div
          key={b.label}
          className={cn("absolute rounded-xl border p-2", b.pos)}
          style={{ backgroundColor: `${b.color}1a`, borderColor: `${b.color}59` }}
        >
          <span
            className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold shadow-sm"
            style={{ color: b.color }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: b.color }} />
            {b.label}
          </span>
        </div>
      ))}
    </div>
  );
}
