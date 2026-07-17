import { NextResponse } from "next/server";
import { storeMode, listIssues } from "@/lib/store";
import { authEnabled } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Diagnostic endpoint: reports which backend/auth are active and whether the
// database is reachable. Returns booleans only — never secret values. Safe to
// leave in, or remove once setup is confirmed.
export async function GET(): Promise<NextResponse> {
  const env = {
    POSTGRES_URL: !!process.env.POSTGRES_URL,
    DATABASE_URL: !!process.env.DATABASE_URL,
    POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
    BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
    STUDIO_PASSWORD: !!process.env.STUDIO_PASSWORD,
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? null,
  };

  const store: { mode: string; ok: boolean; issues: number; error: string | null } = {
    mode: storeMode,
    ok: false,
    issues: 0,
    error: null,
  };
  try {
    const issues = await listIssues();
    store.ok = true;
    store.issues = issues.length;
  } catch (e) {
    store.error = (e as Error).message;
  }

  return NextResponse.json({
    storeMode,
    authEnabled: authEnabled(),
    env,
    store,
  });
}
