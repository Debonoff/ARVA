"use client";

import { useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { LOCALES } from "@/lib/i18n/dictionaries";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-sm font-medium text-ink hover:bg-paper-soft"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="h-4 w-4 text-muted" />
        {current.label}
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>
      {open && (
        <ul
          className="absolute right-0 z-50 mt-2 w-32 rounded-2xl border border-line bg-paper p-1 shadow-float"
          role="listbox"
        >
          {LOCALES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-paper-soft"
              >
                {l.label}
                {locale === l.code && <Check className="h-4 w-4 text-brand" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
