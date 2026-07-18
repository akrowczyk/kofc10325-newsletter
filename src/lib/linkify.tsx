import React from "react";

// Turn URLs and email addresses inside author-entered text into clickable links.
// Handles full URLs (https://…), www.… , bare domains with a common TLD
// (kofc10325.org, liveaction.org/videos/…), and emails. Only ever produces
// http(s)/mailto hrefs, so there's no script-injection surface.
const LINK_RE =
  /((?:https?:\/\/|www\.)[^\s<]+)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|org|net|edu|gov|io|co|us)(?:\/[^\s<]*)?)/gi;

const TRAILING = /[.,;:!?)]+$/;

export function linkify(text: string): React.ReactNode {
  if (!text) return text;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  LINK_RE.lastIndex = 0;

  while ((m = LINK_RE.exec(text)) !== null) {
    const full = m[0];
    const start = m.index;
    if (start > lastIndex) nodes.push(text.slice(lastIndex, start));

    // Keep any trailing sentence punctuation as plain text, not part of the link.
    let matched = full;
    let trailing = "";
    const t = matched.match(TRAILING);
    if (t) {
      trailing = t[0];
      matched = matched.slice(0, matched.length - trailing.length);
    }

    const isEmail = !!m[2];
    let href: string;
    if (isEmail) href = `mailto:${matched}`;
    else if (/^https?:\/\//i.test(matched)) href = matched;
    else href = `https://${matched}`;

    nodes.push(
      <a
        key={key++}
        href={href}
        {...(isEmail ? {} : { target: "_blank", rel: "noopener noreferrer" })}
      >
        {matched}
      </a>,
    );
    if (trailing) nodes.push(trailing);
    lastIndex = start + full.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  if (nodes.length === 0) return text;
  return nodes.length === 1 ? nodes[0] : nodes;
}
