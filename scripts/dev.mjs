/* ============================================================
   COMPAGNON — Dev launcher
   Starts Vite and the sidecar together so a single `npm run dev`
   gives you the app AND hands-off disk backups (+ the LLM pal).
   Zero dependencies — just spawns the two and forwards output.
   The sidecar is optional: if it fails to start, Vite keeps going
   and the app stays fully usable (backups simply pause).
   ============================================================ */

import { spawn } from "node:child_process";

const procs = [];

function start(name, command, args, { optional = false } = {}) {
  const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"], shell: false });
  const tag = `[${name}]`;
  const pipe = (stream, out) => {
    stream.on("data", (chunk) => {
      for (const line of String(chunk).split("\n")) {
        if (line.trim()) out(`${tag} ${line}`);
      }
    });
  };
  pipe(child.stdout, console.log);
  pipe(child.stderr, console.error);
  child.on("exit", (code) => {
    if (optional && code !== 0) {
      console.error(`${tag} exited (${code}) — continuing without it.`);
      return;
    }
    shutdown(code ?? 0);
  });
  child.on("error", (err) => {
    if (optional) {
      console.error(`${tag} could not start (${err.message}) — continuing without it.`);
      return;
    }
    console.error(`${tag} ${err.message}`);
    shutdown(1);
  });
  procs.push(child);
}

let shuttingDown = false;
function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const p of procs) {
    if (!p.killed) p.kill("SIGTERM");
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

// Vite is the primary process; the sidecar is optional company.
start("sidecar", process.execPath, ["sidecar/server.mjs"], { optional: true });
start("vite", "npx", ["vite"]);
