import { describe, it, expect } from "vitest";
import { loadAllAnalyses, latestFor } from "../site/lib/data.js";

const DIR = "tests/fixtures/data-repo";

describe("loadAllAnalyses", () => {
  it("loads and validates every analysis JSON under analyses/", async () => {
    const all = await loadAllAnalyses(DIR);
    expect(all).toHaveLength(2);
    expect(all[0].article.slug).toBe("testland");
  });

  it("excludes drafts", async () => {
    const all = await loadAllAnalyses(DIR);
    expect(all.every((a) => a.status !== "draft")).toBe(true);
  });
});

describe("latestFor", () => {
  it("returns the highest published sequence for a slug", async () => {
    const all = await loadAllAnalyses(DIR);
    expect(latestFor(all, "en", "testland")?.sequence).toBe(2);
  });
});
