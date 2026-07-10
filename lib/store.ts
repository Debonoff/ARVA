"use client";

import { useSyncExternalStore } from "react";
import type { HumidityState, TempState } from "@/lib/calc";

/* --------------------------------- types --------------------------------- */

export type Area = {
  id: string;
  cropId: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  plantCount: number;
  plantedOn: string; // ISO date (yyyy-mm-dd)
  color: string;
};

export type Greenhouse = {
  id: string;
  name: string;
  lengthM: number;
  widthM: number;
  hydroponic: boolean;
  temp: TempState;
  humidity: HumidityState;
  operatingCosts: number; // ₸, used in profit estimation
  areas: Area[];
  createdAt: string;
};

/* -------------------------------- storage -------------------------------- */

const KEY = "arva.greenhouses.v1";

function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

function seed(): Greenhouse[] {
  return [
    {
      id: uid(),
      name: "Теплица 1",
      lengthM: 10,
      widthM: 6,
      hydroponic: true,
      temp: "optimal",
      humidity: "normal",
      operatingCosts: 150_000,
      createdAt: isoDaysAgo(45),
      areas: [
        {
          id: uid(),
          cropId: "strawberry",
          x: 0,
          y: 0,
          width: 4,
          height: 2,
          plantCount: 48,
          plantedOn: isoDaysAgo(40),
          color: "#ef4444",
        },
        {
          id: uid(),
          cropId: "tomato",
          x: 5,
          y: 0,
          width: 4,
          height: 3,
          plantCount: 24,
          plantedOn: isoDaysAgo(28),
          color: "#f59e0b",
        },
        {
          id: uid(),
          cropId: "cucumber",
          x: 0,
          y: 3,
          width: 4,
          height: 2,
          plantCount: 20,
          plantedOn: isoDaysAgo(15),
          color: "#16a34a",
        },
        {
          id: uid(),
          cropId: "lettuce",
          x: 5,
          y: 4,
          width: 4,
          height: 1,
          plantCount: 40,
          plantedOn: isoDaysAgo(10),
          color: "#84cc16",
        },
      ],
    },
  ];
}

const EMPTY: Greenhouse[] = [];
let state: Greenhouse[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function load(): Greenhouse[] {
  if (typeof window === "undefined") return EMPTY;
  if (loaded) return state;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      state = JSON.parse(raw) as Greenhouse[];
    } else {
      state = seed();
      window.localStorage.setItem(KEY, JSON.stringify(state));
    }
  } catch {
    state = seed();
  }
  loaded = true;
  return state;
}

function persist() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
}

function setState(next: Greenhouse[]) {
  state = next;
  persist();
}

/* -------------------------------- mutators ------------------------------- */

export function createGreenhouse(input: {
  name: string;
  lengthM: number;
  widthM: number;
  hydroponic?: boolean;
}): Greenhouse {
  load();
  const gh: Greenhouse = {
    id: uid(),
    name: input.name,
    lengthM: input.lengthM,
    widthM: input.widthM,
    hydroponic: input.hydroponic ?? false,
    temp: "optimal",
    humidity: "normal",
    operatingCosts: 0,
    areas: [],
    createdAt: new Date().toISOString().slice(0, 10),
  };
  setState([...state, gh]);
  return gh;
}

export function updateGreenhouse(id: string, patch: Partial<Greenhouse>) {
  load();
  setState(state.map((g) => (g.id === id ? { ...g, ...patch } : g)));
}

export function removeGreenhouse(id: string) {
  load();
  setState(state.filter((g) => g.id !== id));
}

export function addArea(greenhouseId: string, area: Omit<Area, "id">): Area {
  load();
  const created: Area = { ...area, id: uid() };
  setState(state.map((g) => (g.id === greenhouseId ? { ...g, areas: [...g.areas, created] } : g)));
  return created;
}

export function updateArea(greenhouseId: string, areaId: string, patch: Partial<Area>) {
  load();
  setState(
    state.map((g) =>
      g.id === greenhouseId
        ? {
            ...g,
            areas: g.areas.map((a) => (a.id === areaId ? { ...a, ...patch } : a)),
          }
        : g,
    ),
  );
}

export function removeArea(greenhouseId: string, areaId: string) {
  load();
  setState(
    state.map((g) =>
      g.id === greenhouseId ? { ...g, areas: g.areas.filter((a) => a.id !== areaId) } : g,
    ),
  );
}

/* ---------------------------------- hooks -------------------------------- */

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useGreenhouses(): Greenhouse[] {
  return useSyncExternalStore(
    subscribe,
    () => load(),
    () => EMPTY,
  );
}

export function useGreenhouse(id: string | undefined): Greenhouse | undefined {
  const all = useGreenhouses();
  return all.find((g) => g.id === id);
}
