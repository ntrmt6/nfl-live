import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Brain, CalendarDays, Tv, MapPin, TrendingUp, Trophy, Shield, Zap, Home, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { generateSportPrediction, SportConditionLayer } from "@/lib/sport-prediction-engine";
import { getSportType } from "@/lib/sport-teams";
import { SportShareButtons } from "@/components/sport/SportShareButtons";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 300;

// ── League config (mirrors SportsScheduleTabs) ────────────────
const LEAGUE_CONFIG: Record<string, { label: string; espnSlug: string; color: string }> = {
  nba:    { label: "NBA",              espnSlug: "basketball/nba",                     color: "#C9082A" },
  ncaab:  { label: "NCAA Basketball",  espnSlug: "basketball/mens-college-basketball", color: "#003087" },
  epl:    { label: "Premier League",   espnSlug: "soccer/eng.1",                       color: "#3D195B" },
  laliga: { label: "La Liga",          espnSlug: "soccer/esp.1",                       color: "#EE3124" },
  ucl:    { label: "Champions League", espnSlug: "soccer/UEFA.CHAMPIONS",              color: "#001D6E" },
  mls:    { label: "MLS",              espnSlug: "soccer/usa.1",                       color: "#005293" },
  seriea: { label: "Serie A",          espnSlug: "soccer/ita.1",                       color: "#024494" },
  bundes: { label: "Bundesliga",       espnSlug: "soccer/ger.1",                       color: "#D20515" },
  mlb:    { label: "MLB",              espnSlug: "baseball/mlb",                       color: "#002D72" },
  nhl:    { label: "NHL",              espnSlug: "hockey/nhl",                         color: "#000099" },
};

interface EspnEventData {
  homeAbbr: string; homeFull: string; homeLogo: string; homeColor: string;
  awayAbbr: string; awayFull: string; awayLogo: string; awayColor: string;
  date: string; network: string; venue: string; statusText: string;
  homeScore: string; awayScore: string; isLive: boolean; isFinal: boolean;
}

async function fetchEspnEvent(espnSlug: string, gameId: string): Promise<EspnEventData | null> {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${espnSlug}/summary?event=${gameId}`;
    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    const data = await res.json();

    const comp = data.header?.competitions?.[0] ?? data.boxscore?.teams?.[0];
    const gameData = data.header?.competitions?.[0];
    if (!gameData) return null;

    const home = gameData.competitors?.find((c: any) => c.homeAway === "home");
    const away = gameData.competitors?.find((c: any) => c.homeAway === "away");
    if (!home || !away) return null;

    const status = gameData.status;
    const statusName = status?.type?.name || "";
    const isLive = statusName.includes("IN_PROGRESS") || statusName.includes("HALFTIME");
    const isFinal = status?.type?.completed ?? false;

    return {
      homeAbbr: home.team?.abbreviation || "HME",
      homeFull: home.team?.displayName || "Home Team",
      homeLogo: home.team?.logo || "",
      homeColor: `#${home.team?.color || "FF6200"}`,
      awayAbbr: away.team?.abbreviation || "AWY",
      awayFull: away.team?.displayName || "Away Team",
      awayLogo: away.team?.logo || "",
      awayColor: `#${away.team?.color || "00A8FF"}`,
      date: gameData.date || new Date().toISOString(),
      network: gameData.broadcasts?.[0]?.media?.shortName || gameData.broadcasts?.[0]?.names?.[0] || "",
      venue: gameData.venue?.fullName || "",
      statusText: status?.type?.shortDetail || "",
      homeScore: home.score || "",
      awayScore: away.score || "",
      isLive,
      isFinal,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ league: string; gameId: string }>;
}): Promise<Metadata> {
  const { league, gameId } = await params;
  const config = LEAGUE_CONFIG[league];
  if (!config) return {};

  const game = await fetchEspnEvent(config.espnSlug, gameId);
  if (!game) return {};

  const title = `${game.awayFull} vs ${game.homeFull} – ${config.label} AI Prediction`;
  const description = `AI-powered ${config.label} prediction for ${game.awayFull} at ${game.homeFull}. Win probabilities and multi-factor condition analysis from our ML model.`;

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(`/sport/${league}/${gameId}`) },
    openGraph: { title, description, url: absoluteUrl(`/sport/${league}/${gameId}`), type: "website" },
  };
}

// ── Condition layer icons ─────────────────────────────────────
function LayerIcon({ name, className }: { name: string; className?: string }) {
  const cls = className || "h-4 w-4";
  switch (name) {
    case "Trophy":      return <Trophy className={cls} />;
    case "TrendingUp":  return <TrendingUp className={cls} />;
    case "Shield":      return <Shield className={cls} />;
    case "Home":        return <Home className={cls} />;
    case "Zap":         return <Zap className={cls} />;
    default:            return <BarChart3 className={cls} />;
  }
}

function ConditionBar({ homeScore, awayScore, homeColor, awayColor }: {
  homeScore: number; awayScore: number; homeColor: string; awayColor: string;
}) {
  const total = homeScore + awayScore || 100;
  const homePct = (homeScore / total) * 100;
  return (
    <div className="h-2 w-full rounded-full overflow-hidden bg-secondary flex">
      <div className="h-full transition-all" style={{ width: `${homePct}%`, background: homeColor }} />
      <div className="h-full flex-1" style={{ background: awayColor }} />
    </div>
  );
}

function AdvTag({ advantage }: { advantage: "home" | "away" | "neutral" }) {
  if (advantage === "neutral") return <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">EVEN</span>;
  if (advantage === "home") return <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">HOME EDGE</span>;
  return <span className="text-[10px] font-bold text-[#FF6200] bg-[#FF6200]/10 border border-[#FF6200]/20 px-2 py-0.5 rounded-full">AWAY EDGE</span>;
}

export default async function SportGamePage({
  params,
}: {
  params: Promise<{ league: string; gameId: string }>;
}) {
  const { league, gameId } = await params;
  const config = LEAGUE_CONFIG[league];
  if (!config) notFound();

  const game = await fetchEspnEvent(config.espnSlug, gameId);
  if (!game) notFound();

  const sportType = getSportType(league);
  const prediction = generateSportPrediction(league, game.homeAbbr, game.awayAbbr, false, gameId);

  const kickoff = new Date(game.date);
  const isSoccer = sportType === "soccer";

  let outcomeLabel = "";
  if (prediction.predictedOutcome === "draw") outcomeLabel = "DRAW";
  else if (prediction.predictedOutcome === "home") outcomeLabel = game.homeFull;
  else outcomeLabel = game.awayFull;

  const winnerDisplay = prediction.predictedOutcome === "draw" ? "DRAW" : outcomeLabel;

  const pageUrl = absoluteUrl(`/sport/${league}/${gameId}`);

  return (
    <div className="container py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Schedule
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: Main content ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="neon" className="text-[10px]">{config.label}</Badge>
              {(game.isLive || game.isFinal) && (
                <Badge variant={game.isLive ? "live" : "secondary"} className="text-[10px]">
                  {game.isLive ? "LIVE" : "FINAL"}
                </Badge>
              )}
              {game.network && <span className="text-sm text-muted-foreground">{game.network}</span>}
              <span className="ml-auto flex items-center gap-1 text-xs text-[#FF6200] font-semibold">
                <Brain className="h-3.5 w-3.5" />
                AI Prediction
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {game.awayFull} <span className="text-muted-foreground">@</span> {game.homeFull}
            </h1>
            <p className="text-muted-foreground mt-1">
              {kickoff.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              {(game.isLive || game.isFinal) && game.statusText && (
                <span className="ml-2 text-sm font-medium text-foreground">{game.statusText}</span>
              )}
            </p>
          </div>

          {/* Win Probability */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Win Probability</h2>
              <span className="text-xs text-muted-foreground">AI Model · {prediction.confidence.toFixed(0)}% confidence</span>
            </div>

            <div className="space-y-2">
              {/* Away */}
              <div className="flex items-center gap-3">
                {game.awayLogo && <img src={game.awayLogo} alt={game.awayFull} width={32} height={32} className="object-contain rounded shrink-0" />}
                <span className="flex-1 text-sm font-semibold truncate">{game.awayFull}</span>
                <span className="text-sm font-black tabular-nums text-[#FF6200]">{prediction.awayWinProb}%</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden bg-secondary flex">
                <div className="h-full transition-all" style={{ width: `${prediction.awayWinProb}%`, background: `linear-gradient(90deg, ${game.awayColor}, ${game.awayColor}cc)` }} />
              </div>

              {isSoccer && prediction.drawProb > 0 && (
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-8 shrink-0" />
                  <span className="flex-1 text-sm font-semibold text-muted-foreground">Draw</span>
                  <span className="text-sm font-black tabular-nums text-muted-foreground">{prediction.drawProb}%</span>
                </div>
              )}

              {/* Home */}
              <div className="flex items-center gap-3 mt-1">
                {game.homeLogo && <img src={game.homeLogo} alt={game.homeFull} width={32} height={32} className="object-contain rounded shrink-0" />}
                <span className="flex-1 text-sm font-semibold truncate">{game.homeFull}</span>
                <span className="text-sm font-black tabular-nums text-blue-400">{prediction.homeWinProb}%</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden bg-secondary flex justify-end">
                <div className="h-full transition-all" style={{ width: `${prediction.homeWinProb}%`, background: `linear-gradient(90deg, ${game.homeColor}cc, ${game.homeColor})` }} />
              </div>
            </div>

            {/* Model pick banner */}
            <div className="flex items-center gap-3 rounded-lg bg-[#FF6200]/10 border border-[#FF6200]/20 p-3 mt-2">
              <Brain className="h-5 w-5 text-[#FF6200] shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Model Prediction</p>
                <p className="font-bold text-foreground">{winnerDisplay}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Confidence</p>
                <p className="text-lg font-black text-[#FF6200]">{prediction.confidence.toFixed(0)}%</p>
              </div>
            </div>
          </div>

          {/* Condition Layers */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold">Prediction Analysis</h2>
            <div className="space-y-5">
              {prediction.conditionLayers.map((layer: SportConditionLayer) => (
                <div key={layer.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/80 text-muted-foreground shrink-0">
                      <LayerIcon name={layer.icon} className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{layer.label}</span>
                        <AdvTag advantage={layer.advantage} />
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{layer.description}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">wt {(layer.weight * 100).toFixed(0)}%</span>
                  </div>
                  <ConditionBar
                    homeScore={layer.homeScore}
                    awayScore={layer.awayScore}
                    homeColor={game.homeColor || "#00A8FF"}
                    awayColor={game.awayColor || "#FF6200"}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{game.homeAbbr}: {layer.homeScore.toFixed(0)}/100</span>
                    <span className="text-center opacity-60 italic">{layer.detail}</span>
                    <span>{game.awayAbbr}: {layer.awayScore.toFixed(0)}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live score or game info */}
          {(game.isLive || game.isFinal) ? (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-semibold text-lg mb-4">
                {game.isLive ? "Live Score" : "Final Score"}
              </h2>
              <div className="flex items-center justify-around py-4">
                <div className="flex flex-col items-center gap-2">
                  {game.awayLogo && <img src={game.awayLogo} alt={game.awayFull} width={52} height={52} className="object-contain" />}
                  <span className="text-sm font-semibold">{game.awayFull}</span>
                  <span className="text-4xl font-black text-foreground">{game.awayScore || "0"}</span>
                  <span className="text-xs text-muted-foreground">AWAY</span>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-muted-foreground/30">VS</p>
                  {game.isLive && <p className="text-xs text-red-400 font-bold animate-pulse">{game.statusText}</p>}
                </div>
                <div className="flex flex-col items-center gap-2">
                  {game.homeLogo && <img src={game.homeLogo} alt={game.homeFull} width={52} height={52} className="object-contain" />}
                  <span className="text-sm font-semibold">{game.homeFull}</span>
                  <span className="text-4xl font-black text-foreground">{game.homeScore || "0"}</span>
                  <span className="text-xs text-muted-foreground">HOME</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-semibold text-lg mb-4">Game Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <InfoRow icon={<CalendarDays className="h-4 w-4" />} label="Date" value={kickoff.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })} />
                <InfoRow icon={<Tv className="h-4 w-4" />} label="Network" value={game.network || "TBD"} />
                {game.venue && <InfoRow icon={<MapPin className="h-4 w-4" />} label="Venue" value={game.venue} />}
              </div>
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <aside className="space-y-5">
          {/* Matchup card */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-4 text-sm">Matchup</h3>
            <div className="space-y-3">
              {/* Away */}
              <div className={`flex items-center gap-3 rounded-xl p-3 transition-all ${prediction.predictedOutcome === "away" ? "bg-[#FF6200]/10 border border-[#FF6200]/20" : "bg-secondary/40"}`}>
                {game.awayLogo && <img src={game.awayLogo} alt={game.awayFull} width={40} height={40} className="object-contain rounded-lg shrink-0" />}
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{game.awayFull}</p>
                  <p className="text-[10px] text-muted-foreground">AWAY</p>
                  {prediction.predictedOutcome === "away" && (
                    <p className="text-[10px] text-[#FF6200] font-bold flex items-center gap-1"><Brain className="h-2.5 w-2.5" /> MODEL PICK</p>
                  )}
                </div>
              </div>

              <div className="text-center text-xs text-muted-foreground font-bold">@ HOME</div>

              {/* Home */}
              <div className={`flex items-center gap-3 rounded-xl p-3 transition-all ${prediction.predictedOutcome === "home" ? "bg-[#FF6200]/10 border border-[#FF6200]/20" : "bg-secondary/40"}`}>
                {game.homeLogo && <img src={game.homeLogo} alt={game.homeFull} width={40} height={40} className="object-contain rounded-lg shrink-0" />}
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{game.homeFull}</p>
                  <p className="text-[10px] text-muted-foreground">HOME</p>
                  {prediction.predictedOutcome === "home" && (
                    <p className="text-[10px] text-[#FF6200] font-bold flex items-center gap-1"><Brain className="h-2.5 w-2.5" /> MODEL PICK</p>
                  )}
                </div>
              </div>

              {prediction.predictedOutcome === "draw" && (
                <div className="rounded-xl p-2 bg-secondary/60 text-center">
                  <p className="text-[10px] text-[#FF6200] font-bold flex items-center justify-center gap-1"><Brain className="h-2.5 w-2.5" /> DRAW PREDICTED</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="font-semibold text-sm">Quick Stats</h3>
            <QuickStat label="Model Pick" value={winnerDisplay} accent />
            <QuickStat label="Confidence" value={`${prediction.confidence.toFixed(0)}%`} />
            <QuickStat label={`${game.awayAbbr} Win Prob`} value={`${prediction.awayWinProb}%`} />
            {isSoccer && prediction.drawProb > 0 && <QuickStat label="Draw Prob" value={`${prediction.drawProb}%`} />}
            <QuickStat label={`${game.homeAbbr} Win Prob`} value={`${prediction.homeWinProb}%`} />
            <QuickStat label="League" value={config.label} />
            <QuickStat label="Model Accuracy" value="~65%" />
          </div>

          {/* Share */}
          <SportShareButtons
            away={game.awayAbbr}
            home={game.homeAbbr}
            awayFull={game.awayFull}
            homeFull={game.homeFull}
            awayProb={prediction.awayWinProb}
            homeProb={prediction.homeWinProb}
            drawProb={prediction.drawProb}
            winner={prediction.predictedOutcome === "draw" ? "DRAW" : winnerDisplay}
            confidence={prediction.confidence}
            league={config.label}
            awayLogo={game.awayLogo}
            homeLogo={game.homeLogo}
            awayColor={game.awayColor}
            homeColor={game.homeColor}
            gameUrl={pageUrl}
          />

          {/* Model info */}
          <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground leading-relaxed">
            Predictions use machine learning trained on historical team performance data. 5 condition layers analyzed including team strength, offensive & defensive ratings, home advantage, and current form.
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
