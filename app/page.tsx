import Link from "next/link";
import Image from "next/image";
import { ArctosDiagram } from "@/components/home/ArctosDiagram";
import { ChapterStages } from "@/components/home/ChapterStages";
import { HomeMotion } from "@/components/home/HomeMotion";
import { JourneyDiagram } from "@/components/home/JourneyDiagram";
import { WorkShowcase } from "@/components/home/WorkShowcase";
import { SpecimenStrip } from "@/components/SpecimenStrip";
import { CTASection } from "@/components/CTASection";
import {
  automationOutcomes,
  automationProblems,
  projects,
  industries,
  processSteps,
  whyArctos,
} from "@/lib/content";

/**
 * Craft specimens — the detail work behind the case studies.
 *
 * These are the source photographs the archive already owned but never showed.
 * At specimen scale their colour and texture carry, which is exactly what a
 * studio page needs to prove: that Arctos works with real material, not stock.
 */
const SPECIMENS = [
  {
    src: "/assets/work/true-north-kromes/framework-build-tray.webp",
    alt: "Cobalt-chrome dental frameworks arranged on a selective laser melting build tray",
    caption: "Build tray, as removed from the printer.",
    code: "TNK",
  },
  {
    src: "/assets/work/true-north-kromes/upper-framework-occlusal.webp",
    alt: "A polished upper cobalt-chrome framework seated on a dental model",
    caption: "Upper framework, occlusal view.",
    code: "TNK",
  },
  {
    src: "/assets/work/rio-alto/colorful-tortilla-flight.webp",
    alt: "Five colourful house-made tortillas plated with salsa and guacamole",
    caption: "Tortilla flight — the source of the palette.",
    code: "RA",
  },
  {
    src: "/assets/work/rio-alto/festive-sweet-bread.webp",
    alt: "Trays of sliced pink and green festive sweet bread",
    caption: "Bakery colour, sampled directly.",
    code: "RA",
  },
  {
    src: "/assets/work/starlings-phone-in-hand.webp",
    alt: "A person holding a phone showing the Starlings Support Map homepage",
    caption: "Mobile build, tested in the hand.",
    code: "STG",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <HomeMotion />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="hero section"
        data-material="instrument"
        data-station="Cover"
      >
        <div className="shell hero__inner">
          <div className="hero__copy">
            <p className="tick-label hero__eyebrow">
              Calgary digital growth &amp; technology studio
            </p>
            <h1 className="hero__title t-hero">
              The systems <em>behind</em> growing businesses.
            </h1>
            <p className="hero__lead t-lead">
              Websites, campaigns, software, and automation — connected around
              how your business attracts customers and operates.
            </p>
            <div className="hero__actions">
              <Link className="btn" href="/contact">
                Start a project
                <span className="btn__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
              <Link className="btn btn--ghost" href="/work">
                Explore our work
              </Link>
            </div>
            <p className="hero__disciplines t-folio">
              Strategy · Marketing · Design · Software · Automation
            </p>
          </div>

          <div className="hero__plot">
            <ArctosDiagram />
          </div>
        </div>
      </section>

      {/* ── The four stages, as printed chapters ─────────────────────── */}
      <ChapterStages />

      {/* ── Positioning ──────────────────────────────────────────────── */}
      <section
        id="position"
        className="statement section"
        data-material="instrument"
        data-station="Position"
      >
        <div className="shell statement__inner">
          <p className="tick-label reveal">The gap we close</p>
          <h2 className="statement__title t-display reveal">
            More leads should not mean <em>more administrative work.</em>
          </h2>
          <div className="statement__cols reveal">
            <p className="t-body">
              A campaign can create demand. A website can capture it. Growth
              gets difficult when the systems behind the business cannot keep
              up.
            </p>
            <p className="t-body">
              Most agencies stop at the form submission. Most software companies
              never see how customers found you. Arctos connects both sides —
              marketing, customer experience, software, automation, and
              reporting, built as one system.
            </p>
          </div>
        </div>
      </section>

      {/* ── Lead-generation journey ──────────────────────────────────── */}
      <section
        id="lead-system"
        className="journey section"
        data-material="instrument"
        data-station="Lead system"
      >
        <div className="shell">
          <div className="journey__head reveal">
            <p className="tick-label">The complete path</p>
            <h2 className="journey__title t-display">
              Do not stop at the lead.
            </h2>
            <p className="t-lead">
              We connect the campaign, website, CRM, follow-up, sales process,
              and reporting so opportunities do not disappear into inboxes and
              spreadsheets.
            </p>
          </div>

          <JourneyDiagram />

          <p className="journey__caption t-folio reveal">
            Most engagements begin somewhere in the middle of this. That is
            normal — we map what already exists before adding to it.
          </p>
        </div>
      </section>

      {/* ── Selected work ────────────────────────────────────────────── */}
      <section
        id="featured-work"
        className="work section"
        data-material="instrument"
        data-station="Work"
      >
        <div className="shell">
          <div className="work__head reveal">
            <p className="tick-label">Selected work</p>
            <h2 className="work__title t-display">
              Different problems deserve <em>different systems.</em>
            </h2>
          </div>

          <WorkShowcase projects={projects} />

          <div className="work__more reveal">
            <Link className="btn btn--ghost" href="/work">
              View all work
              <span className="btn__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Craft specimens ──────────────────────────────────────────── */}
      <section
        className="section section--tight"
        data-material="instrument"
        data-station="Specimens"
      >
        <div className="shell reveal">
          <SpecimenStrip
            title="Detail from the archive"
            intro="Source material from live projects — production runs, kitchens, and builds tested in the hand."
            items={[...SPECIMENS]}
          />
        </div>
      </section>

      {/* ── Automation ───────────────────────────────────────────────── */}
      <section
        id="automation"
        className="automation section"
        data-material="paper"
        data-chapter="operate"
        data-station="Automation"
      >
        <div className="shell">
          <div className="automation__head reveal">
            <p className="tick-label">Business automation</p>
            <h2 className="automation__title t-paper">
              Eliminate manual workflows without replacing everything.
            </h2>
            <p className="t-lead">
              We review how work currently moves through your organization,
              identify the unnecessary manual steps, and connect the platforms
              you already use.
            </p>
          </div>

          <div className="automation__ledger reveal">
            <div className="automation__side">
              <h3 className="t-label">Recognizable today</h3>
              <ul className="automation__list automation__list--before">
                {automationProblems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <div className="automation__arrow" aria-hidden="true" />
            <div className="automation__side">
              <h3 className="t-label">After the work</h3>
              <ul className="automation__list automation__list--after">
                {automationOutcomes.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Process ──────────────────────────────────────────────────── */}
      <section
        id="home-process"
        className="process section"
        data-material="instrument"
        data-station="Process"
      >
        <div className="shell">
          <div className="process__head reveal">
            <p className="tick-label">How Arctos works</p>
            <h2 className="process__title t-display">Six steps, in order.</h2>
          </div>
          <ol className="process__steps">
            {processSteps.map((step, i) => (
              <li key={step.title} className="process__step reveal">
                <span className="t-folio">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="process__step-title">{step.title}</h3>
                <p className="process__step-body">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Industries ───────────────────────────────────────────────── */}
      <section
        id="home-industries"
        className="industries section section--tight"
        data-material="instrument"
        data-station="Industries"
      >
        <div className="shell">
          <div className="industries__head reveal">
            <p className="tick-label">Industries</p>
            <h2 className="industries__title t-title">
              Systems shaped around the needs of your industry.
            </h2>
          </div>
          <ul className="industries__list reveal seq">
            {industries.map((industry) => (
              <li key={industry.slug}>
                <Link
                  href={`/industries/${industry.slug}`}
                  className="industries__item"
                >
                  <span>{industry.title}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Why Arctos ───────────────────────────────────────────────── */}
      <section
        id="why-arctos"
        className="why section"
        data-material="paper"
        data-chapter="scale"
        data-station="Why Arctos"
      >
        <div className="shell">
          <div className="why__head reveal">
            <p className="tick-label">Why Arctos</p>
            <h2 className="why__title t-paper">
              One partner across the whole system.
            </h2>
          </div>
          <div className="why__grid">
            {whyArctos.map((item, i) => (
              <article key={item.title} className="why__card reveal">
                <span className="t-folio">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="why__card-title">{item.title}</h3>
                <p className="why__card-body">{item.copy}</p>
              </article>
            ))}
          </div>

          <figure className="why__plate reveal">
            <Image
              src="/assets/studio/arctos-wall-materials.webp"
              alt="Studio material study: concrete, paper, fabric, and plant shadow with a pinned note reading Systems, Clarity, Growth"
              width={1400}
              height={933}
              sizes="(max-width: 900px) 100vw, 70vw"
            />
            <figcaption className="t-folio">
              Studio material study — Calgary, Alberta
            </figcaption>
          </figure>
        </div>
      </section>

      <CTASection />
    </>
  );
}
