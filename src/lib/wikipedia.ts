export interface FetchedArticle {
  title: string;
  revisionId: number;
  extract: string;
  url: string;
  /** Raw wikitext of the pinned revision (carries <ref> citation data). Absent if the API did not return revision content. */
  wikitext?: string;
}

const API = "https://en.wikipedia.org/w/api.php";
const UA =
  "decolonize.wiki batch flow (https://github.com/decolonize-wiki/platform)";

export async function fetchArticle(title: string): Promise<FetchedArticle> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "extracts|revisions",
    explaintext: "1",
    redirects: "1",
    rvprop: "ids|content",
    rvslots: "main",
    titles: title,
  });
  const res = await fetch(`${API}?${params}`, {
    headers: { "user-agent": UA },
  });
  if (!res.ok) throw new Error(`Wikipedia API ${res.status} for "${title}"`);
  const body = (await res.json()) as {
    query?: {
      pages?: Array<{
        title: string;
        missing?: boolean;
        extract?: string;
        revisions?: Array<{
          revid: number;
          slots?: { main?: { content?: string } };
        }>;
      }>;
    };
  };
  const page = body.query?.pages?.[0];
  if (!page || page.missing || !page.extract || !page.revisions?.[0]) {
    throw new Error(`Article not found: "${title}"`);
  }
  return {
    title: page.title,
    revisionId: page.revisions[0].revid,
    extract: page.extract,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`,
    wikitext: page.revisions[0].slots?.main?.content,
  };
}
