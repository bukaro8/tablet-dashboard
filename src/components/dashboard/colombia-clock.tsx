import { DASHBOARD_CONFIG } from "@/config/dashboard";
import { formatTime } from "@/lib/time";

interface ColombiaClockProps {
  now: Date | null;
}

export function ColombiaClock({ now }: ColombiaClockProps) {
  const time = now ? formatTime(now, DASHBOARD_CONFIG.colombiaTimezone) : "--:--";
  return (
    <div className="colombia-clock">
      <span className="colombia-label">COLOMBIA</span>
      <time className="colombia-time" dateTime={now?.toISOString()}>{time}</time>
    </div>
  );
}
