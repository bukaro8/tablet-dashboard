export type WeatherIconName =
  | "sun"
  | "moon"
  | "cloud-sun"
  | "cloud-moon"
  | "cloud"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "storm";

export interface WeatherDescriptor {
  label: string;
  icon: WeatherIconName;
  tone: "sun" | "moon" | "cloud" | "rain" | "snow" | "storm";
}

export interface CurrentConditions {
  temperatureC: number;
  feelsLikeC: number;
  humidityPercent: number;
  windKph: number;
  weatherCode: number;
  isDay: boolean;
}

export interface HourlyForecastItem {
  time: string;
  temperatureC: number;
  weatherCode: number;
}

export interface DailyForecastItem {
  date: string;
  maximumC: number;
  minimumC: number;
  weatherCode: number;
}

export interface WeatherSnapshot {
  current: CurrentConditions;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  fetchedAt: number;
}

export interface WeatherLoadState {
  status: "loading" | "ready" | "unavailable";
  data: WeatherSnapshot | null;
  isStale: boolean;
}

export interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    is_day: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
}
