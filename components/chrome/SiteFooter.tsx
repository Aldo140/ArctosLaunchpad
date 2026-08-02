import Link from "next/link";
import { ArctosMark } from "../brand/ArctosMark";

const NAV = [
  ["Services", "/services"],
  ["Work", "/work"],
  ["Industries", "/industries"],
  ["Process", "/process"],
  ["Studio", "/studio"],
  ["Contact", "/contact"],
] as const;

const CAPABILITY = [
  ["Web design & development", "/services/web-design-development"],
  ["SEO & AI search", "/services/seo-ai-search"],
  ["Business automation", "/services/business-automation"],
  ["Custom software", "/services/custom-software"],
  ["Analytics & reporting", "/services/analytics-reporting"],
] as const;

const LEGAL = [
  ["Privacy", "/privacy"],
  ["Accessibility", "/accessibility"],
] as const;

const LOCAL = [
  ["Calgary web design", "/calgary-web-design"],
  ["Calgary automation", "/calgary-business-automation"],
  ["Calgary custom software", "/calgary-custom-software"],
] as const;

export function SiteFooter() {
  return (
    <footer
      className="footer"
      data-material="instrument"
      data-station="Colophon"
    >
      <div className="shell">
        <p className="footer__statement">
          Marketing that creates demand. Websites that convert it.{" "}
          <em>Systems that manage the growth.</em>
        </p>

        <div className="footer__grid">
          <div className="footer__col">
            <Link href="/" className="footer__brand">
              <ArctosMark size={38} detail="full" />
              <span>
                <span className="lockup__name">Arctos</span>
                <span className="lockup__sub">Launchpad</span>
              </span>
            </Link>
            <p className="footer__place">
              Calgary, Alberta. Working with organizations anywhere in Canada.
            </p>
          </div>

          <div className="footer__col">
            <h2>Studio</h2>
            <ul>
              {NAV.map(([label, href]) => (
                <li key={href}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h2>Capability</h2>
            <ul>
              {CAPABILITY.map(([label, href]) => (
                <li key={href}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h2>Calgary</h2>
            <ul>
              {LOCAL.map(([label, href]) => (
                <li key={href}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h2>Elsewhere</h2>
            <ul>
              {LEGAL.map(([label, href]) => (
                <li key={href}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
              <li>
                <a href="#top">Back to top</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__base">
          <p className="t-folio">
            © {new Date().getFullYear()} Arctos Launchpad
          </p>
          <p className="t-folio">51°02′N 114°04′W — Calgary, AB</p>
        </div>
      </div>
    </footer>
  );
}
