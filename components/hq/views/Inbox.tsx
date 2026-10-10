"use client";

import { useEffect, useMemo, useState } from "react";
import type { CommandType, HqPost, InboxPitch, InboxReply } from "@/lib/hq/types";
import { replyBoard, triageKey, type BoardItem } from "@/lib/hq/triage";
import { CommandState } from "../CommandState";
import { inFilter, latestCommand, useHq } from "../context";
import { BUSINESS_LABEL, STATUS_LABEL, ago, cdn, plural, short, until, when } from "../format";
import { Empty, Icon, Thumb } from "../ui";
import { FilteredReplies, ReplyCheck } from "../ReplyCheck";
import { QUEUE_GROUP, decisionQueue, describe, isQueued, type QueueItem } from "../queue";
import { calgaryDayStart } from "../tasks";

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

function GmailReplyCard({ item }: { item: BoardItem }) {
  const { now } = useHq();
  const reply = item.reply;
  return (
    <article className="hq-decision hq-decision--text">
      <div className="hq-decision__body">
        <div className="hq-chips">
          <span className="hq-chip">{BUSINESS_LABEL[reply.business] ?? "Gmail"}</span>
          <span className="hq-chip">Gmail reply to your pitch</span>
          <span className="hq-when">Replied {ago(reply.at, now)}{item.earlier ? ` · ${plural(item.earlier + 1, "message")} from them in the thread` : ""}</span>
        </div>
        <h3 className="hq-decision__title">{reply.name || reply.from} wrote back</h3>
        <p className="hq-small">From {reply.from}{reply.subject ? ` · ${reply.subject}` : ""}</p>
        <blockquote className="hq-quote">{reply.snippet}</blockquote>
        <ReplyCheck key={`${triageKey(reply)}-${item.triage?.at ?? 0}`} item={item} />
        <div className="hq-actions">
          <a className="hq-btn" href={reply.url} target="_blank" rel="noreferrer">Answer in Gmail</a>
          <span className="hq-mono">to {reply.alias} · leaves this list once you&apos;ve replied</span>
        </div>
      </div>
    </article>
  );
}

const TARGET: Record<QueueItem["kind"], { id: (i: QueueItem) => string; types: CommandType[] }> = {
  reply: { id: (i) => (i.kind === "reply" ? i.reply.leadId : ""), types: ["approve-reply", "handled-reply"] },
  gmail: { id: () => "", types: [] },
  post: { id: (i) => (i.kind === "post" ? i.post.id : ""), types: ["approve-post", "reject-post", "redraft-post", "unschedule-post"] },
  pitch: { id: (i) => (i.kind === "pitch" ? i.pitch.leadId : ""), types: ["approve-pitch", "skip-pitch"] },
};

/** The one-tap actions on a row, so most decisions never need the full card. */
function Quick({ item, onOpen }: { item: QueueItem; onOpen: () => void }) {
  const { data, act, cancel, decide } = useHq();
  const [busy, setBusy] = useState(false);
  const run = (fn: () => Promise<void>) => {
    setBusy(true);
    void fn().finally(() => setBusy(false));
  };
  const t = TARGET[item.kind];
  const cmd = t.types.length ? latestCommand(data.commands, t.id(item), t.types) : null;
  if (cmd?.status === "pending") {
    return (
      <span className="hq-q__queued">
        <span className="hq-pill" data-sev="ok">Queued</span>
        <button type="button" className="hq-linkbtn" onClick={() => void cancel(cmd.id)}>Undo</button>
      </span>
    );
  }
  switch (item.kind) {
    case "post":
      return item.post.status === "drafted" ? (
        <button type="button" className="hq-btn hq-btn--primary hq-btn--sm" disabled={busy} onClick={() => run(() => act("approve-post", item.post.id, {}, `Approved “${item.post.headline}”`))}>Approve</button>
      ) : (
        <button type="button" className="hq-btn hq-btn--sm" onClick={onOpen}>Fix it</button>
      );
    case "pitch":
      return (
        <>
          <button type="button" className="hq-btn hq-btn--ghost hq-btn--sm" disabled={busy} onClick={() => run(() => act("skip-pitch", item.pitch.leadId, {}, `Skipped ${item.pitch.businessName}`))}>Skip</button>
          <button type="button" className="hq-btn hq-btn--primary hq-btn--sm" disabled={busy || !item.pitch.body.trim()} onClick={() => run(() => act("approve-pitch", item.pitch.leadId, { subject: item.pitch.subject, body: item.pitch.body }, `Pitch to ${item.pitch.businessName} approved`))}>Send</button>
        </>
      );
    case "reply":
      return <button type="button" className="hq-btn hq-btn--primary hq-btn--sm" disabled={busy || !item.reply.suggestedBody.trim()} onClick={() => run(() => act("approve-reply", item.reply.leadId, { body: item.reply.suggestedBody }, `Reply to ${item.reply.businessName} approved`))}>Send reply</button>;
    case "gmail": {
      const { state, triage, reply } = item.item;
      if (state === "proposed" && triage?.subtask) {
        const title = triage.subtask.title;
        return <button type="button" className="hq-btn hq-btn--primary hq-btn--sm" disabled={busy} onClick={() => run(() => decide(triageKey(reply), "approved", `On your list: ${title}`, { title, previous: item.item.decision }))}>Add to-do</button>;
      }
      if (state === "approved") return <button type="button" className="hq-btn hq-btn--primary hq-btn--sm" disabled={busy} onClick={() => run(() => decide(triageKey(reply), "done", "Done. Nice.", { previous: item.item.decision }))}>Done</button>;
      return <a className="hq-btn hq-btn--sm" href={reply.url} target="_blank" rel="noreferrer">Gmail <Icon name="external" /></a>;
    }
  }
}

function Body({ item }: { item: QueueItem }) {
  switch (item.kind) {
    case "post": return <PostDecision post={item.post} />;
    case "pitch": return <PitchDecision pitch={item.pitch} />;
    case "reply": return <ReplyDecision reply={item.reply} />;
    case "gmail": return <GmailReplyCard item={item.item} />;
  }
}

/**
 * One decision as a row: what it is, who, how long it's waited, and the
 * one-tap action. Opening it shows the full card to edit before deciding.
 */
export function QueueRow({ item, open, onToggle }: { item: QueueItem; open?: boolean; onToggle?: () => void }) {
  const { now, go } = useHq();
  const d = describe(item);
  const toggle = onToggle ?? (() => go(`decide/${item.key}`));
  const waited = now - item.at;
  const sev = item.kind === "post" && item.post.status !== "drafted" ? "bad" : waited > 2 * 86_400_000 ? "bad" : waited > 12 * 3_600_000 ? "warn" : "ok";
  const img = item.kind === "post" ? cdn(item.post.imageUrl) : null;
  return (
    <li className="hq-q" data-open={open ? "true" : undefined} data-sev={sev} id={`q-${item.key}`}>
      <div className="hq-q__row">
        <button type="button" className="hq-q__head" aria-expanded={!!open} onClick={toggle}>
          {item.kind === "post" ? <span className="hq-q__thumb"><Thumb src={img} alt="" /></span> : <span className="hq-q__dot" aria-hidden="true">{(item.kind === "pitch" ? item.pitch.businessName : d.title).charAt(0)}</span>}
          <span className="hq-q__main">
            <span className="hq-q__meta"><b>{d.label}</b> · {BUSINESS_LABEL[item.business] ?? item.business} · {short(item.at, now).replace(" ago", "")}</span>
            <strong>{d.title}</strong>
            <span className="hq-q__detail">{d.detail}</span>
          </span>
        </button>
        <span className="hq-q__quick"><Quick item={item} onOpen={toggle} /></span>
      </div>
      {open ? <div className="hq-q__body"><Body item={item} /></div> : null}
    </li>
  );
}

export function InboxView({ focus }: { focus?: string }) {
  const { data, filter, now } = useHq();
  const [kind, setKind] = useState<Kind>("all");
  // Still to decide first; what you've already queued drops to the bottom until the agents pick it up.
  const everything = useMemo(() => decisionQueue(data, filter), [data, filter]);
  const all = everything.filter((i) => !isQueued(data, i));
  const queued = everything.filter((i) => isQueued(data, i));
  const { filtered } = replyBoard(data, (r) => inFilter(filter, r.business));
  const shown = [...all, ...queued].filter((i) => kind === "all" || (kind === "replies" ? i.kind === "reply" || i.kind === "gmail" : kind === "posts" ? i.kind === "post" : i.kind === "pitch"));
  const [openKey, setOpenKey] = useState<string | null>(focus ?? null);
  const open = shown.find((i) => i.key === openKey)?.key ?? null;
  const count = (k: Kind) => all.filter((i) => k === "all" || (k === "replies" ? i.kind === "reply" || i.kind === "gmail" : k === "posts" ? i.kind === "post" : i.kind === "pitch")).length;
  const segs: Array<[Kind, string]> = [["all", "Everything"], ["replies", "Replies"], ["posts", "Posts"], ["pitches", "Pitches"]];

  // What you've already cleared today, so the list reads as progress.
  const dayStart = calgaryDayStart(now);
  const cleared = new Set([...data.commands.filter((c) => c.at >= dayStart).map((c) => c.targetId), ...(data.decisions ?? []).filter((d) => d.at >= dayStart).map((d) => d.key)]).size;
  const total = cleared + all.length;

  // j / k to move between decisions, o to open or close the current one.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey || (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)))) return;
      const at = shown.findIndex((i) => i.key === open);
      const pick = (n: number) => {
        const k = shown[Math.max(0, Math.min(shown.length - 1, n))]?.key;
        if (!k) return;
        setOpenKey(k);
        window.requestAnimationFrame(() => document.getElementById(`q-${k}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
      };
      if (e.key === "j") pick(at + 1);
      else if (e.key === "k") pick(at - 1);
      else if (e.key === "o") setOpenKey(open ? "" : shown[0]?.key ?? null);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shown, open]);

  return (
    <div className="hq-view">
      <header className="hq-viewhead">
        <h1 className="hq-h1">{all.length ? <>{plural(all.length, "decision")} <em>waiting on you.</em></> : <>All clear. <em>Nicely done.</em></>}</h1>
        <p className="hq-lede">People who wrote back come first, because that&apos;s money. Most things take one tap; open a row to edit before you decide. The agents carry it out within 30 minutes, and Undo works until then.</p>
        {total ? (
          <div className="hq-progress" aria-label={`${cleared} of ${total} cleared today`}>
            <span className="hq-meter"><span style={{ width: `${Math.round((cleared / total) * 100)}%` }} /></span>
            <span className="hq-mono">{cleared} cleared today · {all.length} to go</span>
          </div>
        ) : null}
      </header>
      <div className="hq-seg" role="group" aria-label="Show">
        {segs.map(([k, label]) => (
          <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>{label}{count(k) ? <b>{count(k)}</b> : null}</button>
        ))}
      </div>
      {shown.length ? (
        <ul className="hq-qlist">
          {shown.map((i, n) => {
            const g = QUEUE_GROUP[i.kind];
            const done = isQueued(data, i);
            const prevDone = n > 0 && isQueued(data, shown[n - 1]);
            const label = done ? (n === 0 || !prevDone ? "Queued, the agents do it next" : null) : kind === "all" && (n === 0 || QUEUE_GROUP[shown[n - 1].kind] !== g) ? g : null;
            return (
              <QueueGroup key={i.key} label={label}>
                <QueueRow item={i} open={i.key === open} onToggle={() => setOpenKey(i.key === open ? "" : i.key)} />
              </QueueGroup>
            );
          })}
        </ul>
      ) : (
        <Empty title="Nothing waiting here.">New drafts, replies and pitches land here the moment the agents find them.</Empty>
      )}
      {(kind === "all" || kind === "replies") && <FilteredReplies items={filtered} />}
      <p className="hq-mono hq-hide-sm">j / k to move · o to open or close</p>
    </div>
  );
}

function QueueGroup({ label, children }: { label: string | null; children: React.ReactNode }) {
  return (
    <>
      {label ? <li className="hq-qgroup" aria-hidden="true">{label}</li> : null}
      {children}
    </>
  );
}
