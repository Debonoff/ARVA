import Landing from "@/components/landing/Landing";

// Публичный лендинг на "/" (issues 36-40). Метаданные для SEO и Open Graph.
export const metadata = {
  title: "Arva — умное управление теплицами",
  description:
    "Сетка грядок, модель роста и учёт прибыли в одном лёгком инструменте для фермеров. Русский, қазақша, English.",
  keywords: ["теплицы", "агротех", "управление теплицами", "прогноз урожая", "Arva"],
  openGraph: {
    title: "Arva — умное управление теплицами",
    description: "Планируйте теплицу, прогнозируйте урожай и считайте прибыль.",
    type: "website",
    siteName: "Arva",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arva — умное управление теплицами",
    description: "Планируйте теплицу, прогнозируйте урожай и считайте прибыль.",
  },
};

export default function Page() {
  return <Landing />;
}
