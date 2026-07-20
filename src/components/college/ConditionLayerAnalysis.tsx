"use client";

import { useState } from "react";
import {
  ChevronDown, ChevronUp, TrendingUp, Minus,
  Trophy, TrendingDown, Swords, Home, Target,
  Building2, BarChart3, Brain, Layers, CalendarDays,
  type LucideIcon,
} from "lucide-react";
import { ConditionLayer, H2HRecord } from "@/lib/college-prediction-engine";

const LAYER_ICONS: Record<string, LucideIcon> = {
  Trophy, TrendingUp, TrendingDown, Swords, Home,
  Target, Building2, BarChart3, Brain, Layers,
  CalendarDays, Minus,
};

function LayerIcon({ name, className }: { name: string; className?: string }) {
  const Icon = LAYER_ICONS[name] || BarChart3;
  return <Icon className={className ?? "h-4 w-4"} />;
}

interface Props {
  layers: ConditionLayer[];
  h2h: H2HRecord[];
  homeAbbr: string;
  awayAbbr: string;
  homeFull: string;
  awayFull: string;
  homeWinProb: number;
  awayWinProb: number;
  confidence: number;
  predictedWinner: string;
  seasonRecords: {
    home: { year: number; wins: number; losses: number; apPeak: number | null }[];
    away: { year: number; wins: number; losses: number; apPeak: number | null }[];
  };
}

function Bar({ home, away, homeLabel, awayLabel }: { home: number; away: number; homeLabel: string; awayLabel: string }) {
  const total = home + away;
  const homePct = total > 0 ? (home / total) * 100 : 50;
  return (
    <div className="space-y-1">
      <div className="flex h-3 rounded-full overflow-hidden gap-px">
        <div
          className="transition-all rounded-l-full"
          style={{ width: `${homePct}%`, background: "linear-gradient(90deg,#60A5FA,#3B82F6)" }}
        />
        <div
          className="flex-1 transition-all rounded-r-full"
          style={{ background: "linear-gradient(90deg,#F97316,#FF6200)" }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span className="text-blue-400 font-medium">{homeLabel} {home}/100</span>
        <span className="text-[#FF6200] font-medium">{away}/100 {awayLabel}</span>
      </div>
    </div>
  );
}

function AdvantageTag({ adv, label }: { adv: ConditionLayer["advantage"]; label: string }) {
  if (adv === "neutral")
    return <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-secondary/60 rounded-full px-2 py-0.5"><Minus className="h-2.5 w-2.5" />NEUTRAL</span>;
  if (adv === "home")
    return <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-400 bg-blue-500/10 rounded-full px-2 py-0.5"><TrendingUp className="h-2.5 w-2.5" />HOME EDGE</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#FF6200] bg-[#FF6200]/10 rounded-full px-2 py-0.5"><TrendingUp className="h-2.5 w-2.5 rotate-180" />AWAY EDGE</span>;
}

function LayerCard({ layer, homeFull, awayFull, defaultOpen = false }: {
  layer: ConditionLayer;
  homeFull: string;
  awayFull: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const weightPct = Math.round(layer.weight * 100);

  return (
    <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/60 text-[#FF6200]">
          <LayerIcon name={layer.icon} className="h-4 w-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{layer.label}</span>
            <AdvantageTag adv={layer.advantage} label={layer.advantage === "home" ? homeFull : awayFull} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{layer.description}</p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-medium hidden sm:block">{weightPct}% weight</span>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
          {/* Score bar */}
          <Bar
            home={layer.homeScore}
            away={layer.awayScore}
            homeLabel={homeFull.split(" ").slice(-1)[0]}
            awayLabel={awayFull.split(" ").slice(-1)[0]}
          />

          {/* Team details */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-blue-500/5 border border-blue-500/15 p-2.5">
              <p className="text-[10px] text-blue-400/70 font-semibold mb-0.5">{homeFull}</p>
              <p className="text-xs font-medium">{layer.homeDetail}</p>
            </div>
            <div className="rounded-lg bg-[#FF6200]/5 border border-[#FF6200]/15 p-2.5">
              <p className="text-[10px] text-[#FF6200]/70 font-semibold mb-0.5">{awayFull}</p>
              <p className="text-xs font-medium">{layer.awayDetail}</p>
            </div>
          </div>

          {/* Explanation */}
          <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-border pl-3">
            {layer.detail}
          </p>
        </div>
      )}
    </div>
  );
}

function H2HTimeline({ h2h, homeAbbr, awayAbbr, homeFull, awayFull }: {
  h2h: H2HRecord[];
  homeAbbr: string;
  awayAbbr: string;
  homeFull: string;
  awayFull: string;
}) {
  const homeWins = h2h.filter(r => r.winner === homeAbbr).length;
  const awayWins = h2h.filter(r => r.winner === awayAbbr).length;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary/60 text-[#FF6200]"><Swords className="h-3.5 w-3.5" /></span>
          Series History (2019–2024)
        </h3>
        <div className="flex items-center gap-3 text-sm font-bold">
          <span className="text-blue-400">{homeWins}</span>
          <span className="text-muted-foreground text-xs">–</span>
          <span className="text-[#FF6200]">{awayWins}</span>
        </div>
      </div>
      <div className="space-y-2">
        {[...h2h].reverse().map((r) => {
          const homeWon = r.winner === homeAbbr;
          return (
            <div key={r.year} className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground text-xs w-8 shrink-0 font-mono">{r.year}</span>
              <div className={`flex-1 flex items-center justify-between rounded-lg px-3 py-1.5 ${homeWon ? "bg-blue-500/8 border border-blue-500/15" : "bg-[#FF6200]/8 border border-[#FF6200]/15"}`}>
                <span className={`font-semibold text-xs ${homeWon ? "text-blue-400" : "text-[#FF6200]"}`}>
                  {r.winnerFull.split(" ").slice(-1)[0]} wins
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {homeWon ? r.homeScore : r.awayScore} – {homeWon ? r.awayScore : r.homeScore}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SeasonBreakdown({ records, teamFull, color }: {
  records: { year: number; wins: number; losses: number; apPeak: number | null }[];
  teamFull: string;
  color: "blue" | "orange";
}) {
  const cls = color === "blue" ? { border: "border-blue-500/20", bg: "bg-blue-500/5", text: "text-blue-400", badge: "bg-blue-500/15 text-blue-300" }
    : { border: "border-[#FF6200]/20", bg: "bg-[#FF6200]/5", text: "text-[#FF6200]", badge: "bg-[#FF6200]/15 text-[#FF8533]" };
  const totalWins = records.reduce((a, r) => a + r.wins, 0);
  const totalGames = records.reduce((a, r) => a + r.wins + r.losses, 0);
  const ranked = records.filter(r => r.apPeak !== null).length;

  return (
    <div className={`rounded-xl border ${cls.border} ${cls.bg} p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <p className={`font-semibold text-sm ${cls.text}`}>{teamFull}</p>
        <span className="text-[10px] text-muted-foreground">{totalWins}-{totalGames - totalWins} overall</span>
      </div>
      <div className="space-y-1.5">
        {records.map(r => (
          <div key={r.year} className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground w-8 font-mono shrink-0">{r.year}</span>
            <div className="flex-1 flex items-center gap-1.5">
              <span className="font-semibold">{r.wins}-{r.losses}</span>
              {r.apPeak !== null && (
                <span className={`text-[9px] font-bold rounded px-1.5 py-0.5 ${cls.badge}`}>
                  AP #{r.apPeak}
                </span>
              )}
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: r.wins }, (_, i) => (
                <div key={i} className={`w-1.5 h-3 rounded-sm ${color === "blue" ? "bg-blue-400" : "bg-[#FF6200]"} opacity-70`} />
              ))}
              {Array.from({ length: r.losses }, (_, i) => (
                <div key={i} className="w-1.5 h-3 rounded-sm bg-secondary" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground">
        AP Ranked in {ranked} of {records.length} seasons
      </p>
    </div>
  );
}

export function ConditionLayerAnalysis({
  layers, h2h, homeAbbr, awayAbbr, homeFull, awayFull,
  homeWinProb, awayWinProb, confidence, predictedWinner, seasonRecords,
}: Props) {
  const winnerFull = predictedWinner === homeAbbr ? homeFull : awayFull;
  const homeAdvLayers = layers.filter(l => l.advantage === "home").length;
  const awayAdvLayers = layers.filter(l => l.advantage === "away").length;

  return (
    <div className="space-y-6">
      {/* ── Model Summary ── */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6200]/10 border border-[#FF6200]/20 text-[#FF6200]"><Brain className="h-5 w-5" /></span>
          <div>
            <h2 className="font-bold text-lg">AI Condition Layer Analysis</h2>
            <p className="text-xs text-muted-foreground">XGBoost ML model trained on 2019–2025 CFB seasons · {confidence}% confidence</p>
          </div>
        </div>

        {/* Win probability bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground font-medium mb-1">
            <span>{homeFull}</span>
            <span>WIN PROBABILITY</span>
            <span>{awayFull}</span>
          </div>
          <div className="flex h-10 rounded-xl overflow-hidden shadow-inner">
            <div
              className="flex items-center justify-center font-bold text-white text-sm transition-all"
              style={{ width: `${homeWinProb}%`, background: "linear-gradient(90deg,#3B82F6,#60A5FA)" }}
            >
              {homeWinProb}%
            </div>
            <div
              className="flex-1 flex items-center justify-center font-bold text-white text-sm"
              style={{ background: "linear-gradient(90deg,#FF8533,#FF6200)" }}
            >
              {awayWinProb}%
            </div>
          </div>
        </div>

        {/* Model pick */}
        <div className="flex items-center gap-3 rounded-lg bg-[#FF6200]/8 border border-[#FF6200]/20 p-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF6200]/15 text-[#FF6200]"><Trophy className="h-5 w-5" /></span>
          <div className="flex-1">
            <p className="text-[11px] text-muted-foreground font-semibold">MODEL PICK</p>
            <p className="font-bold text-base">{winnerFull}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-muted-foreground font-semibold">CONFIDENCE</p>
            <p className="font-bold text-lg text-[#FF6200]">{confidence}%</p>
          </div>
        </div>

        {/* Layer summary row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-blue-500/8 border border-blue-500/15 py-2 px-3">
            <p className="text-xs font-bold text-blue-400">{homeAdvLayers}</p>
            <p className="text-[10px] text-muted-foreground">Home Edge</p>
          </div>
          <div className="rounded-lg bg-secondary/50 border border-border py-2 px-3">
            <p className="text-xs font-bold text-muted-foreground">{layers.filter(l => l.advantage === "neutral").length}</p>
            <p className="text-[10px] text-muted-foreground">Neutral</p>
          </div>
          <div className="rounded-lg bg-[#FF6200]/8 border border-[#FF6200]/15 py-2 px-3">
            <p className="text-xs font-bold text-[#FF6200]">{awayAdvLayers}</p>
            <p className="text-[10px] text-muted-foreground">Away Edge</p>
          </div>
        </div>
      </div>

      {/* ── Condition Layers ── */}
      <div className="space-y-3">
        <h3 className="font-bold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
          <span className="flex h-5 w-5 items-center justify-center text-[#FF6200]"><Layers className="h-4 w-4" /></span>
          Condition Layers ({layers.length} factors analyzed)
        </h3>
        {layers.map((layer, i) => (
          <LayerCard
            key={layer.id}
            layer={layer}
            homeFull={homeFull}
            awayFull={awayFull}
            defaultOpen={i < 2}
          />
        ))}
      </div>

      {/* ── Historical H2H ── */}
      <H2HTimeline
        h2h={h2h}
        homeAbbr={homeAbbr}
        awayAbbr={awayAbbr}
        homeFull={homeFull}
        awayFull={awayFull}
      />

      {/* ── Season-by-season breakdown ── */}
      <div>
        <h3 className="font-bold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider mb-3">
          <span className="flex h-5 w-5 items-center justify-center text-[#FF6200]"><CalendarDays className="h-4 w-4" /></span>
          6-Season Program History (2019–2024)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SeasonBreakdown records={seasonRecords.home} teamFull={homeFull} color="blue" />
          <SeasonBreakdown records={seasonRecords.away} teamFull={awayFull} color="orange" />
        </div>
      </div>

      {/* Model disclaimer */}
      <div className="rounded-xl border border-border bg-card/40 p-4 text-xs text-muted-foreground leading-relaxed">
        <span className="font-semibold text-foreground/60">About this model:</span> Predictions are generated by an XGBoost machine learning model trained on 6+ years of college football data (2019–2025), including win/loss records, scoring offense/defense, AP rankings, strength of schedule, home field advantage, and head-to-head matchup history. Model historical accuracy: ~68%. For entertainment purposes only.
      </div>
    </div>
  );
}
