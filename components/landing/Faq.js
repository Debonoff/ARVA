"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanding } from "@/components/landing/copy";

export default function Faq() {
  const c = useLanding();
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="lp-section" style={{ background: "var(--surface-2)" }}>
      <div className="container">
        <div className="lp-center">
          <div className="lp-eyebrow">{c.faq.eyebrow}</div>
          <h2 className="lp-h2">{c.faq.title}</h2>
        </div>
        <div className="lp-faq">
          {c.faq.items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div className="lp-faq-item" key={i}>
                <button className="lp-faq-q" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : i)}>
                  {it.q}
                  <ChevronDown size={18} strokeWidth={1.75} className={`lp-faq-ic ${isOpen ? "open" : ""}`} />
                </button>
                <div className={`lp-faq-a ${isOpen ? "open" : ""}`}>
                  <p>{it.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
