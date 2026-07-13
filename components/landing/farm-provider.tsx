"use client";

// Общее состояние фермы для карты, статистики и полосы культур. Держит плановые
// назначения из «режима планирования» и фильтр по культуре, чтобы карта и полоса
// культур были синхронны. Всё только в памяти, без бэкенда.

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { PARCELS, type Parcel } from "@/lib/farm-data";

type FarmCtx = {
  parcels: Parcel[];
  assignCrop: (id: string, cropId: string) => void;
  cropFilter: string | null;
  setCropFilter: (v: string | null) => void;
};

const FarmContext = createContext<FarmCtx | null>(null);

export function useFarm(): FarmCtx {
  const ctx = useContext(FarmContext);
  if (!ctx) throw new Error("useFarm must be used within FarmProvider");
  return ctx;
}

export function FarmProvider({ children }: { children: React.ReactNode }) {
  const [planned, setPlanned] = useState<Record<string, string>>({});
  const [cropFilter, setCropFilter] = useState<string | null>(null);

  const assignCrop = useCallback((id: string, cropId: string) => {
    setPlanned((prev) => ({ ...prev, [id]: cropId }));
  }, []);

  // Накладываем плановые назначения. planned=true отличает назначенное
  // пользователем (акцентный пунктир) от изначально пустого (коричневый).
  const parcels = useMemo<Parcel[]>(
    () =>
      PARCELS.map((p) => {
        const override = planned[p.id];
        return override ? { ...p, plannedCropId: override, planned: true } : p;
      }),
    [planned],
  );

  const value = useMemo<FarmCtx>(
    () => ({ parcels, assignCrop, cropFilter, setCropFilter }),
    [parcels, assignCrop, cropFilter],
  );

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}
