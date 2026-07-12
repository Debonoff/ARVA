"use client";

import { Grid3x3, CalendarClock, BellRing, Wallet, Languages, Cloud } from "lucide-react";
import { Card } from "@/components/ui";
import { useLanding } from "@/components/landing/copy";

const ICONS = [Grid3x3, CalendarClock, BellRing, Wallet, Languages, Cloud];

export default function Features() {
  const c = useLanding();
  return (
    <section id="features" className="lp-section">
      <div className="container">
        <div className="lp-center">
          <div className="lp-eyebrow">{c.features.eyebrow}</div>
          <h2 className="lp-h2">{c.features.title}</h2>
          <p className="lp-sub">{c.features.sub}</p>
        </div>
        <div className="lp-grid-3">
          {c.features.items.map((it, i) => {
            const Ic = ICONS[i] || Grid3x3;
            return (
              <Card key={i} padding={24} hover>
                <div className="lp-feature-ic">
                  <Ic size={20} strokeWidth={1.75} />
                </div>
                <h3 className="lp-card-title">{it.title}</h3>
                <p className="lp-card-text">{it.text}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
