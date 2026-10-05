import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ReportArtifact } from "@/components/figures/ReportArtifact";
import { TeardownForm } from "@/components/teardown/TeardownForm";
import { getProjectBySlug } from "@/lib/content/work";
import {
  breadcrumbSchema,
  faqPageSchema,
  graph,
  jsonLd,
  pageMetadata,
  webPageSchema,
} from "@/lib/seo";

const description =
  "Send Arctos one spreadsheet, a screenshot, or a description of how you report by hand. We show you the one-screen report it should be, the first three manual steps we would automate, and whether it is worth building.";

export const metadata: Metadata = pageMetadata({
  title: "Free reporting teardown",
  description,
  path: "/teardown",
  eyebrow: "Free reporting teardown",
  cardTitle: "Send us the spreadsheet you dread.",
});

const DELIVERABLES = [
  {
    n: "01",
    title: "A one-screen mock of the report it should be.",
    body: "Built from the file you sent and laid out around the decisions it should help you make.",
  },
  {
    n: "02",
    title: "The first three manual steps we would automate.",
    body: "The copying, merging and re-keying that eats the hours, named in plain language.",
  },
  {
    n: "03",
    title: "A straight answer on whether it is worth building.",
    body: "Sometimes the answer is no, or not yet. We will say so.",
  },
] as const;

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
  webPageSchema({
    name: "Free reporting teardown",
    description,
    path: "/teardown",
  }),
  breadcrumbSchema([{ name: "Free reporting teardown", path: "/teardown" }]),
  faqPageSchema([...FAQS]),
);

export default function TeardownPage() {
  return (
    <div className="tdn-page">
      {/* HERO: the form is the right-hand half of the first screen. */}
      <section
        className="tdn-hero"
        data-material="instrument"
        data-chapter="operate"
        data-station="Teardown"
      >
        <div className="shell tdn-hero__inner">
          <div className="tdn-hero__copy">
            <p className="tick-label tdn-hero__eyebrow">
              Free reporting teardown
            </p>
            <h1 className="tdn-hero__title">
              Send us the spreadsheet <em>you dread.</em>
            </h1>
            <p className="tdn-hero__sub">
              Bring one export, a screenshot, or a description of how you
              report today. We show you the one-screen report it should be.
            </p>
            <a className="tdn-hero__skip" href="#how">
              How it works
              <span aria-hidden="true"> ↓</span>
            </a>
          </div>
          <div className="tdn-hero__form">
            <TeardownForm />
          </div>
        </div>
      </section>

      {/* WHAT YOU GET + HOW IT WORKS */}
      <section
        className="tdn-get"
        data-material="paper"
        data-chapter="operate"
        data-station="What you get"
      >
        <div className="shell">
          <p className="tick-label">What you leave with</p>
          <ol className="tdn-get__list">
            {DELIVERABLES.map((d) => (
              <li key={d.n} className="tdn-get__item reveal">
                <span className="tdn-get__n t-folio">{d.n}</span>
                <h2 className="tdn-get__title">{d.title}</h2>
                <p className="tdn-get__body">{d.body}</p>
              </li>
            ))}
          </ol>

          <div className="tdn-how" id="how">
            <p className="tick-label">How it works</p>
            <ol className="tdn-how__track">
              {STEPS.map((s) => (
                <li key={s.n} className="tdn-how__step reveal">
                  <span className="tdn-how__node" aria-hidden="true" />
                  <span className="tdn-how__n t-folio">{s.n}</span>
                  <h3 className="tdn-how__title">{s.title}</h3>
                  <p className="tdn-how__body">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section
        className="tdn-proof"
        data-material="instrument"
        data-chapter="operate"
        data-station="Proof"
      >
        <div className="shell tdn-proof__inner">
          <div className="tdn-proof__copy">
            <p className="tick-label">Proof · Fresh Prep</p>
            <h2 className="tdn-proof__title">
              Raw signup-code exports in. The decision views out.
            </h2>
            {freshPrep && (
              <p className="tdn-proof__body">{freshPrep.whatChanged}</p>
            )}
            <Link
              className="tdn-proof__link"
              href="/work/fresh-prep-event-intelligence"
            >
              <span>Read the Fresh Prep case file</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="tdn-proof__figure">
            <ReportArtifact />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="tdn-faq"
        data-material="paper"
        data-chapter="operate"
        data-station="Questions"
      >
        <div className="shell tdn-faq__inner">
          <div className="tdn-faq__head">
            <p className="tick-label">Before you send</p>
            <h2 className="tdn-faq__title">Straight answers.</h2>
          </div>
          <div className="tdn-faq__list">
            {FAQS.map((f, i) => (
              <details key={f.question} className="tdn-faq__item" open={i === 0}>
                <summary>
                  <span>{f.question}</span>
                  <span className="tdn-faq__plus" aria-hidden="true" />
                </summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL REPEAT */}
      <section
        className="tdn-close"
        data-material="instrument"
        data-chapter="operate"
        data-station="Start"
      >
        {/* ASSET SLOT: "One clean screen" bear (reading a single tidy
            dashboard). Until it exists, the automation bear stands in. */}
        <Image
          className="tdn-close__art"
          src="/assets/illustrations/connected-automation.webp"
          alt=""
          width={1254}
          height={1254}
          sizes="(max-width: 860px) 100vw, 56vw"
          aria-hidden="true"
        />
        <div className="shell tdn-close__inner">
          <h2 className="tdn-close__title">Bring one spreadsheet.</h2>
          <p className="tdn-close__body">
            Leave with the report it should be.
          </p>
          <a className="tdn-close__btn" href="#teardown-form">
            <span>Get a free reporting teardown</span>
            <span aria-hidden="true">↑</span>
          </a>
          <Link className="tdn-close__alt" href="/contact">
            or ask a question first
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(schema)}
      />
    </div>
  );
}
