import { queryRecent, readStringField, writeStringField } from "./google";
import type { TriageStore } from "./triageAgent";
import type { GmailTriage, TriageDecision } from "./types";

/** The reply check's verdicts and Aldo's decisions, read and written from Vercel (keyless Google token). */

export async function readTriage(): Promise<GmailTriage | null> {
  const s = await readStringField("hq/gmail-triage", "payload");
  return s ? (JSON.parse(s) as GmailTriage) : null;
}

export const vercelTriageStore: TriageStore = {
  read: readTriage,
  write: (t) => writeStringField("hq/gmail-triage", "payload", JSON.stringify(t)),
};

export async function readDecisions(since: number): Promise<TriageDecision[]> {
  const rows = await queryRecent("hq_reply_decisions", "at", since, 500);
  return rows.map((r) => ({
    key: String(r.fields.key ?? r.id),
    decision: r.fields.decision as TriageDecision["decision"],
    title: (r.fields.title as string | null) ?? null,
    by: String(r.fields.by ?? ""),
    at: Number(r.fields.at ?? 0),
  }));
}
