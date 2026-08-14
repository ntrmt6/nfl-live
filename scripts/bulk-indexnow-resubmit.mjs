// Bulk-submit every URL from the live sitemap to IndexNow.
// Bing + Yandex + Seznam consume this feed. Google reads it as a crawl signal.
// Run AFTER a deploy so the sitemap is fresh.
//
// Usage:  node scripts/bulk-indexnow-resubmit.mjs
// Optional env override:  SITE_URL=https://xxx INDEXNOW_KEY=xxx node scripts/bulk-indexnow-resubmit.mjs

const SITE_URL = process.env.SITE_URL || "https://nflpredicts.com";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "0a11bb868a963526e1544381025c2019";

async function fetchSitemapUrls() {
  const res = await fetch(`${SITE_URL}/sitemap.xml`);
  const xml = await res.text();
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return [...new Set(matches)];
}

async function submit(urls) {
  const host = new URL(SITE_URL).hostname;
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    }),
  });
  return res.status;
}

async function main() {
  console.log(`Fetching sitemap from ${SITE_URL}/sitemap.xml ...`);
  const urls = await fetchSitemapUrls();
  console.log(`Sitemap contains ${urls.length} unique URLs.`);

  const chunkSize = 10000; // IndexNow max is 10,000 per request
  for (let i = 0; i < urls.length; i += chunkSize) {
    const chunk = urls.slice(i, i + chunkSize);
    const status = await submit(chunk);
    console.log(`Chunk ${Math.floor(i / chunkSize) + 1}: ${chunk.length} URLs → HTTP ${status}`);
  }

  console.log(`Verifying keyfile: ${SITE_URL}/${INDEXNOW_KEY}.txt`);
  const kf = await fetch(`${SITE_URL}/${INDEXNOW_KEY}.txt`);
  console.log(`Keyfile HTTP ${kf.status} (${await kf.text().then((t) => t.trim())})`);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
