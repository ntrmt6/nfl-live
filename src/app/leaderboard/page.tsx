"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Flame, Target, Users } from "lucide-react";

interface LeaderboardEntry {
  userId: string;
  username: string;
  total: number;
  correct: number;
  wrong: number;
  resolved: number;
  accuracy: number;
  streak: number;
  bestStreak: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  seasons: number[];
  season: number | null;
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponse>({ leaderboard: [], seasons: [], season: null });
  const [selectedSeason, setSelectedSeason] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qs = selectedSeason === "all" ? "" : `?season=${selectedSeason}`;
    fetch(`/api/picks/leaderboard${qs}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedSeason]);

  const { leaderboard, seasons } = data;

  return (
    <div className="container py-10 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-7 w-7 text-[#FF6200]" />
        <div>
          <h1 className="text-2xl font-bold">Pick'em Leaderboard</h1>
          <p className="text-sm text-muted-foreground">Ranked by correct picks · updated every minute</p>
        </div>
      </div>

      {seasons.length > 0 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedSeason("all")}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              selectedSeason === "all"
                ? "bg-[#FF6200] text-white"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All-Time
          </button>
          {seasons.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSeason(s)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedSeason === s
                  ? "bg-[#FF6200] text-white"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {s} Season
            </button>
          ))}
        </div>
      )}

      <Link
        href="/leagues"
        className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-[#FF6200]/40 transition-colors"
      >
        <Users className="h-5 w-5 text-[#FF6200] shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold">Compete with friends</p>
          <p className="text-xs text-muted-foreground">Create or join a private league to see how your picks stack up against people you know.</p>
        </div>
        <span className="text-xs font-semibold text-[#FF6200]">View Leagues →</span>
      </Link>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <div className="animate-pulse text-muted-foreground text-sm">Loading standings…</div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Trophy className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-semibold">No picks yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Be the first! Go to any game page and make your pick.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_80px_80px_80px] gap-0 border-b border-border bg-secondary/40 px-4 py-2.5 text-xs font-medium text-muted-foreground">
            <span>#</span>
            <span>User</span>
            <span className="text-center">Streak</span>
            <span className="text-center">Record</span>
            <span className="text-center">Accuracy</span>
          </div>

          {leaderboard.map((entry, i) => {
            const pending = entry.total - entry.resolved;
            return (
              <div
                key={entry.userId}
                className={`grid grid-cols-[40px_1fr_80px_80px_80px] gap-0 items-center px-4 py-3 border-b border-border/50 last:border-0 ${
                  i === 0 ? "bg-[#FF6200]/5" : ""
                }`}
              >
                <span className={`text-sm font-bold ${i === 0 ? "text-[#FF6200]" : i < 3 ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </span>

                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{entry.username}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {entry.total} pick{entry.total !== 1 ? "s" : ""}
                    {pending > 0 ? ` · ${pending} pending` : ""}
                    {entry.bestStreak > 0 ? ` · Best: ${entry.bestStreak}🔥` : ""}
                  </p>
                </div>

                <div className="text-center">
                  {entry.streak > 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-sm font-bold text-[#FF6200]">
                      <Flame className="h-3.5 w-3.5" />
                      {entry.streak}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>

                <div className="text-center">
                  {entry.resolved > 0 ? (
                    <span className="text-sm font-medium">
                      {entry.correct}–{entry.wrong}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>

                <div className="text-center">
                  {entry.resolved > 0 ? (
                    <span className={`text-sm font-bold ${entry.accuracy >= 60 ? "text-green-500" : entry.accuracy >= 50 ? "text-foreground" : "text-muted-foreground"}`}>
                      {entry.accuracy}%
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Link
        href="/predictions/accuracy"
        className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-[#FF6200]/40 transition-colors"
      >
        <Target className="h-5 w-5 text-[#FF6200] shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold">How accurate is the AI model?</p>
          <p className="text-xs text-muted-foreground">See real hit-rate stats tracked against final scores, broken down by week and confidence.</p>
        </div>
        <span className="text-xs font-semibold text-[#FF6200]">View Scoreboard →</span>
      </Link>

      <div className="mt-4 rounded-xl border border-border bg-card p-4 flex items-start gap-3">
        <Trophy className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">How it works:</strong> Make a pick on any game page before kickoff.
          Correct picks build your streak. Rankings update once games are resolved.
          Picks lock when the game starts.
        </div>
      </div>
    </div>
  );
}
