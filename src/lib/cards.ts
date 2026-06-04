/* ============================================================
   COMPAGNON — Shared card helpers
   Small heuristics used wherever cards are created from raw text
   (manual bulk add, Duolingo import, etc.).
   ============================================================ */

import type { CardType, Gender } from "@/lib/types";

/** Guess a card's type from its French front. */
export function guessCardType(front: string): CardType {
  const trimmed = front.trim();
  const words = trimmed.split(/\s+/).filter(Boolean).length;
  if (/[.!?…]$/.test(trimmed) || words > 5) return "sentence";
  if (words <= 2) return "word";
  return "phrase";
}

/**
 * Infer grammatical gender from a leading article. Returns undefined when it's
 * ambiguous (l', les, des) or there's no article — we never guess.
 */
export function detectGender(front: string): Gender | undefined {
  const f = front.trim().toLowerCase();
  if (/^(le|un|du)\s/.test(f)) return "m";
  if (/^(la|une|de\s+la)\s/.test(f)) return "f";
  return undefined; // l', les, des, or no article
}

/** A tidy ascii slug for tags/ids: "À l'hôtel" → "a-l-hotel". */
export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
