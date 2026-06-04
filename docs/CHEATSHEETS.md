# Authoring cheat sheets

A cheat sheet in Compagnon is **data**, not code. The reusable engine
(`src/features/cheatsheets/CheatSheetView.tsx`) renders any `CheatSheet` object; to add a new tense
or mood you write a new data file and register it. No new components.

## The schema

Full types live in [`src/lib/types.ts`](../src/lib/types.ts). A sheet is:

```ts
interface CheatSheet {
  id: string;            // URL slug, e.g. "conditionnel-present"
  eyebrow: string;       // small label above the title, e.g. "Cheat sheet · Mood"
  title: string;         // "Le subjonctif {{présent}}" — text in {{ }} renders in the accent
  intro: string;         // one short paragraph
  defaultTags: string[]; // tags applied to cards sent from this sheet (e.g. ["subjonctif"])
  sections: CheatSheetSection[];
}
```

`sections` is an ordered, tagged union. Each kind becomes a tab, in order. Include only the ones you
need:

| `kind` | Tab label | Shape |
| --- | --- | --- |
| `formation` | Formation | `{ notes: RuleNote[] }` — recipe / endings / callouts / traps |
| `conjugator` | Conjugator | `{ groups: VerbGroup[]; verbs: ConjugatedVerb[] }` |
| `triggers` | Triggers | `{ left: TriggerColumn; right: TriggerColumn; footnote? }` |
| `phrases` | In the wild | `{ scenes: Scene[] }` — each phrase has a "send to flashcards" button |
| `quiz` | Self-check | `{ items: QuizItem[] }` |

### `RuleNote` kinds (Formation tab)

- `recipe` — numbered steps with examples (`steps: [{ text, ex }]`).
- `endings` — a two-column table (`rows: [pronoun, ending][]`).
- `callout` — a calm accent-tinted note (`body`). Use for nuances.
- `trap` — same, but clay-tinted with a flame icon. Use for the "gotcha" learners get wrong.

### `ConjugatedVerb`

```ts
{ id, inf, gloss, group /* matches a VerbGroup.id */, table: [pronoun, form][] }
```

The `group` lets the picker bucket verbs (e.g. *irregular / two-stem / regular*) with a short note
per bucket via `VerbGroup`.

## Adding a sheet

1. Create `src/data/<sheet>.ts` exporting a `CheatSheet` (copy `src/data/subjonctif.ts` as a
   template — it exercises every section kind).
2. Add it to the built-in list. Today that's `BUILTIN_CHEATSHEETS` at the bottom of
   `src/data/subjonctif.ts`; for several sheets, lift that into a `src/data/cheatsheets.ts` index
   and import them all there. The store already exposes
   `[...BUILTIN_CHEATSHEETS, ...customCheatSheets]`.
3. It appears on `/cheatsheets` and at `/cheatsheets/<id>` automatically.

Good next sheets (from the brief): *conditionnel*, *imparfait vs passé composé* (the "camera"
metaphor — a callout note), *futur*.

## The worked example: subjonctif

`src/data/subjonctif.ts` ports the design's content and **enriches** it with the nuances the brief
called out, so nothing is lost relative to the original sheet:

- The **espérer trap** — `j'espère que` *stays indicatif* (a `trap` note + a quiz item), contrasted
  with `je souhaite/veux que`, plus the parallel `après que` (indicatif) vs `avant que` (subjonctif).
- A **présent vs passé du subjonctif** note (same triggers; timing changes the form).
- The **two-radical ("boot") verbs** explanation, with `boire` added to the conjugator
  (`que je boive` / `que nous buvions`) alongside `prendre`, `venir`, `aller`.

## "Send to flashcards"

Every phrase row in the **In the wild** tab has an Add-card button. It calls the store's `bulkAdd`
(so duplicates are skipped) with a sentence card carrying the sheet's `defaultTags` plus the scene id
and a `source` of `Cheat sheet · <sheet id>`. This is the cross-pillar connection: reference →
active recall in one click.

## Conjugation engine (the stretch goal)

**Decision for Pass 1: curated data, structured so an engine can replace it later.**

We investigated programmatic conjugation. Findings:

- General French conjugators (e.g. the `french-verbs` family on npm) cover the common indicative
  tenses well, but **subjunctive coverage and the irregular/“boot” stems are uneven**, and bundling a
  full morphological engine + verb dictionary is heavy for what is, at A2–B1, a small curated set of
  high-value verbs.
- The data shape already isolates this cleanly: each verb is `{ id, inf, gloss, group, table }`. The
  `table` is the only hand-maintained part. An engine can be dropped in behind a single function —
  `conjugate(inf, mood, tense) → [pronoun, form][]` — to populate `table` at build or run time, with
  curated overrides for irregulars. Nothing else in the view changes.

So we keep accurate, reviewed forms now and leave a clean seam (`TODO(india):` in the conjugator
data) for an engine when sheet count grows enough to justify it.
