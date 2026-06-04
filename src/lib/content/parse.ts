/* ============================================================
   COMPAGNON — Guide Markdown parser
   Splits a guide .md into frontmatter + an ordered block list.
   Prose stays as raw Markdown (rendered later by markdown-it);
   fenced widget blocks (```conjugator/triggers/phrases/quiz) and
   ::: callouts are pulled out and JSON-parsed.
   See docs/CONTENT.md for the authoring contract.
   ============================================================ */

import type {
  Guide,
  GuideBlock,
  GuideFrontmatter,
  WidgetKind,
} from "./types";

const WIDGET_KINDS: WidgetKind[] = ["conjugator", "triggers", "phrases", "quiz"];

export class GuideParseError extends Error {}

/* ---------- frontmatter ---------- */

/**
 * Parse a minimal YAML subset: `key: value` per line, with inline arrays
 * (`tags: [a, b]`) and optional quotes. Enough for guide frontmatter; the
 * spec documents this shape so authors (and Claude Web) stay within it.
 */
function parseFrontmatter(block: string): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const raw of block.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      out[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => unquote(s.trim()))
        .filter(Boolean);
    } else {
      out[key] = unquote(value);
    }
  }
  return out;
}

function unquote(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function asString(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/* ---------- body → blocks ---------- */

function parseBody(body: string): GuideBlock[] {
  const lines = body.split("\n");
  const blocks: GuideBlock[] = [];
  let prose: string[] = [];

  const flushProse = () => {
    const text = prose.join("\n").trim();
    if (text) blocks.push({ kind: "prose", md: text });
    prose = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const fence = line.match(/^```+\s*([A-Za-z][\w-]*)\s*$/);

    // Widget fence: ```conjugator … ```
    if (fence && WIDGET_KINDS.includes(fence[1] as WidgetKind)) {
      const kind = fence[1] as WidgetKind;
      const start = i + 1;
      let end = start;
      while (end < lines.length && !/^```+\s*$/.test(lines[end]!)) end++;
      const json = lines.slice(start, end).join("\n");
      flushProse();
      blocks.push(makeWidgetBlock(kind, json));
      i = end; // skip past closing fence
      continue;
    }

    // Callout container: :::note Title … ::: (or :::trap)
    const open = line.match(/^:::\s*(note|trap)\b\s*(.*)$/);
    if (open) {
      const kind = open[1] as "note" | "trap";
      const title = (open[2] ?? "").trim();
      const start = i + 1;
      let end = start;
      while (end < lines.length && !/^:::\s*$/.test(lines[end]!)) end++;
      const inner = lines.slice(start, end).join("\n").trim();
      flushProse();
      blocks.push({ kind, title, md: inner });
      i = end;
      continue;
    }

    prose.push(line);
  }
  flushProse();
  return blocks;
}

function makeWidgetBlock(kind: WidgetKind, json: string): GuideBlock {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch (err) {
    throw new GuideParseError(
      `Invalid JSON in \`${kind}\` block: ${(err as Error).message}`,
    );
  }
  switch (kind) {
    case "conjugator":
      return { kind: "conjugator", data: data as never };
    case "triggers":
      return { kind: "triggers", data: data as never };
    case "phrases":
      return { kind: "phrases", data: data as never };
    case "quiz":
      return { kind: "quiz", data: data as never };
  }
}

/* ---------- top level ---------- */

export function parseGuide(md: string): Guide {
  const text = md.replace(/\r\n/g, "\n");
  const fm = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!fm) throw new GuideParseError("Guide is missing its --- frontmatter --- block.");

  const meta = parseFrontmatter(fm[1]!);
  const id = asString(meta.id);
  const title = asString(meta.title);
  if (!id) throw new GuideParseError("Guide frontmatter is missing `id`.");
  if (!title) throw new GuideParseError(`Guide "${id}" frontmatter is missing \`title\`.`);

  const frontmatter: GuideFrontmatter = {
    id,
    title,
    eyebrow: asString(meta.eyebrow),
    intro: asString(meta.intro),
    tags: Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : [],
    level: asString(meta.level),
  };

  const blocks = parseBody(text.slice(fm[0].length));
  return { frontmatter, blocks };
}

/** Plain title with the {{ }} accent markers stripped. */
export function plainTitle(title: string): string {
  return title.replace(/\{\{(.+?)\}\}/g, "$1");
}
