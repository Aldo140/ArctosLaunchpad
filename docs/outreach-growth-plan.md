# CalgaryWatch and Arctos outreach growth

Prepared October 23, 2026. This proposal does not send email, enqueue prospects,
raise sending limits or change suppression rules.

## Arctos

Position Arctos as a Calgary digital studio. Research and match a single
opportunity per business: website, redesign, inquiry/booking intake, ecommerce,
automation, outreach or measurement. Include independent retail, hospitality,
professional practices and wellness alongside trades. Never diagnose a fault,
claim lost revenue or promise results without evidence. Existing verified work
remains the only case-study evidence in the draft generator.

Each prospect needs a public contact source, a separate factual hook, a
specific workflow question and a suitable opportunity. Existing drafts without
an opportunity preserve their original wording. Unknown opportunity values are
rejected. Existing deduplication, suppression, provenance and copy-length checks
remain in effect. Record the opportunity in newly composed rows for review.

The observed sender run 40038351196 reported zero queued Arctos prospects and
20/50 sends that day. Increasing the cap does not address an empty queue.
Prepare two days of researched candidates, validate their sources, deduplicate
against sent/queued/suppressed records, then approve a replenishment batch.
Do not place review-only drafts in batch-*.json: the sender consumes those files.

## CalgaryWatch

Prioritize positive replies awaiting working links, then unclaimed organizations
with useful upcoming programming, then public-calendar partners. Verify a
permanent profile, its exact claim route and event ownership before drafting.
Keep one contact thread per organization; multiple performances are not new
prospects. An unclaimed profile does not establish that nobody contacted them.

Offer accurate free listings, official links, corrections and permission-based
artwork handling. Do not promise audience numbers, placement or verified owner
access unless checked. A claim invitation is not ownership verification. Do
not use CalgaryWatch editorial inclusion or claim data as an Arctos sales funnel.

## Operational findings

- Arctos Operations hourly run 40039632819 completed its ready check but skipped
  the hourly job. Workflow success is not evidence of actual outreach delivery.
- The CalgaryWatch Operations daily run 39967486872 reported insufficient
  Anthropic API credit. Credit needs restoring before relying on new AI work.
- The Arctos runtime migration must be confirmed; a configured fallback can
  coexist with skipped new jobs. Do not trigger a new handoff blindly.
- Secret-list metadata access returned HTTP 403 in this environment. Do not
  infer exactly which individual secret is missing from a combined ready check.
- No inbox read or complete partner-history audit was performed for this plan.

## Measure outcomes

Review weekly by business and opportunity: verified new candidates, review-ready
queue size, sends, delivery failures, human replies, positive replies, qualified
calls and wins. CalgaryWatch also needs claims requested/approved, organizations
with current programming, corrections completed and partner referral clicks.
Use positive replies per delivered message and qualified conversations as the
primary success measures. Send counts and opens alone are not success.

Week one: close outstanding warm replies, prepare diversified candidates,
restore execution prerequisites and establish the baseline. Week two: compare
opportunities and sectors, keep useful messages, and change one weak element at
a time. Do not raise volume until queue quality and response handling are sound.

## Activation

This branch changes prospect research and composition only. Merging into the
arctos-launchpad default branch triggers prospects.yml and may queue messages
that the existing sender delivers automatically. Review and explicitly authorize
that activation before merging. Prepared local contact lists and draft messages
are not included in the sender's batch directories.
