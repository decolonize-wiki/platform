"use client";
import { useEffect, useState } from "react";
import { LAB_FLAGS } from "../../lib/lab-flags";

// Concept 2 draft — "Ink Bleed / Palimpsest".
// A page of the encyclopedia rewritten in real time: a real colonial phrase set
// in serif on cream paper, red wet ink bleeds across and strikes it, then it
// crossfades to the correction. Wet edge = SVG turbulence displacement (cheap,
// reliable) rather than a fluid sim. Cycles through the real flags.

type Phase = "reading" | "bleeding" | "rewritten";

export function InkBleed() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("reading");
  const flag = LAB_FLAGS[idx % LAB_FLAGS.length];

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPhase("rewritten");
      return;
    }
    setPhase("reading");
    const t1 = setTimeout(() => setPhase("bleeding"), 1100);
    const t2 = setTimeout(() => setPhase("rewritten"), 1900);
    const t3 = setTimeout(() => setIdx((i) => i + 1), 4200);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [idx]);

  return (
    <div className="ink-stage">
      {/* Wet-ink filter: turbulence + displacement gives the red a bled edge. */}
      <svg width="0" height="0" aria-hidden="true">
        <defs>
          <filter id="wetink">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.018"
              numOctaves={2}
              seed={idx}
              result="n"
            />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="18" />
          </filter>
        </defs>
      </svg>

      <header className="ink-mast">
        <span className="mono">The archive · rewriting the record</span>
        <span className="mono">
          {flag.article} · {flag.category}
        </span>
      </header>

      <div className="ink-plate">
        <div className={`ink-line phase-${phase}`} key={idx}>
          <span className="ink-quote">{flag.quote}</span>
          <span className="ink-ink" style={{ filter: "url(#wetink)" }} />
          <span className="ink-strike" />
        </div>
        <div className={`ink-correction phase-${phase}`}>
          <span className="ink-arrow">→</span> {flag.rewrite}
        </div>
      </div>

      <div className="ink-foot mono">Every quote verbatim · pinned revisions</div>
    </div>
  );
}
