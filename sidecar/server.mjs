/* ============================================================
   COMPAGNON — LLM sidecar (Pass 2 placeholder)
   This will be a tiny localhost bridge that shells out to the
   Claude Code CLI (`claude -p "<prompt>" --output-format json`)
   so the web app can use LLM features through your Max
   subscription — no paid API calls. See docs/LLM.md.

   It is intentionally NOT implemented in Pass 1: the app is fully
   usable without it, and LLM-powered buttons show a tasteful
   "not connected yet" state. Running it now just prints guidance.
   TODO(india): implement the HTTP bridge + Claude Code adapter.
   ============================================================ */

console.log(
  [
    "Compagnon sidecar — not implemented yet (Pass 2).",
    "",
    "This bridge will expose localhost endpoints that call the Claude Code CLI",
    "in non-interactive mode. See docs/LLM.md for the design and setup.",
    "",
    "The app works fully without it.",
  ].join("\n"),
);

process.exit(0);
