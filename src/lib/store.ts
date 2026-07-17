import "server-only";
import type { Globals, Issue } from "./types";
import { buildNextDraft, issueTitle, type StoreBackend } from "./storeCore";
import { jsonBackend } from "./backends/json";
import { postgresBackend } from "./backends/postgres";

// Pick the backend by environment: Vercel Postgres in production (a connection
// string is auto-injected when a Postgres store is attached — the integration
// names it POSTGRES_URL or DATABASE_URL), the local JSON file otherwise.
const usePostgres = !!(
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING
);
const backend: StoreBackend = usePostgres ? postgresBackend : jsonBackend;

export const storeMode = usePostgres ? "postgres" : "json";
export { issueTitle };

// ---- Reads -----------------------------------------------------------------

export function getGlobals(): Promise<Globals> {
  return backend.getGlobals();
}

export function listIssues(): Promise<Issue[]> {
  return backend.listIssues();
}

export function getIssue(slug: string): Promise<Issue | null> {
  return backend.getIssue(slug);
}

// ---- Writes ----------------------------------------------------------------

export function saveGlobals(globals: Globals): Promise<void> {
  return backend.saveGlobals(globals);
}

export async function saveIssue(issue: Issue): Promise<Issue> {
  const next: Issue = { ...issue, updatedAt: new Date().toISOString() };
  await backend.putIssue(next);
  return next;
}

export async function publishIssue(slug: string): Promise<Issue | null> {
  const issue = await backend.getIssue(slug);
  if (!issue) return null;
  const now = new Date().toISOString();
  const published: Issue = {
    ...issue,
    status: "published",
    publishedAt: now,
    updatedAt: now,
  };
  await backend.putIssue(published);
  return published;
}

export function deleteIssue(slug: string): Promise<void> {
  return backend.deleteIssue(slug);
}

/**
 * Clone the most recent issue into a fresh draft for the next month (the core
 * time-saver). Returns the existing draft if one already exists for that month.
 */
export async function startNextIssue(): Promise<Issue> {
  const [issues, globals] = await Promise.all([backend.listIssues(), backend.getGlobals()]);
  const latest = issues[0]; // listIssues is sorted newest-first
  const draft = buildNextDraft(latest, globals);

  const existing = await backend.getIssue(draft.slug);
  if (existing) return existing;

  await backend.putIssue(draft);
  return draft;
}
