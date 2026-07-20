import Link from "next/link";
import type { Metadata } from "next";
import { TrendingUp, Trophy, Brain, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getUpcomingCollegeGames } from "@/lib/data/college-games";
import { getAllCollegePredictions } from "@/lib/data/college-predictions";
import { getCollegeTeam, collegeLogoUrl } from "@/lib/college-teams";
import { CollegeGameDTO } from "@/models/CollegeGame";
import { CollegePredictionDTO } from "@/models/CollegePrediction";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "College Football Predictions 2026 – AI ML Model Picks & Schedule",
  description:
    "AI-powered college football predictions for the 2026 season. Schedule, matchup analysis, condition layer breakdown, and win probabilities from our XGBoost ML model trained on 6 years of CFB data.",
  keywords: [
    "college football predictions 2026",
    "CFB picks AI",
    "college football ML model",
    "CFB win probability",
    "college football schedule",
    "college football analysis",
  ],
  alternates: { canonical: absoluteUrl("/college-football") },
  openGraph: {
    title: "College Football Predictions 2026 – AI ML Model",
    description: "AI-powered CFB predictions with condition layer analysis.",
    url: absoluteUrl("/college-football"),
    type: "website",
  },
};

function WinProbBar({ home, away }: { home: number; away: number }) {
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden">
      <div style={{ width: `${home}%`, background: "linear-gradient(90deg,#3B82F6,#60A5FA)" }} />
      <div style={{ flex: 1, background: "linear-gradient(90deg,#FF8533,#FF6200)" }} />
    </div>
  );
}

function TeamLogo({ src, abbr, size = 40 }: { src?: string; abbr: string; size?: number }) {
  const team = getCollegeTeam(abbr);
  const logoSrc = src || (team.espnId ? collegeLogoUrl(team.espnId) : null);
  if (!logoSrc) {
    return (
      <div
        className="rounded-lg flex items-center justify-center text-white font-bold text-xs"
        style={{ width: size, height: size, background: `#${team.color}` }}
      >
        {abbr.slice(0, 3)}
      </div>
    );
  }
  return (
    <img
      src={logoSrc}
      alt={team.name}
      width={size}
      height={size}
      className="object-contain"
    />
  );
}

function GameCard({ game, pred }: { game: CollegeGameDTO; pred?: CollegePredictionDTO }) {
  const home = getCollegeTeam(game.homeTeam);
  const away = getCollegeTeam(game.awayTeam);
  const kickoff = new Date(game.kickoff);
  const isUpcoming = kickoff > new Date();
  const winnerAbbr = pred?.predictedWinner;
  const homeProb = pred?.homeWinProbability ?? 50;
  const awayProb = pred?.awayWinProbability ?? 50;

  return (
    <Link href={`/college-football/${game.slug}`} className="group">
      <div className="rounded-xl border border-border bg-card hover:border-[#FF6200]/40 hover:shadow-lg hover:shadow-[#FF6200]/5 transition-all duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-secondary/20">
          <div className="flex items-center gap-2">
            {game.isBowlGame ? (
              <Badge variant="neon" className="text-[10px]">{game.bowlName || "Bowl Game"}</Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">WEEK {game.week}</Badge>
            )}
            {game.neutral && <Badge variant="secondary" className="text-[10px]">NEUTRAL</Badge>}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {game.network && <span className="font-medium">{game.network}</span>}
            <span>·</span>
            <span>{kickoff.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
        </div>

        {/* Matchup */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            {/* Away */}
            <div className={`flex-1 flex items-center gap-2.5 min-w-0 ${winnerAbbr === game.awayTeam ? "opacity-100" : pred ? "opacity-70" : "opacity-100"}`}>
              <TeamLogo src={game.awayTeamLogo} abbr={game.awayTeam} size={36} />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{away.name}</p>
                <p className="text-[10px] text-muted-foreground">{away.conference} · AWAY</p>
              </div>
            </div>

            <div className="text-center shrink-0">
              <span className="text-xs text-muted-foreground font-bold">VS</span>
            </div>

            {/* Home */}
            <div className={`flex-1 flex items-center justify-end gap-2.5 min-w-0 ${winnerAbbr === game.homeTeam ? "opacity-100" : pred ? "opacity-70" : "opacity-100"}`}>
              <div className="min-w-0 text-right">
                <p className="font-semibold text-sm truncate">{home.name}</p>
                <p className="text-[10px] text-muted-foreground">HOME · {home.conference}</p>
              </div>
              <TeamLogo src={game.homeTeamLogo} abbr={game.homeTeam} size={36} />
            </div>
          </div>

          {/* Win prob bar */}
          {pred && (
            <div className="space-y-1">
              <WinProbBar home={homeProb} away={awayProb} />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span className="text-blue-400 font-medium">{homeProb}%</span>
                <span className="flex items-center gap-1 text-[#FF6200]">
                  <Brain className="h-2.5 w-2.5" />
                  AI Pick: {winnerAbbr === game.homeTeam ? home.name.split(" ").slice(-1)[0] : away.name.split(" ").slice(-1)[0]}
                  {" "}({pred.confidence?.toFixed(0)}% conf)
                </span>
                <span className="text-[#FF6200] font-medium">{awayProb}%</span>
              </div>
            </div>
          )}

          {!pred && (
            <p className="text-xs text-muted-foreground text-center">Prediction generating...</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border/40 bg-secondary/10 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {kickoff.toLocaleDateString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" })}
          </span>
          <span className="text-[10px] text-[#FF6200] font-semibold group-hover:underline">
            Full Analysis →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function CollegeFootballPage() {
  const [games, predictions] = await Promise.all([
    getUpcomingCollegeGames(200),
    getAllCollegePredictions(200),
  ]);

  const predMap = new Map(
    predictions.map(p => [`${p.homeTeam}-${p.awayTeam}-${p.season}`, p])
  );

  const byWeek = games.reduce<Record<string, CollegeGameDTO[]>>((acc, g) => {
    const key = g.isBowlGame ? "Bowl Games" : `Week ${g.week}`;
    (acc[key] ??= []).push(g);
    return acc;
  }, {});

  const weeks = Object.keys(byWeek).sort((a, b) => {
    if (a === "Bowl Games") return 1;
    if (b === "Bowl Games") return -1;
    return Number(a.replace("Week ", "")) - Number(b.replace("Week ", ""));
  });

  const isEmpty = games.length === 0;

  return (
    <div className="container py-10">
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="neon" className="text-xs">🏈 COLLEGE FOOTBALL</Badge>
          <Badge variant="secondary" className="text-xs">2026 SEASON</Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
          CFB AI Predictions
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          Win probabilities, condition layer analysis, and head-to-head history powered by an XGBoost ML model trained on 6 seasons (2019–2025) of college football data.
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 mt-6">
          {[
            { icon: "🤖", label: "ML Model", value: "XGBoost" },
            { icon: "📅", label: "Training Data", value: "2019–2025" },
            { icon: "🎯", label: "Model Accuracy", value: "~68%" },
            { icon: "📊", label: "Factors Analyzed", value: "7 Layers" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <span>{s.icon}</span>
              <div>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                <p className="text-sm font-bold">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center space-y-4">
          <TrendingUp className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <h2 className="font-bold text-xl">Schedule Loading…</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            College football games are synced from ESPN. An admin can trigger a sync from the admin panel, or games will auto-populate as the season approaches.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/api/college/games"
              className="text-sm text-[#FF6200] underline"
            >
              Check API →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {weeks.map(week => (
            <section key={week}>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="font-bold text-xl">{week}</h2>
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">{byWeek[week].length} games</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {byWeek[week].map(game => (
                  <GameCard
                    key={game._id}
                    game={game}
                    pred={predMap.get(`${game.homeTeam}-${game.awayTeam}-${game.season}`)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
