"use client";

import Link from "next/link";
import { useId, useState, type CSSProperties } from "react";
import { Lines, d } from "../ui";

/**
 * A self-check the visitor can actually use. Ticks stay in this component's
 * state: nothing is stored, sent or scored beyond the honest count.
 */
export function LocalAudit({ title, items, href }: { title: string; items: string[]; href: string }) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));
  const id = useId();
  const count = checked.filter(Boolean).length;
  const total = items.length;

  const verdict =
    count === 0
      ? "Tick whatever is true today."
      : count === 1
        ? `1 of ${total}. Probably a fix, not a project, but ask if it is costing you.`
        : count >= total - 1
          ? `${count} of ${total}. Worth a conversation, sooner rather than later.`
          : `${count} of ${total}. Worth a conversation.`;

  return (
    <div className="wrap loc-audit__grid" data-count={count}>
      <div className="loc-audit__head">
        <p className="eyebrow" data-reveal>
          A two-minute self-check
        </p>
        <Lines as="h2" id="audit" className="h2" lines={[title]} />
        <p className="body" data-reveal style={d(2)}>
          Tick the ones that are true. If two or more are, it is worth a conversation. Your answers stay in this
          browser tab; nothing is stored or sent.
        </p>
      </div>

      <fieldset className="loc-audit__list" aria-describedby={`${id}-result`}>
        <legend className="visually-hidden">{title}</legend>
        {items.map((item, i) => (
          <label
            key={item}
            className="loc-check"
            data-reveal
            style={d(i) as CSSProperties}
          >
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={(e) => {
                const on = e.currentTarget.checked;
                setChecked((prev) => prev.map((v, n) => (n === i ? on : v)));
              }}
            />
            <span className="loc-check__box" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M5 12.5 L10 17.5 L19.5 6.5" pathLength={1} />
              </svg>
            </span>
            <span className="index loc-check__n" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="loc-check__text">{item}</span>
          </label>
        ))}
      </fieldset>

      <div className="loc-result" id={`${id}-result`}>
        <div className="loc-result__meter" aria-hidden="true">
          {items.map((item, i) => (
            <span key={item} className={i < count ? "is-on" : undefined} />
          ))}
        </div>
        <p className="loc-result__count" aria-hidden="true">
          <span className="loc-result__num" key={count}>
            {count}
          </span>
          <span className="loc-result__of">/{total}</span>
        </p>
        <p className="loc-result__line" aria-live="polite">
          {verdict}
        </p>
        <div className="loc-result__actions">
          <Link href={href} className={`btn${count >= 2 ? "" : " btn--ghost"}`}>
            <span>{count >= 2 ? "Start the conversation" : count === 1 ? "Ask a question anyway" : "Start a project"}</span>
            <span className="btn__dot" aria-hidden="true">
              →
            </span>
          </Link>
          {count > 0 ? (
            <button type="button" className="loc-result__clear" onClick={() => setChecked(items.map(() => false))}>
              Clear
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
