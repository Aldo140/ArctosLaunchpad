/**
 * Small kinetic instruments adapted from the supplied Uiverse references.
 * Their geometry is decorative; the surrounding heading and illustration
 * carry the meaning when motion is unavailable.
 *
 * AutomationPress and ResponsiveBuild are kept here but are no longer mounted
 * on the homepage illustration plates: sitting inside the plate they covered
 * the artwork's subject and their labels were clipped by the plate edge. They
 * need a container of their own before they go back on the page.
 */

export function AutomationPress() {
  return (
    <div className="pattern-press" aria-hidden="true">
      <span className="pattern-press__sheet pattern-press__sheet--feed" />
      <span className="pattern-press__roll pattern-press__roll--in" />
      <span className="pattern-press__sheet pattern-press__sheet--upper" />
      <span className="pattern-press__roll pattern-press__roll--upper" />
      <span className="pattern-press__sheet pattern-press__sheet--middle" />
      <span className="pattern-press__roll pattern-press__roll--middle" />
      <span className="pattern-press__sheet pattern-press__sheet--fold-one" />
      <span className="pattern-press__sheet pattern-press__sheet--fold-two" />
      <span className="pattern-press__sheet pattern-press__sheet--fold-three" />
      <span className="pattern-press__sheet pattern-press__sheet--lower" />
      <span className="pattern-press__sheet pattern-press__sheet--out" />
      <span className="pattern-press__roll pattern-press__roll--out" />
    </div>
  );
}

export function ResponsiveBuild() {
  return (
    <div className="responsive-build" aria-hidden="true">
      <span className="responsive-build__frame" />
      <span className="responsive-build__screen" />
      <span className="responsive-build__stand" />
      <span className="responsive-build__selection" />
      <span className="responsive-build__cursor" />
      <span className="responsive-build__label">Responsive build</span>
    </div>
  );
}

export function OctaveField() {
  return (
    <svg
      className="octave-field"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter
          id="arctos-octave-one"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.007 0.028"
            numOctaves="3"
            seed="14"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0.2 0 0 0 0.12  0 0.32 0 0 0.2  0 0 0.45 0 0.34  0 0 0 0.42 0"
          />
        </filter>
        <filter
          id="arctos-octave-two"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feTurbulence
            type="turbulence"
            baseFrequency="0.018 0.006"
            numOctaves="2"
            seed="31"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0.15 0 0 0 0.08  0 0.28 0 0 0.16  0 0 0.38 0 0.3  0 0 0 0.28 0"
          />
        </filter>
      </defs>
      <rect
        className="octave-field__layer octave-field__layer--one"
        width="100%"
        height="100%"
        filter="url(#arctos-octave-one)"
      />
      <rect
        className="octave-field__layer octave-field__layer--two"
        width="100%"
        height="100%"
        filter="url(#arctos-octave-two)"
      />
    </svg>
  );
}
