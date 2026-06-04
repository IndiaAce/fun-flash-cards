/* ============================================================
   COMPAGNON — Persisted schema & migrations
   The whole app state lives under one localStorage key as a
   single versioned object. `migrate()` walks old payloads up to
   the current version, so the on-disk format can evolve without
   data loss. v1 is the baseline; the no-op seam is intentional.
   ============================================================ */

import type { PersistedState, Settings } from "@/lib/types";

export const STORAGE_KEY = "compagnon";
export const SCHEMA_VERSION = 1;

export const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  accent: "Calm blue",
  revealStyle: "inplace",
  gradeStyle: "pills",
  palBackend: "auto",
};

/**
 * Ordered migration steps. Each takes the raw payload at version `from` and
 * returns it at version `from + 1`. Add entries here as the schema grows;
 * never edit a shipped one. (TODO(india): first real migration goes here.)
 */
export const MIGRATIONS: Array<{ from: number; up: (raw: any) => any }> = [
  // Example (kept as a template, not active):
  // { from: 1, up: (raw) => ({ ...raw, schemaVersion: 2, newField: [] }) },
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
