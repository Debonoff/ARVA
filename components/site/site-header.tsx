"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  const nav = [
    { href: "#features", label: t("nav.features") },
    { href: "#how", label: t("nav.how") },
    { href: "#faq", label: t("nav.faq") },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors",
        scrolled
          ? "border-b border-line bg-paper/80 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="Arva">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((i) => (
            <a
              key={i.href}
              href={i.href}
              className="text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              {i.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            {t("nav.login")}
          </Link>
          <Link href="/register" className={buttonVariants({ variant: "primary", size: "sm" })}>
            {t("nav.register")}
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line md:hidden"
          onClick={() => setMenu((m) => !m)}
          aria-label="Menu"
          aria-expanded={menu}
        >
          {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menu && (
        <div className="border-t border-line bg-paper md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4">
            {nav.map((i) => (
              <a
                key={i.href}
                href={i.href}
                onClick={() => setMenu(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-paper-soft"
              >
                {i.label}
              </a>
            ))}
            <div className="mt-2 flex items-center gap-3">
              <Link
                href="/login"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "flex-1",
                })}
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/register"
                className={buttonVariants({
                  variant: "primary",
                  size: "sm",
                  className: "flex-1",
                })}
              >
                {t("nav.register")}
              </Link>
            </div>
            <div className="mt-3">
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
