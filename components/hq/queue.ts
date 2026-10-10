import type { CommandType, HqPost, HqResponse, InboxPitch, InboxReply } from "@/lib/hq/types";
import { replyBoard, triageKey, type BoardItem } from "@/lib/hq/triage";
import { inFilter, type Filter } from "./context";

/**
 * Everything waiting on Aldo, in the order worth doing it: people who wrote
 * back first (that's money), then posts that need a fix, posts to approve
 * (soonest slot first), then pitches. Oldest first inside each group.
 */

export type QueueItem =
  | { kind: "reply"; key: string; at: number; business: string; reply: InboxReply }
  | { kind: "gmail"; key: string; at: number; business: string; item: BoardItem }
  | { kind: "post"; key: string; at: number; business: string; post: HqPost }
  | { kind: "pitch"; key: string; at: number; business: string; pitch: InboxPitch };

export const QUEUE_GROUP: Record<QueueItem["kind"], string> = { reply: "Replies", gmail: "Replies", post: "Posts", pitch: "Pitches" };

const DECIDE = ["drafted", "needs-correction", "failed"];

const TARGET: Record<QueueItem["kind"], CommandType[]> = {
  reply: ["approve-reply", "handled-reply"],
  gmail: [],
  post: ["approve-post", "reject-post", "redraft-post", "unschedule-post"],
  pitch: ["approve-pitch", "skip-pitch"],
};
const targetOf = (i: QueueItem) => (i.kind === "reply" ? i.reply.leadId : i.kind === "post" ? i.post.id : i.kind === "pitch" ? i.pitch.leadId : "");

/** Decided in HQ, waiting for the agents to carry it out: done as far as you're concerned. */
export function isQueued(data: HqResponse, i: QueueItem): boolean {
  return data.commands.some((c) => c.status === "pending" && c.targetId === targetOf(i) && TARGET[i.kind].includes(c.type));
}

/** What's still yours to decide (queued actions left out). */
export const openDecisions = (data: HqResponse, filter: Filter) => decisionQueue(data, filter).filter((i) => !isQueued(data, i));

export function decisionQueue(data: HqResponse, filter: Filter): QueueItem[] {
  const snap = data.snapshot;
  const replies: QueueItem[] = (snap?.inbox?.replies ?? [])
    .filter((r) => !r.approved && inFilter(filter, r.business))
    .map((reply) => ({ kind: "reply", key: `r-${reply.leadId}`, at: reply.at, business: reply.business, reply }));
  const gmail: QueueItem[] = replyBoard(data, (r) => inFilter(filter, r.business)).board.map((item) => ({ kind: "gmail", key: `g-${triageKey(item.reply)}`, at: item.reply.at, business: item.reply.business, item }));
  const posts = (snap?.posts ?? []).filter((p) => DECIDE.includes(p.status) && inFilter(filter, p.brand));
  const fixes: QueueItem[] = posts.filter((p) => p.status !== "drafted").map((post) => ({ kind: "post", key: `p-${post.id}`, at: post.updatedAt, business: post.brand, post }));
  const drafts: QueueItem[] = posts
    .filter((p) => p.status === "drafted")
    .sort((a, b) => (a.suggestedFor ?? Infinity) - (b.suggestedFor ?? Infinity) || a.updatedAt - b.updatedAt)
    .map((post) => ({ kind: "post", key: `p-${post.id}`, at: post.updatedAt, business: post.brand, post }));
  const pitches: QueueItem[] = (snap?.inbox?.pitches ?? []).filter((p) => inFilter(filter, p.business)).map((pitch) => ({ kind: "pitch", key: `c-${pitch.leadId}`, at: pitch.at, business: pitch.business, pitch }));
  const oldest = (a: QueueItem, b: QueueItem) => a.at - b.at;
  return [...[...replies, ...gmail].sort(oldest), ...fixes.sort(oldest), ...drafts, ...pitches.sort(oldest)];
}

/** The one-line version of an item, for rows and the Today card. */
export function describe(i: QueueItem): { label: string; title: string; detail: string } {
  switch (i.kind) {
    case "reply":
      return { label: "Reply", title: `${i.reply.businessName} wrote back`, detail: i.reply.text.replace(/\s+/g, " ") };
    case "gmail": {
      const { reply: r, state, triage, decision } = i.item;
      const todo = state === "approved" ? decision?.title ?? triage?.subtask?.title : state === "proposed" ? triage?.subtask?.title : null;
      return { label: state === "approved" ? "To do" : "Reply", title: `${r.name || r.from} wrote back`, detail: todo ?? r.snippet };
    }
    case "post":
      return { label: i.post.status === "drafted" ? "Post" : "Fix post", title: i.post.headline, detail: i.post.warnings[0] ?? i.post.error ?? i.post.caption.replace(/\s+/g, " ") };
    case "pitch":
      return { label: i.pitch.followUp ? "Follow-up" : "Pitch", title: i.pitch.businessName, detail: i.pitch.subject };
  }
}
