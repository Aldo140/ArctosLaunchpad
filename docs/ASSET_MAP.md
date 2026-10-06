# Asset map (v4)

Every image that ships, what it is for, and why the rest don't ship.
Nothing in `public/` is unused. Retired files live in `assets-source/` (gitignored, never deployed).
Research screenshots live in `docs/redesign/` and are never served.

---

## Brand

* **Mark**: vector, in `components/brand/ArctosMark.tsx` (unchanged). The wordmark is live text.
* **`art/bridge.webp`**, plus `bridge-900.webp` for small uses: the bear building a rust bridge across three floating islands. Supplied by the studio owner on October 5, 2026 as a 1536×1024 PNG with a true alpha channel and converted to WebP with alpha. It's the hero, footer, contact and 404 image. The hero overlays an SVG deck path in the art's own coordinate space, so if the art is replaced, `DECK` in `components/site/home/BridgeHero.tsx` must be retraced.
* **`art/island-{win,run,see}.webp`**: the three islands cropped from the same master. The cut bridge edges are faded with CSS masks, never re-painted. They're used as the emblem for each part of the offer (home islands chapter, `/services`, service and Calgary heroes).
* **`v3/the-work-moves.webp`**: the bear turning scattered paper into a stack. Painted on `#02131b`, which is why `--ink-deep` exists. Used for the home studio note and the `/studio` hero.
* **`textures/contour-field.webp`**: a faint topographic layer behind the hero and inside project stages.

## Project media

Each launched project has a **recorded scroll of the live site** (`work/*-site.webm`), a **poster**
(`work/posters/*.webp`) and a **phone capture of the live site** (`work/*-phone.webp`).
The stage shows them on two depth planes. There's no drawn browser chrome.

| Project | Reel | Phone | Other |
| --- | --- | --- | --- |
| Nics Delite | `nicsdelite-site.webm` (new) | `nicsdelite-phone.webp` (new) | |
| True North Kromes | existing | `true-north-kromes-phone.webp` (new) | Lab photography: build tray and four framework close-ups |
| Calgary Watch | existing | `calgary-watch-phone.webp` (new) | `calgary-watch-map.webp` |
| Rio Alto | existing | `rio-alto-phone.webp` (new) | Two wide captures, two dish photos in the gallery, five dish photos in the specimen strip |
| So Social Collective | `so-social-collective-site.webm` (new) | `so-social-collective-phone.webp` (new) | |
| Starlings | existing | `starlings-mobile.webp` | `starlings-care-loop.webp`, `starlings-phone-in-hand.webp` |
| Vow Motion | `vow-motion-site.webm` (new) | `vow-motion-phone.webp` (new) | |
| Fresh Prep | none (internal) | none | Typeset report structure, all figures withheld |
| LeaseFlow | none (demo) | none | Typeset flow figure |

**New recordings and captures were made on October 5, 2026** from the public live sites with
Playwright: 1280×682 scroll recordings re-encoded to VP9, posters at 1280px, and phone captures at 390×844 @2.5× downscaled to 780px.
Client photography is the client's own, used as it appears on their sites.

### Considered, not used

* **Fresh Prep event photos (Google Drive)**: owned by Fresh Prep staff and not cleared for Arctos marketing.
* **Drive reports and spreadsheets**: client data, not publishable.
* **Rive**: no `.riv` files on disk or in Drive, and no Rive connector. Nothing depends on Rive.

## Studio

`studio/arctos-wall-materials.webp`: concrete, paper and fabric with a pinned note reading *Systems / Clarity / Growth*. Used once, on `/studio`.

## Retired in v4 (moved to `assets-source/retired/v3-public/`)

| Asset | Why |
| --- | --- |
| `illustrations/*` roundels | Badge-style circles at small scale. They read as clip art beside the bridge. The bridge and the work-moves piece carry the character now. |
| `chapters/*` torn-paper canvases | The four-stage chapter story was replaced by the three-island structure. |
| `figures/*`, other `textures/*` | Only used by v3 components that were removed. |

v3 work-in-progress that was uncommitted when v4 started (`LaunchHero`, `StudioHome`, `launch-hero.css`)
is kept at `assets-source/retired/v3-wip/` for reference.

Earlier retirements (stock bears, the old lockup, stale stationery, cluttered lab snapshots) still stand.

---

## v4.1 section pass (October 6, 2026)

Fifteen section agents each pushed one section or page further. Assets they added:

| Folder | Source | Used on |
| --- | --- | --- |
| `work/nicsdelite/*.webp` (12) | `nicsdelite/public/images/cakes/`: the client's own cake photography. Photos with people and character or brand cakes were left out. | Nics Delite case study filmstrip |
| `work/so-social-collective/*.webp` (9) | `so-social-collective-web/public/photos/`: only images listed in that site's own media library, with alt text taken from it | So Social case study |
| `work/calgary-watch/*.webp` (8) | `Calgary-Watch-main/public/images/{hero,illustration,quadrant}` | Calgary Watch case study |
| `work/vow-motion/*.webp` (8) | `vow-motion/public/images/`: the product's six "worlds" plus two detail images | Vow Motion case study |
| `art/studio-note/{gear,pulley}-*.webp`, `studio/{gear,pulley}-*.webp` | Circular cut-outs from `v3/the-work-moves.webp` | Gears and pulleys that turn, on home and /studio |
| `studio/principles/*.webp` (6) | Retired roundel illustrations (`assets-source/retired/v3-public/illustrations/`) | /studio principle cards |
| `process/survey-contours.webp` | Retired `figures/survey-contours.webp` | /process hero |

Everything else new is hand-authored SVG or CSS: the bridge builds, Calgary line drawings, generated industry terrain, and the redacted report and flow figures.

### Not referenced by any page (found, not created in this pass)

`art/{bridge-keystone,growth-gateway,paper-fibres,reporting-observatory,software-builder,workflow-loop}.webp`,
`art/{connection-mark,route-divider}.svg`, `v3/connected-workshop.webp`, `lib/brand-art.ts`.
They were created around 20:15–20:22 on October 5 by another process. They are kept as found and need an owner decision: use them or retire them.
