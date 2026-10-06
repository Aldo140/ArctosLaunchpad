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

/**
 * Phones and tablets: the bridge, recomposed for a portrait screen.
 *
 * Instead of panning a camera across a landscape painting, the three island
 * cut-outs sit in one square scene (a 1000×1000 box): the bear's island in the
 * middle, Win in front at lower left with its ramp reaching for the bridge,
 * See small and far at upper right. The route climbs from one to the next.
 * Positions are in box units; `depth` drives parallax (0 far, 1 near).
 */
export const SCENE = 1000;

export const PIECES: Record<
  IslandId,
  { src: string; w: number; h: number; x: number; y: number; width: number; depth: number; alt: string }
> = {
  see: {
    src: "/assets/art/island-see.webp", w: 356, h: 400,
    x: 690, y: 30, width: 290, depth: 0.15,
    alt: "A small far island with a dashboard mast, where the numbers are read.",
  },
  run: {
    src: "/assets/art/island-run.webp", w: 600, h: 840,
    x: 250, y: 140, width: 560, depth: 0.5,
    alt: "A polar bear setting the keystone of a rust-coloured bridge on the middle island.",
  },
  win: {
    src: "/assets/art/island-win.webp", w: 440, h: 470,
    x: 0, y: 545, width: 410, depth: 1,
    alt: "The near island, with a ramp rising toward the bridge.",
  },
};

/** Where each island's surface sits, in box units: the route's stops. */
export const STOPS: Record<IslandId, { x: number; y: number }> = {
  win: { x: 175, y: 800 },
  run: { x: 560, y: 452 },
  see: { x: 875, y: 205 },
};

/**
 * The climbing route, win → run → see: up Win's ramp to the keystone under the
 * bear's paws, along the deck, then up past the bear's back to See.
 */
export const ROUTE =
  "M 175 800 C 250 770 320 640 400 560 C 450 510 500 468 560 452 C 640 440 770 478 838 466 C 884 420 892 290 875 205";

/** Label anchors, % of the scene box, and which side of the anchor they sit on. */
export const PIECE_LABELS: Record<IslandId, { x: number; y: number; align: "start" | "center" | "end" }> = {
  win: { x: 9, y: 89, align: "start" },
  run: { x: 66, y: 89, align: "center" },
  see: { x: 93, y: -3, align: "end" },
};
