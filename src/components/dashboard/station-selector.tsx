import type { RadioStation } from "@/lib/radio-stations";
import { StationButton } from "./station-button";

interface StationSelectorProps {
  stations: readonly RadioStation[];
  selectedId: string;
  playing: boolean;
  onSelect: (station: RadioStation) => void;
}

export function StationSelector({
  stations,
  selectedId,
  playing,
  onSelect,
}: StationSelectorProps) {
  return (
    <div className="station-selector" aria-label="Emisoras disponibles" role="group">
      {stations.map((station) => (
        <StationButton
          active={station.id === selectedId}
          key={station.id}
          onSelect={onSelect}
          playing={playing && station.id === selectedId}
          station={station}
        />
      ))}
    </div>
  );
}

