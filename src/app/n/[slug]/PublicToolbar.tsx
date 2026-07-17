"use client";

import Link from "next/link";

// A slim toolbar above the published newsletter. Hidden when printing, so
// "Save as PDF" produces a clean sheet with no app chrome.
export function PublicToolbar({
  slug,
  status,
}: {
  slug: string;
  status: "draft" | "published";
}) {
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
        <Link
          href="/"
          style={{ fontSize: 13, fontWeight: 600, color: "var(--studio-navy)" }}
        >
          ← Studio
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {status === "draft" ? (
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
          <Link
            href={`/issues/${slug}/edit`}
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--studio-ink)",
              border: "1px solid var(--studio-border)",
              padding: "7px 12px",
              borderRadius: 8,
            }}
          >
            Edit
          </Link>
          <PrintButton />
        </div>
      </div>
    </>
  );
}

function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: "#fff",
        background: "var(--studio-navy)",
        padding: "8px 14px",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
      }}
    >
      Save as PDF
    </button>
  );
}
