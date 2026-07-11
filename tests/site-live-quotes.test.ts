import { describe, it, expect, vi, afterEach } from "vitest";
import {
  liveQuoteChecks,
  analysisKey,
  type AnalysisLike,
} from "../site/lib/live-quotes.js";

afterEach(() => vi.unstubAllGlobals());

function analysis(over: Partial<AnalysisLike> = {}): AnalysisLike {
  return {
    language: "en",
    sequence: 1,
    article: { title: "Brazil", slug: "brazil", revisionId: 100 },
    flags: [{ id: "flag-a", quote: "a colonial framing example" }],
    ...over,
  };
}

function extractResponse(extract: string) {
  return new Response(
    JSON.stringify({ query: { pages: [{ extract }] } }),
  );
}

describe("liveQuoteChecks", () => {
  it("makes no requests when nothing changed since the pinned revision", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const map = await liveQuoteChecks([analysis()], new Map([["Brazil", 100]]));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(map.size).toBe(0);
  });

  it("makes no requests when the live revision is unknown", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const map = await liveQuoteChecks([analysis()], new Map());
    expect(fetchMock).not.toHaveBeenCalled();
    expect(map.size).toBe(0);
  });

  it("returns an empty missing list when every quote is still present", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        extractResponse("Intro text.\nStill contains a colonial\nframing example here."),
      ),
    );
    const map = await liveQuoteChecks([analysis()], new Map([["Brazil", 101]]));
    expect(map.get("en/brazil/1")).toEqual([]);
  });

  it("lists the flags whose quote no longer appears", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => extractResponse("This text was rewritten entirely.")),
    );
    const a = analysis({
      flags: [
        { id: "flag-a", quote: "a colonial framing example" },
        { id: "flag-b", quote: "text was rewritten" },
      ],
    });
    const map = await liveQuoteChecks([a], new Map([["Brazil", 101]]));
    expect(map.get("en/brazil/1")).toEqual(["flag-a"]);
  });

  it("fetches a changed title once across multiple sequences", async () => {
    const fetchMock = vi.fn(async () =>
      extractResponse("a colonial framing example"),
    );
    vi.stubGlobal("fetch", fetchMock);
    const map = await liveQuoteChecks(
      [analysis(), analysis({ sequence: 2, article: { title: "Brazil", slug: "brazil", revisionId: 90 } })],
      new Map([["Brazil", 101]]),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(map.get("en/brazil/1")).toEqual([]);
    expect(map.get("en/brazil/2")).toEqual([]);
  });

  it("omits analyses whose live text cannot be fetched (site still builds)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 503 })));
    const map = await liveQuoteChecks([analysis()], new Map([["Brazil", 101]]));
    expect(map.size).toBe(0);
  });

  it("omits analyses when the fetch throws (site still builds)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const map = await liveQuoteChecks([analysis()], new Map([["Brazil", 101]]));
    expect(map.size).toBe(0);
  });

  it("skips analyses in other languages", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const map = await liveQuoteChecks(
      [analysis({ language: "pt" })],
      new Map([["Brazil", 101]]),
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(map.size).toBe(0);
  });

  it("requests the live extract in the pinned fetch's text format", async () => {
    let requested = "";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string) => {
        requested = String(input);
        return extractResponse("a colonial framing example");
      }),
    );
    await liveQuoteChecks([analysis()], new Map([["Brazil", 101]]));
    expect(requested).toContain("https://en.wikipedia.org/w/api.php");
    expect(requested).toContain("prop=extracts");
    expect(requested).toContain("explaintext=1");
    expect(requested).toContain("redirects=1");
    expect(requested).toContain("titles=Brazil");
  });
});

describe("analysisKey", () => {
  it("keys by language, slug, and sequence", () => {
    expect(analysisKey(analysis({ sequence: 3 }))).toBe("en/brazil/3");
  });
});
