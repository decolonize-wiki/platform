"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { RedactionWall } from "./RedactionWall";
import type { HeroFlag } from "../../lib/hero-flags";

const APPEAR_MS = 3000;      // "Enter" button appears
const AUTO_MS = 9000;        // auto-enter if no interaction
const CYCLE_MS = 4200;       // per featured quote (read + rewrite)
const LEAVE_MS = 500;        // crossfade-out duration on dismiss
const SCROLL_INTENT = 60;    // px of deliberate scroll before dismissing

export function RedactionSplash({ flags, onDismiss }: { flags: HeroFlag[]; onDismiss: () => void }) {
  const [ready, setReady] = useState(false);       // wall's first frame painted
  const [showEnter, setShowEnter] = useState(false);
  const [leaving, setLeaving] = useState(false);   // crossfade in progress
  const [idx, setIdx] = useState(0);
  const dismissed = useRef(false);
  const enterRef = useRef<HTMLButtonElement>(null);
  const featured = flags[idx % Math.max(1, flags.length)];
  const handleReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const dismiss = () => {
      if (dismissed.current) return;
      dismissed.current = true;
      setLeaving(true);                 // fade the splash out over the (matching) hero...
      setTimeout(onDismiss, LEAVE_MS);  // ...then unmount → reads as continuity, not a cut
    };
    const tEnter = setTimeout(() => setShowEnter(true), APPEAR_MS);
    const tAuto = setTimeout(dismiss, AUTO_MS);
    const cycle = setInterval(() => setIdx((i) => i + 1), CYCLE_MS);

    // Dismiss on deliberate scroll only — a stray touch nudge must NOT fire it.
    let acc = 0;
    const onWheel = (e: WheelEvent) => { acc += Math.abs(e.deltaY); if (acc > SCROLL_INTENT) dismiss(); };
    let ty = 0;
    const onTouchStart = (e: TouchEvent) => { ty = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => { if (Math.abs(e.touches[0].clientY - ty) > SCROLL_INTENT) dismiss(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" || e.key === "Enter") dismiss(); };
    addEventListener("wheel", onWheel, { passive: true });
    addEventListener("touchstart", onTouchStart, { passive: true });
    addEventListener("touchmove", onTouchMove, { passive: true });
    addEventListener("keydown", onKey);
    return () => {
      clearTimeout(tEnter); clearTimeout(tAuto); clearInterval(cycle);
      removeEventListener("wheel", onWheel); removeEventListener("touchstart", onTouchStart);
      removeEventListener("touchmove", onTouchMove); removeEventListener("keydown", onKey);
    };
  }, [onDismiss]);

  // Basic dialog focus handling: move focus to Enter when it appears.
  useEffect(() => { if (showEnter) enterRef.current?.focus(); }, [showEnter]);

  const enter = () => {
    if (dismissed.current) return;
    dismissed.current = true;
    setLeaving(true);
    setTimeout(onDismiss, LEAVE_MS);
  };

  return (
    <div className={`splash${leaving ? " leaving" : ""}`} role="dialog" aria-modal="true" aria-label="Intro">
      <div className="splash-bg"><RedactionWall flags={flags} onReady={handleReady} /></div>
      <div className="splash-vignette" aria-hidden="true" />
      {!ready && (
        <div className="splash-loader" aria-hidden="true">
          <span className="mono">Decolonizing the record…</span>
          <span className="splash-bar" />
        </div>
      )}
      <div className="splash-body">
        <div className="splash-eyebrow mono">Read line by line · every quote verbatim</div>
        <h1 className="disp splash-h1">Discovered<span className="splash-q">?</span></h1>
        <div className="splash-featured">
          <span className="sf-strike">{featured?.quote}</span>
          <span className="sf-rewrite">→ {featured?.rewrite}</span>
        </div>
        <button ref={enterRef} className={`cta splash-enter${showEnter ? " on" : ""}`} onClick={enter}>
          Enter the archive →
        </button>
      </div>
    </div>
  );
}
