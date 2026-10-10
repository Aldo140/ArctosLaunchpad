import Image from "next/image";
import { whyArctos } from "@/lib/content";
import { Lines, TextLink, d } from "../ui";
import { MachineOverlay } from "./studio-note/MachineOverlay";
import { StudioNoteMotion } from "./studio-note/StudioNoteMotion";

const PRINCIPLES = ["Strategy before software", "Built around existing operations", "Clear ownership"];

/**
 * Home chapter: who the studio is — told as the painting it sits beside.
 * Loose, scrawled sheets fly in, go through the machine, and land ruled and
 * ticked on a growing stack; the three principles get "sorted" the same way.
 * Server-rendered and complete on its own; StudioNoteMotion adds the scrub.
 */
export function StudioNote() {
  const principles = whyArctos.filter((p) => PRINCIPLES.includes(p.title));
  return (
    <section className="studio-note tone-ink" data-tone="ink" aria-labelledby="studio-title">
      <div className="studio-note__track">
        <div className="studio-note__stage">
          <div className="wrap studio-note__grid">
            <div className="studio-note__copy">
              <p className="eyebrow" data-reveal>
                The studio
              </p>
              <Lines
                as="h2"
                id="studio-title"
                className="h1 studio-note__title"
                lines={["Busywork in.", <em key="s">A working system out.</em>]}
              />
              <p className="lead" data-reveal style={d(2)}>
                Arctos Launchpad is a Calgary marketing and software agency. The people you talk to design and
                build the work, across the customer-facing side and the systems behind it.
              </p>
              <ol className="studio-note__list">
                {principles.map((p, i) => (
                  <li key={p.title} className="studio-note__card" data-card={i}>
                    <span className="studio-note__index">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{p.title}</h3>
                      <p>{p.copy}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div data-reveal style={d(4)}>
                <TextLink href="/studio">About the studio</TextLink>
              </div>
            </div>

            <div className="studio-note__art" aria-hidden="true">
              <div className="studio-note__frame">
                <div className="studio-note__window">
                  <div className="studio-note__plate">
                    <Image
                      src="/assets/v3/the-work-moves.webp"
                      alt=""
                      width={1536}
                      height={1024}
                      sizes="(max-width: 1023px) 225vw, 64vw"
                    />
                    <MachineOverlay />
                  </div>
                </div>
                <p className="studio-note__state">
                  <span data-step="0">Scattered.</span>
                  <span data-step="1">Sorting.</span>
                  <span data-step="2">Sorted.</span>
                </p>
                <p className="studio-note__status">
                  <span className="studio-note__step" data-step="0">
                    Scattered
                  </span>
                  <span className="studio-note__rule">
                    <span className="studio-note__rule-fill" />
                  </span>
                  <span className="studio-note__step" data-step="1">
                    Sorting
                  </span>
                  <span className="studio-note__rule">
                    <span className="studio-note__rule-fill" />
                  </span>
                  <span className="studio-note__step" data-step="2">
                    Sorted
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <StudioNoteMotion />
    </section>
  );
}
