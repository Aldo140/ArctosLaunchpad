# HQ (`/hq`)

The private operations dashboard for CalgaryWatch, CalgaryDaily, Vow Motion
and Arctos Launchpad. Google sign-in on the `arctos-hq` Firebase project; only
the accounts in the Vercel variable `HQ_ALLOWED_EMAILS` get past it.

## How the data gets here

1. The ops agents (CalgaryWatch repository, `ops-daily` and `ops-hourly`
   workflows) end every run by writing one summary document, `hq/snapshot`, to
   the `arctos-hq` Firestore. They sign in keylessly: GitHub's OIDC token is
   exchanged for a one-hour Google token (workload identity pool `github`).
2. `/api/hq/snapshot` checks the visitor's Firebase ID token, then reads that
   document with its own keyless Google token: Vercel's OIDC token, exchanged
   through the `vercel` pool (production deployments only), acting as the
   Firebase admin service account.
3. Arctos outreach counts come from `outreach/sent.json` on the
   `arctos-launchpad` branch.

No service-account key exists anywhere. Browsers never read Firestore
directly; the database has no client rules.

## Vercel variables

`GCP_PROJECT_ID`, `GCP_PROJECT_NUMBER`, `GCP_WORKLOAD_IDENTITY_POOL_ID`,
`GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID`, `GCP_SERVICE_ACCOUNT_EMAIL`,
`NEXT_PUBLIC_FIREBASE_*` (public identifiers), `HQ_ALLOWED_EMAILS`, `HQ_GMAIL_KEY` and
`ANTHROPIC_API_KEY` (the reply check, below).

## Tabs

Grouped by island. 01 Win the customer: Overview, Inbox (posts, pitches and
replies to approve, edit, redraft or reject), Instagram (all four accounts),
Inspiration (what outperforms on other Calgary accounts, and the agents'
ideas), Pipelines (CalgaryWatch, Arctos, Vow Motion). 02 Run the work: Tasks
(every recurring job with today's proof, run history and GitHub schedule reliability; routines are defined in `components/hq/tasks.ts`). 03 See the numbers: Performance,
Health and Glossary. The snapshot shape is `lib/hq/types.ts`; the writer is
`scripts/ops/lib/hqSnapshot.ts` in the CalgaryWatch repository.

## Actions

Buttons write to `hq_commands` through `POST /api/hq/command`. The ops agents
apply pending commands at the start of every run (`npm run ops:hq-commands`, see docs/OPS.md),
so an action lands within about 30 minutes. A pending command can be undone
until then.

## The reply check

Before a Gmail reply (Vow Motion, Arctos) reaches the board, an agent reads it
and decides whether it needs you. It runs right after each Gmail sync
(`/api/hq/ingest/gmail`, logic in `lib/hq/triage.ts` and
`lib/hq/triageAgent.ts`) and looks at:

- the whole conversation, not just the last message (the sync sends the
  thread for unanswered real replies, each message cut to its new text);
- every other mail with that person or organisation in the last 30 days:
  another thread, a follow-up you already sent elsewhere, an auto-reply, an
  opt-out;
- links they mention on our sites or theirs, fetched to see whether a
  reported problem is real or already fixed.

A reply that needs you shows a proposed subtask under it in Inbox → Replies
(and in Pipelines). Approve it (reword it first if you like), or press "No
action needed". Replies that need nothing stay off the board, listed under
"Filtered out by the reply check" with the reason, where "Needs action after
all" puts one back. Decisions are saved straight away in
`hq_reply_decisions`; nothing is ever sent. A new reply in the thread, or new
mail with that person, gets a fresh check.

It needs `ANTHROPIC_API_KEY` (and `ANTHROPIC_WORKSPACE_ID` if the key needs a
workspace) on Vercel. Without it, every reply shows as before, marked "Not
checked yet". For the thread context, paste the updated
`ops/gmail/hq-sync.gs` into the Apps Script project; until then the check
works from the 240-character snippet.
