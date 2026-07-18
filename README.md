# Council 10325 Newsletter Studio

A small Next.js app that lets a non-technical author assemble the monthly Knights
of Columbus council newsletter from a form, preview it live in the council's
branding, and publish it as a **web page, a PDF, an email announcement, and a
self-contained HTML file**. Branded to match
[kofc10325.org](https://kofc10325.org). Built for Vercel.

**Deploying?** See **[DEPLOY.md](DEPLOY.md)** for the step-by-step Vercel setup
(database, photo uploads, password, email, custom domain).

---

## Features

**Authoring**
- **Dashboard** (`/`) — lists every issue with status (draft/published) and, for
  published issues, buttons to view, edit, notify members, or delete.
- **Start next month from last issue** — clones the latest issue into a new
  draft: advances the calendar dates by a month and re-seeds carry-over content,
  so each month you only edit what changed.
- **Section editor** (`/issues/[slug]/edit`) — a form for every section
  (calendar, meeting minutes, motions, Grand Knight's report/summary/reflection,
  Treasurer & Financial Secretary tables, Church/DD/Publicity/Charity/Pro-Life
  reports, old/new business, Knight of the Month, Lecturer's reflection, Pope's
  intention, congratulations, photos) with a **live branded preview** beside it.
- **Auto-totaling** financial tables; **carry-over data** (officer roster, prayer
  list, member birthdays/anniversaries) is pulled from Council settings and fills
  in automatically.
- **Custom Congratulations** boxes (births, weddings, ordinations, …) alongside
  the auto-generated birthday/anniversary lists.
- **Optional "Council Officers"** section — off by default, toggled per issue for
  months where the roster is relevant (e.g. after installation).
- **Auto-linking** — URLs and email addresses typed into any section become
  clickable links (tuned to skip "St. Joseph", "7:00 p.m.", etc.).
- **Council settings** (`/settings`) — edit council info, officer roster, members
  (with birthdays/anniversaries), prayer list, the Grand Knight's standing
  summary, the email distribution list, and email sending config. No code edits.

**Publishing & sharing** (published page `/n/[slug]`)
- Public, no login required. Readers see a clean page with a **"Back to
  kofc10325.org"** link and **Save as PDF**; the signed-in author additionally
  sees Edit, Copy email HTML, and Download .html. Unpublished drafts are hidden
  from readers when auth is on.
- **Save as PDF** — browser print-to-PDF with print-tuned CSS (keeps branding,
  controls page breaks so sections don't split).
- **Copy email HTML** — a compact, email-client-safe announcement with a button
  to the hosted page (paste into Gmail/Outlook).
- **Download .html** — one self-contained file (fonts, emblem, CSS inlined) to
  drop into the Hostinger git-push flow under the main domain.
- **Photos** — uploaded via the editor (browser downsizes them, fixes rotation),
  shown in a natural-proportion masonry (no cropping).

**Member notifications** (`/issues/[slug]/send`)
- Manually email the distribution list a branded announcement with a button
  linking to a published issue. Each member gets their own email (no shared
  To/CC). Subject/message pre-fill from editable templates
  (`{{councilName}}`, `{{month}}`, `{{year}}`) and can be edited before a
  two-step confirmed send. Sent via **Resend**.

---

## How it runs in each environment

Everything is **env-gated**, so `npm run dev` needs zero setup, while production
is fully persistent and gated.

| Capability | Local dev (nothing set) | Production (env set) |
| --- | --- | --- |
| Data store | JSON file (`data/store.json`) | Vercel Postgres |
| Login gate | off (open) | on when `STUDIO_PASSWORD` is set |
| Photo upload | button hidden | on with `BLOB_READ_WRITE_TOKEN` (public Blob store) |
| Email notify | shows setup blockers | on with `RESEND_API_KEY` + a verified From address |

### Environment variables

All optional for local dev. See `.env.example`.

| Variable | Purpose |
| --- | --- |
| `POSTGRES_URL` *(or `DATABASE_URL`)* | Switches the store to Postgres. Auto-injected when you attach Vercel Postgres/Neon. |
| `BLOB_READ_WRITE_TOKEN` | Enables photo uploads. Auto-injected when you attach a **public** Vercel Blob store. |
| `STUDIO_PASSWORD` | Set to turn on the author login gate. `/n/**` published pages stay public. |
| `AUTH_SECRET` | Signs the session cookie (any long random string; falls back to `STUDIO_PASSWORD`). |
| `NEXT_PUBLIC_SITE_URL` | Base URL for links in emails/notifications (e.g. `https://newsletter.kofc10325.org`). Inferred from the request if unset. |
| `RESEND_API_KEY` | Enables member email notifications (resend.com). |

---

## Routes

| Route | What |
| --- | --- |
| `/` | Dashboard (gated). |
| `/login` | Author sign-in (only when auth is enabled). |
| `/settings` | Council settings (gated). |
| `/issues/[slug]/edit` | Section editor with live preview (gated). |
| `/issues/[slug]/send` | Notify-members composer (gated). |
| `/n/[slug]` | Public published newsletter. |
| `/api/photos/upload` | Server-side photo upload to Blob (POST). |
| `/api/issues/[slug]/export` | Download the self-contained static HTML. |
| `/api/status` | Diagnostics: which backend/auth/env are active (booleans only). |

Gating is done in `src/proxy.ts` (Next 16 "proxy", formerly middleware).

---

## Project layout

| Path | Purpose |
| --- | --- |
| `src/lib/types.ts` | Domain model (Issue, Globals, financials, members, recipients, email settings). |
| `src/lib/seed.ts` | Real July 2026 content + carry-over globals (first-run seed). |
| `src/lib/store.ts` | Public store API; selects a backend by env, applies global defaults. |
| `src/lib/storeCore.ts` | Backend-agnostic logic: `StoreBackend` interface, clone-next-month, template rendering, defaults. |
| `src/lib/backends/json.ts` · `postgres.ts` | JSON-file (dev) and Vercel Postgres (prod) backends. |
| `src/lib/auth.ts` · `src/proxy.ts` | HMAC-signed session cookie + route gating. |
| `src/lib/format.ts` · `linkify.tsx` | Money/date/birthday helpers · URL/email auto-linking. |
| `src/lib/emailHtml.ts` | "Copy email HTML" announcement builder. |
| `src/lib/notificationEmail.ts` · `sendMail.ts` | Notification email HTML · Resend batch send (server-only). |
| `src/lib/exportHtml.ts` + `scripts/gen-export-assets.mjs` + `src/lib/exportAssets.generated.ts` | Self-contained static export (fonts/emblem/CSS inlined; generated at build). |
| `src/components/NewsletterTemplate.tsx` + `newsletter.css` | The branded render, shared by preview, published page, and export. |
| `src/components/SiteHeader.tsx` | Site nav bar matching kofc10325.org. |
| `src/app/page.tsx` · `DeleteIssueButton.tsx` · `actions.ts` | Dashboard · inline-confirm delete · save/publish/clone/delete actions. |
| `src/app/issues/[slug]/edit/` | Editor (server wrapper + `EditorClient`). |
| `src/app/issues/[slug]/send/` | Notify-members page, client, and send action. |
| `src/app/settings/` | Council settings page, client, and save action. |
| `src/app/login/` | Login page + login/logout actions. |
| `src/app/n/[slug]/` | Public page + share toolbar. |
| `src/app/api/…` | Photo upload, static export, and status routes. |
| `public/logo_web.png` · `header_logo.svg` · `favicon.ico` | Council emblem · site wordmark · KofC shield favicon. |
| `assets/fonts/` · `assets/emblem-export.png` | Fonts + emblem inlined into the static export by the generator. |

---

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

No database, no login, no uploads config needed. Data is written to
`data/store.json` (git-ignored) — delete it to reset to the July seed.

Other scripts: `npm run build`, `npm start`, `npm run lint`, `npm run gen:assets`.

---

## Architecture notes

- **One store seam.** The whole app talks to the `StoreBackend` interface
  (`storeCore.ts`). `store.ts` picks JSON or Postgres by env; adding another
  backend is just implementing that interface. On a read-only filesystem (Vercel
  without Postgres) the JSON backend degrades to a read-only in-memory seed
  instead of crashing.
- **Env-gating pattern.** Postgres, auth, Blob, and Resend each activate only
  when their env var is present, so local dev is zero-config and features light
  up as you configure production. Pages that read runtime env/data set
  `export const dynamic = "force-dynamic"` so they aren't statically prerendered.
- **Auth.** `STUDIO_PASSWORD` turns on an HMAC-signed cookie gate (`auth.ts`)
  enforced by `proxy.ts` over `/`, `/issues/**`, `/settings`. Published pages and
  the export/status endpoints stay public. The photo-upload route is deliberately
  **not** in the matcher (its client/callback traffic can't follow a login
  redirect) — it verifies the session inline instead.
- **Export assets.** `npm run gen:assets` (run automatically by `dev`/`build`)
  regenerates `src/lib/exportAssets.generated.ts` from `newsletter.css`, the
  fonts in `assets/fonts/`, and the emblem, so the downloadable static HTML always
  matches the app without external requests.
- **Photo uploads** use a plain server upload (`put()` from `@vercel/blob`) with
  browser-side downsizing — not the client-upload SDK, which hung behind the auth
  gate. The Blob store must be **public** (newsletter images are shown publicly).
- **Email** goes through Resend, sending from a domain you verify (SPF/DKIM),
  per-recipient, so members don't see each other and messages land in inboxes.

---

## Roadmap ideas

- One-click **server-side PDF** (e.g. Vercel + `@sparticuz/chromium`) if
  browser print-to-PDF isn't enough.
- A one-click **unsubscribe** link in notification emails (currently a
  "contact to stop" footer line).
- Photo **captions** shown under images.
