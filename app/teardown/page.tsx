import type { Metadata } from "next";
import Link from "next/link";
import { TeardownForm } from "@/components/teardown/TeardownForm";
import { TeardownViz } from "@/components/site/contact/TeardownViz";
import { getProjectBySlug } from "@/lib/content";
import {
  breadcrumbSchema,
  faqPageSchema,
  graph,
  pageMetadata,
  webPageSchema,
} from "@/lib/seo";
import { Crumbs, JsonLd } from "@/components/site/Page";
import { PlateStage } from "@/components/site/ProjectPlate";
import { Lines, Status, TextLink, d } from "@/components/site/ui";

const description =
  "Send Arctos one spreadsheet, a screenshot, or a description of how you report by hand. We show you the one-screen report it should be, the first three manual steps we would automate, and whether it is worth building.";

export const metadata: Metadata = pageMetadata({
  title: "Free reporting teardown",
  description,
  path: "/teardown",
  eyebrow: "Free reporting teardown",
  cardTitle: "Send us the spreadsheet you dread.",
});

const GETS = ["A one-screen mock", "The first three steps to automate", "A straight answer"] as const;

/** Small original line glyphs for the three steps: a sheet sent, hours mapped, a screen shown. */
const GLYPHS = [
  <svg key="a" viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="12" y="10" width="30" height="40" rx="2" /><path d="M18 20h18M18 27h18M18 34h12" /><path className="g-rust" d="M38 44l14-14m0 0h-10m10 0v10" /></svg>,
  <svg key="b" viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="14" cy="46" r="4" /><circle cx="32" cy="20" r="4" /><circle cx="50" cy="40" r="4" /><path className="g-rust" d="M17 43l12-20M35 23l12 14" /><path d="M10 56h44" /></svg>,
  <svg key="c" viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="8" y="12" width="48" height="32" rx="2" /><path d="M24 52h16M32 44v8" /><path className="g-rust" d="M14 36l9-8 7 5 12-12 8 5" /></svg>,
];

const STEPS = [
  {
    n: "01",
    title: "You send it, or describe it.",
    body: "An export, a screenshot, or a few sentences about how you report today.",
  },
  {
    n: "02",
    title: "We map where the hours go.",
    body: "Where the numbers come from, who touches them, and what gets typed twice.",
  },
  {
    n: "03",
    title: "We show you the screen.",
    body: "A walk-through of the mock and the three steps, with the people who would do the work.",
  },
] as const;

const FAQS = [
  {
    question: "What should I bring?",
    answer:
      "One recent export or spreadsheet, a screenshot of it, or just a description of how you reported on your last campaign, event or production run. A rough description is enough to start.",
  },
  {
    question: "Is it really free?",
    answer:
      "Yes. The teardown is free and there is no obligation to hire us afterwards.",
  },
  {
    question: "Do you need access to my systems?",
    answer:
      "No. A screenshot or an export is enough. We work from what you send us.",
  },
  {
    question: "Who will I talk to?",
    answer:
      "The people who would do the work, not a queue. Your request is read by them, and so is your sample.",
  },
  {
    question: "What happens after?",
    answer:
      "You get the mock, the three steps and a straight answer on whether it is worth building. If it is, you decide what to do next. If it is not, we tell you that too. There is no sales sequence. Your details are only used to respond to this request.",
  },
] as const;

const freshPrep = getProjectBySlug("fresh-prep-event-intelligence");

const schema = graph(
  webPageSchema({ name: "Free reporting teardown", description, path: "/teardown" }),
  breadcrumbSchema([{ name: "Free reporting teardown", path: "/teardown" }]),
  faqPageSchema([...FAQS]),
);

export default function TeardownPage() {
  return (
    <>
      <section className="contact tdh tone-ink" data-tone="ink">
        <div className="wrap contact__grid">
          <div className="contact__side">
            <Crumbs trail={[{ label: "Free reporting teardown", href: "/teardown" }]} />
            <p className="eyebrow" data-reveal>
              Free reporting teardown · 30 minutes
            </p>
            <Lines as="h1" className="h1" lines={["Send us the spreadsheet", <em key="d">you dread.</em>]} />
            <p className="lead" data-reveal style={d(2)}>
              Bring one export, a screenshot, or a description of how you report today. We show you the
              one-screen report it should be.
            </p>
            <ul className="tdh__gets" aria-label="What you get" data-reveal style={d(3)}>
              {GETS.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
            <a className="tdh__jump mono" href="#what-you-get" data-reveal style={d(4)}>
              See what that looks like <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="contact__form-plain" data-reveal="fade" style={d(2)}>
            <TeardownForm />
          </div>
        </div>
      </section>

      <TeardownViz />

      <section id="how" className="section tds tone-pine" data-tone="pine" aria-labelledby="how-title">
        <div className="wrap">
          <p className="eyebrow" data-reveal>
            How it works
          </p>
          <Lines as="h2" id="how-title" className="h1" lines={["Three steps.", <em key="n">No sales sequence.</em>]} />
          <ol className="tdn-steps tds__list" data-reveal="fade">
            {STEPS.map((step, i) => (
              <li key={step.n} className="tds__card" style={d(i)}>
                <span className="tds__node" aria-hidden="true" />
                <span className="tds__glyph">{GLYPHS[i]}</span>
                <span className="index">{step.n}</span>
                <h3 className="h3">{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {freshPrep ? (
        <section className="section tone-ink" data-tone="ink" aria-labelledby="proof">
          <div className="wrap tdn-proof">
            <div className="tdn-proof__copy">
              <p className="eyebrow" data-reveal>
                Where this leads
              </p>
              <Lines as="h2" id="proof" className="h2" lines={["Raw exports in.", <em key="r">Decisions out.</em>]} />
              <div data-reveal>
                <Status project={freshPrep} />
              </div>
              <p className="body" data-reveal style={d(2)}>
                {freshPrep.whatChanged}
              </p>
              <TextLink href={freshPrep.route}>Inside the reporting system</TextLink>
            </div>
            <Link href={freshPrep.route} className="tdn-proof__stage" aria-label={`${freshPrep.title} case study`}>
              <PlateStage project={freshPrep} />
            </Link>
          </div>
        </section>
      ) : null}

      <section className="section tone-bone tdf" data-tone="bone" aria-labelledby="faq">
        <div className="wrap split">
          <div className="split__head">
            <p className="eyebrow" data-reveal>
              Questions
            </p>
            <Lines as="h2" id="faq" className="h2" lines={["Before you", <em key="s">send it.</em>]} />
            <TextLink href="#teardown-form">Back to the form</TextLink>
          </div>
          <div className="faq tdn-faq">
            {FAQS.map((item) => (
              <details key={item.question} className="faq__item">
                <summary>
                  <span>{item.question}</span>
                  <span className="faq__icon" aria-hidden="true" />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <JsonLd data={schema} />
    </>
  );
}
