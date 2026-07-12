"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sprout, Menu, X } from "lucide-react";
import { useAuth } from "@/components/providers";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanding } from "@/components/landing/copy";

export default function LandingHeader() {
  const c = useLanding();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#map", label: c.nav.map },
    { href: "#crops", label: c.nav.crops },
    { href: "#how", label: c.nav.how },
    { href: "#faq", label: c.nav.faq },
  ];
  const appHref = user ? "/dashboard" : "/login";
  const appLabel = user ? c.nav.dashboard : c.nav.signin;

  return (
    <header className={`lp-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="container">
        <div className="lp-nav-inner">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 30, height: 30, borderRadius: "var(--radius)", background: "var(--ink)", display: "grid", placeItems: "center" }}>
              <Sprout size={17} strokeWidth={1.75} color="var(--accent)" />
            </span>
            <span className="display" style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>Arva</span>
          </Link>

          <nav className="lp-nav-links">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="lp-nav-link">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="lp-nav-right">
            <LanguageSwitcher />
            <Link href={appHref} className="btn btn-primary btn-sm">
              {appLabel}
            </Link>
            <button
              className="btn btn-ghost btn-icon btn-sm lp-nav-toggle"
              onClick={() => setOpen((v) => !v)}
              aria-label={c.nav.features}
              aria-expanded={open}
            >
              {open ? <X size={18} strokeWidth={1.75} /> : <Menu size={18} strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        <div className={`lp-mobile ${open ? "open" : ""}`}>
          {links.map((l) => (
            <a key={l.href} href={l.href} className="navitem" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
