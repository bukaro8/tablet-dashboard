import Image from "next/image";
import {
  DASHBOARD_CONFIG,
  getBackgroundPeriod,
  type BackgroundPeriod,
} from "@/config/dashboard";

interface DynamicBackgroundProps {
  now: Date | null;
}

const PERIODS = Object.keys(DASHBOARD_CONFIG.backgrounds) as BackgroundPeriod[];

export function DynamicBackground({ now }: DynamicBackgroundProps) {
  const activePeriod = now ? getBackgroundPeriod(now) : "evening";

  return (
    <div className="dynamic-background" aria-hidden="true">
      {PERIODS.map((period) => (
        <Image
          alt=""
          className={`background-image ${period === activePeriod ? "is-active" : ""}`}
          fill
          key={period}
          loading="eager"
          sizes="(orientation: landscape) 63vw, 100vw"
          src={DASHBOARD_CONFIG.backgrounds[period]}
          unoptimized
        />
      ))}
      <div className="background-overlay" />
    </div>
  );
}
