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
`NEXT_PUBLIC_FIREBASE_*` (public identifiers), `HQ_ALLOWED_EMAILS`, `HQ_GMAIL_KEY` and,
optionally, `ANTHROPIC_API_KEY` (the reply check and the Telegram bot's
questions, below). The Telegram bot adds `HQ_TELEGRAM_*`.

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

It runs in the ops agents' hourly run (`npm run ops:reply-check`, from
CalgaryWatch's `ops-hourly` until the agents move here), which already has
`ANTHROPIC_API_KEY`, so there is nothing to set up. If that key is also added
on Vercel, the check runs straight after each Gmail sync instead of waiting
for the next run. For the thread context, paste the updated
`ops/gmail/hq-sync.gs` into the Apps Script project; until then the check
works from the 240-character snippet.

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

## On your phone (Telegram)

A private Telegram bot answers from the same report. `/today` is the
briefing, `/inbox` sends each post, pitch and drafted reply as a card with the
dashboard's buttons (they queue the same `hq_commands`, signed with your email,
with an Undo until the agents run), and any other text is a question Claude
answers from the report and the Gmail summary. It can read but not act:
nothing is approved except by a button. The webhook is
`app/api/hq/telegram/route.ts`; the messages are `lib/hq/telegramBot.ts`.

Setup, once:

1. In Telegram, message @BotFather, send `/newbot`, and copy the token.
2. On Vercel (production), add `HQ_TELEGRAM_BOT_TOKEN` (that token),
   `HQ_TELEGRAM_WEBHOOK_SECRET` (any long random string of letters, digits,
   `_` or `-`, e.g. `openssl rand -hex 32`) and `ANTHROPIC_API_KEY` (for
   questions; `ANTHROPIC_WORKSPACE_ID` too if the key needs one). Redeploy.
3. Run `HQ_TELEGRAM_BOT_TOKEN=… HQ_TELEGRAM_WEBHOOK_SECRET=… node scripts/hq-telegram-webhook.mjs`.
4. Message the bot. It replies with your Telegram id; add
   `HQ_TELEGRAM_USERS` = `thatId=you@gmail.com` on Vercel (comma-separate more
   people) and redeploy. Everyone else only ever sees "This bot is private".
