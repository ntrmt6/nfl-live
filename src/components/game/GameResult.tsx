import { CheckCircle2, XCircle, Trophy, Target } from "lucide-react";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { getTeam } from "@/lib/teams";
import { GameDTO } from "@/types";
import { IPrediction } from "@/models/Prediction";

interface Props {
  game: GameDTO;
  prediction: IPrediction | null;
}

export function GameResult({ game, prediction }: Props) {
  const home = getTeam(game.homeTeam);
  const away = getTeam(game.awayTeam);

  const homeScore = game.homeScore ?? 0;
  const awayScore = game.awayScore ?? 0;

  const actualWinner: "home" | "away" | "tie" =
    homeScore > awayScore ? "home" :
    awayScore > homeScore ? "away" : "tie";
  const actualWinnerName = actualWinner === "home" ? home.name : actualWinner === "away" ? away.name : "Tie";

  const predictedWinnerAbbr = prediction?.predictedWinner;
  const predictedSide: "home" | "away" | null =
    predictedWinnerAbbr === game.homeTeam ? "home" :
    predictedWinnerAbbr === game.awayTeam ? "away" : null;
  const predictedWinnerName = predictedSide === "home" ? home.name : predictedSide === "away" ? away.name : null;

  const modelCorrect = predictedSide !== null && actualWinner !== "tie" && predictedSide === actualWinner;
  const confidence = prediction?.confidence ?? null;

  const homeWinProbPct = prediction?.homeWinProbability != null
    ? Math.round((prediction.homeWinProbability > 1 ? prediction.homeWinProbability : prediction.homeWinProbability * 100))
    : null;
  const awayWinProbPct = prediction?.awayWinProbability != null
    ? Math.round((prediction.awayWinProbability > 1 ? prediction.awayWinProbability : prediction.awayWinProbability * 100))
    : null;

  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden">
      <div
        className="h-1 w-full"
        style={{ background: `linear-gradient(90deg, ${away.color}, ${home.color})` }}
      />

      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/80 border border-border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <Trophy className="h-3 w-3" />
            Final · Week {game.week}
          </span>
          {predictedSide !== null && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                modelCorrect
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}
            >
              {modelCorrect ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              Model {modelCorrect ? "Called It" : "Missed"}
            </span>
          )}
        </div>

        {/* Final score */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-6">
          <TeamRow
            abbr={away.abbr}
            name={away.name}
            score={awayScore}
            isWinner={actualWinner === "away"}
            align="left"
          />
          <span className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest">
            Final
          </span>
          <TeamRow
            abbr={home.abbr}
            name={home.name}
            score={homeScore}
            isWinner={actualWinner === "home"}
            align="right"
          />
        </div>

        {/* Prediction vs actual */}
        {prediction && (
          <div className="rounded-lg border border-border/70 bg-secondary/30 p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-[#FF6200]" />
              <h3 className="text-sm font-bold uppercase tracking-wide">Prediction vs Actual</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-card/60 border border-border/50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Model Called</p>
                <p className="font-bold text-foreground">
                  {predictedWinnerName ?? "—"}
                </p>
                {confidence != null && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {confidence.toFixed(0)}% confidence
                  </p>
                )}
              </div>

              <div
                className={`rounded-md border p-3 ${
                  modelCorrect
                    ? "bg-emerald-500/5 border-emerald-500/30"
                    : "bg-red-500/5 border-red-500/30"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Actual Winner</p>
                <p className={`font-bold ${modelCorrect ? "text-emerald-400" : "text-red-400"}`}>
                  {actualWinnerName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {awayScore}–{homeScore}
                </p>
              </div>
            </div>

            {awayWinProbPct != null && homeWinProbPct != null && (
              <div className="pt-2 border-t border-border/40">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Pre-game Win Probability
                </p>
                <div className="space-y-1.5">
                  <ProbBar label={away.name} pct={awayWinProbPct} color={away.color} correct={modelCorrect && predictedSide === "away"} />
                  <ProbBar label={home.name} pct={homeWinProbPct} color={home.color} correct={modelCorrect && predictedSide === "home"} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function TeamRow({
  abbr, name, score, isWinner, align,
}: {
  abbr: string;
  name: string;
  score: number;
  isWinner: boolean;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex items-center gap-3 ${
        align === "right" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <TeamLogo abbr={abbr} size={48} />
      <div className={align === "right" ? "text-right" : ""}>
        <p className={`text-xs font-semibold uppercase tracking-wide ${isWinner ? "text-[#FF6200]" : "text-muted-foreground"}`}>
          {isWinner ? "Winner" : "\u00A0"}
        </p>
        <p className="text-sm font-bold truncate">{name}</p>
        <p className={`text-3xl font-black tabular-nums leading-none mt-1 ${isWinner ? "text-foreground" : "text-muted-foreground/70"}`}>
          {score}
        </p>
      </div>
    </div>
  );
}

function ProbBar({
  label, pct, color, correct,
}: {
  label: string;
  pct: number;
  color: string;
  correct: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-semibold text-foreground/80">{label}</span>
        <span className={`tabular-nums font-bold ${correct ? "text-emerald-400" : "text-muted-foreground"}`}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }}
        />
      </div>
    </div>
  );
}
