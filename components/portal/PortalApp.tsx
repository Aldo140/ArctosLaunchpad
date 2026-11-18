"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";
import { googleProvider, hqAuth } from "@/lib/hq/firebaseClient";
import type { PortalSnapshot } from "@/lib/portal/types";

type Tab = "home" | "billing" | "documents" | "account";
type IconName = "home" | "card" | "file" | "user" | "arrow" | "check" | "clock" | "lock" | "spark" | "download";

class PortalApiError extends Error {
  constructor(message: string, readonly code?: string) { super(message); }
}

function Icon({ name }: { name: IconName }) {
  const path: Record<IconName, React.ReactNode> = {
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></>,
    file: <><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 13h6M9 17h6"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 22c.7-5 3.3-7 8-7s7.3 2 8 7"/></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>, check: <path d="m5 12 4 4L19 6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    spark: <><path d="m12 2 1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 21h14"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{path[name]}</svg>;
}

const money = (amount: number, currency: string) => new Intl.NumberFormat("en-CA", {
  style: "currency", currency: currency.toUpperCase(),
  minimumFractionDigits: amount % 100 ? 2 : 0, maximumFractionDigits: 2,
}).format(amount / 100);
const date = (at: number | null) => at ? new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Edmonton" }).format(at) : "—";
const relative = (at: number) => {
  const days = Math.floor((Date.now() - at) / 86_400_000);
  return days <= 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`;
};

const authMessage = (error: unknown) => {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  if (code.includes("unauthorized-domain")) return "This domain has not been authorized for sign-in yet. Arctos has been notified.";
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  if (code.includes("too-many-requests")) return "Too many attempts. Wait a moment and try again.";
  if (code.includes("user-disabled")) return "This account cannot sign in. Contact Arctos for help.";
  return error instanceof Error ? error.message.replace(/^Firebase: /, "") : "Sign-in could not be completed.";
};

function SignIn({ error }: { error: string | null }) {
  const auth = hqAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const completing = Boolean(auth && typeof window !== "undefined" && isSignInWithEmailLink(auth, window.location.href) && !localStorage.getItem("portalEmail"));
  const magic = async () => {
    if (!auth || !email.trim()) return;
    setBusy(true); setLocalError(null);
    try {
      const normalized = email.trim().toLowerCase();
      if (completing) {
        await signInWithEmailLink(auth, normalized, window.location.href);
        history.replaceState({}, "", "/portal");
      } else {
        localStorage.setItem("portalEmail", normalized);
        await sendSignInLinkToEmail(auth, normalized, { url: `${window.location.origin}/portal`, handleCodeInApp: true });
        setSent(true);
      }
    } catch (e) { setLocalError(authMessage(e)); }
    finally { setBusy(false); }
  };
  const google = async () => {
    if (!auth) return;
    setBusy(true); setLocalError(null);
    try { await signInWithPopup(auth, googleProvider()); }
    catch (e) {
      const code = typeof e === "object" && e && "code" in e ? String(e.code) : "";
      if (code.includes("popup-blocked") || code.includes("cancelled-popup-request")) await signInWithRedirect(auth, googleProvider());
      else setLocalError(authMessage(e));
    } finally { setBusy(false); }
  };
  return <div className="portal-login">
    <section className="portal-login__story" aria-label="Arctos client portal">
      <div className="portal-login__brand"><span className="portal-mark">A</span><span>ARCTOS <b>LAUNCHPAD</b></span></div>
      <div className="portal-login__storycopy"><p>Client workspace</p><h1>One clear view of the work.</h1><span>Progress, decisions, documents and billing—without digging through another email thread.</span></div>
      <div className="portal-login__proof"><span><Icon name="check"/><b>Project status</b><small>Know what moved and what happens next.</small></span><span><Icon name="file"/><b>Shared documents</b><small>Contracts and deliverables stay together.</small></span><span><Icon name="lock"/><b>Secure billing</b><small>Payments remain protected by Stripe.</small></span></div>
    </section>
    <section className="portal-login__entry">
    <div className="portal-login__card">
      <p className="portal-kicker"><Icon name="lock"/> Private access</p>
      <h2>{sent ? <>Check your inbox.</> : completing ? <>Finish signing in.</> : <>Welcome back.</>}</h2>
      <p>{sent ? `A secure link is on its way to ${email}. It expires automatically.` : completing ? "Confirm the email address that received this link." : "Use the email connected to your Arctos workspace."}</p>
      {!sent ? <>
        <label className="portal-field"><span>Email address</span><input type="email" inputMode="email" autoCapitalize="none" autoComplete="email" placeholder="you@company.ca" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void magic()}/></label>
        <button className="portal-primary" type="button" disabled={busy || !email.trim() || !auth} onClick={() => void magic()}>{busy ? "Working…" : completing ? "Complete secure sign-in" : "Send secure sign-in link"}<Icon name="arrow"/></button>
        {!completing ? <><div className="portal-or"><span>or</span></div><button className="portal-google" type="button" disabled={!auth || busy} onClick={() => void google()}><b>G</b> Continue with Google</button></> : null}
      </> : <button className="portal-google" type="button" onClick={() => setSent(false)}>Use another email</button>}
      {!auth ? <p className="portal-error">Sign-in is temporarily unavailable because the production identity configuration is incomplete.</p> : (localError || error) ? <p className="portal-error">{localError || error}</p> : null}
      <p className="portal-login__fine"><Icon name="lock"/> Your payment details stay with Stripe. Arctos never stores your full card or bank information.</p>
    </div>
    <p className="portal-login__help"><a href="/portal/admin">Arctos owner? Open client administration</a><span>·</span><a href="mailto:aldo@arctoslaunchpad.com">Get access help</a></p>
    </section>
  </div>;
}

function NoWorkspace({ email, logout }: { email: string; logout: () => void }) {
  return <div className="portal-access"><div className="portal-login__brand"><span className="portal-mark">A</span><span>ARCTOS <b>LAUNCHPAD</b></span></div><section><span className="portal-iconbox portal-iconbox--large"><Icon name="user"/></span><p className="portal-kicker">Signed in successfully</p><h1>Your workspace isn&apos;t connected yet.</h1><p><b>{email}</b> is authenticated, but it has not been invited to a client workspace. Ask Arctos to connect this address, or use a different account.</p><a className="portal-primary" href="mailto:aldo@arctoslaunchpad.com?subject=Client%20portal%20access">Request access <Icon name="arrow"/></a><button className="portal-google" onClick={logout}>Sign in with another account</button></section></div>;
}

function BillingCard({ data, act }: { data: PortalSnapshot["account"]; act: (action: "start" | "manage", accepted?: boolean) => Promise<void> }) {
  const [authorize, setAuthorize] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const b = data.billing;
  const active = b.status === "active" || b.status === "trialing";
  return <section className="portal-billinghero" data-active={active}>
    <div className="portal-billinghero__top"><span className="portal-iconbox"><Icon name="card"/></span><span className="portal-status" data-status={b.status}><i/>{active ? "Automatic payments active" : b.status === "past-due" ? "Payment needs attention" : "Set up automatic payments"}</span></div>
    <div><p>Your plan</p><h2>{b.planName}</h2><strong>{money(b.monthlyAmount, b.currency)} <small>/ month</small></strong></div>
    <div className="portal-billinghero__foot">
      <span><small>{active ? "Next payment" : "Billing"}</small><b>{active ? date(b.nextPaymentAt) : "Not started"}</b></span>
      {b.canStart && <button type="button" onClick={() => setAuthorize(true)}>Authorize payments<Icon name="arrow"/></button>}
      {b.canManage && <button type="button" onClick={() => void act("manage")}>Manage billing<Icon name="arrow"/></button>}
      {!b.canStart && !b.canManage && <b>No payment setup required</b>}
    </div>
    {authorize ? <div className="portal-modal" role="dialog" aria-modal="true" aria-labelledby="authorize-title"><div className="portal-modal__sheet">
      <button className="portal-modal__close" onClick={() => setAuthorize(false)} aria-label="Close">×</button>
      <span className="portal-iconbox portal-iconbox--large"><Icon name="lock"/></span>
      <p className="portal-kicker">Recurring payment authorization</p><h2 id="authorize-title">One clear authorization. No surprise charges.</h2>
      <dl><div><dt>Service</dt><dd>{b.planName}</dd></div><div><dt>Amount</dt><dd>{money(b.monthlyAmount, b.currency)} monthly</dd></div><div><dt>Starts</dt><dd>After secure checkout</dd></div></dl>
      <label className="portal-consent"><input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)}/><span>I authorize Arctos Launchpad to charge the payment method I provide for this monthly subscription until I cancel. Stripe will show the final payment terms and collect any required mandate.</span></label>
      <button className="portal-primary" disabled={!accepted} onClick={() => void act("start", accepted)}>Continue securely with Stripe<Icon name="arrow"/></button>
      <p className="portal-modal__fine">You can update your payment method or cancel from this portal. Bank debits may take several business days to settle.</p>
    </div></div> : null}
  </section>;
}

function Home({ account, setTab }: { account: PortalSnapshot["account"]; setTab: (tab: Tab) => void }) {
  const done = account.milestones.filter((m) => m.status === "done").length;
  return <>
    <header className="portal-welcome"><div><p>{account.company}</p><h1>Hi, {account.firstName}.</h1></div><a href={`mailto:${account.leadContact.email}`}>Contact {account.leadContact.name}</a></header>
    {account.nextStep ? <section className="portal-next"><span><Icon name="spark"/></span><div><p>Next move</p><h2>{account.nextStep.title}</h2><small>{account.nextStep.detail}</small></div>{account.nextStep.due ? <b>{account.nextStep.due}</b> : null}</section> : null}
    <div className="portal-homegrid">
      <section className="portal-card portal-project"><div className="portal-card__head"><div><p>Current project</p><h2>{account.projectName}</h2></div><span className="portal-project__state">{account.status.replace("-", " ")}</span></div><p>{account.projectSummary}</p><div className="portal-progress"><span style={{ width: `${Math.max(8, account.milestones.length ? (done / account.milestones.length) * 100 : 0)}%` }}/></div><div className="portal-progress__meta"><b>{done} of {account.milestones.length} milestones complete</b><span>{account.services.join(" · ")}</span></div></section>
      <div className="portal-shortcuts">
        <button onClick={() => setTab("documents")}><Icon name="file"/><span><b>Project files</b><small>{account.documents.length ? `${account.documents.length} shared` : "No files shared yet"}</small></span><Icon name="arrow"/></button>
        <button onClick={() => setTab("billing")}><Icon name="card"/><span><b>Billing</b><small>{account.billing.status === "past-due" ? "Payment needs attention" : account.billing.canManage ? "Invoices and payment settings" : account.billing.canStart ? "Set up monthly payments" : "No payment setup required"}</small></span><Icon name="arrow"/></button>
      </div>
    </div>
    <section className="portal-card"><div className="portal-card__head"><div><p>Project path</p><h2>From here to live</h2></div><button className="portal-textbtn" onClick={() => setTab("documents")}>Documents <Icon name="arrow"/></button></div><ol className="portal-milestones">{account.milestones.map((m) => <li key={m.id} data-status={m.status}><span>{m.status === "done" ? <Icon name="check"/> : m.status === "current" ? <i/> : null}</span><div><b>{m.title}</b><small>{m.detail}</small></div><time>{m.date ?? "TBD"}</time></li>)}</ol></section>
    <section className="portal-card"><div className="portal-card__head"><div><p>Latest activity</p><h2>What changed</h2></div></div><ol className="portal-activity">{account.activity.slice(0,5).map((a) => <li key={a.id}><span data-kind={a.kind}><Icon name={a.kind === "billing" ? "card" : a.kind === "document" ? "file" : "spark"}/></span><div><b>{a.title}</b><small>{a.detail}</small></div><time>{relative(a.at)}</time></li>)}</ol></section>
  </>;
}

function Documents({ account, open }: { account: PortalSnapshot["account"]; open: (id: string) => Promise<void> }) {
  const labels: Record<string,string> = { contract:"Contract",invoice:"Invoice",proposal:"Proposal",brief:"Brief",report:"Report",other:"File" };
  return <><header className="portal-pagehead"><p>Your files</p><h1>Documents, without the email hunt.</h1><span>{account.documents.length} shared with you</span></header><section className="portal-card portal-docs"><div className="portal-card__head"><div><p>Project library</p><h2>{account.projectName}</h2></div></div>{account.documents.length ? <ol>{account.documents.map((d) => <li key={d.id}><span className="portal-fileicon"><Icon name="file"/></span><div><b>{d.name}</b><small>{labels[d.kind]} · Updated {date(d.updatedAt)}{d.size ? ` · ${d.size}` : ""}</small></div><button onClick={() => void open(d.id)} aria-label={`Open ${d.name}`}><Icon name="download"/></button></li>)}</ol> : <p className="portal-empty">No files have been shared yet.</p>}</section></>;
}

function Billing({ account, act }: { account: PortalSnapshot["account"]; act: (action: "start" | "manage", accepted?: boolean) => Promise<void> }) {
  return <><header className="portal-pagehead"><p>Billing</p><h1>Predictable payments. Full control.</h1><span>Powered securely by Stripe</span></header><BillingCard data={account} act={act}/><section className="portal-card portal-assurance"><div><Icon name="lock"/><h2>Your payment information stays with Stripe.</h2><p>Arctos receives payment status and invoice references. We do not store full card numbers or bank credentials.</p></div><ul><li><Icon name="check"/> Update your payment method anytime</li><li><Icon name="check"/> Download Stripe invoices and receipts</li><li><Icon name="check"/> Cancel recurring billing from the billing portal</li></ul></section></>;
}

function Account({ account, logout }: { account: PortalSnapshot["account"]; logout: () => void }) {
  return <><header className="portal-pagehead"><p>Your account</p><h1>The people and details behind the work.</h1></header><section className="portal-card portal-profile"><div className="portal-profile__hero"><span className="portal-avatar portal-avatar--large">{account.firstName.slice(0,1)}{account.company.slice(0,1)}</span><div><h2>{account.clientName}</h2><p>{account.company}</p></div></div><dl><div><dt>Signed in as</dt><dd>{account.email}</dd></div><div><dt>Arctos contact</dt><dd>{account.leadContact.name}<a href={`mailto:${account.leadContact.email}`}>{account.leadContact.email}</a></dd></div><div><dt>Services</dt><dd>{account.services.join(", ")}</dd></div></dl><button className="portal-signout" onClick={logout}>Sign out</button></section></>;
}

export function PortalApp() {
  const auth = hqAuth();
  const [user, setUser] = useState<User | null | undefined>(auth ? undefined : null);
  const [snapshot, setSnapshot] = useState<PortalSnapshot | null>(null);
  const [tab, setTab] = useState<Tab>("home");
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [loading, setLoading] = useState(false);

  const call = useCallback(async (path: string, body?: unknown) => {
    if (!user) throw new Error("Sign in first.");
    const response = await fetch(path, { method:"POST", headers:{ Authorization:`Bearer ${await user.getIdToken()}`, "Content-Type":"application/json" }, body:JSON.stringify(body ?? {}) });
    const json = await response.json().catch(() => ({})) as { error?: string; url?: string; code?: string };
    if (!response.ok) throw new PortalApiError(json.error ?? `Request failed (${response.status}).`, json.code);
    return json;
  }, [user]);
  const load = useCallback(async () => { setLoading(true); try { setSnapshot(await call("/api/portal/snapshot") as unknown as PortalSnapshot); setAccessDenied(false); setError(null); } catch(e) { if (e instanceof PortalApiError && e.code === "hq-admin") { window.location.replace("/portal/admin"); return; } if (e instanceof PortalApiError && e.code === "no-workspace") setAccessDenied(true); setError(e instanceof Error ? e.message : "Could not load the workspace."); } finally { setLoading(false); } }, [call]);

  useEffect(() => auth ? onAuthStateChanged(auth, setUser) : undefined, [auth]);
  useEffect(() => { if (!auth || !isSignInWithEmailLink(auth, window.location.href)) return; const email = localStorage.getItem("portalEmail"); if (!email) return; void signInWithEmailLink(auth, email, window.location.href).then(() => { localStorage.removeItem("portalEmail"); history.replaceState({}, "", "/portal"); }).catch((e) => setError(authMessage(e))); }, [auth]);
  useEffect(() => { if (user) queueMicrotask(() => void load()); }, [user, load]);

  const billing = async (action: "start" | "manage", accepted?: boolean) => { try { const result = await call("/api/portal/billing", { action, accepted }); if (result.url) window.location.assign(result.url); } catch(e) { setError(e instanceof Error ? e.message : "Could not open billing."); } };
  const document = async (id: string) => { try { const result = await call("/api/portal/document", { id }); if (result.url) window.location.assign(result.url); } catch(e) { setError(e instanceof Error ? e.message : "Could not open the document."); } };
  const tabs = useMemo(() => ([['home','home','Home'],['billing','card','Billing'],['documents','file','Files'],['account','user','Account']] as [Tab,IconName,string][]), []);

  if (user && accessDenied) return <div className="portal-app"><NoWorkspace email={user.email ?? "this account"} logout={() => auth && void signOut(auth).then(() => { setAccessDenied(false); setError(null); })}/></div>;
  if (!user) return <div className="portal-app"><SignIn error={error}/></div>;
  if (!snapshot) return <div className="portal-app"><div className="portal-loading" role="status">
    <span className="portal-mark">A</span>
    <p>{error ?? (loading ? "Opening your workspace…" : "Getting your workspace ready…")}</p>
    {error && <><button className="portal-primary" onClick={() => void load()}>Try again</button>
      <button className="portal-google" onClick={() => auth && void signOut(auth)}>Switch account</button></>}
  </div></div>;
  const account = snapshot.account;
  const navigate = (next: Tab) => {
    setTab(next);
    window.document.querySelector(".portal-app")?.scrollTo({ top: 0 });
  };
  return <div className="portal-app"><aside className="portal-side"><div className="portal-login__brand"><span className="portal-mark">A</span><span>ARCTOS <b>LAUNCHPAD</b></span></div><nav>{tabs.map(([id,icon,label]) => <button key={id} aria-current={tab===id ? 'page':undefined} onClick={() => navigate(id)}><Icon name={icon}/><span>{label}</span></button>)}</nav><div className="portal-side__contact"><p>Your project lead</p><b>{account.leadContact.name}</b><a href={`mailto:${account.leadContact.email}`}>Send a message <Icon name="arrow"/></a></div></aside><main className="portal-main">{error ? <div className="portal-toast" onClick={() => setError(null)}>{error}<button>×</button></div> : null}{tab==='home' ? <Home account={account} setTab={navigate}/> : tab==='billing' ? <Billing account={account} act={billing}/> : tab==='documents' ? <Documents account={account} open={document}/> : <Account account={account} logout={() => auth && void signOut(auth)}/>}</main><nav className="portal-mobile-nav">{tabs.map(([id,icon,label]) => <button key={id} aria-current={tab===id ? 'page':undefined} onClick={() => navigate(id)}><Icon name={icon}/><span>{label}</span></button>)}</nav></div>;
}
