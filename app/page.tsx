import Link from "next/link";
import Image from "next/image";
import { ArctosDiagram } from "@/components/home/ArctosDiagram";
import { GrowthSystem } from "@/components/home/GrowthSystem";
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

/**
 * Named clients, taken from the project records. Kept as a list of real
 * engagements on purpose: a client wall is the easiest place on a site to
 * quietly inflate, and every name here has a case file behind it.
 */
const CLIENTS = [
  "Calgary Watch",
  "Starlings",
  "Rio Alto",
  "True North Kromes",
  "Fresh Prep",
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
        <Image
          className="hero__terrain"
          src="/assets/illustrations/contour-field.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          aria-hidden="true"
        />
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

      {/* ── The four stages, as one system ───────────────────────────── */}
      <GrowthSystem />

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
          {/* The claim is a mismatch between two curves, so it is drawn as
              one: demand climbing, and the manual work that usually climbs
              with it held flat. No numbers — the shape is the argument, and
              inventing figures to label it is not on the table. */}
          <div className="crossover reveal" aria-hidden="true">
            <svg
              viewBox="0 0 600 150"
              preserveAspectRatio="none"
              role="presentation"
            >
              <path
                className="crossover__grid"
                d="M0 37.5H600M0 75H600M0 112.5H600"
              />
              <path
                className="crossover__demand"
                d="M0 132 C 150 128, 300 96, 420 58 S 540 18, 600 12"
              />
              <path
                className="crossover__admin"
                d="M0 132 C 200 126, 400 122, 600 118"
              />
            </svg>
            <p className="crossover__key">
              <span className="crossover__key-demand">Demand</span>
              <span className="crossover__key-admin">Work behind it</span>
            </p>
          </div>
          {/* The second column says Arctos connects both sides. The bracket
              spans both columns and draws across as the section arrives, so
              the connection is made rather than only claimed. */}
          <div className="statement__cols reveal">
            <span className="statement__tie" aria-hidden="true" />
            <p className="statement__col">
              <span className="statement__mark">Demand</span>A campaign can
              create demand. A website can capture it. Growth gets difficult
              when the systems behind the business cannot keep up.
            </p>
            <p className="statement__col">
              <span className="statement__mark">Operations</span>Most agencies
              stop at the form submission. Most software companies never see how
              customers found you. Arctos connects both sides — marketing,
              customer experience, software, automation, and reporting, built as
              one system.
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
            <figure className="journey__figure field-figure" data-wipe>
              <Image
                src="/assets/illustrations/route-mapping.webp"
                alt="The Arctos bear inspecting a connected customer route before deciding where to build."
                width={1254}
                height={1254}
                sizes="(max-width: 900px) 54vw, 18vw"
              />
            </figure>
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
            <p className="work__lead t-lead">
              A civic safety platform, a community support map, a restaurant,
              and a dental laboratory. None of them wanted the same website, so
              none of them got one.
            </p>

            {/* The clients, named. Every one of these is a real engagement in
                lib/content.ts — the register is generated from that list
                rather than typed, so it cannot drift from the case files. */}
            <ul className="work__clients">
              {CLIENTS.map((client) => (
                <li key={client}>{client}</li>
              ))}
            </ul>
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

          <figure className="automation__figure field-figure reveal" data-wipe>
            <Image
              src="/assets/illustrations/connected-automation.webp"
              alt="The Arctos bear connecting two gears into one automated operating system."
              width={1254}
              height={1254}
              sizes="(max-width: 900px) 80vw, 34vw"
            />
          </figure>

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

          <Link
            className="link automation__more"
            href="/calgary-business-automation"
          >
            Explore business automation
            <span aria-hidden="true">→</span>
          </Link>
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
          <div className="process__head">
            <div className="process__copy reveal">
              <p className="tick-label">How Arctos works</p>
              <h2 className="process__title t-display">Six steps, in order.</h2>
            </div>
            <figure className="process__figure field-figure reveal" data-wipe>
              <Image
                src="/assets/illustrations/interface-assembly.webp"
                alt="The Arctos bear assembling an interface from measured modules."
                width={1254}
                height={1254}
                sizes="(max-width: 900px) 64vw, 28vw"
              />
            </figure>
          </div>
          {/* The section claims order, so the order is drawn. One line runs the
              width of the shell and each stop hangs a tick from it, the same
              gesture the interior route uses vertically. Six identical table
              rows made a sequence look like a menu. */}
          <ol className="track reveal">
            {processSteps.map((step, i) => (
              <li
                key={step.title}
                className="track__stop"
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="track__tick" aria-hidden="true" />
                <span className="track__n t-folio">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="track__title">{step.title}</h3>
                <p className="track__body">{step.body}</p>
              </li>
            ))}
          </ol>
          <Link className="link process__more" href="/process">
            See the complete process
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* ── Industries ───────────────────────────────────────────────── */}
      <section
        id="home-industries"
        className="industries section section--tight"
        data-material="instrument"
        data-station="Industries"
      >
        <div className="shell industries__inner">
          <div className="industries__body">
            <div className="industries__head reveal">
              <p className="tick-label">Industries</p>
              <h2 className="industries__title t-title">
                Systems shaped around the needs of your industry.
              </h2>
            </div>
            {/* Set as one field of names rather than ten identical rows with ten
                identical arrows. At this scale the section reads as the breadth
                it is describing in a single glance, which the list never did. */}
            <ul className="ind-field reveal">
              {industries.map((industry) => (
                <li key={industry.slug} className="ind-field__row">
                  <Link
                    href={`/industries/${industry.slug}`}
                    className="ind-field__item"
                  >
                    {industry.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <figure className="industries__figure field-figure reveal" data-wipe>
            <Image
              src="/assets/illustrations/branching-growth.webp"
              alt="The Arctos bear tending a branching system with four distinct outcomes."
              width={1254}
              height={1254}
              sizes="(max-width: 900px) 70vw, 34vw"
            />
          </figure>
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

          <div className="why__plates reveal">
            <figure className="field-figure" data-wipe>
              <Image
                src="/assets/illustrations/connected-partnership.webp"
                alt="Two Arctos bears carrying one shared beam in step."
                width={1254}
                height={1254}
                sizes="(max-width: 700px) 76vw, 28vw"
              />
              <figcaption>One accountable partner</figcaption>
            </figure>
            <figure className="field-figure" data-wipe>
              <Image
                src="/assets/illustrations/modular-blocks.webp"
                alt="The Arctos bear connecting modular blocks into one system."
                width={1254}
                height={1254}
                sizes="(max-width: 700px) 76vw, 28vw"
              />
              <figcaption>Built to connect</figcaption>
            </figure>
            <figure className="field-figure" data-wipe>
              <Image
                src="/assets/illustrations/route-compass.webp"
                alt="The Arctos bear using a compass to choose among connected routes."
                width={1254}
                height={1254}
                sizes="(max-width: 700px) 76vw, 28vw"
              />
              <figcaption>Direction before production</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
