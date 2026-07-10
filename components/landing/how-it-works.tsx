"use client";

import { CalendarClock, Map, Wallet } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { useI18n } from "@/lib/i18n/context";

export function HowItWorks() {
  const { t } = useI18n();
  const steps = [
    { n: "01", icon: Map, title: t("how.s1t"), desc: t("how.s1d") },
    { n: "02", icon: CalendarClock, title: t("how.s2t"), desc: t("how.s2d") },
    { n: "03", icon: Wallet, title: t("how.s3t"), desc: t("how.s3d") },
  ];

  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-20">
      <div className="max-w-2xl">
        <p className="font-display text-sm font-bold tracking-wide text-brand uppercase">
          {t("how.eyebrow")}
        </p>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {t("how.title")}
        </h2>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map(({ n, icon: Icon, title, desc }) => (
          <div key={n} className="rounded-3xl border border-line bg-paper p-6 shadow-card">
            <div className="flex items-center justify-between">
              <IconBadge tone="soft">
                <Icon className="h-5 w-5" />
              </IconBadge>
              <span className="font-display text-2xl font-extrabold text-line">{n}</span>
            </div>
            <h3 className="mt-5 font-display text-lg font-bold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
