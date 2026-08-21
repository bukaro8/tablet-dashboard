import { DASHBOARD_CONFIG } from "@/config/dashboard";
import { formatTemperature } from "@/lib/time";
import { getWeatherDescriptor } from "@/lib/weather/codes";
import type { CurrentConditions } from "@/lib/weather/types";
import { WeatherIcon } from "./weather-icon";

interface CurrentWeatherProps {
  conditions: CurrentConditions | null;
}

export function CurrentWeather({ conditions }: CurrentWeatherProps) {
  if (!conditions) {
    return (
      <section aria-label="Tiempo actual" className="min-w-0">
        <div className="weather-condition text-white/55">Tiempo no disponible</div>
        <div className="current-temperature text-white/45">--°C</div>
        <h1 className="location-name">{DASHBOARD_CONFIG.location.name}</h1>
        <div className="weather-metrics text-white/45">
          <span>Sensación --°</span><span>Humedad --%</span><span>Viento -- km/h</span>
        </div>
      </section>
    );
  }

  const descriptor = getWeatherDescriptor(conditions.weatherCode, conditions.isDay);

  return (
    <section aria-label="Tiempo actual" className="min-w-0">
      <div className="weather-condition">
        <WeatherIcon icon={descriptor.icon} tone={descriptor.tone} className="size-[1.55em] shrink-0" />
        <span>{descriptor.label}</span>
      </div>
      <div className="current-temperature">
        {formatTemperature(conditions.temperatureC, true)}
      </div>
      <h1 className="location-name">{DASHBOARD_CONFIG.location.name}</h1>
      <div className="weather-metrics">
        <span>Sensación {formatTemperature(conditions.feelsLikeC)}</span>
        <span>Humedad {Math.round(conditions.humidityPercent)}%</span>
        <span>Viento {Math.round(conditions.windKph)} km/h</span>
      </div>
    </section>
  );
}
