import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WakeLockManager } from "@/components/dashboard/wake-lock-manager";

class MockSentinel extends EventTarget implements WakeLockSentinel {
  onrelease: ((this: WakeLockSentinel, event: Event) => void) | null = null;
  released = false;
  type: WakeLockType = "screen";

  async release() {
    this.released = true;
    this.dispatchEvent(new Event("release"));
  }
}

function setWakeLock(value: WakeLock | undefined) {
  Object.defineProperty(navigator, "wakeLock", {
    configurable: true,
    value,
  });
}

function setVisibility(value: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value,
  });
}

describe("WakeLockManager", () => {
  afterEach(() => {
    setVisibility("visible");
    setWakeLock(undefined);
  });

  it("acquires silently when supported", async () => {
    const request = vi.fn().mockResolvedValue(new MockSentinel());
    setVisibility("visible");
    setWakeLock({ request });
    render(<WakeLockManager />);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows a minimal retry after rejection and retries from a tap", async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce(new DOMException("Gesture required", "NotAllowedError"))
      .mockResolvedValueOnce(new MockSentinel());
    setVisibility("visible");
    setWakeLock({ request });
    render(<WakeLockManager />);

    const button = await screen.findByRole("button", { name: /iniciar pantalla/i });
    await userEvent.click(button);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("reacquires once when the document becomes visible again", async () => {
    const first = new MockSentinel();
    const second = new MockSentinel();
    const request = vi.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(second);
    setVisibility("visible");
    setWakeLock({ request });
    render(<WakeLockManager />);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    setVisibility("hidden");
    await act(() => first.release());
    setVisibility("visible");
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  });

  it("stays unobtrusive when unsupported", async () => {
    setVisibility("visible");
    setWakeLock(undefined);
    render(<WakeLockManager />);
    await act(async () => Promise.resolve());
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
