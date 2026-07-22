import type { Metadata } from "next";
import { Trophy, Flame, Target } from "lucide-react";

export const metadata: Metadata = {
  title: "Pick'em Leaderboard | NFL Predictions Hub",
  description: "See who's on the hottest pick'em streak. The NFL Predictions Hub community leaderboard — ranked by current streak and prediction accuracy.",
};

export const revalidate = 60;

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

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/picks/leaderboard`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.leaderboard ?? [];
  } catch {
    return [];
  }
}

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();

  return (
    <div className="container py-10 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="h-7 w-7 text-[#FF6200]" />
        <div>
          <h1 className="text-2xl font-bold">Pick'em Leaderboard</h1>
          <p className="text-sm text-muted-foreground">Ranked by correct picks · updated every minute</p>
        </div>
      </div>

      {leaderboard.length === 0 ? (
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

                <div>
                  <p className="font-semibold text-sm">{entry.username}</p>
                  <p className="text-[10px] text-muted-foreground">
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

      <div className="mt-6 rounded-xl border border-border bg-card p-4 flex items-start gap-3">
        <Target className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">How it works:</strong> Make a pick on any game page before kickoff.
          Correct picks build your streak. Rankings update once games are resolved.
          Picks lock when the game starts.
        </div>
      </div>
    </div>
  );
}
