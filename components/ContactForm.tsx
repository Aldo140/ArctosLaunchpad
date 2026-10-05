"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

type FieldName =
  | "name"
  | "email"
  | "company"
  | "website"
  | "projectType"
  | "budget"
  | "timeline"
  | "challenge"
  | "outcome"
  | "message";

type FieldErrors = Partial<Record<FieldName | "form", string>>;

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

/** Order used by the error summary so it matches the visual order of the form. */
const fieldOrder: FieldName[] = [
  "name",
  "email",
  "company",
  "website",
  "projectType",
  "budget",
  "timeline",
  "challenge",
  "outcome",
  "message",
];

function valueOf(formData: FormData, name: FieldName) {
  return String(formData.get(name) ?? "").trim();
}

function validate(formData: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const name = valueOf(formData, "name");
  const email = valueOf(formData, "email");
  const company = valueOf(formData, "company");
  const website = valueOf(formData, "website");
  const projectType = valueOf(formData, "projectType");
  const budget = valueOf(formData, "budget");
  const timeline = valueOf(formData, "timeline");
  const challenge = valueOf(formData, "challenge");
  const outcome = valueOf(formData, "outcome");
  const message = valueOf(formData, "message");

  if (name.length < 2) errors.name = "Enter your name.";
  if (!/^\S+@\S+\.\S+$/.test(email))
    errors.email = "Enter a valid email address.";
  if (company && company.length < 2)
    errors.company = "Enter your company or organization.";
  if (website) {
    try {
      const websiteUrl = new URL(website);
      if (
        !(["http:", "https:"] as const).includes(
          websiteUrl.protocol as "http:" | "https:",
        )
      ) {
        errors.website =
          "Enter a complete http:// or https:// website address.";
      }
    } catch {
      errors.website = "Enter a complete http:// or https:// website address.";
    }
  }
  if (!projectTypes.includes(projectType as (typeof projectTypes)[number])) {
    errors.projectType = "Choose a project type.";
  }
  if (budget && !budgetRanges.includes(budget as (typeof budgetRanges)[number])) {
    errors.budget = "Choose an estimated budget range.";
  }
  if (timeline && !timelines.includes(timeline as (typeof timelines)[number])) {
    errors.timeline = "Choose a desired timeline.";
  }
  if (challenge.length < 20)
    errors.challenge = "Tell us a little more about the current challenge.";
  if (outcome && outcome.length < 20)
    errors.outcome = "Tell us a little more, or leave this one blank.";
  if (message.length > 3000)
    errors.message = "Keep additional context under 3,000 characters.";

  return errors;
}

/**
 * Per-field message. Announcement is handled once by the summary at the top of
 * the form rather than by ten simultaneous live regions, which is quieter for
 * screen-reader users; this stays wired to the input via aria-describedby.
 */
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span className="field__error" id={id}>
      <span className="field__error-mark" aria-hidden="true" />
      {message}
    </span>
  );
}

export function ContactForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const successHeading = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const choices: Record<string, string> = { website: "Website", automation: "Business automation", software: "Custom software", reporting: "Dashboard or reporting" };
    const selected = choices[new URLSearchParams(window.location.search).get("need") ?? ""];
    const input = formRef.current?.elements.namedItem("projectType") as HTMLSelectElement | null;
    if (selected && input) input.value = selected;
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const clientErrors = validate(formData);

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      const firstInvalid = Object.keys(clientErrors)[0];
      window.requestAnimationFrame(() => {
        const input = form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`);
        const extra = input?.closest("details");
        if (extra) extra.open = true;
        input?.focus();
      });
      return;
    }

    setErrors({});
    setStatus("sending");

    if (
      process.env.NEXT_PUBLIC_STATIC_EXPORT === "true" &&
      !process.env.NEXT_PUBLIC_CONTACT_ENDPOINT
    ) {
      setErrors({
        form: "The project intake is not connected on this preview deployment yet. Please use the production Arctos Launchpad contact page.",
      });
      setStatus("idle");
      return;
    }

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? "/api/contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(formData.entries())),
        },
      );
      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        fields?: FieldErrors;
      } | null;

      if (!response.ok || !result?.ok) {
        setErrors({
          ...result?.fields,
          form:
            result?.error ??
            "We could not send your enquiry. Please try again.",
        });
        setStatus("idle");
        return;
      }

      form.reset();
      setStatus("success");
      window.requestAnimationFrame(() => successHeading.current?.focus());
    } catch {
      setErrors({
        form: "We could not reach the server. Check your connection and try again.",
      });
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <section className="receipt" data-material="paper" aria-live="polite">
        <p className="tick-label">Enquiry received</p>
        <h2
          ref={successHeading}
          tabIndex={-1}
          className="t-title receipt__title"
        >
          Thank you. <em>We’ll take it from here.</em>
        </h2>
        <p className="t-body">
          We’ll read it properly and reply within two business days.
        </p>
        <div className="receipt__actions">
          <Link className="btn btn--ghost btn--small" href="/work">
            See recent work
          </Link>
          <button
            className="receipt__again"
            type="button"
            onClick={() => setStatus("idle")}
          >
            Send another enquiry
          </button>
        </div>
      </section>
    );
  }

  const describedBy = (name: FieldName) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  const listed = fieldOrder.filter((f) => errors[f]);
  return <form ref={formRef} className="v3-form" data-material="paper" onSubmit={handleSubmit} noValidate aria-busy={status === "sending"}>
    <p className="v3-kicker">Tell us a little about the project</p>
    <p className="v3-form__intro">Start with the problem. We’ll help with the plan.</p>
    {(errors.form || listed.length > 0) && <div className="v3-form__alert" role="alert"><p>{errors.form ?? "A few details need attention."}</p>{listed.map(field => <a key={field} href={`#${field}`}>{errors[field]}</a>)}</div>}
    <div className="v3-form__pair">
      <div className="field"><label htmlFor="name">Your name</label><input id="name" name="name" autoComplete="name" maxLength={100} required {...describedBy("name")} /><FieldError id="name-error" message={errors.name} /></div>
      <div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" maxLength={254} required {...describedBy("email")} /><FieldError id="email-error" message={errors.email} /></div>
    </div>
    <div className="field"><label htmlFor="projectType">What can we help with?</label><select id="projectType" name="projectType" defaultValue="Not sure yet" {...describedBy("projectType")}>{projectTypes.map(type => <option key={type}>{type}</option>)}</select><FieldError id="projectType-error" message={errors.projectType} /></div>
    <div className="field"><label htmlFor="challenge">What would you like to change?</label><textarea id="challenge" name="challenge" rows={4} maxLength={1500} minLength={20} required placeholder="We need a website that brings enquiries. Our team spends too long copying data. We have an idea for a new tool…" {...describedBy("challenge")} /><p className="v3-form__hint">A sentence or two is enough to start.</p><FieldError id="challenge-error" message={errors.challenge} /></div>
    <details className="v3-form__extras"><summary>Add company, budget or timing <span>Optional +</span></summary><div className="v3-form__extra-fields">
      <div className="field"><label htmlFor="company">Company</label><input id="company" name="company" autoComplete="organization" maxLength={150} {...describedBy("company")} /><FieldError id="company-error" message={errors.company} /></div>
      <div className="field"><label htmlFor="website">Current website</label><input id="website" name="website" type="url" placeholder="https://" maxLength={300} {...describedBy("website")} /><FieldError id="website-error" message={errors.website} /></div>
      <div className="field"><label htmlFor="budget">Budget</label><select id="budget" name="budget" defaultValue="" {...describedBy("budget")}><option value="">Not decided</option>{budgetRanges.map(range => <option key={range}>{range}</option>)}</select><FieldError id="budget-error" message={errors.budget} /></div>
      <div className="field"><label htmlFor="timeline">Timing</label><select id="timeline" name="timeline" defaultValue="" {...describedBy("timeline")}><option value="">Not decided</option>{timelines.map(timeline => <option key={timeline}>{timeline}</option>)}</select><FieldError id="timeline-error" message={errors.timeline} /></div>
    </div></details>
    <div className="form__trap" aria-hidden="true"><label>Leave this empty<input name="address" type="text" tabIndex={-1} autoComplete="off" /></label></div>
    <button className="v3-button v3-button--ink" type="submit" disabled={status === "sending"}><span>{status === "sending" ? "Sending…" : "Send my project enquiry"}</span><span aria-hidden="true">↗</span></button>
    <p className="v3-form__privacy">Your details are used to answer your enquiry. <Link href="/privacy">Privacy notice</Link></p>
  </form>;
}
