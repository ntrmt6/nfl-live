import { connectDB } from "@/lib/db";
import Game from "@/models/Game";
import { resolvePicksForGame } from "@/lib/resolvePicks";

const ESPN_TO_OUR_ABBR: Record<string, string> = {
  LA: "LAR",
  WSH: "WAS",
};

function mapAbbr(espnAbbr: string): string {
  return ESPN_TO_OUR_ABBR[espnAbbr] ?? espnAbbr;
}

interface EspnResult {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: "scheduled" | "live" | "final";
}

async function fetchEspnScoreboard(
  season?: number,
  week?: number,
  seasonType = 2 // 1=pre, 2=regular, 3=post
): Promise<EspnResult[]> {
  const params = new URLSearchParams();
  if (season && week) {
    params.set("dates", String(season));
    params.set("seasontype", String(seasonType));
    params.set("week", String(week));
  }
  const qs = params.toString();
  const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];

  const data = await res.json();
  const results: EspnResult[] = [];

  for (const event of data.events ?? []) {
    const comp = event.competitions?.[0];
    if (!comp) continue;

    const typeName: string = comp.status?.type?.name ?? "";
    let status: EspnResult["status"];
    if (typeName === "STATUS_FINAL" || typeName === "STATUS_FINAL_OVERTIME") {
      status = "final";
    } else if (
      typeName === "STATUS_IN_PROGRESS" ||
      typeName === "STATUS_END_PERIOD" ||
      typeName === "STATUS_OVERTIME" ||
      typeName === "STATUS_HALFTIME"
    ) {
      status = "live";
    } else {
      status = "scheduled";
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
    results.push({ homeTeam, awayTeam, homeScore, awayScore, status });
  }

  return results;
}

export interface SyncSummary {
  scanned: number;
  updated: number;
  finalized: string[];
}

/**
 * Sync a specific (season, week). If omitted, syncs the current ESPN scoreboard.
 * Also sweeps all games whose kickoff is in the past and status != final.
 */
export async function syncResults(opts: {
  season?: number;
  week?: number;
  seasonType?: number;
} = {}): Promise<SyncSummary> {
  await connectDB();

  const summary: SyncSummary = { scanned: 0, updated: 0, finalized: [] };

  // 1. Fetch scoreboard for the requested (or current) week
  const primaryResults = await fetchEspnScoreboard(
    opts.season,
    opts.week,
    opts.seasonType
  );

  // 2. Find stale games in DB: kickoff in the past AND not yet final
  const staleGames = await Game.find({
    kickoff: { $lt: new Date() },
    status: { $ne: "final" },
  }).lean();

  summary.scanned = staleGames.length;

  // Build a lookup keyed by "AWAY-HOME"
  const byKey = new Map<string, EspnResult>();
  for (const r of primaryResults) {
    byKey.set(`${r.awayTeam}-${r.homeTeam}`, r);
  }

  // For each stale game not covered by the primary fetch, pull its (season, week) scoreboard
  const extraWeeks = new Set<string>();
  for (const g of staleGames) {
    const key = `${g.awayTeam}-${g.homeTeam}`;
    if (byKey.has(key)) continue;
    extraWeeks.add(`${g.season}:${g.week}`);
  }

  for (const wk of extraWeeks) {
    const [seasonStr, weekStr] = wk.split(":");
    const extra = await fetchEspnScoreboard(
      parseInt(seasonStr, 10),
      parseInt(weekStr, 10)
    );
    for (const r of extra) {
      byKey.set(`${r.awayTeam}-${r.homeTeam}`, r);
    }
  }

  // 3. Apply updates
  for (const g of staleGames) {
    const key = `${g.awayTeam}-${g.homeTeam}`;
    const result = byKey.get(key);
    if (!result) continue;
    if (result.status === "scheduled") continue;

    const patch: Record<string, unknown> = {
      status: result.status,
      homeScore: result.homeScore,
      awayScore: result.awayScore,
    };

    await Game.updateOne({ _id: g._id }, { $set: patch });
    summary.updated += 1;

    if (result.status === "final") {
      summary.finalized.push(g.slug);
      resolvePicksForGame(g.slug).catch(() => {});
    }
  }

  return summary;
}
