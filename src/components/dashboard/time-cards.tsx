import { DASHBOARD_CONFIG } from "@/config/dashboard";
import { formatFullDate, formatTime } from "@/lib/time";

interface TimeCardsProps {
  now: Date | null;
}

interface TimeCardProps {
  now: Date | null;
  flag: string;
  flagLabel: string;
  location: string;
  timeZone: string;
  primary?: boolean;
}

function TimeCard({
  now,
  flag,
  flagLabel,
  location,
  timeZone,
  primary = false,
}: TimeCardProps) {
  const time = now ? formatTime(now, timeZone) : "--:--";
  const date = now ? formatFullDate(now, timeZone) : "Cargando fecha";

  return (
    <section
      aria-label={`Hora en ${location}`}
      className={`time-card${primary ? " time-card-primary" : ""}`}
    >
      <div className="time-card-header">
        <span className="time-card-flag" aria-label={flagLabel} role="img">
          {flag}
        </span>
        <time className="time-card-time" dateTime={now?.toISOString()}>
          {time}
        </time>
      </div>
      <p className="time-card-meta">
        <span className="time-card-location">{location}</span>
        <span aria-hidden="true"> · </span>
        <span>{date}</span>
      </p>
    </section>
  );
}

export function TimeCards({ now }: TimeCardsProps) {
  return (
    <div className="time-cards">
      <TimeCard
        flag="🇬🇧"
        flagLabel="Bandera del Reino Unido"
        location="Londres"
        now={now}
        primary
        timeZone={DASHBOARD_CONFIG.location.timezone}
      />
      <TimeCard
        flag="🇨🇴"
        flagLabel="Bandera de Colombia"
        location="Colombia"
        now={now}
        timeZone={DASHBOARD_CONFIG.colombiaTimezone}
      />
    </div>
  );
}

