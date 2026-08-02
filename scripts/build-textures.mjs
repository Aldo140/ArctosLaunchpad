/**
 * Builds public/assets/textures/ from the full-size artwork.
 *
 * Why this exists
 * ---------------
 * Twelve CSS declarations across home.css and pages.css point at
 * `/assets/textures/*.webp`. Those files are downscaled derivatives of the
 * plates in `illustrations/` and `figures/` — the full-size originals are
 * 1254px square and up, and a watermark rendered at 5-8% opacity behind a
 * section has no use for that resolution.
 *
 * They were originally produced by hand, which is exactly why they went
 * missing: they were never committed, so a fresh clone 404'd every section
 * watermark, the interior starfield, and the hero survey pass. Generating them
 * from a script makes the set reproducible, keeps the derivation documented,
 * and means a change to a source plate can be pushed through with one command.
 *
 *   npm run build:textures
 *
 * The output is committed. This is not a build step — CI must not depend on it,
 * because the site has to work from a plain checkout.
 */
import { mkdir, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public/assets/textures");

/**
 * Each entry names its source directory and the width it is reduced to.
 *
 * The square plates go to 640px: they are drawn at up to 40rem and never at
 * full opacity, so past that width the file is paying for detail the blur and
 * the 5-8% opacity throw away. The two wide backdrops keep 1280px because they
 * are laid across a whole section at `background-size: cover` and banding shows
 * up in the contour gradients if they are reduced further.
 */
const SOURCES = [
  { dir: "illustrations", width: 640, files: [
    "branching-growth", "connected-automation", "connected-partnership",
    "growth-curve", "interface-assembly", "modular-blocks", "route-compass",
  ] },
  { dir: "illustrations", width: 1280, files: ["contour-field"] },
  { dir: "figures", width: 1280, files: ["starfield", "survey-contours"] },
];

const QUALITY = 72;

async function main() {
  await mkdir(OUT, { recursive: true });

  const expected = new Set();
  let written = 0;
  let bytes = 0;

  for (const { dir, width, files } of SOURCES) {
    for (const name of files) {
      const src = path.join(ROOT, "public/assets", dir, `${name}.webp`);
      const dest = path.join(OUT, `${name}.webp`);
      expected.add(`${name}.webp`);

      if (!existsSync(src)) {
        throw new Error(`missing source plate: ${path.relative(ROOT, src)}`);
      }

      await sharp(src)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(dest);

      const { size } = await stat(dest);
      bytes += size;
      written++;
      console.log(
        `  ${name.padEnd(24)} ${dir}/ -> ${String(width).padStart(4)}px  ${(size / 1024).toFixed(0)}KB`,
      );
    }
  }

  // A texture nobody generates is a texture nobody can regenerate. Flag strays
  // rather than deleting them, in case one is deliberate and simply undeclared.
  const strays = (await readdir(OUT)).filter((f) => !expected.has(f));
  if (strays.length) {
    console.warn(`\n  ! not produced by this script: ${strays.join(", ")}`);
  }

  console.log(`\n${written} textures, ${(bytes / 1024).toFixed(0)}KB total`);
}

await main();
