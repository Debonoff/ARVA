"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanding } from "@/components/landing/copy";

export default function Hero() {
  const c = useLanding();
  return (
    <section className="lp-hero">
      <div className="container">
        <div className="lp-eyebrow">{c.hero.eyebrow}</div>
        <h1>{c.hero.title}</h1>
        <p className="lp-hero-sub">{c.hero.sub}</p>
        <div className="lp-hero-cta">
          <Link href="/login" className="btn btn-accent btn-lg">
            {c.hero.ctaPrimary} <ArrowRight size={18} strokeWidth={1.75} />
          </Link>
          <a href="#map" className="btn btn-secondary btn-lg">
            {c.hero.ctaSecondary}
          </a>
        </div>
        <p className="lp-hero-note">{c.hero.note}</p>
      </div>
    </section>
  );
}
