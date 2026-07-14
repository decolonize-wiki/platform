import { describe, it, expect } from "vitest";
import { heroFlags } from "../site/lib/hero-flags.js";
import type { Analysis } from "../src/schema/analysis.js";

const a = (over: Record<string, unknown>): Analysis =>
  ({
    language: "en",
    status: "published",
    sequence: 1,
    methodologyVersion: "v0.2",
    revisionId: 1,
    article: { title: "Brazil", slug: "brazil" },
    flags: [],
    ...over,
  }) as unknown as Analysis;

const flag = (quote: string, rewrite = "fixed", categoryId = "euphemism") =>
  ({ id: quote, categoryId, quote, rewrite }) as Analysis["flags"][number];

describe("heroFlags", () => {
  it("keeps only published English flags, flattened with article + category", () => {
    const input = [
      a({ article: { title: "Brazil", slug: "brazil" }, flags: [flag("virgin forest")] }),
      a({ status: "draft", flags: [flag("should be dropped")] }),
      a({ language: "pt", flags: [flag("nao ingles")] }),
    ];
    const out = heroFlags(input);
    expect(out).toEqual([
      { quote: "virgin forest", rewrite: "fixed", category: "euphemism", article: "Brazil" },
    ]);
  });

  it("drops flags missing a quote or rewrite", () => {
    const input = [a({ flags: [flag("has both"), { id: "x", categoryId: "euphemism", quote: "no rewrite" } as Analysis["flags"][number]] })];
    expect(heroFlags(input).map((f) => f.quote)).toEqual(["has both"]);
  });

  it("is deterministic and capped by limit", () => {
    const input = [a({ flags: [flag("b"), flag("a"), flag("c")] })];
    const out = heroFlags(input, 2);
    expect(out.map((f) => f.quote)).toEqual(["a", "b"]); // sorted, capped
  });
});
