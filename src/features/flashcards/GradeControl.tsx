/* ============================================================
   COMPAGNON — Grade control (the showcase): three calm variants
   Ported from the design. The interval previews are real FSRS
   numbers for THIS card, not hard-coded.
   Surfaced grades map to FSRS Again / Good / Easy. (Hard exists in
   the model and is reachable later; see docs/SRS.md.)
   ============================================================ */

import { useState } from "react";
import { Button, Icon } from "@/components/kit";
import type { GradeId, GradeStyle } from "@/lib/types";

type SurfacedGrade = Extract<GradeId, "miss" | "got" | "easy">;

const GRADES: Array<{ id: SurfacedGrade; label: string; tone: "miss" | "got" | "accent" }> = [
  { id: "miss", label: "Missed it", tone: "miss" },
  { id: "got", label: "Got it", tone: "got" },
  { id: "easy", label: "Easy", tone: "accent" },
];

export function GradeControl({
  style,
  intervals,
  onGrade,
}: {
  style: GradeStyle;
  intervals: Record<GradeId, string>;
  onGrade: (g: GradeId) => void;
}) {
  if (style === "slider") return <GradeSlider intervals={intervals} onGrade={onGrade} />;
  if (style === "swipe") return <GradeSwipe onGrade={onGrade} />;
  return <GradePills intervals={intervals} onGrade={onGrade} />;
}

/* --- Default: soft pills with quiet interval hints --- */
function GradePills({
  intervals,
  onGrade,
}: {
  intervals: Record<GradeId, string>;
  onGrade: (g: GradeId) => void;
}) {
  const toneStyles: Record<string, { bg: string; fg: string; hov: string }> = {
    miss: { bg: "var(--miss-soft)", fg: "var(--miss-ink)", hov: "var(--miss)" },
    got: { bg: "var(--got-soft)", fg: "var(--got-ink)", hov: "var(--got)" },
    accent: { bg: "var(--accent-soft)", fg: "var(--accent-press)", hov: "var(--accent)" },
  };
  const [hov, setHov] = useState<string | null>(null);
  return (
    <div>
      <div style={{ textAlign: "center", fontSize: "var(--text-sm)", color: "var(--ink-3)", marginBottom: 14 }}>
        How did that feel?
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {GRADES.map((g) => {
          const t = toneStyles[g.tone]!;
          const isH = hov === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onGrade(g.id)}
              onMouseEnter={() => setHov(g.id)}
              onMouseLeave={() => setHov(null)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "16px 12px 13px",
                background: isH ? t.hov : t.bg,
                color: isH ? "var(--on-accent)" : t.fg,
                border: "1px solid transparent",
                borderRadius: "var(--radius-lg)",
                cursor: "pointer",
                transition:
                  "background var(--dur) var(--ease-soft), color var(--dur), transform var(--dur-fast), box-shadow var(--dur)",
                transform: isH ? "translateY(-2px)" : "none",
                boxShadow: isH ? "var(--shadow-md)" : "none",
                fontFamily: "inherit",
              }}
            >
              <span style={{ fontSize: "var(--text-md)", fontWeight: 600, letterSpacing: "var(--tracking-snug)", whiteSpace: "nowrap" }}>
                {g.label}
              </span>
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  opacity: isH ? 0.92 : 0.72,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  whiteSpace: "nowrap",
                }}
              >
                <Icon name="clock" size={11} /> {intervals[g.id]}
              </span>
            </button>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 12, fontSize: "var(--text-xs)", color: "var(--ink-4)" }}>
        Press 1 · 2 · 3
      </div>
    </div>
  );
}

/* --- Variant: a single calm track you drag (recall confidence) --- */
function GradeSlider({
  intervals,
  onGrade,
}: {
  intervals: Record<GradeId, string>;
  onGrade: (g: GradeId) => void;
}) {
  const [v, setV] = useState(0.5);
  const grade: SurfacedGrade = v < 0.34 ? "miss" : v < 0.7 ? "got" : "easy";
  const label = { miss: "Missed it", got: "Got it", easy: "Easy" }[grade];
  const color = { miss: "var(--miss)", got: "var(--got)", easy: "var(--accent)" }[grade];
  return (
    <div>
      <div style={{ textAlign: "center", fontSize: "var(--text-sm)", color: "var(--ink-3)", marginBottom: 18 }}>
        Slide to rate your recall
      </div>
      <div
        style={{
          position: "relative",
          height: 56,
          borderRadius: "var(--radius-full)",
          background: "linear-gradient(90deg, var(--miss-soft), var(--got-soft), var(--accent-soft))",
          display: "flex",
          alignItems: "center",
          padding: "0 6px",
        }}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={v}
          onChange={(e) => setV(parseFloat(e.target.value))}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "grab", margin: 0 }}
        />
        <div
          style={{
            position: "absolute",
            left: `calc(6px + ${v} * (100% - 56px))`,
            width: 44,
            height: 44,
            borderRadius: "var(--radius-full)",
            background: "var(--surface)",
            boxShadow: "var(--shadow-md)",
            display: "grid",
            placeItems: "center",
            color,
            transition: "color var(--dur)",
            pointerEvents: "none",
            border: `2px solid ${color}`,
          }}
        >
          <Icon name={grade === "miss" ? "refresh" : "check"} size={18} />
        </div>
        <span style={{ position: "absolute", left: 18, fontSize: "var(--text-xs)", color: "var(--miss-ink)", fontWeight: 560 }}>Missed</span>
        <span style={{ position: "absolute", right: 18, fontSize: "var(--text-xs)", color: "var(--accent-press)", fontWeight: 560 }}>Easy</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ fontSize: "var(--text-base)", fontWeight: 600, color }}>
          {label}
          <span style={{ color: "var(--ink-4)", fontWeight: 400, marginLeft: 8 }}>next in {intervals[grade]}</span>
        </span>
        <Button variant="primary" size="sm" iconRight="arrowRight" onClick={() => onGrade(grade)}>
          Confirm
        </Button>
      </div>
    </div>
  );
}

/* --- Variant: swipe-style two-button --- */
function GradeSwipe({ onGrade }: { onGrade: (g: GradeId) => void }) {
  const swipeBtn = (tone: "miss" | "got") => {
    const m = { miss: ["var(--miss-soft)", "var(--miss-ink)"], got: ["var(--got-soft)", "var(--got-ink)"] }[tone];
    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      height: 52,
      background: m[0],
      color: m[1],
      border: "none",
      borderRadius: "var(--radius-lg)",
      cursor: "pointer",
      fontSize: "var(--text-md)",
      fontWeight: 600,
      fontFamily: "inherit",
    } as const;
  };
  return (
    <div>
      <div style={{ textAlign: "center", fontSize: "var(--text-sm)", color: "var(--ink-3)", marginBottom: 14 }}>
        Swipe the card — or tap below
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <button type="button" onClick={() => onGrade("miss")} style={swipeBtn("miss")}>
          <Icon name="arrowLeft" size={18} /> Missed it
        </button>
        <button type="button" onClick={() => onGrade("got")} style={swipeBtn("got")}>
          Got it <Icon name="arrowRight" size={18} />
        </button>
      </div>
    </div>
  );
}
