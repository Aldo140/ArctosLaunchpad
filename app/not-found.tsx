import Link from "next/link";
import { ArctosMark } from "@/components/brand/ArctosMark";

const ROUTES = [
  ["01", "Services", "What we build, in four stages", "/services"],
  ["02", "Work", "Selected projects and what changed", "/work"],
  ["03", "Process", "How an engagement actually runs", "/process"],
  ["04", "Contact", "Start a project", "/contact"],
] as const;

export default function NotFound() {
  return (
    <section
      className="section notfound"
      data-material="instrument"
      data-station="Off route"
    >
      <div className="shell notfound__inner">
        <div className="notfound__head">
          <ArctosMark size={72} detail="simple" className="notfound__mark" />
          <div>
            <p className="tick-label">Error 404</p>
            <h1 className="t-display notfound__title">
              This route leads <em>somewhere else.</em>
            </h1>
          </div>
        </div>

        <p className="t-lead notfound__intro">
          The page has moved or never existed. These are the ones that do.
        </p>

        <ul className="notfound__index">
          {ROUTES.map(([n, label, note, href]) => (
            <li key={href}>
              <Link href={href}>
                <span className="t-folio notfound__n">{n}</span>
                <span className="notfound__label">{label}</span>
                <span className="notfound__note">{note}</span>
                <span className="notfound__go" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
