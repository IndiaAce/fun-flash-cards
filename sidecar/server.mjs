/* ============================================================
   COMPAGNON — LLM sidecar (Claude Code bridge)
   A tiny localhost HTTP bridge that shells out to the Claude Code
   CLI so the web app can use LLM features through your Max
   subscription — no paid API calls. Zero dependencies.

   The web app reaches this via Vite's /pal proxy (→ :8787). The
   app is fully usable without it; if it's down, the Pal features
   show a calm "not connected" state.

   Run it with:  npm run sidecar
   See docs/LLM.md.
   ============================================================ */

import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT ?? 8787);
const MODEL = process.env.PAL_CLAUDE_MODEL || ""; // empty = the CLI's default model
const MAX_PROMPT = 24_000; // characters — a generous cap, prompts are small
const MAX_BACKUP = 32 << 20; // 32 MB — corpora are big but not unbounded
const TIMEOUT_MS = 120_000;

// backups/ lives at the project root (one level up from sidecar/).
const PROJECT_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const BACKUP_DIR = join(PROJECT_ROOT, "backups");

/** Promise wrapper around execFile (args array — never a shell string). */
function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { timeout: TIMEOUT_MS, maxBuffer: 8 << 20, ...opts }, (err, stdout, stderr) => {
      if (err) {
        err.stderr = stderr;
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
}

function send(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json" });
  res.end(text);
}

function readBody(req, limit = MAX_PROMPT * 2) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > limit) reject(new Error("payload too large"));
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

/** Write the corpus to disk: a dated daily snapshot + an always-current latest. */
async function writeBackup(rawJson) {
  await mkdir(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const daily = join(BACKUP_DIR, `compagnon-${stamp}.json`);
  const latest = join(BACKUP_DIR, "compagnon-latest.json");
  await Promise.all([writeFile(daily, rawJson), writeFile(latest, rawJson)]);
  return { file: `backups/compagnon-${stamp}.json` };
}

/** Is the Claude CLI installed and callable? */
async function claudeAvailable() {
  try {
    await run("claude", ["--version"]);
    return true;
  } catch {
    return false;
  }
}

/** Run one non-interactive completion through `claude -p … --output-format json`. */
async function complete(prompt) {
  const args = ["-p", prompt, "--output-format", "json"];
  if (MODEL) args.push("--model", MODEL);
  const stdout = await run("claude", args);
  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    // Older/newer CLIs might not wrap in JSON — treat stdout as the text.
    return stdout.trim();
  }
  if (parsed.is_error || (parsed.subtype && parsed.subtype !== "success")) {
    throw new Error(parsed.result || parsed.subtype || "claude reported an error");
  }
  return typeof parsed.result === "string" ? parsed.result : stdout.trim();
}

const server = createServer(async (req, res) => {
  const url = (req.url || "").split("?")[0];

  if (req.method === "GET" && url === "/pal-api/health") {
    const ok = await claudeAvailable();
    return send(res, 200, { ok, backend: "claude-code", model: MODEL || "default" });
  }

  if (req.method === "POST" && url === "/pal-api/backup") {
    try {
      const raw = await readBody(req, MAX_BACKUP);
      // Validate it's parseable JSON before touching disk; never store garbage.
      const parsed = JSON.parse(raw || "null");
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.cards)) {
        return send(res, 400, { error: "Not a Compagnon state payload." });
      }
      const { file } = await writeBackup(raw);
      return send(res, 200, { ok: true, at: new Date().toISOString(), file });
    } catch (err) {
      console.error("[backup] failed:", err?.message || err);
      return send(res, 500, { error: String(err?.message || err) });
    }
  }

  if (req.method === "POST" && url === "/pal-api/complete") {
    try {
      const raw = await readBody(req);
      const { prompt } = JSON.parse(raw || "{}");
      if (typeof prompt !== "string" || !prompt.trim()) {
        return send(res, 400, { error: "Missing 'prompt' string." });
      }
      if (prompt.length > MAX_PROMPT) {
        return send(res, 413, { error: "Prompt too large." });
      }
      const text = await complete(prompt);
      return send(res, 200, { text });
    } catch (err) {
      console.error("[pal] /pal/complete failed:", err?.message || err);
      return send(res, 500, { error: String(err?.message || err) });
    }
  }

  send(res, 404, { error: "Not found." });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Compagnon sidecar (Claude Code) on http://127.0.0.1:${PORT}`);
  console.log(`  GET  /pal-api/health`);
  console.log(`  POST /pal-api/complete  { prompt }`);
  console.log(MODEL ? `  model: ${MODEL}` : "  model: CLI default");
});
