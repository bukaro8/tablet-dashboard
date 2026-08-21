import {
  LoaderCircle,
  Pause,
  Play,
  RefreshCw,
  Volume2,
  VolumeX,
} from "lucide-react";

export type RadioPlaybackStatus =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "unavailable"
  | "error";

interface RadioControlsProps {
  status: RadioPlaybackStatus;
  canPlay: boolean;
  volume: number;
  muted: boolean;
  onPlay: () => void;
  onPause: () => void;
  onRetry: () => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
}

export function RadioControls({
  status,
  canPlay,
  volume,
  muted,
  onPlay,
  onPause,
  onRetry,
  onToggleMute,
  onVolumeChange,
}: RadioControlsProps) {
  const playing = status === "playing" || status === "loading";

  return (
    <div className="radio-controls">
      <button
        aria-label={playing ? "Pausar radio" : "Reproducir radio"}
        className="radio-play-button"
        disabled={!canPlay}
        onClick={playing ? onPause : onPlay}
        type="button"
      >
        {status === "loading" ? (
          <LoaderCircle className="radio-loading-icon" aria-hidden="true" />
        ) : playing ? (
          <Pause aria-hidden="true" fill="currentColor" />
        ) : (
          <Play aria-hidden="true" fill="currentColor" />
        )}
      </button>

      <div className="volume-control">
        <button
          aria-label={muted ? "Activar sonido" : "Silenciar radio"}
          className="volume-button"
          onClick={onToggleMute}
          type="button"
        >
          {muted || volume === 0 ? (
            <VolumeX aria-hidden="true" />
          ) : (
            <Volume2 aria-hidden="true" />
          )}
        </button>
        <input
          aria-label="Volumen de la radio"
          className="volume-slider"
          max="1"
          min="0"
          onChange={(event) => onVolumeChange(Number(event.target.value))}
          step="0.05"
          type="range"
          value={volume}
        />
      </div>

      {status === "error" ? (
        <button
          aria-label="Reintentar conexión de radio"
          className="radio-retry-button"
          onClick={onRetry}
          type="button"
        >
          <RefreshCw aria-hidden="true" />
          Reintentar
        </button>
      ) : null}
    </div>
  );
}

