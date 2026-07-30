"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Target, ChevronLeft, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AccuracyByBucket {
  label: string;
  total: number;
  correct: number;
  accuracy: number;
}

interface WeeklyAccuracy {
  week: number;
  total: number;
  correct: number;
  accuracy: number;
}

interface AccuracyResponse {
  league: "nfl" | "cfb";
  season: number | null;
  seasons: number[];
  totalGraded: number;
  correct: number;
  accuracy: number;
  byWeek: WeeklyAccuracy[];
  byConfidence: AccuracyByBucket[];
}

const EMPTY: AccuracyResponse = {
  league: "nfl",
  season: null,
  seasons: [],
  totalGraded: 0,
  correct: 0,
  accuracy: 0,
  byWeek: [],
  byConfidence: [],
};

function barColor(accuracy: number) {
  if (accuracy >= 65) return "#22c55e";
  if (accuracy >= 50) return "#FF6200";
  return "#ef4444";
}

export default function AccuracyScoreboardPage() {
  const [league, setLeague] = useState<"nfl" | "cfb">("nfl");
  const [season, setSeason] = useState<number | null>(null);
  const [data, setData] = useState<AccuracyResponse>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ league });
    if (season) params.set("season", String(season));
    fetch(`/api/predictions/accuracy?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (!season) setSeason(d.season);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [league, season]);

  return (
    <div className="container py-10 max-w-3xl">
      <Link
        href="/leaderboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to leaderboard
      </Link>

      <div className="flex items-start justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Target className="h-7 w-7 text-[#FF6200]" />
          <div>
            <h1 className="text-2xl font-bold">AI Model Accuracy Scoreboard</h1>
            <p className="text-sm text-muted-foreground">
              Graded against final scores — not a self-reported number.
            </p>
          </div>
        </div>
        <Link
          href="/model"
          className="shrink-0 inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-[#FF6200]/50 transition-colors"
        >
          How it works →
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {(["nfl", "cfb"] as const).map((l) => (
          <button
            key={l}
            onClick={() => { setLeague(l); setSeason(null); }}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              league === l
                ? "bg-[#FF6200] text-white"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {l === "nfl" ? "NFL" : "College Football"}
          </button>
        ))}
        {data.seasons.length > 1 && (
          <div className="ml-auto flex items-center gap-2 overflow-x-auto scrollbar-none">
            {data.seasons.map((s) => (
              <button
                key={s}
                onClick={() => setSeason(s)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  season === s ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <div className="animate-pulse text-muted-foreground text-sm">Crunching results…</div>
        </div>
      ) : data.totalGraded === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Target className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-semibold">No graded games yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Once games go final, predictions get scored against the actual result here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-2xl font-black text-[#FF6200]">{data.accuracy}%</p>
              <p className="text-[11px] text-muted-foreground mt-1">Straight-up accuracy</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-2xl font-black">{data.correct}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Correct calls</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-2xl font-black">{data.totalGraded}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Games graded</p>
            </div>
          </div>

          {data.byWeek.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 mb-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold mb-4">
                <TrendingUp className="h-4 w-4 text-[#FF6200]" />
                Accuracy by Week
              </h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.byWeek} barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252d3d" vertical={false} />
                    <XAxis
                      dataKey="week"
                      tickFormatter={(w) => `Wk ${w}`}
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#161b27", border: "1px solid #252d3d", borderRadius: 8, fontSize: 12 }}
                      itemStyle={{ color: "#94a3b8" }}
                      formatter={((value: any, _name: any, props: any) => [`${value}% (${props.payload.correct}/${props.payload.total})`, "Accuracy"]) as any}
                      labelFormatter={(w) => `Week ${w}`}
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    />
                    <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                      {data.byWeek.map((w, i) => (
                        <Cell key={i} fill={barColor(w.accuracy)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {data.byConfidence.some((b) => b.total > 0) && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold mb-4">Accuracy by Model Confidence</h2>
              <div className="space-y-3">
                {data.byConfidence.filter((b) => b.total > 0).map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{b.label} confidence · {b.total} game{b.total !== 1 ? "s" : ""}</span>
                      <span className="font-bold" style={{ color: barColor(b.accuracy) }}>{b.accuracy}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${b.accuracy}%`, background: barColor(b.accuracy) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-4">
                If the model is well-calibrated, higher-confidence picks should hit more often than lower-confidence ones.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
