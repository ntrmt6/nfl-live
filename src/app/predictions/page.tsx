import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import Prediction, { IPrediction } from "@/models/Prediction";
import { getTeam } from "@/lib/teams";
import { absoluteUrl } from "@/lib/utils";
import { PredictionsRefreshButton } from "@/components/predictions/PredictionsRefreshButton";
import { OverviewCharts } from "@/components/predictions/OverviewCharts";
import { PredictionCard } from "@/components/predictions/PredictionCard";
import { Brain, Trophy, ChevronRight } from "lucide-react";
import { itemListSchema, collectionPageSchema, breadcrumbSchema, faqPageSchema } from "@/lib/schema-org";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "NFL Game Predictions | AI Win Probabilities",
  description:
    "XGBoost-powered NFL win probability predictions. Trained on 4 seasons of game data with rolling team efficiency features and zero data leakage.",
  alternates: { canonical: absoluteUrl("/predictions") },
};

async function getPredictions() {
  try {
    await connectDB();
    const now = new Date();
    const [predictions, meta] = await Promise.all([
      Prediction.find({ _type: { $exists: false }, kickoff: { $gte: now } })
        .sort({ kickoff: 1 })
        .limit(272)
        .lean(),
      Prediction.findOne({ _type: "model_meta" }).lean(),
    ]);
    return { predictions: predictions as IPrediction[], meta: meta as IPrediction | null };
  } catch {
    return { predictions: [], meta: null };
  }
}

export default async function PredictionsPage() {
  const { predictions, meta } = await getPredictions();

  const byWeek = predictions.reduce<Record<number, IPrediction[]>>((acc, p) => {
    const w = p.week ?? 0;
    (acc[w] ??= []).push(p);
    return acc;
  }, {});
  const weeks = Object.keys(byWeek).map(Number).sort((a, b) => a - b);

  // top picks = highest confidence across all weeks
  const topPicks = [...predictions]
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
    .slice(0, 5);

  const listSchema = itemListSchema(
    topPicks.map((p) => ({
      name: `${p.awayTeamFull} at ${p.homeTeamFull} — ${p.predictedWinner} ${p.confidence?.toFixed(0)}% pick`,
      url: `/games/${p.slug}`,
      description: `AI model picks ${p.predictedWinner} to win with ${p.confidence?.toFixed(0)}% confidence.`,
    }))
  );
  const collSchema = collectionPageSchema({
    name: "NFL Game Predictions — AI Model Picks",
    description: "AI-powered NFL game predictions with win probabilities, confidence scores, and full matchup breakdowns for every scheduled game.",
    url: "/predictions",
    numberOfItems: predictions.length,
  });
  const bcSchema = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Predictions", url: "/predictions" },
  ]);
  const predFaqSchema = faqPageSchema([
    {
      question: "How does the NFL Predictions Hub AI model work?",
      answer: "We train an XGBoost classifier on 4+ seasons of NFL data. Features include rolling 6-game team efficiency (win rate, points scored/allowed, differential), home/road splits, and situational stats — all computed from prior games only so there is no data leakage.",
    },
    {
      question: "What does 'confidence' mean on a pick?",
      answer: "Confidence is the model's estimated probability that its predicted winner will actually win, expressed as a percentage. A 75% confidence pick means the model expects that team to win 75 out of 100 times in comparable matchups.",
    },
    {
      question: "How accurate are the picks?",
      answer: (meta?.accuracy != null ? `Our current rolling accuracy is ${meta.accuracy}%. ` : "") + "You can find the transparent, time-series-validated accuracy on our model transparency page, updated as new games close.",
    },
    {
      question: "Do you offer against-the-spread (ATS) or Over/Under picks?",
      answer: "Our core model predicts straight-up win probability. We publish edge-case posts (best bets, upset alerts) that translate the model output into spread-aware picks using implied moneyline math.",
    },
    {
      question: "How often are predictions refreshed?",
      answer: "Predictions refresh weekly when new team stats and injury reports become available, and can be manually re-run via the admin panel to incorporate late-week line moves.",
    },
  ]);

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bcSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(predFaqSchema) }} />
      {/* Hero banner */}
      <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-[#0e1118] to-[#161b27]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyNTJkM2QiIGZpbGwtb3BhY2l0eT0iMC4zIj48cGF0aCBkPSJNMzYgMzRoLTJ2Mmgydi0yem0tNCAwaDJ2LTJoLTJ2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="container relative py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#FF6200]/15 border border-[#FF6200]/30">
                  <Brain className="h-4 w-4 text-[#FF6200]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FF6200]">
                  ML-Powered · XGBoost Model
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-none">
                NFL Game
                <br />
                <span className="text-gradient">Predictions</span>
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed max-w-lg">
                Trained on <strong className="text-foreground">1,136 games</strong> across 4 seasons. Rolling
                team efficiency metrics, strict time-series validation, zero data leakage.
              </p>
            </div>

            {/* stat pills */}
            <div className="flex flex-wrap md:flex-col gap-3">
              {[
                { label: "Model Accuracy", value: meta?.accuracy != null ? `${meta.accuracy}%` : "—", color: "text-emerald-400" },
                { label: "Games Predicted", value: predictions.length.toString(), color: "text-[#00A8FF]" },
                { label: "Training Seasons", value: "2021–2024", color: "text-amber-400" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-black/30 px-4 py-2.5 flex items-center gap-3 min-w-[160px]">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
                    <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-10">
        {/* Refresh button */}
        <div className="mb-8">
          <PredictionsRefreshButton />
        </div>

        {predictions.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-16 text-center">
            <Brain className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-xl font-bold mb-2">No predictions yet</p>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Click &ldquo;Run ML Model&rdquo; above to train the XGBoost model and generate
              predictions for all upcoming scheduled games.
            </p>
          </div>
        ) : (
          <>
            {/* Overview charts */}
            <OverviewCharts predictions={predictions} accuracy={meta?.accuracy ?? null} />

            {/* Top picks */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <Trophy className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-black uppercase tracking-wide">Top Picks This Week</h2>
                <span className="text-xs text-muted-foreground">(highest confidence)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {topPicks.map((pred, i) => (
                  <div
                    key={String(pred._id)}
                    className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">
                        #{i + 1} Pick
                      </span>
                      <span className="text-[9px] text-muted-foreground">Wk {pred.week}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[pred.awayTeam, pred.homeTeam].map((abbr, j) => {
                        const t = getTeam(abbr!);
                        return (
                          <div key={j} className="flex items-center gap-1.5 flex-1">
                            <div
                              className="h-6 w-6 rounded flex items-center justify-center text-[8px] font-black text-white shrink-0"
                              style={{ background: t.color }}
                            >
                              {abbr?.slice(0, 3)}
                            </div>
                            {j === 0 && <span className="text-[8px] text-muted-foreground/40">@</span>}
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-sm font-black text-white">
                      {pred.predictedWinner}{" "}
                      <span className="text-xs font-normal text-muted-foreground">wins</span>
                    </div>
                    <div className="text-xs font-bold text-emerald-400">
                      {pred.confidence?.toFixed(0)}% confidence
                    </div>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: `${pred.confidence}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* All games by week */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <ChevronRight className="h-5 w-5 text-[#FF6200]" />
                <h2 className="text-lg font-black uppercase tracking-wide">All Predictions</h2>
              </div>

              <div className="space-y-12">
                {weeks.map((week) => (
                  <div key={week}>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1 text-xs font-black uppercase tracking-widest text-foreground">
                        Week {week}
                      </span>
                      <div className="h-px flex-1 bg-border/50" />
                      <span className="text-xs text-muted-foreground">{byWeek[week].length} games</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {byWeek[week].map((pred) => (
                        <PredictionCard key={String(pred._id)} pred={pred} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Methodology */}
            <div className="mt-16 rounded-xl border border-border/40 bg-surface/50 p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                How It Works
              </p>
              <div className="grid sm:grid-cols-3 gap-6 text-sm text-muted-foreground leading-relaxed">
                <div>
                  <p className="font-semibold text-foreground mb-1.5">1 · Data</p>
                  ESPN scoreboard API · 2021–2024 regular season + playoffs · 1,136 completed games
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1.5">2 · Features</p>
                  Rolling 6-game window per team: win rate, PPG, points allowed, point differential.
                  All features computed from prior games only — no future data.
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1.5">3 · Model</p>
                  XGBoost classifier · 300 trees · depth 4 · time-series train/test split (75/25) ·
                  home field advantage included as implicit feature.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
