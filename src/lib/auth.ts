// Lightweight single-author auth: an HMAC-signed session cookie.
//
// Enabled only when STUDIO_PASSWORD is set. Locally (no password) the studio is
// open so development stays frictionless; in production, set STUDIO_PASSWORD to
// gate the editor. Uses Web Crypto so it runs in both edge middleware and Node.

export const COOKIE_NAME = "studio_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export function authEnabled(): boolean {
  return !!process.env.STUDIO_PASSWORD;
}

function signingSecret(): string {
  // AUTH_SECRET is preferred; fall back to the password so only one env var is
  // strictly required to turn auth on.
  return process.env.AUTH_SECRET || process.env.STUDIO_PASSWORD || "dev-secret";
}

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const b = btoa(String.fromCharCode(...arr));
  return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(signingSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return b64url(sig);
}

/** Create a fresh signed session token. */
export async function createSession(): Promise<string> {
  const payload = b64url(enc.encode(JSON.stringify({ iat: Date.now() })));
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

/** Verify a session token's signature and age. */
export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmac(payload);
  if (!timingSafeEqual(sig, expected)) return false;
  try {
    const { iat } = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof iat !== "number") return false;
    return Date.now() - iat < MAX_AGE_SECONDS * 1000;
  } catch {
    return false;
  }
}

/** Constant-time-ish comparison of the submitted password to STUDIO_PASSWORD. */
export function verifyPassword(input: FormDataEntryValue | null): boolean {
  const expected = process.env.STUDIO_PASSWORD;
  if (!expected || typeof input !== "string") return false;
  return timingSafeEqual(input, expected);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
