import { describe, it, expect, vi, afterEach } from "vitest";
import { prefersReducedMotion, isSmallScreen, hasWebGL } from "../site/lib/hero/capabilities.js";

afterEach(() => vi.unstubAllGlobals());

describe("capabilities", () => {
  it("reads prefers-reduced-motion via matchMedia", () => {
    vi.stubGlobal("matchMedia", (q: string) => ({ matches: q.includes("reduced-motion") }));
    expect(prefersReducedMotion()).toBe(true);
    expect(isSmallScreen()).toBe(false);
  });

  it("hasWebGL is false when getContext throws", () => {
    vi.stubGlobal("document", {
      createElement: () => ({ getContext: () => { throw new Error("no gl"); } }),
    });
    expect(hasWebGL()).toBe(false);
  });

  it("hasWebGL is true when a context is returned", () => {
    vi.stubGlobal("document", { createElement: () => ({ getContext: () => ({}) }) });
    expect(hasWebGL()).toBe(true);
  });
});
