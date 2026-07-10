import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-5 py-24 text-center">
      <Logo />
      <p className="mt-10 font-display text-7xl font-extrabold text-ink">404</p>
      <p className="mt-3 text-muted">Страница не найдена.</p>
      <Link href="/" className={buttonVariants({ className: "mt-8" })}>
        На главную
      </Link>
    </div>
  );
}
