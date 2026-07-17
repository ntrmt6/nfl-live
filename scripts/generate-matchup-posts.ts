/**
 * Generate AI-powered matchup preview posts for scheduled NFL games.
 *
 * Usage:
 *   npx tsx scripts/generate-matchup-posts.ts               # all scheduled games
 *   npx tsx scripts/generate-matchup-posts.ts --week 1      # Week 1 only
 *   npx tsx scripts/generate-matchup-posts.ts --week 1 --season 2026
 *   npx tsx scripts/generate-matchup-posts.ts --overwrite   # regenerate existing
 *
 * Requires ANTHROPIC_API_KEY in .env
 */

import "dotenv/config";
import mongoose from "mongoose";
import slugify from "slugify";
import Anthropic from "@anthropic-ai/sdk";
import Game from "../src/models/Game";
import Post from "../src/models/Post";

const MONGODB_URI = process.env.MONGODB_URI!;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error("❌  ANTHROPIC_API_KEY is not set in .env");
  process.exit(1);
}

const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// Parse CLI args
const args = process.argv.slice(2);
const weekArg = args.includes("--week") ? Number(args[args.indexOf("--week") + 1]) : null;
const seasonArg = args.includes("--season") ? Number(args[args.indexOf("--season") + 1]) : null;
const overwrite = args.includes("--overwrite");

function buildPrompt(game: {
  awayTeamFull: string;
  homeTeamFull: string;
  week: number;
  season: number;
  kickoff: Date;
  venue?: string;
  network?: string;
}): string {
  const kickoffStr = new Date(game.kickoff).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return `Write a detailed NFL matchup preview article for the following game. Return ONLY the HTML content (no <html>, <head>, <body>, or markdown — just inner HTML starting with <h2>).

Game: ${game.awayTeamFull} at ${game.homeTeamFull}
Week ${game.week}, ${game.season} NFL Season
Kickoff: ${kickoffStr}${game.venue ? `\nVenue: ${game.venue}` : ""}${game.network ? `\nNetwork: ${game.network}` : ""}

Structure the article with these sections using <h2> headings:
1. Game Overview — compelling intro paragraph setting the stakes
2. ${game.awayTeamFull} Outlook — team form, offensive and defensive identity, strengths/weaknesses
3. ${game.homeTeamFull} Outlook — same as above for the home team
4. Key Players to Watch — 2 players per team with <h3> for each name
5. Head-to-Head History — recent history and context between these franchises
6. Keys to the Game — 3 bullet points (<ul><li>) on what decides the outcome
7. Prediction — final score prediction with brief reasoning

Use <strong> for emphasis, <ul><li> for lists. Write ~900 words total. Make it engaging, specific, and analytically grounded. Reference real team tendencies, coaching styles, and scheme matchups. Do not include any disclaimer or note about AI generation.`;
}

async function generatePost(game: {
  awayTeamFull: string;
  homeTeamFull: string;
  awayTeam: string;
  homeTeam: string;
  week: number;
  season: number;
  kickoff: Date;
  venue?: string;
  network?: string;
}) {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    messages: [{ role: "user", content: buildPrompt(game) }],
  });

  const content = (response.content[0] as { type: string; text: string }).text.trim();

  return {
    slug: slugify(
      `${game.awayTeamFull}-vs-${game.homeTeamFull}-week-${game.week}-${game.season}-preview`,
      { lower: true, strict: true }
    ),
    title: `${game.awayTeamFull} vs ${game.homeTeamFull}: Week ${game.week} Matchup Preview & Predictions`,
    excerpt: `Complete Week ${game.week} preview for ${game.awayTeamFull} at ${game.homeTeamFull}. Team analysis, key players to watch, head-to-head history, and our final score prediction for the ${game.season} NFL season.`,
    content,
    author: "NFL Predictions Hub Staff",
    tags: [
      game.awayTeamFull,
      game.homeTeamFull,
      `Week ${game.week}`,
      "Matchup Preview",
      "NFL Predictions",
      `${game.season} NFL Season`,
      "NFL Analysis",
    ],
    published: true,
    metaTitle: `${game.awayTeamFull} vs ${game.homeTeamFull} Week ${game.week} Preview | NFL Predictions Hub`,
    metaDescription: `${game.awayTeamFull} at ${game.homeTeamFull} — Week ${game.week} matchup preview with predictions, key players, and analysis for the ${game.season} NFL season.`,
  };
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected to MongoDB");

  const query: Record<string, unknown> = { status: "scheduled" };
  if (weekArg) query.week = weekArg;
  if (seasonArg) query.season = seasonArg;

  const games = await Game.find(query).sort({ week: 1, kickoff: 1 }).lean();

  if (games.length === 0) {
    console.log("No scheduled games found for the given filters.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${games.length} scheduled game(s)${weekArg ? ` for Week ${weekArg}` : ""}.\n`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const game of games) {
    const label = `${game.awayTeamFull} @ ${game.homeTeamFull} (W${game.week})`;
    const slug = slugify(
      `${game.awayTeamFull}-vs-${game.homeTeamFull}-week-${game.week}-${game.season}-preview`,
      { lower: true, strict: true }
    );

    const existing = await Post.exists({ slug });
    if (existing && !overwrite) {
      console.log(`  ⟳ skip  ${label}`);
      skipped++;
      continue;
    }

    process.stdout.write(`  ⟳ gen   ${label}…`);

    try {
      const doc = await generatePost(game);

      if (existing && overwrite) {
        await Post.updateOne({ slug }, { $set: doc });
        process.stdout.write(" updated\n");
      } else {
        await Post.create(doc);
        process.stdout.write(" created\n");
      }
      created++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stdout.write(` FAILED: ${msg}\n`);
      failed++;
    }
  }

  console.log(`\n✓ Done: ${created} created, ${skipped} skipped, ${failed} failed.`);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
