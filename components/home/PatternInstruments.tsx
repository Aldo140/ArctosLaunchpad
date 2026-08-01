/**
 * Small kinetic instruments adapted from the supplied Uiverse references.
 * Their geometry is decorative; the surrounding heading and illustration
 * carry the meaning when motion is unavailable.
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
      <span className="responsive-build__label">Responsive build</span>
    </div>
  );
}
