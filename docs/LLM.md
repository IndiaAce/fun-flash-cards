# The LLM "pal" layer

Compagnon's smart features — **card suggestions**, **smart tagging**, and **roleplay** — run through
**one interface** with a local backend. No paid API calls; nothing leaves your machine. The core app
works completely without any of it.

> **Status: implemented for Claude Code.** `ClaudeCodeAdapter` is live; `OllamaAdapter` is a
> documented stub (`isAvailable()` → false) for when you install Ollama. When no backend is reachable,
> `getActiveAdapter()` returns `null`, the **Pal** screen shows a calm "not connected" state, and the
> card editor's tagging falls back to the deterministic tagger.

## How it fits together

```
Pal UI / card editor
      │  (LLMAdapter — src/lib/llm)
      ▼
POST /pal-api/complete   ──Vite proxy──►   sidecar (:8787)   ──►  `claude -p "<prompt>" --output-format json`
```

- The browser only ever calls `/pal-api/*`, which Vite proxies to the sidecar (`vite.config.ts`). The
  `/pal-api` prefix is deliberately distinct from the in-app `/pal` route.
- The **TS adapter** owns prompt-building (`prompts.ts`) and output parsing (`parse.ts`) — both unit
  tested. The **sidecar** is a thin, generic "run this prompt" bridge.

## Setup (Claude Code)

1. Install Claude Code and log in with your Max account (`claude`). No API key, no per-call cost.
2. `npm run sidecar` — starts the bridge on `http://127.0.0.1:8787`.
3. `npm run dev` — the Pal features detect the sidecar via `/pal-api/health` and light up. Pick the
   backend in **Settings → Study pal** (Auto / Claude Code / Off).

That's it. Stop the sidecar and everything degrades gracefully.

### The sidecar (`sidecar/server.mjs`)

Zero dependencies. Two endpoints:

- `GET /pal-api/health` → `{ ok, backend: "claude-code", model }` (checks the `claude` CLI is callable).
- `POST /pal-api/complete` `{ prompt }` → runs `claude -p <prompt> --output-format json`, returns
  `{ text }` (the CLI's `result` field).

**Injection-safe:** the CLI is invoked via `execFile` with an **args array**, never a shell string, so
card text / user input can't inject shell commands. Prompts are length-capped; calls time out at 120s.

Env: `PORT` (default 8787), `PAL_CLAUDE_MODEL` (optional — defaults to the CLI's configured model).

> ⚠️ This is an **unofficial pattern** that depends on the Claude CLI and your login, and could break
> if the CLI changes. Verified against `claude` **v2.1.162** (`-p`/`--print` non-interactive,
> `--output-format json` → `{ …, "result": "<text>" }`). If you upgrade and the pal stops working,
> check `claude --help` and adjust `sidecar/server.mjs`. The app keeps working regardless — the
> adapter just reports unavailable.

## What the pal does

- **Smart card suggestions** (`Pal → Suggested cards`) — pick a theme; the model proposes ~8 leveled
  cards (with tags, gender, and a one-line reason), avoiding your existing corpus. You approve each
  before it's added (deduped via the store), tagged `pal`.
- **Smart tagging** (card editor **Suggest** button) — uses `adapter.tagCard` when a backend is live,
  else the deterministic `suggestTags` (`src/lib/llm/tagger.ts`). You always confirm.
- **Roleplay** (`Pal → Roleplay a scene`) — pick a scene (café / gare / hôtel / resto); the pal plays
  a role in French at your level, one turn at a time, with a translation toggle, gentle corrections,
  and a "save as flashcard" affordance on its lines.

Robustness: the model is asked for strict JSON; `extractJSON` in `parse.ts` tolerates fenced/noisy
output and the validators drop malformed items, so a stray reply degrades to "nothing usable" rather
than a crash.

## Adding Ollama (later)

`OllamaAdapter` (`src/lib/llm/ollama.ts`) is a stub today. To finish it:

1. `ollama pull mistral` (or a French-tuned variant); `ollama serve`.
2. Add an `ollama` backend to `sidecar/server.mjs` that POSTs to `http://localhost:11434/api/chat`
   (server-side, so no browser CORS), behind the same `/pal-api/complete` shape.
3. Mirror `ClaudeCodeAdapter` in `ollama.ts`, and add `"ollama"` to the Settings backend toggle.

Look for `TODO(india):` in `src/lib/llm/ollama.ts`.

## Where it lives

- `src/lib/llm/` — `types.ts` (the `LLMAdapter` contract), `client.ts` (`/pal-api` fetch),
  `prompts.ts`, `parse.ts`, `claude-code.ts`, `ollama.ts` (stub), `tagger.ts` (deterministic
  fallback), `index.ts` (registry + `getActiveAdapter(prefer)`), `llm.test.ts`.
- `src/features/pal/` — `Pal.tsx` (suggestions + roleplay) and `usePalAdapter.ts` (status hook).
- `sidecar/server.mjs` — the bridge.
