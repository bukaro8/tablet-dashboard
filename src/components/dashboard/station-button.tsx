import Image from "next/image";
import {
  canResolveStationStream,
  type RadioStation,
} from "@/lib/radio-stations";

interface StationButtonProps {
  station: RadioStation;
  active: boolean;
  playing: boolean;
  onSelect: (station: RadioStation) => void;
}

export function StationButton({
  station,
  active,
  playing,
  onSelect,
}: StationButtonProps) {
  const available = canResolveStationStream(station);
  const availability = available ? "" : ", señal no disponible";

  return (
    <button
      aria-label={`Seleccionar ${station.name}${availability}`}
      aria-pressed={active}
      className={`station-button${active ? " is-active" : ""}`}
      onClick={() => onSelect(station)}
      type="button"
    >
      <span className="station-logo-frame">
        <Image
          alt=""
          className="station-logo"
          fill
          sizes="96px"
          src={station.logo}
        />
      </span>
      <span className="station-button-label">{station.shortName}</span>
      {playing ? <span className="playing-dot" aria-hidden="true" /> : null}
      {!available ? <span className="unavailable-dot" aria-hidden="true" /> : null}
    </button>
  );
}
