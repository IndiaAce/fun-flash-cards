/* ============================================================
   COMPAGNON — Cheat sheets index
   Lists every available sheet (built-in + user-authored).
   ============================================================ */

import { useNavigate } from "react-router-dom";
import { Appear, Chip, Eyebrow, Icon, Surface } from "@/components/kit";
import { useStore } from "@/app/store";

/** Strip the {{ }} highlight markers for plain display. */
function plainTitle(title: string): string {
  return title.replace(/\{\{(.+?)\}\}/g, "$1");
}

export function CheatSheetsIndex() {
  const { cheatSheets } = useStore();
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "44px 32px 96px" }}>
      <Appear>
        <Eyebrow>Reference</Eyebrow>
        <h1 style={{ margin: "8px 0 0", fontFamily: "var(--font-serif)", fontSize: "var(--text-4xl)", fontWeight: 500, letterSpacing: "var(--tracking-tight)" }}>
          Cheat sheets
        </h1>
        <p style={{ color: "var(--ink-2)", fontSize: "var(--text-md)", maxWidth: 560, lineHeight: 1.55, marginTop: 10 }}>
          Calm, structured references for the moods and tenses worth keeping close. Send any example straight to your flashcards.
        </p>
      </Appear>

      <Appear delay={60}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18, marginTop: 28 }}>
          {cheatSheets.map((s) => (
            <Surface key={s.id} elevation="sm" hover onClick={() => navigate(`/cheatsheets/${s.id}`)} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center" }}>
                  <Icon name="book" size={20} />
                </div>
                <Icon name="chevronRight" size={18} style={{ color: "var(--ink-4)" }} />
              </div>
              <div>
                <Eyebrow style={{ marginBottom: 6 }}>{s.eyebrow}</Eyebrow>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-2xl)", fontWeight: 500, letterSpacing: "var(--tracking-tight)" }}>
                  {plainTitle(s.title)}
                </div>
              </div>
              <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--ink-3)", lineHeight: 1.5 }}>{s.intro}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                {s.defaultTags.map((t) => (
                  <Chip key={t} tone="neutral" size="sm">{t}</Chip>
                ))}
              </div>
            </Surface>
          ))}
        </div>
      </Appear>
    </div>
  );
}
