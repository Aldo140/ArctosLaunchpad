import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({title:"Let's talk",description:"Tell Arctos what your business needs: a better website, less manual work, or custom software. Start with the problem, not a technical brief.",path:"/contact"});
export default function ContactPage(){return <div className="v3-page">
<section className="v3-contact" data-material="paper" data-station="Let's talk"><div className="v3-wrap v3-contact-layout"><aside><p className="v3-kicker">A useful first conversation</p><h1>What needs to<br /><em>work better?</em></h1><p>You don’t need a finished brief. Tell us what is getting in the way and where you want to go.</p><div className="v3-contact-next"><p className="v3-kicker">What happens next</p><p>Your message goes to the people who would do the work. We’ll reply within two business days to understand the problem and discuss the right starting point. No obligation.</p></div><div className="v3-contact-note"><h3>Need help with a report?</h3><p>Bring a spreadsheet to a free, 30-minute reporting teardown. We show you the report it could be and the first steps we’d automate.</p><Link className="v3-text-link" href="/teardown">Explore the free teardown<span aria-hidden="true">↗</span></Link></div></aside><ContactForm /></div></section>
</div>;}
