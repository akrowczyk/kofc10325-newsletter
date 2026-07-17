import { formatEventDate } from "./format";
import { issueTitle } from "./storeCore";
import type { Globals, Issue } from "./types";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * A compact, email-client-safe HTML announcement (table layout + inline styles,
 * no remote images) that links to the hosted newsletter. This is the recommended
 * way to "send" the newsletter: a short branded note + a button to the full page,
 * rather than pasting the whole newsletter into an email where Outlook mangles it.
 */
export function buildEmailHtml(issue: Issue, globals: Globals, publicUrl: string): string {
  const title = issueTitle(issue); // e.g. "July 2026"
  const navy = "#112866";
  const gold = "#f7b718";
  const ink = "#1c2433";
  const muted = "#5a6478";

  const events = issue.calendar
    .slice(0, 4)
    .map(
      (ev) =>
        `<tr><td style="padding:4px 0;font:700 12px Arial,sans-serif;color:#cb0e0e;white-space:nowrap;vertical-align:top;">${esc(
          formatEventDate(ev.date),
        )}</td><td style="padding:4px 0 4px 14px;font:400 14px Arial,sans-serif;color:${ink};"><b>${esc(
          ev.title,
        )}</b>${ev.time ? ` &middot; ${esc(ev.time)}` : ""}${
          ev.location ? `, ${esc(ev.location)}` : ""
        }</td></tr>`,
    )
    .join("");

  const site = globals.websiteUrl.replace(/^https?:\/\//, "");

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#eef1f7;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">The ${esc(
    title,
  )} newsletter for ${esc(globals.councilName)} is now available.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f7;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e7f0;">
  <tr><td style="background:${navy};border-bottom:3px solid ${gold};padding:22px 28px;">
    <div style="font:700 11px Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;color:${gold};">Knights of Columbus</div>
    <div style="font:600 24px Georgia,'Times New Roman',serif;color:#ffffff;padding-top:4px;">${esc(
      globals.councilName,
    )}</div>
    <div style="font:700 12px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#b9c6e6;padding-top:10px;">Newsletter &middot; ${esc(
      title,
    )}</div>
  </td></tr>
  <tr><td style="padding:26px 28px 8px;">
    <p style="margin:0 0 14px;font:400 16px Arial,sans-serif;color:${ink};line-height:1.5;">The <b>${esc(
      title,
    )}</b> newsletter is ready. Here's what's on the calendar this month:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f4f6fb;border:1px solid #e2e7f0;border-radius:8px;padding:8px 14px;">
      ${events || `<tr><td style="font:400 14px Arial,sans-serif;color:${muted};padding:6px 0;">See the newsletter for this month's calendar.</td></tr>`}
    </table>
  </td></tr>
  <tr><td align="center" style="padding:20px 28px 28px;">
    <a href="${esc(publicUrl)}" style="display:inline-block;background:${navy};color:#ffffff;font:700 15px Arial,sans-serif;text-decoration:none;padding:13px 26px;border-radius:8px;">Read the ${esc(
      title,
    )} Newsletter &rarr;</a>
  </td></tr>
  <tr><td style="background:#0b1c4a;padding:14px 28px;font:700 11px Arial,sans-serif;letter-spacing:.6px;text-transform:uppercase;color:#aab8dc;">
    ${esc(globals.councilName)} &middot; <span style="color:${gold};">${esc(site)}</span> &middot; Vivat Jesus!
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}
