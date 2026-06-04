# The LLM "pal" layer

Compagnon's smart features — card suggestions, LLM auto-tagging, and roleplay — run through **one
interface** with interchangeable, fully local backends. No paid API calls; nothing leaves your
machine. The core app works completely without any of it.

> **Status: the interface and the deterministic fallback ship in Pass 1; the adapters and sidecar
> are Pass 2.** Until an adapter is registered and reachable, `getActiveAdapter()` returns `null`,
> the **Pal** screen shows a calm "not connected yet" state, and tagging falls back to the
> deterministic tagger. This document describes the intended setup.

## The contract

`src/lib/llm/types.ts` defines `LLMAdapter`:

```ts
interface LLMAdapter {
  readonly id: string;
  readonly label: string;
  isAvailable(): Promise<boolean>;
  suggestCards(opts): Promise<CardSuggestion[]>;
  tagCard(card): Promise<TagSuggestion>;
  roleplayTurn(history, draft): Promise<RoleplayMessage>;
}
```

Feature code never imports a concrete backend — it asks `getActiveAdapter()` for the first reachable
one (`src/lib/llm/index.ts`). Registering adapters is the only change Pass 2 makes to wiring.

### Always-on fallback

`suggestTags()` (`src/lib/llm/tagger.ts`) is a deterministic keyword/heuristic tagger — it detects
subjonctif triggers, travel/food/work/nature vocabulary, politeness, and guesses a CEFR level. It
needs no model and powers the **Suggest** button in the card editor today. You always confirm tags
before they're applied.

## Backend 1 — Claude Code (default, uses your Max subscription)

A tiny local Node sidecar exposes `localhost` endpoints that shell out to the Claude Code CLI in
non-interactive mode. The web app talks to the sidecar over `localhost` (Vite proxies `/pal` →
`http://localhost:8787`).

**Setup (intended):**

1. Install Claude Code and log in with your Max account (`claude`).
2. `npm run sidecar` — starts the bridge on `:8787`.
3. In the app, the Pal features light up automatically once the sidecar answers `isAvailable()`.

The sidecar invokes the CLI roughly as:

```bash
claude -p "<prompt>" --output-format json
```

> ⚠️ **Verify the flags at build time.** This was checked against `claude` **v2.1.162**, where
> `-p`/`--print` is non-interactive and `--output-format json` returns structured output. The CLI is
> not a stable API — confirm the installed version's flags (`claude --help`) and adapt rather than
> hardcoding. This is an **unofficial pattern** that depends on the CLI and your login and may change;
> the app must keep working if it breaks (it does — the adapter just reports unavailable).

## Backend 2 — Ollama / Mistral (fully local fallback)

Talk to a local [Ollama](https://ollama.com) server.

**Setup (intended):**

```bash
ollama pull mistral        # or a French-tuned variant
ollama serve               # usually already running
```

`OllamaAdapter` will POST to `http://localhost:11434/api/chat`. Select the backend in Settings or
let the registry auto-pick the first reachable one (Claude Code preferred, Ollama fallback).

## What the pal will do (Pass 2)

- **Smart card suggestions** — given your corpus and weak spots, propose cards at your level on a
  theme you pick (e.g. "10 travel sentences using the subjonctif"). You review/approve before adding.
- **LLM auto-tagging** — richer tags/categories than the heuristic tagger, behind the same call site.
- **Roleplay** — a scene chat (au café, à la gare, à l'hôtel) where the pal plays a role in French at
  your level, gently corrects you, and can spin missed items into flashcards.

All of it flows through the one adapter, and every LLM-powered button degrades to a tasteful disabled
state when no backend is available. Look for `TODO(india):` in `src/lib/llm/` for the registration
seam.
