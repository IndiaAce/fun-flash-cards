/* ============================================================
   COMPAGNON — Settings
   The meaningful "tweaks" from the design (theme, accent, reveal
   style, grade control) made persistent, plus data export/import.
   ============================================================ */

import { useRef } from "react";
import { Appear, Button, Eyebrow, Icon, Segmented, Surface, Toggle } from "@/components/kit";
import { useStore } from "@/app/store";
import { ACCENTS } from "@/app/theme";
import type { AccentName } from "@/lib/types";

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, padding: "16px 0", borderTop: "1px solid var(--line)" }}>
      <div>
        <div style={{ fontSize: "var(--text-base)", fontWeight: 560 }}>{label}</div>
        {hint && <div style={{ fontSize: "var(--text-sm)", color: "var(--ink-3)", marginTop: 2, maxWidth: 360 }}>{hint}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const { settings, setSettings, exportBackup, importBackup } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm("Importing a backup replaces your current corpus. Continue?")) {
      e.target.value = "";
      return;
    }
    file.text().then((text) => {
      try {
        importBackup(text);
      } catch (err) {
        alert("That file isn't a valid Compagnon backup.");
        console.error(err);
      }
      e.target.value = "";
    });
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "44px 32px 96px" }}>
      <Appear>
        <Eyebrow>Preferences</Eyebrow>
        <h1 style={{ margin: "8px 0 0", fontFamily: "var(--font-serif)", fontSize: "var(--text-4xl)", fontWeight: 500, letterSpacing: "var(--tracking-tight)" }}>
          Settings
        </h1>
      </Appear>

      <Appear delay={60}>
        <Surface elevation="sm" style={{ marginTop: 26 }}>
          <Eyebrow style={{ marginBottom: 4 }}>The flashcard</Eyebrow>
          <Row label="Reveal" hint="How the answer appears when you reveal a card.">
            <Segmented
              options={[
                { value: "inplace", label: "In place" },
                { value: "flip", label: "Flip" },
              ]}
              value={settings.revealStyle}
              onChange={(v) => setSettings({ revealStyle: v })}
            />
          </Row>
          <Row label="Grade control" hint="The control you use to rate recall after each card.">
            <Segmented
              options={[
                { value: "pills", label: "Soft pills" },
                { value: "slider", label: "Slider" },
                { value: "swipe", label: "Swipe" },
              ]}
              value={settings.gradeStyle}
              onChange={(v) => setSettings({ gradeStyle: v })}
            />
          </Row>
        </Surface>
      </Appear>

      <Appear delay={120}>
        <Surface elevation="sm" style={{ marginTop: 18 }}>
          <Eyebrow style={{ marginBottom: 4 }}>Appearance</Eyebrow>
          <Row label="Dark mode">
            <Toggle on={settings.theme === "dark"} onChange={(on) => setSettings({ theme: on ? "dark" : "light" })} />
          </Row>
          <Row label="Accent">
            <div style={{ display: "flex", gap: 10 }}>
              {(Object.keys(ACCENTS) as AccentName[]).map((name) => {
                const c = ACCENTS[name];
                const active = settings.accent === name;
                return (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    aria-label={name}
                    onClick={() => setSettings({ accent: name })}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 999,
                      cursor: "pointer",
                      background: c.a,
                      border: `2px solid ${active ? "var(--ink)" : "transparent"}`,
                      boxShadow: "var(--shadow-xs)",
                      display: "grid",
                      placeItems: "center",
                      color: "#fff",
                    }}
                  >
                    {active && <Icon name="check" size={15} stroke={2.4} />}
                  </button>
                );
              })}
            </div>
          </Row>
        </Surface>
      </Appear>

      <Appear delay={180}>
        <Surface elevation="sm" style={{ marginTop: 18 }}>
          <Eyebrow style={{ marginBottom: 4 }}>Your data</Eyebrow>
          <Row label="Backup" hint="Everything lives in your browser. Export to JSON to keep it in git or move machines.">
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="outline" size="sm" icon="download" onClick={exportBackup}>Export</Button>
              <Button variant="outline" size="sm" icon="upload" onClick={() => fileRef.current?.click()}>Import</Button>
              <input ref={fileRef} type="file" accept="application/json" hidden onChange={onPickFile} />
            </div>
          </Row>
        </Surface>
      </Appear>
    </div>
  );
}
