import { describe, expect, it } from "vitest";
import { parseDuolingo, toCardInputs, parseDuolingoToCards } from "./duolingo";

// Real-shaped sample: French line, English line, blank line between entries.
const SAMPLE = `beaux-parents
parents-in-law

oh là là
wow, oh my gosh

le mensonge
lie

adopter
adopt, assume
`;

describe("parseDuolingo", () => {
  it("splits blank-line-separated blocks into french/english pairs", () => {
    const entries = parseDuolingo(SAMPLE);
    expect(entries).toHaveLength(4);
    expect(entries[0]).toEqual({ french: "beaux-parents", english: "parents-in-law" });
    expect(entries[1]).toEqual({ french: "oh là là", english: "wow, oh my gosh" });
  });

  it("tolerates CRLF and extra blank lines", () => {
    const entries = parseDuolingo("a\r\n1\r\n\r\n\r\nb\r\n2\r\n");
    expect(entries).toEqual([
      { french: "a", english: "1" },
      { french: "b", english: "2" },
    ]);
  });

  it("joins multi-line meanings and skips incomplete blocks", () => {
    const entries = parseDuolingo("loneword\n\nmot\nword one\nword two");
    expect(entries).toEqual([{ french: "mot", english: "word one; word two" }]);
  });
});

describe("toCardInputs", () => {
  it("tags every card 'duolingo' plus auto-tags and detects gender", () => {
    const cards = toCardInputs(parseDuolingo(SAMPLE));
    expect(cards.every((c) => (c.tags ?? []).includes("duolingo"))).toBe(true);
    expect(cards.every((c) => c.source === "Duolingo")).toBe(true);
    const mensonge = cards.find((c) => c.front === "le mensonge")!;
    expect(mensonge.gender).toBe("m"); // "le " → masculine
    expect(mensonge.type).toBe("word");
  });

  it("respects custom extra tags and disabling auto-tag", () => {
    const cards = toCardInputs([{ french: "chat", english: "cat" }], {
      extraTags: ["from-anki"],
      autoTag: false,
    });
    expect(cards[0]!.tags).toEqual(["from-anki"]);
  });

  it("one-call helper produces the same result", () => {
    expect(parseDuolingoToCards(SAMPLE)).toHaveLength(4);
  });
});
