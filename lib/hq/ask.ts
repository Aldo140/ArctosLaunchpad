import Anthropic from "@anthropic-ai/sdk";
import type { GmailSummary, HqSnapshot } from "./types";
import { reportForQuestion } from "./telegramBot";
import { cleanTask, isJobKind, type AgentJobKind } from "./agentJobs";

/**
 * Answers a question texted to the HQ bot from the agents' report and the
 * Gmail summary. Approvals stay on the /inbox buttons; anything bigger (a
 * change to the site or HQ, digging through the calgarywatch.ca inbox) is
 * handed to the HQ agent (lib/hq/agentJobs.ts), which can push to main.
 */

const MODEL = "claude-opus-5-5";

const SYSTEM = `You are HQ, the operations assistant for Aldo's businesses (CalgaryWatch, Calgary Daily, Vow Motion and Arctos), answering texts on Telegram.
Answer from the JSON report below only. If the report doesn't say, say so plainly rather than guessing. Times are epoch milliseconds; Aldo is in Calgary (America/Edmonton).
Write like a text message: lead with the answer, a few short lines, no headings or tables. Telegram HTML only: <b>, <i> and <a href="..."> are allowed; no Markdown.
You can't approve or send anything yourself; for approvals, tell him /inbox has the buttons.
You do have the HQ agent (the hand_to_agent tool), Claude Code on a GitHub runner, for two kinds of job:
- code: a change to the ArctosLaunchpad code (this website, HQ, the ops agents). It goes to main once the type check, lint, tests and build pass.
- mail: a question about his email it can search and read: the aldo@calgarywatch.ca Outlook inbox in full, and HQ's Gmail summary.
Hand over when Aldo asks for a change, or for something in his email the report doesn't have. Don't hand over a question the report already answers, and never to send email or approve anything. One kind per job. Pass his request in his own words plus any detail from this chat it needs. After handing over, say in one short line that it's started and he'll get a text when it's done.`;

const TOOLS: Anthropic.Beta.BetaTool[] = [
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

/** Starts an agent job and returns the id; given by the caller so this file stays free of storage. */
export type StartJob = (kind: AgentJobKind, task: string) => Promise<string>;

let client: Anthropic | null = null;
export const askConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);

export async function askHq(question: string, snapshot: HqSnapshot | null, gmail: GmailSummary | null, now: number, startJob?: StartJob): Promise<string> {
  const workspace = process.env.ANTHROPIC_WORKSPACE_ID;
  client ??= new Anthropic(workspace ? { defaultHeaders: { "anthropic-workspace-id": workspace } } : {});
  const { json, omitted } = reportForQuestion(snapshot, gmail);
  const system: Anthropic.Beta.BetaTextBlockParam[] = [
    { type: "text", text: SYSTEM },
    { type: "text", text: `Report:\n${json}${omitted.length ? `\n(Left out to fit: ${omitted.join(", ")}.)` : ""}`, cache_control: { type: "ephemeral" } },
  ];
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    { role: "user", content: `It's ${new Date(now).toLocaleString("en-CA", { timeZone: "America/Edmonton" })}.\n\n${question}` },
  ];
  // One hand-over at most, then Claude says so in its own words.
  for (let round = 0; round < 2; round++) {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      // The report changes once an hour, so follow-up questions read it from the cache.
      system,
      ...(startJob && round === 0 ? { tools: TOOLS } : {}),
      messages,
    });
    if (response.stop_reason === "refusal") return "I can't answer that one.";
    const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("").trim();
    const call = response.content.find((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    if (!call || !startJob || response.stop_reason !== "tool_use") return text || "I couldn't come up with an answer from the report.";
    const input = call.input as { kind?: unknown; task?: unknown };
    const task = cleanTask(input.task);
    const kind = isJobKind(input.kind) ? input.kind : "code";
    let outcome: string;
    try {
      outcome = task ? `Started ${kind} job ${await startJob(kind, task)}.` : "The task was empty, so nothing started.";
    } catch (e) {
      outcome = `Couldn't start it: ${e instanceof Error ? e.message : String(e)}`;
    }
    messages.push({ role: "assistant", content: response.content }, { role: "user", content: [{ type: "tool_result", tool_use_id: call.id, content: outcome }] });
  }
  return "I handed that to the agent; it'll text you when it's done.";
}
