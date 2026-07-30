import { NextResponse } from "next/server";
import { z } from "zod";

function logDevelopmentError(
  message: string,
  details: Record<string, unknown>,
) {
  if (process.env.NODE_ENV === "development") console.error(message, details);
}

const projectTypes = [
  "Website",
  "SEO or AI search",
  "Paid advertising",
  "Branding",
  "Lead-generation system",
  "Business automation",
  "Custom software",
  "CRM or integration",
  "Dashboard or reporting",
  "Ongoing support",
  "Not sure yet",
] as const;

const budgetRanges = [
  "Under $10,000",
  "$10,000 to $25,000",
  "$25,000 to $50,000",
  "$50,000 to $100,000",
  "$100,000+",
  "Not sure yet",
] as const;

const timelines = [
  "As soon as practical",
  "Within 1 to 3 months",
  "Within 3 to 6 months",
  "More than 6 months",
  "No fixed date",
] as const;

const optionalUrl = z.union([
  z.literal(""),
  z
    .string()
    .trim()
    .max(300)
    .url("Enter a complete website address.")
    .refine(
      (value) => value.startsWith("https://") || value.startsWith("http://"),
      "Use an http:// or https:// website address.",
    ),
]);

const contactSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name.").max(100),
    email: z.string().trim().email("Enter a valid email address.").max(254),
    company: z
      .string()
      .trim()
      .min(2, "Enter your company or organization.")
      .max(150),
    website: optionalUrl.default(""),
    projectType: z.enum(projectTypes, { error: "Choose a project type." }),
    budget: z.enum(budgetRanges, {
      error: "Choose an estimated budget range.",
    }),
    timeline: z.enum(timelines, { error: "Choose a desired timeline." }),
    challenge: z
      .string()
      .trim()
      .min(20, "Tell us a little more about the current challenge.")
      .max(1500),
    outcome: z
      .string()
      .trim()
      .min(20, "Tell us what a useful outcome would look like.")
      .max(1500),
    message: z.string().trim().max(3000).default(""),
    address: z.string().max(0).optional(),
  })
  .strict();

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > 20_000) {
    return NextResponse.json(
      { ok: false, error: "This enquiry is too large to process." },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 20_000) {
      return NextResponse.json(
        { ok: false, error: "This enquiry is too large to process." },
        { status: 413 },
      );
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { ok: false, error: "The enquiry could not be read." },
      { status: 400 },
    );
  }

  const result = contactSchema.safeParse(body);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? "form");
      fields[field] ??= issue.message;
    }
    return NextResponse.json(
      {
        ok: false,
        error: "Check the highlighted fields and try again.",
        fields,
      },
      { status: 422 },
    );
  }

  const { address: _address, ...submission } = result.data;
  void _address;
  const receivedAt = new Date().toISOString();
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;

  if (!webhookUrl) {
    if (process.env.NODE_ENV === "development") {
      console.info("[contact] Development enquiry accepted", {
        requestId,
        receivedAt,
        projectType: submission.projectType,
      });
      return NextResponse.json({ ok: true, requestId });
    }

    logDevelopmentError("[contact] CONTACT_WEBHOOK_URL is not configured", {
      requestId,
    });
    return NextResponse.json(
      {
        ok: false,
        error: "Enquiries are temporarily unavailable. Please try again later.",
      },
      { status: 503 },
    );
  }

  let parsedWebhook: URL;
  try {
    parsedWebhook = new URL(webhookUrl);
  } catch {
    logDevelopmentError("[contact] CONTACT_WEBHOOK_URL is invalid", {
      requestId,
    });
    return NextResponse.json(
      {
        ok: false,
        error: "Enquiries are temporarily unavailable. Please try again later.",
      },
      { status: 503 },
    );
  }

  if (
    process.env.NODE_ENV === "production" &&
    parsedWebhook.protocol !== "https:"
  ) {
    logDevelopmentError(
      "[contact] CONTACT_WEBHOOK_URL must use HTTPS in production",
      { requestId },
    );
    return NextResponse.json(
      {
        ok: false,
        error: "Enquiries are temporarily unavailable. Please try again later.",
      },
      { status: 503 },
    );
  }

  try {
    const webhookResponse = await fetch(parsedWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...submission,
        requestId,
        receivedAt,
        source: "arctoslaunchpad.com/contact",
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });

    if (!webhookResponse.ok)
      throw new Error(`Webhook returned ${webhookResponse.status}`);
  } catch (error) {
    logDevelopmentError("[contact] Webhook delivery failed", {
      requestId,
      reason: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      {
        ok: false,
        error: "We could not deliver your enquiry. Please try again.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, requestId });
}
