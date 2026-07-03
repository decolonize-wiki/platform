import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchArticle } from "../src/lib/wikipedia.js";

afterEach(() => vi.unstubAllGlobals());

function stubFetch(payload: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 })),
  );
}

describe("fetchArticle", () => {
  it("returns title, revisionId, and plain-text extract", async () => {
    stubFetch({
      query: {
        pages: [
          {
            title: "Brazil",
            extract: "Brazil is a country in South America.",
            revisions: [{ revid: 1184020000 }],
          },
        ],
      },
    });
    const a = await fetchArticle("Brazil");
    expect(a).toEqual({
      title: "Brazil",
      revisionId: 1184020000,
      extract: "Brazil is a country in South America.",
      url: "https://en.wikipedia.org/wiki/Brazil",
    });
  });

  it("throws a clear error for a missing page", async () => {
    stubFetch({ query: { pages: [{ title: "Xyzzy", missing: true }] } });
    await expect(fetchArticle("Xyzzy")).rejects.toThrow(/not found/i);
  });
});
