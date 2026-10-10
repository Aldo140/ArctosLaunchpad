"use client";

import { useHq } from "../context";
import { evaluateAll } from "../tasks";
import { GlossaryView } from "./Glossary";
import { HealthView } from "./Health";
import { TasksView } from "./Tasks";

export type SystemTab = "tasks" | "health" | "glossary";
const TABS: Array<[SystemTab, string]> = [["tasks", "Jobs"], ["health", "Connections"], ["glossary", "What words mean"]];

/** The engine room: the agents' jobs, every connection, and the words. Most days there's nothing to do here. */
export function SystemView({ tab }: { tab: SystemTab }) {
  const { data, now, go } = useHq();
  const failing = evaluateAll(data, now).filter((t) => t.state === "failed" || t.state === "missed").length;
  const broken = (data.snapshot?.health?.items ?? []).filter((i) => !i.ok).length;
  const count: Record<SystemTab, number> = { tasks: failing, health: broken, glossary: 0 };
  return (
    <>
      <p className="hq-sysline" data-sev={failing || broken ? "warn" : "ok"}>
        {failing || broken ? `${[failing ? `${failing} ${failing === 1 ? "job needs" : "jobs need"} a look` : "", broken ? `${broken} ${broken === 1 ? "connection is" : "connections are"} broken` : ""].filter(Boolean).join(" and ")}. The agents keep going around it; fix it when you have five minutes.` : "Everything's running. Nothing here needs you."}
      </p>
      <div className="hq-seg hq-subnav" role="tablist" aria-label="System">
        {TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => go(id === "tasks" ? "system" : id)}>{label}{count[id] ? <b>{count[id]}</b> : null}</button>)}
      </div>
      {tab === "tasks" ? <TasksView /> : tab === "health" ? <HealthView /> : <GlossaryView />}
    </>
  );
}
