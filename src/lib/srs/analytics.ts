/* ============================================================
   COMPAGNON — Review analytics & queue building
   Turns the raw review log + card SRS state into:
     - the daily due queue, biased toward weak spots
     - per-category / per-tag performance
     - a single gentle "this week's pattern" insight
   All pure functions — easy to unit test.
   ============================================================ */

import type { Flashcard, ReviewLogEntry } from "@/lib/types";
import { isDue } from "./fsrs";
import { deckOf } from "@/lib/decks";

/* ---------- Performance aggregation ---------- */

export interface KeyStat {
  key: string;
  reviews: number;
  correct: number;
  accuracy: number; // 0..1
}

/** Aggregate accuracy by a denormalised key (category or each tag). */
function aggregate(
  log: ReviewLogEntry[],
  keyOf: (e: ReviewLogEntry) => string[],
): Map<string, KeyStat> {
  const map = new Map<string, KeyStat>();
  for (const e of log) {
    for (const key of keyOf(e)) {
      const stat = map.get(key) ?? { key, reviews: 0, correct: 0, accuracy: 0 };
      stat.reviews += 1;
      if (e.correct) stat.correct += 1;
      stat.accuracy = stat.correct / stat.reviews;
      map.set(key, stat);
    }
  }
  return map;
}

export function accuracyByCategory(log: ReviewLogEntry[]): Map<string, KeyStat> {
  return aggregate(log, (e) => (e.category ? [e.category] : []));
}

export function accuracyByTag(log: ReviewLogEntry[]): Map<string, KeyStat> {
  return aggregate(log, (e) => e.tags);
}

/* ---------- Per-card weakness ---------- */

/**
 * A 0..1 weakness score for a single card. Higher = struggles more.
 * Blends the card's own lapse history with how it's doing within its
 * category and tags (so a card in a weak topic gets surfaced sooner even
 * if it personally hasn't been missed much yet).
 */
export function weaknessScore(
  card: Flashcard,
  catStats: Map<string, KeyStat>,
  tagStats: Map<string, KeyStat>,
): number {
  const reps = card.srs.reps || 0;
  const lapseRate = reps > 0 ? card.srs.lapses / reps : 0.3; // unknown ≈ slightly weak

  const contextAccuracies: number[] = [];
  if (card.category) {
    const s = catStats.get(card.category);
    if (s && s.reviews >= 2) contextAccuracies.push(s.accuracy);
  }
  for (const tag of card.tags) {
    const s = tagStats.get(tag);
    if (s && s.reviews >= 2) contextAccuracies.push(s.accuracy);
  }
  const contextWeakness =
    contextAccuracies.length > 0
      ? 1 - contextAccuracies.reduce((a, b) => a + b, 0) / contextAccuracies.length
      : 0.3;

  // 60% the card's own track record, 40% its topic's track record.
  return 0.6 * lapseRate + 0.4 * contextWeakness;
}

/* ---------- The daily queue ---------- */

export interface QueueFilter {
  type?: Flashcard["type"];
  tag?: string;
  category?: string;
  /** Restrict to one deck ("Class" / "Duolingo" / "Compagnon"). */
  deck?: string;
  /** Only never-reviewed cards (fresh vocab you haven't studied yet). */
  newOnly?: boolean;
  /** When false, include not-yet-due cards too (free practice). */
  dueOnly?: boolean;
  /** Shuffle cards of comparable weakness (default true). */
  shuffle?: boolean;
}

/**
 * Build a review queue. The weakest material still surfaces first, but cards of
 * comparable weakness are shuffled, so a session isn't the same order every
 * time. We bucket weakness into coarse bands (so "hardest first" is preserved)
 * and randomise within each band — which means a set of equally-new cards is
 * fully shuffled. Set `filter.shuffle = false` for the old stable ordering.
 */
export function buildQueue(
  cards: Flashcard[],
  log: ReviewLogEntry[],
  filter: QueueFilter = {},
  now: Date = new Date(),
): Flashcard[] {
  const { type, tag, category, deck, newOnly, dueOnly = true, shuffle = true } = filter;
  const catStats = accuracyByCategory(log);
  const tagStats = accuracyByTag(log);

  const filtered = cards.filter((c) => {
    if (type && c.type !== type) return false;
    if (category && c.category !== category) return false;
    if (tag && !c.tags.includes(tag)) return false;
    if (deck && deckOf(c) !== deck) return false;
    if (newOnly && c.srs.reps > 0) return false;
    if (dueOnly && !isDue(c.srs, now)) return false;
    return true;
  });

  return filtered
    .map((c) => ({
      card: c,
      weak: weaknessScore(c, catStats, tagStats),
      overdueMs: now.getTime() - new Date(c.srs.due).getTime(),
      rand: Math.random(),
    }))
    .sort((a, b) => {
      // Weakest first, in ~0.1-wide bands so close scores are interchangeable.
      const band = Math.round(b.weak * 10) - Math.round(a.weak * 10);
      if (band !== 0) return band;
      // Within a band: shuffle (default) or fall back to most-overdue-first.
      return shuffle ? a.rand - b.rand : b.overdueMs - a.overdueMs;
    })
    .map((x) => x.card);
}

export function dueCards(cards: Flashcard[], now: Date = new Date()): Flashcard[] {
  return cards.filter((c) => isDue(c.srs, now));
}

/* ---------- The dashboard insight ---------- */

export interface Insight {
  /** e.g. "the subjonctif after « bien que »" or just "« bien que »". */
  pattern: string;
  detail: string;
  /** A representative card the user can drill, if one exists. */
  exampleCardId?: string;
}

const RECENT_WINDOW = 12; // look at roughly the last dozen reviews of a topic
const MIN_SAMPLE = 3;
const STRUGGLE_THRESHOLD = 0.7; // below 70% accuracy is worth flagging

/**
 * Find the single weakest, well-sampled topic (tag or category) and phrase it
 * gently. Returns null when there isn't enough history to say anything useful —
 * the dashboard then shows an encouraging default rather than a fake insight.
 */
export function generateInsight(
  cards: Flashcard[],
  log: ReviewLogEntry[],
): Insight | null {
  if (log.length < MIN_SAMPLE) return null;

  const candidates: Array<{ key: string; recent: ReviewLogEntry[] }> = [];
  const byTag = groupRecent(log, (e) => e.tags, RECENT_WINDOW);
  const byCat = groupRecent(log, (e) => (e.category ? [e.category] : []), RECENT_WINDOW);
  for (const [key, recent] of [...byTag, ...byCat]) {
    if (recent.length >= MIN_SAMPLE) candidates.push({ key, recent });
  }

  let worst: { key: string; missed: number; total: number; acc: number } | null = null;
  for (const { key, recent } of candidates) {
    const missed = recent.filter((e) => !e.correct).length;
    const acc = 1 - missed / recent.length;
    if (acc >= STRUGGLE_THRESHOLD) continue;
    if (!worst || acc < worst.acc) worst = { key, missed, total: recent.length, acc };
  }
  if (!worst) return null;

  const example = cards.find(
    (c) => c.category === worst!.key || c.tags.includes(worst!.key),
  );
  return {
    pattern: prettyPattern(worst.key),
    detail: `You've missed it on ${worst.missed} of the last ${worst.total} cards. Worth a slow, deliberate pass — the trigger is usually the tell.`,
    exampleCardId: example?.id,
  };
}

/** Group the most recent `window` entries per key. */
function groupRecent(
  log: ReviewLogEntry[],
  keyOf: (e: ReviewLogEntry) => string[],
  window: number,
): Array<[string, ReviewLogEntry[]]> {
  const byKey = new Map<string, ReviewLogEntry[]>();
  const sorted = [...log].sort(
    (a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime(),
  );
  for (const e of sorted) {
    for (const key of keyOf(e)) {
      const arr = byKey.get(key) ?? [];
      if (arr.length < window) arr.push(e);
      byKey.set(key, arr);
    }
  }
  return [...byKey.entries()];
}

function prettyPattern(key: string): string {
  // "subjonctif" / "Subjonctif" → a friendlier phrase; otherwise the key itself.
  if (/subjonctif/i.test(key)) return "the subjonctif";
  return key;
}
