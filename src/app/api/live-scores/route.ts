import { NextResponse } from "next/server";
import type { LiveGameScore } from "@/types";

// ESPN uses different abbreviations for a few teams
const ESPN_TO_OUR_ABBR: Record<string, string> = {
  LA: "LAR",   // LA Rams → LAR
  WSH: "WAS",  // Washington → WAS
};

function mapAbbr(espnAbbr: string): string {
  return ESPN_TO_OUR_ABBR[espnAbbr] ?? espnAbbr;
}

export async function GET() {
  try {
    const res = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",
      { next: { revalidate: 30 } }
    );

    if (!res.ok) {
      return NextResponse.json({ games: [] });
    }

    const data = await res.json();
    const games: LiveGameScore[] = [];

    for (const event of data.events ?? []) {
      const comp = event.competitions?.[0];
      if (!comp) continue;

      const typeName: string = comp.status?.type?.name ?? "";
      const period: number = comp.status?.period ?? 0;
      const displayClock: string = comp.status?.displayClock ?? "";
      const shortDetail: string = comp.status?.type?.shortDetail ?? "";

      let status: LiveGameScore["status"];
      let statusText: string;

      if (typeName === "STATUS_HALFTIME") {
        status = "halftime";
        statusText = "Halftime";
      } else if (
        typeName === "STATUS_IN_PROGRESS" ||
        typeName === "STATUS_END_PERIOD" ||
        typeName === "STATUS_OVERTIME"
      ) {
        status = "live";
        const periodLabel =
          period <= 4 ? `Q${period}` : period === 5 ? "OT" : `OT${period - 4}`;
        statusText = `${periodLabel} ${displayClock}`.trim();
      } else if (
        typeName === "STATUS_FINAL" ||
        typeName === "STATUS_FINAL_OVERTIME"
      ) {
        status = "final";
        statusText = typeName === "STATUS_FINAL_OVERTIME" ? "Final/OT" : "Final";
      } else {
        status = "scheduled";
        statusText = shortDetail;
      }

      let homeTeam = "";
      let awayTeam = "";
      let homeScore = 0;
      let awayScore = 0;

      for (const competitor of comp.competitors ?? []) {
        const abbr = mapAbbr(competitor.team?.abbreviation ?? "");
        const score = parseInt(competitor.score ?? "0", 10) || 0;
        if (competitor.homeAway === "home") {
          homeTeam = abbr;
          homeScore = score;
        } else {
          awayTeam = abbr;
          awayScore = score;
        }
      }

      if (!homeTeam || !awayTeam) continue;

      games.push({
        key: `${awayTeam}-${homeTeam}`,
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        status,
        period,
        clock: displayClock,
        statusText,
      });
    }

    return NextResponse.json(
      { games },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
    );
  } catch {
    return NextResponse.json({ games: [] });
  }
}
