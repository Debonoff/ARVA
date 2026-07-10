"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Droplets, Plus, Ruler, Sprout, Trash2 } from "lucide-react";
import { createGreenhouse, removeGreenhouse, useGreenhouses, useStoreReady } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function GreenhousesPage() {
  const greenhouses = useGreenhouses();
  const ready = useStoreReady();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [length, setLength] = useState("10");
  const [width, setWidth] = useState("6");
  const [hydro, setHydro] = useState(false);

  if (!ready) {
    return (
      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-3xl bg-paper-soft" />
        ))}
      </div>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createGreenhouse({
      name: name.trim(),
      lengthM: Math.max(1, Number(length) || 1),
      widthM: Math.max(1, Number(width) || 1),
      hydroponic: hydro,
    });
    setName("");
    setLength("10");
    setWidth("6");
    setHydro(false);
    setCreating(false);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">Теплицы</h1>
          <p className="mt-1 text-muted">Создавайте теплицы и размечайте грядки на карте.</p>
        </div>
        <Button onClick={() => setCreating((v) => !v)}>
          <Plus className="h-4 w-4" /> Новая теплица
        </Button>
      </header>

      {creating && (
        <form
          onSubmit={submit}
          className="mt-6 grid gap-4 rounded-3xl border border-line bg-paper p-6 shadow-card sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <Label htmlFor="gh-name">Название</Label>
            <Input
              id="gh-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Теплица 2"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="gh-length">Длина, м</Label>
            <Input
              id="gh-length"
              type="number"
              min={1}
              max={40}
              value={length}
              onChange={(e) => setLength(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="gh-width">Ширина, м</Label>
            <Input
              id="gh-width"
              type="number"
              min={1}
              max={40}
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line p-3 sm:col-span-2">
            <input
              type="checkbox"
              checked={hydro}
              onChange={(e) => setHydro(e.target.checked)}
              className="h-4 w-4 accent-brand"
            />
            <span className="flex items-center gap-1.5 text-sm">
              <Droplets className="h-4 w-4 text-brand" /> Гидропоника (+20% к скорости роста)
            </span>
          </label>
          <div className="flex gap-3 sm:col-span-2">
            <Button type="submit">Создать</Button>
            <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
              Отмена
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {greenhouses.map((g) => {
          const beds = g.areas.length;
          const plants = g.areas.reduce((s, a) => s + a.plantCount, 0);
          return (
            <div
              key={g.id}
              className="group rounded-3xl border border-line bg-paper p-6 shadow-card"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-dark">
                    <Sprout className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-bold text-ink">{g.name}</h2>
                    <p className="flex items-center gap-1 text-sm text-muted">
                      <Ruler className="h-3.5 w-3.5" />
                      {g.lengthM} × {g.widthM} м
                      {g.hydroponic && (
                        <span className="ml-1 inline-flex items-center gap-0.5 text-brand">
                          <Droplets className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeGreenhouse(g.id)}
                  className="rounded-lg p-2 text-muted transition-colors hover:bg-paper-soft hover:text-red-500"
                  aria-label="Удалить теплицу"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 flex gap-6 text-sm text-muted">
                <span>
                  <b className="text-ink">{beds}</b> грядок
                </span>
                <span>
                  <b className="text-ink">{plants}</b> растений
                </span>
              </div>

              <Link
                href={`/greenhouses/${g.id}`}
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark"
              >
                Открыть карту
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          );
        })}
      </div>

      {greenhouses.length === 0 && (
        <div className="mt-6 rounded-3xl border border-dashed border-line p-12 text-center text-muted">
          <Sprout className="mx-auto h-8 w-8 opacity-40" />
          <p className="mt-3">Пока нет теплиц. Создайте первую, чтобы начать.</p>
        </div>
      )}
    </div>
  );
}
