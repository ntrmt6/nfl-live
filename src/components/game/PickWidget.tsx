"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Flame, Lock, CheckCircle2, XCircle, Users } from "lucide-react";
import { useUser } from "@/context/UserContext";

interface Props {
  gameSlug: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamFull: string;
  awayTeamFull: string;
  gameStatus: "scheduled" | "live" | "final";
}

interface PickData {
  choice: "home" | "away" | null;
  correct?: boolean;
  streak: number;
}

interface PickCounts {
  home: number;
  away: number;
  total: number;
}

function logoUrl(abbr: string) {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr.toLowerCase()}.png`;
}

export function PickWidget({ gameSlug, homeTeam, awayTeam, homeTeamFull, awayTeamFull, gameStatus }: Props) {
  const { user } = useUser();
  const [data, setData] = useState<PickData>({ choice: null, streak: 0 });
  const [counts, setCounts] = useState<PickCounts>({ home: 0, away: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  // Fetch public pick counts (no auth required)
  useEffect(() => {
    fetch(`/api/picks/counts?gameSlug=${gameSlug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.total !== undefined) setCounts({ home: d.home, away: d.away, total: d.total });
      })
      .catch(() => {});
  }, [gameSlug]);

  // Fetch user's pick if logged in
  useEffect(() => {
    if (!user) return;
    fetch(`/api/picks?gameSlug=${gameSlug}`)
      .then((r) => r.json())
      .then((d) => {
        const myPick = d.picks?.find((p: { gameSlug: string }) => p.gameSlug === gameSlug);
        setData({ choice: myPick?.choice ?? null, correct: myPick?.correct, streak: d.stats?.streak ?? 0 });
      })
      .catch(() => {});
  }, [user, gameSlug]);

  async function makePick(choice: "home" | "away") {
    if (loading || gameStatus !== "scheduled") return;
    setLoading(true);
    const res = await fetch("/api/picks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameSlug, choice }),
    });
    const d = await res.json();
    if (d.pick) {
      const prev = data.choice;
      setData((prev_) => ({ ...prev_, choice: d.pick.choice }));
      // Update local counts optimistically
      setCounts((c) => {
        const next = { ...c };
        if (prev && prev !== choice) next[prev] = Math.max(0, next[prev] - 1);
        if (!prev) next.total = c.total + 1;
        if (prev !== choice) next[choice] = c[choice] + 1;
        return next;
      });
    }
    setLoading(false);
  }

  const locked = gameStatus !== "scheduled";

  const homePct = counts.total > 0 ? Math.round((counts.home / counts.total) * 100) : 50;
  const awayPct = counts.total > 0 ? 100 - homePct : 50;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="h-4 w-4 text-[#FF6200]" />
        <h3 className="font-semibold text-sm">Make Your Pick</h3>
        {user && data.streak > 0 && (
          <span className="ml-auto flex items-center gap-1 text-xs font-bold text-[#FF6200]">
            🔥 {data.streak}-game streak
          </span>
        )}
      </div>

      {!user ? (
        <div className="text-center py-3">
          <p className="text-xs text-muted-foreground mb-2">
            Log in to make picks and build your streak
          </p>
          <Link
            href="/profile"
            className="inline-block rounded-lg bg-[#FF6200] px-4 py-1.5 text-xs font-bold text-white"
          >
            Login / Register
          </Link>
        </div>
      ) : locked ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
          <Lock className="h-3.5 w-3.5" />
          <span>Picks locked — game has started</span>
          {data.choice && (
            <span className="ml-auto font-medium text-foreground">
              You picked: <strong>{data.choice === "home" ? homeTeamFull : awayTeamFull}</strong>
            </span>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {([["away", awayTeam, awayTeamFull], ["home", homeTeam, homeTeamFull]] as const).map(([side, abbr, full]) => {
            const chosen = data.choice === side;
            const resolved = data.correct !== undefined;
            const isCorrect = chosen && data.correct === true;
            const isWrong = chosen && data.correct === false;
            const pct = side === "home" ? homePct : awayPct;
            const sideCount = counts[side];

            return (
              <button
                key={side}
                onClick={() => makePick(side)}
                disabled={loading || locked}
                className={`relative flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all ${
                  isCorrect ? "border-green-500 bg-green-500/10"
                  : isWrong ? "border-red-500 bg-red-500/10"
                  : chosen ? "border-[#FF6200] bg-[#FF6200]/10"
                  : "border-border bg-secondary/40 hover:bg-secondary"
                }`}
              >
                {resolved && chosen && (
                  <span className="absolute top-1.5 right-1.5">
                    {isCorrect
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      : <XCircle className="h-3.5 w-3.5 text-red-500" />
                    }
                  </span>
                )}
                <div className="relative h-8 w-8">
                  <Image src={logoUrl(abbr)} alt={full} fill className="object-contain" unoptimized />
                </div>
                <span className="text-xs font-medium">{full.split(" ").slice(-1)[0]}</span>
                {counts.total > 0 && (
                  <span className="text-[10px] text-muted-foreground">{sideCount} pick{sideCount !== 1 ? "s" : ""} · {pct}%</span>
                )}
                {chosen && !resolved && (
                  <span className="text-[9px] text-[#FF6200] font-bold uppercase">Your Pick ✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Pick distribution bar */}
      {counts.total > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {counts.total} total pick{counts.total !== 1 ? "s" : ""}
            </span>
            {!user && <span className="text-[10px]">Login to pick</span>}
          </div>
          <div className="relative h-1.5 rounded-full bg-secondary overflow-hidden flex">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${awayPct}%` }}
            />
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${homePct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
            <span>{awayTeam} {awayPct}%</span>
            <span>{homeTeam} {homePct}%</span>
          </div>
        </div>
      )}

      <Link
        href="/leaderboard"
        className="block text-center text-[10px] text-muted-foreground hover:text-[#FF6200] mt-3 transition-colors"
      >
        View Pick'em Leaderboard →
      </Link>
    </div>
  );
}
