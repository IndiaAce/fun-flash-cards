/* ============================================================
   COMPAGNON — LLM "pal" adapter contract
   One interface, swappable implementations (Claude Code CLI via a
   local sidecar, or a local Ollama/Mistral). Every LLM call in the
   app goes through this surface, so features never know which
   backend is live — and work fine when none is.
   Implementations land in Pass 2 (see docs/LLM.md).
   ============================================================ */

import type { CardType, Flashcard, Gender } from "@/lib/types";

export interface CardSuggestion {
  type: CardType;
  front: string;
  back: string;
  gender?: Gender;
  tags: string[];
  /** Why the pal proposed this card (shown to the user before approval). */
  reason: string;
}

export interface SuggestOptions {
  /** Theme/tag to focus on, e.g. "voyage" or "subjonctif". */
  theme?: string;
  /** The learner's level, e.g. "A2", "B1". */
  level?: string;
  /** How many cards to propose. */
  count?: number;
  /** A slice of the existing corpus, so suggestions don't duplicate. */
  existing?: Pick<Flashcard, "front" | "type">[];
}

export interface TagSuggestion {
  tags: string[];
  category?: string;
}

export interface RoleplayMessage {
  who: "pal" | "me";
  fr: string;
  en?: string;
  /** An optional aside, e.g. a word worth turning into a card. */
  note?: string;
}

export interface LLMAdapter {
  /** Stable id, e.g. "claude-code" | "ollama". */
  readonly id: string;
  /** Human label for the settings/toggle UI. */
  readonly label: string;
  /** Is this backend reachable right now? */
  isAvailable(): Promise<boolean>;

  suggestCards(opts: SuggestOptions): Promise<CardSuggestion[]>;
  tagCard(card: Pick<Flashcard, "front" | "back" | "type">): Promise<TagSuggestion>;
  roleplayTurn(history: RoleplayMessage[], draft: string): Promise<RoleplayMessage>;
}
