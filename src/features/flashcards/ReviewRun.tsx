/* ============================================================
   COMPAGNON — Focused review session (the centerpiece)
   Builds a due (or filtered) queue once at entry, then walks it
   card by card: reveal → grade → schedule via FSRS → next.
   Full-screen, minimal chrome. Ported from screen-review.jsx.
   ============================================================ */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Appear, Button, EmptyState, Icon, IconButton, Surface } from "@/components/kit";
import { useStore } from "@/app/store";
import { buildQueue, intervalPreviews, type QueueFilter } from "@/lib/srs";
import { correctionQueue, correctionStreak, GRADUATE_STREAK } from "@/lib/corrections";
import type { GradeId } from "@/lib/types";
import { CardFace } from "./CardFace";
import { GradeControl } from "./GradeControl";

interface ReviewResult {
  id: string;
  grade: GradeId;
}

export function ReviewRun() {
  const { cards, reviewLog, corrections, settings, gradeCard } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const filter = (location.state as { filter?: QueueFilter } | null)?.filter;
  const correctionsMode = !!filter?.corrections;

  // Freeze the queue at entry so grading doesn't reshuffle mid-session.
  const queue = useMemo(
    () =>
      correctionsMode
        ? correctionQueue(cards, corrections, { limit: filter?.limit })
        : buildQueue(cards, reviewLog, filter ?? {}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<ReviewResult[]>([]);
  const [leaving, setLeaving] = useState<GradeId | null>(null);

  const done = i >= queue.length;
  const card = queue[i];

  const exit = useCallback(() => navigate("/review"), [navigate]);
  const reveal = useCallback(() => setRevealed(true), []);

  const grade = useCallback(
    (g: GradeId) => {
      if (!revealed || !card || leaving) return;
      setLeaving(g);
      gradeCard(card.id, g, { corrections: correctionsMode });
      setResults((r) => [...r, { id: card.id, grade: g }]);
      setTimeout(() => {
        setLeaving(null);
        setRevealed(false);
        setI((x) => x + 1);
      }, 360);
    },
    [revealed, card, leaving, gradeCard, correctionsMode],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (!revealed) reveal();
      }
      if (revealed && !leaving) {
        if (e.key === "1") grade("miss");
        if (e.key === "2") grade("got");
        if (e.key === "3") grade("easy");
      }
      if (e.key === "Escape") exit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, revealed, leaving, reveal, grade, exit]);

  const intervals = useMemo(
    () => (card ? intervalPreviews(card.srs) : ({} as Record<GradeId, string>)),
    [card],
  );

  /* empty queue */
  if (queue.length === 0) {
    return (
      <SessionFrame onExit={exit} progress={null}>
        <Surface elevation="md" style={{ maxWidth: 460, width: "100%", textAlign: "center" }}>
          <EmptyState
            icon="check"
            title="Nothing due right now"
            body="You're all caught up. New cards will surface here as they come due — there's no need to cram."
            action={<Button variant="quiet" onClick={exit} iconRight="arrowRight">Back to review</Button>}
          />
        </Surface>
      </SessionFrame>
    );
  }

  /* complete */
  if (done) return <Complete results={results} onExit={exit} />;

  /* active card */
  const leaveTransform =
    leaving === "miss"
      ? "translateX(-44px) rotate(-2.5deg)"
      : leaving
        ? "translateX(44px) rotate(2.5deg)"
        : "none";

  // In corrections mode, show how close this card is to graduating.
  const streakLabel = correctionsMode
    ? ` · streak ${correctionStreak(corrections, card!.id)}/${GRADUATE_STREAK}`
    : "";

  return (
    <SessionFrame onExit={exit} progress={i / queue.length} count={`${i + 1} of ${queue.length}${streakLabel}`}>
      <div style={{ maxWidth: 620, width: "100%" }}>
        <div
          key={card!.id}
          style={{
            opacity: leaving ? 0 : 1,
            transform: leaveTransform,
            transition: "opacity var(--dur) var(--ease-soft), transform var(--dur) var(--ease-calm)",
          }}
        >
          <CardFace card={card!} revealed={revealed} revealStyle={settings.revealStyle} onReveal={reveal} />
        </div>

        <div
          style={{
            marginTop: 28,
            minHeight: 120,
            display: revealed ? "block" : "none",
            opacity: revealed && !leaving ? 1 : 0,
            transform: revealed && !leaving ? "none" : "translateY(12px)",
            transition:
              "opacity var(--dur-slow) var(--ease-soft) 200ms, transform var(--dur-slow) var(--ease-calm) 200ms",
          }}
        >
          <GradeControl style={settings.gradeStyle} intervals={intervals} onGrade={grade} />
        </div>

        {!revealed && (
          <div style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
            <Button variant="outline" size="lg" onClick={reveal}>
              Show answer
            </Button>
          </div>
        )}
      </div>
    </SessionFrame>
  );
}

/* ---------- session complete ---------- */

function Complete({ results, onExit }: { results: ReviewResult[]; onExit: () => void }) {
  const got = results.filter((r) => r.grade !== "miss").length;
  const missed = results.filter((r) => r.grade === "miss").length;
  const recall = results.length > 0 ? Math.round((got / results.length) * 100) : 0;
  return (
    <SessionFrame onExit={onExit} progress={1}>
      <div style={{ maxWidth: 480, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <Appear style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "var(--radius-2xl)",
              background: "var(--got-soft)",
              color: "var(--got)",
              display: "grid",
              placeItems: "center",
              marginBottom: 6,
            }}
          >
            <Icon name="check" size={34} stroke={2} />
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-4xl)", fontWeight: 500, letterSpacing: "var(--tracking-tight)" }}>
            Séance terminée
          </div>
          <div style={{ fontSize: "var(--text-md)", color: "var(--ink-2)", textAlign: "center", lineHeight: 1.5, maxWidth: 360 }}>
            You reviewed <strong style={{ color: "var(--ink)" }}>{results.length} cards</strong>. Quietly done — see you tomorrow.
          </div>
          <Surface elevation="sm" pad={20} style={{ width: "100%", marginTop: 18, display: "flex", justifyContent: "space-around" }}>
            <Stat n={got} label="Got it" tone="var(--got)" />
            <div style={{ width: 1, background: "var(--line)" }} />
            <Stat n={missed} label="To revisit" tone="var(--miss)" />
            <div style={{ width: 1, background: "var(--line)" }} />
            <Stat n={`${recall}%`} label="Recall" tone="var(--accent)" />
          </Surface>
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <Button variant="primary" iconRight="arrowRight" onClick={onExit}>
              Done
            </Button>
          </div>
        </Appear>
      </div>
    </SessionFrame>
  );
}

function Stat({ n, label, tone }: { n: ReactNode; label: string; tone: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "var(--text-3xl)", fontWeight: 600, color: tone, letterSpacing: "var(--tracking-tight)" }}>{n}</div>
      <div style={{ fontSize: "var(--text-xs)", color: "var(--ink-3)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

/* ---------- focused frame ---------- */

function SessionFrame({
  children,
  onExit,
  progress,
  count,
}: {
  children: ReactNode;
  onExit: () => void;
  progress: number | null;
  count?: string;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--paper)", zIndex: 50, display: "flex", flexDirection: "column" }}>
      {progress !== null && (
        <div style={{ height: 3, background: "var(--line)", width: "100%" }}>
          <div
            style={{
              height: "100%",
              width: `${Math.max(2, progress * 100)}%`,
              background: "var(--accent)",
              borderRadius: "0 3px 3px 0",
              transition: "width var(--dur-slow) var(--ease-calm)",
            }}
          />
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px" }}>
        <IconButton name="x" title="End session" onClick={onExit} />
        {count && (
          <div style={{ fontSize: "var(--text-sm)", color: "var(--ink-3)", fontWeight: 540, fontVariantNumeric: "tabular-nums" }}>
            {count}
          </div>
        )}
        <div style={{ width: 40 }} />
      </div>
      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: "0 24px 64px", overflowY: "auto" }}>{children}</div>
    </div>
  );
}
