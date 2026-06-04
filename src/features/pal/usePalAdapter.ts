/* ============================================================
   COMPAGNON — Pal adapter hook
   Resolves the active LLM adapter for the current backend
   preference, exposing a simple status the UI can render.
   ============================================================ */

import { useEffect, useState } from "react";
import { getActiveAdapter, type LLMAdapter } from "@/lib/llm";
import type { PalBackend } from "@/lib/types";

export type PalStatus = "checking" | "ready" | "unavailable";

export function usePalAdapter(prefer: PalBackend) {
  const [adapter, setAdapter] = useState<LLMAdapter | null>(null);
  const [status, setStatus] = useState<PalStatus>(prefer === "off" ? "unavailable" : "checking");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    if (prefer === "off") {
      setAdapter(null);
      setStatus("unavailable");
      return;
    }
    setStatus("checking");
    getActiveAdapter(prefer).then((a) => {
      if (!alive) return;
      setAdapter(a);
      setStatus(a ? "ready" : "unavailable");
    });
    return () => {
      alive = false;
    };
  }, [prefer, tick]);

  return { adapter, status, refresh: () => setTick((t) => t + 1) };
}
