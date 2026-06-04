/* ============================================================
   COMPAGNON — Triggers widget (two contrasting columns)
   ============================================================ */

import { Icon, Surface } from "@/components/kit";
import type { TriggerColumn, TriggersData } from "@/lib/content/types";

function Column({ data, accent }: { data: TriggerColumn; accent: boolean }) {
  return (
    <Surface elevation="sm" pad={0} style={{ overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", background: accent ? "var(--accent-soft)" : "var(--surface-3)", display: "flex", alignItems: "center", gap: 9, borderBottom: "1px solid var(--line)" }}>
        <Icon name={accent ? "check" : "x"} size={17} style={{ color: accent ? "var(--accent)" : "var(--ink-3)" }} />
        <span style={{ fontWeight: 600, fontSize: "var(--text-md)", color: accent ? "var(--accent-press)" : "var(--ink-2)" }}>{data.title}</span>
      </div>
      <div>
        {data.items.map((it, i) => (
          <div key={it.t} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "12px 20px", borderTop: i ? "1px solid var(--line)" : "none" }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-lg)", fontStyle: "italic", color: accent ? "var(--ink)" : "var(--ink-2)" }}>{it.t}</span>
            {it.g && <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-3)", textAlign: "right" }}>{it.g}</span>}
          </div>
        ))}
      </div>
    </Surface>
  );
}

export function TriggerColumns({ data }: { data: TriggersData }) {
  return (
    <div style={{ margin: "22px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Column data={data.left} accent />
        <Column data={data.right} accent={false} />
      </div>
      {data.footnote && (
        <p style={{ textAlign: "center", color: "var(--ink-3)", fontSize: "var(--text-sm)", marginTop: 18 }}>{data.footnote}</p>
      )}
    </div>
  );
}
