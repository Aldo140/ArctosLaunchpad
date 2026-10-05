import Link from "next/link";
export const INSTAGRAM_URL = "https://www.instagram.com/arctoslaunchpad/";
export function SiteFooter() {
  return <footer className="v3-footer" data-material="instrument" data-station="Studio"><div className="v3-wrap">
    <div className="v3-footer__top"><div className="v3-footer__intro"><Link className="v3-footer__brand" href="/">Arctos.</Link><p>A Calgary studio connecting websites, software and the work behind them.</p><Link className="v3-text-link" href="/contact">Let’s talk about your project<span aria-hidden="true">↗</span></Link></div>
      <nav aria-label="Studio and work"><h2>Explore</h2><Link href="/work">Our work</Link><Link href="/services">What we build</Link><Link href="/process">How we work</Link><Link href="/studio">The studio</Link><Link href="/industries">Industries</Link></nav>
      <nav aria-label="Capabilities and contact"><h2>Start here</h2><Link href="/services/web-design-development">Websites & growth</Link><Link href="/services/business-automation">Automation & integrations</Link><Link href="/services/custom-software">Custom software</Link><Link href="/teardown">Free reporting teardown</Link><a href={INSTAGRAM_URL} target="_blank" rel="me noreferrer">Instagram ↗</a></nav>
    </div><div className="v3-footer__base"><p>© {new Date().getFullYear()} Arctos Launchpad · Calgary, Alberta</p><div><Link href="/privacy">Privacy</Link><Link href="/accessibility">Accessibility</Link><a href="#top">Back to top ↑</a></div></div>
  </div></footer>;
}
