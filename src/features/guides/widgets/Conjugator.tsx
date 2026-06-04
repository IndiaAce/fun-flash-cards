/* ============================================================
   COMPAGNON — Conjugator widget
   Interactive verb picker grouped by category. Shows each verb's
   tag chip and, when selected, its stem note. Impersonal forms
   ("—") render as a quiet dash. Used inside Markdown guides via a
   ```conjugator fenced block.
   ============================================================ */

import { useState } from "react";
import { Chip, Eyebrow, Surface } from "@/components/kit";
import { PRONOUNS, type ConjugatorData } from "@/lib/content/types";

export function Conjugator({ data }: { data: ConjugatorData }) {
  const { groups, verbs } = data;
  const [active, setActive] = useState(verbs[0]?.inf ?? "");
  const verb = verbs.find((v) => v.inf === active) ?? verbs[0];
  if (!verb) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 22, alignItems: "start", margin: "22px 0" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {groups.map((g) => {
          const groupVerbs = verbs.filter((v) => v.group === g.id);
          if (groupVerbs.length === 0) return null;
          return (
            <div key={g.id}>
              <Eyebrow style={{ marginBottom: 9 }}>{g.label}</Eyebrow>
              {g.note && (
                <div style={{ fontSize: "var(--text-xs)", color: "var(--ink-3)", marginBottom: 10, lineHeight: 1.45 }}>{g.note}</div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {groupVerbs.map((v) => {
                  const on = active === v.inf;
                  return (
                    <button
                      key={v.inf}
                      type="button"
                      onClick={() => setActive(v.inf)}
                      style={{
                        padding: "7px 13px",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        fontFamily: "var(--font-serif)",
                        fontSize: "var(--text-base)",
                        fontStyle: "italic",
                        border: "1px solid",
                        borderColor: on ? "var(--accent)" : "var(--line-2)",
                        background: on ? "var(--accent)" : "var(--surface)",
                        color: on ? "var(--on-accent)" : "var(--ink)",
                        transition: "all var(--dur-fast)",
                      }}
                    >
                      {v.inf}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Surface elevation="md" key={verb.inf} style={{ animation: "fadeIn var(--dur) var(--ease-soft) both" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
          <div>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-3xl)", fontWeight: 500, fontStyle: "italic" }}>{verb.inf}</span>
            <span style={{ color: "var(--ink-3)", fontSize: "var(--text-md)", marginLeft: 12 }}>{verb.gloss}</span>
          </div>
          {verb.tag && <Chip tone="accent">{verb.tag}</Chip>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 28px" }}>
          {PRONOUNS.map((pron, i) => {
            const form = verb.forms[i] ?? "—";
            const missing = form === "—";
            return (
              <div key={pron} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "13px 4px", borderBottom: "1px solid var(--line)", opacity: missing ? 0.45 : 1 }}>
                <span style={{ color: "var(--ink-3)", fontSize: "var(--text-base)" }}>{pron}</span>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-xl)", fontWeight: 500, color: "var(--ink)" }}>{form}</span>
              </div>
            );
          })}
        </div>
        {verb.note && (
          <div style={{ marginTop: 16, fontSize: "var(--text-sm)", color: "var(--ink-2)", lineHeight: 1.5 }}>
            ↳ {verb.note}
          </div>
        )}
      </Surface>
    </div>
  );
}
