import { describe, expect, it } from "vitest";
import { applyGrade, freshSrsState, isDue, isLapse, intervalPreviews } from "./fsrs";
import { buildQueue, generateInsight, weaknessScore, accuracyByCategory, accuracyByTag } from "./analytics";
import type { Flashcard, ReviewLogEntry } from "@/lib/types";

function card(id: string, over: Partial<Flashcard> = {}): Flashcard {
  return {
    id,
    type: "sentence",
    front: id,
    back: id,
    tags: [],
    createdAt: new Date().toISOString(),
    srs: freshSrsState(new Date()),
    ...over,
  };
}

describe("FSRS grade mapping", () => {
  it("a new card is due immediately", () => {
    expect(isDue(freshSrsState(new Date()))).toBe(true);
  });

  it("'easy' schedules further out than 'miss'", () => {
    const s = freshSrsState(new Date());
    const now = new Date();
    const miss = applyGrade(s, "miss", now).card.due.getTime();
    const easy = applyGrade(s, "easy", now).card.due.getTime();
    expect(easy).toBeGreaterThan(miss);
  });

  it("only 'miss' counts as a lapse", () => {
    expect(isLapse("miss")).toBe(true);
    expect(isLapse("got")).toBe(false);
    expect(isLapse("easy")).toBe(false);
  });

  it("produces a human interval preview for every grade", () => {
    const previews = intervalPreviews(freshSrsState(new Date()));
    expect(previews.miss).toMatch(/min|now|h|day/);
    expect(previews.easy).toBeTruthy();
  });
});

describe("weaknessScore", () => {
  it("ranks a card in a low-accuracy category as weaker", () => {
    const log: ReviewLogEntry[] = [
      logEntry("c1", false, "Subjonctif", ["subjonctif"]),
      logEntry("c1", false, "Subjonctif", ["subjonctif"]),
    ];
    const cat = accuracyByCategory(log);
    const tag = accuracyByTag(log);
    const weak = card("w", { category: "Subjonctif", tags: ["subjonctif"] });
    const strong = card("s", { category: "Everyday", tags: ["B1"] });
    expect(weaknessScore(weak, cat, tag)).toBeGreaterThan(weaknessScore(strong, cat, tag));
  });
});

describe("buildQueue", () => {
  it("returns only due cards by default and applies filters", () => {
    const due = card("due");
    const future = card("future");
    future.srs.due = new Date(Date.now() + 86_400_000);
    const q = buildQueue([due, future], []);
    expect(q.map((c) => c.id)).toEqual(["due"]);
  });

  it("respects a type filter and dueOnly:false", () => {
    const w = card("w", { type: "word" });
    w.srs.due = new Date(Date.now() + 86_400_000);
    const s = card("s", { type: "sentence" });
    s.srs.due = new Date(Date.now() + 86_400_000);
    const q = buildQueue([w, s], [], { type: "word", dueOnly: false });
    expect(q.map((c) => c.id)).toEqual(["w"]);
  });

  it("filters by deck (derived from source)", () => {
    const klass = card("class", { source: "Class" });
    const duo = card("duo", { source: "Duolingo" });
    const seed = card("seed", { source: "Compagnon" });
    const q = buildQueue([klass, duo, seed], [], { deck: "Class" });
    expect(q.map((c) => c.id)).toEqual(["class"]);
  });

  it("newOnly keeps only never-reviewed cards", () => {
    const fresh = card("fresh");
    const studied = card("studied");
    studied.srs.reps = 3; // has been reviewed
    const q = buildQueue([fresh, studied], [], { newOnly: true, dueOnly: false });
    expect(q.map((c) => c.id)).toEqual(["fresh"]);
  });
});

describe("generateInsight", () => {
  it("returns null without enough history", () => {
    expect(generateInsight([card("c1")], [])).toBeNull();
  });

  it("surfaces the weakest well-sampled topic", () => {
    const cards = [card("c1", { category: "Subjonctif", tags: ["subjonctif"] })];
    const log: ReviewLogEntry[] = [
      logEntry("c1", false, "Subjonctif", ["subjonctif"]),
      logEntry("c1", false, "Subjonctif", ["subjonctif"]),
      logEntry("c1", false, "Subjonctif", ["subjonctif"]),
      logEntry("c1", true, "Subjonctif", ["subjonctif"]),
    ];
    const insight = generateInsight(cards, log);
    expect(insight).not.toBeNull();
    expect(insight!.pattern).toMatch(/subjonctif/i);
    expect(insight!.exampleCardId).toBe("c1");
  });
});

function logEntry(cardId: string, correct: boolean, category: string, tags: string[]): ReviewLogEntry {
  return {
    id: crypto.randomUUID(),
    cardId,
    grade: correct ? "got" : "miss",
    correct,
    reviewedAt: new Date().toISOString(),
    category,
    tags,
  };
}
