import { CalendarClock, Map, Wallet } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";

const steps = [
  {
    n: "01",
    icon: Map,
    title: "Разметьте карту",
    desc: "Создайте теплицу, задайте размеры и выделите грядки под культуры на сетке 1 м².",
  },
  {
    n: "02",
    icon: CalendarClock,
    title: "Рассчитайте урожай",
    desc: "Arva прогнозирует дату сбора по индексу роста с учётом среды и корректирует её при изменениях.",
  },
  {
    n: "03",
    icon: Wallet,
    title: "Считайте экономику",
    desc: "Оцените урожайность, себестоимость и ожидаемую прибыль по каждой грядке и теплице целиком.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-20">
      <div className="max-w-2xl">
        <p className="font-display text-sm font-bold tracking-wide text-brand uppercase">
          Как это работает
        </p>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Три шага до умной теплицы
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
