"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, Sprout, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cn } from "@/lib/utils";

async function signOut() {
  if (isSupabaseConfigured) {
    await createClient().auth.signOut();
  }
  window.location.href = "/";
}

const NAV = [
  { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { href: "/greenhouses", label: "Теплицы", icon: Sprout },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex min-h-full">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-line bg-paper p-4 transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="Arva — на главную">
            <Logo />
          </Link>
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Закрыть меню"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-ink text-paper"
                  : "text-muted hover:bg-paper-soft hover:text-ink",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="absolute inset-x-4 bottom-4 space-y-2">
          {!isSupabaseConfigured && (
            <div className="rounded-xl border border-line p-3 text-xs text-muted">
              Демо-режим — данные хранятся в браузере. Подключите Supabase, чтобы синхронизировать.
            </div>
          )}
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-paper-soft hover:text-ink"
          >
            <LogOut className="h-5 w-5" />
            Выйти
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/20 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-line px-4 lg:hidden">
          <button type="button" onClick={() => setOpen(true)} aria-label="Открыть меню">
            <Menu className="h-6 w-6" />
          </button>
          <Logo />
        </header>
        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
