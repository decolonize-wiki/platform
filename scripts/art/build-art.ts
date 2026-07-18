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
    const master = await fetchBuffer(idsUrl(idsId, 1600));
    for (const w of WIDTHS) {
      const buf = await sharp(master)
        .resize({ width: w, withoutEnlargement: true })
        .grayscale()
        .normalise()
        .tint(PAPER) // black→paper duotone ramp, matches the site palette
        .webp({ quality: 78 })
        .toBuffer();
      await writeFile(path.join(OUT, variantFile(e.id, w)), buf);
      if (w === WIDTHS[0]) {
        const m = await sharp(buf).metadata();
        dims[e.id] = { w: m.width ?? 0, h: m.height ?? 0, widths: WIDTHS };
      }
    }
    console.log(`ok: ${e.id} (${idsId})`);
  } catch (err) {
    failures++;
    console.error(`FAIL: ${e.id} (${e.objectNumber}) — ${(err as Error).message}`);
  }
}

await writeFile(MANIFEST, manifestTs(dims));
console.log(`wrote ${Object.keys(dims).length}/${ART_COLLECTION.length} entries to manifest`);
if (failures) process.exit(1);
