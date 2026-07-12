import "./globals.css";
import { Inter } from "next/font/google";
import { AppProviders } from "@/components/providers";

// Один шрифт на весь интерфейс: Inter — нейтральный, чистый, полная кириллица.
// Минимализм: без отдельного декоративного шрифта. Заголовки и вордмарк — тот же
// Inter с более плотным трекингом (см. .display в globals.css).
const sans = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "Arva — умное отслеживание теплиц",
  description: "Сетка грядок, модель роста и расчёт прибыли для теплиц",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={sans.variable}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
