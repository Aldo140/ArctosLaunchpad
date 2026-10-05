import Image from "next/image";
import Link from "next/link";
import { NeedFinder } from "./NeedFinder";
import { ReportArtifact } from "@/components/figures/ReportArtifact";
import { ProjectReel } from "@/components/figures/ProjectReel";
import { ConnectionJourney } from "./ConnectionJourney";

export function StudioHome() {
  return <div className="v3-home">
    <section className="v3-hero" data-material="instrument" data-station="Arctos">
      <div className="v3-wrap">
        <div className="v3-hero__mast"><p className="v3-kicker">Digital growth & technology studio</p><p className="v3-mono">Calgary, AB · Built for your business</p></div>
        <div className="v3-hero__content">
          <h1><span className="v3-hero__line">More business.</span><em className="v3-hero__line">Less busywork.</em></h1>
          <div className="v3-hero__copy"><p>Websites that bring customers in.<br />Software and automation that keep the work moving.</p><p className="v3-hero__support">We connect how your business grows with how it runs.</p>
            <div className="v3-actions"><Link className="v3-button" href="/contact">Discuss your project<span aria-hidden="true">↗</span></Link><a className="v3-text-link" href="#what-you-need">Find your starting point<span aria-hidden="true">↓</span></a></div>
            <p className="v3-hero__note">You don’t need a technical brief. Start with what isn’t working.</p>
          </div>
        </div>
        <div className="v3-hero__art"><div className="v3-hero__machine"><Image src="/assets/v3/the-work-moves.webp" alt="A bear guiding scattered paperwork through a connected system into an organised output" width={1536} height={1024} priority sizes="(max-width: 760px) 110vw, 65vw" /><span className="v3-gear v3-gear--large" aria-hidden="true" /><span className="v3-gear v3-gear--small" aria-hidden="true" /></div></div>
        <div className="v3-hero__index"><Link href="/services/web-design-development"><span>01</span>Websites & growth</Link><Link href="/services/business-automation"><span>02</span>Automation & reporting</Link><Link href="/services/custom-software"><span>03</span>Custom software<span aria-hidden="true">↗</span></Link></div>
      </div>
    </section>

    <section className="v3-section v3-needs" id="what-you-need" data-material="paper" data-station="Your starting point">
      <div className="v3-wrap"><div className="v3-section-head"><p className="v3-kicker">01 / Start with the problem</p><h2>What needs to<br /><span>work better?</span></h2><p>You know where the friction is.<br />We help you work out what to build.</p></div><NeedFinder /></div>
    </section>

    <section className="v3-section v3-work" data-material="instrument" data-station="Selected work">
      <div className="v3-wrap"><div className="v3-section-head"><p className="v3-kicker">02 / The work, in use</p><h2>Built for a business.<br /><span>Used by real people.</span></h2><Link className="v3-text-link" href="/work">Explore all the work<span aria-hidden="true">↗</span></Link></div>
        <article className="v3-project v3-project--report"><div className="v3-project__copy"><p className="v3-kicker">Fresh Prep / Internal reporting tool</p><h3>Less time assembling.<br />More to act on.</h3><p>Raw event signup data becomes a clear view of conversion, customer value and team performance. The reporting runs around the decisions the team needs to make.</p><div className="v3-project__change"><span>Before</span><p>Separate signup-code exports.</p><span>After</span><p>Automated event-performance reporting.</p></div><Link className="v3-text-link" href="/work/fresh-prep-event-intelligence">Inside the reporting system<span aria-hidden="true">↗</span></Link></div><div className="v3-project__report"><ReportArtifact caption="Structure of the Fresh Prep internal report. Client figures withheld." /></div></article>
        <article className="v3-project v3-project--site"><div className="v3-project__media"><ProjectReel src="/assets/work/true-north-kromes-site.webm" poster="/assets/work/posters/true-north-kromes.webp" title="True North Kromes" /></div><div className="v3-project__copy"><p className="v3-kicker">True North Kromes / Website & enquiry flow</p><h3>Specialised work.<br />Clearly presented.</h3><p>A Canadian dental laboratory needed its production process to make sense online. Real lab imagery, a clear explanation and a direct path to submit a case.</p><Link className="v3-text-link" href="/work/true-north-kromes">See the website project<span aria-hidden="true">↗</span></Link></div></article>
        <div className="v3-work-list">{[{ name:"Calgary Watch", detail:"Live civic mapping & community reporting", slug:"calgary-watch", image:"calgary-watch" },{name:"Rio Alto",detail:"A restaurant’s identity, brought online",slug:"rio-alto",image:"rio-alto"},{name:"Starlings",detail:"An anonymous support map & moderation system",slug:"starlings-support-map",image:"starlings"}].map(item => <Link key={item.slug} href={`/work/${item.slug}`}><Image src={`/assets/work/posters/${item.image}.webp`} alt="" width={160} height={100} sizes="120px" /><h3>{item.name}</h3><p>{item.detail}</p><span aria-hidden="true">↗</span></Link>)}</div>
      </div>
    </section>

    <section className="v3-section v3-connection" data-material="paper" data-station="Connected by design"><div className="v3-wrap"><p className="v3-kicker">03 / One connected partner</p><h2>The website is<br />only the <span>beginning.</span></h2><ConnectionJourney /><div className="v3-connection__bottom"><p>A customer clicks. A form arrives. Someone follows up. A job moves forward. A report tells you what happened.<br /><br />We build the connections between those moments, so your next stage of growth has a working system behind it.</p><ol><li><span>Attract</span>Help the right customers find you.</li><li><span>Convert</span>Give them a clear next step.</li><li><span>Operate</span>Move the work through your team.</li><li><span>Understand</span>See what’s working and what needs attention.</li></ol></div><Link className="v3-text-link" href="/services">The full set of capabilities<span aria-hidden="true">↗</span></Link></div></section>

    <section className="v3-section v3-process" data-material="instrument" data-station="Working together"><div className="v3-wrap"><div className="v3-section-head"><p className="v3-kicker">04 / How we get there</p><h2>Clear thinking.<br /><span>Then a working thing.</span></h2><p>A practical process, from the first conversation to everyday use.</p></div><ol className="v3-process__steps"><li><span className="v3-mono">01 / Understand</span><h3>Show us the friction.</h3><p>We look at your goals, your customers and how the work happens today.</p></li><li><span className="v3-mono">02 / Shape & build</span><h3>Make the right thing.</h3><p>A clear scope, a considered design and a connected system tested against the actual workflow.</p></li><li><span className="v3-mono">03 / Put it to work</span><h3>Launch. Learn. Improve.</h3><p>Get it into daily use, support the handover and refine it from real behaviour.</p></li></ol><Link className="v3-text-link" href="/process">How we work together<span aria-hidden="true">↗</span></Link></div></section>

    <section className="v3-teardown" data-material="paper" data-station="A smaller first step"><div className="v3-wrap v3-teardown__inner"><div><p className="v3-kicker">Reporting taking over your week?</p><h2>Bring the spreadsheet.<br />We’ll show you a better way.</h2><p>A free, 30-minute reporting teardown. Bring an export or describe your process. Leave with a one-screen report mock and the first three manual steps we’d automate.</p></div><Link className="v3-button v3-button--ink" href="/teardown">Get the free reporting teardown<span aria-hidden="true">↗</span></Link></div></section>

    <section className="v3-section v3-close" data-material="instrument" data-station="Your next move"><div className="v3-wrap"><p className="v3-kicker">Your next move</p><h2>What’s holding<br />your business <span>back?</span></h2><div className="v3-close__bottom"><p>A website that isn’t bringing enquiries?<br />A workflow held together by spreadsheets?<br />An idea that needs the right software?<br /><strong>Tell us where you want to go.</strong></p><div><Link className="v3-button" href="/contact">Discuss your project<span aria-hidden="true">↗</span></Link><p className="v3-small">Read by the people who do the work.<br />Reply within two business days. No obligation.</p></div></div></div></section>
  </div>;
}
