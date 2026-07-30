# Arctos Launchpad — design system contract

**Read this fully before changing any UI. It is binding.** If a change would
break a rule here, do not make the change; note it instead.

---

## 1. The concept

The site is built from **two materials that never blend**:

| Material     | What it is                                | Where it appears                              |
| ------------ | ----------------------------------------- | --------------------------------------------- |
| `paper`      | The field guide. Warm, torn, printed.     | Chapter stages, studio, selected pull sections |
| `instrument` | The screen. Black, precise, luminous.     | Hero, work, systems, data, most interiors      |

The tension between them *is* the brand. Alternating them is the primary
compositional tool. A page that is all one material is usually a page that has
not been designed yet.

Every section declares one:

```tsx
<section className="section" data-material="instrument" data-station="Work">
```

- `data-material` — `"paper"` | `"instrument"`. **Required on every section.**
- `data-chapter` — `"attract"` | `"convert"` | `"operate"` | `"scale"`. Optional.
  Sets `--accent` for that subtree.
- `data-station` — short label. Feeds the survey rule in the left gutter.
  Required on top-level sections.

`components/ChromeSync.tsx` mirrors the material of whatever sits under the
header onto `<body>`, so the fixed header and survey rule invert automatically.
**Do not give the header or rule fixed colours.**

---

## 2. Colour — never hard-code one

`app/tokens.css` is the only file allowed to contain a hex value.

Everything else uses the neutral aliases, which resolve per material:

| Token             | Use                                        |
| ----------------- | ------------------------------------------ |
| `--bg`            | Section ground                             |
| `--bg-raised`     | Cards, inset panels, media wells           |
| `--fg`            | Primary text                               |
| `--fg-dim`        | Body copy, secondary text                  |
| `--fg-faint`      | Captions, folios, disabled                 |
| `--rule`          | Hairlines                                  |
| `--rule-strong`   | Emphasised hairlines, input borders        |
| `--accent`        | Interactive + chapter accent               |

Chapter accents were **sampled from the collage artwork itself**, so UI accent
and printed canvas are the same colour. Do not "improve" them.

Aim for ~75–80% neutral. Accent is for one thing at a time.

---

## 3. Type — three voices

| Variable          | Face          | Role                                              |
| ----------------- | ------------- | ------------------------------------------------- |
| `--font-ui`       | Archivo       | Instrument voice. Nav, body, buttons, UI, headlines |
| `--font-display`  | Newsreader    | Paper voice. Chapter names, pull quotes, the italic turn |
| `--font-mono`     | IBM Plex Mono | Annotation. Folios, coordinates, captions, eyebrows |

Archivo carries a **width axis** — use `font-stretch` (88–96%) for hierarchy,
not just size. That is a deliberate part of the system.

Classes: `.t-hero .t-display .t-title .t-paper .t-quote .t-lead .t-body
.t-label .t-folio`

**The signature type move:** one phrase per headline drops into Newsreader
italic via `<em>`. Two typefaces, one line — the two halves of the studio said
typographically.

```tsx
<h2 className="t-display">More leads should not mean <em>more administrative work.</em></h2>
```

Use it once per headline. Never twice.

---

## 4. Existing vocabulary — compose, don't invent

Before writing a new class, check whether one of these fits:

**Layout** `.shell` `.section` `.section--tight` `.section--flush`
**Text** `.tick-label` `.rule` `.link` `.btn` `.btn--ghost` `.btn--small`
**Document** `.masthead` `.crumbs` `.doc__head` `.doc__split` `.doc__cols`
`.doc__aside` `.doc__outcomes`
**Lists** `.ledger` `.archive` `.numbered` `.steps` `.chips` `.chips--large`
`.register` `.faq`
**Media** `.specimen` `.proof__gallery` `.plate` `.reel-figure`

Components: `PageHeader`, `CTASection`, `SpecimenStrip`, `ProjectFeature`,
`ProjectReel`, `ArctosMark`, `ArctosLockup`, `LocalBrief`, `Register`.

New CSS goes in the matching sheet: `app/home.css` (homepage) or
`app/pages.css` (interiors). Never inline `<style>`. Never a new global reset.

---

## 5. Spacing and rhythm

Only `.section` sets vertical rhythm (`--section-y`). Do not add
`padding-block` or `margin-top` to compete with it — that is exactly how the
previous stylesheet became 3,240 lines of selectors cancelling each other out.

Scale: `--s1` (4px) through `--s10` (128px). No arbitrary `rem` values.

---

## 6. Motion

GSAP + ScrollTrigger are available (`gsap`, `@gsap/react`). Use them for
orchestrated, meaningful moments. Use CSS for everything simple.

- `.reveal` — one-shot entrance, driven by the observer in `ChromeSync`.
  It is gated behind `:root.js`, so content stays visible without JS.
  **Never remove that gate.**
- **Interiors are opt-in.** `.interior-document` arrives complete by default —
  a case study or industry brief should be readable the instant it paints. The
  four narrative routes (Services, Work, Process, Studio) set
  `data-motion="staged"` on their wrapper to get the gestures back, because on
  those pages the motion carries the argument. `ChromeSync` and `pages.css`
  both read that attribute; **change them together or content will render
  invisible.** The shared `CTASection` is excluded on every interior.
- Scroll-linked geometry is driven through custom properties (`--run`,
  `--lit`, `--fill`) whose CSS defaults are the *finished* state, so no JS means
  a complete page rather than a blank one. Never default them to zero.
- Motion must not cost legibility. Dimming un-reached content below 4.5:1 to
  make a point is a bug, not a device — carry progress on rules and marks.
- Motion must explain sequence or causality. No floating blobs, no
  cursor-followers, no scroll hijacking, no animated gradient backgrounds.
- Everything must be silent under `prefers-reduced-motion: reduce`. Test it.
- Videos: play only while on screen, muted, `playsInline`, `preload="none"`.

The hero's plotter-draw of the Arctos mark is the reference for tone —
purposeful, technical, once.

---

## 7. Imagery — hard rules

**Never use:** the photoreal polar bear (retired to `assets-source/retired/`),
stock cartoon illustration, AI landscapes, aurora, mountains-as-decoration,
fake browser chrome around real screenshots, text baked into a raster, glowing
flowcharts, glassmorphism, neon gradients, 3D blobs.

The mark already contains a bear, abstracted. That is the only bear.

`ArctosMark` at **64px and above** shows the bear head. Below that, and for any
watermark or large decorative use, pass `detail="simple"` — at plate scale the
head stops reading as a monogram and starts reading as a picture of an animal.

**Asset tiers** (see `docs/ASSET_MAP.md`):

- **Lead with:** the four `.webm` site recordings, `starlings-phone-in-hand`,
  the four chapter collages, the four site hero captures.
- **Use cropped, at specimen scale:** True North Kromes chrome macros, Rio Alto
  food. These are honest phone photography — they read as evidence in a
  measured strip and as amateur snapshots at full bleed. Use `SpecimenStrip`.
- **Retired, do not resurrect:** anything in `assets-source/retired/`.

Chapter collages are composed with a large clear paper field. Set type **into**
that field, never over the torn edges.

---

## 8. Accessibility — non-negotiable

Target WCAG 2.2 AA.

- Semantic landmarks. **Exactly one `<main>`**, in `app/layout.tsx`. Pages
  return fragments, never their own `<main>`.
- Heading order never skips. One `<h1>` per page.
- Visible focus (`:focus-visible` is defined globally — do not override it away).
- Body copy on paper must clear 4.5:1. `--fg-dim` on a busy collage often does
  not — check it rather than assuming.
- Decorative images: `alt=""`. Meaningful images need real alt text.
- Interactive targets ≥ 44px on touch.
- No hover-only affordances.

---

## 9. Responsive

Test 1440 / 1280 / 1024 / 768 / 430 / 390 / 320.

Mobile is not the desktop layout compressed. Horizontal sequences become
vertical. Decorative detail is dropped, not shrunk. Type stays readable. The
survey rule is replaced by a hairline progress bar below 1024px. No horizontal
scroll at any width — wide content scrolls inside its own container.

---

## 10. Content

Canadian spelling. Short, specific sentences. Sparse em dashes.

**Never invent** metrics, testimonials, clients, awards, certifications,
partnerships, review counts, or an office address. No `AggregateRating` schema.
No "award-winning", "best-in-class", "cutting-edge", "unlock your potential".

Project facts come from `lib/content.ts`. If a fact is not there, it does not
go on the page.

CTAs say what happens: "Start a project", not "Begin the journey".

---

## 11. Definition of done

- [ ] `npx tsc --noEmit` clean
- [ ] `npx eslint .` clean
- [ ] `npx next build` succeeds
- [ ] No hard-coded colours outside `tokens.css`
- [ ] Every section has `data-material` and `data-station`
- [ ] Checked at 1440 and 390; no horizontal scroll
- [ ] Checked with `prefers-reduced-motion: reduce`
- [ ] Keyboard reachable, focus visible
