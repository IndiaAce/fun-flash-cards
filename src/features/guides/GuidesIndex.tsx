/* ============================================================
   COMPAGNON — Guides index
   Lists every Markdown guide in src/content/.
   ============================================================ */

import { useNavigate } from "react-router-dom";
import { Appear, Chip, Eyebrow, EmptyState, Icon, Surface } from "@/components/kit";
import { GUIDES } from "@/lib/content/registry";
import { plainTitle } from "@/lib/content/parse";

export function GuidesIndex() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "44px 32px 96px" }}>
      <Appear>
        <Eyebrow>Reference</Eyebrow>
        <h1 style={{ margin: "8px 0 0", fontFamily: "var(--font-serif)", fontSize: "var(--text-4xl)", fontWeight: 500, letterSpacing: "var(--tracking-tight)" }}>
          Guides
        </h1>
        <p style={{ color: "var(--ink-2)", fontSize: "var(--text-md)", maxWidth: 560, lineHeight: 1.55, marginTop: 10 }}>
          Calm, interactive grammar chapters. Read, drill the conjugator and quiz, and send any example
          straight to your flashcards.
        </p>
      </Appear>

      {GUIDES.length === 0 ? (
        <Appear delay={60}>
          <Surface elevation="sm" style={{ marginTop: 26 }}>
            <EmptyState icon="book" title="No guides yet" body="Drop a Markdown file into src/content/ to add one. See docs/CONTENT.md." />
          </Surface>
        </Appear>
      ) : (
        <Appear delay={60}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18, marginTop: 28 }}>
            {GUIDES.map((g) => (
              <Surface
                key={g.frontmatter.id}
                elevation="sm"
                hover
                onClick={() => navigate(`/guides/${g.frontmatter.id}`)}
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center" }}>
                    <Icon name="book" size={20} />
                  </div>
                  <Icon name="chevronRight" size={18} style={{ color: "var(--ink-4)" }} />
                </div>
                <div>
                  {g.frontmatter.eyebrow && <Eyebrow style={{ marginBottom: 6 }}>{g.frontmatter.eyebrow}</Eyebrow>}
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-2xl)", fontWeight: 500, letterSpacing: "var(--tracking-tight)" }}>
                    {plainTitle(g.frontmatter.title)}
                  </div>
                </div>
                {g.frontmatter.intro && (
                  <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--ink-3)", lineHeight: 1.5 }}>{g.frontmatter.intro}</p>
                )}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                  {g.frontmatter.tags.map((t) => (
                    <Chip key={t} tone="neutral" size="sm">{t}</Chip>
                  ))}
                </div>
              </Surface>
            ))}
          </div>
        </Appear>
      )}
    </div>
  );
}
