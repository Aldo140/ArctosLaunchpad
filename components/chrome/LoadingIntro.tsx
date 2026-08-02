"use client";

import { useEffect } from "react";
import { ArctosMark } from "../brand/ArctosMark";

const WORD = "ARCTOS";

/**
 * Entrance sequence: the mark fades up while the wordmark's letters rise on a
 * 70ms stagger, then the whole plate lifts away into the hero.
 *
 * Timing and easing come from the supplied loader concept. What changed is the
 * plumbing. The old version flipped `visible` inside an effect, so the first
 * paint had no loader and the plate flashed in a frame late. Now the markup is
 * server-rendered and a blocking script in <head> decides — before paint —
 * whether this session has already seen it. React only has to end it.
 *
 * Skipped entirely for a returning session in the same tab, and for anyone who
 * asked for reduced motion.
 */
export function LoadingIntro() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "show") return;

    const done = window.setTimeout(() => {
      root.dataset.intro = "done";
      // Match the plate's exit transition before taking it out of the layout.
      window.setTimeout(() => {
        root.dataset.intro = "skip";
      }, 520);
    }, 1150);

    return () => window.clearTimeout(done);
  }, []);

  return (
    <div className="intro" data-material="instrument">
      <p className="visually-hidden" role="status">
        Loading Arctos Launchpad
      </p>
      <div className="intro__stage" aria-hidden="true">
        <ArctosMark size={64} detail="full" className="intro__mark" />
        <span className="intro__word">
          {WORD.split("").map((letter, i) => (
            <span
              key={i}
              className="intro__letter"
              style={{ "--i": i } as React.CSSProperties}
            >
              {letter}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

/**
 * Runs before first paint. Inlined in <head> so the loader never flashes for a
 * visitor who should not be seeing it.
 */
export const INTRO_BOOTSTRAP = `(function(){var r=document.documentElement;r.classList.add('js');try{
var skip=sessionStorage.getItem('arctos-intro')||matchMedia('(prefers-reduced-motion: reduce)').matches;
r.dataset.intro=skip?'skip':'show';
if(!skip){sessionStorage.setItem('arctos-intro','seen');setTimeout(function(){if(r.dataset.intro==='show'||r.dataset.intro==='done')r.dataset.intro='skip';},2400);}
}catch(e){r.dataset.intro='skip';}})();`;
