# Turning a textbook chapter into a guide (Claude Web prompt)

Use this when you want Claude Web to convert a grammar chapter (PDF/screenshots/text) into a
Compagnon guide. Paste the **prompt** below, attach the chapter, and paste the contents of
[`docs/CONTENT.md`](CONTENT.md) so it has the full spec. You'll get back one `.md` file — save it as
`src/content/<id>.md` and it appears in the app at `/guides/<id>`.

---

## Copy-paste prompt

> You are authoring a single Markdown file for **Compagnon**, a French-learning app. I'll give you a
> grammar chapter; convert it into one self-contained interactive guide.
>
> **Follow the format spec exactly** (pasted below / attached as `CONTENT.md`). Hard rules:
> - Output **one Markdown file only**, inside a single code block. No commentary before or after.
> - Start with `---` frontmatter: `id` (kebab-case, unique), `title` (put the key word in `{{ }}`),
>   `eyebrow`, one-sentence `intro`, `tags`, `level`.
> - Use `##` for each major section — these become the guide's section bar. A good rhythm is
>   **Formation → Conjugueur → Déclencheurs → En voyage → Quiz**, but match the chapter.
> - Body is normal Markdown (prose, tables, lists, **bold**, *italic*, `code`). Raw HTML is ignored.
> - Use `:::note Title … :::` for nuances/mnemonics and `:::trap Title … :::` for the classic mistake.
> - Use the fenced **JSON** widgets where they fit: `conjugator`, `triggers`, `phrases`, `quiz`.
>   The JSON must be **strictly valid** — double-quoted keys, no trailing commas. `conjugator` forms
>   are 6 strings in the order `que je · que tu · qu'il/elle · que nous · que vous · qu'ils/elles`,
>   with `"—"` for impersonal/missing forms.
> - French is the content language; English goes in `en` / `gloss` / `why` fields.
> - Don't invent grammar — only use what's in the chapter (plus standard, uncontroversial forms).
>   If something doesn't fit a widget, keep it as prose.
>
> Here is the format spec:
>
> ```
> << paste docs/CONTENT.md here >>
> ```
>
> Here is the chapter to convert:
>
> << attach the PDF / paste the text here >>

---

## Tips

- **One concept per guide.** A chapter like "le subjonctif" is one guide; if the book bundles three
  unrelated topics, ask for three files.
- **Pick the `id` yourself** if you care about the URL — it shouldn't change once you've made cards
  from the guide (cards reference it via `source`).
- If a `conjugator`/`quiz` block ever fails to render, open the browser console — the error names the
  block and the JSON problem (usually a trailing comma). Fix and re-save.
- Start from [`src/content/_template.md`](../src/content/_template.md) (a draft skeleton the app
  skips) or copy `src/content/subjonctif.md`, which exercises every feature.
