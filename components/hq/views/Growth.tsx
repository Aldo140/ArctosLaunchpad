"use client";

import { useHq } from "../context";
import { InstagramView } from "./Instagram";
import { InspirationView } from "./Inspiration";
import { PerformanceView } from "./Performance";

export type GrowthTab = "instagram" | "inspiration" | "performance";
const TABS: Array<[GrowthTab, string]> = [["instagram", "Accounts"], ["inspiration", "Ideas"], ["performance", "What works"]];

/** Instagram in one place: the four accounts, ideas from what's working in Calgary, and CalgaryDaily's history. */
export function GrowthView({ tab }: { tab: GrowthTab }) {
  const { go } = useHq();
  return (
    <>
      <div className="hq-seg hq-subnav" role="tablist" aria-label="Growth">
        {TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => go(id === "instagram" ? "growth" : id)}>{label}</button>)}
      </div>
      {tab === "instagram" ? <InstagramView /> : tab === "inspiration" ? <InspirationView /> : <PerformanceView />}
    </>
  );
}
