import Link from "next/link";

// Mirrors the top navigation bar on kofc10325.org: the Knights of Columbus
// wordmark on navy with a gold rule beneath, so the studio reads as part of the
// same site.
export function SiteHeader() {
  return (
    <header
      style={{
        background: "var(--studio-navy)",
        borderBottom: "3px solid var(--studio-gold-bright, #f7b718)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "12px clamp(16px, 4vw, 40px)",
        }}
      >
        <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/header_logo.svg"
            alt="Knights of Columbus"
            style={{ height: 42, width: "auto", display: "block" }}
          />
        </Link>
        <span
          aria-hidden
          style={{ width: 1, height: 28, background: "rgba(255,255,255,0.25)" }}
        />
        <span
          style={{
            fontFamily: "var(--font-label)",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: "#cdd6ea",
          }}
        >
          Council #10325 · Wood Dale, IL
        </span>
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontFamily: "var(--font-label)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: "var(--studio-gold-bright, #f7b718)",
          }}
        >
          Newsletter Studio
        </span>
      </div>
    </header>
  );
}
