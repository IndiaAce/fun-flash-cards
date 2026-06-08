import { describe, expect, it } from "vitest";
import { migrate, SCHEMA_VERSION } from "./schema";
import { normalizeText, repo, makeCard, type NewCardInput } from "./index";
import type { PersistedState } from "@/lib/types";

function emptyState(): PersistedState {
  return { schemaVersion: SCHEMA_VERSION, cards: [], reviewLog: [], corrections: [], customCheatSheets: [], settings: { theme: "light", accent: "Calm blue", revealStyle: "inplace", gradeStyle: "pills", palBackend: "auto", sessionSize: 20 } };
}

const word = (front: string, type: NewCardInput["type"] = "word"): NewCardInput => ({
  type,
  front,
  back: "x",
});

describe("migrate", () => {
  it("returns null for garbage so the caller can seed", () => {
    expect(migrate(null)).toBeNull();
    expect(migrate("nope")).toBeNull();
  });

  it("fills missing fields and stamps the current version", () => {
    const out = migrate({ schemaVersion: 1, cards: [] });
    expect(out.schemaVersion).toBe(SCHEMA_VERSION);
    expect(out.reviewLog).toEqual([]);
    expect(out.customCheatSheets).toEqual([]);
    expect(out.settings.theme).toBe("light");
  });

  it("v1→v2 backfills a deck source: empty-tag cards are Class, tagged are Compagnon", () => {
    const out = migrate({
      schemaVersion: 1,
      cards: [
        { id: "hand", type: "word", front: "agaçant", back: "annoying", tags: [], srs: {} },
        { id: "seed", type: "word", front: "la lueur", back: "glimmer", tags: ["B2"], srs: {} },
        { id: "duo", type: "word", front: "chat", back: "cat", tags: ["duolingo"], source: "Duolingo", srs: {} },
      ],
    });
    const bySrc = Object.fromEntries(out.cards.map((c) => [c.id, c.source]));
    expect(bySrc).toEqual({ hand: "Class", seed: "Compagnon", duo: "Duolingo" });
  });

  it("survives a JSON round-trip", () => {
    const state = repo.addCard(emptyState(), word("le chien"));
    const restored = migrate(JSON.parse(JSON.stringify(state)));
    expect(restored.cards).toHaveLength(1);
    expect(restored.cards[0]!.front).toBe("le chien");
  });
});

describe("normalizeText", () => {
  it("lowercases, trims, collapses whitespace and drops trailing punctuation", () => {
    expect(normalizeText("  Le   Chien.  ")).toBe("le chien");
    expect(normalizeText("Il faut que je parte !")).toBe("il faut que je parte");
  });

  it("keeps diacritics (they are meaningful in French)", () => {
    expect(normalizeText("élève")).toBe("élève");
  });
});

describe("repo.bulkAdd dedupe", () => {
  it("skips duplicates of existing cards and within the batch", () => {
    let state = repo.addCard(emptyState(), word("le chien"));
    const res = repo.bulkAdd(state, [
      word("le chien"), // dup of existing
      word("Le Chien."), // dup after normalisation
      word("un chien"), // distinct (article matters)
      word(""), // empty → skipped
    ]);
    expect(res.added).toBe(1);
    expect(res.skipped).toBe(3);
    expect(res.state.cards).toHaveLength(2);
  });

  it("treats same text of different type as distinct", () => {
    const state = repo.addCard(emptyState(), word("chien", "word"));
    const res = repo.bulkAdd(state, [word("chien", "phrase")]);
    expect(res.added).toBe(1);
  });
});

describe("makeCard", () => {
  it("creates a fresh, due SRS state and trims input", () => {
    const c = makeCard({ type: "word", front: "  le seuil ", back: " threshold " });
    expect(c.front).toBe("le seuil");
    expect(c.back).toBe("threshold");
    expect(c.srs.reps).toBe(0);
    expect(c.id).toBeTruthy();
  });
});
