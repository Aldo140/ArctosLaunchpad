import { HELLO, alertsFor, leadAlert, planAlerts, quietHours, type AlertState } from "./alerts";
import { readStringField, readStringFieldVersioned, writeStringFieldIf } from "./google";
import { readLife } from "./lifeStore";
import { sendText } from "./telegram";
import { telegramUsers } from "./telegramBot";
import { readDecisions, readTriage } from "./triageStore";
import type { CalendarSummary, GmailSummary, HqSnapshot } from "./types";

/**
 * The HQ bot texting first. The Gmail and calendar syncs call runAlerts every
 * 15 minutes, after they save; it reads everything HQ knows, works out what's
 * new and worth a text (lib/hq/alerts.ts), and sends it to every account in
 * HQ_TELEGRAM_USERS. What was sent is kept in arctos-hq (hq/alerts).
 */

const STATE = "hq/alerts";
const DAY = 86_400_000;

const chats = () => (process.env.HQ_TELEGRAM_BOT_TOKEN ? [...telegramUsers(process.env.HQ_TELEGRAM_USERS).keys()] : []);

const json = <T>(path: string) => readStringField(path, "payload").then((s) => (s ? (JSON.parse(s) as T) : null));

async function broadcast(to: number[], text: string, silent: boolean) {
  for (const chat of to) {
    await sendText(chat, text, [], silent).catch((e) => console.error(`[alerts] couldn't text ${chat}: ${e instanceof Error ? e.message : e}`));
  }
}

export async function runAlerts(now = Date.now()): Promise<void> {
  const to = chats();
  if (!to.length) return;
  const [snapshot, gmail, triage, decisions, calendar, life, stored] = await Promise.all([
    json<HqSnapshot>("hq/snapshot").catch(() => null),
    json<GmailSummary>("hq/gmail").catch(() => null),
    readTriage().catch(() => null),
    readDecisions(now - 30 * DAY).catch(() => []),
    json<CalendarSummary>("hq/calendar").catch(() => null),
    readLife(now).catch(() => []),
    readStringFieldVersioned(STATE, "payload"),
  ]);
  const state = stored.value ? (JSON.parse(stored.value) as AlertState) : null;
  const plan = planAlerts(state, alertsFor({ now, snapshot, gmail, triage, decisions, calendar, life }), now);
  if (stored.value === JSON.stringify(plan.state)) return;
  // Saved before sending: if the other sync is checking at the same moment, only one of them sends.
  if (!(await writeStringFieldIf(STATE, "payload", JSON.stringify(plan.state), stored.updateTime))) return;

  const silent = quietHours(now);
  if (plan.first) await broadcast(to, HELLO, silent);
  for (const a of plan.send) await broadcast(to, a.text, silent);
  if (plan.more) await broadcast(to, `…and ${plan.more} more. /today for the rest.`, silent);
  if (plan.send.length) console.log(`[alerts] sent ${plan.send.length}${plan.more ? ` (+${plan.more} summed up)` : ""}`);
}

/** Never throws: an alert that fails must not fail the sync or the form that triggered it. */
export const runAlertsSafely = () => runAlerts().catch((e) => console.error(`[alerts] ${e instanceof Error ? e.message : e}`));

/** A website enquiry, texted the moment it arrives. */
export async function textLead(submission: Parameters<typeof leadAlert>[0], receiptSent: boolean): Promise<void> {
  try {
    await broadcast(chats(), leadAlert(submission, receiptSent), false);
  } catch (e) {
    console.error(`[alerts] lead text failed: ${e instanceof Error ? e.message : e}`);
  }
}
