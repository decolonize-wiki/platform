import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export type Category = { id: string; name: string; body: string };
export type Source = { id: string; citation: string };

export function methodologyDir(): string {
  return (
    process.env.METHODOLOGY_DIR ??
    join(process.cwd(), "..", "..", "decolonize-methodology")
  );
}

export function parseCategory(md: string): Category {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const frontmatter = m ? m[1] : "";
  const body = (m ? m[2] : md).trim();
  const fields: Record<string, string> = {};
  for (const line of frontmatter.split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    fields[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { id: fields.id ?? "", name: fields.name ?? "", body };
}

export function parseSourcesTable(md: string): Source[] {
  const out: Source[] = [];
  for (const line of md.split("\n")) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 2) continue;
    const [id, citation] = cells;
    if (!id || id === "id" || /^-+$/.test(id)) continue;
    out.push({ id, citation });
  }
  return out;
}

async function loadCategories(dir = methodologyDir()): Promise<Category[]> {
  const catDir = join(dir, "categories");
  const files = (await readdir(catDir)).filter(
    (f) => f.endsWith(".md") && f !== "SCHEMA.md",
  );
  const cats = await Promise.all(
    files.map(async (f) => parseCategory(await readFile(join(catDir, f), "utf8"))),
  );
  return cats.sort((a, b) => a.name.localeCompare(b.name));
}

async function loadSources(dir = methodologyDir()): Promise<Source[]> {
  return parseSourcesTable(await readFile(join(dir, "SOURCES.md"), "utf8"));
}

// Module-level promises memoize per build process (pattern in cached.ts).
let categoriesPromise: Promise<Category[]> | undefined;
let sourcesPromise: Promise<Source[]> | undefined;

export function getCategories(): Promise<Category[]> {
  categoriesPromise ??= loadCategories();
  return categoriesPromise;
}

export function getSources(): Promise<Source[]> {
  sourcesPromise ??= loadSources();
  return sourcesPromise;
}
