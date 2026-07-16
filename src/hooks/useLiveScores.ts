"use client";

import { useCallback, useEffect, useState } from "react";
import type { LiveGameScore } from "@/types";

export type LiveScoresMap = Map<string, LiveGameScore>;

export function useLiveScores(pollIntervalMs = 30_000): LiveScoresMap {
  const [scores, setScores] = useState<LiveScoresMap>(new Map());

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch("/api/live-scores");
      if (!res.ok) return;
      const data: { games: LiveGameScore[] } = await res.json();
      const map = new Map<string, LiveGameScore>();
      for (const g of data.games ?? []) {
        map.set(g.key, g);
      }
      setScores(map);
    } catch {
      // Live scores are an enhancement — fail silently
    }
  }, []);

  useEffect(() => {
    fetchScores();
    const id = setInterval(fetchScores, pollIntervalMs);
    return () => clearInterval(id);
  }, [fetchScores, pollIntervalMs]);

  return scores;
}
