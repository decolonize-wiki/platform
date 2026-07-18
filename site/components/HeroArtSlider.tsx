"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ART_COLLECTION, creditLine } from "../lib/art/collection";
import { ART_DIMS } from "../lib/art/manifest";

const CYCLE_MS = 5000;

// Rotating art figure for the homepage hero's right side. The whole figure
// links to the art page; the cycle pauses under prefers-reduced-motion.
// All slides are in the DOM (SSR) — only opacity changes, so no CLS.
export function HeroArtSlider({ lang }: { lang: string }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(
      () => setIdx((i) => (i + 1) % ART_COLLECTION.length),
      CYCLE_MS,
    );
    return () => clearInterval(t);
  }, []);
  const active = ART_COLLECTION[idx];
  return (
    <Link
      href={`/${lang}/art`}
      className="hero-art"
      aria-label="Open the art of resistance collection"
    >
      {ART_COLLECTION.map((e, i) => {
        const d = ART_DIMS[e.id];
        if (!d) return null;
        return (
          <img
            key={e.id}
            src={`/art/${e.id}-640.webp`}
            width={d.w}
            height={d.h}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            className={i === idx ? "on" : undefined}
          />
        );
      })}
      <span className="hero-art-caption mono">
        <span className="hac-credit">{creditLine(active)}</span>
        <span className="hac-cta">View the collection →</span>
      </span>
    </Link>
  );
}
