import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Brain, TrendingUp } from "lucide-react";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "NBA Schedule, Live Scores & Game Analysis",
  description: "Today's NBA schedule with live scores, final results, and AI-powered post-game analysis.",
  alternates: { canonical: absoluteUrl("/nba") },
};

interface NBAGame {
  id: string;
  date: string;
  home: { name: string; abbr: string; logo: string; score: string; color: string };
  away: { name: string; abbr: string; logo: string; score: string; color: string };
  statusName: string;
  statusText: string;
  isLive: boolean;
  isFinal: boolean;
  network: string;
  venue: string;
}

async function fetchNBAGames(): Promise<NBAGame[]> {
  try {
    const url = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?limit=50";
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();

    return (data.events || []).map((e: any) => {
      const comp = e.competitions?.[0];
      const home = comp?.competitors?.find((c: any) => c.homeAway === "home");
      const away = comp?.competitors?.find((c: any) => c.homeAway === "away");
      const statusName: string = e.status?.type?.name || "";
      const isLive = statusName.includes("IN_PROGRESS") || statusName.includes("HALFTIME");
      const isFinal = e.status?.type?.completed ?? false;

      return {
        id: e.id,
        date: e.date,
        home: {
          name: home?.team?.displayName || "Home",
          abbr: home?.team?.abbreviation || "HME",
          logo: home?.team?.logo || "",
          score: home?.score || "",
          color: `#${home?.team?.color || "C9082A"}`,
        },
        away: {
          name: away?.team?.displayName || "Away",
          abbr: away?.team?.abbreviation || "AWY",
          logo: away?.team?.logo || "",
          score: away?.score || "",
          color: `#${away?.team?.color || "003DA5"}`,
        },
        statusName,
        statusText: e.status?.type?.shortDetail || "",
        isLive,
        isFinal,
        network: comp?.broadcasts?.[0]?.names?.[0] || "",
        venue: comp?.venue?.fullName || "",
      };
    });
  } catch {
    return [];
  }
}

function GameCard({ game }: { game: NBAGame }) {
  const kickoff = new Date(game.date);
  return (
    <Link href={`/sport/nba/${game.id}`}>
      <div className={`rounded-xl border bg-card overflow-hidden transition-all hover:shadow-md hover:border-[#C9082A]/40 ${
        game.isLive ? "border-red-500/40 shadow-sm shadow-red-500/10" : "border-border"
      }`}>
        {/* Status bar */}
        <div className={`flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
          game.isLive ? "bg-red-500/10 text-red-400" :
          game.isFinal ? "bg-secondary/60 text-muted-foreground" :
          "bg-secondary/30 text-muted-foreground"
        }`}>
          <span className="flex items-center gap-1.5">
            {game.isLive && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />}
            {game.statusText}
          </span>
          {game.network && <span className="text-muted-foreground/70">{game.network}</span>}
        </div>

        {/* Teams */}
        <div className="p-4 space-y-3">
          {[game.away, game.home].map((team, i) => (
            <div key={i} className="flex items-center gap-3">
              {team.logo ? (
                <img src={team.logo} alt={team.name} width={32} height={32} className="object-contain rounded shrink-0" />
              ) : (
                <div className="h-8 w-8 rounded shrink-0 flex items-center justify-center text-[9px] font-black text-white"
                  style={{ background: team.color }}>
                  {team.abbr.slice(0, 3)}
                </div>
              )}
              <span className="flex-1 text-sm font-semibold truncate">{team.name}</span>
              {(game.isLive || game.isFinal) && team.score && (
                <span className={`text-lg font-black tabular-nums ${game.isLive ? "text-[#FF6200]" : "text-foreground"}`}>
                  {team.score}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 pb-3 flex items-center justify-between border-t border-border/50 pt-2">
          <span className="text-[10px] text-muted-foreground">
            {!game.isLive && !game.isFinal
              ? kickoff.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
              : game.venue}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-[#FF6200] font-semibold">
            <Brain className="h-3 w-3" />
            {game.isFinal ? "Recap & Analysis →" : "AI Prediction →"}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function NBAPage() {
  const games = await fetchNBAGames();

  const liveGames = games.filter(g => g.isLive);
  const finalGames = games.filter(g => g.isFinal);
  const upcomingGames = games.filter(g => !g.isLive && !g.isFinal);

  return (
    <div className="container py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 rounded-full bg-[#C9082A]" />
          <h1 className="text-3xl font-black tracking-tight">NBA</h1>
          {liveGames.length > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-bold text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              {liveGames.length} LIVE
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm">
          Schedule, live scores, final results, and AI-powered game analysis.
        </p>
      </div>

      {/* Live games */}
      {liveGames.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-sm font-black uppercase tracking-widest text-red-400">Live Now</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {liveGames.map(g => <GameCard key={g.id} game={g} />)}
          </div>
        </section>
      )}

      {/* Final results */}
      {finalGames.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Results & Recaps</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {finalGames.map(g => <GameCard key={g.id} game={g} />)}
          </div>
        </section>
      )}

      {/* Upcoming */}
      {upcomingGames.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Upcoming</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcomingGames.map(g => <GameCard key={g.id} game={g} />)}
          </div>
        </section>
      )}

      {/* Empty state */}
      {games.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <CalendarDays className="h-10 w-10 opacity-20" />
          <p className="text-sm font-medium">No NBA games scheduled right now.</p>
          <p className="text-xs">Check back during the NBA season (October – June).</p>
          <Link href="/" className="mt-2 text-xs text-[#FF6200] hover:underline">← Back to all sports</Link>
        </div>
      )}
    </div>
  );
}
