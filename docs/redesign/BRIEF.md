# Arctos v4 — audit and design vision

October 5, 2026. Screenshots referenced here live in `docs/redesign/` and never ship
(`public/` is untouched by research imagery).

---

## 1. Audit — what's valuable, what's failing

### Worth keeping

| Keep | Why |
| --- | --- |
| `lib/content/*` | Honest, specific copy. Service pages carry real "wrong fit" lists and FAQs, which few studios publish. This becomes the spine of the new service pages. |
| Project media | Four recorded site reels, real client photography (True North Kromes chrome frameworks, Rio Alto dishes), the Starlings phone-in-hand photo. |
| Original editorial art | `the-work-moves.webp` and the **new bridge illustration** (bear building a bridge across three islands, true alpha channel). They're the only art that's unmistakably Arctos. |
| Functional plumbing | Contact API + validation + honeypot, `?need=` context, header focus trap / scroll lock, SEO graph, OG route, sitemap. |

### Failing

| Problem | Evidence |
| --- | --- |
| **The hero is broken and says little.** A missing image renders as a broken icon above the headline; the subline collides with the line diagram. "Make growth work." could be any agency. | `before/home-desktop-fold.webp`, `before/home-mobile-fold.webp` — on mobile the illustration starts below the fold after a full-width button. |
| **Two selectors do one job.** The homepage asks "What needs to work better?" with four tabs, then `/services` asks the same four tabs again. The story selector right under the hero repeats it a third time. | `before/home-desktop-full.jpg`, `before/services-desktop-full.jpg` |
| **One template, many headings.** Every interior page is a kicker, a two-tone grotesk headline, and rows. Services is a 13-row table. Work is six identical "text left, screenshot right" bands. | `before/services-desktop-full.jpg`, `before/work-desktop-full.jpg` |
| **Work is the weakest section, but it should be the strongest.** Screenshots are cropped mid-word ("design / 3D-print Co-Cr / tal frameworks"), reels sit in small boxes, and three launched projects (Nics Delite, So Social Collective, Vow Motion) aren't on the site at all. | `before/work-desktop-full.jpg` |
| **No depth, no motion that means anything.** Flat cream fields, thin rules, small type in mono. Nothing moves to explain a relationship. | All captures |
| **25,000 lines of layered CSS** from four rebuilds (`home.css` alone is 4,217 lines; `v2-*` and `v3-*` override earlier sheets in a fragile order). That's why polish never sticks. | `app/styles/` |

---

## 2. References

Captured live on October 5, 2026, at 1440×900 and 390×844 (2×).

| Reference | Source | Screenshots | What to borrow (principle, not look) |
| --- | --- | --- | --- |
| **Nics Delite** | https://www.nicsdelite.ca (Arctos redesign, live) | `references/nics-home-*.webp/.jpg` | Real photography treated as **physical objects** (arch-masked hero, polaroid, round badge) layered at different depths. Display serif + italic at enormous scale, with type *interlocking* with the image instead of sitting beside it. One motif (ribbon) traced from the product. |
| **Vow Motion** | https://vowmotionweddings.com (Arctos product) | `references/vow-home-*`, `references/vow-planners-*` | Dark cinematic first viewport; the **product as an object you can open** (envelope + prints). Each section shows a different artifact of the system rather than another card grid. Every section answers "what does the guest/planner actually get". |
| So Social Collective | https://so-social-collective-web.vercel.app | `references/social-*` | Scrapbook depth and conviction: a strong brand can stay on one idea all the way down. |

Principles extracted:

1. **One authored object owns the first viewport**, and the headline is composed *with* it.
2. **Depth through stacking real things** — prints, phones, reels — with real shadows, slight rotation, parallax at different rates.
3. **Serif-led editorial type** at real scale; italic carries the human turn.
4. **Every chapter is a different artifact**, never the same card grid twice.
5. **Motion shows causality** (an envelope opens → the reply appears).

---

## 3. Rive

Checked: no `.riv` files on disk (Downloads, Code, project folders, OneDrive), none in Google Drive
(the Arctos folder holds reports, proposals and spreadsheets), and no Rive connector in this session.
**Rive is not used.** Motion is built with the GSAP + ScrollTrigger already in the project,
so nothing depends on an unavailable service. If you export `.riv` files later, the hero's
signal layer is the natural place for them.

---

## 4. Vision

### Audience
Owners and operating leads at growing Calgary/Canadian businesses (PRODUCT.md). They think in
problems ("enquiries go nowhere", "we copy data all day", "I can't see what's working"), not in
service names.

### Positioning — *The bridge*
Your bridge illustration is the brand idea: **three islands every growing business lives on — winning
customers, running the work, and seeing the numbers — and Arctos builds the bridge between them.**
It is literally what the studio sells (websites + marketing → software + automation → reporting,
connected), it uses the bear as a builder rather than a mascot, and it gives every page a shared
grammar: islands, a deck, a signal travelling across it.

### Core message
> **Win the customer. Run the work. See the numbers.**
> Arctos designs and builds the websites, software, automation and reporting that connect them.

### Visual direction
* **Palette taken from the bridge art**: arctic ink `#0d1b1e`, paper `#f1ebdf`, bridge rust `#c4531c`, island pine `#21463f`, sage. Rust is the "signal" — the path of a customer or a task across the system.
* **Type**: Newsreader display at editorial scale (italic for the human turn), Archivo for interface, Plex Mono for captions/status. Serif-led, unlike the grotesk-everywhere current site.
* **Depth**: projects appear as stacked artifacts — reel, phone capture, photo — each on its own depth plane, with real shadows and pointer/scroll parallax. Never a fake browser frame.
* **Paper grain** as a quiet material layer, never an effect.

### Motion — every movement explains something
| Moment | Motion | What it explains |
| --- | --- | --- |
| Hero | A rust signal travels the bridge deck island → island; each island's label and its line of the headline light in turn. Art floats with pointer parallax against a slower contour layer. | The sequence: customer → work → numbers. |
| "Three islands" chapter | On scroll, three disconnected symptom cards drift apart, then a deck draws between them and they lock into one row. | Disconnected → connected. |
| Work | Pinned horizontal rail on desktop; reels play only when centred; layers move at different rates. Native swipe on mobile. | Real work, at scale. |
| Process | A route line draws as you read; each stop lights when reached. | Order of operations. |
| Services detail | Problems strike through and resolve into outcomes on scroll. | Problem → result. |

`prefers-reduced-motion`: no scrubbing, no pinning, no autoplay; everything is laid out statically and fully readable.

### Information architecture
```
/                Hero (bridge) → Three islands (problem) → Selected work → What we build (3 islands) → How it runs → Studio note → Start
/services        Three island chapters, each with its services, outcomes and proof
/services/[slug] Problem → what we do → how it runs → outcomes → when we're the wrong fit → proof → FAQ → start (context carried)
/work            Status-filtered index (live client work / platforms & tools / studio products & demos)
/work/[slug]     Full-bleed reel → facts rail → challenge / constraint / approach / what changed → media → next project
/process         Six stops on one drawn route
/studio          Who's behind it, principles, how engagements run
/industries(/x)  Industry problems → relevant services → relevant work
/contact         One short form, context-aware; what happens next
/calgary-*       Local briefs with their own audit list and proof
```
The duplicate needs-finder is removed. The single "where does it break?" entry point lives in the
homepage's three-islands chapter, and each island hands its context to `/contact?need=`.

### Visitor journeys
1. **"Enquiries go nowhere."** Hero → Island 1 card → Web Design service → Rio Alto / Nics Delite proof → Contact (pre-set to Website).
2. **"My team does this by hand."** Hero → Island 2 → Business Automation → Fresh Prep / So Social Ops → Contact (Automation).
3. **"Can they actually build?"** Hero → Work → Calgary Watch case study → next project → Contact.
4. **Local search** lands on `/calgary-web-design` → audit list → proof → Contact.

### Portfolio (honest status)
| Project | Status shown | Lead media |
| --- | --- | --- |
| Nics Delite | Live client site · redesign & migration | New reel, phone capture |
| True North Kromes | Live client site | Reel, cobalt-chrome photography |
| Calgary Watch | Live civic platform | Reel, live map, phone |
| Rio Alto | Live client site | Reel, dish photography |
| So Social Collective | Live platform · events, ops, matching | New reel, phone |
| Starlings Support Map | Live nonprofit platform | Reel, phone-in-hand photo |
| Vow Motion | Studio product · launch preview | New reel, phone |
| Fresh Prep Event Intelligence | Internal tool · figures withheld | Typeset report structure (no client data) |
| LeaseFlow | Product concept · working demo | Typeset flow |

New media were recorded from the live sites on October 5, 2026: `work/{nicsdelite,vow-motion,so-social-collective}-site.webm`, matching posters, and phone captures for all seven live sites.
Fresh Prep event photos in Drive belong to Fresh Prep staff and weren't cleared for Arctos marketing, so they aren't used.

### Engineering
The 25k lines of layered CSS are replaced with one small token-based system (`app/styles/v4/*`).
Components move to `components/site/`. Content, API, SEO and form logic stay.
