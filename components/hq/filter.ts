import type { Business, CommandType } from "../../lib/hq/types";

/**
 * The business filter and command labels, kept out of context.tsx (a client
 * module) so the server can use them too: the Telegram bot builds its /today
 * from the same code as the dashboard's Today.
 */

export type Filter = Business | "all";

export const inFilter = (filter: Filter, business: string) => filter === "all" || filter === business;

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
