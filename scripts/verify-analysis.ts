import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { AnalysisSchema } from "../src/schema/analysis.js";
import { verifyQuotes } from "../src/lib/verify-quotes.js";

const DATA = process.env.DATA_REPO ?? "../decolonize-data";
const path = process.argv[2];
if (!path) {
  console.error("usage: npm run verify-analysis -- <path-to-analysis.json>");
  process.exit(1);
}

const parsed = AnalysisSchema.safeParse(
  JSON.parse(await readFile(path, "utf8")),
);
if (!parsed.success) {
  console.error("SCHEMA INVALID:");
  console.error(JSON.stringify(z.treeifyError(parsed.error), null, 2));
  process.exit(1);
}
const a = parsed.data;

const extractPath = join(
  DATA,
  "extracts",
  a.language,
  a.article.slug,
  `${a.article.revisionId}.txt`,
);
const extract = await readFile(extractPath, "utf8");
const results = verifyQuotes(extract, a.flags);
const missing = results.filter((r) => !r.found);

for (const r of results) console.log(`${r.found ? "OK  " : "FAIL"} ${r.id}`);
if (missing.length > 0) {
  console.error(
    `\n${missing.length} quote(s) not found verbatim in extract ${extractPath}`,
  );
  process.exit(1);
}
console.log(
  `\nAll ${results.length} quotes verified against revision ${a.article.revisionId}. Schema valid.`,
);
if (a.status === "draft") {
  console.warn(
    "WARNING: status is 'draft' — not owner-approved. Do not commit until the owner flips it to 'published'.",
  );
}
