import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { seedData } from "./seed";
import { MONTH_NAMES } from "./types";
import type { Globals, Issue, StoreData } from "./types";

// ---------------------------------------------------------------------------
// Data store
//
// This is the ONE seam to swap when going to production. Today it persists to a
// JSON file, which is perfect for local development and demos. On Vercel the
// runtime filesystem is read-only, so before going live we replace the bodies of
// `readStore` / `writeStore` with Vercel Postgres queries (or Vercel Blob for a
// single JSON document). Everything above this line — the app, the editor, the
// template — stays exactly the same.
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

async function readStore(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as StoreData;
  } catch {
    // First run: materialize the seed so the app is never empty.
    await writeStore(seedData);
    return structuredClone(seedData);
  }
}

async function writeStore(data: StoreData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

// ---- Reads -----------------------------------------------------------------

export async function getGlobals(): Promise<Globals> {
  return (await readStore()).globals;
}

export async function listIssues(): Promise<Issue[]> {
  const { issues } = await readStore();
  return [...issues].sort((a, b) => b.slug.localeCompare(a.slug));
}

export async function getIssue(slug: string): Promise<Issue | null> {
  const { issues } = await readStore();
  return issues.find((i) => i.slug === slug || i.id === slug) ?? null;
}

// ---- Writes ----------------------------------------------------------------

export async function saveGlobals(globals: Globals): Promise<void> {
  const data = await readStore();
  data.globals = globals;
  await writeStore(data);
}

export async function saveIssue(issue: Issue): Promise<Issue> {
  const data = await readStore();
  const next: Issue = { ...issue, updatedAt: new Date().toISOString() };
  const idx = data.issues.findIndex((i) => i.id === issue.id);
  if (idx >= 0) data.issues[idx] = next;
  else data.issues.push(next);
  await writeStore(data);
  return next;
}

export async function publishIssue(slug: string): Promise<Issue | null> {
  const data = await readStore();
  const issue = data.issues.find((i) => i.slug === slug || i.id === slug);
  if (!issue) return null;
  issue.status = "published";
  issue.publishedAt = new Date().toISOString();
  issue.updatedAt = issue.publishedAt;
  await writeStore(data);
  return issue;
}

export async function deleteIssue(slug: string): Promise<void> {
  const data = await readStore();
  data.issues = data.issues.filter((i) => i.slug !== slug && i.id !== slug);
  await writeStore(data);
}

// ---------------------------------------------------------------------------
// Clone-from-previous: the core time-saver. Copies the most recent issue's
// month-specific content into a fresh draft for the next month, advances the
// calendar dates by one month, and re-seeds the Grand Knight's summary + a
// birthdays-aware starting point from current globals.
// ---------------------------------------------------------------------------

export async function startNextIssue(): Promise<Issue> {
  const data = await readStore();
  const globals = data.globals;
  const latest = [...data.issues].sort((a, b) => b.slug.localeCompare(a.slug))[0];

  const { year, month } = nextMonth(latest);
  const slug = `${year}-${String(month).padStart(2, "0")}`;
  if (data.issues.some((i) => i.slug === slug)) {
    // Draft for that month already exists — hand it back rather than duplicate.
    return data.issues.find((i) => i.slug === slug)!;
  }

  const draft: Issue = latest
    ? structuredClone(latest)
    : blankIssue(slug, year, month);

  draft.id = slug;
  draft.slug = slug;
  draft.year = year;
  draft.month = month;
  draft.status = "draft";
  draft.publishedAt = undefined;
  draft.updatedAt = new Date().toISOString();

  // Shift calendar one month forward as a starting point.
  draft.calendar = draft.calendar.map((ev) => ({
    ...ev,
    date: shiftDateOneMonth(ev.date),
  }));

  // Re-seed carry-over content from current globals.
  draft.gkSummary = [...globals.standingSummary];

  data.issues.push(draft);
  await writeStore(data);
  return draft;
}

// ---- helpers ---------------------------------------------------------------

function nextMonth(latest?: Issue): { year: number; month: number } {
  if (!latest) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  let month = latest.month + 1;
  let year = latest.year;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  return { year, month };
}

function shiftDateOneMonth(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m, d); // m (1-based) as 0-based next month
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
    dt.getDate(),
  ).padStart(2, "0")}`;
}

function blankIssue(slug: string, year: number, month: number): Issue {
  return {
    id: slug,
    slug,
    year,
    month,
    status: "draft",
    updatedAt: new Date().toISOString(),
    calendar: [],
    officersMeeting: "",
    businessMeeting: "",
    motions: [],
    gkReport: [],
    gkSummary: [],
    gkReflection: "",
    treasurer: { balances: [], groups: [] },
    financialSecretary: { balances: [], groups: [] },
    churchReport: "",
    ddReport: "",
    publicityReport: "",
    charityReport: "",
    proLifeReport: "",
    oldBusiness: "",
    newBusiness: "",
    knightOfMonth: "",
    lecturerReflection: { body: "", attribution: "" },
    popeIntention: "",
    photoSectionTitle: "Photos",
    photos: [],
  };
}

export function issueTitle(issue: Pick<Issue, "month" | "year">): string {
  return `${MONTH_NAMES[issue.month - 1]} ${issue.year}`;
}
