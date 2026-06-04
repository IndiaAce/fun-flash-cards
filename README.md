# Compagnon

A local-first French learning pal — spaced-repetition **flashcards** and data-driven **verb
cheat sheets**, sharing one calm, Apple-clean design system. Everything runs on your machine;
your corpus lives in the browser and exports to JSON for git backup. An optional LLM "pal" layer
(Claude Code or local Ollama) adds card suggestions and roleplay — see [Pass 2](#pass-2--the-llm-pal).

> Status: **Pass 1 (the showcase)** is complete — design system, app shell, storage with
> export/import, the subjonctif cheat-sheet engine, flashcards + FSRS scheduling, and live
> dashboard insights. The LLM adapters, sidecar, and roleplay land in Pass 2; their buttons show a
> tasteful "not yet enabled" state until then, and the core app is fully usable without them.

## Quickstart

```bash
npm install
npm run dev          # http://localhost:5173
```

On first run the app seeds a living starter corpus (survival phrases tagged `voyage`, a spread of
vocabulary, and a little review history so the dashboard insight has something to say) plus the
built-in **subjonctif** cheat sheet.

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
    storage/               Versioned localStorage wrapper + migrations + export/import
    srs/                   FSRS scheduling, due-queue, weak-spot analytics, insight
    llm/                   LLMAdapter interface + deterministic tagger (adapters: Pass 2)
  data/                    Seed corpus + the subjonctif cheat sheet
  app/                     Store (React context), router, shell, theme
  features/
    dashboard/             Home: due today + insight + pal entry
    flashcards/            Review session, corpus browser, editor, bulk add
    cheatsheets/           Data-driven cheat-sheet engine
    pal/                   Study pal (Pass 2; disabled state for now)
    settings/              Preferences + data export/import
docs/                      SRS.md, CHEATSHEETS.md, LLM.md
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
- **`CheatSheet`** — a sheet is *data*: an array of typed sections
  (`formation | conjugator | triggers | phrases | quiz`). A new sheet is a new data file — see
  [`docs/CHEATSHEETS.md`](docs/CHEATSHEETS.md).
- **`Settings`** — theme, accent, reveal style, grade-control style.
- **`PersistedState`** — `{ schemaVersion, cards, reviewLog, customCheatSheets, settings }`, with a
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
