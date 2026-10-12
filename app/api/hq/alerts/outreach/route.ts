import { NextResponse } from "next/server";
import { z } from "zod";
import { outreachAlert, quietHours } from "@/lib/hq/alerts";
import { verifyWorkflow } from "@/lib/hq/githubOidc";
import { sendText } from "@/lib/hq/telegram";
import { telegramUsers } from "@/lib/hq/telegramBot";

/**
 * The outreach workflow (outreach.yml on the arctos-launchpad branch, which
 * sends for Arctos and Vow Motion) and CalgaryWatch's ops-hourly.yml in
 * Calgary-Watch- call this when a run that has emails to send starts and when it ends, and
 * the HQ bot texts Aldo. The run proves who it is with GitHub's OIDC token.
 */

const AUDIENCE = "arctos-hq-outreach";
const WORKFLOWS = ["Aldo140/ArctosLaunchpad/.github/workflows/outreach.yml@", "Aldo140/Calgary-Watch-/.github/workflows/ops-hourly.yml@"];

const text = (max: number) => z.string().transform((s) => s.slice(0, max));
const Run = z.object({
  event: z.enum(["start", "done", "crashed"]),
  campaign: z.enum(["arctos", "vowmotion", "calgarywatch"]).optional(),
  planned: z.number().int().min(0).max(1000).optional(),
  sent: z.array(text(120)).max(100).optional(),
  failed: z.object({ business: text(120), error: text(300) }).nullable().optional(),
  sentToday: z.number().int().min(0).max(1000).optional(),
  cap: z.number().int().min(0).max(1000).optional(),
  left: z.number().int().min(0).max(100_000).optional(),
  runUrl: z.string().url().regex(/^https:\/\/github\.com\/Aldo140\/(ArctosLaunchpad|Calgary-Watch-)\/actions\/runs\//).max(200).optional(),
});

export async function POST(request: Request) {
  try {
    await verifyWorkflow(request.headers.get("authorization"), AUDIENCE, WORKFLOWS);
  } catch (e) {
    console.warn(`hq/alerts/outreach: refused (${e instanceof Error ? e.message : e})`);
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }
  const parsed = Run.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.slice(0, 3).map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") }, { status: 400 });
  const message = outreachAlert(parsed.data);
  const silent = quietHours(Date.now());
  for (const chat of telegramUsers(process.env.HQ_TELEGRAM_USERS).keys()) {
    await sendText(chat, message, [], silent).catch((e) => console.error(`hq/alerts/outreach: couldn't text ${chat}: ${e instanceof Error ? e.message : e}`));
  }
  return NextResponse.json({ ok: true });
}
