/* ============================================================
   COMPAGNON — Spaced repetition (FSRS)
   Thin wrapper over `ts-fsrs`. Everything the app needs to know
   about scheduling lives here, behind a small surface so the
   algorithm could be swapped without touching feature code.
   See docs/SRS.md for the reasoning and the math.
   ============================================================ */

import {
  fsrs,
  generatorParameters,
  createEmptyCard,
  Rating,
  State,
  type Grade,
  type RecordLogItem,
} from "ts-fsrs";
import type { GradeId, SrsState } from "@/lib/types";

/**
 * FSRS parameters. `enable_fuzz` keeps intervals from clustering on the same
 * day; `request_retention` is the target recall probability (0.9 = remember
 * ~90% of the time). Tunable later from Settings.
 */
const PARAMS = generatorParameters({
  enable_fuzz: true,
  request_retention: 0.9,
  maximum_interval: 365,
});

const scheduler = fsrs(PARAMS);

/** Map our calm UI grades onto FSRS's four ratings. */
const GRADE_TO_RATING: Record<GradeId, Grade> = {
  miss: Rating.Again,
  hard: Rating.Hard,
  got: Rating.Good,
  easy: Rating.Easy,
};

/** A brand-new card's SRS state (never reviewed). */
export function freshSrsState(now: Date = new Date()): SrsState {
  return createEmptyCard(now);
}

/**
 * Apply a grade to a card's SRS state and return the next state plus the
 * scheduler's log item. Pure with respect to its inputs — `card` is not mutated.
 */
export function applyGrade(
  state: SrsState,
  grade: GradeId,
  now: Date = new Date(),
): RecordLogItem {
  return scheduler.next(state, now, GRADE_TO_RATING[grade]);
}

/** Is this card due for review at `now`? */
export function isDue(state: SrsState, now: Date = new Date()): boolean {
  return new Date(state.due).getTime() <= now.getTime();
}

/** A lapse is a forgotten review (Again on a previously-learned card). */
export function isLapse(grade: GradeId): boolean {
  return grade === "miss";
}

/**
 * Human-readable "next interval" previews for each grade, computed by actually
 * running the scheduler on the given card — so the pills show the real numbers,
 * not hard-coded guesses.
 */
export function intervalPreviews(
  state: SrsState,
  now: Date = new Date(),
): Record<GradeId, string> {
  const out = {} as Record<GradeId, string>;
  (Object.keys(GRADE_TO_RATING) as GradeId[]).forEach((g) => {
    const next = applyGrade(state, g, now).card;
    out[g] = formatInterval(next.due, now);
  });
  return out;
}

/** Format the gap between now and a due date in calm, human units. */
export function formatInterval(due: Date | string, from: Date = new Date()): string {
  const ms = new Date(due).getTime() - from.getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"}`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} mo`;
  return `${Math.round(months / 12)} yr`;
}

export { Rating, State };
