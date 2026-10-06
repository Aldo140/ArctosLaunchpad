"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { KEYSTONE_STATEMENT } from "@/lib/content/probono";

/**
 * The Keystone hero: a statement of work that fills itself in, line by line,
 * adds up the studio time, and then gets stamped. Amount due: $0.00.
 *
 * The markup is the finished statement, so it reads correctly without
 * JavaScript and under reduced motion. Motion only replays how it got there.
 * Hours are illustrative and the sheet says so.
 */

const LINES = KEYSTONE_STATEMENT.lines;
const NAMES = KEYSTONE_STATEMENT.for;
const TOTAL = LINES.reduce((sum, line) => sum + line.hours, 0);
/** Where the ink lands when the stamp hits, as angles and distances. */
const SPLATTER = [
  [12, 1.0, 5],
  [58, 0.82, 3],
  [101, 1.06, 4],
  [147, 0.9, 3],
  [196, 1.04, 5],
  [238, 0.86, 3],
  [289, 1.08, 4],
  [331, 0.94, 3],
] as const;

function Stamp() {
  return (
    <svg className="kp-stamp" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        {/* rubber on paper: the edges bite unevenly */}
        <filter id="kp-ink" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            seed="11"
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
        </filter>
        <path
          id="kp-ring"
          d="M 28 100 a 72 72 0 1 1 144 0 a 72 72 0 1 1 -144 0"
        />
      </defs>
      <g filter="url(#kp-ink)">
        <circle
          cx="100"
          cy="100"
          r="94"
          fill="none"
          stroke="currentColor"
          strokeWidth="4.5"
        />
        <circle
          cx="100"
          cy="100"
          r="86"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <circle
          cx="100"
          cy="100"
          r="58"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <text className="kp-stamp__ring" fill="currentColor">
          <textPath href="#kp-ring" textLength="446" lengthAdjust="spacing">
            ARCTOS LAUNCHPAD ✦ KEYSTONE PRO BONO ✦
          </textPath>
        </text>
        <text
          className="kp-stamp__k"
          x="100"
          y="86"
          textAnchor="middle"
          fill="currentColor"
        >
          COVERED
        </text>
        <text
          className="kp-stamp__big"
          x="100"
          y="129"
          textAnchor="middle"
          fill="currentColor"
        >
          $0
        </text>
      </g>
    </svg>
  );
}

export function KeystoneInvoice() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !document.documentElement.classList.contains("js-motion"))
      return;
    const q = gsap.utils.selector(el);
    const tilt = q(".kp-inv__tilt")[0] as HTMLElement;
    const paper = q(".kp-inv__paper")[0] as HTMLElement;
    const who = q(".kp-inv__who")[0] as HTMLElement;
    const rows = q(".kp-inv__line") as HTMLElement[];
    const dots = q(".kp-inv__dots") as HTMLElement[];
    const hours = q(".kp-inv__h b") as HTMLElement[];
    const total = q(".kp-inv__total")[0] as HTMLElement;
    const sum = q(".kp-inv__sum")[0] as HTMLElement;
    const due = q(".kp-inv__due")[0] as HTMLElement;
    const amount = q(".kp-inv__amt")[0] as HTMLElement;
    const stamp = q(".kp-inv__stamp")[0] as HTMLElement;
    const cleanups: (() => void)[] = [];

    const ctx = gsap.context(() => {
      // Start blank: the same sheet, before anyone has filled it in.
      gsap.set(paper, { opacity: 0, y: 70, rotate: -8 });
      gsap.set(rows, { opacity: 0, x: -14 });
      gsap.set(dots, { scaleX: 0 });
      gsap.set([total, due], { opacity: 0 });
      gsap.set(amount, { opacity: 0 });
      gsap.set(stamp, { opacity: 0, scale: 2.7, rotate: -38 });
      hours.forEach((b) => (b.textContent = "0"));
      sum.textContent = "0";
      who.textContent = "";
      el.classList.add("is-live");

      const type = (text: string, each = 0.05) => {
        const t = gsap.timeline();
        for (let i = 1; i <= text.length; i++)
          t.call(
            () => void (who.textContent = text.slice(0, i)),
            undefined,
            i * each,
          );
        return t;
      };
      const erase = (text: string, each = 0.022) => {
        const t = gsap.timeline();
        for (let i = text.length - 1; i >= 0; i--)
          t.call(
            () => void (who.textContent = text.slice(0, i)),
            undefined,
            (text.length - i) * each,
          );
        return t;
      };

      const tl = gsap.timeline({ delay: 0.3, paused: true });
      tl.to(paper, {
        opacity: 1,
        y: 0,
        rotate: 0,
        duration: 1.2,
        ease: "expo.out",
      }).add(type(NAMES[0]), 0.5);

      rows.forEach((row, i) => {
        const n = LINES[i].hours;
        const o = { v: 0 };
        tl.to(
          row,
          { opacity: 1, x: 0, duration: 0.45, ease: "power3.out" },
          i === 0 ? 0.75 : ">-0.32",
        )
          .to(dots[i], { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, "<")
          .to(
            o,
            {
              v: n,
              duration: 0.55,
              ease: "power2.out",
              onUpdate: () =>
                void (hours[i].textContent = String(Math.round(o.v))),
            },
            "<0.1",
          );
      });

      const s = { v: 0 };
      tl.to(total, { opacity: 1, duration: 0.4 }, ">-0.1")
        .to(
          s,
          {
            v: TOTAL,
            duration: 0.9,
            ease: "power3.out",
            onUpdate: () => void (sum.textContent = String(Math.round(s.v))),
          },
          "<",
        )
        .to(due, { opacity: 1, duration: 0.35 }, "-=0.35")
        // the stamp comes down hard…
        .to(
          stamp,
          {
            opacity: 1,
            scale: 1,
            rotate: -13,
            duration: 0.32,
            ease: "power4.in",
          },
          "+=0.3",
        )
        .addLabel("hit")
        // …the desk jolts, ink spreads, and the amount reads true
        .call(() => el.classList.add("is-stamped"), undefined, "hit")
        .to(
          paper,
          { y: 6, duration: 0.06, ease: "power1.out", yoyo: true, repeat: 1 },
          "hit",
        )
        .fromTo(
          stamp,
          { scale: 1 },
          {
            scale: 1.035,
            duration: 0.08,
            yoyo: true,
            repeat: 1,
            ease: "power1.out",
          },
          "hit",
        )
        .fromTo(
          amount,
          { opacity: 0, scale: 1.5 },
          { opacity: 1, scale: 1, duration: 0.55, ease: "back.out(2.2)" },
          "hit+=0.08",
        );

      // Then the name on the statement changes: anyone could be next.
      let shown: string = NAMES[0];
      NAMES.slice(1).forEach((name) => {
        const prev = shown;
        tl.add(erase(prev), "+=1.5").add(type(name), "+=0.15");
        shown = name;
      });
      tl.call(() => el.classList.add("is-done"));

      // Start once it can be seen; the hero is usually on screen already.
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          tl.play();
        },
        { threshold: 0.25 },
      );
      io.observe(el);
      cleanups.push(() => io.disconnect());

      // A mouse can tip the sheet toward the light.
      if (
        window.matchMedia(
          "(hover: hover) and (pointer: fine) and (min-width: 901px)",
        ).matches
      ) {
        const rx = gsap.quickTo(tilt, "rotationX", {
          duration: 0.9,
          ease: "power3.out",
        });
        const ry = gsap.quickTo(tilt, "rotationY", {
          duration: 0.9,
          ease: "power3.out",
        });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - (r.left + r.width / 2)) / r.width;
          const y = (e.clientY - (r.top + r.height / 2)) / r.height;
          ry(gsap.utils.clamp(-9, 9, x * 14));
          rx(gsap.utils.clamp(-7, 7, -y * 10));
        };
        const leave = () => {
          rx(0);
          ry(0);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        });
      }
    }, el);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
      el.classList.remove("is-live", "is-stamped", "is-done");
      if (who) who.textContent = NAMES[NAMES.length - 1];
    };
  }, []);

  return (
    <figure className="kp-inv" ref={root}>
      <figcaption className="visually-hidden">
        An illustrative statement of work: {TOTAL} hours of studio time across
        strategy, website, automation, reporting and launch, stamped “Covered,
        Keystone pro bono”. Amount due: $0.00.
      </figcaption>
      <div className="kp-inv__tilt" aria-hidden="true">
        <div className="kp-inv__paper">
          <div className="kp-inv__back" />
          <div className="kp-inv__sheet">
            <div className="kp-inv__head">
              <div>
                <p className="kp-inv__brand">Arctos Launchpad</p>
                <p className="kp-inv__meta">Calgary, Alberta</p>
              </div>
              <div className="kp-inv__doc">
                <p className="kp-inv__meta">Statement of work</p>
                <p className="kp-inv__no">No. KS-001</p>
              </div>
            </div>
            <p className="kp-inv__for">
              <span className="kp-inv__meta">Prepared for</span>
              <span className="kp-inv__name">
                <span className="kp-inv__who">{NAMES[NAMES.length - 1]}</span>
                <span className="kp-inv__caret" />
              </span>
            </p>
            <ol className="kp-inv__lines">
              {LINES.map((line, i) => (
                <li key={line.label} className="kp-inv__line">
                  <span className="kp-inv__n">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="kp-inv__label">{line.label}</span>
                  <span className="kp-inv__dots" />
                  <span className="kp-inv__h">
                    <b>{line.hours}</b> h
                  </span>
                </li>
              ))}
            </ol>
            <div className="kp-inv__total">
              <span className="kp-inv__meta">Studio time</span>
              <span className="kp-inv__h">
                <b className="kp-inv__sum">{TOTAL}</b> h
              </span>
            </div>
            <div className="kp-inv__due">
              <span className="kp-inv__due-k">Amount due</span>
              <span className="kp-inv__amt">$0.00</span>
            </div>
            <div className="kp-inv__foot">
              <p className="kp-inv__note">
                Illustrative scope. Every Keystone project is scoped with the
                organization.
              </p>
              <div className="kp-inv__stamp">
                <span className="kp-inv__burst" />
                {SPLATTER.map(([a, r, s], i) => (
                  <span
                    key={i}
                    className="kp-inv__drop"
                    style={
                      {
                        "--a": `${a}deg`,
                        "--r": r,
                        "--s": `${s}px`,
                      } as CSSProperties
                    }
                  />
                ))}
                <Stamp />
              </div>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
