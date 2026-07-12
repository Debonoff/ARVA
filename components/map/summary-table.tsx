import type { Greenhouse } from "@/lib/store";
import { getCrop } from "@/lib/crops";

type Row = { name: string; color: string; areaM2: number; plants: number };

export function SummaryTable({ greenhouse }: { greenhouse: Greenhouse }) {
  const map = new Map<string, Row>();
  for (const a of greenhouse.areas) {
    const crop = getCrop(a.cropId);
    const key = a.cropId ?? "none";
    const row = map.get(key) ?? {
      name: crop?.name ?? "Без культуры",
      color: crop?.color ?? "#64726b",
      areaM2: 0,
      plants: 0,
    };
    row.areaM2 += a.width * a.height;
    row.plants += a.plantCount;
    map.set(key, row);
  }
  const rows = [...map.values()].sort((a, b) => b.areaM2 - a.areaM2);
  const totalArea = rows.reduce((s, r) => s + r.areaM2, 0);
  const totalPlants = rows.reduce((s, r) => s + r.plants, 0);
  const capacity = greenhouse.lengthM * greenhouse.widthM;

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-paper shadow-card">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h3 className="font-display font-bold text-ink">Сводка</h3>
        <span className="text-xs text-muted">
          занято {totalArea} из {capacity} м²
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="p-5 text-sm text-muted">Пока нет грядок.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted uppercase">
              <th className="px-5 py-2 font-semibold">Культура</th>
              <th className="px-5 py-2 text-right font-semibold">Площадь</th>
              <th className="px-5 py-2 text-right font-semibold">Растений</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-t border-line">
                <td className="px-5 py-2.5">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: r.color }}
                    />
                    {r.name}
                  </span>
                </td>
                <td className="px-5 py-2.5 text-right text-ink tabular-nums">{r.areaM2} м²</td>
                <td className="px-5 py-2.5 text-right text-ink tabular-nums">{r.plants}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-line font-semibold text-ink">
              <td className="px-5 py-3">Итого</td>
              <td className="px-5 py-3 text-right tabular-nums">{totalArea} м²</td>
              <td className="px-5 py-3 text-right tabular-nums">{totalPlants}</td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}
