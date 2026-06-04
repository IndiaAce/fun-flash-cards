/* ============================================================
   COMPAGNON — Prompt builders
   Pure functions that turn a task into a single prompt string for
   the model. Each demands strict JSON back so parse.ts can read it.
   Kept here (not in the sidecar) so they're testable and shared.
   ============================================================ */

import type { RoleplayMessage, SuggestOptions } from "./types";

const JSON_RULE =
  "Respond with ONLY valid minified JSON matching the schema. No markdown, no code fences, no prose before or after.";

const LEVEL_NOTE =
  "The learner is around A2–B1 (moving to Montréal). Keep vocabulary and grammar at that level — useful, everyday, not obscure.";

/** Suggest new flashcards themed by a tag, avoiding the existing corpus. */
export function suggestPrompt(opts: SuggestOptions): string {
  const count = opts.count ?? 8;
  const level = opts.level ?? "B1";
  const theme = opts.theme?.trim();
  const existing = (opts.existing ?? []).slice(0, 60).map((c) => c.front);

  return [
    `You are a French tutor building flashcards for a learner at level ${level}.`,
    LEVEL_NOTE,
    theme
      ? `Propose ${count} new French flashcards on the theme "${theme}".`
      : `Propose ${count} new, useful French flashcards.`,
    "Mix words, short phrases, and a few full sentences. For nouns, include the article in the front (e.g. \"le quai\") and set gender.",
    existing.length
      ? `Do NOT duplicate any of these the learner already has:\n${existing.join(" · ")}`
      : "",
    'Schema: an array of objects { "type": "word"|"phrase"|"sentence", "front": string (French), "back": string (English meaning), "gender"?: "m"|"f" (nouns only), "tags": string[] (lowercase, include a CEFR level like "B1"), "reason": string (one short clause, why it is useful for this learner) }.',
    JSON_RULE,
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Suggest tags + a category for one card. */
export function tagPrompt(card: { front: string; back: string; type: string }): string {
  return [
    "You are tagging a French flashcard for a study app.",
    `Card — type: ${card.type}; front (French): "${card.front}"; back (English): "${card.back}".`,
    "Give 2–5 lowercase tags (themes/register, plus one CEFR level like \"a2\"/\"b1\") and a single broad category (e.g. Travel, Food, Society, Subjonctif, Everyday).",
    'Schema: { "tags": string[], "category": string }.',
    JSON_RULE,
  ].join("\n\n");
}

/** One roleplay turn. The scene + level live in the seeded history. */
export function roleplayPrompt(history: RoleplayMessage[], draft: string): string {
  const transcript = history
    .map((m) => `${m.who === "pal" ? "You" : "Learner"}: ${m.fr}`)
    .join("\n");

  return [
    "You are a friendly French conversation partner playing a role in a everyday scene (café, station, hôtel, restaurant…). Stay in character and in French.",
    LEVEL_NOTE,
    "Reply in ONE short, natural French turn (1–2 sentences). If the learner's last message had a notable mistake, you may add a gentle aside; otherwise omit it. Optionally flag ONE useful word/expression worth saving as a flashcard.",
    transcript ? `Conversation so far:\n${transcript}` : "Open the scene with a natural greeting.",
    `Learner just said: "${draft}"`,
    'Schema: { "fr": string (your French reply), "en": string (English translation), "note"?: string (a brief aside in English — a gentle correction and/or a word worth a card; omit if nothing) }.',
    JSON_RULE,
  ].join("\n\n");
}
