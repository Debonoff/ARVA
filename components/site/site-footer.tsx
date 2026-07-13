"use client";

import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { useI18n } from "@/lib/i18n/context";

export function SiteFooter() {
  const { t } = useI18n();
  const cols: { title: string; links: [string, string][] }[] = [
    {
      title: t("footer.product"),
      links: [
        [t("nav.map"), "#map"],
        [t("nav.crops"), "#crops"],
        [t("nav.how"), "#how"],
        [t("nav.faq"), "#faq"],
      ],
    },
    {
      title: t("footer.account"),
      links: [
        [t("nav.login"), "/login"],
        [t("nav.register"), "/register"],
      ],
    },
  ];

  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">{t("footer.tagline")}</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="font-display text-sm font-bold tracking-wide text-ink uppercase">
              {c.title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {c.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-muted hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-sm text-muted sm:flex-row">
          <span>© 2026 Arva. {t("footer.rights")}</span>
          <a href="mailto:hello@arva.app" className="hover:text-ink">
            hello@arva.app
          </a>
        </div>
      </div>
    </footer>
  );
}
