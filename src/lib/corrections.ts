/* ============================================================
   COMPAGNON — Corrections queue (a leech list with graduation)
   Miss a card anywhere → it lands here. Get it right three times
   in a row *while reviewing corrections* → it graduates out. Any
   miss resets the streak. All pure transforms over the list.
   ============================================================ */

import type { CorrectionEntry, Flashcard } from "@/lib/types";

/** Consecutive correct corrections-reps needed to clear a card. */
export const GRADUATE_STREAK = 3;

/**
 * Fold one graded answer into the corrections list and return the next list.
 *
 * - A miss (anywhere) adds the card with streak 0, or resets an existing entry.
 * - A correct answer advances the streak ONLY while reviewing corrections;
 *   reaching GRADUATE_STREAK removes the card. Correct answers in normal
 *   reviews leave the list untouched.
 */
export function applyCorrection(
  list: CorrectionEntry[],
  cardId: string,
  correct: boolean,
  inCorrectionsSession: boolean,
  now: Date = new Date(),
): CorrectionEntry[] {
  const iso = now.toISOString();
  const idx = list.findIndex((e) => e.cardId === cardId);
  const exists = idx !== -1;

  if (!correct) {
    if (exists) {
      return list.map((e, i) => (i === idx ? { ...e, streak: 0, lastReviewedAt: iso } : e));
    }
    return [...list, { cardId, streak: 0, addedAt: iso, lastReviewedAt: iso }];
  }

  // Correct: only corrections-queue reps count toward graduation.
  if (!inCorrectionsSession || !exists) return list;

  const next = list[idx]!.streak + 1;
  if (next >= GRADUATE_STREAK) {
    return list.filter((_, i) => i !== idx); // graduated
  }
  return list.map((e, i) => (i === idx ? { ...e, streak: next, lastReviewedAt: iso } : e));
}

/**
 * The corrections review queue: the actual cards behind the entries, ordered
 * least-progress-first (streak ascending) and shuffled within equal streaks.
 * Entries whose card no longer exists are dropped.
 */
export function correctionQueue(
  cards: Flashcard[],
  list: CorrectionEntry[],
  opts: { limit?: number } = {},
): Flashcard[] {
  const byId = new Map(cards.map((c) => [c.id, c]));
  const ordered = list
    .map((e) => ({ e, rand: Math.random() }))
    .sort((a, b) => a.e.streak - b.e.streak || a.rand - b.rand)
    .map((d) => byId.get(d.e.cardId))
    .filter((c): c is Flashcard => Boolean(c));
  const { limit } = opts;
  return limit && limit > 0 ? ordered.slice(0, limit) : ordered;
}

/** Current streak for a card (0 if not in the queue). */
export function correctionStreak(list: CorrectionEntry[], cardId: string): number {
  return list.find((e) => e.cardId === cardId)?.streak ?? 0;
}
