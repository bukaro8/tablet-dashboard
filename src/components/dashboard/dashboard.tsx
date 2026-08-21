"use client";

import { useDashboardClock } from "@/hooks/use-dashboard-clock";
import { useWeather } from "@/hooks/use-weather";
import { ColombiaClock } from "./colombia-clock";
import { DynamicBackground } from "./dynamic-background";
import { MainClock } from "./main-clock";
import { RadioPlayer } from "./radio-player";
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
      <section className="clock-region" aria-label="Hora de Londres">
        <DynamicBackground now={now} />
        <div className="right-stack">
          <div className="london-region">
            <MainClock now={now} />
          </div>
          <div className="radio-region">
            <RadioPlayer />
          </div>
        </div>
      </section>
      <section className="colombia-region" aria-label="Hora de Colombia">
        <ColombiaClock now={now} />
      </section>
      <WakeLockManager />
    </main>
  );
}
