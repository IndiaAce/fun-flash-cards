/* ============================================================
   COMPAGNON — Home / dashboard
   "What's due today" + a gentle, real insight + quiet pal entry.
   Wired to live storage/SRS (no mock data).
   ============================================================ */

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Appear, Button, Chip, Eyebrow, Icon, Surface } from "@/components/kit";
import { useStore } from "@/app/store";
import { dueCards, generateInsight } from "@/lib/srs";
import type { CardType, Flashcard, ReviewLogEntry } from "@/lib/types";

/** Consecutive days (ending today or yesterday) with at least one review. */
function computeStreak(log: ReviewLogEntry[]): number {
  if (log.length === 0) return 0;
  const days = new Set(log.map((e) => new Date(e.reviewedAt).toDateString()));
  let streak = 0;
  const cursor = new Date();
  // Allow the streak to count from today or, if nothing today yet, yesterday.
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

const TYPES: CardType[] = ["word", "phrase", "sentence"];

export function Home() {
  const { cards, reviewLog } = useStore();
  const navigate = useNavigate();

  const due = useMemo(() => dueCards(cards), [cards]);
  const insight = useMemo(() => generateInsight(cards, reviewLog), [cards, reviewLog]);
  const streak = useMemo(() => computeStreak(reviewLog), [reviewLog]);
  const insightCard: Flashcard | undefined = insight?.exampleCardId
    ? cards.find((c) => c.id === insight.exampleCardId)
    : undefined;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const minutes = Math.max(1, Math.round(due.length * 0.4));

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 32px 96px", display: "flex", flexDirection: "column", gap: 28 }}>
      <Appear>
        <div style={{ fontSize: "var(--text-sm)", color: "var(--ink-3)", marginBottom: 6, fontVariantNumeric: "tabular-nums" }}>
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </div>
        <h1 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "var(--text-5xl)", fontWeight: 500, letterSpacing: "var(--tracking-tight)", lineHeight: 1.05 }}>
          {greeting}.
        </h1>
      </Appear>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "start" }}>
        {/* DUE TODAY — the hero */}
        <Appear delay={60} style={{ width: "100%" }}>
          <Surface elevation="md" pad={0} style={{ overflow: "hidden", width: "100%" }}>
            <div style={{ padding: "30px 32px 26px", display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <Eyebrow>Due today</Eyebrow>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8 }}>
                    <span style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-5xl)", fontWeight: 500, lineHeight: 1, letterSpacing: "var(--tracking-tight)" }}>
                      {due.length}
                    </span>
                    <span style={{ fontSize: "var(--text-lg)", color: "var(--ink-3)" }}>cards to review</span>
                  </div>
                </div>
                {streak > 0 && <Chip tone="warm" icon="flame">{streak}-day streak</Chip>}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                {TYPES.map((t) => {
                  const n = due.filter((c) => c.type === t).length;
                  return (
                    <div key={t} style={{ flex: 1, padding: "12px 14px", background: "var(--surface-2)", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: "var(--text-2xl)", fontWeight: 600, letterSpacing: "var(--tracking-tight)" }}>{n}</span>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-3)", textTransform: "capitalize" }}>{t}s</span>
                    </div>
                  );
                })}
              </div>

              <Button variant="primary" size="lg" full iconRight="arrowRight" onClick={() => navigate("/review/run")}>
                {due.length > 0 ? "Begin review" : "Practice your corpus"}
              </Button>
            </div>
            <div style={{ padding: "13px 32px", borderTop: "1px solid var(--line)", background: "var(--surface-2)", display: "flex", alignItems: "center", gap: 8, color: "var(--ink-3)", fontSize: "var(--text-sm)" }}>
              <Icon name="clock" size={15} /> {due.length > 0 ? `About ${minutes} minute${minutes === 1 ? "" : "s"} — no rush.` : "All caught up. Nothing is overdue."}
            </div>
          </Surface>
        </Appear>

        {/* INSIGHT — gentle, real */}
        <Appear delay={120} style={{ width: "100%" }}>
          <Surface elevation="sm">
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center" }}>
                <Icon name="spark" size={17} />
              </div>
              <Eyebrow>This week's pattern</Eyebrow>
            </div>
            {insight ? (
              <>
                <p style={{ margin: 0, fontSize: "var(--text-lg)", lineHeight: 1.45, letterSpacing: "var(--tracking-snug)" }}>
                  You keep slipping on{" "}
                  <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--accent-press)" }}>{insight.pattern}</em>.
                </p>
                <p style={{ margin: "10px 0 0", fontSize: "var(--text-sm)", color: "var(--ink-2)", lineHeight: 1.55 }}>{insight.detail}</p>
                <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                  <Button variant="quiet" size="sm" onClick={() => navigate("/cheatsheets/subjonctif-present")}>Open the cheat sheet</Button>
                  {insightCard && (
                    <Button
                      variant="ghost"
                      size="sm"
                      iconRight="arrowRight"
                      onClick={() =>
                        navigate("/review/run", {
                          state: { filter: { dueOnly: false, category: insightCard.category } },
                        })
                      }
                    >
                      Drill it
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <p style={{ margin: 0, fontSize: "var(--text-base)", color: "var(--ink-2)", lineHeight: 1.55 }}>
                No clear weak spot yet — keep reviewing and a pattern will surface here as soon as one shows up.
              </p>
            )}
          </Surface>
        </Appear>

        {/* PAL — understated */}
        <Appear delay={180} style={{ width: "100%" }}>
          <Surface elevation="sm" hover onClick={() => navigate("/pal")}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", flexShrink: 0, background: "var(--surface)", border: "1px solid var(--line)", color: "var(--accent)", display: "grid", placeItems: "center" }}>
                <Icon name="sparkle" size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>Your study pal</div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--ink-3)", marginTop: 1 }}>
                  Card suggestions · roleplay a scene
                </div>
              </div>
              <Icon name="chevronRight" size={20} style={{ color: "var(--ink-4)" }} />
            </div>
          </Surface>
        </Appear>
      </div>
    </div>
  );
}
