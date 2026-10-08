import type { CommandType, GmailSummary, HqSnapshot } from "./types";

/**
 * HQ over Telegram, the pure half: who may use the bot, what the buttons
 * carry, and the messages it sends. No network here (the webhook is
 * app/api/hq/telegram/route.ts), so ops/tests can cover it.
 */

/** HQ_TELEGRAM_USERS: "telegramUserId=email,…". Only these accounts get answers; the email signs their actions. */
export function telegramUsers(raw: string | undefined): Map<number, string> {
  const users = new Map<number, string>();
  for (const pair of (raw ?? "").split(",")) {
    const [id, email] = pair.split("=").map((s) => s.trim());
    if (/^\d+$/.test(id ?? "") && email?.includes("@")) users.set(Number(id), email.toLowerCase());
  }
  return users;
}

/* Button payloads. Telegram allows 64 bytes, so each command type has a two-letter code. */
const CODES: Record<CommandType, string> = {
  "approve-post": "ap", "reject-post": "rp", "redraft-post": "dp", "unschedule-post": "up",
  "approve-pitch": "ai", "skip-pitch": "si",
  "approve-reply": "ar", "handled-reply": "hr",
};
const TYPES = Object.fromEntries(Object.entries(CODES).map(([t, c]) => [c, t as CommandType]));

export type ButtonAction = { kind: "queue"; type: CommandType; targetId: string } | { kind: "undo"; commandId: string };

export function encodeQueue(type: CommandType, targetId: string): string | null {
  const data = `q:${CODES[type]}:${targetId}`;
  return Buffer.byteLength(data) <= 64 ? data : null;
}
export const encodeUndo = (commandId: string) => `u:${commandId}`;

export function decodeButton(data: string): ButtonAction | null {
  const q = /^q:([a-z]{2}):(.+)$/.exec(data);
  if (q && TYPES[q[1]]) return { kind: "queue", type: TYPES[q[1]], targetId: q[2] };
  const u = /^u:([\w-]{1,100})$/.exec(data);
  return u ? { kind: "undo", commandId: u[1] } : null;
}

export const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const clip = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);

const BUSINESS: Record<string, string> = { calgarywatch: "CalgaryWatch", calgarydaily: "Calgary Daily", vowmotion: "Vow Motion", arctos: "Arctos", other: "Other" };

export function ago(t: number, now: number): string {
  const m = Math.max(0, Math.round((now - t) / 60_000));
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

export const HELP = [
  "<b>HQ</b> on your phone.",
  "",
  "/today: what's waiting on you",
  "/inbox: posts, pitches and replies to approve, one tap each",
  "",
  "Or just ask, like <i>how did Calgary Daily do this week?</i> or <i>who replied to a pitch today?</i>",
  "",
  "Approvals go to the same queue as the dashboard. The agents apply them at :07 and :37, so Undo works until then.",
].join("\n");

/** Gmail replies from real people nobody has answered yet. */
export const unansweredMail = (gmail: GmailSummary | null) => (gmail?.replies ?? []).filter((r) => r.kind === "reply" && !r.answered);

/** The /today message. */
export function briefing(snapshot: HqSnapshot | null, gmail: GmailSummary | null, now: number): string {
  if (!snapshot) return "The agents haven't published a report yet, so there's nothing to show.";
  const lines: string[] = [`<b>HQ</b> · report from ${ago(snapshot.generatedAt, now)}`];

  const posts = (snapshot.posts ?? []).filter((p) => ["drafted", "needs-correction", "failed"].includes(p.status));
  const replies = (snapshot.inbox?.replies ?? []).filter((r) => !r.approved);
  const pitches = snapshot.inbox?.pitches ?? [];
  const mail = unansweredMail(gmail);
  const counts = [
    posts.length && `${posts.length} post${posts.length === 1 ? "" : "s"} to review`,
    pitches.length && `${pitches.length} pitch${pitches.length === 1 ? "" : "es"} to approve`,
    replies.length && `${replies.length} drafted repl${replies.length === 1 ? "y" : "ies"}`,
    mail.length && `${mail.length} unanswered email${mail.length === 1 ? "" : "s"}`,
  ].filter(Boolean);
  lines.push("", counts.length ? `Waiting on you: ${counts.join(", ")}. /inbox` : "Nothing is waiting on you.");

  if (snapshot.today.length) {
    lines.push("", "<b>Today</b>");
    for (const t of snapshot.today.slice(0, 8)) lines.push(`• ${escapeHtml(BUSINESS[t.business] ?? t.business)}: ${escapeHtml(clip(t.title, 90))}`);
    if (snapshot.today.length > 8) lines.push(`…and ${snapshot.today.length - 8} more`);
  }

  if (mail.length) {
    lines.push("", "<b>Unanswered email</b>");
    for (const r of mail.slice(0, 5)) lines.push(`• ${escapeHtml(r.name || r.from)} (${escapeHtml(BUSINESS[r.business] ?? r.business)}), ${ago(r.at, now)}: ${escapeHtml(clip(r.subject, 60))}`);
  }

  const bad = snapshot.bottlenecks.filter((b) => b.severity !== "ok");
  if (bad.length) {
    lines.push("", "<b>Needs attention</b>");
    for (const b of bad.slice(0, 5)) lines.push(`• ${b.severity === "bad" ? "🔴" : "🟡"} ${escapeHtml(b.label)}: ${escapeHtml(b.value)}`);
  }
  return lines.join("\n");
}

export interface Card {
  text: string;
  photo: string | null;
  buttons: Array<{ text: string; data: string }>;
}

function card(text: string, photo: string | null, actions: Array<[string, CommandType, string]>): Card {
  const buttons = actions.flatMap(([label, type, id]) => {
    const data = encodeQueue(type, id);
    return data ? [{ text: label, data }] : [];
  });
  return { text, photo, buttons };
}

/** The /inbox messages: one card per item, with the same actions as the dashboard's Inbox. */
export function inboxCards(snapshot: HqSnapshot | null, gmail: GmailSummary | null, now: number): Card[] {
  if (!snapshot) return [];
  const cards: Card[] = [];
  for (const p of (snapshot.posts ?? []).filter((x) => ["drafted", "needs-correction", "failed"].includes(x.status))) {
    const flag = p.status === "drafted" ? "" : `\n⚠️ ${escapeHtml(p.error ?? p.warnings[0] ?? p.status)}`;
    cards.push(card(
      `📝 <b>${escapeHtml(BUSINESS[p.brand] ?? p.brand)} post</b>: ${escapeHtml(p.headline)}${flag}\n\n${escapeHtml(clip(p.caption, 700))}`,
      p.imageUrl ?? p.imageUrls[0] ?? null,
      [["Approve", "approve-post", p.id], ["Reject", "reject-post", p.id]],
    ));
  }
  for (const p of snapshot.inbox?.pitches ?? []) {
    cards.push(card(
      `✉️ <b>${p.followUp ? "Follow-up" : "Pitch"} to ${escapeHtml(p.businessName)}</b> (${escapeHtml(p.contactEmail ?? "no email")})\n<i>${escapeHtml(p.subject)}</i>\n\n${escapeHtml(clip(p.body, 900))}`,
      null,
      [["Send pitch", "approve-pitch", p.leadId], ["Skip", "skip-pitch", p.leadId]],
    ));
  }
  for (const r of (snapshot.inbox?.replies ?? []).filter((x) => !x.approved)) {
    cards.push(card(
      `💬 <b>${escapeHtml(r.businessName)} replied</b> ${ago(r.at, now)} (${escapeHtml(r.classification)})\n“${escapeHtml(clip(r.text, 400))}”\n\n<b>Drafted answer</b>\n${escapeHtml(clip(r.suggestedBody, 900))}`,
      null,
      [["Send reply", "approve-reply", r.leadId], ["Handled", "handled-reply", r.leadId]],
    ));
  }
  // Gmail replies have no agent behind them yet: a link to open the thread is the action.
  for (const r of unansweredMail(gmail).slice(0, 5)) {
    cards.push({
      text: `📬 <b>${escapeHtml(r.name || r.from)}</b> wrote to ${escapeHtml(BUSINESS[r.business] ?? r.business)} ${ago(r.at, now)}\n<i>${escapeHtml(r.subject)}</i>\n${escapeHtml(r.snippet)}\n\n<a href="${escapeHtml(r.url)}">Open in Gmail</a>`,
      photo: null,
      buttons: [],
    });
  }
  return cards;
}

/** Telegram caps a message at 4096 characters; split on line breaks. */
export function chunks(text: string, max = 4000): string[] {
  const out: string[] = [];
  let current = "";
  for (const line of text.split("\n")) {
    if (current && current.length + line.length + 1 > max) {
      out.push(current);
      current = "";
    }
    current = current ? `${current}\n${line}` : line;
    while (current.length > max) {
      out.push(current.slice(0, max));
      current = current.slice(max);
    }
  }
  if (current) out.push(current);
  return out;
}

function omit<T extends object, K extends keyof T>(o: T, keys: K[]): Omit<T, K> {
  const copy = { ...o };
  for (const k of keys) delete copy[k];
  return copy;
}

/**
 * The report Claude reads to answer a question, without what it can't use
 * (image URLs, alt text). Sections are dropped whole, largest last-resort
 * first, only if the report would be too long to send.
 */
export function reportForQuestion(snapshot: HqSnapshot | null, gmail: GmailSummary | null, maxChars = 300_000): { json: string; omitted: string[] } {
  const slim = snapshot && {
    ...snapshot,
    posts: snapshot.posts?.map((p) => omit(p, ["imageUrl", "imageUrls", "videoUrl", "altText"])),
    instagram: snapshot.instagram && {
      ...snapshot.instagram,
      accounts: snapshot.instagram.accounts.map((a) => ({ ...a, recent: a.recent.map((r) => omit(r, ["mediaUrl"])) })),
      inspiration: snapshot.instagram.inspiration.map((o) => omit(o, ["mediaUrl"])),
    },
  };
  const report: Record<string, unknown> = { snapshot: slim, gmail };
  const omitted: string[] = [];
  const drops: Array<[string, () => void]> = [
    ["lead list", () => slim && (slim.pipelineDetail = undefined)],
    ["Instagram inspiration", () => slim && (slim.instagram = undefined)],
    ["Gmail sends", () => (report.gmail = gmail && { ...gmail, sends: [] })],
  ];
  let json = JSON.stringify(report);
  for (const [label, drop] of drops) {
    if (json.length <= maxChars) break;
    drop();
    omitted.push(label);
    json = JSON.stringify(report);
  }
  return { json, omitted };
}
