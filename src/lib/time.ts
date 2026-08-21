const TIME_FORMATTERS = new Map<string, Intl.DateTimeFormat>();

function getTimeFormatter(timeZone: string) {
  const cached = TIME_FORMATTERS.get(timeZone);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
    timeZone,
  });
  TIME_FORMATTERS.set(timeZone, formatter);
  return formatter;
}

export function formatTime(date: Date, timeZone: string): string {
  return getTimeFormatter(timeZone).format(date);
}

export function formatFullDate(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone,
  }).formatToParts(date);

  return parts
    .map((part) => {
      if (part.type !== "weekday" && part.type !== "month") return part.value;
      return part.value.charAt(0).toLocaleUpperCase("es-ES") + part.value.slice(1);
    })
    .join("");
}

export function formatForecastWeekday(localDate: string): string {
  const safeDate = new Date(`${localDate}T12:00:00Z`);
  const label = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    timeZone: "UTC",
  }).format(safeDate);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatForecastHour(localDateTime: string): string {
  return localDateTime.slice(11, 16);
}

export function formatTemperature(value: number, includeUnit = false): string {
  return `${Math.round(value)}°${includeUnit ? "C" : ""}`;
}
