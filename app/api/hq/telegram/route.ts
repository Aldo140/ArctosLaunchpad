import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { askConfigured, askHq } from "@/lib/hq/ask";
import { createDoc, deleteDoc, readFields, readStringField } from "@/lib/hq/google";
import { answerButton, sendCard, sendText, sendTyping, setButtons } from "@/lib/hq/telegram";
import { HELP, briefing, chunks, decodeButton, encodeUndo, escapeHtml, inboxCards, telegramUsers } from "@/lib/hq/telegramBot";
import type { GmailSummary, HqSnapshot } from "@/lib/hq/types";

/**
 * Telegram's webhook for the HQ bot. Telegram signs each update with the
 * secret set by scripts/hq-telegram-webhook.mjs (HQ_TELEGRAM_WEBHOOK_SECRET),
 * and only the accounts in HQ_TELEGRAM_USERS get answers. Button taps queue
 * the same hq_commands the dashboard does, signed with that account's email.
 */

export const maxDuration = 60;

type From = { id: number };
type Update = {
  message?: { message_id: number; from?: From; chat: { id: number }; text?: string };
  callback_query?: { id: string; from: From; data?: string; message?: { message_id: number; chat: { id: number } } };
};

function secretMatches(given: string | null): boolean {
  const expected = process.env.HQ_TELEGRAM_WEBHOOK_SECRET;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function report(): Promise<{ snapshot: HqSnapshot | null; gmail: GmailSummary | null }> {
  const [snapshot, gmail] = await Promise.all([
    readStringField("hq/snapshot", "payload").then((s) => (s ? (JSON.parse(s) as HqSnapshot) : null)),
    readStringField("hq/gmail", "payload").then((s) => (s ? (JSON.parse(s) as GmailSummary) : null)).catch(() => null),
  ]);
  return { snapshot, gmail };
}

/** Claude writes Telegram HTML; if it's malformed, send the words without the tags. */
async function sendAnswer(chatId: number, html: string) {
  for (const part of chunks(html)) {
    await sendText(chatId, part).catch(() => sendText(chatId, escapeHtml(part.replace(/<[^>]+>/g, ""))));
  }
}

async function onMessage(chatId: number, text: string) {
  const command = text.trim().split(/[\s@]/)[0].toLowerCase();
  if (command === "/start" || command === "/help") return sendText(chatId, HELP);
  await sendTyping(chatId);
  const { snapshot, gmail } = await report();
  const now = Date.now();
  if (command === "/today") return sendText(chatId, briefing(snapshot, gmail, now));
  if (command === "/inbox") {
    const cards = inboxCards(snapshot, gmail, now);
    if (!cards.length) return sendText(chatId, "Inbox zero. Nothing to approve.");
    for (const c of cards.slice(0, 15)) await sendCard(chatId, c);
    if (cards.length > 15) await sendText(chatId, `…and ${cards.length - 15} more on the dashboard.`);
    return;
  }
  if (!askConfigured()) return sendText(chatId, `${HELP}\n\n(Questions need ANTHROPIC_API_KEY on Vercel.)`);
  return sendAnswer(chatId, await askHq(text.slice(0, 2000), snapshot, gmail, now));
}

async function onButton(q: NonNullable<Update["callback_query"]>, email: string) {
  const action = q.data ? decodeButton(q.data) : null;
  const msg = q.message;
  if (!action || !msg) return answerButton(q.id, "That button has expired.");
  if (action.kind === "queue") {
    const at = Date.now();
    const id = await createDoc("hq_commands", { type: action.type, targetId: action.targetId, payload: "{}", by: email, at, status: "pending" });
    await setButtons(msg.chat.id, msg.message_id, [{ text: "↩️ Undo", data: encodeUndo(id) }]);
    return answerButton(q.id, "Queued. The agents apply it at :07 or :37.");
  }
  const current = await readFields(`hq_commands/${action.commandId}`);
  if (current && current.status !== "pending") {
    await setButtons(msg.chat.id, msg.message_id, []);
    return answerButton(q.id, "Too late, the agents already applied it.");
  }
  await deleteDoc(`hq_commands/${action.commandId}`);
  await setButtons(msg.chat.id, msg.message_id, []);
  await answerButton(q.id, "Undone.");
  return sendText(msg.chat.id, "Undone. Send /inbox to see it again.");
}

export async function POST(request: Request) {
  if (!secretMatches(request.headers.get("x-telegram-bot-api-secret-token"))) return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  const update = (await request.json().catch(() => null)) as Update | null;
  const users = telegramUsers(process.env.HQ_TELEGRAM_USERS);
  const from = update?.callback_query?.from ?? update?.message?.from;
  const chatId = update?.callback_query?.message?.chat.id ?? update?.message?.chat.id;

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
    else if (update?.message?.text) await onMessage(chatId, update.message.text);
  } catch (e) {
    await sendText(chatId!, `Something went wrong: ${escapeHtml(e instanceof Error ? e.message : String(e))}`).catch(() => null);
  }
  return NextResponse.json({ ok: true });
}
