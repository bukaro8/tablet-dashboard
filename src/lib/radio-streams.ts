import type { RadioStation } from "./radio-stations";

type MediastreamResponse = {
  src?: Record<string, unknown>;
};

const HTML_AUDIO_SOURCE_KEYS = ["icecast", "audio", "mp3", "aac"] as const;

function requireHttpsUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function extractMediastreamAudioUrl(payload: MediastreamResponse) {
  if (!payload.src || typeof payload.src !== "object") {
    throw new Error("Mediastream no devolvió fuentes de audio");
  }

  for (const key of HTML_AUDIO_SOURCE_KEYS) {
    const candidate = requireHttpsUrl(payload.src[key]);
    if (candidate) return candidate;
  }

  throw new Error("Mediastream no devolvió una fuente HTML5 compatible");
}

export async function getMediastreamStreamUrl(
  station: RadioStation,
  signal?: AbortSignal,
) {
  if (
    station.streamType !== "mediastream" ||
    !station.streamId ||
    !station.playerId
  ) {
    throw new Error("Configuración de Mediastream incompleta");
  }

  const endpoint = new URL(
    `https://mdstrm.com/live-stream/${station.streamId}.json`,
  );
  endpoint.searchParams.set("validate", "true");
  endpoint.searchParams.set("metadata", "true");
  endpoint.searchParams.set("player", station.playerId);
  endpoint.searchParams.set("language", "es");
  endpoint.searchParams.set("an", "lafm");
  endpoint.searchParams.set("at", "web-app");

  const response = await fetch(endpoint, {
    cache: "no-store",
    credentials: "include",
    signal,
  });
  if (!response.ok) {
    throw new Error(`Mediastream respondió ${response.status}`);
  }

  const payload = (await response.json()) as MediastreamResponse;
  return extractMediastreamAudioUrl(payload);
}

export async function resolveStationStream(
  station: RadioStation,
  signal?: AbortSignal,
) {
  if (station.streamUrl) return station.streamUrl;
  if (station.streamType === "mediastream") {
    return getMediastreamStreamUrl(station, signal);
  }
  throw new Error("La emisora no tiene una señal disponible");
}

