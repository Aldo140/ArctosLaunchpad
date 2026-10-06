import { Lines, TextLink, d } from "../ui";
import { MethodRoute } from "./method/MethodRoute";

/** Home chapter: how a project runs — six stops that build one bridge. */
export function HomeMethod() {
  return (
    <section className="method section tone-bone" data-tone="bone" aria-labelledby="method-title">
      <div className="method__grid" aria-hidden="true" />
      <div className="wrap">
        <div className="method__head">
          <p className="eyebrow" data-reveal>
            How a project runs
          </p>
          <Lines as="h2" id="method-title" className="h1" lines={["One route,", <em key="m">six stops.</em>]} />
          <div className="method__aside" data-reveal style={d(2)}>
            <p className="body">
              A new website is a different job from a reporting tool or a customer portal, but the
              route is the same: understand how the business really runs, decide before building,
              then put it into daily use.
            </p>
            <TextLink href="/process">The full process</TextLink>
          </div>
        </div>
        <MethodRoute />
      </div>
    </section>
  );
}
