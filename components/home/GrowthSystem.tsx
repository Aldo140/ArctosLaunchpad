import Image from "next/image";
import Link from "next/link";
import { growthStages } from "@/lib/content";

/**
 * The four stages, as one ascent.
 *
 * Three earlier versions of this section failed for the same underlying reason:
 * they tried to carry a claim about a *journey* using layout alone — four
 * chapters, then four panels, then a struck-through ledger. Layout can show
 * that four things exist. It cannot show that they climb.
 *
 * The illustration does, in one look: the bear walks a rising route through
 * four stations to the star, and the station colours are the chapter accents
 * themselves — blue, maroon, teal, orange — so the artwork and the interface
 * are running the same palette rather than approximating each other.
 *
 * The stage list beside it is the legend to that figure. Each row lights its
 * own accent, which is the same relationship the hero diagram uses: a plotted
 * route, and the reading of it alongside.
 */
export function GrowthSystem() {
  return (
    <section
      id="growth-system"
      className="section ascent"
      data-material="instrument"
      data-station="The system"
    >
      <div className="shell ascent__inner">
        <figure className="ascent__figure reveal">
          <Image
            src="/assets/figures/bear-ascent.webp"
            alt="The Arctos bear climbing a rising route through four coloured stations toward the north star."
            width={1200}
            height={1200}
            sizes="(max-width: 900px) 92vw, 46vw"
          />
        </figure>

        <div className="ascent__body">
          <div className="ascent__head reveal">
            <p className="tick-label">The system</p>
            <h2 className="ascent__title t-display">
              One route. Four stations. <em>Every one of them climbs.</em>
            </h2>
          </div>

          <ol className="ascent__stages reveal">
            {growthStages.map((stage) => (
              <li key={stage.id} data-chapter={stage.id}>
                <Link href={`/services#${stage.id}`}>
                  <span className="ascent__n">{stage.index}</span>
                  <span className="ascent__name">{stage.title}</span>
                  <span className="ascent__copy">{stage.statement}</span>
                </Link>
              </li>
            ))}
          </ol>

          <Link className="link ascent__more" href="/services">
            The complete offer
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
