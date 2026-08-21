import { Power } from "lucide-react";
import { useWakeLock } from "@/hooks/use-wake-lock";

export function WakeLockManager() {
  const { status, requestFromInteraction } = useWakeLock();
  if (status !== "needs-interaction") return null;

  return (
    <button
      className="wake-lock-button"
      onClick={() => void requestFromInteraction()}
      type="button"
    >
      <Power aria-hidden="true" className="size-5" />
      Iniciar pantalla
    </button>
  );
}
