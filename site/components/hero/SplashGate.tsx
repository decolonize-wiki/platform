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
    // `?splash` on the URL forces the splash regardless of the show-once flag —
    // a dev aid for iterating on the hero without clearing localStorage each time.
    // Production stays first-visit-only for anyone who doesn't add the param.
    const forced = new URLSearchParams(location.search).has("splash");
    if ((forced || !hasSeenSplash()) && !prefersReducedMotion() && hasWebGL() && flags.length) {
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
