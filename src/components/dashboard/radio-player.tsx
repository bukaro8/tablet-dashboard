"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  canResolveStationStream,
  RADIO_STATIONS,
  type RadioStation,
} from "@/lib/radio-stations";
import { resolveStationStream } from "@/lib/radio-streams";
import {
  RadioControls,
  type RadioPlaybackStatus,
} from "./radio-controls";
import { StationSelector } from "./station-selector";

const VOLUME_STORAGE_KEY = "pantalla-londres:radio-volume";
const VOLUME_CHANGE_EVENT = "pantalla-londres:radio-volume-change";
const DEFAULT_VOLUME = 0.7;

const STATUS_LABELS: Record<RadioPlaybackStatus, string> = {
  idle: "Lista para escuchar",
  loading: "Conectando…",
  playing: "En directo",
  paused: "En pausa",
  unavailable: "Señal no disponible",
  error: "No se pudo conectar",
};

function clampVolume(value: number) {
  return Math.min(1, Math.max(0, value));
}

function getStoredVolume() {
  const storedVolume = Number.parseFloat(
    window.localStorage.getItem(VOLUME_STORAGE_KEY) ?? "",
  );
  return Number.isFinite(storedVolume)
    ? clampVolume(storedVolume)
    : DEFAULT_VOLUME;
}

function subscribeToStoredVolume(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === VOLUME_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(VOLUME_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(VOLUME_CHANGE_EVENT, onStoreChange);
  };
}

function storeVolume(value: number) {
  window.localStorage.setItem(VOLUME_STORAGE_KEY, String(value));
  window.dispatchEvent(new Event(VOLUME_CHANGE_EVENT));
}

export function RadioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const requestIdRef = useRef(0);
  const resolverAbortRef = useRef<AbortController | null>(null);
  const shouldBePlayingRef = useRef(false);
  const previousVolumeRef = useRef(DEFAULT_VOLUME);
  const [selectedId, setSelectedId] = useState<string>(RADIO_STATIONS[0].id);
  const [status, setStatus] = useState<RadioPlaybackStatus>("idle");
  const volume = useSyncExternalStore(
    subscribeToStoredVolume,
    getStoredVolume,
    () => DEFAULT_VOLUME,
  );
  const [muted, setMuted] = useState(false);

  const selectedStation = useMemo<RadioStation>(
    () =>
      RADIO_STATIONS.find((station) => station.id === selectedId) ??
      RADIO_STATIONS[0],
    [selectedId],
  );

  const playStation = useCallback(async (station: RadioStation) => {
    const audio = audioRef.current;
    if (!audio) return;

    const requestId = ++requestIdRef.current;
    resolverAbortRef.current?.abort();
    const resolverAbort = new AbortController();
    resolverAbortRef.current = resolverAbort;
    shouldBePlayingRef.current = false;
    audio.pause();

    if (!canResolveStationStream(station)) {
      audio.removeAttribute("src");
      audio.load();
      setStatus("unavailable");
      return;
    }

    shouldBePlayingRef.current = true;
    setStatus("loading");

    try {
      if (!station.streamUrl) {
        audio.removeAttribute("src");
        audio.load();
      }
      const streamUrl = await resolveStationStream(
        station,
        resolverAbort.signal,
      );
      if (requestId !== requestIdRef.current) return;
      audio.src = streamUrl;
      audio.load();
      await audio.play();
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      shouldBePlayingRef.current = false;
      if (
        resolverAbort.signal.aborted ||
        (error instanceof DOMException && error.name === "AbortError")
      ) {
        return;
      }
      setStatus("error");
    }
  }, []);

  const handleSelect = useCallback(
    (station: RadioStation) => {
      setSelectedId(station.id);
      void playStation(station);
    },
    [playStation],
  );

  const handlePlay = useCallback(() => {
    void playStation(selectedStation);
  }, [playStation, selectedStation]);

  const handlePause = useCallback(() => {
    requestIdRef.current += 1;
    resolverAbortRef.current?.abort();
    shouldBePlayingRef.current = false;
    audioRef.current?.pause();
    setStatus("paused");
  }, []);

  const handleVolumeChange = useCallback((nextVolume: number) => {
    const safeVolume = clampVolume(nextVolume);
    storeVolume(safeVolume);
    if (safeVolume > 0) {
      previousVolumeRef.current = safeVolume;
      setMuted(false);
    } else {
      setMuted(true);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    setMuted((currentMuted) => {
      if (currentMuted && volume === 0) {
        const restoredVolume = previousVolumeRef.current || DEFAULT_VOLUME;
        storeVolume(restoredVolume);
      }
      return !currentMuted;
    });
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.muted = muted;
    }

    if (volume > 0) previousVolumeRef.current = volume;
  }, [muted, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      requestIdRef.current += 1;
      resolverAbortRef.current?.abort();
      shouldBePlayingRef.current = false;
      audio?.pause();
    };
  }, []);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: selectedStation.name,
      artist: "Radio Colombia",
      artwork: [
        {
          src: new URL(selectedStation.logo, window.location.origin).href,
        },
      ],
    });

    try {
      navigator.mediaSession.setActionHandler("play", handlePlay);
      navigator.mediaSession.setActionHandler("pause", handlePause);
    } catch {
      // Some browsers expose Media Session without every action handler.
    }

    return () => {
      try {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
      } catch {
        // The dashboard player remains functional without Media Session.
      }
    };
  }, [handlePause, handlePlay, selectedStation]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState =
      status === "playing"
        ? "playing"
        : status === "paused" || status === "idle"
          ? "paused"
          : "none";
  }, [status]);

  const statusLabel =
    status === "unavailable" && selectedStation.unavailableMessage
      ? selectedStation.unavailableMessage
      : STATUS_LABELS[status];

  return (
    <section className="radio-player" aria-label="Radio Colombia">
      <div className="radio-now-playing">
        <div className="current-station-logo">
          <Image
            alt={`Logo de ${selectedStation.name}`}
            className="station-logo"
            fill
            priority
            sizes="128px"
            src={selectedStation.logo}
          />
        </div>

        <div className="station-details">
          <span className={`radio-status radio-status-${status}`} aria-live="polite">
            {statusLabel}
          </span>
          <h2>{selectedStation.name}</h2>
          <p>
            {[selectedStation.frequency, selectedStation.city]
              .filter(Boolean)
              .join(" · ") || "Radio Colombia"}
          </p>
        </div>

        <RadioControls
          canPlay={canResolveStationStream(selectedStation)}
          muted={muted}
          onPause={handlePause}
          onPlay={handlePlay}
          onRetry={handlePlay}
          onToggleMute={handleToggleMute}
          onVolumeChange={handleVolumeChange}
          status={status}
          volume={volume}
        />
      </div>

      <StationSelector
        onSelect={handleSelect}
        playing={status === "playing"}
        selectedId={selectedStation.id}
        stations={RADIO_STATIONS}
      />

      <audio
        onError={() => {
          if (!audioRef.current?.getAttribute("src")) return;
          shouldBePlayingRef.current = false;
          setStatus("error");
        }}
        onPause={() => {
          if (
            !shouldBePlayingRef.current &&
            audioRef.current?.getAttribute("src")
          ) {
            setStatus("paused");
          }
        }}
        onPlaying={() => setStatus("playing")}
        onStalled={() => {
          if (shouldBePlayingRef.current) setStatus("loading");
        }}
        onWaiting={() => {
          if (shouldBePlayingRef.current) setStatus("loading");
        }}
        preload="none"
        ref={audioRef}
      />
    </section>
  );
}
