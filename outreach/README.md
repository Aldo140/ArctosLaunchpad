# outreach/

Cold outreach for Arctos: owner-run Calgary businesses with custom orders,
quotes or job tracking (cabinet and millwork shops, fabrication, sign shops,
custom bakeries).

## Rules

- Send only from `aldo@arctoslaunchpad.com`, never from the Vow Motion address
  or jorti104@mtroyal.ca. `.github/workflows/outreach.yml` sends the queue
  through Brevo (`BREVO_API_KEY` repository secret), one email per run,
  weekdays 9:00–16:30 Calgary time, two per run, at most 50 a day; `sent.json` records each
  send. Replies reach mrotiz14@gmail.com through ForwardEmail (MX + TXT records
  on Vercel DNS).
- Up to 50 new businesses a day, weekdays, spaced through the day. No link in
  the first email; the ask is a reply.
- Every email names one true detail about that business and cites only real
  Arctos work: True North Kromes (case-intake site), Nicsdelite (multi-order
  dessert form and admin), Fresh Prep (internal reporting tool).
- Footer on every email: name, Arctos, mailing address, reply-to-unsubscribe.
  Add every opt-out or bounce to `suppression.txt` the same day.

## Batches

- `batch-2026-10-06.json` — 15 businesses, queued for the workflow.
