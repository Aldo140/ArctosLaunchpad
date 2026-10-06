# Arctos Launchpad — design system contract (v4, "The bridge")

**Read this before changing any UI.** If a change would break a rule here, don't make it; note it instead.
The audit, references and reasoning behind v4 are in `docs/redesign/BRIEF.md`.

---

## 1. The idea

Every growing business lives on three islands: **winning customers**, **running the work**, and
**seeing the numbers**. Arctos builds the bridge between them. The bridge illustration
(`public/assets/art/bridge.webp`) is the brand's central image, and the bear is a builder, not a mascot.

| Island | Line in the hero | Stages (content model) | `/contact?need=` |
| --- | --- | --- | --- |
| 01 Win the customer | Win the customer. | attract, convert | `website` |
| 02 Run the work | Run the work. | operate | `automation` |
| 03 See the numbers | See the numbers. | scale | `reporting` |

The grouping lives in `lib/content/islands.ts`. Services, claims and copy still come from the other content files.

## 2. Tokens

All colour lives in `app/styles/v4/tokens.css`. Nothing else hard-codes a colour except the
typeset figures, which sit on their own printed sheet.

* **Ink** `#0d1b1e`: the water the islands float in. Most hero and proof chapters.
* **Paper** `#f1ebdf` / **Bone** `#f8f4ec`: reading chapters.
* **Pine** `#21463f`: outcomes and "what changed" moments.
* **Rust** `#c4531c`: the signal, meaning the path a customer or a task takes. Used for rules, dots, the hero deck trail and hover fills. Small rust text uses `--rust-hi` on dark and `--rust-deep` on light (both ≥ 4.5:1).
* **Ink-deep** `#02131b`: only behind *the-work-moves* art, which was painted on that ground.

A section declares one tone with `tone-ink | tone-paper | tone-bone | tone-pine` **and** `data-tone`.
The header reads `data-tone` under it to stay legible.

Every `--muted` and `--faint` value meets 4.5:1 on its own tone. Re-check with real numbers if you change one.

## 3. Type

* **Newsreader** (serif) for display and headings. Its italic, in the tone's accent, carries the human turn: *"not promises."*, *"One bridge."*
* **Archivo** for interface and body.
* **Plex Mono** for eyebrows, indices, status and captions only.

Scale tokens are `--fs-hero`, `--fs-1`, `--fs-2`, `--fs-3` and `--fs-lead`. Headlines are authored in lines
(`<Lines lines={[...]}>`), so the break points are editorial decisions.

## 4. Composition

* **No two chapters share a layout on the same page.** If a section could be dropped into a generic agency site unchanged, rethink it.
* `PageHero` has three layouts (`split`, `stack`, `center`), and pages choose by content, not by habit.
* Tone alternates with purpose: ink for proof and arrival, paper and bone for reading, pine for outcomes.

## 5. Project media: honesty rules

* Real recordings, real phone captures and the client's own photography only. **No drawn browser chrome** around real screenshots.
* Every project shows its status label (`statusLabel`) and a status dot: live (green), internal (sage), studio or demo (rust).
* Projects without public media get a **typeset figure** that says what it is (`components/site/Figures.tsx`). Redactions are widths only, never numbers.
* Never invent results, clients, testimonials, awards, timelines or capabilities.

## 6. Motion: it must explain something

| Primitive | Where | Explains |
| --- | --- | --- |
| Signal along the deck + headline rules | Hero | customer → work → numbers |
| Islands settle + deck draws | Home, "three islands" | disconnected → connected |
| Pinned sideways rail, phone on a nearer plane | Home work | depth of real artifacts |
| Route line draws, stops light | Process (home + `/process`) | order of operations |
| Problems struck through | Service and industry pages | problem → resolved |
| Self-check checklist with a live count | Calgary pages | self-diagnosis |
| `[data-reveal]`, `Lines` | Everywhere | entrance only, once |

Rules:
* Only `transform` and `opacity` animate. Scrubbed timelines use GSAP ScrollTrigger; entrances are CSS transitions toggled by `components/site/Motion.tsx`.
* Content is hidden only under `html.js-motion`, which an inline script sets **only** when reduced motion isn't requested. A 4s CSS fallback makes it visible even if the script dies.
* Reduced motion: no pinning, no scrubbing, no reel autoplay, nothing dimmed, and the hero's lines are fully lit.
* No scroll hijacking on touch. The work rail pins only at `min-width: 1024px` with `pointer: fine`.
* Reels are `preload="none"` and play only while on screen.

### Lessons from the v4.1 section pass
* In scrubbed timelines, don't put `stagger` inside `fromTo`; create one tween per element. A ScrollTrigger refresh re-applies only the first target's start state.
* `gsap.matchMedia().add({...conditions})` only runs when at least one condition matches, so include an always-true condition when you need a fallback.
* A section that pins must set `refreshPriority` so pins lower on the page measure after it.
* Never change a reveal element's `className` after mount. It wipes the `is-in` class that `Motion.tsx` adds. `Motion.tsx` also arms `[data-reveal]` elements that mount later.

## 7. Conversion

* Primary action: **Start a project** (`/contact`). Island links carry `?need=` and the form shows "Starting from …".
* The form needs name, email and a sentence about the problem. Everything else is optional.
* The free reporting teardown is the one smaller, secondary offer.
* CTA copy names the action. "Learn more" is banned.

## 8. Accessibility

WCAG 2.2 AA: one H1 per page, skip link first in tab order, visible focus on every tone, a menu
dialog with scroll lock, focus trap and Escape, labelled filters with `aria-pressed`, and an `aria-live`
result count. Forms use an error summary plus per-field messages tied with `aria-describedby`.
