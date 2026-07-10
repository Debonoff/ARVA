import { ArrowRight, CalendarClock, Calculator, Map } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";

const items = [
  {
    icon: Map,
    title: "Карта теплиц",
    desc: "Сетка 1 м², выделение грядок, цветовые культуры",
  },
  {
    icon: CalendarClock,
    title: "Калькулятор урожая",
    desc: "Дата сбора с учётом температуры и влажности",
  },
  {
    icon: Calculator,
    title: "Учёт себестоимости",
    desc: "Прогноз урожайности и прибыли по каждой грядке",
  },
];

export function FeatureRows() {
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
