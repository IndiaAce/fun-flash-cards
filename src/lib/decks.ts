/* ============================================================
   COMPAGNON — Decks (non-destructive grouping by source)
   A "deck" is a friendly bucket derived from a card's `source`,
   so you can study (or hide) groups without ever deleting cards.
   Three buckets:
     • Class     — words you add yourself (your French class, etc.)
     • Duolingo  — the imported Duolingo corpus (the bulk/noise)
     • Compagnon — the built-in starter set & cheat-sheet cards
   The migration in storage/schema backfills every legacy card with
   a `source`, so `deckOf` is total: every card lands in exactly one.
   ============================================================ */

import type { Flashcard } from "@/lib/types";

export const DECK = {
  class: "Class",
  duolingo: "Duolingo",
  compagnon: "Compagnon",
} as const;

export type Deck = (typeof DECK)[keyof typeof DECK];

/** The `source` value stamped on cards you add by hand or in bulk. */
export const CLASS_SOURCE = DECK.class;
/** The `source` value the Duolingo importer stamps. */
export const DUOLINGO_SOURCE = DECK.duolingo;

/** Which deck a card belongs to, derived from its `source`. Total. */
export function deckOf(card: Pick<Flashcard, "source">): Deck {
  if (card.source === DUOLINGO_SOURCE) return DECK.duolingo;
  if (card.source === CLASS_SOURCE) return DECK.class;
  return DECK.compagnon; // seed, cheat sheets, study-pal, anything else
}

/** Count cards per deck, for picker labels like "Class · 26". */
export function deckCounts(cards: Flashcard[]): Record<Deck, number> {
  const out: Record<Deck, number> = { Class: 0, Duolingo: 0, Compagnon: 0 };
  for (const c of cards) out[deckOf(c)] += 1;
  return out;
}
