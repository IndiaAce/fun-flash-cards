import { describe, expect, it } from "vitest";
import { applyCorrection, correctionQueue, correctionStreak, GRADUATE_STREAK } from "./corrections";
import type { CorrectionEntry, Flashcard } from "@/lib/types";

const card = (id: string): Flashcard => ({
  id,
  type: "word",
  front: id,
  back: id,
  tags: [],
  createdAt: new Date().toISOString(),
  srs: {} as Flashcard["srs"],
});

describe("applyCorrection", () => {
  it("a miss adds a new card with streak 0", () => {
    const out = applyCorrection([], "a", false, false);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ cardId: "a", streak: 0 });
  });

  it("a correct answer in a normal review does NOT add or change anything", () => {
    expect(applyCorrection([], "a", true, false)).toHaveLength(0);
    const list: CorrectionEntry[] = [{ cardId: "a", streak: 1, addedAt: "t" }];
    expect(applyCorrection(list, "a", true, false)).toEqual(list); // unchanged
  });

  it("correct reps in a corrections session climb the streak", () => {
    let list = applyCorrection([], "a", false, false); // streak 0, in queue
    list = applyCorrection(list, "a", true, true); // 1
    expect(correctionStreak(list, "a")).toBe(1);
    list = applyCorrection(list, "a", true, true); // 2
    expect(correctionStreak(list, "a")).toBe(2);
  });

  it(`graduates (removes) after ${GRADUATE_STREAK} correct in a row`, () => {
    let list: CorrectionEntry[] = [{ cardId: "a", streak: GRADUATE_STREAK - 1, addedAt: "t" }];
    list = applyCorrection(list, "a", true, true);
    expect(list.find((e) => e.cardId === "a")).toBeUndefined();
  });

  it("a miss resets the streak and keeps the card", () => {
    let list: CorrectionEntry[] = [{ cardId: "a", streak: 2, addedAt: "t" }];
    list = applyCorrection(list, "a", false, true);
    expect(correctionStreak(list, "a")).toBe(0);
    expect(list).toHaveLength(1);
  });

  it("a miss in a normal review still resets an in-queue card's streak", () => {
    const list: CorrectionEntry[] = [{ cardId: "a", streak: 2, addedAt: "t" }];
    expect(correctionStreak(applyCorrection(list, "a", false, false), "a")).toBe(0);
  });
});

describe("correctionQueue", () => {
  const cards = [card("a"), card("b"), card("c")];

  it("returns the cards behind the entries, least-progress first", () => {
    const list: CorrectionEntry[] = [
      { cardId: "a", streak: 2, addedAt: "t" },
      { cardId: "b", streak: 0, addedAt: "t" },
      { cardId: "c", streak: 1, addedAt: "t" },
    ];
    const q = correctionQueue(cards, list);
    expect(q.map((c) => c.id)).toEqual(["b", "c", "a"]);
  });

  it("respects a limit and drops entries whose card is gone", () => {
    const list: CorrectionEntry[] = [
      { cardId: "a", streak: 0, addedAt: "t" },
      { cardId: "gone", streak: 0, addedAt: "t" },
    ];
    const q = correctionQueue(cards, list, { limit: 5 });
    expect(q.map((c) => c.id)).toEqual(["a"]);
  });
});
