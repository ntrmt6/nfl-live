import "dotenv/config";
import mongoose from "mongoose";
import slugify from "slugify";
import Post from "../src/models/Post";
import Game from "../src/models/Game";

const MONGODB_URI = process.env.MONGODB_URI!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nflpredicts.com";

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const games = await Game.find({ season: 2026 }).lean() as any[];
  console.log(`Processing ${games.length} games…`);

  let updated = 0;

  for (const g of games) {
    const ogUrl = `${SITE_URL}/api/og/game?away=${g.awayTeam}&home=${g.homeTeam}&week=${g.week}`;

    // The article slug is built from the title:
    // "{awayFull} vs. {homeFull}: Week {N} Division Rivalry Preview"  → slugified
    // "{awayFull} vs. {homeFull}: Week {N} Matchup Preview & Analysis" → slugified
    // Both start with the slugified away team name
    const awaySlug = slugify(g.awayTeamFull, { lower: true, strict: true });
    const homeSlug = slugify(g.homeTeamFull, { lower: true, strict: true });
    const weekStr = `week-${g.week}`;

    const res = await Post.updateMany(
      {
        slug: {
          $regex: `^${awaySlug}-vs.*${homeSlug}.*${weekStr}`,
        },
      },
      { $set: { coverImage: ogUrl } }
    );

    if (res.modifiedCount > 0) {
      updated += res.modifiedCount;
    } else {
      // Fallback: match by tags (both full team names must be in tags)
      const res2 = await Post.updateMany(
        { tags: { $all: [g.awayTeamFull, g.homeTeamFull] } },
        { $set: { coverImage: ogUrl } }
      );
      updated += res2.modifiedCount;
    }
  }

  // Also fix the old non-matchup posts that have empty or broken coverImages
  await Post.updateMany(
    { coverImage: { $in: ["", null] } },
    { $set: { coverImage: `${SITE_URL}/api/og/game?away=NFL&home=2026&week=1` } }
  );

  const withImages = await Post.countDocuments({ coverImage: { $regex: "api/og/game" } });
  console.log(`Done: ${updated} posts updated. ${withImages} posts now have OG images.`);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
