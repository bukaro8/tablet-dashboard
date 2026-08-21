"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type WakeLockStatus =
  | "checking"
  | "active"
  | "needs-interaction"
  | "unsupported";

export interface WakeLockController {
  status: WakeLockStatus;
  requestFromInteraction: () => Promise<void>;
}

export function useWakeLock(): WakeLockController {
  const [status, setStatus] = useState<WakeLockStatus>("checking");
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const requestRef = useRef<Promise<void> | null>(null);
  const mountedRef = useRef(false);

  const requestLock = useCallback(async () => {
    if (requestRef.current) return requestRef.current;
    if (!navigator.wakeLock) {
      setStatus("unsupported");
      return;
    }
    if (document.visibilityState !== "visible") return;
    if (sentinelRef.current && !sentinelRef.current.released) {
      setStatus("active");
      return;
    }

    const request = navigator.wakeLock
      .request("screen")
      .then((sentinel) => {
        if (!mountedRef.current) {
          void sentinel.release();
          return;
        }
        sentinelRef.current = sentinel;
        setStatus("active");
        sentinel.addEventListener(
          "release",
          () => {
            if (sentinelRef.current === sentinel) {
              sentinelRef.current = null;
              if (mountedRef.current && document.visibilityState === "visible") {
                setStatus("needs-interaction");
              }
            }
          },
          { once: true },
        );
      })
      .catch(() => {
        if (mountedRef.current) setStatus("needs-interaction");
      })
      .finally(() => {
        requestRef.current = null;
      });

    requestRef.current = request;
    return request;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    queueMicrotask(() => {
      if (mountedRef.current) void requestLock();
    });

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void requestLock();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      mountedRef.current = false;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      const sentinel = sentinelRef.current;
      sentinelRef.current = null;
      if (sentinel && !sentinel.released) void sentinel.release();
    };
  }, [requestLock]);

  return { status, requestFromInteraction: requestLock };
}
