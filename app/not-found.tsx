import Image from "next/image";
import Link from "next/link";

const ROUTES = [
  ["01", "Work", "Projects, labelled for what they are", "/work"],
  ["02", "Services", "Three islands, one bridge", "/services"],
  ["03", "Process", "How a project runs", "/process"],
  ["04", "Start a project", "Tell us where the work gets stuck", "/contact"],
] as const;

export default function NotFound() {
  return (
    <section className="phero tone-ink notfound" data-tone="ink">
      <div className="wrap notfound__grid">
        <div className="notfound__copy">
          <p className="eyebrow">Error 404</p>
          <h1 className="h1">
            This plank <em>isn’t built yet.</em>
          </h1>
          <p className="lead">The page has moved or never existed. These ones are solid.</p>
          <ul className="notfound__routes">
            {ROUTES.map(([n, label, note, href]) => (
              <li key={href}>
                <Link href={href}>
                  <span className="index">{n}</span>
                  <span className="notfound__label">{label}</span>
                  <span className="notfound__note">{note}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="notfound__art" aria-hidden="true">
          <Image src="/assets/art/bridge-900.webp" alt="" width={900} height={600} sizes="(max-width: 900px) 90vw, 44vw" />
        </div>
      </div>
    </section>
  );
}
