const API = "https://en.wikipedia.org/w/api.php";
const UA = "decolonize.wiki site build (https://github.com/decolonize-wiki/platform)";

export async function liveRevisionIds(titles: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  try {
    for (let i = 0; i < titles.length; i += 50) {
      const batch = titles.slice(i, i + 50);
      const params = new URLSearchParams({
        action: "query",
        format: "json",
        formatversion: "2",
        prop: "revisions",
        rvprop: "ids",
        redirects: "1",
        titles: batch.join("|"),
      });
      const res = await fetch(`${API}?${params}`, { headers: { "user-agent": UA } });
      if (!res.ok) return new Map();
      const body = (await res.json()) as {
        query?: {
          normalized?: Array<{ from: string; to: string }>;
          redirects?: Array<{ from: string; to: string }>;
          pages?: Array<{ title: string; revisions?: Array<{ revid: number }> }>;
        };
      };
      // The API keys pages by resolved title; walk normalized → redirects so the
      // returned map is keyed by the caller's original titles.
      const rename = new Map(
        [...(body.query?.normalized ?? []), ...(body.query?.redirects ?? [])].map((r) => [
          r.from,
          r.to,
        ]),
      );
      const revids = new Map<string, number>();
      for (const p of body.query?.pages ?? []) {
        if (p.revisions?.[0]) revids.set(p.title, p.revisions[0].revid);
      }
      for (const original of batch) {
        let title = original;
        for (let hops = 0; hops < 10 && rename.has(title); hops++) title = rename.get(title)!;
        const revid = revids.get(title);
        if (revid !== undefined) map.set(original, revid);
      }
    }
  } catch {
    return new Map();
  }
  return map;
}
