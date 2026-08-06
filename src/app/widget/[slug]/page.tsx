import { notFound } from "next/navigation"
import { getGameBySlug } from "@/lib/data/games"
import { getPredictionForGame } from "@/lib/data/predictions"
import { getTeam } from "@/lib/teams"
import { TeamLogo } from "@/components/ui/TeamLogo"

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const game = await getGameBySlug(slug)
  if (!game) return {}
  const home = getTeam(game.homeTeam)
  const away = getTeam(game.awayTeam)
  return {
    title: `${away.name} vs ${home.name} Prediction Widget`,
    robots: { index: false },
  }
}

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const game = await getGameBySlug(slug)
  if (!game) notFound()

  const prediction = await getPredictionForGame(
    game.homeTeam,
    game.awayTeam,
    game.week,
    game.season
  )

  const home = getTeam(game.homeTeam)
  const away = getTeam(game.awayTeam)

  const homeProb = Math.round((prediction?.homeWinProbability ?? 0.5) * 100)
  const awayProb = 100 - homeProb
  const winner = prediction?.predictedWinner
  const confidence = prediction?.confidence ?? 0

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0f0f0f;
            color: #f1f1f1;
            width: 300px;
            height: 200px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }
          .widget { padding: 14px; flex: 1; display: flex; flex-direction: column; gap: 10px; }
          .teams { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
          .team { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
          .team-name { font-size: 11px; font-weight: 600; text-align: center; }
          .vs { font-size: 12px; color: #888; font-weight: 700; }
          .bar-wrap { background: #222; border-radius: 6px; overflow: hidden; height: 8px; }
          .bar { height: 100%; background: linear-gradient(90deg, #3b82f6, #FF6200); border-radius: 6px; }
          .probs { display: flex; justify-content: space-between; font-size: 11px; }
          .pick { text-align: center; font-size: 12px; color: #FF6200; font-weight: 700; }
          .footer { background: #1a1a1a; padding: 6px 14px; text-align: center; border-top: 1px solid #333; }
          .footer a { color: #888; font-size: 10px; text-decoration: none; }
          .footer a:hover { color: #FF6200; }
          img { width: 36px; height: 36px; object-fit: contain; }
        `}</style>
      </head>
      <body>
        <div className="widget" style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: 1 }}>
              <TeamLogo abbr={away.abbr} size={36} />
              <span style={{ fontSize: "11px", fontWeight: 600, textAlign: "center" }}>{away.name}</span>
              <span style={{ fontSize: "13px", fontWeight: 700 }}>{awayProb}%</span>
            </div>
            <span style={{ fontSize: "12px", color: "#888", fontWeight: 700 }}>@</span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: 1 }}>
              <TeamLogo abbr={home.abbr} size={36} />
              <span style={{ fontSize: "11px", fontWeight: 600, textAlign: "center" }}>{home.name}</span>
              <span style={{ fontSize: "13px", fontWeight: 700 }}>{homeProb}%</span>
            </div>
          </div>

          <div style={{ background: "#222", borderRadius: "6px", overflow: "hidden", height: "8px" }}>
            <div style={{ height: "100%", width: `${awayProb}%`, background: "linear-gradient(90deg, #3b82f6, #FF6200)", borderRadius: "6px" }} />
          </div>

          {winner && (
            <div style={{ textAlign: "center", fontSize: "12px", color: "#FF6200", fontWeight: 700 }}>
              Model Pick: {winner === game.homeTeam ? home.name : away.name}
              {confidence > 0 && ` (${confidence.toFixed(0)}% confidence)`}
            </div>
          )}
        </div>
        <div style={{ background: "#1a1a1a", padding: "6px 14px", textAlign: "center", borderTop: "1px solid #333" }}>
          <a href="https://nflpredicts.com" target="_blank" rel="noopener noreferrer" style={{ color: "#888", fontSize: "10px", textDecoration: "none" }}>
            Powered by NFLPredicts.com
          </a>
        </div>
      </body>
    </html>
  )
}
