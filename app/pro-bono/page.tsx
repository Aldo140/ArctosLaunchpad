import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  KEYSTONE,
  KEYSTONE_ASK,
  KEYSTONE_FAQ,
  KEYSTONE_FOR,
  KEYSTONE_GETS,
  KEYSTONE_PROMISES,
  KEYSTONE_STEPS,
  getIsland,
  projects,
} from "@/lib/content";
import {
  ORGANIZATION_ID,
  absoluteUrl,
  breadcrumbSchema,
  faqPageSchema,
  graph,
  pageMetadata,
  webPageSchema,
} from "@/lib/seo";
import { Crumbs, JsonLd, StartBand } from "@/components/site/Page";
import { Btn, Lines, TextLink, d } from "@/components/site/ui";
import { KeystoneInvoice } from "@/components/site/probono/KeystoneInvoice";
import { FitCheck } from "@/components/site/probono/FitCheck";
import { ProBonoFx } from "@/components/site/probono/ProBonoFx";

/**
 * Keystone, the Arctos pro bono program. A company page, not a charity
 * appeal: it says what the studio gives away, to whom, how to apply, and what
 * the studio asks in return, and it shows the standard with live work.
 */

const PATH = KEYSTONE.route;
const DESCRIPTION =
  "Keystone is the Arctos Launchpad pro bono program: free website design, automation and impact reporting for nonprofits, community groups, social enterprises and small businesses that need it.";

export const metadata: Metadata = pageMetadata({
  title: "Pro Bono Web Design for Nonprofits | Arctos Keystone",
  absoluteTitle: true,
  description: DESCRIPTION,
  path: PATH,
  eyebrow: "Keystone · Pro bono",
  cardTitle: "Good work shouldn’t wait for a budget.",
});

/** Small original line glyphs for who the program is for. */
const GLYPHS: Record<(typeof KEYSTONE_FOR)[number]["id"], ReactNode> = {
  nonprofit: (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path className="g-rust" d="M32 30c-6-7-15-3-12 4 2 4 12 11 12 11s10-7 12-11c3-7-6-11-12-4Z" />
      <path d="M8 46c6 0 10 2 14 6h20c3 0 3-4 0-4H31M8 54h6" />
    </svg>
  ),
  community: (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="16" cy="22" r="6" />
      <circle cx="48" cy="22" r="6" />
      <circle cx="32" cy="40" r="6" />
      <path className="g-rust" d="M21 26l7 9M43 26l-7 9M22 22h20" />
      <path d="M10 56c2-6 7-8 12-8M54 56c-2-6-7-8-12-8" />
    </svg>
  ),
  social: (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="44" r="12" />
      <path d="M28 44h8M32 40v8" />
      <path className="g-rust" d="M32 32V18m0 0c0-6 6-10 12-10 0 6-5 10-12 10Zm0 4c0-5-5-8-10-8 0 5 4 8 10 8Z" />
    </svg>
  ),
  small: (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M12 28v26h40V28M8 54h48" />
      <path className="g-rust" d="M10 18h44l-3 10H13l-3-10Zm7 10v-10m10 10v-10m10 10v-10m10 10v-10" />
      <path d="M26 54V40h12v14" />
    </svg>
  ),
};

const PROOF = ["calgary-watch", "starlings-support-map"];

export default function ProBonoPage() {
  const proof = PROOF.flatMap((slug) => projects.filter((p) => p.slug === slug));

  return (
    <div className="kp-page">
      <ProBonoFx />

      {/* ---- Hero: the statement that gets stamped ------------------------ */}
      <section className="kp-hero tone-ink" data-tone="ink">
        <div className="kp-hero__glow" aria-hidden="true" />
        <div className="wrap kp-hero__grid">
          <div className="kp-hero__copy">
            <Crumbs trail={[{ label: "Pro bono", href: PATH }]} />
            <p className="eyebrow" data-reveal>
              Keystone · Pro bono by Arctos Launchpad
            </p>
            <Lines
              as="h1"
              className="display kp-hero__title"
              lines={["Good work", "shouldn’t wait", <>for a <em key="b">budget.</em></>]}
            />
            <p className="lead kp-hero__lead" data-reveal style={d(3)}>
              Keystone is our pro bono program. {KEYSTONE.cadence}, we design and build for a nonprofit, community
              group or small business that needs it, at no cost. Same team, same standards, no invoice.
            </p>
            <div className="actions" data-reveal style={d(4)}>
              <Btn href={`/contact?need=${KEYSTONE.need}`}>Apply for Keystone</Btn>
              <Btn href="#fit" variant="ghost">
                Are we a fit?
              </Btn>
            </div>
          </div>
          <div className="kp-hero__art">
            <KeystoneInvoice />
          </div>
        </div>
        <ul className="wrap kp-promises" aria-label="The Keystone commitments">
          {KEYSTONE_PROMISES.map((p, i) => (
            <li key={p.big} data-reveal style={d(i)}>
              <span className="kp-promises__big">{p.big}</span>
              <span className="kp-promises__label">{p.label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---- Why "Keystone" ------------------------------------------------ */}
      <section className="kp-why section tone-paper" data-tone="paper">
        <div className="wrap kp-why__grid">
          <div className="kp-why__copy">
            <p className="eyebrow" data-reveal>
              Why it’s called Keystone
            </p>
            <Lines as="h2" className="h1" lines={["A bridge stands", <>on its <em key="k">keystone.</em></>]} delay={1} />
            <div className="kp-why__body" data-reveal style={d(2)}>
              <p>
                The keystone is the last stone set at the top of an arch. Until it is in, nothing holds. Plenty of
                communities rest on organizations like that: a food bank, a youth program, a neighbourhood group, the
                family business a street depends on.
              </p>
              <p>
                Most of them cannot afford a studio, and their website and tools show it. Keystone is how we put ours in
                place: real studio work, given, not discounted.
              </p>
            </div>
          </div>
          <div className="kp-why__art" data-reveal="fade" style={d(1)}>
            <div className="kp-why__frame" data-parallax="0.12">
              <Image
                src="/assets/art/bridge.webp"
                alt="The Arctos bear setting the keystone into a rust-coloured bridge between three islands"
                width={1536}
                height={1024}
                sizes="(max-width: 900px) 100vw, 56vw"
              />
              <span className="kp-why__ring" aria-hidden="true" />
              <span className="kp-why__tag mono" aria-hidden="true">
                The keystone
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Who it's for --------------------------------------------------- */}
      <section className="kp-for section tone-ink" data-tone="ink">
        <div className="wrap">
          <div className="kp-head">
            <p className="eyebrow" data-reveal>
              Who it’s for
            </p>
            <Lines as="h2" className="h1" lines={["For the ones", <>a place <em key="l">leans on.</em></>]} delay={1} />
          </div>
          <ul className="kp-for__grid">
            {KEYSTONE_FOR.map((item, i) => (
              <li key={item.id} className="kp-for__card" data-reveal style={d(i)}>
                <span className="kp-for__glyph">{GLYPHS[item.id]}</span>
                <span className="index">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="h3">{item.title}</h3>
                <p>{item.body}</p>
                <ul className="kp-for__eg" aria-label="For example">
                  {item.eg.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- What you get: the three islands -------------------------------- */}
      <section className="kp-gets section tone-bone" data-tone="bone">
        <div className="wrap">
          <div className="kp-head kp-head--split">
            <div>
              <p className="eyebrow" data-reveal>
                What you get
              </p>
              <Lines as="h2" className="h1" lines={["The whole studio,", <>not a <em key="t">template.</em></>]} delay={1} />
            </div>
            <p className="lead" data-reveal style={d(2)}>
              The same three things we build for paying clients. Each Keystone project is scoped to where it will make
              the biggest difference, usually one or two of these.
            </p>
          </div>
          <ol className="kp-gets__grid">
            {KEYSTONE_GETS.map((g, i) => {
              const island = getIsland(g.island);
              return (
                <li key={g.island} className={`kp-gets__card kp-gets__card--${g.island}`} data-reveal style={d(i)}>
                  <div className="kp-gets__isle" data-parallax={0.06 + i * 0.03}>
                    <Image
                      src={island.art.src}
                      alt=""
                      width={island.art.width}
                      height={island.art.height}
                      sizes="(max-width: 900px) 40vw, 200px"
                    />
                  </div>
                  <p className="mono kp-gets__k">
                    <span className="index">{island.index}</span> {island.name}
                  </p>
                  <h3 className="h3">{g.title}</h3>
                  <ul>
                    {g.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ---- The standard: live community work ----------------------------- */}
      <section className="kp-proof section tone-ink" data-tone="ink">
        <div className="wrap">
          <div className="kp-head kp-head--split">
            <div>
              <p className="eyebrow" data-reveal>
                The standard
              </p>
              <Lines as="h2" className="h1" lines={["Community work,", <>already <em key="l">live.</em></>]} delay={1} />
            </div>
            <p className="lead" data-reveal style={d(2)}>
              Two platforms the studio has shipped for the nonprofit and civic world. Keystone work is held to exactly
              this standard.
            </p>
          </div>
          <ul className="kp-proof__grid">
            {proof.map((p, i) => (
              <li key={p.slug} data-reveal style={d(i)}>
                <Link className="kp-proof__card" href={p.route}>
                  <span className="kp-proof__media">
                    {p.featuredImage ? (
                      <Image src={p.featuredImage} alt="" width={1800} height={965} sizes="(max-width: 900px) 100vw, 46vw" />
                    ) : null}
                  </span>
                  <span className="kp-proof__meta mono">{p.statusLabel}</span>
                  <span className="kp-proof__title h2">{p.title}</span>
                  <span className="kp-proof__sum">{p.summary}</span>
                  <span className="kp-proof__go">
                    Read the case study <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- How it works --------------------------------------------------- */}
      <section className="kp-how section tone-paper" data-tone="paper">
        <div className="wrap">
          <div className="kp-head">
            <p className="eyebrow" data-reveal>
              How it works
            </p>
            <Lines as="h2" className="h1" lines={["From application", <>to <em key="l">launch.</em></>]} delay={1} />
          </div>
          <div className="kp-steps">
            <span className="kp-steps__track" aria-hidden="true">
              <span className="kp-steps__fill" />
            </span>
            <ol>
              {KEYSTONE_STEPS.map((s, i) => (
                <li key={s.title} className="kp-step" data-reveal style={d(i)}>
                  <span className="kp-step__dot" aria-hidden="true" />
                  <span className="index">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="h3">{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---- Fit check -------------------------------------------------------- */}
      <section className="kp-fitsec section tone-pine" data-tone="pine" id="fit">
        <div className="wrap">
          <div className="kp-head kp-head--split">
            <div>
              <p className="eyebrow" data-reveal>
                Fit check
              </p>
              <Lines as="h2" className="h1" lines={["Is Keystone", <>right for <em key="y">you?</em></>]} delay={1} />
            </div>
            <p className="lead" data-reveal style={d(2)}>
              Tick what’s true. Nothing is sent anywhere: it is a quick way to see whether applying is worth your ten
              minutes.
            </p>
          </div>
          <FitCheck />
        </div>
      </section>

      {/* ---- What we ask in return ------------------------------------------ */}
      <section className="kp-ask section tone-bone" data-tone="bone">
        <div className="wrap kp-ask__grid">
          <div>
            <p className="eyebrow" data-reveal>
              What we ask in return
            </p>
            <Lines as="h2" className="h1" lines={["The work", <>speaks for <em key="u">us.</em></>]} delay={1} />
            <p className="lead kp-ask__lead" data-reveal style={d(2)}>
              No invoice, and no fine print. Keystone is how a studio can give work away: we ask to show it, so the next
              organization can find us.
            </p>
          </div>
          <ol className="kp-ask__list">
            {KEYSTONE_ASK.map((a, i) => (
              <li key={a.title} data-reveal style={d(i)}>
                <span className="index">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="kp-ask__title">{a.title}</h3>
                  <p>{a.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- Questions -------------------------------------------------------- */}
      <section className="kp-faq section tone-ink" data-tone="ink">
        <div className="wrap kp-faq__grid">
          <div>
            <p className="eyebrow" data-reveal>
              Questions
            </p>
            <Lines as="h2" className="h1" lines={["Before you", <><em key="a">apply.</em></>]} delay={1} />
            <p className="kp-faq__more" data-reveal style={d(2)}>
              Something else? <TextLink href={`/contact?need=${KEYSTONE.need}`}>Ask us directly</TextLink>
            </p>
          </div>
          <div className="kp-faq__list">
            {KEYSTONE_FAQ.map((f, i) => (
              <details key={f.question} className="kp-faq__item" data-reveal style={d(i)} open={i === 0}>
                <summary>
                  <span>{f.question}</span>
                  <span className="kp-faq__icon" aria-hidden="true" />
                </summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <StartBand
        title={["Doing work", <>that <em key="m">matters?</em></>]}
        body="Tell us about it. Applications are read by the people who would do the work, and every one gets a reply."
        need={KEYSTONE.need}
        tone="paper"
        size="h1"
      />

      <JsonLd
        data={graph(
          webPageSchema({ name: "Keystone: the Arctos pro bono program", path: PATH, description: DESCRIPTION }),
          {
            "@type": "Offer",
            "@id": `${absoluteUrl(PATH)}#offer`,
            name: "Keystone pro bono program",
            description: DESCRIPTION,
            url: absoluteUrl(PATH),
            price: "0",
            priceCurrency: "CAD",
            offeredBy: { "@id": ORGANIZATION_ID },
            itemOffered: {
              "@type": "Service",
              name: "Pro bono website design, automation and impact reporting",
              provider: { "@id": ORGANIZATION_ID },
            },
          },
          faqPageSchema([...KEYSTONE_FAQ]),
          breadcrumbSchema([{ name: "Pro bono", path: PATH }]),
        )}
      />
    </div>
  );
}
