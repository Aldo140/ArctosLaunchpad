import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Pinned travel only where it is welcome and controllable. */
export const PIN_QUERY =
  "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** Ground of the finale: the rail lands on the bridge's rust, deepened. */
const END_WASH = "#2b170e";
const INK = "#0d1b1e";

type Parts = {
  li: HTMLElement;
  depth: HTMLElement | null;
  tilt: HTMLElement | null;
  screen: HTMLElement | null;
  phone: HTMLElement | null;
  shade: HTMLElement | null;
  glare: HTMLElement | null;
  meta: HTMLElement | null;
  video: HTMLVideoElement | null;
};

const clamp = (min: number, max: number, v: number) => Math.min(max, Math.max(min, v));

export function setupRailMotion(el: HTMLElement, accents: string[]) {
  const q = <T extends Element = HTMLElement>(s: string) => el.querySelector<T>(s);
  const track = q(".wr__track");
  const viewport = q(".wr__viewport");
  const pinEl = q(".wr__pin");
  const wash = q(".wr__wash");
  const numeral = q(".wr__numeral");
  const numeralRoll = q(".wr__numeral-roll");
  const countRoll = q(".wr__count-roll");
  const bar = q(".wr__progress i");
  const cursor = q(".wr__cursor");
  const cursorLabel = q(".wr__cursor-label");
  if (!track || !viewport || !pinEl) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = Array.from(el.querySelectorAll<HTMLElement>(".wr__item"));
  const dots = Array.from(el.querySelectorAll<HTMLButtonElement>(".wr__dot"));
  const n = accents.length; // project cards; items[n] is the finale
  const last = items.length - 1;
  const parts: Parts[] = items.map((li) => ({
    li,
    depth: li.querySelector(".rc__depth, .rf"),
    tilt: li.querySelector(".rc__tilt"),
    screen: li.querySelector(".rc__screen"),
    phone: li.querySelector(".rc__phone"),
    shade: li.querySelector(".rc__shade"),
    glare: li.querySelector(".rc__glare"),
    meta: li.querySelector(".rc__meta"),
    video: li.querySelector("video[data-rail-reel]"),
  }));

  // Washes stay dark enough that paper text keeps its contrast.
  const colors = [...accents.map((c) => gsap.utils.interpolate(c, INK, 0.18)), END_WASH];
  const lerps = colors.slice(0, -1).map((c, k) => gsap.utils.interpolate(c, colors[k + 1]));

  let active = -1;
  let inView = false;

  const playActive = () => {
    parts.forEach(({ video }, k) => {
      if (!video) return;
      if (k === active && inView && !reduce) {
        if (video.preload === "none") video.preload = "auto";
        video.play().then(
          () => video.classList.add("is-playing"),
          () => {},
        );
      } else {
        video.pause();
      }
    });
  };

  const setActive = (i: number) => {
    if (i === active) return;
    active = i;
    items.forEach((li, k) => li.classList.toggle("is-active", k === i));
    dots.forEach((b, k) => (k === i ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current")));
    el.classList.toggle("is-finale", i === last);
    playActive();
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      playActive();
    },
    { rootMargin: "-20% 0px -20% 0px" },
  );
  io.observe(el);

  // Own the head's reveal: pinning re-parents the pin, so don't rely on the
  // global observer having caught these before the spacer went in.
  const reveals = Array.from(el.querySelectorAll<HTMLElement>("[data-reveal]"));
  const revealIO = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        reveals.forEach((r) => r.classList.add("is-in"));
        revealIO.disconnect();
      }
    },
    { rootMargin: "0px 0px -25% 0px" },
  );
  if (document.documentElement.classList.contains("js-motion")) revealIO.observe(el);
  else reveals.forEach((r) => r.classList.add("is-in"));

  // Dots jump to a project; what "jump" means depends on the mode.
  let goTo: (k: number) => void = () => {};
  const onDot = (e: Event) => {
    const k = Number((e.currentTarget as HTMLElement).dataset.dot);
    if (Number.isFinite(k)) goTo(k);
  };
  dots.forEach((b) => b.addEventListener("click", onDot));

  /* ---------------------------------------------------------------- native */
  const native = () => {
    el.classList.remove("wr--pinned");
    viewport.tabIndex = 0;
    let raf = 0;
    // Touch choreography: the swipe itself drives depth. The card at centre
    // is lit and square-on; neighbours turn away, shrink and shade, and the
    // phone slides on a nearer plane. The ground blends continuously between
    // project colours. No blur on mobile (too costly), no pointer needed.
    const liveAny = !reduce;
    el.classList.toggle("wr--live", liveAny);
    const measure = () => {
      const centre = viewport.scrollLeft + viewport.clientWidth / 2;
      const centers = items.map((li) => li.offsetLeft + li.offsetWidth / 2);
      const step = centers[1] - centers[0] || 1;
      let p = 0;
      if (centre >= centers[last]) p = last;
      else if (centre > centers[0]) {
        for (let k = 0; k < last; k++) {
          if (centre < centers[k + 1]) {
            p = k + (centre - centers[k]) / (centers[k + 1] - centers[k]);
            break;
          }
        }
      }
      setActive(Math.round(p));
      if (liveAny) {
        parts.forEach((pt, k) => {
          const dd = clamp(-1.5, 1.5, (centers[k] - centre) / step);
          const a = Math.min(Math.abs(dd), 1);
          if (pt.depth) {
            pt.depth.style.transform = `perspective(1100px) rotateY(${(-dd * 8).toFixed(2)}deg) scale(${(1 - 0.1 * a).toFixed(4)})`;
          }
          if (k === last) {
            pt.li.style.setProperty("--open", (1 - a).toFixed(3));
            return;
          }
          if (pt.screen) pt.screen.style.transform = `translate3d(${(dd * 14).toFixed(1)}px, 0, 0)`;
          if (pt.phone) {
            pt.phone.style.transform = `translate3d(${(-dd * 46).toFixed(1)}px, ${(a * 16).toFixed(1)}px, 0) rotate(${(-dd * 4).toFixed(2)}deg)`;
          }
          if (pt.shade) pt.shade.style.opacity = (a * 0.5).toFixed(3);
          if (pt.meta) pt.meta.style.opacity = (1 - a * 0.35).toFixed(3);
        });
        const i0 = Math.min(Math.floor(p), lerps.length - 1);
        if (wash) wash.style.backgroundColor = lerps[i0](clamp(0, 1, p - i0));
      }
      const r = liveAny ? Math.min(p, n - 1) : Math.min(Math.round(p), n - 1);
      const shift = `translate3d(0, ${(-r * 1.2).toFixed(4)}em, 0)`;
      if (countRoll) countRoll.style.transform = shift;
      if (numeralRoll) numeralRoll.style.transform = shift;
      const max = viewport.scrollWidth - viewport.clientWidth;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? viewport.scrollLeft / max : 0})`;
    };
    // Arrival: the stage rises and settles as the section scrolls in.
    const arrive = liveAny
      ? gsap.fromTo(
          track,
          { y: 70, rotationX: 10, transformPerspective: 1200, transformOrigin: "50% 0%" },
          {
            y: 0,
            rotationX: 0,
            ease: "none",
            scrollTrigger: { trigger: viewport, start: "top bottom", end: "top 55%", scrub: 0.6 },
          },
        )
      : null;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    goTo = (k) => {
      const li = items[k];
      if (!li) return;
      viewport.scrollTo({
        left: li.offsetLeft + li.offsetWidth / 2 - viewport.clientWidth / 2,
        behavior: reduce ? "auto" : "smooth",
      });
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    measure();
    return () => {
      cancelAnimationFrame(raf);
      viewport.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      viewport.removeAttribute("tabindex");
      arrive?.scrollTrigger?.kill();
      arrive?.kill();
      gsap.set(track, { clearProps: "transform" });
      el.classList.remove("wr--live");
      parts.forEach((pt) => {
        [pt.depth, pt.screen, pt.phone, pt.shade, pt.meta].forEach((node) => node?.removeAttribute("style"));
        pt.li.style.removeProperty("--open");
      });
      [countRoll, numeralRoll, wash, bar].forEach((node) => node?.removeAttribute("style"));
    };
  };

  /* ---------------------------------------------------------------- pinned */
  const pinned = () => {
    el.classList.add("wr--pinned");
    viewport.scrollLeft = 0;
    let centers: number[] = [];
    let stops: number[] = [];
    let vw = window.innerWidth;
    const measure = () => {
      vw = window.innerWidth;
      centers = items.map((li) => li.offsetLeft + li.offsetWidth / 2);
      const span = centers[last] - centers[0] || 1;
      stops = centers.map((c) => (c - centers[0]) / span);
    };
    measure();
    const span = () => centers[last] - centers[0];

    const travel = gsap.fromTo(
      track,
      { x: () => vw / 2 - centers[0] },
      {
        x: () => vw / 2 - centers[last],
        ease: "none",
        scrollTrigger: {
          trigger: el,
          pin: pinEl,
          start: "top top",
          end: () => `+=${Math.round(span() * 1.05)}`,
          scrub: 0.85,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefreshInit: measure,
          snap: {
            snapTo: (v: number) => stops.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a), 0),
            duration: { min: 0.25, max: 0.8 },
            delay: 0.1,
            ease: "power2.inOut",
          },
        },
      },
    );
    const st = travel.scrollTrigger!;

    const scrollFor = (k: number) => st.start + (stops[k] ?? 0) * (st.end - st.start);
    goTo = (k) => window.scrollTo({ top: scrollFor(k), behavior: "smooth" });

    // Pointer state, eased in the render loop.
    const ptr = { tx: 0, ty: 0, x: 0, y: 0 };

    const render = () => {
      const x = Number(gsap.getProperty(track, "x")) || 0;
      const pos = vw / 2 - x;
      let p = 0;
      if (pos >= centers[last]) p = last;
      else if (pos > centers[0]) {
        for (let k = 0; k < last; k++) {
          if (pos < centers[k + 1]) {
            p = k + (pos - centers[k]) / (centers[k + 1] - centers[k]);
            break;
          }
        }
      }
      const step = centers[1] - centers[0] || 1;
      const focus = Math.round(p);
      ptr.x += (ptr.tx - ptr.x) * 0.09;
      ptr.y += (ptr.ty - ptr.y) * 0.09;

      parts.forEach((pt, k) => {
        const dd = (centers[k] - pos) / step;
        const a = Math.min(Math.abs(dd), 1);
        const ry = clamp(-14, 14, -dd * 11);
        if (pt.depth) {
          pt.depth.style.transform = `perspective(1600px) rotateY(${ry.toFixed(2)}deg) scale(${(1 - 0.18 * a).toFixed(4)})`;
        }
        if (k === last) {
          pt.li.style.setProperty("--open", (1 - a).toFixed(3));
          return;
        }
        const isFocus = k === focus;
        const px = isFocus ? ptr.x : 0;
        const py = isFocus ? ptr.y : 0;
        if (pt.tilt) {
          pt.tilt.style.transform = `rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 7).toFixed(2)}deg)`;
          pt.tilt.style.filter = a > 0.03 ? `blur(${(a * 3.2).toFixed(2)}px)` : "none";
        }
        if (pt.screen) pt.screen.style.transform = `translate3d(${(dd * 26 - px * 6).toFixed(1)}px, ${(-py * 4).toFixed(1)}px, 0)`;
        if (pt.phone) {
          pt.phone.style.transform = `translate3d(${(-dd * 96 + px * 18).toFixed(1)}px, ${(a * 26 + py * 12).toFixed(1)}px, 0) rotate(${(-dd * 4 + px * 1.5).toFixed(2)}deg)`;
        }
        if (pt.shade) pt.shade.style.opacity = (a * 0.62).toFixed(3);
        if (pt.glare) {
          pt.glare.style.opacity = isFocus ? (Math.hypot(ptr.x, ptr.y) * 0.5).toFixed(3) : "0";
          pt.glare.style.setProperty("--gx", `${(50 + ptr.x * 50).toFixed(1)}%`);
          pt.glare.style.setProperty("--gy", `${(50 + ptr.y * 50).toFixed(1)}%`);
        }
        if (pt.meta) pt.meta.style.opacity = (1 - a * 0.5).toFixed(3);
      });

      const roll = `translate3d(0, ${(-Math.min(p, n - 1) * 1.2).toFixed(4)}em, 0)`;
      if (numeralRoll) numeralRoll.style.transform = roll;
      if (countRoll) countRoll.style.transform = roll;
      if (numeral) numeral.style.opacity = clamp(0, 1, n - p).toFixed(3);
      if (wash) {
        const i0 = Math.min(Math.floor(p), lerps.length - 1);
        wash.style.backgroundColor = lerps[i0](clamp(0, 1, p - i0));
      }
      if (bar) bar.style.transform = `scaleX(${(p / last).toFixed(4)})`;
      setActive(focus);
    };

    const loop = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? gsap.ticker.add(render) : gsap.ticker.remove(render)),
    });
    if (loop.isActive) gsap.ticker.add(render);
    render();

    // Pointer: tilt the focused card, and a "View case" follower.
    const xTo = cursor ? gsap.quickTo(cursor, "x", { duration: 0.45, ease: "power3" }) : null;
    const yTo = cursor ? gsap.quickTo(cursor, "y", { duration: 0.45, ease: "power3" }) : null;
    let cursorOn = false;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const target = e.target as Element | null;
      const hit = target?.closest<HTMLElement>("[data-cursor]");
      const focusMedia = parts[active]?.tilt;
      if (focusMedia && active < last) {
        const r = focusMedia.getBoundingClientRect();
        const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        ptr.tx = inside ? clamp(-1, 1, ((e.clientX - r.left) / r.width - 0.5) * 2) : 0;
        ptr.ty = inside ? clamp(-1, 1, ((e.clientY - r.top) / r.height - 0.5) * 2) : 0;
      }
      if (cursor && xTo && yTo) {
        if (!cursorOn) gsap.set(cursor, { x: e.clientX, y: e.clientY });
        xTo(e.clientX);
        yTo(e.clientY);
        const on = Boolean(hit);
        if (on && cursorLabel && hit) cursorLabel.textContent = hit.dataset.cursor ?? "View case";
        if (on !== cursorOn) {
          cursorOn = on;
          cursor.classList.toggle("is-on", on);
        }
      }
    };
    const onLeave = () => {
      ptr.tx = 0;
      ptr.ty = 0;
      cursorOn = false;
      cursor?.classList.remove("is-on");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    // Keyboard: a focused card is always brought to centre.
    const onFocus = (e: FocusEvent) => {
      const li = (e.target as Element).closest<HTMLElement>(".wr__item");
      const k = li ? items.indexOf(li) : -1;
      if (k < 0) return;
      viewport.scrollLeft = 0;
      if (Math.abs(window.scrollY - scrollFor(k)) > 4) window.scrollTo({ top: scrollFor(k), behavior: "auto" });
    };
    el.addEventListener("focusin", onFocus);

    return () => {
      gsap.ticker.remove(render);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("focusin", onFocus);
      el.classList.remove("wr--pinned", "is-finale");
      parts.forEach((pt) => {
        [pt.depth, pt.tilt, pt.screen, pt.phone, pt.shade, pt.glare, pt.meta].forEach((node) => node?.removeAttribute("style"));
        pt.li.style.removeProperty("--open");
      });
      [numeral, numeralRoll, countRoll, wash, bar].forEach((node) => node?.removeAttribute("style"));
    };
  };

  const mm = gsap.matchMedia();
  // A conditions object only fires when one matches, so keep an always-true query.
  mm.add({ pin: PIN_QUERY, any: "(min-width: 0px)" }, (ctx) => (ctx.conditions?.pin ? pinned() : native()));

  return () => {
    mm.revert();
    io.disconnect();
    revealIO.disconnect();
    dots.forEach((b) => b.removeEventListener("click", onDot));
    parts.forEach(({ video }) => video?.pause());
  };
}
