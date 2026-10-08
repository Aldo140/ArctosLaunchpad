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
`NEXT_PUBLIC_FIREBASE_*` (public identifiers) and `HQ_ALLOWED_EMAILS`.

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

## Personality

HQ's voice lives in `components/hq/persona.ts`: the greeting, the morning
brief written from the live data, wins from the last seven days, the Arctos
outreach streak and follower milestones. The Overview also shows Calgary's
weather from Open-Meteo (no key). ⌘K, Ctrl+K or `/` opens the command bar;
`g` then a letter jumps to a tab (`g i` Inbox, `g t` Tasks, `g p` Pipelines,
`g s` Instagram, `g d` Inspiration, `g n` Performance, `g h` Health,
`g o` Overview).

HQ reads the mood (`mood()` in persona.ts): late night, a heavy queue, a
skipped gym, a run of wins or a quiet inbox each change the closing line of
the brief and the sign-off.

## Life

- **Money moves**: everyone closest to paying, oldest first. That means pitch
  replies still waiting on an answer (they open the Gmail thread), interested
  or replied CalgaryWatch leads, then follow-ups that are due.
- **Today**: the calendar sync (`ops/gmail/hq-calendar.gs`) runs in the same
  Apps Script project as the Gmail sync. It posts the next seven days of
  events every 15 minutes to `/api/hq/ingest/calendar` with the same key
  (`HQ_GMAIL_KEY`). Setup: add the file to that project and run `setupCalendar`
  once.
- **Gym**: the "I went today" button (or `l g`) writes to `hq_life` through
  `POST /api/hq/life`. Calendar events that look like a workout count too.
  The goal (`GYM_GOAL`, 3 a week) and the membership cost (`GYM_MONTHLY`, used
  for cost per visit) live in persona.ts. The card suggests the first free
  90 minutes on today's calendar.
