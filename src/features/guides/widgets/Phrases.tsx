/* ============================================================
   COMPAGNON — Survival phrases widget (with send-to-flashcards)
   Each phrase can be pushed to the corpus, tagged with the guide's
   default tags plus a scene tag. Dedupe is handled by the store.
   ============================================================ */

import { useState } from "react";
import { Icon, Surface, type IconName } from "@/components/kit";
import { useStore } from "@/app/store";
import { slugify } from "@/lib/cards";
import type { PhrasesData, Scene } from "@/lib/content/types";

export function Phrases({
  data,
  guideId,
  tags,
}: {
  data: PhrasesData;
  guideId: string;
  tags: string[];
}) {
  const { bulkAdd } = useStore();
  const [added, setAdded] = useState<Record<string, boolean>>({});

  const send = (scene: Scene, idx: number) => {
    const p = scene.phrases[idx]!;
    const sceneTag = scene.id ?? slugify(scene.scene);
    bulkAdd([
      {
        type: "sentence",
        front: p.fr,
        back: p.en,
        tags: [...new Set([...tags, sceneTag])],
        category: "Travel",
        source: `Guide · ${guideId}`,
      },
    ]);
    setAdded((a) => ({ ...a, [sceneTag + idx]: true }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, margin: "22px 0" }}>
      {data.scenes.map((sc) => {
        const sceneTag = sc.id ?? slugify(sc.scene);
        return (
          <Surface key={sc.scene} elevation="sm">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "var(--surface-3)", color: "var(--ink-2)", display: "grid", placeItems: "center" }}>
                <Icon name={(sc.icon as IconName) ?? "volume"} size={18} />
              </div>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-2xl)", fontWeight: 500 }}>{sc.scene}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {sc.phrases.map((p, i) => {
                const isAdded = added[sceneTag + i];
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "14px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-lg)", lineHeight: 1.4 }}>{p.fr}</div>
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--ink-3)", marginTop: 3 }}>{p.en}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => !isAdded && send(sc, i)}
                      title="Add to flashcards"
                      style={{
                        flexShrink: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 12px",
                        borderRadius: "var(--radius-full)",
                        cursor: isAdded ? "default" : "pointer",
                        fontSize: "var(--text-sm)",
                        fontWeight: 540,
                        border: "1px solid",
                        fontFamily: "inherit",
                        transition: "all var(--dur-fast)",
                        borderColor: isAdded ? "transparent" : "var(--line-2)",
                        background: isAdded ? "var(--got-soft)" : "var(--surface)",
                        color: isAdded ? "var(--got-ink)" : "var(--ink-2)",
                      }}
                    >
                      <Icon name={isAdded ? "check" : "plus"} size={15} />
                      {isAdded ? "Added" : "Add card"}
                    </button>
                  </div>
                );
              })}
            </div>
          </Surface>
        );
      })}
    </div>
  );
}
