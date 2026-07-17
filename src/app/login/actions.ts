"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, cookieOptions, createSession, verifyPassword } from "@/lib/auth";

function safeNext(next: FormDataEntryValue | null): string {
  const s = typeof next === "string" ? next : "/";
  // Only allow same-site absolute paths (avoid open redirects).
  return s.startsWith("/") && !s.startsWith("//") ? s : "/";
}

export async function loginAction(formData: FormData) {
  const next = safeNext(formData.get("next"));
  if (!verifyPassword(formData.get("password"))) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }
  const jar = await cookies();
  jar.set(COOKIE_NAME, await createSession(), cookieOptions);
  redirect(next);
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  redirect("/login");
}
