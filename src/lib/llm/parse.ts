/* ============================================================
   COMPAGNON — Tolerant LLM-output parsing
   Models sometimes wrap JSON in prose or ```fences```. These
   helpers pull out the first JSON value and coerce it into our
   typed shapes, dropping anything malformed rather than throwing
   the whole response away.
   ============================================================ */

import type { CardType, Gender } from "@/lib/types";
import type { CardSuggestion, RoleplayMessage, TagSuggestion } from "./types";

/** Find and parse the first balanced JSON object/array in a string. */
export function extractJSON<T = unknown>(text: string): T {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();

  // Try a straight parse first (the common case — the model obeyed).
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    /* fall through to scanning */
  }

  const startObj = cleaned.indexOf("{");
  const startArr = cleaned.indexOf("[");
  const start =
    startObj === -1 ? startArr : startArr === -1 ? startObj : Math.min(startObj, startArr);
  if (start === -1) throw new Error("No JSON found in model output.");

  const open = cleaned[start]!;
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inStr = false;
  let escaped = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i]!;
    if (inStr) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) {
        return JSON.parse(cleaned.slice(start, i + 1)) as T;
      }
    }
  }
  throw new Error("Unterminated JSON in model output.");
}

/* ---------- coercion helpers ---------- */

const CARD_TYPES: CardType[] = ["word", "phrase", "sentence"];

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && !!x.trim()).map((x) => x.trim()) : [];
}
function gender(v: unknown): Gender | undefined {
  return v === "m" || v === "f" ? v : undefined;
}

/** Validate/coerce an unknown into CardSuggestion[], dropping bad rows. */
export function asCardSuggestions(data: unknown): CardSuggestion[] {
  const arr = Array.isArray(data) ? data : [];
  const out: CardSuggestion[] = [];
  for (const raw of arr) {
    if (typeof raw !== "object" || raw === null) continue;
    const o = raw as Record<string, unknown>;
    const front = str(o.front);
    const back = str(o.back);
    if (!front || !back) continue;
    const type = CARD_TYPES.includes(o.type as CardType) ? (o.type as CardType) : "word";
    out.push({
      type,
      front,
      back,
      gender: gender(o.gender),
      tags: strArray(o.tags),
      reason: str(o.reason) ?? "",
    });
  }
  return out;
}

export function asTagSuggestion(data: unknown): TagSuggestion {
  const o = (typeof data === "object" && data !== null ? data : {}) as Record<string, unknown>;
  return { tags: strArray(o.tags), category: str(o.category) };
}

export function asRoleplayMessage(data: unknown): RoleplayMessage {
  const o = (typeof data === "object" && data !== null ? data : {}) as Record<string, unknown>;
  const fr = str(o.fr);
  if (!fr) throw new Error("Roleplay reply had no French text.");
  return { who: "pal", fr, en: str(o.en), note: str(o.note) };
}
