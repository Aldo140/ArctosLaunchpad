import type { IslandId } from "@/lib/content";

/** Everything here is in the bridge illustration's own 1536×1024 coordinate space. */
export const ART_W = 1536;
export const ART_H = 1024;

/** The bridge deck: the path a customer or a task takes across the system. */
export const DECK =
  "M 214 640 C 300 650 360 560 420 512 C 448 490 470 476 500 470 L 700 441 L 760 432 L 905 470 L 1135 486 C 1180 500 1222 560 1262 612 C 1280 634 1300 646 1330 650";

/** The top surface of each island, as an ellipse. */
export const ISLES: Record<IslandId, { cx: number; cy: number; rx: number; ry: number }> = {
  win: { cx: 196, cy: 648, rx: 186, ry: 50 },
  run: { cx: 830, cy: 722, rx: 238, ry: 46 },
  see: { cx: 1368, cy: 672, rx: 162, ry: 40 },
};

/** The run island sits under the bridge: the signal drops a plumb line to it. */
export const PLUMB = { x: 830, top: 458, bottom: 706 };

/** Island label anchors, as % of the art box. */
export const LABELS: Record<IslandId, { x: number; y: number }> = {
  win: { x: 12.5, y: 79 },
  run: { x: 54, y: 92.5 },
  see: { x: 86.5, y: 82 },
};

/** Real, live client projects. Each links to its case file. */
export const LIVE = [
  ["Nics Delite", "/work/nicsdelite"],
  ["True North Kromes", "/work/true-north-kromes"],
  ["Calgary Watch", "/work/calgary-watch"],
  ["Rio Alto", "/work/rio-alto"],
  ["So Social Collective", "/work/so-social-collective"],
  ["Starlings", "/work/starlings-support-map"],
] as const;
