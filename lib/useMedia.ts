import { useSyncExternalStore } from "react";

/**
 * Subscribe to a media query.
 *
 * `useSyncExternalStore` is the right tool here: a media query is an external
 * store, and reading it through this hook avoids the setState-inside-an-effect
 * cascade that `useState` + `useEffect` produces. It also gives a defined
 * server snapshot, so SSR and the first client render agree.
 */
function subscribe(query: string) {
  return (onChange: () => void) => {
    const m = window.matchMedia(query);
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  };
}

export function useMediaQuery(query: string, serverFallback = false) {
  return useSyncExternalStore(
    subscribe(query),
    () => window.matchMedia(query).matches,
    () => serverFallback,
  );
}

/**
 * True when the visitor has asked for reduced motion.
 *
 * The server snapshot is `true` on purpose: the calm variant is what renders
 * before hydration, so nobody who asked for stillness gets a frame of movement
 * while the bundle loads.
 */
export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)", true);
}

/**
 * True once the page is scrolled past `offset` pixels.
 *
 * Same reasoning as `useMediaQuery`: scroll position is external state, so it
 * is read through a store subscription rather than mirrored into React state
 * from inside an effect. Reads are throttled to one per animation frame.
 */
export function useScrolledPast(offset: number) {
  return useSyncExternalStore(
    (onChange) => {
      let frame = 0;
      const handler = () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          onChange();
        });
      };
      window.addEventListener("scroll", handler, { passive: true });
      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("scroll", handler);
      };
    },
    () => window.scrollY > offset,
    () => false,
  );
}
