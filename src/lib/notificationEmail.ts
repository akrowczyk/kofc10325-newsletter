import type { Globals } from "./types";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Branded, email-client-safe notification: the author's message text plus a
 * button linking to the published issue. Table layout + inline styles, no remote
 * images (so it renders in every client). Sent individually per member.
 */
export function buildNotificationEmail(opts: {
  globals: Globals;
  monthYear: string; // "July 2026"
  bodyText: string; // author's message (plain text)
  link: string; // public URL of the issue
}): string {
  const { globals, monthYear, bodyText, link } = opts;
  const navy = "#112866";
  const gold = "#f7b718";
  const ink = "#1c2433";
  const site = globals.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const contact = globals.emailSettings.replyTo || globals.prayerList.contactEmail || "";

  const paragraphs = bodyText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font:400 16px Arial,sans-serif;color:${ink};line-height:1.5;">${esc(
          p,
        ).replace(/\n/g, "<br/>")}</p>`,
    )
    .join("");

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#eef1f7;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f7;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e7f0;">
  <tr><td style="background:${navy};border-bottom:3px solid ${gold};padding:22px 28px;">
    <div style="font:700 11px Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;color:${gold};">Knights of Columbus</div>
    <div style="font:600 24px Georgia,'Times New Roman',serif;color:#ffffff;padding-top:4px;">${esc(
      globals.councilName,
    )}</div>
    <div style="font:700 12px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#b9c6e6;padding-top:10px;">Newsletter &middot; ${esc(
      monthYear,
    )}</div>
  </td></tr>
  <tr><td style="padding:26px 28px 8px;">${paragraphs}</td></tr>
  <tr><td align="center" style="padding:12px 28px 28px;">
    <a href="${esc(link)}" style="display:inline-block;background:${navy};color:#ffffff;font:700 15px Arial,sans-serif;text-decoration:none;padding:13px 26px;border-radius:8px;">Read the ${esc(
      monthYear,
    )} Newsletter &rarr;</a>
  </td></tr>
  <tr><td style="background:#0b1c4a;padding:14px 28px;font:400 11px Arial,sans-serif;color:#aab8dc;line-height:1.5;">
    <b style="color:${gold};">${esc(globals.councilName)}</b> &middot; <a href="${esc(
      globals.websiteUrl,
    )}" style="color:${gold};text-decoration:none;">${esc(site)}</a><br/>
    You're receiving this as a member of ${esc(globals.councilName)}.${
      contact ? ` To stop, contact <a href="mailto:${esc(contact)}" style="color:#aab8dc;">${esc(contact)}</a>.` : ""
    }
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}
