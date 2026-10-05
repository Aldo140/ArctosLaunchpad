# Rebuild brief v2 — SCALE, PROOF, OFFER

Every agent reads this first. It supersedes `REBUILD_BRIEF.md` where they differ.
The owner asked for a rebuild that is **bolder, converts, and is not generic**,
with every section and page rethought around who the site is for. Previous passes
only fixed rule violations inside the old layout; the result still *looks like the
same site*. This pass changes the composition, not just the bugs.

---

## 0. The loop you must follow (you can SEE your work — use it)

You are not designing blind. Chrome is installed and a screenshot tool exists.

1. Read this file, then skim `DESIGN-SYSTEM.md` (the law for tokens, materials,
   typography, motion) and `docs/RESEARCH.md` §4–§5 (motion + anti-patterns).
2. In your worktree: `npm ci` if `node_modules` is missing (~40 s).
3. Start YOUR dev server on YOUR port (table in §10), in the background:
   `npx next dev -p <port>` — wait until `curl -s -o /dev/null -w "%{http_code}" http://localhost:<port>/` returns 200.
4. Look at your work:
   ```
   node "C:\Users\aldor\AppData\Local\Temp\claude\c--Users-aldor-ArctosLaunchpad\6b8e9c7d-a185-42f3-9769-92686d107293\scratchpad\shot.mjs" http://localhost:<port>/<route> "<an output dir inside that scratchpad folder, unique to you>" <name> both 8
   ```
   It writes one PNG per viewport-height scroll slice (desktop 1440x900, and real
   mobile emulation 390x844 @2x), and prints any element overflowing the viewport
   horizontally. **Read the PNGs with the Read tool** — it displays images. Ignore
   the small round "N" dev badge at the bottom-left; the first compile of a route
   is slow.
5. Iterate. **At least four look → fix cycles.** Judge as a visitor would:
   empty dead space, clipped text, weak hierarchy, ugly crops, anything that looks
   template-y. Fix it. Check desktop AND mobile every cycle.
6. Finish: `npm run typecheck && npm run lint && npm run build` all clean; stop
   your dev server; commit **only your owned files** on your worktree branch
   (`git add <paths>` — never `git add -A`); do not push.

Your final report must list: what you built, what you *saw* at each cycle and
changed because of it, any asset you wish you had (see §6), and verification.

---

## 1. What the audit found (from real screenshots of the live site)

- Craft is high — typography, the polar-bear illustration world, the paper /
  instrument rhythm are genuinely distinctive and ownable. **Keep the identity.**
- But it is *quiet*: ~15,500 px of page, many screens that are mostly empty dark
  ground with one small heading; the bear roundel is used five times as a small
  spot illustration (~15 % of width) — the best asset is the most underused.
- The hero is type plus a tiny sparse diagram. No proof, no offer, no "who this
  is for". The only conversion action is a generic "Start a project".
- The work section leads with Calgary Watch (civic, **not** the target client);
  Fresh Prep — the best repeat client — has no visual at all.
- Industries is a generic ten-vertical list (SaaS, financial services…) that
  dilutes the message. The footer statement is the generic agency line.
- The contact page is buried in instructional microcopy that is stale
  ("Three short sections" — the form is four fields) and repeats the reply
  promise twice.
- Mobile does not overflow, but it is the desktop composition compressed.

## 2. Direction

**SCALE.** Boldness here comes from size, crop and rhythm, not decoration. One
idea per screen, filling it. Type at monumental scale. Illustration at heroic
scale — roundels bleeding off the canvas at 60–90 vw, collage canvases
(`public/assets/chapters/*.webp`) full-bleed behind headlines. No more half-empty
slabs. Target homepage length ≈ 9,000–11,000 px (down from 15,500).

**PROOF.** Show before you explain. Real work, real footage
(`public/assets/work/*.webm`), the `ReportArtifact` (a redacted real report
structure — `components/figures/ReportArtifact.tsx`, already built, use it). The
two best proofs are **Fresh Prep** (events/experiential marketing; a recurring
client with ongoing campaign reports) and **True North Kromes** (dental lab
production runs; an active growth relationship). They lead. Others support.

**OFFER.** One clear, low-friction action repeated at three moments: the **free
reporting teardown** (§3). Every primary CTA on the site points to `/teardown`.

Keep brand DNA: Newsreader italic "turn" (once per page), Archivo, IBM Plex Mono
labels, drafting-board marks, the two materials (paper / instrument), the bear.

## 3. The offer — "Free reporting teardown"

The audience is Calgary businesses that run the same thing on repeat — events,
campaigns, production runs — and still report on it by hand. The first step we
sell them is not a project, it is a look:

- **Free. 30 minutes. With the people who would do the work.**
- **They bring:** one recent export / spreadsheet, or just a description of how they
  reported on their last campaign, event or production run.
- **We bring:** a one-screen mock of the report it should be, built from what they
  showed us, and the first three manual steps we would automate.
- No obligation, no sales sequence. Reply within two business days (both promises
  already exist on the site — keep them, say them **once** per page).

Pre-decided copy (use as given or sharpen — do not dilute):

- Primary CTA label: **"Get a free reporting teardown"** (nav button: **"Free teardown"**)
- Hero H1 (default): **"Run the work."** / italic line **"The report writes itself."**
  — the italic turn appears once on the page, here.
- Hero sub: "Arctos builds the reporting and automation behind events, campaigns and
  production runs — so the tenth one costs less than the first."
- Eyebrow: "Calgary · Reporting & automation for recurring work"
- Mid-page band H2: **"Send us the spreadsheet you dread."**
- Closing H2: **"What happens after the campaign ends?"**
- Micro-reassurance line near CTAs: "30 minutes. No obligation. Reply within two business days."

## 4. Information architecture (decisions made — do not re-litigate)

- **Primary nav:** Work · Services · Process · Studio · [Free teardown] (button).
  **Industries leaves the nav** (stays in the footer, sitemap and as routes).
- **New route `/teardown`:** the single-purpose conversion page. It is the
  destination for ads, cold email and Instagram. Fast, focused, mobile-first.
- **Contact** stays, but is demoted to "everything that is not the teardown":
  start a project, ask a question, other.
- **Keep all existing routes live** (13 service pages, 10 industry pages, 6 case
  files, process, studio, local landers, legal). Don't delete; demote and refocus.
- **Services index** leads with the three things most clients start with, then
  the four-stage atlas as depth. **Industries index** leads with the three
  archetypes (events & experiential · production & manufacturing ·
  campaign-driven local business) and lists the rest as "also".
- **Work index** order: Fresh Prep, True North Kromes, Calgary Watch, Rio Alto,
  Starlings, LeaseFlow.

## 5. Homepage — section specs (order is fixed)

| # | Component | Job | Material (start; keep alternation) |
|---|---|---|---|
| 1 | `HeroV2` / `HeroV2B` | Recognise yourself in 3 seconds; take the offer | instrument |
| 2 | `GapV2` | "More leads ≠ more admin work" — one punchy screen | paper |
| 3 | `ProofV2` | Fresh Prep + True North Kromes lead; others as a compact index | instrument |
| 4 | `TeardownBand` | Mid-page offer: "Send us the spreadsheet you dread." 3 steps + CTA | paper |
| 5 | `OfferV2` | What we build — three core offers, non-generic layout | instrument |
| 6 | `AutomationV2` | Manual steps struck out → outcomes (keep the idea, make it huge) | paper |
| 7 | `ProcessStripV2` | The first 30 days, compact, drawn track | instrument |
| 8 | `TrustV2` | Terms of engagement — only facts that already exist on the site | paper |
| 9 | `FinalCtaV2` | Closing offer, monumental | instrument |

Hero requirements (both concepts): H1 at monumental scale (≤ 2 lines desktop);
one ICP sentence; primary CTA + a quiet secondary link to `/work`; micro-
reassurance line; a **proof strip** ("Live work: Calgary Watch · True North Kromes ·
Rio Alto · Starlings" as real links to the case files); a composition that is
visibly art-directed, not a stock hero. Mobile: H1 fills the width, art is
re-composed (not shrunk), CTA is full-width in the thumb zone, nothing important
is below ~700 px of scroll that should be above it.

- **Concept A — `HeroV2`: "the report writes itself."** An artifact built in code:
  a scatter of real-feeling filenames/rows (`Campaign_Report (2).xlsx`,
  `signups_FINAL.csv`, `Event codes — Aug.xlsx`, `(1)`, `(2)`…) that DRAW/resolve
  into one clean report plate (use the `ReportArtifact` structure or an evolved
  version). Sequence tells the story: chaos → system. Contour/survey field behind.
- **Concept B — `HeroV2B`: "monumental plate."** Art-led poster: a full-bleed
  collage canvas (`public/assets/chapters/*.webp`) with a bear roundel at 70+ vh
  bleeding off an edge, huge type overlapping it, one drawn route line from the
  headline to the CTA. Existing assets first; ask for a new panoramic only if
  truly needed.
- Both will be compared by screenshot. Make yours genuinely excellent; do not
  hedge toward the other.

## 6. Assets

**Use what exists, at scale.** Inventory (`public/assets`): 10 bear illustrations
(`illustrations/*.webp`, circular roundels on deep navy), 4 torn-paper collage
canvases (`chapters/*.webp`, orange/charcoal/cream with survey marks — each has a
large clear paper field for type), `figures/*`, 5 project reels (`work/*.webm`,
4 with posters), project photography, `textures/*`. Read the images (Read tool)
before choosing — know what they actually show.

**Build in code** what is better built in code: the report artifact, drawn
tracks/routes/curves, redaction bars, contour fields, ledgers.

**If an asset would clearly lift your section and none exists:** do not block.
Build the slot with the best existing asset, add a code comment `// ASSET SLOT:
<name>`, and describe the asset you want in your final report in this form —
*subject, composition, aspect ratio, style anchors, filename*. Style anchors for
bear art: hand-drawn, textured, cream bear (≈ `#e8dfcf`) on deep navy
(`≈ #0a1620`), rough ink ring, restrained accents (rust orange, teal, burgundy),
stipple/grain, flat lighting, no gradients. The owner generates these; we
integrate them later. Candidate new assets already identified:
1. *"The Monday report"* — bear hauling a tottering stack of spreadsheets/paper.
2. *"One clean screen"* — bear reading a single tidy dashboard by lantern light.
3. *"The system"* — bear feeding papers into one slot / conveyor.
4. *"Handover"* — two bears passing a folder.
5. *Archetypes* — bear at an event table with a signup QR; bear at a workbench
   with a small metal framework.
6. *Panorama (3:1)* — a line of bears carrying identical boxes across survey
   contours ("the work you repeat") for hero B / closing CTA.

## 7. Motion

Keep the three entrance gestures: **DRAW** (a line extends), **WIPE** (a plate is
laid down), **SET** (type resolves in place). **Nothing translates on entry.**
Allowed and encouraged, because they are *scroll-tied depth*, not entrances:
scrubbed scale/parallax on held plates and art, scroll-linked DRAW of long lines
and curves, a single orchestrated hero sequence. Everything inside
`gsap.matchMedia("(prefers-reduced-motion: no-preference)")`; reduced motion must
show the *designed* final state. Animate only transform/opacity/clip-path; keep
60 fps on a mid-range phone. One orchestrated moment per section at most.

## 8. Mobile (designed, not shrunk)

Check 390 and 360 widths. Re-compose: stack, re-crop art, raise type, full-width
CTAs, 44 px+ targets. No horizontal page scroll (the screenshot tool reports
offenders). Horizontal scrollers only where intentional and obviously scrollable.
Don't hide the proof on mobile.

## 9. Voice and hard bans

Short, concrete, specific. Canadian spelling. Banned vocabulary: unlock, elevate,
seamless, cutting-edge, leverage, empower, "in today's digital landscape", "we
don't just…". Sparse em dashes.
**Never:** invented metrics, testimonials, awards, client logos you don't have,
named people, or prices. The owner has not chosen to be named and has not set a
price floor. Client figures are the client's — the artifact redacts them; keep it
that way. **Never:** gradients as decoration, glassmorphism, stock imagery, fake
browser chrome, bento/icon-card grids, stat banners, counters, marquees, cursor
effects, modals, exit-intent, sticky bars, chat widgets, emoji.
The Newsreader-italic headline turn: **once per page.**

## 10. Ownership, ports, prefixes (collisions = broken merge)

Touch only what you own. Every new CSS class must start with your prefix, in your
own stylesheet (already created and imported in `app/globals.css`). Do not edit
`app/globals.css`, `app/page.tsx` or shared legacy sheets.

| Agent | Owns | CSS file | Prefix | Port |
|---|---|---|---|---|
| hero-a | `components/home/v2/HeroV2.tsx` (+ any new `components/home/v2/hero-a/*`) | `v2-hero.css` | `hva-` | 3101 |
| hero-b | `components/home/v2/HeroV2B.tsx` (+ `components/home/v2/hero-b/*`) | `v2-hero-b.css` | `hvb-` | 3102 |
| proof | `GapV2.tsx`, `ProofV2.tsx` (+ `components/home/v2/proof/*`) | `v2-proof.css` | `prf-` | 3103 |
| offer | `TeardownBand.tsx`, `OfferV2.tsx`, `AutomationV2.tsx` | `v2-offer.css` | `ofr-` | 3104 |
| chrome | `components/chrome/*`, `components/CTASection.tsx` (+ `components/Shared.tsx` if needed) | `v2-chrome.css` | `chr-` | 3105 |
| trust | `ProcessStripV2.tsx`, `TrustV2.tsx`, `FinalCtaV2.tsx` | `v2-trust.css` | `trs-` | 3106 |
| teardown | `app/teardown/*`, `components/teardown/*` | `v2-teardown.css` | `tdn-` | 3107 |
| services | `app/services/page.tsx`, `app/industries/page.tsx` | `v2-services.css` | `svc-` | 3108 |
| work | `app/work/page.tsx`, `app/work/[slug]/page.tsx` | `v2-work.css` | `wrk-` | 3109 |
| contact | `app/contact/page.tsx`, `components/ContactDoors.tsx`, `components/ContactForm.tsx` (microcopy only — keep field names and the API contract), `app/process/page.tsx`, `app/studio/page.tsx` | `v2-contact.css` | `ctc-` | 3110 |

Shared and finished (use, don't rewrite): `components/figures/ReportArtifact.tsx`
(+ `app/styles/v2-report.css`, prefix `rpt-`). If you need a change to it, say so
in your report instead of editing it.

API contract (do not break): `POST /api/contact` accepts `name`, `email`,
`projectType` (must be one of the enum incl. `"Free reporting teardown"`),
`challenge` (≥ 20 chars), and optional `company`, `website`, `budget`,
`timeline`, `outcome`, `message`; honeypot field `address` must stay empty.

## 11. Report format

Under 600 words: built · what you saw and fixed per cycle (be specific) · assets
wanted (§6 format) · files changed · typecheck/lint/build results · anything you
could not resolve and why.
