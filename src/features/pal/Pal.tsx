/* ============================================================
   COMPAGNON — Study pal (LLM features)
   Pass 1: no adapter is wired, so this screen shows a calm,
   honest "not yet enabled" state with the path to turn it on.
   The core app is fully usable without it. The real roleplay +
   suggestion surfaces arrive in Pass 2 behind the LLM adapter.
   ============================================================ */

import { Appear, Chip, Icon, Surface } from "@/components/kit";

function PalHeader() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
      <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--surface)", border: "1px solid var(--line)", color: "var(--accent)", display: "grid", placeItems: "center" }}>
        <Icon name="sparkle" size={22} />
      </div>
      <div>
        <h1 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "var(--text-3xl)", fontWeight: 500, letterSpacing: "var(--tracking-tight)" }}>
          Your study pal
        </h1>
        <div style={{ color: "var(--ink-3)", fontSize: "var(--text-sm)" }}>Quietly learns what you struggle with. You stay in control.</div>
      </div>
    </div>
  );
}

function FeaturePreview({ icon, title, body }: { icon: "sparkle" | "volume"; title: string; body: string }) {
  return (
    <Surface elevation="sm" style={{ opacity: 0.96 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ width: 34, height: 34, borderRadius: "var(--radius-sm)", background: "var(--surface-3)", color: "var(--ink-3)", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icon name={icon} size={18} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "var(--text-md)", fontWeight: 600 }}>{title}</span>
            <Chip tone="neutral" size="sm">Soon</Chip>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", color: "var(--ink-2)", lineHeight: 1.55 }}>{body}</p>
        </div>
      </div>
    </Surface>
  );
}

export function Pal() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "44px 32px 60px" }}>
      <Appear>
        <PalHeader />
      </Appear>

      <Appear delay={60}>
        <Surface
          elevation="sm"
          style={{ marginTop: 22, background: "var(--accent-soft)", border: "1px solid var(--accent-ring)" }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Icon name="spark" size={20} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--accent-press)" }}>
                The pal isn't connected yet
              </div>
              <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", color: "var(--accent-press)", lineHeight: 1.6 }}>
                LLM features run locally — either through Claude Code (your Max subscription, no API cost)
                or a local Ollama / Mistral model. Neither is wired in this build. See <code>docs/LLM.md</code> for
                the one-time setup; once an adapter is reachable, these features light up automatically. Everything
                else in Compagnon works fully without it.
              </p>
            </div>
          </div>
        </Surface>
      </Appear>

      <Appear delay={120}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 22 }}>
          <FeaturePreview
            icon="sparkle"
            title="Smart card suggestions"
            body="Given your corpus and weak spots, the pal proposes new cards at your level on a theme you pick — you review and approve before anything is added."
          />
          <FeaturePreview
            icon="volume"
            title="Roleplay a scene"
            body="Order at a café, check into a hôtel, ask directions at the gare. The pal plays a role in French at your level, gently corrects you, and turns missed items into flashcards."
          />
        </div>
      </Appear>
    </div>
  );
}
