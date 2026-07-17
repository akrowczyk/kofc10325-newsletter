import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getGlobals, getIssue, issueTitle } from "@/lib/store";
import { NewsletterTemplate } from "@/components/NewsletterTemplate";
import { PublicToolbar } from "./PublicToolbar";

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

  return (
    <div style={{ background: "var(--studio-bg)", minHeight: "100vh" }}>
      <PublicToolbar slug={issue.slug} status={issue.status} />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px 48px" }}>
        <NewsletterTemplate issue={issue} globals={globals} />
      </div>
    </div>
  );
}
