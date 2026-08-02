import Link from "next/link";
import Image from "next/image";
import { ArctosDiagram } from "@/components/home/ArctosDiagram";
import { GrowthSystem } from "@/components/home/GrowthSystem";
import { HomeMotion } from "@/components/home/HomeMotion";
import { JourneyDiagram } from "@/components/home/JourneyDiagram";
import { OctaveField } from "@/components/home/PatternInstruments";
/* Static imports, not string paths. Next reads the real dimensions at build
   time and generates a blur placeholder for each file, so the plate shows the
   artwork's own colour while the full image decodes instead of holding an empty
   box. It also removes the chance of width/height drifting from the asset.

   None of these carry `loading="eager"`. They used to — paired, contradictorily,
   with `fetchPriority="low"`, which told the browser to fetch all seven
   immediately and then not to hurry about it. Every one of them is below the
   fold, so that was ~420KB of illustration downloaded before first paint for
   artwork the reader had not scrolled to. The eager flag was presumably a guard
   against the `data-wipe` clip-path deadlock, but that was fixed at the source
   in base.css by clipping the plate's contents rather than the plate itself —
   and `clip-path` never affected the layout box lazy loading measures anyway.
   The blur placeholder covers the arrival. */
import contourField from "@/public/assets/illustrations/contour-field.webp";
import routeMapping from "@/public/assets/illustrations/route-mapping.webp";
import connectedAutomation from "@/public/assets/illustrations/connected-automation.webp";
import interfaceAssembly from "@/public/assets/illustrations/interface-assembly.webp";
import branchingGrowth from "@/public/assets/illustrations/branching-growth.webp";
import connectedPartnership from "@/public/assets/illustrations/connected-partnership.webp";
import modularBlocks from "@/public/assets/illustrations/modular-blocks.webp";
import routeCompass from "@/public/assets/illustrations/route-compass.webp";
import { WorkShowcase } from "@/components/home/WorkShowcase";
import { SpecimenStrip } from "@/components/figures/SpecimenStrip";
import { CTASection } from "@/components/Shared";
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
          src={contourField}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          aria-hidden="true"
        />
        <div className="hero__survey" aria-hidden="true">
          <span className="hero__survey-line" />
        </div>
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
            <span className="statement__demand">More leads</span>
            <span className="statement__operator">
              <span>should not mean</span>
              <strong aria-hidden="true">&ne;</strong>
            </span>
            <span className="statement__admin">more administrative work.</span>
          </h2>
          <div className="statement__proof reveal">
            <div className="crossover" aria-hidden="true">
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
                <circle className="crossover__signal" cx="0" cy="132" r="4.5" />
              </svg>
              <p className="crossover__key">
                <span className="crossover__key-demand">Demand</span>
                <span className="crossover__key-admin">Work behind it</span>
              </p>
            </div>
            <div className="statement__outcomes">
              <p>
                <span className="statement__mark">Demand</span>
                Campaigns and websites create more opportunity.
              </p>
              <p>
                <span className="statement__mark">Operations</span>
                Connected systems keep the work behind it from climbing at the
                same rate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Lead-generation journey ──────────────────────────────────── */}
      <section
        id="lead-system"
        className="journey section"
        data-plate
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
            <figure className="journey__figure field-figure reveal" data-wipe>
              <Image
                src={routeMapping}
                placeholder="blur"
                alt="The Arctos bear inspecting a connected customer route before deciding where to build."
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
        data-plate
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
              src={connectedAutomation}
              placeholder="blur"
              alt="The Arctos bear connecting two gears into one automated operating system."
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
        data-plate
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
                src={interfaceAssembly}
                placeholder="blur"
                alt="The Arctos bear assembling an interface from measured modules."
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
            <div className="industries__actions reveal">
              <Link className="btn btn--ghost" href="/industries">
                Explore all industries
                <span className="btn__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>
          <figure className="industries__figure field-figure reveal" data-wipe>
            <Image
              src={branchingGrowth}
              placeholder="blur"
              alt="The Arctos bear tending a branching system with four distinct outcomes."
              sizes="(max-width: 900px) 70vw, 34vw"
            />
          </figure>
        </div>
      </section>

      {/* ── Why Arctos ───────────────────────────────────────────────── */}
      <section
        id="why-arctos"
        className="why section"
        data-plate
        data-material="paper"
        data-chapter="scale"
        data-station="Why Arctos"
      >
        <OctaveField />
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
                src={connectedPartnership}
                placeholder="blur"
                alt="Two Arctos bears carrying one shared beam in step."
                sizes="(max-width: 700px) 76vw, 28vw"
              />
              <figcaption>One accountable partner</figcaption>
            </figure>
            <figure className="field-figure" data-wipe>
              <Image
                src={modularBlocks}
                placeholder="blur"
                alt="The Arctos bear connecting modular blocks into one system."
                sizes="(max-width: 700px) 76vw, 28vw"
              />
              <figcaption>Built to connect</figcaption>
            </figure>
            <figure className="field-figure" data-wipe>
              <Image
                src={routeCompass}
                placeholder="blur"
                alt="The Arctos bear using a compass to choose among connected routes."
                sizes="(max-width: 700px) 76vw, 28vw"
              />
              <figcaption>Direction before production</figcaption>
            </figure>
          </div>

          <div className="why__actions reveal">
            <Link className="btn btn--ghost" href="/studio">
              Meet the studio
              <span className="btn__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
