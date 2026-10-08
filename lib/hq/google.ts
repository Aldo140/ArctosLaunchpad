import { getVercelOidcToken } from "@vercel/oidc";

/**
 * A short-lived Google access token for the arctos-hq project, with no stored
 * key. Vercel signs an OIDC token for this deployment; Google's Security Token
 * Service trusts it through the `vercel` workload identity pool (production
 * deployments of arctos-launchpad only) and lets it act as the Firebase admin
 * service account for an hour.
 */

let cached: { token: string; expiresAt: number } | null = null;

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export async function googleAccessToken(): Promise<string> {
  if (cached && cached.expiresAt - Date.now() > 5 * 60_000) return cached.token;

  const audience = `//iam.googleapis.com/projects/${env("GCP_PROJECT_NUMBER")}/locations/global/workloadIdentityPools/${env("GCP_WORKLOAD_IDENTITY_POOL_ID")}/providers/${env("GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID")}`;
  const subjectToken = await getVercelOidcToken();

  const sts = await fetch("https://sts.googleapis.com/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grantType: "urn:ietf:params:oauth:grant-type:token-exchange",
      audience,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      requestedTokenType: "urn:ietf:params:oauth:token-type:access_token",
      subjectToken,
      subjectTokenType: "urn:ietf:params:oauth:token-type:jwt",
    }),
  });
  if (!sts.ok) throw new Error(`Google token exchange failed: HTTP ${sts.status} ${await sts.text()}`);
  const federated = (await sts.json()) as { access_token: string };

  const impersonate = await fetch(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${env("GCP_SERVICE_ACCOUNT_EMAIL")}:generateAccessToken`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${federated.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ scope: ["https://www.googleapis.com/auth/cloud-platform"], lifetime: "3600s" }),
    },
  );
  if (!impersonate.ok) throw new Error(`Google service account access failed: HTTP ${impersonate.status} ${await impersonate.text()}`);
  const sa = (await impersonate.json()) as { accessToken: string; expireTime: string };
  cached = { token: sa.accessToken, expiresAt: Date.parse(sa.expireTime) };
  return sa.accessToken;
}

const FIRESTORE = () => `https://firestore.googleapis.com/v1/projects/${env("GCP_PROJECT_ID")}/databases/(default)/documents`;

/** One document's string field, or null when the document doesn't exist yet. */
export async function readStringField(path: string, field: string): Promise<string | null> {
  const r = await fetch(`${FIRESTORE()}/${path}`, {
    headers: { Authorization: `Bearer ${await googleAccessToken()}` },
    cache: "no-store",
  });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Reading ${path}: HTTP ${r.status}`);
  const doc = (await r.json()) as { fields?: Record<string, { stringValue?: string }> };
  return doc.fields?.[field]?.stringValue ?? null;
}

export async function writeStringField(path: string, field: string, value: string): Promise<void> {
  const r = await fetch(`${FIRESTORE()}/${path}?updateMask.fieldPaths=${field}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${await googleAccessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: { [field]: { stringValue: value } } }),
  });
  if (!r.ok) throw new Error(`Writing ${path}: HTTP ${r.status}`);
}

type Value = { stringValue?: string; integerValue?: string; nullValue?: null };

/** Creates a document with a generated id; returns the id. */
export async function createDoc(collection: string, fields: Record<string, string | number | null>): Promise<string> {
  const body: Record<string, Value> = {};
  for (const [k, v] of Object.entries(fields)) body[k] = v === null ? { nullValue: null } : typeof v === "number" ? { integerValue: String(Math.round(v)) } : { stringValue: v };
  const r = await fetch(`${FIRESTORE()}/${collection}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await googleAccessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: body }),
  });
  if (!r.ok) throw new Error(`Saving to ${collection}: HTTP ${r.status}`);
  const doc = (await r.json()) as { name: string };
  return doc.name.split("/").pop()!;
}

/** Plain values of every document in a collection whose integer `field` is at least `min`. */
export async function queryRecent(collection: string, field: string, min: number, limit = 200): Promise<Array<{ id: string; fields: Record<string, string | number | null> }>> {
  const base = FIRESTORE().replace(/\/documents$/, "");
  const r = await fetch(`${base}/documents:runQuery`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await googleAccessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: { fieldFilter: { field: { fieldPath: field }, op: "GREATER_THAN_OR_EQUAL", value: { integerValue: String(min) } } },
        limit,
      },
    }),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Reading ${collection}: HTTP ${r.status}`);
  const rows = (await r.json()) as Array<{ document?: { name: string; fields: Record<string, Value> } }>;
  return rows.filter((x) => x.document).map((x) => ({
    id: x.document!.name.split("/").pop()!,
    fields: Object.fromEntries(Object.entries(x.document!.fields).map(([k, v]) => [k, v.integerValue !== undefined ? Number(v.integerValue) : v.stringValue ?? null])),
  }));
}

export async function deleteDoc(path: string): Promise<void> {
  const r = await fetch(`${FIRESTORE()}/${path}`, { method: "DELETE", headers: { Authorization: `Bearer ${await googleAccessToken()}` } });
  if (!r.ok && r.status !== 404) throw new Error(`Deleting ${path}: HTTP ${r.status}`);
}

export async function readFields(path: string): Promise<Record<string, string | number | null> | null> {
  const r = await fetch(`${FIRESTORE()}/${path}`, { headers: { Authorization: `Bearer ${await googleAccessToken()}` }, cache: "no-store" });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Reading ${path}: HTTP ${r.status}`);
  const doc = (await r.json()) as { fields?: Record<string, Value> };
  return Object.fromEntries(Object.entries(doc.fields ?? {}).map(([k, v]) => [k, v.integerValue !== undefined ? Number(v.integerValue) : v.stringValue ?? null]));
}
