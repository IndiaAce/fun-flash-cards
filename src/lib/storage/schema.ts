/* ============================================================
   COMPAGNON — Persisted schema & migrations
   The whole app state lives under one localStorage key as a
   single versioned object. `migrate()` walks old payloads up to
   the current version, so the on-disk format can evolve without
   data loss. v1 is the baseline; the no-op seam is intentional.
   ============================================================ */

import type { PersistedState, Settings } from "@/lib/types";

export const STORAGE_KEY = "compagnon";
export const SCHEMA_VERSION = 2;

export const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  accent: "Calm blue",
  revealStyle: "inplace",
  gradeStyle: "pills",
  palBackend: "auto",
  sessionSize: 20,
};

/**
 * Ordered migration steps. Each takes the raw payload at version `from` and
 * returns it at version `from + 1`. Add entries here as the schema grows;
 * never edit a shipped one. (TODO(india): first real migration goes here.)
 */
export const MIGRATIONS: Array<{ from: number; up: (raw: any) => any }> = [
  // v1 → v2: give every card a `source` so it lands in a deck.
  // Cards that already have one keep it. The rest are split by a reliable
  // signal: hand-added cards have empty tags → "Class"; the curated starter
  // set always carries tags (A2/B2/voyage…) → "Compagnon".
  {
    from: 1,
    up: (raw) => ({
      ...raw,
      schemaVersion: 2,
      cards: (Array.isArray(raw.cards) ? raw.cards : []).map((c: any) => {
        if (c.source) return c;
        const tagged = Array.isArray(c.tags) && c.tags.length > 0;
        return { ...c, source: tagged ? "Compagnon" : "Class" };
      }),
    }),
  },
];

/**
 * Bring any persisted payload up to SCHEMA_VERSION. Unknown/old shapes are
 * tolerated; anything truly unrecognisable falls back to a fresh default.
 */
export function migrate(raw: any): PersistedState {
  if (!raw || typeof raw !== "object") return null as unknown as PersistedState;
  let state = raw;
  let version = typeof raw.schemaVersion === "number" ? raw.schemaVersion : 1;
  while (version < SCHEMA_VERSION) {
    const step = MIGRATIONS.find((m) => m.from === version);
    if (!step) break; // no path forward — keep what we have
    state = step.up(state);
    version = state.schemaVersion ?? version + 1;
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    cards: Array.isArray(state.cards) ? state.cards : [],
    reviewLog: Array.isArray(state.reviewLog) ? state.reviewLog : [],
    customCheatSheets: Array.isArray(state.customCheatSheets) ? state.customCheatSheets : [],
    settings: { ...DEFAULT_SETTINGS, ...(state.settings ?? {}) },
  };
}
