"use client";

import { useState } from "react";
import type { HqPost, InboxPitch, InboxReply } from "@/lib/hq/types";
import { CommandState } from "../CommandState";
import { inFilter, latestCommand, useHq } from "../context";
import { BUSINESS_LABEL, STATUS_LABEL, ago, cdn, plural, until, when } from "../format";
import { Empty, Thumb } from "../ui";

type Kind = "all" | "posts" | "pitches" | "replies";

function PostDecision({ post }: { post: HqPost }) {
  const { data, act, now } = useHq();
  const [caption, setCaption] = useState(post.caption);
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const cmd = latestCommand(data.commands, post.id, ["approve-post", "reject-post", "redraft-post", "unschedule-post"]);
  const slot = post.scheduledFor ?? post.suggestedFor;
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); }
  };
  const fixing = post.status === "needs-correction" || post.status === "failed";

  return (
    <article className="hq-decision">
      <Thumb src={cdn(post.imageUrl)} alt={post.altText || post.headline} tag={post.format === "reel" ? "Reel" : post.format === "carousel" ? `${post.imageUrls.length} slides` : undefined} />
      <div className="hq-decision__body">
        <div className="hq-chips">
          <span className="hq-chip">{BUSINESS_LABEL[post.brand]}</span>
          <span className="hq-chip">{post.template}</span>
          <span className="hq-pill" data-sev={fixing ? "bad" : "warn"}>{STATUS_LABEL[post.status] ?? post.status}</span>
          <span className="hq-when">{slot ? `Slot ${when(slot)} · ${until(slot, now)}` : `Drafted ${ago(post.updatedAt, now)}`}</span>
        </div>
        <h3 className="hq-decision__title">{post.headline}</h3>
        {post.error ? <p className="hq-error">{post.error}</p> : null}
        {post.warnings.length ? <p className="hq-small">⚠ {post.warnings.join(" · ")}</p> : null}
        {editing ? (
          <label className="hq-field">
            <span>Caption</span>
            <textarea className="hq-textarea" rows={8} value={caption} onChange={(e) => setCaption(e.target.value)} />
          </label>
        ) : (
          <p className="hq-pre">{post.caption}</p>
        )}
        {post.facts ? (
          <details className="hq-more">
            <summary>Facts it was written from</summary>
            <p className="hq-pre">{post.facts}</p>
          </details>
        ) : null}
        {cmd ? <CommandState command={cmd} /> : null}
        {!cmd || cmd.status !== "pending" ? (
          <div className="hq-actions">
            {post.status !== "approved" && !fixing ? (
              <button className="hq-btn hq-btn--primary" type="button" disabled={busy || !caption.trim()} onClick={() => run(() => act("approve-post", post.id, caption !== post.caption ? { caption } : {}, `Approved “${post.headline}”`))}>
                Approve{slot ? ` for ${when(slot)}` : ""}
              </button>
            ) : null}
            {post.status === "approved" ? (
              <button className="hq-btn" type="button" disabled={busy} onClick={() => run(() => act("unschedule-post", post.id, {}, `Unscheduled “${post.headline}”`))}>Unschedule</button>
            ) : null}
            <button className="hq-btn hq-btn--ghost" type="button" onClick={() => setEditing((v) => !v)}>{editing ? "Done editing" : "Edit caption"}</button>
            <details className="hq-more">
              <summary>Redraft with a note</summary>
              <div className="hq-actions" style={{ marginTop: 8 }}>
                <input className="hq-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. lead with the free entry" aria-label="Note for the redraft" />
                <button className="hq-btn" type="button" disabled={busy} onClick={() => run(() => act("redraft-post", post.id, { note }, `Redraft requested for “${post.headline}”`))}>Redraft</button>
              </div>
            </details>
            <button className="hq-btn hq-btn--danger" type="button" disabled={busy} onClick={() => run(() => act("reject-post", post.id, {}, `Rejected “${post.headline}”`))}>Reject</button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function PitchDecision({ pitch }: { pitch: InboxPitch }) {
  const { data, act, now } = useHq();
  const [subject, setSubject] = useState(pitch.subject);
  const [body, setBody] = useState(pitch.body);
  const [busy, setBusy] = useState(false);
  const cmd = latestCommand(data.commands, pitch.leadId, ["approve-pitch", "skip-pitch"]);
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); }
  };
  return (
    <article className="hq-decision hq-decision--text">
      <div className="hq-decision__body">
        <div className="hq-chips">
          <span className="hq-chip">{BUSINESS_LABEL[pitch.business]}</span>
          <span className="hq-chip">{pitch.followUp ? "Follow-up" : "First email"}</span>
          {pitch.category ? <span className="hq-chip">{pitch.category}</span> : null}
          <span className="hq-when">Drafted {ago(pitch.at, now)}</span>
        </div>
        <h3 className="hq-decision__title">{pitch.businessName}</h3>
        <p className="hq-small">To {pitch.contactEmail ?? "no address"}{pitch.neighbourhood ? ` · ${pitch.neighbourhood}` : ""}. {pitch.reasonRelevant}</p>
        <label className="hq-field"><span>Subject</span><input className="hq-input" value={subject} onChange={(e) => setSubject(e.target.value)} /></label>
        <label className="hq-field"><span>Email</span><textarea className="hq-textarea" rows={9} value={body} onChange={(e) => setBody(e.target.value)} /></label>
        {cmd ? <CommandState command={cmd} /> : null}
        {!cmd || cmd.status !== "pending" ? (
          <div className="hq-actions">
            <button className="hq-btn hq-btn--primary" type="button" disabled={busy || !body.trim()} onClick={() => run(() => act("approve-pitch", pitch.leadId, { subject, body }, `Pitch to ${pitch.businessName} approved`))}>Approve to send</button>
            <button className="hq-btn hq-btn--ghost" type="button" disabled={busy} onClick={() => run(() => act("skip-pitch", pitch.leadId, {}, `Skipped ${pitch.businessName}`))}>Skip</button>
            <span className="hq-small">Sends from aldo@calgarywatch.ca in the next window, Monday to Thursday, 9 to 4:30.</span>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ReplyDecision({ reply }: { reply: InboxReply }) {
  const { data, act, now } = useHq();
  const [body, setBody] = useState(reply.suggestedBody);
  const [busy, setBusy] = useState(false);
  const cmd = latestCommand(data.commands, reply.leadId, ["approve-reply", "handled-reply"]);
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); }
  };
  return (
    <article className="hq-decision hq-decision--text">
      <div className="hq-decision__body">
        <div className="hq-chips">
          <span className="hq-chip">{BUSINESS_LABEL[reply.business]}</span>
          <span className="hq-pill" data-sev={reply.classification === "interested" ? "ok" : "warn"}>{reply.classification}</span>
          <span className="hq-when">Replied {ago(reply.at, now)}</span>
        </div>
        <h3 className="hq-decision__title">{reply.businessName} wrote back</h3>
        <p className="hq-small">From {reply.from}{reply.subject ? ` · ${reply.subject}` : ""}</p>
        <blockquote className="hq-quote">{reply.text}</blockquote>
        {reply.approved ? <p className="hq-small">Your reply is queued; it goes out in the next send window.</p> : (
          <label className="hq-field"><span>Your reply (drafted by the agent)</span><textarea className="hq-textarea" rows={8} value={body} onChange={(e) => setBody(e.target.value)} /></label>
        )}
        {cmd ? <CommandState command={cmd} /> : null}
        {!reply.approved && (!cmd || cmd.status !== "pending") ? (
          <div className="hq-actions">
            <button className="hq-btn hq-btn--primary" type="button" disabled={busy || !body.trim()} onClick={() => run(() => act("approve-reply", reply.leadId, { body }, `Reply to ${reply.businessName} approved`))}>Approve reply</button>
            <button className="hq-btn hq-btn--ghost" type="button" disabled={busy} onClick={() => run(() => act("handled-reply", reply.leadId, {}, `${reply.businessName} marked handled`))}>I answered myself</button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function InboxView() {
  const { data, filter } = useHq();
  const [kind, setKind] = useState<Kind>("all");
  const snap = data.snapshot;
  const posts = (snap?.posts ?? []).filter((p) => ["drafted", "needs-correction", "failed"].includes(p.status) && inFilter(filter, p.brand));
  const pitches = (snap?.inbox?.pitches ?? []).filter((p) => inFilter(filter, p.business));
  const replies = (snap?.inbox?.replies ?? []).filter((r) => !r.approved && inFilter(filter, r.business));
  const total = posts.length + pitches.length + replies.length;
  const segs: Array<[Kind, string, number]> = [["all", "Everything", total], ["replies", "Replies", replies.length], ["posts", "Posts", posts.length], ["pitches", "Pitches", pitches.length]];

  return (
    <div className="hq-view">
      <header>
        <p className="hq-eyebrow"><span>02</span> Run the work</p>
        <h1 className="hq-h1">{total ? <>{plural(total, "decision")} <em>waiting on you.</em></> : <>Inbox zero. <em>Nicely done.</em></>}</h1>
        <p className="hq-lede" style={{ marginTop: 10 }}>Replies first, then posts, then pitches. Every action here is applied by the agents on their next run, about every 30 minutes. Changed your mind? Undo works until then.</p>
      </header>
      <div className="hq-seg" role="group" aria-label="Show">
        {segs.map(([k, label, n]) => (
          <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>{label}{n ? <b>{n}</b> : null}</button>
        ))}
      </div>
      {total === 0 ? <Empty title="Nothing waiting.">New drafts, replies and pitches land here as the agents find them. Vow Motion and Arctos replies join once Gmail is connected.</Empty> : null}
      {(kind === "all" || kind === "replies") && replies.map((r) => <ReplyDecision key={`r-${r.leadId}`} reply={r} />)}
      {(kind === "all" || kind === "posts") && posts.map((p) => <PostDecision key={`p-${p.id}`} post={p} />)}
      {(kind === "all" || kind === "pitches") && pitches.map((p) => <PitchDecision key={`c-${p.leadId}`} pitch={p} />)}
    </div>
  );
}
