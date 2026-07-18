import "server-only";
import { Resend } from "resend";
import { buildNotificationEmail } from "./notificationEmail";
import type { Globals, Recipient } from "./types";

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export interface SendResult {
  sent: number;
  failed: number;
  errors: string[];
}

/**
 * Send the notification to each member individually (privacy — no shared To/CC),
 * using Resend's batch endpoint in chunks. The same branded HTML goes to all.
 */
export async function sendNotification(opts: {
  globals: Globals;
  monthYear: string;
  subject: string;
  bodyText: string;
  link: string;
  recipients: Recipient[];
}): Promise<SendResult> {
  const { globals, monthYear, subject, bodyText, link, recipients } = opts;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = `${globals.emailSettings.fromName} <${globals.emailSettings.fromEmail}>`;
  const replyTo = globals.emailSettings.replyTo || undefined;
  const html = buildNotificationEmail({ globals, monthYear, bodyText, link });

  const result: SendResult = { sent: 0, failed: 0, errors: [] };

  for (const group of chunk(recipients, 100)) {
    const payload = group.map((r) => ({
      from,
      to: [r.email],
      subject,
      html,
      replyTo,
    }));
    try {
      const res = await resend.batch.send(payload);
      if (res.error) {
        result.failed += group.length;
        result.errors.push(res.error.message);
      } else {
        result.sent += group.length;
      }
    } catch (e) {
      result.failed += group.length;
      result.errors.push((e as Error).message);
    }
  }

  return result;
}
