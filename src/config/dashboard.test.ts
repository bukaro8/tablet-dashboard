import { describe, expect, it } from "vitest";
import { getBackgroundPeriod, getHourInTimeZone } from "./dashboard";

describe("background periods", () => {
  it.each([
    ["2026-01-15T04:59:00Z", "night"],
    ["2026-01-15T05:00:00Z", "morning"],
    ["2026-01-15T10:59:00Z", "morning"],
    ["2026-01-15T11:00:00Z", "day"],
    ["2026-01-15T16:59:00Z", "day"],
    ["2026-01-15T17:00:00Z", "evening"],
    ["2026-01-15T20:59:00Z", "evening"],
    ["2026-01-15T21:00:00Z", "night"],
  ])("maps %s to %s", (iso, period) => {
    expect(getBackgroundPeriod(new Date(iso))).toBe(period);
  });

  it("uses London daylight-saving time", () => {
    expect(getHourInTimeZone(new Date("2026-08-21T10:00:00Z"), "Europe/London")).toBe(11);
  });
});
