"use client";

// Общее состояние фермы для карты, статистики и полосы культур. Держит плановые
// назначения из «режима планирования» и выбранный фильтр по культуре, чтобы карта
// и полоса культур были синхронны. Всё только в памяти, без бэкенда.

import { createContext, useContext, useMemo, useState, useCallback } from "react";
import { PARCELS } from "@/components/landing/farmData";

const FarmContext = createContext(null);

export function useFarm() {
  const ctx = useContext(FarmContext);
  if (!ctx) throw new Error("useFarm must be used within FarmProvider");
  return ctx;
}

export function FarmProvider({ children }) {
  // id участка -> назначенная в режиме планирования культура.
  const [planned, setPlanned] = useState({});
  // подсветка участков одной культуры (клик по полосе культур).
  const [cropFilter, setCropFilter] = useState(null);

  const assignCrop = useCallback((id, cropKey) => {
    setPlanned((prev) => ({ ...prev, [id]: cropKey }));
  }, []);

  // Накладываем плановые назначения поверх исходных данных. planned=true отличает
  // назначенное пользователем (акцентный пунктир) от изначально пустого (коричневый).
  const parcels = useMemo(
    () =>
      PARCELS.map((p) => {
        const override = planned[p.id];
        return override ? { ...p, plannedCropKey: override, planned: true } : p;
      }),
    [planned]
  );

  const value = useMemo(
    () => ({ parcels, assignCrop, cropFilter, setCropFilter }),
    [parcels, assignCrop, cropFilter]
  );

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}
