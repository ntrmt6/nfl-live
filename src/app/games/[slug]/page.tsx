import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, MapPin, Tv, ChevronLeft, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MatchupPredictionDetail } from "@/components/predictions/MatchupPredictionDetail";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { WisdomOfCrowd } from "@/components/game/WisdomOfCrowd";
import { PickWidget } from "@/components/game/PickWidget";
import { BoldPrediction } from "@/components/game/BoldPrediction";
import { SharePredictionButtons } from "@/components/game/SharePredictionButtons";
import { GeminiAnalysis } from "@/components/game/GeminiAnalysis";
import { PlayerComparison } from "@/components/game/PlayerComparison";
import { LiveWinProbability } from "@/components/game/LiveWinProbability";
import { GameProjections } from "@/components/game/GameProjections";
import { GameResult } from "@/components/game/GameResult";
import { WeatherPanel } from "@/components/game/WeatherPanel";
import { InjuryReport } from "@/components/game/InjuryReport";
import { HeadToHeadHistory } from "@/components/game/HeadToHeadHistory";
import { AnalyticsBreakdown } from "@/components/game/AnalyticsBreakdown";
import { getGameBySlug, getAllGameSlugs } from "@/lib/data/games";
import { getPredictionForGame } from "@/lib/data/predictions";
import { fetchStadiumWeather } from "@/lib/data/weather";
import { fetchTeamInjuries } from "@/lib/data/injuries";
import { getHeadToHeadStats } from "@/lib/data/head-to-head";
import { computeGameAnalytics } from "@/lib/data/game-analytics";
import { getTeam, teamToSlug } from "@/lib/teams";
import { formatGameTime, isLiveNow, absoluteUrl } from "@/lib/utils";
import { sportsEventSchema, matchupPredictionSchema, breadcrumbSchema } from "@/lib/schema-org";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateStaticParams() {
  const slugs = await getAllGameSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) return {};

  const home = getTeam(game.homeTeam);
  const away = getTeam(game.awayTeam);
  const year = new Date(game.kickoff).getFullYear();

  const prediction = await getPredictionForGame(
    game.homeTeam, game.awayTeam, game.week, game.season
  );

  const title = `${away.name} vs ${home.name} ${year} Week ${game.week} Score Prediction & Analytics – NFLPredicts`;

  let description = `AI-powered prediction for ${away.name} at ${home.name}. Win probabilities, analytics, team stats, and model confidence.`;
  if (prediction) {
    const winner = prediction.predictedWinner === game.homeTeam ? home.name : away.name;
    const conf = (prediction.confidence ?? 0).toFixed(0);
    description = `Our model picks ${winner} to win with ${conf}% confidence. Full analytics, injury report, weather, and head-to-head breakdown for ${away.name} vs ${home.name} Week ${game.week}.`;
  }

  return {
    title,
    description,
    keywords: [
      `${away.name} vs ${home.name} prediction`,
      `${away.name} ${home.name} pick`,
      `NFL Week ${game.week} prediction`,
      `${away.name} game prediction`,
      `${home.name} game prediction`,
      "NFL predictions",
      "NFL AI picks",
      "NFL matchup analysis",
    ],
    alternates: { canonical: absoluteUrl(`/games/${game.slug}`) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/games/${game.slug}`),
      type: "website",
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || "NFL Predictions Hub",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) notFound();

  const [prediction, weather, homeInjuries, awayInjuries, h2h] = await Promise.all([
    getPredictionForGame(game.homeTeam, game.awayTeam, game.week, game.season),
    fetchStadiumWeather(game.homeTeam),
    fetchTeamInjuries(game.homeTeam),
    fetchTeamInjuries(game.awayTeam),
    getHeadToHeadStats(game.homeTeam, game.awayTeam),
  ]);

  const analytics = prediction ? computeGameAnalytics(prediction, game) : null;

  const home = getTeam(game.homeTeam);
  const away = getTeam(game.awayTeam);
  const live = game.status === "live" || isLiveNow(game.kickoff);
  const isFinal = game.status === "final";

  const breadcrumb = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Predictions", url: "/predictions" },
    { name: `${away.name} vs ${home.name}`, url: `/games/${game.slug}` },
  ]);
  const eventSchema = sportsEventSchema({ ...game, kickoff: new Date(game.kickoff) } as any);
  const predSchema = prediction ? matchupPredictionSchema({ ...game, kickoff: new Date(game.kickoff) } as any, prediction) : null;

  return (
    <div className="container py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />
      {predSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(predSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/predictions"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to predictions
        </Link>
        <Link
          href="/schedule"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Full 2026 Schedule
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={isFinal ? "neon" : live ? "live" : "neon"}>
                {isFinal ? "FINAL" : live ? "LIVE NOW" : `WEEK ${game.week}`}
              </Badge>
              {game.network && (
                <span className="text-sm text-muted-foreground">{game.network}</span>
              )}
              <span className="ml-auto flex items-center gap-1 text-xs text-[#FF6200] font-semibold">
                <TrendingUp className="h-3.5 w-3.5" />
                {isFinal ? "AI Prediction Result" : "AI Prediction"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              {away.name} <span className="text-muted-foreground">@</span> {home.name}
            </h1>
          </div>

          {isFinal && <GameResult game={game} prediction={prediction} />}

          {!isFinal && prediction && (
            <LiveWinProbability
              homeTeam={game.homeTeam}
              awayTeam={game.awayTeam}
              homeTeamFull={game.homeTeamFull}
              awayTeamFull={game.awayTeamFull}
              preGameHomeProb={prediction.homeWinProbability ?? 50}
            />
          )}

          {prediction ? (
            <MatchupPredictionDetail pred={prediction} />
          ) : (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <TrendingUp className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-semibold text-foreground/70">No prediction available yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Our ML model hasn't generated a prediction for this matchup. Check back closer to kickoff.
              </p>
            </div>
          )}

          <GeminiAnalysis
            gameSlug={game.slug}
            homeTeamFull={game.homeTeamFull}
            awayTeamFull={game.awayTeamFull}
          />

          {prediction?.homeTeamStats && prediction?.awayTeamStats && (
            <GameProjections
              homeTeam={game.homeTeam}
              awayTeam={game.awayTeam}
              homeTeamFull={game.homeTeamFull}
              awayTeamFull={game.awayTeamFull}
              homeStats={prediction.homeTeamStats}
              awayStats={prediction.awayTeamStats}
            />
          )}

          {analytics && (
            <AnalyticsBreakdown
              analytics={analytics}
              homeTeamFull={game.homeTeamFull}
              awayTeamFull={game.awayTeamFull}
            />
          )}

          <HeadToHeadHistory
            stats={h2h}
            homeTeam={game.homeTeam}
            awayTeam={game.awayTeam}
            homeTeamFull={game.homeTeamFull}
            awayTeamFull={game.awayTeamFull}
          />

          <InjuryReport
            homeTeam={game.homeTeam}
            awayTeam={game.awayTeam}
            homeTeamFull={game.homeTeamFull}
            awayTeamFull={game.awayTeamFull}
            homeInjuries={homeInjuries}
            awayInjuries={awayInjuries}
          />

          <PlayerComparison
            awayTeam={game.awayTeam}
            homeTeam={game.homeTeam}
            awayTeamFull={game.awayTeamFull}
            homeTeamFull={game.homeTeamFull}
            awayPPG={prediction?.awayTeamStats?.pts_for}
            homePPG={prediction?.homeTeamStats?.pts_for}
            awayDefPts={prediction?.awayTeamStats?.pts_against}
            homeDefPts={prediction?.homeTeamStats?.pts_against}
            awayWinRate={prediction?.awayTeamStats?.win_rate}
            homeWinRate={prediction?.homeTeamStats?.win_rate}
          />

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-lg mb-4">Game Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <InfoRow icon={<CalendarDays className="h-4 w-4" />} label="Kickoff" value={formatGameTime(game.kickoff)} />
              <InfoRow icon={<Tv className="h-4 w-4" />} label="Network" value={game.network || "TBD"} />
              {game.venue && (
                <InfoRow icon={<MapPin className="h-4 w-4" />} label="Venue" value={game.venue} />
              )}
            </div>
            {game.description && (
              <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
                {game.description}
              </p>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Matchup</h3>
            <div className="space-y-4">
              <TeamBlock abbr={away.abbr} name={away.name} score={game.awayScore} isWinner={prediction?.predictedWinner === game.awayTeam} />
              <div className="text-center text-xs text-muted-foreground">at</div>
              <TeamBlock abbr={home.abbr} name={home.name} score={game.homeScore} isWinner={prediction?.predictedWinner === game.homeTeam} />
            </div>
          </div>

          {/* Team Hub links */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-sm mb-3">Team Hubs</h3>
            <div className="space-y-1">
              {([{ team: away, game: game.awayTeam }, { team: home, game: game.homeTeam }] as const).map(({ team }) => (
                <Link
                  key={team.abbr}
                  href={`/teams/${teamToSlug(team.name)}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary transition-colors group"
                >
                  <TeamLogo abbr={team.abbr} size={28} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold group-hover:text-[#FF6200] transition-colors truncate">
                      {team.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Games · Blog · Analysis</p>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-muted-foreground/40 group-hover:text-[#FF6200] rotate-180 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {!isFinal && <WeatherPanel weather={weather} />}

          <WisdomOfCrowd
            gameSlug={game.slug}
            homeTeam={game.homeTeam}
            awayTeam={game.awayTeam}
            homeTeamFull={game.homeTeamFull}
            awayTeamFull={game.awayTeamFull}
          />

          {!isFinal && (
            <PickWidget
              gameSlug={game.slug}
              homeTeam={game.homeTeam}
              awayTeam={game.awayTeam}
              homeTeamFull={game.homeTeamFull}
              awayTeamFull={game.awayTeamFull}
              gameStatus={game.status}
            />
          )}

          {!isFinal && (
            <BoldPrediction
              gameSlug={game.slug}
              homeTeam={game.homeTeam}
              awayTeam={game.awayTeam}
              homeTeamFull={game.homeTeamFull}
              awayTeamFull={game.awayTeamFull}
              homeWinPct={prediction?.homeWinProbability ? prediction.homeWinProbability * 100 : undefined}
              awayWinPct={prediction?.awayWinProbability ? prediction.awayWinProbability * 100 : undefined}
            />
          )}

          {prediction && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h3 className="font-semibold text-sm">Quick Stats</h3>
              <QuickStat label="Model Pick" value={prediction.predictedWinner === game.homeTeam ? home.name : away.name} accent />
              <QuickStat label="Confidence" value={`${(prediction.confidence ?? 0).toFixed(0)}%`} />
              <QuickStat label="Home Win Prob" value={`${(prediction.homeWinProbability ?? 0).toFixed(0)}%`} />
              <QuickStat label="Away Win Prob" value={`${(prediction.awayWinProbability ?? 0).toFixed(0)}%`} />
              {prediction.modelAccuracy && (
                <QuickStat label="Model Accuracy" value={`${prediction.modelAccuracy}%`} />
              )}
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-sm mb-1">Embed This Prediction</h3>
            <p className="text-xs text-muted-foreground mb-2">Free widget for your site</p>
            <code className="text-xs bg-secondary p-2 rounded block break-all leading-relaxed">
              {`<iframe src="${SITE_URL}/widget/${game.slug}" width="300" height="200" frameborder="0"></iframe>`}
            </code>
          </div>

          {prediction && (
            <SharePredictionButtons
              away={game.awayTeam}
              home={game.homeTeam}
              awayFull={game.awayTeamFull}
              homeFull={game.homeTeamFull}
              awayProb={Math.round((prediction.awayWinProbability ?? 0.5) * 100)}
              homeProb={Math.round((prediction.homeWinProbability ?? 0.5) * 100)}
              winner={prediction.predictedWinner ?? game.homeTeam}
              confidence={prediction.confidence ?? 0}
              week={game.week}
              awayPPG={prediction.awayTeamStats?.pts_for != null ? prediction.awayTeamStats.pts_for.toFixed(1) : undefined}
              homePPG={prediction.homeTeamStats?.pts_for != null ? prediction.homeTeamStats.pts_for.toFixed(1) : undefined}
              awayDef={prediction.awayTeamStats?.pts_against != null ? prediction.awayTeamStats.pts_against.toFixed(1) : undefined}
              homeDef={prediction.homeTeamStats?.pts_against != null ? prediction.homeTeamStats.pts_against.toFixed(1) : undefined}
              awayWR={prediction.awayTeamStats?.win_rate != null ? (prediction.awayTeamStats.win_rate * 100).toFixed(0) : undefined}
              homeWR={prediction.homeTeamStats?.win_rate != null ? (prediction.homeTeamStats.win_rate * 100).toFixed(0) : undefined}
              gameUrl={absoluteUrl(`/games/${game.slug}`)}
            />
          )}

          <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground leading-relaxed">
            Predictions are generated by an XGBoost machine learning model trained on 4 seasons of NFL data. Results are probabilistic estimates and not guaranteed outcomes.
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        {icon}
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function TeamBlock({
  abbr, name, score, isWinner,
}: {
  abbr: string; name: string; score?: number; isWinner?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between rounded-lg p-3 transition-colors ${isWinner ? "bg-[#FF6200]/10 border border-[#FF6200]/20" : "bg-secondary/40"}`}>
      <div className="flex items-center gap-3">
        <TeamLogo abbr={abbr} size={40} className="rounded-md" />
        <div>
          <span className="font-medium text-sm">{name}</span>
          {isWinner && (
            <p className="text-[10px] text-[#FF6200] font-semibold uppercase tracking-wide">Model Pick</p>
          )}
        </div>
      </div>
      {typeof score === "number" && (
        <span className="text-lg font-bold tabular-nums">{score}</span>
      )}
    </div>
  );
}

function QuickStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-bold ${accent ? "text-[#FF6200]" : "text-foreground"}`}>{value}</span>
    </div>
  );
}
