import { ArctosMark } from "./ArctosMark";

type Props = {
  /** Mark height in px. The wordmark scales from it. */
  size?: number;
  /** Hide LAUNCHPAD when there isn't room for it to stay legible. */
  compact?: boolean;
  className?: string;
};

/**
 * Mark plus wordmark. The wordmark is live text, not an image, so it stays
 * sharp, recolours with the material, and is readable by screen readers and
 * search engines without alt-text standing in for it.
 */
export function ArctosLockup({ size = 34, compact = false, className }: Props) {
  return (
    <span className={`lockup${compact ? " lockup--compact" : ""}${className ? ` ${className}` : ""}`}>
      <ArctosMark size={size} />
      <span className="lockup__type">
        <span className="lockup__name">Arctos</span>
        {compact ? null : <span className="lockup__sub">Launchpad</span>}
      </span>
    </span>
  );
}
