"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { islands } from "@/lib/content";
import { Lines, d } from "../ui";
import { Bridge, Mark, Scraps } from "./islands/parts";
import { MobileStage } from "./islands/MobileStage";
import { useIslandsMotion } from "./islands/useIslandsMotion";

/**
 * The problem, then the connection. Three islands start adrift — at different
 * depths, tilted, with scraps of lost work floating in the water between them.
 * As the reader scrolls (pinned on desktop) the bridge is laid plank by plank,
 * the islands are pulled into line, each symptom is ticked off and what we
 * build appears; finally the signal crosses. On phones it is a vertical
 * narrative with a plank spine. Without motion it is simply the end state.
 */
export function IslandsChapter() {
  const root = useRef<HTMLElement>(null);
  useIslandsMotion(root);

  return (
    <section ref={root} className="isles section tone-paper" data-tone="paper" aria-labelledby="isles-title">
      <div className="wrap">
        <div className="isles__head">
          <p className="eyebrow" data-reveal>
            Where it breaks
          </p>
          <Lines
            as="h2"
            id="isles-title"
            className="h1"
            lines={["Most growing businesses", <>live on <em>three islands.</em></>]}
          />
          <p className="lead" data-reveal style={d(3)}>
            Marketing in one place, operations in another, the numbers in a spreadsheet nobody
            quite trusts. The work gets lost in the water between them. We build the bridge.
          </p>
        </div>
      </div>

      <MobileStage />

      <div className="isles__stage">
        <div className="wrap isles__frame">
          <div className="isles__meter" aria-hidden="true">
            <span className="isles__step" data-step="0">
              <b>01</b> Adrift
            </span>
            <span className="isles__track">
              <i />
            </span>
            <span className="isles__step" data-step="1">
              <b>02</b> Laying the bridge
            </span>
            <span className="isles__track">
              <i />
            </span>
            <span className="isles__step" data-step="2">
              <b>03</b> Connected
            </span>
          </div>

          <div className="isles__scene">
            <div className="isles__water" aria-hidden="true" />
            <Scraps />
            <div className="isles__bridges">
              <Bridge n={1} />
              <Bridge n={2} />
            </div>
            <div className="isles__spine" aria-hidden="true">
              <span className="isles__spine-ghost" />
              <span className="isles__spine-fill" />
            </div>

            <div className="isles__grid">
              {islands.map((island) => (
                <article key={island.id} className={`isl isl--${island.id}`} id={`isle-${island.id}`}>
                  <div className="isl__art" aria-hidden="true">
                    <span className="isl__shadow" />
                    <div className="isl__bob">
                      <div className="isl__lift">
                        <Image
                          src={island.art.src}
                          alt=""
                          width={island.art.width}
                          height={island.art.height}
                          sizes="(max-width: 1023px) 70vw, 22vw"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="isl__body">
                    <h3 className="isl__name">
                      <span className="isl__node" aria-hidden="true" />
                      <span className="index">{island.index}</span>
                      {island.name}
                    </h3>
                    <p className="isl__symptom">{island.symptom}</p>
                    <ul className="isl__syms">
                      {island.symptoms.map((symptom) => (
                        <li key={symptom} className="isl__sym">
                          <Mark />
                          <span className="isl__sym-text">
                            <span>{symptom}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="isl__builds">
                      <div className="isl__builds-in">
                        <p className="mono">What we build</p>
                        <ul className="isl__chips">
                          {island.builds.map((build) => (
                            <li key={build}>{build}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="isl__actions">
                      <Link className="isl__cta" href={`/contact?need=${island.need}`}>
                        This is us <span aria-hidden="true">→</span>
                      </Link>
                      <Link className="link" href={`/services#${island.id}`}>
                        How we fix it<span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="isles__dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
