"use client";

import { ArrowRight, CalendarClock, Calculator, Map } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { useI18n } from "@/lib/i18n/context";

export function FeatureRows() {
  const { t } = useI18n();
  const items = [
    { icon: Map, title: t("features.mapTitle"), desc: t("features.mapDesc") },
    {
      icon: CalendarClock,
      title: t("features.calcTitle"),
      desc: t("features.calcDesc"),
    },
    {
      icon: Calculator,
      title: t("features.costTitle"),
      desc: t("features.costDesc"),
    },
  ];

  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-8">
      <div className="divide-y divide-line rounded-3xl border border-line bg-paper">
        {items.map(({ icon: Icon, title, desc }) => (
          <a
            key={title}
            href="#how"
            className="group flex items-center gap-4 p-5 transition-colors hover:bg-paper-soft sm:p-6"
          >
            <IconBadge>
              <Icon className="h-5 w-5" />
            </IconBadge>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold tracking-wide text-ink uppercase">
                {title}
              </p>
              <p className="mt-0.5 text-sm text-muted">{desc}</p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand" />
          </a>
        ))}
      </div>
    </section>
  );
}
