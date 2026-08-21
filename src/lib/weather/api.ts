import { DASHBOARD_CONFIG } from "@/config/dashboard";
import type {
  OpenMeteoResponse,
  WeatherSnapshot,
} from "@/lib/weather/types";

const OPEN_METEO_ENDPOINT = "https://api.open-meteo.com/v1/forecast";

export function buildWeatherUrl(): string {
  const { location } = DASHBOARD_CONFIG;
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day",
    hourly: "temperature_2m,weather_code",
    daily: "temperature_2m_max,temperature_2m_min,weather_code",
    forecast_hours: "6",
    forecast_days: "5",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    timezone: location.timezone,
  });

  return `${OPEN_METEO_ENDPOINT}?${params.toString()}`;
}

function isOpenMeteoResponse(value: unknown): value is OpenMeteoResponse {
  if (!value || typeof value !== "object") return false;
  const response = value as Partial<OpenMeteoResponse>;
  return Boolean(
    response.current &&
      response.hourly &&
      response.daily &&
      Array.isArray(response.hourly.time) &&
      Array.isArray(response.hourly.temperature_2m) &&
      Array.isArray(response.hourly.weather_code) &&
      Array.isArray(response.daily.time) &&
      Array.isArray(response.daily.temperature_2m_max) &&
      Array.isArray(response.daily.temperature_2m_min) &&
      Array.isArray(response.daily.weather_code),
  );
}

export function normalizeWeatherResponse(
  response: OpenMeteoResponse,
  fetchedAt = Date.now(),
): WeatherSnapshot {
  return {
    current: {
      temperatureC: response.current.temperature_2m,
      feelsLikeC: response.current.apparent_temperature,
      humidityPercent: response.current.relative_humidity_2m,
      windKph: response.current.wind_speed_10m,
      weatherCode: response.current.weather_code,
      isDay: response.current.is_day === 1,
    },
    hourly: response.hourly.time.slice(1, 6).map((time, index) => ({
      time,
      temperatureC: response.hourly.temperature_2m[index + 1],
      weatherCode: response.hourly.weather_code[index + 1],
    })),
    daily: response.daily.time.slice(0, 5).map((date, index) => ({
      date,
      maximumC: response.daily.temperature_2m_max[index],
      minimumC: response.daily.temperature_2m_min[index],
      weatherCode: response.daily.weather_code[index],
    })),
    fetchedAt,
  };
}

export async function fetchWeather(signal?: AbortSignal): Promise<WeatherSnapshot> {
  const response = await fetch(buildWeatherUrl(), {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with ${response.status}`);
  }

  const payload: unknown = await response.json();
  if (!isOpenMeteoResponse(payload)) {
    throw new Error("Open-Meteo returned an unexpected response");
  }

  return normalizeWeatherResponse(payload);
}
