import { formatForecastHour, formatTemperature } from "@/lib/time";
import { getWeatherDescriptor } from "@/lib/weather/codes";
import type { HourlyForecastItem } from "@/lib/weather/types";
import { WeatherIcon } from "./weather-icon";

interface HourlyForecastProps {
  items: HourlyForecastItem[];
}

export function HourlyForecast({ items }: HourlyForecastProps) {
  const slots: Array<HourlyForecastItem | null> = Array.from(
    { length: 5 },
    (_, index) => items[index] ?? null,
  );

  return (
    <section aria-label="Pronóstico por horas" className="hourly-grid">
      {slots.map((item, index) => {
        if (!item) {
          return (
            <div className="hourly-item text-white/35" key={`empty-${index}`}>
              <span>--:--</span><span className="hourly-placeholder">—</span><span>--°</span>
            </div>
          );
        }
        const descriptor = getWeatherDescriptor(item.weatherCode);
        return (
          <div className="hourly-item" key={item.time}>
            <time dateTime={item.time}>{formatForecastHour(item.time)}</time>
            <WeatherIcon
              icon={descriptor.icon}
              tone={descriptor.tone}
              className="hourly-icon"
              label={descriptor.label}
            />
            <span>{formatTemperature(item.temperatureC)}</span>
          </div>
        );
      })}
    </section>
  );
}
