import "server-only";
import { sql } from "@vercel/postgres";
import { seedData } from "../seed";
import type { Globals, Issue } from "../types";
import type { StoreBackend } from "../storeCore";

// The Vercel/Neon integration may expose the connection string as POSTGRES_URL
// or DATABASE_URL (or the non-pooling variants). @vercel/postgres reads
// POSTGRES_URL (lazily, on first query), so alias whatever we have into it here.
if (!process.env.POSTGRES_URL) {
  const alt =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (alt) process.env.POSTGRES_URL = alt;
}

// Production backend: Vercel Postgres (Neon). Activated whenever POSTGRES_URL is
// set. Stores each issue's full object as JSONB alongside a few columns used for
// ordering/filtering, and the globals as a single JSONB row.

let ready: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!ready) ready = init();
  return ready;
}

async function init(): Promise<void> {
  await sql`CREATE TABLE IF NOT EXISTS globals (
    id INT PRIMARY KEY DEFAULT 1,
    data JSONB NOT NULL
  )`;
  await sql`CREATE TABLE IF NOT EXISTS issues (
    slug TEXT PRIMARY KEY,
    year INT NOT NULL,
    month INT NOT NULL,
    status TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ,
    data JSONB NOT NULL
  )`;

  // Seed once, so a fresh database is never empty.
  const g = await sql`SELECT 1 FROM globals WHERE id = 1`;
  if (g.rowCount === 0) {
    await sql`INSERT INTO globals (id, data) VALUES (1, ${JSON.stringify(
      seedData.globals,
    )}::jsonb)`;
  }
  const i = await sql`SELECT 1 FROM issues LIMIT 1`;
  if (i.rowCount === 0) {
    for (const issue of seedData.issues) {
      await upsert(issue);
    }
  }
}

async function upsert(issue: Issue): Promise<void> {
  await sql`
    INSERT INTO issues (slug, year, month, status, updated_at, published_at, data)
    VALUES (
      ${issue.slug}, ${issue.year}, ${issue.month}, ${issue.status},
      ${issue.updatedAt}, ${issue.publishedAt ?? null}, ${JSON.stringify(issue)}::jsonb
    )
    ON CONFLICT (slug) DO UPDATE SET
      year = EXCLUDED.year,
      month = EXCLUDED.month,
      status = EXCLUDED.status,
      updated_at = EXCLUDED.updated_at,
      published_at = EXCLUDED.published_at,
      data = EXCLUDED.data
  `;
}

export const postgresBackend: StoreBackend = {
  async getGlobals(): Promise<Globals> {
    await ensureSchema();
    const { rows } = await sql`SELECT data FROM globals WHERE id = 1`;
    return (rows[0]?.data as Globals) ?? seedData.globals;
  },
  async saveGlobals(globals: Globals): Promise<void> {
    await ensureSchema();
    await sql`
      INSERT INTO globals (id, data) VALUES (1, ${JSON.stringify(globals)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
    `;
  },
  async listIssues(): Promise<Issue[]> {
    await ensureSchema();
    const { rows } = await sql`SELECT data FROM issues ORDER BY slug DESC`;
    return rows.map((r) => r.data as Issue);
  },
  async getIssue(slug: string): Promise<Issue | null> {
    await ensureSchema();
    const { rows } = await sql`SELECT data FROM issues WHERE slug = ${slug}`;
    return (rows[0]?.data as Issue) ?? null;
  },
  async putIssue(issue: Issue): Promise<void> {
    await ensureSchema();
    await upsert(issue);
  },
  async deleteIssue(slug: string): Promise<void> {
    await ensureSchema();
    await sql`DELETE FROM issues WHERE slug = ${slug}`;
  },
};
