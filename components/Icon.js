"use client";

// Единая обёртка над lucide-react (issue 34).
// Иконки берём ТОЛЬКО из lucide-react. Никаких произвольных SVG.
// Единый размер и толщина линии по всему интерфейсу задаются здесь.

export const ICON = {
  size: 18, // md по умолчанию
  sm: 16,
  lg: 20,
  stroke: 1.75,
};

// Использование: import { Sprout } from "lucide-react";
//                <Icon as={Sprout} />  |  <Icon as={Sprout} size="lg" />
export default function Icon({ as: Cmp, size = "md", strokeWidth = ICON.stroke, className, ...rest }) {
  if (!Cmp) return null;
  const px = typeof size === "number" ? size : ICON[size] ?? ICON.size;
  return <Cmp size={px} strokeWidth={strokeWidth} className={className} aria-hidden="true" {...rest} />;
}
