---
id: my-guide-id
title: Le titre {{accentué}}
eyebrow: Guide · Topic
intro: One short sentence describing the guide.
tags: [topic, grammar]
level: A2 → B1
---

<!--
  This is a TEMPLATE. Files whose name starts with "_" are skipped by the app,
  so this never shows up as a guide. Copy it to src/content/<id>.md and fill it in.
  Full format reference: docs/CONTENT.md
-->

## Formation

Explain how it's built. Normal **Markdown** — prose, lists, and tables all work.

| pronom | terminaison |
| --- | --- |
| que je | -e |
| que nous | -ions |

:::note A helpful nuance
Use note callouts for mnemonics and "remember this".
:::

:::trap The classic mistake
Use trap callouts for the gotcha learners get wrong.
:::

## Conjugueur

```conjugator
{
  "groups": [
    { "id": "irr", "label": "Irréguliers", "note": "À mémoriser." },
    { "id": "reg", "label": "Réguliers", "note": "Radical de « ils » + terminaisons." }
  ],
  "verbs": [
    { "inf": "être", "gloss": "to be", "group": "irr", "tag": "irrégulier", "note": "À savoir par cœur.", "forms": ["sois","sois","soit","soyons","soyez","soient"] }
  ]
}
```

## Déclencheurs

```triggers
{
  "left":  { "title": "→ Cette forme", "items": [ { "t": "il faut que", "g": "obligation" } ] },
  "right": { "title": "→ L'autre forme", "items": [ { "t": "j'espère que", "g": "le piège !" } ] },
  "footnote": "An optional line under the columns."
}
```

## En voyage

```phrases
{
  "scenes": [
    { "scene": "À l'hôtel", "id": "hotel", "icon": "home", "phrases": [
      { "fr": "Une phrase utile.", "en": "A useful phrase." }
    ]}
  ]
}
```

## Quiz

```quiz
[
  { "prompt": "Il faut que tu ___ patient.", "options": ["es","sois","seras"], "answer": 1, "why": "« Il faut que » → subjonctif : sois." }
]
```
