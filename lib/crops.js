// Справочник ИИ со средними агрономическими показателями.
// Значения синхронизированы с таблицей crops_reference в supabase/schema.sql.
// Названия культур берутся из lib/i18n.js (t.crops[ключ]).
//
// fruitsPerPlant — AvgFruitsPerPlant (среднее число плодов с куста)
// fruitWeight    — AvgFruitWeight, кг (средний вес одного плода)
// daysToMature   — DaysToMature (дней до созревания в идеальных условиях)
// tempOpt        — биологический оптимум температуры, °C

export const CROP_DB = {
  cherry:     { category: "vegetable", fruitsPerPlant: 30, fruitWeight: 0.02,  daysToMature: 90, tempOpt: [22, 26] },
  tomato:     { category: "vegetable", fruitsPerPlant: 20, fruitWeight: 0.14,  daysToMature: 95, tempOpt: [21, 26] },
  cucumber:   { category: "vegetable", fruitsPerPlant: 25, fruitWeight: 0.15,  daysToMature: 55, tempOpt: [22, 28] },
  pepper:     { category: "vegetable", fruitsPerPlant: 12, fruitWeight: 0.12,  daysToMature: 75, tempOpt: [22, 28] },
  eggplant:   { category: "vegetable", fruitsPerPlant: 10, fruitWeight: 0.25,  daysToMature: 85, tempOpt: [22, 28] },
  strawberry: { category: "berry",     fruitsPerPlant: 15, fruitWeight: 0.025, daysToMature: 60, tempOpt: [18, 24] },
  lettuce:    { category: "green",      fruitsPerPlant: 1,  fruitWeight: 0.3,   daysToMature: 45, tempOpt: [16, 22] },
  arugula:    { category: "green",      fruitsPerPlant: 1,  fruitWeight: 0.1,   daysToMature: 30, tempOpt: [16, 22] },
  basil:      { category: "green",      fruitsPerPlant: 1,  fruitWeight: 0.08,  daysToMature: 50, tempOpt: [20, 26] },
  dill:       { category: "green",      fruitsPerPlant: 1,  fruitWeight: 0.05,  daysToMature: 40, tempOpt: [16, 22] },
  radish:     { category: "vegetable", fruitsPerPlant: 1,  fruitWeight: 0.03,  daysToMature: 28, tempOpt: [15, 20] },
  zucchini:   { category: "vegetable", fruitsPerPlant: 8,  fruitWeight: 0.5,   daysToMature: 50, tempOpt: [20, 26] },
  melon:      { category: "fruit",      fruitsPerPlant: 4,  fruitWeight: 1.5,   daysToMature: 80, tempOpt: [24, 30] },
  watermelon: { category: "fruit",      fruitsPerPlant: 2,  fruitWeight: 5.0,   daysToMature: 90, tempOpt: [24, 30] },
};

export const CROP_KEYS = Object.keys(CROP_DB);

// Категориальная палитра грядок. Это ДАННЫЕ (не UI хром): приглушённые
// землистые тона, чтобы различать культуры на сетке. Первый цвет — акцент
// бренда. Весь остальной интерфейс остаётся монохромным плюс один акцент.
export const CROP_PALETTE = [
  "#16a34a", // зелёный (акцент)
  "#4d7c0f", // оливковый
  "#0f766e", // тил
  "#b45309", // охра
  "#78716c", // камень
  "#a16207", // горчичный
  "#15803d", // тёмно зелёный
  "#57534e", // тёмный камень
];
