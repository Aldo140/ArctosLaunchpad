"use client";

import type { HqCommandRecord } from "@/lib/hq/types";
import { COMMAND_LABEL, useHq } from "./context";
import { ago } from "./format";

/** Where an action taken in HQ stands: queued (with undo), applied, or refused with the reason. */
export function CommandState({ command }: { command: HqCommandRecord }) {
  const { cancel, now } = useHq();
  const label = COMMAND_LABEL[command.type];
  if (command.status === "pending") {
    return (
      <div className="hq-state" data-sev="warn" role="status">
        <span className="hq-pill" data-sev="warn">Queued</span>
        <span>{label} · the agents apply it within 15 minutes</span>
        <button className="hq-btn hq-btn--ghost" type="button" onClick={() => void cancel(command.id)}>Undo</button>
      </div>
    );
  }
  if (command.status === "done") {
    return (
      <div className="hq-state" data-sev="ok" role="status">
        <span className="hq-pill" data-sev="ok">Done</span>
        <span>{label} applied {ago(command.appliedAt, now)}</span>
      </div>
    );
  }
  return (
    <div className="hq-state" data-sev="bad" role="status">
      <span className="hq-pill" data-sev="bad">Not applied</span>
      <span>{command.result ?? "The agents couldn't apply it."}</span>
    </div>
  );
}
