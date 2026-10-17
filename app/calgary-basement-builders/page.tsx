import type { Metadata } from "next";
import { TeardownForm, type TeardownCopy } from "@/components/teardown/TeardownForm";
import {
  breadcrumbSchema,
  faqPageSchema,
  graph,
  pageMetadata,
  webPageSchema,
} from "@/lib/seo";
import { Crumbs, JsonLd } from "@/components/site/Page";
import { Lines, TextLink, d } from "@/components/site/ui";

const description =
  "Booked in-home consultations for Calgary basement development and legal suite builders: Google ads run for you, every call answered 24/7, every quote followed up. Start with a free Missed Lead Check.";

export const metadata: Metadata = pageMetadata({
  title: "Booked Consultations for Calgary Basement Builders | Arctos Launchpad",
  absoluteTitle: true,
  description,
  path: "/calgary-basement-builders",
  eyebrow: "Calgary basement and suite builders",
  cardTitle: "Booked consultations in 90 days, or we work free.",
});

const CHECK: TeardownCopy = {
  projectType: "Free Missed Lead Check",
  title: "Free Missed Lead Check",
  challengeLabel: "What basement work do you do, and which parts of Calgary?",
  challengePlaceholder: "Developments and legal suites, mostly NW and NE…",
  challengeError: "Tell us a little about the work you do and where. A sentence or two is plenty.",
  sampleLabel: "Your website",
  samplePlaceholder: "yourcompany.ca",
  submit: "Get my free Missed Lead Check",
  micro: "A 5-minute video, free. No obligation. Reply within two business days.",
  done: [
    "We look at your business the way a homeowner does: your phone, your form, your Google listing.",
    "Within two business days you get a short video of what we found.",
    "If it's worth fixing, we show you how. If it isn't, we say so.",
  ],
};

const GETS = [
  "Google ads run for you",
  "Every call answered, 24/7",
  "Every quote followed up",
] as const;

const LEAK = [
  {
    n: "27%",
    title: "of calls go unanswered.",
    body: "Calls to home service businesses that ring out, according to Invoca's call data. Most callers don't leave a message.",
  },
  {
    n: "2",
    title: "builders get called.",
    body: "Homeowners contact about two before choosing, and 49% picked the one who replied fastest (Mantel homeowner survey, 2025).",
  },
  {
    n: "7×",
    title: "better within the hour.",
    body: "Leads answered within an hour were about seven times more likely to turn into a real conversation (Harvard Business Review).",
  },
] as const;

const STACK = [
  {
    n: "01",
    title: "Get found.",
    body: "Google Search and Local Services Ads for basement development and legal suites in your part of Calgary, plus a tidy Google Business Profile and a quote-ready website if you want one. You pay Google directly.",
  },
  {
    n: "02",
    title: "Never miss one.",
    body: "An assistant answers your line 24/7 in your company's name, checks the address and project, and books the consultation into your calendar. Missed calls get a text back in seconds. Urgent calls come straight to you.",
  },
  {
    n: "03",
    title: "Win the job.",
    body: "Every quote gets a friendly follow-up until the homeowner says yes or no. Every finished job gets a review request. You see calls, booked consultations and jobs won on your phone.",
  },
] as const;

const PROMISES = [
  {
    title: "15 booked consultations in 90 days, or we keep working free until you have them.",
    body: "Booked, in-home consultations with homeowners in your area. The conditions are simple and agreed before we start.",
  },
  {
    title: "You own everything.",
    body: "Ad account, phone number, website and domain are in your name from day one. If you leave, you take all of it.",
  },
  {
    title: "One builder per quadrant.",
    body: "We work with one basement builder in each of NW, NE, SW and SE Calgary. We won't run ads against you.",
  },
  {
    title: "No long contract.",
    body: "90 days to prove it, then month to month.",
  },
] as const;

const FAQS = [
  {
    question: "What is the Missed Lead Check?",
    answer:
      "We try to reach your business the way a homeowner would: we call, fill in your website form and look you up on Google. Then we send you a short video of what happened, with an estimate of the work it may be costing you. It's free and there is no obligation.",
  },
  {
    question: "Why basement builders?",
    answer:
      "Calgary is building secondary suites faster than ever. Since April 2026 a suite no longer needs a development permit when it meets the bylaw rules, and registered suites have roughly doubled since 2024. Each project is large, so a few extra booked consultations make a real difference.",
  },
  {
    question: "Do I have to talk to a robot's customers?",
    answer:
      "No. You approve what the assistant says, it tells callers who they're speaking with and that the call may be recorded, and you can listen to every call. You can start with after-hours calls only and decide from there.",
  },
  {
    question: "What if I'm already booked solid?",
    answer:
      "Pause the ads whenever your calendar is full. The phone line and quote follow-up keep working so nothing you already have slips.",
  },
  {
    question: "What does it cost?",
    answer:
      "A monthly fee plus your own ad budget, which you pay to Google directly. We go through the numbers with you on a call, using your own job size and close rate, before you decide anything.",
  },
  {
    question: "Do you work outside Calgary?",
    answer:
      "Not yet. The offer depends on knowing Calgary's suite rules and keeping one builder per quadrant.",
  },
] as const;

const schema = graph(
  webPageSchema({
    name: "Booked consultations for Calgary basement builders",
    description,
    path: "/calgary-basement-builders",
  }),
  breadcrumbSchema([{ name: "Calgary basement builders", path: "/calgary-basement-builders" }]),
  faqPageSchema([...FAQS]),
);

export default function Page() {
  return (
    <>
      <section className="contact tdh tone-ink" data-tone="ink">
        <div className="wrap contact__grid">
          <div className="contact__side">
            <Crumbs trail={[{ label: "Calgary basement builders", href: "/calgary-basement-builders" }]} />
            <p className="eyebrow" data-reveal>
              Calgary basement and suite builders
            </p>
            <Lines
              as="h1"
              className="h1"
              lines={["15 booked consultations in 90 days,", <em key="f">or we work free.</em>]}
            />
            <p className="lead" data-reveal style={d(2)}>
              We run your Google ads, answer every call around the clock, and follow up every quote, so
              homeowners planning a basement or legal suite end up in your calendar instead of a
              competitor&rsquo;s.
            </p>
            <ul className="tdh__gets" aria-label="What you get" data-reveal style={d(3)}>
              {GETS.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
            <a className="tdh__jump mono" href="#leak" data-reveal style={d(4)}>
              Where the jobs slip away <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="contact__form-plain" data-reveal="fade" style={d(2)}>
            <TeardownForm copy={CHECK} />
          </div>
        </div>
      </section>

      <section id="leak" className="section tds tone-pine" data-tone="pine" aria-labelledby="leak-title">
        <div className="wrap">
          <p className="eyebrow" data-reveal>
            Where the jobs slip away
          </p>
          <Lines as="h2" id="leak-title" className="h1" lines={["Most builders don't need more leads.", <em key="a">They need to answer them.</em>]} />
          <ol className="tdn-steps tds__list" data-reveal="fade">
            {LEAK.map((item, i) => (
              <li key={item.n} className="tds__card" style={d(i)}>
                <span className="tds__node" aria-hidden="true" />
                <span className="index">{item.n}</span>
                <h3 className="h3">{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section tds tone-ink" data-tone="ink" aria-labelledby="stack-title">
        <div className="wrap">
          <p className="eyebrow" data-reveal>
            What we do
          </p>
          <Lines as="h2" id="stack-title" className="h1" lines={["Found, answered,", <em key="b">booked.</em>]} />
          <ol className="tdn-steps tds__list" data-reveal="fade">
            {STACK.map((step, i) => (
              <li key={step.n} className="tds__card" style={d(i)}>
                <span className="tds__node" aria-hidden="true" />
                <span className="index">{step.n}</span>
                <h3 className="h3">{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section tone-bone" data-tone="bone" aria-labelledby="promise">
        <div className="wrap split">
          <div className="split__head">
            <p className="eyebrow" data-reveal>
              Our promises
            </p>
            <Lines as="h2" id="promise" className="h2" lines={["The risk is", <em key="c">ours.</em>]} />
            <TextLink href="#teardown-form">Start with the free check</TextLink>
          </div>
          <div className="faq tdn-faq">
            {PROMISES.map((item) => (
              <div key={item.title} className="faq__item">
                <p>
                  <strong>{item.title}</strong> {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section tone-bone tdf" data-tone="bone" aria-labelledby="faq">
        <div className="wrap split">
          <div className="split__head">
            <p className="eyebrow" data-reveal>
              Questions
            </p>
            <Lines as="h2" id="faq" className="h2" lines={["Before you", <em key="s">ask.</em>]} />
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
