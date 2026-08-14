import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { getTeam } from "@/lib/teams";
import { GameDTO } from "@/types";

interface Props {
  currentSlug: string;
  homeTeam: string;
  awayTeam: string;
  week: number;
  games: GameDTO[];
}

export function RelatedGames({ currentSlug, homeTeam, awayTeam, week, games }: Props) {
  const others = games
    .filter((g) => g.slug !== currentSlug)
    .map((g) => {
      const involvesTeam = g.homeTeam === homeTeam || g.homeTeam === awayTeam || g.awayTeam === homeTeam || g.awayTeam === awayTeam;
      const sameWeek = g.week === week;
      const score = (involvesTeam ? 100 : 0) + (sameWeek ? 40 : 0) - Math.abs(g.week - week);
      return { game: g, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x) => x.game);

  if (others.length === 0) return null;

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Related Predictions</h2>
        <Link href="/predictions" className="text-xs font-bold text-[#FF6200] inline-flex items-center gap-1 hover:gap-1.5 transition-all">
          All picks <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {others.map((g) => {
          const home = getTeam(g.homeTeam);
          const away = getTeam(g.awayTeam);
          return (
            <Link
              key={g.slug}
              href={`/games/${g.slug}`}
              className="group flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:border-[#FF6200]/40 hover:bg-secondary/30 transition-all"
            >
              <div className="flex items-center gap-1.5 shrink-0">
                <TeamLogo abbr={away.abbr} size={24} />
                <span className="text-[10px] text-muted-foreground/60 font-bold">@</span>
                <TeamLogo abbr={home.abbr} size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate group-hover:text-[#FF6200] transition-colors">
                  {away.name} @ {home.name}
                </p>
                <p className="text-[10px] text-muted-foreground">Week {g.week} · {g.network || "TBD"}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-[#FF6200] shrink-0" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
