"use client";

import { useState } from "react";
import Link from "next/link";

const btnBase: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  padding: "7px 12px",
  borderRadius: 8,
  border: "1px solid var(--studio-border)",
  background: "#fff",
  color: "var(--studio-ink)",
  cursor: "pointer",
  textDecoration: "none",
  whiteSpace: "nowrap",
};

// A slim toolbar above the published newsletter. Hidden when printing, so
// "Save as PDF" produces a clean sheet with no app chrome.
//
// Readers see only "Save as PDF". The author (signed in) also sees Edit, the
// email/HTML export tools, a back-to-Studio link, and a draft badge.
export function PublicToolbar({
  slug,
  status,
  exportHref,
  emailHtml,
  isAuthor,
  websiteUrl,
}: {
  slug: string;
  status: "draft" | "published";
  exportHref: string;
  emailHtml: string;
  isAuthor: boolean;
  websiteUrl: string;
}) {
  const siteDomain = websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <>
      <style>{`@media print { .nl-toolbar { display: none !important; } body { background: #fff !important; } }`}</style>
      <div
        className="nl-toolbar"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "10px 16px",
          background: "#fff",
          borderBottom: "1px solid var(--studio-border)",
          flexWrap: "wrap",
        }}
      >
        {isAuthor ? (
          <Link href="/" style={{ fontSize: 13, fontWeight: 600, color: "var(--studio-navy)" }}>
            ← Studio
          </Link>
        ) : (
          <a
            href={websiteUrl}
            style={{ fontSize: 13, fontWeight: 600, color: "var(--studio-navy)" }}
          >
            ← Back to {siteDomain}
          </a>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {isAuthor && status === "draft" ? (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                color: "#92400e",
                background: "#fef3c7",
                padding: "3px 8px",
                borderRadius: 999,
              }}
            >
              Draft preview
            </span>
          ) : null}
          {isAuthor ? (
            <>
              <Link href={`/issues/${slug}/edit`} style={btnBase}>
                Edit
              </Link>
              <CopyButton label="Copy email HTML" text={emailHtml} />
              <a href={exportHref} style={btnBase}>
                Download .html
              </a>
            </>
          ) : null}
          <button
            type="button"
            onClick={() => window.print()}
            style={{ ...btnBase, background: "var(--studio-navy)", color: "#fff", border: "none", fontWeight: 700 }}
          >
            Save as PDF
          </button>
        </div>
      </div>
    </>
  );
}

function CopyButton({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — fall back to a temporary textarea selection.
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }
  return (
    <button type="button" onClick={copy} style={btnBase}>
      {copied ? "✓ Copied" : label}
    </button>
  );
}
