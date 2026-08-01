import Link from "next/link";
import Image from "next/image";
import { ArctosMark } from "./brand/ArctosMark";

export function CTASection({
  title = "What is slowing your business down?",
  body = "It might be the website. It might be the marketing. It might be everything that happens after a customer gets in touch. Let's map the problem and build the right system.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section
      className="cta section"
      data-material="instrument"
      data-station="Start"
    >
      <Image
        className="cta__art"
        src="/assets/illustrations/launch-star.webp"
        alt=""
        fill
        sizes="100vw"
        aria-hidden="true"
      />
      {/* The mark at plate scale, sunk into the ground rather than sitting on
          it — a watermark, so the type stays the loudest thing here.
          Deliberately the simplified variant: at this size the bear head inside
          the triangle stops reading as a monogram and starts reading as a
          picture of a bear, which is not what this section is about. */}
      <ArctosMark size={640} detail="simple" className="cta__watermark" />

      <div className="shell cta__inner">
        <p className="tick-label reveal">Start a project</p>
        <h2 className="cta__title t-display reveal">{title}</h2>
        <p className="cta__body t-lead reveal">{body}</p>
        <div className="cta__actions reveal">
          <Link className="btn" href="/contact">
            Start a project
            <span className="btn__arrow" aria-hidden="true">
              →
            </span>
          </Link>
          <Link className="btn btn--ghost" href="/contact#discovery">
            Book a discovery call
          </Link>
        </div>
      </div>
    </section>
  );
}
