export interface LeaderStat {
  category: string;
  player: string;
  value: string;
  teamSide: "home" | "away";
}

export function extractLeaderStats(data: any): LeaderStat[] {
  const gameData = data.header?.competitions?.[0];
  const home = gameData?.competitors?.find((c: any) => c.homeAway === "home");
  const away = gameData?.competitors?.find((c: any) => c.homeAway === "away");
  const stats: LeaderStat[] = [];

  for (const cat of (data.leaders || []).slice(0, 6)) {
    const top = cat.leaders?.[0];
    if (!top) continue;
    const teamId = top.team?.id;
    stats.push({
      category: cat.displayName,
      player: top.athlete?.displayName || "Unknown",
      value: top.displayValue || "",
      teamSide: teamId === home?.team?.id ? "home" : "away",
    });
  }
  return stats;
}

function templateAnalysis(
  homeName: string, homeScore: number,
  awayName: string, awayScore: number,
  leaders: LeaderStat[], league: string
): string {
  const winner = homeScore > awayScore ? homeName : awayName;
  const loser = homeScore > awayScore ? awayName : homeName;
  const winScore = Math.max(homeScore, awayScore);
  const lossScore = Math.min(homeScore, awayScore);
  const margin = winScore - lossScore;
  const isClose = league === "nba" ? margin <= 8 : margin <= 1;
  const unit = league === "nba" ? "points" : league === "mlb" ? "runs" : "goals";

  const p1 = isClose
    ? `In a tightly contested game, the ${winner} edged past the ${loser} ${winScore}-${lossScore}, decided by just ${margin} ${unit} in a hard-fought battle.`
    : `The ${winner} delivered a dominant performance, defeating the ${loser} ${winScore}-${lossScore} by a ${margin}-${unit} margin.`;

  const topStr = leaders.slice(0, 3).map(l => `${l.player} (${l.value})`).join(", ");
  const p2 = topStr
    ? `Top performers on the night included ${topStr}. The ${winner} capitalized on key moments throughout the game to seal the result, while the ${loser} will regroup ahead of their next fixture.`
    : `The ${winner} executed their game plan effectively to secure this ${isClose ? "crucial" : "convincing"} victory.`;

  return `${p1} ${p2}`;
}

export async function generateGameAnalysis(
  espnSlug: string,
  gameId: string,
  league: string
): Promise<{ analysis: string; leaders: LeaderStat[] } | null> {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${espnSlug}/summary?event=${gameId}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();

    const gameData = data.header?.competitions?.[0];
    if (!gameData?.status?.type?.completed) return null;

    const home = gameData.competitors?.find((c: any) => c.homeAway === "home");
    const away = gameData.competitors?.find((c: any) => c.homeAway === "away");
    if (!home || !away) return null;

    const homeScore = parseInt(home.score || "0");
    const awayScore = parseInt(away.score || "0");
    const homeName = home.team?.displayName || "Home";
    const awayName = away.team?.displayName || "Away";
    const leaders = extractLeaderStats(data);

    let analysis = "";

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const { default: Anthropic } = await import("@anthropic-ai/sdk");
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

        const leaderText = leaders.map(l => `${l.category}: ${l.player} (${l.value})`).join(", ");
        const message = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 300,
          messages: [{
            role: "user",
            content: `Write a concise 2-paragraph post-game analysis (under 140 words total) for this ${league.toUpperCase()} game.

Result: ${awayName} ${awayScore} @ ${homeName} ${homeScore} – FINAL
Top performers: ${leaderText || "unavailable"}

Paragraph 1: Game result and flow. Paragraph 2: Key performers and significance. Plain text only.`,
          }],
        });

        if (message.content[0]?.type === "text") {
          analysis = message.content[0].text.trim();
        }
      } catch {
        // fall through
      }
    }

    if (!analysis) {
      analysis = templateAnalysis(homeName, homeScore, awayName, awayScore, leaders, league);
    }

    return { analysis, leaders };
  } catch {
    return null;
  }
}
