import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { AnalysisSchema, type Analysis } from "../../src/schema/analysis.js";

export function dataDir(): string {
  return process.env.DATA_DIR ?? join(process.cwd(), "..", "..", "decolonize-data");
}

export async function loadAllAnalyses(dir = dataDir()): Promise<Analysis[]> {
  const root = join(dir, "analyses");
  const out: Analysis[] = [];
  for (const lang of await readdir(root)) {
    for (const slug of await readdir(join(root, lang))) {
      for (const f of await readdir(join(root, lang, slug))) {
        if (!f.endsWith(".json")) continue;
        const a = AnalysisSchema.parse(JSON.parse(await readFile(join(root, lang, slug, f), "utf8")));
        if (a.status === "draft") continue;
        out.push(a);
      }
    }
  }
  return out;
}

export function latestFor(all: Analysis[], lang: string, slug: string): Analysis | undefined {
  return all
    .filter((a) => a.language === lang && a.article.slug === slug && a.status === "published")
    .sort((a, b) => b.sequence - a.sequence)[0];
}
