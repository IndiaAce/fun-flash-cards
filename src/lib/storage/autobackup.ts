/* ============================================================
   COMPAGNON — Automatic disk backup (hands-off durability)
   localStorage is the live store, but it dies with a browser-data
   wipe. This quietly POSTs the whole corpus to the sidecar, which
   writes a JSON snapshot to a real `backups/` folder on disk —
   surviving any browser reset. Fully best-effort:
     • debounced, so a burst of edits writes once
     • fire-and-forget; if the sidecar is down we just skip
     • never throws into the app
   The result of the last attempt is published so the UI can show
   a calm "last backed up …" line without driving any logic.
   ============================================================ */

import type { PersistedState } from "@/lib/types";

const ENDPOINT = "/pal-api/backup";
const DEBOUNCE_MS = 4000;

export interface BackupStatus {
  ok: boolean;
  /** ISO time of the last successful write, or null if none yet this session. */
  at: string | null;
  /** Short reason when ok=false (e.g. "offline"); for a quiet hint only. */
  detail?: string;
}

let status: BackupStatus = { ok: false, at: null, detail: "pending" };
const listeners = new Set<(s: BackupStatus) => void>();
let timer: ReturnType<typeof setTimeout> | null = null;
let pending: PersistedState | null = null;

function publish(next: BackupStatus) {
  status = next;
  for (const fn of listeners) fn(status);
}

async function flush() {
  timer = null;
  const state = pending;
  pending = null;
  if (!state) return;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(state),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = (await res.json().catch(() => ({}))) as { at?: string };
    publish({ ok: true, at: body.at ?? new Date().toISOString() });
  } catch (err) {
    // Sidecar not running / offline — that's fine, localStorage still holds it.
    publish({ ok: false, at: status.at, detail: "offline" });
  }
}

/** Queue a debounced backup of the given state. Safe to call on every change. */
export function scheduleBackup(state: PersistedState): void {
  pending = state;
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, DEBOUNCE_MS);
}

/** Subscribe to backup-status changes; returns an unsubscribe fn. */
export function onBackupStatus(fn: (s: BackupStatus) => void): () => void {
  listeners.add(fn);
  fn(status);
  return () => listeners.delete(fn);
}

export function getBackupStatus(): BackupStatus {
  return status;
}
