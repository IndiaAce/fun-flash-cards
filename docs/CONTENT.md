# Authoring guides (the Markdown content format)

A **guide** is one Markdown file in `src/content/`. Drop a `.md` there and it appears in the app at
`/guides/<id>` with **zero code changes** — the registry (`src/lib/content/registry.ts`) loads every
`*.md` in that folder at build time. Files whose name starts with `_` are treated as drafts and skipped.

This document is also the **contract for an LLM** (e.g. Claude Web): give it a book chapter and this
spec, and have it emit a file that matches. The parser lives in `src/lib/content/parse.ts`.

---

## File shape

````md
---
id: conditionnel-present          # required · URL slug, unique, kebab-case
title: Le conditionnel {{présent}} # required · text inside {{ }} renders in the accent colour
eyebrow: Guide · Mood              # optional · small label above the title
intro: One short sentence.         # optional · shown under the title and on the index card
tags: [conditionnel, grammar]      # optional · default tags for cards sent from this guide
level: A2 → B1                     # optional · shown as a chip
---

## A section heading

Normal **Markdown** prose. Every `##` heading becomes an entry in the guide's sticky section bar,
so structure the chapter with `##` for each major part.

… prose, callouts, and widgets in any order …
````

- **Frontmatter** is a small YAML subset: one `key: value` per line; arrays are inline
  (`tags: [a, b]`). Keep it to the keys above. `id` and `title` are required.
- **Prose** is standard Markdown: headings, paragraphs, **bold**, *italic*, `inline code`, lists,
  blockquotes, and tables. Raw HTML is **not** rendered (it's escaped) — use Markdown.

---

## Callouts

```md
:::note Title goes here
Body is Markdown. Use for nuances, mnemonics, "remember this".
:::

:::trap The gotcha
Use for the classic mistake — renders in the warm "clay" warning style.
:::
```

The title (everything after `note`/`trap` on the opening line) is optional.

---

## Interactive widgets

Widgets are fenced code blocks whose **info string** is the widget name and whose **body is JSON**.
The JSON must be valid (no trailing commas, double-quoted keys). A malformed block fails loudly in
the console with the block name; the rest of the guide still renders.

### `conjugator`

Grouped, clickable verb table. `forms` is six strings in the order
`que je · que tu · qu'il/elle · que nous · que vous · qu'ils/elles`. Use `"—"` for a missing
(impersonal) form.

````md
```conjugator
{
  "groups": [
    { "id": "irr", "label": "Les grands irréguliers", "note": "Radical propre — à mémoriser." },
    { "id": "reg", "label": "Réguliers", "note": "Radical de « ils » + terminaisons." }
  ],
  "verbs": [
    { "inf": "être", "gloss": "to be", "group": "irr", "tag": "irrégulier",
      "note": "À savoir par cœur.", "forms": ["sois","sois","soit","soyons","soyez","soient"] },
    { "inf": "falloir", "gloss": "to be necessary", "group": "irr", "tag": "impersonnel",
      "note": "Seulement « qu'il faille ».", "forms": ["—","—","faille","—","—","—"] }
  ]
}
```
````

Each verb: `inf`, `gloss`, `group` (matches a group `id`), optional `tag` (chip) and `note` (shown
under the table when selected), and `forms` (6 strings).

### `triggers`

Two contrasting columns. `g` (gloss/sub-label) is optional per item.

````md
```triggers
{
  "left":  { "title": "→ Subjonctif", "items": [ { "t": "il faut que", "g": "obligation" } ] },
  "right": { "title": "→ Indicatif",  "items": [ { "t": "j'espère que", "g": "le piège !" } ] },
  "footnote": "Optional line under the columns."
}
```
````

### `phrases`

Survival phrases grouped by scene; each gets an **Add to flashcards** button (deduped, tagged with
the guide's `tags` + the scene). `icon` is optional (a name from the kit, e.g. `home`, `volume`,
`arrowRight`, `spark`); `id` is the scene's tag (defaults to a slug of the name).

````md
```phrases
{
  "scenes": [
    { "scene": "À l'hôtel", "id": "hotel", "icon": "home", "phrases": [
      { "fr": "Il faudrait que vous me changiez de chambre.", "en": "You'd need to change my room." }
    ]}
  ]
}
```
````

### `quiz`

Fill-in-the-blank multiple choice. `prompt` contains `___` for the blank; `answer` is the 0-based
index of the correct option.

````md
```quiz
[
  { "prompt": "Il faut que tu ___ patient.", "options": ["es","sois","seras"], "answer": 1,
    "why": "« Il faut que » → subjonctif : sois." }
]
```
````

---

## Conventions for good guides

- One `##` per major part (Formation, Conjugueur, Déclencheurs, En voyage, Quiz is a nice default
  rhythm, but any sectioning works — the section bar follows your `##`s).
- Put a widget right after the `##` and prose that introduce it.
- French is the content language; English glosses/translations go in the `en`/`gloss`/`why` fields.
- Keep `intro` to one sentence.
- Pick a stable, unique `id` — it's the URL and shouldn't change once you've made cards from the guide.

## Worked example

`src/content/subjonctif.md` exercises every feature (frontmatter, prose, tables, `:::note`/`:::trap`,
a 26-verb `conjugator` with impersonals, `triggers`, `phrases` with send-to-flashcards, and an
8-question `quiz`). Copy it as a starting template.
