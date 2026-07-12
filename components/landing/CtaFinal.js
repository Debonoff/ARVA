"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanding } from "@/components/landing/copy";

export default function CtaFinal() {
  const c = useLanding();
  return (
    <section className="lp-section">
      <div className="container">
        <div className="lp-cta">
          <h2 className="lp-h2" style={{ marginTop: 0 }}>{c.cta.title}</h2>
          <p className="lp-sub" style={{ maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>{c.cta.sub}</p>
          <div style={{ marginTop: 26, display: "flex", justifyContent: "center" }}>
            <Link href="/login" className="btn btn-accent btn-lg">
              {c.cta.button} <ArrowRight size={18} strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
