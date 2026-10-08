import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT } from './brand';
import type { DiscoveryIndex } from './posts';

/**
 * CalgaryWatch's verified listings, the source of every templated post and
 * partner lead. CalgaryWatch's ingestion commits the index to its repository;
 * the agents read the published copy so they never need CalgaryWatch's code.
 */
export const DISCOVERY_INDEX_URLS = [
  // Rebuilt from Firestore on every CalgaryWatch deploy (twice a day and on every release).
  'https://calgarywatch.ca/discovery-index.json',
  // The copy committed to the CalgaryWatch repository, updated less often.
  'https://raw.githubusercontent.com/Aldo140/Calgary-Watch-/main/src/generated/discovery-index.json',
];
export const INDEX_CACHE = join(ROOT, '.cache', 'discovery-index.json');

export async function loadDiscoveryIndex(log: (m: string) => void = () => {}): Promise<DiscoveryIndex> {
  if (process.env.DISCOVERY_INDEX_PATH) return JSON.parse(await readFile(process.env.DISCOVERY_INDEX_PATH, 'utf8')) as DiscoveryIndex;
  for (const url of process.env.DISCOVERY_INDEX_URL ? [process.env.DISCOVERY_INDEX_URL] : DISCOVERY_INDEX_URLS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const index = JSON.parse(text) as DiscoveryIndex;
      if (!Array.isArray(index.entities) || !index.entities.length) throw new Error('empty index');
      await mkdir(join(ROOT, '.cache'), { recursive: true });
      await writeFile(INDEX_CACHE, text);
      return index;
    } catch (e) {
      log(`CalgaryWatch index from ${url}: ${e instanceof Error ? e.message : e}`);
    }
  }
  log('Using the last cached copy of the CalgaryWatch index.');
  return JSON.parse(await readFile(INDEX_CACHE, 'utf8')) as DiscoveryIndex;
}
