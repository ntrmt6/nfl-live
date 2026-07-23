import { MongoClient } from "mongodb";
import { createHash } from "crypto";

const MONGODB_URI =
  "mongodb://nfladmin:1596%40%23@127.0.0.1:27017/nfl-live?authSource=nfl-live";

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const title =
  "Offseason Silence: Why There Is No Sunday Night Football Tonight and What's Next for NFL Fans";
const slug = slugify(title);

const content = `
<p>If you turned on your TV expecting the iconic <em>Sunday Night Football</em> anthem and a high-stakes primetime matchup, you might be wondering why the field is quiet tonight.</p>

<p>Simply put: <strong>There is no Sunday Night Football game tonight.</strong></p>

<p>The NFL calendar is currently in the heart of mid-summer, placing teams right in the middle of offseason conditioning and early training camps. While players are reporting to facilities, putting in reps, and competing for roster spots, official game action is still around the corner.</p>

<hr />

<h2>When Does NFL Action Return?</h2>

<p>While the regular season is still a few weeks out, football action is set to resume very soon. Here are the key dates to mark on your calendar for the return of NFL football:</p>

<h3>1. The Preseason Opener: Hall of Fame Game</h3>
<ul>
  <li><strong>Date &amp; Time:</strong> Thursday, August 6, 2026 | 8:00 PM ET</li>
  <li><strong>Matchup:</strong> Arizona Cardinals vs. Carolina Panthers</li>
  <li><strong>Location:</strong> Tom Benson Hall of Fame Stadium (Canton, Ohio)</li>
  <li><strong>What to Expect:</strong> The traditional kickoff to the NFL preseason accompanying the Enshrinement Week activities in Canton. Expect to see young talent, rookie quarterbacks, and players fighting for the final spots on the 53-man roster.</li>
</ul>

<hr />

<h3>2. The Official Return of Sunday Night Football</h3>
<ul>
  <li><strong>Date &amp; Time:</strong> Sunday, September 13, 2026 | 8:20 PM ET (NBC)</li>
  <li><strong>Matchup:</strong> Dallas Cowboys at New York Giants</li>
  <li><strong>What to Expect:</strong> The regular-season debut of <em>Sunday Night Football</em> features a classic NFC East rivalry. Primetime under the lights at MetLife Stadium, bringing back full-intensity regular-season football to close out Week 1.</li>
</ul>

<hr />

<h2>What to Track in the Meantime</h2>

<p>While waiting for kickoff, the offseason provides plenty of storylines to follow across training camps:</p>

<ul>
  <li><strong>Positional Battles:</strong> Key competitions for starting positions and depth roles across all 32 teams.</li>
  <li><strong>Rookie Progress:</strong> Early looks at draft picks adapting to professional systems and speed.</li>
  <li><strong>Injury Updates:</strong> Tracking star players recovering from offseason surgeries as they prepare for Week 1 availability.</li>
</ul>

<p>Stay tuned—live football action is just around the corner!</p>
`.trim();

const excerpt =
  "No Sunday Night Football tonight? Here's why the field is quiet and the exact dates when NFL action returns — including the Hall of Fame Game and the Week 1 SNF opener.";

const tags = [
  "Sunday Night Football",
  "NFL Offseason",
  "NFL Schedule",
  "Hall of Fame Game",
  "NFL 2026",
  "Training Camp",
];

const metaTitle =
  "No Sunday Night Football Tonight? Here's When the NFL Returns | NFL Predictions Hub";
const metaDescription =
  "No SNF game tonight — the NFL is in its offseason. Find out when football returns, including the Hall of Fame Game on August 6 and the Week 1 Sunday Night Football matchup on September 13.";

const schemaMarkup = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description: metaDescription,
  author: { "@type": "Organization", name: "NFL Predictions Hub" },
  publisher: {
    "@type": "Organization",
    name: "NFL Predictions Hub",
    url: "https://nflpredicts.com",
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `https://nflpredicts.com/blog/${slug}`,
  },
  about: [
    { "@type": "Thing", name: "Sunday Night Football" },
    { "@type": "Thing", name: "NFL Offseason" },
    { "@type": "SportsOrganization", name: "National Football League" },
  ],
});

const client = new MongoClient(MONGODB_URI);

try {
  await client.connect();
  const db = client.db("nfl-live");
  const posts = db.collection("posts");

  let finalSlug = slug;
  const existing = await posts.findOne({ slug: finalSlug });
  if (existing) {
    const suffix = createHash("md5").update(title).digest("hex").slice(0, 6);
    finalSlug = `${slug}-${suffix}`;
    console.log(`Slug collision — using: ${finalSlug}`);
  }

  const now = new Date();
  const doc = {
    slug: finalSlug,
    title,
    excerpt,
    content,
    coverImage: "",
    author: "NFL Predictions Hub Staff",
    tags,
    published: true,
    metaTitle,
    metaDescription,
    schemaMarkup,
    createdAt: now,
    updatedAt: now,
  };

  const result = await posts.insertOne(doc);
  console.log("Post created:", result.insertedId.toString());
  console.log("Slug:", finalSlug);
  console.log("URL: https://nflpredicts.com/blog/" + finalSlug);
} finally {
  await client.close();
}
