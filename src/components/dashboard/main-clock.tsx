import { DASHBOARD_CONFIG } from "@/config/dashboard";
import { formatFullDate, formatTime } from "@/lib/time";

interface MainClockProps {
  now: Date | null;
}

export function MainClock({ now }: MainClockProps) {
  const time = now ? formatTime(now, DASHBOARD_CONFIG.location.timezone) : "--:--";
  const date = now
    ? formatFullDate(now, DASHBOARD_CONFIG.location.timezone)
    : "Cargando fecha";

  return (
    <div className="main-clock">
      <time className="main-time" dateTime={now?.toISOString()}>{time}</time>
      <p className="main-date">{date}</p>
    </div>
  );
}
