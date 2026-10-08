import type { Business, HqResponse, WorkflowSummary } from "@/lib/hq/types";
import { COMMAND_LABEL } from "./context";
import { slot } from "./format";

/**
 * Every recurring job the agents do, and the proof that each one actually
 * happened today. A green workflow only says the code ran; a routine is
 * "confirmed" when its result shows up in the data (an email in the send log,
 * a post live on Instagram, a fresh Scout read).
 */

const MIN = 60_000;
const DAY = 86_400_000;
const TZ = "America/Edmonton";

/* ---------- time ---------- */

export function calgaryDayStart(now: number): number {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, hour: "numeric", minute: "numeric", second: "numeric", hour12: false }).formatToParts(new Date(now));
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return now - (((g("hour") % 24) * 60 + g("minute")) * 60 + g("second")) * 1000 - (now % 1000);
}

/** "5:02 pm" today, "Mon 5:02 pm" otherwise. */
export function clock(t: number | null | undefined, now: number): string {
  if (!t) return "—";
  const s = slot(t);
  const start = calgaryDayStart(now);
  return t >= start && t < start + DAY ? s.slice(s.indexOf(" ") + 1) : s;
}

/* ---------- cron (UTC, the five standard fields) ---------- */

type Cron = { min: number[]; hour: number[]; dom: Set<number>; mon: Set<number>; dow: Set<number>; domAny: boolean; dowAny: boolean };

function field(src: string, lo: number, hi: number): number[] {
  const out = new Set<number>();
  for (const part of src.split(",")) {
    const [range, stepS] = part.split("/");
    const step = stepS ? Number(stepS) : 1;
    let a = lo;
    let b = hi;
    if (range !== "*") {
      const [x, y] = range.split("-").map(Number);
      a = x;
      b = y ?? (stepS ? hi : x);
    }
    for (let v = a; v <= b; v += step) out.add(v === 7 && hi === 6 ? 0 : v);
  }
  return [...out].sort((m, n) => m - n);
}

const cache = new Map<string, Cron | null>();
function parse(expr: string): Cron | null {
  if (cache.has(expr)) return cache.get(expr)!;
  const f = expr.trim().split(/\s+/);
  const c =
    f.length === 5
      ? { min: field(f[0], 0, 59), hour: field(f[1], 0, 23), dom: new Set(field(f[2], 1, 31)), mon: new Set(field(f[3], 1, 12)), dow: new Set(field(f[4], 0, 6)), domAny: f[2] === "*", dowAny: f[4] === "*" }
      : null;
  cache.set(expr, c);
  return c;
}

function dayMatches(c: Cron, d: Date): boolean {
  if (!c.mon.has(d.getUTCMonth() + 1)) return false;
  const dom = c.dom.has(d.getUTCDate());
  const dow = c.dow.has(d.getUTCDay());
  if (c.domAny && c.dowAny) return true;
  if (c.domAny) return dow;
  if (c.dowAny) return dom;
  return dom || dow;
}

/** The scheduled fire nearest to t, after it (dir 1) or at/before it (dir -1). */
export function cronFire(expr: string, t: number, dir: 1 | -1): number | null {
  const c = parse(expr);
  if (!c) return null;
  const midnight = Math.floor(t / DAY) * DAY;
  const hours = dir === 1 ? c.hour : [...c.hour].reverse();
  const mins = dir === 1 ? c.min : [...c.min].reverse();
  for (let i = 0; i <= 8; i++) {
    const day = midnight + dir * i * DAY;
    if (!dayMatches(c, new Date(day))) continue;
    for (const h of hours) {
      for (const m of mins) {
        const at = day + (h * 60 + m) * MIN;
        if (dir === 1 ? at > t : at <= t) return at;
      }
    }
  }
  return null;
}

/* ---------- the catalogue ---------- */

export type Owner = Business | "shared";
export interface ProofItem { at: number; text: string; href?: string | null }
export interface Proof { confirmed: boolean; headline: string; items: ProofItem[] }
interface ProofCtx { data: HqResponse; dayStart: number; now: number }

export interface Routine {
  id: string;
  owner: Owner;
  title: string;
  cadence: string;
  /** What "done" means, in one line. */
  done: string;
  workflow?: string;
  proof?: (c: ProofCtx) => Proof;
  /** Not running yet: what it waits on. */
  setup?: string;
}

const today = <T extends { at: number }>(xs: T[], dayStart: number) => xs.filter((x) => x.at >= dayStart).sort((a, b) => b.at - a.at);
const n = (k: number, one: string, many = `${one}s`) => `${k} ${k === 1 ? one : many}`;

function activityProof(type: string, business: Business, one: string, many?: string) {
  return ({ data, dayStart }: ProofCtx): Proof => {
    const items = today((data.snapshot?.activity ?? []).filter((a) => a.type === type && a.business === business), dayStart).map((a) => ({ at: a.at, text: a.text }));
    return { confirmed: items.length > 0, headline: items.length ? `${n(items.length, one, many)} today` : `no ${many ?? `${one}s`} today`, items };
  };
}

export const ROUTINES: Routine[] = [
  {
    id: "cd-draft", owner: "calgarydaily", title: "Draft the day's posts", cadence: "Daily, early morning", workflow: "ops-daily.yml",
    done: "Today's posts are written, designed and queued for a slot.",
    proof: ({ data, dayStart }) => {
      const items = today((data.snapshot?.posts ?? []).filter((p) => p.brand === "calgarydaily" && ["drafted", "approved", "needs-correction"].includes(p.status)).map((p) => ({ at: p.updatedAt, text: `${p.status === "approved" ? "Queued" : "Waiting for you"} · ${p.headline}` })), dayStart);
      return { confirmed: items.length > 0, headline: items.length ? `${n(items.length, "post")} drafted or queued` : "nothing new drafted today", items };
    },
  },
  {
    id: "cd-publish", owner: "calgarydaily", title: "Publish on schedule", cadence: "Every 30 minutes, each post at its slot", workflow: "ops-hourly.yml",
    done: "Every approved post is live on Instagram at its slot.",
    proof: ({ data, dayStart, now }) => {
      const posts = data.snapshot?.posts ?? [];
      const items = today(posts.filter((p) => p.brand === "calgarydaily" && p.status === "published" && p.publishedAt).map((p) => ({ at: p.publishedAt!, text: `Live · ${p.headline}`, href: p.permalink })), dayStart);
      const later = posts.filter((p) => p.status === "approved" && p.scheduledFor && p.scheduledFor > now && p.scheduledFor < dayStart + DAY).length;
      return {
        confirmed: items.length > 0 && items.every((i) => i.href),
        headline: `${items.length ? `${n(items.length, "post")} live on Instagram` : "nothing published yet today"}${later ? ` · ${later} more later today` : ""}`,
        items,
      };
    },
  },
  {
    id: "cw-outreach", owner: "calgarywatch", title: "Partner outreach", cadence: "Every 30 minutes, approved emails only", workflow: "ops-hourly.yml",
    done: "Every pitch and follow-up you approved has gone out from aldo@calgarywatch.ca.",
    proof: activityProof("Email sent", "calgarywatch", "email sent", "emails sent"),
  },
  {
    id: "cw-replies", owner: "calgarywatch", title: "Read partner replies", cadence: "Every 30 minutes", workflow: "ops-hourly.yml",
    done: "Replies are read, sorted and drafted for you; opt-outs are honoured.",
    proof: activityProof("Reply received", "calgarywatch", "reply", "replies"),
  },
  {
    id: "cw-leads", owner: "calgarywatch", title: "Find new partner leads", cadence: "Daily", workflow: "ops-daily.yml",
    done: "New Calgary businesses are found and pitches drafted for your approval.",
    proof: activityProof("Lead found", "calgarywatch", "lead found", "leads found"),
  },
  { id: "cw-live", owner: "calgarywatch", title: "Live map data", cadence: "Every 30 minutes", workflow: "ingest-live-data.yml", done: "Incidents, traffic and outages are current on the map." },
  { id: "cw-events", owner: "calgarywatch", title: "Event ingestion", cadence: "Every 6 hours", workflow: "ingest-discovery.yml", done: "New events from organizers' own calendars are in." },
  { id: "cw-digest-replies", owner: "calgarywatch", title: "Member email replies", cadence: "Every 10 minutes", workflow: "sync-email-replies.yml", done: "Replies to CalgaryWatch emails are in the admin inbox." },
  { id: "cw-monday", owner: "calgarywatch", title: "Monday digest", cadence: "Mondays, 9 am", workflow: "weekly-digest.yml", done: "The weekly email went to every member." },
  { id: "cw-thursday", owner: "calgarywatch", title: "Thursday event picks", cadence: "Thursdays, 8 am", workflow: "events-digest.yml", done: "The event email went out." },
  { id: "cw-deploy", owner: "calgarywatch", title: "Site rebuild", cadence: "Twice a day", workflow: "deploy-firebase.yml", done: "calgarywatch.ca is rebuilt with the latest events." },
  {
    id: "ar-outreach", owner: "arctos", title: "Arctos outreach", cadence: "Weekdays, every 15 minutes, 8 am to 6 pm", workflow: "outreach.yml",
    done: "The day's queued emails have gone out from aldo@arctoslaunchpad.com.",
    proof: ({ data, dayStart }) => {
      const a = data.arctos;
      const items = today((a?.sends ?? []).map((s) => ({ at: s.at, text: `${s.business} · ${s.subject}` })), dayStart);
      return { confirmed: items.length > 0, headline: items.length ? `${n(items.length, "email")} in the send log today` : "nothing sent yet today", items };
    },
  },
  { id: "ar-instagram", owner: "arctos", title: "Post to @arctoslaunchpad", cadence: "Planned", done: "Posts drafted in the Arctos voice, approved here, published on schedule.", setup: "Needs the @arctoslaunchpad Instagram token." },
  {
    id: "vm-outreach", owner: "vowmotion", title: "Vow Motion outreach, 15 a day", cadence: "Weekdays, from Gmail",
    done: "Up to fifteen planners pitched from aldo@vowmotionweddings.com, every reply answered.",
    proof: ({ data, dayStart }) => {
      if (!data.gmail) return { confirmed: false, headline: "waiting for the Gmail sync", items: [] };
      const items = today(data.gmail.sends.filter((s) => s.business === "vowmotion" && s.first).map((s) => ({ at: s.at, text: `${s.domain} · ${s.subject}`, href: s.url })), dayStart);
      const wrong = data.gmail.sends.filter((s) => s.wrongAlias === "vowmotion" && s.at >= dayStart).length;
      return { confirmed: items.length > 0, headline: `${items.length ? `${n(items.length, "pitch", "pitches")} today` : "no pitches yet today"}${items.length > 15 ? " · over 15" : ""}${wrong ? ` · ${wrong} from the wrong address` : ""}`, items };
    },
  },
  {
    id: "sh-gmail", owner: "shared", title: "Gmail sync", cadence: "Every 15 minutes, inside Gmail",
    done: "Every pitch, reply, opt-out and bounce from the send-as addresses is counted here.",
    proof: ({ data, now }) => {
      const at = data.gmail?.generatedAt ?? 0;
      return { confirmed: at > now - 45 * 60_000, headline: at ? `last sync ${clock(at, now)}` : "not set up yet", items: [] };
    },
  },
  { id: "vm-instagram", owner: "vowmotion", title: "Post to @vowmotion", cadence: "Planned", done: "Wedding films cut into posts, approved here, published on schedule.", setup: "Needs the @vowmotion Instagram token." },
  {
    id: "sh-actions", owner: "shared", title: "Apply your HQ actions", cadence: "Every 30 minutes", workflow: "ops-hourly.yml",
    done: "Everything you approved, rejected or redrafted here has been carried out.",
    proof: ({ data, dayStart }) => {
      const done = today(data.commands.filter((c) => c.status !== "pending").map((c) => ({ at: c.appliedAt ?? c.at, text: `${COMMAND_LABEL[c.type]}${c.status === "failed" ? " · not applied" : ""}${c.result ? ` · ${c.result}` : ""}` })), dayStart);
      const waiting = data.commands.filter((c) => c.status === "pending").length;
      return { confirmed: done.length > 0 && !waiting, headline: `${done.length ? `${n(done.length, "action")} applied today` : "no actions today"}${waiting ? ` · ${waiting} waiting for the next run` : ""}`, items: done };
    },
  },
  {
    id: "sh-report", owner: "shared", title: "Report to HQ", cadence: "Every run", workflow: "ops-hourly.yml",
    done: "This dashboard's numbers are fresh.",
    proof: ({ data, dayStart, now }) => {
      const at = data.snapshot?.generatedAt ?? 0;
      return { confirmed: at >= dayStart, headline: at ? `last report ${clock(at, now)}` : "no report yet", items: [] };
    },
  },
  {
    id: "sh-scout", owner: "shared", title: "Scout and inspiration", cadence: "Daily", workflow: "ops-daily.yml",
    done: "All four accounts and the watch list are read; outperformers analysed for ideas.",
    proof: ({ data, dayStart }) => {
      const ig = data.snapshot?.instagram;
      const at = ig?.updatedAt ?? 0;
      const ideas = ig?.analysis?.ideas.length ?? 0;
      return {
        confirmed: at >= dayStart,
        headline: at >= dayStart ? `${n(ig?.accounts.length ?? 0, "account")} read · ${n(ig?.inspiration.length ?? 0, "outperformer")}${ideas ? ` · ${n(ideas, "idea")}` : ""}` : "not read yet today",
        items: at ? [{ at, text: "Scout read finished" }] : [],
      };
    },
  },
  {
    id: "sh-health", owner: "shared", title: "Health check", cadence: "Daily", workflow: "ops-daily.yml",
    done: "Every token, key and connection is tested.",
    proof: ({ data, dayStart }) => {
      const h = data.snapshot?.health;
      const ok = h?.items.filter((i) => i.ok).length ?? 0;
      const total = h?.items.length ?? 0;
      return {
        confirmed: !!h && h.checkedAt >= dayStart && ok === total,
        headline: h ? `${ok} of ${total} connections healthy` : "not checked yet",
        items: (h?.items ?? []).filter((i) => !i.ok).map((i) => ({ at: h!.checkedAt, text: `${i.label} · ${i.detail}` })),
      };
    },
  },
  { id: "sh-clock", owner: "shared", title: "Keep the agents on time", cadence: "Always on, one run every 6 hours", workflow: "ops-clock.yml", done: "The clock is awake and starting hourly and daily runs on schedule, not when GitHub gets to it." },
  { id: "sh-maintenance", owner: "shared", title: "Nightly maintenance", cadence: "Nightly, 3:40 am", workflow: "ops-maintenance.yml", done: "Type check, tests and audit pass; a fix pull request opens if not." },
];

export const OWNER_LABEL: Record<Owner, string> = { calgarydaily: "CalgaryDaily", calgarywatch: "CalgaryWatch", arctos: "Arctos Launchpad", vowmotion: "Vow Motion", shared: "Across the businesses" };
export const OWNER_ORDER: Owner[] = ["calgarydaily", "calgarywatch", "arctos", "vowmotion", "shared"];

/* ---------- evaluation ---------- */

export type TaskState = "confirmed" | "done" | "running" | "late" | "failed" | "missed" | "later" | "setup" | "unknown";
export const STATE: Record<TaskState, { label: string; sev: "ok" | "warn" | "bad" | "idle" }> = {
  confirmed: { label: "Confirmed", sev: "ok" },
  done: { label: "Ran clean", sev: "ok" },
  running: { label: "Running", sev: "warn" },
  late: { label: "Running late", sev: "warn" },
  failed: { label: "Failed", sev: "bad" },
  missed: { label: "Missed", sev: "bad" },
  later: { label: "Not due yet", sev: "idle" },
  setup: { label: "Not set up", sev: "idle" },
  unknown: { label: "No data", sev: "idle" },
};

export interface TaskStatus {
  routine: Routine;
  state: TaskState;
  line: string;
  proof: Proof | null;
  next: number | null;
  wf: WorkflowSummary | null;
  runsToday: WorkflowSummary["runs"];
}

export function evaluate(routine: Routine, data: HqResponse, now: number): TaskStatus {
  const dayStart = calgaryDayStart(now);
  const wf = routine.workflow ? (data.workflows ?? []).find((w) => w.file === routine.workflow) ?? null : null;
  const proof = routine.proof ? routine.proof({ data, dayStart, now }) : null;
  const base = { routine, proof, wf, next: wf ? cronFire(wf.cron, now, 1) : null, runsToday: (wf?.runs ?? []).filter((r) => r.at >= dayStart) };
  if (routine.setup) return { ...base, state: "setup", line: routine.setup };
  // Work done by hand or outside GitHub: judged by its proof alone.
  if (!routine.workflow && proof) return { ...base, state: proof.confirmed ? "confirmed" : proof.headline.startsWith("not set up") || proof.headline.startsWith("waiting") ? "setup" : "later", line: proof.headline };
  if (!wf || !wf.runs.length) return { ...base, state: "unknown", line: proof ? `No run history from GitHub · ${proof.headline}` : "Couldn't read the run history from GitHub." };

  const finished = wf.runs.find((r) => r.status === "success" || r.status === "failure");
  const latest = wf.runs[0];
  const firedToday = (cronFire(wf.cron, now, -1) ?? 0) >= dayStart;
  const tail = proof ? ` · ${proof.headline}` : "";

  if (finished?.status === "failure") return { ...base, state: "failed", line: `Failed ${clock(finished.end ?? finished.at, now)}${base.next ? ` · retries ${clock(base.next, now)}` : ""}` };
  if (latest?.status === "running") return { ...base, state: "running", line: `Running now, started ${clock(latest.at, now)}${tail}` };
  if (latest?.status === "queued") return { ...base, state: latest.at < now - 3 * 3_600_000 ? "late" : "running", line: `Waiting for GitHub since ${clock(latest.at, now)}${tail}` };

  // GitHub starts scheduled runs late, and drops some. Measure from the first fire after the last run.
  const owed = cronFire(wf.cron, latest?.at ?? now - 7 * DAY, 1);
  const overdue = owed && owed < now ? now - owed : 0;
  const lateNote = overdue > 45 * MIN ? ` · next run ${Math.round(overdue / 3_600_000) || 1} h overdue` : "";
  if (overdue > DAY) return { ...base, state: "missed", line: `Hasn't run since ${clock(latest?.at, now)}; due ${clock(owed, now)}` };
  if (!firedToday && !base.runsToday.length) return { ...base, state: "later", line: `${base.next && base.next < dayStart + DAY ? `Due ${clock(base.next, now)}` : "Not due today"}${finished ? ` · last completed ${clock(finished.end ?? finished.at, now)}` : ""}` };
  const at = clock(finished?.end ?? finished?.at, now);
  if (proof?.confirmed) return { ...base, state: "confirmed", line: `Completed ${at} · confirmed: ${proof.headline}${lateNote}` };
  if (overdue > 45 * MIN) return { ...base, state: "late", line: `Due ${clock(owed, now)}, GitHub hasn't started it${finished ? ` · last completed ${at}` : ""}${tail}` };
  if (finished) return { ...base, state: "done", line: `Completed ${at}${tail || " · ran clean"}` };
  return { ...base, state: "unknown", line: "No runs yet" };
}

/** Scheduled fires in the last 24 hours versus runs GitHub actually started. */
export function reliability(wf: WorkflowSummary, now: number): { expected: number; actual: number; medianDelayMin: number | null } {
  let expected = 0;
  const delays: number[] = [];
  for (let f = cronFire(wf.cron, now - DAY, 1); f && f <= now && expected < 300; f = cronFire(wf.cron, f, 1)) expected++;
  const runs = wf.runs.filter((r) => r.event === "schedule" && r.at > now - DAY);
  for (const r of runs) {
    const fire = cronFire(wf.cron, r.at, -1);
    if (fire) delays.push((r.at - fire) / MIN);
  }
  delays.sort((a, b) => a - b);
  return { expected, actual: runs.length, medianDelayMin: delays.length ? Math.round(delays[Math.floor(delays.length / 2)]) : null };
}

export const evaluateAll = (data: HqResponse, now: number) => ROUTINES.map((r) => evaluate(r, data, now));
