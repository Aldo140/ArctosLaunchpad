"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const STOPS = 3;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Motion for the closing band. Mounted inside `.close`; finds its section by DOM.
 *
 *  - The question's words rise out of masks (SplitText).
 *  - A rust signal line is drawn with the scroll: under the key word, across the
 *    gutter as a bridge, down the three doors, into the button. Geometry is
 *    measured from the real layout, so it fits any title length or tone.
 *  - Door rows track the pointer (arrow + island thumbnail); the button is magnetic.
 *
 * Reduced motion: no split, no magnet, the line is drawn complete and static.
 * Without JS the SVG is empty and the band reads as plain content.
 */
export function CloseFx() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const section = svg?.closest<HTMLElement>(".close");
    if (!svg || !section) return;
    const title = section.querySelector<HTMLElement>(".close__title");
    const list = section.querySelector<HTMLElement>(".close__needs");
    const btn = section.querySelector<HTMLElement>(".close__btn");
    const magnet = section.querySelector<HTMLElement>("[data-magnet]");
    const doors = Array.from(section.querySelectorAll<HTMLElement>(".door"));
    const line = svg.querySelector<SVGPathElement>(".close__line");
    const rail = svg.querySelector<SVGPathElement>(".close__rail");
    const nodeA = svg.querySelector<SVGCircleElement>(".close__node--a");
    const nodeB = svg.querySelector<SVGCircleElement>(".close__node--b");
    const stops = Array.from(svg.querySelectorAll<SVGCircleElement>(".close__stop"));
    if (!title || !list || !btn || !line || !rail || !nodeA || !nodeB) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motion = !reduce && document.documentElement.classList.contains("js-motion");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const cleanups: (() => void)[] = [];
    let split: SplitText | null = null;
    let length = 0;
    let stopAt: number[] = [];
    let progress = motion ? 0 : 1;
    let stacked = false;
    let pts: { k: number; x: number; y: number }[] = [];
    const SAMPLES = 480;
    const lead = section.querySelector<HTMLElement>(".close__lead");

    // ---- Kinetic title -------------------------------------------------
    if (motion) {
      split = SplitText.create(title.querySelectorAll(".ln > span"), {
        type: "words",
        mask: "words",
        wordsClass: "cw",
      });
      section.classList.add("is-split");
      gsap.set(split.words, { yPercent: 118, rotate: 7, transformOrigin: "0% 100%" });
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting) || !split) return;
          io.disconnect();
          gsap.to(split.words, {
            yPercent: 0,
            rotate: 0,
            duration: 1.25,
            ease: "expo.out",
            stagger: 0.075,
          });
        },
        { threshold: 0.3, rootMargin: "0px 0px -10% 0px" },
      );
      io.observe(title);
      cleanups.push(() => io.disconnect());
    }

    // ---- Signal line geometry -----------------------------------------
    let textRight = 0;
    const anchorRect = () => {
      const target = title.querySelector("em") ?? title;
      let rects: DOMRect[];
      if (split) {
        rects = Array.from(target.querySelectorAll<HTMLElement>(".cw-mask")).map((m) =>
          m.getBoundingClientRect(),
        );
      } else {
        const range = document.createRange();
        range.selectNodeContents(target);
        rects = Array.from(range.getClientRects());
      }
      rects = rects.filter((r) => r.width > 2 && r.height > 2);
      if (!rects.length) return title.getBoundingClientRect();
      const last = rects[rects.length - 1];
      // right edge of every line at or above the anchor's line: the bridge must clear it
      const all = split
        ? Array.from(title.querySelectorAll<HTMLElement>(".cw-mask")).map((m) => m.getBoundingClientRect())
        : (() => {
            const range = document.createRange();
            range.selectNodeContents(title);
            return Array.from(range.getClientRects());
          })();
      textRight = Math.max(
        last.right,
        ...all.filter((r) => r.width > 2 && r.top <= last.top + 4).map((r) => r.right),
      );
      const row = rects.filter((r) => Math.abs(r.top - last.top) < last.height * 0.5);
      const left = Math.min(...row.map((r) => r.left));
      const right = Math.max(...row.map((r) => r.right));
      return new DOMRect(left, last.top, right - left, last.height);
    };

    // layout rect without the reveal transforms still in flight on it or its ancestors
    const rectOf = (el: Element) => {
      const r = el.getBoundingClientRect();
      let dx = 0;
      let dy = 0;
      for (let n: Element | null = el; n && n !== section; n = n.parentElement) {
        const t = getComputedStyle(n).transform;
        if (t && t !== "none") {
          const m = new DOMMatrixReadOnly(t);
          dx += m.m41;
          dy += m.m42;
        }
      }
      return new DOMRect(r.left - dx, r.top - dy, r.width, r.height);
    };
    // a door's stop sits level with its index number
    const doorMid = (el: HTMLElement) => {
      const idx = el.querySelector(".door__index");
      const r = rectOf(idx ?? el);
      return r.top + r.height / 2;
    };

    const paint = () => {
      const p = clamp(progress, 0, 1);
      line.style.strokeDasharray = `${length} ${length}`;
      line.style.strokeDashoffset = `${length * (1 - p)}`;
      nodeA.classList.toggle("is-on", p > 0.01);
      nodeB.classList.toggle("is-on", p > 0.985);
      stops.forEach((s, i) => s.classList.toggle("is-on", stopAt[i] !== undefined && p >= stopAt[i]));
      doors.forEach((el, i) => el.classList.toggle("is-reached", stopAt[i] !== undefined && p >= stopAt[i]));
    };

    let alive = true;
    const build = () => {
      if (!alive) return;
      const sr = section.getBoundingClientRect();
      const w = sr.width;
      const h = sr.height;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      const a = anchorRect();
      const L = rectOf(list);
      const B = rectOf(btn);
      const fs = parseFloat(getComputedStyle(title).fontSize) || 60;
      const x0 = a.left - sr.left;
      const x1 = a.right - sr.left;
      const y0 = a.bottom - sr.top - (split ? fs * 0.16 : 0) - fs * 0.02;
      const lx = L.left - sr.left;
      const side = lx > x1 + 64;
      // stacked layouts hang the lead, doors and button off a rust spine (CSS indents them)
      if (section.classList.contains("has-rail") === side) {
        // the indent changes the layout we just measured: apply it, then measure again
        section.classList.toggle("has-rail", !side);
        build();
        return;
      }

      let railTop = 0; // y where the line starts running down the rail
      let prefix = ""; // the path up to that point
      let d = `M ${x0} ${y0} Q ${(x0 + x1) / 2} ${y0 + fs * 0.09} ${x1} ${y0}`;
      let railD = "";
      const doorY = doors.map((el) => doorMid(el) - sr.top);

      if (side) {
        const rx = lx - clamp((lx - x1) * 0.32, 16, 30);
        const r = 14;
        const by = B.top + B.height / 2 - sr.top;
        const bx = B.left - sr.left;
        // run under the rest of the line, then lift clear of the title and arch to the rail
        const xs = Math.min(Math.max(x1, textRight - sr.left + fs * 0.12), rx - r - 8);
        const span = rx - r - xs;
        const yJ = span >= 110 ? Math.min(y0, doorY[0] ?? y0) : y0;
        if (xs > x1 + 1) d += ` L ${xs} ${y0}`;
        d += ` C ${xs + span * 0.45} ${y0} ${xs + span * 0.55} ${yJ} ${rx - r} ${yJ}`;
        d += ` Q ${rx} ${yJ} ${rx} ${yJ + r}`;
        prefix = d;
        railTop = yJ + r;
        d += ` L ${rx} ${by - r} Q ${rx} ${by} ${rx + r} ${by} L ${bx + 4} ${by}`;
        railD = `M ${rx} ${L.top - sr.top} L ${rx} ${by}`;
        nodeB.setAttribute("cx", `${bx + 4}`);
        nodeB.setAttribute("cy", `${by}`);
        stops.forEach((s, i) => {
          s.style.display = "";
          s.setAttribute("cx", `${rx}`);
          s.setAttribute("cy", `${doorY[i] ?? 0}`);
        });
      } else {
        // a switchback: under the word, hairpin back beneath it, then down the spine
        const L2 = rectOf(list);
        const B2 = rectOf(btn);
        const leadTop = (lead ? rectOf(lead).top : L2.top) - sr.top;
        const rx = L2.left - sr.left - 14;
        const r = 12;
        const yR = Math.max(y0 + 22, (y0 + leadTop) / 2);
        const hr = Math.min((yR - y0) * 0.75, w - x1 - 6);
        const by = B2.top + B2.height / 2 - sr.top;
        const bx = B2.left - sr.left;
        d += ` C ${x1 + hr} ${y0} ${x1 + hr} ${yR} ${x1} ${yR}`;
        d += ` L ${rx + r} ${yR} Q ${rx} ${yR} ${rx} ${yR + r}`;
        prefix = d;
        railTop = yR + r;
        d += ` L ${rx} ${by - r} Q ${rx} ${by} ${rx + r} ${by} L ${bx + 2} ${by}`;
        railD = `M ${rx} ${yR + r} L ${rx} ${by}`;
        nodeB.setAttribute("cx", `${bx + 2}`);
        nodeB.setAttribute("cy", `${by}`);
        const dy = doors.map((el) => doorMid(el) - sr.top);
        stops.forEach((s, i) => {
          s.style.display = "";
          s.setAttribute("cx", `${rx}`);
          s.setAttribute("cy", `${dy[i] ?? 0}`);
        });
        doorY.splice(0, doorY.length, ...dy);
      }
      stacked = !side;
      nodeA.setAttribute("cx", `${x0}`);
      nodeA.setAttribute("cy", `${y0}`);
      line.setAttribute("d", d);
      rail.setAttribute("d", railD);
      length = line.getTotalLength();

      // where along the line each stop is reached
      stopAt = [];
      const samples = SAMPLES;
      pts = Array.from({ length: samples + 1 }, (_, k) => {
        const pt = line.getPointAtLength((length * k) / samples);
        return { k, x: pt.x, y: pt.y };
      });
      // distance along the line to each stop = the bend-in, then straight down the rail
      line.setAttribute("d", prefix);
      const before = prefix ? line.getTotalLength() : 0;
      line.setAttribute("d", d);
      doorY.forEach((sy, i) => {
        stopAt[i] = prefix && sy >= railTop - 1 ? (before + sy - railTop) / length : 2;
      });
      paint();
    };

    // ---- Scroll-driven draw (rect based, survives other sections' pins) ---
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = section.getBoundingClientRect();
        const vh = window.innerHeight;
        if (stacked && pts.length) {
          // the line's head follows the reader: it sits ~two thirds down the screen
          const headY = vh * 0.66 - r.top;
          const next = pts.findIndex((pt) => pt.y > headY + 0.5);
          progress = next === -1 ? 1 : Math.max(0, next - 1) / SAMPLES;
        } else {
          progress = (vh * 0.92 - r.top) / (vh * 0.62);
        }
        paint();
        if (!fine) {
          // depth without a pointer: each island drifts and settles as its row passes
          thumbs.forEach((img) => {
            const tr = img.getBoundingClientRect();
            const t = clamp((tr.top + tr.height / 2) / vh - 0.5, -0.6, 0.6);
            img.style.transform = `translate3d(0, ${(t * -26).toFixed(1)}px, 0) rotate(${(t * -7).toFixed(2)}deg)`;
          });
        }
      });
    };

    const thumbs = Array.from(section.querySelectorAll<HTMLElement>(".door__thumb img"));
    if (motion) section.classList.add("is-live");
    build();
    if (motion) {
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    }
    // measure again once layout settles (fonts, images, the rail indent)
    const settle = requestAnimationFrame(() => requestAnimationFrame(build));
    window.addEventListener("load", build);
    cleanups.push(() => {
      cancelAnimationFrame(settle);
      window.removeEventListener("load", build);
    });
    const ro = new ResizeObserver(() => build());
    ro.observe(section);
    ro.observe(list);
    ro.observe(title);
    cleanups.push(() => ro.disconnect());
    document.fonts?.ready.then(() => build()).catch(() => {});

    // ---- Doors: lit stop on hover/focus; pointer-tracked arrow + thumbnail ----
    doors.forEach((door, i) => {
      const on = () => stops[i]?.classList.add("is-hot");
      const off = () => stops[i]?.classList.remove("is-hot");
      door.addEventListener("pointerenter", on);
      door.addEventListener("pointerleave", off);
      door.addEventListener("focus", on);
      door.addEventListener("blur", off);
      cleanups.push(() => {
        door.removeEventListener("pointerenter", on);
        door.removeEventListener("pointerleave", off);
        door.removeEventListener("focus", on);
        door.removeEventListener("blur", off);
      });

      if (!motion || !fine) return;
      const arrow = door.querySelector<HTMLElement>(".door__arrow");
      const thumb = door.querySelector<HTMLElement>(".door__thumb img");
      if (!arrow || !thumb) return;
      const ax = gsap.quickTo(arrow, "x", { duration: 0.5, ease: "power3.out" });
      const ay = gsap.quickTo(arrow, "y", { duration: 0.5, ease: "power3.out" });
      const tx = gsap.quickTo(thumb, "x", { duration: 0.8, ease: "power3.out" });
      const tr = gsap.quickTo(thumb, "rotate", { duration: 0.8, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = door.getBoundingClientRect();
        const ar = arrow.getBoundingClientRect();
        const cx = ar.left + ar.width / 2 - (Number(gsap.getProperty(arrow, "x")) || 0);
        const cy = ar.top + ar.height / 2 - (Number(gsap.getProperty(arrow, "y")) || 0);
        ax(clamp((e.clientX - cx) * 0.22, -46, 8));
        ay(clamp((e.clientY - cy) * 0.35, -14, 14));
        const nx = (e.clientX - r.left) / r.width - 0.5;
        tx(nx * 26);
        tr(nx * 8);
      };
      const leave = () => {
        ax(0);
        ay(0);
        tx(0);
        tr(0);
      };
      door.addEventListener("pointermove", move);
      door.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        door.removeEventListener("pointermove", move);
        door.removeEventListener("pointerleave", leave);
      });
    });

    // ---- Magnetic primary button -----------------------------------------
    if (motion && fine && magnet) {
      const mx = gsap.quickTo(magnet, "x", { duration: 0.6, ease: "power3.out" });
      const my = gsap.quickTo(magnet, "y", { duration: 0.6, ease: "power3.out" });
      const reach = 110;
      const move = (e: PointerEvent) => {
        const r = magnet.getBoundingClientRect();
        const ox = Number(gsap.getProperty(magnet, "x")) || 0;
        const oy = Number(gsap.getProperty(magnet, "y")) || 0;
        const cx = r.left + r.width / 2 - ox;
        const cy = r.top + r.height / 2 - oy;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const inside =
          Math.abs(dx) < r.width / 2 + reach && Math.abs(dy) < r.height / 2 + reach;
        mx(inside ? dx * 0.28 : 0);
        my(inside ? dy * 0.38 : 0);
      };
      const leave = () => {
        mx(0);
        my(0);
      };
      section.addEventListener("pointermove", move);
      section.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        section.removeEventListener("pointermove", move);
        section.removeEventListener("pointerleave", leave);
      });
    }

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
      gsap.killTweensOf(split?.words ?? []);
      split?.revert();
      section.classList.remove("is-split", "is-live", "has-rail");
      thumbs.forEach((img) => (img.style.transform = ""));
      if (magnet) gsap.set(magnet, { clearProps: "transform" });
    };
  }, []);

  return (
    <svg ref={svgRef} className="close__wire" aria-hidden="true" focusable="false">
      <path className="close__rail" d="" />
      <path className="close__line" d="" />
      {Array.from({ length: STOPS }, (_, i) => (
        <circle key={i} className="close__stop" r="5" cx="-20" cy="-20" />
      ))}
      <circle className="close__node close__node--a" r="4.5" cx="-20" cy="-20" />
      <circle className="close__node close__node--b" r="4.5" cx="-20" cy="-20" />
    </svg>
  );
}
