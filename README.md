# Compagnon

A local-first French learning pal — spaced-repetition **flashcards** and Markdown-authored,
interactive **grammar guides**, sharing one calm, Apple-clean design system. Everything runs on your
machine; your corpus lives in the browser and exports to JSON for git backup. An optional LLM "pal"
layer adds card suggestions, smart tagging, and roleplay through your Claude Max subscription — see
[`docs/LLM.md`](docs/LLM.md).

> Status: design system, FSRS flashcards, live dashboard insights, a **Duolingo word-list importer**,
> a **Markdown content-guide engine** (drop a `.md` in `src/content/`, get an interactive chapter),
> and the **LLM pal** (suggestions / tagging / roleplay via a local Claude Code sidecar — no API cost).
> The pal is optional: with the sidecar off, those features show a calm "not connected" state and the
> rest of the app is unaffected. (Ollama is a documented stub for now.)

## Quickstart

```bash
npm install
npm run dev          # http://localhost:5173
```

On first run the app seeds a living starter corpus (survival phrases tagged `voyage`, a spread of
vocabulary, and a little review history so the dashboard insight has something to say). The
**subjonctif** guide ships as Markdown in `src/content/`.

### Importing your own words

- **Corpus → Duolingo** imports a copied Duolingo word list (French/English on alternating lines,
  blank line between entries). Tagged `duolingo` + auto-tags, deduped.
- **Corpus → Bulk add** pastes a `front | back` list.
- **Guides** are Markdown chapters in `src/content/` — see [`docs/CONTENT.md`](docs/CONTENT.md) to
  author a new one (or have Claude Web generate one to that spec from a textbook chapter).

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run the unit tests (Vitest) |
| `npm run sidecar` | Start the optional LLM bridge (Pass 2) |

### Optional: the LLM pal

Two interchangeable backends, neither required:

- **Claude Code** (uses your Max subscription, no API cost) via a tiny local Node sidecar.
- **Ollama / Mistral** (fully local).

Setup lives in [`docs/LLM.md`](docs/LLM.md). Until one is reachable, the **Pal** screen and any
LLM-powered button degrade gracefully.

## What's inside

```
src/
  styles/tokens.css        Design tokens (ported 1:1 from the Claude Design handoff)
  components/kit.tsx        Shared component kit (Button, Chip, Surface, Tabs, …)
  lib/
    types.ts               Core data models (the contract across the app)
    cards.ts               Card heuristics (type guess, gender, slug)
    storage/               Versioned localStorage wrapper + migrations + export/import
    srs/                   FSRS scheduling, due-queue, weak-spot analytics, insight
    import/duolingo.ts     Duolingo word-list parser → cards
    content/               Guide Markdown parser, registry, and renderer plumbing
    llm/                   LLMAdapter interface + deterministic tagger (adapters: Pass 2)
  content/                 The Markdown grammar guides (e.g. subjonctif.md)
  data/                    First-run seed corpus
  app/                     Store (React context), router, shell, theme
  features/
    dashboard/             Home: due today + insight + pal entry
    flashcards/            Review session, corpus browser, editor, bulk + Duolingo import
    guides/                Markdown guide renderer + interactive widgets
    pal/                   Study pal (Pass 2; disabled state for now)
    settings/              Preferences + data export/import
docs/                      SRS.md, CONTENT.md, LLM.md
sidecar/                   Node bridge for the Claude Code adapter (Pass 2)
```

## Data model overview

Everything persists under a single versioned localStorage key (`compagnon`), wrapped so a swap to
IndexedDB later touches only `src/lib/storage`. The shapes (full definitions in
[`src/lib/types.ts`](src/lib/types.ts)):

- **`Flashcard`** — `type` (`word | phrase | sentence`), `front`, `back`, optional
  `notes`/`ipa`/`gender`/`category`, free-form `tags`, `source`, and `srs` (per-card FSRS state).
  `chien` and `un chien` are intentionally distinct cards (the article matters).
- **`ReviewLogEntry`** — one row per grade, denormalising the card's category/tags so the
  weak-spot analytics and dashboard insight are cheap to compute.
- **`Guide`** — an interactive grammar chapter authored in **Markdown** (`src/content/*.md`): prose +
  `:::note`/`:::trap` callouts + fenced JSON widgets (`conjugator | triggers | phrases | quiz`). Drop a
  `.md` in and it appears at `/guides/<id>` with no code changes — authoring spec in
  [`docs/CONTENT.md`](docs/CONTENT.md). (Guides are static content, not part of the persisted corpus.)
- **`Settings`** — theme, accent, reveal style, grade-control style.
- **`PersistedState`** — `{ schemaVersion, cards, reviewLog, settings }` (+ a reserved field), with a
  `migrate()` hook (`src/lib/storage/schema.ts`) that walks old payloads up to the current version.

### Backups

**Corpus → Export** (or **Settings → Export**) downloads the whole state as JSON; **Import**
restores it. Hand-edit it, commit it to git, move machines — it round-trips through `migrate()`.

## Spaced repetition

Compagnon schedules with **FSRS** (via `ts-fsrs`) and biases the daily queue toward your weak
spots. The reasoning, the grade→interval mapping, and the analytics are written up in
[`docs/SRS.md`](docs/SRS.md).

## Design

The look is the Claude Design handoff, taken as the source of truth: warm paper background, white
floating surfaces, a calm-blue accent, sage "got it" / clay "missed it" semantics (never red),
Newsreader for French display moments and Hanken Grotesk for UI. Foundations are CSS variables in
`src/styles/tokens.css`; components read them directly. Dark mode is a clean secondary.

## Tests

`npm test` covers the storage migration round-trip + dedupe, the FSRS grade mapping, the queue
filters, and the insight generator.

## Pass 2 — the LLM pal

Planned next: implement `ClaudeCodeAdapter` (sidecar shelling to the `claude` CLI) and
`OllamaAdapter`, then wire the Pal screen's card suggestions, LLM auto-tagging, and roleplay.
Look for `TODO(india):` markers where the seams are deliberately left open.
