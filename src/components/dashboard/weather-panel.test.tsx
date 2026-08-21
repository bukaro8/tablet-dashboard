import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { WeatherSnapshot } from "@/lib/weather/types";
import { WeatherPanel } from "./weather-panel";

const weatherFixture: WeatherSnapshot = {
  current: {
    temperatureC: 18.4,
    feelsLikeC: 17.8,
    humidityPercent: 61,
    windKph: 12.2,
    weatherCode: 2,
    isDay: true,
  },
  hourly: [11, 12, 13, 14, 15].map((hour, index) => ({
    time: `2026-08-21T${hour}:00`,
    temperatureC: 19 + index,
    weatherCode: index < 2 ? 0 : 2,
  })),
  daily: [21, 22, 23, 24, 25].map((day, index) => ({
    date: `2026-08-${day}`,
    maximumC: 21 + index,
    minimumC: 11 + index,
    weatherCode: index < 2 ? 0 : 2,
  })),
  fetchedAt: 1000,
};

describe("WeatherPanel", () => {
  it("renders the normalized Spanish weather hierarchy", () => {
    render(
      <WeatherPanel weather={{ status: "ready", data: weatherFixture, isStale: false }} />,
    );
    expect(screen.getByText("Parcialmente nublado")).toBeInTheDocument();
    expect(screen.getByText("18°C")).toBeInTheDocument();
    expect(screen.getByText("Londres")).toBeInTheDocument();
    expect(screen.getByText("Viernes")).toBeInTheDocument();
    expect(screen.getByLabelText("Pronóstico por horas").children).toHaveLength(5);
  });

  it("keeps stable placeholders when weather is unavailable", () => {
    render(
      <WeatherPanel weather={{ status: "unavailable", data: null, isStale: false }} />,
    );
    expect(screen.getByText("Tiempo no disponible")).toBeInTheDocument();
    expect(screen.getByText("--°C")).toBeInTheDocument();
  });
});
