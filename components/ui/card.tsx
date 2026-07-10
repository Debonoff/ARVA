import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  dark = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { dark?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-3xl border p-6",
        dark ? "border-white/10 bg-ink text-paper" : "border-line bg-paper text-ink shadow-card",
        className,
      )}
      {...props}
    />
  );
}
