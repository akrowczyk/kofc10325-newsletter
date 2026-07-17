import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, authEnabled, verifySession } from "@/lib/auth";

// Gate the editor when auth is configured. Published pages (/n/**), the export
// route, /login and static assets stay public. (Next 16 "proxy" convention,
// formerly "middleware".)
export async function proxy(req: NextRequest) {
  if (!authEnabled()) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (await verifySession(token)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/", "/issues/:path*", "/api/photos/:path*"],
};
