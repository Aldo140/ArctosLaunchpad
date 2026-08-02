import Image from "next/image";

export type Specimen = {
  src: string;
  alt: string;
  /** Short technical caption. Sentence fragments, not marketing lines. */
  caption: string;
  /** Optional right-hand code, e.g. a material or a project shorthand. */
  code?: string;
};

/**
 * A specimen strip: uniform-height tight crops in a scrolling band, each under
 * a hairline rule with a mono caption.
 *
 * This is how the honest-but-imperfect source photography earns its place. Full
 * bleed, a phone snapshot of a dental model or a plated dish reads as a phone
 * snapshot. Cropped to a specimen and set in a measured row, the same frame
 * reads as evidence, and its colour and texture do the work instead of its
 * resolution.
 */
export function SpecimenStrip({
  title,
  intro,
  items,
  columns = 5,
}: {
  title: string;
  intro?: string;
  items: Specimen[];
  columns?: number;
}) {
  return (
    <div className="specimen">
      <div className="specimen__head">
        <h3 className="specimen__title t-label">{title}</h3>
        {intro ? <p className="specimen__intro">{intro}</p> : null}
      </div>

      <ul
        className="specimen__row"
        style={{ "--cols": columns } as React.CSSProperties}
      >
        {items.map((item, i) => (
          <li key={item.src} className="specimen__item">
            <div className="specimen__frame">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 700px) 60vw, (max-width: 1100px) 30vw, 18vw"
              />
            </div>
            <div className="specimen__meta">
              <span className="t-folio">{String(i + 1).padStart(2, "0")}</span>
              {item.code ? <span className="t-folio">{item.code}</span> : null}
            </div>
            <p className="specimen__caption">{item.caption}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
