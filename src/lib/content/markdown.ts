/* ============================================================
   COMPAGNON — Markdown renderer
   One configured markdown-it instance shared by the guide prose
   renderer and the callout widgets. HTML is disabled (raw HTML in
   source is escaped) — safe for local, user-authored content.
   ============================================================ */

import MarkdownIt from "markdown-it";

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: false,
});

/** Render a Markdown string to an HTML string (block-level). */
export function renderMarkdown(src: string): string {
  return md.render(src);
}

/** Render a short Markdown string without the wrapping <p> (for inline-ish use). */
export function renderMarkdownInline(src: string): string {
  return md.renderInline(src);
}
