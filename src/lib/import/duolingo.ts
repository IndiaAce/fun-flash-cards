/* ============================================================
   COMPAGNON — Duolingo word-list importer
   Duolingo's "Words" view, when copied, comes out as repeating
   blocks separated by blank lines:

       <french headword>
       <english translation(s)>
       <blank>
       <french headword>
       ...

   That blank-line boundary makes parsing deterministic — no
   lexicon or guessing needed. (If you only have the newline-
   stripped, fully concatenated form, this parser won't recover
   it; re-copy the list so the line breaks survive.)
   ============================================================ */

import type { NewCardInput } from "@/lib/storage";
import { detectGender, guessCardType } from "@/lib/cards";
import { suggestTags } from "@/lib/llm";

export interface DuolingoEntry {
  french: string;
  english: string;
}

/**
 * Parse the raw Duolingo blob into {french, english} entries.
 * Blocks are separated by one or more blank lines; within a block the first
 * non-empty line is the French headword and the rest (joined) is the meaning.
 * Blocks that don't yield both sides are skipped.
 */
export function parseDuolingo(text: string): DuolingoEntry[] {
  const blocks = text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/);

  const entries: DuolingoEntry[] = [];
  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) continue; // need a headword and a meaning
    const french = lines[0]!;
    const english = lines.slice(1).join("; ");
    if (!french || !english) continue;
    entries.push({ french, english });
  }
  return entries;
}

export interface ToCardOptions {
  /** Tags added to every card on top of the auto-tags (e.g. ["duolingo"]). */
  extraTags?: string[];
  /** Run the deterministic auto-tagger. Default true. */
  autoTag?: boolean;
  /** Value for each card's `source`. Default "Duolingo". */
  source?: string;
}

/** Turn parsed entries into card inputs, ready for the store's bulkAdd (which dedupes). */
export function toCardInputs(
  entries: DuolingoEntry[],
  opts: ToCardOptions = {},
): NewCardInput[] {
  const { extraTags = ["duolingo"], autoTag = true, source = "Duolingo" } = opts;

  return entries.map((e) => {
    const type = guessCardType(e.french);
    const auto = autoTag ? suggestTags({ front: e.french, back: e.english, type }) : { tags: [], category: undefined };
    const tags = [...new Set([...extraTags, ...auto.tags])];
    return {
      type,
      front: e.french,
      back: e.english,
      gender: type === "word" ? detectGender(e.french) : undefined,
      category: auto.category,
      tags,
      source,
    };
  });
}

/** Convenience: raw text → card inputs in one call. */
export function parseDuolingoToCards(text: string, opts?: ToCardOptions): NewCardInput[] {
  return toCardInputs(parseDuolingo(text), opts);
}
