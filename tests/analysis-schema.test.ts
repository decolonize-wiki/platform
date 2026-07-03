import { describe, it, expect } from "vitest";
import { AnalysisSchema, CATEGORY_IDS } from "../src/schema/analysis.js";

const valid = {
  schemaVersion: 1,
  language: "en",
  article: {
    title: "Brazil",
    slug: "brazil",
    revisionId: 1184020000,
    fetchedAt: "2026-07-03T12:00:00Z",
    url: "https://en.wikipedia.org/wiki/Brazil",
  },
  methodologyVersion: "v0.1",
  sequence: 1,
  model: "claude (claude code session)",
  status: "published",
  summary: {
    paragraph:
      "The article uses discovery framing in its opening history section.",
    flagCounts: { "discovery-framing": 1 },
  },
  flags: [
    {
      id: "brazil-1-discovery-framing-1",
      categoryId: "discovery-framing",
      quote: "Brazil was discovered by Pedro Álvares Cabral in 1500",
      anchorBefore: "colonial era began when",
      anchorAfter: "who claimed the area",
      explanation:
        "Framing an inhabited territory as discovered erases the millions already living there.",
      rewrite: "Pedro Álvares Cabral reached Brazil in 1500",
    },
  ],
  contextFacts: [],
};

describe("AnalysisSchema", () => {
  it("accepts a zero-flag analysis (a clean article is a publishable finding)", () => {
    const clean = {
      ...valid,
      summary: { ...valid.summary, flagCounts: {} },
      flags: [],
    };
    expect(AnalysisSchema.safeParse(clean).success).toBe(true);
  });

  it("still rejects zero flags with non-empty flagCounts", () => {
    const mismatched = { ...valid, flags: [] };
    expect(AnalysisSchema.safeParse(mismatched).success).toBe(false);
  });

  it("accepts a valid analysis", () => {
    expect(AnalysisSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an unknown category id", () => {
    const bad = structuredClone(valid) as any;
    bad.flags[0].categoryId = "vibes";
    expect(AnalysisSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a summary flagCount for a category with no flags", () => {
    const bad = structuredClone(valid) as any;
    bad.summary.flagCounts = { euphemism: 1 };
    expect(AnalysisSchema.safeParse(bad).success).toBe(false);
  });

  it("exposes the six v0.1 category ids", () => {
    expect(CATEGORY_IDS).toHaveLength(6);
  });
});
