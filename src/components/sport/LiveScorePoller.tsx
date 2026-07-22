"use client";

import { useEffect, useState } from "react";

interface Props {
  espnSlug: string;
  gameId: string;
  initialHome: { name: string; score: string; logo: string };
  initialAway: { name: string; score: string; logo: string };
  initialStatusText: string;
}

interface Scores {
  homeScore: string;
  awayScore: string;
  statusText: string;
  isLive: boolean;
  isFinal: boolean;
}

export function LiveScorePoller({ espnSlug, gameId, initialHome, initialAway, initialStatusText }: Props) {
  const [scores, setScores] = useState<Scores>({
    homeScore: initialHome.score,
    awayScore: initialAway.score,
    statusText: initialStatusText,
    isLive: true,
    isFinal: false,
  });

  useEffect(() => {
    async function poll() {
      try {
        const url = `https://site.api.espn.com/apis/site/v2/sports/${espnSlug}/summary?event=${gameId}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const gameData = data.header?.competitions?.[0];
        if (!gameData) return;
        const home = gameData.competitors?.find((c: any) => c.homeAway === "home");
        const away = gameData.competitors?.find((c: any) => c.homeAway === "away");
        const statusName = gameData.status?.type?.name || "";
        const isLive = statusName.includes("IN_PROGRESS") || statusName.includes("HALFTIME");
        const isFinal = gameData.status?.type?.completed ?? false;
        setScores({
          homeScore: home?.score || "0",
          awayScore: away?.score || "0",
          statusText: gameData.status?.type?.shortDetail || "",
          isLive,
          isFinal,
        });
      } catch {
        // ignore poll errors
      }
    }

    poll();
    const interval = setInterval(poll, 30_000);
    return () => clearInterval(interval);
  }, [espnSlug, gameId]);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
        {scores.isFinal ? "Final Score" : "Live Score"}
        {scores.isLive && (
          <span className="flex items-center gap-1 text-xs text-red-400 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
        )}
      </h2>
      <div className="flex items-center justify-around py-4">
        <div className="flex flex-col items-center gap-2">
          {initialAway.logo && <img src={initialAway.logo} alt={initialAway.name} width={52} height={52} className="object-contain" />}
          <span className="text-sm font-semibold">{initialAway.name}</span>
          <span className="text-4xl font-black text-foreground">{scores.awayScore}</span>
          <span className="text-xs text-muted-foreground">AWAY</span>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-muted-foreground/30">VS</p>
          {scores.isLive && <p className="text-xs text-red-400 font-bold animate-pulse">{scores.statusText}</p>}
          {scores.isFinal && <p className="text-xs text-muted-foreground font-bold">FINAL</p>}
        </div>
        <div className="flex flex-col items-center gap-2">
          {initialHome.logo && <img src={initialHome.logo} alt={initialHome.name} width={52} height={52} className="object-contain" />}
          <span className="text-sm font-semibold">{initialHome.name}</span>
          <span className="text-4xl font-black text-foreground">{scores.homeScore}</span>
          <span className="text-xs text-muted-foreground">HOME</span>
        </div>
      </div>
    </div>
  );
}
