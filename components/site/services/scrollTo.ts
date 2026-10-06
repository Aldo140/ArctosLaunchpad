import type { IslandId } from "@/lib/content";

/** Glide to a chapter, keep the URL honest, and move focus to its heading. */
export function goToIsland(id: IslandId) {
  const target = document.getElementById(id);
  if (!target) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
  const heading = target.querySelector<HTMLElement>("h2[tabindex]");
  heading?.focus({ preventScroll: true });
}
