import type { Metadata } from "next";
import Link from "next/link";
import { CTASection } from "@/components/CTASection";
import { industries } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Industries", description: "Reporting and automation for events, production runs and campaign-driven businesses, with capabilities for other operating contexts.", path: "/industries" });
const contexts = [
  { n: "01", title: "The event ends. The reporting starts.", label: "Events & experiential marketing", pain: "Signups, event codes and campaign exports need to become one useful report, without another round of copying between spreadsheets.", service: "analytics-reporting", slug: "events-experiential-marketing", proof: "/work/fresh-prep-event-intelligence", proofLabel: "See the Fresh Prep internal tool" },
  { n: "02", title: "Keep the next run moving.", label: "Production & manufacturing", pain: "Product information, quoting and intake should connect to the work that delivers the order. A clearer front door and less re-keying behind it.", service: "business-automation", slug: "manufacturing", proof: "/work/true-north-kromes", proofLabel: "See True North Kromes" },
  { n: "03", title: "A campaign needs somewhere to land.", label: "Campaign-driven local business", pain: "Connect search and paid media to a useful landing page, enquiry form, CRM and follow-up. Keep the information when the campaign is over.", service: "paid-media-lead-generation", slug: "hospitality", proof: "/work/rio-alto", proofLabel: "See Rio Alto" },
];
export default function IndustriesPage() {
  return <>
    <section className="ctc-editorial" data-material="paper" data-station="Industries"><div className="shell ctc-editorial__inner"><p className="tick-label">Built around recurring work</p><h1>Different work.<br /><em>Familiar friction.</em></h1><p className="t-lead">Events. Campaigns. Production runs. If every repeat ends in a report built by hand, that is a useful place to start.</p><Link className="btn" href="/teardown">Get a free reporting teardown</Link></div></section>
    {contexts.map((context, i) => <section key={context.n} className="section" data-material={i === 1 ? "paper" : "instrument"} data-station={context.label}><div className="shell ctc-context"><p className="ctc-big-number" aria-hidden="true">{context.n}</p><div><p className="tick-label">{context.label}</p><h2 className="t-display">{context.title}</h2><p className="t-lead">{context.pain}</p><div className="ctc-context__links"><Link className="link" href={context.proof}>{context.proofLabel}</Link><Link className="link" href={`/services/${context.service}`}>Explore the capability</Link><Link className="link" href={`/industries/${context.slug}`}>Read the industry brief</Link></div></div></div></section>)}
    <section className="section" data-material="paper" data-station="Other contexts"><div className="shell"><p className="tick-label">Also / other operating contexts</p><h2 className="t-display">Start with how<br />the work runs.</h2><p className="t-lead">The context changes the constraints. Explore the relevant starting points for your industry.</p><div className="ctc-industry-list">{industries.map(industry => <Link key={industry.slug} href={`/industries/${industry.slug}`}><span>{industry.title}</span><span aria-hidden="true">↗</span></Link>)}</div></div></section>
    <CTASection />
  </>;
}
