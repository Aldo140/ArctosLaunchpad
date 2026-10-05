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
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@arctoslaunchpad.com";

const DOORS: { id: Door; label: string; note: string }[] = [
  {
    id: "project",
    label: "Start a project",
    note: "The full intake below. Four fields, under a minute.",
  },
  {
    id: "question",
    label: "Ask a question first",
    note: "One note by email. No form, no obligation.",
  },
  {
    id: "other",
    label: "Careers, press, or suppliers",
    note: "A direct email, off the project queue.",
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
    <div className="doors reveal">
      <fieldset className="doors__group">
        <legend className="t-label doors__legend">How can we help?</legend>
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
            <p className="tick-label">Not ready for the full intake</p>
            <h2 className="t-title">Ask us anything.</h2>
            <p className="form__intro-note">
              Write your question and open it in your own email app. Nothing
              is sent until you press send there.
            </p>
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
              placeholder="What do you want to know before getting in touch properly?"
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
              <span>Open your email app to send this</span>
              <span className="btn__arrow" aria-hidden="true">
                →
              </span>
            </button>
            <p className="form__submit-note">
              Opens a new email addressed to {CONTACT_EMAIL}. Nothing is
              stored on this site.
            </p>
          </div>
        </form>
      )}

      {door === "other" && (
        <div className="doors__panel doors__panel--plain" data-material="paper">
          <p className="tick-label">Off the project queue</p>
          <h2 className="t-title">Careers, press, or suppliers.</h2>
          <p className="t-body">
            For anything that is not a project enquiry — a role, a press
            request, or a supplier pitch — email us directly.
          </p>
          <a className="btn btn--ghost" href={otherHref}>
            <span>{CONTACT_EMAIL}</span>
          </a>
        </div>
      )}
    </div>
  );
}
