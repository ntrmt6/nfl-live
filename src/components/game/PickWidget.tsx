"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Flame, Lock, CheckCircle2, XCircle } from "lucide-react";
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

function logoUrl(abbr: string) {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr.toLowerCase()}.png`;
}

export function PickWidget({ gameSlug, homeTeam, awayTeam, homeTeamFull, awayTeamFull, gameStatus }: Props) {
  const { user } = useUser();
  const [data, setData] = useState<PickData>({ choice: null, streak: 0 });
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/picks?gameSlug=${gameSlug}`)
      .then((r) => r.json())
      .then((d) => {
        const myPick = d.picks?.find((p: { gameSlug: string }) => p.gameSlug === gameSlug);
        setData({ choice: myPick?.choice ?? null, correct: myPick?.correct, streak: d.stats?.streak ?? 0 });
        setFetched(true);
      });
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
    if (d.pick) setData((prev) => ({ ...prev, choice: d.pick.choice }));
    setLoading(false);
  }

  const locked = gameStatus !== "scheduled";

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
                {chosen && !resolved && (
                  <span className="text-[9px] text-[#FF6200] font-bold uppercase">Your Pick ✓</span>
                )}
              </button>
            );
          })}
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
