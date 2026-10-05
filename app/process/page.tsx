import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CTASection } from "@/components/CTASection";
import { processDetails } from "@/lib/content";
import { pageMetadata, breadcrumbSchema, graph, jsonLd, webPageSchema } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Process", description: "Start with a reporting teardown. Map the work, build the connected system, and improve it in daily use.", path: "/process" });
export default function ProcessPage() {
  return <>
    <section className="ctc-editorial" data-material="paper" data-station="Process">
      <Image className="ctc-editorial__art" src="/assets/chapters/operate.webp" alt="" fill priority sizes="100vw" />
      <div className="shell ctc-editorial__inner"><p className="tick-label">The process / evidence first</p><h1>Understand the work.<br /><em>Then build.</em></h1><p className="t-lead">Before another tool, a clear picture of where the information goes and where the work gets stuck.</p><Link className="btn" href="/teardown">Get a free reporting teardown</Link></div>
    </section>
    <section className="section ctc-start" data-material="instrument" data-station="First step"><div className="shell ctc-start__grid"><p className="ctc-big-number" aria-hidden="true">00</p><div><p className="tick-label">Before the project</p><h2 className="t-display">Bring one report.<br />See what it could be.</h2><p className="t-lead">A recent export, a spreadsheet, or a description of your last campaign, event or production run. We map the manual steps and show you a one-screen mock of the report it should be.</p><Link className="link" href="/teardown">What the free teardown includes</Link></div></div></section>
    <section className="section" data-material="paper" data-station="The route"><div className="shell"><p className="tick-label">If we work together / six steps</p><div className="ctc-route">{processDetails.map(step => <article className="ctc-route__stop" key={step.id}><span className="ctc-route__number" aria-hidden="true">{step.index}</span><div><h2>{step.title}</h2><p className="t-lead">{step.summary}</p><p className="t-body">{step.detail}</p></div><div><p className="tick-label">What you leave with</p><ul>{step.deliverables.map(item => <li key={item}>{item}</li>)}</ul></div></article>)}</div></div></section>
    <CTASection title="Start with the report. Decide from there." />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(graph(webPageSchema({ name: "Process", path: "/process", description: "Reporting and automation built around how your business works." }), breadcrumbSchema([{ name: "Process", path: "/process" }]))) }} />
  </>;
}
