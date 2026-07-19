"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Flame, CheckCircle2, XCircle, Clock, Target } from "lucide-react";
import Link from "next/link";

interface Pick {
  _id: string;
  gameSlug: string;
  choice: "home" | "away";
  homeTeam: string;
  awayTeam: string;
  homeTeamFull: string;
  awayTeamFull: string;
  week: number;
  correct?: boolean;
  createdAt: string;
}

interface Stats {
  total: number;
  correct: number;
  resolved: number;
  streak: number;
}

function logoUrl(abbr: string) {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr.toLowerCase()}.png`;
}

export function MyPicksTab() {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, correct: 0, resolved: 0, streak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/picks")
      .then((r) => r.json())
      .then((d) => {
        setPicks(d.picks ?? []);
        setStats(d.stats ?? { total: 0, correct: 0, resolved: 0, streak: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground animate-pulse">Loading picks…</div>;
  }

  if (picks.length === 0) {
    return (
      <div className="py-12 text-center">
        <Target className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
        <p className="font-semibold text-muted-foreground">No picks yet</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Go to any game page and make your prediction!</p>
        <Link href="/" className="inline-block mt-4 rounded-lg bg-primary/20 text-primary px-4 py-2 text-sm font-semibold hover:bg-primary/30">
          Browse Games
        </Link>
      </div>
    );
  }

  const accuracy = stats.resolved > 0 ? Math.round((stats.correct / stats.resolved) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Correct", value: stats.correct, color: "text-green-500" },
          { label: "Accuracy", value: `${accuracy}%`, color: accuracy >= 60 ? "text-green-500" : "text-foreground" },
          { label: "Streak 🔥", value: stats.streak, color: "text-[#FF6200]" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-xl border border-border p-3 text-center">
            <p className={`text-xl font-black ${color}`}>{value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Pick list */}
      <div className="space-y-2">
        {picks.map((pick) => {
          const pickedTeam = pick.choice === "home" ? pick.homeTeam : pick.awayTeam;
          const pickedFull = pick.choice === "home" ? pick.homeTeamFull : pick.awayTeamFull;
          const isPending = pick.correct === undefined;
          const isCorrect = pick.correct === true;

          return (
            <Link key={pick._id} href={`/games/${pick.gameSlug}`} className="group block">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card hover:border-primary/30 hover:bg-secondary/30 transition-all">
                {/* Result icon */}
                <div className="shrink-0">
                  {isPending ? (
                    <Clock className="h-5 w-5 text-muted-foreground/50" />
                  ) : isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>

                {/* Teams */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Image src={logoUrl(pick.awayTeam)} alt={pick.awayTeam} width={24} height={24} unoptimized className="object-contain" />
                  <span className="text-[10px] text-muted-foreground font-bold">@</span>
                  <Image src={logoUrl(pick.homeTeam)} alt={pick.homeTeam} width={24} height={24} unoptimized className="object-contain" />
                </div>

                {/* Pick info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground/60">Week {pick.week}</p>
                  <p className="text-sm font-semibold text-foreground truncate">
                    Picked: <span className="text-[#FF6200]">{pickedFull}</span>
                  </p>
                </div>

                {/* Picked team logo */}
                <div className="shrink-0">
                  <Image src={logoUrl(pickedTeam)} alt={pickedTeam} width={32} height={32} unoptimized className="object-contain drop-shadow" />
                </div>

                {/* Result label */}
                <div className="shrink-0 text-right">
                  {isPending ? (
                    <span className="text-[10px] font-bold text-muted-foreground/50 uppercase bg-secondary/60 px-2 py-0.5 rounded-full">Pending</span>
                  ) : isCorrect ? (
                    <span className="text-[10px] font-black text-green-500 uppercase bg-green-500/10 px-2 py-0.5 rounded-full">Correct</span>
                  ) : (
                    <span className="text-[10px] font-black text-red-500 uppercase bg-red-500/10 px-2 py-0.5 rounded-full">Wrong</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <Link href="/leaderboard" className="block text-center text-xs text-[#00A8FF] hover:underline pt-2">
        View Pick'em Leaderboard →
      </Link>
    </div>
  );
}
