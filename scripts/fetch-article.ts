import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fetchArticle } from "../src/lib/wikipedia.js";
import { slugify } from "../src/lib/slugify.js";

const DATA = process.env.DATA_REPO ?? "../decolonize-data";
const title = process.argv[2];
if (!title) {
  console.error('usage: npm run fetch-article -- "Article Title"');
  process.exit(1);
}

const a = await fetchArticle(title);
const slug = slugify(a.title);
const dir = join(DATA, "extracts", "en", slug);
await mkdir(dir, { recursive: true });
const file = join(dir, `${a.revisionId}.txt`);
await writeFile(file, a.extract, "utf8");

console.log(
  JSON.stringify(
    {
      title: a.title,
      slug,
      revisionId: a.revisionId,
      fetchedAt: new Date().toISOString(),
      url: a.url,
      extractPath: file,
      extractChars: a.extract.length,
    },
    null,
    2,
  ),
);
