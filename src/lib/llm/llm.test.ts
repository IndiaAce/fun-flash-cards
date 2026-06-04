import { describe, expect, it } from "vitest";
import { extractJSON, asCardSuggestions, asTagSuggestion, asRoleplayMessage } from "./parse";
import { suggestPrompt, tagPrompt, roleplayPrompt } from "./prompts";

describe("extractJSON", () => {
  it("parses clean JSON", () => {
    expect(extractJSON('{"a":1}')).toEqual({ a: 1 });
  });

  it("strips code fences", () => {
    expect(extractJSON('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("pulls the first JSON value out of surrounding prose", () => {
    expect(extractJSON('Sure! Here you go:\n[{"x":1}]\nHope that helps.')).toEqual([{ x: 1 }]);
  });

  it("handles braces inside strings", () => {
    expect(extractJSON('{"fr":"il dit { bonjour }"}')).toEqual({ fr: "il dit { bonjour }" });
  });

  it("throws when there is no JSON", () => {
    expect(() => extractJSON("no json here")).toThrow();
  });
});

describe("asCardSuggestions", () => {
  it("keeps valid rows and drops malformed ones", () => {
    const out = asCardSuggestions([
      { type: "word", front: "le quai", back: "the platform", gender: "m", tags: ["voyage", "b1"], reason: "useful at the station" },
      { front: "", back: "x" }, // no front → dropped
      { type: "weird", front: "ça vaut le coup", back: "it's worth it", tags: "nope", reason: 5 }, // coerced
    ]);
    expect(out).toHaveLength(2);
    expect(out[0]!.gender).toBe("m");
    expect(out[1]!.type).toBe("word"); // invalid type → default
    expect(out[1]!.tags).toEqual([]); // non-array tags → []
    expect(out[1]!.reason).toBe(""); // non-string reason → ""
  });

  it("returns [] for non-arrays", () => {
    expect(asCardSuggestions({})).toEqual([]);
  });
});

describe("asTagSuggestion / asRoleplayMessage", () => {
  it("coerces tag suggestions", () => {
    expect(asTagSuggestion({ tags: ["voyage", 3, "b1"], category: "Travel" })).toEqual({
      tags: ["voyage", "b1"],
      category: "Travel",
    });
  });

  it("forces roleplay replies to the pal and requires French", () => {
    const m = asRoleplayMessage({ fr: "Bonjour !", en: "Hello!", note: "grignoter = to snack" });
    expect(m).toEqual({ who: "pal", fr: "Bonjour !", en: "Hello!", note: "grignoter = to snack" });
    expect(() => asRoleplayMessage({ en: "no french" })).toThrow();
  });
});

describe("prompt builders", () => {
  it("suggestPrompt includes theme, count, level, and avoids existing fronts", () => {
    const p = suggestPrompt({ theme: "voyage", count: 5, level: "A2", existing: [{ front: "le quai", type: "word" }] });
    expect(p).toContain("voyage");
    expect(p).toContain("5");
    expect(p).toContain("A2");
    expect(p).toContain("le quai");
    expect(p).toMatch(/only valid minified json/i);
  });

  it("tagPrompt includes the card text", () => {
    expect(tagPrompt({ front: "le seuil", back: "threshold", type: "word" })).toContain("le seuil");
  });

  it("roleplayPrompt includes history and the new message", () => {
    const p = roleplayPrompt([{ who: "pal", fr: "Bonjour !" }], "Je voudrais un café");
    expect(p).toContain("Bonjour !");
    expect(p).toContain("Je voudrais un café");
  });
});
