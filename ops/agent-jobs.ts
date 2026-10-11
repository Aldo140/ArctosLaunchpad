// The HQ agent's job queue (hq_agent_jobs in arctos-hq; see lib/hq/agentJobs.ts).
// No imports, so the ops clock runs it with plain Node (no npm install).
// Never prints a task or a result: the Actions logs are public.
//
//   node ops/agent-jobs.ts pending              new jobs: marks them queued, prints their ids (the ops clock)
//   node ops/agent-jobs.ts claim <id>           marks the job running, prints its kind (code or mail)
//   node ops/agent-jobs.ts task <id> <file>     writes the task to <file>
//   node ops/agent-jobs.ts finish <id> <status> [result file]
//                                               status: pushed | answered | checks-failed | failed;
//                                               COMMIT, BRANCH and RUN_URL come from the environment
//
// Signs in with HQ_ACCESS_TOKEN when set, otherwise with the run's own GitHub
// OIDC token through the same keyless pool hq-agent.yml and the ops runs use.

import { readFileSync, writeFileSync } from 'node:fs';

const PROJECT_NUMBER = '872261504062';
const PROVIDER = `projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github/providers/arctos-repos`;
const SERVICE_ACCOUNT = 'firebase-adminsdk-fbsvc@arctos-hq.iam.gserviceaccount.com';
const DOCS = 'https://firestore.googleapis.com/v1/projects/arctos-hq/databases/(default)/documents';
const COLLECTION = 'hq_agent_jobs';
const FINAL = ['pushed', 'answered', 'checks-failed', 'failed'];

async function json(r: Response, what: string): Promise<any> {
  if (!r.ok) throw new Error(`${what}: HTTP ${r.status} ${(await r.text()).slice(0, 300)}`);
  return r.json();
}

async function accessToken(): Promise<string> {
  if (process.env.HQ_ACCESS_TOKEN) return process.env.HQ_ACCESS_TOKEN;
  const url = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const bearer = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  if (!url || !bearer) throw new Error('No HQ_ACCESS_TOKEN and no GitHub OIDC token (the job needs id-token: write).');
  const oidc = await json(await fetch(`${url}&audience=${encodeURIComponent(`https://iam.googleapis.com/${PROVIDER}`)}`, { headers: { Authorization: `Bearer ${bearer}` } }), 'GitHub OIDC');
  const sts = await json(await fetch('https://sts.googleapis.com/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grantType: 'urn:ietf:params:oauth:grant-type:token-exchange', audience: `//iam.googleapis.com/${PROVIDER}`,
      scope: 'https://www.googleapis.com/auth/cloud-platform', requestedTokenType: 'urn:ietf:params:oauth:token-type:access_token',
      subjectToken: oidc.value, subjectTokenType: 'urn:ietf:params:oauth:token-type:jwt',
    }),
  }), 'Google token exchange');
  const sa = await json(await fetch(`https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${SERVICE_ACCOUNT}:generateAccessToken`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${sts.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ scope: ['https://www.googleapis.com/auth/cloud-platform'], lifetime: '600s' }),
  }), 'Google service account');
  return sa.accessToken;
}

type Value = { stringValue: string } | { integerValue: string } | { nullValue: null };
const value = (v: string | number | null): Value => (v === null ? { nullValue: null } : typeof v === 'number' ? { integerValue: String(Math.round(v)) } : { stringValue: v });

async function patch(token: string, id: string, fields: Record<string, string | number | null>) {
  const mask = Object.keys(fields).map((k) => `updateMask.fieldPaths=${k}`).join('&');
  await json(await fetch(`${DOCS}/${COLLECTION}/${id}?${mask}&currentDocument.exists=true`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, value(v)])) }),
  }), `Updating job ${id}`);
}

const [cmd, id, arg] = process.argv.slice(2);
const validId = (x: string | undefined): string => {
  if (!x || !/^[\w-]{1,100}$/.test(x)) throw new Error('A job id is required.');
  return x;
};

try {
  const token = await accessToken();
  if (cmd === 'pending') {
    const rows = await json(await fetch(`${DOCS}:runQuery`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ structuredQuery: { from: [{ collectionId: COLLECTION }], where: { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'pending' } } }, limit: 5 } }),
    }), 'Reading jobs');
    for (const r of rows as Array<{ document?: { name: string } }>) {
      if (!r.document) continue;
      const jobId = r.document.name.split('/').pop()!;
      await patch(token, jobId, { status: 'queued' });
      console.log(jobId);
    }
  } else if (cmd === 'claim' || cmd === 'task') {
    const jobId = validId(id);
    const doc = await json(await fetch(`${DOCS}/${COLLECTION}/${jobId}`, { headers: { Authorization: `Bearer ${token}` } }), `Reading job ${jobId}`);
    const task = doc.fields?.task?.stringValue;
    if (!task) throw new Error(`Job ${jobId} has no task.`);
    if (cmd === 'task') {
      if (!arg) throw new Error('Where should the task go?');
      writeFileSync(arg, task);
    } else {
      const status = doc.fields?.status?.stringValue;
      if (status !== 'pending' && status !== 'queued') throw new Error(`Job ${jobId} is ${status} already.`);
      const kind = doc.fields?.kind?.stringValue === 'mail' ? 'mail' : 'code';
      await patch(token, jobId, { status: 'running', run: process.env.RUN_URL ?? null });
      console.log(kind);
    }
  } else if (cmd === 'finish') {
    const jobId = validId(id);
    const status = process.argv[4];
    if (!FINAL.includes(status)) throw new Error(`Status must be one of ${FINAL.join(', ')}.`);
    let result: string | null = null;
    try { result = process.argv[5] ? readFileSync(process.argv[5], 'utf8').trim().slice(0, 6000) || null : null; } catch { /* no summary written */ }
    await patch(token, jobId, {
      status, result, commit: process.env.COMMIT || null, branch: process.env.BRANCH || null,
      run: process.env.RUN_URL || null, finishedAt: Date.now(),
    });
  } else {
    console.error('Usage: pending | claim <id> | task <id> <file> | finish <id> <status> [result file]');
    process.exit(2);
  }
} catch (e) {
  console.error(`[agent-jobs] ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
}
