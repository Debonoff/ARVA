import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "brand";

const tones: Record<Tone, string> = {
  neutral: "border-line bg-paper-soft text-muted",
  brand: "border-brand-200 bg-brand-50 text-brand-dark",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
