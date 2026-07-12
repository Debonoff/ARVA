"use client";

import { Card } from "@/components/ui";
import { useLanding } from "@/components/landing/copy";

export default function HowItWorks() {
  const c = useLanding();
  return (
    <section id="how" className="lp-section" style={{ background: "var(--surface-2)" }}>
      <div className="container">
        <div className="lp-center">
          <div className="lp-eyebrow">{c.how.eyebrow}</div>
          <h2 className="lp-h2">{c.how.title}</h2>
          <p className="lp-sub">{c.how.sub}</p>
        </div>
        <div className="lp-grid-3">
          {c.how.steps.map((s, i) => (
            <Card key={i} padding={24}>
              <div className="lp-step-n">0{i + 1}</div>
              <h3 className="lp-card-title">{s.title}</h3>
              <p className="lp-card-text">{s.text}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
