"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers";
import { CROP_PALETTE } from "@/lib/crops";
import { isoDate } from "@/lib/calc";

const DataContext = createContext(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

const GH_SELECT =
  "id,name,length,width,hydro,temp,humidity,created_at," +
  "beds(id,greenhouse_id,crop_type,color,plants_count,plant_date,price_per_kg,costs,cells,progress,predicted_harvest,status,last_progress_at)";

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [greenhouses, setGreenhouses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const mapGh = (g) => ({
    id: g.id,
    name: g.name,
    length: g.length,
    width: g.width,
    hydro: g.hydro,
    temp: Number(g.temp),
    humidity: Number(g.humidity),
    beds: (g.beds ?? []).map((b) => ({
      id: b.id,
      greenhouse_id: b.greenhouse_id,
      crop_type: b.crop_type,
      color: b.color,
      plants_count: b.plants_count,
      plant_date: b.plant_date,
      price_per_kg: Number(b.price_per_kg),
      costs: Number(b.costs),
      cells: Array.isArray(b.cells) ? b.cells : [],
      progress: Number(b.progress) || 0,
      predicted_harvest: b.predicted_harvest,
      status: b.status,
      last_progress_at: b.last_progress_at,
    })),
  });

  const refresh = useCallback(async () => {
    if (!user) {
      setGreenhouses([]);
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [ghRes, nRes] = await Promise.all([
      supabase.from("greenhouses").select(GH_SELECT).order("created_at", { ascending: true }),
      supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(12),
    ]);
    if (ghRes.error) console.error("Load error:", ghRes.error.message);
    else setGreenhouses((ghRes.data ?? []).map(mapGh));
    if (!nRes.error) setNotifications(nRes.data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /* --------------------------- greenhouses --------------------------- */
  const createGreenhouse = async (g) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("greenhouses")
      .insert({ ...g, user_id: user.id })
      .select()
      .single();
    if (error || !data) {
      console.error("Create greenhouse error:", error?.message);
      return null;
    }
    const gh = { ...mapGh({ ...data, beds: [] }) };
    setGreenhouses((prev) => [...prev, gh]);
    return gh;
  };

  const updateGreenhouse = async (id, patch) => {
    const dbPatch = {};
    ["name", "length", "width", "hydro", "temp", "humidity"].forEach((k) => {
      if (k in patch) dbPatch[k] = patch[k];
    });
    setGreenhouses((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
    await supabase.from("greenhouses").update(dbPatch).eq("id", id);
  };

  const deleteGreenhouse = async (id) => {
    setGreenhouses((prev) => prev.filter((g) => g.id !== id));
    await supabase.from("greenhouses").delete().eq("id", id);
  };

  /* ------------------------------- beds ------------------------------ */
  const createBed = async (greenhouseId, data) => {
    if (!user) return;
    const gh = greenhouses.find((g) => g.id === greenhouseId);
    if (!gh) return;

    // Убираем выбранные клетки из других грядок (не даём перекрытий).
    const newCells = new Set(data.cells);
    for (const b of gh.beds) {
      const remaining = b.cells.filter((c) => !newCells.has(c));
      if (remaining.length !== b.cells.length) {
        if (remaining.length === 0) await supabase.from("beds").delete().eq("id", b.id);
        else await supabase.from("beds").update({ cells: remaining }).eq("id", b.id);
      }
    }

    const usedColors = gh.beds.map((b) => b.color);
    const color =
      CROP_PALETTE.find((c) => !usedColors.includes(c)) ??
      CROP_PALETTE[gh.beds.length % CROP_PALETTE.length];

    await supabase.from("beds").insert({
      greenhouse_id: greenhouseId,
      user_id: user.id,
      crop_type: data.crop_type,
      color,
      plants_count: data.plants_count,
      plant_date: data.plant_date || null,
      cells: data.cells,
    });
    await refresh();
  };

  const updateBed = async (id, patch) => {
    setGreenhouses((prev) =>
      prev.map((g) => ({
        ...g,
        beds: g.beds.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      }))
    );
    const dbPatch = {};
    ["crop_type", "plants_count", "plant_date", "price_per_kg", "costs", "cells"].forEach((k) => {
      if (k in patch) dbPatch[k] = patch[k];
    });
    await supabase.from("beds").update(dbPatch).eq("id", id);
  };

  const deleteBed = async (id) => {
    setGreenhouses((prev) =>
      prev.map((g) => ({ ...g, beds: g.beds.filter((b) => b.id !== id) }))
    );
    await supabase.from("beds").delete().eq("id", id);
  };

  /* --------------------------- daily readings ------------------------ */
  const addReading = async (greenhouseId, temp, humidity) => {
    if (!user) return;
    const reading_date = isoDate();
    await supabase.from("daily_readings").upsert(
      {
        greenhouse_id: greenhouseId,
        user_id: user.id,
        reading_date,
        temp,
        humidity,
      },
      { onConflict: "greenhouse_id,reading_date" }
    );
    // Текущий микроклимат теплицы = последний замер.
    await updateGreenhouse(greenhouseId, { temp, humidity });
  };

  const markNotificationsRead = async () => {
    if (!user) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
  };

  return (
    <DataContext.Provider
      value={{
        greenhouses,
        notifications,
        loading,
        refresh,
        createGreenhouse,
        updateGreenhouse,
        deleteGreenhouse,
        createBed,
        updateBed,
        deleteBed,
        addReading,
        markNotificationsRead,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
