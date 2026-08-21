import { describe, expect, it } from "vitest";
import { isRadioProviderHostname } from "./radio-hosts";

describe("radio provider hosts", () => {
  it.each([
    "playerservices.streamtheworld.com",
    "27423.live.streamtheworld.com",
    "streamtheworld.com",
    "mdstrm.com",
    "edge.audio.cdn.mdstrm.com",
  ])("recognizes %s", (hostname) => {
    expect(isRadioProviderHostname(hostname)).toBe(true);
  });

  it.each([
    "api.open-meteo.com",
    "streamtheworld.com.example.org",
    "notmdstrm.com",
  ])("does not overmatch %s", (hostname) => {
    expect(isRadioProviderHostname(hostname)).toBe(false);
  });
});
