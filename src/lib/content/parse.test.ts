import { describe, expect, it } from "vitest";
import { parseGuide, plainTitle, GuideParseError } from "./parse";
import type { ConjugatorData, FlashcardsData, QuizItem } from "./types";

const GUIDE = `---
id: subjonctif-present
eyebrow: Guide · Mood
title: Le subjonctif {{présent}}
intro: The mood of doubt.
tags: [subjonctif, grammar]
level: A2 → B1
---

## Comment le construire

Take the **ils** form, drop \`-ent\`.

:::note Remember this
nous / vous look like the imperfect.
:::

:::trap Le piège
\`espérer\` stays indicatif.
:::

\`\`\`conjugator
{ "groups": [{ "id": "irr", "label": "Irréguliers" }],
  "verbs": [{ "inf": "être", "gloss": "to be", "group": "irr", "tag": "irrégulier", "note": "by heart", "forms": ["sois","sois","soit","soyons","soyez","soient"] }] }
\`\`\`

## Quiz time

\`\`\`quiz
[{ "prompt": "Il faut que tu ___.", "options": ["es","sois"], "answer": 1, "why": "subjonctif" }]
\`\`\`

## Cartes

\`\`\`flashcards
{ "cards": [{ "front": "il faut que", "back": "Subjonctif", "note": "obligation", "tag": "mode" }] }
\`\`\`
`;

describe("parseGuide", () => {
  const guide = parseGuide(GUIDE);

  it("reads frontmatter including inline arrays and arrows", () => {
    expect(guide.frontmatter.id).toBe("subjonctif-present");
    expect(guide.frontmatter.title).toBe("Le subjonctif {{présent}}");
    expect(guide.frontmatter.tags).toEqual(["subjonctif", "grammar"]);
    expect(guide.frontmatter.level).toBe("A2 → B1");
  });

  it("splits prose, callouts, and widgets in order", () => {
    const kinds = guide.blocks.map((b) => b.kind);
    expect(kinds).toEqual(["prose", "note", "trap", "conjugator", "prose", "quiz", "prose", "flashcards"]);
  });

  it("keeps callout titles and inner markdown", () => {
    const note = guide.blocks.find((b) => b.kind === "note");
    expect(note).toMatchObject({ title: "Remember this" });
    const trap = guide.blocks.find((b) => b.kind === "trap")!;
    expect((trap as { md: string }).md).toContain("espérer");
  });

  it("JSON-parses widget blocks", () => {
    const conj = guide.blocks.find((b) => b.kind === "conjugator")! as { data: ConjugatorData };
    expect(conj.data.verbs[0]!.forms).toHaveLength(6);
    expect(conj.data.verbs[0]!.inf).toBe("être");
    const quiz = guide.blocks.find((b) => b.kind === "quiz")! as { data: QuizItem[] };
    expect(quiz.data[0]!.answer).toBe(1);
    const cards = guide.blocks.find((b) => b.kind === "flashcards")! as { data: FlashcardsData };
    expect(cards.data.cards[0]!.back).toBe("Subjonctif");
    expect(cards.data.cards[0]!.tag).toBe("mode");
  });

  it("strips {{ }} for plain titles", () => {
    expect(plainTitle(guide.frontmatter.title)).toBe("Le subjonctif présent");
  });
});

describe("parseGuide errors", () => {
  it("throws without frontmatter", () => {
    expect(() => parseGuide("# no frontmatter")).toThrow(GuideParseError);
  });

  it("throws on missing id", () => {
    expect(() => parseGuide("---\ntitle: x\n---\n")).toThrow(/id/);
  });

  it("throws on malformed widget JSON with the block kind named", () => {
    const bad = "---\nid: x\ntitle: X\n---\n\n```quiz\n[ not json ]\n```\n";
    expect(() => parseGuide(bad)).toThrow(/quiz/);
  });
});
