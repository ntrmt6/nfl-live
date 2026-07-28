import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pick from "@/models/Pick";
import { buildLeaderboard } from "@/lib/leaderboard";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const seasonParam = searchParams.get("season");
  const season = seasonParam ? Number(seasonParam) : undefined;

  const seasons: number[] = (await Pick.distinct("season")).sort((a: number, b: number) => b - a);
  const leaderboard = await buildLeaderboard(season ? { season } : {});

  return NextResponse.json({ leaderboard, seasons, season: season ?? null });
}
