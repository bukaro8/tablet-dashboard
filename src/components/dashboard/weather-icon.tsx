import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
} from "lucide-react";
import type { WeatherIconName } from "@/lib/weather/types";

const ICONS = {
  sun: Sun,
  moon: Moon,
  "cloud-sun": CloudSun,
  "cloud-moon": CloudMoon,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
} satisfies Record<WeatherIconName, typeof Sun>;

const TONES = {
  sun: "text-amber-300",
  moon: "text-blue-100",
  cloud: "text-slate-100",
  rain: "text-sky-300",
  snow: "text-blue-100",
  storm: "text-violet-300",
} as const;

interface WeatherIconProps {
  icon: WeatherIconName;
  tone: keyof typeof TONES;
  className?: string;
  label?: string;
}

export function WeatherIcon({ icon, tone, className = "", label }: WeatherIconProps) {
  const Icon = ICONS[icon];
  return (
    <Icon
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={`${TONES[tone]} ${className}`}
      strokeWidth={1.65}
    />
  );
}
