"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { sendNotificationAction, type SendActionResult } from "./actions";

const labelCls =
  "block text-xs font-semibold uppercase tracking-wide text-[var(--studio-muted)] mb-1";
const inputCls =
  "w-full rounded-lg border border-[var(--studio-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--studio-navy)]";

export function SendClient({
  slug,
  monthYear,
  status,
  recipientCount,
  fromLine,
  publicUrl,
  defaultSubject,
  defaultBody,
  blockers,
}: {
  slug: string;
  monthYear: string;
  status: "draft" | "published";
  recipientCount: number;
  fromLine: string;
  publicUrl: string;
  defaultSubject: string;
  defaultBody: string;
  blockers: string[];
}) {
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<SendActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const blocked = blockers.length > 0;

  function send() {
    setResult(null);
    startTransition(async () => {
      const r = await sendNotificationAction(slug, subject, body);
      setResult(r);
      setConfirming(false);
    });
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="text-sm font-semibold text-[var(--studio-navy)]">
          ← Studio
        </Link>
        <span className="text-sm text-[var(--studio-muted)]">Notify members · {monthYear}</span>
      </div>

      <h1 className="text-2xl font-bold text-[var(--studio-navy)]">Notify members</h1>
      <p className="mt-1 mb-5 text-sm text-[var(--studio-muted)]">
        Sends a branded email with your message and a button linking to the{" "}
        <Link href={`/n/${slug}`} className="underline">
          {monthYear} newsletter
        </Link>
        . Each member gets their own email.
      </p>

      {blocked ? (
        <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="mb-2 text-sm font-semibold text-amber-900">
            Before you can send, please resolve:
          </p>
          <ul className="list-disc pl-5 text-sm text-amber-900">
            {blockers.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          <Link href="/settings" className="mt-2 inline-block text-sm font-semibold text-amber-900 underline">
            Open Council settings →
          </Link>
        </div>
      ) : null}

      <div className="space-y-4 rounded-xl border border-[var(--studio-border)] bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <span className={labelCls}>From</span>
            <div className="text-[var(--studio-ink)]">{fromLine}</div>
          </div>
          <div>
            <span className={labelCls}>Recipients</span>
            <div className="text-[var(--studio-ink)]">
              {recipientCount} member{recipientCount === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        <label className="block">
          <span className={labelCls}>Subject</span>
          <input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>

        <label className="block">
          <span className={labelCls}>Message</span>
          <textarea
            className={inputCls}
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <span className="mt-1 block text-xs text-[var(--studio-muted)]">
            A “Read the {monthYear} Newsletter” button linking to{" "}
            <span className="break-all">{publicUrl}</span> is added automatically below your message.
          </span>
        </label>

        {status === "draft" ? (
          <p className="text-xs font-medium text-amber-700">
            Note: this issue is a draft. Publish it first, or the link won’t work for members.
          </p>
        ) : null}

        <div className="flex items-center gap-2 pt-1">
          {!confirming ? (
            <button
              type="button"
              disabled={blocked || pending}
              onClick={() => setConfirming(true)}
              className="rounded-lg bg-[var(--studio-navy)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              Send to {recipientCount} member{recipientCount === 1 ? "" : "s"}…
            </button>
          ) : (
            <>
              <span className="text-sm font-medium">
                Send this to {recipientCount} member{recipientCount === 1 ? "" : "s"} now?
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={send}
                className="rounded-lg bg-[var(--studio-navy)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {pending ? "Sending…" : "Yes, send"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-[var(--studio-border)] px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {result ? (
          <p
            className={
              "text-sm font-medium " + (result.ok ? "text-green-700" : "text-red-600")
            }
          >
            {result.ok ? "✓ " : ""}
            {result.message}
          </p>
        ) : null}
      </div>
    </main>
  );
}
