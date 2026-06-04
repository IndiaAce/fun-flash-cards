/* ============================================================
   COMPAGNON — The flashcard face (reveal-in-place + flip)
   Ported from the design's screen-review.jsx CardFace.
   ============================================================ */

import type { CSSProperties } from "react";
import { Chip, Icon, Surface } from "@/components/kit";
import type { Flashcard, RevealStyle } from "@/lib/types";

const GENDER_LABEL: Record<string, string> = { m: "le · masculin", f: "la · féminin" };
const TYPE_LABEL: Record<Flashcard["type"], string> = {
  word: "Word",
  phrase: "Phrase",
  sentence: "Sentence",
};

/** Prompt sizing scales gracefully with length. */
function promptSize(text: string): string {
  const n = text.length;
  if (n <= 14) return "var(--text-6xl)";
  if (n <= 28) return "var(--text-5xl)";
  if (n <= 52) return "var(--text-4xl)";
  if (n <= 90) return "var(--text-3xl)";
  return "var(--text-2xl)";
}

function RevealHint() {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--ink-3)", fontSize: "var(--text-sm)" }}>
      <span>Tap to reveal</span>
      <kbd
        style={{
          fontFamily: "inherit",
          fontSize: "var(--text-xs)",
          padding: "2px 7px",
          borderRadius: 6,
          background: "var(--surface-3)",
          border: "1px solid var(--line)",
          color: "var(--ink-3)",
        }}
      >
        Space
      </kbd>
    </div>
  );
}

const flipFace: CSSProperties = {
  position: "absolute",
  inset: 0,
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: "var(--radius-2xl)",
  boxShadow: "var(--shadow-lg)",
  padding: "30px 44px 28px",
  display: "flex",
  flexDirection: "column",
};

export function CardFace({
  card,
  revealed,
  revealStyle,
  onReveal,
}: {
  card: Flashcard;
  revealed: boolean;
  revealStyle: RevealStyle;
  onReveal: () => void;
}) {
  const meta = (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
      <Chip tone="accent" size="sm">{TYPE_LABEL[card.type]}</Chip>
      {card.gender && <Chip tone="neutral" size="sm">{GENDER_LABEL[card.gender]}</Chip>}
      {card.category && <Chip tone="outline" size="sm">{card.category}</Chip>}
    </div>
  );

  const answer = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", textAlign: "center" }}>
      <div style={{ fontSize: "var(--text-2xl)", color: "var(--ink)", fontWeight: 500, letterSpacing: "var(--tracking-snug)", lineHeight: 1.3 }}>
        {card.back}
      </div>
      {card.notes && (
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
            maxWidth: 440,
            padding: "12px 16px",
            background: "var(--surface-2)",
            borderRadius: "var(--radius-md)",
            textAlign: "left",
          }}
        >
          <Icon name="sparkle" size={15} style={{ color: "var(--ink-3)", flexShrink: 0, marginTop: 3 }} />
          <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-2)", lineHeight: 1.55 }}>{card.notes}</span>
        </div>
      )}
      {card.tags.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginTop: 2 }}>
          {card.tags.map((t) => (
            <Chip key={t} tone="neutral" size="sm" icon="tag">{t}</Chip>
          ))}
        </div>
      )}
    </div>
  );

  const prompt = (
    <div
      style={{
        fontFamily: "var(--font-serif)",
        fontSize: promptSize(card.front),
        fontWeight: 500,
        lineHeight: 1.12,
        letterSpacing: "var(--tracking-tight)",
        color: "var(--ink)",
        textAlign: "center",
        textWrap: "balance",
      }}
    >
      {card.front}
    </div>
  );

  /* ----- FLIP variant ----- */
  if (revealStyle === "flip") {
    return (
      <div
        onClick={!revealed ? onReveal : undefined}
        style={{ perspective: 1800, width: "100%", cursor: !revealed ? "pointer" : "default" }}
      >
        <div
          style={{
            position: "relative",
            transformStyle: "preserve-3d",
            minHeight: 360,
            transition: "transform var(--dur-slow) var(--ease-calm)",
            transform: revealed ? "rotateX(180deg)" : "rotateX(0deg)",
          }}
        >
          <div style={{ ...flipFace, justifyContent: "space-between" }}>
            {meta}
            <div style={{ display: "grid", placeItems: "center", flex: 1, padding: "24px 0" }}>{prompt}</div>
            <RevealHint />
          </div>
          <div style={{ ...flipFace, transform: "rotateX(180deg)", justifyContent: "center" }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-2xl)", color: "var(--ink-3)", marginBottom: 18, fontStyle: "italic" }}>
              {card.front}
            </div>
            {answer}
          </div>
        </div>
      </div>
    );
  }

  /* ----- REVEAL-IN-PLACE (default) ----- */
  return (
    <Surface
      pad={0}
      elevation="lg"
      onClick={!revealed ? onReveal : undefined}
      style={{
        width: "100%",
        overflow: "hidden",
        cursor: !revealed ? "pointer" : "default",
        borderRadius: "var(--radius-2xl)",
      }}
    >
      <div style={{ padding: "30px 40px 0", display: "flex", justifyContent: "center" }}>{meta}</div>
      <div style={{ padding: "40px 48px 36px", display: "grid", placeItems: "center", minHeight: 200 }}>{prompt}</div>

      <div
        style={{
          maxHeight: revealed ? 640 : 0,
          overflow: "hidden",
          transition: "max-height var(--dur-slow) var(--ease-calm)",
        }}
      >
        <div
          style={{
            borderTop: "1px solid var(--line)",
            padding: "30px 48px 40px",
            opacity: revealed ? 1 : 0,
            transform: revealed ? "none" : "translateY(10px)",
            transition:
              "opacity var(--dur-slow) var(--ease-soft) 90ms, transform var(--dur-slow) var(--ease-calm) 90ms",
          }}
        >
          {answer}
        </div>
      </div>

      {!revealed && (
        <div style={{ paddingBottom: 28, display: "flex", justifyContent: "center" }}>
          <RevealHint />
        </div>
      )}
    </Surface>
  );
}
