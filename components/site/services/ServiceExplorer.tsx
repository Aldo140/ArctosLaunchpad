"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";

export type ExplorerService = {
  slug: string;
  route: string;
  title: string;
  summary: string;
  capabilities: string[];
  project?: {
    title: string;
    image?: string;
    statusLabel: string;
    tone: "live" | "internal" | "studio";
    accent?: string;
  };
};

/**
 * The services on one island. Rows are the real links (summary attached with
 * aria-describedby); on wide screens with a mouse the row that has the
 * pointer or focus opens out and a preview plate beside the list shows what
 * the service covers and the closest real project. The plate is visual only.
 * On touch, narrow screens, reduced motion or without JS every row is simply open.
 */
export function ServiceExplorer({
  island,
  services,
}: {
  island: string;
  services: ExplorerService[];
}) {
  const [active, setActive] = useState(0);
  const current = services[active];

  return (
    <div className="svx-ex">
      <ol className="svx-ex__list">
        {services.map((service, n) => {
          const id = `${island}-svc-${service.slug}`;
          return (
            <li
              key={service.slug}
              className="svx-row"
              data-on={n === active ? "true" : undefined}
              onMouseEnter={() => setActive(n)}
              onFocus={() => setActive(n)}
              data-reveal
              style={{ "--d": n % 4 } as CSSProperties}
            >
              <span className="svx-row__fill" aria-hidden="true" />
              <span className="index svx-row__idx">
                {String(n + 1).padStart(2, "0")}
              </span>
              <h3 className="svx-row__title">
                <Link href={service.route} aria-describedby={id}>
                  {service.title}
                </Link>
              </h3>
              <span className="mono svx-row__count">
                {service.capabilities.length} capabilities
              </span>
              <span className="svx-row__arrow" aria-hidden="true">
                →
              </span>
              <div className="svx-row__more">
                <div>
                  <p id={id} className="svx-row__summary">
                    {service.summary}
                  </p>
                  {service.project ? (
                    <p className="mono svx-row__rel">
                      Related work · {service.project.title}
                    </p>
                  ) : null}
                  {service.project?.image ? (
                    <span className="svx-row__thumb" aria-hidden="true">
                      <Image
                        src={service.project.image}
                        alt=""
                        width={1600}
                        height={852}
                        sizes="120px"
                        loading="lazy"
                      />
                    </span>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="svx-ex__plate" aria-hidden="true">
        <div key={current.slug} className="svx-ex__plin">
          {current.project ? (
            <figure
              className={`svx-ex__shot${current.project.image ? "" : " svx-ex__shot--type"}`}
              style={
                {
                  "--plate": current.project.accent ?? "var(--ink-3)",
                } as CSSProperties
              }
            >
              {current.project.image ? (
                <Image
                  src={current.project.image}
                  alt=""
                  width={1600}
                  height={852}
                  sizes="30vw"
                />
              ) : (
                <span className="svx-ex__typeset">
                  <span className="mono">{current.project.statusLabel}</span>
                  <span>{current.project.title}</span>
                  <span className="svx-ex__bars">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="mono">No public screenshots</span>
                </span>
              )}
              <figcaption>
                <span className="mono">Related work</span>
                <span className="svx-ex__ptitle">{current.project.title}</span>
                <span className={`status status--${current.project.tone}`}>
                  {current.project.statusLabel}
                </span>
              </figcaption>
            </figure>
          ) : null}
          <p className="svx-ex__title">{current.title}</p>
          <p className="svx-ex__summary">{current.summary}</p>
          <p className="mono svx-ex__k">
            {current.capabilities.length} capabilities
          </p>
          <ul className="svx-ex__caps">
            {current.capabilities.map((c, i) => (
              <li key={c} style={{ "--i": i } as CSSProperties}>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
