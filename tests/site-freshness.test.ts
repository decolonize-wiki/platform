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

  it("returns an empty map on API failure (site still builds)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 503 })));
    expect((await liveRevisionIds(["Brazil"])).size).toBe(0);
  });
});
