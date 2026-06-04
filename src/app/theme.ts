/* ============================================================
   COMPAGNON — Theme + accent application
   Sets data-theme (light/dark) and overrides the accent CSS vars.
   The palette matches the design's accent options.
   ============================================================ */

import type { AccentName, ThemeName } from "@/lib/types";

export const ACCENTS: Record<AccentName, { a: string; p: string; s: string; r: string }> = {
  "Calm blue": { a: "#3A6EA5", p: "#2F5C8A", s: "#EAF0F7", r: "#AFC6E1" },
  "Muted teal": { a: "#3F7A6A", p: "#326153", s: "#E8F1ED", r: "#A9CDBF" },
  Aubergine: { a: "#7E5A86", p: "#664A6D", s: "#F1EAF2", r: "#CBB3D0" },
  Terracotta: { a: "#B5673F", p: "#935133", s: "#F6EBE4", r: "#E0BBA6" },
};

const ACCENT_VARS = ["--accent", "--accent-press", "--accent-soft", "--accent-ring"] as const;

export function applyTheme(theme: ThemeName, accent: AccentName): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);

  // "Calm blue" is the token default — clear overrides so dark mode's own
  // accent (defined in tokens.css) takes over. Otherwise set the chosen palette.
  const c = ACCENTS[accent] ?? ACCENTS["Calm blue"];
  if (accent === "Calm blue") {
    ACCENT_VARS.forEach((v) => root.style.removeProperty(v));
  } else {
    root.style.setProperty("--accent", c.a);
    root.style.setProperty("--accent-press", c.p);
    root.style.setProperty("--accent-soft", c.s);
    root.style.setProperty("--accent-ring", c.r);
  }
}

/** Briefly suppress var-driven transitions so a theme switch resolves instantly. */
export function suppressTransitionsDuringThemeSwitch(): void {
  const root = document.documentElement;
  root.setAttribute("data-switching", "");
  // Next frame, allow transitions again (hover etc.).
  requestAnimationFrame(() => {
    requestAnimationFrame(() => root.removeAttribute("data-switching"));
  });
}
