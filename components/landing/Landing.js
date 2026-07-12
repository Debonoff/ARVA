"use client";

import LandingHeader from "@/components/landing/LandingHeader";
import Hero from "@/components/landing/Hero";
import { FarmProvider } from "@/components/landing/FarmProvider";
import FarmMap from "@/components/landing/FarmMap";
import FarmStats from "@/components/landing/FarmStats";
import CropsStrip from "@/components/landing/CropsStrip";
import HowItWorks from "@/components/landing/HowItWorks";
import Faq from "@/components/landing/Faq";
import CtaFinal from "@/components/landing/CtaFinal";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Landing() {
  return (
    <div style={{ background: "var(--bg)" }}>
      <LandingHeader />
      <main>
        <Hero />
        {/* Центр лендинга — интерактивная карта. Карта, статистика и полоса культур
            делят одно состояние через FarmProvider. */}
        <FarmProvider>
          <FarmMap />
          <FarmStats />
          <CropsStrip />
        </FarmProvider>
        <HowItWorks />
        <Faq />
        <CtaFinal />
      </main>
      <LandingFooter />
    </div>
  );
}
