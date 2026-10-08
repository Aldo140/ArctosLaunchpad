import { randomUUID } from 'node:crypto';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

export const COLLECTIONS = {
  posts: 'ops_queue',
  leads: 'partner_leads',
  suppression: 'outreach_suppression',
  health: 'ops_health',
} as const;

/**
 * Two databases. The agents' own state (the post queue, health, usage, tokens
 * and the HQ queue) lives in arctos-hq, next to the HQ dashboard; the runner
 * signs in to it keylessly (Workload Identity Federation, Application Default
 * Credentials). CalgaryWatch keeps what its own site and admin use: partner
 * leads, the suppression list and the ingestion health its pipeline writes.
 */
export const HQ_PROJECT = 'arctos-hq';
/** CalgaryWatch's Firebase project and named database (public: firebase-applet-config.json there). */
export const CALGARYWATCH_PROJECT = 'gen-lang-client-0683855942';
export const CALGARYWATCH_DATABASE = 'ai-studio-69c4a77a-35d9-4afb-8d72-40cd6cd30328';
export const CALGARYWATCH_COLLECTIONS = new Set<string>([COLLECTIONS.leads, COLLECTIONS.suppression, 'ingestion_health']);

function cwApp() {
  const existing = getApps().find(a => a.name === 'calgarywatch');
  if (existing) return existing;
  return initializeApp({
    credential: process.env.FIREBASE_SERVICE_ACCOUNT ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) : applicationDefault(),
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || CALGARYWATCH_PROJECT,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || `${CALGARYWATCH_PROJECT}.firebasestorage.app`,
  }, 'calgarywatch');
}

function hqApp() {
  const existing = getApps().find(a => a.name === 'hq');
  if (existing) return existing;
  return initializeApp({ credential: applicationDefault(), projectId: process.env.HQ_PROJECT_ID || HQ_PROJECT }, 'hq');
}

/** CalgaryWatch's database (same selection as its discovery pipeline). */
export function calgaryWatchDb(): Firestore {
  return getFirestore(cwApp(), process.env.VITE_FIRESTORE_DATABASE_ID || CALGARYWATCH_DATABASE);
}

/** The agents' own database in arctos-hq. */
export function hqDb(): Firestore {
  return getFirestore(hqApp());
}

let routed: Firestore | null = null;
/**
 * One handle for the jobs: collection() goes to whichever database owns that
 * collection, everything else to arctos-hq. No job writes across both in one
 * batch or transaction, so routing by collection is safe.
 */
export function opsDb(): Firestore {
  if (routed) return routed;
  const hq = hqDb();
  const cw = calgaryWatchDb();
  routed = new Proxy(hq, {
    get(target, prop, receiver) {
      if (prop === 'collection') return (name: string) => (CALGARYWATCH_COLLECTIONS.has(name.split('/')[0]) ? cw : target).collection(name);
      const v = Reflect.get(target, prop, receiver);
      return typeof v === 'function' ? v.bind(target) : v;
    },
  });
  return routed;
}

/**
 * Upload a rendered post; Instagram fetches the image by URL.
 *
 * In GitHub Actions the image goes to the repo's ops-media branch and is served
 * from raw.githubusercontent.com. Firebase Storage is the fallback, but it needs
 * a billing account on the project, which this one doesn't have (uploads fail
 * with "billing account ... is disabled").
 */
export async function uploadImage(path: string, png: Buffer): Promise<string> {
  const repo = process.env.GITHUB_REPOSITORY, token = process.env.GITHUB_TOKEN;
  if (repo && token) return uploadToGitHub(repo, token, path, png);
  return uploadToStorage(path, png);
}

const MEDIA_BRANCH = 'ops-media';

/** raw.githubusercontent.com is not a CDN; jsDelivr serves the same ops-media file cached. */
export function cdnUrl(url: string): string {
  const m = url.match(/^https:\/\/raw\.githubusercontent\.com\/([^/]+\/[^/]+)\/ops-media\/(.+)$/);
  return m ? `https://cdn.jsdelivr.net/gh/${m[1]}@ops-media/${m[2]}` : url;
}

/**
 * Upload a rendered Reel to the ops-media branch. Instagram fetches videos by URL and needs a
 * video content type, so it is served through jsDelivr's GitHub mirror (files up to 20 MB).
 */
export async function uploadVideo(path: string, mp4: Buffer): Promise<string> {
  const repo = process.env.GITHUB_REPOSITORY, token = process.env.GITHUB_TOKEN;
  if (!repo || !token) throw new Error('Reels need GITHUB_REPOSITORY and GITHUB_TOKEN (they run in GitHub Actions).');
  if (mp4.length > 19 * 1024 * 1024) throw new Error(`Reel is ${Math.round(mp4.length / 1048576)} MB; the host limit is 20 MB.`);
  await uploadToGitHub(repo, token, path, mp4);
  return `https://cdn.jsdelivr.net/gh/${repo}@${MEDIA_BRANCH}/${path}`;
}

async function uploadToGitHub(repo: string, token: string, path: string, png: Buffer): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json' },
    body: JSON.stringify({ message: `ops: ${path}`, content: png.toString('base64'), branch: MEDIA_BRANCH }),
  });
  if (!res.ok) throw new Error(`Image upload to ${MEDIA_BRANCH} failed: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  return `https://raw.githubusercontent.com/${repo}/${MEDIA_BRANCH}/${path}`;
}

/**
 * Write (or overwrite) a small file on the ops-media branch, e.g. the feed the
 * CalgaryWatch homepage reads. Returns its raw.githubusercontent.com URL.
 */
export async function putMediaFile(path: string, content: string | Buffer, message = `ops: ${path}`): Promise<string> {
  const repo = process.env.GITHUB_REPOSITORY, token = process.env.GITHUB_TOKEN;
  if (!repo || !token) throw new Error('Needs GITHUB_REPOSITORY and GITHUB_TOKEN (GitHub Actions).');
  const headers = { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json' };
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  const current = await fetch(`${url}?ref=${MEDIA_BRANCH}`, { headers });
  const sha = current.ok ? ((await current.json()) as { sha?: string }).sha : undefined;
  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ message, content: Buffer.from(content).toString('base64'), branch: MEDIA_BRANCH, ...(sha ? { sha } : {}) }),
  });
  if (!res.ok) throw new Error(`Write to ${MEDIA_BRANCH} failed: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  return `https://raw.githubusercontent.com/${repo}/${MEDIA_BRANCH}/${path}`;
}

/** A Firebase download token makes the file readable by whoever has the link, not listable. */
async function uploadToStorage(path: string, png: Buffer): Promise<string> {
  const bucket = getStorage(cwApp()).bucket();
  const token = randomUUID();
  await bucket.file(path).save(png, {
    contentType: 'image/png',
    resumable: false,
    metadata: { cacheControl: 'public, max-age=31536000', metadata: { firebaseStorageDownloadTokens: token } },
  });
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

/** Both sign-ins: CalgaryWatch's service account and arctos-hq's keyless credentials. */
export const hasFirebase = () => Boolean(process.env.FIREBASE_SERVICE_ACCOUNT && process.env.GOOGLE_APPLICATION_CREDENTIALS);
