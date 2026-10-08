"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { googleProvider, hqAuth } from "@/lib/hq/firebaseClient";
import type { HqResponse, HqSettings } from "@/lib/hq/types";
import { ago } from "./format";
import { BottlenecksPanel, CalgaryDailyPanel, CreatorsPanel, GlossaryPanel, MoneyPanel, PipelinesPanel, TodayPanel } from "./Panels";

const TABS = [
  ["today", "Today"],
  ["creators", "Creators"],
  ["calgarydaily", "CalgaryDaily"],
  ["pipelines", "Pipelines"],
  ["money", "Money"],
  ["bottlenecks", "Bottlenecks"],
  ["glossary", "Glossary"],
] as const;
type Tab = (typeof TABS)[number][0];

const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

function useTab(): Tab {
  const h = useSyncExternalStore(subscribeHash, () => window.location.hash.slice(1), () => "");
  return (TABS.find(([id]) => id === h)?.[0] ?? "today") as Tab;
}

export function HqApp() {
  const auth = hqAuth();
  const [user, setUser] = useState<User | null | undefined>(auth ? undefined : null);
  const [data, setData] = useState<HqResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const tab = useTab();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => (auth ? onAuthStateChanged(auth, setUser) : undefined), [auth]);

  const call = useCallback(
    async (path: string, body?: unknown) => {
      if (!user) throw new Error("Sign in first.");
      const r = await fetch(path, {
        method: "POST",
        headers: { Authorization: `Bearer ${await user.getIdToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error((json as { error?: string }).error ?? `HTTP ${r.status}`);
      return json;
    },
    [user],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData((await call("/api/hq/snapshot")) as HqResponse);
      setNow(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [call]);

  useEffect(() => {
    if (!user) return;
    const first = window.setTimeout(() => void load(), 0);
    const id = window.setInterval(() => void load(), 5 * 60_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [user, load]);

  const saveSettings = useCallback(
    async (s: Pick<HqSettings, "balanceUsd" | "dailyCapUsd">) => {
      try {
        const { settings } = (await call("/api/hq/settings", s)) as { settings: HqSettings };
        setData((d) => (d ? { ...d, settings } : d));
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : String(e);
      }
    },
    [call],
  );

  if (!auth) {
    return (
      <div className="hq tone-ink hq-signin"><div><h1>HQ</h1><p>Sign-in isn&apos;t configured on this copy of the site. Open arctoslaunchpad.com/hq.</p></div></div>
    );
  }

  if (!user) {
    return (
      <div className="hq tone-ink hq-signin">
        <div>
          <p className="hq-meta">Arctos HQ</p>
          <h1>Operations, all four businesses.</h1>
          <p>CalgaryWatch, CalgaryDaily, Vow Motion and Arctos Launchpad in one place. Private: only approved Google accounts get in.</p>
          <button
            className="hq-btn hq-btn-primary"
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
          {error ? <p className="hq-error">{error}</p> : null}
        </div>
      </div>
    );
  }

  const snap = data?.snapshot ?? null;
  const waiting = snap?.today.length ?? 0;
  const blocked = snap?.bottlenecks.filter((b) => b.severity === "bad").length ?? 0;

  return (
    <div className="hq tone-ink">
      <header className="hq-top">
        <p className="hq-brand">Arctos <em>HQ</em></p>
        <span className="hq-meta">{snap ? `Agents reported ${ago(snap.generatedAt, now)}` : loading ? "Loading…" : "No report yet"}</span>
        <span className="hq-spacer" />
        <span className="hq-meta">{user.email}</span>
        <button className="hq-btn" type="button" onClick={() => void load()} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button>
        <button className="hq-btn" type="button" onClick={() => void signOut(auth)}>Sign out</button>
      </header>
      <nav className="hq-tabs" aria-label="HQ sections">
        {TABS.map(([id, label]) => (
          <a key={id} href={`#${id}`} aria-current={tab === id ? "page" : undefined}>
            {label}
            {id === "today" && waiting ? <span className="hq-count">{waiting}</span> : null}
            {id === "bottlenecks" && blocked ? <span className="hq-count">{blocked}</span> : null}
          </a>
        ))}
      </nav>
      {error ? <p className="hq-error" role="alert">{error}</p> : null}
      {data?.errors.length ? <p className="hq-error">{data.errors.join(" · ")}</p> : null}
      {data ? (
        <>
          {tab === "today" && <TodayPanel snap={snap} now={now} />}
          {tab === "creators" && <CreatorsPanel snap={snap} />}
          {tab === "calgarydaily" && <CalgaryDailyPanel snap={snap} />}
          {tab === "pipelines" && <PipelinesPanel data={data} />}
          {tab === "money" && <MoneyPanel data={data} onSave={saveSettings} />}
          {tab === "bottlenecks" && <BottlenecksPanel snap={snap} />}
          {tab === "glossary" && <GlossaryPanel />}
        </>
      ) : !error ? (
        <p className="hq-empty">Loading the latest report…</p>
      ) : null}
    </div>
  );
}
