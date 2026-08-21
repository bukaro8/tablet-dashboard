import type { WeatherDescriptor } from "./types";

export function getWeatherDescriptor(
  code: number,
  isDay = true,
): WeatherDescriptor {
  if (code === 0) {
    return isDay
      ? { label: "Despejado", icon: "sun", tone: "sun" }
      : { label: "Despejado", icon: "moon", tone: "moon" };
  }
  if (code === 1 || code === 2) {
    return isDay
      ? { label: "Parcialmente nublado", icon: "cloud-sun", tone: "sun" }
      : { label: "Parcialmente nublado", icon: "cloud-moon", tone: "moon" };
  }
  if (code === 3) return { label: "Nublado", icon: "cloud", tone: "cloud" };
  if (code === 45 || code === 48) {
    return { label: "Niebla", icon: "fog", tone: "cloud" };
  }
  if ([51, 53, 55, 56, 57].includes(code)) {
    return { label: "Llovizna", icon: "drizzle", tone: "rain" };
  }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { label: "Lluvia", icon: "rain", tone: "rain" };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { label: "Nieve", icon: "snow", tone: "snow" };
  }
  if ([95, 96, 99].includes(code)) {
    return { label: "Tormenta", icon: "storm", tone: "storm" };
  }
  return { label: "Tiempo variable", icon: "cloud", tone: "cloud" };
}
