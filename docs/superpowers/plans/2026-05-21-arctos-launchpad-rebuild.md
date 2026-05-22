# ARCTOS LAUNCHPAD — Full Architectural Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fully transform the BaseLayer site into the ARCTOS LAUNCHPAD premium Canadian digital infrastructure brand — new design tokens, polar bear logo, 5 new section components, real project screenshots, enterprise copy.

**Architecture:** Phase 1 (tokens + content) → Phase 2 (5 new components built independently) → Phase 3 (App.tsx rewire + mobile update). Phases 1 and 3 are sequential; Phase 2 tasks are fully parallel.

**Tech Stack:** React 19, TypeScript, Vite, Framer Motion, GSAP + ScrollTrigger, Lenis, Tailwind CSS v4, lucide-react

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `index.css` | Modify | Design tokens, Space Grotesk font, CSS vars |
| `index.html` | Modify | Page title, updated Google Fonts link |
| `lib/siteContent.ts` | Modify | All copy: VALUE_PILLARS, AUDIENCE_SEGMENTS, FAQ_ITEMS, HERO_STATS |
| `App.tsx` | Modify | Nav logo, section wiring, remove ServicesPage route, update Marquee, footer |
| `types.ts` | Modify | Remove unused `'services'` from ViewState |
| `components/HeroSection.tsx` | Create | Full-screen hero with CTAs, stats, floating UI composition |
| `components/SystemsSection.tsx` | Create | Inline 3-column service cards with SpotlightCard |
| `components/WhyCustomSection.tsx` | Create | Two-column comparison: fragmented stack vs Arctos way |
| `components/WorkflowSection.tsx` | Create | 4-step animated process visualization |
| `components/TrustSection.tsx` | Create | Stats + bear.png background + Canadian identity block |

**Constants used throughout:**
```ts
const POLAR_BEAR_LOGO = 'https://www.image2url.com/r2/default/images/1779334554589-8e1c8308-a058-4149-84d1-42e881122291.png';
```

---

## PHASE 1 — Foundation (do these first, in order)

### Task 1: Update Design Tokens & Fonts

**Files:**
- Modify: `index.css`
- Modify: `index.html`

- [ ] **Step 1: Update `index.html` title and font imports**

Replace the existing `<title>` and `<link>` font tag with:

```html
<title>ARCTOS LAUNCHPAD — Canadian Digital Infrastructure</title>
```

Replace the Google Fonts link href (keep the `<link rel="preconnect">` tags, just change the stylesheet href):
```
https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,400&family=Space+Grotesk:wght@300;400;500;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap
```

- [ ] **Step 2: Replace CSS tokens and body font in `index.css`**

Replace the entire `:root` block and `body` rule with:

```css
:root {
  --surface-0: #020408;
  --surface-1: #070d14;
  --surface-2: #0d1520;
  --ink: #ffffff;
  --ink-muted: #94a3b8;

  --glacier: #0ea5e9;
  --glacier-glow: #38bdf8;
  --frost: #bae6fd;
  --zinc: #3f4651;

  --stroke: rgba(255, 255, 255, 0.04);
  --glow-glacier: rgba(14, 165, 233, 0.3);
  --glow-frost: rgba(186, 230, 253, 0.15);

  /* Keep these for backward compat with existing components */
  --accent: #0ea5e9;
  --accent-glow: #38bdf8;
  --accent-warm: #7dd3fc;
  --accent-deep: #0c4a6e;

  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-elastic: cubic-bezier(0.68, -0.6, 0.32, 1.6);
}

body {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  background-color: var(--surface-0);
  color: var(--ink);
  margin: 0;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
```

- [ ] **Step 3: Verify build still compiles**

```bash
cd /home/mrotiz14/github-projects/BaseLayer && npm run dev
```

Expected: dev server starts, no TypeScript errors in terminal.

- [ ] **Step 4: Commit**

```bash
git add index.css index.html
git commit -m "feat: update design tokens to glacier palette, swap to Space Grotesk"
```

---

### Task 2: Update Site Content Copy

**Files:**
- Modify: `lib/siteContent.ts`

- [ ] **Step 1: Replace the entire file content**

```ts
export const VALUE_PILLARS = [
  {
    title: 'Full operational ownership',
    body: 'Complete infrastructure control. Your data, your systems, your rules. No subscriptions, no lock-in, no compromises on data sovereignty.',
    icon: 'lock' as const,
  },
  {
    title: 'Enterprise-grade systems',
    body: 'Operational platforms built for scale, security, and performance. From custom dashboards to AI automation pipelines — designed for enterprise reliability.',
    icon: 'zap' as const,
  },
  {
    title: 'Canadian innovation',
    body: "Premium digital infrastructure engineered by Canadian systems architects. Data sovereignty, strategic positioning, and the expertise behind Canada's most advanced business systems.",
    icon: 'globe' as const,
  },
];

export const AUDIENCE_SEGMENTS = [
  { label: 'Scaling Enterprises', detail: 'Custom operational platforms that grow with your business — not against it.' },
  { label: 'Strategic Innovators', detail: 'Automation infrastructure and AI workflows built for competitive advantage.' },
  { label: 'Operations-First Leaders', detail: 'Enterprise systems designed specifically around your operational reality.' },
];

export const FAQ_ITEMS = [
  {
    q: 'What kind of systems do you build?',
    a: 'Custom operational platforms, AI automation workflows, enterprise dashboards, scalable infrastructure, and business systems. Every system is built specifically for your operational needs — no templates, no compromises.',
  },
  {
    q: 'How does the engagement process work?',
    a: 'We start with an architecture discovery call, then deliver a written scope with operational milestones and transparent pricing. You get regular updates, staged deployments, and complete documentation — designed for enterprise transparency.',
  },
  {
    q: 'Do you work with existing infrastructure?',
    a: 'Yes. We integrate with your current systems, migrate from fragmented tools, or build new operational infrastructure from scratch. If a complete rebuild makes strategic sense, we will recommend it upfront with a clear rationale.',
  },
  {
    q: "What does 'full ownership' actually mean?",
    a: "It means you receive the complete source code, all credentials, all deployment access, and full documentation. We never retain access after handoff unless you explicitly retain us for ongoing support. Your system is yours — permanently.",
  },
  {
    q: 'How long does a typical system take to build?',
    a: 'Scope determines timeline. A custom static site ships in 2-3 weeks. A full-stack application or enterprise dashboard typically takes 6-12 weeks with staged delivery milestones. We scope everything in writing before work begins.',
  },
];

export const HERO_STATS = [
  { value: '50+', label: 'Systems deployed' },
  { value: '99.9%', label: 'Operational uptime' },
  { value: '100%', label: 'Client ownership' },
];
```

- [ ] **Step 2: Verify build still compiles**

```bash
npm run dev
```

Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add lib/siteContent.ts
git commit -m "feat: update all site copy for Arctos Launchpad enterprise positioning"
```

---

## PHASE 2 — New Components (these 5 tasks are fully independent, build in parallel)

### Task 3: Build HeroSection Component

**Files:**
- Create: `components/HeroSection.tsx`

- [ ] **Step 1: Create the file with full implementation**

```tsx
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { HERO_STATS } from '../lib/siteContent';

const POLAR_BEAR_LOGO = 'https://www.image2url.com/r2/default/images/1779334554589-8e1c8308-a058-4149-84d1-42e881122291.png';

interface HeroSectionProps {
  scrollToContact: () => void;
  onViewSystems: () => void;
  prefersReducedMotion?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  scrollToContact,
  onViewSystems,
  prefersReducedMotion = false,
}) => {
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, prefersReducedMotion ? 0 : 180]);
  const textY = useTransform(scrollY, [0, 300], [0, prefersReducedMotion ? 0 : 50]);

  return (
    <header
      className="relative min-h-screen flex items-center justify-center overflow-hidden pb-20 bg-[var(--surface-0)]"
      style={{ perspective: '2000px' }}
    >
      {/* Background: mountains + gradient */}
      <motion.div className="absolute inset-0 z-0" style={{ y: backgroundY }}>
        <img
          src="/bakcground-mountains.png"
          alt=""
          aria-hidden
          className="w-full h-full object-cover opacity-20 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-0)] via-[var(--surface-0)]/70 to-transparent" />
      </motion.div>

      {/* Grid + noise */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />
      <div className="absolute inset-0 z-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[var(--surface-0)]/40 to-[var(--surface-0)]" />

      <motion.div
        style={{ y: textY }}
        className="relative z-10 mx-auto mt-24 grid w-full max-w-[1400px] gap-12 px-6 pb-24 pt-8 md:mt-28 md:grid-cols-12 md:items-center md:gap-10 lg:mt-32"
      >
        {/* Left: Text + CTAs */}
        <div className="text-left md:col-span-6 relative z-30">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-[var(--glacier-glow)]/40 bg-[var(--surface-2)]/80 px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--glacier-glow)] backdrop-blur-xl shadow-[0_0_40px_rgba(14,165,233,0.12)]"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--glacier-glow)] animate-pulse" />
            Enterprise Digital Infrastructure · Canada
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-[clamp(3.2rem,8vw,5.5rem)] font-extrabold leading-[1.0] tracking-tight text-white"
          >
            We build the systems
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--frost)] via-[var(--glacier-glow)] to-[var(--glacier)] mt-2">
              behind modern businesses.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-xl text-base leading-relaxed text-slate-300 md:text-lg font-light border-l-2 border-[var(--glacier)]/40 pl-5 bg-gradient-to-r from-[var(--glacier)]/5 to-transparent py-2 rounded-r-xl"
          >
            ARCTOS LAUNCHPAD engineers custom operational platforms, AI workflows, and digital
            infrastructure for Canadian enterprises. You own everything we build.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <button
              type="button"
              onClick={scrollToContact}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--glacier)] px-7 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--surface-0)] transition-all hover:brightness-110 hover:shadow-[0_0_40px_rgba(14,165,233,0.4)] hover:scale-[1.02]"
            >
              Start Your Infrastructure <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onViewSystems}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 transition-all hover:border-[var(--glacier-glow)]/50 hover:text-[var(--glacier-glow)]"
            >
              View Our Systems
            </button>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-14 flex gap-10"
          >
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1.5">
                <span className="font-heading text-3xl font-extrabold text-white">{stat.value}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-slate-500 leading-relaxed">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Logo strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 1 }}
            className="mt-10"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-600 mb-4 font-bold">
              Trusted by elite operations
            </p>
            <img
              src="/logo-strip.png"
              alt="Trusted companies"
              className="h-7 object-contain opacity-50 hover:opacity-80 transition-opacity"
            />
          </motion.div>
        </div>

        {/* Right: Floating UI Composition */}
        <motion.aside
          initial={{ opacity: 0, x: 40, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-5 md:col-span-6 relative min-h-[500px] pointer-events-none mt-10 md:mt-0"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <motion.img
            src="/dashboardUI.png"
            alt="Arctos operational dashboard"
            className="absolute top-0 right-0 md:-right-10 lg:-right-20 z-20 w-[450px] md:w-[600px] lg:w-[700px] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
            style={{ rotateY: '-8deg', rotateX: '5deg' }}
          />
          <motion.img
            src="/analytics-card.png"
            alt="Analytics insights"
            className="absolute bottom-10 left-0 md:-left-10 z-30 w-[250px] md:w-[350px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
            style={{ rotateY: '12deg', rotateX: '-5deg' }}
            animate={prefersReducedMotion ? {} : { y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 1 }}
          />
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--glacier)]/12 blur-[130px] rounded-full z-10 mix-blend-screen pointer-events-none" />
        </motion.aside>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{ x: '-50%' }}
        animate={prefersReducedMotion ? {} : { y: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="absolute bottom-12 left-1/2 flex flex-col items-center gap-3 opacity-40 hover:opacity-80 transition-opacity cursor-pointer z-40"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-[var(--glacier-glow)]">
          Scroll to explore
        </span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-[var(--glacier-glow)] to-transparent" />
      </motion.div>
    </header>
  );
};

export default HeroSection;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run dev
```

Expected: no errors in terminal related to `HeroSection.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/HeroSection.tsx
git commit -m "feat: add HeroSection component with glacier palette and floating UI composition"
```

---

### Task 4: Build SystemsSection Component

**Files:**
- Create: `components/SystemsSection.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import { Code, Layout, Zap, Check, ArrowRight } from 'lucide-react';

const SpotlightCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const bg = useMotionTemplate`radial-gradient(800px circle at ${mouseX}px ${mouseY}px, rgba(14,165,233,0.1), transparent 80%)`;

  return (
    <div className={`group relative overflow-hidden ${className}`} onMouseMove={handleMouseMove}>
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-500 group-hover:opacity-100 z-0"
        style={{ background: bg }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

interface ServiceCardData {
  icon: React.ReactNode;
  badge?: string;
  title: string;
  description: string;
  features: string[];
  pricing: string;
  pricingLabel: string;
  ctaLabel: string;
  accentVar: string;
  index: number;
  onCta: () => void;
}

const ServiceCard: React.FC<ServiceCardData> = ({
  icon,
  badge,
  title,
  description,
  features,
  pricing,
  pricingLabel,
  ctaLabel,
  accentVar,
  index,
  onCta,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    className="h-full"
  >
    <SpotlightCard className="glass-panel rounded-3xl p-10 flex flex-col h-full group border border-white/5 hover:border-[var(--glacier)]/20 transition-colors duration-500">
      <div
        className="absolute top-0 left-8 right-8 h-[1px]"
        style={{ background: `linear-gradient(to right, transparent, ${accentVar}, transparent)` }}
      />

      <div className="flex justify-between items-start mb-12 relative z-10">
        <div
          className="w-16 h-16 bg-black/50 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md group-hover:scale-110 transition-transform duration-500"
          style={{ color: accentVar }}
        >
          {icon}
        </div>
        {badge && (
          <div className="bg-[var(--glacier)] text-[var(--surface-0)] px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
            {badge}
          </div>
        )}
      </div>

      <h3 className="text-2xl font-heading font-extrabold mb-4 text-white relative z-10">{title}</h3>
      <p className="text-slate-400 mb-10 text-sm leading-relaxed font-light relative z-10">
        {description}
      </p>

      <div className="mt-auto relative z-10">
        <div className="text-3xl font-heading font-bold text-white mb-8 tracking-tight flex items-baseline gap-2">
          {pricing}{' '}
          <span className="text-xs text-slate-600 font-mono uppercase tracking-widest">
            / {pricingLabel}
          </span>
        </div>
        <ul className="space-y-3 mb-10 border-t border-white/8 pt-8">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
              <Check className="w-4 h-4 flex-shrink-0" style={{ color: accentVar }} />
              {f}
            </li>
          ))}
        </ul>
        <button
          onClick={onCta}
          className="w-full py-4 rounded-xl font-mono text-[11px] font-extrabold uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all group/btn hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(14,165,233,0.3)]"
          style={{ background: accentVar, color: 'var(--surface-0)' }}
        >
          {ctaLabel}{' '}
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </SpotlightCard>
  </motion.div>
);

interface SystemsSectionProps {
  scrollToContact: () => void;
}

const SystemsSection: React.FC<SystemsSectionProps> = ({ scrollToContact }) => (
  <section id="systems" className="relative py-24 md:py-32 bg-[var(--surface-1)] overflow-hidden">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(14,165,233,0.07),transparent)]" />
    <div className="max-w-[1400px] mx-auto px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-20"
      >
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--glacier)] mb-4">
          Operational Systems
        </p>
        <h2 className="font-heading text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
          Built for the way modern
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--glacier-glow)] to-[var(--frost)]">
            businesses actually run.
          </span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
          Three deployment models. All engineered for performance, security, and full ownership.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        <ServiceCard
          index={0}
          icon={<Code className="w-8 h-8" />}
          badge="Flagship"
          title="Custom Operational Systems"
          description="Hand-built React/Next.js infrastructure engineered for maximum performance and complete operational control. Zero platform rent. Full source ownership."
          features={['Zero Platform Rent', '100/100 Core Web Vitals', 'Full Source Ownership']}
          pricing="One-Time"
          pricingLabel="Fixed"
          ctaLabel="Initiate"
          accentVar="var(--glacier)"
          onCta={scrollToContact}
        />
        <ServiceCard
          index={1}
          icon={<Layout className="w-8 h-8" />}
          title="Platform Hybrid"
          description="Visually engineered on modern visual builders (Wix Studio / Webflow) for teams that need daily content control without sacrificing craft."
          features={['Premium UI/UX Design', 'Seamless Handoff', 'Operational Training']}
          pricing="Build"
          pricingLabel="Flat Rate"
          ctaLabel="Configure This"
          accentVar="var(--frost)"
          onCta={scrollToContact}
        />
        <ServiceCard
          index={2}
          icon={<Zap className="w-8 h-8" />}
          title="Application Systems"
          description="Complex data-intensive software — dashboards, booking engines, civic intelligence platforms, AI pipelines, and robust API integrations."
          features={['Full-Stack Engineering', 'Identity & Security', 'Scalable Infrastructure']}
          pricing="Scope"
          pricingLabel="Evaluated"
          ctaLabel="Consult With Us"
          accentVar="var(--glacier-glow)"
          onCta={scrollToContact}
        />
      </div>
    </div>
  </section>
);

export default SystemsSection;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run dev
```

Expected: no errors in terminal.

- [ ] **Step 3: Commit**

```bash
git add components/SystemsSection.tsx
git commit -m "feat: add SystemsSection with inline 3-column service cards"
```

---

### Task 5: Build WhyCustomSection Component

**Files:**
- Create: `components/WhyCustomSection.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useInView } from 'framer-motion';
import { X, Check } from 'lucide-react';

const PAIN_POINTS = [
  { label: 'Squarespace', cost: '$276/yr' },
  { label: 'Zapier', cost: '$588/yr' },
  { label: 'Notion', cost: '$192/yr' },
  { label: 'Hotjar + Analytics', cost: '$360/yr' },
  { label: 'Plugin & Support Fees', cost: '$384/yr' },
];

const ARCTOS_WINS = [
  'One-time build. You own it forever.',
  'No monthly fees. No vendor lock-in.',
  'Built specifically for your operations.',
  'Full source code. Full data sovereignty.',
];

const AnimatedCost = ({ target, prefix = '' }: { target: number; prefix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 60, damping: 18 });

  useEffect(() => {
    if (isInView) motionValue.set(target);
  }, [isInView, motionValue, target]);

  useEffect(() => {
    return spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = `${prefix}${Math.round(v).toLocaleString()}+/yr`;
    });
  }, [spring, prefix]);

  return <span ref={ref}>{prefix}0/yr</span>;
};

const WhyCustomSection: React.FC = () => (
  <section className="relative py-24 md:py-32 bg-[var(--surface-0)] overflow-hidden">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(14,165,233,0.03),transparent)]" />
    <div className="max-w-[1400px] mx-auto px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-20"
      >
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--glacier)] mb-4">
          The Case for Infrastructure
        </p>
        <h2 className="font-heading text-4xl md:text-6xl font-extrabold text-white tracking-tight">
          Fragmented tools cost you
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--glacier-glow)] to-[var(--frost)]">
            more than money.
          </span>
        </h2>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: The Subscription Trap */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border border-red-900/30 bg-[#0d0808] p-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.04),transparent_60%)] pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-900/40 bg-red-950/30 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-red-400 mb-8">
              <X className="w-3 h-3" /> The Subscription Trap
            </div>
            <div className="space-y-3 mb-8">
              {PAIN_POINTS.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center justify-between rounded-xl border border-red-900/20 bg-red-950/10 px-5 py-3.5"
                >
                  <span className="text-slate-300 text-sm font-medium">{item.label}</span>
                  <span className="font-mono text-sm text-red-400">{item.cost}</span>
                </motion.div>
              ))}
              <div className="flex items-center justify-between rounded-xl border border-red-800/30 bg-red-950/15 px-5 py-3.5">
                <span className="text-slate-500 text-sm">+ more integrations...</span>
                <span className="font-mono text-sm text-red-600">???</span>
              </div>
            </div>
            <div className="border-t border-red-900/30 pt-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-600 mb-2">
                Annual recurring cost
              </p>
              <p className="font-heading text-5xl font-extrabold text-red-400">
                <AnimatedCost target={5400} prefix="$" />
              </p>
              <p className="text-red-500/60 text-sm mt-3 font-light">
                Zero ownership · Brittle integrations · Vendor dependency
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right: The Arctos Way */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border border-[var(--glacier)]/20 bg-[var(--surface-2)] p-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.07),transparent_60%)] pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--glacier)]/30 bg-[var(--glacier)]/10 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--glacier-glow)] mb-8">
              <Check className="w-3 h-3" /> The Arctos Way
            </div>
            <div className="space-y-3 mb-8">
              {ARCTOS_WINS.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-4 rounded-xl border border-[var(--glacier)]/12 bg-[var(--glacier)]/5 px-5 py-4"
                >
                  <Check className="w-4 h-4 text-[var(--glacier-glow)] flex-shrink-0" />
                  <span className="text-white text-sm font-medium">{item}</span>
                </motion.div>
              ))}
            </div>
            <div className="border-t border-[var(--glacier)]/15 pt-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-600 mb-2">
                Investment type
              </p>
              <p className="font-heading text-5xl font-extrabold text-[var(--glacier-glow)]">
                One-Time
              </p>
              <p className="text-[var(--glacier-glow)]/60 text-sm mt-3 font-light">
                Permanent asset · Full ownership · Scales with you
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default WhyCustomSection;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run dev
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/WhyCustomSection.tsx
git commit -m "feat: add WhyCustomSection with animated cost comparison panels"
```

---

### Task 6: Build WorkflowSection Component

**Files:**
- Create: `components/WorkflowSection.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Search, Layers, Code, Rocket } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    title: 'Discovery Sprint',
    description:
      'Architecture review, user flow mapping, operational requirements, and clear success criteria. We document everything before writing a line of code.',
    Icon: Search,
  },
  {
    number: '02',
    title: 'System Design',
    description:
      'Component architecture, data flow diagrams, integration specs, and a full written scope with fixed milestones and transparent pricing. No surprises.',
    Icon: Layers,
  },
  {
    number: '03',
    title: 'Build & Integrate',
    description:
      'Staged delivery with weekly reviews, automated performance testing, security hardening, and continuous client visibility into progress.',
    Icon: Code,
  },
  {
    number: '04',
    title: 'Launch & Handoff',
    description:
      'Production deployment, full documentation, team training, and optional ongoing support. You receive everything — including the complete source code.',
    Icon: Rocket,
  },
] as const;

const WorkflowSection: React.FC = () => (
  <section className="relative py-24 md:py-32 bg-[var(--surface-1)] overflow-hidden">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(14,165,233,0.05),transparent)]" />
    <div className="max-w-[1400px] mx-auto px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-20"
      >
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--glacier)] mb-4">
          The Process
        </p>
        <h2 className="font-heading text-4xl md:text-6xl font-extrabold text-white tracking-tight">
          How we engineer
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--glacier-glow)] to-[var(--frost)]">
            your system.
          </span>
        </h2>
      </motion.div>

      {/* Desktop: Horizontal with connecting line */}
      <div className="hidden md:grid grid-cols-4 gap-6 relative">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="absolute top-[3.2rem] left-[12.5%] right-[12.5%] h-[1px] bg-gradient-to-r from-[var(--glacier)]/40 via-[var(--glacier-glow)] to-[var(--glacier)]/40 origin-left"
        />
        {STEPS.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center group"
          >
            <div className="relative mb-8">
              <div className="w-[6.5rem] h-[6.5rem] rounded-full border border-[var(--glacier)]/25 bg-[var(--surface-2)] flex items-center justify-center group-hover:border-[var(--glacier)] group-hover:bg-[var(--glacier)]/8 transition-all duration-500 shadow-[0_0_30px_rgba(14,165,233,0.04)] group-hover:shadow-[0_0_40px_rgba(14,165,233,0.15)]">
                <step.Icon className="w-7 h-7 text-[var(--glacier-glow)]" />
              </div>
              <span className="absolute -top-1 -right-1 font-mono text-[9px] font-bold text-[var(--glacier)] bg-[var(--surface-0)] border border-[var(--glacier)]/30 rounded-full w-6 h-6 flex items-center justify-center">
                {i + 1}
              </span>
            </div>
            <h3 className="font-heading text-lg font-bold text-white mb-3 group-hover:text-[var(--glacier-glow)] transition-colors duration-300">
              {step.title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed font-light">{step.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Mobile: Vertical */}
      <div className="md:hidden flex flex-col gap-5 relative">
        <div className="absolute left-6 top-6 bottom-6 w-[1px] bg-gradient-to-b from-[var(--glacier)]/50 via-[var(--glacier-glow)]/60 to-[var(--glacier)]/10" />
        {STEPS.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex gap-5 pl-14 relative"
          >
            <div className="absolute left-0 w-12 h-12 rounded-full border border-[var(--glacier)]/30 bg-[var(--surface-2)] flex items-center justify-center">
              <step.Icon className="w-5 h-5 text-[var(--glacier-glow)]" />
            </div>
            <div className="rounded-2xl border border-white/8 bg-[var(--surface-2)] p-6 flex-1">
              <span className="font-mono text-[9px] text-[var(--glacier)] uppercase tracking-[0.3em]">
                {step.number}
              </span>
              <h3 className="font-heading text-base font-bold text-white mt-2 mb-2">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-light">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default WorkflowSection;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run dev
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/WorkflowSection.tsx
git commit -m "feat: add WorkflowSection with animated 4-step process visualization"
```

---

### Task 7: Build TrustSection Component

**Files:**
- Create: `components/TrustSection.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useInView } from 'framer-motion';
import { HERO_STATS } from '../lib/siteContent';

const CountUp = ({ value, label }: { value: string; label: string }) => {
  const hasNumber = /\d/.test(value);
  const numericPart = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  const suffix = value.replace(/[0-9.]/g, '');

  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 55, damping: 15 });

  useEffect(() => {
    if (isInView && hasNumber) motionValue.set(numericPart);
  }, [isInView, hasNumber, motionValue, numericPart]);

  useEffect(() => {
    if (!hasNumber) return;
    return spring.on('change', (v) => {
      if (ref.current) {
        const rounded = Number.isInteger(numericPart) ? Math.round(v) : v.toFixed(1);
        ref.current.textContent = `${rounded}${suffix}`;
      }
    });
  }, [spring, hasNumber, numericPart, suffix]);

  return (
    <div className="flex flex-col items-center text-center gap-4 group">
      <span
        ref={ref}
        className="font-heading text-6xl md:text-7xl font-extrabold text-white group-hover:text-[var(--glacier-glow)] transition-colors duration-500"
      >
        {value}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-600 max-w-[12rem] leading-relaxed">
        {label}
      </span>
    </div>
  );
};

const TrustSection: React.FC = () => (
  <section className="relative py-24 md:py-36 bg-[var(--surface-0)] overflow-hidden">
    {/* bear.png as faded northern identity background */}
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      <img
        src="/bear.png"
        alt=""
        aria-hidden
        className="w-[550px] md:w-[850px] object-contain opacity-[0.035] mix-blend-screen select-none"
      />
    </div>
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(14,165,233,0.04),transparent)]" />

    <div className="max-w-[1400px] mx-auto px-6 relative z-10">
      {/* Stat blocks */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-16 md:gap-24 mb-24"
      >
        {HERO_STATS.map((stat) => (
          <CountUp key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </motion.div>

      {/* Copy block */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="max-w-3xl mx-auto text-center"
      >
        <h3 className="font-heading text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
          Canadian-built.
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--glacier-glow)] to-[var(--frost)]">
            Enterprise-proven.
          </span>
        </h3>
        <p className="text-slate-500 text-lg leading-relaxed font-light mb-10">
          Every system we ship meets enterprise standards for performance, security, and scalability.
          Your data stays yours — no third-party platform can access, sell, or restrict it.
        </p>
        <div className="inline-flex items-center gap-3 rounded-full border border-[var(--glacier)]/15 bg-[var(--surface-2)]/80 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--glacier-glow)]" />
          Canada · Remote-first · Data Sovereign
        </div>
      </motion.div>
    </div>
  </section>
);

export default TrustSection;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run dev
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/TrustSection.tsx
git commit -m "feat: add TrustSection with animated stat counters and bear.png northern identity"
```

---

## PHASE 3 — Integration (do these after Phase 2 is complete)

### Task 8: Rewire App.tsx

**Files:**
- Modify: `App.tsx`

This is the largest task. It replaces the nav logo, wires all new sections into the page, removes the ServicesPage route, updates the PROJECTS array to use real screenshots, and updates the footer.

- [ ] **Step 1: Replace the PROJECTS array at the top of App.tsx**

Find the `const PROJECTS: Project[]` block and replace it entirely:

```tsx
const PROJECTS: Project[] = [
  {
    id: 'starlings',
    name: 'Starlings Support Map',
    type: 'Youth Infrastructure Platform',
    url: 'aldo140.github.io/Starlings',
    href: 'https://aldo140.github.io/Starlings/',
    description:
      'Anonymous support map for youth impacted by family substance use. Real-time resource discovery, community notes, and vetted Canadian support services — built with React 19, Leaflet, and Google Apps Script moderation.',
    image: '/project-starlings.png',
    tags: ['React 19', 'Leaflet', 'Firebase', 'Motion'],
    featured: true,
  },
  {
    id: 'calgary-watch',
    name: 'Calgary Watch',
    type: 'Civic Safety Intelligence System',
    url: 'calgarywatch.ca',
    href: 'https://calgarywatch.ca/',
    description:
      'Canadian non-profit safety intelligence platform: community incident reports, 511 Alberta traffic, Environment Canada alerts, municipal open-data layers, and crime choropleths. Firebase Firestore, react-leaflet, GitHub Actions ingest.',
    image: '/project-calgarywatch.png',
    tags: ['Firebase', 'Leaflet', 'Actions', 'Apache-2'],
    featured: true,
  },
  {
    id: 'rio-alto',
    name: 'Rio Alto',
    type: 'Hospitality Digital Platform',
    url: 'rioalto.ca',
    description:
      'Custom static site for a premium Calgary restaurant. 99/100 Lighthouse. Zero monthly platform fees — the client owns the build permanently.',
    image: '/project-rioalto.png',
    tags: ['Static', 'SEO', 'Performance'],
  },
  {
    id: 'mru-hacks',
    name: 'MRU Hacks',
    type: 'High-Traffic Event Platform',
    url: 'mruhacks.ca',
    description:
      'High-traffic hackathon registration portal engineered for 500+ concurrent users. Scalable front-end with real-time capacity management and smooth onboarding flows.',
    image: '/project-mruhacks.png',
    tags: ['Events', 'Scale', 'React'],
  },
];
```

- [ ] **Step 2: Add imports for all new section components**

Find the existing import block at the top of `App.tsx` and add these imports after the existing component imports:

```tsx
import HeroSection from './components/HeroSection';
import SystemsSection from './components/SystemsSection';
import WhyCustomSection from './components/WhyCustomSection';
import WorkflowSection from './components/WorkflowSection';
import TrustSection from './components/TrustSection';
```

Also remove the import of `{ Layers }` from `lucide-react` since it's being replaced by the polar bear logo image. Update the lucide-react import line to remove `Layers` from it.

- [ ] **Step 3: Replace the Nav logo in App.tsx**

Find this block in the Nav:
```tsx
<div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-glow)] text-[var(--surface-0)] shadow-md md:h-10 md:w-10">
  <Layers className="h-5 w-5" />
</div>
<span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 md:text-xs">
  ARCTOS<span className="text-[var(--accent-glow)]"> LAUNCH</span>
</span>
```

Replace with:
```tsx
<img
  src="https://www.image2url.com/r2/default/images/1779334554589-8e1c8308-a058-4149-84d1-42e881122291.png"
  alt="Arctos Launchpad"
  className="h-9 w-9 object-contain"
/>
<span className="font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-white md:text-xs">
  ARCTOS <span className="text-[var(--glacier-glow)]">LAUNCHPAD</span>
</span>
```

- [ ] **Step 4: Update the Nav CTA button and links**

Find the desktop nav links block. Change the "Services" button `onClick` from `() => navigateTo('services')` to scroll to the systems section:

```tsx
<button
  onClick={() => {
    const el = document.getElementById('systems');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  }}
  className={`relative transition-colors text-slate-400 hover:text-white`}
>
  Systems
</button>
```

Change the nav CTA button text from "Book call" to "Start Your Infrastructure".

- [ ] **Step 5: Update the mobile menu logo**

In the mobile menu header, find:
```tsx
<div className="w-9 h-9 bg-[var(--accent)] text-white flex items-center justify-center rounded-sm">
  <Layers className="w-5 h-5" />
</div>
ARCTOS
```

Replace with:
```tsx
<img
  src="https://www.image2url.com/r2/default/images/1779334554589-8e1c8308-a058-4149-84d1-42e881122291.png"
  alt="Arctos Launchpad"
  className="h-9 w-9 object-contain"
/>
<span className="font-sans text-sm font-bold uppercase tracking-[0.2em] text-white">
  ARCTOS <span className="text-[var(--glacier-glow)]">LAUNCHPAD</span>
</span>
```

- [ ] **Step 6: Replace the LandingPage component body**

Find the `LandingPage` component's return JSX. Replace the entire `<motion.div>` content with the new section order. Keep the `ref`, `initial`, `animate`, `exit`, `className` props on the wrapper div but replace the inner content:

```tsx
return (
  <motion.div
    ref={landRef}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="w-full"
  >
    <HeroSection
      scrollToContact={scrollToContact}
      onViewSystems={() => {
        const el = document.getElementById('systems');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }}
      prefersReducedMotion={prefersReducedMotion}
    />

    <SystemsSection scrollToContact={scrollToContact} />

    <WhyCustomSection />

    <WorkflowSection />

    {/* Selected Systems — editorial bento */}
    <section className="relative w-full overflow-hidden border-t border-white/5 bg-[var(--surface-1)] py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_50%_at_50%_0%,rgba(14,165,233,0.08),transparent)]" />
      <div className="relative z-10 mx-auto mb-16 max-w-[1400px] px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-[1px] bg-[var(--glacier-glow)]" />
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[var(--glacier-glow)]">Showcase</span>
        </div>
        <h2 className="font-heading text-5xl font-extrabold tracking-tight text-white md:text-8xl lg:text-[7rem] leading-[0.9]">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--glacier-glow)] via-white to-[var(--frost)]">Arsenal</span>
        </h2>
        <p className="mt-8 max-w-2xl font-mono text-[11px] uppercase tracking-[0.3em] text-slate-500 font-bold border-l-2 border-[var(--glacier)] pl-4">
          Live systems — civic infrastructure, youth platforms, and flagship digital brands deployed in the wild.
        </p>
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-12">
          {featuredProjects[0] && (
            <ProjectWorkCard project={featuredProjects[0]} className="lg:col-span-7 lg:min-h-[500px]" />
          )}
          {featuredProjects[1] && (
            <ProjectWorkCard project={featuredProjects[1]} className="lg:col-span-5 lg:min-h-[500px]" />
          )}
          {otherProjects.map((p) => (
            <ProjectWorkCard key={p.id} project={p} className="lg:col-span-4 lg:min-h-[400px]" />
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-20 text-center flex justify-center">
        <button
          type="button"
          onClick={scrollToContact}
          className="group inline-flex items-center gap-4 border border-white/15 bg-black/40 backdrop-blur-md px-10 py-5 rounded-full font-mono text-[11px] uppercase tracking-[0.3em] text-white transition-all hover:border-[var(--glacier-glow)] hover:bg-[var(--glacier-glow)]/8 hover:shadow-[0_0_30px_rgba(14,165,233,0.15)]"
        >
          Request Full Case Studies <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </section>

    <TrustSection />

    <section className="mx-auto max-w-[820px] px-6 py-20 md:py-28">
      <FaqSection items={FAQ_ITEMS} />
    </section>
  </motion.div>
);
```

Also ensure `featuredProjects` and `otherProjects` are still defined in scope:
```tsx
const featuredProjects = PROJECTS.filter((p) => p.featured);
const otherProjects = PROJECTS.filter((p) => !p.featured);
```

- [ ] **Step 7: Remove the ServicesPage route from AnimatePresence**

Find the `AnimatePresence` block in the `App` component that renders either `LandingPage` or `ServicesPage`. Simplify it to always render `LandingPage` (desktop) or `MobileLandingPage` (mobile), removing the `view === 'services'` branch and the `ServicesPage` component entirely.

Replace:
```tsx
{view === 'home' ? (
  isMobile ? <MobileLandingPage ... /> : <LandingPage ... />
) : (
  <ServicesPage key="services" scrollToContact={scrollToContact} />
)}
```

With:
```tsx
{isMobile ? (
  <MobileLandingPage key="mobile-landing" onLearnMore={() => {
    const el = document.getElementById('systems');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }} scrollToContact={scrollToContact} />
) : (
  <LandingPage key="landing" onLearnMore={() => {}} scrollToContact={scrollToContact} prefersReducedMotion={prefersReducedMotion} isMobile={isMobile} />
)}
```

- [ ] **Step 8: Update the Footer**

Find the footer `<footer>` block. Replace the logo section:

```tsx
<div className="flex items-center gap-3 font-bold text-white text-2xl">
  <img
    src="https://www.image2tool.com/r2/default/images/1779334554589-8e1c8308-a058-4149-84d1-42e881122291.png"
    alt="Arctos Launchpad"
    className="h-10 w-10 object-contain"
  />
  ARCTOS LAUNCHPAD
</div>
```

Note: use the correct URL:
```
https://www.image2url.com/r2/default/images/1779334554589-8e1c8308-a058-4149-84d1-42e881122291.png
```

And update the footer bottom bar text to:
```tsx
© {new Date().getFullYear()} ARCTOS LAUNCHPAD · Built in Canada
```

- [ ] **Step 9: Verify the full build and dev server**

```bash
npm run dev
```

Open browser at `http://localhost:5173`. Verify:
- Polar bear logo visible in nav
- Hero section shows with glacier blue headline
- Systems section (3 cards) visible on scroll
- WhyCustomSection comparison visible
- WorkflowSection 4 steps visible
- Arsenal / work section shows real project screenshots
- TrustSection shows stat counters
- FAQ section visible
- Footer shows polar bear logo + "Built in Canada"

- [ ] **Step 10: Update `types.ts` — remove unused ViewState**

Replace the `ViewState` type:
```ts
export type ViewState = 'home' | 'contact';
```

Also remove the `view` state and `navigateTo` function from App.tsx entirely if they are no longer used after removing the ServicesPage branch. Replace any remaining `navigateTo('services')` calls with a scroll to `#systems`.

- [ ] **Step 11: Update the Marquee component with enterprise terms**

In App.tsx, find the `Marquee` component. Replace the items array inside both the `reduceMotion` branch and the animated branch. The items currently read "HashRouter", "Apps Script", "Live Ingest". Replace with:

For the animated branch, change every instance of the 3 repeated spans to:
```tsx
<span className="text-2xl md:text-5xl font-heading font-semibold text-slate-700 uppercase tracking-widest flex items-center gap-8">
  AI Automation <Star className="w-4 h-4 md:w-8 md:h-8 text-[var(--glacier)]/40 fill-[var(--glacier)]/40" />
</span>
<span className="text-2xl md:text-5xl font-heading font-semibold text-slate-600 uppercase tracking-widest flex items-center gap-8">
  Custom Infrastructure <Star className="w-4 h-4 md:w-8 md:h-8 text-[var(--glacier)]/30 fill-[var(--glacier)]/30" />
</span>
<span className="text-2xl md:text-5xl font-heading font-semibold text-white uppercase tracking-widest flex items-center gap-8">
  Enterprise Systems <Star className="w-4 h-4 md:w-8 md:h-8 text-[var(--glacier-glow)] fill-[var(--glacier-glow)]" />
</span>
```

For the `reduceMotion` static branch, update the 3 spans equivalently:
```tsx
<span className="...">AI Automation <Star .../></span>
<span className="...">Custom Infrastructure <Star .../></span>
<span className="...">Enterprise Systems <Star .../></span>
```

- [ ] **Step 12: Commit**

```bash
git add App.tsx types.ts
git commit -m "feat: rewire App.tsx with new section components, polar bear logo, enterprise marquee, real project screenshots"
```

---

### Task 9: Update MobileLandingPage

**Files:**
- Modify: `App.tsx` — `MobileLandingPage` component only

- [ ] **Step 1: Replace mobile hero badge and headline**

In `MobileLandingPage`, find the mobile hero section. Update:

1. Badge text: keep existing "Enterprise Infrastructure" badge style, text stays.

2. H1: Replace existing headline with:
```tsx
<h1 className="text-[2.5rem] font-heading font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-lg">
  We build the systems
  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--frost)] via-[var(--glacier-glow)] to-[var(--glacier)] mt-2">
    behind modern businesses.
  </span>
</h1>
```

3. Subhead: Replace with:
```tsx
<p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-300 font-light border-l-2 border-[var(--glacier-glow)]/40 pl-4 bg-gradient-to-r from-[var(--glacier-glow)]/5 to-transparent py-1.5 rounded-r-lg">
  ARCTOS LAUNCHPAD engineers custom operational platforms, AI workflows, and digital infrastructure for Canadian enterprises. You own everything we build.
</p>
```

- [ ] **Step 2: Update mobile "What you get" section title**

Change section title from "What you get" to "What we engineer". Keep `VALUE_PILLARS` mapping.

- [ ] **Step 3: Update mobile work section project cards**

The mobile work section maps `PROJECTS`. Since `PROJECTS` was updated in Task 8, the real screenshots and enterprise-type labels now automatically appear here. No code change needed — verify visually.

- [ ] **Step 4: Update mobile process section**

Find the hardcoded mobile process steps. Replace with:
```tsx
{[
  { step: '01', title: 'Discovery Sprint', text: 'Architecture review, user flows, and operational requirements documented before we write a line of code.' },
  { step: '02', title: 'System Design', text: 'Component architecture, data flows, integration specs, and full written scope with fixed pricing.' },
  { step: '03', title: 'Build & Integrate', text: 'Staged delivery with weekly reviews, performance testing, and security hardening.' },
  { step: '04', title: 'Launch & Handoff', text: 'Production deployment, full documentation, training, and complete source code handoff.' }
].map((item) => (
  <div key={item.step} className="rounded-2xl border border-white/8 bg-[var(--surface-2)]/80 p-5 flex gap-4">
    <div className="text-[var(--glacier-glow)]/60 text-xs font-mono tracking-[0.3em] mt-0.5">{item.step}</div>
    <div>
      <div className="text-white font-bold text-base">{item.title}</div>
      <div className="text-slate-400 text-sm mt-2 leading-relaxed font-light">{item.text}</div>
    </div>
  </div>
))}
```

- [ ] **Step 5: Update mobile CTA section**

Find the mobile CTA rounded card at the bottom. Update the text:
```tsx
<div className="text-sm uppercase tracking-widest text-[var(--glacier-glow)] font-mono">Start Your Infrastructure</div>
<h3 className="text-3xl font-heading font-semibold text-white mt-2">
  Tell us your operational goal — we'll reply with next steps within two business days.
</h3>
```

- [ ] **Step 6: Verify mobile layout**

```bash
npm run dev
```

Open browser at `http://localhost:5173`. Use DevTools device emulation (iPhone 14 or similar). Verify:
- Mobile hero shows correct headline and glacier gradient
- Real project screenshots load in mobile work section
- Process steps show updated copy
- CTA card shows updated text

- [ ] **Step 7: Commit**

```bash
git add App.tsx
git commit -m "feat: update MobileLandingPage with Arctos copy, process steps, and glacier styling"
```

---

## Final Integration Check

After all tasks are complete:

- [ ] **Run full dev server and do a complete visual pass**

```bash
npm run dev
```

Check list:
1. Nav: polar bear logo + "ARCTOS LAUNCHPAD" + "Start Your Infrastructure" CTA
2. Hero: glacier headline, stats strip, logo strip, floating dashboard images
3. Systems: 3 service cards with spotlight hover effect
4. WhyCustom: two-column comparison, cost animation on scroll
5. Workflow: 4 steps with connecting line on desktop
6. Arsenal: real project screenshots (starlings, calgary watch, rio alto, mru hacks)
7. Trust: stat counters animate on scroll, bear.png faded background
8. FAQ: 5 updated questions
9. Contact: "Engineer your operational future." headline
10. Footer: polar bear logo + "Built in Canada"
11. Mobile: toggle DevTools → all sections correct on small screen

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat: complete Arctos Launchpad full architectural rebrand

New design system: glacier blue palette, Space Grotesk typography.
Polar bear logo throughout nav, mobile menu, footer.
5 new section components: Hero, Systems, WhyCustom, Workflow, Trust.
Real project screenshots from WebProjects folder.
Enterprise copy across all sections.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
