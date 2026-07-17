// Domain model for the Council 10325 newsletter.
//
// A newsletter is split into two kinds of data:
//  - "Globals": things that carry over month to month and are edited once
//    (officer roster, members + their birthdays/anniversaries, the prayer list,
//    the Grand Knight's standing summary bullets).
//  - "Issue": the month-specific content the author fills in each time.
//
// When the author starts a new month, we clone the previous issue's content as a
// draft; globals are always pulled live so the roster / prayer list / birthdays
// stay current without re-typing.

export type IssueStatus = "draft" | "published";

export interface CalendarEvent {
  id: string;
  date: string; // e.g. "2026-07-15" (rendered as "Wed Jul 15")
  title: string;
  time?: string; // e.g. "7:00 pm"
  location?: string; // e.g. "Koinonia Room"
}

/** A single line in a financial table. */
export interface LedgerRow {
  id: string;
  label: string;
  amount: number;
}

/** A named group of ledger rows whose total is computed automatically. */
export interface LedgerGroup {
  id: string;
  title: string; // "Receipts", "Checks", "Vouchers"
  rows: LedgerRow[];
}

/** A balance line shown above the groups (e.g. opening/closing balances). */
export interface BalanceLine {
  id: string;
  label: string;
  amount: number;
  note?: string; // e.g. "includes K.I.N. Fund $7,910"
}

export interface FinancialSection {
  balances: BalanceLine[];
  groups: LedgerGroup[];
}

export interface PhotoItem {
  id: string;
  caption?: string;
  url?: string; // Vercel Blob URL in production; empty renders a placeholder frame
}

export interface Reflection {
  body: string;
  attribution?: string;
}

/** One line in a custom Congratulations box (e.g. a birth, wedding, ordination). */
export interface CongratsEntry {
  id: string;
  when?: string; // optional short label shown in gold, e.g. "Feb 16"
  text: string; // e.g. "Mariana Fasano, daughter of Rosita & Rocco Fasano"
}

/** A titled box in the Congratulations section, added per issue. */
export interface CongratsBox {
  id: string;
  title: string; // e.g. "New Arrival", "Wedding", "Congratulations"
  entries: CongratsEntry[];
}

/** Month-specific newsletter content. */
export interface Issue {
  id: string;
  slug: string; // "2026-07"
  year: number;
  month: number; // 1-12
  status: IssueStatus;
  publishedAt?: string;
  updatedAt: string;

  calendar: CalendarEvent[];

  // June meetings / attendance (free text, one paragraph each)
  officersMeeting: string;
  businessMeeting: string;

  motions: string[];
  gkReport: string[]; // paragraphs
  gkSummary: string[]; // bullets (defaults cloned from globals.standingSummary)
  gkReflection: string;

  treasurer: FinancialSection;
  financialSecretary: FinancialSection;

  churchReport: string;
  ddReport: string;
  publicityReport: string;
  charityReport: string;
  proLifeReport: string;

  // When true, render a "Council Officers" section (roster from settings).
  // Off by default — it's not relevant every month.
  includeOfficers?: boolean;

  oldBusiness: string;
  newBusiness: string;
  knightOfMonth: string;

  lecturerReflection: Reflection;
  popeIntention: string;

  // Custom Congratulations boxes (births, weddings, etc.) shown alongside the
  // auto-generated birthdays/anniversaries.
  congratulations: CongratsBox[];

  photoSectionTitle: string;
  photos: PhotoItem[];
}

export interface Officer {
  id: string;
  role: string;
  name: string;
}

export interface MonthDay {
  month: number; // 1-12
  day: number;
}

export interface Member {
  id: string;
  name: string;
  birthday?: MonthDay;
  anniversary?: MonthDay; // wedding anniversary
}

export interface PrayerList {
  names: string[];
  contactEmail?: string;
  intro?: string;
}

/** Data that carries over month to month. */
export interface Globals {
  councilName: string;
  councilNumber: string;
  websiteUrl: string;
  officers: Officer[];
  members: Member[];
  prayerList: PrayerList;
  standingSummary: string[]; // default Grand Knight's summary bullets
}

export interface StoreData {
  globals: Globals;
  issues: Issue[];
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;
