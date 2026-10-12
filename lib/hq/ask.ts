import Anthropic from "@anthropic-ai/sdk";
import type { HqData, LifeEntry } from "./types";
import { reportForQuestion } from "./telegramBot";
import { cleanTask, isJobKind, type AgentJobKind } from "./agentJobs";
import { BUSINESSES, isBusiness, type LifeBusiness } from "./lifeWrites";

/**
 * Answers a text to the HQ bot from everything HQ knows (lib/hq/load.ts), and
 * acts on it: logs money, gym visits, to-dos and money owed to Aldo's own log
 * (the same entries the dashboard writes), and hands bigger work (a change to
 * the site or HQ, digging through the calgarywatch.ca inbox) to the HQ agent
 * (lib/hq/agentJobs.ts). Approvals stay on the /inbox buttons.
 */

const MODEL = "claude-opus-5-5";
const DAY = 86_400_000;

const SYSTEM = `You are HQ, Aldo's own assistant for his businesses (CalgaryWatch, Calgary Daily, Vow Motion and Arctos) and his life (money, gym, to-dos, calendar), answering texts on Telegram.
Answer from the JSON report below only. If the report doesn't say, say so plainly rather than guessing. Times are epoch milliseconds; Aldo is in Calgary (America/Edmonton).
For money, owed, gym and to-do numbers, quote report.totals: it's what the dashboard shows. Money is stored in cents; write it in dollars.
Write like a text from a sharp friend who has his back: lead with the answer, a few short lines, no headings or tables. Telegram HTML only: <b>, <i> and <a href="..."> are allowed; no Markdown.
You can't approve or send anything yourself; for approvals, tell him /inbox has the buttons.

Logging: when Aldo tells you something that belongs in his log, log it with the tools, without asking first. Every log gets an Undo button, so a wrong guess costs one tap.
- Money that came in: log_money. Pick the business from what he says (a wedding or film is Vow Motion, a website or app is Arctos, a listing, ad or sponsor is CalgaryWatch, an Instagram post deal is Calgary Daily); "other" if it's none of them.
- Someone owes him: track_owed. When he says they paid, mark_paid with the id from report.totals.owedToAldo.open.
- Something to do, or "remind me": add_todo. Done with one: complete_todo with its id from report.totals.todos.open.
- He went to the gym (or worked out): log_gym.
Dates: give due dates as YYYY-MM-DD, worked out from today's date below.
After logging, the bot adds its own confirmation with the updated totals, so don't repeat the amount or totals. Reply with one short line in his voice, or nothing at all if there's nothing to add.

You also have the HQ agent (the hand_to_agent tool), Claude Code on a GitHub runner, for two kinds of job:
- code: a change to the ArctosLaunchpad code (this website, HQ, the ops agents). It goes to main once the type check, lint, tests and build pass.
- mail: a question about his email it can search and read: the aldo@calgarywatch.ca Outlook inbox in full, and HQ's Gmail summary.
Hand over when Aldo asks for a change, or for something in his email the report doesn't have. Don't hand over a question the report already answers, and never to send email or approve anything. One kind per job. Pass his request in his own words plus any detail from this chat it needs. After handing over, say in one short line that it's started and he'll get a text when it's done.`;

const BUSINESS_ENUM = [...BUSINESSES];
const DATE = { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$", description: "YYYY-MM-DD, Calgary time." };

const TOOLS: Anthropic.Beta.BetaTool[] = [
  {
    name: "log_money",
    description: "Log money that came in to Aldo's money log (shown on HQ's Money tab and counted toward the monthly goal).",
    input_schema: {
      type: "object",
      properties: {
        amount_dollars: { type: "number", description: "Dollars, e.g. 1200 or 49.99." },
        business: { type: "string", enum: BUSINESS_ENUM },
        note: { type: "string", description: "What it was for or who paid, a few words." },
        date: { ...DATE, description: "The day it came in, if not today." },
      },
      required: ["amount_dollars", "business", "note"],
    },
  },
  {
    name: "track_owed",
    description: "Track money someone owes Aldo. HQ shows it on Money, and the bot texts him the morning it's due.",
    input_schema: {
      type: "object",
      properties: {
        amount_dollars: { type: "number" },
        business: { type: "string", enum: BUSINESS_ENUM },
        who_and_what: { type: "string", description: "Who owes it and for what, e.g. \"Ramsay Coffee, menu site deposit\"." },
        due_date: DATE,
      },
      required: ["amount_dollars", "business", "who_and_what"],
    },
  },
  {
    name: "mark_paid",
    description: "Mark money owed as paid. It also logs the payment as money in.",
    input_schema: { type: "object", properties: { owed_id: { type: "string" } }, required: ["owed_id"] },
  },
  {
    name: "add_todo",
    description: "Add a to-do to Aldo's list on HQ, with a due day when he gives one.",
    input_schema: { type: "object", properties: { text: { type: "string", description: "Starts with a verb." }, due_date: DATE }, required: ["text"] },
  },
  {
    name: "complete_todo",
    description: "Check off a to-do.",
    input_schema: { type: "object", properties: { todo_id: { type: "string" } }, required: ["todo_id"] },
  },
  {
    name: "log_gym",
    description: "Log a gym visit (Anytime Fitness; the goal is 3 a week).",
    input_schema: { type: "object", properties: { date: { ...DATE, description: "The day he went, if not today." } } },
  },
  {
    name: "hand_to_agent",
    description: "Start the HQ agent on a job: kind code (change the ArctosLaunchpad site/HQ, pushed to main if checks pass) or kind mail (search and read Aldo's email to answer). It runs in the background and texts Aldo the result.",
    input_schema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["code", "mail"] },
        task: { type: "string", description: "What to do, in Aldo's words, with any detail from this chat it needs." },
      },
      required: ["kind", "task"],
    },
  },
];

/** What the bot can do on Aldo's behalf; given by the caller so this file stays free of storage. */
export interface AskActions {
  startJob: (kind: AgentJobKind, task: string) => Promise<string>;
  logMoney: (m: { amount: number; business: LifeBusiness; text: string; at?: number }) => Promise<LifeEntry>;
  addOwed: (o: { amount: number; business: LifeBusiness; text: string; due: number | null }) => Promise<LifeEntry>;
  markPaid: (id: string) => Promise<LifeEntry | null>;
  addNote: (n: { text: string; due: number | null }) => Promise<LifeEntry>;
  completeNote: (id: string) => Promise<void>;
  logGym: (at?: number) => Promise<LifeEntry>;
}

/** Something the bot did, so the webhook can confirm it with fresh numbers and an Undo button. */
export type Done =
  | { kind: "logged"; entry: LifeEntry }
  | { kind: "paid"; owedId: string; entry: LifeEntry | null }
  | { kind: "completed"; id: string };

export interface AskResult {
  text: string;
  done: Done[];
}

let client: Anthropic | null = null;
export const askConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);

/** Noon Calgary on a YYYY-MM-DD day, the way HQ stores due days (components/hq/persona.ts noonOf). */
const noon = (d: unknown): number | null => (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) && Number.isFinite(Date.parse(`${d}T12:00:00-06:00`)) ? Date.parse(`${d}T12:00:00-06:00`) : null);
/** A past day for something that already happened; today keeps the real time. */
const pastDay = (d: unknown, now: number): number | undefined => {
  const t = noon(d);
  if (t === null || t > now || now - t < DAY / 2) return undefined;
  return t;
};
const cents = (dollars: unknown): number | null => {
  const n = typeof dollars === "number" ? dollars : Number(dollars);
  const c = Math.round(n * 100);
  return Number.isFinite(c) && c >= 1 && c <= 100_000_000 ? c : null;
};
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const biz = (v: unknown): LifeBusiness => (isBusiness(v) ? v : "other");

/** Runs one tool call; returns what to tell Claude. */
async function run(call: Anthropic.Beta.BetaToolUseBlock, act: AskActions, now: number, done: Done[], handed: { yes: boolean }): Promise<string> {
  const input = (call.input ?? {}) as Record<string, unknown>;
  switch (call.name) {
    case "log_money": {
      const amount = cents(input.amount_dollars);
      if (!amount) return "That amount isn't valid; nothing was logged.";
      const entry = await act.logMoney({ amount, business: biz(input.business), text: text(input.note, 200), at: pastDay(input.date, now) });
      done.push({ kind: "logged", entry });
      return `Logged, id ${entry.id}.`;
    }
    case "track_owed": {
      const amount = cents(input.amount_dollars);
      const what = text(input.who_and_what, 200);
      if (!amount || !what) return "Need an amount and who owes it; nothing was saved.";
      const entry = await act.addOwed({ amount, business: biz(input.business), text: what, due: noon(input.due_date) });
      done.push({ kind: "logged", entry });
      return `Tracking it, id ${entry.id}.`;
    }
    case "mark_paid": {
      const id = text(input.owed_id, 100);
      const entry = await act.markPaid(id);
      done.push({ kind: "paid", owedId: id, entry });
      return entry ? "Marked paid and logged as money in." : "It was already marked paid.";
    }
    case "add_todo": {
      const what = text(input.text, 500);
      if (!what) return "The to-do was empty; nothing was added.";
      const entry = await act.addNote({ text: what, due: noon(input.due_date) });
      done.push({ kind: "logged", entry });
      return `Added, id ${entry.id}.`;
    }
    case "complete_todo": {
      const id = text(input.todo_id, 100);
      await act.completeNote(id);
      done.push({ kind: "completed", id });
      return "Checked off.";
    }
    case "log_gym": {
      const entry = await act.logGym(pastDay(input.date, now));
      done.push({ kind: "logged", entry });
      return "Logged.";
    }
    case "hand_to_agent": {
      if (handed.yes) return "One agent job per text; this one wasn't started.";
      const task = cleanTask(input.task);
      const kind = isJobKind(input.kind) ? input.kind : "code";
      if (!task) return "The task was empty, so nothing started.";
      handed.yes = true;
      return `Started ${kind} job ${await act.startJob(kind, task)}.`;
    }
    default:
      return "Unknown tool.";
  }
}

export async function askHq(question: string, data: HqData, now: number, act?: AskActions): Promise<AskResult> {
  const workspace = process.env.ANTHROPIC_WORKSPACE_ID;
  client ??= new Anthropic(workspace ? { defaultHeaders: { "anthropic-workspace-id": workspace } } : {});
  const { json, omitted } = reportForQuestion(data, now);
  const system: Anthropic.Beta.BetaTextBlockParam[] = [
    { type: "text", text: SYSTEM },
    { type: "text", text: `Report:\n${json}${omitted.length ? `\n(Left out to fit: ${omitted.join(", ")}.)` : ""}`, cache_control: { type: "ephemeral" } },
  ];
  const today = new Date(now).toLocaleDateString("en-CA", { timeZone: "America/Edmonton" });
  const weekday = new Date(now).toLocaleDateString("en-CA", { timeZone: "America/Edmonton", weekday: "long" });
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    { role: "user", content: `It's ${weekday} ${today}, ${new Date(now).toLocaleTimeString("en-CA", { timeZone: "America/Edmonton", hour: "numeric", minute: "2-digit" })}.\n\n${question}` },
  ];
  const done: Done[] = [];
  const handed = { yes: false };
  for (let round = 0; round < 4; round++) {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      // Follow-up texts read the report from the cache.
      system,
      ...(act && round < 3 ? { tools: TOOLS } : {}),
      messages,
    });
    if (response.stop_reason === "refusal") return { text: "I can't answer that one.", done };
    const said = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("").trim();
    const calls = response.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    if (!calls.length || !act || response.stop_reason !== "tool_use") return { text: said || (done.length ? "" : "I couldn't come up with an answer from the report."), done };
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
    for (const call of calls) {
      let outcome: string;
      try {
        outcome = await run(call, act, now, done, handed);
      } catch (e) {
        outcome = `Couldn't do it: ${e instanceof Error ? e.message : String(e)}`;
      }
      results.push({ type: "tool_result", tool_use_id: call.id, content: outcome });
    }
    messages.push({ role: "assistant", content: response.content }, { role: "user", content: results });
  }
  return { text: handed.yes ? "I handed that to the agent; it'll text you when it's done." : "", done };
}
