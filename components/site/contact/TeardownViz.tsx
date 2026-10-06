"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Lines, d } from "@/components/site/ui";

gsap.registerPlugin(ScrollTrigger);

const DELIVERABLES = [
  {
    n: "01",
    title: "A one-screen mock of the report it should be.",
    body: "Built from the file you sent and laid out around the decisions it should help you make.",
  },
  {
    n: "02",
    title: "The first three manual steps we would automate.",
    body: "The copying, merging and re-keying that eats the hours, named in plain language.",
  },
  {
    n: "03",
    title: "A straight answer on whether it is worth building.",
    body: "Sometimes the answer is no, or not yet. We will say so.",
  },
] as const;

/* ---- The messy sheet: deterministic so server and client agree --------- */

const COLS = 7;
const ROWS = 10;
const HEAD = ["Date", "Source", "Name", "Status", "Notes", "Total?", "Total (new)"];
const WORDS = ["#REF!", "??", "TBC", "see tab 3", "copy", "=SUM(", "ask J.", "dup?", "N/A", "old"];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type Cell = { kind: "bar" | "word" | "empty"; w: number; word?: string; mark?: "hi" | "sage" | "err"; r: number; x: number; y: number };

const CELLS: Cell[] = (() => {
  const rand = rng(7);
  const out: Cell[] = [];
  for (let i = 0; i < COLS * ROWS; i++) {
    const roll = rand();
    const kind = roll < 0.14 ? "word" : roll < 0.24 ? "empty" : "bar";
    const markRoll = rand();
    out.push({
      kind,
      w: Math.round(28 + rand() * 62),
      word: kind === "word" ? WORDS[Math.floor(rand() * WORDS.length)] : undefined,
      mark: markRoll < 0.08 ? "hi" : markRoll < 0.13 ? "sage" : kind === "word" && markRoll < 0.5 ? "err" : undefined,
      r: Math.round((rand() - 0.5) * 40) / 10,
      x: Math.round((rand() - 0.5) * 8),
      y: Math.round((rand() - 0.5) * 6),
    });
  }
  return out;
})();

const LINE = "M0 74 C 30 70, 46 52, 74 56 S 120 30, 150 38 S 200 20, 230 26 S 280 10, 300 12";

export function TeardownViz() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const mm = gsap.matchMedia();
    const build = (pinned: boolean) => {
      section.classList.add("is-live");
      if (!pinned) section.classList.add("is-scrub");
      const q = gsap.utils.selector(section);
      const stage = q(".tdv__stage")[0] as HTMLElement;
      const cells = q(".tdv__cell") as HTMLElement[];
      const tiles = q(".tdv__tile") as HTMLElement[];
      const bars = q(".tdv__bar-fill") as HTMLElement[];
      // The step rows stay as empty slots; only their words arrive.
      const steps = q(".tdv__steps li > *") as HTMLElement[];
      const track = q(".tdv__track")[0] as HTMLElement;

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        paused: true,
        onUpdate() {
          const t = tl.time();
          section.dataset.step = t >= 2.75 ? "3" : t >= 2.1 ? "2" : t >= 1.35 ? "1" : "0";
        },
      });

      tl.set(q(".tdv__report"), { autoAlpha: 0, scale: 0.94, y: 24 }, 0);
      tl.set(tiles, { autoAlpha: 0, y: 18 }, 0);
      tl.set(q(".tdv__line"), { strokeDashoffset: 1 }, 0);
      tl.set(bars, { scaleX: 0 }, 0);
      tl.set(steps, { autoAlpha: 0, x: 14 }, 0);
      tl.set(q(".tdv__stamp"), { autoAlpha: 0, scale: 1.8, rotation: -24 }, 0);

      // The clutter goes first: notes, tabs, the formula bar.
      tl.to(q(".tdv__note"), { y: 80, rotation: 18, autoAlpha: 0, duration: 0.5 }, 0.1);
      tl.to(q(".tdv__tabs, .tdv__fx"), { autoAlpha: 0, y: 10, duration: 0.4 }, 0.2);

      // Every cell is pulled toward the screen it feeds.
      const sRect = stage.getBoundingClientRect();
      cells.forEach((cell, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const r = cell.getBoundingClientRect();
        const tx = sRect.left + sRect.width * (0.2 + (col / COLS) * 0.6) - (r.left + r.width / 2);
        const ty = sRect.top + sRect.height * 0.32 - (r.top + r.height / 2);
        tl.to(cell, { x: tx, y: ty, rotation: 0, scale: 0.15, autoAlpha: 0, duration: 0.55, ease: "power3.in" }, 0.3 + col * 0.04 + row * 0.035);
      });
      tl.to(q(".tdv__sheet"), { autoAlpha: 0, scale: 0.97, duration: 0.4 }, 1.05);

      // The one screen assembles: deliverable 01.
      tl.to(q(".tdv__report"), { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: "power3.out" }, 1.15);
      tiles.forEach((tile, i) => tl.to(tile, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power3.out" }, 1.35 + i * 0.1));
      tl.to(q(".tdv__line"), { strokeDashoffset: 0, duration: 0.7, ease: "power1.inOut" }, 1.5);
      bars.forEach((bar, i) => tl.to(bar, { scaleX: 1, duration: 0.4, ease: "power3.out" }, 1.55 + i * 0.06));

      // The three steps to automate: deliverable 02.
      steps.forEach((step, i) => tl.to(step, { autoAlpha: 1, x: 0, duration: 0.3, ease: "power3.out" }, 2.1 + Math.floor(i / 2) * 0.15 + (i % 2) * 0.06));

      // The straight answer: deliverable 03.
      tl.to(q(".tdv__stamp"), { autoAlpha: 1, scale: 1, rotation: -8, duration: 0.35, ease: "back.out(2)" }, 2.75);
      tl.to({}, { duration: 0.35 });

      if (!pinned) track.style.setProperty("--stage-h", `${stage.offsetHeight}px`);
      const st = pinned
        ? ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "+=170%",
            pin: true,
            scrub: 0.7,
            animation: tl,
            invalidateOnRefresh: true,
          })
        : ScrollTrigger.create({
            // Touch: a CSS-sticky stage, scrubbed by the thumb. No pin, no jank.
            trigger: track,
            start: "top 76px",
            end: () => `bottom ${76 + stage.offsetHeight}px`,
            scrub: 0.5,
            animation: tl,
            invalidateOnRefresh: true,
          });

      return () => {
        st.kill();
        tl.revert();
        section.classList.remove("is-live", "is-scrub");
        track.style.removeProperty("--stage-h");
        delete section.dataset.step;
      };
    };

    mm.add(
      {
        pinned: "(min-width: 1024px) and (pointer: fine) and (min-height: 700px)",
        loose: "not ((min-width: 1024px) and (pointer: fine) and (min-height: 700px))",
      },
      (ctx) => build(Boolean(ctx.conditions?.pinned)),
    );
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="what-you-get" className="tdv section tone-paper" data-tone="paper" aria-labelledby="tdv-title">
      <div className="wrap tdv__grid">
        <div className="tdv__copy">
          <p className="eyebrow" data-reveal>
            What you get
          </p>
          <Lines as="h2" id="tdv-title" className="h2" lines={["From the sheet you dread", <em key="o">to one screen.</em>]} />
          <ol className="tdv__calls">
            {DELIVERABLES.map((item, i) => (
              <li key={item.n} data-call={i + 1} data-reveal style={d(1 + i)}>
                <span className="tdv__n">{item.n}</span>
                <div>
                  <h3 className="tdv__title">{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="tdv__track">
        <div className="tdv__stage" aria-hidden="true">
          <p className="tdv__flag mono">Illustration · not real data</p>

          <div className="tdv__sheet">
            <div className="tdv__fx">
              <span>fx</span>
              <span>=SUM(Total_new!C2:C… </span>
            </div>
            <div className="tdv__cells" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
              {HEAD.map((h) => (
                <span key={h} className="tdv__cell tdv__cell--head">
                  {h}
                </span>
              ))}
              {CELLS.map((c, i) => (
                <span
                  key={i}
                  className={`tdv__cell${c.mark ? ` tdv__cell--${c.mark}` : ""}`}
                  style={{ transform: `translate(${c.x}px, ${c.y}px) rotate(${c.r}deg)` }}
                >
                  {c.kind === "bar" ? <i style={{ width: `${c.w}%` }} /> : c.kind === "word" ? c.word : null}
                </span>
              ))}
            </div>
            <div className="tdv__tabs">
              <span>Export (2)</span>
              <span className="is-on">FINAL_v3_real</span>
              <span>Copy of FINAL</span>
              <span>Sheet7</span>
            </div>
            <span className="tdv__note">who changed this??</span>
          </div>

          <div className="tdv__report">
            <div className="tdv__rhead">
              <span className="tdv__rtitle">Weekly report</span>
              <span className="mono">One screen</span>
            </div>
            <div className="tdv__tiles">
              {["This week", "Against plan", "Needs a decision"].map((label, i) => (
                <div key={label} className={`tdv__tile${i === 2 ? " tdv__tile--flag" : ""}`}>
                  <span className="mono">{label}</span>
                  <span className="tdv__val" />
                  <span className="tdv__sub" />
                </div>
              ))}
            </div>
            <div className="tdv__body">
              <div className="tdv__chart">
                <span className="mono">Trend</span>
                <svg viewBox="0 0 300 84" preserveAspectRatio="none">
                  <path className="tdv__grid-line" d="M0 20 H300 M0 42 H300 M0 64 H300" />
                  <path className="tdv__line" d={LINE} pathLength={1} />
                </svg>
                <div className="tdv__bars">
                  {[82, 64, 46, 30].map((w, i) => (
                    <span key={i} className="tdv__bar">
                      <i className="tdv__bar-fill" style={{ width: `${w}%` }} />
                    </span>
                  ))}
                </div>
              </div>
              <div className="tdv__auto">
                <span className="mono">First three to automate</span>
                <ol className="tdv__steps">
                  <li><span>Export from the booking tool</span><b>auto</b></li>
                  <li><span>Merge with ad spend</span><b>auto</b></li>
                  <li><span>Re-key into the summary</span><b>auto</b></li>
                </ol>
              </div>
            </div>
            <div className="tdv__stamp">
              <span>Worth</span>
              <span>building?</span>
              <small>A straight answer</small>
            </div>
          </div>
          <p className="tdv__now mono">
            <span data-now="0">The sheet you dread</span>
            <span data-now="1">01 · The one-screen mock</span>
            <span data-now="2">02 · Three steps to automate</span>
            <span data-now="3">03 · A straight answer</span>
          </p>
        </div>
        </div>
      </div>
    </section>
  );
}
