import type { HumidityState, TempState } from "@/lib/calc";

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
