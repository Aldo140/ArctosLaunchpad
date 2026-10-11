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

Grouped by what you do, not by what the agents do.

- **You**: Today (the day in four numbers: waiting on you, money in this
  month, gym this week, next on the calendar; the three things to clear first;
  the day as one timeline with what's due today; to-dos, money owed, money
  moves, the week scored against last week, momentum), Decide (every
  post, pitch and reply waiting on you as one list, people who wrote back
  first; one-tap Approve / Send / Skip on each row, open a row to edit first;
  `j`/`k` move, `o` opens), Money (money in against a monthly goal, a
  day-by-day pace chart against last month, money owed to you, logged by
  hand) and Life (the gym, the week's calendar with due items, to-dos).
- **The businesses**: Growth (Instagram accounts, post ideas, what works) and
  Pipelines (CalgaryWatch, Arctos, Vow Motion).
- **Engine room**: System (the agents' jobs, every connection, a glossary).

Old links still work: `#inbox` opens Decide, `#tasks` opens System, and so
on (`ALIASES` in `components/hq/HqApp.tsx`). The decision list is
`components/hq/queue.ts`. The snapshot shape is `lib/hq/types.ts`; the writer is
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
- **Today**: the calendar sync (`ops/gmail/hq-calendar.gs`) runs as an Apps
  Script in mrotiz14@gmail.com, on its own or beside the Gmail sync. It posts
  the next seven days of events every 15 minutes to `/api/hq/ingest/calendar`
  with `HQ_CALENDAR_KEY` (or the Gmail sync's `HQ_GMAIL_KEY`). Setup: paste
  it in, set the key, run `setupCalendar` once.
- **Gym**: the "I went today" button (or `l g`) writes to `hq_life` through
  `POST /api/hq/life`; Life can also log yesterday or any day in the last 60. Calendar events that look like a workout count too.
  The goal (`GYM_GOAL`, 3 a week) and the membership cost (`GYM_MONTHLY`, used
  for cost per visit) live in persona.ts. The card suggests the first free
  90 minutes on today's calendar.

- **Money**: the + button (or `l m`) logs a payment: amount, which business,
  what for. Entries are `hq_life` rows of kind `money` (cents); the monthly
  goal is `hq_settings/me`. The brief mentions the month's total and what a
  day it takes to hit the goal.
- **Owed to you**: invoices and agreed prices (`l o`), `hq_life` rows of kind
  `owed` (cents, business, who, an optional `due` day). **Paid** writes a
  `money` row linked by `paidId`, so it counts as money in; **Not paid** (or
  the toast's Undo) deletes that row again. Late ones show on the Money tile,
  in the brief and under "Your day".
- **To-dos**: (`l n`), `hq_life` rows of kind `note` with an optional `due`
  day (noon Calgary time). Late and due-today ones show under "Your day" and
  in the week; one tap pushes one to tomorrow.
- **Your week**: money in, gym days, pitches sent, posts out and calls made in
  HQ, this week so far against last week to the same moment (`weekScore` in
  persona.ts).

## On your phone (the dashboard)

- **Home screen app**: `app/hq/manifest.webmanifest` and the HQ layout's
  `appleWebApp` metadata let "Add to Home Screen" open HQ full screen at
  `/hq#today`. The More sheet shows how until it's installed.
- **Tab bar**: Today, Decide, the **+** (log money, owed, gym, to-do), Money,
  Life. Growth, Pipelines and System sit behind the ⋯ button at the top.
- **Swipe** (`components/hq/Swipe.tsx`, touch only): Decide rows swipe right
  for their main action (approve, send, add to-do, done) and left to open or
  skip; to-dos swipe right for done, left to move to today or tomorrow; owed
  rows swipe right for paid. Every swipe has the same toast and Undo as the
  buttons.
- **Pull down** at the top of any tab to refresh; sheets close by dragging
  their handle down (`components/hq/Mobile.tsx`).

## On your phone (Telegram)

A private Telegram bot answers from the same report. `/today` is the
briefing, `/inbox` sends each post, pitch and drafted reply as a card with the
dashboard's buttons (they queue the same `hq_commands`, signed with your email,
with an Undo until the agents run), and any other text is a question Claude
answers from the report and the Gmail summary. Nothing is approved except by
a button; bigger jobs go to the HQ agent (below). The webhook is
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

### The HQ agent (`/agent`, `/mail`)

Work too big for a text answer goes to the HQ agent: Claude Code on a GitHub
runner. Text `/agent <change>` or `/mail <question>`, or just ask and the bot
hands it over itself. The job is saved in `hq_agent_jobs` (arctos-hq), the ops
clock starts `.github/workflows/hq-agent.yml` for it within a minute, and the
result comes back as a Telegram message (`app/api/hq/agent/notify`, which
trusts the run's GitHub OIDC token, so there is no key to set up).

A job is one of two kinds, and never both:

- **code** edits a checkout of main. It has no email access and can't push;
  the workflow pushes its change to main only after the type check, lint, ops
  tests and build pass (Vercel then deploys it). Otherwise the change waits on
  an `hq-agent/<job>` branch and the message links it.
- **mail** reads the aldo@calgarywatch.ca Outlook mailbox through Microsoft
  Graph (the ops `MS_*` secrets) and HQ's Gmail summary (`hq/gmail`) with
  `ops/agent-mail.ts`. It can't edit files, run anything else, send or push.

Keeping them apart means nothing an email says can turn into code on main.
The repository and its Actions logs are public, so only the job id is a
workflow input and Claude's output never prints there. The briefs are
`ops/agent/code-brief.md` and `ops/agent/mail-brief.md`; the queue is
`lib/hq/agentJobs.ts` and `ops/agent-jobs.ts`. It only changes this
repository; CalgaryWatch code needs its own setup.
