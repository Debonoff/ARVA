import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "ink" | "brand" | "soft";

const tones: Record<Tone, string> = {
  ink: "bg-ink text-paper",
  brand: "bg-brand text-white",
  soft: "bg-brand-50 text-brand-dark",
};

/** Rounded square container for an icon (e.g. lucide-react glyph). */
export function IconBadge({
  className,
  tone = "ink",
  children,
}: {
  className?: string;
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
