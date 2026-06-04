/* ============================================================
   COMPAGNON — Guide registry
   Loads every Markdown guide in src/content/ at build time and
   parses it. Drop a new .md in that folder and it appears as a
   guide with zero code changes. Files prefixed with "_" are
   treated as drafts and skipped.
   ============================================================ */

import { parseGuide } from "./parse";
import type { Guide } from "./types";

const files = import.meta.glob("/src/content/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function load(): Guide[] {
  const guides: Guide[] = [];
  for (const [path, raw] of Object.entries(files)) {
    const name = path.split("/").pop() ?? path;
    if (name.startsWith("_")) continue;
    try {
      guides.push(parseGuide(raw));
    } catch (err) {
      // Never crash the app over one bad guide — log and skip it.
      console.error(`Compagnon: failed to parse guide "${path}":`, err);
    }
  }
  // Stable order by title for the index.
  return guides.sort((a, b) =>
    a.frontmatter.title.localeCompare(b.frontmatter.title, "fr"),
  );
}

export const GUIDES: Guide[] = load();

export function getGuide(id: string): Guide | undefined {
  return GUIDES.find((g) => g.frontmatter.id === id);
}
