import type { WorkflowSummary } from "./types";

/**
 * The agents' recent runs, from GitHub's public API (both repositories are
 * public). Cached for five minutes so the dashboard stays well inside the
 * unauthenticated rate limit.
 */

const WATCHED: Array<{ repo: string; file: string; name: string; job: string; cron: string }> = [
  { repo: "Aldo140/Calgary-Watch-", file: "ops-hourly.yml", cron: "7,22,37,52 * * * *", name: "Operations hourly", job: "Applies your HQ actions, publishes due posts, reads replies and sends approved email." },
  { repo: "Aldo140/Calgary-Watch-", file: "ops-daily.yml", cron: "5 9,12,13,14 * * *", name: "Operations daily", job: "Drafts posts, runs the Scout and inspiration analysis, finds leads, checks health." },
  { repo: "Aldo140/Calgary-Watch-", file: "ops-maintenance.yml", cron: "40 9 * * *", name: "Nightly maintenance", job: "Type check, tests and audit; opens a fix pull request when something breaks." },
  { repo: "Aldo140/ArctosLaunchpad", file: "outreach.yml", cron: "11,26,41,56 14-23 * * 1-5", name: "Arctos outreach", job: "Sends the queued Arctos emails through Brevo, weekdays 9 to 4:30." },
  { repo: "Aldo140/Calgary-Watch-", file: "weekly-digest.yml", cron: "0 15 * * 1", name: "Monday digest", job: "CalgaryWatch's weekly email to members." },
  { repo: "Aldo140/Calgary-Watch-", file: "events-digest.yml", cron: "0 14 * * 4", name: "Thursday event picks", job: "CalgaryWatch's event email." },
  { repo: "Aldo140/Calgary-Watch-", file: "sync-email-replies.yml", cron: "7/10 * * * *", name: "Digest replies", job: "Reads replies to CalgaryWatch emails into the admin inbox." },
  { repo: "Aldo140/Calgary-Watch-", file: "ingest-discovery.yml", cron: "17 */6 * * *", name: "Event ingestion", job: "Pulls Calgary events from the organizers' own calendars." },
  { repo: "Aldo140/Calgary-Watch-", file: "ingest-live-data.yml", cron: "13,43 * * * *", name: "Live data", job: "Incidents, traffic and outages for the CalgaryWatch map." },
  { repo: "Aldo140/Calgary-Watch-", file: "deploy-firebase.yml", cron: "41 11,23 * * *", name: "CalgaryWatch deploy", job: "Rebuilds and publishes calgarywatch.ca." },
];

type Run = { status: string; conclusion: string | null; created_at: string; run_started_at?: string; updated_at: string; html_url: string; event: string };

const statusOf = (r: Run): WorkflowSummary["lastStatus"] =>
  r.status === "in_progress" ? "running" : r.status !== "completed" ? "queued" : r.conclusion === "success" ? "success" : r.conclusion === "failure" || r.conclusion === "timed_out" ? "failure" : r.conclusion === "cancelled" ? "cancelled" : r.conclusion === "skipped" ? "skipped" : "unknown";

export async function workflowSummaries(): Promise<WorkflowSummary[]> {
  return Promise.all(
    WATCHED.map(async (w) => {
      const r = await fetch(`https://api.github.com/repos/${w.repo}/actions/workflows/${w.file}/runs?per_page=30`, {
        headers: { Accept: "application/vnd.github+json", "User-Agent": "arctos-hq" },
        next: { revalidate: 300 },
      });
      if (!r.ok) return { ...w, lastRunAt: null, lastStatus: "unknown" as const, lastDurationSec: null, lastUrl: null, recent: [], runs: [] };
      const runs = ((await r.json()) as { workflow_runs?: Run[] }).workflow_runs ?? [];
      const last = runs[0];
      const started = last ? Date.parse(last.run_started_at ?? last.created_at) : null;
      return {
        ...w,
        lastRunAt: started,
        lastStatus: last ? statusOf(last) : ("unknown" as const),
        lastDurationSec: last && last.status === "completed" && started ? Math.round((Date.parse(last.updated_at) - started) / 1000) : null,
        lastUrl: last?.html_url ?? null,
        recent: runs.slice(0, 12).map(statusOf).reverse(),
        runs: runs.map((x) => {
          const at = Date.parse(x.run_started_at ?? x.created_at);
          return { at, end: x.status === "completed" ? Date.parse(x.updated_at) : null, status: statusOf(x), url: x.html_url, event: x.event };
        }),
      };
    }),
  );
}
