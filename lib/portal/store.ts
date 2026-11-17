import { createHash } from "node:crypto";
import { readStringField, readStringFieldVersioned, writeStringField, writeStringFieldIf } from "../hq/google";
import type { ClientAccount, PortalSnapshot } from "./types";

export const accountIdFor = (email: string) => createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 32);
const pathFor = (id: string) => `client_accounts/${id}`;

export async function accountByEmail(email: string): Promise<ClientAccount | null> {
  return accountById(accountIdFor(email));
}

export async function accountById(id: string): Promise<ClientAccount | null> {
  const payload = await readStringField(pathFor(id), "payload");
  if (!payload) return null;
  try { return JSON.parse(payload) as ClientAccount; } catch { throw new Error("The client account record is invalid."); }
}

export async function saveAccount(account: ClientAccount): Promise<void> {
  account.updatedAt = Date.now();
  await writeStringField(pathFor(account.id), "payload", JSON.stringify(account));
  for (let attempt = 0; attempt < 4; attempt++) {
    const current = await readStringFieldVersioned("client_accounts_index/all", "payload");
    const ids = current.value ? JSON.parse(current.value) as string[] : [];
    if (ids.includes(account.id)) break;
    if (await writeStringFieldIf("client_accounts_index/all", "payload", JSON.stringify([...ids, account.id]), current.updateTime)) break;
  }
}

export async function listAccounts(): Promise<ClientAccount[]> {
  const payload = await readStringField("client_accounts_index/all", "payload");
  const ids = payload ? JSON.parse(payload) as string[] : [];
  return (await Promise.all(ids.map(accountById))).filter((item): item is ClientAccount => Boolean(item)).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function publicSnapshot(account: ClientAccount): PortalSnapshot {
  const { stripeCustomerId, stripeSubscriptionId, stripePriceId, ...billing } = account.billing;
  return { account: { ...account, billing: { ...billing, canStart: Boolean(stripePriceId && !stripeSubscriptionId), canManage: Boolean(stripeCustomerId) } } };
}
