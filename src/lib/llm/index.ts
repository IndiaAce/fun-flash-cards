/* ============================================================
   COMPAGNON — LLM module entry
   Pass 1 ships the deterministic tagger and a registry that
   reports "no adapter available" so LLM-powered UI degrades to a
   tasteful disabled state. Pass 2 registers ClaudeCodeAdapter and
   OllamaAdapter here — feature code won't change.
   ============================================================ */

import type { LLMAdapter } from "./types";

export * from "./types";
export { suggestTags } from "./tagger";

/**
 * Active adapters, in preference order. Empty in Pass 1.
 * TODO(india): push ClaudeCodeAdapter and OllamaAdapter here in Pass 2.
 */
const adapters: LLMAdapter[] = [];

/** The first reachable adapter, or null if none (core app stays functional). */
export async function getActiveAdapter(): Promise<LLMAdapter | null> {
  for (const a of adapters) {
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
