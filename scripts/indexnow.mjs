/**
 * Tells IndexNow-enabled search engines (Bing, which also feeds ChatGPT search,
 * plus Yandex, Seznam and Naver) that pages changed, so they recrawl in hours
 * rather than weeks. Reads the live sitemap, so run it after a deploy:
 *
 *   node scripts/indexnow.mjs
 *
 * The key is public by design: IndexNow proves ownership by fetching
 * /<key>.txt from the site itself.
 */
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://arctoslaunchpad.com").replace(/\/$/, "");
const KEY = "9b4ade2a2cb44d2da04b25a8e2b63491";

const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urlList.length) throw new Error("No URLs found in the sitemap.");

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(SITE).host,
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList,
  }),
});
console.log(`IndexNow: submitted ${urlList.length} URLs, HTTP ${res.status}`);
if (!res.ok && res.status !== 202) process.exit(1);
