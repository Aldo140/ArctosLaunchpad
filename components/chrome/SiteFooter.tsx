import Link from "next/link";
import { ArctosMark } from "../brand/ArctosMark";
import { FooterClose } from "./FooterClose";

export const INSTAGRAM_URL = "https://www.instagram.com/arctoslaunchpad/";

type Item = readonly [label: string, href: string];

const WORK: readonly Item[] = [
  ["Fresh Prep", "/work/fresh-prep-event-intelligence"],
  ["True North Kromes", "/work/true-north-kromes"],
  ["Calgary Watch", "/work/calgary-watch"],
  ["Rio Alto", "/work/rio-alto"],
  ["Starlings", "/work/starlings-support-map"],
  ["LeaseFlow", "/work/leaseflow"],
];

const SERVICES: readonly Item[] = [
  ["Analytics & reporting", "/services/analytics-reporting"],
  ["Business automation", "/services/business-automation"],
  ["Custom software", "/services/custom-software"],
  ["Web design & development", "/services/web-design-development"],
  ["SEO & AI search", "/services/seo-ai-search"],
  ["All services", "/services"],
];

const INDUSTRIES: readonly Item[] = [
  ["Events & experiential", "/industries/events-experiential-marketing"],
  ["Manufacturing", "/industries/manufacturing"],
  ["Healthcare & dental", "/industries/healthcare-dental"],
  ["Nonprofits", "/industries/nonprofits"],
  ["All industries", "/industries"],
];

const STUDIO: readonly Item[] = [
  ["Free teardown", "/teardown"],
  ["Process", "/process"],
  ["Studio", "/studio"],
  ["Contact", "/contact"],
];

const CALGARY: readonly Item[] = [
  ["Calgary web design", "/calgary-web-design"],
  ["Calgary automation", "/calgary-business-automation"],
  ["Calgary custom software", "/calgary-custom-software"],
];

const LEGAL: readonly Item[] = [
  ["Privacy", "/privacy"],
  ["Accessibility", "/accessibility"],
];

function Column({ title, items }: { title: string; items: readonly Item[] }) {
  return (
    <div className="chr-foot__col">
      <h2>{title}</h2>
      <ul>
        {items.map(([label, href]) => (
          <li key={href}>
            <Link href={href}>{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer
      className="footer chr-foot"
      data-material="instrument"
      data-station="Colophon"
    >
      <div className="shell">
        <FooterClose />

        <div className="chr-foot__map">
          <Column title="Work" items={WORK} />
          <Column title="Services" items={SERVICES} />
          <Column title="Industries" items={INDUSTRIES} />
          <Column title="Studio" items={STUDIO} />
          <Column title="Calgary" items={CALGARY} />
          <div className="chr-foot__col">
            <h2>Elsewhere</h2>
            <ul>
              {LEGAL.map(([label, href]) => (
                <li key={href}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
              <li>
                <a href={INSTAGRAM_URL} target="_blank" rel="me noreferrer">
                  Instagram
                  <span aria-hidden="true"> ↗</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="chr-foot__base">
          <Link href="/" className="chr-foot__brand">
            <ArctosMark size={34} detail="full" />
            <span>
              <span className="lockup__name">Arctos</span>
              <span className="lockup__sub">Launchpad</span>
            </span>
          </Link>
          <p className="chr-foot__place">
            Calgary, Alberta. Working with organizations anywhere in Canada.
          </p>
          <p className="t-folio">
            © {new Date().getFullYear()} Arctos Launchpad
          </p>
          <p className="t-folio">51°02′N 114°04′W — Calgary, AB</p>
          <a className="t-folio chr-foot__top" href="#top">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
