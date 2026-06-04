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

/* ---------- Cheat sheets (data-driven) ---------- */

export interface VerbGroup {
  id: string;
  label: string;
  note: string;
}

export interface ConjugatedVerb {
  id: string;
  inf: string;
  gloss: string;
  group: string; // matches a VerbGroup.id
  /** [pronoun, conjugation] rows. Curated for now; an engine can fill these later. */
  table: Array<[string, string]>;
}

export interface TriggerItem {
  t: string; // the trigger expression, e.g. "bien que"
  g: string; // gloss, e.g. "although"
}

export interface TriggerColumn {
  title: string;
  items: TriggerItem[];
}

export interface ScenePhrase {
  fr: string;
  en: string;
}

export interface Scene {
  id: string;
  scene: string; // display name, e.g. "Hôtel"
  icon: string; // icon name from the kit
  phrases: ScenePhrase[];
}

export interface QuizItem {
  prompt: string; // contains "___" for the blank
  options: string[];
  answer: number; // index into options
  why: string;
}

/** A callout note rendered in the Formation tab (rules, traps, nuances). */
export interface RuleNote {
  kind: "recipe" | "endings" | "callout" | "trap";
  title: string;
  /** Plain-text/markdown-ish body. Recipe/endings carry structured data instead. */
  body?: string;
  /** For "recipe": ordered steps. */
  steps?: Array<{ text: string; ex: string }>;
  /** For "endings": [pronoun, ending] rows. */
  rows?: Array<[string, string]>;
}

export type CheatSheetSection =
  | { kind: "formation"; notes: RuleNote[] }
  | { kind: "conjugator"; groups: VerbGroup[]; verbs: ConjugatedVerb[] }
  | { kind: "triggers"; left: TriggerColumn; right: TriggerColumn; footnote?: string }
  | { kind: "phrases"; scenes: Scene[] }
  | { kind: "quiz"; items: QuizItem[] };

export interface CheatSheet {
  id: string;
  /** Eyebrow label, e.g. "Cheat sheet · Mood". */
  eyebrow: string;
  /** Main title; the highlighted span is wrapped in {{ }} in the source. */
  title: string;
  /** Short intro paragraph. */
  intro: string;
  /** Default tags applied to cards sent from this sheet. */
  defaultTags: string[];
  sections: CheatSheetSection[];
}

/* ---------- Settings ---------- */

export type ThemeName = "light" | "dark";
export type AccentName = "Calm blue" | "Muted teal" | "Aubergine" | "Terracotta";
export type RevealStyle = "inplace" | "flip";
export type GradeStyle = "pills" | "slider" | "swipe";

export interface Settings {
  theme: ThemeName;
  accent: AccentName;
  revealStyle: RevealStyle;
  gradeStyle: GradeStyle;
}

/* ---------- Persisted root ---------- */

export interface PersistedState {
  schemaVersion: number;
  cards: Flashcard[];
  reviewLog: ReviewLogEntry[];
  /** User-authored cheat sheets layered on top of the built-in ones. */
  customCheatSheets: CheatSheet[];
  settings: Settings;
}
