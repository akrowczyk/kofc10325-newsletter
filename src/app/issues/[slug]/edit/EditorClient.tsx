"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type {
  CalendarEvent,
  FinancialSection,
  Globals,
  Issue,
  LedgerGroup,
  PhotoItem,
} from "@/lib/types";
import { MONTH_NAMES } from "@/lib/types";
import { groupTotal, money } from "@/lib/format";
import { NewsletterTemplate } from "@/components/NewsletterTemplate";
import { saveIssueAction, publishIssueAction } from "@/app/actions";

const uid = () => Math.random().toString(36).slice(2, 9);

// Strip blank list entries so the preview and published page never show empty
// bullets/rows while the author is mid-edit.
function cleanIssue(issue: Issue): Issue {
  return {
    ...issue,
    motions: issue.motions.filter((m) => m.trim() !== ""),
    gkSummary: issue.gkSummary.filter((m) => m.trim() !== ""),
    gkReport: issue.gkReport.map((p) => p.trim()).filter(Boolean),
  };
}

export function EditorClient({
  initialIssue,
  globals,
}: {
  initialIssue: Issue;
  globals: Globals;
}) {
  const [issue, setIssue] = useState<Issue>(initialIssue);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const preview = useMemo(() => cleanIssue(issue), [issue]);
  const patch = (p: Partial<Issue>) => setIssue((prev) => ({ ...prev, ...p }));

  function save() {
    startTransition(async () => {
      await saveIssueAction(cleanIssue(issue));
      setSavedAt(new Date().toLocaleTimeString());
    });
  }

  function publish() {
    startTransition(async () => {
      await saveIssueAction(cleanIssue(issue));
      await publishIssueAction(issue.slug);
    });
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--studio-border)] bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-semibold text-[var(--studio-navy)]">
            ← Studio
          </Link>
          <span className="text-sm text-[var(--studio-muted)]">
            {MONTH_NAMES[issue.month - 1]} {issue.year} ·{" "}
            <span className="uppercase">{issue.status}</span>
            {savedAt ? <em className="not-italic text-green-700"> · saved {savedAt}</em> : null}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/n/${issue.slug}`}
            className="rounded-lg border border-[var(--studio-border)] px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            View page
          </Link>
          <button
            onClick={save}
            disabled={pending}
            className="rounded-lg bg-[var(--studio-gold)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            onClick={publish}
            disabled={pending}
            className="rounded-lg bg-[var(--studio-navy)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Editor form */}
        <div className="max-h-[calc(100vh-57px)] overflow-y-auto px-4 py-5">
          <div className="mx-auto max-w-xl space-y-5">
            <p className="text-xs text-[var(--studio-muted)]">
              Roster, prayer list and birthdays come from your saved council data and
              appear automatically in the preview — you only edit this month&apos;s
              content here.
            </p>

            <SectionCard title="Calendar">
              <CalendarEditor
                events={issue.calendar}
                onChange={(calendar) => patch({ calendar })}
              />
            </SectionCard>

            <SectionCard title="June Meetings">
              <TextArea
                label="Officers' meeting"
                value={issue.officersMeeting}
                onChange={(officersMeeting) => patch({ officersMeeting })}
              />
              <TextArea
                label="Business meeting"
                value={issue.businessMeeting}
                onChange={(businessMeeting) => patch({ businessMeeting })}
              />
              <Lines
                label="Motions approved (one per line)"
                value={issue.motions}
                onChange={(motions) => patch({ motions })}
              />
            </SectionCard>

            <SectionCard title="Grand Knight">
              <TextArea
                label="Report (blank line between paragraphs)"
                value={issue.gkReport.join("\n\n")}
                onChange={(v) => patch({ gkReport: v.split(/\n\s*\n/) })}
                rows={5}
              />
              <Lines
                label="Summary bullets (one per line)"
                value={issue.gkSummary}
                onChange={(gkSummary) => patch({ gkSummary })}
              />
              <TextArea
                label="Reflection"
                value={issue.gkReflection}
                onChange={(gkReflection) => patch({ gkReflection })}
              />
            </SectionCard>

            <SectionCard title="Treasurer Report">
              <FinancialEditor
                section={issue.treasurer}
                onChange={(treasurer) => patch({ treasurer })}
              />
            </SectionCard>

            <SectionCard title="Financial Secretary Report">
              <FinancialEditor
                section={issue.financialSecretary}
                onChange={(financialSecretary) => patch({ financialSecretary })}
              />
            </SectionCard>

            <SectionCard title="Reports">
              <TextArea label="Church report" value={issue.churchReport} onChange={(churchReport) => patch({ churchReport })} />
              <TextArea label="District Deputy report" value={issue.ddReport} onChange={(ddReport) => patch({ ddReport })} />
              <TextArea label="Publicity report" value={issue.publicityReport} onChange={(publicityReport) => patch({ publicityReport })} />
              <TextArea label="Charity Ambassador report" value={issue.charityReport} onChange={(charityReport) => patch({ charityReport })} />
              <TextArea label="Pro-Life report" value={issue.proLifeReport} onChange={(proLifeReport) => patch({ proLifeReport })} rows={5} />
            </SectionCard>

            <SectionCard title="Business & Recognition">
              <TextArea label="Old business" value={issue.oldBusiness} onChange={(oldBusiness) => patch({ oldBusiness })} />
              <TextArea label="New business" value={issue.newBusiness} onChange={(newBusiness) => patch({ newBusiness })} />
              <TextArea label="Knight of the Month" value={issue.knightOfMonth} onChange={(knightOfMonth) => patch({ knightOfMonth })} rows={2} />
            </SectionCard>

            <SectionCard title="Reflections & Prayer">
              <TextArea
                label="Lecturer's reflection"
                value={issue.lecturerReflection.body}
                onChange={(body) => patch({ lecturerReflection: { ...issue.lecturerReflection, body } })}
                rows={5}
              />
              <Text
                label="Lecturer attribution"
                value={issue.lecturerReflection.attribution ?? ""}
                onChange={(attribution) => patch({ lecturerReflection: { ...issue.lecturerReflection, attribution } })}
              />
              <TextArea
                label="Holy Father's intention"
                value={issue.popeIntention}
                onChange={(popeIntention) => patch({ popeIntention })}
              />
            </SectionCard>

            <SectionCard title="Photos">
              <PhotosEditor
                title={issue.photoSectionTitle}
                photos={issue.photos}
                onTitle={(photoSectionTitle) => patch({ photoSectionTitle })}
                onChange={(photos) => patch({ photos })}
              />
            </SectionCard>

            <div className="h-8" />
          </div>
        </div>

        {/* Live preview */}
        <div className="hidden max-h-[calc(100vh-57px)] overflow-y-auto bg-[var(--studio-bg)] lg:block">
          <div className="p-4">
            <div style={{ zoom: 0.78 }}>
              <NewsletterTemplate issue={preview} globals={globals} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ field primitives ------------------------------ */

const labelCls = "block text-xs font-semibold uppercase tracking-wide text-[var(--studio-muted)] mb-1";
const inputCls =
  "w-full rounded-lg border border-[var(--studio-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--studio-navy)]";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[var(--studio-border)] bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-bold text-[var(--studio-navy)]">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <textarea
        className={inputCls}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Lines({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <textarea
        className={inputCls}
        rows={Math.max(3, value.length + 1)}
        value={value.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))}
      />
    </label>
  );
}

/* ------------------------------ calendar editor ------------------------------ */

function CalendarEditor({
  events,
  onChange,
}: {
  events: CalendarEvent[];
  onChange: (e: CalendarEvent[]) => void;
}) {
  const set = (id: string, p: Partial<CalendarEvent>) =>
    onChange(events.map((e) => (e.id === id ? { ...e, ...p } : e)));
  return (
    <div className="space-y-2">
      {events.map((e) => (
        <div key={e.id} className="rounded-lg border border-[var(--studio-border)] p-2">
          <div className="flex gap-2">
            <input
              type="date"
              className={inputCls + " max-w-[9.5rem]"}
              value={e.date}
              onChange={(ev) => set(e.id, { date: ev.target.value })}
            />
            <input
              className={inputCls}
              placeholder="Time (7:00 pm)"
              value={e.time ?? ""}
              onChange={(ev) => set(e.id, { time: ev.target.value })}
            />
            <button
              type="button"
              className="px-2 text-[var(--studio-muted)] hover:text-red-600"
              onClick={() => onChange(events.filter((x) => x.id !== e.id))}
              aria-label="Remove event"
            >
              ✕
            </button>
          </div>
          <input
            className={inputCls + " mt-2"}
            placeholder="Title"
            value={e.title}
            onChange={(ev) => set(e.id, { title: ev.target.value })}
          />
          <input
            className={inputCls + " mt-2"}
            placeholder="Location / note (optional)"
            value={e.location ?? ""}
            onChange={(ev) => set(e.id, { location: ev.target.value })}
          />
        </div>
      ))}
      <AddButton
        label="Add event"
        onClick={() => onChange([...events, { id: uid(), date: "", title: "", time: "" }])}
      />
    </div>
  );
}

/* ------------------------------ financial editor ------------------------------ */

function FinancialEditor({
  section,
  onChange,
}: {
  section: FinancialSection;
  onChange: (s: FinancialSection) => void;
}) {
  const setGroup = (gid: string, next: LedgerGroup) =>
    onChange({ ...section, groups: section.groups.map((g) => (g.id === gid ? next : g)) });

  return (
    <div className="space-y-3">
      {/* Balances */}
      <div className="space-y-2">
        <span className={labelCls}>Balances</span>
        {section.balances.map((b) => (
          <div key={b.id} className="flex gap-2">
            <input
              className={inputCls}
              placeholder="Label"
              value={b.label}
              onChange={(e) =>
                onChange({
                  ...section,
                  balances: section.balances.map((x) => (x.id === b.id ? { ...x, label: e.target.value } : x)),
                })
              }
            />
            <AmountInput
              value={b.amount}
              onChange={(amount) =>
                onChange({
                  ...section,
                  balances: section.balances.map((x) => (x.id === b.id ? { ...x, amount } : x)),
                })
              }
            />
            <RemoveBtn
              onClick={() =>
                onChange({ ...section, balances: section.balances.filter((x) => x.id !== b.id) })
              }
            />
          </div>
        ))}
        <AddButton
          label="Add balance line"
          onClick={() =>
            onChange({
              ...section,
              balances: [...section.balances, { id: uid(), label: "", amount: 0 }],
            })
          }
        />
      </div>

      {/* Groups */}
      {section.groups.map((g) => (
        <div key={g.id} className="rounded-lg border border-[var(--studio-border)] p-2">
          <div className="flex items-center gap-2">
            <input
              className={inputCls + " font-semibold"}
              value={g.title}
              onChange={(e) => setGroup(g.id, { ...g, title: e.target.value })}
            />
            <span className="whitespace-nowrap text-xs text-[var(--studio-muted)]">
              {money(groupTotal(g))}
            </span>
            <RemoveBtn
              onClick={() => onChange({ ...section, groups: section.groups.filter((x) => x.id !== g.id) })}
            />
          </div>
          <div className="mt-2 space-y-1.5">
            {g.rows.map((r) => (
              <div key={r.id} className="flex gap-2">
                <input
                  className={inputCls}
                  placeholder="Line item"
                  value={r.label}
                  onChange={(e) =>
                    setGroup(g.id, {
                      ...g,
                      rows: g.rows.map((x) => (x.id === r.id ? { ...x, label: e.target.value } : x)),
                    })
                  }
                />
                <AmountInput
                  value={r.amount}
                  onChange={(amount) =>
                    setGroup(g.id, {
                      ...g,
                      rows: g.rows.map((x) => (x.id === r.id ? { ...x, amount } : x)),
                    })
                  }
                />
                <RemoveBtn
                  onClick={() => setGroup(g.id, { ...g, rows: g.rows.filter((x) => x.id !== r.id) })}
                />
              </div>
            ))}
            <AddButton
              label="Add line"
              onClick={() => setGroup(g.id, { ...g, rows: [...g.rows, { id: uid(), label: "", amount: 0 }] })}
            />
          </div>
        </div>
      ))}
      <AddButton
        label="Add group (Receipts, Checks…)"
        onClick={() =>
          onChange({ ...section, groups: [...section.groups, { id: uid(), title: "New group", rows: [] }] })
        }
      />
    </div>
  );
}

function AmountInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <input
      type="number"
      step="0.01"
      className={inputCls + " max-w-[7.5rem] text-right"}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
    />
  );
}

/* ------------------------------ photos editor ------------------------------ */

function PhotosEditor({
  title,
  photos,
  onTitle,
  onChange,
}: {
  title: string;
  photos: PhotoItem[];
  onTitle: (t: string) => void;
  onChange: (p: PhotoItem[]) => void;
}) {
  return (
    <div className="space-y-2">
      <Text label="Section title" value={title} onChange={onTitle} />
      {photos.map((p) => (
        <div key={p.id} className="flex gap-2">
          <input
            className={inputCls}
            placeholder="Image URL (optional for now)"
            value={p.url ?? ""}
            onChange={(e) => onChange(photos.map((x) => (x.id === p.id ? { ...x, url: e.target.value } : x)))}
          />
          <RemoveBtn onClick={() => onChange(photos.filter((x) => x.id !== p.id))} />
        </div>
      ))}
      <AddButton label="Add photo slot" onClick={() => onChange([...photos, { id: uid(), caption: "" }])} />
      <p className="text-xs text-[var(--studio-muted)]">
        Photo uploads land in v2 (Vercel Blob). For now, empty slots show as placeholder
        frames, or paste an image URL.
      </p>
    </div>
  );
}

/* ------------------------------ tiny buttons ------------------------------ */

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-dashed border-[var(--studio-border)] px-3 py-1.5 text-xs font-semibold text-[var(--studio-navy)] hover:bg-gray-50"
    >
      + {label}
    </button>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2 text-[var(--studio-muted)] hover:text-red-600"
      aria-label="Remove"
    >
      ✕
    </button>
  );
}
