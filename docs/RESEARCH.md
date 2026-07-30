# Studio positioning research — credibility, work presentation, conversion, motion

Research date: 2026-07-30. Written for Arctos Launchpad against `DESIGN-SYSTEM.md`
and `PRODUCT.md`. Every recommendation below is phrased so it can be built inside
the existing vocabulary (`.section`, `.doc__*`, `.register`, `.ledger`, `.archive`,
`SpecimenStrip`, `ProjectFeature`, `lib/content.ts`) rather than as a new subsystem.

**Two hard constraints carried through the whole document.** Nothing here requires
a fabricated metric, testimonial, client name, award, certification, partnership or
address. Nothing here asks Arctos to adopt another studio's visual identity — a
copied look is the fastest way to destroy the credibility this document is trying
to build. What is extracted is *structure* and *behaviour*.

**What was actually examined.** Instrument, Work & Co (now inside Accenture Song —
verify before citing them as independent), Metalab, Clay, Bakken & Bæck, Locomotive,
Hello Monday, BASIC/DEPT, Sanctuary Computer + garden3d, thoughtbot, Uncommon,
Active Theory, plus the systems/automation tier (Ovryx, TowerHouse Studio, Studio
Dali) because that tier is Arctos's actual competitive set, not Instrument's.
Ueno is gone — acquired by Twitter in January 2021 and wound down; do not treat
`ueno.co` as a live reference. Rally Interactive did not resolve. Sources at the end.

---

## 0. The scoreboard

Ranked by expected effect on **credibility with a serious buyer** and on
**enquiries**, with honest effort and honest-supportability notes.

| #  | Recommendation | Impact | Effort | Can Arctos support this honestly today? |
|----|----------------|--------|--------|------------------------------------------|
| 1  | Put named humans on the site (studio page + case study credits + form reply signature) | Very high | S | **Yes** — real people already exist |
| 2  | Publish an engagement-terms register: rate basis, minimum engagement, billing cadence, contract, what happens if it goes wrong | Very high | S–M | **Yes** — these are internal facts, not claims |
| 3  | Cut the contact form to 4 required fields; move the two-business-day reply promise *above* the form | Very high | S | **Yes** — the promise is already written, just hidden |
| 4  | Rewrite case studies to a fixed five-beat spine with an honest "what changed" beat instead of metrics | High | M | **Yes** — direction-of-change is defensible without numbers |
| 5  | Make project status a first-class, explained taxonomy rather than a bare label | High | S | **Yes** — `ProjectStatus` already exists in `lib/content.ts` |
| 6  | Add "what this service is not / when not to hire us" to each service page | High | S | **Yes** |
| 7  | Add a live-site verification strip — real URLs, dated, visitable | High | S | **Yes** — 4 of 6 projects have `externalUrl` |
| 8  | Publish one genuine artefact of thinking per quarter (a method, not a blog) | High | M | **Yes**, if actually maintained |
| 9  | Restructure the work index around metadata rows, not a card grid | Medium–high | M | **Yes** |
| 10 | Route enquiries by type instead of one funnel | Medium | S | **Yes** |
| 11 | Add a persistent, low-weight contact affordance below the fold on long pages | Medium | S | **Yes** |
| 12 | Motion audit: one orchestrated moment per page, everything else CSS | Medium | S–M | **Yes** |
| 13 | Fix the material monotony on the homepage (currently 7 of 9 sections `instrument`) | Medium | M | **Yes** |
| 14 | Retire the client-logo wall idea permanently | Medium | — | N/A — this is a *don't* |

Items 1–3 are the ones that move enquiries this month. Items 4–7 are what make a
first-time visitor believe the studio is real. Everything below expands them.

---

## 1. Credibility without fake metrics

### 1.1 What the field actually does

The large firms lean on assets Arctos does not have and should not imitate:
Instrument fronts Nike/Google/Netflix logos plus award badges (Campaign US, Webbys,
Clios) and press pickups from LBB, It's Nice That, The Drum. BASIC/DEPT does the
same with "Agency of the Year" lines. Clay puts twenty enterprise logos above the
fold and lets an FAQ carry the substance. **Copying that shape without the assets
is the single most damaging thing a small studio can do** — an empty or weak logo
wall is read instantly as a studio that has nothing else.

The transferable credibility is concentrated in a much smaller set of firms.

**Sanctuary Computer is the most directly useful reference in the whole survey.**
Its `/info` page is five sections — Who We Are, How We Think, Testimonials,
How We Work, How We Bill — and it discloses things almost nobody discloses:
a published hourly band ($175–$295 depending on seniority), a stated engagement
floor (they rarely take projects under 480 billable hours), invoicing monthly in
arrears on Net 15, an MSA, no minimum commitment, and a blueprint phase sized at
roughly 50–100 hours. The homepage carries the same posture in plain language:
*"We price honestly, and work transparently. We have a zero surprises rule,
actively communicating priorities, blockers and spend weekly, like clockwork."*
And: *"We don't broker the work, we do the work."*

That is credibility built entirely from operational facts. No award, no metric, no
logo required. It is also *unfakeable by competitors* — a studio that subcontracts
cannot write "we don't broker the work" and survive a reference call.

The automation tier does the same thing at a smaller scale and is worth studying
precisely because it is Arctos's competitive set. Ovryx publishes fixed price bands
(€1,000–2,000 / €2,500–4,000 / €5,000–12,000), delivery windows ("Typical delivery:
7–14 days", "complex system builds typically take 2–4 weeks"), a three-step flow
(30-minute audit → build → optional maintenance at €300–600/mo), and the line
*"No hourly billing. No surprises."* TowerHouse Studio leads with *"No open-ended
consulting. Clear deliverables, defined ROI, predictable pricing"* and explicitly
names who it will not serve. Studio Dali structures every service page around five
questions: who it is for, the operational problem it solves, what is actually built,
what is included versus optional, and how scoping/build/handover work in practice.

thoughtbot's playbook is the long-horizon version: an entire public, CC-licensed
operating manual covering culture, strategy, design craft and implementation.
Publishing it is the claim. Nobody publishes a playbook they are ashamed of.

### 1.2 Ranked for Arctos — deploy in this order

**R1. Named humans. (Very high impact / small effort / fully honest)**

Right now there is not a single named person anywhere on the site.
`app/studio/page.tsx` has "Principles" and "Method" and no people. For a Calgary
studio with no logos and no awards, *a named, findable person is the single
strongest trust signal available* — and it is free. Notice that even Sanctuary
Computer, which hides individual bios on the homepage, signs its billing terms in
the first person plural and puts its people in the writing.

Build:
- A `Register`-based team block on `/studio` — name, role, one line of what they
  actually do on projects, LinkedIn link. No stock headshots; a real photo or no
  photo. `dt`/`dd` in `.register` already supports this shape.
- A `credits` field on `Project` in `lib/content.ts` (`{ name, role }[]`), rendered
  as a `.doc__aside` block at the foot of `/work/[slug]`. Bakken & Bæck, Instrument
  and Locomotive all end case studies on credits; it reads as a studio that knows
  who did what.
- Sign the contact reply promise: "…you'll hear back from **[name]**, not a queue."

**R2. An engagement-terms register. (Very high / small–medium / fully honest)**

This is the Sanctuary Computer move and it is the highest-leverage page Arctos does
not have. It belongs on `/process` (or a new `/process#engagement` block) as a
`.register` list, in the studio's own plain voice:

- How work is priced (fixed-scope per phase / rate basis — whichever is true).
- Minimum engagement size, stated as a number.
- What the first paid step is, sized (Sanctuary's "blueprint, 50–100 hours" is the
  pattern; Ovryx's "30-minute audit" is the small-end version).
- Billing cadence and payment terms.
- Contract form, and whether there is a minimum commitment.
- Reporting cadence during a project — a named weekly artefact beats "we communicate
  well" by an order of magnitude.
- What happens on handover: documentation, access, source ownership. Ovryx makes
  "Documentation & handover" a line item in every tier; for a studio selling
  *automation*, ownership and handover terms are the buyer's actual fear.

Even publishing a band ("engagements typically start at $X") outperforms silence.
Clay's FAQ discloses only that it offers three engagement models — time & materials,
fixed fee, retainer — and that alone is more than most studios say.

**R3. A "when not to hire us" statement. (High / small / fully honest)**

TowerHouse names the client it will not serve. Studio Dali names when a service is
*not* the right fit. Turning work away in public is the cheapest possible proof of
judgement, and it maps exactly onto `PRODUCT.md`'s "keep claims specific, honest and
useful". Add a short `.doc__aside` on each `/services/[slug]` page: *"This is the
wrong engagement if…"* — two or three genuine disqualifiers.

Secondary benefit: it pre-qualifies enquiries, which raises the quality of the form
submissions that do arrive.

**R4. Live-site verification. (High / small / fully honest)**

Four of the six projects in `lib/content.ts` carry a real `externalUrl`
(calgarywatch.ca, tnkromes.ca, rioalto.ca, the Starlings map). A visitable URL is a
*harder* proof than a testimonial, because the visitor can check it. Most studios
bury the live link; the archive should lead with it.

Build: a `.register` row on `/work/[slug]` headed something like "Live" with the
domain as a real anchor plus a launch month, and a small "live" marker on the
corresponding `.wk-entry` in the work index. Pair with the status taxonomy in R5 so
"launched" is visibly different from "working demo".

**R5. Make status an explained taxonomy, not a label. (High / small / fully honest)**

`ProjectStatus` already distinguishes `launched`, `internal-tool`, `working-demo`,
`prototype`, `in-development`, and `app/work/page.tsx` renders counts in `.wk-legend`.
That legend is currently the most credible element on the site and it is
underexploited. A studio that says "this one is a working demo, not a client
deployment" *unprompted* buys enormous trust — it is the same mechanism as
publishing a rate card.

Build: expand `.wk-legend` from counts into a definition list — each status with a
one-sentence definition of what it does and does not mean. Sort the archive so
`launched` leads. This turns a thin portfolio into an honest one, which is a
different and better thing.

**R6. One real artefact of published thinking per quarter. (High / medium / honest if maintained)**

Every credible firm in the survey publishes: BASIC/DEPT has "Thinking" and "News" in
primary nav plus owned media; Locomotive has articles *and* an open-source library
(Locomotive Scroll) that is itself the credential; Sanctuary Computer runs a
Substack and open-sources its profit-sharing model; thoughtbot publishes the whole
playbook.

The pattern worth copying is **artefact, not blog**. A blog with three posts and a
six-month gap is negative signal. What works at Arctos's size is a small number of
*durable* documents: the automation-handover checklist you actually use, the CRM
integration decision tree, the reporting spec template. Publish it as a real page
under `/studio` or a new `/method` route, dated, and let it sit. An open-sourced
internal tool on GitHub does the same job for a studio that sells software.

Do not build a CMS for this. Static MDX or plain TSX pages in the existing shell.

**R7. Process transparency at the level of artefacts, not adjectives. (High / small)**

`/process` currently reads as four named legs. The upgrade is to attach a *named
deliverable* to each leg — the thing the client physically receives at the end of it.
`ProcessDetail` in `lib/content.ts` already has a `deliverables` field; surface it
as the primary content of each leg rather than supporting detail, and use `.ledger`
or `.numbered`. "You get a systems map, a scoped build plan, and a fixed price"
is a claim a buyer can hold; "we work collaboratively" is not.

**R8. Physical presence. (Medium / small)**

Instrument lists street addresses and a phone number. Locomotive lists an address,
a phone and an email. Bakken & Bæck lists five offices. Hello Monday lists four.
`DESIGN-SYSTEM.md` correctly forbids inventing an office address — so do not invent
one. But **"Calgary, Alberta" plus a real, answered phone number or a same-city
meeting offer** is honest and does most of the work. `LocalBrief` is presumably
already doing part of this; a phone number in `SiteFooter.tsx` is the missing piece.

### 1.3 Devices to refuse

- **A client logo wall.** Six projects, four clients, none of them household names.
  A logo strip here reads as padding. Named case studies do the same job honestly.
- **Awards.** None. Do not add a "featured on" strip of directory listings either —
  Clutch/DesignRush badges read as paid placement.
- **Testimonials you nudge into existence.** If a real client writes a real sentence,
  use it *attributed to a named person with role and company* the way Bakken & Bæck
  does (Clay Bavor, co-founder, Sierra) — an unattributed "— Happy client, Calgary"
  is worse than nothing. Until then, live URLs are the substitute.
- **Stat banner rows** ("50+ projects · 10 years · 99% satisfaction"). This is
  pattern #14 on the AI-slop list and every number Arctos could put there would be
  either small or invented.

---

## 2. Work presentation

### 2.1 What separates expensive from templated

Across the survey, the portfolios that read as expensive share four structural
traits — none of them about colour or imagery.

**a. Fewer projects, deeper each.** Instrument's homepage shows around six curated
case studies rather than the full archive. Bakken & Bæck features five and pushes
the rest behind "All projects". Metalab shows a single interactive reel. The
template signal is *the grid of eighteen thumbnails at equal weight*; the expensive
signal is *editorial selection with visible hierarchy*. Arctos has six projects —
that is a feature. Lead with two or three at full `ProjectFeature` weight and let
the rest be an index.

**b. Metadata as a record, not as decoration.** The best work indexes are closer to
a catalogue than a gallery. Bakken & Bæck carries an "A–Z" nav item — a flat,
complete index — alongside the curated view. Work & Co maintains a separate
"Select Clients" page distinct from case studies. The move is: **a curated view for
persuasion, a complete indexed view for verification.** `app/work/page.tsx` already
half does this with `.wk-entry--record` rows; the recommendation is to commit to it.

**c. Narrative before imagery.** The strongest guidance found on this, and it
matches what the good sites do: *"the story leads and the visuals illustrate it"* —
visual presentation should follow the narrative rather than precede it. A page that
opens with a full-bleed hero shot and then explains itself reads as a template;
a page that states the problem in one paragraph and then shows the artefact that
solved it reads as a studio that knows why it made the thing.

**d. A consistent spine across every case study.** Consistency lets a buyer compare
projects and lets the studio publish new ones fast. The canonical spine, confirmed
across multiple sources: **context → challenge → approach → outcome**, sometimes with
a fifth "what we learned" beat.

### 2.2 Recommendations

**R9. Fix a five-beat spine and enforce it in the type system. (High / medium)**

`Project` in `lib/content.ts` already has `challenge`, `approach`, `solution`,
`summary`. Two beats are missing and they are the two that matter most.

Proposed spine for `/work/[slug]`:

1. **Situation** — the client, the sector, the state of things before. One paragraph.
   (Currently `summary` is doing double duty.)
2. **Constraint** — what made it hard. Budget, legacy system, staff capacity,
   regulatory, timeline. *This beat is the single biggest differentiator between an
   expensive-reading case study and a template one*, because naming a real constraint
   is something only someone who did the work can do.
3. **Approach** — the decision and the reason for it. Not the process; the judgement.
   Include at least one thing you considered and rejected.
4. **What was built** — concrete artefacts, named systems, named integrations.
   `technologies` already exists; surface it as a `.register`, not as chips.
5. **What changed** — see R10.

Add `constraint: string` and `whatChanged: string` to the `Project` type. The
existing `.doc__split` / `.doc__cols` / `.doc__outcomes` classes cover the layout
without new CSS.

**R10. Replace "results" with an honest "what changed" beat. (High / medium / honest)**

This is the crux of the no-metrics constraint, and there is a clean answer. Where
hard numbers are unavailable, describe **the direction of the outcome, the type of
change observed, and the client's own characterisation of what changed.** All three
are honest and none is a fabricated metric.

Concretely, permitted forms:
- *Direction*: "Enquiries now arrive with the qualifying fields already answered;
  the intake email that used to be re-keyed by hand is written straight to the CRM."
- *Elimination*: "Removed a weekly two-hour reconciliation step." (Countable and
  verifiable without a KPI dashboard.)
- *Capability*: "Staff can now issue a quote without opening the accounting system."
- *State*: "Live since March 2026 and still running unattended."

Forbidden: percentage lifts, revenue figures, "3× conversion", any number you did not
measure. `DESIGN-SYSTEM.md` §10 already bans these — the point of R10 is to give the
copywriter a *legitimate* thing to write in that slot so the temptation never arises.

For `internal-tool` and `working-demo` projects, the honest fifth beat is different
and should be labelled differently: **"Status and what it proves."** A demo does not
have outcomes; it has a demonstrated capability. Say so.

**R11. Split the work page into a curated register and a complete index. (Medium–high / medium)**

Keep `.wk-legend` at the top, upgraded per R5. Below it:
- **Selected work** — two or three at `ProjectFeature` weight, each with situation,
  constraint and live link visible without a click.
- **Complete archive** — every project as a `.wk-entry--record` row: number, status,
  title, one-line summary, services, industries, year, live link. Dense, scannable,
  catalogue-like. This is the part that reads as a studio with a real practice
  rather than a portfolio site.

Sort by status then recency. Do not add a filter UI at six projects — filters on a
short list advertise the shortness. Add them at ~15.

**R12. Show the artefact, not a frame around it. (Medium / small)**

`DESIGN-SYSTEM.md` §7 already bans fake browser chrome and this is correct — chrome
around a screenshot is one of the loudest template tells. The asset tiers are already
right: the four `.webm` recordings and the site hero captures lead, the phone
photography goes in `SpecimenStrip` at specimen scale. The one addition worth making
is **captioning every specimen with what it is and when it was taken**. An uncaptioned
image is decoration; a captioned one is evidence. `SpecimenStrip` already takes a
`caption`, and `showcaseMedia` requires one — enforce that discipline everywhere.

**R13. End every case study on a next-project link, not only a CTA. (Low / small)**

Instrument, Bakken & Bæck and Locomotive all do this. It keeps a researching buyer
inside the work rather than bouncing them to a form they are not ready for. Keep
`CTASection` below it, not instead of it.

---

## 3. Conversion

### 3.1 What the field does — and where most of it is weak

Most premium studios are, frankly, bad at conversion and get away with it on
reputation. Clay has no form at all — an email address and a phone number. BASIC/DEPT
is `biz@basicagency.com`. Bakken & Bæck is a `mailto:`. **Arctos cannot afford that
posture**, because those studios convert on inbound reputation and Arctos converts on
the page.

The genuinely instructive behaviours:

**Routing by enquiry type.** Instrument's contact page is not one form — it is three
doors: "Start a Project", "Press & Media", "Write Us a Note". Bakken & Bæck segments
by address: `hello@`, `partnerships@`, `press@`. Hello Monday splits `newbusiness@`
from `hello@`. The effect is that a serious buyer never lands in the same queue as a
recruiter or a vendor, and the "Start a Project" door can ask harder questions
because everyone who opens it has self-selected.

**Short forms at the top of the funnel.** Metalab — a studio that could demand
anything — asks for five things: name, email, how did you hear of us, company stage,
message. **No budget field, no timeline field.** It *invites* those details in prose
("Tell us about your product, your timeline, how you heard about us, and where you're
located") rather than requiring them. The closing line is
*"We read every message. So, thanks in advance for making it a good one."* — which
does qualification work through tone instead of through required fields.

The supporting research is unambiguous: reducing a form from 11 fields to 4 has been
measured at a ~120% conversion increase, and the general finding is that asking for
project details, budget and dates before trust is established pushes people out.
The counter-case is also documented: a three-step conversational form (project type →
budget range → name and email) raised both volume and lead quality — but note the
*ordering*. The commitment-free question comes first and identity comes last.

**Pricing transparency as a conversion device.** In the automation tier this is
standard and it works: Ovryx's published bands and 7–14 day delivery windows let a
buyer self-qualify before contacting, which raises enquiry quality sharply. Among
design studios it is rare, which makes it a differentiator rather than a commodity.

**Response-time promises.** Almost nobody makes one. Metalab explicitly does not.
This is an open goal.

### 3.2 What Arctos is doing now, honestly assessed

`components/ContactForm.tsx` is a three-fieldset intake with **eight required fields**:
name, email, company, project type, budget, timeline, challenge (long text), outcome
(long text) — plus optional website and message. That is heavier than Metalab's,
heavier than Instrument's front door, and it demands budget *and* two paragraphs of
writing from a stranger.

Worse, the two-business-day reply promise and the "first step: a focused conversation"
line exist only in the **success state**, after submission. The reassurance is
delivered to people who have already converted and withheld from the people deciding
whether to.

### 3.3 Recommendations

**R14. Move the reply promise above the form. (Very high / trivial / already true)**

Take the `.register` rows currently in the success receipt — "Reply: within two
business days", "First step: a focused conversation" — and render them in the form
intro on `/contact`, and again in `CTASection`. Add who replies (R1). This is the
highest ratio of impact to effort on the entire list: the copy is already written,
already honest, and currently invisible to everyone who has not yet converted.

**R15. Cut the required set to four; make the rest genuinely optional. (Very high / small)**

Required: **name, email, what you want to build (project type), and one free-text
box.** Everything else — company, website, budget, timeline, challenge, outcome —
becomes optional, kept visible, and framed the Metalab way: *"Anything you add here
helps us come back with something useful rather than a generic reply."*

Specifically on **budget**: keep the field, do not require it, and add a "not sure
yet" option. Requiring budget from a cold visitor before any price signal has been
given is asking them to bid against themselves. If R16 lands, the budget question
becomes safe to ask because the visitor already knows the range.

Keep the three-fieldset progressive structure — it is good and it matches the
documented three-step pattern — but let a visitor submit after fieldset one if that
is all they want to give. A short enquiry you can reply to beats a long form that is
abandoned at the budget dropdown.

**R16. Give a price signal somewhere on the site. (High / small–medium / honest if real)**

Not a price list. A **floor and a shape**: what the smallest sensible engagement is,
what a typical connected build involves, and how it is priced. Sanctuary Computer's
"we rarely take projects under 480 billable hours" is the model — it says nothing
about any individual quote and still tells every visitor whether to bother.

Place it on `/process` next to the engagement register (R2), and link to it from the
budget field in the form. This is the piece that converts a "just looking" visitor
into either a qualified enquiry or a quick, cheap disqualification. Both outcomes are
wins.

**R17. Route by enquiry type. (Medium / small)**

Three doors on `/contact`, in the Instrument pattern but in Arctos's voice:
- **Start a project** — the form.
- **Ask a question first** — one field plus email. For the people who are not ready.
  This door is where most small-studio enquiries actually come from.
- **Everything else** — careers, suppliers, press — to a plain address, off the
  main path.

Implementation is cheap: the doors are `.chips--large` or `.btn--ghost` links above
the form, with the form defaulting to "start a project".

**R18. CTA placement — end-of-page is not enough. (Medium / small)**

`CTASection` at the foot of every page is correct and should stay. What is missing is
the **mid-scroll, low-weight affordance** on long pages (`/services/[slug]`,
`/work/[slug]`, `/process`). A single hairline `.rule` + one line + text link after
the section where a reader is most likely to be convinced — after "What was built"
on a case study, after "what this service is not" on a service page. Not a sticky
bar, not a modal, not an exit-intent popup; those all read as cheap and
`DESIGN-SYSTEM.md` §6 already rules out that register of interruption.

Also: make the CTA text vary by context. `DESIGN-SYSTEM.md` §10 says CTAs must say
what happens. Extend that — "Start a project" is right on the homepage; at the foot
of an automation case study, "Talk about your workflow" is a lower-commitment,
higher-converting door to the same form.

**R19. Make the enquiry feel operationally handled. (Medium / small / honest)**

Arctos sells automation and systems. The intake experience *is* a portfolio piece.
The confirmation state should behave like a system receipt — reference number, what
happens next, when, and from whom. The existing `.receipt` component is already
doing this and it is good; the recommendation is to send the same content by email
so the buyer has it in their inbox, and to say so on the form ("we'll confirm by
email immediately"). A studio whose own intake visibly works is making an argument
no case study can make.

---

## 4. Motion

### 4.1 The distinction, concretely

The 2026 award survey is clear about what separates the two tiers, and it is not
quantity of animation. The recurring formulation: **motion has a director, not just
a library.** The sites that win are described as having "confident editorial
typography, weighted smooth scroll, and transitions that never call attention to
themselves"; 3D used so that "the spotlight creates atmosphere rather than spectacle,
with GSAP pacing the reveals"; and "a confident grid that breaks at exactly the right
moments, with transitions between sections that feel like camera moves." The other
consistent criterion is performance: **beauty at 60fps**, judged on real mobile
hardware, not on the developer's laptop.

Translated into technique, the premium tier does:

- **Orchestrated sequences with one timeline.** A single GSAP timeline that
  sequences three or four related elements with deliberate offsets — not four
  independent ScrollTriggers that happen to fire near each other. Independent
  triggers are what produce the "everything wobbles into place" template feel.
- **Motion that expresses causality.** A→B: the state on the left produces the state
  on the right. This is exactly `PRODUCT.md` principle 4 and `DESIGN-SYSTEM.md` §6,
  and it is the correct read.
- **Transitions as camera moves.** Sections that translate, mask or wipe as if the
  viewport moved, rather than each card fading up individually.
- **Asymmetric, short easing.** Fast out, slow settle, 200–450ms for UI, up to ~900ms
  for a single hero moment. Long linear or symmetric ease-in-out on everything is the
  template signature.
- **Deliberate stagger, small values.** 40–80ms between siblings, and only where the
  siblings are genuinely a sequence. Staggering a three-item list is noise.
- **Type in motion, used once.** A single split-text or width-axis moment
  (Archivo's `font-stretch` axis is an unusual and genuinely distinctive vector here
  — animating optical width rather than opacity is a move almost nobody makes, and it
  is native to the existing system).
- **Restraint as the dominant state.** On the strongest sites, most of the page does
  not move at all. The moving parts are legible because everything around them is
  still.

The template tier does: fade-up-on-scroll applied globally to every child element;
a smooth-scroll library added for "feel" with no choreography attached; parallax on
unrelated images; counters that count up; marquees; cursor followers; and
scroll-jacked full-page sections.

### 4.2 Recommendations

**R20. One orchestrated moment per page; CSS for everything else. (Medium / small–medium)**

`DESIGN-SYSTEM.md` §6 already says this. The recommendation is to *enforce* it as a
budget: **one** GSAP/ScrollTrigger timeline per route, and it must be the moment that
explains the page's central idea. On the homepage that is already correct — the
plotter-draw of the mark, plus the lead-system journey. Everywhere else, `.reveal`
plus CSS transitions.

Audit target: count ScrollTriggers per route. More than one non-trivial timeline on
an interior page is a smell.

**R21. Make the four-chapter journey the site's signature motion. (Medium / medium)**

Arctos's differentiator is that attract → convert → operate → scale is *one connected
system*. The single most valuable animation on the site is therefore one that shows a
lead entering at one end and an operational consequence emerging at the other —
literally the causality the studio sells. `GrowthStage` and the chapter accents
already exist in the token system; this is an animation the brand earns rather than
borrows. Build it once, on the homepage, and let every other page be still.

**R22. Reduced-motion is a design state, not a fallback. (Medium / small)**

Already mandated in §6 and §8. Worth restating because it is where premium sites
separate from template ones: under `prefers-reduced-motion: reduce` the page should
be *composed*, not merely un-animated. Final positions must be the designed positions.
Test it as a real layout at 1440 and 390, not as a checkbox.

**R23. Performance budget as a motion constraint. (Medium / small)**

"Beauty at 60fps" is the actual award criterion. Practical rules: animate only
`transform` and `opacity`; never animate layout properties on scroll; `will-change`
only during the animation; kill ScrollTriggers on route change; keep the `.webm`
recordings gated to on-screen playback with `preload="none"` (already specified in
§6 — verify it holds). For a studio selling technical competence, a janky scroll on a
mid-range Android is a direct contradiction of the pitch.

---

## 5. Anti-patterns — what currently reads as cheap or AI-generated

There is now a documented catalogue of the tells, derived from scoring 1,590 landing
pages (22% heavy "slop", 32% mild, 46% clean). The sixteen patterns, condensed:

**Type:** Inter everywhere, especially in a centred hero. The recurring font trio
Space Grotesk / Instrument Serif / Geist. **One hero word italicised in a serif while
the rest is a neutral sans.**

**Colour:** the specific lavender-purple that leaks out of image-generation prompts;
permanent dark mode with medium-grey body text; body copy that fails WCAG AA on dark;
decorative gradient backgrounds; large coloured glows and tinted shadows.

**Layout:** centred hero; a coloured pill badge sitting directly above the H1;
coloured card borders (top or left stripes); grids of identical icon-topped feature
cards; 1-2-3 numbered step rows; horizontal stat-banner rows; emoji in navigation;
all-caps section labels.

**Beyond that list, in this category specifically:**

- Stock-vector "digital transformation" illustration, isometric city scenes, glowing
  node-graph flowcharts, abstract 3D blobs, glassmorphism, neon gradients. All
  already banned by `DESIGN-SYSTEM.md` §7 — the ban is correct and should hold.
- The bento grid. It was a 2023 innovation and is now the single most recognisable
  AI-template layout.
- Fake browser chrome around screenshots (banned in §7 — correct).
- Invented numbers of every kind: "500+ projects", "10x growth", "99% client
  satisfaction", star ratings, `AggregateRating` schema. Banned in §10 — correct.
- Vocabulary: "unlock", "elevate", "seamless", "cutting-edge", "we don't just build
  websites, we build experiences", "in today's digital landscape", "let's build
  something amazing together". Also the em-dash-heavy, tricolon-heavy sentence rhythm
  that reads as generated prose. `DESIGN-SYSTEM.md` §10's "sparse em dashes" and
  "short, specific sentences" instruction is doing real work; hold the line.
- Logo walls of companies you did not work for, or of tools you happen to use
  presented as if they were clients.
- Cursor followers, animated gradient meshes, counting-up statistics, exit-intent
  modals, and chat widgets that open unprompted.

### 5.1 One honest flag about the existing system

`DESIGN-SYSTEM.md` §3 names the signature move as one phrase per headline dropping
into Newsreader italic via `<em>`. **That exact device — "one hero word italicised in
a serif while the rest is sans" — is on the AI-slop list.**

This is not a reason to abandon it, and the recommendation is *not* to remove it. The
generated version is Inter + Instrument Serif, applied to a centred hero, on a site
with no other typographic idea. Arctos's version is Archivo (with a live width axis)
+ Newsreader, motivated by an actual two-material concept, in a left-aligned
composition. That is a different thing.

But it is close enough to the tell that it needs discipline:
- Keep the existing "once per headline, never twice" rule, and tighten it to
  **once per page** — not once per heading.
- Vary the position. The italic phrase falling at the end of the line every time is
  what makes it read as a formula. `The systems <em>behind</em> growing businesses`
  is good precisely because the italic is medial.
- Lean harder on the width axis as the differentiating move. Optical-width hierarchy
  is genuinely rare and nothing generative reaches for it.
- Never combine the serif-italic phrase with a centred hero. The two together are the
  full template signature.

### 5.2 A second flag: material monotony

`DESIGN-SYSTEM.md` §1 states that a page which is all one material is usually a page
that has not been designed yet. The homepage currently runs **seven of nine sections
as `instrument`** — Cover, Position, Lead system, Work, Specimens, Process,
Industries — with only the chapter stages and "Why Arctos" on `paper`. By the system's
own standard that is under-composed, and long uninterrupted dark stretches are also
pattern #5 on the slop list ("permanent dark mode"). Alternation is the brand's
primary compositional tool and it is currently being under-used on the most important
page. Worth one deliberate pass.

---

## 6. Summary of what to build, in order

1. Named people on `/studio`, credits on case studies, a signature on the reply
   promise. (`app/studio/page.tsx`, `lib/content.ts`, `components/ContactForm.tsx`)
2. Reply promise and first-step register **above** the form and in `CTASection`.
   (`components/ContactForm.tsx`, `components/CTASection.tsx`)
3. Required fields down to four; budget optional with a "not sure yet" option.
   (`components/ContactForm.tsx`)
4. Engagement-terms register + price floor on `/process`. (`app/process/page.tsx`)
5. Status taxonomy explained in `.wk-legend`; live URLs surfaced in the archive.
   (`app/work/page.tsx`, `app/work/[slug]/page.tsx`)
6. Five-beat case-study spine with `constraint` and `whatChanged` fields.
   (`lib/content.ts`, `app/work/[slug]/page.tsx`)
7. "When this is the wrong engagement" block per service.
   (`lib/content.ts`, `app/services/[slug]/page.tsx`)
8. Three-door enquiry routing on `/contact`. (`app/contact/page.tsx`)
9. Curated + complete split on the work index. (`app/work/page.tsx`)
10. One published method artefact, then one per quarter.
11. Motion audit: one timeline per route; build the four-chapter causality animation.
12. Material alternation pass on the homepage.

None of the above requires a metric, a testimonial, an award, a client logo, or a
borrowed visual identity.

---

## Sources

Studio sites examined directly:

- Instrument — https://www.instrument.com/ , /work , /contact
- Work & Co — https://work.co/ (note: acquired by Accenture, completed Jan 2024)
- Metalab — https://metalab.com/ , https://metalab.com/contact
- Clay — https://clay.global/
- Bakken & Bæck — https://bakkenbaeck.com/
- Locomotive — https://locomotive.ca/en
- Hello Monday — https://hellomonday.com/
- BASIC/DEPT — https://basicagency.com/
- Sanctuary Computer — https://sanctuary.computer/ , https://www.sanctuary.computer/info
- garden3d — https://garden3d.net/
- thoughtbot playbook — https://thoughtbot.com/playbook
- Uncommon Creative Studio — https://uncommon.studio/
- Active Theory — https://activetheory.net/ (JS-rendered; limited extraction)
- Ovryx — https://ovryx.com/
- TowerHouse Studio — https://towerhousestudio.com/ai-automation-internal-tools-for-agencies/
- Studio Dali — https://studiodali.co.uk/services

Analysis and reference material:

- Best Award-Winning Websites 2026 (WebGL & Awwwards) — https://www.hontran.dev/blog/best-award-winning-websites-2026
- Awwwards Sites of the Year — https://www.awwwards.com/websites/sites_of_the_year/
- AI Design Slop: 16 Patterns That Out Your App as Vibe-Coded — https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it
- AI Slop Web Design: Complete Guide — https://www.925studios.co/blog/ai-slop-web-design-guide
- Your Website Looks Like AI Made It — https://medium.com/@sahilkargutkar.sk/your-website-looks-like-ai-made-it-and-thats-becoming-a-problem-e679668ca7f4
- Creative agency website case studies that win work (TYPZA) — https://www.typza.com/insights/creative-agency-website-case-studies
- How to Write Agency Case Studies That Win New Clients — https://agencypro.app/blog/agency-case-study-guide
- Contact Form Best Practices to Boost Website Conversions — https://ovoform.com/blog/contact-form-best-practices-examples-to-increase-conversions
- Contact Form Optimization: 12 Simple Changes — https://wisernotify.com/blog/contact-form-optimization/
- Form Conversion Optimization Tips (HubSpot) — https://blog.hubspot.com/marketing/optimize-conversion-forms
- Best Digital Product Agencies in 2026 — https://www.anml.com/blog/best-digital-product-agencies
- Accenture completes acquisition of Work & Co — https://newsroom.accenture.com/news/2024/accenture-completes-acquisition-of-global-digital-product-company-work-and-co
- Twitter acquires Ueno (2021) — https://www.axios.com/2021/01/06/twitter-acquires-design-agency-ueno
- Huge (digital agency) — https://en.wikipedia.org/wiki/Huge_(digital_agency)
