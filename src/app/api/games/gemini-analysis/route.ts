import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectDB } from "@/lib/db";
import GameAnalysis from "@/models/GameAnalysis";
import Game from "@/models/Game";
import Prediction from "@/models/Prediction";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  await connectDB();

  // Return cached analysis if it exists
  const cached = await GameAnalysis.findOne({ slug }).lean();
  if (cached) return NextResponse.json({ analysis: cached });

  // Fetch game + prediction data
  const game = await Game.findOne({ slug }).lean();
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

  const prediction = await Prediction.findOne({
    homeTeam: game.homeTeam,
    awayTeam: game.awayTeam,
    week: game.week,
    season: game.season,
  }).lean();

  const kickoffDate = new Date(game.kickoff).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  const statsBlock = prediction
    ? `
ML Model Data:
- Predicted winner: ${prediction.predictedWinner} (${(prediction.confidence ?? 0).toFixed(0)}% confidence)
- ${game.homeTeamFull} win probability: ${((prediction.homeWinProbability ?? 0.5) * 100).toFixed(0)}%
- ${game.awayTeamFull} win probability: ${((prediction.awayWinProbability ?? 0.5) * 100).toFixed(0)}%
- ${game.homeTeamFull} stats (last 6 games): ${((prediction.homeTeamStats?.win_rate ?? 0) * 100).toFixed(0)}% win rate, ${prediction.homeTeamStats?.pts_for?.toFixed(1) ?? "N/A"} PPG, ${prediction.homeTeamStats?.pts_against?.toFixed(1) ?? "N/A"} PA/G
- ${game.awayTeamFull} stats (last 6 games): ${((prediction.awayTeamStats?.win_rate ?? 0) * 100).toFixed(0)}% win rate, ${prediction.awayTeamStats?.pts_for?.toFixed(1) ?? "N/A"} PPG, ${prediction.awayTeamStats?.pts_against?.toFixed(1) ?? "N/A"} PA/G`
    : "";

  const prompt = `You are an expert NFL analyst. Write a deep-dive analysis for this upcoming NFL game.

Game: ${game.awayTeamFull} (${game.awayTeam}) at ${game.homeTeamFull} (${game.homeTeam})
Week ${game.week}, ${game.season} NFL Season
Kickoff: ${kickoffDate}
Venue: ${game.venue || "TBD"}
Network: ${game.network || "TBD"}
${game.description ? `Context: ${game.description}` : ""}
${statsBlock}

Return a JSON object with exactly these fields (no markdown, pure JSON):
{
  "overview": "2-3 sentence compelling game preview that sets the stage",
  "keyMatchups": ["3 specific matchup battles to watch, each 1-2 sentences"],
  "offensiveBreakdown": "2-3 sentences analyzing both offenses — strengths, tendencies, what to expect",
  "defensiveBreakdown": "2-3 sentences analyzing both defenses — strengths, vulnerabilities, key stops",
  "xFactor": "1-2 sentences on the single biggest wildcard or storyline that could decide this game",
  "predictionNarrative": "2-3 sentences explaining the likely outcome and why, referencing the stats if available"
}

Be specific to these two teams. Use real NFL knowledge. Keep each section concise and insightful.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const json = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(json);

    const analysis = await GameAnalysis.create({
      slug,
      overview: parsed.overview,
      keyMatchups: parsed.keyMatchups,
      offensiveBreakdown: parsed.offensiveBreakdown,
      defensiveBreakdown: parsed.defensiveBreakdown,
      xFactor: parsed.xFactor,
      predictionNarrative: parsed.predictionNarrative,
      generatedAt: new Date(),
    });

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Gemini analysis error:", err);
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 });
  }
}
