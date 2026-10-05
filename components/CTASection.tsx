import Link from "next/link";
export function CTASection({title = "What needs to work better?",body = "A better website, a connected workflow or software built around your business. Tell us what is not working and where you want to go."}:{title?:string;body?:string}) {
  return <section className="v3-section v3-close v3-page" data-material="instrument" data-station="Let's talk"><div className="v3-wrap"><p className="v3-kicker">Your next move</p><h2>{title}</h2><div className="v3-close__bottom"><p>{body}</p><div><Link className="v3-button" href="/contact">Discuss your project<span aria-hidden="true">↗</span></Link><p className="v3-small">Reply within two business days.<br />No obligation. Read by the people who do the work.</p></div></div></div></section>;
}
