import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CTASection } from "@/components/Shared";
import { ProjectReel } from "@/components/figures/ProjectReel";
import { SceneMotion } from "@/components/pages/SceneMotion";
import { projects, type Project } from "@/lib/content";
import {
  absoluteUrl,
  breadcrumbSchema,
  graph,
  jsonLd,
  pageMetadata,
  webPageSchema,
} from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Work",
  description:
    "Selected platforms, websites, reporting systems, and product concepts from Arctos Launchpad.",
  path: "/work",
  eyebrow: "Selected work",
  cardTitle: "Different problems deserve different visual languages.",
});

const PRIORITY = [
  "calgary-watch",
  "starlings-support-map",
  "rio-alto",
  "true-north-kromes",
];

const ordered = [...projects].sort((a, b) => {
  const ai = PRIORITY.indexOf(a.slug);
  const bi = PRIORITY.indexOf(b.slug);
  return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
});

const visible = ordered.filter(
  (project) => project.reel || project.featuredImage,
);
const privateRecords = ordered.filter(
  (project) => !project.reel && !project.featuredImage,
);

const posterFor = (project: Project) =>
  project.reel?.poster ?? project.featuredImage ?? "";

/** Cycled across the work scenes so each build gets its own accent. */
const TONES = ["attract", "convert", "operate", "scale"] as const;

const schema = graph(
  webPageSchema({
    type: "CollectionPage",
    name: "Work",
    description:
      "Case files for platforms, internal tools, websites, and product concepts built by Arctos Launchpad.",
    path: "/work",
  }),
  breadcrumbSchema([{ name: "Work", path: "/work" }]),
  {
    "@type": "ItemList",
    name: "Arctos Launchpad case files",
    numberOfItems: ordered.length,
    itemListElement: ordered.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: project.title,
      url: absoluteUrl(project.route),
    })),
  },
);

export default function WorkPage() {
  return (
    <div className="interior-document" data-motion="staged">
      <SceneMotion />
      <section
        className="section work-open reveal"
        data-material="paper"
        data-station="Selected work"
      >
        <div className="shell work-open__inner">
          <header>
            <p className="route-open__overline">Selected work</p>
            <h1 className="route-open__title work-open__title">
              Different problems deserve <em>different visual languages.</em>
            </h1>
            <p className="route-open__intro">
              Civic platforms, community resources, hospitality, manufacturing,
              and internal software. Each project begins with its own context.
            </p>
          </header>

          {/* The contact sheet: an index of what follows, at one size. */}
          <div className="work-sheet">
            {visible.map((project, index) => (
              <figure key={project.slug} className="work-sheet__frame">
                <div className="work-sheet__plate">
                  <Image
                    src={posterFor(project)}
                    alt=""
                    fill
                    priority={index < 2}
                    sizes="(max-width: 520px) 100vw, (max-width: 900px) 50vw, 24vw"
                  />
                </div>
                <figcaption>
                  <span className="work-sheet__name">{project.title}</span>
                  <span className="work-sheet__kind">
                    {project.industries[0]}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* One held scene per build. The recorded scroll through the live site
          runs full-bleed and keeps running while the register rises over it —
          the four .webm captures are the strongest evidence in the project and
          the previous build showed poster frames instead. */}
      {visible.map((project, index) => (
        <section
          key={project.slug}
          id={project.slug}
          className="scene scene--work reveal"
          data-material="instrument"
          /* Each build gets its own colour temperature, so four scenes in a row
             read as four projects rather than one long dark band. */
          data-chapter={TONES[index % TONES.length]}
          data-station={project.title}
        >
          <div className="scene__hold">
            <div className="workbench__field" aria-hidden="true" />

            <div className="shell workbench">
              <div className="scene__mark">
                <p className="scene__folio">
                  <span>{project.statusLabel}</span>
                </p>
                <h2 className="scene__title">{project.title}</h2>
                <p className="scene__lead">{project.summary}</p>
                <Link className="work-scene__open" href={project.route}>
                  Open case file <span aria-hidden="true">↗</span>
                </Link>
              </div>

              {/* The build, running on a drawn machine. Deliberately a
                  technical outline rather than window chrome with traffic
                  lights — the site's imagery rules rule out faking a browser
                  around a real screenshot, and a plotted monitor keeps the
                  drafting vocabulary the rest of the page is built from. */}
              <figure className="workstation">
                <div className="workstation__bezel">
                  <div className="workstation__screen">
                    {project.reel ? (
                      <ProjectReel
                        src={project.reel.src}
                        poster={project.reel.poster}
                        title={project.title}
                      />
                    ) : (
                      <Image
                        src={posterFor(project)}
                        alt={`${project.title} homepage and interface`}
                        fill
                        sizes="(max-width: 1000px) 92vw, 46vw"
                      />
                    )}
                  </div>
                </div>
                <span className="workstation__neck" aria-hidden="true" />
                <span className="workstation__base" aria-hidden="true" />
                <figcaption className="workstation__cap">
                  Recorded from the live build
                </figcaption>
              </figure>
            </div>
          </div>

          <div className="scene__panel">
            <div className="shell work-panel__grid">
              <p className="work-panel__summary">{project.challenge}</p>
              <dl className="work-panel__reg">
                <dt>Services</dt>
                <dd>{project.services.join(", ")}</dd>
              </dl>
              <dl className="work-panel__reg">
                <dt>Industries</dt>
                <dd>{project.industries.join(", ")}</dd>
              </dl>
            </div>
          </div>
        </section>
      ))}

      {privateRecords.length ? (
        <section
          className="section work-records reveal"
          data-material="paper"
          data-station="Working builds"
        >
          <div className="shell work-records__grid">
            <header className="work-records__header">
              <p>Working builds</p>
              <h2>Useful systems do not always need a public screen.</h2>
            </header>

            {privateRecords.map((project) => (
              <article key={project.slug} className="work-record">
                <p className="work-record__status">{project.statusLabel}</p>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <dl>
                  <div>
                    <dt>Services</dt>
                    <dd>{project.services.join(", ")}</dd>
                  </div>
                  <div>
                    <dt>Industries</dt>
                    <dd>{project.industries.join(", ")}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <CTASection
        title="Your project should look like itself."
        body="Bring the constraint, the bottleneck, or the unfinished idea. We will design around the reality of it."
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(schema)}
      />
    </div>
  );
}
