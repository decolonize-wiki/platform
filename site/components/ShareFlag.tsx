"use client";

import { useRef, useState } from "react";

type Format = { label: string; suffix: string; fmt: string };

const FORMATS: Format[] = [
  { label: "Post", suffix: "", fmt: "post" },
  { label: "Story", suffix: "/story", fmt: "story" },
  { label: "Square", suffix: "/square", fmt: "square" },
];

export function ShareFlag({
  lang,
  slug,
  seq,
  flagId,
  articleSlug,
}: {
  lang: string;
  slug: string;
  seq: string;
  flagId: string;
  articleSlug: string;
}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const base = `/${lang}/${slug}/${seq}/card/${flagId}`;

  async function onCopy() {
    const url = `${location.origin}/${lang}/${slug}/${seq}#${flagId}`;
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        return;
      }
    } else {
      return;
    }
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <span className="share" role="group" aria-label="Share this flag">
      {FORMATS.map((f) => (
        <a
          key={f.fmt}
          href={base + f.suffix}
          download={`decolonize-${articleSlug}-${seq}-${flagId}-${f.fmt}.png`}
        >
          {f.label}
        </a>
      ))}
      <button type="button" onClick={onCopy}>
        {copied ? "Copied" : "Copy link"}
      </button>
      <span role="status" className="visually-hidden">
        {copied ? "Link copied" : ""}
      </span>
    </span>
  );
}
