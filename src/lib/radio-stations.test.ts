import { describe, expect, it } from "vitest";
import { RADIO_STATIONS } from "./radio-stations";

describe("RADIO_STATIONS", () => {
  it("includes Alerta as the sixth station with dynamic Mediastream data", () => {
    expect(RADIO_STATIONS).toHaveLength(6);
    expect(RADIO_STATIONS[5]).toMatchObject({
      id: "alerta-bucaramanga",
      name: "Alerta Bucaramanga",
      shortName: "Alerta",
      frequency: "1180 AM",
      city: "Bucaramanga",
      logo: "/radio/alerta.png",
      streamType: "mediastream",
      streamId: "632cc607bc02c60329992b8a",
      playerId: "player-audio-ott-rcn",
    });
    expect(RADIO_STATIONS[5]).not.toHaveProperty("streamUrl");
  });
});
