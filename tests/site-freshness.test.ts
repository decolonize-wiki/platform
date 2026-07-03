import { describe, it, expect, vi, afterEach } from "vitest";
import { liveRevisionIds } from "../site/lib/freshness.js";

afterEach(() => vi.unstubAllGlobals());

describe("liveRevisionIds", () => {
  it("maps titles to live revision ids", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            query: { pages: [{ title: "Brazil", revisions: [{ revid: 999 }] }] },
          }),
        ),
      ),
    );
    const map = await liveRevisionIds(["Brazil"]);
    expect(map.get("Brazil")).toBe(999);
  });

  it("keys results by the caller's original title across normalization", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            query: {
              normalized: [{ from: "brazil", to: "Brazil" }],
              pages: [{ title: "Brazil", revisions: [{ revid: 999 }] }],
            },
          }),
        ),
      ),
    );
    const map = await liveRevisionIds(["brazil"]);
    expect(map.get("brazil")).toBe(999);
  });

  it("chains normalization into redirects back to the original title", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            query: {
              normalized: [{ from: "brazil", to: "Brazil" }],
              redirects: [{ from: "Brazil", to: "Federative Republic" }],
              pages: [{ title: "Federative Republic", revisions: [{ revid: 1234 }] }],
            },
          }),
        ),
      ),
    );
    const map = await liveRevisionIds(["brazil"]);
    expect(map.get("brazil")).toBe(1234);
  });

  it("returns an empty map on API failure (site still builds)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 503 })));
    expect((await liveRevisionIds(["Brazil"])).size).toBe(0);
  });

  it("keeps earlier batches when a later batch fails", async () => {
    let call = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        call += 1;
        if (call === 1) {
          return new Response(
            JSON.stringify({
              query: { pages: [{ title: "First", revisions: [{ revid: 1 }] }] },
            }),
          );
        }
        return new Response("", { status: 503 });
      }),
    );
    const titles = [...Array(60)].map((_, i) => (i === 0 ? "First" : `T${i}`));
    const map = await liveRevisionIds(titles);
    expect(map.get("First")).toBe(1);
  });

  it("targets the wiki host for the requested language", async () => {
    let requested = "";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string) => {
        requested = String(input);
        return new Response(JSON.stringify({ query: { pages: [] } }));
      }),
    );
    await liveRevisionIds(["Brasil"], "pt");
    expect(requested).toContain("https://pt.wikipedia.org/w/api.php");
  });
});
