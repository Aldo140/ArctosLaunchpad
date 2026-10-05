/**
 * Hero A data. Every position is a percentage of the stage so the DOM cards and
 * the drawn routes share one coordinate system at any size. "d" is the desktop
 * composition, "m" the mobile one — they are different layouts, not one layout
 * scaled, so each fragment carries both.
 *
 * Filenames are the genuine mess of a recurring-work reporting week. None of
 * them, and nothing on the plate they feed, carries a number that could be read
 * as a result.
 */

export type Pt = [number, number];

export type Layout = {
  /** centre of the card, % of stage */
  x: number;
  y: number;
  /** resting rotation while it is still a loose file, degrees */
  r: number;
  /** card width, % of stage */
  w: number;
  /** drawn route from the card's centre to the plate edge, % of stage */
  route: Pt[];
};

export type Fragment = {
  id: string;
  name: string;
  kind: "xlsx" | "csv";
  /** which cells of the little grid are filled, as a row pattern */
  cells: number[];
  d: Layout;
  m: Layout;
};

/* Desktop plate: left 57%, top 40%, right 0, bottom 0 of the stage.
   Mobile plate: left 0, right 0, top 50%, bottom 0. */
export const FRAGMENTS: Fragment[] = [
  {
    id: "campaign",
    name: "Campaign_Report (2).xlsx",
    kind: "xlsx",
    cells: [3, 2, 3, 1],
    d: { x: 77, y: 18, r: -5, w: 15, route: [[77, 18], [93, 18], [93, 52]] },
    m: { x: 27, y: 8, r: -6, w: 44, route: [[27, 8], [3, 8], [3, 47]] },
  },
  {
    id: "signups",
    name: "signups_FINAL.csv",
    kind: "csv",
    cells: [2, 3, 2, 2],
    d: { x: 89, y: 33, r: 5, w: 14, route: [[89, 33], [97, 33], [97, 52]] },
    m: { x: 73, y: 11, r: 5, w: 44, route: [[73, 11], [97, 11], [97, 47]] },
  },
  {
    id: "codes",
    name: "Event codes — Aug.xlsx",
    kind: "xlsx",
    cells: [3, 3, 1, 2],
    d: { x: 46, y: 63, r: 4, w: 15, route: [[46, 63], [56, 63]] },
    m: { x: 73, y: 25, r: -4, w: 44, route: [[73, 25], [97, 25]] },
  },
  {
    id: "copy",
    name: "Copy of Monday report.xlsx",
    kind: "xlsx",
    cells: [2, 2, 3, 3],
    d: { x: 48, y: 76, r: -6, w: 16, route: [[48, 76], [56, 76]] },
    m: { x: 27, y: 23, r: 4, w: 44, route: [[27, 23], [3, 23]] },
  },
  {
    id: "qr",
    name: "QR scans export (1).csv",
    kind: "csv",
    cells: [3, 1, 2, 3],
    d: { x: 45, y: 89, r: 3, w: 15, route: [[45, 89], [56, 89]] },
    m: { x: 73, y: 38, r: 6, w: 44, route: [[73, 38], [97, 38]] },
  },
  {
    id: "ads",
    name: "ads_export_final_v2.csv",
    kind: "csv",
    cells: [1, 3, 3, 2],
    d: { x: 60, y: 25, r: 6, w: 14, route: [[60, 25], [93, 25]] },
    m: { x: 27, y: 37, r: -5, w: 44, route: [[27, 37], [3, 37]] },
  },
];

export const TILES = [
  { label: "Signups", w: 46 },
  { label: "Paying customers", w: 38 },
  { label: "Blended conversion", w: 54 },
  { label: "12-month value", w: 62 },
];

export const COLS = ["Code", "Channel", "Signups", "Paying", "Conv. %", "Avg value"];

export const ROWS: number[][] = [
  [88, 44, 52, 40, 58, 64],
  [76, 44, 40, 34, 50, 56],
  [92, 44, 46, 30, 44, 60],
];

export const PROOF = [
  { label: "Calgary Watch", href: "/work/calgary-watch" },
  { label: "True North Kromes", href: "/work/true-north-kromes" },
  { label: "Rio Alto", href: "/work/rio-alto" },
  { label: "Starlings", href: "/work/starlings-support-map" },
];
