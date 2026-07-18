import type { MetadataRoute } from "next";
import { getAllAnalyses } from "../lib/cached";
import { latestFor } from "../lib/data";

const BASE = "https://decolonize.wiki";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const all = await getAllAnalyses();
  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/en`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/en/methodology`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/en/art`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const latestKeys = new Set<string>();
  for (const a of all) {
    if (a.status !== "published") continue;
    const lastModified = new Date(a.article.fetchedAt);
    // Permalink for this specific sequence.
    entries.push({
      url: `${BASE}/${a.language}/${a.article.slug}/${a.sequence}`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.6,
    });
    // Latest-alias URL, emitted once per article.
    const key = `${a.language}/${a.article.slug}`;
    if (latestKeys.has(key)) continue;
    const latest = latestFor(all, a.language, a.article.slug);
    if (!latest) continue;
    latestKeys.add(key);
    entries.push({
      url: `${BASE}/${latest.language}/${latest.article.slug}`,
      lastModified: new Date(latest.article.fetchedAt),
      changeFrequency: "monthly",
      priority: 0.9,
    });
  }

  return entries;
}
