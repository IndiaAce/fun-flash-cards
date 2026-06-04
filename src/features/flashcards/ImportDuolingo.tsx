/* ============================================================
   COMPAGNON — Import from Duolingo
   Pick the exported word-list file (or paste it), preview what
   was parsed, then append to the corpus with dedupe. Parsing runs
   on file-load / explicit action — never per keystroke — so a
   2,000-line list stays snappy.
   ============================================================ */

import { useRef, useState } from "react";
import { Button, Chip, EmptyState, Eyebrow, Icon, IconButton, Surface, Textarea } from "@/components/kit";
import { useStore } from "@/app/store";
import { parseDuolingoToCards } from "@/lib/import/duolingo";
import type { CardType } from "@/lib/types";
import type { NewCardInput } from "@/lib/storage";

const TYPE_DOT: Record<CardType, string> = {
  word: "var(--accent)",
  phrase: "var(--got)",
  sentence: "var(--warm)",
};

export function ImportDuolingo({ onClose }: { onClose: () => void }) {
  const { bulkAdd } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [cards, setCards] = useState<NewCardInput[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<{ added: number; skipped: number } | null>(null);

  const parse = (raw: string) => setCards(parseDuolingoToCards(raw));

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    file.text().then((t) => {
      setText(t);
      parse(t);
    });
    e.target.value = "";
  };

  const counts = cards
    ? cards.reduce(
        (acc, c) => ((acc[c.type] = (acc[c.type] ?? 0) + 1), acc),
        {} as Record<CardType, number>,
      )
    : null;

  const run = () => {
    if (!cards || cards.length === 0) return;
    setResult(bulkAdd(cards));
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "grid", placeItems: "center", padding: 24 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,26,24,.28)", animation: "fadeIn var(--dur) var(--ease-soft) both", backdropFilter: "blur(2px)" }} />
      <Surface elevation="lg" style={{ position: "relative", width: 600, maxWidth: "100%", maxHeight: "88vh", display: "flex", flexDirection: "column" }} pad={0}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: "var(--text-xl)", fontWeight: 600, letterSpacing: "var(--tracking-tight)" }}>Import from Duolingo</div>
            <Chip tone="got" size="sm" icon="sparkle">+ auto-tags</Chip>
          </div>
          <IconButton name="x" title="Close" onClick={onClose} />
        </div>

        <div style={{ padding: 24, overflowY: "auto" }}>
          {result ? (
            <EmptyState
              icon="check"
              title={`Added ${result.added.toLocaleString()} card${result.added === 1 ? "" : "s"}`}
              body={
                result.skipped > 0
                  ? `${result.skipped.toLocaleString()} skipped as duplicates already in your corpus.`
                  : "No duplicates — every card was new."
              }
              action={<Button variant="primary" onClick={onClose}>Done</Button>}
            />
          ) : (
            <>
              <p style={{ margin: "0 0 14px", color: "var(--ink-2)", fontSize: "var(--text-sm)", lineHeight: 1.6 }}>
                Pick your exported word list (the file with French and English on alternating lines), or paste it
                below. Each card is tagged <code>duolingo</code> plus auto-tags, and duplicates already in your
                corpus are skipped.
              </p>

              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
                <Button variant="outline" icon="upload" onClick={() => fileRef.current?.click()}>Choose file…</Button>
                <input ref={fileRef} type="file" accept=".txt,text/plain" hidden onChange={onPickFile} />
                {fileName && <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-3)" }}>{fileName}</span>}
              </div>

              <Eyebrow style={{ marginBottom: 8 }}>…or paste</Eyebrow>
              <Textarea
                rows={6}
                value={text}
                onChange={setText}
                placeholder={"sportif\nathletic, sporting\n\ndommage\ntoo bad, a shame\n\n…"}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                <Button variant="quiet" size="sm" disabled={!text.trim()} onClick={() => parse(text)}>Preview</Button>
              </div>

              {cards && (
                <div style={{ marginTop: 18 }}>
                  {cards.length === 0 ? (
                    <Surface elevation="none" style={{ background: "var(--miss-soft)", border: "1px solid var(--miss)" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--miss-ink)", fontSize: "var(--text-sm)" }}>
                        <Icon name="spark" size={16} />
                        Nothing parsed. The list needs French and English on separate lines with a blank line between
                        entries — if yours is one unbroken string, re-copy it so the line breaks survive.
                      </div>
                    </Surface>
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                        <Eyebrow>{cards.length.toLocaleString()} cards ready</Eyebrow>
                        {counts && (
                          <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-3)" }}>
                            {counts.word ?? 0} words · {counts.phrase ?? 0} phrases · {counts.sentence ?? 0} sentences
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto", padding: "2px 0" }}>
                        {cards.slice(0, 10).map((c, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: "var(--text-sm)" }}>
                            <span style={{ width: 7, height: 7, borderRadius: 999, background: TYPE_DOT[c.type], flexShrink: 0, alignSelf: "center" }} />
                            <span style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>{c.front}</span>
                            {c.gender && <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-4)" }}>{c.gender === "m" ? "le" : "la"}</span>}
                            <span style={{ color: "var(--ink-4)" }}>·</span>
                            <span style={{ color: "var(--ink-3)" }}>{c.back}</span>
                          </div>
                        ))}
                        {cards.length > 10 && (
                          <span style={{ color: "var(--ink-4)", fontSize: "var(--text-sm)" }}>…and {(cards.length - 10).toLocaleString()} more</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {!result && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: "1px solid var(--line)" }}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" icon="plus" disabled={!cards || cards.length === 0} onClick={run}>
              Import {cards && cards.length ? cards.length.toLocaleString() : ""} cards
            </Button>
          </div>
        )}
      </Surface>
    </div>
  );
}
