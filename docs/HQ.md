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
`NEXT_PUBLIC_FIREBASE_*` (public identifiers) and `HQ_ALLOWED_EMAILS`. The
Telegram bot adds `HQ_TELEGRAM_*` and `ANTHROPIC_API_KEY` (below).

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
