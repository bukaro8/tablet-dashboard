import { beforeEach, describe, expect, it } from "vitest";
import { buildWeatherUrl, normalizeWeatherResponse } from "./api";
import {
  isWeatherSnapshotStale,
  readWeatherCache,
  WEATHER_CACHE_KEY,
  writeWeatherCache,
} from "./cache";
import { getWeatherDescriptor } from "./codes";
import type { OpenMeteoResponse } from "./types";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

let storage: Storage;

const response: OpenMeteoResponse = {
  current: {
    temperature_2m: 18.4,
    apparent_temperature: 17.8,
    relative_humidity_2m: 61,
    wind_speed_10m: 12.2,
    weather_code: 2,
    is_day: 1,
  },
  hourly: {
    time: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00"].map(
      (time) => `2026-08-21T${time}`,
    ),
    temperature_2m: [18, 19, 20, 21, 20, 19],
    weather_code: [1, 0, 2, 2, 3, 3],
  },
  daily: {
    time: ["2026-08-21", "2026-08-22", "2026-08-23", "2026-08-24", "2026-08-25"],
    temperature_2m_max: [21, 22, 19, 20, 21],
    temperature_2m_min: [11, 12, 10, 11, 12],
    weather_code: [0, 2, 3, 2, 0],
  },
};

describe("weather pipeline", () => {
  beforeEach(() => { storage = new MemoryStorage(); });

  it("requests the exact London fields without an API key", () => {
    const url = new URL(buildWeatherUrl());
    expect(url.hostname).toBe("api.open-meteo.com");
    expect(url.searchParams.get("timezone")).toBe("Europe/London");
    expect(url.searchParams.get("forecast_hours")).toBe("6");
    expect(url.searchParams.get("forecast_days")).toBe("5");
    expect(url.searchParams.has("apikey")).toBe(false);
  });

  it("normalizes current data, skips the current hour, and keeps five days", () => {
    const snapshot = normalizeWeatherResponse(response, 1000);
    expect(snapshot.current.temperatureC).toBe(18.4);
    expect(snapshot.hourly).toHaveLength(5);
    expect(snapshot.hourly[0].time).toBe("2026-08-21T11:00");
    expect(snapshot.daily).toHaveLength(5);
    expect(snapshot.fetchedAt).toBe(1000);
  });

  it.each([
    [0, "Despejado"], [2, "Parcialmente nublado"], [3, "Nublado"],
    [45, "Niebla"], [55, "Llovizna"], [67, "Lluvia"],
    [75, "Nieve"], [99, "Tormenta"], [999, "Tiempo variable"],
  ])("maps WMO code %s", (code, label) => {
    expect(getWeatherDescriptor(code).label).toBe(label);
  });

  it("uses a versioned local cache and detects staleness", () => {
    const snapshot = normalizeWeatherResponse(response, 1000);
    writeWeatherCache(storage, snapshot);
    expect(storage.getItem(WEATHER_CACHE_KEY)).not.toBeNull();
    expect(readWeatherCache(storage)).toEqual(snapshot);
    expect(isWeatherSnapshotStale(snapshot, 1000 + 19 * 60 * 1000)).toBe(false);
    expect(isWeatherSnapshotStale(snapshot, 1000 + 20 * 60 * 1000)).toBe(true);
  });

  it("ignores malformed cached data", () => {
    storage.setItem(WEATHER_CACHE_KEY, "{broken");
    expect(readWeatherCache(storage)).toBeNull();
    storage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ fetchedAt: 1 }));
    expect(readWeatherCache(storage)).toBeNull();
  });
});
