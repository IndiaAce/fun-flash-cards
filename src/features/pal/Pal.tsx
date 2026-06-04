/* ============================================================
   COMPAGNON — Study pal (LLM features)
   Smart card suggestions + roleplay, through the active LLM
   adapter (Claude Code). When no backend is reachable, shows a
   calm "not connected" state with setup guidance — the rest of
   the app is unaffected.
   ============================================================ */

import { useMemo, useRef, useState } from "react";
import {
  Appear,
  Button,
  Chip,
  EmptyState,
  Icon,
  IconButton,
  Input,
  Segmented,
  Surface,
} from "@/components/kit";
import { useStore } from "@/app/store";
import { slugify } from "@/lib/cards";
import type { LLMAdapter, CardSuggestion, RoleplayMessage } from "@/lib/llm";
import { usePalAdapter } from "./usePalAdapter";

function PalHeader() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
      <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--surface)", border: "1px solid var(--line)", color: "var(--accent)", display: "grid", placeItems: "center" }}>
        <Icon name="sparkle" size={22} />
      </div>
      <div>
        <h1 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "var(--text-3xl)", fontWeight: 500, letterSpacing: "var(--tracking-tight)" }}>
          Your study pal
        </h1>
        <div style={{ color: "var(--ink-3)", fontSize: "var(--text-sm)" }}>Quietly learns what you struggle with. You stay in control.</div>
      </div>
    </div>
  );
}

export function Pal() {
  const { settings } = useStore();
  const { adapter, status } = usePalAdapter(settings.palBackend);
  const [view, setView] = useState<"suggest" | "roleplay">("suggest");

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "44px 32px 60px", height: "100%", display: "flex", flexDirection: "column" }}>
      <Appear>
        <PalHeader />
      </Appear>

      {status !== "ready" || !adapter ? (
        <NotConnected status={status} backendOff={settings.palBackend === "off"} />
      ) : (
        <>
          <Appear delay={60}>
            <div style={{ margin: "22px 0 24px" }}>
              <Segmented
                value={view}
                onChange={setView}
                options={[
                  { value: "suggest", label: "Suggested cards" },
                  { value: "roleplay", label: "Roleplay a scene" },
                ]}
              />
            </div>
          </Appear>
          {view === "suggest" ? <Suggested adapter={adapter} /> : <Roleplay adapter={adapter} />}
        </>
      )}
    </div>
  );
}

/* ---------- not-connected state ---------- */

function NotConnected({ status, backendOff }: { status: string; backendOff: boolean }) {
  return (
    <Appear delay={60}>
      <Surface elevation="sm" style={{ marginTop: 22, background: "var(--accent-soft)", border: "1px solid var(--accent-ring)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Icon name="spark" size={20} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--accent-press)" }}>
              {backendOff ? "The pal is turned off" : status === "checking" ? "Looking for the pal…" : "The pal isn't connected"}
            </div>
            <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", color: "var(--accent-press)", lineHeight: 1.6 }}>
              {backendOff ? (
                <>Enable it in <strong>Settings → Study pal</strong>. It runs locally through Claude Code — no API cost.</>
              ) : (
                <>
                  Start the local bridge with <code>npm run sidecar</code> (and make sure you're logged into Claude Code),
                  then it lights up automatically. See <code>docs/LLM.md</code>. Everything else in Compagnon works without it.
                </>
              )}
            </p>
          </div>
        </div>
      </Surface>
    </Appear>
  );
}

/* ---------- smart suggestions ---------- */

function Suggested({ adapter }: { adapter: LLMAdapter }) {
  const { cards, bulkAdd } = useStore();
  const [theme, setTheme] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CardSuggestion[] | null>(null);

  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cards) for (const t of c.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t]) => t);
  }, [cards]);

  const run = async () => {
    setBusy(true);
    setError(null);
    setItems(null);
    try {
      const out = await adapter.suggestCards({
        theme: theme.trim() || undefined,
        level: "B1",
        count: 8,
        existing: cards.map((c) => ({ front: c.front, type: c.type })),
      });
      setItems(out);
      if (out.length === 0) setError("The pal didn't return any usable cards — try again or a different theme.");
    } catch (e) {
      setError((e as Error).message || "Something went wrong reaching the pal.");
    } finally {
      setBusy(false);
    }
  };

  const approve = (s: CardSuggestion) => {
    bulkAdd([
      {
        type: s.type,
        front: s.front,
        back: s.back,
        gender: s.gender,
        tags: [...new Set([...s.tags, "pal"])],
        source: "Study pal",
      },
    ]);
    setItems((arr) => (arr ? arr.filter((x) => x !== s) : arr));
  };
  const dismiss = (s: CardSuggestion) => setItems((arr) => (arr ? arr.filter((x) => x !== s) : arr));

  return (
    <Appear>
      <Surface elevation="sm" style={{ marginBottom: 18 }}>
        <div style={{ fontSize: "var(--text-sm)", color: "var(--ink-3)", marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
          <Icon name="sparkle" size={15} /> Ask for new cards on a theme. You approve each one before it's added.
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <Input icon="tag" placeholder="a theme — e.g. voyage, subjonctif, au restaurant…" value={theme} onChange={setTheme} onKeyDown={(e) => { if (e.key === "Enter") run(); }} />
          </div>
          <Button variant="primary" icon="sparkle" onClick={run} disabled={busy}>{busy ? "Thinking…" : "Suggest"}</Button>
        </div>
        {topTags.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
            {topTags.map((t) => (
              <Chip key={t} tone="neutral" onClick={() => setTheme(t)}>{t}</Chip>
            ))}
          </div>
        )}
      </Surface>

      {error && (
        <Surface elevation="none" style={{ background: "var(--miss-soft)", border: "1px solid var(--miss)", marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--miss-ink)", fontSize: "var(--text-sm)" }}>
            <Icon name="spark" size={16} /> {error}
          </div>
        </Surface>
      )}

      {items && items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {items.map((s, i) => (
            <Surface key={i} elevation="sm">
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <Chip tone="accent" size="sm">{s.type}</Chip>
                {s.tags.map((t) => <Chip key={t} tone="neutral" size="sm">{t}</Chip>)}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-2xl)", fontWeight: 500 }}>{s.front}</span>
                {s.gender && <span style={{ color: "var(--ink-4)", fontSize: "var(--text-sm)" }}>{s.gender === "m" ? "le" : "la"}</span>}
                <span style={{ color: "var(--ink-3)", fontSize: "var(--text-md)" }}>— {s.back}</span>
              </div>
              {s.reason && (
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "11px 14px", background: "var(--accent-soft)", borderRadius: "var(--radius-md)", marginBottom: 16 }}>
                  <Icon name="sparkle" size={15} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--accent-press)", lineHeight: 1.5 }}>{s.reason}</span>
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <Button variant="primary" size="sm" icon="plus" onClick={() => approve(s)}>Add to corpus</Button>
                <Button variant="ghost" size="sm" onClick={() => dismiss(s)}>Not now</Button>
              </div>
            </Surface>
          ))}
        </div>
      )}

      {items && items.length === 0 && !error && (
        <Surface elevation="sm">
          <EmptyState icon="check" title="All reviewed" body="Approved cards are in your corpus. Ask for more any time." />
        </Surface>
      )}
    </Appear>
  );
}

/* ---------- roleplay ---------- */

const SCENES = ["Au café", "À la gare", "À l'hôtel", "Au restaurant"];

function Roleplay({ adapter }: { adapter: LLMAdapter }) {
  const { bulkAdd } = useStore();
  const [scene, setScene] = useState<string | null>(null);
  const [messages, setMessages] = useState<RoleplayMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [showEn, setShowEn] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<Record<number, boolean>>({});
  const endRef = useRef<HTMLDivElement>(null);

  const scrollEnd = () => requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));

  const start = async (s: string) => {
    setScene(s);
    setMessages([]);
    setError(null);
    setThinking(true);
    try {
      const reply = await adapter.roleplayTurn(
        [],
        `Commençons une conversation. Tu joues un rôle dans cette scène : « ${s} ». Salue-moi en français pour ouvrir la scène.`,
      );
      setMessages([reply]);
      scrollEnd();
    } catch (e) {
      setError((e as Error).message || "The pal couldn't start the scene.");
    } finally {
      setThinking(false);
    }
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || thinking) return;
    const mine: RoleplayMessage = { who: "me", fr: text };
    const history = [...messages, mine];
    setMessages(history);
    setDraft("");
    setThinking(true);
    setError(null);
    scrollEnd();
    try {
      const reply = await adapter.roleplayTurn(history, text);
      setMessages((m) => [...m, reply]);
      scrollEnd();
    } catch (e) {
      setError((e as Error).message || "The pal didn't reply — try again.");
    } finally {
      setThinking(false);
    }
  };

  const addCard = (m: RoleplayMessage, idx: number) => {
    bulkAdd([{ type: "sentence", front: m.fr, back: m.en ?? "", tags: ["roleplay", scene ? slugify(scene) : "cafe"], source: "Roleplay" }]);
    setAdded((a) => ({ ...a, [idx]: true }));
  };

  if (!scene) {
    return (
      <Appear>
        <Surface elevation="sm">
          <div style={{ fontSize: "var(--text-md)", fontWeight: 600, marginBottom: 6 }}>Choose a scene</div>
          <p style={{ margin: "0 0 16px", color: "var(--ink-3)", fontSize: "var(--text-sm)", lineHeight: 1.55 }}>
            The pal plays a role in French at your level, gently corrects you, and you can save any line as a flashcard.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {SCENES.map((s) => (
              <Button key={s} variant="outline" iconRight="arrowRight" onClick={() => start(s)}>{s}</Button>
            ))}
          </div>
        </Surface>
      </Appear>
    );
  }

  return (
    <Appear style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", background: "var(--surface)", overflow: "hidden" }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--line)", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Chip tone="accent" icon="sparkle">Scène</Chip>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-lg)", fontWeight: 500 }}>{scene}</span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button type="button" onClick={() => setShowEn((s) => !s)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-3)", fontSize: "var(--text-sm)", fontFamily: "inherit", display: "inline-flex", gap: 6, alignItems: "center" }}>
              <Icon name="volume" size={15} /> {showEn ? "Hide" : "Show"} translation
            </button>
            <IconButton name="x" title="End scene" onClick={() => { setScene(null); setMessages([]); }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "22px", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map((m, i) => (
            <Bubble key={i} m={m} showEn={showEn} added={!!added[i]} onAdd={m.who === "pal" ? () => addCard(m, i) : undefined} />
          ))}
          {thinking && <div style={{ color: "var(--ink-3)", fontSize: "var(--text-sm)", fontStyle: "italic" }}>Le pal réfléchit…</div>}
          {error && <div style={{ color: "var(--miss-ink)", fontSize: "var(--text-sm)" }}>{error}</div>}
          <div ref={endRef} />
        </div>

        <div style={{ padding: "14px 16px", borderTop: "1px solid var(--line)", display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <Input placeholder="Répondez en français…" value={draft} onChange={setDraft} onKeyDown={(e) => { if (e.key === "Enter") send(); }} />
          </div>
          <IconButton name="send" title="Send" onClick={send} size={44} active />
        </div>
      </div>
    </Appear>
  );
}

function Bubble({ m, showEn, added, onAdd }: { m: RoleplayMessage; showEn: boolean; added: boolean; onAdd?: () => void }) {
  const mine = m.who === "me";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start", gap: 4 }}>
      <div style={{ maxWidth: "80%", padding: "12px 16px", borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: mine ? "var(--accent)" : "var(--surface-3)", color: mine ? "var(--on-accent)" : "var(--ink)" }}>
        <div style={{ fontSize: "var(--text-md)", lineHeight: 1.45 }}>{m.fr}</div>
        {showEn && m.en && <div style={{ fontSize: "var(--text-sm)", marginTop: 4, opacity: mine ? 0.82 : 0.6, fontStyle: "italic" }}>{m.en}</div>}
      </div>
      {!mine && m.note && (
        <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: "var(--text-xs)", color: "var(--accent-press)", background: "var(--accent-soft)", padding: "4px 10px", borderRadius: "var(--radius-full)" }}>
          <Icon name="spark" size={12} /> {m.note}
        </div>
      )}
      {!mine && onAdd && (
        <button type="button" onClick={added ? undefined : onAdd} style={{ border: "none", background: "transparent", cursor: added ? "default" : "pointer", color: added ? "var(--got-ink)" : "var(--ink-3)", fontSize: "var(--text-xs)", fontFamily: "inherit", display: "inline-flex", gap: 5, alignItems: "center", padding: "2px 4px" }}>
          <Icon name={added ? "check" : "plus"} size={12} /> {added ? "Saved as card" : "Save as flashcard"}
        </button>
      )}
    </div>
  );
}
