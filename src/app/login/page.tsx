import { redirect } from "next/navigation";
import { authEnabled } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { loginAction } from "./actions";

// Evaluate auth config at request time (env is set at runtime, not build time).
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  // If auth isn't configured (local dev), there's nothing to log into.
  if (!authEnabled()) redirect("/");

  const { next = "/", error } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-5 py-16">
        <h1 className="text-2xl font-bold text-[var(--studio-navy)]">Newsletter Studio</h1>
        <p className="mt-1 mb-6 text-sm text-[var(--studio-muted)]">
          Enter the council password to edit and publish.
        </p>

        <form
          action={loginAction}
          className="space-y-3 rounded-xl border border-[var(--studio-border)] bg-white p-5 shadow-sm"
        >
          <input type="hidden" name="next" value={next} />
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--studio-muted)]">
              Password
            </span>
            <input
              type="password"
              name="password"
              autoFocus
              required
              className="w-full rounded-lg border border-[var(--studio-border)] px-3 py-2 text-sm outline-none focus:border-[var(--studio-navy)]"
            />
          </label>

          {error ? (
            <p className="text-sm text-red-600">Incorrect password. Try again.</p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-[var(--studio-navy)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Sign in
          </button>
        </form>
      </main>
    </>
  );
}
