/* ============================================================
   COMPAGNON — Callout widget (:::note / :::trap)
   ============================================================ */

import { Eyebrow, Icon } from "@/components/kit";
import { renderMarkdown } from "@/lib/content/markdown";

export function Callout({ kind, title, md }: { kind: "note" | "trap"; title: string; md: string }) {
  const trap = kind === "trap";
  return (
    <div
      style={{
        margin: "20px 0",
        background: trap ? "var(--miss-soft)" : "var(--accent-soft)",
        border: `1px solid ${trap ? "var(--miss)" : "var(--accent-ring)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "18px 20px",
      }}
    >
      <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: title ? 10 : 0 }}>
        <Icon name={trap ? "flame" : "spark"} size={18} style={{ color: trap ? "var(--miss-ink)" : "var(--accent)" }} />
        {title && <Eyebrow style={{ color: trap ? "var(--miss-ink)" : "var(--accent-press)" }}>{title}</Eyebrow>}
      </div>
      <div
        className="guide-prose guide-prose--tight"
        style={{ color: "var(--ink)" }}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(md) }}
      />
    </div>
  );
}
