import { createDoc, deleteDoc, readFields, setDoc } from "./google";
import type { LifeEntry } from "./types";

/**
 * Writing Aldo's own log (arctos-hq hq_life): gym visits, money in, to-dos and
 * money owed. The dashboard (/api/hq/life) and the Telegram bot both write
 * through here, so an entry is the same whichever one made it.
 */

const DAY = 86_400_000;

export const BUSINESSES = ["calgarywatch", "calgarydaily", "vowmotion", "arctos", "other"] as const;
export type LifeBusiness = (typeof BUSINESSES)[number];
export const isBusiness = (b: unknown): b is LifeBusiness => typeof b === "string" && (BUSINESSES as readonly string[]).includes(b);

export class LifeGone extends Error {}

/** A past day is fine (a forgotten log), the future and the distant past aren't. */
const when = (at: number | undefined, now: number) => (at === undefined ? now : Math.min(now, Math.max(now - 90 * DAY, at)));
const dueDay = (due: number | null | undefined, now: number) => (typeof due === "number" ? Math.min(now + 366 * DAY, Math.max(now - 366 * DAY, due)) : null);
/** Created a while ago (an undo putting it back) or now; never the future. */
const created = (at: number | undefined, now: number) => (at === undefined ? now : Math.min(now, Math.max(now - 366 * DAY, at)));

export async function logGym(by: string, now: number, at?: number): Promise<LifeEntry> {
  const t = when(at, now);
  const id = await createDoc("hq_life", { kind: "gym", at: t, by });
  return { id, kind: "gym", at: t };
}

export async function logMoney(by: string, now: number, m: { amount: number; business: LifeBusiness; text: string; at?: number }): Promise<LifeEntry> {
  const at = when(m.at, now);
  const id = await createDoc("hq_life", { kind: "money", at, amount: m.amount, business: m.business, text: m.text, by });
  return { id, kind: "money", at, amount: m.amount, business: m.business, text: m.text };
}

export async function addNote(by: string, now: number, n: { text: string; due?: number | null; at?: number }): Promise<LifeEntry> {
  const at = created(n.at, now);
  const due = dueDay(n.due, now);
  const id = await createDoc("hq_life", { kind: "note", at, text: n.text, done: 0, due, by });
  return { id, kind: "note", at, text: n.text, done: false, due };
}

export async function setNote(id: string, now: number, change: { done?: boolean; due?: number | null }): Promise<void> {
  const doc = await readFields(`hq_life/${id}`);
  if (!doc || doc.kind !== "note") throw new LifeGone("That to-do is gone.");
  await setDoc(`hq_life/${id}`, {
    ...doc,
    ...(change.done !== undefined ? { done: change.done ? 1 : 0 } : {}),
    ...(change.due !== undefined ? { due: dueDay(change.due, now) } : {}),
  });
}

export async function addOwed(by: string, now: number, o: { amount: number; business: LifeBusiness; text: string; due?: number | null; at?: number }): Promise<LifeEntry> {
  const at = created(o.at, now);
  const due = dueDay(o.due, now);
  const id = await createDoc("hq_life", { kind: "owed", at, amount: o.amount, business: o.business, text: o.text, due, done: 0, paidId: null, by });
  return { id, kind: "owed", at, amount: o.amount, business: o.business, text: o.text, due, done: false, paidId: null };
}

/** Paid: the money lands in the log like any payment, linked back here. Unpaid takes that payment out again. */
export async function setOwedPaid(id: string, paid: boolean, by: string, now: number): Promise<{ entry: LifeEntry | null; paidId: string | null }> {
  const doc = await readFields(`hq_life/${id}`);
  if (!doc || doc.kind !== "owed") throw new LifeGone("That's gone.");
  const amount = Number(doc.amount ?? 0);
  const business = String(doc.business ?? "other");
  const text = String(doc.text ?? "");
  if (paid) {
    if (typeof doc.paidId === "string") return { entry: null, paidId: doc.paidId };
    const paidId = await createDoc("hq_life", { kind: "money", at: now, amount, business, text, from: id, by });
    await setDoc(`hq_life/${id}`, { ...doc, done: 1, paidId });
    return { entry: { id: paidId, kind: "money", at: now, amount, business, text }, paidId };
  }
  if (typeof doc.paidId === "string") await deleteDoc(`hq_life/${doc.paidId}`);
  await setDoc(`hq_life/${id}`, { ...doc, done: 0, paidId: null });
  return { entry: null, paidId: null };
}

export const removeLife = (id: string) => deleteDoc(`hq_life/${id}`);

export const setMoneyGoal = (cents: number | null, by: string, now: number) => setDoc("hq_settings/me", { moneyGoal: cents, by, at: now });
