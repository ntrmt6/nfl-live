import { NextRequest, NextResponse } from "next/server"
import { getGameBySlug } from "@/lib/data/games"
import { getPredictionForGame } from "@/lib/data/predictions"

export const dynamic = "force-dynamic"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const game = await getGameBySlug(slug)
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 })
  }

  const prediction = await getPredictionForGame(
    game.homeTeam,
    game.awayTeam,
    game.week,
    game.season
  )

  const embedCode = `<iframe src="${SITE_URL}/widget/${slug}" width="300" height="200" frameborder="0" scrolling="no" style="border:none;overflow:hidden"></iframe>`

  return NextResponse.json({ game, prediction, embedCode })
}
