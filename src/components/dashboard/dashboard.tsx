"use client";

import { useDashboardClock } from "@/hooks/use-dashboard-clock";
import { useWeather } from "@/hooks/use-weather";
import { DynamicBackground } from "./dynamic-background";
import { RadioPlayer } from "./radio-player";
import { TimeCards } from "./time-cards";
import { WakeLockManager } from "./wake-lock-manager";
import { WeatherPanel } from "./weather-panel";

export function Dashboard() {
  const now = useDashboardClock();
  const weather = useWeather();

  return (
    <main className="dashboard-shell">
      <aside className="weather-region">
        <WeatherPanel weather={weather} />
      </aside>
      <section className="clock-region" aria-label="Horas y radio">
        <DynamicBackground now={now} />
        <div className="right-stack">
          <div className="time-region">
            <TimeCards now={now} />
          </div>
          <div className="radio-region">
            <RadioPlayer />
          </div>
        </div>
      </section>
      <WakeLockManager />
    </main>
  );
}
