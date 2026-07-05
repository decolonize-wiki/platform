import { describe, it, expect } from "vitest";
import { splitQuoteForStrike, strikeTokens } from "../site/lib/card-strike.js";
import type { Analysis } from "../src/schema/analysis.js";

type Flag = Analysis["flags"][number];

function flag(overrides: Partial<Flag> = {}): Flag {
  return {
    id: "test-flag-1",
    categoryId: "discovery-framing",
    quote: "the settlers discovered an empty land",
    anchorBefore: "",
    anchorAfter: "",
    explanation: "x".repeat(30),
    rewrite: "the settlers arrived in an inhabited land",
    ...overrides,
  };
}

describe("splitQuoteForStrike", () => {
  it("splits on a term found in the middle of the quote", () => {
    const f = flag({ strike: { term: "discovered", stamp: "arrived at" } });
    expect(splitQuoteForStrike(f)).toEqual({
      kind: "term",
      before: "the settlers ",
      term: "discovered",
      stamp: "arrived at",
      after: " an empty land",
    });
  });

  it("splits on a term at the start of the quote", () => {
    const f = flag({
      quote: "discovered land, later settled",
      strike: { term: "discovered", stamp: "arrived at" },
    });
    expect(splitQuoteForStrike(f)).toEqual({
      kind: "term",
      before: "",
      term: "discovered",
      stamp: "arrived at",
      after: " land, later settled",
    });
  });

  it("splits on a term at the end of the quote", () => {
    const f = flag({
      quote: "the settlers discovered",
      strike: { term: "discovered", stamp: "arrived" },
    });
    expect(splitQuoteForStrike(f)).toEqual({
      kind: "term",
      before: "the settlers ",
      term: "discovered",
      stamp: "arrived",
      after: "",
    });
  });

  it("falls back to whole-quote strike when strike.term is absent from the quote (schema drift)", () => {
    // Bypasses schema validation on purpose — AnalysisSchema.superRefine makes
    // this unreachable for valid data; this is the defensive fallback path.
    const f = flag({ strike: { term: "not in quote", stamp: "x" } });
    expect(splitQuoteForStrike(f)).toEqual({ kind: "whole" });
  });

  it("falls back to whole-quote strike when there is no strike at all", () => {
    const f = flag();
    expect(splitQuoteForStrike(f)).toEqual({ kind: "whole" });
  });
});

describe("strikeTokens", () => {
  it("tokenizes before/term/stamp/after into words with quote marks on the edges", () => {
    expect(
      strikeTokens({
        kind: "term",
        before: "the settlers ",
        term: "discovered",
        stamp: "arrived at",
        after: " an empty land",
      }),
    ).toEqual([
      { text: "“the", kind: "plain" },
      { text: "settlers", kind: "plain" },
      { text: "discovered", kind: "struck" },
      { text: "arrived at", kind: "stamp" },
      { text: "an", kind: "plain" },
      { text: "empty", kind: "plain" },
      { text: "land”", kind: "plain" },
    ]);
  });

  it("extends the strike over punctuation glued to the term", () => {
    expect(
      strikeTokens({
        kind: "term",
        before: "was ",
        term: "first explored",
        stamp: "reached",
        after: ", coming ashore",
      }),
    ).toEqual([
      { text: "“was", kind: "plain" },
      { text: "first", kind: "struck" },
      { text: "explored,", kind: "struck" },
      { text: "reached", kind: "stamp" },
      { text: "coming", kind: "plain" },
      { text: "ashore”", kind: "plain" },
    ]);
  });

  it("handles a term at the start and end of the quote", () => {
    expect(
      strikeTokens({
        kind: "term",
        before: "",
        term: "pacification",
        stamp: "conquest",
        after: "",
      }),
    ).toEqual([
      { text: "“pacification", kind: "struck" },
      { text: "conquest”", kind: "stamp" },
    ]);
  });
});
