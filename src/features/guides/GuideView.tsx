/* ============================================================
   COMPAGNON — Guide renderer
   Renders a parsed Markdown guide: title, intro, a sticky section
   bar built from the ## headings, then the blocks in order —
   prose via markdown-it, plus the interactive widgets.
   ============================================================ */

import { useMemo } from "react";
import { Appear, Chip, Eyebrow } from "@/components/kit";
import { renderMarkdown } from "@/lib/content/markdown";
import { slugify } from "@/lib/cards";
import type { Guide } from "@/lib/content/types";
import { Conjugator } from "./widgets/Conjugator";
import { TriggerColumns } from "./widgets/TriggerColumns";
import { Phrases } from "./widgets/Phrases";
import { Quiz } from "./widgets/Quiz";
import { Flashcards } from "./widgets/Flashcards";
import { Callout } from "./widgets/Callout";

interface Heading {
  id: string;
  text: string;
}

/** Add id="" anchors to rendered h2/h3 and collect the h2s for the TOC. */
function anchorHeadings(html: string, headings: Heading[]): string {
  return html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_m, level: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    const id = slugify(text);
    if (level === "2") headings.push({ id, text });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
}

function HighlightedTitle({ title }: { title: string }) {
  const parts = title.split(/\{\{(.+?)\}\}/);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} style={{ fontStyle: "italic", color: "var(--accent)" }}>{p}</span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export function GuideView({ guide }: { guide: Guide }) {
  const { frontmatter, blocks } = guide;

  // Render prose blocks once, collecting the heading anchors for the TOC.
  const { rendered, headings } = useMemo(() => {
    const hs: Heading[] = [];
    const r = blocks.map((b) =>
      b.kind === "prose" ? anchorHeadings(renderMarkdown(b.md), hs) : null,
    );
    return { rendered: r, headings: hs };
  }, [blocks]);

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "44px 32px 96px" }}>
      <Appear>
        {frontmatter.eyebrow && <Eyebrow>{frontmatter.eyebrow}</Eyebrow>}
        <h1 style={{ margin: "8px 0 0", fontFamily: "var(--font-serif)", fontSize: "var(--text-5xl)", fontWeight: 500, letterSpacing: "var(--tracking-tight)", lineHeight: 1.04 }}>
          <HighlightedTitle title={frontmatter.title} />
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
          {frontmatter.intro && (
            <p style={{ color: "var(--ink-2)", fontSize: "var(--text-md)", maxWidth: 560, lineHeight: 1.55, margin: 0 }}>
              {frontmatter.intro}
            </p>
          )}
          {frontmatter.level && <Chip tone="neutral">{frontmatter.level}</Chip>}
        </div>
      </Appear>

      {headings.length > 1 && (
        <Appear delay={60}>
          <div style={{ position: "sticky", top: 0, zIndex: 5, background: "var(--paper)", paddingTop: 18, marginTop: 16 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", borderBottom: "1px solid var(--line)", paddingBottom: 10 }}>
              {headings.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => jump(h.id)}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: "var(--text-sm)",
                    fontWeight: 540,
                    color: "var(--ink-3)",
                    padding: "6px 10px",
                    borderRadius: "var(--radius-sm)",
                    transition: "background var(--dur-fast), color var(--dur-fast)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-3)"; e.currentTarget.style.color = "var(--ink)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-3)"; }}
                >
                  {h.text}
                </button>
              ))}
            </div>
          </div>
        </Appear>
      )}

      <Appear delay={90}>
        <div style={{ marginTop: 24 }}>
          {blocks.map((b, i) => {
            switch (b.kind) {
              case "prose":
                return (
                  <div
                    key={i}
                    className="guide-prose"
                    dangerouslySetInnerHTML={{ __html: rendered[i]! }}
                  />
                );
              case "note":
              case "trap":
                return <Callout key={i} kind={b.kind} title={b.title} md={b.md} />;
              case "conjugator":
                return <Conjugator key={i} data={b.data} />;
              case "triggers":
                return <TriggerColumns key={i} data={b.data} />;
              case "phrases":
                return <Phrases key={i} data={b.data} guideId={frontmatter.id} tags={frontmatter.tags} />;
              case "quiz":
                return <Quiz key={i} items={b.data} />;
              case "flashcards":
                return <Flashcards key={i} data={b.data} />;
            }
          })}
        </div>
      </Appear>
    </div>
  );
}
