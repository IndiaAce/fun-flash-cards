/* ============================================================
   COMPAGNON — Guide flashcard drill widget
   A self-contained flip-card deck embedded in a guide: front is a
   cue (a trigger, a verb, a sentence to judge), flip to see the
   answer + a one-line why. Filter by facet (mode / conjugaison /
   temps…), shuffle, and step through. No corpus side-effects —
   it's pure practice, distinct from the SRS review deck.
   ============================================================ */

import { useEffect, useMemo, useState } from "react";
import { Chip, Icon, IconButton, Surface } from "@/components/kit";
import type { FlashcardsData } from "@/lib/content/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function Flashcards({ data }: { data: FlashcardsData }) {
  const all = data.cards;

  // Facet tags present in the deck, with counts, for the filter row.
  const tags = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of all) if (c.tag) m.set(c.tag, (m.get(c.tag) ?? 0) + 1);
    return [...m.entries()];
  }, [all]);

  const [tag, setTag] = useState<string | null>(null);
  const set = useMemo(() => (tag ? all.filter((c) => c.tag === tag) : all), [all, tag]);

  // `order` recomputes synchronously with `set` (so it's never stale on a
  // filter change) and also when the shuffle button bumps the key.
  const [shuffleKey, setShuffleKey] = useState(0);
  const order = useMemo(() => shuffle(set.map((_, i) => i)), [set, shuffleKey]);
  const [pos, setPos] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Reset position when the filtered set changes.
  useEffect(() => {
    setPos(0);
    setRevealed(false);
  }, [set]);

  if (set.length === 0) return null;

  // Clamp defensively: `pos` may briefly exceed a freshly-shortened set.
  const safePos = pos < order.length ? pos : 0;
  const card = set[order[safePos]!] ?? set[0]!;
  const move = (delta: number) => {
    setRevealed(false);
    setPos((p) => ((p < set.length ? p : 0) + delta + set.length) % set.length);
  };
  const reshuffle = () => {
    setShuffleKey((k) => k + 1);
    setPos(0);
    setRevealed(false);
  };

  return (
    <div style={{ margin: "22px 0" }}>
      {data.intro && (
        <p style={{ color: "var(--ink-2)", fontSize: "var(--text-md)", lineHeight: 1.55, margin: "0 0 16px" }}>
          {data.intro}
        </p>
      )}

      {/* Facet filter */}
      {tags.length > 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          <Chip tone={tag === null ? "accent" : "neutral"} active={tag === null} onClick={() => setTag(null)}>
            {`Tout · ${all.length}`}
          </Chip>
          {tags.map(([t, n]) => (
            <Chip key={t} tone={tag === t ? "accent" : "neutral"} active={tag === t} onClick={() => setTag(tag === t ? null : t)}>
              {`${t} · ${n}`}
            </Chip>
          ))}
        </div>
      )}

      {/* Card */}
      <Surface
        elevation="sm"
        onClick={() => setRevealed((r) => !r)}
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          {card.tag ? (
            <Chip tone="neutral" size="sm">{card.tag}</Chip>
          ) : (
            <span />
          )}
          <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-4)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {safePos + 1} / {set.length}
          </span>
        </div>

        <div style={{ minHeight: 150, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", padding: "8px 0" }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-2xl)", fontWeight: 500, lineHeight: 1.35 }}>
            {card.front}
          </div>

          {revealed ? (
            <>
              <div style={{ height: 1, background: "var(--line)", margin: "18px auto", width: 60 }} />
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-2xl)", fontStyle: "italic", color: "var(--accent)", lineHeight: 1.35 }}>
                {card.back}
              </div>
              {card.note && (
                <div style={{ fontSize: "var(--text-sm)", color: "var(--ink-2)", marginTop: 12, lineHeight: 1.5, maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}>
                  {card.note}
                </div>
              )}
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 16, fontSize: "var(--text-sm)", color: "var(--ink-4)" }}>
              <Icon name="spark" size={15} />
              Tap to reveal
            </div>
          )}
        </div>
      </Surface>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
        <IconButton name="arrowLeft" title="Previous" onClick={() => move(-1)} />
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          style={{
            border: "1px solid var(--line-2)",
            background: "var(--surface)",
            color: "var(--ink-2)",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: "var(--text-sm)",
            fontWeight: 540,
            padding: "8px 22px",
            borderRadius: "var(--radius-full)",
          }}
        >
          {revealed ? "Hide" : "Reveal"}
        </button>
        <div style={{ display: "flex", gap: 4 }}>
          <IconButton name="refresh" title="Shuffle" onClick={reshuffle} />
          <IconButton name="arrowRight" title="Next" onClick={() => move(1)} />
        </div>
      </div>
    </div>
  );
}
