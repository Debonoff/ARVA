"use client";

import Link from "next/link";
import { Sprout } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanding } from "@/components/landing/copy";

export default function LandingFooter() {
  const c = useLanding();
  return (
    <footer className="lp-footer">
      <div className="container">
        <div className="lp-footer-grid">
          <div className="lp-footer-col">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ width: 28, height: 28, borderRadius: "var(--radius)", background: "var(--ink)", display: "grid", placeItems: "center" }}>
                <Sprout size={16} strokeWidth={1.75} color="var(--accent)" />
              </span>
              <span className="display" style={{ fontSize: 18, fontWeight: 600 }}>Arva</span>
            </div>
            <p className="muted" style={{ fontSize: 14, maxWidth: 260, margin: 0 }}>{c.footer.tagline}</p>
          </div>

          <div className="lp-footer-col">
            <h4>{c.footer.product}</h4>
            <a href="#map" className="lp-footer-link">{c.nav.map}</a>
            <a href="#crops" className="lp-footer-link">{c.nav.crops}</a>
            <a href="#how" className="lp-footer-link">{c.nav.how}</a>
            <a href="#faq" className="lp-footer-link">{c.nav.faq}</a>
          </div>

          <div className="lp-footer-col">
            <h4>{c.footer.account}</h4>
            <Link href="/login" className="lp-footer-link">{c.nav.signin}</Link>
            <a href="mailto:hello@arva.app" className="lp-footer-link">hello@arva.app</a>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <span className="muted" style={{ fontSize: 13 }}>© 2026 Arva. {c.footer.rights}</span>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
