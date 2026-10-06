// Runtime smoke test: build, lint and typecheck can't see a crash that only
// happens in a browser. Loads every route in the sitemap at phone and desktop
// size with motion ON (the path real visitors take), scrolls to the footer,
// and fails on any page error, console error, failed same-origin request or
// horizontal overflow.
//
//   npm run build && npm start &   then   npm run smoke
//   BASE_URL=http://localhost:3100 npm run smoke
import { chromium } from "playwright";

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const VIEWPORTS = [
  { name: "phone", width: 390, height: 844, mobile: true },
  { name: "desktop", width: 1440, height: 900, mobile: false },
];
const CONCURRENCY = 4;

const sitemap = await fetch(`${BASE}/sitemap.xml`).then((r) => {
  if (!r.ok) throw new Error(`sitemap.xml: HTTP ${r.status}`);
  return r.text();
});
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
if (!routes.length) throw new Error("sitemap.xml lists no routes");

const browser = await chromium.launch();
const failures = [];

async function check(route, vp) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    reducedMotion: "no-preference",
  });
  const page = await ctx.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
  page.on("response", (r) => {
    if (r.status() >= 400 && r.url().startsWith(BASE)) problems.push(`HTTP ${r.status()} ${r.url()}`);
  });
  try {
    const res = await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 45_000 });
    if (!res || res.status() >= 400) problems.push(`document HTTP ${res?.status()}`);
    await page.waitForTimeout(1200);
    // walk down the page so scroll-driven effects (and the footer) run
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      scrollTo(0, document.documentElement.scrollHeight);
    });
    await page.waitForTimeout(800);
    const state = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - innerWidth,
      main: !!document.querySelector("main"),
    }));
    if (!state.main) problems.push("no <main> rendered (app crashed?)");
    if (state.overflow > 1) problems.push(`horizontal overflow ${state.overflow}px`);
  } catch (e) {
    problems.push(`navigation: ${e.message}`);
  }
  await ctx.close();
  const tag = `${vp.name.padEnd(7)} ${route}`;
  if (problems.length) {
    failures.push({ tag, problems });
    console.log(`FAIL ${tag}\n  ${[...new Set(problems)].join("\n  ")}`);
  } else {
    console.log(`ok   ${tag}`);
  }
}

const jobs = routes.flatMap((route) => VIEWPORTS.map((vp) => () => check(route, vp)));
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let job = jobs.shift(); job; job = jobs.shift()) await job();
  }),
);
await browser.close();

console.log(`\n${routes.length} routes × ${VIEWPORTS.length} viewports, ${failures.length} failing`);
process.exit(failures.length ? 1 : 0);
