// The HQ agent's window into Aldo's email (hq-agent.yml). Read-only; prints
// JSON for Claude Code to read. Never run this where its output is logged:
// the repository and its Actions logs are public.
//
//   tsx ops/agent-mail.ts outlook [search words | from:x | subject:y] [--top N]
//   tsx ops/agent-mail.ts outlook-read <message id>
//   tsx ops/agent-mail.ts gmail [words]     HQ's Gmail summary (hq/gmail), filtered
//
// Outlook is aldo@calgarywatch.ca through Microsoft Graph (MS_* secrets).
// Gmail is whatever the Gmail sync last posted to HQ; it's empty until the
// sync is set up (ops/gmail/hq-sync.gs).

import { outlookConfigured, readMail, searchMail } from './lib/outlook';

const [cmd, ...rest] = process.argv.slice(2);
const topAt = rest.indexOf('--top');
const top = topAt >= 0 ? Number(rest.splice(topAt, 2)[1]) || 25 : 25;
const words = rest.join(' ').trim();
const print = (x: unknown) => console.log(JSON.stringify(x, null, 1));

async function gmail() {
  const token = process.env.HQ_ACCESS_TOKEN;
  if (!token) throw new Error('HQ_ACCESS_TOKEN is not set.');
  const r = await fetch('https://firestore.googleapis.com/v1/projects/arctos-hq/databases/(default)/documents/hq/gmail', { headers: { Authorization: `Bearer ${token}` } });
  if (r.status === 404) return { note: 'HQ has no Gmail data yet: the Gmail sync (ops/gmail/hq-sync.gs) is not set up.' };
  if (!r.ok) throw new Error(`Reading hq/gmail: HTTP ${r.status}`);
  const doc = (await r.json()) as { fields?: { payload?: { stringValue?: string } } };
  const summary = JSON.parse(doc.fields?.payload?.stringValue ?? '{}') as { account?: string; generatedAt?: number; sends?: object[]; replies?: object[] };
  const needle = words.toLowerCase();
  const match = (x: object) => !needle || JSON.stringify(x).toLowerCase().includes(needle);
  return {
    account: summary.account, syncedAt: summary.generatedAt && new Date(summary.generatedAt).toISOString(),
    replies: (summary.replies ?? []).filter(match).slice(0, 100),
    sends: (summary.sends ?? []).filter(match).slice(0, 100),
  };
}

try {
  if (cmd === 'gmail') print(await gmail());
  else if (cmd === 'outlook' || cmd === 'outlook-read') {
    if (!outlookConfigured()) throw new Error('The Outlook secrets (MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET) are not set.');
    print(cmd === 'outlook' ? await searchMail(words, top) : await readMail(words));
  } else {
    console.log('Usage: outlook [search] [--top N] | outlook-read <id> | gmail [words]');
    process.exit(2);
  }
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
}
