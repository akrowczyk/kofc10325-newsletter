import Link from "next/link";
import { listIssues, getGlobals, issueTitle } from "@/lib/store";
import { SiteHeader } from "@/components/SiteHeader";
import { DeleteIssueButton } from "./DeleteIssueButton";
import { startNextIssueAction } from "./actions";

// Read the store (and env-selected backend) at request time, not build time.
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [issues, globals] = await Promise.all([listIssues(), getGlobals()]);

  return (
    <>
    <SiteHeader />
    <main className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--studio-gold)]">
          Knights of Columbus
        </p>
        <h1 className="mt-1 text-3xl font-bold text-[var(--studio-navy)]">
          {globals.councilName} — Newsletter Studio
        </h1>
        <p className="mt-2 text-[var(--studio-muted)]">
          Fill in the month, preview the branded layout, and publish. Most content
          carries over from last month — you only edit what changed.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <form action={startNextIssueAction}>
          <button
            type="submit"
            className="rounded-lg bg-[var(--studio-navy)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            ✦ Start next month from last issue
          </button>
        </form>
        <Link
          href="/settings"
          className="rounded-lg border border-[var(--studio-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--studio-navy)] hover:bg-gray-50"
        >
          ⚙ Council settings
        </Link>
      </div>

      <div className="space-y-3">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="flex items-center justify-between rounded-xl border border-[var(--studio-border)] bg-[var(--studio-panel)] px-5 py-4 shadow-sm"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-[var(--studio-navy)]">
                  {issueTitle(issue)}
                </span>
                <StatusPill status={issue.status} />
              </div>
              <div className="mt-0.5 text-xs text-[var(--studio-muted)]">
                Updated {new Date(issue.updatedAt).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/n/${issue.slug}`}
                className="rounded-lg border border-[var(--studio-border)] px-3 py-2 text-sm font-medium text-[var(--studio-ink)] hover:bg-gray-50"
              >
                View
              </Link>
              <Link
                href={`/issues/${issue.slug}/edit`}
                className="rounded-lg bg-[var(--studio-gold)] px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Edit
              </Link>
              {issue.status === "published" ? (
                <Link
                  href={`/issues/${issue.slug}/send`}
                  className="rounded-lg border border-[var(--studio-border)] px-3 py-2 text-sm font-medium text-[var(--studio-navy)] hover:bg-gray-50"
                >
                  Notify
                </Link>
              ) : null}
              <DeleteIssueButton slug={issue.slug} title={issueTitle(issue)} />
            </div>
          </div>
        ))}

        {issues.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--studio-border)] px-5 py-10 text-center text-[var(--studio-muted)]">
            No issues yet. Start your first one above.
          </p>
        ) : null}
      </div>
    </main>
    </>
  );
}

function StatusPill({ status }: { status: "draft" | "published" }) {
  const published = status === "published";
  return (
    <span
      className={
        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide " +
        (published ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800")
      }
    >
      {status}
    </span>
  );
}
