/* ============================================================
   COMPAGNON — Deterministic auto-tagger (no LLM required)
   A keyword/heuristic fallback for card tagging & categorisation.
   Always available; the LLM adapter (Pass 2) can produce richer
   suggestions behind the same call site. The user always confirms
   before tags are applied.
   ============================================================ */

import type { CardType } from "@/lib/types";
import type { TagSuggestion } from "./types";

/** Subjonctif triggers — presence of any of these strongly implies the mood. */
const SUBJONCTIF_TRIGGERS = [
  "il faut que", "bien que", "quoique", "avant que", "pour que", "afin que",
  "à condition que", "à moins que", "pourvu que", "jusqu'à ce que",
  "je veux que", "je souhaite que", "je doute que", "il vaut mieux que",
  "il faudrait que", "ne pense pas que", "il est possible que",
];

interface CategoryRule {
  category: string;
  tags: string[];
  keywords: string[];
}

/** First matching rule wins for category; all matching rules contribute tags. */
const CATEGORY_RULES: CategoryRule[] = [
  { category: "Travel", tags: ["voyage"], keywords: ["gare", "train", "hôtel", "chambre", "réserv", "valise", "billet", "aéroport", "vol", "quai", "annulation"] },
  { category: "Food", tags: ["restaurant"], keywords: ["plat", "menu", "manger", "boire", "café", "addition", "serveur", "déjeuner", "dîner", "recommand"] },
  { category: "Conversation", tags: ["politesse"], keywords: ["pourriez-vous", "s'il vous plaît", "merci", "bonjour", "excusez", "auriez-vous", "je voudrais"] },
  { category: "Work", tags: ["travail"], keywords: ["réunion", "bureau", "collègue", "projet", "patron", "embauche"] },
  { category: "Nature", tags: ["nature"], keywords: ["forêt", "mer", "montagne", "ciel", "rivière", "lueur", "crépuscule", "aube"] },
];

/** A rough CEFR guess from form length — a gentle starting point, user-editable. */
function levelGuess(front: string, type: CardType): string {
  const words = front.trim().split(/\s+/).length;
  if (type === "word") return words > 1 ? "B1" : "A2";
  if (type === "phrase") return "B1";
  return words > 9 ? "B2" : "B1";
}

export function suggestTags(card: {
  front: string;
  back: string;
  type: CardType;
}): TagSuggestion {
  const haystack = `${card.front} ${card.back}`.toLowerCase();
  const tags = new Set<string>();
  let category: string | undefined;

  if (SUBJONCTIF_TRIGGERS.some((t) => haystack.includes(t))) {
    tags.add("subjonctif");
    tags.add("grammar");
    category ??= "Subjonctif";
  }

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((k) => haystack.includes(k))) {
      category ??= rule.category;
      rule.tags.forEach((t) => tags.add(t));
    }
  }

  tags.add(levelGuess(card.front, card.type));

  return { tags: [...tags], category };
}
