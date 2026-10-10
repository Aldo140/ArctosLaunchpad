"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { googleProvider, hqAuth } from "@/lib/hq/firebaseClient";
import type { CommandType, HqCommandRecord, HqResponse, LifeEntry, TriageDecision, TriageDecisionKind } from "@/lib/hq/types";
import { HqContext, useHq, type Filter, type HqContextValue } from "./context";
import { BUSINESSES, ago } from "./format";
import { Icon } from "./ui";
import { Palette, type PaletteItem } from "./Palette";
import { OWNER } from "./persona";
import { OverviewView } from "./views/Overview";
import { InboxView } from "./views/Inbox";
import { PipelinesView } from "./views/Pipelines";
import { MoneyView, MoneyForm } from "./views/Money";
import { LifeView } from "./views/Life";
import { GrowthView, type GrowthTab } from "./views/Growth";
import { SystemView, type SystemTab } from "./views/System";
import { evaluateAll } from "./tasks";
import { openDecisions } from "./queue";
import { dollars } from "./persona";

type ViewId = "today" | "decide" | "money" | "life" | "growth" | "pipelines" | "system";
type Route = { view: ViewId; sub: string | null };

const VIEWS: Record<ViewId, { label: string; icon: string; keys: string; render: (sub: string | null) => React.ReactNode }> = {
  today: { label: "Today", icon: "overview", keys: "g o", render: () => <OverviewView /> },
  decide: { label: "Decide", icon: "inbox", keys: "g i", render: (sub) => <InboxView focus={sub ?? undefined} /> },
  money: { label: "Money", icon: "money", keys: "g m", render: () => <MoneyView /> },
  life: { label: "Life", icon: "gym", keys: "g l", render: () => <LifeView /> },
  growth: { label: "Growth", icon: "instagram", keys: "g s", render: (sub) => <GrowthView tab={(sub as GrowthTab) ?? "instagram"} /> },
  pipelines: { label: "Pipelines", icon: "pipelines", keys: "g p", render: () => <PipelinesView /> },
  system: { label: "System", icon: "health", keys: "g h", render: (sub) => <SystemView tab={(sub as SystemTab) ?? "tasks"} /> },
};

/** Old links (and the Telegram bot's) keep working: each old tab lands on its new home. */
const ALIASES: Record<string, Route> = {
  overview: { view: "today", sub: null },
  inbox: { view: "decide", sub: null },
  instagram: { view: "growth", sub: "instagram" },
  inspiration: { view: "growth", sub: "inspiration" },
  performance: { view: "growth", sub: "performance" },
  tasks: { view: "system", sub: "tasks" },
  agents: { view: "system", sub: "tasks" },
  health: { view: "system", sub: "health" },
  glossary: { view: "system", sub: "glossary" },
};

/** The rail: your life first, then the businesses, then the engine room. */
const GROUPS: Array<{ label: string; views: ViewId[] }> = [
  { label: "You", views: ["today", "decide", "money", "life"] },
  { label: "The businesses", views: ["growth", "pipelines"] },
  { label: "Engine room", views: ["system"] },
];
const TABBAR: ViewId[] = ["today", "decide", "money", "life"];
const MORE: ViewId[] = ["growth", "pipelines", "system"];

const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

function useRoute(): Route {
  const h = useSyncExternalStore(subscribeHash, () => decodeURIComponent(window.location.hash.slice(1)), () => "");
  const [head, ...rest] = h.split("/");
  if (ALIASES[head]) return ALIASES[head];
  return head in VIEWS ? { view: head as ViewId, sub: rest.join("/") || null } : { view: "today", sub: null };
}

type QuickTab = "gym" | "money" | "note";

type Toast = { id: number; text: string; undo?: () => void };

export function HqApp() {
  const auth = hqAuth();
  const [user, setUser] = useState<User | null | undefined>(auth ? undefined : null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => (auth ? onAuthStateChanged(auth, setUser) : undefined), [auth]);

  if (!auth) {
    return <div className="hq tone-ink hq-signin"><div className="hq-signin__card"><h1>HQ</h1><p>Sign-in isn&apos;t set up on this copy of the site. Open arctoslaunchpad.com/hq.</p></div></div>;
  }

  if (!user) {
    return (
      <div className="hq tone-ink hq-signin">
        <div className="hq-signin__card">
          <p className="hq-eyebrow">{OWNER}&apos;s HQ · private</p>
          <h1>Welcome back, <em>{OWNER}.</em></h1>
          <p>CalgaryWatch, CalgaryDaily, Vow Motion and Arctos Launchpad: what the agents did, what needs you, and what to make next.</p>
          <div className="hq-islandline"><span>Decide</span><span>Money</span><span>Life</span></div>
          <div className="hq-actions">
            <button
              className="hq-btn hq-btn--primary"
              type="button"
              disabled={user === undefined}
              onClick={async () => {
                setError(null);
                try {
                  await signInWithPopup(auth, googleProvider());
                } catch (e) {
                  setError(e instanceof Error ? e.message.replace(/^Firebase: /, "") : "Sign-in didn't finish.");
                }
              }}
            >
              {user === undefined ? "Checking sign-in…" : "Sign in with Google"}
            </button>
          </div>
          {error ? <p className="hq-error">{error}</p> : null}
        </div>
      </div>
    );
  }

  return <HqDashboard email={user.email ?? ""} token={() => user.getIdToken()} onSignOut={() => void signOut(auth)} />;
}

/**
 * The signed-in dashboard. `preview` renders it from sample data with no
 * network, for design checks; actions then only change local state.
 */
export function HqDashboard({ email, token, onSignOut, preview }: { email: string; token: () => Promise<string>; onSignOut: () => void; preview?: HqResponse }) {
  const [data, setData] = useState<HqResponse | null>(preview ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [filter, setFilter] = useState<Filter>("all");
  const [sheet, setSheet] = useState(false);
  const [quick, setQuick] = useState<QuickTab | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [palette, setPalette] = useState(false);
  const { view, sub } = useRoute();

  const call = useCallback(
    async (path: string, body?: unknown) => {
      if (preview) {
        const b = (body ?? {}) as { action?: string; type?: CommandType; targetId?: string; kind?: string; at?: number; amount?: number; business?: string; text?: string };
        const id = String(Date.now());
        if (path.endsWith("/life") && b.action === "log") return { entry: { id, kind: "gym", at: b.at ?? Date.now() } };
        if (path.endsWith("/life") && b.action === "money") return { entry: { id, kind: "money", at: b.at ?? Date.now(), amount: b.amount, business: b.business, text: b.text ?? "" } };
        if (path.endsWith("/life") && b.action === "note") return { entry: { id, kind: "note", at: Date.now(), text: b.text, done: false } };
        if (path.endsWith("/command") && b.action === "create") return { command: { id, type: b.type!, targetId: b.targetId!, by: email, at: Date.now(), status: "pending", result: null, appliedAt: null } };
        return path.endsWith("/snapshot") ? preview : { ok: true };
      }
      const r = await fetch(path, {
        method: "POST",
        headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error((json as { error?: string }).error ?? `HTTP ${r.status}`);
      return json;
    },
    [preview, email, token],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData((await call("/api/hq/snapshot")) as HqResponse);
      setError(null);
      setNow(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [call]);

  useEffect(() => {
    const first = window.setTimeout(() => void load(), 0);
    const every = window.setInterval(() => void load(), 3 * 60_000);
    const tick = window.setInterval(() => setNow(Date.now()), 30_000);
    // Coming back to the tab (phone unlocked, laptop woken) refreshes straight away.
    const back = () => document.visibilityState === "visible" && void load();
    document.addEventListener("visibilitychange", back);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(every);
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", back);
    };
  }, [load]);

  const toast = useCallback((text: string, undo?: () => void) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text, undo }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 7000);
  }, []);
  const fail = useCallback((e: unknown, fallback: string) => toast(e instanceof Error ? e.message : fallback), [toast]);

  const cancel = useCallback(
    async (id: string) => {
      try {
        await call("/api/hq/command", { action: "cancel", id });
        setData((d) => (d ? { ...d, commands: d.commands.filter((c) => c.id !== id) } : d));
        toast("Undone. Nothing was changed.");
      } catch (e) {
        fail(e, "Couldn't undo.");
      }
    },
    [call, toast, fail],
  );

  const act = useCallback(
    async (type: CommandType, targetId: string, payload: Record<string, unknown>, label: string) => {
      try {
        const { command } = (await call("/api/hq/command", { action: "create", type, targetId, payload })) as { command: HqCommandRecord };
        setData((d) => (d ? { ...d, commands: [command, ...d.commands] } : d));
        toast(`${label}. Done within 30 minutes.`, () => void cancel(command.id));
      } catch (e) {
        fail(e, "Couldn't save that.");
      }
    },
    [call, cancel, toast, fail],
  );

  /* ---- your own log: gym, money, notes ---- */
  const addEntry = (entry: LifeEntry) => setData((d) => (d ? { ...d, life: [entry, ...(d.life ?? []).filter((e) => e.id !== entry.id)] } : d));
  const dropEntry = (id: string) => setData((d) => (d ? { ...d, life: (d.life ?? []).filter((e) => e.id !== id) } : d));

  const restore = useCallback(
    async (e: LifeEntry) => {
      const body = e.kind === "money" ? { action: "money", amount: e.amount, business: e.business ?? "other", text: e.text ?? "", at: e.at } : e.kind === "note" ? { action: "note", text: e.text } : { action: "log", kind: "gym", at: e.at };
      const { entry } = (await call("/api/hq/life", body)) as { entry: LifeEntry };
      addEntry(e.kind === "note" ? { ...entry, at: e.at, done: e.done } : entry);
    },
    [call],
  );

  const removeLife = useCallback(
    async (entry: LifeEntry, label: string) => {
      try {
        await call("/api/hq/life", { action: "undo", id: entry.id });
        dropEntry(entry.id);
        toast(label, () => void restore(entry).then(() => toast("Put back.")).catch((e) => fail(e, "Couldn't put it back.")));
      } catch (e) {
        fail(e, "Couldn't remove that.");
      }
    },
    [call, toast, fail, restore],
  );

  const undoGym = useCallback(
    async (id: string) => {
      try {
        await call("/api/hq/life", { action: "undo", id });
        dropEntry(id);
        toast("Taken back.");
      } catch (e) {
        fail(e, "Couldn't undo.");
      }
    },
    [call, toast, fail],
  );

  const logGym = useCallback(
    async (at?: number) => {
      try {
        const { entry } = (await call("/api/hq/life", { action: "log", kind: "gym", ...(at ? { at } : {}) })) as { entry: LifeEntry };
        addEntry(entry);
        toast(at ? "Logged. Better late than never." : "Gym logged. That's how it's done.", () => void undoGym(entry.id));
      } catch (e) {
        fail(e, "Couldn't save that.");
      }
    },
    [call, toast, fail, undoGym],
  );

  const logMoney = useCallback(
    async (amount: number, business: string, text: string, at?: number) => {
      try {
        const { entry } = (await call("/api/hq/life", { action: "money", amount, business, text, ...(at ? { at } : {}) })) as { entry: LifeEntry };
        addEntry(entry);
        toast(`${dollars(amount)} in. Keep it coming.`, () => void removeLife(entry, "Taken back."));
        return true;
      } catch (e) {
        fail(e, "Couldn't save that.");
        return false;
      }
    },
    [call, toast, fail, removeLife],
  );

  const addNote = useCallback(
    async (text: string) => {
      try {
        const { entry } = (await call("/api/hq/life", { action: "note", text })) as { entry: LifeEntry };
        addEntry(entry);
        toast("Noted.");
        return true;
      } catch (e) {
        fail(e, "Couldn't save that.");
        return false;
      }
    },
    [call, toast, fail],
  );

  const toggleNote = useCallback(
    async (id: string, done: boolean) => {
      setData((d) => (d ? { ...d, life: (d.life ?? []).map((e) => (e.id === id ? { ...e, done } : e)) } : d));
      try {
        await call("/api/hq/life", { action: "note-done", id, done });
      } catch (e) {
        setData((d) => (d ? { ...d, life: (d.life ?? []).map((x) => (x.id === id ? { ...x, done: !done } : x)) } : d));
        fail(e, "Couldn't save that.");
      }
    },
    [call, fail],
  );

  const setGoal = useCallback(
    async (cents: number | null) => {
      try {
        await call("/api/hq/life", { action: "goal", amount: cents });
        setData((d) => (d ? { ...d, settings: { ...(d.settings ?? { moneyGoal: null }), moneyGoal: cents } } : d));
        toast(cents ? `Goal set: ${dollars(cents)} a month.` : "Goal cleared.");
      } catch (e) {
        fail(e, "Couldn't save that.");
      }
    },
    [call, toast, fail],
  );

  // Aldo's call on a checked Gmail reply. Saved at once (no agent run needed); undo restores the previous call.
  const saveDecision = useCallback(
    async (key: string, decision: TriageDecisionKind | "clear", title?: string) => {
      await call("/api/hq/triage", { key, decision, title });
      const record: TriageDecision | null = decision === "clear" ? null : { key, decision, title: title || null, by: email, at: Date.now() };
      setData((d) => (d ? { ...d, decisions: [...(d.decisions ?? []).filter((x) => x.key !== key), ...(record ? [record] : [])] } : d));
    },
    [call, email],
  );

  const decide = useCallback(
    async (key: string, decision: TriageDecisionKind | "clear", label: string, opts: { title?: string; previous?: TriageDecision | null } = {}) => {
      try {
        await saveDecision(key, decision, opts.title);
        const prev = opts.previous ?? null;
        toast(label, () =>
          void saveDecision(key, prev ? prev.decision : "clear", prev?.title ?? undefined)
            .then(() => toast("Undone."))
            .catch((e) => fail(e, "Couldn't undo.")),
        );
      } catch (e) {
        fail(e, "Couldn't save that.");
      }
    },
    [saveDecision, toast, fail],
  );

  const go = useCallback((v: string) => {
    window.location.hash = v;
    setSheet(false);
    window.scrollTo({ top: 0 });
  }, []);

  const counts = useMemo(() => {
    const decideN = data ? openDecisions(data, filter).length : 0;
    const failing = data ? evaluateAll(data, now).filter((t) => (t.state === "failed" || t.state === "missed") && (filter === "all" || t.routine.owner === filter || t.routine.owner === "shared")).length : 0;
    const broken = (data?.snapshot?.health?.items ?? []).filter((i) => !i.ok).length;
    return { decide: decideN, system: failing + broken } as Partial<Record<ViewId, number>>;
  }, [data, filter, now]);

  const snap = data?.snapshot;
  const age = snap ? now - snap.generatedAt : null;
  const fresh = age === null ? "bad" : age < 30 * 60_000 ? "ok" : age < 3 * 3_600_000 ? "warn" : "bad";
  const ctx: HqContextValue | null = data
    ? { data, now, filter, act, cancel, decide, go, logGym, undoGym, logMoney, addNote, toggleNote, removeLife, setGoal, quickAdd: setQuick, preview: !!preview }
    : null;

  const commands = useMemo<PaletteItem[]>(
    () => [
      ...(Object.keys(VIEWS) as ViewId[]).map((id) => ({ id: `go-${id}`, label: VIEWS[id].label, hint: "Go to", icon: VIEWS[id].icon, keys: VIEWS[id].keys, run: () => go(id) })),
      { id: "go-inspiration", label: "Post ideas", hint: "Go to", icon: "inspiration", keys: "g d", run: () => go("inspiration") },
      { id: "go-performance", label: "What works on Instagram", hint: "Go to", icon: "performance", keys: "g n", run: () => go("performance") },
      { id: "gym", label: "I went to the gym", hint: "Log today", icon: "gym", keys: "l g", run: () => void logGym() },
      { id: "money", label: "Money came in", hint: "Log a payment", icon: "money", keys: "l m", run: () => setQuick("money") },
      { id: "note", label: "Add a note", hint: "Idea or to-do", icon: "glossary", keys: "l n", run: () => setQuick("note") },
      { id: "refresh", label: "Refresh", hint: "Ask the agents for the latest", icon: "refresh", run: () => void load() },
      { id: "f-all", label: "All businesses", hint: "Filter", icon: "overview", run: () => setFilter("all") },
      ...BUSINESSES.map((b) => ({ id: `f-${b.id}`, label: `${b.label} only`, hint: "Filter", icon: "pipelines", run: () => setFilter(b.id) })),
      { id: "signout", label: "Sign out", icon: "out", run: onSignOut },
    ],
    [go, load, logGym, onSignOut],
  );

  const navLink = (id: ViewId, onClick?: () => void) => (
    <a key={id} className="hq-navlink" href={`#${id}`} aria-current={view === id ? "page" : undefined} onClick={() => { window.scrollTo({ top: 0 }); onClick?.(); }}>
      <Icon name={VIEWS[id].icon} />
      {VIEWS[id].label}
      {counts[id] ? <span className="hq-count">{counts[id]}</span> : null}
    </a>
  );

  return (
    <div className="hq tone-ink">
      <aside className="hq-rail" aria-label="HQ">
        <a className="hq-rail__brand" href="#today"><b>{OWNER}&apos;s</b><i>HQ</i></a>
        <button type="button" className="hq-btn hq-btn--primary hq-rail__add" onClick={() => setQuick("money")}><Icon name="plus" /> Log something</button>
        <nav aria-label="Sections">
          {GROUPS.map((g) => (
            <div className="hq-rail__group" key={g.label}>
              <p className="hq-rail__label">{g.label}</p>
              {g.views.map((id) => navLink(id))}
            </div>
          ))}
        </nav>
        <div className="hq-rail__foot">
          <button type="button" className="hq-btn hq-btn--ghost hq-rail__k" onClick={() => setPalette(true)}><Icon name="search" /> Jump anywhere <kbd>⌘K</kbd></button>
          <span>{email}</span>
          <button className="hq-btn hq-btn--ghost" type="button" onClick={onSignOut}><Icon name="out" /> Sign out</button>
        </div>
      </aside>

      <div className="hq-main">
        <div className="hq-top">
          <p className="hq-top__title">{VIEWS[view].label}</p>
          <span className="hq-fresh" data-sev={fresh} title={snap ? `Agents reported ${ago(snap.generatedAt, now)}` : undefined}>{snap ? <><span className="hq-hide-sm">Agents reported </span>{ago(snap.generatedAt, now)}</> : loading ? "Loading" : "No report yet"}</span>
          <span className="hq-top__spacer" />
          <div className="hq-filter hq-hide-sm" role="group" aria-label="Business">
            <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All</button>
            {BUSINESSES.map((b) => <button key={b.id} type="button" aria-pressed={filter === b.id} onClick={() => setFilter(b.id)}>{b.label}</button>)}
          </div>
          <select className="hq-filter-select hq-show-sm" value={filter} onChange={(e) => setFilter(e.target.value as Filter)} aria-label="Business">
            <option value="all">All businesses</option>
            {BUSINESSES.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
          <button className="hq-btn hq-btn--ghost hq-kbtn hq-hide-sm" type="button" onClick={() => setPalette(true)} aria-label="Command bar" aria-keyshortcuts="Meta+K Control+K /"><Icon name="search" /><kbd>⌘K</kbd></button>
          <button className="hq-btn hq-btn--ghost hq-iconbtn" type="button" onClick={() => void load()} disabled={loading} aria-label="Refresh"><span className="hq-spin" data-on={loading}><Icon name="refresh" /></span></button>
        </div>

        {error ? <p className="hq-error hq-banner" role="alert">{error} <button type="button" className="hq-linkbtn" onClick={() => void load()}>Try again</button></p> : null}
        {data?.errors.length ? <details className="hq-banner hq-banner--quiet"><summary>{data.errors.length === 1 ? "One source didn't load" : `${data.errors.length} sources didn't load`}; everything else is current.</summary><p className="hq-small">{data.errors.join(" · ")}</p></details> : null}

        {ctx ? (
          <HqContext.Provider value={ctx}>
            <main key={view}>{VIEWS[view].render(sub)}</main>
            <QuickAdd tab={quick} setTab={setQuick} />
          </HqContext.Provider>
        ) : (
          <div className="hq-view" aria-busy="true" aria-label="Loading">
            <div className="hq-skel" style={{ height: 90 }} />
            <div className="hq-pulse"><div className="hq-skel" /><div className="hq-skel" /><div className="hq-skel" /><div className="hq-skel" /></div>
            <div className="hq-skel" style={{ height: 260 }} />
          </div>
        )}
      </div>

      {ctx ? <button type="button" className="hq-fab" onClick={() => setQuick("money")} aria-label="Log something"><Icon name="plus" /></button> : null}

      <nav className="hq-tabbar" aria-label="HQ sections">
        {TABBAR.map((id) => (
          <a key={id} href={`#${id}`} aria-current={view === id ? "page" : undefined} onClick={() => window.scrollTo({ top: 0 })}>
            <Icon name={VIEWS[id].icon} />
            {VIEWS[id].label}
            {counts[id] ? <span className="hq-count">{counts[id]}</span> : null}
          </a>
        ))}
        <button type="button" onClick={() => setSheet(true)} aria-expanded={sheet} aria-current={MORE.includes(view) ? "page" : undefined}>
          <Icon name="more" />More{counts.system ? <span className="hq-count">{counts.system}</span> : null}
        </button>
      </nav>
      <div className="hq-sheet" data-open={sheet} onClick={(e) => e.target === e.currentTarget && setSheet(false)} role="dialog" aria-modal="true" aria-label="More sections" hidden={!sheet}>
        <div className="hq-sheet__panel">
          <span className="hq-sheet__grip" aria-hidden="true" />
          <div className="hq-rail__group">
            <p className="hq-rail__label">The businesses</p>
            {navLink("growth", () => setSheet(false))}
            {navLink("pipelines", () => setSheet(false))}
            <p className="hq-rail__label" style={{ marginTop: 10 }}>Engine room</p>
            {navLink("system", () => setSheet(false))}
          </div>
          <div className="hq-actions">
            <button className="hq-btn" type="button" onClick={() => { setSheet(false); setPalette(true); }}><Icon name="search" /> Search</button>
            <button className="hq-btn hq-btn--ghost" type="button" onClick={onSignOut}>Sign out</button>
            <span className="hq-small">{email}</span>
          </div>
        </div>
      </div>

      <Palette items={commands} open={palette} setOpen={setPalette} />

      <div className="hq-toasts" aria-live="polite">
        {toasts.map((t) => (
          <div className="hq-toast" key={t.id}>
            <span>{t.text}</span>
            {t.undo ? <button type="button" onClick={() => { t.undo?.(); setToasts((x) => x.filter((y) => y.id !== t.id)); }}>Undo</button> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/** One sheet for the three things you log yourself: a gym visit, money in, a note. */
function QuickAdd({ tab, setTab }: { tab: QuickTab | null; setTab: (t: QuickTab | null) => void }) {
  const { data, now, logGym, addNote } = useHq();
  const [note, setNote] = useState("");
  useEffect(() => {
    if (!tab) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setTab(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tab, setTab]);
  if (!tab) return null;
  const went = (data.life ?? []).some((e) => e.kind === "gym" && new Date(e.at).toLocaleDateString("en-CA", { timeZone: "America/Edmonton" }) === new Date(now).toLocaleDateString("en-CA", { timeZone: "America/Edmonton" }));
  return (
    <div className="hq-quick" role="dialog" aria-modal="true" aria-label="Log something" onClick={(e) => e.target === e.currentTarget && setTab(null)}>
      <div className="hq-quick__panel">
        <div className="hq-card__head">
          <h2 className="hq-h2">Log something</h2>
          <button type="button" className="hq-btn hq-btn--ghost" onClick={() => setTab(null)}>Close</button>
        </div>
        <div className="hq-seg" role="tablist">
          {([["money", "Money in"], ["gym", "Gym"], ["note", "Note"]] as Array<[QuickTab, string]>).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
        {tab === "money" ? <MoneyForm onDone={() => setTab(null)} /> : null}
        {tab === "gym" ? (
          <div className="hq-actions">
            <button type="button" className="hq-btn hq-btn--primary" disabled={went} onClick={() => void logGym().then(() => setTab(null))}>{went ? "Already logged today" : "I went today"}</button>
            <button type="button" className="hq-btn" onClick={() => void logGym(now - 86_400_000).then(() => setTab(null))}>I went yesterday</button>
          </div>
        ) : null}
        {tab === "note" ? (
          <form className="hq-addnote" onSubmit={async (e) => { e.preventDefault(); if (note.trim() && (await addNote(note.trim()))) { setNote(""); setTab(null); } }}>
            <input className="hq-input" autoFocus value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder="An idea, a to-do, anything" aria-label="Note" />
            <button type="submit" className="hq-btn hq-btn--primary" disabled={!note.trim()}>Save</button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
