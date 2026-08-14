import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { getGameBySlug } from "@/lib/data/games"
import { getPredictionForGame } from "@/lib/data/predictions"
import { getTeam } from "@/lib/teams"
import { connectDB } from "@/lib/db"
import Post from "@/models/Post"
import { pingIndexNow } from "@/lib/indexnow"
import { absoluteUrl } from "@/lib/utils"

export const maxDuration = 60

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || ""
  const token = authHeader.replace("Bearer ", "")
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { gameSlug } = await req.json()
  if (!gameSlug) {
    return NextResponse.json({ error: "gameSlug is required" }, { status: 400 })
  }

  const game = await getGameBySlug(gameSlug)
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 })
  }

  if (game.status !== "final") {
    return NextResponse.json(
      { error: "Game is not final yet" },
      { status: 422 }
    )
  }

  const prediction = await getPredictionForGame(
    game.homeTeam,
    game.awayTeam,
    game.week,
    game.season
  )

  const home = getTeam(game.homeTeam)
  const away = getTeam(game.awayTeam)

  const predictedWinnerFull =
    prediction?.predictedWinner === game.homeTeam ? home.name : away.name
  const confidence = prediction?.confidence?.toFixed(0) ?? "unknown"

  const client = new Anthropic()

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: "You are an NFL sports writer. Write factual, engaging game recaps.",
    messages: [
      {
        role: "user",
        content: `Write a 200-word NFL game recap for: ${game.awayTeamFull} ${game.awayScore ?? 0} @ ${game.homeTeamFull} ${game.homeScore ?? 0}, Week ${game.week} ${game.season}. Our model predicted ${predictedWinnerFull} with ${confidence}% confidence. Focus on: accuracy of prediction, key scoring moments, and what this result means for playoff standings.`,
      },
    ],
  })

  const recapText =
    message.content[0].type === "text" ? message.content[0].text : ""

  const title = `${game.awayTeamFull} vs ${game.homeTeamFull} Week ${game.week} ${game.season} Game Recap`
  const baseSlug = slugify(title)
  const uniqueSlug = `${baseSlug}-${Date.now()}`

  await connectDB()
  const post = await Post.create({
    slug: uniqueSlug,
    title,
    excerpt: `Week ${game.week} recap: ${game.awayTeamFull} ${game.awayScore} vs ${game.homeTeamFull} ${game.homeScore}. Our model ${prediction?.predictedWinner ? "called it" : "had no prediction"}.`,
    content: `<p>${recapText.replace(/\n\n/g, "</p><p>").replace(/\n/g, " ")}</p>`,
    author: "NFLPredicts Model",
    tags: [game.awayTeamFull, game.homeTeamFull, "Game Recap", `Week ${game.week}`, `${game.season} NFL Season`],
    published: true,
    metaTitle: title,
    metaDescription: `${game.awayTeamFull} ${game.awayScore} vs ${game.homeTeamFull} ${game.homeScore} — Week ${game.week} ${game.season} NFL game recap with prediction accuracy analysis.`,
  })

  pingIndexNow([
    absoluteUrl(`/blog/${uniqueSlug}`),
    absoluteUrl(`/blog`),
    absoluteUrl(`/games/${game.slug}`),
  ]).catch(() => {})
  void post;

  return NextResponse.json({ success: true, slug: uniqueSlug })
}
