"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Users } from "lucide-react";

interface Props {
  gameSlug: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamFull: string;
  awayTeamFull: string;
}

interface VoteData {
  home: number;
  away: number;
  total: number;
  userChoice: "home" | "away" | null;
}

function logoUrl(abbr: string) {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr.toLowerCase()}.png`;
}

export function WisdomOfCrowd({ gameSlug, homeTeam, awayTeam, homeTeamFull, awayTeamFull }: Props) {
  const [data, setData] = useState<VoteData | null>(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetch(`/api/votes/${gameSlug}`)
      .then((r) => r.json())
      .then(setData);
  }, [gameSlug]);

  async function vote(choice: "home" | "away") {
    if (voting) return;
    setVoting(true);
    const res = await fetch(`/api/votes/${gameSlug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice }),
    });
    const updated = await res.json();
    setData(updated);
    setVoting(false);
  }

  const homePct = data && data.total > 0 ? Math.round((data.home / data.total) * 100) : 50;
  const awayPct = data && data.total > 0 ? Math.round((data.away / data.total) * 100) : 50;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-4 w-4 text-[#FF6200]" />
        <h3 className="font-semibold text-sm">Wisdom of the Crowd</h3>
        {data && (
          <span className="ml-auto text-xs text-muted-foreground">{data.total.toLocaleString()} votes</span>
        )}
      </div>

      {/* Percentage bar */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold text-[#FF6200] w-8 text-right">{awayPct}%</span>
        <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FF6200] to-[#00A8FF] transition-all duration-500"
            style={{ width: `${awayPct}%` }}
          />
        </div>
        <span className="text-xs font-bold text-[#00A8FF] w-8">{homePct}%</span>
      </div>

      {/* Team vote buttons */}
      <div className="grid grid-cols-2 gap-2">
        {([["away", awayTeam, awayTeamFull], ["home", homeTeam, homeTeamFull]] as const).map(([side, abbr, full]) => {
          const chosen = data?.userChoice === side;
          return (
            <button
              key={side}
              onClick={() => vote(side)}
              disabled={voting}
              className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all ${
                chosen
                  ? "border-[#FF6200] bg-[#FF6200]/10"
                  : "border-border bg-secondary/40 hover:bg-secondary hover:border-border/80"
              }`}
            >
              <div className="relative h-8 w-8">
                <Image
                  src={logoUrl(abbr)}
                  alt={full}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-xs font-medium leading-none text-center">{full.split(" ").slice(-1)[0]}</span>
              {chosen && <span className="text-[9px] text-[#FF6200] font-bold uppercase">Your Pick</span>}
            </button>
          );
        })}
      </div>

      {!data?.userChoice && (
        <p className="text-center text-[10px] text-muted-foreground mt-2">
          Select a team to cast your vote
        </p>
      )}
    </div>
  );
}
