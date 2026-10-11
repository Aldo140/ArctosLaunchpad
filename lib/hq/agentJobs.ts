import { escapeHtml } from "./telegramBot";

/**
 * Jobs for the HQ agent: work too big for a text answer (change the site or
 * HQ and push it to main, dig through the calgarywatch.ca inbox). The bot
 * saves one to hq_agent_jobs; the ops clock starts hq-agent.yml for it within
 * a minute; Claude Code does the work on a GitHub runner; the result comes back
 * as a Telegram message (app/api/hq/agent/notify). A job either changes code
 * or reads email, never both, so nothing in an email can become code on main
 * (.github/workflows/hq-agent.yml). Pure, so ops/tests covers it.
 */

export const AGENT_COLLECTION = "hq_agent_jobs";

/** code: change the site/HQ and push to main. mail: read Aldo's email to answer. Never both in one job. */
export type AgentJobKind = "code" | "mail";
export const isJobKind = (k: unknown): k is AgentJobKind => k === "code" || k === "mail";

export type AgentJobStatus = "pending" | "queued" | "running" | "pushed" | "answered" | "checks-failed" | "failed";

export interface AgentJob {
  id: string;
  kind: AgentJobKind;
  task: string;
  by: string;
  /** The Telegram chat that asked, so the answer goes back there. */
  chatId: number | null;
  at: number;
  status: AgentJobStatus;
  /** Claude's summary of what it did or found. */
  result: string | null;
  /** The commit on main, or the branch holding a change whose checks failed. */
  commit: string | null;
  branch: string | null;
  run: string | null;
  finishedAt: number | null;
}

export const MAX_TASK = 4000;

/** A task worth starting: trimmed, not empty, clipped to what the runner takes. */
export function cleanTask(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const task = raw.trim().slice(0, MAX_TASK);
  return task.length >= 3 ? task : null;
}

/** A Firestore document's plain values (lib/hq/google.ts readFields) as a job. */
export function jobFromFields(id: string, f: Record<string, string | number | null>): AgentJob {
  const s = (k: string) => (typeof f[k] === "string" ? (f[k] as string) : null);
  const n = (k: string) => (typeof f[k] === "number" ? (f[k] as number) : null);
  return {
    id,
    kind: s("kind") === "mail" ? "mail" : "code",
    task: s("task") ?? "",
    by: s("by") ?? "HQ",
    chatId: n("chatId"),
    at: n("at") ?? 0,
    status: (s("status") ?? "pending") as AgentJobStatus,
    result: s("result"),
    commit: s("commit"),
    branch: s("branch"),
    run: s("run"),
    finishedAt: n("finishedAt"),
  };
}

const REPO = "https://github.com/Aldo140/ArctosLaunchpad";
const clip = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);

/** The Telegram message that reports a finished job. */
export function jobMessage(job: AgentJob): string {
  const head: Record<AgentJobStatus, string> = {
    pending: "⏳ Still waiting to start",
    queued: "⏳ Starting",
    running: "⏳ Still working",
    pushed: "✅ <b>Done and pushed to main.</b> The site redeploys in a couple of minutes.",
    answered: "✅ <b>Done.</b>",
    "checks-failed": "⚠️ <b>Made the change, but the checks failed, so it's not on main.</b> It's saved on its own branch.",
    failed: "❌ <b>That job didn't finish.</b>",
  };
  const lines = [head[job.status], `<i>${escapeHtml(clip(job.task, 200))}</i>`];
  if (job.result) lines.push("", escapeHtml(clip(job.result, 3000)));
  const links = [
    job.commit && `<a href="${REPO}/commit/${encodeURIComponent(job.commit)}">the commit</a>`,
    job.branch && `<a href="${REPO}/compare/main...${escapeHtml(job.branch)}">the branch</a>`,
    job.run && `<a href="${escapeHtml(job.run)}">the run</a>`,
  ].filter(Boolean);
  if (links.length) lines.push("", `See ${links.join(" · ")}.`);
  return lines.join("\n");
}

/** What the bot says right after it hands a job over. */
export const startedMessage = (kind: AgentJobKind, task: string) =>
  `On it. I've handed this to the agent: <i>${escapeHtml(clip(task, 200))}</i>\nIt starts within a minute and texts you here when it's done.${kind === "code" ? " The change goes to main only if the checks pass." : ""}`;
