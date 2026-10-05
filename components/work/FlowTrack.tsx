/**
 * LeaseFlow has no public recording, so it is shown as what it is: the flow the
 * demo connects. Every label is lifted from the project's own description. It is
 * a drawn route, not a fake screen.
 */
const STOPS = [
  ["Listing traffic", "Listing management"],
  ["Lead conversion", "Rental lead conversion"],
  ["Lease-package request", "Workflow organisation"],
] as const;

export function FlowTrack({ className = "" }: { className?: string }) {
  return (
    <figure
      className={`wrk-flow ${className}`.trim()}
      aria-label="LeaseFlow: listing traffic becomes lead conversion, then an organized lease-package request"
    >
      <ol className="wrk-flow__track">
        {STOPS.map(([name, note], i) => (
          <li key={name} className="wrk-flow__stop">
            <span className="wrk-flow__n" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="wrk-flow__dot" aria-hidden="true" />
            <span className="wrk-flow__name">{name}</span>
            <span className="wrk-flow__note">{note}</span>
          </li>
        ))}
      </ol>
      <figcaption className="wrk-flow__cap t-folio">
        Working demo. No public recording exists, so this is the flow, not a
        screenshot.
      </figcaption>
    </figure>
  );
}
