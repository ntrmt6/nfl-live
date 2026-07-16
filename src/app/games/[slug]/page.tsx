import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, MapPin, Tv, ChevronLeft, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MatchupPredictionDetail } from "@/components/predictions/MatchupPredictionDetail";
import { getGameBySlug, getAllGameSlugs } from "@/lib/data/games";
import { getPredictionForGame } from "@/lib/data/predictions";
import { getTeam } from "@/lib/teams";
import { formatGameTime, isLiveNow, absoluteUrl } from "@/lib/utils";
import { breadcrumbSchema } from "@/lib/schema-org";

export const revalidate = 60;

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

  const kickoffDate = new Date(game.kickoff).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const title = `${away.name} vs ${home.name} Week ${game.week} – Prediction & Matchup Analysis`;
  const description =
    `AI-powered prediction for ${away.name} at ${home.name}. Win probabilities, key factors, team stats breakdown, and model confidence. Kickoff ${kickoffDate}.`;

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
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || "HD NFL TV",
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

  const prediction = await getPredictionForGame(
    game.homeTeam, game.awayTeam, game.week, game.season
  );

  const home = getTeam(game.homeTeam);
  const away = getTeam(game.awayTeam);
  const live = game.status === "live" || isLiveNow(game.kickoff);

  const breadcrumb = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Predictions", url: "/predictions" },
    { name: `${away.name} vs ${home.name}`, url: `/games/${game.slug}` },
  ]);

  return (
    <div className="container py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <Link
        href="/predictions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to predictions
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={live ? "live" : "neon"}>
                {live ? "LIVE NOW" : `WEEK ${game.week}`}
              </Badge>
              {game.network && (
                <span className="text-sm text-muted-foreground">{game.network}</span>
              )}
              <span className="ml-auto flex items-center gap-1 text-xs text-[#FF6200] font-semibold">
                <TrendingUp className="h-3.5 w-3.5" />
                AI Prediction
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              {away.name} <span className="text-muted-foreground">@</span> {home.name}
            </h1>
          </div>

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
              <TeamBlock abbr={away.abbr} name={away.name} color={away.color} score={game.awayScore} isWinner={prediction?.predictedWinner === game.awayTeam} />
              <div className="text-center text-xs text-muted-foreground">at</div>
              <TeamBlock abbr={home.abbr} name={home.name} color={home.color} score={game.homeScore} isWinner={prediction?.predictedWinner === game.homeTeam} />
            </div>
          </div>

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
  abbr, name, color, score, isWinner,
}: {
  abbr: string; name: string; color: string; score?: number; isWinner?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between rounded-lg p-3 transition-colors ${isWinner ? "bg-[#FF6200]/10 border border-[#FF6200]/20" : "bg-secondary/40"}`}>
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-md text-xs font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {abbr}
        </span>
        <div>
          <span className="font-medium text-sm">{name}</span>
          {isWinner && (
            <p className="text-[10px] text-[#FF6200] font-semibold">Model Pick ✓</p>
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
