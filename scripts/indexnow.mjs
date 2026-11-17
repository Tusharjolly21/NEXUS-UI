/**
 * Tells IndexNow search engines (Bing, Yandex, Naver, Seznam and others) that pages are new or changed,
 * so they are crawled in hours instead of weeks. Google does not use IndexNow.
 *
 * The key below is public by design: the engines fetch https://www.nexus-ui.com/<key>.txt (it lives in
 * public/) to check that you own the site. Run this AFTER a deploy is live, never before, because the
 * engines fetch the pages as soon as they are told.
 *
 *   node scripts/indexnow.mjs                 # every URL in the live sitemap
 *   node scripts/indexnow.mjs --recent 14     # only sitemap URLs changed in the last 14 days (if lastmod is set)
 *   node scripts/indexnow.mjs <url> <url> ... # specific URLs
 */
const KEY = "3b15e2a62c7289dc82211e870268135f";
const HOST = "www.nexus-ui.com";
const ORIGIN = "https://" + HOST;

const args = process.argv.slice(2);
let urls = args.filter((a) => a.startsWith("http"));

if (urls.length === 0) {
  const xml = await (await fetch(ORIGIN + "/sitemap.xml")).text();
  const recentIdx = args.indexOf("--recent");
  const days = recentIdx >= 0 ? Number(args[recentIdx + 1]) : 0;
  const cutoff = days ? Date.now() - days * 86400000 : 0;
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = /<loc>([^<]+)<\/loc>/.exec(m[1])?.[1];
    const lastmod = /<lastmod>([^<]+)<\/lastmod>/.exec(m[1])?.[1];
    if (!loc) continue;
    if (cutoff && (!lastmod || Date.parse(lastmod) < cutoff)) continue;
    urls.push(loc);
  }
}

urls = [...new Set(urls)].filter((u) => new URL(u).host === HOST);
if (urls.length === 0) {
  console.log("No URLs to submit.");
  process.exit(0);
}

// The protocol allows 10,000 URLs per request.
for (let i = 0; i < urls.length; i += 10000) {
  const batch = urls.slice(i, i + 10000);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${ORIGIN}/${KEY}.txt`, urlList: batch }),
  });
  console.log(`IndexNow: ${batch.length} URLs -> HTTP ${res.status} ${res.statusText}`);
}
