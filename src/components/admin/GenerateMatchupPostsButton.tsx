"use client";

import { useState } from "react";
import { Wand2, ChevronDown } from "lucide-react";

interface GameStatus {
  awayTeam: string;
  homeTeam: string;
  week: number;
  season: number;
  kickoff: string;
  hasPost: boolean;
}

interface Result {
  message: string;
  created: number;
  skipped: number;
  total: number;
  errors?: string[];
}

export function GenerateMatchupPostsButton() {
  const [open, setOpen] = useState(false);
  const [week, setWeek] = useState("");
  const [season, setSeason] = useState("2026");
  const [overwrite, setOverwrite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [games, setGames] = useState<GameStatus[] | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadPreview() {
    setPreviewing(true);
    setGames(null);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (week) params.set("week", week);
      if (season) params.set("season", season);
      const res = await fetch(`/api/admin/generate-matchup-posts?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load games");
      setGames(data.games);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setPreviewing(false);
    }
  }

  async function generate() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/generate-matchup-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week: week ? Number(week) : undefined,
          season: season ? Number(season) : undefined,
          overwrite,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data);
      setGames(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const missing = games ? games.filter((g) => !g.hasPost).length : 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-semibold hover:bg-secondary/80 transition-colors"
      >
        <Wand2 className="h-4 w-4 text-[#FF6200]" />
        Auto-Generate Posts
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 rounded-xl border border-border bg-card p-4 shadow-xl z-50">
          <h3 className="font-bold text-sm mb-3">Generate Matchup Preview Posts</h3>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Week (blank = all)</label>
              <input
                type="number"
                min={1}
                max={22}
                value={week}
                onChange={(e) => { setWeek(e.target.value); setGames(null); setResult(null); }}
                placeholder="e.g. 1"
                className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Season</label>
              <input
                type="number"
                min={2020}
                max={2030}
                value={season}
                onChange={(e) => { setSeason(e.target.value); setGames(null); setResult(null); }}
                className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-muted-foreground mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={overwrite}
              onChange={(e) => setOverwrite(e.target.checked)}
              className="rounded"
            />
            Overwrite existing posts
          </label>

          {games && (
            <div className="mb-3 rounded-lg border border-border bg-secondary/40 p-2.5 max-h-48 overflow-y-auto">
              <p className="text-xs font-medium mb-1.5">
                {games.length} games — <span className="text-[#FF6200]">{missing} missing posts</span>, {games.length - missing} already done
              </p>
              {games.map((g, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-0.5">
                  <span className="text-muted-foreground">{g.awayTeam} @ {g.homeTeam} W{g.week}</span>
                  <span className={g.hasPost ? "text-green-500" : "text-[#FF6200]"}>
                    {g.hasPost ? "✓ exists" : "missing"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {result && (
            <div className="mb-3 rounded-lg border border-green-500/30 bg-green-500/10 p-2.5 text-xs">
              <p className="font-medium text-green-400">{result.message}</p>
              {result.errors && result.errors.length > 0 && (
                <div className="mt-1.5 text-red-400">
                  <p className="font-medium">Errors:</p>
                  {result.errors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={loadPreview}
              disabled={previewing || loading}
              className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {previewing ? "Loading…" : "Preview"}
            </button>
            <button
              onClick={generate}
              disabled={loading || previewing}
              className="flex-1 rounded-lg bg-[#FF6200] px-3 py-2 text-xs font-bold text-white hover:bg-[#FF6200]/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Generating…" : `Generate${missing > 0 ? ` (${missing})` : ""}`}
            </button>
          </div>

          <p className="mt-2 text-[10px] text-muted-foreground">
            Uses Claude AI. Each post takes ~5s. Large batches may take several minutes.
          </p>
        </div>
      )}
    </div>
  );
}
