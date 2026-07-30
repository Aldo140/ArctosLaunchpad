# Arctos Launchpad

Marketing site for a Calgary digital growth and technology studio.

Next.js 16 (App Router) · React 19 · TypeScript · GSAP · Zod

---

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

Node 20.9+.

## Environment

Copy `.env.example` to `.env.local`.

| Variable                     | Required | Purpose                                                        |
| ---------------------------- | -------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`       | no       | Canonical origin for metadata, sitemap, and OG images. Defaults to `https://arctoslaunchpad.com`. |
| `CONTACT_WEBHOOK_URL`        | no       | Where `/api/contact` forwards enquiries. **Without it, in production the route rejects the submission rather than silently discarding it.** In development it logs to the server console instead. |

No secrets are read on the client. `.env.local` is gitignored.

---

## Where things live

```
app/
  tokens.css      the only file allowed to contain a hex value
  base.css        reset, typography, primitives, accessibility
  chrome.css      header, menu, survey rule, loader, footer
  home.css        homepage compositions
  pages.css       interior page vocabulary
  globals.css     import manifest only
  fonts.ts        next/font — Newsreader, Archivo, IBM Plex Mono
lib/
  content.ts      all copy and project data. Single source of truth.
  seo.ts          metadata builders and JSON-LD schema
  useMedia.ts     media-query + scroll hooks via useSyncExternalStore
components/
  brand/          ArctosMark (vector), ArctosLockup
  home/           hero diagram, chapter stages, journey, work showcase, motion
docs/
  ASSET_MAP.md    every image, why it ships, why the rest do not
  RESEARCH.md     competitor and credibility research
  SEO.md          what the SEO pass changed and what it deliberately did not
DESIGN-SYSTEM.md  binding contract — read before changing any UI
```

`assets-source/` holds retired assets and unshipped masters. Gitignored, never deployed.

---

## Routes

| Route                            | Notes                                    |
| -------------------------------- | ---------------------------------------- |
| `/`                              | Homepage                                 |
| `/services`, `/services/[slug]`  | 9 service pages from `servicePages`       |
| `/work`, `/work/[slug]`          | 6 case studies from `projects`            |
| `/industries`, `/industries/[slug]` | 10 industry pages                      |
| `/process` `/studio` `/contact`  |                                          |
| `/calgary-web-design`, `/calgary-business-automation`, `/calgary-custom-software` | Local landing pages sharing the `LocalBrief` template |
| `/privacy` `/accessibility`      | Policy documents                          |
| `/og`                            | Dynamic Open Graph image                  |
| `/sitemap.xml` `/robots.txt`     | Generated                                 |

Adding a service, project, or industry means adding a record to `lib/content.ts`. The route, sitemap entry, and schema follow automatically.

---

## The two materials

Every section declares `data-material="paper"` or `"instrument"`, plus a
`data-station` label for the survey rule and an optional `data-chapter` accent.
Components read neutral aliases (`--bg`, `--fg`, `--rule`, `--accent`) that
resolve per material, so a section inverts by changing one attribute.

The fixed chrome deliberately does **not** invert. An earlier version mirrored
each section's material onto the header; with four chapter stages and
alternating interior sections it fired constantly and read as flashing. The
header and survey rule now hold one identity and only the accent follows the
page.

Full rules in `DESIGN-SYSTEM.md`.

---

## Motion

**Three gestures, site-wide. Nothing else is allowed.** They come from how the
artwork is made, not from a scroll library — which is what keeps the motion
reading as part of the design rather than applied on top of it.

| Gesture | What it is                              | Used for                                   |
| ------- | --------------------------------------- | ------------------------------------------ |
| DRAW    | a line extends from its origin          | rules, ticks, brackets, plotted figures     |
| WIPE    | a plate is laid down                    | images, video, specimen frames              |
| SET     | type resolves in place                  | everything else                             |

**Nothing translates on entry.** A heading that slides up 20px is the generic
scroll-reveal signature and belongs to no part of this brand; a heading that
resolves while its rule draws beneath it belongs to a drawing board. Hover and
press feedback still moves — that is response, not entrance.

Timings live in `tokens.css` (`--dur-draw`, `--dur-wipe`, `--dur-set`,
`--ease-draw`, `--ease-set`, `--stagger`) and are read by both CSS and GSAP, so
there is one source of truth. The `.tick-label` rule opens nearly every section
and draws itself, which makes it the entrance the whole site shares.

GSAP is reserved for sequences where order carries meaning:

- `components/home/ArctosDiagram` — the mark plotted as a survey drawing
- `components/home/JourneyDiagram` — the lead route draws, a signal runs it once
- `components/home/ChapterMotion` — canvas parallax, chapter titles rise from a mask
- `components/home/HomeMotion` — the automation ledger strikes out the manual work
- `components/PlottedFigure` — one drawn figure per interior page
- `.reveal` — opacity-only entrance via IntersectionObserver in `ChromeSync`

Everything sits inside `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`,
so the tweens are never created for anyone who asked for stillness.

`.reveal` is gated behind `:root.js`, set by a blocking script before first
paint. **Do not remove that gate** — without it the page is blank if JS fails.

---

## Verified

- `tsc --noEmit` and `eslint` clean; `next build` generates all 43 routes
- No horizontal overflow at 320 / 390 / 430 / 768 / 1024 / 1280 / 1440
- One `<main>` and one `<h1>` per page
- Loader shows once per session, skipped under reduced motion, no layout shift
- Mobile menu: focus trap, Escape to close, scroll lock, focus returns to trigger
- Reduced motion: no reveals stuck hidden, no video playback, no transforms

## Content rules

Canadian spelling. No invented metrics, testimonials, clients, awards,
certifications, partnerships, or postal address. No `AggregateRating` schema.
Project facts come from `lib/content.ts` — if a fact is not there, it does not
go on the page.
