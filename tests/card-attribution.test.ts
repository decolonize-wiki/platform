import { describe, it, expect } from "vitest";
import { buildAttribution } from "../site/lib/card-attribution.js";

describe("buildAttribution", () => {
  it("produces the exact expected string for each medium", () => {
    for (const medium of ["og", "post", "story", "square"] as const) {
      expect(
        buildAttribution({
          title: "Testland",
          lang: "en",
          slug: "testland",
          seq: 2,
          medium,
        }),
      ).toBe(
        `Testland · text: Wikipedia, CC BY-SA · decolonize.wiki/en/testland/2?utm_source=card&utm_medium=${medium}`,
      );
    }
  });

  it("matches the pre-refactor verdict-card string for medium 'og' (regression lock)", () => {
    const title = "Testland";
    const lang = "en";
    const slug = "testland";
    const seq = "2";
    const expected = `${title} · text: Wikipedia, CC BY-SA · decolonize.wiki/${lang}/${slug}/${seq}?utm_source=card&utm_medium=og`;
    expect(buildAttribution({ title, lang, slug, seq, medium: "og" })).toBe(
      expected,
    );
  });
});
