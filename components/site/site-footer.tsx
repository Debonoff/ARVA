import Link from "next/link";
import { Logo } from "@/components/site/logo";

const cols: { title: string; links: [string, string][] }[] = [
  {
    title: "Продукт",
    links: [
      ["Возможности", "#features"],
      ["Как это работает", "#how"],
      ["FAQ", "#faq"],
    ],
  },
  {
    title: "Аккаунт",
    links: [
      ["Войти", "/login"],
      ["Регистрация", "/register"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">
            Умный учёт теплиц: карта грядок, прогноз урожая и экономика в одном приложении.
          </p>
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
          <span>© 2026 Arva. Все права защищены.</span>
          <a href="mailto:hello@arva.app" className="hover:text-ink">
            hello@arva.app
          </a>
        </div>
      </div>
    </footer>
  );
}
