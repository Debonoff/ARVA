import { useEffect, useState } from "react";

/** True after first client mount — used to avoid SSR/localStorage hydration flashes. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
