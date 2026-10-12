"use client";

import { createContext, useContext } from "react";
import type { CommandType, HqCommandRecord, HqResponse, LifeEntry, TriageDecision, TriageDecisionKind } from "@/lib/hq/types";
import type { Filter } from "./filter";

export { COMMAND_LABEL, inFilter, type Filter } from "./filter";

export interface HqContextValue {
  data: HqResponse;
  now: number;
  filter: Filter;
  /** Queue an action for the agents. Resolves once HQ has saved it. */
  act: (type: CommandType, targetId: string, payload: Record<string, unknown>, label: string) => Promise<void>;
  cancel: (id: string) => Promise<void>;
  /** Approve, wave off, reopen or finish a checked Gmail reply's subtask; "clear" undoes the call. Saved at once. */
  decide: (key: string, decision: TriageDecisionKind | "clear", label: string, opts?: { title?: string; previous?: TriageDecision | null }) => Promise<void>;
  go: (view: string) => void;
  /** Log a gym visit (today, or an earlier day), or take one back. */
  logGym: (at?: number) => Promise<void>;
  undoGym: (id: string) => Promise<void>;
  /** Money that came in, in cents. */
  logMoney: (amount: number, business: string, text: string, at?: number) => Promise<boolean>;
  /** A to-do, with the day it's due (noon Calgary time) when it has one. */
  addNote: (text: string, due?: number | null) => Promise<boolean>;
  toggleNote: (id: string, done: boolean) => Promise<void>;
  setNoteDue: (id: string, due: number | null) => Promise<void>;
  /** Money someone owes, in cents; marking it paid logs the payment. */
  addOwed: (amount: number, business: string, text: string, due: number | null) => Promise<boolean>;
  markPaid: (entry: LifeEntry, paid: boolean) => Promise<void>;
  /** Remove any log entry; the toast's Undo puts it back. */
  removeLife: (entry: LifeEntry, label: string) => Promise<void>;
  setGoal: (cents: number | null) => Promise<void>;
  /** Opens the quick-add sheet on a tab. */
  quickAdd: (tab: "gym" | "money" | "note" | "owed") => void;
  /** Rendering from sample data: nothing leaves the page. */
  preview?: boolean;
}

export const HqContext = createContext<HqContextValue | null>(null);

export function useHq(): HqContextValue {
  const v = useContext(HqContext);
  if (!v) throw new Error("useHq outside HqContext");
  return v;
}

/** The newest action taken on this item from HQ, if any. */
export function latestCommand(commands: HqCommandRecord[], targetId: string, types: CommandType[]): HqCommandRecord | null {
  return commands.find((c) => c.targetId === targetId && types.includes(c.type)) ?? null;
}
