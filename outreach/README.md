# outreach/

Cold outreach for Arctos: owner-run Calgary businesses with custom orders,
quotes or job tracking (cabinet and millwork shops, fabrication, sign shops,
custom bakeries).

## Rules

- HQ owns outreach (since 2026-10-12). Nothing sends by hand. HQ's
  operations clock starts `.github/workflows/outreach.yml` every half hour on
  weekdays, and the HQ bot texts Aldo when a run starts and how it ended.
- Send only from `aldo@arctoslaunchpad.com`, never from the Vow Motion address
  or jorti104@mtroyal.ca. The workflow sends through Brevo (`BREVO_API_KEY`
  repository secret), weekdays 9:00–16:30 Calgary time, up to ten per run, at
  most 50 a day; `sent.json` records each send. Hard bounces and spam
  complaints Brevo reports are added to `suppression.txt` automatically, and
  three hard bounces in a day stop sending until the next day. Replies reach mrotiz14@gmail.com through ForwardEmail (MX + TXT records
  on Vercel DNS).
- Up to 50 new businesses a day, weekdays, spaced through the day. No link in
  the first email; the ask is a reply.
- Every email names one true detail about that business and cites only real
  Arctos work: True North Kromes (case-intake site), Nicsdelite (multi-order
  dessert form and admin), Fresh Prep (internal reporting tool).
- The proposition is diagnostic: learn how the owner currently turns enquiries
  into paid work, then recommend only what would help. That may be intake,
  tracking, follow-up, the offer, a website or optional ads. The CTA is one
  20-minute working call; a reply of "yes" gets two proposed times.
- Footer on every email: name, Arctos, mailing address, reply-to-unsubscribe.
  Add every opt-out or bounce to `suppression.txt` the same day.

## New prospects

HQ finds them. At 4 am Calgary on weekdays the clock starts
`.github/workflows/prospects.yml`, which tops each campaign up to a full day
(50 minus what is still queued). Claude Code researches the businesses with
web search and page reads only, following `prospect-brief-arctos.md` and
`prospect-brief-vowmotion.md`, and returns facts: who, the page showing their
address, and one true detail with its page. `scripts/prospects.mjs` then
drops anyone already emailed, listed or suppressed (by address, business name
or domain), anyone whose domain has no mail server and anything that breaks
the copy rules, writes each email around those facts (the introduction, case
studies and footer are fixed in the script) and commits the batch:
`batch-<date>-hq.json` here for Arctos, `vow-motion/batch-<date>.json` for
Vow Motion. Every row keeps `emailSource` and `detailSource` so it can be
checked. The HQ bot texts Aldo how many were found.

## Vow Motion

The same workflow sends Vow Motion's planner outreach (signed "Arctos,
marketing for Vow Motion"). Its lists stay in Aldo140/vow-motion
(`outreach/batch-*.json` and `outreach/suppression.txt` on branch
`claude/great-sagan-ofu2xe`); a new batch file there is picked up on the next
run. It sends weekdays 9:30–17:00 US Eastern, up to six per run, at most 50 a
day. `vow-motion-sent.json` records each send, `vow-motion-suppression.txt`
holds bounces found in Brevo, and `vow-motion-edits.json` fixes copy in rows
without editing that repository. Everything up to row 37 of
`batch-2026-10-08.json`, and every earlier batch, went out by hand from Gmail
before HQ took over.

## Batches

- `batch-2026-10-06.json`, `batch-2026-10-06b.json` — 44 businesses, sent 2026-10-06.
- `batch-2026-10-13.json` — 9 Calgary caterers, a test run; sent early on Aldo's request (Saturday 2026-10-10 evening) with the manual "send now" option.
- `batch-2026-10-12.json` — 35 businesses (cabinets, metal, signs, stone, railings, furniture, print, embroidery, auto repair and detailing, renovation, landscaping, upholstery, a bakery).
- `batch-2026-10-07.json` — 50 businesses (glass, closets, flooring, millwork, welding, print, signs, furniture, framing, wraps, landscaping, cakes, catering, auto repair, tailoring).
- `batch-2026-10-21-basement.json` — 30 Calgary basement and legal suite builders from the /calgary-basement-builders prospect list, each offered a free Missed Lead Check; one real website detail per builder. Sent from 2026-10-21 on Aldo's request.
