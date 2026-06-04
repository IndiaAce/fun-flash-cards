/* ============================================================
   COMPAGNON — Sidecar client
   Thin fetch wrapper over the local /pal bridge (Vite proxies
   /pal → http://localhost:8787). Adapters use this; nothing else
   talks to the sidecar directly.
   ============================================================ */

const BASE = "/pal-api";

export interface HealthResult {
  ok: boolean;
  backend?: string;
  model?: string;
}

export async function palHealth(): Promise<HealthResult> {
  try {
    const r = await fetch(`${BASE}/health`, { method: "GET" });
    if (!r.ok) return { ok: false };
    return (await r.json()) as HealthResult;
  } catch {
    // Sidecar not running / not reachable.
    return { ok: false };
  }
}

/** Run one completion through the sidecar. Throws on transport or model error. */
export async function palComplete(prompt: string): Promise<string> {
  const r = await fetch(`${BASE}/complete`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!r.ok) {
    const body = (await r.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Pal request failed (${r.status})`);
  }
  const { text } = (await r.json()) as { text: string };
  return text;
}
