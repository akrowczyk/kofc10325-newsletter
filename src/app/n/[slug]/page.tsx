import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { getGlobals, getIssue, issueTitle } from "@/lib/store";
import { buildEmailHtml } from "@/lib/emailHtml";
import { NewsletterTemplate } from "@/components/NewsletterTemplate";
import { PublicToolbar } from "./PublicToolbar";

async function baseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const issue = await getIssue(slug);
  const globals = await getGlobals();
  if (!issue) return { title: "Newsletter not found" };
  return {
    title: `${globals.councilName} — ${issueTitle(issue)} Newsletter`,
  };
}

export default async function PublicIssue({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [issue, globals] = await Promise.all([getIssue(slug), getGlobals()]);
  if (!issue) notFound();

  const base = await baseUrl();
  const emailHtml = buildEmailHtml(issue, globals, `${base}/n/${issue.slug}`);

  return (
    <div style={{ background: "var(--studio-bg)", minHeight: "100vh" }}>
      <PublicToolbar
        slug={issue.slug}
        status={issue.status}
        exportHref={`/api/issues/${issue.slug}/export`}
        emailHtml={emailHtml}
      />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px 48px" }}>
        <NewsletterTemplate issue={issue} globals={globals} />
      </div>
    </div>
  );
}
