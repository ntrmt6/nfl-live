import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import Prediction, { IPrediction } from "@/models/Prediction";
import { getTeam } from "@/lib/teams";
import { absoluteUrl } from "@/lib/utils";
import { PredictionsRefreshButton } from "@/components/predictions/PredictionsRefreshButton";
import { Brain, TrendingUp, Target, BarChart3, Calendar, Zap } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "NFL Game Predictions | AI-Powered Win Probabilities",
  description:
    "Machine learning predictions for upcoming NFL games. XGBoost model trained on 4 seasons of EPA and team efficiency data. Win probabilities, confidence scores, and model analytics.",
  alternates: { canonical: absoluteUrl("/predictions") },
};

async function getPredictions() {
  try {
    await connectDB();
    const now = new Date();
    const [predictions, meta] = await Promise.all([
      Prediction.find({ _type: { $exists: false }, kickoff: { $gte: now } })
        .sort({ kickoff: 1 })
        .limit(64)
        .lean(),
      Prediction.findOne({ _type: "model_meta" }).lean(),
    ]);
    return { predictions: predictions as IPrediction[], meta: meta as IPrediction | null };
  } catch {
    return { predictions: [], meta: null };
  }
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const label = confidence >= 75 ? "High" : confidence >= 60 ? "Medium" : "Low";
  const cls =
    confidence >= 75
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : confidence >= 60
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
      : "bg-slate-500/15 text-slate-400 border-slate-500/30";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
      <Zap className="h-2.5 w-2.5" />
      {label} ({confidence.toFixed(0)}%)
    </span>
  );
}

function ProbBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function TeamBlock({
  abbr,
  fullName,
  winPct,
  isWinner,
  side,
}: {
  abbr: string;
  fullName: string;
  winPct: number;
  isWinner: boolean;
  side: "home" | "away";
}) {
  const team = getTeam(abbr);
  return (
    <div className={`flex flex-col gap-2 flex-1 ${side === "away" ? "items-start" : "items-end"}`}>
      <div className={`flex items-center gap-2.5 ${side === "away" ? "" : "flex-row-reverse"}`}>
        {/* Team color dot */}
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow"
          style={{ background: `linear-gradient(135deg, ${team.color}, ${team.colorTo || team.color})` }}
        >
          {abbr.slice(0, 3)}
        </div>
        <div className={side === "away" ? "text-left" : "text-right"}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${isWinner ? "text-white" : "text-muted-foreground"}`}>
            {side === "away" ? "Away" : "Home"}
          </p>
          <p className={`text-sm font-bold leading-tight ${isWinner ? "text-white" : "text-muted-foreground"}`}>
            {fullName || team.name}
          </p>
        </div>
      </div>

      <div className={`w-full ${side === "away" ? "" : ""}`}>
        <ProbBar pct={winPct} color={team.color || "#FF6200"} />
        <p className={`mt-1 text-xs font-bold ${isWinner ? "text-white" : "text-muted-foreground"} ${side === "away" ? "text-left" : "text-right"}`}>
          {winPct.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}

function PredictionCard({ pred }: { pred: IPrediction }) {
  const homeWin = pred.homeTeam === pred.predictedWinner;
  const kickoff = pred.kickoff ? new Date(pred.kickoff) : null;

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden hover:border-[#FF6200]/40 transition-colors">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-surface-2/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            Week {pred.week}
            {kickoff && (
              <> · {kickoff.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" })}</>
            )}
          </span>
        </div>
        {pred.confidence !== undefined && <ConfidenceBadge confidence={pred.confidence} />}
      </div>

      {/* matchup */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <TeamBlock
            abbr={pred.awayTeam!}
            fullName={pred.awayTeamFull!}
            winPct={pred.awayWinProbability ?? 50}
            isWinner={!homeWin}
            side="away"
          />

          <div className="shrink-0 flex flex-col items-center gap-1">
            <span className="text-xs font-black text-muted-foreground/50 uppercase tracking-widest">vs</span>
            {homeWin ? (
              <span className="text-[9px] font-bold text-[#FF6200] uppercase tracking-wide">home fav</span>
            ) : (
              <span className="text-[9px] font-bold text-[#00A8FF] uppercase tracking-wide">away fav</span>
            )}
          </div>

          <TeamBlock
            abbr={pred.homeTeam!}
            fullName={pred.homeTeamFull!}
            winPct={pred.homeWinProbability ?? 50}
            isWinner={homeWin}
            side="home"
          />
        </div>
      </div>

      {/* footer: stats pills */}
      {pred.homeTeamStats && pred.awayTeamStats && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {[
            {
              label: `${pred.awayTeam} PPG`,
              val: (pred.awayTeamStats.pts_for ?? 0).toFixed(1),
            },
            {
              label: `${pred.awayTeam} PA`,
              val: (pred.awayTeamStats.pts_against ?? 0).toFixed(1),
            },
            {
              label: `${pred.homeTeam} PPG`,
              val: (pred.homeTeamStats.pts_for ?? 0).toFixed(1),
            },
            {
              label: `${pred.homeTeam} PA`,
              val: (pred.homeTeamStats.pts_against ?? 0).toFixed(1),
            },
          ].map((s) => (
            <span key={s.label} className="text-[10px] rounded-md bg-secondary px-2 py-0.5 text-muted-foreground">
              {s.label}: <span className="text-foreground font-semibold">{s.val}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function PredictionsPage() {
  const { predictions, meta } = await getPredictions();

  const byWeek = predictions.reduce<Record<number, IPrediction[]>>((acc, p) => {
    const w = p.week ?? 0;
    if (!acc[w]) acc[w] = [];
    acc[w].push(p);
    return acc;
  }, {});

  const weeks = Object.keys(byWeek)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="container py-10 md:py-14">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <Brain className="h-6 w-6 text-[#FF6200]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF6200]">
              AI Predictions
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            NFL Game <span className="text-gradient">Predictions</span>
          </h1>
          <p className="text-muted-foreground max-w-xl leading-relaxed">
            XGBoost model trained on 4 seasons of NFL game data (2021–2024). Features include
            rolling win rates, points scored/allowed, and point differential — all computed
            without data leakage using a strict time-series split.
          </p>
        </div>

        {/* Model stats card */}
        <div className="shrink-0 rounded-xl border border-border bg-surface p-5 min-w-[220px]">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Model Stats
          </p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Target className="h-3.5 w-3.5" />
                Accuracy
              </div>
              <span className="text-sm font-bold text-emerald-400">
                {meta?.accuracy != null ? `${meta.accuracy}%` : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5" />
                Training games
              </div>
              <span className="text-sm font-bold">
                {meta?.trainingSamples?.toLocaleString() ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                Seasons
              </div>
              <span className="text-sm font-bold">2021–2024</span>
            </div>
            {meta?.updatedAt && (
              <div className="pt-1 border-t border-border/60">
                <p className="text-[10px] text-muted-foreground/60">
                  Updated {new Date(meta.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin refresh */}
      <div className="mb-8">
        <PredictionsRefreshButton />
      </div>

      {/* Predictions list */}
      {predictions.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <Brain className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">No predictions yet</p>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Click &ldquo;Run ML Model&rdquo; above to train the XGBoost model and generate predictions
            for all upcoming scheduled games.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {weeks.map((week) => (
            <section key={week}>
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <span className="h-px flex-1 bg-border/60" />
                Week {week}
                <span className="h-px flex-1 bg-border/60" />
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {byWeek[week].map((pred) => (
                  <PredictionCard key={String(pred._id)} pred={pred} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Methodology note */}
      <div className="mt-14 rounded-xl border border-border/50 bg-surface-2/30 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">
          Methodology
        </h3>
        <div className="grid sm:grid-cols-3 gap-4 text-xs text-muted-foreground leading-relaxed">
          <div>
            <p className="font-semibold text-foreground mb-1">Data</p>
            ESPN historical scoreboard API, seasons 2021–2024. ~1,100 regular-season + playoff games.
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">Features</p>
            Rolling 6-game window: win rate, PPG, PA, point differential for home &amp; away teams.
            No future data is used (strict time-series ordering).
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">Model</p>
            XGBoost classifier (300 trees, depth 4). Trained on first 75% of historical games,
            validated on last 25% by chronological order to prevent look-ahead bias.
          </div>
        </div>
      </div>
    </div>
  );
}
