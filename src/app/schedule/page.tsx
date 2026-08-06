import type { Metadata } from "next"
import Link from "next/link"
import { CalendarDays, Tv, ChevronRight } from "lucide-react"
import { getUpcomingGames } from "@/lib/data/games"
import { getTeam } from "@/lib/teams"
import { formatKickoffShort } from "@/lib/utils"
import { breadcrumbSchema } from "@/lib/schema-org"

export const revalidate = 3600

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const metadata: Metadata = {
  title: "NFL 2026 Weekly Schedule & Game Predictions | NFLPredicts",
  description:
    "Complete 2026 NFL season schedule across all 18 weeks. View game predictions, win probabilities, and full matchup breakdowns for every game.",
  alternates: { canonical: `${SITE_URL}/schedule` },
  openGraph: {
    title: "NFL 2026 Weekly Schedule & Game Predictions | NFLPredicts",
    description: "Complete 2026 NFL season schedule. Game predictions for all 18 weeks.",
    url: `${SITE_URL}/schedule`,
    type: "website",
  },
}

export default async function SchedulePage() {
  const games = await getUpcomingGames(272)

  const byWeek = games.reduce<Record<number, typeof games>>((acc, g) => {
    if (!acc[g.week]) acc[g.week] = []
    acc[g.week].push(g)
    return acc
  }, {})

  const weeks = Object.keys(byWeek)
    .map(Number)
    .sort((a, b) => a - b)

  const breadcrumb = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "2026 NFL Schedule", url: "/schedule" },
  ])

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "2026 NFL Schedule", item: `${SITE_URL}/schedule` },
    ],
  }

  return (
    <div className="container py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          2026 NFL Season Schedule &amp; Predictions
        </h1>
        <p className="text-muted-foreground">
          All {games.length} games across {weeks.length} weeks — with AI-powered predictions for every matchup.
        </p>
      </div>

      <div className="space-y-10">
        {weeks.map((week) => {
          const weekGames = byWeek[week]
          return (
            <section key={week} id={`week-${week}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-[#FF6200]" />
                  Week {week}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {weekGames.length} game{weekGames.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="rounded-xl border border-border overflow-hidden">
                {weekGames.map((game, i) => {
                  const away = getTeam(game.awayTeam)
                  const home = getTeam(game.homeTeam)
                  return (
                    <div
                      key={game._id}
                      className={`flex items-center justify-between gap-4 px-4 py-3 ${
                        i < weekGames.length - 1 ? "border-b border-border" : ""
                      } hover:bg-secondary/30 transition-colors`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="text-sm min-w-0">
                          <span className="font-semibold">{away.name}</span>
                          <span className="text-muted-foreground mx-1.5">@</span>
                          <span className="font-semibold">{home.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
                        <span className="hidden sm:flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatKickoffShort(game.kickoff)}
                        </span>
                        {game.network && (
                          <span className="hidden md:flex items-center gap-1">
                            <Tv className="h-3.5 w-3.5" />
                            {game.network}
                          </span>
                        )}
                        {game.status === "final" && typeof game.homeScore === "number" && (
                          <span className="font-bold text-foreground tabular-nums">
                            {game.awayScore}–{game.homeScore}
                          </span>
                        )}
                        <Link
                          href={`/games/${game.slug}`}
                          className="flex items-center gap-1 text-[#FF6200] font-semibold hover:underline"
                        >
                          View Prediction
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {weeks.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Schedule not yet available</p>
          <p className="text-sm mt-1">Check back soon for the full 2026 NFL schedule.</p>
        </div>
      )}
    </div>
  )
}
