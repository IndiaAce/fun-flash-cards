/* ============================================================
   COMPAGNON — Core data models
   These types are the contract between the storage layer, the
   SRS engine, and every feature. Keep them small and explicit.
   ============================================================ */

import type { Card as FsrsCard } from "ts-fsrs";

/* ---------- Flashcards ---------- */

export type CardType = "word" | "phrase" | "sentence";
export type Gender = "m" | "f";

/**
 * Per-card spaced-repetition state. This is exactly the shape `ts-fsrs`
 * operates on (due/stability/difficulty/…), so we can hand it straight to
 * the scheduler. Dates are real `Date` objects in memory; the storage layer
 * serialises them to ISO strings on save and revives them on load.
 */
export type SrsState = FsrsCard;

export interface Flashcard {
  id: string;
  type: CardType;
  /** The French prompt shown first. */
  front: string;
  /** The meaning / translation revealed on grade. */
  back: string;
  notes?: string;
  /** Optional IPA pronunciation. */
  ipa?: string;
  /** Grammatical gender — only meaningful for `word` nouns. */
  gender?: Gender;
  /** A single broad theme/scene (e.g. "Travel"). */
  category?: string;
  /** Free-form tags (e.g. "voyage", "subjonctif", "B2"). */
  tags: string[];
  /** Where the card came from (e.g. "Cheat sheet · subjonctif"). */
  source?: string;
  /** ISO timestamp of creation. */
  createdAt: string;
  srs: SrsState;
}

/* ---------- Grading ---------- */

/**
 * The grade vocabulary surfaced in the UI. We expose three calm pills
 * (miss / got / easy) plus `hard`, which the slider & keyboard variants
 * can reach. These map to `ts-fsrs` Ratings in `lib/srs`.
 */
export type GradeId = "miss" | "hard" | "got" | "easy";

export interface ReviewLogEntry {
  id: string;
  cardId: string;
  grade: GradeId;
  /** True for anything that wasn't a lapse — powers accuracy analytics. */
  correct: boolean;
  /** ISO timestamp of the review. */
  reviewedAt: string;
  /** The card's category at review time (denormalised for analytics). */
  category?: string;
  /** The card's tags at review time (denormalised for analytics). */
  tags: string[];
}

/* ---------- Settings ---------- */

export type ThemeName = "light" | "dark";
export type AccentName = "Calm blue" | "Muted teal" | "Aubergine" | "Terracotta";
export type RevealStyle = "inplace" | "flip";
export type GradeStyle = "pills" | "slider" | "swipe";
/** Which LLM backend the pal should use. "auto" = first reachable. */
export type PalBackend = "auto" | "claude-code" | "off";

export interface Settings {
  theme: ThemeName;
  accent: AccentName;
  revealStyle: RevealStyle;
  gradeStyle: GradeStyle;
  palBackend: PalBackend;
  /** How many cards a review session serves before finishing. 0 = all. */
  sessionSize: number;
}

/* ---------- Persisted root ---------- */

export interface PersistedState {
  schemaVersion: number;
  cards: Flashcard[];
  reviewLog: ReviewLogEntry[];
  /** Reserved for user-authored guides/content layered on top of the built-ins. */
  customCheatSheets: unknown[];
  settings: Settings;
}
