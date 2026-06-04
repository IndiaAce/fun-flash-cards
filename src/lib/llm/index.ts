/* ============================================================
   COMPAGNON — LLM module entry
   Pass 1 ships the deterministic tagger and a registry that
   reports "no adapter available" so LLM-powered UI degrades to a
   tasteful disabled state. Pass 2 registers ClaudeCodeAdapter and
   OllamaAdapter here — feature code won't change.
   ============================================================ */

import type { PalBackend } from "@/lib/types";
import type { LLMAdapter } from "./types";
import { claudeCodeAdapter } from "./claude-code";
import { ollamaAdapter } from "./ollama";

export * from "./types";
export { suggestTags } from "./tagger";
export { palHealth } from "./client";

/** Registered adapters, in preference order (first reachable wins under "auto"). */
const adapters: LLMAdapter[] = [claudeCodeAdapter, ollamaAdapter];

/**
 * Resolve the active adapter, honouring a user preference:
 *  - "off"         → null (LLM features disabled)
 *  - "claude-code" → that adapter iff reachable
 *  - "auto"/unset  → the first reachable adapter
 * Returns null when nothing is reachable, so the core app stays functional.
 */
export async function getActiveAdapter(prefer: PalBackend = "auto"): Promise<LLMAdapter | null> {
  if (prefer === "off") return null;
  const candidates = prefer === "auto" ? adapters : adapters.filter((a) => a.id === prefer);
  for (const a of candidates) {
    try {
      if (await a.isAvailable()) return a;
    } catch {
      // try the next one
    }
  }
  return null;
}

/** Synchronous hint for UI: are any adapters even registered? */
export function hasAnyAdapter(): boolean {
  return adapters.length > 0;
}
