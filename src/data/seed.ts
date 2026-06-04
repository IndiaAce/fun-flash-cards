/* ============================================================
   COMPAGNON — First-run seed
   A living starter corpus so the app isn't empty on day one:
   survival phrases from the subjonctif sheet (tagged `voyage`)
   plus a spread of vocabulary, and a little review history so
   the dashboard's weak-spot insight has something to say.
   ============================================================ */

import type { Flashcard, PersistedState, ReviewLogEntry } from "@/lib/types";
import { freshSrsState } from "@/lib/srs";
import { DEFAULT_SETTINGS, SCHEMA_VERSION } from "@/lib/storage/schema";

type SeedCard = Omit<Flashcard, "id" | "createdAt" | "srs">;

const SEED_CARDS: SeedCard[] = [
  // --- voyage survival phrases (pulled from the subjonctif cheat sheet) ---
  { type: "sentence", front: "Il faudrait que la chambre soit prête avant midi.", back: "The room would need to be ready before noon.", category: "Travel", tags: ["voyage", "subjonctif", "hôtel"], source: "Cheat sheet · subjonctif", notes: "« il faut que » → subjonctif; here in the conditional « il faudrait que »." },
  { type: "sentence", front: "Bien que ce soit complet, auriez-vous une annulation ?", back: "Although it's full, would you have a cancellation?", category: "Travel", tags: ["voyage", "subjonctif", "hôtel"], source: "Cheat sheet · subjonctif", notes: "« bien que » always takes the subjonctif." },
  { type: "sentence", front: "Il vaut mieux que nous réservions pour deux.", back: "It's better that we book for two.", category: "Travel", tags: ["voyage", "subjonctif", "restaurant"], source: "Cheat sheet · subjonctif" },
  { type: "sentence", front: "Pourvu que le train ne soit pas en retard !", back: "Let's hope the train isn't late!", category: "Travel", tags: ["voyage", "subjonctif", "gare"], source: "Cheat sheet · subjonctif", notes: "« pourvu que » — let's hope that; expresses a wish." },
  { type: "sentence", front: "Il faut que je sois à Lyon avant ce soir.", back: "I need to be in Lyon before tonight.", category: "Travel", tags: ["voyage", "subjonctif", "gare"], source: "Cheat sheet · subjonctif" },
  { type: "sentence", front: "Pourriez-vous m'indiquer le chemin de la gare ?", back: "Could you show me the way to the station?", category: "Travel", tags: ["voyage", "politesse", "A2"], notes: "Conditional for politeness." },

  // --- words ---
  { type: "word", front: "le seuil", back: "the threshold; doorstep", gender: "m", category: "Home", tags: ["architecture", "B2"], notes: "Figurative: « au seuil de » = on the verge of." },
  { type: "word", front: "l'engouement", back: "craze; infatuation; sudden enthusiasm", gender: "m", category: "Society", tags: ["abstrait", "C1"], notes: "« un engouement pour » — a craze for." },
  { type: "word", front: "la lueur", back: "glimmer; faint light", gender: "f", category: "Nature", tags: ["poétique", "B2"], notes: "« une lueur d'espoir » — a glimmer of hope." },
  { type: "word", front: "épanoui·e", back: "blossomed; fulfilled, radiant", category: "Emotion", tags: ["adjectif", "B2"], notes: "Used of people who are flourishing." },
  { type: "word", front: "le quotidien", back: "daily life; everyday routine", gender: "m", category: "Society", tags: ["B1"], notes: "Also: a daily newspaper." },
  { type: "word", front: "feutré·e", back: "muffled; hushed, padded", category: "Atmosphere", tags: ["adjectif", "C1"], notes: "« une ambiance feutrée » — a hushed atmosphere." },

  // --- phrases ---
  { type: "phrase", front: "tomber dans les pommes", back: "to faint; to pass out", category: "Idioms", tags: ["familier", "B2"], notes: "Lit. « to fall in the apples ». Informal." },
  { type: "phrase", front: "à la belle étoile", back: "under the open sky; sleeping outdoors", category: "Travel", tags: ["voyage", "B1"], notes: "« dormir à la belle étoile »." },
  { type: "phrase", front: "ça vaut le coup", back: "it's worth it", category: "Conversation", tags: ["familier", "A2"], notes: "« ça vaut le coup d'œil » — worth a look." },
  { type: "phrase", front: "mettre la main à la pâte", back: "to pitch in; to lend a hand", category: "Work", tags: ["idiome", "B2"], notes: "Lit. « to put your hand to the dough »." },

  // --- subjonctif sentences (the weak spot the dashboard will surface) ---
  { type: "sentence", front: "Il faut que je parte avant qu'il ne soit trop tard.", back: "I have to leave before it's too late.", category: "Subjonctif", tags: ["subjonctif", "grammar", "B2"], notes: "« il faut que » + « avant que » both trigger the subjonctif." },
  { type: "sentence", front: "Bien qu'elle soit fatiguée, elle continue de sourire.", back: "Although she is tired, she keeps smiling.", category: "Subjonctif", tags: ["subjonctif", "grammar", "B2"], notes: "« bien que » always takes the subjonctif." },
  { type: "sentence", front: "Je ne pense pas qu'il vienne ce soir.", back: "I don't think he's coming tonight.", category: "Subjonctif", tags: ["subjonctif", "grammar", "B2"], notes: "Doubt / negation of opinion → subjonctif." },
  { type: "sentence", front: "On s'est promenés le long de la Seine au crépuscule.", back: "We strolled along the Seine at dusk.", category: "Everyday", tags: ["passé composé", "B1"], notes: "« le long de » — along." },
];

function makeSeedCard(seed: SeedCard, createdAt: Date): Flashcard {
  return {
    id: crypto.randomUUID(),
    ...seed,
    createdAt: createdAt.toISOString(),
    srs: freshSrsState(createdAt),
  };
}

/** A few past reviews so "this week's pattern" highlights the subjonctif. */
function seedReviewLog(cards: Flashcard[]): ReviewLogEntry[] {
  const subjonctif = cards.filter((c) => c.tags.includes("subjonctif"));
  const log: ReviewLogEntry[] = [];
  const now = Date.now();
  // 6 recent subjonctif reviews, 4 of them missed → an honest-looking weak spot.
  const outcomes = [false, false, true, false, true, false];
  subjonctif.slice(0, 6).forEach((card, i) => {
    log.push({
      id: crypto.randomUUID(),
      cardId: card.id,
      grade: outcomes[i] ? "got" : "miss",
      correct: outcomes[i] ?? true,
      reviewedAt: new Date(now - (i + 1) * 36e5).toISOString(), // staggered over recent hours
      category: card.category,
      tags: card.tags,
    });
  });
  return log;
}

export function buildSeedState(): PersistedState {
  const createdAt = new Date();
  const cards = SEED_CARDS.map((c) => makeSeedCard(c, createdAt));
  return {
    schemaVersion: SCHEMA_VERSION,
    cards,
    reviewLog: seedReviewLog(cards),
    // The subjonctif sheet is built-in (always available); custom sheets start empty.
    customCheatSheets: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}
