"use client";

import { createContext, useContext } from "react";
import type { Business, CommandType, HqCommandRecord, HqResponse } from "@/lib/hq/types";

export type Filter = Business | "all";

export interface HqContextValue {
  data: HqResponse;
  now: number;
  filter: Filter;
  /** Queue an action for the agents. Resolves once HQ has saved it. */
  act: (type: CommandType, targetId: string, payload: Record<string, unknown>, label: string) => Promise<void>;
  cancel: (id: string) => Promise<void>;
  go: (view: string) => void;
}

export const HqContext = createContext<HqContextValue | null>(null);

export function useHq(): HqContextValue {
  const v = useContext(HqContext);
  if (!v) throw new Error("useHq outside HqContext");
  return v;
}

export const inFilter = (filter: Filter, business: string) => filter === "all" || filter === business;

/** The newest action taken on this item from HQ, if any. */
export function latestCommand(commands: HqCommandRecord[], targetId: string, types: CommandType[]): HqCommandRecord | null {
  return commands.find((c) => c.targetId === targetId && types.includes(c.type)) ?? null;
}

export const COMMAND_LABEL: Record<CommandType, string> = {
  "approve-post": "Approve",
  "reject-post": "Reject",
  "redraft-post": "Redraft",
  "unschedule-post": "Unschedule",
  "approve-pitch": "Send pitch",
  "skip-pitch": "Skip pitch",
  "approve-reply": "Send reply",
  "handled-reply": "Mark handled",
};
