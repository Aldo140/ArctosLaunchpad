import { NextResponse } from "next/server";
import { AGENT_COLLECTION, jobFromFields, jobMessage } from "@/lib/hq/agentJobs";
import { readFields } from "@/lib/hq/google";
import { verifyWorkflow } from "@/lib/hq/githubOidc";
import { sendText } from "@/lib/hq/telegram";

/**
 * hq-agent.yml calls this when a job ends, so the answer reaches Telegram.
 * No stored key: the run proves who it is with GitHub's OIDC token, which
 * only the HQ agent workflows in Aldo's two repositories can get, and this only sends
 * what the job document already says to the chat that asked.
 */

const AGENT_AUDIENCE = "arctos-hq-agent";
// Code jobs run in this repository; mail jobs in Calgary-Watch-, which holds the Outlook secrets.
const WORKFLOWS = [
  "Aldo140/ArctosLaunchpad/.github/workflows/hq-agent.yml@",
  "Aldo140/Calgary-Watch-/.github/workflows/hq-agent-mail.yml@",
];

export async function POST(request: Request) {
  try {
    await verifyWorkflow(request.headers.get("authorization"), AGENT_AUDIENCE, WORKFLOWS);
  } catch (e) {
    console.warn(`hq/agent/notify: refused (${e instanceof Error ? e.message : e})`);
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { job?: unknown } | null;
  const id = typeof body?.job === "string" && /^[\w-]{1,100}$/.test(body.job) ? body.job : null;
  if (!id) return NextResponse.json({ error: "Which job?" }, { status: 400 });
  const fields = await readFields(`${AGENT_COLLECTION}/${id}`);
  if (!fields) return NextResponse.json({ error: "No such job." }, { status: 404 });
  const job = jobFromFields(id, fields);
  if (job.chatId === null) return NextResponse.json({ ok: true, sent: false });
  await sendText(job.chatId, jobMessage(job)).catch(() => sendText(job.chatId!, jobMessage(job).replace(/<[^>]+>/g, "")));
  return NextResponse.json({ ok: true, sent: true });
}
