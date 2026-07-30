import Image from "next/image";
import Link from "next/link";
import { growthStages } from "@/lib/content";
import { ChapterMotion } from "./ChapterMotion";

/**
 * The four collage canvases, each owning a full stage.
 *
 * The artwork was composed with a large clear paper field, so the type is set
 * *into* that field rather than floated over the busy torn edges. Each stage
 * carries its own chapter accent, which the header and survey rule inherit as
 * you pass through it.
 *
 * No pinning or scroll-scrubbing: four honest full-height sections read the
 * same on a phone, a slow connection, and with reduced motion enabled, and the
 * artwork is strong enough that it does not need a scroll trick to land.
 */
export function ChapterStages() {
  return (
    <div className="chapters">
      <ChapterMotion />
      {growthStages.map((stage, i) => (
        <section
          key={stage.id}
          id={stage.id}
          className="chapter"
          data-material="paper"
          data-chapter={stage.id}
          data-station={stage.title}
          aria-labelledby={`chapter-${stage.id}`}
        >
          <Image
            className="chapter__canvas"
            src={`/assets/chapters/${stage.id}.webp`}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
          />

          <div className="chapter__inner shell">
            <div className="chapter__folio">
              <span className="t-folio">{String(i + 1).padStart(2, "0")}</span>
              <span className="chapter__folio-rule" aria-hidden="true" />
              <span className="t-label">Stage {i + 1} of 4</span>
            </div>

            <div className="chapter__body">
              <h2 id={`chapter-${stage.id}`} className="chapter__title-mask">
                <span className="chapter__title t-paper">{stage.title}</span>
              </h2>
              <p className="chapter__lead">{stage.statement}</p>
              <p className="chapter__problem">{stage.problem}</p>

              <ul className="chapter__list">
                {stage.includes.slice(0, 8).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <Link className="link chapter__more" href={`/services#${stage.id}`}>
                All {stage.title.toLowerCase()} services
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
