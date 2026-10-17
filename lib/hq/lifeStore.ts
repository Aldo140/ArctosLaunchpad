import { queryRecent } from "./google";
import type { LifeEntry } from "./types";

const DAY = 86_400_000;

/** Aldo's own log (arctos-hq hq_life): gym visits, money, to-dos and money owed. Newest first. */
export async function readLife(now: number): Promise<LifeEntry[]> {
  // A year and a bit, so the money page can show the year so far.
  const rows = await queryRecent("hq_life", "at", now - 400 * DAY, 2000);
  return rows
    .filter((r) => ["gym", "money", "note", "owed"].includes(String(r.fields.kind)))
    .map((r): LifeEntry => {
      const f = r.fields;
      const base = { id: r.id, kind: f.kind as LifeEntry["kind"], at: Number(f.at ?? 0) };
      if (f.kind === "money") return { ...base, amount: Number(f.amount ?? 0), business: String(f.business ?? "other"), text: String(f.text ?? "") };
      const due = typeof f.due === "number" ? f.due : null;
      if (f.kind === "note") return { ...base, text: String(f.text ?? ""), done: Number(f.done ?? 0) === 1, due };
      if (f.kind === "owed") return { ...base, amount: Number(f.amount ?? 0), business: String(f.business ?? "other"), text: String(f.text ?? ""), done: Number(f.done ?? 0) === 1, due, paidId: typeof f.paidId === "string" ? f.paidId : null };
      return base;
    })
    .sort((a, b) => b.at - a.at);
}
