"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";

type FieldName = "name" | "email" | "challenge" | "company" | "sample";
type FieldErrors = Partial<Record<FieldName | "form", string>>;

const PROJECT_TYPE = "Free reporting teardown";
const fieldOrder: FieldName[] = [
  "name",
  "email",
  "challenge",
  "company",
  "sample",
];

function valueOf(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function validate(formData: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const name = valueOf(formData, "name");
  const email = valueOf(formData, "email");
  const challenge = valueOf(formData, "challenge");
  const company = valueOf(formData, "company");
  const sample = valueOf(formData, "sample");

  if (name.length < 2) errors.name = "Enter your name.";
  if (!/^\S+@\S+\.\S+$/.test(email))
    errors.email = "Enter a valid email address.";
  if (challenge.length < 20)
    errors.challenge =
      "Tell us a little more about what you report on by hand. A sentence or two is plenty.";
  if (company && company.length < 2)
    errors.company = "Enter your company, or leave this one blank.";
  if (sample.length > 300)
    errors.sample = "Keep the link under 300 characters.";
  return errors;
}

/** Where the visit came from, so the owner can tell Instagram from cold email. */
function attribution() {
  try {
    const params = new URLSearchParams(window.location.search);
    const clean = (v: string | null) => (v ?? "").trim().slice(0, 100);
    const source = clean(params.get("utm_source")) || clean(params.get("src"));
    const campaign = clean(params.get("utm_campaign"));
    if (!source && !campaign) return "Source: direct (no tags)";
    return `Source: ${source || "untagged"}${campaign ? ` (campaign: ${campaign})` : ""}`;
  } catch {
    return "Source: unknown";
  }
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span className="tdn-error" id={id}>
      <span className="tdn-error__mark" aria-hidden="true" />
      {message}
    </span>
  );
}

export function TeardownForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const successHeading = useRef<HTMLHeadingElement>(null);
  const [ready, setReady] = useState({ name: false, email: false, challenge: false });

  function handleInput(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const next = {
      name: valueOf(data, "name").length >= 2,
      email: /^\S+@\S+\.\S+$/.test(valueOf(data, "email")),
      challenge: valueOf(data, "challenge").length >= 20,
    };
    setReady((prev) =>
      prev.name === next.name && prev.email === next.email && prev.challenge === next.challenge ? prev : next,
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const clientErrors = validate(formData);

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      const first = fieldOrder.find((f) => clientErrors[f]);
      window.requestAnimationFrame(() => {
        form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
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
        form: "The teardown request is not connected on this preview deployment yet. Please use the production Arctos Launchpad site.",
      });
      setStatus("idle");
      return;
    }

    const sample = valueOf(formData, "sample");
    const message = [sample ? `Sample: ${sample}` : "", attribution()]
      .filter(Boolean)
      .join("\n");

    /* Optional fields go as empty strings, never omitted: the API schema is
       strict and defaults them to "". The sample link lives in `message`
       because `website` must be an http(s) URL. */
    const payload = {
      name: valueOf(formData, "name"),
      email: valueOf(formData, "email"),
      company: valueOf(formData, "company"),
      website: "",
      projectType: PROJECT_TYPE,
      budget: "",
      timeline: "",
      challenge: valueOf(formData, "challenge"),
      outcome: "",
      message,
      address: String(formData.get("address") ?? ""),
    };

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? "/api/contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        fields?: Partial<Record<string, string>>;
      } | null;

      if (!response.ok || !result?.ok) {
        const fields: FieldErrors = {};
        for (const f of fieldOrder) {
          if (result?.fields?.[f]) fields[f] = result.fields[f];
        }
        setErrors({
          ...fields,
          form:
            result?.error ??
            "We could not send your request. Please try again.",
        });
        setStatus("idle");
        return;
      }

      form.reset();
      setReady({ name: false, email: false, challenge: false });
      setStatus("success");
      window.requestAnimationFrame(() => successHeading.current?.focus());
    } catch {
      setErrors({
        form: "We could not reach the server. Check your connection and try again.",
      });
      setStatus("idle");
    }
  }

  const live = (
    <p className="tdn-sr" role="status" aria-live="polite">
      {status === "success"
        ? "Request sent. We will reply within two business days."
        : ""}
    </p>
  );

  if (status === "success") {
    return (
      <div className="tdn-sheet tdn-sheet--done">
        {live}
        <svg className="tdn-seal" viewBox="0 0 64 64" aria-hidden="true">
          <circle className="tdn-seal__ring" cx="32" cy="32" r="29" pathLength={1} />
          <path className="tdn-seal__check" d="M20 33.5 28.5 42 45 24" pathLength={1} />
        </svg>
        <p className="eyebrow">Request received</p>
        <h2 ref={successHeading} tabIndex={-1} className="tdn-done__title">
          Got it. We&rsquo;ll take it from here.
        </h2>
        <ol className="tdn-done__list">
          <li>
            <span className="index">01</span>
            <span>We read what you sent, in full.</span>
          </li>
          <li>
            <span className="index">02</span>
            <span>You get a reply to book the 30 minutes, within two business days.</span>
          </li>
          <li>
            <span className="index">03</span>
            <span>
              We show you the one-screen mock, the first three steps, and a
              straight answer.
            </span>
          </li>
        </ol>
        <p className="tdn-done__foot">
          While you wait, see{" "}
          <Link className="link" href="/work">
            recent work
          </Link>
          .
        </p>
      </div>
    );
  }

  const describedBy = (name: FieldName, help?: string) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby":
      [errors[name] ? `tdn-${name}-error` : "", help ?? ""]
        .filter(Boolean)
        .join(" ") || undefined,
  });

  const listed = fieldOrder.filter((f) => errors[f]);
  const showAlert = Boolean(errors.form) || listed.length > 0;
  const filled = Number(ready.name) + Number(ready.email) + Number(ready.challenge);

  return (
    <form
      className="tdn-sheet"
      /* A printed sheet on an instrument section: declaring the material flips
         the palette to paper, as the contact form does. */


      onSubmit={handleSubmit}
      onInput={handleInput}
      noValidate
      aria-busy={status === "sending"}
      id="teardown-form"
      aria-labelledby="tdn-form-title"
    >
      {live}
      <div className="tdn-sheet__head">
        <p className="eyebrow" id="tdn-form-title">
          Free reporting teardown
        </p>
        <p className="tdn-sheet__req mono" data-filled={filled}>
          <span className="tdn-pips" aria-hidden="true">
            <i data-on={ready.name || undefined} />
            <i data-on={ready.email || undefined} />
            <i data-on={ready.challenge || undefined} />
          </span>
          {filled === 3 ? "Ready to send" : filled === 0 ? "Three fields to start" : `${filled} of 3 fields`}
        </p>
      </div>

      {showAlert && (
        <div className="tdn-alert" role="alert" tabIndex={-1}>
          <p className="tdn-alert__title">
            {errors.form
              ? "Something interrupted the handoff."
              : listed.length === 1
                ? "One field needs attention."
                : `${listed.length} fields need attention.`}
          </p>
          {errors.form && <p className="tdn-alert__body">{errors.form}</p>}
          {listed.length > 0 && (
            <ul className="tdn-alert__list">
              {listed.map((f) => (
                <li key={f}>
                  <a href={`#tdn-${f}`}>{errors[f]}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="tdn-row">
        <div className="tdn-field">
          <label className="tdn-label" htmlFor="tdn-name">
            Name
          </label>
          <span className="tdn-control">
            <input
              id="tdn-name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={100}
              required
              {...describedBy("name")}
            />
            <span className="tdn-ink" aria-hidden="true" />
            <span className={`tdn-ok${ready.name ? " is-ok" : ""}`} aria-hidden="true" />
          </span>
          <FieldError id="tdn-name-error" message={errors.name} />
        </div>
        <div className="tdn-field">
          <label className="tdn-label" htmlFor="tdn-email">
            Email
          </label>
          <span className="tdn-control">
            <input
              id="tdn-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={254}
              required
              {...describedBy("email")}
            />
            <span className="tdn-ink" aria-hidden="true" />
            <span className={`tdn-ok${ready.email ? " is-ok" : ""}`} aria-hidden="true" />
          </span>
          <FieldError id="tdn-email-error" message={errors.email} />
        </div>
      </div>

      <div className="tdn-field">
        <label className="tdn-label" htmlFor="tdn-challenge">
          What do you report on by hand today?
        </label>
        <span className="tdn-control">
          <textarea
            id="tdn-challenge"
            name="challenge"
            rows={4}
            maxLength={1500}
            required
            placeholder="Weekly campaign numbers, event signups, production runs…"
            {...describedBy("challenge", "tdn-challenge-help")}
          />
          <span className="tdn-ink" aria-hidden="true" />
          <span className={`tdn-ok${ready.challenge ? " is-ok" : ""}`} aria-hidden="true" />
        </span>
        <span className="tdn-help" id="tdn-challenge-help">
          A sentence or two is plenty.
        </span>
        <FieldError id="tdn-challenge-error" message={errors.challenge} />
      </div>

      <div className="tdn-row">
        <div className="tdn-field">
          <label className="tdn-label" htmlFor="tdn-company">
            Company <span className="tdn-opt">Optional</span>
          </label>
          <span className="tdn-control">
            <input
              id="tdn-company"
              name="company"
              type="text"
              autoComplete="organization"
              maxLength={150}
              {...describedBy("company")}
            />
            <span className="tdn-ink" aria-hidden="true" />
          </span>
          <FieldError id="tdn-company-error" message={errors.company} />
        </div>
        <div className="tdn-field">
          <label className="tdn-label" htmlFor="tdn-sample">
            Link to a sample <span className="tdn-opt">Optional</span>
          </label>
          <span className="tdn-control">
            <input
              id="tdn-sample"
              name="sample"
              type="text"
              inputMode="url"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={300}
              placeholder="Drive, Dropbox…"
              {...describedBy("sample")}
            />
            <span className="tdn-ink" aria-hidden="true" />
          </span>
          <FieldError id="tdn-sample-error" message={errors.sample} />
        </div>
      </div>

      <div className="tdn-trap" aria-hidden="true">
        <label>
          Leave this field empty
          <input name="address" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="tdn-act">
        <button className="tdn-submit" type="submit" disabled={status === "sending"}>
          <span>
            {status === "sending" ? "Sending…" : "Get a free reporting teardown"}
          </span>
          <span className="tdn-submit__arrow" aria-hidden="true">
            →
          </span>
        </button>
        <p className="tdn-micro">
          30 minutes. No obligation. Reply within two business days.
        </p>
      </div>
    </form>
  );
}
