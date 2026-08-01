"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";

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

const requiredFieldCount = 8;

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
  if (company.length < 2)
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
  if (!budgetRanges.includes(budget as (typeof budgetRanges)[number])) {
    errors.budget = "Choose an estimated budget range.";
  }
  if (!timelines.includes(timeline as (typeof timelines)[number])) {
    errors.timeline = "Choose a desired timeline.";
  }
  if (challenge.length < 20)
    errors.challenge = "Tell us a little more about the current challenge.";
  if (outcome.length < 20)
    errors.outcome = "Tell us what a useful outcome would look like.";
  if (message.length > 3000)
    errors.message = "Keep additional context under 3,000 characters.";

  return errors;
}

function completedRequiredFields(form: HTMLFormElement) {
  const formData = new FormData(form);

  return [
    valueOf(formData, "name").length >= 2,
    /^\S+@\S+\.\S+$/.test(valueOf(formData, "email")),
    valueOf(formData, "company").length >= 2,
    projectTypes.includes(
      valueOf(formData, "projectType") as (typeof projectTypes)[number],
    ),
    budgetRanges.includes(
      valueOf(formData, "budget") as (typeof budgetRanges)[number],
    ),
    timelines.includes(
      valueOf(formData, "timeline") as (typeof timelines)[number],
    ),
    valueOf(formData, "challenge").length >= 20,
    valueOf(formData, "outcome").length >= 20,
  ].filter(Boolean).length;
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

function Required() {
  return (
    <>
      <span className="field__req" aria-hidden="true">
        *
      </span>
      <span className="visually-hidden"> (required)</span>
    </>
  );
}

export function ContactForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [completed, setCompleted] = useState(0);
  const successHeading = useRef<HTMLHeadingElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const clientErrors = validate(formData);

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      const firstInvalid = Object.keys(clientErrors)[0];
      window.requestAnimationFrame(() => {
        form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
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
      <section className="receipt" aria-live="polite">
        <p className="tick-label">Enquiry received</p>
        <h2
          ref={successHeading}
          tabIndex={-1}
          className="t-title receipt__title"
        >
          Thank you. <em>We’ll take it from here.</em>
        </h2>
        <p className="t-body">
          We’ll read through the details and reply with a useful next step.
        </p>
        <dl className="register receipt__register">
          <div className="register__row">
            <dt className="t-label">Reply</dt>
            <dd>Within two business days</dd>
          </div>
          <div className="register__row">
            <dt className="t-label">First step</dt>
            <dd>A focused conversation</dd>
          </div>
        </dl>
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
  const showAlert = Boolean(errors.form) || listed.length > 0;

  return (
    <form
      className="form"
      onSubmit={handleSubmit}
      onInput={(event) =>
        setCompleted(completedRequiredFields(event.currentTarget))
      }
      noValidate
      aria-busy={status === "sending"}
    >
      <div className="form__intro">
        <div className="form__intro-head">
          <p className="tick-label">Confidential project intake</p>
          <p className="form__progress-value" aria-hidden="true">
            {String(completed).padStart(2, "0")} / 08
          </p>
        </div>
        <div
          className="form__progress"
          role="progressbar"
          aria-label="Required fields completed"
          aria-valuemin={0}
          aria-valuemax={requiredFieldCount}
          aria-valuenow={completed}
        >
          <span
            style={
              {
                "--completion": `${(completed / requiredFieldCount) * 100}%`,
              } as React.CSSProperties
            }
          />
        </div>
        <p className="form__intro-note">
          Three short sections. Required fields are marked with an asterisk —
          everything else helps us reply with sharper clarity.
        </p>
      </div>

      {showAlert && (
        <div className="form__alert" role="alert" tabIndex={-1}>
          <p className="form__alert-title">
            {errors.form
              ? "Something interrupted the handoff."
              : listed.length === 1
                ? "One field needs attention."
                : `${listed.length} fields need attention.`}
          </p>
          {errors.form && <p className="form__alert-body">{errors.form}</p>}
          {listed.length > 0 && (
            <ul className="form__alert-list">
              {listed.map((f) => (
                <li key={f}>
                  <a href={`#${f}`}>{errors[f]}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <fieldset className="form__step">
        <legend className="form__legend">
          <span className="form__legend-n" aria-hidden="true">
            01
          </span>
          <span className="form__legend-title">The essentials</span>
          <span className="form__legend-note">
            Who you are, and where the reply should go.
          </span>
        </legend>

        <div className="form__grid">
          <div className="field">
            <label className="field__label" htmlFor="name">
              Name <Required />
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={100}
              required
              {...describedBy("name")}
            />
            <FieldError id="name-error" message={errors.name} />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="email">
              Email <Required />
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={254}
              required
              {...describedBy("email")}
            />
            <FieldError id="email-error" message={errors.email} />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="company">
              Company or organization <Required />
            </label>
            <input
              id="company"
              name="company"
              type="text"
              autoComplete="organization"
              maxLength={150}
              required
              {...describedBy("company")}
            />
            <FieldError id="company-error" message={errors.company} />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="website">
              Website <span className="field__optional">Optional</span>
            </label>
            <input
              id="website"
              name="website"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://"
              maxLength={300}
              {...describedBy("website")}
            />
            <FieldError id="website-error" message={errors.website} />
          </div>
        </div>
      </fieldset>

      <fieldset className="form__step">
        <legend className="form__legend">
          <span className="form__legend-n" aria-hidden="true">
            02
          </span>
          <span className="form__legend-title">The shape of the work</span>
          <span className="form__legend-note">
            Rough answers are fine. None of this is binding.
          </span>
        </legend>

        <div className="form__grid">
          <div className="field">
            <label className="field__label" htmlFor="projectType">
              Project type <Required />
            </label>
            <span className="field__select">
              <select
                id="projectType"
                name="projectType"
                defaultValue=""
                required
                {...describedBy("projectType")}
              >
                <option value="" disabled>
                  Select the closest fit
                </option>
                {projectTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </span>
            <FieldError id="projectType-error" message={errors.projectType} />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="budget">
              Estimated budget <Required />
            </label>
            <span className="field__select">
              <select
                id="budget"
                name="budget"
                defaultValue=""
                required
                {...describedBy("budget")}
              >
                <option value="" disabled>
                  Select a range
                </option>
                {budgetRanges.map((range) => (
                  <option key={range}>{range}</option>
                ))}
              </select>
            </span>
            <FieldError id="budget-error" message={errors.budget} />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="timeline">
              Desired timeline <Required />
            </label>
            <span className="field__select">
              <select
                id="timeline"
                name="timeline"
                defaultValue=""
                required
                {...describedBy("timeline")}
              >
                <option value="" disabled>
                  Select a timeline
                </option>
                {timelines.map((timeline) => (
                  <option key={timeline}>{timeline}</option>
                ))}
              </select>
            </span>
            <FieldError id="timeline-error" message={errors.timeline} />
          </div>

          <p className="form__aside">
            Not sure yet is a real answer. Pick the closest option and we will
            work the rest out together.
          </p>
        </div>
      </fieldset>

      <fieldset className="form__step form__step--last">
        <legend className="form__legend">
          <span className="form__legend-n" aria-hidden="true">
            03
          </span>
          <span className="form__legend-title">What needs to change</span>
          <span className="form__legend-note">
            The part that matters most. A couple of sentences each is plenty.
          </span>
        </legend>

        <div className="field">
          <label className="field__label" htmlFor="challenge">
            What is not working well today? <Required />
          </label>
          <textarea
            id="challenge"
            name="challenge"
            rows={4}
            maxLength={1500}
            minLength={20}
            required
            placeholder="Where does the friction show up for customers or your team?"
            {...describedBy("challenge")}
          />
          <FieldError id="challenge-error" message={errors.challenge} />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="outcome">
            What would a useful outcome look like? <Required />
          </label>
          <textarea
            id="outcome"
            name="outcome"
            rows={4}
            maxLength={1500}
            minLength={20}
            required
            placeholder="Describe the change you want to see after the work is done."
            {...describedBy("outcome")}
          />
          <FieldError id="outcome-error" message={errors.outcome} />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="message">
            Anything else we should know?{" "}
            <span className="field__optional">Optional</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            maxLength={3000}
            placeholder="Constraints, context, systems involved, or a question for us."
            {...describedBy("message")}
          />
          <FieldError id="message-error" message={errors.message} />
        </div>
      </fieldset>

      <div className="form__trap" aria-hidden="true">
        <label>
          Leave this field empty
          <input name="address" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="form__submit">
        <button
          className="btn form__send"
          type="submit"
          disabled={status === "sending"}
        >
          <span>
            {status === "sending" ? "Sending enquiry" : "Send project enquiry"}
          </span>
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </button>
        <p className="form__submit-note">
          We reply within two business days. Your information is only used to
          respond to this enquiry.
        </p>
      </div>
    </form>
  );
}
