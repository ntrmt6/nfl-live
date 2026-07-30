"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Brain, BarChart2, Shield, Cpu } from "lucide-react";

interface FeatureImportance {
  feature: string;
  importance: number;
}

interface ConfusionMatrix {
  tn: number;
  fp: number;
  fn: number;
  tp: number;
}

interface ModelMeta {
  accuracy: number;
  trainAccuracy: number;
  trainingSamples: number;
  seasons: number[];
  featureImportances: FeatureImportance[];
  confusionMatrix: ConfusionMatrix | null;
  updatedAt: string;
}

const FEATURE_LABELS: Record<string, { label: string; desc: string }> = {
  h_win_rate:    { label: "Home Win Rate",          desc: "Home team's win % over last 6 games" },
  h_pts_for:     { label: "Home Points For",         desc: "Home team's avg points scored per game (last 6)" },
  h_pts_against: { label: "Home Points Against",     desc: "Home team's avg points allowed per game (last 6)" },
  h_pt_diff:     { label: "Home Point Diff",         desc: "Home team's avg point differential (last 6)" },
  h_n:           { label: "Home Sample Size",        desc: "Number of home team recent games used" },
  a_win_rate:    { label: "Away Win Rate",           desc: "Away team's win % over last 6 games" },
  a_pts_for:     { label: "Away Points For",         desc: "Away team's avg points scored per game (last 6)" },
  a_pts_against: { label: "Away Points Against",     desc: "Away team's avg points allowed per game (last 6)" },
  a_pt_diff:     { label: "Away Point Diff",         desc: "Away team's avg point differential (last 6)" },
  a_n:           { label: "Away Sample Size",        desc: "Number of away team recent games used" },
  wr_diff:       { label: "Win Rate Differential",  desc: "Home win rate minus away win rate" },
  pd_diff:       { label: "Point Diff Gap",          desc: "Home point diff minus away point diff" },
  off_def:       { label: "Offense vs Defense",      desc: "Home offense (pts_for) minus away defense (pts_against)" },
  def_off:       { label: "Defense vs Offense",      desc: "Away offense (pts_for) minus home defense (pts_against)" },
  week:          { label: "Week Number",             desc: "NFL week — later weeks carry more historical context" },
};

export default function ModelTransparencyPage() {
  const [meta, setMeta] = useState<ModelMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/model-transparency")
      .then((r) => r.json())
      .then((d) => { setMeta(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const maxImportance = meta?.featureImportances[0]?.importance ?? 1;

  return (
    <div className="container py-10 max-w-4xl">
      <Link
        href="/predictions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to predictions
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6200]/10">
            <Brain className="h-5 w-5 text-[#FF6200]" />
          </div>
          <h1 className="text-2xl font-bold">Model Transparency</h1>
        </div>
        <p className="text-muted-foreground">
          How our XGBoost model works, what data it uses, and how accurately it predicts NFL outcomes.
        </p>
      </div>

      {loading && (
        <div className="text-center text-muted-foreground py-20">Loading model data...</div>
      )}

      {!loading && !meta?.featureImportances?.length && (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
          Model transparency data will be available after the next prediction refresh.
        </div>
      )}

      {meta && (
        <div className="space-y-8">
          {/* Overview stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              icon={<BarChart2 className="h-5 w-5 text-[#FF6200]" />}
              label="Validation Accuracy"
              value={meta.accuracy != null ? `${meta.accuracy}%` : "—"}
              sub="held-out test set"
            />
            <StatCard
              icon={<Cpu className="h-5 w-5 text-[#FF6200]" />}
              label="Training Accuracy"
              value={meta.trainAccuracy != null ? `${meta.trainAccuracy}%` : "—"}
              sub="in-sample fit"
            />
            <StatCard
              icon={<Shield className="h-5 w-5 text-[#FF6200]" />}
              label="Training Games"
              value={meta.trainingSamples != null ? meta.trainingSamples.toLocaleString() : "—"}
              sub="NFL matchups"
            />
            <StatCard
              icon={<Brain className="h-5 w-5 text-[#FF6200]" />}
              label="Seasons Trained"
              value={meta.seasons?.length ? `${meta.seasons[0]}–${meta.seasons[meta.seasons.length - 1]}` : "—"}
              sub="regular + playoffs"
            />
          </div>

          {/* How the model works */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-lg mb-3">How It Works</h2>
            <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
              <p>
                We use an <strong className="text-foreground">XGBoost gradient-boosted decision tree</strong> trained on{" "}
                {meta.trainingSamples?.toLocaleString()} completed NFL games from the{" "}
                {meta.seasons?.[0]}–{meta.seasons?.[meta.seasons.length - 1]} seasons, including regular season and playoffs.
              </p>
              <p>
                For each upcoming game, we calculate a <strong className="text-foreground">rolling 6-game window</strong> of
                team statistics for both the home and away team, then feed those 15 features into the model to predict the
                probability of a home win.
              </p>
              <p>
                The model is trained on a 75/25 time-ordered split — the first 75% of games train the model, and the last 25%
                form the validation set. This prevents data leakage and simulates real-world performance.
              </p>
            </div>
          </div>

          {/* Feature importances */}
          {meta.featureImportances.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-semibold text-lg mb-1">Feature Importances</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Which inputs drive the model&apos;s predictions the most (XGBoost gain-based importance).
              </p>
              <div className="space-y-3">
                {meta.featureImportances.map((f) => {
                  const info = FEATURE_LABELS[f.feature];
                  const pct = (f.importance / maxImportance) * 100;
                  return (
                    <div key={f.feature}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{info?.label ?? f.feature}</span>
                        <span className="text-muted-foreground tabular-nums">{(f.importance * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#FF6200] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {info?.desc && (
                        <p className="text-xs text-muted-foreground mt-0.5">{info.desc}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Confusion matrix */}
          {meta.confusionMatrix && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-semibold text-lg mb-1">Confusion Matrix</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Breakdown of correct vs incorrect predictions on the validation set. &quot;Home win&quot; = positive class.
              </p>
              <ConfusionMatrixDisplay cm={meta.confusionMatrix} />
            </div>
          )}

          {meta.updatedAt && (
            <p className="text-xs text-muted-foreground text-right">
              Last updated: {new Date(meta.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs font-medium text-foreground/80 mt-0.5">{label}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function ConfusionMatrixDisplay({ cm }: { cm: ConfusionMatrix }) {
  const total = cm.tn + cm.fp + cm.fn + cm.tp;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1 max-w-xs">
        <div />
        <div className="text-center text-xs font-semibold text-muted-foreground">Pred: Away</div>
        <div className="text-center text-xs font-semibold text-muted-foreground">Pred: Home</div>
        <div className="flex items-center text-xs font-semibold text-muted-foreground">Actual: Away</div>
        <CMCell value={cm.tn} label="True Neg" color="bg-green-500/10 border-green-500/20 text-green-400" />
        <CMCell value={cm.fp} label="False Pos" color="bg-red-500/10 border-red-500/20 text-red-400" />
        <div className="flex items-center text-xs font-semibold text-muted-foreground">Actual: Home</div>
        <CMCell value={cm.fn} label="False Neg" color="bg-red-500/10 border-red-500/20 text-red-400" />
        <CMCell value={cm.tp} label="True Pos" color="bg-green-500/10 border-green-500/20 text-green-400" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <MetricPill label="Precision" value={`${((cm.tp / (cm.tp + cm.fp)) * 100).toFixed(1)}%`} />
        <MetricPill label="Recall" value={`${((cm.tp / (cm.tp + cm.fn)) * 100).toFixed(1)}%`} />
        <MetricPill label="Correct" value={`${cm.tp + cm.tn}`} />
        <MetricPill label="Total" value={`${total}`} />
      </div>
    </div>
  );
}

function CMCell({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className={`rounded-lg border p-3 text-center ${color}`}>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/50 p-3 text-center">
      <div className="font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
