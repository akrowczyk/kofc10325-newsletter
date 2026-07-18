import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { authEnabled, verifySession, COOKIE_NAME } from "@/lib/auth";

export const runtime = "nodejs";

function cookieValue(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

// Simple server-side photo upload: the editor POSTs the (already downsized)
// image bytes and we hand them to Vercel Blob. No client tokens or completion
// callbacks — that flow was hanging behind the auth gate. Requires
// BLOB_READ_WRITE_TOKEN (auto-injected when a Blob store is attached).
export async function POST(request: Request): Promise<NextResponse> {
  if (authEnabled()) {
    const token = cookieValue(request.headers.get("cookie"), COOKIE_NAME);
    if (!(await verifySession(token))) {
      return NextResponse.json({ error: "Not authorized to upload" }, { status: 401 });
    }
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Photo storage isn't configured (BLOB_READ_WRITE_TOKEN missing)." },
      { status: 400 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const filename = (searchParams.get("filename") || "photo.jpg").replace(/[^\w.-]/g, "_");
    const blob = await request.blob();
    if (blob.size === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }

    const result = await put(filename, blob, {
      access: "public",
      addRandomSuffix: true,
      contentType: blob.type || "image/jpeg",
    });
    return NextResponse.json({ url: result.url });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
