import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { islands } from "@/lib/content";
import { CloseFx } from "./close/CloseFx";
import { Btn, Lines, d } from "./ui";

type Tone = "ink" | "paper" | "bone" | "pine";

/**
 * Closing invitation. Each page passes its own question; the problem doors stay constant.
 *
 * The rust signal line (drawn by CloseFx) runs from the question's key word,
 * across to the three doors, and lands on the button: the path a visitor takes.
 * Everything here is readable without JavaScript; CloseFx only adds motion.
 */
export function StartBand({
  title = ["What needs", <>to <em key="c">connect?</em></>],
  body = "Tell us where the work gets stuck. You don’t need a technical brief, and the reply comes from the people who would do the work, within two business days.",
  need,
  tone = "paper",
  size = "display",
}: {
  title?: ReactNode[];
  body?: string;
  need?: string;
  tone?: Tone;
  size?: "display" | "h1";
}) {
  return (
    <section
      className={`close section tone-${tone} close--${size}`}
      data-tone={tone}
      aria-label="Start a project"
    >
      <CloseFx />
      <div className="wrap close__grid">
        <div className="close__ask">
          <p className="eyebrow" data-reveal>
            Start here
          </p>
          <Lines as="h2" className={`${size} close__title`} lines={title} />
          <p className="lead close__lead" data-reveal style={d(3)}>
            {body}
          </p>
        </div>
        <div className="close__side">
          <p className="mono close__label" data-reveal style={d(1)}>
            Start from the problem
          </p>
          <ul className="close__needs" aria-label="Start from a problem">
            {islands.map((island, i) => (
              <li key={island.id} data-reveal style={d(2 + i)}>
                <Link className="door" href={`/contact?need=${island.need}`} data-door={i}>
                  <span className="door__index index">{island.index}</span>
                  <span className="door__text">
                    <span className="door__say">{island.symptom.replace(/[“”]/g, "")}</span>
                    <span className="door__name mono">{island.name}</span>
                  </span>
                  <span className="door__thumb" aria-hidden="true">
                    <Image src={island.art.src} alt="" width={island.art.width} height={island.art.height} sizes="120px" />
                  </span>
                  <span className="door__arrow" aria-hidden="true">
                    <span>→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="close__go" data-reveal style={d(5)}>
            <span className="close__magnet" data-magnet>
              <Btn href={need ? `/contact?need=${need}` : "/contact"} className="close__btn">
                Start a project
              </Btn>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
