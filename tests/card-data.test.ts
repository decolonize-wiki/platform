import { describe, it, expect } from "vitest";
import { loadAllAnalyses } from "../site/lib/data.js";
import { findAnalysis, findFlag, flagCardParams } from "../site/lib/card-data.js";

const DIR = "tests/fixtures/data-repo";

describe("findAnalysis", () => {
  it("matches on lang+slug+seq", async () => {
    const all = await loadAllAnalyses(DIR);
    const found = findAnalysis(all, { lang: "en", slug: "testland", seq: "2" });
    expect(found?.sequence).toBe(2);
  });

  it("returns undefined on miss", async () => {
    const all = await loadAllAnalyses(DIR);
    expect(
      findAnalysis(all, { lang: "en", slug: "testland", seq: "999" }),
    ).toBeUndefined();
    expect(
      findAnalysis(all, { lang: "en", slug: "no-such-slug", seq: "2" }),
    ).toBeUndefined();
  });
});

describe("findFlag", () => {
  it("returns the flag by id", async () => {
    const all = await loadAllAnalyses(DIR);
    const analysis = findAnalysis(all, { lang: "en", slug: "testland", seq: "2" })!;
    const flag = findFlag(analysis, "brazil-1-euphemism-1");
    expect(flag?.categoryId).toBe("euphemism");
  });

  it("returns undefined on miss", async () => {
    const all = await loadAllAnalyses(DIR);
    const analysis = findAnalysis(all, { lang: "en", slug: "testland", seq: "2" })!;
    expect(findFlag(analysis, "no-such-flag")).toBeUndefined();
  });
});

describe("flagCardParams", () => {
  it("returns one {lang,slug,seq,flagId} per flag across analyses", async () => {
    const all = await loadAllAnalyses(DIR);
    const totalFlags = all.reduce((n, a) => n + a.flags.length, 0);
    const params = flagCardParams(all);
    expect(params).toHaveLength(totalFlags);
    for (const a of all) {
      for (const f of a.flags) {
        expect(params).toContainEqual({
          lang: a.language,
          slug: a.article.slug,
          seq: String(a.sequence),
          flagId: f.id,
        });
      }
    }
  });
});
