// Dev-run pipeline (never on Vercel): resolve each collection entry's image
// via the Smithsonian Open Access API, download the master, emit duotone
// WebP variants + the dims manifest. Outputs are committed so the site
// build needs no network.
//
// Usage: npm run build-art          (SI_API_KEY=... to override DEMO_KEY)
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ART_COLLECTION } from "../../site/lib/art/collection.js";
import {
  WIDTHS,
  searchUrl,
  idsUrl,
  variantFile,
  pickIdsId,
  manifestTs,
  type ArtDims,
} from "./art-helpers.js";

const OUT = path.resolve("site/public/art");
const MANIFEST = path.resolve("site/lib/art/manifest.ts");
const API_KEY = process.env.SI_API_KEY ?? "DEMO_KEY";
const PAPER = { r: 244, g: 242, b: 236 }; // --paper
// idsUrl's `max` bounds the LONGEST edge, not the width — for portrait
// posters that's height, so the master must be fetched well above the
// largest target width to guarantee true width after resize. Must exceed
// maxWidth/aspect ≈ 1280/0.64 ≈ 2000 for the narrowest poster in the set.
const MASTER_MAX = 2400;

async function fetchJson(url: string): Promise<unknown> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} on ${url}`);
  return r.json();
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} on ${url}`);
  return Buffer.from(await r.arrayBuffer());
}

const dims: Record<string, ArtDims> = {};
let failures = 0;
await mkdir(OUT, { recursive: true });

for (const e of ART_COLLECTION) {
  try {
    const idsId =
      e.idsId ??
      pickIdsId(await fetchJson(searchUrl(e.objectNumber, API_KEY)), e.objectNumber);
    if (!idsId) throw new Error("no online media found");
    const master = await fetchBuffer(idsUrl(idsId, MASTER_MAX));
    // Normalise/grayscale once on the master so tone mapping is identical
    // across width variants — sharp pipelines aren't reusable across
    // .toBuffer() calls, so materialize this base once and resize from it.
    const base = await sharp(master).grayscale().normalise().toBuffer();
    let entryFailed = false;
    for (const w of WIDTHS) {
      const buf = await sharp(base)
        .resize({ width: w, withoutEnlargement: true })
        .tint(PAPER) // black→paper duotone ramp, matches the site palette
        .webp({ quality: 78 })
        .toBuffer();
      const m = await sharp(buf).metadata();
      if (m.width !== w) {
        failures++;
        entryFailed = true;
        console.error(`FAIL: ${e.id} ${w} produced ${m.width}`);
        continue;
      }
      await writeFile(path.join(OUT, variantFile(e.id, w)), buf);
      if (w === WIDTHS[0]) {
        dims[e.id] = { w: m.width ?? 0, h: m.height ?? 0, widths: WIDTHS };
      }
    }
    if (!entryFailed) console.log(`ok: ${e.id} (${idsId})`);
  } catch (err) {
    failures++;
    console.error(`FAIL: ${e.id} (${e.objectNumber}) — ${(err as Error).message}`);
  }
}

await writeFile(MANIFEST, manifestTs(dims));
console.log(`wrote ${Object.keys(dims).length}/${ART_COLLECTION.length} entries to manifest`);
if (failures) process.exit(1);
