"use client";

import { useState } from "react";
import type { BoardItem } from "@/lib/hq/triage";
import { triageKey } from "@/lib/hq/triage";
import { useHq } from "./context";
import { ago } from "./format";

const CATEGORY: Record<string, string> = {
  question: "Question",
  request: "Request",
  problem: "Problem",
  interested: "Interested",
  scheduling: "Scheduling",
  "already-handled": "Already handled",
  informational: "Just information",
  "not-interested": "Not interested",
  other: "Other",
};

function Evidence({ item }: { item: BoardItem }) {
  const t = item.triage;
  if (!t || (!t.checks.length && !t.related.length && !item.earlier)) return null;
  return (
    <details className="hq-more">
      <summary>What it checked</summary>
      <ul className="hq-checklist">
        {item.earlier ? <li>Read this together with {item.earlier} earlier unanswered {item.earlier === 1 ? "reply" : "replies"} in the thread.</li> : null}
        {t.checks.map((c) => <li key={`c-${c}`}>{c}</li>)}
        {t.related.map((c) => <li key={`r-${c}`}>{c}</li>)}
      </ul>
    </details>
  );
}

/**
 * Under a Gmail reply on the board: the reply check's verdict and, when it
 * needs you, the subtask it proposes for you to approve or wave off.
 */
export function ReplyCheck({ item }: { item: BoardItem }) {
  const { data, decide, now } = useHq();
  const key = triageKey(item.reply);
  const t = item.triage;
  const [title, setTitle] = useState(t?.subtask?.title ?? "");
  const [busy, setBusy] = useState(false);
  const run = (fn: () => Promise<void>) => {
    setBusy(true);
    void fn().finally(() => setBusy(false));
  };
  const who = item.reply.name || item.reply.from;

  if (item.state === "unchecked") {
    const error = data.triage?.error;
    return (
      <div className="hq-state" data-sev={error ? "bad" : undefined} role="status">
        <span className="hq-pill">Not checked yet</span>
        <span>{error ?? "The reply check reads it with the next Gmail sync, within 15 minutes."}</span>
      </div>
    );
  }

  if (item.state === "reopened") {
    return (
      <div className="hq-state" data-sev="warn" role="status">
        <span className="hq-pill" data-sev="warn">Back on the board</span>
        <span>The check said no action{t ? `: ${t.reason}` : ""} You put it back.</span>
        <button className="hq-btn hq-btn--ghost" type="button" disabled={busy} onClick={() => run(() => decide(key, "done", `${who} cleared`, { previous: item.decision }))}>Done</button>
      </div>
    );
  }

  if (item.state === "approved") {
    return (
      <div className="hq-subtask" data-state="approved">
        <div className="hq-chips">
          <span className="hq-pill" data-sev="ok">Subtask approved</span>
          <span className="hq-when">{ago(item.decision?.at, now)}</span>
        </div>
        <p className="hq-subtask__title">{item.decision?.title ?? t?.subtask?.title}</p>
        {t?.subtask?.detail ? <p className="hq-small" style={{ margin: 0 }}>{t.subtask.detail}</p> : null}
        {t?.subtask?.draftReply ? (
          <details className="hq-more"><summary>Suggested reply</summary><p className="hq-pre">{t.subtask.draftReply}</p></details>
        ) : null}
        <div className="hq-actions">
          <button className="hq-btn hq-btn--primary" type="button" disabled={busy} onClick={() => run(() => decide(key, "done", "Subtask done", { previous: item.decision }))}>Mark done</button>
          <span className="hq-mono">also leaves once you&apos;ve replied in Gmail</span>
        </div>
      </div>
    );
  }

  // proposed
  if (!t?.subtask) return null;
  return (
    <div className="hq-subtask" data-state="proposed">
      <div className="hq-chips">
        <span className="hq-pill" data-sev="warn">Proposed subtask</span>
        <span className="hq-chip">{CATEGORY[t.category] ?? t.category}</span>
        <span className="hq-when">checked {ago(t.at, now)}</span>
      </div>
      <label className="hq-field">
        <span>Next step (edit before approving if you like)</span>
        <input className="hq-input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
      </label>
      {t.subtask.detail ? <p className="hq-small" style={{ margin: 0 }}>{t.subtask.detail}</p> : null}
      <p className="hq-small" style={{ margin: 0 }}><strong>Why:</strong> {t.reason}</p>
      <Evidence item={item} />
      {t.subtask.draftReply ? (
        <details className="hq-more"><summary>Suggested reply</summary><p className="hq-pre">{t.subtask.draftReply}</p></details>
      ) : null}
      <div className="hq-actions">
        <button className="hq-btn hq-btn--primary" type="button" disabled={busy || !title.trim()} onClick={() => run(() => decide(key, "approved", `Subtask approved: ${title.trim()}`, { title: title.trim(), previous: item.decision }))}>Approve subtask</button>
        <button className="hq-btn hq-btn--ghost" type="button" disabled={busy} onClick={() => run(() => decide(key, "dismissed", `${who} moved off the board`, { previous: item.decision }))}>No action needed</button>
      </div>
    </div>
  );
}

/** Replies the check (or you) decided need nothing, with the reason, and a way to put one back. */
export function FilteredReplies({ items }: { items: BoardItem[] }) {
  const { decide, now } = useHq();
  if (!items.length) return null;
  return (
    <details className="hq-card hq-more">
      <summary>Filtered out by the reply check · {items.length}</summary>
      <p className="hq-small">Real replies the check read and found need nothing from you. They stay off the board; put one back if it got it wrong.</p>
      <ul className="hq-list">
        {items.map((i) => {
          const who = i.reply.name || i.reply.from;
          const mine = i.decision?.decision === "dismissed";
          return (
            <li key={triageKey(i.reply)} className="hq-row">
              <strong>{who}{i.triage ? <span className="hq-chip" style={{ marginLeft: 8 }}>{CATEGORY[i.triage.category] ?? i.triage.category}</span> : null}</strong>
              <span className="hq-when">{ago(i.reply.at, now)}</span>
              <p>{mine ? "You marked it as needing no action." : i.triage?.reason}</p>
              <p className="hq-mono" style={{ margin: 0 }}>
                <a className="hq-link" href={i.reply.url} target="_blank" rel="noreferrer">Open in Gmail</a>
                {" · "}
                <button
                  className="hq-linkbtn"
                  type="button"
                  onClick={() => void decide(triageKey(i.reply), mine ? "clear" : "reopened", mine ? `${who} back to the agent's proposal` : `${who} back on the board`, { previous: i.decision })}
                >
                  {mine ? "Undo" : "Needs action after all"}
                </button>
              </p>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
