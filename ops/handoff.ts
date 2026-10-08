// The one-time move of the agents from CalgaryWatch to Arctos, run first in
// every Arctos ops workflow. After it has happened once it is a no-op.
//
//   1. Mark ops_meta/handoff in arctos-hq as started. CalgaryWatch's ops
//      workflows check that document and stand down from then on.
//   2. Wait for any CalgaryWatch ops run already in progress to finish, so
//      nothing it writes after the copy is lost (a post published twice).
//   3. Copy the agents' state from CalgaryWatch's database to arctos-hq.
//   4. Mark the handoff done. This run, and every later one, works in arctos-hq.
//
// Partner leads, the suppression list and ingestion health stay in CalgaryWatch
// (its site and admin use them); see lib/firebase.ts.

import { calgaryWatchDb, hqDb } from './lib/firebase';

const MOVED = ['ops_queue', 'ops_health', 'ops_usage', 'ops_secrets'] as const;
const CW_REPO = 'Aldo140/Calgary-Watch-';
const CW_WORKFLOWS = ['ops-hourly.yml', 'ops-daily.yml'];
const WAIT_MS = 20 * 60_000;

const log = (m: string) => console.log(`[ops:handoff] ${m}`);
const hq = hqDb();
const ref = hq.collection('ops_meta').doc('handoff');
const state = (await ref.get()).data() as { startedAt?: number; migratedAt?: number } | undefined;

if (state?.migratedAt) {
  log(`Moved to Arctos ${new Date(state.migratedAt).toISOString()}; nothing to do.`);
  process.exit(0);
}

const startedAt = state?.startedAt ?? Date.now();
await ref.set({ startedAt, by: process.env.GITHUB_RUN_ID ?? 'local' }, { merge: true });
log('Handoff started: CalgaryWatch ops will stand down from their next run.');

async function busyRuns(): Promise<string[]> {
  const busy: string[] = [];
  for (const wf of CW_WORKFLOWS) {
    const res = await fetch(`https://api.github.com/repos/${CW_REPO}/actions/workflows/${wf}/runs?per_page=20`, {
      headers: { accept: 'application/vnd.github+json', 'user-agent': 'arctos-ops', ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) },
    });
    if (!res.ok) throw new Error(`GitHub ${wf}: HTTP ${res.status}`);
    const runs = ((await res.json()) as { workflow_runs: Array<{ status: string; html_url: string; run_started_at?: string }> }).workflow_runs;
    // Queued runs stand down by themselves once they start; only a run that is already working matters.
    for (const r of runs) if (r.status === 'in_progress' && Date.parse(r.run_started_at ?? '') < Date.now()) busy.push(r.html_url);
  }
  return busy;
}

const deadline = Date.now() + WAIT_MS;
for (;;) {
  const busy = await busyRuns();
  if (!busy.length) break;
  if (Date.now() > deadline) {
    log(`CalgaryWatch ops still running after 20 minutes (${busy.join(', ')}); the next run tries again.`);
    process.exit(1);
  }
  log(`Waiting for ${busy.length} CalgaryWatch run(s) to finish…`);
  await new Promise(r => setTimeout(r, 30_000));
}

const cw = calgaryWatchDb();
const counts: Record<string, number> = {};
for (const name of MOVED) {
  const docs = (await cw.collection(name).get()).docs;
  for (let i = 0; i < docs.length; i += 400) {
    const batch = hq.batch();
    for (const d of docs.slice(i, i + 400)) batch.set(hq.collection(name).doc(d.id), d.data());
    await batch.commit();
  }
  counts[name] = docs.length;
  log(`${name}: ${docs.length} documents copied.`);
}

await ref.set({ migratedAt: Date.now(), counts }, { merge: true });
log('Handoff complete: the agents now run from Arctos.');
