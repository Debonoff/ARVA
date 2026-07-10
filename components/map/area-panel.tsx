"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { addArea, removeArea, updateArea, type Area, type Greenhouse } from "@/lib/store";
import { CROPS, getCrop } from "@/lib/crops";
import type { Rect } from "@/components/map/greenhouse-grid";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

const todayIso = () => new Date().toISOString().slice(0, 10);

export function AreaPanel({
  greenhouse,
  area,
  draft,
  onSelectArea,
  onCancelDraft,
}: {
  greenhouse: Greenhouse;
  area: Area | null;
  draft: Rect | null;
  onSelectArea: (id: string | null) => void;
  onCancelDraft: () => void;
}) {
  if (area) {
    return (
      <EditArea key={area.id} greenhouse={greenhouse} area={area} onSelectArea={onSelectArea} />
    );
  }
  if (draft) {
    return (
      <NewArea
        greenhouse={greenhouse}
        draft={draft}
        onSelectArea={onSelectArea}
        onCancelDraft={onCancelDraft}
      />
    );
  }
  return (
    <div className="rounded-3xl border border-dashed border-line p-6 text-sm text-muted">
      Потяните мышью по сетке, чтобы выделить грядку, или выберите существующую.
    </div>
  );
}

function CropSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div>
      <Label htmlFor="crop">Культура</Label>
      <Select id="crop" value={value} onChange={(e) => onChange(e.target.value)}>
        {CROPS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
    </div>
  );
}

function NewArea({
  greenhouse,
  draft,
  onSelectArea,
  onCancelDraft,
}: {
  greenhouse: Greenhouse;
  draft: Rect;
  onSelectArea: (id: string | null) => void;
  onCancelDraft: () => void;
}) {
  const [cropId, setCropId] = useState(CROPS[0].id);
  const area = draft.width * draft.height;
  const [plantCount, setPlantCount] = useState(String(area * 4));

  function add() {
    const crop = getCrop(cropId)!;
    const created = addArea(greenhouse.id, {
      cropId,
      x: draft.x,
      y: draft.y,
      width: draft.width,
      height: draft.height,
      plantCount: Math.max(0, Number(plantCount) || 0),
      plantedOn: todayIso(),
      color: crop.color,
    });
    onSelectArea(created.id);
  }

  return (
    <div className="space-y-4 rounded-3xl border border-line bg-paper p-6 shadow-card">
      <div>
        <h3 className="font-display font-bold text-ink">Новая грядка</h3>
        <p className="text-sm text-muted">
          {draft.width} × {draft.height} м · {area} м²
        </p>
      </div>
      <CropSelect value={cropId} onChange={setCropId} />
      <div>
        <Label htmlFor="pc">Количество растений</Label>
        <Input
          id="pc"
          type="number"
          min={0}
          value={plantCount}
          onChange={(e) => setPlantCount(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <Button onClick={add}>Добавить</Button>
        <Button variant="ghost" onClick={onCancelDraft}>
          Отмена
        </Button>
      </div>
    </div>
  );
}

function EditArea({
  greenhouse,
  area,
  onSelectArea,
}: {
  greenhouse: Greenhouse;
  area: Area;
  onSelectArea: (id: string | null) => void;
}) {
  const crop = getCrop(area.cropId);
  const size = area.width * area.height;

  return (
    <div className="space-y-4 rounded-3xl border border-line bg-paper p-6 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display font-bold text-ink">Грядка</h3>
          <p className="text-sm text-muted">
            {area.width} × {area.height} м · {size} м²
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            removeArea(greenhouse.id, area.id);
            onSelectArea(null);
          }}
          className="rounded-lg p-2 text-muted transition-colors hover:bg-red-50 hover:text-red-500"
          aria-label="Удалить грядку"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <CropSelect
        value={area.cropId ?? CROPS[0].id}
        onChange={(id) => {
          const c = getCrop(id)!;
          updateArea(greenhouse.id, area.id, { cropId: id, color: c.color });
        }}
      />

      <div>
        <Label htmlFor="pc">Количество растений</Label>
        <Input
          id="pc"
          type="number"
          min={0}
          value={area.plantCount}
          onChange={(e) =>
            updateArea(greenhouse.id, area.id, {
              plantCount: Math.max(0, Number(e.target.value) || 0),
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="pd">Дата посадки</Label>
        <Input
          id="pd"
          type="date"
          value={area.plantedOn}
          onChange={(e) => updateArea(greenhouse.id, area.id, { plantedOn: e.target.value })}
        />
      </div>

      {crop && (
        <p className="border-t border-line pt-3 text-xs text-muted">
          Срок созревания: {crop.daysToMature} дн · ~{crop.avgFruitsPerPlant} плодов/раст ·{" "}
          {crop.avgFruitWeightG} г/плод
        </p>
      )}
    </div>
  );
}
