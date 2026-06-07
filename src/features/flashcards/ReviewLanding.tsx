/* ============================================================
   COMPAGNON — Review landing (before entering focus mode)
   Calm by default — "Begin review" still means "my due cards".
   Optional focus controls let you narrow a session by deck
   (Class vs Duolingo), to only-new words, or a single category,
   without ever deleting anything.
   ============================================================ */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip, Eyebrow, Surface, Toggle } from "@/components/kit";
import { useStore } from "@/app/store";
import { buildQueue, type QueueFilter } from "@/lib/srs";
import { DECK, deckCounts, deckOf, type Deck } from "@/lib/decks";

export function ReviewLanding() {
  const { cards, reviewLog } = useStore();
  const navigate = useNavigate();

  const [deck, setDeck] = useState<Deck | "all">("all");
  const [newOnly, setNewOnly] = useState(false);
  const [category, setCategory] = useState<string | null>(null);

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
  const begin = (dueOnly: boolean) =>
    navigate("/review/run", { state: { filter: { ...baseFilter, dueOnly } } });

  const deckChips: Array<{ value: Deck | "all"; label: string }> = [
    { value: "all", label: `All decks · ${cards.length}` },
    { value: DECK.class, label: `Class · ${counts.Class}` },
    { value: DECK.compagnon, label: `Compagnon · ${counts.Compagnon}` },
    { value: DECK.duolingo, label: `Duolingo · ${counts.Duolingo}` },
  ];

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "72px 32px", display: "grid", placeItems: "center" }}>
      <Surface elevation="md" style={{ width: "100%", textAlign: "center" }} pad={40}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-3xl)", fontWeight: 500, letterSpacing: "var(--tracking-tight)" }}>
          Ready when you are
        </div>
        <p style={{ color: "var(--ink-2)", fontSize: "var(--text-md)", lineHeight: 1.55, margin: "12px auto 24px", maxWidth: 400 }}>
          {dueCount > 0
            ? `${dueCount} card${dueCount === 1 ? "" : "s"} ${filtered ? "match this focus" : "are due"}. We'll go one at a time — reveal, rate how it felt, and move on.`
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
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
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
        </div>

        {dueCount > 0 ? (
          <Button variant="primary" size="lg" iconRight="arrowRight" onClick={() => begin(true)}>
            Begin review
          </Button>
        ) : (
          <Button variant="primary" size="lg" iconRight="arrowRight" disabled={allCount === 0} onClick={() => begin(false)}>
            {allCount === 0 ? "No cards here" : "Practice anyway"}
          </Button>
        )}
      </Surface>
    </div>
  );
}
