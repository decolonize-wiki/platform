// Downloads the data + methodology repos as tarballs at build time.
//
// On Vercel there are no sibling checkouts, so the site's data has to be pulled
// from GitHub. For each repo, if its TARBALL_URL env var is set we download and
// extract into a fixed dir; the build is then pointed at those dirs via
// DATA_DIR=.data / METHODOLOGY_DIR=.methodology. If the URL is unset we no-op
// and the local sibling checkout is used instead (see lib/data.ts).
//
// A configured-but-broken tarball is a hard failure: falling back silently would
// ship a stale or empty site.

import { spawnSync } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const here = new URL(".", import.meta.url).pathname;
const siteRoot = join(here, "..");

async function fetchRepo(name, url, dest) {
  if (!url) {
    console.log(`[prebuild-data] ${name}: no tarball URL set, using local sibling`);
    return;
  }
  console.log(`[prebuild-data] ${name}: downloading ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`[prebuild-data] ${name}: download failed (HTTP ${res.status})`);
  }
  const buf = Buffer.from(await res.arrayBuffer());

  await rm(dest, { recursive: true, force: true });
  await mkdir(dest, { recursive: true });

  // codeload tarballs have a single top-level dir; --strip-components=1 drops it.
  const tar = spawnSync("tar", ["-xz", "--strip-components=1", "-C", dest], {
    input: buf,
    stdio: ["pipe", "inherit", "inherit"],
  });
  if (tar.status !== 0) {
    throw new Error(`[prebuild-data] ${name}: tar extract failed (exit ${tar.status})`);
  }
  console.log(`[prebuild-data] ${name}: extracted to ${dest}`);
}

await fetchRepo("data", process.env.DATA_TARBALL_URL, join(siteRoot, ".data"));
await fetchRepo("methodology", process.env.METHODOLOGY_TARBALL_URL, join(siteRoot, ".methodology"));
