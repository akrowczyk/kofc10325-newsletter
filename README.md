# Council 10325 Newsletter Studio

A small Next.js app that lets the newsletter author assemble the monthly Knights
of Columbus council newsletter from a form, preview it in the council's branding,
and publish it as a web page, a PDF, an email, or a self-contained HTML file.
Branded to match [kofc10325.org](https://kofc10325.org). Built for Vercel.

**Deploying?** See **[DEPLOY.md](DEPLOY.md)** for the step-by-step Vercel setup
(database, uploads, password, domain).

## What it does

- **Dashboard** (`/`) — lists issues and a **Start next month from last issue**
  button that clones the previous month into a new draft (advances the calendar
  dates a month, re-seeds carry-over content).
- **Editor** (`/issues/[slug]/edit`) — section-by-section form on the left, a
  **live branded preview** on the right that updates as you type. Financial
  tables auto-total. Roster, prayer list, and birthdays come from saved council
  data, so they appear automatically without re-typing. Photos upload straight to
  Vercel Blob when configured.
- **Published page** (`/n/[slug]`) — the public newsletter. Toolbar actions:
  - **Save as PDF** — browser print-to-PDF with print-optimized CSS.
  - **Copy email HTML** — a compact, email-client-safe announcement with a button
    linking to the hosted page (paste into Gmail/Outlook).
  - **Download .html** — a single self-contained file (fonts, emblem, CSS all
    inlined) to drop into the Hostinger git-push flow under the main domain.

## How it runs in each environment

| | Local dev | Production (Vercel) |
| --- | --- | --- |
| Data store | JSON file (`data/store.json`) | Vercel Postgres (`POSTGRES_URL`) |
| Login | off | on when `STUDIO_PASSWORD` is set |
| Photo upload | URL field | Vercel Blob (`BLOB_READ_WRITE_TOKEN`) |

Everything is env-gated, so `npm run dev` needs zero setup while production is
fully persistent and gated. See `.env.example`.

## Project layout

| Path | Purpose |
| --- | --- |
| `src/lib/types.ts` | Domain model (Issue, Globals, financial sections, members). |
| `src/lib/seed.ts` | Real July 2026 content + carry-over globals (first-run seed). |
| `src/lib/store.ts` | Public store API; selects a backend by env. |
| `src/lib/storeCore.ts` | Backend-agnostic logic (clone-next-month, helpers). |
| `src/lib/backends/json.ts` · `postgres.ts` | The two store backends. |
| `src/lib/auth.ts` · `src/proxy.ts` | Signed-cookie auth + route gating. |
| `src/lib/emailHtml.ts` | Email-safe HTML announcement builder. |
| `src/lib/exportHtml.ts` + `scripts/gen-export-assets.mjs` | Self-contained static export (fonts/emblem/CSS inlined). |
| `src/components/NewsletterTemplate.tsx` + `newsletter.css` | The branded render, shared by preview, published page, and export. |
| `src/components/SiteHeader.tsx` | Site nav bar matching kofc10325.org. |
| `src/app/issues/[slug]/edit/` | Editor (server wrapper + `EditorClient`). |
| `src/app/n/[slug]/` | Public page + share toolbar. |
| `src/app/login/` | Login page + login/logout actions. |
| `src/app/api/photos/upload/` · `api/issues/[slug]/export/` | Blob upload tokens · static export download. |

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

No database, no login. Data is written to `data/store.json` (git-ignored) —
delete it to reset to the July seed.

## Notes for maintainers

- **Store swap seam:** the whole app talks to `StoreBackend` (`storeCore.ts`).
  Adding another backend means implementing that one interface.
- **Export assets:** `npm run gen:assets` (run automatically by `dev`/`build`)
  regenerates `src/lib/exportAssets.generated.ts` from `newsletter.css`, the
  fonts in `assets/fonts/`, and the emblem, so the static export always matches
  the app.

## Roadmap ideas

- One-click server-side PDF (Vercel + `@sparticuz/chromium`), if print-to-PDF
  isn't enough.
- A settings screen to edit globals (roster, members, prayer list) in the UI
  instead of `seed.ts`.
- Per-member email send (vs. copy-paste) via a provider like Resend.
