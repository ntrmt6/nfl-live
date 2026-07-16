"use client";

import { useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
} from "recharts";
import { ChevronDown, Calendar, Activity, TrendingUp, TrendingDown, Minus, Trophy } from "lucide-react";
import { getTeam } from "@/lib/teams";
import { WinProbBar } from "./WinProbBar";
import type { IPrediction } from "@/models/Prediction";

// ── sub-components ────────────────────────────────────────────────────────────

function TeamBadge({
  abbr, fullName, side, isWinner,
}: { abbr: string; fullName: string; side: "home" | "away"; isWinner: boolean }) {
  const team = getTeam(abbr);
  return (
    <div className={`flex flex-col gap-2 flex-1 ${side === "home" ? "items-end" : "items-start"}`}>
      <div
        className="h-12 w-12 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-lg ring-2 ring-white/10"
        style={{
          background: `linear-gradient(135deg, ${team.color}, ${team.colorTo || team.color + "99"})`,
          boxShadow: isWinner ? `0 0 18px ${team.color}60` : undefined,
        }}
      >
        {abbr.slice(0, 3)}
      </div>
      <div className={side === "home" ? "text-right" : "text-left"}>
        <p className={`text-[10px] font-semibold uppercase tracking-wide ${isWinner ? "text-[#FF6200]" : "text-muted-foreground"}`}>
          {side === "away" ? "Away" : "Home"}{isWinner ? " · Model Pick ✓" : ""}
        </p>
        <p className={`text-sm font-bold leading-tight ${isWinner ? "text-white" : "text-foreground/70"}`}>
          {fullName}
        </p>
      </div>
    </div>
  );
}

// ── expanded breakdown ────────────────────────────────────────────────────────

function FactorRow({
  label, homeVal, awayVal, homeTeam, awayTeam, homeColor, awayColor, higherIsBetter = true,
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

  const icon = tie
    ? <Minus className="h-3 w-3 text-muted-foreground" />
    : homeWins
    ? <TrendingUp className="h-3 w-3 text-emerald-400" />
    : <TrendingDown className="h-3 w-3 text-red-400" />;

  const maxVal = Math.max(Math.abs(homeVal), Math.abs(awayVal), 0.01);

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2 border-b border-border/30 last:border-0">
      {/* Away side */}
      <div className="flex items-center justify-end gap-2">
        <span className={`text-xs font-bold tabular-nums ${!homeWins && !tie ? "text-white" : "text-muted-foreground"}`}>
          {format(awayVal)}
        </span>
        <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden flex justify-end">
          <div className="h-full rounded-full transition-all" style={{ width: `${(Math.abs(awayVal) / maxVal) * 100}%`, background: awayColor }} />
        </div>
      </div>

      {/* Center label */}
      <div className="flex flex-col items-center gap-0.5 min-w-[80px]">
        {icon}
        <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 text-center">{label}</span>
        {!tie && (
          <span className="text-[9px] text-muted-foreground/40">
            {homeWins ? homeTeam : awayTeam} +{format(diff)}
          </span>
        )}
      </div>

      {/* Home side */}
      <div className="flex items-center gap-2">
        <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${(Math.abs(homeVal) / maxVal) * 100}%`, background: homeColor }} />
        </div>
        <span className={`text-xs font-bold tabular-nums ${homeWins && !tie ? "text-white" : "text-muted-foreground"}`}>
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

  // Normalise each stat to 0-100 relative to NFL averages
  const normalize = (val: number, min: number, max: number) =>
    Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));

  const data = [
    {
      stat: "Offense",
      [homeTeam]: normalize(homeStats.pts_for ?? 22, 14, 36),
      [awayTeam]: normalize(awayStats.pts_for ?? 22, 14, 36),
    },
    {
      stat: "Defense",
      [homeTeam]: normalize(36 - (homeStats.pts_against ?? 22), 0, 22),
      [awayTeam]: normalize(36 - (awayStats.pts_against ?? 22), 0, 22),
    },
    {
      stat: "Win Rate",
      [homeTeam]: (homeStats.win_rate ?? 0.5) * 100,
      [awayTeam]: (awayStats.win_rate ?? 0.5) * 100,
    },
    {
      stat: "Point Diff",
      [homeTeam]: normalize(homeStats.pt_diff ?? 0, -14, 14),
      [awayTeam]: normalize(awayStats.pt_diff ?? 0, -14, 14),
    },
    {
      stat: "Form",
      [homeTeam]: Math.min(100, Math.max(0, (homeStats.n ?? 0) / 6 * 100)),
      [awayTeam]: Math.min(100, Math.max(0, (awayStats.n ?? 0) / 6 * 100)),
    },
  ];

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%">
          <PolarGrid stroke="#252d3d" />
          <PolarAngleAxis
            dataKey="stat"
            tick={{ fontSize: 9, fill: "#64748b", fontWeight: 600 }}
          />
          <Radar
            name={awayTeam}
            dataKey={awayTeam}
            stroke={away.color}
            fill={away.color}
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Radar
            name={homeTeam}
            dataKey={homeTeam}
            stroke={home.color}
            fill={home.color}
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{ background: "#161b27", border: "1px solid #252d3d", borderRadius: 8, fontSize: 11 }}
            itemStyle={{ color: "#94a3b8" }}
          />
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
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={58} paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}>
              {data.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black" style={{ color: winnerColor }}>{winnerPct.toFixed(0)}%</span>
          <span className="text-[9px] font-bold text-muted-foreground">{winner}</span>
        </div>
      </div>
      <div className="flex gap-3 mt-1">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full" style={{ background: d.color }} />
            <span className="text-[10px] text-muted-foreground">{d.name} {d.value.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── main card ─────────────────────────────────────────────────────────────────

export function PredictionCard({ pred }: { pred: IPrediction }) {
  const [open, setOpen] = useState(false);

  const homeWin = pred.homeTeam === pred.predictedWinner;
  const kickoff  = pred.kickoff ? new Date(pred.kickoff) : null;
  const conf     = pred.confidence ?? 50;
  const highConf = conf >= 75;

  const home = getTeam(pred.homeTeam!);
  const away = getTeam(pred.awayTeam!);

  const hStats = pred.homeTeamStats ?? {};
  const aStats = pred.awayTeamStats ?? {};

  const confClass =
    conf >= 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
    : conf >= 65 ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
    : "bg-slate-600/20 text-slate-400 border-slate-600/25";

  // insight sentence
  const winner   = homeWin ? pred.homeTeamFull : pred.awayTeamFull;
  const loser    = homeWin ? pred.awayTeamFull : pred.homeTeamFull;
  const wStats   = homeWin ? hStats : aStats;
  const lStats   = homeWin ? aStats : hStats;
  const keyEdge  =
    (wStats.pts_for ?? 0) - (lStats.pts_for ?? 0) > 2
      ? "superior scoring offense"
      : (lStats.pts_against ?? 0) - (wStats.pts_against ?? 0) > 2
      ? "stronger defensive efficiency"
      : (wStats.win_rate ?? 0.5) - (lStats.win_rate ?? 0.5) > 0.1
      ? "better recent win rate"
      : "positive point differential";

  return (
    <div className={`rounded-xl border bg-surface overflow-hidden transition-shadow ${
      highConf ? "border-[#FF6200]/30" : "border-border"
    } ${open ? "shadow-xl" : "hover:shadow-md"}`}>

      {/* accent stripe */}
      <div className="h-0.5 w-full" style={{
        background: highConf ? "linear-gradient(90deg,#FF6200,#FF8C00)" : "#252d3d",
      }} />

      {/* ── clickable header ─────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6200]/50"
      >
        {/* meta row */}
        <div className="flex items-center justify-between px-4 py-2 bg-black/20">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
            <Calendar className="h-3 w-3" />
            <span>Wk {pred.week}</span>
            {kickoff && (
              <span>· {kickoff.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide border ${confClass}`}>
              <Activity className="h-2.5 w-2.5" />
              {conf.toFixed(0)}% conf
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </div>
        </div>

        {/* teams */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-start gap-3 mb-4">
            <TeamBadge abbr={pred.awayTeam!} fullName={pred.awayTeamFull!} side="away" isWinner={!homeWin} />
            <div className="shrink-0 pt-3">
              <span className="text-lg font-black text-muted-foreground/30">@</span>
            </div>
            <TeamBadge abbr={pred.homeTeam!} fullName={pred.homeTeamFull!} side="home" isWinner={homeWin} />
          </div>
          <WinProbBar
            homeTeam={pred.homeTeam!} awayTeam={pred.awayTeam!}
            homeWinPct={pred.homeWinProbability ?? 50} awayWinPct={pred.awayWinProbability ?? 50}
          />
        </div>
      </button>

      {/* ── expandable breakdown ─────────────────────────── */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="border-t border-border/50 bg-black/10">

          {/* insight banner */}
          <div className="flex items-start gap-2.5 px-4 py-3 bg-[#FF6200]/5 border-b border-[#FF6200]/10">
            <Trophy className="h-4 w-4 text-[#FF6200] mt-0.5 shrink-0" />
            <p className="text-xs text-foreground/80 leading-relaxed">
              <span className="font-bold text-white">{winner}</span> projected to win thanks to{" "}
              <span className="text-[#FF6200] font-semibold">{keyEdge}</span> over {loser}.
              Model assigns a <span className="font-bold text-white">{conf.toFixed(0)}% confidence</span> to this outcome.
            </p>
          </div>

          <div className="p-4 space-y-5">

            {/* top row: donut + radar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border/40 bg-surface p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 text-center">
                  Win Probability
                </p>
                <WinProbDonut
                  homeTeam={pred.homeTeam!} awayTeam={pred.awayTeam!}
                  homeWinPct={pred.homeWinProbability ?? 50} awayWinPct={pred.awayWinProbability ?? 50}
                />
              </div>

              <div className="rounded-lg border border-border/40 bg-surface p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 text-center">
                  Team Profile
                </p>
                <div className="flex justify-center gap-4 mb-1">
                  {[{abbr: pred.awayTeam!, c: away.color}, {abbr: pred.homeTeam!, c: home.color}].map(t => (
                    <div key={t.abbr} className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full" style={{ background: t.c }} />
                      <span className="text-[9px] font-bold text-muted-foreground">{t.abbr}</span>
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

            {/* factor-by-factor breakdown */}
            <div className="rounded-lg border border-border/40 bg-surface p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Key Factors
              </p>
              <div className="grid grid-cols-[1fr_auto_1fr] text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-2 gap-3">
                <span className="text-right">{pred.awayTeam}</span>
                <span className="min-w-[80px] text-center">Stat</span>
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
                label="Games (form)" homeVal={hStats.n ?? 0} awayVal={aStats.n ?? 0}
                homeTeam={pred.homeTeam!} awayTeam={pred.awayTeam!}
                homeColor={home.color} awayColor={away.color}
                format={(v) => v.toFixed(0) + "g"}
              />
            </div>

            {/* model meta footer */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground/50 pt-1">
              <span>XGBoost · 300 trees · rolling 6-game window</span>
              <span>Model accuracy: <span className="text-emerald-400 font-bold">{pred.modelAccuracy ?? "—"}%</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
