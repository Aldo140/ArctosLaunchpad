import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CTASection } from "@/components/CTASection";
import { whyArctos } from "@/lib/content";
import { pageMetadata, breadcrumbSchema, graph, jsonLd, webPageSchema } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Studio", description: "A Calgary studio building reporting, automation and connected digital systems around how your business works.", path: "/studio" });
export default function StudioPage() {
  return <>
    <section className="ctc-editorial ctc-editorial--studio" data-material="paper" data-station="Studio"><Image className="ctc-editorial__art" src="/assets/studio/arctos-wall-materials.webp" alt="Studio wall with material samples and a card reading Systems, Clarity, Growth" fill priority sizes="100vw" /><div className="shell ctc-editorial__inner"><p className="tick-label">Arctos Launchpad / Calgary</p><h1>The work behind<br /><em>the work.</em></h1><p className="t-lead">The campaign launches. The event ends. The production run ships. We build the reporting and connected systems that keep the next one from starting at zero.</p><Link className="btn" href="/work">See the work</Link></div></section>
    <section className="section ctc-start" data-material="instrument" data-station="The practice"><div className="shell ctc-start__grid"><p className="ctc-practice-label">Design.<br />Development.<br />Operations.</p><div><p className="tick-label">One connected practice</p><h2 className="t-display">A front door.<br />A working system.</h2><p className="t-lead">Websites, campaigns, software, integrations and reporting are parts of the same operation. An enquiry should reach the right place. A completed job should leave useful information behind.</p><p className="t-body">We start with your existing tools and the people using them, then work out what needs connecting, changing or building.</p><Link className="link" href="/services">Explore what we build</Link></div></div></section>
    <section className="section" data-material="paper" data-station="Principles"><div className="shell"><p className="tick-label">How we work</p><h2 className="t-display">Clear terms.<br />Practical decisions.</h2><div className="ctc-principles">{whyArctos.map((item,i) => <article key={item.title}><span className="tick-label" aria-hidden="true">{String(i+1).padStart(2,"0")}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div><Link className="link" href="/process">Follow the process</Link></div></section>
    <CTASection title="Show us how the work runs today." />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(graph(webPageSchema({ name: "Studio", path: "/studio", description: "Reporting and automation built around how your business works." }), breadcrumbSchema([{ name: "Studio", path: "/studio" }]))) }} />
  </>;
}
