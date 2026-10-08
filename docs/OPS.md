# Ops agents

The agents behind CalgaryDaily, CalgaryWatch partner outreach and the HQ
dashboard. They moved here from the CalgaryWatch repository in October 2026.

## What runs

| Workflow | When | What |
|---|---|---|
| `ops-clock.yml` | Always on | Keeps time. Starts hourly at :07 and :37 and daily at 3, 6, 7 and 8 am Calgary. GitHub's own schedules run late or not at all, so they are only a backup. |
| `ops-hourly.yml` | Every 30 min | Applies HQ actions, publishes due posts, reads partner replies, sends approved email, publishes the CalgaryDaily feed and the HQ snapshot. |
| `ops-daily.yml` | Mornings | Drafts posts, runs the Scout and inspiration analysis, finds leads, drafts pitches, checks health, emails the summary. |

Code is in `ops/` (`npm run ops:typecheck`, `npm run ops:test`). It is its own
ES module folder and is excluded from the Next.js type check and lint.

## Where the data lives

- **arctos-hq** (the HQ project): `ops_queue` (posts), `ops_health`, `ops_usage`,
  `ops_secrets` (refreshed Instagram tokens), `hq_commands`, `hq/snapshot` and
  `ops_meta/handoff`. The runner signs in keylessly through Workload Identity
  Federation; no key is stored.
- **CalgaryWatch** (`gen-lang-client-0683855942`, database `ai-studio-…`):
  `partner_leads`, `outreach_suppression` and `ingestion_health`, because the
  CalgaryWatch site and admin use them. Read and written with
  `FIREBASE_SERVICE_ACCOUNT`.
- **CalgaryWatch listings** come from `https://calgarywatch.ca/discovery-index.json`,
  which every CalgaryWatch deploy rebuilds.
- **Images, Reels and the CalgaryDaily feed** go to this repository's `ops-media`
  branch. Instagram and calgarywatch.ca fetch them by URL (jsDelivr in front).
  Vercel ignores that branch (`vercel.json`).

`lib/firebase.ts` routes each collection to its database, so jobs use one handle.

## The handoff

`ops/handoff.ts` runs first in every ops workflow. The first time the secrets
are present it:

1. Writes `ops_meta/handoff.startedAt` in arctos-hq. CalgaryWatch's ops
   workflows read that document and stand down from their next run.
2. Waits for any CalgaryWatch ops run already in progress to finish.
3. Copies `ops_queue`, `ops_health`, `ops_usage` and `ops_secrets` to arctos-hq.
4. Writes `migratedAt`. Every later run skips straight past it.

## Secrets and variables

Settings → Secrets and variables → Actions. Until the three marked required are
present, every ops workflow skips and the agents keep running from CalgaryWatch.

Secrets:
- `ANTHROPIC_API_KEY` (required)
- `FIREBASE_SERVICE_ACCOUNT` (required): CalgaryWatch's service account JSON.
- `IG_TOKEN_CALGARYDAILY` (required), `IG_TOKEN_CALGARYWATCH`
- `IG_DISCOVERY_TOKEN`, `IG_USER_ID` (the Scout)
- `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET` (aldo@calgarywatch.ca mailbox)
- `RESEND_API_KEY` (summary email)

Variables:
- `DIGEST_MAILING_ADDRESS` (required to send outreach: CASL)
- `OPS_SUMMARY_TO`, `OPS_SUMMARY_FROM` (the morning summary)
- `OUTREACH_MAILBOX` (defaults to aldo@calgarywatch.ca), `ANTHROPIC_WORKSPACE_ID` (optional)
