"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Lines, TextLink, d } from "../ui";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);

/* One continuous line: two stops the customer sees, two that run behind them. */
const STOPS = [
  {
    side: "Customer side",
    title: "First click",
    copy: "A site and search presence that says plainly what you do.",
    builds: "Website · SEO · Campaigns",
    art: "/assets/art/growth-gateway.webp",
    x: 110,
    y: 190,
  },
  {
    side: "Customer side",
    title: "Enquiry",
    copy: "One clear path to a request your team can act on.",
    builds: "Forms · Booking · Intake",
    art: "/assets/art/bridge-keystone.webp",
    x: 390,
    y: 190,
  },
  {
    side: "Behind the scenes",
    title: "Workflow",
    copy: "The job moves through the same steps, without the copy and paste.",
    builds: "Automation · Internal tools",
    art: "/assets/art/workflow-loop.webp",
    x: 680,
    y: 450,
  },
  {
    side: "Behind the scenes",
    title: "Report",
    copy: "The numbers you need for the next decision, in one place.",
    builds: "Dashboards · Reporting",
    art: "/assets/art/reporting-observatory.webp",
    x: 940,
    y: 450,
  },
];

const W = 1200;
const H = 640;
const LINE =
  "M 0 190 L 110 190 L 390 190 C 540 190 540 450 680 450 L 940 450 C 1060 450 1140 420 1200 380";

export function StudioPractice() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mm = gsap.matchMedia(el);
    const stops = gsap.utils.toArray<HTMLElement>(".st-stop", el);

    mm.add("(min-width: 900px)", () => {
      const path = el.querySelector<SVGPathElement>(".st-line__path");
      const dots = gsap.utils.toArray<SVGGElement>(".st-line__dot", el);
      const signal = el.querySelector(".st-line__signal");
      if (!path) return;
      const len = path.getTotalLength();
      // Where along the line each stop sits, as a 0–1 fraction.
      const at = STOPS.map((s) => {
        let best = 0;
        let bestD = Infinity;
        for (let i = 0; i <= 200; i++) {
          const p = path.getPointAtLength((len * i) / 200);
          const dd = Math.hypot(p.x - s.x, p.y - s.y);
          if (dd < bestD) {
            bestD = dd;
            best = i / 200;
          }
        }
        return best;
      });
      gsap.set(stops, { opacity: 0.32 });
      const light = (p: number) =>
        at.forEach((a, i) => {
          const on = p >= a - 0.005;
          dots[i]?.classList.toggle("is-lit", on);
          stops[i]?.classList.toggle("is-lit", on);
          gsap.to(stops[i], { opacity: on ? 1 : 0.32, duration: 0.4, overwrite: "auto" });
        });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el.querySelector(".st-line"),
          start: "top 78%",
          end: "bottom 45%",
          scrub: 0.6,
          onUpdate: (self) => light(self.progress),
        },
      });
      tl.fromTo(path, { drawSVG: "0%" }, { drawSVG: "100%", ease: "none" }, 0).fromTo(
        signal,
        { opacity: 1 },
        { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, ease: "none" },
        0,
      );
    });

    mm.add("(max-width: 899.98px)", () => {
      const fill = el.querySelector(".st-line__rail-fill");
      gsap.fromTo(
        fill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: el.querySelector(".st-line"), start: "top 70%", end: "bottom 60%", scrub: 0.4 },
        },
      );
      // The sticky plate above the list shows the part of the business each stop lives in.
      const plate = el.querySelector<HTMLElement>(".st-plate");
      const show = (i: number) => plate?.setAttribute("data-active", String(Math.max(0, i)));
      stops.forEach((s, i) =>
        ScrollTrigger.create({
          trigger: s,
          start: "top 66%",
          onEnter: () => {
            s.classList.add("is-lit");
            show(i);
          },
          onLeaveBack: () => {
            s.classList.remove("is-lit");
            show(i - 1);
          },
        }),
      );
      gsap.fromTo(
        el.querySelectorAll(".st-plate__img"),
        { yPercent: 6 },
        {
          yPercent: -6,
          ease: "none",
          scrollTrigger: { trigger: el.querySelector(".st-line"), start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="st-practice section tone-paper" data-tone="paper" aria-labelledby="practice">
      <div className="wrap studio-split">
        <div>
          <p className="eyebrow" data-reveal>
            One connected practice
          </p>
          <Lines as="h2" id="practice" className="h1" lines={["From the first click", <em key="f">to the finished job.</em>]} />
        </div>
        <div className="studio-split__body" data-reveal style={d(2)}>
          <p className="lead">
            Websites, campaigns, software and operations touch the same customer journey. We build
            across those boundaries, so the enquiry has somewhere to go and the work leaves useful
            information behind.
          </p>
          <p className="body">
            The person you talk to in the first conversation is one of the people who designs and
            builds the work. There is no hand-off to a team you haven’t met.
          </p>
          <TextLink href="/work">See the practice in use</TextLink>
        </div>
      </div>

      <div className="wrap">
        <figure className="st-line" aria-labelledby="st-line-cap">
          <figcaption id="st-line-cap" className="visually-hidden">
            One line from the customer’s first click to the enquiry, through the workflow behind it, to the report.
          </figcaption>
          <div className="st-plate" data-active="0" aria-hidden="true">
            {STOPS.map((s, i) => (
              <div key={s.title} className="st-plate__frame" data-i={i}>
                <Image className="st-plate__img" src={s.art} alt="" width={1536} height={1024} sizes="(max-width: 899px) 100vw, 1px" />
                <span className="st-plate__label mono">
                  {String(i + 1).padStart(2, "0")} · {s.title}
                </span>
              </div>
            ))}
            <span className="st-plate__ticks">
              {STOPS.map((s, i) => (
                <i key={s.title} data-i={i} />
              ))}
            </span>
          </div>
          <div className="st-line__canvas">
            <svg className="st-line__svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
              <line className="st-line__horizon" x1="0" x2={W} y1="320" y2="320" />
              <text className="st-line__band" x="0" y="300">
                WHAT THE CUSTOMER SEES
              </text>
              <text className="st-line__band" x="0" y="352">
                WHAT RUNS BEHIND IT
              </text>
              <path className="st-line__ghost" d={LINE} />
              <path className="st-line__path" d={LINE} />
              {STOPS.map((s) => (
                <g key={s.title} className="st-line__dot" transform={`translate(${s.x} ${s.y})`}>
                  <circle className="st-line__halo" r="22" />
                  <circle className="st-line__core" r="9" />
                </g>
              ))}
              <circle className="st-line__signal" r="6" cx="0" cy="0" />
            </svg>
            <ol className="st-line__stops">
              {STOPS.map((s, i) => (
                <li
                  key={s.title}
                  className={`st-stop st-stop--${s.y < 320 ? "up" : "down"}`}
                  style={{ left: `${(s.x / W) * 100}%`, top: `${(s.y / H) * 100}%` }}
                >
                  <span className="st-stop__dot" aria-hidden="true" />
                  <span className="st-stop__meta mono">
                    {String(i + 1).padStart(2, "0")} · {s.side}
                  </span>
                  <h3 className="h3">{s.title}</h3>
                  <p>{s.copy}</p>
                  <span className="st-stop__builds mono">{s.builds}</span>
                </li>
              ))}
            </ol>
            <span className="st-line__rail" aria-hidden="true">
              <span className="st-line__rail-fill" />
            </span>
          </div>
        </figure>
      </div>
    </section>
  );
}
