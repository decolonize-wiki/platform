const API = "https://en.wikipedia.org/w/api.php";
const UA = "decolonize.wiki site build (https://github.com/decolonize-wiki/platform)";

export async function liveRevisionIds(titles: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  try {
    for (let i = 0; i < titles.length; i += 50) {
      const params = new URLSearchParams({
        action: "query",
        format: "json",
        formatversion: "2",
        prop: "revisions",
        rvprop: "ids",
        redirects: "1",
        titles: titles.slice(i, i + 50).join("|"),
      });
      const res = await fetch(`${API}?${params}`, { headers: { "user-agent": UA } });
      if (!res.ok) return new Map();
      const body = (await res.json()) as {
        query?: { pages?: Array<{ title: string; revisions?: Array<{ revid: number }> }> };
      };
      for (const p of body.query?.pages ?? []) {
        if (p.revisions?.[0]) map.set(p.title, p.revisions[0].revid);
      }
    }
  } catch {
    return new Map();
  }
  return map;
}
