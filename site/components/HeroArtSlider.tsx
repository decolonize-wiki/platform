"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ART_COLLECTION, creditLine } from "../lib/art/collection";
import { ART_DIMS } from "../lib/art/manifest";

const CYCLE_MS = 5000;

// Rotating art deck for the homepage hero's right side. Each piece sits on a
// uniform paper mat (so differing poster shapes don't resize the figure), and
// the NEXT card peeks out behind the active one under a gradient veil — the
// stack reads as "there's more here". The whole figure links to the art page.
// Rotation pauses on hover/focus and under prefers-reduced-motion. All slides
// are in the DOM (SSR) — only opacity/transform change, so no CLS.
export function HeroArtSlider({ lang }: { lang: string }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(
      () => setIdx((i) => (i + 1) % ART_COLLECTION.length),
      CYCLE_MS,
    );
    return () => clearInterval(t);
  }, [paused]);
  const n = ART_COLLECTION.length;
  const active = ART_COLLECTION[idx];
  return (
    <Link
      href={`/${lang}/art`}
      className="hero-art"
      aria-label="Open the art of resistance collection"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {ART_COLLECTION.map((e, i) => {
        const d = ART_DIMS[e.id];
        if (!d) return null;
        const state = i === idx ? " on" : i === (idx + 1) % n ? " next" : "";
        return (
          <span key={e.id} className={`ha-card${state}`}>
            <img
              src={`/art/${e.id}-640.webp`}
              width={d.w}
              height={d.h}
              alt=""
              loading="lazy"
              // Behind the first-visit splash overlay this must not compete
              // with the splash's own assets; when visible it's a small webp.
              fetchPriority={i === 0 ? "low" : undefined}
              decoding="async"
            />
          </span>
        );
      })}
      <span className="hero-art-caption mono">
        <span className="hac-credit">{creditLine(active)}</span>
        <span className="hac-cta">View the collection →</span>
      </span>
    </Link>
  );
}
