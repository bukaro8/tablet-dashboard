import { formatForecastWeekday, formatTemperature } from "@/lib/time";
import { getWeatherDescriptor } from "@/lib/weather/codes";
import type { DailyForecastItem } from "@/lib/weather/types";
import { WeatherIcon } from "./weather-icon";

interface DailyForecastProps {
  items: DailyForecastItem[];
}

export function DailyForecast({ items }: DailyForecastProps) {
  const slots: Array<DailyForecastItem | null> = Array.from(
    { length: 5 },
    (_, index) => items[index] ?? null,
  );

  return (
    <section aria-label="Pronóstico de cinco días" className="daily-list">
      {slots.map((item, index) => {
        if (!item) {
          return (
            <div className="daily-row text-white/35" key={`empty-${index}`}>
              <span>—</span><span>—</span><span>--°</span><span>--°</span>
            </div>
          );
        }
        const descriptor = getWeatherDescriptor(item.weatherCode);
        return (
          <div className="daily-row" key={item.date}>
            <time dateTime={item.date}>{formatForecastWeekday(item.date)}</time>
            <WeatherIcon
              icon={descriptor.icon}
              tone={descriptor.tone}
              className="daily-icon"
              label={descriptor.label}
            />
            <span className="font-medium">{formatTemperature(item.maximumC)}</span>
            <span className="text-white/62">{formatTemperature(item.minimumC)}</span>
          </div>
        );
      })}
    </section>
  );
}
