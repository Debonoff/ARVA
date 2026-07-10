"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const faqs = [
  {
    q: "Нужны ли специальные датчики?",
    a: "Нет. Условия среды можно вводить вручную; при наличии датчиков данные можно будет подключить позже.",
  },
  {
    q: "Какие культуры поддерживаются?",
    a: "Справочник включает основные тепличные культуры (клубника, томат, огурец, салат и др.) с параметрами роста и цен.",
  },
  {
    q: "Как считается дата сбора?",
    a: "По дневному индексу роста Gi с коэффициентами гидропоники, температуры и влажности — он накапливается до зрелости.",
  },
  {
    q: "На каких языках доступна платформа?",
    a: "Русский, казахский и английский — язык переключается в шапке сайта.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-6xl px-5 py-20">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <p className="font-display text-sm font-bold tracking-wide text-brand uppercase">FAQ</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Частые вопросы
          </h2>
          <p className="mt-4 text-muted">Не нашли ответ? Напишите нам — поможем разобраться.</p>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="rounded-2xl border border-line bg-paper">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
                aria-expanded={open === i}
              >
                <span className="font-medium text-ink">{f.q}</span>
                {open === i ? (
                  <Minus className="h-5 w-5 shrink-0 text-brand" />
                ) : (
                  <Plus className="h-5 w-5 shrink-0 text-muted" />
                )}
              </button>
              {open === i && <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative mt-16 overflow-hidden rounded-[2rem] bg-ink px-6 py-14 text-center sm:px-12">
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold tracking-tight text-paper sm:text-4xl">
          Готовы вырастить больше?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-white/70">
          Заведите первую теплицу за пару минут и получите прогноз урожая уже сегодня.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/register" className={buttonVariants({ variant: "accent", size: "lg" })}>
            Начать бесплатно
          </Link>
        </div>
      </div>
    </section>
  );
}
