import type { Metadata } from "next";
import Link from "next/link";
import { NeedFinder } from "@/components/studio/NeedFinder";
import { CTASection } from "@/components/CTASection";
import { services } from "@/lib/content";
import { pageMetadata, breadcrumbSchema, graph, jsonLd, webPageSchema } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({title:"Services",description:"Websites, growth, automation, reporting and custom software. Start with what your business needs to work better.",path:"/services"});
export default function ServicesPage(){return <div className="v3-page">
<section className="v3-page-lead" data-material="paper" data-station="Services"><div className="v3-wrap"><p className="v3-kicker">What we build</p><h1>Your next stage.<br /><em>A better system.</em></h1><p>Win the right customers. Move the work forward. Get a clear view of what is happening. Start with the part that needs attention.</p></div></section>
<section className="v3-section v3-service-start" data-material="paper" data-station="Your starting point"><div className="v3-wrap"><h2 className="v3-finder-heading">Find your starting point.</h2><NeedFinder /></div></section>
<section className="v3-section" data-material="instrument" data-station="All capabilities"><div className="v3-wrap"><p className="v3-kicker">The full toolkit</p><h2>Different disciplines.<br /><span>One connected practice.</span></h2><div className="v3-service-index">{services.map((service,i)=><Link key={service.slug} href={`/services/${service.slug}`}><span className="v3-mono">{String(i+1).padStart(2,"0")}</span><h3>{service.title}</h3><p>{service.summary}</p><span aria-hidden="true">↗</span></Link>)}</div></div></section>
<CTASection /><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(graph(webPageSchema({name:"Services",path:"/services",description:"Websites, software, automation and reporting."}),breadcrumbSchema([{name:"Services",path:"/services"}])))} /></div>;}
