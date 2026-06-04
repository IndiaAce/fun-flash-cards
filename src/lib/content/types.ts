/* ============================================================
   COMPAGNON — Content guide model
   A "guide" is a Markdown grammar chapter: frontmatter + an
   ordered list of blocks, where most blocks are prose and some
   are interactive widgets (conjugator, triggers, phrases, quiz)
   or callouts (note, trap). Authoring spec: docs/CONTENT.md.
   ============================================================ */

/** Pronoun column for conjugation tables (subjunctive order). */
export const PRONOUNS = [
  "que je",
  "que tu",
  "qu'il / elle",
  "que nous",
  "que vous",
  "qu'ils / elles",
] as const;

/* ---------- Widget data ---------- */

export interface VerbGroup {
  id: string;
  label: string;
  note?: string;
}

export interface ConjugatedVerb {
  inf: string;
  gloss: string;
  /** Matches a VerbGroup.id. */
  group: string;
  /** Short chip label, e.g. "2 radicaux", "impersonnel". */
  tag?: string;
  /** Stem explanation shown under the table when selected. */
  note?: string;
  /** Six forms in PRONOUNS order. Use "—" for an impersonal/missing form. */
  forms: string[];
}

export interface ConjugatorData {
  groups: VerbGroup[];
  verbs: ConjugatedVerb[];
}

export interface TriggerItem {
  t: string;
  /** Optional gloss / sub-label, e.g. "obligation", "négatif !". */
  g?: string;
}

export interface TriggerColumn {
  title: string;
  items: TriggerItem[];
}

export interface TriggersData {
  left: TriggerColumn;
  right: TriggerColumn;
  footnote?: string;
}

export interface ScenePhrase {
  fr: string;
  en: string;
}

export interface Scene {
  scene: string;
  /** Short tag/key for this scene (defaults to a slug of `scene`). */
  id?: string;
  /** Icon name from the component kit (defaults to "volume"). */
  icon?: string;
  phrases: ScenePhrase[];
}

export interface PhrasesData {
  scenes: Scene[];
}

export interface QuizItem {
  /** Contains "___" for the blank. */
  prompt: string;
  options: string[];
  answer: number;
  why: string;
}

/* ---------- Blocks & guide ---------- */

export type GuideBlock =
  | { kind: "prose"; md: string }
  | { kind: "note"; title: string; md: string }
  | { kind: "trap"; title: string; md: string }
  | { kind: "conjugator"; data: ConjugatorData }
  | { kind: "triggers"; data: TriggersData }
  | { kind: "phrases"; data: PhrasesData }
  | { kind: "quiz"; data: QuizItem[] };

export interface GuideFrontmatter {
  id: string;
  title: string;
  eyebrow?: string;
  intro?: string;
  /** Default tags applied to cards sent from this guide's phrases. */
  tags: string[];
  level?: string;
}

export interface Guide {
  frontmatter: GuideFrontmatter;
  blocks: GuideBlock[];
}

export type WidgetKind = "conjugator" | "triggers" | "phrases" | "quiz";
