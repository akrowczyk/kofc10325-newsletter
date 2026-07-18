import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getGlobals, getIssue, issueTitle } from "@/lib/store";
import { renderTemplate } from "@/lib/storeCore";
import { emailConfigured } from "@/lib/sendMail";
import { MONTH_NAMES } from "@/lib/types";
import { SiteHeader } from "@/components/SiteHeader";
import { SendClient } from "./SendClient";

export const dynamic = "force-dynamic";

async function baseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function SendPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [issue, globals] = await Promise.all([getIssue(slug), getGlobals()]);
  if (!issue) notFound();

  const link = `${await baseUrl()}/n/${issue.slug}`;
  const vars = {
    councilName: globals.councilName,
    month: MONTH_NAMES[issue.month - 1],
    year: issue.year,
    link,
  };
  const es = globals.emailSettings;

  const blockers: string[] = [];
  if (issue.status !== "published")
    blockers.push("This issue is still a draft — publish it first so members can open the link.");
  if (!emailConfigured())
    blockers.push("The email service isn't connected yet (RESEND_API_KEY is missing).");
  if (!es.fromEmail)
    blockers.push("No verified 'From' address is set in Council settings.");
  if (globals.distributionList.length === 0)
    blockers.push("The distribution list is empty — add members in Council settings.");

  return (
    <>
      <SiteHeader />
      <SendClient
        slug={issue.slug}
        monthYear={issueTitle(issue)}
        status={issue.status}
        recipientCount={globals.distributionList.length}
        fromLine={es.fromEmail ? `${es.fromName} <${es.fromEmail}>` : es.fromName}
        publicUrl={link}
        defaultSubject={renderTemplate(es.subjectTemplate, vars)}
        defaultBody={renderTemplate(es.bodyTemplate, vars)}
        blockers={blockers}
      />
    </>
  );
}
