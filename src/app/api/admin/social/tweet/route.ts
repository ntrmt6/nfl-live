import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getGameBySlug } from "@/lib/data/games"
import { getPredictionForGame } from "@/lib/data/predictions"
import { getTeam } from "@/lib/teams"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

function oauthSign(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&")

  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join("&")

  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`
  return crypto.createHmac("sha1", signingKey).update(baseString).digest("base64")
}

function buildOAuthHeader(params: Record<string, string>): string {
  const parts = Object.keys(params)
    .filter((k) => k.startsWith("oauth_"))
    .map((k) => `${encodeURIComponent(k)}="${encodeURIComponent(params[k])}"`)
    .join(", ")
  return `OAuth ${parts}`
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || ""
  const token = authHeader.replace("Bearer ", "")
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { gameSlug, template = "prediction" } = body as {
    gameSlug: string
    template?: "prediction" | "live_update"
  }

  if (!gameSlug) {
    return NextResponse.json({ error: "gameSlug is required" }, { status: 400 })
  }

  const game = await getGameBySlug(gameSlug)
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 })
  }

  const prediction = await getPredictionForGame(
    game.homeTeam,
    game.awayTeam,
    game.week,
    game.season
  )

  const home = getTeam(game.homeTeam)
  const away = getTeam(game.awayTeam)
  const predictedWinner =
    prediction?.predictedWinner === game.homeTeam ? home.name : away.name
  const confidence = prediction?.confidence?.toFixed(0) ?? "N/A"
  const gameUrl = `${SITE_URL}/games/${game.slug}`

  let tweetText: string
  if (template === "live_update") {
    tweetText = `⚡ LIVE: Our model called ${predictedWinner} — and the game is proving us right!\nSee Week ${game.week} projections: ${SITE_URL}/predictions`
  } else {
    tweetText = `🏈 NFLPredicts model just locked in: ${away.name} vs ${home.name} (Week ${game.week})\n\n📊 ${predictedWinner} wins – ${confidence}% confidence\n🔗 Full breakdown: ${gameUrl}`
  }

  const apiKey = process.env.TWITTER_API_KEY
  const apiSecret = process.env.TWITTER_API_SECRET
  const accessToken = process.env.TWITTER_ACCESS_TOKEN
  const accessSecret = process.env.TWITTER_ACCESS_SECRET

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return NextResponse.json(
      { success: false, error: "Twitter credentials not configured" },
      { status: 503 }
    )
  }

  try {
    const twitterUrl = "https://api.twitter.com/2/tweets"
    const oauthTimestamp = Math.floor(Date.now() / 1000).toString()
    const oauthNonce = crypto.randomBytes(16).toString("hex")

    const oauthParams: Record<string, string> = {
      oauth_consumer_key: apiKey,
      oauth_nonce: oauthNonce,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: oauthTimestamp,
      oauth_token: accessToken,
      oauth_version: "1.0",
    }

    const signature = oauthSign(
      "POST",
      twitterUrl,
      oauthParams,
      apiSecret,
      accessSecret
    )
    oauthParams.oauth_signature = signature

    const authorizationHeader = buildOAuthHeader(oauthParams)

    const res = await fetch(twitterUrl, {
      method: "POST",
      headers: {
        Authorization: authorizationHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: tweetText }),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data?.detail || data?.title || "Twitter API error" },
        { status: res.status }
      )
    }

    return NextResponse.json({ success: true, tweetId: data?.data?.id })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    )
  }
}
