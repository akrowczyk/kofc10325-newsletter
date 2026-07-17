import type { FinancialSection, LedgerGroup, Member, MonthDay } from "./types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function money(amount: number): string {
  return currency.format(amount);
}

export function groupTotal(group: LedgerGroup): number {
  return group.rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
}

/** True when a financial section has nothing to show. */
export function isEmptyFinancial(section: FinancialSection): boolean {
  return section.balances.length === 0 && section.groups.every((g) => g.rows.length === 0);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2026-07-15" -> "Wed Jul 15" */
export function formatEventDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(y, m - 1, d);
  return `${WEEKDAYS[dt.getDay()]} ${MONTHS_SHORT[m - 1]} ${d}`;
}

export interface MonthMember {
  name: string;
  day: number;
}

function collectByMonth(
  members: Member[],
  pick: (m: Member) => MonthDay | undefined,
  month: number,
): MonthMember[] {
  return members
    .map((m) => ({ member: m, when: pick(m) }))
    .filter((x): x is { member: Member; when: MonthDay } => !!x.when && x.when.month === month)
    .sort((a, b) => a.when.day - b.when.day)
    .map((x) => ({ name: x.member.name, day: x.when.day }));
}

/** Members with a birthday in the given month, sorted by day. */
export function birthdaysInMonth(members: Member[], month: number): MonthMember[] {
  return collectByMonth(members, (m) => m.birthday, month);
}

/** Members with a wedding anniversary in the given month, sorted by day. */
export function anniversariesInMonth(members: Member[], month: number): MonthMember[] {
  return collectByMonth(members, (m) => m.anniversary, month);
}
