"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The survey rule.
 *
 * A levelling staff pinned to the left edge of the document: major ticks every
 * fifth minor, a travelling index that tracks scroll position, and the name of
 * whatever section you are standing in. It is the field-guide instrument made
 * literal, and it does real work — position in a long document, plus a jump
 * back to the top.
 *
 * Sections opt in by carrying `data-station="Label"`. Below 1024px the staff is
 * replaced by a hairline progress bar under the header, because a 4.5rem gutter
 * is too expensive on a phone.
 */

const MINOR = 40; // ticks rendered down the staff

export function SurveyRule() {
  const [progress, setProgress] = useState(0);
  const [station, setStation] = useState("");
  const frame = useRef(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const read = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0);

      // The station is whichever marked section owns the middle of the screen.
      const mid = window.innerHeight * 0.5;
      let current = "";
      for (const el of document.querySelectorAll<HTMLElement>("[data-station]")) {
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) current = el.dataset.station ?? "";
      }
      setStation(current);
    };

    const onScroll = () => {
      if (media.matches) {
        read();
        return;
      }
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const pct = `${(progress * 100).toFixed(2)}%`;

  return (
    <>
      <div className="staff" aria-hidden="true">
        <div className="staff__ticks">
          {Array.from({ length: MINOR }, (_, i) => (
            <span
              key={i}
              className={`staff__tick${i % 5 === 0 ? " staff__tick--major" : ""}`}
            />
          ))}
        </div>
        <span className="staff__index" style={{ top: pct }} />
        <span className="staff__station">{station}</span>
        <span className="staff__reading">{String(Math.round(progress * 100)).padStart(3, "0")}</span>
      </div>

      {/* Mobile substitute. */}
      <div className="progress-hair" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
    </>
  );
}
