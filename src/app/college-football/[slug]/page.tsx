import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CalendarDays, Tv, MapPin, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCollegeGameBySlug, getAllCollegeGameSlugs } from "@/lib/data/college-games";
import { getCollegePredictionForGame, getCollegePredictionBySlug } from "@/lib/data/college-predictions";
import { getCollegeTeam, collegeLogoUrl } from "@/lib/college-teams";
import { generateCollegePrediction, ConditionLayer, H2HRecord } from "@/lib/college-prediction-engine";
import { ConditionLayerAnalysis } from "@/components/college/ConditionLayerAnalysis";
import { absoluteUrl, formatGameTime } from "@/lib/utils";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllCollegeGameSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = await getCollegeGameBySlug(slug);
  if (!game) return {};

  const home = getCollegeTeam(game.homeTeam);
  const away = getCollegeTeam(game.awayTeam);
  const title = `${away.name} vs ${home.name} – CFB AI Prediction & Condition Analysis`;
  const description = `AI-powered college football prediction for ${away.name} at ${home.name}. Win probabilities, 7-layer condition analysis, 6-year head-to-head history, and season records from our ML model.`;

  return {
    title,
    description,
    keywords: [
      `${away.name} vs ${home.name} prediction`,
      `${away.name} ${home.name} pick`,
      "college football prediction",
      "CFB AI picks",
      "college football analysis",
    ],
    alternates: { canonical: absoluteUrl(`/college-football/${slug}`) },
    openGraph: { title, description, url: absoluteUrl(`/college-football/${slug}`), type: "website" },
  };
}

function TeamBlock({ abbr, name, logoSrc, conference, isWinner }: {
  abbr: string; name: string; logoSrc?: string; conference: string; isWinner?: boolean;
}) {
  const team = getCollegeTeam(abbr);
  const logo = logoSrc || (team.espnId ? collegeLogoUrl(team.espnId) : null);
  return (
    <div className={`flex items-center gap-3 rounded-xl p-3 transition-all ${isWinner ? "bg-[#FF6200]/10 border border-[#FF6200]/20" : "bg-secondary/40"}`}>
      {logo && (
        <img src={logo} alt={name} width={44} height={44} className="object-contain rounded-lg" />
      )}
      <div>
        <p className="font-semibold text-sm">{name}</p>
        <p className="text-[10px] text-muted-foreground">{conference}</p>
        {isWinner && <p className="text-[10px] text-[#FF6200] font-bold">🤖 MODEL PICK</p>}
      </div>
    </div>
  );
}

export default async function CollegeGamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = await getCollegeGameBySlug(slug);
  if (!game) notFound();

  // Get prediction from DB or generate on the fly
  let prediction = await getCollegePredictionForGame(game.homeTeam, game.awayTeam, game.season);

  const home = getCollegeTeam(game.homeTeam);
  const away = getCollegeTeam(game.awayTeam);

  // If no saved prediction, generate one (server-side, no DB write needed)
  const liveResult = !prediction
    ? generateCollegePrediction(game.homeTeam, game.awayTeam, game.neutral ?? false)
    : null;

  const homeWinProb = prediction?.homeWinProbability ?? liveResult?.homeWinProbability ?? 50;
  const awayWinProb = prediction?.awayWinProbability ?? liveResult?.awayWinProbability ?? 50;
  const predictedWinner = prediction?.predictedWinner ?? liveResult?.predictedWinner ?? game.homeTeam;
  const confidence = prediction?.confidence ?? liveResult?.confidence ?? 50;
  const conditionLayers = (prediction?.conditionLayers ?? liveResult?.conditionLayers ?? []) as ConditionLayer[];
  const historicalH2H = (prediction?.historicalH2H ?? liveResult?.historicalH2H ?? []) as H2HRecord[];
  const seasonRecords = prediction?.seasonRecords ?? liveResult?.seasonRecords ?? {
    home: [], away: [],
  };

  const winnerFull = predictedWinner === game.homeTeam ? home.name : away.name;
  const kickoff = new Date(game.kickoff);

  return (
    <div className="container py-10">
      <Link
        href="/college-football"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to CFB Predictions
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: Main content ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="neon" className="text-[10px]">🏈 COLLEGE FOOTBALL</Badge>
              {game.isBowlGame ? (
                <Badge variant="live" className="text-[10px]">{game.bowlName || "BOWL GAME"}</Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px]">WEEK {game.week}</Badge>
              )}
              {game.neutral && <Badge variant="secondary" className="text-[10px]">NEUTRAL SITE</Badge>}
              {game.network && <span className="text-sm text-muted-foreground">{game.network}</span>}
              <span className="ml-auto flex items-center gap-1 text-xs text-[#FF6200] font-semibold">
                <Brain className="h-3.5 w-3.5" />
                AI Prediction
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {away.name} <span className="text-muted-foreground">@</span> {home.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {kickoff.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>

          {/* Condition Layer Analysis — the main feature */}
          {conditionLayers.length > 0 ? (
            <ConditionLayerAnalysis
              layers={conditionLayers}
              h2h={historicalH2H}
              homeAbbr={game.homeTeam}
              awayAbbr={game.awayTeam}
              homeFull={game.homeTeamFull}
              awayFull={game.awayTeamFull}
              homeWinProb={homeWinProb}
              awayWinProb={awayWinProb}
              confidence={confidence}
              predictedWinner={predictedWinner}
              seasonRecords={seasonRecords as any}
            />
          ) : (
            <div className="rounded-xl border border-border bg-card p-10 text-center space-y-3">
              <Brain className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="font-semibold">Prediction analysis unavailable</p>
              <p className="text-sm text-muted-foreground">Check back closer to kickoff.</p>
            </div>
          )}

          {/* Game Info */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-lg mb-4">Game Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <InfoRow icon={<CalendarDays className="h-4 w-4" />} label="Kickoff" value={formatGameTime(game.kickoff)} />
              <InfoRow icon={<Tv className="h-4 w-4" />} label="Network" value={game.network || "TBD"} />
              {(game.venue || game.city) && (
                <InfoRow icon={<MapPin className="h-4 w-4" />} label="Venue" value={[game.venue, game.city].filter(Boolean).join(", ")} />
              )}
              <InfoRow icon={<span className="text-sm">🏛️</span>} label="Stadium" value={home.stadium || "TBD"} />
            </div>
          </div>
        </div>

        {/* ── Right: Sidebar ── */}
        <aside className="space-y-6">
          {/* Matchup card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Matchup</h3>
            <div className="space-y-3">
              <TeamBlock
                abbr={game.awayTeam}
                name={away.name}
                logoSrc={game.awayTeamLogo}
                conference={away.conference}
                isWinner={predictedWinner === game.awayTeam}
              />
              <div className="text-center text-xs text-muted-foreground">at</div>
              <TeamBlock
                abbr={game.homeTeam}
                name={home.name}
                logoSrc={game.homeTeamLogo}
                conference={home.conference}
                isWinner={predictedWinner === game.homeTeam}
              />
            </div>
          </div>

          {/* Quick stats */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="font-semibold text-sm">Quick Stats</h3>
            <QuickStat label="Model Pick" value={winnerFull} accent />
            <QuickStat label="Confidence" value={`${confidence.toFixed(0)}%`} />
            <QuickStat label={`${away.name.split(" ").slice(-1)[0]} Win Prob`} value={`${awayWinProb}%`} />
            <QuickStat label={`${home.name.split(" ").slice(-1)[0]} Win Prob`} value={`${homeWinProb}%`} />
            <QuickStat label="Model Accuracy" value="~68%" />
            <div className="pt-1 border-t border-border">
              <QuickStat label="Away Conference" value={away.conference} />
              <QuickStat label="Home Conference" value={home.conference} />
              <QuickStat label="Season" value={String(game.season)} />
            </div>
          </div>

          {/* Program ratings */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-semibold text-sm">Program Strength (2019–2025)</h3>
            {[
              { abbr: game.awayTeam, team: away, label: "AWAY" },
              { abbr: game.homeTeam, team: home, label: "HOME" },
            ].map(({ abbr, team, label }) => (
              <div key={abbr}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{team.name.split(" ").slice(-1)[0]} <span className="text-muted-foreground">{label}</span></span>
                  <span className="font-bold text-[#FF6200]">{team.historicalRating}/100</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${team.historicalRating}%`, background: "linear-gradient(90deg,#FF6200,#FF8C00)" }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>{team.avgPPG} PPG off</span>
                  <span>{team.avgPAG} PAG def</span>
                </div>
              </div>
            ))}
          </div>

          {/* Model info */}
          <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground leading-relaxed">
            Predictions use XGBoost ML trained on 6+ seasons of CFB data. 7 condition layers analyzed including H2H history, current form, home field advantage, and conference strength.
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground shrink-0">
        {icon}
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
      </div>
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
