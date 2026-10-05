# Rebuild brief — read this before touching anything

Every agent working on this pass reads this file first. It is the single
source of truth for *why* we're changing things, so independent agents
converge instead of inventing five different directions.

## The ICP (who this site has to convert)

Calgary-area businesses that run the same operation over and over —
recurring campaigns, events, or production batches — and currently track
the results by hand (spreadsheets, folders, manual reporting). Proof this
works: Fresh Prep (events/experiential marketing, three campaign reports
over months — a real recurring client) and True North Kromes (dental lab
production runs, an active growth relationship). Everything else in the
case-study archive is a weaker or one-off fit; don't centre messaging on
it.

## The conversion goal, in order

1. A visitor in the ICP recognizes themselves within seconds of landing.
2. They see proof fast — a real case, not a service menu.
3. They reach a low-friction path to contact (the three-door routing on
   /contact already does this part).

Anything on a page that doesn't serve one of these three — cut it or
demote it. This is not "add more sections," it's "make the right section
unmissable."

## Standing constraints (binding, not optional)

- `DESIGN-SYSTEM.md` is still the law — two materials, three motion
  gestures (DRAW/WIPE/SET), nothing translates on entry, no invented
  metrics/testimonials/clients.
- `docs/RESEARCH.md` is the competitive research behind this brand — its
  anti-pattern list (§5) and credibility recommendations (§1) still apply.
- No invented facts. No named individual yet (the owner isn't ready to be
  the public face). No specific prices (not decided yet).
- No browser/visual tool exists for any agent in this environment —
  every change must be justified by code/CSS you can read, not by
  imagining how it renders. Typecheck/lint/build passing is the bar.

## IA decisions already made (execute these, don't re-litigate)

- Service pages (13) and industry pages (10) stay live — they carry real
  content and SEO value — but de-emphasized in favour of the ICP-specific
  story on the homepage and services index. Don't delete pages.
- Case studies get a fifth beat: `constraint` (what made it hard) and
  `whatChanged` (honest direction-of-change, no fabricated numbers) per
  RESEARCH.md R9/R10. Base this on what's already true in each project's
  existing challenge/approach/solution fields — infer honestly, don't
  invent.
- Homepage's job is ICP-recognition + fast proof + path to contact — not
  a complete capability listing.

## What NOT to do

- Don't propose a new visual identity, new color tokens, new typefaces,
  or a new mark — that's a brand-level decision outside this pass.
- Don't touch /privacy, /accessibility, or the Calgary local-SEO landers
  (calgary-web-design, calgary-business-automation,
  calgary-custom-software) — out of scope for this pass.
- Don't duplicate another agent's file ownership — check the task
  assignment you were given for your exact scope before starting.
