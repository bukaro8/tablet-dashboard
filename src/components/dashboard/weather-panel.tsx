import type { WeatherLoadState } from "@/lib/weather/types";
import { CurrentWeather } from "./current-weather";
import { DailyForecast } from "./daily-forecast";
import { HourlyForecast } from "./hourly-forecast";

interface WeatherPanelProps {
  weather: WeatherLoadState;
}

export function WeatherPanel({ weather }: WeatherPanelProps) {
  const data = weather.data;
  return (
    <div className="weather-panel">
      <CurrentWeather conditions={data?.current ?? null} />
      <div className="weather-separator" />
      <HourlyForecast items={data?.hourly ?? []} />
      <div className="weather-separator weather-separator-tight" />
      <DailyForecast items={data?.daily ?? []} />
      <p className="sr-only" aria-live="polite">
        {weather.status === "unavailable"
          ? "No se han podido cargar los datos meteorológicos."
          : weather.isStale
            ? "Mostrando el último pronóstico guardado."
            : "Pronóstico actualizado."}
      </p>
    </div>
  );
}
