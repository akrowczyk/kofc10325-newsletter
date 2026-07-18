# Deploying to Vercel

A step-by-step guide to put the Newsletter Studio online at
`newsletter.kofc10325.org`, with a real database, photo uploads, and a password
gate. The main kofc10325.org site on Hostinger is not touched.

You'll do everything in the Vercel dashboard — no terminal required after the
first import.

---

## 1. Import the project

1. Go to **vercel.com → Add New → Project**.
2. Choose **Import Git Repository** and pick
   `akrowczyk/kofc10325-newsletter`. (Authorize Vercel for GitHub if asked.)
3. Framework preset auto-detects **Next.js**. Leave build settings as-is
   (`npm run build` handles asset generation automatically).
4. Click **Deploy**. The first deploy will succeed and run on the local-style
   JSON store — that's expected until you attach the database in the next step.

## 2. Attach Vercel Postgres (the database)

This makes edits persist. Without it, data resets on every deploy.

1. In your new project, open the **Storage** tab → **Create Database**.
2. Choose **Postgres** (it's powered by Neon). Pick the region closest to you
   (e.g. `iad1` / US East) and create it.
3. When prompted, **Connect** it to this project. Vercel automatically adds the
   `POSTGRES_URL` (and related) environment variables — you don't copy anything.
4. That's it. On the next deploy the app detects `POSTGRES_URL`, creates its
   tables, and seeds the July issue automatically.

## 3. Attach Vercel Blob (photo uploads)

1. **Storage** tab → **Create Database** → choose **Blob**.
2. **Connect** it to the project. Vercel adds `BLOB_READ_WRITE_TOKEN`
   automatically.
3. The editor's photo section will now show an **Upload photos** button.

## 4. Turn on the password gate

So only your newsletter author can edit; published pages stay public.

1. Project **Settings → Environment Variables**. Add:
   - `STUDIO_PASSWORD` = a password you share with the author.
   - `AUTH_SECRET` = a long random string. Generate one with
     `openssl rand -hex 32`, or any 40+ random characters.
   - `NEXT_PUBLIC_SITE_URL` = `https://newsletter.kofc10325.org`
     (used for the "Read the newsletter" email link).
2. Set each for **Production** (and Preview if you like).
3. **Redeploy** (Deployments tab → ⋯ → Redeploy) so the new env vars take
   effect.

After this: visiting the site redirects to `/login`; the author signs in once
and can edit. `/n/...` newsletter pages remain public with no login.

## 5. Point the subdomain at Vercel

1. Project **Settings → Domains → Add** → enter `newsletter.kofc10325.org`.
2. Vercel shows a **CNAME** record to create (usually
   `newsletter` → `cname.vercel-dns.com`).
3. In **Hostinger → your domain → DNS/Nameservers**, add that CNAME record.
   (This only adds a subdomain — your main site's records are untouched.)
4. Wait for it to verify (minutes to an hour). Vercel issues HTTPS
   automatically.

---

## 6. Member email notifications (optional, via Resend)

Lets you manually email members a link to a published issue.

1. Create a free account at **resend.com**.
2. **Add & verify your domain** (`kofc10325.org`): Resend shows a few DNS
   records (SPF/DKIM) — add them in **Hostinger → your domain → DNS**. This is
   what makes emails land in inboxes instead of spam. (Your main site's records
   are untouched.)
3. Create an **API key** in Resend.
4. In Vercel **Settings → Environment Variables**, add `RESEND_API_KEY` = that
   key. **Redeploy.**
5. In the app: **Council settings → Email sending**, set the **From address** to
   something on the verified domain (e.g. `news@kofc10325.org`), and add members
   under **Email distribution list**.
6. To send: on the dashboard, a published issue shows a **Notify** button →
   review the subject/message → **Send**. Each member gets their own email with a
   button to the newsletter.

## Using it

- **Author:** go to `newsletter.kofc10325.org`, sign in, click
  **Start next month from last issue**, fill in what changed, **Publish**.
- **Share by email:** open the published page → **Copy email HTML**, paste into
  Gmail/Outlook "compose". It's a short branded note with a button to the full
  newsletter (renders reliably in all email clients).
- **Host under the main domain (optional):** on a published page click
  **Download .html** to get a single self-contained file, and drop it into your
  Hostinger git-push flow (e.g. `kofc10325.org/newsletter/july-2026.html`).
- **PDF:** **Save as PDF** on any published page (uses the browser's print
  dialog; the app chrome is hidden automatically).

## Resetting / seeding

The database seeds itself with the July 2026 issue and the current roster,
prayer list, and birthdays on first run. To edit the carry-over data (roster,
members, prayer list), it currently lives in `src/lib/seed.ts`; a settings
screen for editing it in-app is a planned enhancement.

## Local development

Nothing above is needed locally. Clone, then:

```bash
npm install
npm run dev
```

No database, no login — it uses a JSON file at `data/store.json`. Delete that
file to reset to the seed.
