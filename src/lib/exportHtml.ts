import { NEWSLETTER_CSS, FONT_FACE_CSS } from "./exportAssets.generated";
import { issueTitle } from "./storeCore";
import type { Globals, Issue } from "./types";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Wrap already-rendered newsletter markup into a single self-contained HTML file
 * — fonts and CSS inlined — suitable for dropping into the Hostinger git-push
 * flow so an issue can live under the main kofc10325.org domain.
 *
 * The React SSR step lives in the route handler; keeping react-dom/server out of
 * this module (and out of anything that imports a component) avoids Turbopack's
 * "component importing react-dom/server" guard.
 */
export function wrapStandaloneHtml(
  bodyMarkup: string,
  issue: Issue,
  globals: Globals,
): string {
  const title = `${globals.councilName} — ${issueTitle(issue)} Newsletter`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
${FONT_FACE_CSS}
:root{--font-head:'Roboto Serif';--font-body:'Roboto';--font-label:'Roboto Condensed';}
*{box-sizing:border-box;}
body{margin:0;background:#eef1f7;font-family:'Roboto',Arial,Helvetica,sans-serif;}
.export-wrap{max-width:860px;margin:0 auto;padding:24px 12px 48px;}
${NEWSLETTER_CSS}
@media print{body{background:#fff;}.export-wrap{padding:0;max-width:none;}}
</style>
</head>
<body><div class="export-wrap">${bodyMarkup}</div></body>
</html>`;
}
