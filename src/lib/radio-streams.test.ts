import { describe, expect, it, vi } from "vitest";
import type { RadioStation } from "./radio-stations";
import { getMediastreamStreamUrl } from "./radio-streams";

const laFmStation: RadioStation = {
  id: "la-fm-bucaramanga",
  name: "La FM Bucaramanga",
  shortName: "La FM",
  frequency: "99.7 FM",
  city: "Bucaramanga",
  logo: "/radio/la-fm.png",
  streamType: "mediastream",
  streamId: "632c9b23d1dcd7027f32f7fe",
  playerId: "68a4a77f6572bb343c5b6e54",
  analyticsName: "lafm",
};

const alertaStation: RadioStation = {
  id: "alerta-bucaramanga",
  name: "Alerta Bucaramanga",
  shortName: "Alerta",
  frequency: "1180 AM",
  city: "Bucaramanga",
  logo: "/radio/alerta.png",
  streamType: "mediastream",
  streamId: "632cc607bc02c60329992b8a",
  playerId: "player-audio-ott-rcn",
  analyticsName: "rcn",
};

describe("getMediastreamStreamUrl", () => {
  it("uses the HTTPS src.icecast field from the live response", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          src: {
            hls: "https://mdstrm.com/audio/live.m3u8",
            icecast: "https://mdstrm.com/audio/icecast.audio",
            mpd: "https://mdstrm.com/audio/manifest.mpd",
          },
        }),
        { status: 200 },
      ),
    );

    await expect(getMediastreamStreamUrl(laFmStation)).resolves.toBe(
      "https://mdstrm.com/audio/icecast.audio",
    );
    expect(fetcher).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ cache: "no-store", credentials: "include" }),
    );
  });

  it("rejects responses without a compatible HTTPS audio source", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ src: { icecast: "http://insecure.example/live" } }),
        { status: 200 },
      ),
    );

    await expect(getMediastreamStreamUrl(laFmStation)).rejects.toThrow(
      "fuente HTML5 compatible",
    );
  });

  it("resolves Alerta through the same dynamic Mediastream endpoint", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          src: {
            icecast:
              "https://edge.audio.cdn.mdstrm.com/alerta/current-session.aac",
          },
        }),
        { status: 200 },
      ),
    );

    await expect(getMediastreamStreamUrl(alertaStation)).resolves.toContain(
      "current-session.aac",
    );

    const endpoint = fetcher.mock.calls[0][0] as URL;
    expect(endpoint.pathname).toBe(
      "/live-stream/632cc607bc02c60329992b8a.json",
    );
    expect(endpoint.searchParams.get("player")).toBe("player-audio-ott-rcn");
    expect(endpoint.searchParams.get("an")).toBe("rcn");
  });
});
