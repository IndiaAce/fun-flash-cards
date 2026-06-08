/* ============================================================
   COMPAGNON — Review landing (before entering focus mode)
   Calm by default — "Begin review" still means "my due cards".
   Optional focus controls let you narrow a session by deck
   (Class vs Duolingo), to only-new words, or a single category,
   without ever deleting anything.
   ============================================================ */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip, Eyebrow, Icon, Surface, Toggle } from "@/components/kit";
import { useStore } from "@/app/store";
import { buildQueue, type QueueFilter } from "@/lib/srs";
import { DECK, deckCounts, deckOf, type Deck } from "@/lib/decks";

const SESSION_SIZES: Array<{ value: number; label: string }> = [
  { value: 10, label: "10" },
  { value: 20, label: "20" },
  { value: 50, label: "50" },
  { value: 0, label: "All" },
];

export function ReviewLanding() {
  const { cards, reviewLog, corrections, settings, setSettings } = useStore();
  const navigate = useNavigate();

  const [deck, setDeck] = useState<Deck | "all">("all");
  const [newOnly, setNewOnly] = useState(false);
  const [category, setCategory] = useState<string | null>(null);

  const sessionSize = settings.sessionSize; // 0 = all
  const counts = useMemo(() => deckCounts(cards), [cards]);

  // Categories present in the chosen deck, so the chips stay relevant.
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const c of cards) {
      if (deck !== "all" && deckOf(c) !== deck) continue;
      if (c.category) set.add(c.category);
    }
    return [...set].sort();
  }, [cards, deck]);

  const baseFilter: QueueFilter = useMemo(
    () => ({
      deck: deck === "all" ? undefined : deck,
      category: category ?? undefined,
      newOnly: newOnly || undefined,
    }),
    [deck, category, newOnly],
  );

  // Live preview of what the session will contain.
  const dueCount = useMemo(
    () => buildQueue(cards, reviewLog, { ...baseFilter, dueOnly: true }).length,
    [cards, reviewLog, baseFilter],
  );
  const allCount = useMemo(
    () => buildQueue(cards, reviewLog, { ...baseFilter, dueOnly: false }).length,
    [cards, reviewLog, baseFilter],
  );

  const filtered = deck !== "all" || newOnly || category !== null;
  // How many we'll actually serve this session (capped by the chosen size).
  const cap = (n: number) => (sessionSize > 0 ? Math.min(sessionSize, n) : n);
  const sessionDue = cap(dueCount);
  const sessionAll = cap(allCount);
  const begin = (dueOnly: boolean) =>
    navigate("/review/run", {
      state: { filter: { ...baseFilter, dueOnly, limit: sessionSize } },
    });

  const deckChips: Array<{ value: Deck | "all"; label: string }> = [
    { value: "all", label: `All decks · ${cards.length}` },
    { value: DECK.class, label: `Class · ${counts.Class}` },
    { value: DECK.compagnon, label: `Compagnon · ${counts.Compagnon}` },
    { value: DECK.duolingo, label: `Duolingo · ${counts.Duolingo}` },
  ];

  const correctionsCount = corrections.length;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "72px 32px", display: "grid", placeItems: "center", gap: 16 }}>
      {correctionsCount > 0 && (
        <Surface
          elevation="sm"
          style={{ width: "100%", borderLeft: "3px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}
        >
          <div style={{ textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="refresh" size={16} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: "var(--text-md)", fontWeight: 600 }}>
                Corrections · {correctionsCount}
              </span>
            </div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--ink-3)", marginTop: 3, maxWidth: 380 }}>
              Cards you've missed. Get each right 3× in a row here to clear it.
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            iconRight="arrowRight"
            onClick={() => navigate("/review/run", { state: { filter: { corrections: true, limit: sessionSize } } })}
          >
            Review corrections
          </Button>
        </Surface>
      )}

      <Surface elevation="md" style={{ width: "100%", textAlign: "center" }} pad={40}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-3xl)", fontWeight: 500, letterSpacing: "var(--tracking-tight)" }}>
          Ready when you are
        </div>
        <p style={{ color: "var(--ink-2)", fontSize: "var(--text-md)", lineHeight: 1.55, margin: "12px auto 24px", maxWidth: 400 }}>
          {dueCount > 0
            ? `${dueCount} card${dueCount === 1 ? "" : "s"} ${filtered ? "match this focus" : "are due"}${sessionSize > 0 && dueCount > sessionSize ? ` — we'll do ${sessionDue} now` : ""}. One at a time: reveal, rate how it felt, move on.`
            : filtered
              ? `Nothing due in this focus right now. You can still run a free practice pass over its ${allCount} card${allCount === 1 ? "" : "s"}.`
              : "Nothing is due right now. You can still run a free practice pass over your whole corpus."}
        </p>

        {/* Focus controls */}
        <div style={{ textAlign: "left", borderTop: "1px solid var(--line)", paddingTop: 22, marginBottom: 26 }}>
          <Eyebrow style={{ marginBottom: 10 }}>Deck</Eyebrow>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {deckChips.map((d) => (
              <Chip
                key={d.value}
                tone={deck === d.value ? "accent" : "neutral"}
                active={deck === d.value}
                onClick={() => {
                  setDeck(d.value);
                  setCategory(null); // categories are deck-scoped; reset on switch
                }}
              >
                {d.label}
              </Chip>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: categories.length ? 20 : 4 }}>
            <div>
              <div style={{ fontSize: "var(--text-md)", fontWeight: 540 }}>Only new words</div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--ink-3)", marginTop: 2 }}>Cards you've never studied yet.</div>
            </div>
            <Toggle on={newOnly} onChange={setNewOnly} />
          </div>

          {categories.length > 0 && (
            <>
              <Eyebrow style={{ marginBottom: 10 }}>Category</Eyebrow>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                <Chip tone={category === null ? "accent" : "neutral"} active={category === null} onClick={() => setCategory(null)}>
                  Any
                </Chip>
                {categories.map((c) => (
                  <Chip key={c} tone={category === c ? "accent" : "neutral"} active={category === c} onClick={() => setCategory(category === c ? null : c)}>
                    {c}
                  </Chip>
                ))}
              </div>
            </>
          )}

          <Eyebrow style={{ marginBottom: 10 }}>Session length</Eyebrow>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SESSION_SIZES.map((s) => (
              <Chip
                key={s.value}
                tone={sessionSize === s.value ? "accent" : "neutral"}
                active={sessionSize === s.value}
                onClick={() => setSettings({ sessionSize: s.value })}
              >
                {s.label}
              </Chip>
            ))}
          </div>
        </div>

        {dueCount > 0 ? (
          <Button variant="primary" size="lg" iconRight="arrowRight" onClick={() => begin(true)}>
            {`Begin review · ${sessionDue}`}
          </Button>
        ) : (
          <Button variant="primary" size="lg" iconRight="arrowRight" disabled={allCount === 0} onClick={() => begin(false)}>
            {allCount === 0 ? "No cards here" : `Practice anyway · ${sessionAll}`}
          </Button>
        )}
      </Surface>
    </div>
  );
}
