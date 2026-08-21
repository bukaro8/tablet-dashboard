"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DASHBOARD_CONFIG } from "@/config/dashboard";
import { fetchWeather } from "@/lib/weather/api";
import {
  isWeatherSnapshotStale,
  readWeatherCache,
  writeWeatherCache,
} from "@/lib/weather/cache";
import type { WeatherLoadState, WeatherSnapshot } from "@/lib/weather/types";

const INITIAL_STATE: WeatherLoadState = {
  status: "loading",
  data: null,
  isStale: false,
};

export function useWeather(): WeatherLoadState {
  const [state, setState] = useState<WeatherLoadState>(INITIAL_STATE);
  const dataRef = useRef<WeatherSnapshot | null>(null);
  const requestRef = useRef<Promise<void> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const refresh = useCallback(() => {
    if (requestRef.current) return requestRef.current;

    const controller = new AbortController();
    controllerRef.current = controller;
    const request = fetchWeather(controller.signal)
      .then((snapshot) => {
        dataRef.current = snapshot;
        writeWeatherCache(window.localStorage, snapshot);
        setState({ status: "ready", data: snapshot, isStale: false });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        const cached = dataRef.current;
        setState({
          status: cached ? "ready" : "unavailable",
          data: cached,
          isStale: Boolean(cached),
        });
      })
      .finally(() => {
        requestRef.current = null;
        controllerRef.current = null;
      });

    requestRef.current = request;
    return request;
  }, []);

  useEffect(() => {
    let isActive = true;
    const cached = readWeatherCache(window.localStorage);
    dataRef.current = cached;

    queueMicrotask(() => {
      if (!isActive) return;
      if (cached) {
        const stale = isWeatherSnapshotStale(cached);
        setState({ status: "ready", data: cached, isStale: stale });
        if (stale) void refresh();
      } else {
        void refresh();
      }
    });

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, DASHBOARD_CONFIG.weatherRefreshMs);

    const onVisibilityChange = () => {
      const snapshot = dataRef.current;
      if (
        document.visibilityState === "visible" &&
        (!snapshot || isWeatherSnapshotStale(snapshot))
      ) {
        void refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      controllerRef.current?.abort();
    };
  }, [refresh]);

  return state;
}
