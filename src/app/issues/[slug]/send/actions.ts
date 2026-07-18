"use server";

import { headers } from "next/headers";
import { getGlobals, getIssue, issueTitle } from "@/lib/store";
import { emailConfigured, sendNotification } from "@/lib/sendMail";

async function baseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export interface SendActionResult {
  ok: boolean;
  sent: number;
  failed: number;
  message: string;
  errors: string[];
}

export async function sendNotificationAction(
  slug: string,
  subject: string,
  bodyText: string,
): Promise<SendActionResult> {
  const fail = (message: string): SendActionResult => ({
    ok: false,
    sent: 0,
    failed: 0,
    message,
    errors: [],
  });

  if (!emailConfigured()) {
    return fail("Email isn't set up yet (RESEND_API_KEY is missing in the environment).");
  }
  const [issue, globals] = await Promise.all([getIssue(slug), getGlobals()]);
  if (!issue) return fail("Issue not found.");
  if (!globals.emailSettings.fromEmail) {
    return fail("Set a verified 'From' address in Council settings before sending.");
  }
  if (globals.distributionList.length === 0) {
    return fail("There are no members on the distribution list yet (add them in Council settings).");
  }
  if (!subject.trim() || !bodyText.trim()) {
    return fail("Both a subject and a message are required.");
  }

  const link = `${await baseUrl()}/n/${issue.slug}`;
  const res = await sendNotification({
    globals,
    monthYear: issueTitle(issue),
    subject: subject.trim(),
    bodyText,
    link,
    recipients: globals.distributionList,
  });

  const message =
    res.failed > 0
      ? `${res.sent} sent, ${res.failed} failed. ${res.errors[0] ?? ""}`.trim()
      : `Sent to ${res.sent} member${res.sent === 1 ? "" : "s"}.`;
  return { ok: res.failed === 0, sent: res.sent, failed: res.failed, message, errors: res.errors };
}
