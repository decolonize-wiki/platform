import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { ArtFigure } from "../site/components/ArtFigure.js";

describe("ArtFigure", () => {
  const html = renderToStaticMarkup(h(ArtFigure, { id: "free-huey-1968" }));

  it("renders a lazy responsive img with explicit dimensions", () => {
    expect(html).toContain('src="/art/free-huey-1968-640.webp"');
    expect(html).toContain("/art/free-huey-1968-640.webp 640w");
    expect(html).toContain("/art/free-huey-1968-1280.webp 1280w");
    expect(html).toContain('loading="lazy"');
    expect(html).toMatch(/width="\d+"/);
    expect(html).toMatch(/height="\d+"/);
  });

  it("carries alt text and the credit line", () => {
    expect(html).toMatch(/alt="[^"]{20,}"/);
    expect(html).toContain("NMAAHC 2019.28.20");
    expect(html).toContain("CC0");
  });

  it("throws on an unknown id (typo surfaces at build, not silently)", () => {
    expect(() => renderToStaticMarkup(h(ArtFigure, { id: "nope" }))).toThrow();
  });
});
