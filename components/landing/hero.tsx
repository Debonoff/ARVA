"use client";

import Link from "next/link";
import { Play, Sprout } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { GreenhousePreview } from "@/components/landing/greenhouse-preview";
import { StatsCard } from "@/components/landing/stats-card";
import { Spark, DotGrid } from "@/components/landing/decor";
import { useI18n } from "@/lib/i18n/context";

export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-16 md:py-24 lg:grid-cols-2">
        {/* Left column */}
        <div>
          <Badge tone="brand">
            <Sprout className="h-3.5 w-3.5" /> {t("hero.badge")}
          </Badge>
          <h1 className="mt-5 font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {t("hero.title1")}
            <br /> {t("hero.title2")}
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">{t("hero.subtitle")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/register" className={buttonVariants({ variant: "primary", size: "lg" })}>
              {t("hero.ctaPrimary")}
            </Link>
            <a href="#how" className={buttonVariants({ variant: "outline", size: "lg" })}>
              <Play className="h-4 w-4 fill-current" /> {t("hero.ctaSecondary")}
            </a>
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm text-muted">
            <div className="flex -space-x-2">
              {["#16a34a", "#22c55e", "#84cc16"].map((c) => (
                <span
                  key={c}
                  className="h-8 w-8 rounded-full border-2 border-paper"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <span>
              {t("hero.socialPre")} <b className="text-ink">120+</b> {t("hero.socialPost")}
            </span>
          </div>
        </div>

        {/* Right column — product preview */}
        <div className="relative">
          <Spark className="absolute -top-6 -left-4 z-10 h-16 w-16 text-brand" />
          <DotGrid className="absolute -right-4 -bottom-6 text-line" />
          <div className="relative rounded-[2rem] bg-paper-soft p-4 sm:p-6">
            <GreenhousePreview />
            <StatsCard className="absolute -bottom-6 -left-4 hidden sm:block" />
            <div className="absolute top-10 right-6 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-float">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <Play className="h-3 w-3 fill-current" />
              </span>
              {t("hero.demo")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
