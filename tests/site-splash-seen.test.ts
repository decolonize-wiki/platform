import { describe, it, expect, vi, afterEach } from "vitest";
import { hasSeenSplash, markSplashSeen } from "../site/lib/hero/splash-seen.js";

afterEach(() => vi.unstubAllGlobals());

describe("splash-seen", () => {
  it("round-trips through localStorage", () => {
    const store: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
    });
    expect(hasSeenSplash()).toBe(false);
    markSplashSeen();
    expect(hasSeenSplash()).toBe(true);
  });

  it("degrades to false when localStorage throws", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("blocked"); },
    });
    expect(hasSeenSplash()).toBe(false);
    expect(() => markSplashSeen()).not.toThrow();
  });
});
