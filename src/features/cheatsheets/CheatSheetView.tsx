/* ============================================================
   COMPAGNON — Data-driven cheat-sheet engine
   <CheatSheetView sheet={...}> renders any CheatSheet (see the
   schema in src/lib/types.ts and docs/CHEATSHEETS.md). Authoring a
   new sheet means writing a data file — no new components.
   Ported from screen-cheatsheet.jsx and generalised.
   ============================================================ */

import { useMemo, useState, type ReactNode } from "react";
import { Appear, Chip, Eyebrow, Icon, Surface, Tabs, type IconName } from "@/components/kit";
import { useStore } from "@/app/store";
import type {
  CheatSheet,
  CheatSheetSection,
  ConjugatedVerb,
  QuizItem,
  RuleNote,
  Scene,
  TriggerColumn,
  VerbGroup,
} from "@/lib/types";

const SECTION_LABEL: Record<CheatSheetSection["kind"], string> = {
  formation: "Formation",
  conjugator: "Conjugator",
  triggers: "Triggers",
  phrases: "In the wild",
  quiz: "Self-check",
};

/** Render a title like "Le subjonctif {{présent}}" with the braces highlighted. */
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

export function CheatSheetView({ sheet }: { sheet: CheatSheet }) {
  const tabs = useMemo(
    () => sheet.sections.map((s) => ({ value: s.kind, label: SECTION_LABEL[s.kind] })),
    [sheet],
  );
  const [tab, setTab] = useState<CheatSheetSection["kind"]>(sheet.sections[0]?.kind ?? "formation");
  const active = sheet.sections.find((s) => s.kind === tab);

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "44px 32px 96px" }}>
      <Appear>
        <Eyebrow>{sheet.eyebrow}</Eyebrow>
        <h1 style={{ margin: "8px 0 0", fontFamily: "var(--font-serif)", fontSize: "var(--text-5xl)", fontWeight: 500, letterSpacing: "var(--tracking-tight)", lineHeight: 1.04 }}>
          <HighlightedTitle title={sheet.title} />
        </h1>
        <p style={{ color: "var(--ink-2)", fontSize: "var(--text-md)", maxWidth: 560, lineHeight: 1.55, marginTop: 12 }}>
          {sheet.intro}
        </p>
      </Appear>

      <Appear delay={60}>
        <div style={{ position: "sticky", top: 0, background: "var(--paper)", zIndex: 5, paddingTop: 18, marginTop: 14 }}>
          <Tabs tabs={tabs} value={tab} onChange={setTab} />
        </div>
      </Appear>

      <div style={{ marginTop: 26 }}>
        {active?.kind === "formation" && <Formation notes={active.notes} />}
        {active?.kind === "conjugator" && <Conjugator groups={active.groups} verbs={active.verbs} />}
        {active?.kind === "triggers" && <Triggers left={active.left} right={active.right} footnote={active.footnote} />}
        {active?.kind === "phrases" && <Phrases scenes={active.scenes} sheet={sheet} />}
        {active?.kind === "quiz" && <Quiz items={active.items} />}
      </div>
    </div>
  );
}

/* ---------- Formation ---------- */

function Formation({ notes }: { notes: RuleNote[] }) {
  const recipe = notes.find((n) => n.kind === "recipe");
  const endings = notes.find((n) => n.kind === "endings");
  const callouts = notes.filter((n) => n.kind === "callout" || n.kind === "trap");

  return (
    <Appear>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {recipe?.steps && (
          <Surface elevation="sm">
            <Eyebrow style={{ marginBottom: 12 }}>{recipe.title}</Eyebrow>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", fontSize: "var(--text-lg)" }}>
              {recipe.steps.map((s, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Step n={String(i + 1)} text={s.text} ex={s.ex} />
                  {i < recipe.steps!.length - 1 && <Icon name="arrowRight" size={20} style={{ color: "var(--ink-4)" }} />}
                </span>
              ))}
            </div>
          </Surface>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {endings?.rows && (
            <Surface elevation="sm">
              <Eyebrow style={{ marginBottom: 10 }}>{endings.title}</Eyebrow>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-base)" }}>
                <tbody>
                  {endings.rows.map(([a, b], i) => (
                    <tr key={i} style={{ borderTop: i ? "1px solid var(--line)" : "none" }}>
                      <td style={{ padding: "9px 0", color: "var(--ink-3)" }}>{a}</td>
                      <td style={{ padding: "9px 0", textAlign: "right", fontFamily: "var(--font-serif)", fontWeight: 600, color: "var(--accent)" }}>{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Surface>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {callouts.map((c, i) => (
              <Callout key={i} note={c} />
            ))}
          </div>
        </div>
      </div>
    </Appear>
  );
}

function Callout({ note }: { note: RuleNote }) {
  const trap = note.kind === "trap";
  return (
    <Surface
      elevation="sm"
      style={{
        background: trap ? "var(--miss-soft)" : "var(--accent-soft)",
        border: `1px solid ${trap ? "var(--miss)" : "var(--accent-ring)"}`,
      }}
    >
      <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 10 }}>
        <Icon name={trap ? "flame" : "spark"} size={18} style={{ color: trap ? "var(--miss-ink)" : "var(--accent)" }} />
        <Eyebrow style={{ color: trap ? "var(--miss-ink)" : "var(--accent-press)" }}>{note.title}</Eyebrow>
      </div>
      <p style={{ margin: 0, fontSize: "var(--text-base)", lineHeight: 1.55, color: "var(--ink)" }}>{note.body}</p>
    </Surface>
  );
}

function Step({ n, text, ex }: { n: string; text: ReactNode; ex: string }) {
  return (
    <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 22, height: 22, borderRadius: 999, background: "var(--accent)", color: "var(--on-accent)", fontSize: "var(--text-xs)", fontWeight: 700, display: "grid", placeItems: "center" }}>{n}</span>
        <span>{text}</span>
      </span>
      <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--ink-3)", fontSize: "var(--text-base)", paddingLeft: 30 }}>{ex}</span>
    </span>
  );
}

/* ---------- Conjugator ---------- */

function Conjugator({ groups, verbs }: { groups: VerbGroup[]; verbs: ConjugatedVerb[] }) {
  const [active, setActive] = useState(verbs[0]?.id ?? "");
  const verb = verbs.find((v) => v.id === active) ?? verbs[0];
  if (!verb) return null;
  const verbGroup = groups.find((g) => g.id === verb.group);

  return (
    <Appear>
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 22, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {groups.map((g) => (
            <div key={g.id}>
              <Eyebrow style={{ marginBottom: 9 }}>{g.label}</Eyebrow>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--ink-3)", marginBottom: 10, lineHeight: 1.45 }}>{g.note}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {verbs.filter((v) => v.group === g.id).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setActive(v.id)}
                    style={{
                      padding: "7px 13px",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      fontFamily: "var(--font-serif)",
                      fontSize: "var(--text-base)",
                      fontStyle: "italic",
                      border: "1px solid",
                      borderColor: active === v.id ? "var(--accent)" : "var(--line-2)",
                      background: active === v.id ? "var(--accent)" : "var(--surface)",
                      color: active === v.id ? "var(--on-accent)" : "var(--ink)",
                      transition: "all var(--dur-fast)",
                    }}
                  >
                    {v.inf}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Surface elevation="md" key={verb.id} style={{ animation: "fadeIn var(--dur) var(--ease-soft) both" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
            <div>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-3xl)", fontWeight: 500, fontStyle: "italic" }}>{verb.inf}</span>
              <span style={{ color: "var(--ink-3)", fontSize: "var(--text-md)", marginLeft: 12 }}>{verb.gloss}</span>
            </div>
            {verbGroup && <Chip tone="accent">{verbGroup.label}</Chip>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 28px" }}>
            {verb.table.map(([pron, conj], i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "13px 4px", borderBottom: "1px solid var(--line)" }}>
                <span style={{ color: "var(--ink-3)", fontSize: "var(--text-base)" }}>{pron}</span>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-xl)", fontWeight: 500, color: "var(--ink)" }}>{conj}</span>
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </Appear>
  );
}

/* ---------- Triggers ---------- */

function Triggers({ left, right, footnote }: { left: TriggerColumn; right: TriggerColumn; footnote?: string }) {
  const col = (data: TriggerColumn, accent: boolean) => (
    <Surface elevation="sm" pad={0} style={{ overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", background: accent ? "var(--accent-soft)" : "var(--surface-3)", display: "flex", alignItems: "center", gap: 9, borderBottom: "1px solid var(--line)" }}>
        <Icon name={accent ? "check" : "x"} size={17} style={{ color: accent ? "var(--accent)" : "var(--ink-3)" }} />
        <span style={{ fontWeight: 600, fontSize: "var(--text-md)", color: accent ? "var(--accent-press)" : "var(--ink-2)" }}>{data.title}</span>
      </div>
      <div>
        {data.items.map((it, i) => (
          <div key={it.t} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "12px 20px", borderTop: i ? "1px solid var(--line)" : "none" }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-lg)", fontStyle: "italic", color: accent ? "var(--ink)" : "var(--ink-2)" }}>{it.t}</span>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-3)", textAlign: "right" }}>{it.g}</span>
          </div>
        ))}
      </div>
    </Surface>
  );
  return (
    <Appear>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {col(left, true)}
        {col(right, false)}
      </div>
      {footnote && (
        <p style={{ textAlign: "center", color: "var(--ink-3)", fontSize: "var(--text-sm)", marginTop: 18 }}>{footnote}</p>
      )}
    </Appear>
  );
}

/* ---------- Phrases (with send-to-flashcards) ---------- */

function Phrases({ scenes, sheet }: { scenes: Scene[]; sheet: CheatSheet }) {
  const { bulkAdd } = useStore();
  const [added, setAdded] = useState<Record<string, boolean>>({});

  const send = (scene: Scene, idx: number) => {
    const p = scene.phrases[idx]!;
    bulkAdd([
      {
        type: "sentence",
        front: p.fr,
        back: p.en,
        tags: [...sheet.defaultTags, scene.id],
        category: "Travel",
        source: `Cheat sheet · ${sheet.id}`,
      },
    ]);
    setAdded((a) => ({ ...a, [scene.id + idx]: true }));
  };

  return (
    <Appear>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {scenes.map((sc) => (
          <Surface key={sc.id} elevation="sm">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "var(--surface-3)", color: "var(--ink-2)", display: "grid", placeItems: "center" }}>
                <Icon name={sc.icon as IconName} size={18} />
              </div>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-2xl)", fontWeight: 500 }}>{sc.scene}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {sc.phrases.map((p, i) => {
                const isAdded = added[sc.id + i];
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
        ))}
      </div>
    </Appear>
  );
}

/* ---------- Quiz ---------- */

function Quiz({ items }: { items: QuizItem[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const answered = Object.keys(answers).length;
  const correct = items.filter((q, i) => answers[i] === q.answer).length;

  return (
    <Appear>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {items.map((q, qi) => {
          const chosen = answers[qi];
          const done = chosen !== undefined;
          return (
            <Surface key={qi} elevation="sm">
              <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 16 }}>
                <span style={{ color: "var(--ink-4)", fontSize: "var(--text-sm)", fontWeight: 600 }}>{qi + 1}</span>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-xl)", lineHeight: 1.4 }}>{q.prompt}</span>
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
        {answered === items.length && (
          <Surface elevation="sm" style={{ textAlign: "center", background: "var(--surface-2)" }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-2xl)", fontWeight: 500 }}>
              {correct} / {items.length} — {correct === items.length ? "sans faute" : "presque"}
            </div>
            <div style={{ color: "var(--ink-3)", fontSize: "var(--text-base)", marginTop: 6 }}>
              {correct === items.length ? "The triggers are sticking. Nicely done." : "Revisit the triggers tab — it's all about the conjunction."}
            </div>
          </Surface>
        )}
      </div>
    </Appear>
  );
}
