import type { Metadata } from "next";
import Link from "next/link";
import { CTASection } from "@/components/CTASection";
import { industries } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({title:"Industries",description:"Websites, software and automation shaped around the operating realities of your industry.",path:"/industries"});
export default function IndustriesPage(){return <div className="v3-page"><section className="v3-page-lead" data-material="paper" data-station="Industries"><div className="v3-wrap"><p className="v3-kicker">The business comes first</p><h1>Your industry.<br /><em>Your moving parts.</em></h1><p>How customers choose, how a job is approved and how information moves all change with the business. We start with those realities.</p></div></section><section className="v3-section" data-material="instrument" data-station="Operating contexts"><div className="v3-wrap"><p className="v3-kicker">Explore your operating context</p><div className="v3-service-index">{industries.map((industry,i)=><Link key={industry.slug} href={`/industries/${industry.slug}`}><span className="v3-mono">{String(i+1).padStart(2,"0")}</span><h3>{industry.title}</h3><p>{industry.summary}</p><span aria-hidden="true">↗</span></Link>)}</div></div></section><CTASection title="Start with how your business works." /></div>;}
