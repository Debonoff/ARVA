"use client";

import { useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const LANGS = [
  { code: "ru", label: "Рус" },
  { code: "kk", label: "Қаз" },
  { code: "en", label: "Eng" },
];

/**
 * Visual language switcher. Real locale routing is wired in the i18n task
 * (#29); for now it reflects the selection in local state.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("ru");
  const current = LANGS.find((l) => l.code === active) ?? LANGS[0];

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
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                onClick={() => {
                  setActive(l.code);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-paper-soft"
              >
                {l.label}
                {active === l.code && <Check className="h-4 w-4 text-brand" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
