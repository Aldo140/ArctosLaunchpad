import type { GmailReply, GmailSend, GmailSummary } from "./types";

const DAY = 86_400_000;

function mergeRows<T>(current: T[], incoming: T[], key: (row: T) => string, cutoff: number, at: (row: T) => number): T[] {
  const rows = new Map(current.filter((row) => at(row) >= cutoff).map((row) => [key(row), row]));
  // Incoming rows replace stored rows so replied/answered/thread fields stay current.
  for (const row of incoming) if (at(row) >= cutoff) rows.set(key(row), row);
  return [...rows.values()].sort((a, b) => at(b) - at(a));
}

const sendKey = (row: GmailSend) => `${row.at}\n${row.alias}\n${row.to}\n${row.subject}`;
const replyKey = (row: GmailReply) => `${row.at}\n${row.alias}\n${row.from}\n${row.subject}`;

/** Merge a small incremental Gmail scan into HQ's rolling history. */
export function mergeGmailSummary(current: GmailSummary | null, incoming: GmailSummary): GmailSummary {
  const days = Math.max(current?.days ?? 0, incoming.days);
  const cutoff = incoming.generatedAt - days * DAY;
  return {
    generatedAt: incoming.generatedAt,
    account: incoming.account,
    days,
    sends: mergeRows(current?.sends ?? [], incoming.sends, sendKey, cutoff, (row) => row.at).slice(0, 1200),
    replies: mergeRows(current?.replies ?? [], incoming.replies, replyKey, cutoff, (row) => row.at).slice(0, 400),
  };
}
