import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Hero } from "@/components/landing/hero";
import { FarmProvider } from "@/components/landing/farm-provider";
import { FarmMap } from "@/components/landing/farm-map";
import { FarmStats } from "@/components/landing/farm-stats";
import { CropsStrip } from "@/components/landing/crops-strip";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Faq } from "@/components/landing/faq";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        {/* Центр лендинга — интерактивная карта. Карта, статистика и полоса
            культур делят одно состояние через FarmProvider. */}
        <FarmProvider>
          <FarmMap />
          <FarmStats />
          <CropsStrip />
        </FarmProvider>
        <HowItWorks />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}
