import Image from "next/image";
import Link from "next/link";
import { ReportArtifact } from "@/components/figures/ReportArtifact";
import { ProjectReel } from "@/components/figures/ProjectReel";
import { ProofMotion } from "@/components/home/v2/proof/ProofMotion";
import { projects, type Project } from "@/lib/content";

/**
 * Slot 3: proof before explanation.
 *
 * Two proofs lead, each given a plate that fills the screen and is composed
 * from what that project actually is:
 *
 *   Fresh Prep         a report. There is no public URL and no screenshot, so
 *                      the plate is the redacted report sheet, laid on the desk.
 *   True North Kromes  a production site. The recording is the proof; the lab
 *                      photography sits over its corner like a contact print.
 *
 * Everything else is a quiet index underneath, deliberately smaller.
 */

const bySlug = (slug: string) => projects.find((p) => p.slug === slug);

/** The index entries: one honest line each, in the studio's own shorthand. */
const INDEX: { slug: string; kind: string; line: string }[] = [
  {
    slug: "calgary-watch",
    kind: "Live civic infrastructure",
    line: "Official alerts and community reports on one live map of Calgary and Edmonton.",
  },
  {
    slug: "rio-alto",
    kind: "Hospitality, in its own colours",
    line: "A restaurant website built around the company's history and Mexican identity.",
  },
  {
    slug: "starlings-support-map",
    kind: "Human-scale care platform",
    line: "An anonymous support map, with moderation, for young people affected by a family member's substance use.",
  },
];

function PlateText({ project, kind }: { project: Project; kind: string }) {
  return (
    <>
      <header className="prf-plate__head">
        <p className="prf-folio">
          <span>{kind}</span>
          <span className="prf-folio__rule" aria-hidden="true" />
          <span>{project.statusLabel}</span>
        </p>
        <h3 className="prf-plate__name">
          <Link href={project.route}>{project.client}</Link>
        </h3>
      </header>
      <div className="prf-plate__body">
        <section className="prf-copy">
          <h4 className="prf-copy__label">The constraint</h4>
          <p>{project.constraint}</p>
        </section>
        <section className="prf-copy">
          <h4 className="prf-copy__label">What changed</h4>
          <p>{project.whatChanged}</p>
        </section>
        <Link className="prf-go" href={project.route}>
          Open the case file
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </>
  );
}

export function ProofV2() {
  const freshPrep = bySlug("fresh-prep-event-intelligence");
  const tnk = bySlug("true-north-kromes");
  const others = INDEX.map((entry) => ({ entry, project: bySlug(entry.slug) })).filter(
    (e): e is { entry: (typeof INDEX)[number]; project: Project } => Boolean(e.project),
  );

  return (
    <section
      id="featured-work"
      className="prf"
      data-material="instrument"
      data-station="Work"
    >
      <ProofMotion />

      <header className="prf-intro shell">
        <p className="tick-label reveal">Proof</p>
        <h2 className="prf-intro__title">Work for businesses that run on repeat.</h2>
        <p className="prf-intro__lede">
          Two first. One is a report we can only show the shape of. The other is
          a live site you can watch.
        </p>
      </header>

      {freshPrep ? (
        <article className="prf-plate prf-plate--report" data-chapter="operate">
          <div className="prf-plate__text">
            <PlateText project={freshPrep} kind="Events and experiential marketing" />
          </div>
          <div className="prf-desk">
            <span className="prf-desk__tag">
              Internal tool &middot; no public URL &middot; redacted structure
            </span>
            <div className="prf-desk__sheet" data-prf-depth="3">
              <ReportArtifact caption="Structure of the live Fresh Prep report. Figures withheld; this is an internal tool." />
            </div>
          </div>
        </article>
      ) : null}

      {tnk ? (
        <article className="prf-plate prf-plate--reel" data-chapter="convert">
          <div className="prf-plate__text">
            <PlateText project={tnk} kind="Dental lab production" />
          </div>
          <div className="prf-footage">
            <p className="prf-footage__cap t-folio">
              Recorded scroll through the live site
              {tnk.externalUrl ? (
                <>
                  {" "}
                  &middot;{" "}
                  <a href={tnk.externalUrl} target="_blank" rel="noreferrer">
                    {tnk.externalUrl.replace(/^https?:\/\/(www\.)?/, "")}
                    <span aria-hidden="true"> &#8599;</span>
                  </a>
                </>
              ) : null}
            </p>
            <div className="prf-footage__frame">
              <div className="prf-footage__screen" data-prf-scale="1.1">
                {tnk.reel ? (
                  <ProjectReel
                    src={tnk.reel.src}
                    poster={tnk.reel.poster}
                    title={tnk.title}
                  />
                ) : null}
              </div>
              <span className="prf-mark prf-mark--tl" aria-hidden="true" />
              <span className="prf-mark prf-mark--br" aria-hidden="true" />
            </div>
            <div className="prf-prints" data-prf-depth="4">
              <div className="prf-print prf-print--wide">
                <Image
                  src="/assets/work/true-north-kromes/framework-build-tray.webp"
                  alt="Cobalt-chrome dental frameworks on selective laser melting build trays"
                  fill
                  sizes="(max-width: 900px) 60vw, 26vw"
                />
              </div>
              <div className="prf-print prf-print--tall">
                <Image
                  src="/assets/work/true-north-kromes/upper-framework-occlusal.webp"
                  alt="A polished upper cobalt-chrome framework seated on a dental model"
                  fill
                  sizes="(max-width: 900px) 34vw, 14vw"
                />
              </div>
            </div>
          </div>
        </article>
      ) : null}

      <div className="prf-index shell">
        <div className="prf-index__head">
          <p className="tick-label reveal">Also shipped</p>
        </div>
        <ol className="prf-index__list">
          {others.map(({ entry, project }, i) => (
            <li key={project.slug}>
              <Link className="prf-row" href={project.route}>
                <span className="prf-row__n t-folio">{String(i + 3).padStart(2, "0")}</span>
                <span className="prf-row__main">
                  <span className="prf-row__name">{project.client}</span>
                  <span className="prf-row__kind t-folio">{entry.kind}</span>
                </span>
                <span className="prf-row__line">{entry.line}</span>
                <span className="prf-row__poster">
                  <Image
                    src={project.reel?.poster ?? project.featuredImage ?? ""}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 30vw, 16rem"
                  />
                </span>
                <span className="prf-row__go" aria-hidden="true">
                  &rarr;
                </span>
                <span className="visually-hidden">Open the {project.client} case file</span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="prf-index__more">
          <Link className="prf-quiet" href="/work">
            See all work
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </p>
      </div>
    </section>
  );
}
