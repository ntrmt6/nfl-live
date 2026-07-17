import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import slugify from "slugify";
import { connectDB } from "@/lib/db";
import Game from "@/models/Game";
import Post from "@/models/Post";

export const maxDuration = 300;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildPrompt(game: {
  awayTeamFull: string;
  homeTeamFull: string;
  awayTeam: string;
  homeTeam: string;
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

async function generatePostContent(game: {
  awayTeamFull: string;
  homeTeamFull: string;
  awayTeam: string;
  homeTeam: string;
  week: number;
  season: number;
  kickoff: Date;
  venue?: string;
  network?: string;
}): Promise<{ title: string; excerpt: string; content: string; metaTitle: string; metaDescription: string; tags: string[] }> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    messages: [{ role: "user", content: buildPrompt(game) }],
  });

  const content = (response.content[0] as { type: string; text: string }).text.trim();

  const title = `${game.awayTeamFull} vs ${game.homeTeamFull}: Week ${game.week} Matchup Preview & Predictions`;
  const excerpt = `Complete Week ${game.week} preview for ${game.awayTeamFull} at ${game.homeTeamFull}. Team analysis, key players to watch, head-to-head history, and our final score prediction for the ${game.season} NFL season.`;
  const metaTitle = `${game.awayTeamFull} vs ${game.homeTeamFull} Week ${game.week} Preview | NFL Predictions Hub`;
  const metaDescription = `${game.awayTeamFull} at ${game.homeTeamFull} — Week ${game.week} matchup preview with predictions, key players, and analysis for the ${game.season} NFL season.`;
  const tags = [
    game.awayTeamFull,
    game.homeTeamFull,
    `Week ${game.week}`,
    "Matchup Preview",
    "NFL Predictions",
    `${game.season} NFL Season`,
    "NFL Analysis",
  ];

  return { title, excerpt, content, metaTitle, metaDescription, tags };
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set in environment" }, { status: 500 });
  }

  const { week, season, overwrite = false } = await req.json();

  await connectDB();

  const query: Record<string, unknown> = { status: "scheduled" };
  if (week) query.week = Number(week);
  if (season) query.season = Number(season);

  const games = await Game.find(query).sort({ kickoff: 1 }).lean();

  if (games.length === 0) {
    return NextResponse.json({ message: "No scheduled games found for the given filters", created: 0, skipped: 0 });
  }

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const game of games) {
    const baseSlug = slugify(
      `${game.awayTeamFull}-vs-${game.homeTeamFull}-week-${game.week}-${game.season}-preview`,
      { lower: true, strict: true }
    );

    const existing = await Post.exists({ slug: baseSlug });
    if (existing && !overwrite) {
      skipped++;
      continue;
    }

    try {
      const { title, excerpt, content, metaTitle, metaDescription, tags } =
        await generatePostContent(game);

      const doc = {
        slug: baseSlug,
        title,
        excerpt,
        content,
        author: "NFL Predictions Hub Staff",
        tags,
        published: true,
        metaTitle,
        metaDescription,
      };

      if (existing && overwrite) {
        await Post.updateOne({ slug: baseSlug }, { $set: doc });
      } else {
        await Post.create(doc);
      }
      created++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${game.awayTeamFull} vs ${game.homeTeamFull}: ${msg}`);
    }
  }

  return NextResponse.json({
    message: `Done. ${created} posts created, ${skipped} skipped (already exist).`,
    created,
    skipped,
    total: games.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}

export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const week = searchParams.get("week");
  const season = searchParams.get("season");

  const query: Record<string, unknown> = { status: "scheduled" };
  if (week) query.week = Number(week);
  if (season) query.season = Number(season);

  const games = await Game.find(query).select("awayTeamFull homeTeamFull week season kickoff").sort({ week: 1, kickoff: 1 }).lean();

  const withStatus = await Promise.all(
    games.map(async (g) => {
      const slug = slugify(
        `${g.awayTeamFull}-vs-${g.homeTeamFull}-week-${g.week}-${g.season}-preview`,
        { lower: true, strict: true }
      );
      const hasPost = await Post.exists({ slug });
      return {
        awayTeam: g.awayTeamFull,
        homeTeam: g.homeTeamFull,
        week: g.week,
        season: g.season,
        kickoff: g.kickoff,
        hasPost: !!hasPost,
      };
    })
  );

  return NextResponse.json({ games: withStatus });
}
