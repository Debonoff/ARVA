import { createClient } from "./client";
import type { Area, Greenhouse } from "@/lib/types";
import type { HumidityState, TempState } from "@/lib/calc";

/* -------- row shapes (DB) -------- */
type GreenhouseRow = {
  id: string;
  name: string;
  length_m: number;
  width_m: number;
  hydroponic: boolean;
  temp_state: TempState;
  humidity_state: HumidityState;
  operating_costs: number;
  created_at: string;
};
type AreaRow = {
  id: string;
  greenhouse_id: string;
  crop_id: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  plant_count: number;
  planted_on: string;
  color: string;
};

/* -------- mappers -------- */
function toGreenhouse(g: GreenhouseRow, areas: AreaRow[]): Greenhouse {
  return {
    id: g.id,
    name: g.name,
    lengthM: Number(g.length_m),
    widthM: Number(g.width_m),
    hydroponic: g.hydroponic,
    temp: g.temp_state,
    humidity: g.humidity_state,
    operatingCosts: Number(g.operating_costs),
    createdAt: g.created_at,
    areas: areas
      .filter((a) => a.greenhouse_id === g.id)
      .map((a) => ({
        id: a.id,
        cropId: a.crop_id,
        x: a.x,
        y: a.y,
        width: a.width,
        height: a.height,
        plantCount: a.plant_count,
        plantedOn: a.planted_on,
        color: a.color,
      })),
  };
}

function greenhouseInsert(g: Greenhouse, userId: string) {
  return {
    id: g.id,
    user_id: userId,
    name: g.name,
    length_m: g.lengthM,
    width_m: g.widthM,
    hydroponic: g.hydroponic,
    temp_state: g.temp,
    humidity_state: g.humidity,
    operating_costs: g.operatingCosts,
  };
}

function greenhousePatch(patch: Partial<Greenhouse>) {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.lengthM !== undefined) row.length_m = patch.lengthM;
  if (patch.widthM !== undefined) row.width_m = patch.widthM;
  if (patch.hydroponic !== undefined) row.hydroponic = patch.hydroponic;
  if (patch.temp !== undefined) row.temp_state = patch.temp;
  if (patch.humidity !== undefined) row.humidity_state = patch.humidity;
  if (patch.operatingCosts !== undefined) row.operating_costs = patch.operatingCosts;
  return row;
}

function areaInsert(greenhouseId: string, a: Area) {
  return {
    id: a.id,
    greenhouse_id: greenhouseId,
    crop_id: a.cropId,
    x: a.x,
    y: a.y,
    width: a.width,
    height: a.height,
    plant_count: a.plantCount,
    planted_on: a.plantedOn,
    color: a.color,
  };
}

function areaPatch(patch: Partial<Area>) {
  const row: Record<string, unknown> = {};
  if (patch.cropId !== undefined) row.crop_id = patch.cropId;
  if (patch.plantCount !== undefined) row.plant_count = patch.plantCount;
  if (patch.plantedOn !== undefined) row.planted_on = patch.plantedOn;
  if (patch.color !== undefined) row.color = patch.color;
  return row;
}

/* -------- API -------- */
export async function getUserId(): Promise<string | null> {
  const { data } = await createClient().auth.getUser();
  return data.user?.id ?? null;
}

export async function fetchGreenhouses(): Promise<Greenhouse[]> {
  const supabase = createClient();
  const [{ data: ghs }, { data: areas }] = await Promise.all([
    supabase.from("greenhouses").select("*").order("created_at"),
    supabase.from("areas").select("*"),
  ]);
  return ((ghs ?? []) as GreenhouseRow[]).map((g) => toGreenhouse(g, (areas ?? []) as AreaRow[]));
}

export async function insertGreenhouse(g: Greenhouse, userId: string) {
  await createClient().from("greenhouses").insert(greenhouseInsert(g, userId));
}

export async function updateGreenhouseRow(id: string, patch: Partial<Greenhouse>) {
  const row = greenhousePatch(patch);
  if (Object.keys(row).length === 0) return;
  await createClient().from("greenhouses").update(row).eq("id", id);
}

export async function deleteGreenhouseRow(id: string) {
  await createClient().from("greenhouses").delete().eq("id", id);
}

export async function insertArea(greenhouseId: string, a: Area) {
  await createClient().from("areas").insert(areaInsert(greenhouseId, a));
}

export async function updateAreaRow(id: string, patch: Partial<Area>) {
  const row = areaPatch(patch);
  if (Object.keys(row).length === 0) return;
  await createClient().from("areas").update(row).eq("id", id);
}

export async function deleteAreaRow(id: string) {
  await createClient().from("areas").delete().eq("id", id);
}
