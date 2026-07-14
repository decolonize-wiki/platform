"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function DeferredMount({ when, children }: { when: boolean; children: ReactNode }) {
  const [mounted, setMounted] = useState(when);
  const once = useRef(when);
  useEffect(() => {
    if (when && !once.current) { once.current = true; setMounted(true); }
  }, [when]);
  return mounted ? <>{children}</> : null;
}
