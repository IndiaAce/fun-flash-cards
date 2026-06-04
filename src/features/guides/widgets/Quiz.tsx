/* ============================================================
   COMPAGNON — Self-check quiz widget
   ============================================================ */

import { useState } from "react";
import { Icon, Surface } from "@/components/kit";
import type { QuizItem } from "@/lib/content/types";

export function Quiz({ items }: { items: QuizItem[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const answered = Object.keys(answers).length;
  const correct = items.filter((q, i) => answers[i] === q.answer).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, margin: "22px 0" }}>
      {items.map((q, qi) => {
        const chosen = answers[qi];
        const done = chosen !== undefined;
        return (
          <Surface key={qi} elevation="sm">
            <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 16 }}>
              <span style={{ color: "var(--ink-4)", fontSize: "var(--text-sm)", fontWeight: 600 }}>{qi + 1}</span>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-xl)", lineHeight: 1.4 }}>
                {q.prompt.split("___")[0]}
                <span style={{ display: "inline-block", minWidth: 54, borderBottom: "2px solid var(--accent)", margin: "0 4px" }} />
                {q.prompt.split("___")[1]}
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {q.options.map((opt, oi) => {
                const isChosen = chosen === oi;
                const isAnswer = oi === q.answer;
                let bg = "var(--surface)", fg = "var(--ink)", bc = "var(--line-2)";
                if (done) {
                  if (isAnswer) { bg = "var(--got-soft)"; fg = "var(--got-ink)"; bc = "var(--got)"; }
                  else if (isChosen) { bg = "var(--miss-soft)"; fg = "var(--miss-ink)"; bc = "var(--miss)"; }
                  else { fg = "var(--ink-4)"; }
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={done}
                    onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                    style={{ padding: "10px 20px", borderRadius: "var(--radius-md)", border: `1px solid ${bc}`, background: bg, color: fg, cursor: done ? "default" : "pointer", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "var(--text-lg)", transition: "all var(--dur-fast)" }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {done && (
              <div style={{ marginTop: 14, display: "flex", gap: 8, alignItems: "center", fontSize: "var(--text-sm)", color: chosen === q.answer ? "var(--got-ink)" : "var(--ink-2)" }}>
                <Icon name={chosen === q.answer ? "check" : "spark"} size={16} />
                <span>{q.why}</span>
              </div>
            )}
          </Surface>
        );
      })}
      {answered === items.length && items.length > 0 && (
        <Surface elevation="sm" style={{ textAlign: "center", background: "var(--surface-2)" }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-2xl)", fontWeight: 500 }}>
            {correct} / {items.length} — {correct === items.length ? "sans faute" : "presque"}
          </div>
          <div style={{ color: "var(--ink-3)", fontSize: "var(--text-base)", marginTop: 6 }}>
            {correct === items.length ? "The triggers are sticking. Nicely done." : "Revisit the triggers — it's all about the conjunction."}
          </div>
        </Surface>
      )}
    </div>
  );
}
