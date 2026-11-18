import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { HqAuthError, requireHqUser } from "@/lib/hq/auth";
import { accountByEmail, accountIdFor, listAccounts, saveAccount } from "@/lib/portal/store";
import { stripePost } from "@/lib/portal/stripe";
import type { ClientAccount } from "@/lib/portal/types";

const Input = z.object({
  action: z.enum(["list", "save"]),
  email: z.string().email().optional(), company: z.string().min(1).max(120).optional(), clientName: z.string().min(1).max(120).optional(),
  firstName: z.string().min(1).max(60).optional(), projectName: z.string().min(1).max(140).optional(), projectSummary: z.string().min(1).max(1200).optional(),
  planName: z.string().min(1).max(120).optional(), monthlyAmount: z.number().int().min(0).max(10_000_000).optional(), currency: z.enum(["cad", "usd"]).optional(),
  services: z.array(z.string().min(1).max(100)).max(12).optional(), documentName: z.string().max(160).optional(), documentUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  try {
    await requireHqUser(request);
    const parsed = Input.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the client details." }, { status: 400 });
    const input = parsed.data;
    if (input.action === "list") return NextResponse.json({ accounts: await listAccounts() });
    if (!input.email || !input.company || !input.clientName || !input.firstName || !input.projectName || !input.projectSummary || !input.planName || input.monthlyAmount === undefined || !input.currency) return NextResponse.json({ error: "Complete every required client and billing field." }, { status: 400 });
    if (input.documentUrl && new URL(input.documentUrl).protocol !== "https:") return NextResponse.json({ error: "Document links must use HTTPS." }, { status: 400 });

    const email = input.email.toLowerCase();
    const existing = await accountByEmail(email);
    let priceId = existing?.billing.stripePriceId ?? null;
    const priceChanged = existing && (existing.billing.monthlyAmount !== input.monthlyAmount || existing.billing.currency !== input.currency || existing.billing.planName !== input.planName);
    if (priceChanged && existing?.billing.stripeSubscriptionId && existing.billing.status !== "cancelled") return NextResponse.json({ error: "This client has a live subscription. Change its price in Stripe or cancel it before assigning a different portal plan." }, { status: 409 });
    if (input.monthlyAmount === 0) priceId = null;
    if (input.monthlyAmount > 0 && (!priceId || priceChanged)) {
      const version = createHash("sha256").update(`${email}\0${input.planName}\0${input.monthlyAmount}\0${input.currency}`).digest("hex").slice(0, 20);
      const product = await stripePost<{ id: string }>("/products", new URLSearchParams({ name: `${input.company} — ${input.planName}`, "metadata[client_email]": email }), `portal-product-${version}`);
      const price = await stripePost<{ id: string }>("/prices", new URLSearchParams({ product: product.id, unit_amount: String(input.monthlyAmount), currency: input.currency, "recurring[interval]": "month" }), `portal-price-${version}`);
      priceId = price.id;
    }
    const now = Date.now();
    const document = input.documentName && input.documentUrl ? { id: `doc-${now}`, name: input.documentName, kind: "contract" as const, url: input.documentUrl, updatedAt: now, size: null } : null;
    const account: ClientAccount = {
      id: existing?.id ?? accountIdFor(email), email, company: input.company, clientName: input.clientName, firstName: input.firstName,
      projectName: input.projectName, projectSummary: input.projectSummary, status: existing?.status ?? "planning", services: input.services?.length ? input.services : [input.planName],
      leadContact: existing?.leadContact ?? { name: "Aldo", email: "aldo@arctoslaunchpad.com" }, nextStep: existing?.nextStep ?? { title: "Kickoff and access", detail: "Confirm the project details and share any remaining access.", due: null },
      milestones: existing?.milestones ?? [
        { id:"discovery",title:"Discovery",detail:"Goals, audience and requirements",status:"current",date:null },
        { id:"direction",title:"Direction",detail:"Structure and visual direction",status:"upcoming",date:null },
        { id:"build",title:"Build",detail:"Design, development and integrations",status:"upcoming",date:null },
        { id:"launch",title:"Launch",detail:"Review, handoff and release",status:"upcoming",date:null },
      ],
      documents: [...(document ? [document] : []), ...(existing?.documents ?? [])], activity: existing?.activity ?? [{ id:`created-${now}`,at:now,title:"Workspace created",detail:"Your private Arctos workspace is ready.",kind:"project" }],
      billing: { status: existing?.billing.status ?? "not-started", currency: input.currency, monthlyAmount: input.monthlyAmount, planName: input.planName, nextPaymentAt: existing?.billing.nextPaymentAt ?? null, stripeCustomerId: existing?.billing.stripeCustomerId ?? null, stripeSubscriptionId: existing?.billing.stripeSubscriptionId ?? null, stripePriceId: priceId, cancelAtPeriodEnd: existing?.billing.cancelAtPeriodEnd ?? false },
      createdAt: existing?.createdAt ?? now, updatedAt: now,
    };
    await saveAccount(account);
    return NextResponse.json({ account });
  } catch (error) {
    const status = error instanceof HqAuthError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save the client." }, { status });
  }
}
