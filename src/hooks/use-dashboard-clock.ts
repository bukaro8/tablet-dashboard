"use client";

import { useEffect, useState } from "react";

export function useDashboardClock(): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const tick = () => setNow(new Date());
    tick();

    const timeoutId = setTimeout(() => {
      tick();
      intervalId = setInterval(tick, 1000);
    }, 1000 - (Date.now() % 1000));

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return now;
}
