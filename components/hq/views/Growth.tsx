"use client";

import { useHq } from "../context";
import { InstagramView } from "./Instagram";
import { InspirationView } from "./Inspiration";
import { PerformanceView } from "./Performance";
import { WeekView } from "./Week";

export type GrowthTab = "week" | "instagram" | "inspiration" | "performance";
// Research and numbers are what the posting agent reads before it plans; they stay for reference.
const TABS: Array<[GrowthTab, string]> = [["week", "This week"], ["instagram", "Accounts"], ["inspiration", "Bot's research"], ["performance", "Bot's numbers"]];

/** Instagram in one place: the agent's week and Aldo's part, the four accounts, and the research the agent plans from. */
export function GrowthView({ tab }: { tab: GrowthTab }) {
  const { go } = useHq();
  return (
    <>
      <div className="hq-seg hq-subnav" role="tablist" aria-label="Growth">
        {TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => go(id === "week" ? "growth" : id)}>{label}</button>)}
      </div>
      {tab === "week" ? <WeekView /> : tab === "instagram" ? <InstagramView /> : tab === "inspiration" ? <InspirationView /> : <PerformanceView />}
    </>
  );
}
