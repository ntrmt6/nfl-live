"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, CalendarDays, Loader2, RefreshCw, ExternalLink } from "lucide-react";
// ExternalLink kept for the CFB full-predictions link below
import { ScheduleGrid } from "@/components/home/ScheduleGrid";
import { GameDTO } from "@/types";
import { CollegeGameDTO } from "@/models/CollegeGame";
import { cn } from "@/lib/utils";
import type { LiveScoresMap } from "@/hooks/useLiveScores";

// ── League config ─────────────────────────────────────────────
interface League {
  id: string;
  label: string;
  shortLabel: string;
  sport: string;
  espnSlug: string;
  color: string;
  abbr: string;
  detailBase?: string; // internal page base path
}

const LEAGUES: League[] = [
  { id: "nfl",   label: "NFL",              shortLabel: "NFL",   sport: "football",    espnSlug: "football/nfl",                         color: "#013369", abbr: "NFL", detailBase: "/games" },
  { id: "cfb",   label: "College Football", shortLabel: "CFB",   sport: "football",    espnSlug: "football/college-football",            color: "#FF6200", abbr: "CFB", detailBase: "/college-football" },
  { id: "nba",   label: "NBA",              shortLabel: "NBA",   sport: "basketball",  espnSlug: "basketball/nba",                       color: "#C9082A", abbr: "NBA" },
  { id: "ncaab", label: "NCAA Basketball",  shortLabel: "NCAA",  sport: "basketball",  espnSlug: "basketball/mens-college-basketball",   color: "#003087", abbr: "NCAAB" },
  { id: "epl",   label: "Premier League",   shortLabel: "EPL",   sport: "soccer",      espnSlug: "soccer/eng.1",                         color: "#3D195B", abbr: "EPL" },
  { id: "laliga",label: "La Liga",           shortLabel: "LaLiga",sport: "soccer",      espnSlug: "soccer/esp.1",                         color: "#EE3124", abbr: "LaLiga" },
  { id: "ucl",   label: "Champions League", shortLabel: "UCL",   sport: "soccer",      espnSlug: "soccer/UEFA.CHAMPIONS",                color: "#001D6E", abbr: "UCL" },
  { id: "mls",   label: "MLS",              shortLabel: "MLS",   sport: "soccer",      espnSlug: "soccer/usa.1",                         color: "#005293", abbr: "MLS" },
  { id: "seriea",label: "Serie A",           shortLabel: "SerieA",sport: "soccer",      espnSlug: "soccer/ita.1",                         color: "#024494", abbr: "SerieA" },
  { id: "bundes",label: "Bundesliga",        shortLabel: "Bundes",sport: "soccer",      espnSlug: "soccer/ger.1",                         color: "#D20515", abbr: "Bundes" },
  { id: "mlb",   label: "MLB",              shortLabel: "MLB",   sport: "baseball",    espnSlug: "baseball/mlb",                         color: "#002D72", abbr: "MLB" },
  { id: "nhl",   label: "NHL",              shortLabel: "NHL",   sport: "hockey",      espnSlug: "hockey/nhl",                           color: "#000099", abbr: "NHL" },
];

// ── ESPN game shape ────────────────────────────────────────────
interface EspnTeam { displayName: string; abbreviation: string; logo?: string; color?: string; score?: string }
interface EspnGame {
  id: string;
  name: string;
  date: string;
  status: { type: { name: string; shortDetail: string; completed: boolean } };
  home: EspnTeam;
  away: EspnTeam;
  network?: string;
  venue?: string;
  links?: { href: string }[];
}

async function fetchEspnGames(espnSlug: string): Promise<EspnGame[]> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${espnSlug}/scoreboard?limit=50`;
  const res = await fetch(url, { next: { revalidate: 120 } });
  if (!res.ok) throw new Error(`ESPN error ${res.status}`);
  const data = await res.json();
  const events = data.events || [];

  return events.map((e: any) => {
    const comp = e.competitions?.[0];
    const home = comp?.competitors?.find((c: any) => c.homeAway === "home");
    const away = comp?.competitors?.find((c: any) => c.homeAway === "away");
    return {
      id: e.id,
      name: e.name,
      date: e.date,
      status: e.status,
      home: { displayName: home?.team?.displayName || "Home", abbreviation: home?.team?.abbreviation || "H", logo: home?.team?.logo, color: home?.team?.color, score: home?.score },
      away: { displayName: away?.team?.displayName || "Away", abbreviation: away?.team?.abbreviation || "A", logo: away?.team?.logo, color: away?.team?.color, score: away?.score },
      network: comp?.broadcasts?.[0]?.names?.[0],
      venue: comp?.venue?.fullName,
      links: e.links,
    };
  });
}

function statusLabel(status: EspnGame["status"]): { text: string; variant: "live" | "final" | "upcoming" } {
  const name = status.type.name;
  if (name.includes("IN_PROGRESS") || name.includes("HALFTIME") || name === "STATUS_IN_PROGRESS") return { text: status.type.shortDetail || "LIVE", variant: "live" };
  if (status.type.completed) return { text: "FINAL", variant: "final" };
  return { text: status.type.shortDetail || new Date(status.type.shortDetail).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }), variant: "upcoming" };
}

// ── Generic ESPN game card (links to internal sport page) ─────
function EspnGameCard({ game, league }: { game: EspnGame; league: League }) {
  const { text: statusText, variant } = statusLabel(game.status);
  const isLive = variant === "live";
  const isFinal = variant === "final";
  const kickoff = new Date(game.date);
  const internalHref = `/sport/${league.id}/${game.id}`;

  const cardContent = (
    <div className={cn(
      "rounded-xl border bg-card overflow-hidden transition-all hover:shadow-md hover:border-[#FF6200]/40",
      isLive ? "border-red-500/40 shadow-sm shadow-red-500/10" : "border-border"
    )}>
      {/* Status bar */}
      <div className={cn(
        "flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider",
        isLive ? "bg-red-500/10 text-red-400" : isFinal ? "bg-secondary/60 text-muted-foreground" : "bg-secondary/30 text-muted-foreground"
      )}>
        <span className="flex items-center gap-1.5">
          {isLive && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />}
          {statusText}
        </span>
        {game.network && <span className="text-muted-foreground/70">{game.network}</span>}
      </div>

      {/* Teams */}
      <div className="p-3 space-y-2">
        {[game.away, game.home].map((team, i) => (
          <div key={i} className="flex items-center gap-2.5">
            {team.logo ? (
              <img src={team.logo} alt={team.displayName} width={28} height={28} className="object-contain rounded shrink-0" />
            ) : (
              <div className="h-7 w-7 rounded shrink-0 flex items-center justify-center text-[9px] font-black text-white" style={{ background: team.color ? `#${team.color}` : "#555" }}>
                {team.abbreviation.slice(0, 3)}
              </div>
            )}
            <span className="flex-1 text-xs font-semibold truncate">{team.displayName}</span>
            {(isLive || isFinal) && team.score != null && (
              <span className={cn("text-sm font-black tabular-nums", isLive && "text-[#FF6200]")}>{team.score}</span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 pb-2.5 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {!isLive && !isFinal && kickoff.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          {(isLive || isFinal) && game.venue && <span className="truncate">{game.venue}</span>}
        </span>
        <span className="text-[10px] text-[#FF6200] font-semibold">AI Prediction →</span>
      </div>
    </div>
  );

  return <Link href={internalHref}>{cardContent}</Link>;
}

// ── CFB card (links internally) ────────────────────────────────
function CfbGameCard({ game }: { game: CollegeGameDTO }) {
  const kickoff = new Date(game.kickoff);
  const isUpcoming = kickoff > new Date();
  return (
    <Link href={`/college-football/${game.slug}`}>
      <div className="rounded-xl border border-border bg-card hover:border-[#FF6200]/40 hover:shadow-md transition-all overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 bg-secondary/30 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          <span>{game.isBowlGame ? game.bowlName || "Bowl" : `Week ${game.week}`}</span>
          <span>{game.network || ""}</span>
        </div>
        <div className="p-3 space-y-2">
          {[{ name: game.awayTeamFull, side: "Away" }, { name: game.homeTeamFull, side: "Home" }].map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-secondary/60 flex items-center justify-center text-[9px] font-black text-muted-foreground shrink-0">
                {(i === 0 ? game.awayTeam : game.homeTeam).slice(0, 3)}
              </div>
              <span className="flex-1 text-xs font-semibold truncate">{t.name}</span>
              <span className="text-[9px] text-muted-foreground">{t.side}</span>
            </div>
          ))}
        </div>
        <div className="px-3 pb-2 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {kickoff.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          <span className="text-[10px] text-[#FF6200] font-semibold">View Prediction →</span>
        </div>
      </div>
    </Link>
  );
}

// ── ESPN tab content ───────────────────────────────────────────
function EspnTabContent({ league }: { league: League }) {
  const [games, setGames] = useState<EspnGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEspnGames(league.espnSlug);
      setGames(data);
    } catch (e) {
      setError("Could not load schedule. ESPN may be unavailable.");
    } finally {
      setLoading(false);
    }
  }, [league.espnSlug]);

  useEffect(() => { load(); }, [load]);

  const filtered = games.filter(g =>
    query.trim() === "" ||
    `${g.home.displayName} ${g.away.displayName}`.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin text-[#FF6200]" />
      <p className="text-sm">Loading {league.label} schedule…</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
      <CalendarDays className="h-8 w-8 opacity-20" />
      <p className="text-sm font-medium">{error}</p>
      <button onClick={load} className="flex items-center gap-1.5 text-xs text-[#FF6200] hover:underline">
        <RefreshCw className="h-3.5 w-3.5" /> Retry
      </button>
    </div>
  );

  if (games.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
      <CalendarDays className="h-8 w-8 opacity-20" />
      <p className="text-sm font-medium">No games scheduled right now.</p>
      <p className="text-xs">Check back during the {league.label} season.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{filtered.length} game{filtered.length !== 1 ? "s" : ""}</span>
        <div className="flex-1" />
        <div className="relative w-44">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            placeholder="Search teams…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-8 h-7 text-xs rounded-md border border-border bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#FF6200]/40"
          />
        </div>
        <button onClick={load} className="h-7 w-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map(g => <EspnGameCard key={g.id} game={g} league={league} />)}
      </div>
    </div>
  );
}

// ── Main exported component ────────────────────────────────────
interface SportsScheduleTabsProps {
  nflGames: GameDTO[];
  cfbGames: CollegeGameDTO[];
  liveScores?: LiveScoresMap;
}

export function SportsScheduleTabs({ nflGames, cfbGames, liveScores }: SportsScheduleTabsProps) {
  const [activeId, setActiveId] = useState("nfl");
  const active = LEAGUES.find(l => l.id === activeId) ?? LEAGUES[0];

  return (
    <section id="schedule" className="scroll-mt-20 space-y-3">
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5 -mx-1 px-1">
        {LEAGUES.map(league => {
          const isActive = activeId === league.id;
          return (
            <button
              key={league.id}
              onClick={() => setActiveId(league.id)}
              className={cn(
                "shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all border",
                isActive
                  ? "text-white border-transparent shadow-sm"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-border/80 bg-transparent"
              )}
              style={isActive ? { background: league.color } : undefined}
            >
              <LeagueIcon id={league.id} size={12} />
              {league.shortLabel}
            </button>
          );
        })}
      </div>

      {/* Active league header */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-1 rounded-full" style={{ background: active.color }} />
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: active.color }}>
          {active.label}
        </span>
        {active.id === "cfb" && (
          <Link href="/college-football" className="ml-auto text-[10px] text-[#FF6200] hover:underline flex items-center gap-1">
            Full CFB Predictions <ExternalLink className="h-2.5 w-2.5" />
          </Link>
        )}
      </div>

      {/* Tab content */}
      {active.id === "nfl" && (
        <ScheduleGrid games={nflGames} liveScores={liveScores} />
      )}

      {active.id === "cfb" && (
        cfbGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {cfbGames.slice(0, 60).map(g => <CfbGameCard key={g._id} game={g} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
            <CalendarDays className="h-8 w-8 opacity-20" />
            <p className="text-sm font-medium">CFB schedule loading…</p>
            <Link href="/college-football" className="text-xs text-[#FF6200] hover:underline">View CFB Predictions →</Link>
          </div>
        )
      )}

      {active.id !== "nfl" && active.id !== "cfb" && (
        <EspnTabContent league={active} />
      )}
    </section>
  );
}

// ── Tiny inline sport icons (SVG paths) ───────────────────────
function LeagueIcon({ id, size = 14 }: { id: string; size?: number }) {
  const s = size;
  switch (id) {
    case "nfl": case "cfb":
      // American football
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <ellipse cx="12" cy="12" rx="9" ry="6" />
          <path d="M7 12h10M12 8.5v7" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "nba": case "ncaab":
      // Basketball
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c0 3-3 6-3 9s3 6 3 9M12 3c0 3 3 6 3 9s-3 6-3 9" stroke="white" strokeWidth="1.2" fill="none" />
        </svg>
      );
    case "mlb":
      // Baseball
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="9" />
          <path d="M6 6c2 1.5 2 9 0 12M18 6c-2 1.5-2 9 0 12" stroke="white" strokeWidth="1.2" fill="none" />
        </svg>
      );
    case "nhl":
      // Hockey puck shape
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <ellipse cx="12" cy="14" rx="9" ry="5" />
          <path d="M3 11v3c0 2.8 4 5 9 5s9-2.2 9-5v-3" fill="none" stroke="currentColor" strokeWidth="0" />
          <rect x="3" y="9" width="18" height="6" rx="9" />
        </svg>
      );
    default:
      // Soccer ball
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="9" />
          <polygon points="12,6 14.5,9.5 18,8.5 17,12.5 19.5,15 16,15.5 14.5,19 12,16.5 9.5,19 8,15.5 4.5,15 7,12.5 6,8.5 9.5,9.5" fill="none" stroke="white" strokeWidth="1" />
        </svg>
      );
  }
}
