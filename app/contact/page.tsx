import type { Metadata } from "next";
import { ContactExperience } from "@/components/site/contact/ContactExperience";
import { breadcrumbSchema, graph, pageMetadata, webPageSchema } from "@/lib/seo";
import { Crumbs, JsonLd } from "@/components/site/Page";
import { Lines, TextLink, d } from "@/components/site/ui";

export const metadata: Metadata = pageMetadata({
  title: "Start a project",
  description:
    "Start a project with a Calgary web design and software studio. Tell Arctos what you need: more enquiries, less manual work, or software that fits.",
  path: "/contact",
  cardTitle: "What needs to connect?",
});

const NEXT = [
  ["You send a few sentences", "The problem, in your words. No brief, no budget required."],
  ["We read it properly", "The people who would do the work reply within two business days."],
  ["A first conversation", "We work out the right starting point together. No obligation."],
] as const;

export default function ContactPage() {
  const head = (
    <>
      <Crumbs trail={[{ label: "Start a project", href: "/contact" }]} />
      <p className="eyebrow" data-reveal>
        A useful first conversation
      </p>
      <Lines as="h1" className="h1" lines={["What needs", <>to <em key="c">connect?</em></>]} />
      <p className="lead" data-reveal style={d(2)}>
        You don’t need a finished brief. Tell us what is getting in the way and where you want to
        go.
      </p>
    </>
  );

  const foot = (
    <>
      <ol className="contact__next" aria-label="What happens next">
        {NEXT.map(([title, body], i) => (
          <li key={title} data-reveal style={d(i)}>
            <span className="contact__step">{i + 1}</span>
            <div>
              <p className="contact__step-title">{title}</p>
              <p>{body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="contact__aside" data-reveal>
        <p className="mono">Reporting taking over your week?</p>
        <p>
          Bring one spreadsheet to a free reporting teardown. We show you the report it could be and
          the first steps we would automate.
        </p>
        <TextLink href="/teardown">The free teardown</TextLink>
      </div>
    </>
  );

  return (
    <>
      <section className="contact cx tone-ink" data-tone="ink">
        <ContactExperience head={head} foot={foot} />
      </section>
      <JsonLd
        data={graph(
          webPageSchema({ type: "ContactPage", name: "Start a project", path: "/contact", description: "Start a project with Arctos Launchpad." }),
          breadcrumbSchema([{ name: "Start a project", path: "/contact" }]),
        )}
      />
    </>
  );
}
