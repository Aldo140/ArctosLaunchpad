# ARCTOS LAUNCHPAD — Full Architectural Rewrite
**Date:** 2026-05-21  
**Approach:** B + C — Architectural rewrite with parallel agent delivery  
**Status:** Approved

---

## Goal

Transform the existing BaseLayer/ARCTOS LAUNCHPAD site from a freelancer studio aesthetic into a premium Canadian digital infrastructure company — the operational and visual equivalent of Linear + Stripe + Framer, built in Canada.

The result must feel: unforgettable, cinematic, engineered, enterprise-grade.

---

## Design System

### Color Tokens (update `index.css`)

| Token | Value | Purpose |
|---|---|---|
| `--surface-0` | `#020408` | Deepest background — blue-shifted near-black |
| `--surface-1` | `#070d14` | Section backgrounds |
| `--surface-2` | `#0d1520` | Cards, panels |
| `--glacier` | `#0ea5e9` | Primary accent — glacier blue |
| `--glacier-glow` | `#38bdf8` | Glow states, borders |
| `--frost` | `#bae6fd` | Light frost for large display text |
| `--zinc` | `#3f4651` | Structural panel borders |

### Typography

| Use | Font | Notes |
|---|---|---|
| Body | `Space Grotesk` | Replace Outfit — more geometric, enterprise |
| Headings (h1–h4) | `Fraunces` | Keep — cinematic weight |
| Monospace | `IBM Plex Mono` | Keep |

Update Google Fonts import in `index.css`:
```
Space Grotesk:wght@300;400;500;700
Fraunces:opsz,wght@9..144,300;400;700;800;900
IBM+Plex+Mono:wght@400;700
```

### Motion Philosophy

- Scroll-linked reveals via Framer Motion `whileInView` + GSAP ScrollTrigger
- Magnetic hover interactions on cards (existing `SpotlightCard` pattern — keep)
- Subtle depth transforms: `rotateX`, `rotateY` on cards (4–8deg max)
- No aggressive spring bouncing — weighted, deliberate, like Linear
- Reduced motion: all animations respected via `useReducedMotion`

---

## Logo

Replace every `<Layers />` icon instance with:

```tsx
<img
  src="https://www.image2url.com/r2/default/images/1779334554589-8e1c8308-a058-4149-84d1-42e881122291.png"
  alt="Arctos Launchpad — geometric polar bear"
  className="h-9 w-9 object-contain"
/>
```

Locations: Nav (desktop + mobile), Mobile menu header, Footer.

---

## Section Architecture

### Nav (update `App.tsx`)

- Logo: polar bear `<img>` + "ARCTOS LAUNCHPAD" in Space Grotesk
- Nav items: "Systems" (scrolls to SystemsSection) · "Work" (scrolls to work section) · "Contact"
- CTA button: "Start Your Infrastructure"
- Mobile menu: same structure, full-screen overlay (keep existing implementation, update copy/logo)

---

### Section 1 — HERO (`components/HeroSection.tsx`)

**Layout:** Full-screen, 12-column grid. Left 6 cols = text + CTAs. Right 6 cols = floating UI composition.

**Left column:**
- Badge: `● Enterprise Digital Infrastructure · Canada`
- H1: `"We build the systems behind modern businesses."`
- Subhead: `"ARCTOS LAUNCHPAD engineers custom operational platforms, AI workflows, and digital infrastructure for Canadian enterprises. You own everything we build."`
- CTA primary: `"Start Your Infrastructure"` → scrolls to contact
- CTA secondary: `"View Our Systems"` → scrolls to SystemsSection
- Stats strip: `50+ Systems` / `99.9% Uptime` / `100% Ownership`
- Logo strip: `<img src="/logo-strip.png" />`

**Right column:**
- Layered floating composition: `dashboardUI.png` (large, top-right, slight rotateY) + `analytics-card.png` (floating lower-left, animate y loop)
- Ambient cyan glow blob behind composition
- Subtle grid overlay on hero background

**Background:** `bakcground-mountains.png` at 20% opacity, mix-blend-screen, gradient overlay to surface-0. Grid pattern. Noise texture.

**Scroll indicator:** Thin vertical line + "Scroll to explore" in mono.

**Animations:**
- Badge: `fadeIn` delay 0.2s
- H1: `rotateX(15deg) → 0`, `y: 30 → 0`, duration 1.1s
- Subhead: `y: 16 → 0`, delay 0.15s
- CTAs: `y: 16 → 0`, delay 0.3s
- Right composition: `x: 40, rotateY: -15, scale: 0.9 → natural`, delay 0.4s

---

### Section 2 — SYSTEMS (`components/SystemsSection.tsx`)

Replaces the Services page — brings services inline on the landing page. The `ServicesPage` route is removed; nav link points to this section's anchor.

**Layout:** 3-column card grid on desktop, stacked on mobile.

**Section header:**
- Eyebrow: `OPERATIONAL SYSTEMS`
- H2: `"Built for the way modern businesses actually run."`
- Subhead: `"Three deployment models. All engineered for performance, security, and full ownership."`

**Cards (3):**

1. **Custom Operational Systems** — Flagship badge, glacier accent, `<Code />` icon
   - Body: `"Hand-built React/Next.js infrastructure engineered for maximum performance and complete operational control. Zero platform rent."`
   - Features: Zero Platform Rent / 100/100 Core Web Vitals / Full Source Ownership
   - CTA: `"Initiate"`

2. **Platform Hybrid** — `<Layout />` icon
   - Body: `"Visually engineered on modern visual builders (Wix Studio / Webflow) for teams that need daily content control without sacrificing craft."`
   - Features: Premium UI/UX Design / Seamless Handoff / Operational Training
   - CTA: `"Configure This"`

3. **Application Systems** — `<Zap />` icon, warm accent
   - Body: `"Complex data-intensive software — dashboards, booking engines, civic intelligence platforms, AI pipelines, and API integrations."`
   - Features: Full-Stack Engineering / Identity & Security / Scalable Infrastructure
   - CTA: `"Consult With Us"`

Each card: `SpotlightCard` wrapper, dark panel, top 1px gradient accent bar, hover scale + glow.

---

### Section 3 — WHY CUSTOM INFRASTRUCTURE (`components/WhyCustomSection.tsx`)

**Layout:** Two-column comparison on desktop (stacked on mobile). Full-width section.

**Section header:**
- Eyebrow: `THE CASE FOR INFRASTRUCTURE`
- H2: `"Fragmented tools are costing you more than money."`

**Left column — "The Fragmented Stack"** (zinc/red-tinted panel):
- Title: `"The Subscription Trap"`
- Animated pain-point list (stagger reveal):
  - `Squarespace — $276/yr`
  - `Zapier — $588/yr`
  - `Notion — $192/yr`
  - `+ 4 more SaaS tools...`
  - `= $1,800+/yr · Zero ownership · Brittle integrations`
- Counter: Total 3-year cost animates up to `$5,400+`
- Red/zinc aesthetic, subtle noise texture

**Right column — "The Arctos Way"** (glacier-tinted panel):
- Title: `"Engineered Infrastructure"`
- Feature list (check marks, glacier accent):
  - `One-time build. You own it forever.`
  - `No monthly fees. No vendor lock-in.`
  - `Built specifically for your operations.`
  - `Full source code. Full sovereignty.`
- Counter: One-time investment, permanent asset
- Glacier aesthetic, glow effect

**Connecting element:** A thin horizontal arrow or VS badge between the two columns.

**Animations:** Columns slide in from opposite sides on scroll. Cost counter animates with `useMotionValue` + spring.

---

### Section 4 — OPERATIONAL WORKFLOWS (`components/WorkflowSection.tsx`)

**Layout:** 4-step horizontal process on desktop, vertical on mobile.

**Section header:**
- Eyebrow: `THE PROCESS`
- H2: `"How we engineer your system."`

**Steps:**

| # | Title | Description |
|---|---|---|
| 01 | Discovery Sprint | Architecture review, user flows, operational mapping, and clear success criteria. |
| 02 | System Design | Component architecture, data flows, integration specs, and full written scope. |
| 03 | Build & Integrate | Staged delivery with regular reviews, performance testing, and security hardening. |
| 04 | Launch & Handoff | Production deployment, documentation, training, and optional ongoing support. |

**Visual:** Each step = numbered card. Connecting animated line between steps (gradient, draws in left-to-right on scroll via GSAP `drawSVG` or CSS clip-path animation). Step cards have subtle hover lift.

**Mobile:** Vertical stack, connecting line runs top-to-bottom.

---

### Section 5 — SELECTED SYSTEMS (`App.tsx` — existing bento grid, copy update)

Keep the existing editorial bento grid layout and `ProjectWorkCard` component. Update copy for enterprise framing.

**Section heading:** `"THE ARSENAL"` — keep.

**Project copy updates:**

| Project | Old Type | New Enterprise Type |
|---|---|---|
| Starlings Support Map | Youth support · Community map | Youth Infrastructure Platform |
| Calgary Watch | Non-profit · Live safety map | Civic Safety Intelligence System |
| Rio Alto | Restaurant experience | Hospitality Digital Platform |
| Khoi's Creation | E-commerce brand | E-Commerce Brand System |
| MRU Hacks | University event | High-Traffic Event Platform |

Card CTA: Change `"Initialize"` → `"View System →"`

---

### Section 6 — TRUST & SCALE (`components/TrustSection.tsx`)

**Layout:** Full-width section. Three stat blocks centered, then a copy block below.

**Background:** `bear.png` as large faded background element (40% opacity, centered, `mix-blend-screen`) — northern identity without being heavy-handed.

**Stat blocks (3):**
- `50+` / "Operational systems deployed"
- `99.9%` / "Uptime across all live systems"
- `100%` / "Client ownership — always"

**Copy block:**
- H3: `"Canadian-built. Enterprise-proven."`
- Body: `"Every system we ship meets enterprise standards for performance, security, and scalability. Your data stays yours — no third-party platform can access, sell, or restrict it."`
- Flags/tags: `Canada · Remote-first · Data Sovereign`

**Animations:** Stats count up on scroll entry via `useMotionValue` + spring. Section fades in with slight scale.

---

### Section 7 — FAQ (update `components/FaqSection.tsx` items)

Keep existing component. Update `FAQ_ITEMS` in `lib/siteContent.ts`:

1. `"What kind of systems do you build?"` — keep, update answer to be more enterprise
2. `"How does the engagement process work?"` — keep
3. `"Do you work with existing infrastructure?"` — keep
4. `"What does 'full ownership' actually mean?"` — new Q
5. `"How long does a typical system take to build?"` — new Q

---

### Section 8 — CTA / CONTACT (`App.tsx` — existing contact section, copy update)

**Headline:** `"Engineer your"` + `"operational future."` (keep existing gradient span)

**Subhead:** `"Book a free architecture discovery call. We'll map your operational needs, discuss system strategy, and confirm if ARCTOS is the right fit — no sales pitch, just expertise."`

**CTA primary:** `"Start Your Infrastructure →"`  
**CTA secondary:** `"View Our Systems"`

**Social proof strip:** Keep existing avatar + "Trusted by 50+ enterprise teams" block.

`ContactForm` component: unchanged.

---

### Footer (update `App.tsx`)

- Logo: polar bear `<img>` + `ARCTOS LAUNCHPAD` in Space Grotesk
- Tagline: `"Custom operational systems. Enterprise dashboards. AI automation. Digital infrastructure engineered for scale."`
- Links: Systems / Work / Contact / Privacy / Terms
- Bottom bar: `© 2026 ARCTOS LAUNCHPAD · Built in Canada`

---

## Files Changed

| File | Action |
|---|---|
| `index.css` | Update tokens, swap Outfit → Space Grotesk, update CSS vars |
| `lib/siteContent.ts` | Update all copy: VALUE_PILLARS, AUDIENCE_SEGMENTS, FAQ_ITEMS, HERO_STATS |
| `App.tsx` | Rewire to new components, update nav logo, contact section copy, footer |
| `components/HeroSection.tsx` | NEW — full hero implementation |
| `components/SystemsSection.tsx` | NEW — inline services cards |
| `components/WhyCustomSection.tsx` | NEW — comparison section |
| `components/WorkflowSection.tsx` | NEW — 4-step process |
| `components/TrustSection.tsx` | NEW — stats + Canadian identity |
| `components/FaqSection.tsx` | Minor: no structural change, content via siteContent.ts |
| `components/ContactForm.tsx` | No change |
| `components/FluidBackground.tsx` | No change |
| `components/CustomCursor.tsx` | No change |
| `components/AIChat.tsx` | No change |

---

## Out of Scope

- Backend / form submission logic — unchanged
- AI chat component — unchanged
- Mobile `MobileLandingPage` component — updated separately after desktop is complete, same section structure
- New photography or asset creation — uses existing `/public` assets
- Domain / deployment — unchanged

---

## Success Criteria

The finished site should:
1. Display the polar bear logo in nav, mobile menu, and footer
2. Feel visually premium — comparable to Linear, Stripe, Vercel
3. Include all 8 sections listed above
4. Have no copy that reads like a freelancer portfolio
5. Pass a visual review: dark, structured, cinematic, operationally intelligent
6. Maintain existing animation performance (Lenis + GSAP + Framer Motion stack)
7. Remain fully responsive (mobile layout updated after desktop)
