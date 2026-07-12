/**
 * Local crop reference catalogue — mirrors the `crops` table (see
 * supabase/seed.sql). Used directly in demo mode and as the source of the
 * agronomic parameters that feed the harvest and cost calculators.
 *
 * price_per_kg is in ₸ (KZT); weights in grams; days_to_mature in days.
 */
export type Crop = {
  id: string; // slug
  name: string;
  nameKk: string;
  nameEn: string;
  color: string;
  daysToMature: number;
  avgFruitsPerPlant: number;
  avgFruitWeightG: number;
  pricePerKg: number;
};

export const CROPS: Crop[] = [
  {
    id: "strawberry",
    name: "Клубника",
    nameKk: "Құлпынай",
    nameEn: "Strawberry",
    color: "#b45309",
    daysToMature: 60,
    avgFruitsPerPlant: 20,
    avgFruitWeightG: 25,
    pricePerKg: 2000,
  },
  {
    id: "tomato",
    name: "Томат",
    nameKk: "Қызанақ",
    nameEn: "Tomato",
    color: "#16a34a",
    daysToMature: 90,
    avgFruitsPerPlant: 35,
    avgFruitWeightG: 110,
    pricePerKg: 800,
  },
  {
    id: "cucumber",
    name: "Огурец",
    nameKk: "Қияр",
    nameEn: "Cucumber",
    color: "#4d7c0f",
    daysToMature: 55,
    avgFruitsPerPlant: 25,
    avgFruitWeightG: 120,
    pricePerKg: 700,
  },
  {
    id: "lettuce",
    name: "Салат",
    nameKk: "Салат",
    nameEn: "Lettuce",
    color: "#0f766e",
    daysToMature: 45,
    avgFruitsPerPlant: 1,
    avgFruitWeightG: 300,
    pricePerKg: 900,
  },
  {
    id: "pepper",
    name: "Перец",
    nameKk: "Бұрыш",
    nameEn: "Pepper",
    color: "#a16207",
    daysToMature: 100,
    avgFruitsPerPlant: 15,
    avgFruitWeightG: 150,
    pricePerKg: 1200,
  },
  {
    id: "eggplant",
    name: "Баклажан",
    nameKk: "Баялды",
    nameEn: "Eggplant",
    color: "#57534e",
    daysToMature: 110,
    avgFruitsPerPlant: 12,
    avgFruitWeightG: 250,
    pricePerKg: 1000,
  },
  {
    id: "basil",
    name: "Базилик",
    nameKk: "Райхан",
    nameEn: "Basil",
    color: "#15803d",
    daysToMature: 40,
    avgFruitsPerPlant: 1,
    avgFruitWeightG: 50,
    pricePerKg: 2500,
  },
  {
    id: "radish",
    name: "Редис",
    nameKk: "Шомыр",
    nameEn: "Radish",
    color: "#78716c",
    daysToMature: 30,
    avgFruitsPerPlant: 1,
    avgFruitWeightG: 25,
    pricePerKg: 600,
  },
];

export const getCrop = (id: string | null | undefined): Crop | undefined =>
  CROPS.find((c) => c.id === id);
