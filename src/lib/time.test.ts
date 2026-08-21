import { describe, expect, it } from "vitest";
import {
  formatForecastHour,
  formatForecastWeekday,
  formatFullDate,
  formatTemperature,
  formatTime,
} from "./time";

describe("time and weather formatting", () => {
  it("lets Intl handle the changing London-to-Bogotá offset", () => {
    const winter = new Date("2026-01-15T12:00:00Z");
    expect(formatTime(winter, "Europe/London")).toBe("12:00");
    expect(formatTime(winter, "America/Bogota")).toBe("07:00");

    const summer = new Date("2026-08-21T12:00:00Z");
    expect(formatTime(summer, "Europe/London")).toBe("13:00");
    expect(formatTime(summer, "America/Bogota")).toBe("07:00");
  });

  it("formats Spanish dates and forecast values", () => {
    const date = new Date("2026-08-21T12:00:00Z");
    expect(formatFullDate(date, "Europe/London")).toBe("viernes, 21 de agosto");
    expect(formatForecastWeekday("2026-08-21")).toBe("Viernes");
    expect(formatForecastHour("2026-08-21T14:00")).toBe("14:00");
    expect(formatTemperature(18.6, true)).toBe("19°C");
  });
});
