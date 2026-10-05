"use client";

import { FormEvent, useId, useState } from "react";
import { ContactForm } from "@/components/ContactForm";

type Door = "project" | "question" | "other";

/**
 * Routes an enquiry by intent instead of funnelling everyone into the full
 * project intake. "Start a project" is the existing ContactForm, unchanged.
 * The other two doors are deliberately light — a question is answered with a
 * mailto:, not a second form system, so there is no new validation surface
 * and no change to app/api/contact/route.ts's schema.
 */
const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "mrotiz14@gmail.com";

const DOORS: { id: Door; label: string; note: string }[] = [
  {
    id: "project",
    label: "Start a project",
    note: "Four fields. Under a minute.",
  },
  {
    id: "question",
    label: "Ask a question first",
    note: "One email. No form.",
  },
  {
    id: "other",
    label: "Everything else",
    note: "Careers, press, suppliers.",
  },
];

export function ContactDoors() {
  const groupName = useId();
  const [door, setDoor] = useState<Door>("project");
  const [fromEmail, setFromEmail] = useState("");
  const [question, setQuestion] = useState("");

  function handleQuestionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = [
      fromEmail ? `From: ${fromEmail}` : null,
      fromEmail ? "" : null,
      question,
    ]
      .filter((line) => line !== null)
      .join("\n");
    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      "Question from the website",
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  }

  const otherHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    "Careers, press, or supplier enquiry",
  )}`;

  return (
    <div className="doors ctc-doors">
      <fieldset className="doors__group">
        <legend className="ctc-sr">How can we help?</legend>
        <div className="doors__options">
          {DOORS.map((option) => (
            <label
              key={option.id}
              className={
                door === option.id
                  ? "doors__option doors__option--active"
                  : "doors__option"
              }
            >
              <input
                type="radio"
                name={`${groupName}-door`}
                value={option.id}
                checked={door === option.id}
                onChange={() => setDoor(option.id)}
              />
              <span>
                <span className="doors__option-label">{option.label}</span>
                <span className="doors__option-note">{option.note}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {door === "project" && <ContactForm />}

      {door === "question" && (
        <form
          className="form doors__panel"
          data-material="paper"
          onSubmit={handleQuestionSubmit}
        >
          <div className="form__intro">
            <h2 className="t-title">Ask us anything.</h2>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="doors-email">
              Your email <span className="field__optional">Optional</span>
            </label>
            <input
              id="doors-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={fromEmail}
              onChange={(event) => setFromEmail(event.currentTarget.value)}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="doors-question">
              Your question
            </label>
            <textarea
              id="doors-question"
              name="question"
              rows={4}
              required
              placeholder="What would you like to know?"
              value={question}
              onChange={(event) => setQuestion(event.currentTarget.value)}
            />
          </div>

          <div className="form__submit">
            <button
              className="btn form__send"
              type="submit"
              disabled={question.trim().length === 0}
            >
              <span>Write it in your email app</span>
              <span className="btn__arrow" aria-hidden="true">
                →
              </span>
            </button>
            <p className="form__submit-note">
              Opens a draft to {CONTACT_EMAIL}. Nothing is sent until you send
              it.
            </p>
          </div>
        </form>
      )}

      {door === "other" && (
        <div className="doors__panel doors__panel--plain" data-material="paper">
          <h2 className="t-title">Careers, press, suppliers.</h2>
          <p className="t-body">Email us directly.</p>
          <a className="btn btn--ghost" href={otherHref}>
            <span>{CONTACT_EMAIL}</span>
          </a>
        </div>
      )}
    </div>
  );
}
