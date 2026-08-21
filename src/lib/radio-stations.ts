export type RadioStation = {
  id: string;
  name: string;
  shortName: string;
  frequency?: string;
  city?: string;
  logo: string;
  streamUrl?: string;
  streamType?: "mediastream";
  streamId?: string;
  playerId?: string;
  unavailableMessage?: string;
};

export function canResolveStationStream(station: RadioStation) {
  return Boolean(
    station.streamUrl ||
      (station.streamType === "mediastream" &&
        station.streamId &&
        station.playerId),
  );
}

export const RADIO_STATIONS = [
  {
    id: "tropicana-bucaramanga",
    name: "Tropicana Bucaramanga",
    shortName: "Tropicana",
    frequency: "95.7 FM",
    city: "Bucaramanga",
    logo: "/radio/tropicana.png",
    streamUrl:
      "https://playerservices.streamtheworld.com/api/livestream-redirect/TR_BUCARAMANGAAAC_SC",
  },
  {
    id: "caracol-bucaramanga",
    name: "Caracol Radio Bucaramanga",
    shortName: "Caracol",
    frequency: "99.2 FM",
    city: "Bucaramanga",
    logo: "/radio/caracol-radio.jpeg",
    streamUrl:
      "https://playerservices.streamtheworld.com/api/livestream-redirect/CR_BUCARAMAAAC_SC?csegid=2000",
  },
  {
    id: "blu-radio",
    name: "Blu Radio",
    shortName: "Blu Radio",
    logo: "/radio/blue-radio.png",
    streamUrl:
      "https://playerservices.streamtheworld.com/api/livestream-redirect/BLURADIO_ADP_SC",
  },
  {
    id: "olimpica-bucaramanga",
    name: "Olímpica Stereo Bucaramanga",
    shortName: "Olímpica",
    frequency: "97.7 FM",
    city: "Bucaramanga",
    logo: "/radio/olimpica.png",
    streamUrl:
      "https://playerservices.streamtheworld.com/api/livestream-redirect/OLP_BUCARAMANGAAAC.aac?dist=oro_web",
  },
  {
    id: "la-fm-bucaramanga",
    name: "La FM Bucaramanga",
    shortName: "La FM",
    frequency: "99.7 FM",
    city: "Bucaramanga",
    logo: "/radio/la-fm.png",
    streamType: "mediastream",
    streamId: "632c9b23d1dcd7027f32f7fe",
    playerId: "68a4a77f6572bb343c5b6e54",
  },
] as const satisfies readonly RadioStation[];
