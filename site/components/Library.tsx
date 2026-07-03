"use client";

import { useState } from "react";
import Link from "next/link";

export type LibraryEntry = {
  title: string;
  slug: string;
  lang: string;
  seq: number;
  flagCount: number;
  categories: string[];
};

export function Library({ entries }: { entries: LibraryEntry[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = q
    ? entries.filter((e) => e.title.toLowerCase().includes(q))
    : entries;

  return (
    <div className="library">
      <input
        className="library-search mono"
        type="search"
        aria-label="Search analyses"
        placeholder="Search analyses"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul className="library-list">
        {shown.map((e) => (
          <li key={`${e.lang}/${e.slug}`}>
            <Link href={`/${e.lang}/${e.slug}`} className="library-row">
              <span className="disp library-title">{e.title}</span>
              <span className="mono library-meta">
                {e.flagCount === 0
                  ? "Clean — 0 flags"
                  : `${e.flagCount} ${e.flagCount === 1 ? "flag" : "flags"} · ${e.categories.join(", ")}`}
              </span>
            </Link>
          </li>
        ))}
        {shown.length === 0 ? (
          <li className="library-empty mono">No analyses match “{query}”.</li>
        ) : null}
      </ul>
    </div>
  );
}
