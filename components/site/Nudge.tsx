import Link from "next/link";

/**
 * A quiet, mid-page way into the form, placed where a reader is most likely
 * to be convinced. Not a banner: one question, one link, a hairline above.
 * `from` names the placement for conversion tracking.
 */
export function Nudge({
  ask,
  label,
  href = "/contact",
  from,
}: {
  ask: string;
  label: string;
  href?: string;
  from: string;
}) {
  return (
    <div className="nudge" data-reveal>
      <p className="nudge__ask">{ask}</p>
      <Link className="link nudge__link" href={href} data-cta={from}>
        {label}
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
