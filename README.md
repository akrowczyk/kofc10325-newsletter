# Council 10325 Newsletter Studio

A small Next.js app that lets the newsletter author assemble the monthly Knights
of Columbus council newsletter from a form, preview it in the council's branding,
and publish it as a web page + PDF. Built to deploy on Vercel.

## What it does

- **Dashboard** (`/`) — lists issues and a **Start next month from last issue**
  button that clones the previous month into a new draft (advances the calendar
  dates a month, re-seeds carry-over content).
- **Editor** (`/issues/[slug]/edit`) — section-by-section form on the left, a
  **live branded preview** on the right that updates as you type. Financial
  tables auto-total. Roster, prayer list, and birthdays come from saved council
  data, so they appear automatically without re-typing.
- **Published page** (`/n/[slug]`) — the public newsletter, matching the look of
  kofc10325.org. A **Save as PDF** button uses the browser's print-to-PDF with
  print-optimized CSS (no heavy serverless PDF engine needed for v1).

## Project layout

| Path | Purpose |
| --- | --- |
| `src/lib/types.ts` | Domain model (Issue, Globals, financial sections, members). |
| `src/lib/seed.ts` | Real July 2026 content + carry-over globals (first-run seed). |
| `src/lib/store.ts` | **The one seam to swap for production.** JSON-file store today. |
| `src/lib/format.ts` | Money, dates, birthdays/anniversaries-by-month helpers. |
| `src/components/NewsletterTemplate.tsx` + `newsletter.css` | The branded render, shared by preview and published page. |
| `src/app/page.tsx` | Dashboard. |
| `src/app/issues/[slug]/edit/` | Editor (server wrapper + `EditorClient`). |
| `src/app/n/[slug]/` | Public published page + print toolbar. |
| `src/app/actions.ts` | Server actions: save, publish, clone, delete. |

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

Data is written to `data/store.json` (git-ignored). Delete it to reset to the
July seed.

## Path to production (Vercel)

1. **Database.** Replace the bodies of `readStore` / `writeStore` in
   `src/lib/store.ts` with Vercel Postgres queries (the rest of the app is
   already written against those two functions). The runtime filesystem on
   Vercel is read-only, which is why the JSON file is dev-only.
2. **Photos.** Wire the photo slots in the editor to Vercel Blob uploads and
   store the returned URLs on `PhotoItem.url`.
3. **Auth.** Add a single-author login (NextAuth credentials or a shared
   passphrase) in front of `/` and `/issues/**`. Leave `/n/**` public.
4. **Domain.** Point `newsletter.kofc10325.org` (CNAME) at the Vercel project.
   The main site on Hostinger is untouched.
5. **Optional static export to Hostinger.** Add a "Download static HTML" action
   that renders `NewsletterTemplate` to a self-contained file, so an issue can
   also be dropped into the Hostinger git-push flow under the main domain.

## Roadmap ideas (v2)

- One-click server-side PDF (Vercel + `@sparticuz/chromium`), if print-to-PDF
  isn't enough.
- Email-safe HTML export ("copy for email") plus a "Read the newsletter" button
  template.
- A small settings screen to edit globals (roster, members, prayer list) in the
  UI instead of in `seed.ts`.
