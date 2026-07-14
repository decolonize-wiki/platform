"use client";
import { useEffect, useState } from "react";
import type { HeroFlag } from "../../lib/hero-flags";
import { hasSeenSplash, markSplashSeen } from "../../lib/hero/splash-seen";
import { hasWebGL, prefersReducedMotion } from "../../lib/hero/capabilities";
import { RedactionSplash } from "./RedactionSplash";

export function SplashGate({ flags, onEntered }: { flags: HeroFlag[]; onEntered: () => void }) {
  // Default-hidden; reveal only for first-time, capable visitors (post-hydration).
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!hasSeenSplash() && !prefersReducedMotion() && hasWebGL() && flags.length) {
      setShow(true);
    } else {
      onEntered(); // no splash → mount content immediately
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!show) return null;
  const dismiss = () => { markSplashSeen(); setShow(false); onEntered(); };
  return <RedactionSplash flags={flags} onDismiss={dismiss} />;
}
