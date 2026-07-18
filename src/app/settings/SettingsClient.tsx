"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Globals, Member, MonthDay, Officer, Recipient } from "@/lib/types";
import { saveGlobalsAction } from "./actions";

const uid = () => Math.random().toString(36).slice(2, 9);
const labelCls =
  "block text-xs font-semibold uppercase tracking-wide text-[var(--studio-muted)] mb-1";
const inputCls =
  "w-full rounded-lg border border-[var(--studio-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--studio-navy)]";

export function SettingsClient({ initialGlobals }: { initialGlobals: Globals }) {
  const [g, setG] = useState<Globals>(initialGlobals);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const patch = (p: Partial<Globals>) => setG((prev) => ({ ...prev, ...p }));

  function save() {
    startTransition(async () => {
      await saveGlobalsAction(g);
      setSavedAt(new Date().toLocaleTimeString());
    });
  }

  return (
    <div>
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[var(--studio-border)] bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-semibold text-[var(--studio-navy)]">
            ← Studio
          </Link>
          <span className="text-sm text-[var(--studio-muted)]">
            Council settings
            {savedAt ? <em className="not-italic text-green-700"> · saved {savedAt}</em> : null}
          </span>
        </div>
        <button
          onClick={save}
          disabled={pending}
          className="rounded-lg bg-[var(--studio-navy)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
        <p className="text-xs text-[var(--studio-muted)]">
          These carry over to every newsletter. Birthdays and anniversaries here fill the
          Congratulations section automatically for the matching month; the prayer list and
          officer roster appear on every issue.
        </p>

        <Card title="Council">
          <Field label="Council name" value={g.councilName} onChange={(v) => patch({ councilName: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Council number" value={g.councilNumber} onChange={(v) => patch({ councilNumber: v })} />
            <Field label="Website URL" value={g.websiteUrl} onChange={(v) => patch({ websiteUrl: v })} />
          </div>
        </Card>

        <Card title="Officers">
          <OfficersEditor officers={g.officers} onChange={(officers) => patch({ officers })} />
        </Card>

        <Card title="Members (birthdays & anniversaries)">
          <MembersEditor members={g.members} onChange={(members) => patch({ members })} />
        </Card>

        <Card title="Prayer list">
          <Field
            label="Intro line"
            value={g.prayerList.intro ?? ""}
            onChange={(v) => patch({ prayerList: { ...g.prayerList, intro: v } })}
          />
          <label className="block">
            <span className={labelCls}>Names (one per line)</span>
            <textarea
              className={inputCls}
              rows={Math.max(6, g.prayerList.names.length + 1)}
              value={g.prayerList.names.join("\n")}
              onChange={(e) =>
                patch({ prayerList: { ...g.prayerList, names: e.target.value.split("\n") } })
              }
            />
          </label>
          <Field
            label="Contact email (to add/remove names)"
            value={g.prayerList.contactEmail ?? ""}
            onChange={(v) => patch({ prayerList: { ...g.prayerList, contactEmail: v } })}
          />
        </Card>

        <Card title="Grand Knight's standing summary">
          <p className="mb-2 text-xs text-[var(--studio-muted)]">
            These bullets pre-fill each new issue&apos;s Grand Knight&apos;s Summary (the author
            can still edit them per month).
          </p>
          <label className="block">
            <span className={labelCls}>Bullets (one per line)</span>
            <textarea
              className={inputCls}
              rows={Math.max(6, g.standingSummary.length + 1)}
              value={g.standingSummary.join("\n")}
              onChange={(e) => patch({ standingSummary: e.target.value.split("\n") })}
            />
          </label>
        </Card>

        <Card title="Email distribution list">
          <p className="text-xs text-[var(--studio-muted)]">
            Members here receive the “Notify members” email when you send a newsletter
            announcement. Each person gets their own email (they don&apos;t see each other).
          </p>
          <DistributionEditor
            list={g.distributionList}
            onChange={(distributionList) => patch({ distributionList })}
          />
        </Card>

        <Card title="Email sending">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="From name"
              value={g.emailSettings.fromName}
              onChange={(v) => patch({ emailSettings: { ...g.emailSettings, fromName: v } })}
            />
            <Field
              label="From address (verified domain)"
              value={g.emailSettings.fromEmail}
              onChange={(v) => patch({ emailSettings: { ...g.emailSettings, fromEmail: v } })}
            />
          </div>
          <Field
            label="Reply-to (optional)"
            value={g.emailSettings.replyTo ?? ""}
            onChange={(v) => patch({ emailSettings: { ...g.emailSettings, replyTo: v } })}
          />
          <Field
            label="Subject template"
            value={g.emailSettings.subjectTemplate}
            onChange={(v) => patch({ emailSettings: { ...g.emailSettings, subjectTemplate: v } })}
          />
          <label className="block">
            <span className={labelCls}>Message template</span>
            <textarea
              className={inputCls}
              rows={4}
              value={g.emailSettings.bodyTemplate}
              onChange={(e) =>
                patch({ emailSettings: { ...g.emailSettings, bodyTemplate: e.target.value } })
              }
            />
          </label>
          <p className="text-xs text-[var(--studio-muted)]">
            Variables you can use in the subject/message:{" "}
            <code>{"{{councilName}}"}</code>, <code>{"{{month}}"}</code>, <code>{"{{year}}"}</code>.
            The “From address” must be on a domain you&apos;ve verified with Resend (e.g.
            news@kofc10325.org).
          </p>
        </Card>

        <div className="flex justify-end">
          <button
            onClick={save}
            disabled={pending}
            className="rounded-lg bg-[var(--studio-navy)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save settings"}
          </button>
        </div>
        <div className="h-6" />
      </main>
    </div>
  );
}

/* -------------------------------- primitives -------------------------------- */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[var(--studio-border)] bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-bold text-[var(--studio-navy)]">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

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

/* --------------------------------- officers --------------------------------- */

function OfficersEditor({
  officers,
  onChange,
}: {
  officers: Officer[];
  onChange: (o: Officer[]) => void;
}) {
  const set = (id: string, p: Partial<Officer>) =>
    onChange(officers.map((o) => (o.id === id ? { ...o, ...p } : o)));
  return (
    <div className="space-y-2">
      {officers.map((o) => (
        <div key={o.id} className="flex gap-2">
          <input
            className={inputCls + " max-w-[11rem]"}
            placeholder="Role"
            value={o.role}
            onChange={(e) => set(o.id, { role: e.target.value })}
          />
          <input
            className={inputCls}
            placeholder="Name"
            value={o.name}
            onChange={(e) => set(o.id, { name: e.target.value })}
          />
          <RemoveBtn onClick={() => onChange(officers.filter((x) => x.id !== o.id))} />
        </div>
      ))}
      <AddButton
        label="Add officer"
        onClick={() => onChange([...officers, { id: uid(), role: "", name: "" }])}
      />
    </div>
  );
}

/* ------------------------------ distribution list --------------------------- */

function DistributionEditor({
  list,
  onChange,
}: {
  list: Recipient[];
  onChange: (r: Recipient[]) => void;
}) {
  const set = (id: string, p: Partial<Recipient>) =>
    onChange(list.map((r) => (r.id === id ? { ...r, ...p } : r)));

  function addBulk(text: string) {
    // Accept pasted "Name <email>" or bare emails, one per line or comma-separated.
    const entries: Recipient[] = [];
    for (const raw of text.split(/[\n,]+/)) {
      const s = raw.trim();
      if (!s) continue;
      const m = s.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
      if (m) entries.push({ id: uid(), name: m[1] || undefined, email: m[2].trim() });
      else if (/@/.test(s)) entries.push({ id: uid(), email: s });
    }
    if (entries.length) onChange([...list, ...entries]);
  }

  return (
    <div className="space-y-2">
      {list.map((r) => (
        <div key={r.id} className="flex gap-2">
          <input
            className={inputCls + " max-w-[12rem]"}
            placeholder="Name (optional)"
            value={r.name ?? ""}
            onChange={(e) => set(r.id, { name: e.target.value })}
          />
          <input
            className={inputCls}
            placeholder="email@example.com"
            value={r.email}
            onChange={(e) => set(r.id, { email: e.target.value })}
          />
          <RemoveBtn onClick={() => onChange(list.filter((x) => x.id !== r.id))} />
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <AddButton
          label="Add member"
          onClick={() => onChange([...list, { id: uid(), email: "" }])}
        />
        <span className="text-xs text-[var(--studio-muted)]">{list.length} on the list</span>
      </div>
      <details className="mt-1">
        <summary className="cursor-pointer text-xs font-semibold text-[var(--studio-navy)]">
          Paste a list to add many at once
        </summary>
        <textarea
          className={inputCls + " mt-2"}
          rows={3}
          placeholder={"Jane Doe <jane@example.com>\njohn@example.com, mary@example.com"}
          onBlur={(e) => {
            addBulk(e.target.value);
            e.target.value = "";
          }}
        />
        <span className="text-xs text-[var(--studio-muted)]">
          One per line or comma-separated; “Name &lt;email&gt;” or bare email. Added when you
          click away.
        </span>
      </details>
    </div>
  );
}

/* ---------------------------------- members --------------------------------- */

function MembersEditor({
  members,
  onChange,
}: {
  members: Member[];
  onChange: (m: Member[]) => void;
}) {
  const set = (id: string, p: Partial<Member>) =>
    onChange(members.map((m) => (m.id === id ? { ...m, ...p } : m)));
  return (
    <div className="space-y-2">
      <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--studio-muted)] sm:grid">
        <span>Name</span>
        <span className="w-[7.5rem] text-center">Birthday</span>
        <span className="w-[7.5rem] text-center">Anniversary</span>
        <span className="w-6" />
      </div>
      {members.map((m) => (
        <div key={m.id} className="flex flex-wrap items-center gap-2">
          <input
            className={inputCls + " min-w-[10rem] flex-1"}
            placeholder="Name"
            value={m.name}
            onChange={(e) => set(m.id, { name: e.target.value })}
          />
          <MonthDayInput value={m.birthday} onChange={(birthday) => set(m.id, { birthday })} />
          <MonthDayInput value={m.anniversary} onChange={(anniversary) => set(m.id, { anniversary })} />
          <RemoveBtn onClick={() => onChange(members.filter((x) => x.id !== m.id))} />
        </div>
      ))}
      <AddButton
        label="Add member"
        onClick={() => onChange([...members, { id: uid(), name: "" }])}
      />
    </div>
  );
}

function MonthDayInput({
  value,
  onChange,
}: {
  value?: MonthDay;
  onChange: (v: MonthDay | undefined) => void;
}) {
  const update = (month: number, day: number) => {
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) onChange({ month, day });
    else onChange(undefined);
  };
  const numCls =
    "w-12 rounded-lg border border-[var(--studio-border)] bg-white px-2 py-2 text-sm text-center outline-none focus:border-[var(--studio-navy)]";
  return (
    <span className="flex items-center gap-1">
      <input
        type="number"
        min={1}
        max={12}
        placeholder="M"
        className={numCls}
        value={value?.month ?? ""}
        onChange={(e) => update(parseInt(e.target.value) || 0, value?.day ?? 0)}
      />
      <span className="text-[var(--studio-muted)]">/</span>
      <input
        type="number"
        min={1}
        max={31}
        placeholder="D"
        className={numCls}
        value={value?.day ?? ""}
        onChange={(e) => update(value?.month ?? 0, parseInt(e.target.value) || 0)}
      />
    </span>
  );
}
