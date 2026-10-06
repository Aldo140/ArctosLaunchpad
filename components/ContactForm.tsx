"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { LANDING_KEY, PREV_KEY } from "@/components/site/ConversionTracking";

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

export type ContactStatus = "idle" | "sending" | "success";
export type IslandKey = "win" | "run" | "see";

/**
 * Project types, grouped by the island they belong to. The submitted values
 * are exactly the strings the API accepts; the grouping is presentation only.
 */
const typeGroups = [
  {
    island: "win",
    label: "Win the customer",
    types: ["Website", "SEO or AI search", "Paid advertising", "Branding", "Lead-generation system"],
  },
  {
    island: "run",
    label: "Run the work",
    types: ["Business automation", "Custom software", "CRM or integration"],
  },
  {
    island: "see",
    label: "See the numbers",
    types: ["Dashboard or reporting", "Free reporting teardown"],
  },
  { island: null, label: "Something else", types: ["Ongoing support", "Pro bono (Keystone)", "Not sure yet"] },
] as const;

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
  "Pro bono (Keystone)",
  "Not sure yet",
] as const;

/** Which island a project type lights on the bridge. */
export function islandFor(type: string): IslandKey | null {
  for (const group of typeGroups) {
    if ((group.types as readonly string[]).includes(type)) return group.island;
  }
  return null;
}

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

const EMAIL = /^\S+@\S+\.\S+$/;

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
  if (!EMAIL.test(email))
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

/** The three details we need before we can reply: name, email, challenge. */
function readiness(form: HTMLFormElement) {
  const data = new FormData(form);
  return {
    name: valueOf(data, "name").length >= 2,
    email: EMAIL.test(valueOf(data, "email")),
    challenge: valueOf(data, "challenge").length >= 20,
  };
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

/** Rust line that draws in on focus, and a tick once the value is usable. */
function Ink({ ok }: { ok?: boolean }) {
  return (
    <>
      <span className="field__ink" aria-hidden="true" />
      {ok !== undefined ? <span className={`field__ok${ok ? " is-ok" : ""}`} aria-hidden="true" /> : null}
    </>
  );
}

/** An unsent enquiry survives a closed tab: kept in this browser only. */
const DRAFT_KEY = "arctos:enquiry-draft";
const DRAFT_FIELDS = ["name", "email", "challenge", "company", "website", "budget", "timeline", "projectType"] as const;

function saveDraft(form: HTMLFormElement) {
  try {
    const data = new FormData(form);
    const draft = Object.fromEntries(DRAFT_FIELDS.map((f) => [f, String(data.get(f) ?? "")]));
    if (draft.name || draft.email || draft.challenge) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* storage blocked: drafts are a convenience */
  }
}

function readDraft(): Partial<Record<(typeof DRAFT_FIELDS)[number], string>> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

/** "Landed on /work/x (from google.com) → last page /services" for the email. */
function leadSource() {
  try {
    const landing = sessionStorage.getItem(LANDING_KEY);
    const prev = sessionStorage.getItem(PREV_KEY);
    const samePage = landing && prev && landing.split(/[?\s]/)[0] === prev;
    return [landing && `landed on ${landing}`, prev && !samePage && `came from ${prev}`].filter(Boolean).join(", ").slice(0, 300);
  } catch {
    return "";
  }
}

const CHOICES: Record<string, string> = {
  website: "Website",
  automation: "Business automation",
  software: "Custom software",
  reporting: "Dashboard or reporting",
  "pro-bono": "Pro bono (Keystone)",
};

export function ContactForm({
  onTypeChange,
  onProgress,
  onStatusChange,
}: {
  onTypeChange?: (type: string) => void;
  onProgress?: (filled: number) => void;
  onStatusChange?: (status: ContactStatus) => void;
} = {}) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatusState] = useState<ContactStatus>("idle");
  const [type, setTypeState] = useState<string>("Not sure yet");
  const [ready, setReady] = useState({ name: false, email: false, challenge: false });
  const successHeading = useRef<HTMLHeadingElement>(null);
  const [context, setContext] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const started = useRef(false);

  const setStatus = (next: ContactStatus) => {
    setStatusState(next);
    onStatusChange?.(next);
  };
  const setType = (next: string) => {
    setTypeState(next);
    onTypeChange?.(next);
  };

  // `?need=` preselects the project type and says where the visitor started.
  // Read once, on the client, so the static page stays cacheable.
  const preselected = useRef(false);
  const formRef = (form: HTMLFormElement | null) => {
    if (!form || preselected.current) return;
    preselected.current = true;
    const selected = CHOICES[new URLSearchParams(window.location.search).get("need") ?? ""];
    const draft = readDraft();
    requestAnimationFrame(() => {
      if (draft) {
        for (const f of DRAFT_FIELDS) {
          const el = form.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${f}"]`);
          if (f !== "projectType" && el && draft[f]) el.value = draft[f]!;
        }
        if (!selected && draft.projectType && projectTypes.includes(draft.projectType as (typeof projectTypes)[number])) {
          setType(draft.projectType);
        }
        const next = readiness(form);
        setReady(next);
        onProgress?.(Number(next.name) + Number(next.email) + Number(next.challenge));
        setRestored(Boolean(draft.name || draft.email || draft.challenge));
        if (draft.company || draft.website || draft.budget || draft.timeline) {
          const extras = form.querySelector("details");
          if (extras) extras.open = true;
        }
      }
      if (selected) {
        setType(selected);
        setContext(selected);
      }
    });
  };

  function handleInput(event: FormEvent<HTMLFormElement>) {
    if (!started.current) {
      started.current = true;
      track("enquiry_start");
    }
    saveDraft(event.currentTarget);
    const next = readiness(event.currentTarget);
    setReady((prev) =>
      prev.name === next.name && prev.email === next.email && prev.challenge === next.challenge ? prev : next,
    );
    onProgress?.(Number(next.name) + Number(next.email) + Number(next.challenge));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const clientErrors = validate(formData);

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      const firstInvalid = Object.keys(clientErrors)[0];
      window.requestAnimationFrame(() => {
        const input =
          form.querySelector<HTMLElement>(`[name="${firstInvalid}"]:checked`) ??
          form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`);
        const extra = input?.closest("details");
        if (extra) extra.open = true;
        input?.focus();
      });
      return;
    }

    setErrors({});
    setStatus("sending");
    const source = leadSource();
    if (source) formData.set("source", source);

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
        track("enquiry_error", { status: response.status });
        const fields = result?.fields ?? {};
        // Only fields the visitor can see can be "highlighted".
        const visible = fieldOrder.some((f) => fields[f]);
        setErrors({
          ...fields,
          form: visible
            ? (result?.error ?? "We could not send your enquiry. Please try again.")
            : "We could not send your enquiry. Please try again in a moment.",
        });
        setStatus("idle");
        return;
      }

      track("enquiry_sent", { type: String(formData.get("projectType") ?? "") });
      clearDraft();
      form.reset();
      setReady({ name: false, email: false, challenge: false });
      setStatus("success");
      window.requestAnimationFrame(() => successHeading.current?.focus());
    } catch {
      track("enquiry_error", { status: 0 });
      setErrors({
        form: "We could not reach the server. Check your connection and try again. Your draft is saved in this browser.",
      });
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <section className="form receipt" aria-live="polite">
        <svg className="receipt__seal" viewBox="0 0 64 64" aria-hidden="true">
          <circle className="receipt__ring" cx="32" cy="32" r="29" pathLength={1} />
          <path className="receipt__check" d="M20 33.5 28.5 42 45 24" pathLength={1} />
        </svg>
        <p className="eyebrow">Enquiry received</p>
        <h2
          ref={successHeading}
          tabIndex={-1}
          className="h2 receipt__title"
        >
          Thank you. <em>We’ll take it from here.</em>
        </h2>
        <p className="body">
          We’ll read it properly and reply within two business days.
        </p>
        <ol className="receipt__trail" aria-label="What happens now">
          <li className="is-done"><span aria-hidden="true" />Sent</li>
          <li><span aria-hidden="true" />Read by the people who’d do the work</li>
          <li><span aria-hidden="true" />Reply within two business days</li>
        </ol>
        <div className="receipt__actions">
          <Link className="link" href="/work">
            See recent work<span aria-hidden="true">→</span>
          </Link>
          <button
            className="receipt__again"
            type="button"
            onClick={() => {
              setType("Not sure yet");
              onProgress?.(0);
              setStatus("idle");
            }}
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
  const filled = Number(ready.name) + Number(ready.email) + Number(ready.challenge);
  return <form ref={formRef} className="form" onSubmit={handleSubmit} onInput={handleInput} noValidate aria-busy={status === "sending"}>
    <div className="form__head">
      <p className="eyebrow">Tell us a little about the project</p>
      <p className="form__meter" data-filled={filled}>
        <span className="form__pips" aria-hidden="true"><i data-on={ready.name || undefined} /><i data-on={ready.email || undefined} /><i data-on={ready.challenge || undefined} /></span>
        <span className="mono">{filled === 3 ? "Ready to send" : `${filled} of 3 needed`}</span>
      </p>
    </div>
    <p className="form__intro">Start with the problem. We’ll help with the plan.</p>
    {restored ? <p className="form__context"><span className="mono">Draft restored</span> Your unsent enquiry is back where you left it.</p> : null}
    {context ? <p className="form__context"><span className="mono">Starting from</span> {context}</p> : null}
    {(errors.form || listed.length > 0) && <div className="form__alert" role="alert"><p>{errors.form ?? "A few details need attention."}</p>{listed.map(field => <a key={field} href={`#${field}`}>{errors[field]}</a>)}</div>}
    <div className="form__pair">
      <div className="field"><label htmlFor="name">Your name</label><span className="field__control"><input id="name" name="name" autoComplete="name" maxLength={100} required {...describedBy("name")} /><Ink ok={ready.name} /></span><FieldError id="name-error" message={errors.name} /></div>
      <div className="field"><label htmlFor="email">Email address</label><span className="field__control"><input id="email" name="email" type="email" autoComplete="email" maxLength={254} required {...describedBy("email")} /><Ink ok={ready.email} /></span><FieldError id="email-error" message={errors.email} /></div>
    </div>
    <fieldset className="field chips" {...describedBy("projectType")}>
      <legend>What can we help with?</legend>
      {typeGroups.map((group) => (
        <div key={group.label} className="chips__group" data-island={group.island ?? "none"} role="group" aria-label={group.label}>
          <span className="chips__label mono" aria-hidden="true">{group.label}</span>
          <div className="chips__row">
            {group.types.map((t) => (
              <label key={t} className="chip">
                <input
                  type="radio"
                  name="projectType"
                  value={t}
                  id={t === "Website" ? "projectType" : undefined}
                  checked={type === t}
                  onChange={() => setType(t)}
                  {...describedBy("projectType")}
                />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <FieldError id="projectType-error" message={errors.projectType} />
    </fieldset>
    <div className="field"><label htmlFor="challenge">What would you like to change?</label><span className="field__control"><textarea id="challenge" name="challenge" rows={4} maxLength={1500} minLength={20} required placeholder="We need a website that brings enquiries. Our team spends too long copying data. We have an idea for a new tool…" {...describedBy("challenge")} /><Ink ok={ready.challenge} /></span><p className="form__hint">A sentence or two is enough to start.</p><FieldError id="challenge-error" message={errors.challenge} /></div>
    <details className="form__extras"><summary>Add company, budget or timing <span>Optional +</span></summary><div className="form__extra-fields">
      <div className="field"><label htmlFor="company">Company</label><span className="field__control"><input id="company" name="company" autoComplete="organization" maxLength={150} {...describedBy("company")} /><Ink /></span><FieldError id="company-error" message={errors.company} /></div>
      <div className="field"><label htmlFor="website">Current website</label><span className="field__control"><input id="website" name="website" type="url" placeholder="https://" maxLength={300} {...describedBy("website")} /><Ink /></span><FieldError id="website-error" message={errors.website} /></div>
      <div className="field"><label htmlFor="budget">Budget</label><span className="field__control"><select id="budget" name="budget" defaultValue="" {...describedBy("budget")}><option value="">Not decided</option>{budgetRanges.map(range => <option key={range}>{range}</option>)}</select><Ink /></span><FieldError id="budget-error" message={errors.budget} /></div>
      <div className="field"><label htmlFor="timeline">Timing</label><span className="field__control"><select id="timeline" name="timeline" defaultValue="" {...describedBy("timeline")}><option value="">Not decided</option>{timelines.map(timeline => <option key={timeline}>{timeline}</option>)}</select><Ink /></span><FieldError id="timeline-error" message={errors.timeline} /></div>
    </div></details>
    {/* Spam trap. Its name must not look like anything browsers autofill
       (it was "address", and Chrome filled it with a street address). */}
    <div className="form__trap" aria-hidden="true"><label>Leave this empty<input name="hp_confirm" type="text" tabIndex={-1} autoComplete="off" data-1p-ignore data-lpignore="true" /></label></div>
    <p className="form__promise"><span className="form__promise-dot" aria-hidden="true" />A reply within two business days, from the people who would do the work. No obligation.</p>
    <button className="btn btn--block form__send" type="submit" disabled={status === "sending"}><span>{status === "sending" ? "Sending…" : "Send my project enquiry"}</span><span className="btn__dot" aria-hidden="true">→</span></button>
    <p className="form__privacy">Your details are used to answer your enquiry. <Link href="/privacy">Privacy notice</Link></p>
  </form>;
}
