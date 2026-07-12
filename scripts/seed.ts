import "dotenv/config";
import mongoose from "mongoose";
import slugify from "slugify";
import Game from "../src/models/Game";
import Post from "../src/models/Post";

const MONGODB_URI = process.env.MONGODB_URI;
const DEFAULT_AFFILIATE_URL =
  process.env.DEFAULT_AFFILIATE_URL || "https://example.com/affiliate-offer";

async function seed() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set. Add it to .env.local before seeding.");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const now = new Date();
  const season = now.getFullYear();

  const sampleGames = [
    {
      week: 1,
      awayTeam: "KC",
      awayTeamFull: "Kansas City Chiefs",
      homeTeam: "BAL",
      homeTeamFull: "Baltimore Ravens",
      venue: "M&T Bank Stadium",
      network: "NBC",
      daysFromNow: 3,
      hour: 20,
    },
    {
      week: 1,
      awayTeam: "GB",
      awayTeamFull: "Green Bay Packers",
      homeTeam: "PHI",
      homeTeamFull: "Philadelphia Eagles",
      venue: "Lincoln Financial Field",
      network: "FOX",
      daysFromNow: 4,
      hour: 13,
    },
    {
      week: 1,
      awayTeam: "SF",
      awayTeamFull: "San Francisco 49ers",
      homeTeam: "DAL",
      homeTeamFull: "Dallas Cowboys",
      venue: "AT&T Stadium",
      network: "CBS",
      daysFromNow: 4,
      hour: 16,
    },
    {
      week: 2,
      awayTeam: "BUF",
      awayTeamFull: "Buffalo Bills",
      homeTeam: "MIA",
      homeTeamFull: "Miami Dolphins",
      venue: "Hard Rock Stadium",
      network: "CBS",
      daysFromNow: 10,
      hour: 13,
    },
    {
      week: 2,
      awayTeam: "DET",
      awayTeamFull: "Detroit Lions",
      homeTeam: "SEA",
      homeTeamFull: "Seattle Seahawks",
      venue: "Lumen Field",
      network: "FOX",
      daysFromNow: 11,
      hour: 16,
    },
    {
      week: 3,
      awayTeam: "NYJ",
      awayTeamFull: "New York Jets",
      homeTeam: "NE",
      homeTeamFull: "New England Patriots",
      venue: "Gillette Stadium",
      network: "ESPN",
      daysFromNow: 17,
      hour: 20,
    },
  ];

  for (const g of sampleGames) {
    const kickoff = new Date(now);
    kickoff.setDate(kickoff.getDate() + g.daysFromNow);
    kickoff.setHours(g.hour, 0, 0, 0);

    const baseSlug = slugify(`${g.awayTeamFull}-at-${g.homeTeamFull}-week-${g.week}`, {
      lower: true,
      strict: true,
    });

    await Game.findOneAndUpdate(
      { slug: baseSlug },
      {
        slug: baseSlug,
        season,
        week: g.week,
        homeTeam: g.homeTeam,
        awayTeam: g.awayTeam,
        homeTeamFull: g.homeTeamFull,
        awayTeamFull: g.awayTeamFull,
        venue: g.venue,
        network: g.network,
        kickoff,
        status: "scheduled",
        affiliateUrl: DEFAULT_AFFILIATE_URL,
        viewerCountBase: 8000 + Math.floor(Math.random() * 20000),
        featured: g.week === 1,
      },
      { upsert: true, new: true }
    );
  }

  console.log(`Seeded ${sampleGames.length} games`);

  const samplePosts = [
    {
      title: "Week 1 Preview: Five Storylines to Watch",
      excerpt:
        "From quarterback debuts to division rivalries, here's everything fans need to know heading into Week 1.",
      content:
        "<p>The new season kicks off with several fascinating storylines across the league. From new head coaching hires to returning MVPs, Week 1 sets the tone for the months ahead.</p><h2>1. New Coaching Systems</h2><p>Several franchises enter the season under new offensive schemes, and early execution will be worth tracking closely.</p><h2>2. Division Rivalries Renewed</h2><p>Long-standing rivalries kick off right away, giving fans classic early-season drama.</p>",
      tags: ["Preview", "Week 1"],
      published: true,
    },
    {
      title: "How to Follow Every Game This Season",
      excerpt:
        "A simple guide to tracking kickoff times, networks, and live coverage for every matchup.",
      content:
        "<p>Keeping up with a packed NFL schedule can be tricky. Here's how to make the most of our schedule dashboard to never miss a kickoff.</p><h2>Filter by Team</h2><p>Use the team filter on our homepage to instantly see every game on your favorite team's schedule.</p>",
      tags: ["Guide"],
      published: true,
    },
  ];

  for (const p of samplePosts) {
    const baseSlug = slugify(p.title, { lower: true, strict: true });
    await Post.findOneAndUpdate(
      { slug: baseSlug },
      { ...p, slug: baseSlug, author: "NFL Live Zone Staff" },
      { upsert: true, new: true }
    );
  }

  console.log(`Seeded ${samplePosts.length} blog posts`);

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
