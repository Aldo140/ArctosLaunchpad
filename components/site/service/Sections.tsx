import Link from "next/link";
import type { CSSProperties } from "react";
import type { Project, ServicePage } from "@/lib/content";
import { ProjectPlate } from "@/components/site/ProjectPlate";
import { Lines, d } from "@/components/site/ui";

const pad = (n: number) => String(n + 1).padStart(2, "0");
const WORDS = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
];

/* ---- Sound familiar? Problems struck through, then the card turns over -- */

export function BeforeAfter({ sheet }: { sheet: ServicePage }) {
  return (
    <section
      className="section tone-paper svx-ba"
      data-tone="paper"
      aria-labelledby="familiar"
    >
      <div className="wrap svx-ba__grid">
        <div className="svx-ba__head">
          <p className="eyebrow" data-reveal>
            Sound familiar?
          </p>
          <Lines
            as="h2"
            id="familiar"
            className="h2 svx-ba__title"
            lines={[sheet.problem]}
          />
        </div>

        <div className="svx-ba__track">
          <div className="svx-ba__stage">
            <div className="svx-ba__meter" aria-hidden="true">
              <span className="mono svx-ba__tag svx-ba__tag--before">
                Before
              </span>
              <span className="svx-ba__bar">
                <span />
              </span>
              <span className="mono svx-ba__tag svx-ba__tag--after">After</span>
            </div>
            <div className="svx-ba__card">
              <div className="svx-ba__face svx-ba__face--before">
                <h3 className="mono svx-ba__label">
                  Before · how it feels now
                </h3>
                <ul className="svx-ba__problems">
                  {sheet.problems.map((problem, i) => (
                    <li key={problem}>
                      <span className="index">{pad(i)}</span>
                      <span className="svx-ba__strike">
                        <span>{problem}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="svx-ba__turn" aria-hidden="true">
                <span className="mono">becomes</span>
              </div>
              <div className="svx-ba__face svx-ba__face--after tone-pine">
                <h3 className="mono svx-ba__label">After · what changes</h3>
                <ol className="svx-ba__outcomes">
                  {sheet.outcomes.map((outcome) => (
                    <li key={outcome}>
                      <svg
                        className="svx-ba__tick"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M4 12.5l5 5L20 6" />
                      </svg>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
          <div className="svx-ba__runway" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

/* ---- Capabilities: a tilting grid of tiles -------------------------------- */

export function Capabilities({ sheet }: { sheet: ServicePage }) {
  return (
    <section
      className="section tone-bone svx-caps"
      data-tone="bone"
      aria-labelledby="what"
    >
      <div className="wrap">
        <div className="svx-caps__head">
          <div>
            <p className="eyebrow" data-reveal>
              What we do
            </p>
            <Lines
              as="h2"
              id="what"
              className="h1"
              lines={["The work,", <em key="i">itemised.</em>]}
            />
          </div>
          {sheet.reassurance ? (
            <p className="body svx-caps__note" data-reveal style={d(2)}>
              {sheet.reassurance}
            </p>
          ) : null}
        </div>
        <ol className="svx-caps__grid">
          {sheet.capabilities.map((cap, i) => (
            <li key={cap} className="svx-tile" data-svx-tilt>
              <div className="svx-tile__face">
                <span className="svx-tile__ghost" aria-hidden="true">
                  {pad(i)}
                </span>
                <span className="index">{pad(i)}</span>
                <span className="svx-tile__text">{cap}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---- How it runs: planks of a bridge, laid in order ----------------------- */

export function Bridge({ sheet }: { sheet: ServicePage }) {
  const n = sheet.process.length;
  return (
    <section
      className="section tone-ink svx-br"
      data-tone="ink"
      aria-labelledby="how"
    >
      <div className="wrap">
        <div className="svx-br__head">
          <div>
            <p className="eyebrow" data-reveal>
              How it runs
            </p>
            <Lines
              as="h2"
              id="how"
              className="h2"
              lines={["Laid one plank", <em key="p">at a time.</em>]}
            />
          </div>
          <p className="body" data-reveal style={d(2)}>
            {WORDS[n] ?? n} steps, in order. Each one rests on the one before
            it.
          </p>
        </div>

        <div className="svx-br__span" style={{ "--n": n } as CSSProperties}>
          <span
            className="mono svx-br__shore svx-br__shore--a"
            aria-hidden="true"
          >
            Where you are
          </span>
          <div className="svx-br__bridge">
            <svg
              className="svx-br__cable"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0 0 Q50 170 100 0" />
            </svg>
            <span
              className="svx-br__tower svx-br__tower--a"
              aria-hidden="true"
            />
            <span
              className="svx-br__tower svx-br__tower--b"
              aria-hidden="true"
            />
            <span className="svx-br__rail" aria-hidden="true">
              <span className="svx-br__fill" />
              <span className="svx-br__signal" />
            </span>
            <ol className="svx-br__deck">
              {sheet.process.map((step, i) => (
                <li
                  key={step}
                  className="svx-plank"
                  style={{ "--f": (i + 0.5) / n } as CSSProperties}
                >
                  <span className="svx-plank__hanger" aria-hidden="true" />
                  <div className="svx-plank__board">
                    <span className="svx-plank__n">{pad(i)}</span>
                    <span className="svx-plank__text">{step}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <span
            className="mono svx-br__shore svx-br__shore--b"
            aria-hidden="true"
          >
            Running
          </span>
        </div>
      </div>
    </section>
  );
}

/* ---- Wrong fit: stamped, honest notes ------------------------------------- */

export function WrongFit({
  sheet,
  need,
}: {
  sheet: ServicePage;
  need: string;
}) {
  return (
    <section
      className="section tone-paper svx-wf"
      data-tone="paper"
      aria-labelledby="fit"
    >
      <div className="wrap svx-wf__grid">
        <div className="svx-wf__head">
          <p className="eyebrow" data-reveal>
            Honest about fit
          </p>
          <Lines
            as="h2"
            id="fit"
            className="h2"
            lines={["When we’re the", <em key="w">wrong choice.</em>]}
          />
          <p className="body" data-reveal style={d(2)}>
            Saying so early saves both of us time. If none of these sound like
            you, we should talk.
          </p>
          <p data-reveal style={d(3)}>
            <Link className="link" href={`/contact?need=${need}`}>
              Not sure? Ask anyway <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
        <ul className="svx-wf__notes">
          {sheet.wrongFit.map((item, i) => (
            <li
              key={item}
              className="svx-note"
              style={{ "--tilt": `${i % 2 ? 0.7 : -0.8}deg` } as CSSProperties}
            >
              <span className="mono svx-note__n">Not a fit · {pad(i)}</span>
              <p>{item}</p>
              <span className="svx-stamp" aria-hidden="true">
                <span>Wrong</span>
                <span>fit</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---- Related work: real project media on tilting plates -------------------- */

export function Proof({ projects }: { projects: Project[] }) {
  return (
    <section
      id="proof"
      className="section tone-pine svx-proof"
      data-tone="pine"
      aria-labelledby="proof-title"
    >
      <div className="wrap">
        <p className="eyebrow" data-reveal>
          Related work
        </p>
        <Lines
          as="h2"
          id="proof-title"
          className="h2"
          lines={["The same work,", <em key="s">in real projects.</em>]}
        />
        <div className={`svx-proof__grid svx-proof__grid--${projects.length}`}>
          {projects.map((p, i) => (
            <div
              key={p.slug}
              className="svx-proof__item"
              data-svx-tilt="soft"
              data-reveal
              style={d(i)}
            >
              <ProjectPlate project={p} sizes="(max-width: 900px) 92vw, 46vw" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- FAQ + often paired with ----------------------------------------------- */

export function Faq({
  sheet,
  related,
  local,
}: {
  sheet: ServicePage;
  related: ServicePage[];
  /** The matching Calgary landing page, linked so local search relevance flows both ways. */
  local?: { route: string; title: string };
}) {
  return (
    <section
      className="section tone-bone svx-faq"
      data-tone="bone"
      aria-labelledby="faq"
    >
      <div className="wrap svx-faq__grid">
        <div className="svx-faq__head">
          <p className="eyebrow" data-reveal>
            Questions
          </p>
          <Lines
            as="h2"
            id="faq"
            className="h2"
            lines={["Asked", <em key="o">often.</em>]}
          />
        </div>
        <div className="svx-faq__list">
          {sheet.faq.map((item, i) => (
            <details
              key={item.question}
              className="svx-faq__item"
              data-reveal
              style={d(i)}
            >
              <summary>
                <span className="index">Q{pad(i)}</span>
                <span className="svx-faq__q">{item.question}</span>
                <span className="svx-faq__icon" aria-hidden="true" />
              </summary>
              <div className="svx-faq__body">
                <p>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
      {related.length ? (
        <div className="wrap svx-pair">
          <p className="mono">Often paired with</p>
          <ul>
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={r.route}>
                  {r.title} <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {local ? (
        <div className="wrap svx-pair">
          <p className="mono">Working in Calgary</p>
          <ul>
            <li>
              <Link href={local.route}>
                {local.title} <span aria-hidden="true">→</span>
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </section>
  );
}
