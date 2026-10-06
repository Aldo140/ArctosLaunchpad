import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

/** Logged in production too (request id and reason only, never the
 *  visitor's details) so a failed delivery shows up in the host's logs. */
function logError(message: string, details: Record<string, unknown>) {
  console.error(message, details);
}

const projectTypes = [
  "Free reporting teardown",
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
      .union([
        z.literal(""),
        z
          .string()
          .trim()
          .min(2, "Enter your company or organization.")
          .max(150),
      ])
      .default(""),
    website: optionalUrl.default(""),
    projectType: z.enum(projectTypes, { error: "Choose a project type." }),
    budget: z
      .union([
        z.literal(""),
        z.enum(budgetRanges, { error: "Choose an estimated budget range." }),
      ])
      .default(""),
    timeline: z
      .union([
        z.literal(""),
        z.enum(timelines, { error: "Choose a desired timeline." }),
      ])
      .default(""),
    challenge: z
      .string()
      .trim()
      .min(20, "Tell us a little more about the current challenge.")
      .max(1500),
    outcome: z
      .union([
        z.literal(""),
        z
          .string()
          .trim()
          .min(20, "Tell us a little more, or leave this one blank.")
          .max(1500),
      ])
      .default(""),
    message: z.string().trim().max(3000).default(""),
    /** Which pages led here, recorded by the browser (no personal data). */
    source: z.string().trim().max(300).default(""),
    /* Spam trap. A filled trap no longer rejects the enquiry: autofill can
       fill hidden fields for real visitors, and a lost lead costs more than
       a spam email. It only marks the email as likely spam. */
    hp_confirm: z.string().max(500).optional(),
    /* The old trap name. Browsers autofilled it with a street address, which
       blocked real enquiries; accepted and ignored so cached pages still work. */
    address: z.string().max(500).optional(),
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
    console.info("[contact] Enquiry rejected", { requestId, fields: Object.keys(fields) });
    return NextResponse.json(
      {
        ok: false,
        error: "Check the highlighted fields and try again.",
        fields,
      },
      { status: 422 },
    );
  }

  const { address: _address, hp_confirm: trap, ...submission } = result.data;
  void _address;
  const likelySpam = Boolean(trap?.trim());
  const receivedAt = new Date().toISOString();
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
  const resendApiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.CONTACT_NOTIFY_EMAIL;
  /* A sender on a domain verified in Resend, e.g. "Arctos <hello@arctoslaunchpad.com>".
     Resend's shared test sender can only deliver to the account owner, so the
     visitor confirmation below only runs once this is set. */
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  /* Direct email delivery takes priority over the webhook pattern — no
     third-party automation tool required, just an email inbox. Falls
     through to the webhook / dev-log path below if either var is unset. */
  if (resendApiKey && notifyEmail) {
    try {
      const resend = new Resend(resendApiKey);
      const { error } = await resend.emails.send({
        from: fromEmail || "Arctos enquiries <onboarding@resend.dev>",
        to: notifyEmail,
        replyTo: submission.email,
        subject: `${likelySpam ? "[Likely spam] " : ""}New enquiry — ${submission.company || submission.name} (${submission.projectType})`,
        text: [
          `Name: ${submission.name}`,
          `Email: ${submission.email}`,
          submission.company ? `Company: ${submission.company}` : null,
          submission.website ? `Website: ${submission.website}` : null,
          `Project type: ${submission.projectType}`,
          submission.source ? `Lead source: ${submission.source}` : null,
          submission.budget ? `Budget: ${submission.budget}` : null,
          submission.timeline ? `Timeline: ${submission.timeline}` : null,
          "",
          `What is not working well today:`,
          submission.challenge,
          submission.outcome
            ? `\nWhat a useful outcome looks like:\n${submission.outcome}`
            : null,
          submission.message ? `\nAnything else:\n${submission.message}` : null,
          "",
          `Request ID: ${requestId}`,
          `Received: ${receivedAt}`,
        ]
          .filter((line) => line !== null)
          .join("\n"),
      });

      if (error) throw new Error(error.message);

      /* Speed-to-lead: the visitor gets an immediate, honest receipt. A failure
         here never fails the enquiry, which has already been delivered. */
      if (fromEmail && !likelySpam) {
        const { error: ackError } = await resend.emails.send({
          from: fromEmail,
          to: submission.email,
          replyTo: notifyEmail,
          subject: "We have your enquiry: Arctos Launchpad",
          text: [
            `Hi ${submission.name.split(" ")[0]},`,
            "",
            "Thanks for getting in touch. Your enquiry reached us, and the people who would do the work will read it properly and reply within two business days.",
            "",
            "What you sent:",
            `Project type: ${submission.projectType}`,
            submission.challenge,
            "",
            "If anything changes in the meantime, just reply to this email.",
            "",
            "Arctos Launchpad, Calgary",
            `Reference: ${requestId.slice(0, 8)}`,
          ].join("\n"),
        });
        if (ackError)
          logError("[contact] Confirmation email failed", { requestId, reason: ackError.message });
      }

      return NextResponse.json({ ok: true, requestId });
    } catch (error) {
      logError("[contact] Resend delivery failed", {
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
  }

  if (!webhookUrl) {
    if (process.env.NODE_ENV === "development") {
      console.info("[contact] Development enquiry accepted", {
        requestId,
        receivedAt,
        projectType: submission.projectType,
      });
      return NextResponse.json({ ok: true, requestId });
    }

    logError("[contact] CONTACT_WEBHOOK_URL is not configured", {
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
    logError("[contact] CONTACT_WEBHOOK_URL is invalid", {
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
    logError(
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
        likelySpam,
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
    logError("[contact] Webhook delivery failed", {
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
