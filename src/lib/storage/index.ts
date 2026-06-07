/* ============================================================
   COMPAGNON — Storage layer (localStorage, v1)
   The ONLY module that touches localStorage. Feature code goes
   through the small repository API below, so swapping to
   IndexedDB later means rewriting just this file.
   TODO(india): an IndexedDB-backed implementation of the same API.
   ============================================================ */

import type { Flashcard, PersistedState } from "@/lib/types";
import { freshSrsState } from "@/lib/srs";
import { STORAGE_KEY, SCHEMA_VERSION, DEFAULT_SETTINGS, migrate } from "./schema";
import { buildSeedState } from "@/data/seed";

/* ---------- (de)serialisation ---------- */

/** SRS dates are real `Date`s in memory but ISO strings on disk. Revive them. */
function reviveCard(card: Flashcard): Flashcard {
  const srs: any = { ...card.srs };
  if (srs.due) srs.due = new Date(srs.due);
  if (srs.last_review) srs.last_review = new Date(srs.last_review);
  return { ...card, srs };
}

function reviveState(state: PersistedState): PersistedState {
  return { ...state, cards: state.cards.map(reviveCard) };
}

/* ---------- load / save ---------- */

export function loadState(): PersistedState {
  let raw: unknown = null;
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    if (text) raw = JSON.parse(text);
  } catch {
    raw = null;
  }

  const migrated = migrate(raw);
  if (!migrated) {
    // First run (or corrupt store): seed a living starter corpus.
    const seeded = buildSeedState();
    saveState(seeded);
    return seeded;
  }
  return reviveState(migrated);
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    // Quota or privacy mode — surface, but never crash the app.
    console.error("Compagnon: failed to persist state", err);
  }
}

/* ---------- export / import ---------- */

export function exportJSON(state: PersistedState): string {
  return JSON.stringify(state, null, 2);
}

/** Trigger a browser download of the corpus as JSON. */
export function downloadBackup(state: PersistedState): void {
  const blob = new Blob([exportJSON(state)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `compagnon-backup-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Parse + migrate an imported JSON string into a usable state. Throws on garbage. */
export function importJSON(text: string): PersistedState {
  const parsed = JSON.parse(text);
  const migrated = migrate(parsed);
  if (!migrated) throw new Error("Not a Compagnon backup.");
  return reviveState(migrated);
}

/* ---------- dedupe ---------- */

/**
 * Normalise card text for de-duplication: lowercase, collapse whitespace, drop
 * trailing punctuation. Diacritics are KEPT (é vs e is meaningful in French)
 * and articles are KEPT (`chien` and `un chien` are intentionally distinct).
 */
export function normalizeText(s: string): string {
  return s
    .normalize("NFC")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[\s.!?;:…]+$/u, "");
}

function dedupeKey(front: string, type: string): string {
  return `${type}::${normalizeText(front)}`;
}

/* ---------- card factory ---------- */

export interface NewCardInput {
  type: Flashcard["type"];
  front: string;
  back: string;
  notes?: string;
  ipa?: string;
  gender?: Flashcard["gender"];
  category?: string;
  tags?: string[];
  source?: string;
}

export function makeCard(input: NewCardInput, now: Date = new Date()): Flashcard {
  return {
    id: crypto.randomUUID(),
    type: input.type,
    front: input.front.trim(),
    back: input.back.trim(),
    notes: input.notes?.trim() || undefined,
    ipa: input.ipa?.trim() || undefined,
    gender: input.gender,
    category: input.category,
    tags: (input.tags ?? []).map((t) => t.trim()).filter(Boolean),
    source: input.source,
    createdAt: now.toISOString(),
    srs: freshSrsState(now),
  };
}

/* ---------- repository (pure transforms on PersistedState) ---------- */

export const repo = {
  defaults: { settings: DEFAULT_SETTINGS, schemaVersion: SCHEMA_VERSION },

  addCard(state: PersistedState, input: NewCardInput): PersistedState {
    return { ...state, cards: [makeCard(input), ...state.cards] };
  },

  updateCard(state: PersistedState, id: string, patch: Partial<Flashcard>): PersistedState {
    return {
      ...state,
      cards: state.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    };
  },

  removeCard(state: PersistedState, id: string): PersistedState {
    return { ...state, cards: state.cards.filter((c) => c.id !== id) };
  },

  /**
   * Bulk add with de-duplication against the existing corpus AND within the
   * batch itself. Returns the new state plus how many were added/skipped.
   */
  bulkAdd(
    state: PersistedState,
    inputs: NewCardInput[],
  ): { state: PersistedState; added: number; skipped: number } {
    const seen = new Set(state.cards.map((c) => dedupeKey(c.front, c.type)));
    const fresh: Flashcard[] = [];
    let skipped = 0;
    for (const input of inputs) {
      const key = dedupeKey(input.front, input.type);
      if (!input.front.trim() || seen.has(key)) {
        skipped += 1;
        continue;
      }
      seen.add(key);
      fresh.push(makeCard(input));
    }
    return {
      state: { ...state, cards: [...fresh, ...state.cards] },
      added: fresh.length,
      skipped,
    };
  },
};

export { STORAGE_KEY, SCHEMA_VERSION } from "./schema";
export { scheduleBackup, onBackupStatus, getBackupStatus, type BackupStatus } from "./autobackup";
