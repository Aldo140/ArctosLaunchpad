import Anthropic from "@anthropic-ai/sdk";
import type { GmailSummary, HqSnapshot } from "./types";
import { reportForQuestion } from "./telegramBot";

/**
 * Answers a question texted to the HQ bot from the agents' report and the
 * Gmail summary. Read-only: Claude sees the numbers and can't act on
 * anything; approvals stay on the /inbox buttons.
 */

const MODEL = "claude-opus-5-5";

const SYSTEM = `You are HQ, the operations assistant for Aldo's businesses (CalgaryWatch, Calgary Daily, Vow Motion and Arctos), answering texts on Telegram.
Answer from the JSON report below only. If the report doesn't say, say so plainly rather than guessing. Times are epoch milliseconds; Aldo is in Calgary (America/Edmonton).
Write like a text message: lead with the answer, a few short lines, no headings or tables. Telegram HTML only: <b>, <i> and <a href="..."> are allowed; no Markdown.
You can't approve, send or change anything. When Aldo asks for that, tell him /inbox has the buttons.`;

let client: Anthropic | null = null;
export const askConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);

export async function askHq(question: string, snapshot: HqSnapshot | null, gmail: GmailSummary | null, now: number): Promise<string> {
  const workspace = process.env.ANTHROPIC_WORKSPACE_ID;
  client ??= new Anthropic(workspace ? { defaultHeaders: { "anthropic-workspace-id": workspace } } : {});
  const { json, omitted } = reportForQuestion(snapshot, gmail);
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low" },
    // The report changes once an hour, so follow-up questions read it from the cache.
    system: [
      { type: "text", text: SYSTEM },
      { type: "text", text: `Report:\n${json}${omitted.length ? `\n(Left out to fit: ${omitted.join(", ")}.)` : ""}`, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: `It's ${new Date(now).toLocaleString("en-CA", { timeZone: "America/Edmonton" })}.\n\n${question}` }],
  });
  if (response.stop_reason === "refusal") return "I can't answer that one.";
  const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("").trim();
  return text || "I couldn't come up with an answer from the report.";
}
