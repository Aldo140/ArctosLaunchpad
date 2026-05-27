# Landing Page Redesign — Arctos Launchpad
**Date:** 2026-05-27  
**Status:** Approved

---

## Overview

Full rework of the Arctos Launchpad landing page. Every design template, font, color token, and layout pattern is replaced. The new direction is **Bold & Confident** — the sunglasses polar bear mascot leads, imagery is used purposefully at emotional beats, and the design avoids every "AI slop" pattern (Space Grotesk, generic Tailwind blue, floating cards on dark backgrounds with no photographic weight).

---

## Typography — Full Replacement

| Role | Font | Details |
|------|------|---------|
| Display / H1–H3 | `Syne` | Geometric, architectural, not on overused lists. Bold at large sizes. Load via Google Fonts. |
| Body | `DM Sans` | Clean, slightly soft, readable at 13–16px |
| Mono / labels / eyebrows | `IBM Plex Mono` | Unchanged from current |

**Remove entirely:** Space Grotesk (overused/slop per taste-skill).

Font load in `index.html`:
```
Syne:wght@400;500;600;700;800
DM+Sans:ital,wght@0,300;0,400;0,500;1,300
IBM+Plex+Mono:wght@400
```

CSS: `--font-display: 'Syne', system-ui, sans-serif` / `--font-body: 'DM Sans', system-ui, sans-serif`

---

## Color Palette — Full Replacement

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#080A0F` | Page base — cooler, bluer dark |
| `--bg-1` | `#0C0F18` | Card / section surfaces |
| `--bg-2` | `#111827` | Elevated surfaces |
| `--accent` | `#2563FF` | CTA, active states, highlights — electric, distinctive |
| `--accent-dim` | `rgba(37,99,255,0.07)` | Subtle tinted surfaces |
| `--accent-glow` | `rgba(37,99,255,0.22)` | Glow effects |
| `--ink` | `#F5F7FF` | Primary text — cool white, icy |
| `--ink-2` | `#8B9CB8` | Secondary text — blue-tinted gray |
| `--ink-3` | `#3D5275` | Tertiary / muted — steel blue |
| `--border` | `rgba(255,255,255,0.06)` | Subtle dividers |
| `--border-2` | `rgba(255,255,255,0.11)` | Stronger borders |

**Remove:** `--glacier`, `--frost`, `--zinc`, `--cyan` legacy aliases. Keep `--ease` and `--ease-out-expo`.

---

## Assets — What Gets Used Where

All assets are in `/public/`. External logo URL (`image2url.com`) is removed entirely.

| Asset | Where used |
|-------|-----------|
| `/logo-no-text-2.png` | Nav logo, footer logo — sunglasses bear, no text |
| `/website-landing.png` | Hero right-side — bear on rocky outcrop, bold, ~65% viewport height |
| `/bakcground-mountains.webp` | Hero background texture at **7% opacity** |
| `/social-post-1.png` | Trust/Proof section — full-width CN Tower background |
| `/header-for-socials.png` | Contact section — full-bleed section background |
| `/starlings-landing-desktop.webp` + mobile | Portfolio card — Starlings |
| `/calgarywatch-landing-desktop.webp` + mobile | Portfolio card — Calgary Watch |
| `/rioalto-landing-page-mobile.webp` + desk | Portfolio card — Rio Alto |
| `/mruhacks-landing-desktop.webp` + mobile | Portfolio card — MRU Hacks |

---

## Section-by-Section Spec

### § 01 — Nav

- Logo: `/logo-no-text-2.png` at 36px height, local file, replaces external URL
- Logo text: "ARCTOS LAUNCHPAD" in IBM Plex Mono, 10px, tracking-[0.2em]
- Nav links: unchanged (Systems, Work, Contact)
- CTA button: "Start Your Infrastructure" — accent bg, white text
- Scroll glass behavior: unchanged (dark frosted panel appears on scroll)

### § 02 — Hero

**Layout:** Full viewport height, flex column, justify-between.

**Background:**
- Base: `--bg` solid
- Layer: `/bakcground-mountains.webp` absolutely positioned, full cover, `opacity: 0.07` — barely visible, more texture than image. No blur.

**Left column (50% desktop, 100% mobile):**
- Eyebrow pill: "Enterprise Digital Infrastructure · Canada" — IBM Plex Mono, accent dot, border pill
- H1 line 1: "Less chaos." — Syne, `font-weight: 800`, `font-size: clamp(4rem, 9vw, 10rem)`, `letter-spacing: -0.03em`, `--ink`
- H1 line 2: "Better systems." — same size, `color: --accent`
- Subtext: "ARCTOS LAUNCHPAD engineers custom operational platforms, AI workflows, and digital infrastructure for Canadian enterprises. You own everything we build — forever." — DM Sans 16px, `--ink-2`
- CTAs: "Engineer Your Future →" (accent filled) + "View Systems" (ghost border)

**Right column — bear image:**
- `/website-landing.png` — `position: absolute`, right: 0, bottom: 0
- Width: `clamp(420px, 50vw, 780px)` — bold, fills right half
- Anchored to bottom-right, bleeds ~20px off bottom edge
- `mix-blend-mode: multiply` — removes the white PNG background on the dark page; bear's cool-blue facets blend cleanly with `--bg`
- No border, no container, no shadow
- On mobile: hidden (too cramped)

**Stats strip (bottom, above bear):**
- Left-aligned, small flex row: 50+ Systems / 99.9% Uptime / 100% Ownership
- Syne for values (large, `--accent`), IBM Plex Mono for labels

### § 03 — Marquee

- Same items: Custom Infrastructure · AI Automation · Data Sovereignty · Enterprise Systems · Canadian Technology · Full Ownership
- Font: Syne italic 400 — larger than current (`clamp(2rem, 4vw, 3.5rem)`)
- Separator: `·` in `--accent`
- Border-y: `--border`

### § 04 — Systems Section

Layout and data unchanged. Restyle:
- Numbers: Syne 300, large (`clamp(3.5rem, 6vw, 5rem)`), `--ink-3` default → `--accent` on hover
- Titles: Syne 600, `clamp(1.75rem, 3.5vw, 2.25rem)`
- Descriptors: DM Sans 13px, `--ink-2`
- Tag pills: IBM Plex Mono 9px
- Hover: row bg `--bg-1`, title shifts right 8px, accent bottom border

### § 05 — Why Custom Section

Layout (two-column comparison) and data unchanged. Restyle with new tokens:
- Left panel (Subscription Trap): `--bg-1` bg
- Right panel (Arctos Way): `rgba(37,99,255,0.06)` bg, `rgba(37,99,255,0.12)` border
- Animated counter: unchanged logic
- Headings: Syne, body: DM Sans

### § 06 — Workflow Section

Layout (4-col desktop, vertical mobile) and data unchanged. Restyle:
- Step numbers: Syne 300, `--ink-3`
- Titles: Syne 600
- Body: DM Sans 13px light
- Accent draw-in line: unchanged animation

### § 07 — Portfolio / Work Section (Major Rework)

**Card design — image-dominant:**
- Each card: the project screenshot fills the ENTIRE card as `background-image`, `background-size: cover`, `background-position: top center`
- Minimum card height: `320px` desktop, `260px` mobile
- **Persistent bottom strip** (always visible, ~88px tall): semi-transparent dark panel (`rgba(8,10,15,0.82)`, `backdrop-filter: blur(8px)`) pinned to card bottom containing:
  - Project type: IBM Plex Mono 8px uppercase `--ink-3`
  - Project name: Syne 600 `--ink`, `clamp(1.25rem, 2vw, 1.5rem)`
  - "View →" link: IBM Plex Mono 9px `--ink-2` → `--accent` on hover
- **On hover:** full dark overlay (`rgba(8,10,15,0.7)`) fades in over image; description text + tags slide up from below the persistent strip
- Bento grid: featured[0] = `lg:col-span-7`, featured[1] = `lg:col-span-5`, others = `lg:col-span-6`
- Grid gap: `1px`, grid bg: `--border` (hairline separators)

### § 08 — Trust / Proof Section (Major Rework)

**Full-width photographic moment:**
- `/social-post-1.png` (Toronto CN Tower night skyline) as full-width section background
- Section height: `min-height: 70vh`
- Dark gradient overlay: `linear-gradient(to bottom, rgba(8,10,15,0.55) 0%, rgba(8,10,15,0.75) 60%, rgba(8,10,15,0.95) 100%)`
- Over the image:
  - Eyebrow: "05 / Proof" — IBM Plex Mono
  - Headline: "Built to scale." / "Built in Canada." — Syne 800, `clamp(3.5rem, 7vw, 8rem)`, white
- **Bottom strip** (over darkest part of gradient): 3 proof points in a flex row
  - Each: large value in Syne `--accent`, label in IBM Plex Mono
  - Values: `99/100` · `3–12 wks` · `$0/yr`

### § 09 — FAQ Section

Structure unchanged. Restyle:
- Section heading: Syne
- Question text: DM Sans medium
- Answer text: DM Sans 14px light `--ink-2`
- Expand/collapse: same accordion behavior

### § 10 — Contact Section

**Background:** `/header-for-socials.png` as a full-bleed background on the top heading area (approx top 50% of section), with same dark gradient overlay treatment as Trust section.

**Layout:** 2-column grid (heading left, form right) — unchanged structure.
- Heading: Syne, "Engineer your / operational future."
- Subtext: DM Sans
- Form: unchanged `ContactForm` component, restylled inputs with new tokens

### § 11 — Footer

- `/logo-no-text-2.png` at 48px height — larger than current
- "ARCTOS LAUNCHPAD" IBM Plex Mono next to it
- Tagline: DM Sans light
- Nav links: IBM Plex Mono 10px
- © line: unchanged

---

## Animations — Unchanged

All existing Framer Motion animations (slide-up on viewport entry, marquee, scroll indicator, chapter indicator, scramble text) are preserved. Only fonts/colors/layout change.

The Emil Kowalski principle applies: animations should feel inevitable, not decorative. No new animations are added — the existing ones are already purposeful.

---

## Mobile Behavior

- Hero: bear image hidden on mobile (`hidden sm:block` on the image container). Full-width text layout.
- Portfolio cards: image-dominant cards keep persistent bottom strip on mobile. Hover overlay becomes a tap-to-reveal interaction (toggled on tap).
- Trust section: CN Tower background scales, text remains readable.
- Contact: single-column stack.

---

## Files Changed

| File | Change |
|------|--------|
| `index.html` | Replace Google Fonts link (add Syne, DM Sans; remove Space Grotesk) |
| `index.css` | Full token replacement, font aliases, remove legacy aliases |
| `App.tsx` | Logo src → local, hero layout, portfolio cards rework, trust section rework, contact background |
| `components/HeroSection.tsx` | New layout: mountain bg + bear image + new copy |
| `components/SystemsSection.tsx` | Font/color token restyle only |
| `components/WhyCustomSection.tsx` | Font/color token restyle only |
| `components/WorkflowSection.tsx` | Font/color token restyle only |
| `components/TrustSection.tsx` | Full rework with CN Tower background |

---

## What Does NOT Change

- All site content / copy (except hero headline)
- Component architecture
- Framer Motion animation logic
- ContactForm, AIChat, FaqSection, CustomCursor, FluidBackground component logic
- Lenis + GSAP scroll hook
- Routing / nav scroll behavior
- Responsive breakpoints (md: 768px, lg: 1024px)
