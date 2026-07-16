"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { IPrediction } from "@/models/Prediction";

interface Props {
  predictions: IPrediction[];
  accuracy: number | null;
}

const RADIAN = Math.PI / 180;

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, value, name }: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {value}
    </text>
  );
}

export function OverviewCharts({ predictions, accuracy }: Props) {
  // home vs away favorite split
  const homeCount = predictions.filter((p) => p.homeTeam === p.predictedWinner).length;
  const awayCount = predictions.length - homeCount;

  const favSplit = [
    { name: "Home Fav", value: homeCount, color: "#FF6200" },
    { name: "Away Fav", value: awayCount, color: "#00A8FF" },
  ];

  // confidence buckets
  const buckets = [
    { label: "50–60%", count: 0, color: "#475569" },
    { label: "60–70%", count: 0, color: "#eab308" },
    { label: "70–80%", count: 0, color: "#f97316" },
    { label: "80–90%", count: 0, color: "#22c55e" },
    { label: "90–100%", count: 0, color: "#06b6d4" },
  ];
  for (const p of predictions) {
    const c = p.confidence ?? 50;
    if (c < 60) buckets[0].count++;
    else if (c < 70) buckets[1].count++;
    else if (c < 80) buckets[2].count++;
    else if (c < 90) buckets[3].count++;
    else buckets[4].count++;
  }

  // accuracy gauge data
  const accVal = accuracy ?? 0;
  const gaugeData = [
    { name: "accuracy", value: accVal, fill: "#22c55e" },
    { name: "rest", value: 100 - accVal, fill: "#1e293b" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
      {/* Model accuracy gauge */}
      <div className="rounded-xl border border-border bg-surface p-4 flex flex-col items-center">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Model Accuracy
        </p>
        <div className="relative w-36 h-20">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gaugeData}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={48}
                outerRadius={68}
                paddingAngle={0}
                dataKey="value"
              >
                {gaugeData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
            <span className="text-2xl font-black text-emerald-400">{accVal.toFixed(1)}%</span>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">vs ~57% home-win baseline</p>
      </div>

      {/* Home vs Away donut */}
      <div className="rounded-xl border border-border bg-surface p-4 flex flex-col items-center">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Favorite Split
        </p>
        <div className="w-full h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={favSplit}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={56}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={PieLabel}
              >
                {favSplit.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#161b27", border: "1px solid #252d3d", borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: "#94a3b8" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-1">
          {favSplit.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              <span className="text-[10px] text-muted-foreground">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence distribution */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Confidence Distribution
        </p>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buckets} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252d3d" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "#161b27", border: "1px solid #252d3d", borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: "#94a3b8" }}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {buckets.map((b, i) => (
                  <Cell key={i} fill={b.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
