// The latest @calgarydaily posts, for the "On Instagram" strip on the
// CalgaryWatch homepage (src/components/home/CalgaryDailyStrip.tsx there).
// Published to this repository's ops-media branch as feed/calgarydaily.json;
// CalgaryWatch's deploy downloads it, so no browser ever reads the queue.

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { OpsPost } from './types';
import { ROOT, brandKit } from './lib/brand';
import { COLLECTIONS, cdnUrl, hasFirebase, opsDb, putMediaFile } from './lib/firebase';

export const FEED_PATH = 'feed/calgarydaily.json';
const log = (m: string) => console.log(`[ops:feed] ${m}`);

if (!hasFirebase()) {
  log('No Firebase credentials; nothing to publish.');
} else {
  const kit = brandKit('calgarydaily');
  // Two equality filters need no composite index.
  const snapshot = await opsDb().collection(COLLECTIONS.posts).where('status', '==', 'published').where('brand', '==', 'calgarydaily').get();
  const docs = snapshot.docs
    .map(d => d.data() as OpsPost)
    .filter(p => p.brand === 'calgarydaily' && p.permalink && p.imageUrl && !p.sponsored)
    .sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0))
    .slice(0, 8);
  const feed = {
    handle: kit.handle,
    updatedAt: new Date().toISOString(),
    posts: docs.map(p => ({
      permalink: p.permalink!,
      image: cdnUrl(p.imageUrl!),
      headline: p.imageText.headline,
      eyebrow: p.imageText.eyebrow,
      alt: p.altText,
      publishedAt: new Date(p.publishedAt!).toISOString(),
      format: p.videoUrl ? 'reel' : (p.imageUrls?.length ?? 0) > 1 ? 'carousel' : 'post',
    })),
  };
  const body = JSON.stringify(feed, null, 2) + '\n';
  if (process.env.GITHUB_TOKEN) {
    log(`Published ${feed.posts.length} posts to ${await putMediaFile(FEED_PATH, body, 'ops: CalgaryDaily feed')}`);
  } else {
    await mkdir(join(ROOT, '.cache'), { recursive: true });
    await writeFile(join(ROOT, '.cache', 'calgarydaily-feed.json'), body);
    log(`Wrote ${feed.posts.length} posts to ops/.cache (no GITHUB_TOKEN).`);
  }
}
