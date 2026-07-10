import Link from "next/link";
import { Logo } from "@/components/site/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-5 py-12">
      <Link href="/" className="mb-8" aria-label="Arva — на главную">
        <Logo />
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
