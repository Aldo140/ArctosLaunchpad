/**
 * The HQ snapshot the ops agents publish to arctos-hq (hq/snapshot). The
 * writer lives in the CalgaryWatch repository (scripts/ops/lib/hqSnapshot.ts);
 * keep these types in step with it and check `version`.
 */

export const SNAPSHOT_VERSION = 1;

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

export interface ScoutEntry {
  handle: string;
  kind: string;
  followers: number;
  posts30: number;
  daysSinceLastPost: number | null;
  medianEngagement: number;
  engagementRate: number;
  reelShare: number;
  active: boolean;
  top: { permalink: string; caption: string; engagement: number; reel: boolean; at: number } | null;
}

export interface HistoryGroup { key: string; label: string; posts: number; medianViews: number; medianEngagement: number; best: number }

export interface SpendDay { date: string; usd: number; calls: number; byTask: Record<string, number> }

export interface Bottleneck { id: string; label: string; value: string; severity: Severity; detail: string }

export interface HqSnapshot {
  version: number;
  generatedAt: number;
  today: TodayItem[];
  health: { checkedAt: number; items: Array<{ id: string; label: string; ok: boolean; detail: string }> } | null;
  scout: { updatedAt: number; accounts: ScoutEntry[]; unreadable: string[]; candidatesWaiting: number } | null;
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
  pipelines: Pipeline[];
  pipelinesAt: number;
  spend: { days: SpendDay[]; monthToDate: number; last7: number; last30: number };
  bottlenecks: Bottleneck[];
}

/** What you enter on the Money tab: the Anthropic balance after your last top-up. */
export interface HqSettings {
  balanceUsd: number | null;
  balanceAt: number | null;
  dailyCapUsd: number | null;
}

/** Arctos outreach, read from outreach/sent.json on the arctos-launchpad branch. */
export interface ArctosOutreach {
  total: number;
  last30: number;
  today: number;
  lastSentAt: number | null;
  recent: Array<{ business: string; subject: string; at: number }>;
}

export interface HqResponse {
  viewer: string;
  snapshot: HqSnapshot | null;
  settings: HqSettings;
  arctos: ArctosOutreach | null;
  errors: string[];
}
