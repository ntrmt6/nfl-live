import { NextRequest, NextResponse } from "next/server";
import { generateGameAnalysis } from "@/lib/game-analysis";

const LEAGUE_SLUGS: Record<string, string> = {
  nba:    "basketball/nba",
  ncaab:  "basketball/mens-college-basketball",
  epl:    "soccer/eng.1",
  laliga: "soccer/esp.1",
  ucl:    "soccer/UEFA.CHAMPIONS",
  mls:    "soccer/usa.1",
  seriea: "soccer/ita.1",
  bundes: "soccer/ger.1",
  mlb:    "baseball/mlb",
  nhl:    "hockey/nhl",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ league: string; gameId: string }> }
) {
  const { league, gameId } = await params;
  const espnSlug = LEAGUE_SLUGS[league];
  if (!espnSlug) {
    return NextResponse.json({ error: "Unknown league" }, { status: 400 });
  }

  const result = await generateGameAnalysis(espnSlug, gameId, league);
  if (!result) {
    return NextResponse.json({ error: "Game not complete or not found" }, { status: 404 });
  }

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
