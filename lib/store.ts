"use client";

import { useSyncExternalStore } from "react";
import type { Area, Greenhouse } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  deleteAreaRow,
  deleteGreenhouseRow,
  fetchGreenhouses,
  getUserId,
  insertArea,
  insertGreenhouse,
  updateAreaRow,
  updateGreenhouseRow,
} from "@/lib/supabase/data";

export type { Area, Greenhouse } from "@/lib/types";

const KEY = "arva.greenhouses.v1";
const configured = isSupabaseConfigured;

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
let loaded = false; // demo localStorage loaded
let hydrated = false; // data ready to render
let hydrateStarted = false;
let userId: string | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

/* --------------------------- demo (localStorage) --------------------------- */
function loadLocal(): Greenhouse[] {
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
  hydrated = true;
  return state;
}

/* ------------------------------- supabase --------------------------------- */
async function hydrate() {
  try {
    userId = await getUserId();
    state = await fetchGreenhouses();
  } catch (e) {
    console.error("Arva: Supabase load failed", e);
    state = [];
  } finally {
    hydrated = true;
    notify();
  }
}

async function ensureUser(): Promise<string | null> {
  if (userId) return userId;
  userId = await getUserId();
  return userId;
}

/* --------------------------------- commit --------------------------------- */
function commit(next: Greenhouse[]) {
  state = next;
  if (!configured && typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  }
  notify();
}

const swallow = (e: unknown) => console.error("Arva: Supabase write failed", e);

/* -------------------------------- mutators -------------------------------- */
export function createGreenhouse(input: {
  name: string;
  lengthM: number;
  widthM: number;
  hydroponic?: boolean;
}): Greenhouse {
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
  commit([...state, gh]);
  if (configured) {
    ensureUser().then((u) => {
      if (u) insertGreenhouse(gh, u).catch(swallow);
    });
  }
  return gh;
}

export function updateGreenhouse(id: string, patch: Partial<Greenhouse>) {
  commit(state.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  if (configured) updateGreenhouseRow(id, patch).catch(swallow);
}

export function removeGreenhouse(id: string) {
  commit(state.filter((g) => g.id !== id));
  if (configured) deleteGreenhouseRow(id).catch(swallow);
}

export function addArea(greenhouseId: string, area: Omit<Area, "id">): Area {
  const created: Area = { ...area, id: uid() };
  commit(state.map((g) => (g.id === greenhouseId ? { ...g, areas: [...g.areas, created] } : g)));
  if (configured) insertArea(greenhouseId, created).catch(swallow);
  return created;
}

export function updateArea(greenhouseId: string, areaId: string, patch: Partial<Area>) {
  commit(
    state.map((g) =>
      g.id === greenhouseId
        ? {
            ...g,
            areas: g.areas.map((a) => (a.id === areaId ? { ...a, ...patch } : a)),
          }
        : g,
    ),
  );
  if (configured) updateAreaRow(areaId, patch).catch(swallow);
}

export function removeArea(greenhouseId: string, areaId: string) {
  commit(
    state.map((g) =>
      g.id === greenhouseId ? { ...g, areas: g.areas.filter((a) => a.id !== areaId) } : g,
    ),
  );
  if (configured) deleteAreaRow(areaId).catch(swallow);
}

/* ---------------------------------- hooks --------------------------------- */
function subscribe(cb: () => void) {
  listeners.add(cb);
  if (configured && !hydrateStarted) {
    hydrateStarted = true;
    hydrate();
  }
  return () => listeners.delete(cb);
}

function snapshot(): Greenhouse[] {
  return configured ? state : loadLocal();
}

export function useGreenhouses(): Greenhouse[] {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

export function useGreenhouse(id: string | undefined): Greenhouse | undefined {
  return useGreenhouses().find((g) => g.id === id);
}

export function useStoreReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => {
      if (!configured) loadLocal();
      return hydrated;
    },
    () => false,
  );
}
