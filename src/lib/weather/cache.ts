import { DASHBOARD_CONFIG } from "@/config/dashboard";
import type { WeatherSnapshot } from "@/lib/weather/types";

export const WEATHER_CACHE_KEY = "pantalla-londres:weather:v1";

export function isWeatherSnapshot(value: unknown): value is WeatherSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<WeatherSnapshot>;
  return Boolean(
    snapshot.current &&
      Array.isArray(snapshot.hourly) &&
      Array.isArray(snapshot.daily) &&
      typeof snapshot.fetchedAt === "number",
  );
}

export function isWeatherSnapshotStale(
  snapshot: WeatherSnapshot,
  now = Date.now(),
): boolean {
  return now - snapshot.fetchedAt >= DASHBOARD_CONFIG.weatherRefreshMs;
}

export function readWeatherCache(storage: Storage): WeatherSnapshot | null {
  try {
    const raw = storage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isWeatherSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeWeatherCache(
  storage: Storage,
  snapshot: WeatherSnapshot,
): void {
  try {
    storage.setItem(WEATHER_CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage can be unavailable in private or quota-restricted contexts.
  }
}
