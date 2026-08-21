export type BackgroundPeriod = "morning" | "day" | "evening" | "night";

export const DASHBOARD_CONFIG = {
  appName: "Pantalla Londres",
  location: {
    name: "Londres",
    latitude: 51.5072,
    longitude: -0.1276,
    timezone: "Europe/London",
  },
  colombiaTimezone: "America/Bogota",
  weatherRefreshMs: 20 * 60 * 1000,
  backgrounds: {
    morning: "/backgrounds/morning.webp",
    day: "/backgrounds/day.webp",
    evening: "/backgrounds/evening.webp",
    night: "/backgrounds/night.webp",
  } satisfies Record<BackgroundPeriod, string>,
  backgroundPeriods: {
    morning: 5,
    day: 11,
    evening: 17,
    night: 21,
  },
} as const;

export function getHourInTimeZone(date: Date, timeZone: string): number {
  const hour = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hour12: false,
    hourCycle: "h23",
    timeZone,
  })
    .formatToParts(date)
    .find((part) => part.type === "hour")?.value;

  return Number(hour ?? 0) % 24;
}

export function getBackgroundPeriod(date: Date): BackgroundPeriod {
  const hour = getHourInTimeZone(date, DASHBOARD_CONFIG.location.timezone);
  const periods = DASHBOARD_CONFIG.backgroundPeriods;

  if (hour >= periods.night || hour < periods.morning) return "night";
  if (hour >= periods.evening) return "evening";
  if (hour >= periods.day) return "day";
  return "morning";
}
