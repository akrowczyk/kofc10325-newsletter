"use client";

import { useState, useTransition } from "react";
import { deleteIssueAction } from "./actions";

// Two-step delete: first click asks for confirmation inline, second click
// deletes. Avoids an accidental one-click removal (and the jarring native
// confirm dialog).
export function DeleteIssueButton({ slug, title }: { slug: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-[var(--studio-border)] px-3 py-2 text-sm font-medium text-[var(--studio-muted)] hover:border-red-300 hover:bg-red-50 hover:text-red-600"
      >
        Delete
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <span className="text-xs font-medium text-[var(--studio-ink)]">Delete {title}?</span>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => deleteIssueAction(slug))}
        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Yes, delete"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirming(false)}
        className="rounded-lg border border-[var(--studio-border)] px-3 py-2 text-sm font-medium hover:bg-gray-50"
      >
        Cancel
      </button>
    </span>
  );
}
