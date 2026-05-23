# ARCTOS LAUNCHPAD — Glacier Blue Full Rebrand
**Date:** 2026-05-23
**Approach:** B — Full glacier blue design system migration
**Status:** Approved

---

## Goal

Migrate the current acid-green/near-black implementation into the full glacier blue + deep navy design system specified in the arctos-designer agent guidelines. Apply all copy/messaging guidelines from `copy-messaging.instructions.md` across every section. The result must feel like Stripe + Linear + Framer built by a Canadian infrastructure company.

---

## Color System

Replace all acid-green tokens with glacier blue equivalents.

### `index.css` — CSS Custom Properties

| Token | Old Value | New Value | Purpose |
|---|---|---|---|
| `--bg` | `#09090A` | `#0f1419` | Primary background — deep navy |
| `--bg-1` | `#0F0F11` | `#070d14` | Section backgrounds |
| `--bg-2` | `#181819` | `#0d1520` | Cards, panels |
| `--ink` | `#EDE8DF` | `#ffffff` | Primary text |
| `--ink-2` | `#696560` | `#a1a1aa` | Secondary text |
| `--ink-3` | `#37352F` | `#52525b` | Muted text / structural |
| `--acid` | `#C8F135` | `#3b82f6` | Primary accent — glacier blue |
| `--acid-dim` | `rgba(200,241,53,0.06)` | `rgba(59,130,246,0.06)` | Subtle tint |
| `--acid-glow` | `rgba(200,241,53,0.18)` | `rgba(59,130,246,0.20)` | Glow effect |
| `--border` | `rgba(237,232,223,0.06)` | `rgba(255,255,255,0.07)` | Structural borders |
| `--border-2` | `rgba(237,232,223,0.11)` | `rgba(255,255,255,0.12)` | Elevated borders |
| `--glacier` | `#C8F135` (alias) | `#3b82f6` | Canonical glacier blue |
| `--glacier-glow` | `#D4F550` (alias) | `#60a5fa` | Glacier light |
| `--frost` | `#EDE8DF` | `#bae6fd` | Frost text (display only) |
| `--zinc` | `#37352F` | `#3f4651` | Panel borders |
| `--accent` | `#C8F135` | `#3b82f6` | Legacy alias |
| `--cyan` | — | `#06b6d4` | Arctic cyan (hover states) |

---

## Typography

Replace Cormorant Garamond with Space Grotesk for all headings. Replace Manrope with Inter for body.

### Google Fonts import (`index.html`)

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

### `index.css` — Font stacks

```css
h1, h2, h3, h4, h5, h6, .font-heading {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.05;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
}

.font-mono {
  font-family: 'IBM Plex Mono', monospace;
}
```

---

## Shadow / Depth System

Add glacier glow shadow class to `index.css`:

```css
.glow-glacier {
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.20);
}
.glow-glacier-hover:hover {
  box-shadow: 0 0 40px rgba(59, 130, 246, 0.30);
}
```

---

## Component-by-Component Changes

### Nav (`App.tsx`)

- Logo scramble text: keep
- Scroll panel: currently animates to a white background. Change to `rgba(15,20,25,0.92)` with `backdrop-filter: blur(12px)` — dark frosted glass instead of white. Bottom border becomes `rgba(255,255,255,0.08)`.
- Logo `filter: brightness(0)` on scroll: remove (logo is already light, no invert needed on dark bg)
- Nav link color on scroll: change from `rgba(9,9,10,0.55)` to `#a1a1aa` (matches `--ink-2`)
- CTA button bg on scroll: change from `#09090A` to `var(--glacier)`, text stays `#ffffff`
- Nav link hover: `color: var(--glacier)` instead of acid
- CTA button default: `background: var(--glacier)`, `color: #ffffff`
- Selection text: change `selection:text-[#09090A]` → `selection:text-white` (glacier blue bg needs white text)

### HeroSection (`components/HeroSection.tsx`)

**Copy:**
- Badge: `● Enterprise Digital Infrastructure · Canada` (keep)
- H1 lines: `"We build the systems"` / `"behind modern"` / `"businesses."` — the italic last word switches to `color: var(--glacier)` instead of acid
- Subhead: update to use operational language per messaging guide
- CTA: `"Engineer Your Future"` (primary) | `"View Our Systems"` (secondary)
- Stats: keep values, labels stay operational

**Visual:**
- Dot-grid pattern: `rgba(59,130,246,0.05)` instead of warm tone
- Outlined circle: `rgba(59,130,246,0.06)` border
- Stats strip: glacier accent on values, `color: var(--glacier)`
- Scroll indicator line: glacier blue

### SystemsSection (`components/SystemsSection.tsx`)

**Color tokens (inline `T` object):**
- `T.bg1 → '#070d14'`
- `T.ink → '#ffffff'`
- `T.ink2 → '#a1a1aa'`
- `T.ink3 → '#52525b'`
- `T.acid → '#3b82f6'`
- `T.border → 'rgba(255,255,255,0.07)'`
- `T.border2 → 'rgba(255,255,255,0.12)'`

**Hover state:** Acid bottom border → glacier blue bottom border. Number color on hover: `#3b82f6`. CTA button: glacier blue bg.

**Copy:**
- Section heading: `"Built for the way modern operations run."` (keep, strong)
- Service 01: `"Custom Operational Systems"` — descriptor: `"Hand-built React/Next.js infrastructure. Zero platform rent. Full source ownership."`
- Service 02: `"Platform Hybrid"` — descriptor: `"Wix Studio / Webflow for teams needing daily content control without sacrificing craft."`
- Service 03: `"Application Systems"` — descriptor: `"Dashboards, booking engines, AI pipelines, civic intelligence platforms, and custom APIs."`
- CTA row text: `"Ready to engineer your infrastructure?"` → button: `"Start Your Infrastructure →"`

### WhyCustomSection (`components/WhyCustomSection.tsx`)

**Colors:** Replace all warm-toned variables with navy/glacier palette. Left panel (fragmented): `#0d1520` bg with red/zinc tint replaced by `rgba(239,68,68,0.05)` tint. Right panel (Arctos): `rgba(59,130,246,0.06)` glacier tint.

**Copy (per messaging guide):**
- Section eyebrow: `"THE CASE FOR INFRASTRUCTURE"`
- H2: `"Fragmented tools are costing you more than money."`
- Left panel title: `"The Subscription Trap"`
- Right panel title: `"Engineered Infrastructure"`
- Right panel features: `"One-time build. You own it forever."` / `"No monthly fees. No vendor lock-in."` / `"Built specifically for your operations."` / `"Full source code. Full sovereignty."`
- Check mark color: `var(--glacier)`
- Counter accent: glacier blue for the positive counter

### WorkflowSection (`components/WorkflowSection.tsx`)

**Colors:** Replace any accent/warm tones with glacier blue. Step number color: `var(--glacier)`. Connecting line: glacier blue gradient. Active/hover step: glacier blue border + glow.

**Copy:**
- Eyebrow: `"THE PROCESS"`
- H2: `"How we engineer your system."`
- Step 01: `"Discovery Sprint"` — `"Architecture review, user flows, operational mapping, and clear success criteria."`
- Step 02: `"System Design"` — `"Component architecture, data flows, integration specs, and full written scope."`
- Step 03: `"Build & Integrate"` — `"Staged delivery with regular reviews, performance testing, and security hardening."`
- Step 04: `"Launch & Handoff"` — `"Production deployment, documentation, training, and optional ongoing support."`

### TrustSection (`components/TrustSection.tsx`)

**Colors:** Proof point value numbers: `var(--glacier)`. Tags/flags: glacier-tinted borders.

**Copy:**
- H2: `"Canadian-built."` + italic `"Enterprise-proven."`  (keep)
- Proof points: `99/100` Lighthouse / `3–12 wks` Delivery / `$0/yr` Platform fees (keep values)
- Tags: `Canada · Remote-first · Data Sovereign`
- Body: `"Every system we ship meets enterprise standards for performance, security, and scalability. Your data stays yours — permanently."`

### FaqSection (`components/FaqSection.tsx`)

**Colors:** Open accordion accent: glacier blue indicator. Hover: glacier border tint.

**Copy (`lib/siteContent.ts`):** Keep current 5 FAQ items — they already follow operational language. Minor language tightening only.

### ContactSection (`App.tsx`)

**Copy:**
- H2: `"Engineer your"` + italic glacier `"operational future."` (keep structure, `color: var(--glacier)` on italic)
- Subhead: keep current operational language
- Primary CTA: `"Start Your Infrastructure →"` (keep)
- Secondary: `"View Our Systems"` (keep)
- Trust strip: `"Trusted by 50+ Canadian enterprises"` → `"Trusted by 50+ Canadian operators"`

### Footer (`App.tsx`)

**Colors:** All link hovers: `color: var(--glacier)`. Acid dot → glacier dot.
**Copy:** Keep current footer copy — it already follows operational language.

### Marquee (`App.tsx`)

**Colors:** Separator dots (`·`) → `color: var(--glacier)`.

---

## Files Changed

| File | Change |
|---|---|
| `index.css` | Full color token replacement, typography stack update, glow utilities |
| `index.html` | Google Fonts URL (Space Grotesk + Inter + IBM Plex Mono) |
| `App.tsx` | Nav CTA colors, marquee dot, contact section italic color, footer hover |
| `components/HeroSection.tsx` | Accent colors → glacier, copy updates |
| `components/SystemsSection.tsx` | T-object token swap, copy updates, hover colors |
| `components/WhyCustomSection.tsx` | Panel colors, copy updates, check/counter colors |
| `components/WorkflowSection.tsx` | Step accent colors, copy updates, connecting line |
| `components/TrustSection.tsx` | Proof point colors, copy updates, tag colors |
| `components/FaqSection.tsx` | Accordion accent color |
| `lib/siteContent.ts` | Minor copy tightening on FAQ items |

---

## Out of Scope

- `ContactForm.tsx` — functional form, minimal color usage, unchanged
- `AIChat.tsx` — standalone component, unchanged
- `CustomCursor.tsx` — unchanged
- `FluidBackground.tsx` — unchanged
- `services/geminiService.ts` — unchanged
- New sections, routing changes, or backend work

---

## Success Criteria

1. Zero acid green (`#C8F135`) references remaining in active styles
2. All headings render in Space Grotesk
3. Body text renders in Inter
4. All hover states glow glacier blue
5. Copy passes the messaging audit checklist (no agency speak, operational language throughout)
6. Visually comparable to Linear / Stripe / Framer at a glance
7. No regressions in animation, scroll behavior, or mobile layout
