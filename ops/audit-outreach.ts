// Read-only production outreach audit. It never updates Firestore and never sends mail.
// The GitHub workflow stores the detailed report as a private Actions artifact.

import { writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { opsDb, COLLECTIONS } from './lib/firebase';
import { loadDiscoveryIndex } from './lib/discovery';
import { listingClaimProblems } from './jobs/outreach';
import type { PartnerLead } from './types';

const output = process.env.OUTREACH_AUDIT_OUTPUT ?? '/tmp/outreach-audit.json';
const db = opsDb();
const index = await loadDiscoveryIndex(m => console.log(`[audit] ${m}`));
const currentEntityIds = new Set(index.entities.filter(e => e.status === 'published' && !e.fixture).map(e => e.id));
const docs = (await db.collection(COLLECTIONS.leads).get()).docs;

const leads = docs.map(doc => {
  const lead = doc.data() as PartnerLead;
  const problems = listingClaimProblems(lead, currentEntityIds);
  const queued = ['approved', 'ready', 'follow-up-ready'].includes(lead.status);
  const prospectOrOrganizer = lead.entityKind === 'prospect' || lead.entityKind === 'organizer';
  return {
    id: doc.id,
    businessName: lead.businessName,
    contactEmail: lead.contactEmail,
    entityId: lead.entityId,
    entityKind: lead.entityKind,
    status: lead.status,
    subject: lead.draftSubject,
    body: lead.draftBody,
    lastContactAt: lead.lastContactAt ? new Date(lead.lastContactAt).toISOString() : null,
    conversationId: lead.conversationId,
    queued,
    prospectOrOrganizer,
    problems,
    history: lead.history ?? [],
  };
});

const affected = leads.filter(l => l.problems.length);
const queued = leads.filter(l => l.queued);
const prospectOrOrganizer = leads.filter(l => l.prospectOrOrganizer);
const report = {
  generatedAt: new Date().toISOString(),
  readOnly: true,
  inventoryEntities: currentEntityIds.size,
  totals: {
    leads: leads.length,
    affected: affected.length,
    queued: queued.length,
    prospectOrOrganizer: prospectOrOrganizer.length,
    resendConversations: leads.filter(l => l.conversationId?.startsWith('resend:')).length,
  },
  affected,
  queued,
  prospectOrOrganizer,
};

await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
console.log(`[audit] Read ${leads.length} leads; ${affected.length} have factual listing problems; ${queued.length} are queued.`);
console.log(`[audit] Detailed report written to the private workflow artifact.`);

