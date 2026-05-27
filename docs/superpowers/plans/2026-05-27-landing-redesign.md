# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full visual rework of the Arctos Launchpad landing page — new fonts (Syne + DM Sans), new color palette, image-dominant portfolio cards, CN Tower trust section, hero with bear mascot image, and bold "Less chaos. Better systems." headline.

**Architecture:** Replace every hardcoded font/color string and CSS token across 8 files. New images slot into existing component structure. No new components are created — existing components are rewritten where layouts change (Hero, Trust), restylled where only fonts/colors change (Systems, WhyCustom, Workflow, FAQ).

**Tech Stack:** React 19 (importmap/CDN), Framer Motion, Tailwind via CDN, Vite dev server (`npm run dev`)

---

## File Map

| File | Change Type |
|------|------------|
| `index.html` | Replace Google Fonts link |
| `index.css` | Full CSS token replacement |
| `components/HeroSection.tsx` | Full rewrite — new copy, mountain bg, bear image |
| `components/SystemsSection.tsx` | Font + color token restyle |
| `components/WhyCustomSection.tsx` | Font + color token restyle |
| `components/WorkflowSection.tsx` | Font + color token restyle |
| `components/FaqSection.tsx` | Font + color token restyle |
| `components/TrustSection.tsx` | Full rewrite — CN Tower background |
| `App.tsx` | Logo src, Marquee, ProjectWorkCard, Contact bg, Footer |

---

## Task 1: Foundations — Fonts and CSS Tokens

**Files:**
- Modify: `index.html` line 10
- Modify: `index.css` lines 1–100

- [ ] **Step 1: Replace the Google Fonts link in `index.html`**

Find line 10 (the `<link href="https://fonts.googleapis.com/css2?...">` line) and replace it:

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=IBM+Plex+Mono:wght@400;500;700&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Replace the entire `:root` block in `index.css`**

Find the current `:root { ... }` block (lines 3–42) and replace it entirely:

```css
:root {
  /* Surfaces */
  --bg: #080A0F;
  --bg-1: #0C0F18;
  --bg-2: #111827;

  /* Typography */
  --ink: #F5F7FF;
  --ink-2: #8B9CB8;
  --ink-3: #3D5275;

  /* Accent — electric blue */
  --accent: #2563FF;
  --acid: #2563FF;
  --acid-dim: rgba(37, 99, 255, 0.07);
  --acid-glow: rgba(37, 99, 255, 0.22);

  /* Borders */
  --border: rgba(255, 255, 255, 0.06);
  --border-2: rgba(255, 255, 255, 0.11);

  /* Legacy aliases — kept so untouched components don't break */
  --surface-0: #080A0F;
  --surface-1: #0C0F18;
  --surface-2: #111827;
  --glacier: #2563FF;
  --glacier-glow: #4D7FFF;
  --frost: #C8E0FF;
  --zinc: #3D5275;
  --accent-glow: #4D7FFF;
  --accent-warm: #93B8FD;
  --accent-deep: #1340CC;
  --ink-muted: #8B9CB8;
  --cyan: #2563FF;

  /* Easing */
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-elastic: cubic-bezier(0.68, -0.6, 0.32, 1.6);
}
```

- [ ] **Step 3: Replace the typography base rules in `index.css`**

Find the `/* ─── Typography ───... */` block and replace it:

```css
/* ─── Typography ───────────────────────────────────── */

h1, h2, h3, h4, h5, h6, .font-heading {
  font-family: 'Syne', system-ui, sans-serif;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.0;
}

.font-display {
  font-family: 'Syne', system-ui, sans-serif;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.font-mono, code, pre {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
}
```

- [ ] **Step 4: Replace the `body` font-family in `index.css`**

Find `font-family: 'Inter', system-ui, sans-serif;` inside the `body { }` rule and change to:

```css
  font-family: 'DM Sans', system-ui, sans-serif;
```

- [ ] **Step 5: Update `.glow-glacier` utilities in `index.css`**

Find the `.glow-glacier` and `.glow-glacier-hover:hover` rules and replace:

```css
.glow-glacier {
  box-shadow: 0 0 30px rgba(37, 99, 255, 0.22);
}
.glow-glacier-hover:hover {
  box-shadow: 0 0 40px rgba(37, 99, 255, 0.32);
  transition: box-shadow 0.3s ease;
}
```

- [ ] **Step 6: Start dev server and verify tokens loaded**

```bash
npm run dev
```

Open `http://localhost:5173`. The page background should be a slightly cooler, bluer dark (`#080A0F`). Any existing accent (buttons, stats) should shift from the old Tailwind blue to the new electric `#2563FF`. Body text should now render in DM Sans — visibly rounder and softer than Inter. Headings should be in Syne — geometric, strong.

- [ ] **Step 7: Commit**

```bash
git add index.html index.css
git commit -m "feat: replace design tokens — Syne/DM Sans fonts, electric blue palette"
```

---

## Task 2: HeroSection — New Layout

**Files:**
- Modify: `components/HeroSection.tsx` (full rewrite)

- [ ] **Step 1: Replace the entire file**

```tsx
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { HERO_STATS } from '../lib/siteContent';

interface HeroSectionProps {
  scrollToContact: () => void;
  onViewSystems: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ scrollToContact, onViewSystems }) => {
  const prefersReduced = useReducedMotion();

  const a = <T extends object>(props: T): T | object =>
    prefersReduced ? {} : props;

  const lines = ['Less chaos.', 'Better systems.'];

  return (
    <header
      className="relative min-h-screen flex flex-col justify-between overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Mountain background — 7% opacity texture */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/bakcground-mountains.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.07,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Bear mascot — bold, bottom-right, mix-blend removes white bg */}
      <img
        src="/website-landing.png"
        alt=""
        aria-hidden
        className="hidden sm:block"
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 'clamp(420px, 50vw, 780px)',
          height: 'auto',
          zIndex: 1,
          pointerEvents: 'none',
          mixBlendMode: 'multiply',
          userSelect: 'none',
        }}
      />

      {/* Main content */}
      <div
        className="relative flex flex-col flex-1 max-w-[1360px] mx-auto w-full px-6 md:px-12 pt-28 pb-16 sm:pt-32"
        style={{ zIndex: 10 }}
      >
        {/* Eyebrow */}
        <motion.div
          {...a({
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0 },
          })}
          className="self-start mb-10 sm:mb-12"
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--ink-2)',
              border: '1px solid var(--border-2)',
              padding: '0.4rem 0.75rem',
            }}
          >
            <span style={{ color: 'var(--accent)', fontSize: '8px' }}>●</span>
            Enterprise Digital Infrastructure · Canada
          </span>
        </motion.div>

        {/* H1 — desktop */}
        <h1 style={{ fontFamily: "'Syne', system-ui, sans-serif", fontWeight: 800, lineHeight: 0.92, letterSpacing: '-0.03em', margin: 0 }}>
          <span className="hidden sm:block" style={{ fontSize: 'clamp(4.5rem, 9vw, 10rem)' }}>
            {lines.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="block"
                  style={{ color: i === 1 ? 'var(--accent)' : 'var(--ink)' }}
                  {...a({
                    initial: { y: '110%', opacity: 0 },
                    animate: { y: '0%', opacity: 1 },
                    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.08 },
                  })}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </span>
          {/* H1 — mobile */}
          <span className="sm:hidden block" style={{ fontSize: 'clamp(3rem, 10vw, 4.5rem)' }}>
            {lines.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="block"
                  style={{ color: i === 1 ? 'var(--accent)' : 'var(--ink)' }}
                  {...a({
                    initial: { y: '110%', opacity: 0 },
                    animate: { y: '0%', opacity: 1 },
                    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.08 },
                  })}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </span>
        </h1>

        {/* Subtext */}
        <motion.p
          {...a({
            initial: { opacity: 0, y: 16 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 },
          })}
          style={{
            marginTop: '2rem',
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: '16px',
            fontWeight: 300,
            lineHeight: 1.65,
            color: 'var(--ink-2)',
            maxWidth: '26rem',
          }}
        >
          ARCTOS LAUNCHPAD engineers custom operational platforms, AI workflows, and digital
          infrastructure for Canadian enterprises. You own everything we build — forever.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...a({
            initial: { opacity: 0, y: 16 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 },
          })}
          style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
        >
          <button
            type="button"
            onClick={scrollToContact}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--accent)',
              color: '#fff',
              padding: '1rem 1.75rem',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              minHeight: '48px',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Engineer Your Future
            <ArrowRight style={{ width: '14px', height: '14px', flexShrink: 0 }} />
          </button>

          <button
            type="button"
            onClick={onViewSystems}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'transparent',
              color: 'var(--ink)',
              padding: '1rem 1.75rem',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              border: '1px solid var(--border-2)',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              minHeight: '48px',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--ink)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-2)')}
          >
            View Systems
          </button>
        </motion.div>
      </div>

      {/* Stats strip */}
      <div className="relative max-w-[1360px] mx-auto w-full px-6 md:px-12 pb-12" style={{ zIndex: 10 }}>
        <motion.div
          {...a({
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.6 },
          })}
        >
          <div style={{ height: '1px', background: 'var(--border)', marginBottom: '2rem' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
            {HERO_STATS.map(stat => (
              <div key={stat.label}>
                <div style={{
                  fontFamily: "'Syne', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                  lineHeight: 1,
                  color: 'var(--accent)',
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: 'var(--ink-2)',
                  marginTop: '0.4rem',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          pointerEvents: 'none',
          zIndex: 20,
          opacity: 0.45,
        }}
      >
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--ink-2)' }}>
          Scroll
        </span>
        <motion.div
          style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, var(--ink-2), transparent)' }}
          {...a({
            animate: { y: [0, 8, 0] },
            transition: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' },
          })}
        />
      </div>
    </header>
  );
};

export default HeroSection;
```

- [ ] **Step 2: Verify in browser**

Check `http://localhost:5173`. Hero should show:
- "Less chaos." in white Syne 800
- "Better systems." in electric blue `#2563FF` Syne 800
- Mountains barely visible at 7% behind text
- Bear on rocky outcrop appearing bottom-right (desktop only), blending into dark bg

- [ ] **Step 3: Commit**

```bash
git add components/HeroSection.tsx
git commit -m "feat: rewrite hero — Less chaos/Better systems, bear mascot, mountain texture"
```

---

## Task 3: SystemsSection — Typography Restyle

**Files:**
- Modify: `components/SystemsSection.tsx`

- [ ] **Step 1: Update the design tokens object `T`**

Find the `const T = { ... } as const;` block (lines 10–18) and replace it:

```ts
const T = {
  bg1:     '#0C0F18',
  ink:     '#F5F7FF',
  ink2:    '#8B9CB8',
  ink3:    '#3D5275',
  accent:  '#2563FF',
  border:  'rgba(255, 255, 255, 0.06)',
  border2: 'rgba(255, 255, 255, 0.11)',
} as const;
```

- [ ] **Step 2: Replace all `T.acid` references with `T.accent`**

There are 3 occurrences — the number color on hover, the bottom border on hover, and the CTA button background. Use find-and-replace in the file:
- `T.acid` → `T.accent`
- `btnHovered ? '#60a5fa' : T.acid` → `btnHovered ? '#4D7FFF' : T.accent`

- [ ] **Step 3: Replace all Space Grotesk font-family strings**

Find every instance of `"'Space Grotesk', system-ui, sans-serif"` in the file and replace with `"'Syne', system-ui, sans-serif"`.

There are occurrences in: the large number div, the title div inside `motion.div`, the `CTARow` italic statement div, and the heading `h2`.

- [ ] **Step 4: Replace all Inter font-family strings**

Find every instance of `"'Inter', sans-serif"` and replace with `"'DM Sans', system-ui, sans-serif"`.

Occurrences: the descriptor div in `ServiceRow`, the CTA button.

- [ ] **Step 5: Replace all mono font strings**

Find `"'IBM Plex Mono', 'JetBrains Mono', monospace"` and replace with `"'IBM Plex Mono', monospace"`.

- [ ] **Step 6: Verify in browser**

Systems section headings should now render in Syne (tighter, geometric). Numbers should use new `--accent` blue on hover.

- [ ] **Step 7: Commit**

```bash
git add components/SystemsSection.tsx
git commit -m "feat: restyle SystemsSection — Syne headings, DM Sans body, new tokens"
```

---

## Task 4: WhyCustomSection — Typography Restyle

**Files:**
- Modify: `components/WhyCustomSection.tsx`

- [ ] **Step 1: Replace all Space Grotesk font-family strings**

Find every `"'Space Grotesk', system-ui, sans-serif"` and replace with `"'Syne', system-ui, sans-serif"`.

Occurrences: section `h2`, the two large value displays (`AnimatedCount` wrapper and the "Yours." line), the statement `p` inside ARCTOS_WINS map.

- [ ] **Step 2: Replace all Inter font-family strings**

Find every `"'Inter', system-ui, sans-serif"` and replace with `"'DM Sans', system-ui, sans-serif"`.

Occurrences: PAIN_POINTS label span, detail `p` inside ARCTOS_WINS map.

- [ ] **Step 3: Replace all IBM Plex Mono extended strings**

Find `"'IBM Plex Mono', monospace"` — already correct, no change needed.

- [ ] **Step 4: Update the hardcoded blue in the right panel background and border**

Find `background: 'rgba(59,130,246,0.06)'` → `background: 'rgba(37,99,255,0.06)'`
Find `border: '1px solid rgba(59,130,246,0.12)'` → `border: '1px solid rgba(37,99,255,0.12)'`
Find `borderTop: '1px solid rgba(59,130,246,0.12)'` → `borderTop: '1px solid rgba(37,99,255,0.12)'`
Find `color: '#3b82f6'` (the "Yours." text and Check icon) → `color: '#2563FF'`

- [ ] **Step 5: Verify + commit**

```bash
git add components/WhyCustomSection.tsx
git commit -m "feat: restyle WhyCustomSection — Syne/DM Sans, updated blue tokens"
```

---

## Task 5: WorkflowSection — Typography Restyle

**Files:**
- Modify: `components/WorkflowSection.tsx`

- [ ] **Step 1: Replace Space Grotesk font-family strings**

Find every `"'Space Grotesk', system-ui, sans-serif"` and replace with `"'Syne', system-ui, sans-serif"`.

Occurrences: section `h2` heading, large step number `span`, step title `h3` (both desktop and mobile).

- [ ] **Step 2: Replace Inter font-family strings**

Find every `"'Inter', system-ui, sans-serif"` and replace with `"'DM Sans', system-ui, sans-serif"`.

Occurrences: step body `p` (both desktop and mobile versions).

- [ ] **Step 3: Verify + commit**

```bash
git add components/WorkflowSection.tsx
git commit -m "feat: restyle WorkflowSection — Syne headings, DM Sans body"
```

---

## Task 6: FaqSection — Typography Restyle

**Files:**
- Modify: `components/FaqSection.tsx`

- [ ] **Step 1: Replace Inter font-family strings**

Find every `"'Inter', system-ui, sans-serif"` and replace with `"'DM Sans', system-ui, sans-serif"`.

Occurrences: subheading `p` (line ~59), answer text `p` (line ~142).

- [ ] **Step 2: Replace hardcoded color strings**

Find `'#a1a1aa'` (3 occurrences) → `'var(--ink-2)'`
Find `'#3b82f6'` (2 occurrences — open question color and expand/collapse icon color) → `'var(--accent)'`
Find `'rgba(59,130,246,0.25)'` (2 occurrences — open state border color) → `'rgba(37,99,255,0.25)'`

- [ ] **Step 3: Verify + commit**

```bash
git add components/FaqSection.tsx
git commit -m "feat: restyle FaqSection — DM Sans, updated color tokens"
```

---

## Task 7: TrustSection — CN Tower Background Rework

**Files:**
- Modify: `components/TrustSection.tsx` (full rewrite)

- [ ] **Step 1: Replace the entire file**

```tsx
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const PROOF_POINTS = [
  { value: '99', suffix: '/100', label: 'Avg Lighthouse score' },
  { value: '3–12', suffix: ' wks', label: 'Delivery timeline' },
  { value: '$0', suffix: '/yr', label: 'Platform fees after launch' },
];

const TrustSection: React.FC = () => {
  const reduced = useReducedMotion() ?? false;

  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>

      {/* ── Full-width CN Tower photographic moment ── */}
      <div style={{ position: 'relative', minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>

        {/* Background: social-post-1.png (Toronto skyline) */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/social-post-1.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            zIndex: 0,
          }}
        />

        {/* Dark gradient overlay — text reads over image */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(8,10,15,0.45) 0%, rgba(8,10,15,0.65) 50%, rgba(8,10,15,0.96) 100%)',
            zIndex: 1,
          }}
        />

        {/* Content over image */}
        <div
          className="relative mx-auto w-full px-6 md:px-12"
          style={{ maxWidth: '1280px', zIndex: 2, paddingBottom: 'clamp(3rem, 6vw, 6rem)', paddingTop: 'clamp(4rem, 8vw, 8rem)' }}
        >
          {/* Eyebrow */}
          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              color: 'var(--ink-2)',
              marginBottom: '1.5rem',
            }}
          >
            05 / Proof
          </motion.p>

          {/* Headline */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: '3rem' }}
          >
            <h2
              style={{
                fontFamily: "'Syne', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(3.5rem, 7vw, 8rem)',
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              Built to scale.
              <br />
              <span style={{ color: 'var(--accent)' }}>Built in Canada.</span>
            </h2>
          </motion.div>

          {/* Proof stats strip */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '2rem' }}
          >
            {PROOF_POINTS.map((pt, i) => (
              <motion.div
                key={pt.label}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  padding: '1rem 0',
                  borderRight: i < PROOF_POINTS.length - 1 ? '1px solid rgba(255,255,255,0.10)' : undefined,
                  paddingRight: i < PROOF_POINTS.length - 1 ? '2rem' : 0,
                  paddingLeft: i > 0 ? '2rem' : 0,
                }}
                className="border-b sm:border-b-0 border-white/10 last:border-b-0"
              >
                <span
                  style={{
                    fontFamily: "'Syne', system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    lineHeight: 1,
                    color: 'var(--accent)',
                    display: 'block',
                  }}
                >
                  {pt.value}
                  <span style={{ fontSize: '0.45em', color: 'var(--ink-3)', letterSpacing: '0.02em' }}>
                    {pt.suffix}
                  </span>
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    color: 'var(--ink-2)',
                    display: 'block',
                    marginTop: '0.5rem',
                  }}
                >
                  {pt.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quote block — below image ── */}
      <div style={{ background: 'var(--bg)' }}>
        <div
          className="mx-auto px-6 md:px-12"
          style={{ maxWidth: '1280px', paddingTop: 'clamp(3rem, 5vw, 5rem)', paddingBottom: 'clamp(3rem, 5vw, 5rem)' }}
        >
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            style={{ borderLeft: '2px solid var(--accent)', paddingLeft: '1.5rem', maxWidth: '42rem' }}
          >
            <p
              style={{
                fontFamily: "'Syne', system-ui, sans-serif",
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                color: 'var(--ink)',
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              "Every system we ship meets enterprise standards for performance,
              security, and scalability. Your data stays yours — permanently."
            </p>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.22em',
                color: 'var(--ink-3)',
                display: 'block',
                marginTop: '1rem',
              }}
            >
              Canada · Remote-first · Data Sovereign
            </span>
          </motion.div>
        </div>
      </div>

    </section>
  );
};

export default TrustSection;
```

- [ ] **Step 2: Verify in browser**

Scroll to the Trust section. You should see:
- The CN Tower Toronto night skyline as a full-width photo background
- "Built to scale." in white Syne 800 over the image
- "Built in Canada." in electric blue below it
- 3 proof stats rendered over the darkest part of the gradient
- Quote block below on solid dark background

- [ ] **Step 3: Commit**

```bash
git add components/TrustSection.tsx
git commit -m "feat: rewrite TrustSection — CN Tower full-bleed bg, Built to scale headline"
```

---

## Task 8: App.tsx — Logo, Marquee, Portfolio Cards

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Replace the external logo URL constant**

Find line 21–22:
```ts
const POLAR_BEAR_LOGO =
  'https://www.image2url.com/r2/default/images/1779334554589-8e1c8308-a058-4149-84d1-42e881122291.png';
```

Replace with:
```ts
const POLAR_BEAR_LOGO = '/logo-no-text-2.png';
```

- [ ] **Step 2: Update logo `img` sizes in Nav, mobile menu, and Footer**

In the Nav logo `img` (line ~414), change `className="h-16 w-16 object-contain"` to `className="h-9 w-auto object-contain"`.

In the mobile menu `img` (line ~497), same change: `className="h-9 w-auto object-contain"`.

In the Footer `img` (line ~695), change to `className="h-12 w-auto object-contain"`.

- [ ] **Step 3: Update the Marquee component font**

Find the Marquee `motion.div` children. Locate the `<span className="font-heading italic...">` item span and update its style:

```tsx
<span
  style={{
    fontFamily: "'Syne', system-ui, sans-serif",
    fontStyle: 'italic',
    fontWeight: 400,
    fontSize: 'clamp(2rem, 4vw, 3.5rem)',
    color: 'var(--ink-3)',
    flexShrink: 0,
  }}
>
  {item}
</span>
```

- [ ] **Step 4: Replace the `ProjectWorkCard` component with the image-dominant version**

Find the entire `const ProjectWorkCard: React.FC<...> = (...)` function (lines 121–246) and replace it:

```tsx
const ProjectWorkCard: React.FC<{ project: Project; className?: string }> = ({
  project,
  className = '',
}) => {
  const href = projectHref(project);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative overflow-hidden ${className}`}
      style={{
        minHeight: '320px',
        backgroundImage: `url(${project.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(8,10,15,0.72)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.35s ease',
          zIndex: 1,
        }}
      />

      {/* Description — slides up on hover, sits above strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: '88px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '1.5rem',
          zIndex: 2,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
        }}
      >
        <p style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: '13px',
          lineHeight: 1.65,
          color: 'rgba(245,247,255,0.82)',
          fontWeight: 300,
          marginBottom: '0.75rem',
        }}>
          {project.description}
        </p>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {project.tags?.map(tag => (
            <span key={tag} style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--ink-3)',
              border: '1px solid var(--border-2)',
              padding: '2px 6px',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Persistent bottom strip — always visible */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '88px',
          background: 'rgba(8,10,15,0.84)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '0 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '0.25rem',
          zIndex: 3,
        }}
      >
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          color: 'var(--ink-3)',
          margin: 0,
        }}>
          {project.type}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{
            fontFamily: "'Syne', system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
            color: 'var(--ink)',
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}>
            {project.name}
          </h3>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--ink-2)',
              textDecoration: 'none',
              flexShrink: 0,
              transition: 'color 0.2s ease',
              marginLeft: '1rem',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-2)')}
          >
            View →
          </a>
        </div>
      </div>
    </motion.article>
  );
};
```

- [ ] **Step 5: Verify portfolio cards in browser**

Scroll to the Work section. Cards should fill entirely with project screenshots. Each card has a frosted bottom strip showing project name + "View →". Hovering should fade in the dark overlay and slide up the description.

- [ ] **Step 6: Commit**

```bash
git add App.tsx
git commit -m "feat: image-dominant portfolio cards, local sunglasses bear logo, Syne marquee"
```

---

## Task 9: App.tsx — Contact Section Background and Footer

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Add background image to the contact section**

Find the contact `<section id="contact" ...>` opening tag and its `className` / style. Replace the section with a version that has a relative wrapper with the image:

Find:
```tsx
<section
  id="contact"
  className="border-t border-[var(--border)] bg-[var(--bg)] py-20 md:py-28"
>
```

Replace with:
```tsx
<section
  id="contact"
  className="border-t border-[var(--border)] relative overflow-hidden"
  style={{ background: 'var(--bg)' }}
>
  {/* header-for-socials.png as subtle background texture */}
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: 'url(/header-for-socials.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: 0.09,
      zIndex: 0,
    }}
  />
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to bottom, rgba(8,10,15,0.6) 0%, rgba(8,10,15,0.92) 45%, var(--bg) 100%)',
      zIndex: 1,
    }}
  />
```

Then find the `<div className="max-w-[1280px] mx-auto px-6">` that is the direct child of this section and replace it with:

```tsx
  <div className="max-w-[1280px] mx-auto px-6 py-20 md:py-28" style={{ position: 'relative', zIndex: 2 }}>
```

(Adding `py-20 md:py-28` since the section tag no longer carries those padding classes, and `zIndex: 2` to sit above the image layers.)

- [ ] **Step 2: Update the contact heading typography**

Find the `<h2 className="font-heading font-light text-[var(--ink)]"` inside the contact section and update to Syne explicitly:

```tsx
<h2
  style={{
    fontFamily: "'Syne', system-ui, sans-serif",
    fontWeight: 700,
    fontSize: 'clamp(3.5rem,6vw,7rem)',
    lineHeight: 0.95,
    letterSpacing: '-0.02em',
    color: 'var(--ink)',
  }}
>
  Engineer your
  <span className="block italic" style={{ color: 'var(--accent)' }}>operational future.</span>
</h2>
```

- [ ] **Step 3: Update the footer section heading**

Find the `<footer className="border-t...">` and update the footer logo `img` — it was already updated in Task 8 Step 2 to `h-12 w-auto`. Confirm it references `POLAR_BEAR_LOGO` (which now points to the local sunglasses bear).

Also update the footer tagline `<p>` font:

Find:
```tsx
<p className="max-w-xs text-[13px] text-[var(--ink-2)] leading-relaxed font-light">
```

Add explicit DM Sans:
```tsx
<p style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }} className="max-w-xs text-[13px] text-[var(--ink-2)] leading-relaxed font-light">
```

- [ ] **Step 4: Final verification pass**

Check all 8 sections in browser:
- Hero: "Less chaos." / "Better systems.", mountain texture, bear bottom-right ✓
- Marquee: Syne italic ✓
- Systems: Syne numbers + headings ✓
- Why Custom: Syne headings, updated blue tones ✓
- Workflow: Syne step numbers + titles ✓
- Work: image-dominant cards, frosted strip ✓
- Trust: CN Tower background, "Built to scale. Built in Canada." ✓
- FAQ: DM Sans answers, accent highlights ✓
- Contact: header-for-socials subtle background ✓
- Footer: sunglasses bear logo ✓

Check mobile at 375px width: bear hidden in hero, cards still functional with tappable View links.

- [ ] **Step 5: Commit**

```bash
git add App.tsx
git commit -m "feat: contact section background, footer bear logo, Syne contact heading"
```
