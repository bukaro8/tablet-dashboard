import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RadioPlayer } from "./radio-player";

describe("RadioPlayer", () => {
  const play = vi.fn<() => Promise<void>>();
  const pause = vi.fn();
  const load = vi.fn();
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    const values = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        clear: () => values.clear(),
        getItem: (key: string) => values.get(key) ?? null,
        key: (index: number) => Array.from(values.keys())[index] ?? null,
        get length() {
          return values.size;
        },
        removeItem: (key: string) => values.delete(key),
        setItem: (key: string, value: string) => values.set(key, String(value)),
      } satisfies Storage,
    });
    play.mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(play);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pause);
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(load);
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(navigator, "mediaSession");
    vi.unstubAllGlobals();
  });

  it("does not autoplay and starts the selected live stream after interaction", async () => {
    const user = userEvent.setup();
    const { container } = render(<RadioPlayer />);
    const audio = container.querySelector("audio");

    expect(play).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Reproducir radio" }));

    expect(load).toHaveBeenCalledOnce();
    expect(play).toHaveBeenCalledOnce();
    expect(audio?.src).toContain("TR_BUCARAMANGAAAC_SC");

    fireEvent.playing(audio as HTMLAudioElement);
    expect(screen.getByText("En directo")).toBeInTheDocument();
  });

  it("switches into Caracol and stops it when another station is selected", async () => {
    const user = userEvent.setup();
    const { container } = render(<RadioPlayer />);
    const audio = container.querySelector("audio");

    await user.click(
      screen.getByRole("button", {
        name: "Seleccionar Caracol Radio Bucaramanga",
      }),
    );

    expect(pause).toHaveBeenCalledOnce();
    expect(load).toHaveBeenCalledOnce();
    expect(play).toHaveBeenCalledOnce();
    expect(audio?.src).toContain("CR_BUCARAMAAAC_SC?csegid=2000");
    expect(
      screen.getByRole("heading", { name: "Caracol Radio Bucaramanga" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Seleccionar Blu Radio" }),
    );

    expect(pause).toHaveBeenCalledTimes(2);
    expect(load).toHaveBeenCalledTimes(2);
    expect(audio?.src).toContain("BLURADIO_ADP_SC");
    expect(screen.getByRole("heading", { name: "Blu Radio" })).toBeInTheDocument();
  });

  it("resolves a fresh La FM session URL and stops it when switching away", async () => {
    const user = userEvent.setup();
    const { container } = render(<RadioPlayer />);
    const audio = container.querySelector("audio");
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            src: { icecast: "https://audio.example/la-fm-session-one" },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            src: { icecast: "https://audio.example/la-fm-session-two" },
          }),
          { status: 200 },
        ),
      );

    await user.click(
      screen.getByRole("button", {
        name: "Seleccionar La FM Bucaramanga",
      }),
    );

    await waitFor(() => expect(play).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/live-stream/632c9b23d1dcd7027f32f7fe.json?",
    );
    expect(audio?.src).toBe("https://audio.example/la-fm-session-one");

    await user.click(
      screen.getByRole("button", { name: "Seleccionar Blu Radio" }),
    );
    expect(pause).toHaveBeenCalledTimes(2);
    expect(audio?.src).toContain("BLURADIO_ADP_SC");

    await user.click(
      screen.getByRole("button", { name: "Seleccionar La FM Bucaramanga" }),
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(audio?.src).toBe("https://audio.example/la-fm-session-two");
  });

  it("keeps other stations functional when La FM resolution fails", async () => {
    const user = userEvent.setup();
    const { container } = render(<RadioPlayer />);
    const audio = container.querySelector("audio");
    fetchMock.mockRejectedValueOnce(new TypeError("Network error"));

    await user.click(
      screen.getByRole("button", { name: "Seleccionar La FM Bucaramanga" }),
    );

    expect(await screen.findByText("No se pudo conectar")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reintentar conexión de radio" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Seleccionar Blu Radio" }),
    );
    await waitFor(() => expect(play).toHaveBeenCalledOnce());
    expect(audio?.src).toContain("BLURADIO_ADP_SC");
  });

  it("switches from La FM to a fresh Alerta session and stops it cleanly", async () => {
    const user = userEvent.setup();
    const { container } = render(<RadioPlayer />);
    const audio = container.querySelector("audio") as HTMLAudioElement;
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            src: { icecast: "https://audio.example/la-fm-session" },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            src: { icecast: "https://audio.example/alerta-fresh-session.aac" },
          }),
          { status: 200 },
        ),
      );

    await user.click(
      screen.getByRole("button", { name: "Seleccionar La FM Bucaramanga" }),
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());

    await user.click(
      screen.getByRole("button", { name: "Seleccionar Alerta Bucaramanga" }),
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const alertaEndpoint = fetchMock.mock.calls[1][0] as URL;
    expect(alertaEndpoint.pathname).toContain("632cc607bc02c60329992b8a");
    expect(alertaEndpoint.searchParams.get("player")).toBe(
      "player-audio-ott-rcn",
    );
    expect(audio.src).toBe("https://audio.example/alerta-fresh-session.aac");
    expect(pause).toHaveBeenCalledTimes(2);

    fireEvent.playing(audio);
    await user.click(screen.getByRole("button", { name: "Pausar radio" }));
    expect(pause).toHaveBeenCalledTimes(3);
    expect(screen.getByText("En pausa")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Seleccionar Blu Radio" }),
    );
    expect(pause).toHaveBeenCalledTimes(4);
    expect(audio.src).toContain("BLURADIO_ADP_SC");
  });

  it("updates Media Session metadata for Alerta", async () => {
    const user = userEvent.setup();
    const mediaMetadata = vi.fn(function (metadata: MediaMetadataInit) {
      return metadata;
    });
    Object.defineProperty(navigator, "mediaSession", {
      configurable: true,
      value: {
        metadata: null,
        playbackState: "none",
        setActionHandler: vi.fn(),
      },
    });
    vi.stubGlobal("MediaMetadata", mediaMetadata);
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          src: { icecast: "https://audio.example/alerta-session.aac" },
        }),
        { status: 200 },
      ),
    );

    render(<RadioPlayer />);
    await user.click(
      screen.getByRole("button", { name: "Seleccionar Alerta Bucaramanga" }),
    );

    await waitFor(() =>
      expect(mediaMetadata).toHaveBeenLastCalledWith(
        expect.objectContaining({
          title: "Alerta Bucaramanga",
          artist: "Radio Colombia",
          artwork: [
            expect.objectContaining({ src: "http://localhost/radio/alerta.png" }),
          ],
        }),
      ),
    );
  });

  it("stores volume changes on the device", () => {
    render(<RadioPlayer />);
    fireEvent.change(screen.getByRole("slider", { name: "Volumen de la radio" }), {
      target: { value: "0.4" },
    });
    expect(window.localStorage.getItem("pantalla-londres:radio-volume")).toBe(
      "0.4",
    );
  });
});
