/**
 * The HQ snapshot the ops agents publish to arctos-hq (hq/snapshot). The
 * writer lives in the CalgaryWatch repository (scripts/ops/lib/hqSnapshot.ts);
 * keep these types in step with it and check `version`.
 */

export const SNAPSHOT_VERSION = 2;

export type Business = "calgarywatch" | "calgarydaily" | "vowmotion" | "arctos";
export type Severity = "ok" | "warn" | "bad";

export interface TodayItem {
  id: string;
  business: Business;
  kind: "post-review" | "post-fix" | "post-failed" | "reply" | "pitch-review" | "health";
  title: string;
  detail: string;
  since: number;
  link: string | null;
}

export interface Pipeline {
  business: Business;
  label: string;
  connected: boolean;
  note: string | null;
  stages: Array<{ key: string; label: string; count: number }>;
  sent30: number;
  replies30: number;
  interested30: number;
}

export interface HqPost {
  id: string;
  brand: Business;
  status: string;
  template: string;
  format: "image" | "carousel" | "reel";
  headline: string;
  caption: string;
  altText: string;
  imageUrl: string | null;
  imageUrls: string[];
  videoUrl: string | null;
  warnings: string[];
  facts: string;
  note: string;
  suggestedFor: number | null;
  scheduledFor: number | null;
  publishedAt: number | null;
  permalink: string | null;
  error: string | null;
  insights: { reach: number; views: number | null; likes: number; comments: number; saves: number; shares: number } | null;
  updatedAt: number;
}

export interface InboxReply {
  leadId: string;
  business: Business;
  businessName: string;
  from: string;
  subject: string;
  text: string;
  classification: string;
  suggestedSubject: string;
  suggestedBody: string;
  approved: boolean;
  at: number;
}

export interface InboxPitch {
  leadId: string;
  business: Business;
  businessName: string;
  contactEmail: string | null;
  category: string;
  neighbourhood: string;
  reasonRelevant: string;
  subject: string;
  body: string;
  followUp: boolean;
  at: number;
}

export interface ActivityItem { at: number; business: Business; type: string; text: string }

export interface LeadRow {
  id: string;
  businessName: string;
  category: string;
  neighbourhood: string;
  website: string | null;
  contactEmail: string | null;
  status: string;
  followUps: number;
  lastContactAt: number | null;
  nextFollowUpAt: number | null;
  replyClass: string | null;
  replyAt: number | null;
  createdAt: number;
}

export interface PipelineDetail {
  leads: LeadRow[];
  sendsByDay: Array<{ date: string; sent: number; replies: number }>;
  byCategory: Array<{ category: string; total: number; contacted: number; replied: number; interested: number }>;
  followUpsDue: number;
  replyRate: number | null;
  medianHoursToReply: number | null;
}

export interface OwnAccount {
  handle: string;
  business: string;
  followers: number;
  mediaCount: number;
  posts30: number;
  daysSinceLastPost: number | null;
  medianEngagement: number;
  engagementRate: number;
  reelShare: number;
  recent: Array<{ permalink: string; caption: string; mediaUrl: string | null; reel: boolean; likes: number; comments: number; at: number }>;
  trend: Array<{ date: string; followers: number }>;
}

export interface Outperformer {
  handle: string;
  permalink: string;
  caption: string;
  mediaUrl: string | null;
  reel: boolean;
  engagement: number;
  lift: number;
  at: number;
}

export interface InspirationAnalysis {
  at: number;
  patterns: Array<{ title: string; why: string; examples: string[] }>;
  ideas: Array<{ title: string; format: string; hook: string; why: string }>;
}

export interface HistoryGroup { key: string; label: string; posts: number; medianViews: number; medianEngagement: number; best: number }

export interface Bottleneck { id: string; label: string; value: string; severity: Severity; detail: string }

export interface HqSnapshot {
  version: number;
  generatedAt: number;
  today: TodayItem[];
  health: { checkedAt: number; items: Array<{ id: string; label: string; ok: boolean; detail: string }> } | null;
  calgaryDaily: {
    followers: number | null;
    followerTrend: Array<{ date: string; count: number }>;
    byFormat: HistoryGroup[];
    byOrigin: HistoryGroup[];
    byTopic: HistoryGroup[];
    top: Array<{ permalink: string; caption: string; views: number | null; likes: number; format: string; repost: boolean; at: number }>;
    avgDelayMinutes: number | null;
    queue: { waiting: number; scheduled: number; published7d: number; failed7d: number };
  } | null;
  posts?: HqPost[];
  inbox?: { replies: InboxReply[]; pitches: InboxPitch[]; at: number };
  activity?: ActivityItem[];
  pipelines: Pipeline[];
  pipelineDetail?: { calgarywatch: PipelineDetail | null };
  instagram?: { accounts: OwnAccount[]; inspiration: Outperformer[]; analysis: InspirationAnalysis | null; updatedAt: number | null };
  pipelinesAt: number;
  bottlenecks: Bottleneck[];
}

/** Arctos outreach, read from outreach/sent.json on the arctos-launchpad branch. */
export interface ArctosOutreach {
  total: number;
  last30: number;
  today: number;
  lastSentAt: number | null;
  sendsByDay: Array<{ date: string; sent: number }>;
  sends: Array<{ business: string; subject: string; at: number }>;
}

export type CommandType =
  | "approve-post" | "reject-post" | "redraft-post" | "unschedule-post"
  | "approve-pitch" | "skip-pitch"
  | "approve-reply" | "handled-reply";

export interface HqCommandRecord {
  id: string;
  type: CommandType;
  targetId: string;
  by: string;
  at: number;
  status: "pending" | "done" | "failed";
  result: string | null;
  appliedAt: number | null;
}

export interface WorkflowSummary {
  repo: string;
  file: string;
  name: string;
  job: string;
  /** The workflow's schedule, UTC, as written in the workflow file. */
  cron: string;
  lastRunAt: number | null;
  lastStatus: "success" | "failure" | "running" | "queued" | "cancelled" | "skipped" | "unknown";
  lastDurationSec: number | null;
  lastUrl: string | null;
  recent: Array<WorkflowSummary["lastStatus"]>;
  /** Newest first. */
  runs: Array<{ at: number; end: number | null; status: WorkflowSummary["lastStatus"]; url: string; event: string }>;
}

/**
 * What the Gmail sync (ops/gmail/hq-sync.gs, an Apps Script inside
 * mrotiz14@gmail.com) reports every 15 minutes: sends from each send-as
 * address and the replies to them, last 30 days. Bodies never leave Gmail;
 * replies carry a short snippet.
 */
export type MailBusiness = Business | "other";
export type ReplyKind = "reply" | "auto" | "optout" | "bounce";
export interface GmailSend {
  at: number;
  alias: string;
  /** The business the message is about (named in it), not necessarily its address's. */
  business: MailBusiness;
  to: string;
  domain: string;
  subject: string;
  /** First message of its thread: a pitch, not a reply to someone. */
  first: boolean;
  /** Sent from this other business's address by mistake (Gmail's default send-as). */
  wrongAlias: MailBusiness | null;
  replied: boolean;
  url: string;
}
export interface GmailReply {
  at: number;
  alias: string;
  business: MailBusiness;
  from: string;
  name: string;
  subject: string;
  snippet: string;
  kind: ReplyKind;
  /** A reply to one of our pitches (the thread started with us). */
  toPitch: boolean;
  answered: boolean;
  url: string;
}
export interface GmailSummary {
  generatedAt: number;
  account: string;
  days: number;
  sends: GmailSend[];
  replies: GmailReply[];
}

export interface HqResponse {
  viewer: string;
  snapshot: HqSnapshot | null;
  arctos: ArctosOutreach | null;
  commands: HqCommandRecord[];
  workflows: WorkflowSummary[] | null;
  gmail: GmailSummary | null;
  errors: string[];
}
