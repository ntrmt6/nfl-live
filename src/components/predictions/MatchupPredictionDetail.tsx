"use client";

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Trophy, Activity, Brain } from "lucide-react";
import { getTeam } from "@/lib/teams";
import { WinProbBar } from "./WinProbBar";
import type { IPrediction } from "@/models/Prediction";

function FactorRow({
  label, homeVal, awayVal, homeTeam, awayTeam, homeColor, awayColor,
  higherIsBetter = true,
  format = (v: number) => v.toFixed(1),
}: {
  label: string; homeVal: number; awayVal: number;
  homeTeam: string; awayTeam: string;
  homeColor: string; awayColor: string;
  higherIsBetter?: boolean;
  format?: (v: number) => string;
}) {
  const homeWins = higherIsBetter ? homeVal > awayVal : homeVal < awayVal;
  const tie = homeVal === awayVal;
  const diff = Math.abs(homeVal - awayVal);
  const maxVal = Math.max(Math.abs(homeVal), Math.abs(awayVal), 0.01);

  const icon = tie
    ? <Minus className="h-3.5 w-3.5 text-muted-foreground" />
    : homeWins
    ? <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
    : <TrendingDown className="h-3.5 w-3.5 text-red-400" />;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-2.5 border-b border-border/30 last:border-0">
      <div className="flex items-center justify-end gap-2">
        <span className={`text-sm font-bold tabular-nums ${!homeWins && !tie ? "text-white" : "text-muted-foreground"}`}>
          {format(awayVal)}
        </span>
        <div className="w-24 h-2 rounded-full bg-white/5 overflow-hidden flex justify-end">
          <div className="h-full rounded-full transition-all" style={{ width: `${(Math.abs(awayVal) / maxVal) * 100}%`, background: awayColor }} />
        </div>
      </div>
      <div className="flex flex-col items-center gap-0.5 min-w-[90px]">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 text-center">{label}</span>
        {!tie && (
          <span className="text-[9px] text-muted-foreground/40">
            {homeWins ? homeTeam : awayTeam} +{format(diff)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${(Math.abs(homeVal) / maxVal) * 100}%`, background: homeColor }} />
        </div>
        <span className={`text-sm font-bold tabular-nums ${homeWins && !tie ? "text-white" : "text-muted-foreground"}`}>
          {format(homeVal)}
        </span>
      </div>
    </div>
  );
}

function RadarCompare({ homeTeam, awayTeam, homeStats, awayStats }: {
  homeTeam: string; awayTeam: string;
  homeStats: Record<string, number>; awayStats: Record<string, number>;
}) {
  const home = getTeam(homeTeam);
  const away = getTeam(awayTeam);

  const normalize = (val: number, min: number, max: number) =>
    Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));

  const data = [
    { stat: "Offense", [homeTeam]: normalize(homeStats.pts_for ?? 22, 14, 36), [awayTeam]: normalize(awayStats.pts_for ?? 22, 14, 36) },
    { stat: "Defense", [homeTeam]: normalize(36 - (homeStats.pts_against ?? 22), 0, 22), [awayTeam]: normalize(36 - (awayStats.pts_against ?? 22), 0, 22) },
    { stat: "Win Rate", [homeTeam]: (homeStats.win_rate ?? 0.5) * 100, [awayTeam]: (awayStats.win_rate ?? 0.5) * 100 },
    { stat: "Point Diff", [homeTeam]: normalize(homeStats.pt_diff ?? 0, -14, 14), [awayTeam]: normalize(awayStats.pt_diff ?? 0, -14, 14) },
    { stat: "Form", [homeTeam]: Math.min(100, Math.max(0, (homeStats.n ?? 0) / 6 * 100)), [awayTeam]: Math.min(100, Math.max(0, (awayStats.n ?? 0) / 6 * 100)) },
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%">
          <PolarGrid stroke="#252d3d" />
          <PolarAngleAxis dataKey="stat" tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} />
          <Radar name={awayTeam} dataKey={awayTeam} stroke={away.color} fill={away.color} fillOpacity={0.18} strokeWidth={2} />
          <Radar name={homeTeam} dataKey={homeTeam} stroke={home.color} fill={home.color} fillOpacity={0.18} strokeWidth={2} />
          <Tooltip contentStyle={{ background: "#161b27", border: "1px solid #252d3d", borderRadius: 8, fontSize: 12 }} itemStyle={{ color: "#94a3b8" }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function WinProbDonut({ homeTeam, awayTeam, homeWinPct, awayWinPct }: {
  homeTeam: string; awayTeam: string; homeWinPct: number; awayWinPct: number;
}) {
  const home = getTeam(homeTeam);
  const away = getTeam(awayTeam);
  const winner = homeWinPct >= awayWinPct ? homeTeam : awayTeam;
  const winnerPct = Math.max(homeWinPct, awayWinPct);
  const winnerColor = homeWinPct >= awayWinPct ? home.color : away.color;

  const data = [
    { name: awayTeam, value: awayWinPct, color: away.color },
    { name: homeTeam, value: homeWinPct, color: home.color },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={54} outerRadius={74} paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}>
              {data.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color: winnerColor }}>{winnerPct.toFixed(0)}%</span>
          <span className="text-xs font-bold text-muted-foreground">{winner} wins</span>
        </div>
      </div>
      <div className="flex gap-4 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
            <span className="text-xs text-muted-foreground font-medium">{d.name} {d.value.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MatchupPredictionDetail({ pred }: { pred: IPrediction }) {
  const homeWin = pred.homeTeam === pred.predictedWinner;
  const conf = pred.confidence ?? 50;

  const home = getTeam(pred.homeTeam!);
  const away = getTeam(pred.awayTeam!);

  const hStats = pred.homeTeamStats ?? {};
  const aStats = pred.awayTeamStats ?? {};

  const confClass =
    conf >= 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
    : conf >= 65 ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
    : "bg-slate-600/20 text-slate-400 border-slate-600/25";

  const winner = homeWin ? pred.homeTeamFull : pred.awayTeamFull;
  const loser = homeWin ? pred.awayTeamFull : pred.homeTeamFull;
  const wStats = homeWin ? hStats : aStats;
  const lStats = homeWin ? aStats : hStats;
  const keyEdge =
    (wStats.pts_for ?? 0) - (lStats.pts_for ?? 0) > 2
      ? "superior scoring offense"
      : (lStats.pts_against ?? 0) - (wStats.pts_against ?? 0) > 2
      ? "stronger defensive efficiency"
      : (wStats.win_rate ?? 0.5) - (lStats.win_rate ?? 0.5) > 0.1
      ? "better recent win rate"
      : "positive point differential";

  return (
    <div className="rounded-xl border border-[#FF6200]/30 bg-surface overflow-hidden">
      {/* accent stripe */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#FF6200,#FF8C00)" }} />

      {/* header */}
      <div className="flex items-center justify-between px-5 py-3 bg-black/20">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-[#FF6200]" />
          <span className="text-sm font-bold text-white">ML Prediction</span>
        </div>
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide border ${confClass}`}>
          <Activity className="h-3 w-3" />
          {conf.toFixed(0)}% confidence
        </div>
      </div>

      {/* win prob bar */}
      <div className="px-5 pt-4 pb-3">
        <WinProbBar
          homeTeam={pred.homeTeam!} awayTeam={pred.awayTeam!}
          homeWinPct={pred.homeWinProbability ?? 50} awayWinPct={pred.awayWinProbability ?? 50}
        />
      </div>

      {/* insight banner */}
      <div className="flex items-start gap-3 mx-5 mb-5 p-4 rounded-lg bg-[#FF6200]/5 border border-[#FF6200]/15">
        <Trophy className="h-5 w-5 text-[#FF6200] mt-0.5 shrink-0" />
        <p className="text-sm text-foreground/80 leading-relaxed">
          <span className="font-bold text-white">{winner}</span> projected to win thanks to{" "}
          <span className="text-[#FF6200] font-semibold">{keyEdge}</span> over {loser}.
          Model assigns a <span className="font-bold text-white">{conf.toFixed(0)}% confidence</span> to this outcome.
        </p>
      </div>

      <div className="px-5 pb-5 space-y-5">
        {/* donut + radar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border/40 bg-black/20 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 text-center">
              Win Probability
            </p>
            <div className="flex justify-center">
              <WinProbDonut
                homeTeam={pred.homeTeam!} awayTeam={pred.awayTeam!}
                homeWinPct={pred.homeWinProbability ?? 50} awayWinPct={pred.awayWinProbability ?? 50}
              />
            </div>
          </div>

          <div className="rounded-lg border border-border/40 bg-black/20 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 text-center">
              Team Profile
            </p>
            <div className="flex justify-center gap-5 mb-1">
              {[{ abbr: pred.awayTeam!, c: away.color }, { abbr: pred.homeTeam!, c: home.color }].map(t => (
                <div key={t.abbr} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: t.c }} />
                  <span className="text-xs font-bold text-muted-foreground">{t.abbr}</span>
                </div>
              ))}
            </div>
            {pred.homeTeamStats && pred.awayTeamStats && (
              <RadarCompare
                homeTeam={pred.homeTeam!} awayTeam={pred.awayTeam!}
                homeStats={pred.homeTeamStats} awayStats={pred.awayTeamStats}
              />
            )}
          </div>
        </div>

        {/* key factors */}
        <div className="rounded-lg border border-border/40 bg-black/20 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Key Factors
          </p>
          <div className="grid grid-cols-[1fr_auto_1fr] text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-2 gap-4">
            <span className="text-right">{pred.awayTeam}</span>
            <span className="min-w-[90px] text-center">Stat</span>
            <span>{pred.homeTeam}</span>
          </div>

          <FactorRow
            label="PPG (Off)" homeVal={hStats.pts_for ?? 0} awayVal={aStats.pts_for ?? 0}
            homeTeam={pred.homeTeam!} awayTeam={pred.awayTeam!}
            homeColor={home.color} awayColor={away.color}
          />
          <FactorRow
            label="PA/G (Def)" homeVal={hStats.pts_against ?? 0} awayVal={aStats.pts_against ?? 0}
            homeTeam={pred.homeTeam!} awayTeam={pred.awayTeam!}
            homeColor={home.color} awayColor={away.color} higherIsBetter={false}
          />
          <FactorRow
            label="Point Diff" homeVal={hStats.pt_diff ?? 0} awayVal={aStats.pt_diff ?? 0}
            homeTeam={pred.homeTeam!} awayTeam={pred.awayTeam!}
            homeColor={home.color} awayColor={away.color}
          />
          <FactorRow
            label="Win Rate" homeVal={(hStats.win_rate ?? 0.5) * 100} awayVal={(aStats.win_rate ?? 0.5) * 100}
            homeTeam={pred.homeTeam!} awayTeam={pred.awayTeam!}
            homeColor={home.color} awayColor={away.color}
            format={(v) => v.toFixed(0) + "%"}
          />
          <FactorRow
            label="Games (Form)" homeVal={hStats.n ?? 0} awayVal={aStats.n ?? 0}
            homeTeam={pred.homeTeam!} awayTeam={pred.awayTeam!}
            homeColor={home.color} awayColor={away.color}
            format={(v) => v.toFixed(0) + "g"}
          />
        </div>

        {/* model footer */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground/50 pt-1">
          <span>XGBoost · 300 trees · rolling 6-game window</span>
          <span>Model accuracy: <span className="text-emerald-400 font-bold">{pred.modelAccuracy ?? "—"}%</span></span>
        </div>
      </div>
    </div>
  );
}
