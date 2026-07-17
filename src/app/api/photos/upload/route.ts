import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { authEnabled, verifySession, COOKIE_NAME } from "@/lib/auth";

function cookieValue(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

// Client-upload token endpoint for Vercel Blob. The editor uploads photos
// directly to Blob storage; this route only mints short-lived upload tokens and
// receives Blob's completion callback. It is NOT behind the auth middleware (a
// redirect would break the SDK); instead we verify the author's session here,
// during token generation. The completion callback (a different phase, no
// cookie) is verified by Blob's own request signature.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  // Gate the token-minting phase to the signed-in author. The completion
  // callback ("blob.upload-completed") carries no cookie and is verified by
  // Blob's own request signature inside handleUpload, so let it through.
  if (authEnabled() && body.type === "blob.generate-client-token") {
    const token = cookieValue(request.headers.get("cookie"), COOKIE_NAME);
    if (!(await verifySession(token))) {
      return NextResponse.json({ error: "Not authorized to upload" }, { status: 401 });
    }
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          maximumSizeInBytes: 15 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // No-op: the returned URL is stored on the issue when the editor saves.
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
