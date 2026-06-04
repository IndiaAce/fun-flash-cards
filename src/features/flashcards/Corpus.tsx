/* ============================================================
   COMPAGNON — Corpus browser + card editor + bulk add
   Search / filter by type·tag·category / sort, a slide-over
   editor, bulk paste with dedupe & deterministic auto-tagging,
   and JSON export/import. Ported from screen-corpus.jsx and wired
   to the live store.
   ============================================================ */

import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Chip,
  EmptyState,
  Eyebrow,
  Icon,
  IconButton,
  Input,
  Segmented,
  Surface,
  Textarea,
} from "@/components/kit";
import { useStore } from "@/app/store";
import { accuracyByCategory, accuracyByTag, weaknessScore } from "@/lib/srs";
import { suggestTags } from "@/lib/llm";
import type { CardType, Flashcard, Gender } from "@/lib/types";
import type { NewCardInput } from "@/lib/storage";

const DEFAULT_CATEGORIES = [
  "Travel", "Food", "Home", "Society", "Nature", "Emotion", "Atmosphere",
  "Idioms", "Conversation", "Work", "Subjonctif", "Everyday",
];

const TYPE_FILTERS: Array<{ value: CardType | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "word", label: "Words" },
  { value: "phrase", label: "Phrases" },
  { value: "sentence", label: "Sentences" },
];
const TYPE_DOT: Record<CardType, string> = {
  word: "var(--accent)",
  phrase: "var(--got)",
  sentence: "var(--warm)",
};

function strengthLabel(weak: number): { t: string; tone: "got" | "warm" | "miss" } {
  if (weak < 0.25) return { t: "Strong", tone: "got" };
  if (weak < 0.55) return { t: "Learning", tone: "warm" };
  return { t: "Weak", tone: "miss" };
}

export function Corpus() {
  const { cards, reviewLog, addCard, updateCard, removeCard, exportBackup, importBackup } = useStore();
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [type, setType] = useState<CardType | "all">("all");
  const [cat, setCat] = useState<string | null>(null);
  const [sort, setSort] = useState<"recent" | "weak" | "alpha">("recent");
  const [editing, setEditing] = useState<Flashcard | "new" | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const catStats = useMemo(() => accuracyByCategory(reviewLog), [reviewLog]);
  const tagStats = useMemo(() => accuracyByTag(reviewLog), [reviewLog]);
  const weakOf = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of cards) m.set(c.id, weaknessScore(c, catStats, tagStats));
    return m;
  }, [cards, catStats, tagStats]);

  const filtered = useMemo(() => {
    let list = cards.filter(
      (c) =>
        (type === "all" || c.type === type) &&
        (!cat || c.category === cat) &&
        (!q || (c.front + " " + c.back + " " + c.tags.join(" ")).toLowerCase().includes(q.toLowerCase())),
    );
    if (sort === "recent")
      list = [...list].sort((a, b) => new Date(b.srs.due).getTime() - new Date(a.srs.due).getTime());
    if (sort === "weak")
      list = [...list].sort((a, b) => (weakOf.get(b.id) ?? 0) - (weakOf.get(a.id) ?? 0));
    if (sort === "alpha") list = [...list].sort((a, b) => a.front.localeCompare(b.front, "fr"));
    return list;
  }, [cards, q, type, cat, sort, weakOf]);

  const usedCats = useMemo(
    () => [...new Set(cards.map((c) => c.category).filter(Boolean))] as string[],
    [cards],
  );

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm("Importing a backup replaces your current corpus. Continue?")) {
      e.target.value = "";
      return;
    }
    file.text().then((text) => {
      try {
        importBackup(text);
      } catch (err) {
        alert("That file isn't a valid Compagnon backup.");
        console.error(err);
      }
      e.target.value = "";
    });
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "44px 32px 96px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "var(--text-4xl)", fontWeight: 500, letterSpacing: "var(--tracking-tight)" }}>
            Corpus
          </h1>
          <div style={{ color: "var(--ink-3)", fontSize: "var(--text-base)", marginTop: 6 }}>
            {cards.length} cards · {usedCats.length} categories
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button variant="ghost" size="sm" icon="download" onClick={exportBackup}>Export</Button>
          <Button variant="ghost" size="sm" icon="upload" onClick={() => fileRef.current?.click()}>Import</Button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={onPickFile} />
          <Button variant="quiet" size="sm" icon="layers" onClick={() => setBulkOpen(true)}>Bulk add</Button>
          <Button variant="primary" size="sm" icon="plus" onClick={() => setEditing("new")}>New card</Button>
        </div>
      </div>

      {/* controls */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <Input icon="search" placeholder="Search front, back, or tags…" value={q} onChange={setQ} />
        </div>
        <Segmented options={TYPE_FILTERS} value={type} onChange={setType} />
        <Segmented
          options={[
            { value: "recent", label: "Due" },
            { value: "weak", label: "Weakest" },
            { value: "alpha", label: "A–Z" },
          ]}
          value={sort}
          onChange={setSort}
        />
      </div>

      {/* category chips + practice */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22, alignItems: "center" }}>
        <Chip tone={cat === null ? "accent" : "neutral"} active={cat === null} onClick={() => setCat(null)}>All categories</Chip>
        {usedCats.map((c) => (
          <Chip key={c} tone="neutral" active={cat === c} onClick={() => setCat(cat === c ? null : c)}>{c}</Chip>
        ))}
        {(cat || type !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            iconRight="arrowRight"
            onClick={() =>
              navigate("/review/run", {
                state: {
                  filter: {
                    dueOnly: false,
                    category: cat ?? undefined,
                    type: type === "all" ? undefined : type,
                  },
                },
              })
            }
          >
            Practice this filter
          </Button>
        )}
      </div>

      {/* list */}
      {filtered.length === 0 ? (
        <Surface elevation="sm">
          <EmptyState
            icon="search"
            title="No cards match"
            body="Try a different search or clear the filters."
            action={<Button variant="quiet" onClick={() => { setQ(""); setType("all"); setCat(null); }}>Clear filters</Button>}
          />
        </Surface>
      ) : (
        <Surface pad={0} elevation="sm" style={{ overflow: "hidden" }}>
          {filtered.map((c, i) => {
            const st = strengthLabel(weakOf.get(c.id) ?? 0);
            return (
              <div
                key={c.id}
                onClick={() => setEditing(c)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 22px",
                  cursor: "pointer",
                  borderTop: i ? "1px solid var(--line)" : "none",
                  transition: "background var(--dur-fast)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ width: 7, height: 7, borderRadius: 999, background: TYPE_DOT[c.type], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "var(--text-lg)",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 320,
                      }}
                    >
                      {c.front}
                    </span>
                    {c.gender && <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-4)" }}>{c.gender === "m" ? "le" : "la"}</span>}
                  </div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>
                    {c.back}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {c.tags.slice(0, 2).map((t) => (
                    <Chip key={t} tone="neutral" size="sm">{t}</Chip>
                  ))}
                </div>
                <Chip tone={st.tone} size="sm" style={{ flexShrink: 0, width: 78, justifyContent: "center" }}>{st.t}</Chip>
                <Icon name="chevronRight" size={18} style={{ color: "var(--ink-4)", flexShrink: 0 }} />
              </div>
            );
          })}
        </Surface>
      )}

      {editing && (
        <CardEditor
          card={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(input, id) => {
            if (id) updateCard(id, input);
            else addCard(input);
            setEditing(null);
          }}
          onDelete={(id) => {
            removeCard(id);
            setEditing(null);
          }}
        />
      )}

      {bulkOpen && <BulkAdd onClose={() => setBulkOpen(false)} />}
    </div>
  );
}

/* ============================================================
   Card editor (slide-over)
   ============================================================ */

function CardEditor({
  card,
  onClose,
  onSave,
  onDelete,
}: {
  card: Flashcard | null;
  onClose: () => void;
  onSave: (input: NewCardInput, id?: string) => void;
  onDelete: (id: string) => void;
}) {
  const [form, setForm] = useState<NewCardInput>(
    card
      ? {
          type: card.type,
          front: card.front,
          back: card.back,
          notes: card.notes ?? "",
          gender: card.gender,
          category: card.category ?? DEFAULT_CATEGORIES[0],
          tags: [...card.tags],
        }
      : { type: "word", front: "", back: "", notes: "", category: DEFAULT_CATEGORIES[0], tags: [] },
  );
  const set = <K extends keyof NewCardInput>(k: K, v: NewCardInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const [tagInput, setTagInput] = useState("");

  const suggest = () => {
    const s = suggestTags({ front: form.front, back: form.back, type: form.type });
    const merged = [...new Set([...(form.tags ?? []), ...s.tags])];
    setForm((f) => ({ ...f, tags: merged, category: f.category || s.category || DEFAULT_CATEGORIES[0] }));
  };

  const canSave = form.front.trim() && form.back.trim();

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,26,24,.28)", animation: "fadeIn var(--dur) var(--ease-soft) both", backdropFilter: "blur(2px)" }} />
      <div
        style={{
          position: "relative",
          width: 460,
          maxWidth: "92vw",
          height: "100%",
          background: "var(--surface)",
          borderLeft: "1px solid var(--line)",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          animation: "slideIn var(--dur-slow) var(--ease-calm) both",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ fontSize: "var(--text-xl)", fontWeight: 600, letterSpacing: "var(--tracking-tight)" }}>{card ? "Edit card" : "New card"}</div>
          <IconButton name="x" title="Close" onClick={onClose} />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <Field label="Type">
            <Segmented
              full
              options={[
                { value: "word", label: "Word" },
                { value: "phrase", label: "Phrase" },
                { value: "sentence", label: "Sentence" },
              ]}
              value={form.type}
              onChange={(v) => set("type", v)}
            />
          </Field>
          <Field label="Front (French)">
            <Textarea rows={2} value={form.front} onChange={(v) => set("front", v)} placeholder="le mot, la phrase…" />
          </Field>
          <Field label="Back (meaning)">
            <Textarea rows={2} value={form.back} onChange={(v) => set("back", v)} placeholder="translation / definition" />
          </Field>
          <Field label="Notes">
            <Textarea rows={3} value={form.notes ?? ""} onChange={(v) => set("notes", v)} placeholder="usage, register, a memory hook…" />
          </Field>
          {form.type === "word" && (
            <Field label="Gender">
              <Segmented<"" | Gender>
                options={[
                  { value: "", label: "—" },
                  { value: "m", label: "le · m" },
                  { value: "f", label: "la · f" },
                ]}
                value={form.gender ?? ""}
                onChange={(v) => set("gender", v === "" ? undefined : v)}
              />
            </Field>
          )}
          <Field label="Category">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {DEFAULT_CATEGORIES.map((c) => (
                <Chip key={c} tone="neutral" active={form.category === c} onClick={() => set("category", c)}>{c}</Chip>
              ))}
            </div>
          </Field>
          <Field label="Tags">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {(form.tags ?? []).map((t) => (
                  <Chip key={t} tone="accent" onClick={() => set("tags", (form.tags ?? []).filter((x) => x !== t))} icon="x">{t}</Chip>
                ))}
              </div>
              <Button variant="ghost" size="sm" icon="sparkle" onClick={suggest} title="Suggest tags">Suggest</Button>
            </div>
            <Input
              placeholder="add a tag, press Enter"
              value={tagInput}
              onChange={setTagInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tagInput.trim()) {
                  set("tags", [...(form.tags ?? []), tagInput.trim()]);
                  setTagInput("");
                }
              }}
            />
          </Field>
        </div>

        <div style={{ display: "flex", gap: 10, padding: "16px 24px", borderTop: "1px solid var(--line)", justifyContent: "space-between" }}>
          {card ? <Button variant="danger" icon="trash" onClick={() => onDelete(card.id)}>Delete</Button> : <span />}
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" icon="check" disabled={!canSave} onClick={() => onSave(form, card?.id)}>Save card</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Eyebrow style={{ marginBottom: 9 }}>{label}</Eyebrow>
      {children}
    </div>
  );
}

/* ============================================================
   Bulk add (paste a list) — dedupe + deterministic auto-tagging
   ============================================================ */

function guessType(front: string): CardType {
  const words = front.trim().split(/\s+/).length;
  if (/[.!?…]$/.test(front.trim()) || words > 5) return "sentence";
  if (words <= 2) return "word";
  return "phrase";
}

function parseLines(text: string): NewCardInput[] {
  const out: NewCardInput[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(/\s*(?:\||\t|—| - )\s*/);
    const front = parts[0]?.trim();
    const back = (parts[1] ?? "").trim();
    if (!front) continue;
    const type = guessType(front);
    const s = suggestTags({ front, back, type });
    out.push({ type, front, back, tags: s.tags, category: s.category });
  }
  return out;
}

function BulkAdd({ onClose }: { onClose: () => void }) {
  const { bulkAdd } = useStore();
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ added: number; skipped: number } | null>(null);

  const preview = useMemo(() => parseLines(text), [text]);

  const run = () => {
    if (preview.length === 0) return;
    setResult(bulkAdd(preview));
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "grid", placeItems: "center", padding: 24 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,26,24,.28)", animation: "fadeIn var(--dur) var(--ease-soft) both", backdropFilter: "blur(2px)" }} />
      <Surface elevation="lg" style={{ position: "relative", width: 560, maxWidth: "100%", maxHeight: "86vh", display: "flex", flexDirection: "column" }} pad={0}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ fontSize: "var(--text-xl)", fontWeight: 600, letterSpacing: "var(--tracking-tight)" }}>Bulk add</div>
          <IconButton name="x" title="Close" onClick={onClose} />
        </div>
        <div style={{ padding: 24, overflowY: "auto" }}>
          {result ? (
            <EmptyState
              icon="check"
              title={`Added ${result.added} card${result.added === 1 ? "" : "s"}`}
              body={result.skipped > 0 ? `${result.skipped} skipped as duplicates or empty.` : "No duplicates — all in."}
              action={<Button variant="primary" onClick={onClose}>Done</Button>}
            />
          ) : (
            <>
              <p style={{ margin: "0 0 12px", color: "var(--ink-2)", fontSize: "var(--text-sm)", lineHeight: 1.55 }}>
                One card per line, French then meaning separated by <code>|</code> (or a tab / “ - ”). Type and tags are guessed; you can refine them after. Duplicates are skipped.
              </p>
              <Textarea
                rows={9}
                value={text}
                onChange={setText}
                placeholder={"le quai | the platform\nIl faut que je parte. | I have to leave.\nça vaut le coup | it's worth it"}
              />
              {preview.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <Eyebrow style={{ marginBottom: 8 }}>{preview.length} card{preview.length === 1 ? "" : "s"} ready</Eyebrow>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 160, overflowY: "auto" }}>
                    {preview.slice(0, 8).map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-sm)" }}>
                        <span style={{ width: 7, height: 7, borderRadius: 999, background: TYPE_DOT[c.type], flexShrink: 0 }} />
                        <span style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>{c.front}</span>
                        <span style={{ color: "var(--ink-4)" }}>·</span>
                        <span style={{ color: "var(--ink-3)" }}>{c.back || "—"}</span>
                      </div>
                    ))}
                    {preview.length > 8 && <span style={{ color: "var(--ink-4)", fontSize: "var(--text-sm)" }}>…and {preview.length - 8} more</span>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {!result && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: "1px solid var(--line)" }}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" icon="plus" disabled={preview.length === 0} onClick={run}>Add {preview.length || ""} cards</Button>
          </div>
        )}
      </Surface>
    </div>
  );
}
