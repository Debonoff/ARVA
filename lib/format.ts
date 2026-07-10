const RU = "ru-RU";

export function formatMoney(value: number): string {
  return new Intl.NumberFormat(RU, { maximumFractionDigits: 0 }).format(Math.round(value)) + " ₸";
}

export function formatKg(value: number): string {
  return (
    new Intl.NumberFormat(RU, {
      maximumFractionDigits: value < 10 ? 1 : 0,
    }).format(value) + " кг"
  );
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(RU).format(value);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(RU, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
