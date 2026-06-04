/* ============================================================
   COMPAGNON — Review landing (before entering focus mode)
   ============================================================ */

import { useNavigate } from "react-router-dom";
import { Button, Surface } from "@/components/kit";
import { useStore } from "@/app/store";
import { dueCards } from "@/lib/srs";

export function ReviewLanding() {
  const { cards } = useStore();
  const navigate = useNavigate();
  const due = dueCards(cards);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "80px 32px", display: "grid", placeItems: "center" }}>
      <Surface elevation="md" style={{ width: "100%", textAlign: "center" }} pad={40}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-3xl)", fontWeight: 500, letterSpacing: "var(--tracking-tight)" }}>
          Ready when you are
        </div>
        <p style={{ color: "var(--ink-2)", fontSize: "var(--text-md)", lineHeight: 1.55, margin: "12px auto 28px", maxWidth: 380 }}>
          {due.length > 0
            ? `${due.length} cards are due. We'll go one at a time — reveal, rate how it felt, and move on. Quiet and unhurried.`
            : "Nothing is due right now. You can still run a free practice pass over your whole corpus."}
        </p>
        <Button
          variant="primary"
          size="lg"
          iconRight="arrowRight"
          onClick={() =>
            navigate("/review/run", {
              state: due.length === 0 ? { filter: { dueOnly: false } } : undefined,
            })
          }
        >
          {due.length > 0 ? "Begin review" : "Practice anyway"}
        </Button>
      </Surface>
    </div>
  );
}
