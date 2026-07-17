import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pick from "@/models/Pick";
import Game from "@/models/Game";
import { getCurrentUser } from "@/lib/user-auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { gameSlug, choice } = await req.json();
  if (!gameSlug || (choice !== "home" && choice !== "away")) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await connectDB();

  const game = await Game.findOne({ slug: gameSlug }).lean();
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

  if (game.status !== "scheduled") {
    return NextResponse.json({ error: "Picks are locked once a game starts" }, { status: 400 });
  }

  const pick = await Pick.findOneAndUpdate(
    { userId: user.userId, gameSlug },
    {
      $set: {
        userId: user.userId,
        username: user.username,
        gameSlug,
        choice,
        season: game.season,
        week: game.week,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        homeTeamFull: game.homeTeamFull,
        awayTeamFull: game.awayTeamFull,
      },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ pick });
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const season = searchParams.get("season");
  const gameSlug = searchParams.get("gameSlug");

  await connectDB();

  const query: Record<string, unknown> = { userId: user.userId };
  if (season) query.season = Number(season);
  if (gameSlug) query.gameSlug = gameSlug;

  const picks = await Pick.find(query).sort({ createdAt: -1 }).limit(100).lean();
  const total = picks.length;
  const correct = picks.filter((p) => p.correct === true).length;
  const resolved = picks.filter((p) => p.correct !== undefined).length;

  // Compute current streak from most recent resolved picks
  let streak = 0;
  const resolvedPicks = picks.filter((p) => p.correct !== undefined);
  for (const p of resolvedPicks) {
    if (p.correct) streak++;
    else break;
  }

  return NextResponse.json({ picks, stats: { total, correct, resolved, streak } });
}
