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
});

