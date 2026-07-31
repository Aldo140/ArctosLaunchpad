import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

if (process.env.GITHUB_PAGES !== "true") process.exit(0);

const outputDirectory = join(process.cwd(), "out");
const repositoryPath = "/ArctosLaunchpad";
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".txt",
  ".xml",
]);

async function prefixPublicAssets(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      await prefixPublicAssets(path);
      continue;
    }

    if (!textExtensions.has(extname(entry.name))) continue;

    const source = await readFile(path, "utf8");
    const prefixed = source.replaceAll("/assets/", `${repositoryPath}/assets/`);

    if (prefixed !== source) await writeFile(path, prefixed);
  }
}

await prefixPublicAssets(outputDirectory);
await mkdir(outputDirectory, { recursive: true });
await writeFile(join(outputDirectory, ".nojekyll"), "");
