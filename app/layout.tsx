import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { LocaleProvider } from "@/lib/i18n/context";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
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
      className={`${montserrat.variable} ${inter.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink antialiased">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
