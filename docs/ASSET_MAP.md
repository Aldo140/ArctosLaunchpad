# Asset map

Every image that ships, what it is for, and why the rest do not ship.

Nothing in `public/` is unused. Anything retired lives in `assets-source/`,
which is gitignored and never deployed.

---

## Brand

The mark is **vector, not raster**. `components/brand/ArctosMark.tsx` holds
three traced paths — the triangle frame with its sweep, the bear head in
profile inside it, and the star above the apex — recovered from the brand
master with a marching-squares trace.

That means the mark is crisp at any size, recolours with the material, weighs
about 5 KB, and can be animated as line art. The hero's plotter-draw and the
CTA watermark are the same three paths at different scales.

| Size            | Variant           | Why                                                              |
| --------------- | ----------------- | ---------------------------------------------------------------- |
| >= 64px         | `detail="full"`   | The bear head reads as a monogram                                  |
| < 64px          | `detail="simple"` | Below this the head and sweep collide into a smudge                |
| Watermark scale | `detail="simple"` | At plate scale the head stops reading as a monogram and starts reading as a picture of an animal |

The wordmark is **live text** (`ArctosLockup`), not an image — sharp,
selectable, translatable, and readable by search engines.

---

## Chapter canvases

`public/assets/chapters/{attract,convert,operate,scale}.webp` — 1536x1024.

Torn-paper collage with topographic contours and technical marks, one accent
per stage. The strongest owned asset in the repo, and the only place collage
appears.

Each is composed with a **large clear paper field**. Type is set into that
field, never over the torn edges. The `--attract` / `--convert` / `--operate` /
`--scale` tokens were sampled directly from these files, so the UI accent and
the printed canvas are the same colour rather than an approximation.

> **Fixed:** `operate.webp` and `scale.webp` were swapped on disk — the file
> named `operate` was the green canvas and `scale` was the orange one, the
> reverse of the colour spec. Renamed to match.

---

## Project media

### Lead with these

| Asset                               | Role                                             |
| ----------------------------------- | ------------------------------------------------ |
| `work/*-site.webm` (x4)             | Recorded scroll through each live site. The strongest proof the studio owns, and previously unused. Plays only while on screen and only when motion is welcome. |
| `work/starlings-phone-in-hand.webp` | A real photograph of the real build on a real desk. The most credible single image in the archive. |
| `work/{calgary-watch,starlings,rio-alto,true-north-kromes}.webp` | Site hero captures. Poster frames for the recordings. |

**No fake browser chrome.** A drawn window frame around a real screenshot adds
a layer of pretend to something that is already true.

### Use cropped, at specimen scale

These are honest phone photography from the client sites. Full-bleed they read
as phone snapshots; cropped into a measured strip with a mono caption they read
as evidence, and their colour and texture carry instead of their resolution.
Rendered through `SpecimenStrip` and the work showcase plate rails.

- `work/true-north-kromes/*.webp` — cobalt-chrome frameworks on dental models
  and a build tray. Chrome on bone-white against a dark ground; genuinely
  distinctive, almost jewellery.
- `work/rio-alto/*.webp` — the restaurant's own dishes and bakery. Bold,
  graphic colour that belongs to the client rather than to a stock palette.
- `work/starlings-care-loop.webp`, `work/starlings-mobile.webp`,
  `work/calgary-watch-map.webp`, `work/rio-alto-{menu,story}.webp` — interface
  detail.

---

## Studio

`public/assets/studio/arctos-wall-materials.webp` — concrete, paper, fabric,
plant shadow, and a pinned note reading *Systems / Clarity / Growth*. The only
studio photograph, so it is used deliberately and never repeated.

---

## Retired — do not resurrect

Moved to `assets-source/retired/`. Each was removed for a stated reason, not
for taste.

| Asset | Why |
| --- | --- |
| `bear.webp`, `bear-cutout.png`, `bear-gold.{png,webp}` | Photoreal stock polar bear. The brief rules out "giant polar bears" and the outdoor-apparel read. The mark already contains a bear, abstracted — that is the only bear. |
| `selected-work-bear.webp` | Stock cartoon vector with the headline **baked into the raster**. Unreadable to screen readers and search engines, unresponsive, and off-brand. |
| `old-bear-lockup.png` | Superseded navy bear wordmark. Replaced by the triangle mark. |
| `arctos-stationery.webp` | Good photograph, but it photographs the retired logo, so it went stale with the rebrand. |
| `true-north-kromes-{lab,detail}.webp` and `true-north-kromes/{digital-design-workstation,finishing-benches,production-floor,resin-production-workbench,slm-production-station}.webp` | Fluorescent phone snapshots of an office and cluttered benches. Honest, but they cheapen a premium studio. The product macros from the same shoot are kept. |
| `rio-alto/{dessert-pass,full-course,coffee-and-sweetbread}.webp` | Dark, cluttered, or soft. The stronger plates from the same set are kept. |

## Unshipped masters

`assets-source/masters/` holds the four chapter PNGs, the True North Kromes
PNG, and the logo master — about 20 MB that was previously sitting in `public/`
and deploying on every build despite nothing referencing it.

`public/` went from **28 MB to 8.3 MB**.
