"use client";

import { useEffect, useState } from "react";

/**
 * Ticking clock, null until mounted (avoids SSR/client hydration mismatch
 * since the server has no notion of "now" for a static export).
 */
export function useNow(intervalMs = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = setInterval(tick, intervalMs);
    const initial = setTimeout(tick, 0);
    return () => {
      clearInterval(id);
      clearTimeout(initial);
    };
  }, [intervalMs]);

  return now;
}
