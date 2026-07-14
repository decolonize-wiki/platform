import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DeferredMount } from "../site/components/hero/DeferredMount.js";
import { createElement as h } from "react";

describe("DeferredMount", () => {
  it("renders nothing until `when` is true", () => {
    const html = renderToStaticMarkup(
      h(DeferredMount, { when: false, children: h("p", null, "atlas") }),
    );
    expect(html).toBe("");
  });
  it("renders children when `when` is true", () => {
    const html = renderToStaticMarkup(
      h(DeferredMount, { when: true, children: h("p", null, "atlas") }),
    );
    expect(html).toContain("atlas");
  });
});
