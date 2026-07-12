import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { LocaleProvider } from "@/lib/i18n/context";
import "./globals.css";

// Text/UI: Manrope (geometric grotesque, strong Cyrillic).
const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

// Display/wordmark: Unbounded (distinctive geometry, Cyrillic).
const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Arva — умное управление теплицами",
    template: "%s · Arva",
  },
  description:
    "Arva — облачная платформа для учёта выращивания культур в теплицах: интерактивная карта грядок, прогноз даты сбора и расчёт себестоимости и прибыли.",
  keywords: ["теплица", "агротех", "урожай", "гидропоника", "Arva"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${unbounded.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink antialiased">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
