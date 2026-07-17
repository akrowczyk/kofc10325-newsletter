import { MONTH_NAMES } from "./types";
import type { Globals, Issue } from "./types";

// Backend-agnostic store logic. Both the JSON and Postgres backends implement
// StoreBackend; the higher-level operations (publish, clone-next-month) are
// written once here against that interface.

export interface StoreBackend {
  getGlobals(): Promise<Globals>;
  saveGlobals(globals: Globals): Promise<void>;
  listIssues(): Promise<Issue[]>;
  getIssue(slug: string): Promise<Issue | null>;
  /** Upsert by id; caller has already stamped updatedAt. */
  putIssue(issue: Issue): Promise<void>;
  deleteIssue(slug: string): Promise<void>;
}

export function issueTitle(issue: Pick<Issue, "month" | "year">): string {
  return `${MONTH_NAMES[issue.month - 1]} ${issue.year}`;
}

export function nextMonthOf(latest?: Pick<Issue, "year" | "month">): {
  year: number;
  month: number;
} {
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

export function shiftDateOneMonth(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(y, m, d); // m (1-based) becomes 0-based next month
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
    dt.getDate(),
  ).padStart(2, "0")}`;
}

export function blankIssue(slug: string, year: number, month: number): Issue {
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

/** Construct the next month's draft from the latest issue + current globals. */
export function buildNextDraft(latest: Issue | undefined, globals: Globals): Issue {
  const { year, month } = nextMonthOf(latest);
  const slug = `${year}-${String(month).padStart(2, "0")}`;

  const draft: Issue = latest ? structuredClone(latest) : blankIssue(slug, year, month);
  draft.id = slug;
  draft.slug = slug;
  draft.year = year;
  draft.month = month;
  draft.status = "draft";
  draft.publishedAt = undefined;
  draft.updatedAt = new Date().toISOString();

  // Advance the calendar one month as a starting point.
  draft.calendar = draft.calendar.map((ev) => ({
    ...ev,
    date: shiftDateOneMonth(ev.date),
  }));

  // Re-seed carry-over content from current globals.
  draft.gkSummary = [...globals.standingSummary];

  return draft;
}
