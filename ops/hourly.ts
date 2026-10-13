// Every hour: publish approved posts that are due, pick up briefs and redrafts
// the reviewer asked for, match replies from businesses, and send approved emails.

import { hasFirebase, opsDb } from './lib/firebase';
import { queueDrafts } from './jobs/drafts';
import { resolveDoubleBookings, autoApprove, publishDue, redraftAndBriefs } from './jobs/posts';
import { sendApproved, syncReplies } from './jobs/outreach';
import { exitForQuota, isQuotaExhausted } from './lib/quota';
import { flushUsage } from './jobs/usage';
import { loadDiscoveryIndex } from './lib/discovery';

const log = (m: string) => console.log(`[ops:hourly] ${m}`);
if (!hasFirebase()) {
  log('FIREBASE_SERVICE_ACCOUNT is required.');
  process.exit(1);
}
const db = opsDb();
const now = Date.now();
let failed = false;
let quota = false;
async function step(name: string, run: () => Promise<unknown>) {
  // Once the quota is gone every later step would fail the same way.
  if (quota) return;
  try { await run(); } catch (e) {
    if (isQuotaExhausted(e)) { quota = true; log(`${name}: Firestore quota exhausted; stopping this run.`); return; }
    failed = true; log(`${name} failed: ${e instanceof Error ? e.stack ?? e.message : e}`);
  }
}

await step('queue drafts', () => queueDrafts(db, now, log));
await step('auto-approve', () => autoApprove(db, now, log));
await step('one post per slot', () => resolveDoubleBookings(db, now, log));
await step('publish', () => publishDue(db, now, log));
await step('redrafts and briefs', () => redraftAndBriefs(db, now, log));
await step('replies', () => syncReplies(db, now, log));
await step('send', async () => {
  // Delivery fails closed when the current inventory cannot be loaded: an old
  // approved draft must never claim a listing that has since disappeared.
  let currentEntityIds: Set<string> | null = null;
  try {
    const index = await loadDiscoveryIndex(log);
    currentEntityIds = new Set(index.entities.filter(e => e.status === 'published' && !e.fixture).map(e => e.id));
  } catch (e) {
    log(`Current CalgaryWatch inventory unavailable: ${e instanceof Error ? e.message : e}`);
  }
  await sendApproved(db, now, log, currentEntityIds);
});
await flushUsage(db, now, 'hourly', log).catch(e => log(`usage not recorded: ${e instanceof Error ? e.message : e}`));
if (failed) process.exitCode = 1;
else if (quota) exitForQuota('Operations hourly');
