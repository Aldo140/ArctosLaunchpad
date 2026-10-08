"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { googleProvider, hqAuth } from "@/lib/hq/firebaseClient";
import type { CommandType, HqCommandRecord, HqResponse, TriageDecision, TriageDecisionKind } from "@/lib/hq/types";
import { HqContext, inFilter, type Filter, type HqContextValue } from "./context";
import { BUSINESSES, ago } from "./format";
import { Icon } from "./ui";
import { Palette, type PaletteItem } from "./Palette";
import { OWNER } from "./persona";
import { OverviewView } from "./views/Overview";
import { InboxView } from "./views/Inbox";
import { InstagramView } from "./views/Instagram";
import { InspirationView } from "./views/Inspiration";
import { PipelinesView } from "./views/Pipelines";
import { TasksView } from "./views/Tasks";
import { evaluateAll } from "./tasks";
import { replyBoard } from "@/lib/hq/triage";
import { PerformanceView } from "./views/Performance";
import { HealthView } from "./views/Health";
import { GlossaryView } from "./views/Glossary";

type ViewId = "overview" | "inbox" | "instagram" | "inspiration" | "pipelines" | "tasks" | "performance" | "health" | "glossary";

const VIEWS: Record<ViewId, { label: string; icon: string; keys: string; render: () => React.ReactNode }> = {
  overview: { label: "Overview", icon: "overview", keys: "g o", render: () => <OverviewView /> },
  instagram: { label: "Instagram", icon: "instagram", keys: "g s", render: () => <InstagramView /> },
  inspiration: { label: "Inspiration", icon: "inspiration", keys: "g d", render: () => <InspirationView /> },
  pipelines: { label: "Pipelines", icon: "pipelines", keys: "g p", render: () => <PipelinesView /> },
  inbox: { label: "Inbox", icon: "inbox", keys: "g i", render: () => <InboxView /> },
  tasks: { label: "Tasks", icon: "tasks", keys: "g t", render: () => <TasksView /> },
  performance: { label: "Performance", icon: "performance", keys: "g n", render: () => <PerformanceView /> },
  health: { label: "Health", icon: "health", keys: "g h", render: () => <HealthView /> },
  glossary: { label: "Glossary", icon: "glossary", keys: "g g", render: () => <GlossaryView /> },
};

/** The rail follows the Arctos islands. */
const GROUPS: Array<{ n: string; label: string; views: ViewId[] }> = [
  { n: "01", label: "Win the customer", views: ["instagram", "inspiration", "pipelines"] },
  { n: "02", label: "Run the work", views: ["inbox", "tasks"] },
  { n: "03", label: "See the numbers", views: ["performance", "health"] },
];
const TABBAR: ViewId[] = ["overview", "inbox", "instagram", "pipelines"];
/** Most-used first, so a short search lands on the likely one. */
const PALETTE_ORDER: ViewId[] = ["inbox", "overview", "tasks", "instagram", "pipelines", "inspiration", "performance", "health", "glossary"];

const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

function useView(): ViewId {
  const h = useSyncExternalStore(subscribeHash, () => window.location.hash.slice(1), () => "");
  const id = h === "agents" ? "tasks" : h;
  return (id in VIEWS ? id : "overview") as ViewId;
}

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
          <div className="hq-islandline"><span>Win the customer</span><span>Run the work</span><span>See the numbers</span></div>
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
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [palette, setPalette] = useState(false);
  const view = useView();

  const call = useCallback(
    async (path: string, body?: unknown) => {
      if (preview) {
        const b = (body ?? {}) as { action?: string; type?: CommandType; targetId?: string };
        if (path.endsWith("/command") && b.action === "create") return { command: { id: String(Date.now()), type: b.type!, targetId: b.targetId!, by: email, at: Date.now(), status: "pending", result: null, appliedAt: null } };
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
    return () => {
      window.clearTimeout(first);
      window.clearInterval(every);
      window.clearInterval(tick);
    };
  }, [load]);

  const toast = useCallback((text: string, undo?: () => void) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text, undo }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 7000);
  }, []);

  const cancel = useCallback(
    async (id: string) => {
      try {
        await call("/api/hq/command", { action: "cancel", id });
        setData((d) => (d ? { ...d, commands: d.commands.filter((c) => c.id !== id) } : d));
        toast("Undone. Nothing was changed.");
      } catch (e) {
        toast(e instanceof Error ? e.message : "Couldn't undo.");
      }
    },
    [call, toast],
  );

  const act = useCallback(
    async (type: CommandType, targetId: string, payload: Record<string, unknown>, label: string) => {
      try {
        const { command } = (await call("/api/hq/command", { action: "create", type, targetId, payload })) as { command: HqCommandRecord };
        setData((d) => (d ? { ...d, commands: [command, ...d.commands] } : d));
        toast(`${label}. Applied within 30 minutes.`, () => void cancel(command.id));
      } catch (e) {
        toast(e instanceof Error ? e.message : "Couldn't save that.");
      }
    },
    [call, cancel, toast],
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
            .catch((e) => toast(e instanceof Error ? e.message : "Couldn't undo.")),
        );
      } catch (e) {
        toast(e instanceof Error ? e.message : "Couldn't save that.");
      }
    },
    [saveDecision, toast],
  );

  const go = useCallback((v: string) => {
    window.location.hash = v;
    setSheet(false);
    window.scrollTo({ top: 0 });
  }, []);

  const counts = useMemo(() => {
    const s = data?.snapshot;
    const inbox =
      (s?.inbox?.replies ?? []).filter((r) => !r.approved && inFilter(filter, r.business)).length +
      (s?.inbox?.pitches ?? []).filter((p) => inFilter(filter, p.business)).length +
      (s?.posts ?? []).filter((p) => ["drafted", "needs-correction", "failed"].includes(p.status) && inFilter(filter, p.brand)).length +
      (data ? replyBoard(data, (r) => inFilter(filter, r.business)).board.length : 0);
    const tasks = data ? evaluateAll(data, now).filter((t) => (t.state === "failed" || t.state === "missed") && (filter === "all" || t.routine.owner === filter || t.routine.owner === "shared")).length : 0;
    const health = (s?.bottlenecks ?? []).filter((b) => b.severity === "bad").length;
    return { inbox, tasks, health } as Partial<Record<ViewId, number>>;
  }, [data, filter, now]);

  const snap = data?.snapshot;
  const age = snap ? now - snap.generatedAt : null;
  const fresh = age === null ? "bad" : age < 30 * 60_000 ? "ok" : age < 3 * 3_600_000 ? "warn" : "bad";
  const ctx: HqContextValue | null = data ? { data, now, filter, act, cancel, decide, go, preview: !!preview } : null;

  const commands = useMemo<PaletteItem[]>(
    () => [
      ...PALETTE_ORDER.map((id) => ({ id: `go-${id}`, label: VIEWS[id].label, hint: "Go to", icon: VIEWS[id].icon, keys: VIEWS[id].keys, run: () => go(id) })),
      { id: "refresh", label: "Refresh", hint: "Ask the agents for the latest", icon: "refresh", run: () => void load() },
      { id: "f-all", label: "All businesses", hint: "Filter", icon: "overview", run: () => setFilter("all") },
      ...BUSINESSES.map((b) => ({ id: `f-${b.id}`, label: `${b.label} only`, hint: "Filter", icon: "pipelines", run: () => setFilter(b.id) })),
      { id: "signout", label: "Sign out", icon: "out", run: onSignOut },
    ],
    [go, load, onSignOut],
  );

  const navLink = (id: ViewId) => (
    <a key={id} className="hq-navlink" href={`#${id}`} aria-current={view === id ? "page" : undefined} onClick={() => window.scrollTo({ top: 0 })}>
      <Icon name={VIEWS[id].icon} />
      {VIEWS[id].label}
      {counts[id] ? <span className="hq-count">{counts[id]}</span> : null}
    </a>
  );

  return (
    <div className="hq tone-ink">
      <aside className="hq-rail" aria-label="HQ">
        <a className="hq-rail__brand" href="#overview"><b>{OWNER}&apos;s</b><i>HQ</i></a>
        <nav aria-label="Sections">
          <div className="hq-rail__group">{navLink("overview")}</div>
          {GROUPS.map((g) => (
            <div className="hq-rail__group" key={g.n}>
              <p className="hq-rail__label"><span>{g.n}</span>{g.label}</p>
              {g.views.map(navLink)}
            </div>
          ))}
        </nav>
        <div className="hq-rail__foot">
          {navLink("glossary")}
          <span>{email}</span>
          <button className="hq-btn hq-btn--ghost" type="button" onClick={onSignOut}><Icon name="out" /> Sign out</button>
        </div>
      </aside>

      <div className="hq-main">
        <div className="hq-top">
          <p className="hq-top__title">{VIEWS[view].label}</p>
          <span className="hq-fresh" data-sev={fresh}>{snap ? `Agents reported ${ago(snap.generatedAt, now)}` : loading ? "Loading" : "No report yet"}</span>
          <span className="hq-top__spacer" />
          <div className="hq-filter" role="group" aria-label="Business">
            <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All</button>
            {BUSINESSES.map((b) => <button key={b.id} type="button" aria-pressed={filter === b.id} onClick={() => setFilter(b.id)}>{b.label}</button>)}
          </div>
          <button className="hq-btn hq-btn--ghost hq-kbtn" type="button" onClick={() => setPalette(true)} aria-label="Command bar" aria-keyshortcuts="Meta+K Control+K /"><Icon name="search" /><kbd className="hq-hide-sm">⌘K</kbd></button>
          <button className="hq-btn hq-btn--ghost" type="button" onClick={() => void load()} disabled={loading} aria-label="Refresh"><Icon name="refresh" /><span className="hq-hide-sm">{loading ? "Refreshing" : "Refresh"}</span></button>
        </div>

        {error ? <p className="hq-error" role="alert" style={{ marginBottom: 16 }}>{error}</p> : null}
        {data?.errors.length ? <p className="hq-error" style={{ marginBottom: 16 }}>{data.errors.join(" · ")}</p> : null}

        {ctx ? (
          <HqContext.Provider value={ctx}>
            <main key={view}>{VIEWS[view].render()}</main>
          </HqContext.Provider>
        ) : (
          <div className="hq-view" aria-busy="true" aria-label="Loading">
            <div className="hq-skel" style={{ height: 90 }} />
            <div className="hq-islands"><div className="hq-skel" /><div className="hq-skel" /><div className="hq-skel" /></div>
            <div className="hq-skel" style={{ height: 260 }} />
          </div>
        )}
      </div>

      <nav className="hq-tabbar" aria-label="HQ sections">
        {TABBAR.map((id) => (
          <a key={id} href={`#${id}`} aria-current={view === id ? "page" : undefined} onClick={() => window.scrollTo({ top: 0 })}>
            <Icon name={VIEWS[id].icon} />
            {VIEWS[id].label}
            {counts[id] ? <span className="hq-count">{counts[id]}</span> : null}
          </a>
        ))}
        <button type="button" onClick={() => setSheet(true)} aria-expanded={sheet} aria-current={!TABBAR.includes(view) ? "page" : undefined}><Icon name="more" />More</button>
      </nav>
      <div className="hq-sheet" data-open={sheet} onClick={(e) => e.target === e.currentTarget && setSheet(false)} role="dialog" aria-modal="true" aria-label="More sections" hidden={!sheet}>
        <div className="hq-sheet__panel">
          {GROUPS.map((g) => (
            <div className="hq-rail__group" key={g.n}>
              <p className="hq-rail__label"><span>{g.n}</span>{g.label}</p>
              {g.views.map((id) => (
                <a key={id} className="hq-navlink" href={`#${id}`} aria-current={view === id ? "page" : undefined} onClick={() => setSheet(false)}>
                  <Icon name={VIEWS[id].icon} />{VIEWS[id].label}{counts[id] ? <span className="hq-count">{counts[id]}</span> : null}
                </a>
              ))}
            </div>
          ))}
          <a className="hq-navlink" href="#glossary" onClick={() => setSheet(false)}><Icon name="glossary" />Glossary</a>
          <div className="hq-actions">
            <span className="hq-small">{email}</span>
            <button className="hq-btn" type="button" onClick={onSignOut}>Sign out</button>
            <button className="hq-btn hq-btn--ghost" type="button" onClick={() => setSheet(false)}>Close</button>
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
