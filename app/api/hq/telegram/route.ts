import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { askConfigured, askHq, type AskActions, type Done } from "@/lib/hq/ask";
import { AGENT_COLLECTION, cleanTask, startedMessage, type AgentJobKind } from "@/lib/hq/agentJobs";
import { createDoc, deleteDoc, queryRecent, readFields, setDoc } from "@/lib/hq/google";
import { addNote, addOwed, logGym, logMoney, removeLife, setNote, setOwedPaid } from "@/lib/hq/lifeWrites";
import { loadHq } from "@/lib/hq/load";
import { answerButton, ensureMenu, sendCard, sendText, sendTyping, setButtons, webhookInfo } from "@/lib/hq/telegram";
import {
  HELP, IG_NOTES, IG_NOTES_MAX, briefing, chunks, focusCard, igListCards, igNoteText, igSavedText, encodeIgForget, decodeButton, encodePaid, encodeRemove, encodeTodo, encodeTriage, encodeUndo, escapeHtml, inboxCards, loggedText, moneyCard, telegramUsers,
  type Button,
} from "@/lib/hq/telegramBot";
import type { HqData, LifeEntry } from "@/lib/hq/types";

/**
 * Telegram's webhook for the HQ bot. Telegram signs each update with the
 * secret set by scripts/hq-telegram-webhook.mjs (HQ_TELEGRAM_WEBHOOK_SECRET),
 * and only the accounts in HQ_TELEGRAM_USERS get answers. Button taps queue
 * the same hq_commands the dashboard does, signed with that account's email,
 * and money, gym, to-dos and owed go to the same log (lib/hq/lifeWrites.ts).
 */

export const maxDuration = 60;

type From = { id: number };
type Key = { text: string; callback_data?: string; url?: string };
type Update = {
  message?: { message_id: number; from?: From; chat: { id: number }; text?: string };
  callback_query?: { id: string; from: From; data?: string; message?: { message_id: number; chat: { id: number }; reply_markup?: { inline_keyboard?: Key[][] } } };
};

function secretMatches(given: string | null): boolean {
  const expected = process.env.HQ_TELEGRAM_WEBHOOK_SECRET;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Claude writes Telegram HTML; if it's malformed, send the words without the tags. */
async function sendAnswer(chatId: number, html: string, buttons: Button[] = []) {
  const parts = chunks(html);
  for (const [i, part] of parts.entries()) {
    const keys = i === parts.length - 1 ? buttons : [];
    await sendText(chatId, part, keys).catch(() => sendText(chatId, escapeHtml(part.replace(/<[^>]+>/g, "")), keys));
  }
}

/** The Instagram agent's notes from Aldo, newest first. */
async function igNotes() {
  const rows = await queryRecent(IG_NOTES, "at", 0, IG_NOTES_MAX);
  return rows.map((r) => ({ id: r.id, text: String(r.fields.text ?? ""), at: Number(r.fields.at ?? 0) })).filter((n) => n.text).sort((a, b) => b.at - a.at);
}

/** Saves a note for the Instagram agent (Calgary-Watch- scripts/ops picks it up on its next run). */
const saveIgNote = (email: string, text: string) => createDoc(IG_NOTES, { text, by: email, at: Date.now() });

/** Saves a job for the HQ agent; the ops clock starts it within a minute. */
const jobStarter = (chatId: number, email: string) => (kind: AgentJobKind, task: string) =>
  createDoc(AGENT_COLLECTION, { kind, task, by: email, chatId, at: Date.now(), status: "pending" });

/** Keeps the loaded data in step with a write, so the confirmation shows the new totals. */
function apply(data: HqData, d: Done) {
  const life = data.life ?? (data.life = []);
  if (d.kind === "logged") life.unshift(d.entry);
  else if (d.kind === "paid") {
    const owed = life.find((e) => e.id === d.owedId);
    if (owed) owed.done = true;
    if (d.entry) life.unshift(d.entry);
  } else {
    const note = life.find((e) => e.id === d.id);
    if (note) note.done = true;
  }
}

const UNDO_WHAT: Record<LifeEntry["kind"], string> = { gym: "gym", money: "money", owed: "owed", note: "to-do" };

/** The bot's own words for what it just did, and an Undo for each. */
function confirm(data: HqData, done: Done[], now: number): { lines: string[]; buttons: Button[] } {
  const lines: string[] = [];
  const buttons: Button[] = [];
  const many = done.length > 1;
  for (const d of done) {
    if (d.kind === "logged") {
      lines.push(loggedText(d.entry, data, now));
      const data_ = encodeRemove(d.entry.id);
      if (data_) buttons.push({ text: many ? `↩️ Undo ${UNDO_WHAT[d.entry.kind]}` : "↩️ Undo", data: data_ });
    } else if (d.kind === "paid") {
      const owed = data.life?.find((e) => e.id === d.owedId);
      lines.push(d.entry ? loggedText(d.entry, data, now).replace("Logged", "Paid:") : `${escapeHtml(owed?.text ?? "That")} was already marked paid.`);
      const data_ = d.entry ? encodePaid(d.owedId, false) : null;
      if (data_) buttons.push({ text: many ? "↩️ Undo paid" : "↩️ Undo", data: data_ });
    } else {
      const note = data.life?.find((e) => e.id === d.id);
      lines.push(`☑️ Done: ${escapeHtml(note?.text ?? "that to-do")}`);
      const data_ = encodeTodo(d.id, false);
      if (data_) buttons.push({ text: many ? "↩️ Undo done" : "↩️ Undo", data: data_ });
    }
  }
  return { lines, buttons };
}

function actions(chatId: number, email: string): AskActions {
  return {
    startJob: jobStarter(chatId, email),
    logMoney: (m) => logMoney(email, Date.now(), m),
    addOwed: (o) => addOwed(email, Date.now(), o),
    markPaid: async (id) => (await setOwedPaid(id, true, email, Date.now())).entry,
    addNote: (n) => addNote(email, Date.now(), n),
    completeNote: (id) => setNote(id, Date.now(), { done: true }),
    logGym: (at) => logGym(email, Date.now(), at),
    addIgNote: (text) => saveIgNote(email, text),
  };
}

async function sendInbox(chatId: number, data: HqData, now: number) {
  const cards = inboxCards(data, now);
  if (!cards.length) return sendText(chatId, "Nothing to decide. Go find money.");
  // A phone inbox should be clearable, not a wall of fifteen long messages.
  for (const c of cards.slice(0, 5)) await sendCard(chatId, c);
  if (cards.length > 5) await sendText(chatId, `<b>${cards.length - 5} more decisions</b> are waiting. Clear these five first, then send /inbox again.`, [{ text: "Open full inbox", url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://arctoslaunchpad.com"}/hq#inbox` }]);
}

async function onMessage(chatId: number, text: string, email: string) {
  ensureMenu();
  const command = text.trim().split(/[\s@]/)[0].toLowerCase();
  if (command === "/start" || command === "/help") return sendText(chatId, HELP);
  if (command === "/agent" || command === "/mail") {
    const kind: AgentJobKind = command === "/mail" ? "mail" : "code";
    const task = cleanTask(text.trim().replace(/^\/\w+(@\w+)?/, ""));
    if (!task) return sendText(chatId, kind === "mail" ? "Ask about your email, like <i>/mail did the Stampede sponsor ever reply?</i>" : "Tell the agent what to change, like <i>/agent make the Money tab show this month first</i>.");
    await jobStarter(chatId, email)(kind, task);
    return sendText(chatId, startedMessage(kind, task));
  }
  if (command === "/ig") {
    const note = igNoteText(text);
    if (!note) {
      for (const c of igListCards(await igNotes(), Date.now())) await sendCard(chatId, c);
      return;
    }
    if ((await igNotes()).length >= IG_NOTES_MAX) return sendText(chatId, `The Instagram agent already has ${IG_NOTES_MAX} notes from you. Send /ig and forget a few first.`);
    const id = await saveIgNote(email, note);
    const forget = encodeIgForget(id);
    return sendText(chatId, igSavedText(note), forget ? [{ text: "Forget this", data: forget }] : []);
  }
  await sendTyping(chatId);
  const now = Date.now();
  const data = await loadHq(now);
  if (command === "/today") return sendCard(chatId, briefing(data, now));
  if (command === "/focus") return sendCard(chatId, focusCard(data));
  if (command === "/inbox") return sendInbox(chatId, data, now);
  if (command === "/money") return sendCard(chatId, moneyCard(data, now));
  if (command === "/gym") {
    const entry = await logGym(email, now);
    const d: Done = { kind: "logged", entry };
    apply(data, d);
    const { lines, buttons } = confirm(data, [d], now);
    return sendText(chatId, lines.join("\n"), buttons);
  }
  if (!askConfigured()) return sendText(chatId, `${HELP}\n\n(Questions need ANTHROPIC_API_KEY on Vercel.)`);
  const result = await askHq(text.slice(0, 2000), data, now, actions(chatId, email));
  for (const d of result.done) apply(data, d);
  const { lines, buttons } = confirm(data, result.done, now);
  const reply = [...lines, ...(result.text ? [result.text] : [])].join(lines.length && result.text ? "\n\n" : "\n");
  return sendAnswer(chatId, reply || "Done.", buttons);
}

/** The message's buttons minus the one just tapped (so "I went today" can't log twice). */
const without = (keys: Key[][] | undefined, tapped: string): Button[] =>
  (keys ?? []).flat().filter((k) => k.callback_data !== tapped).map((k) => ({ text: k.text, data: k.callback_data, url: k.url }));

async function onButton(q: NonNullable<Update["callback_query"]>, email: string) {
  const action = q.data ? decodeButton(q.data) : null;
  const msg = q.message;
  if (!action || !msg) return answerButton(q.id, "That button has expired.");
  const chat = msg.chat.id;
  const now = Date.now();
  const rest = without(msg.reply_markup?.inline_keyboard, q.data!);

  switch (action.kind) {
    case "queue": {
      const id = await createDoc("hq_commands", { type: action.type, targetId: action.targetId, payload: "{}", by: email, at: now, status: "pending" });
      await setButtons(chat, msg.message_id, [{ text: "↩️ Undo", data: encodeUndo(id) }]);
      return answerButton(q.id, "Queued. The agents apply it at :07 or :37.");
    }
    case "undo": {
      const current = await readFields(`hq_commands/${action.commandId}`);
      if (current && current.status !== "pending") {
        await setButtons(chat, msg.message_id, []);
        return answerButton(q.id, "Too late, the agents already applied it.");
      }
      await deleteDoc(`hq_commands/${action.commandId}`);
      await setButtons(chat, msg.message_id, []);
      await answerButton(q.id, "Undone.");
      return sendText(chat, "Undone. Send /inbox to see it again.");
    }
    case "triage": {
      if (action.decision === "clear") {
        await deleteDoc(`hq_reply_decisions/${action.key}`);
        await setButtons(chat, msg.message_id, []);
        return answerButton(q.id, "Undone. It's back on the board.");
      }
      await setDoc(`hq_reply_decisions/${action.key}`, { key: action.key, decision: action.decision, title: null, by: email, at: now });
      const undo = encodeTriage("clear", action.key);
      await setButtons(chat, msg.message_id, [...rest.filter((b) => b.url), ...(undo ? [{ text: "↩️ Undo", data: undo }] : [])]);
      return answerButton(q.id, action.decision === "approved" ? "On your list." : action.decision === "done" ? "Done. Off the board." : "Waved off.");
    }
    case "gym": {
      const entry = await logGym(email, now);
      await setButtons(chat, msg.message_id, rest);
      await answerButton(q.id, "Logged 💪");
      const data = await loadHq(now);
      const { lines, buttons } = confirm(data, [{ kind: "logged", entry }], now);
      return sendText(chat, lines.join("\n"), buttons);
    }
    case "paid": {
      if (!action.paid) {
        await setOwedPaid(action.id, false, email, now);
        await setButtons(chat, msg.message_id, []);
        return answerButton(q.id, "Undone. It's owed again.");
      }
      const { entry } = await setOwedPaid(action.id, true, email, now);
      await setButtons(chat, msg.message_id, rest);
      await answerButton(q.id, entry ? "Marked paid 💵" : "Already paid.");
      if (!entry) return;
      const data = await loadHq(now);
      const { lines, buttons } = confirm(data, [{ kind: "paid", owedId: action.id, entry }], now);
      return sendText(chat, lines.join("\n"), buttons);
    }
    case "todo": {
      await setNote(action.id, now, { done: action.done });
      if (!action.done) await setButtons(chat, msg.message_id, []);
      else await setButtons(chat, msg.message_id, [...rest, ...(encodeTodo(action.id, false) ? [{ text: "↩️ Undo", data: encodeTodo(action.id, false)! }] : [])]);
      return answerButton(q.id, action.done ? "Checked off." : "Back on your list.");
    }
    case "igforget": {
      await deleteDoc(`${IG_NOTES}/${action.id}`);
      await setButtons(chat, msg.message_id, []);
      return answerButton(q.id, "Forgotten. The Instagram agent drops it on its next run.");
    }
    case "remove": {
      await removeLife(action.id);
      await setButtons(chat, msg.message_id, []);
      return answerButton(q.id, "Undone.");
    }
    case "today": {
      await answerButton(q.id, "");
      return sendCard(chat, briefing(await loadHq(now), now));
    }
    case "inbox": {
      await answerButton(q.id, "");
      return sendInbox(chat, await loadHq(now), now);
    }
  }
}

export async function POST(request: Request) {
  if (!secretMatches(request.headers.get("x-telegram-bot-api-secret-token"))) {
    console.warn("hq/telegram: refused an update with a missing or wrong secret");
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }
  const update = (await request.json().catch(() => null)) as Update | null;
  const users = telegramUsers(process.env.HQ_TELEGRAM_USERS);
  const from = update?.callback_query?.from ?? update?.message?.from;
  const chatId = update?.callback_query?.message?.chat.id ?? update?.message?.chat.id;
  const kind = update?.callback_query ? "button" : update?.message?.text ? "text" : "other";
  console.log(`hq/telegram: ${kind} update from ${from?.id ?? "nobody"} (${from && users.has(from.id) ? "allowed" : "not on HQ_TELEGRAM_USERS"})`);

  // Always 200: Telegram retries anything else, and a retried button tap would queue twice.
  try {
    if (!from || chatId === undefined) return NextResponse.json({ ok: true });
    const email = users.get(from.id);
    if (!email) {
      // Says the id so the owner can add it to HQ_TELEGRAM_USERS; tells a stranger nothing else.
      if (update?.message) await sendText(chatId, `This bot is private. Your Telegram id is <code>${from.id}</code>.`);
      return NextResponse.json({ ok: true });
    }
    if (update?.callback_query) await onButton(update.callback_query, email);
    else if (update?.message?.text) await onMessage(chatId, update.message.text, email);
  } catch (e) {
    console.error("hq/telegram: handling the update failed", e);
    await sendText(chatId!, `Something went wrong: ${escapeHtml(e instanceof Error ? e.message : String(e))}`).catch((e2) =>
      console.error("hq/telegram: couldn't send the error message either", e2),
    );
  }
  return NextResponse.json({ ok: true });
}

/**
 * Health check: GET /api/hq/telegram?check=<HQ_TELEGRAM_WEBHOOK_SECRET> says
 * which settings are present (never their values) and what Telegram last saw.
 */
export async function GET(request: Request) {
  if (!secretMatches(new URL(request.url).searchParams.get("check"))) return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  const info = await webhookInfo().catch((e: unknown) => ({ error: e instanceof Error ? e.message : String(e) }));
  return NextResponse.json({
    botToken: Boolean(process.env.HQ_TELEGRAM_BOT_TOKEN),
    users: [...telegramUsers(process.env.HQ_TELEGRAM_USERS).keys()],
    questions: askConfigured(),
    webhook: info,
  });
}
