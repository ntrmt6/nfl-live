import { HelpCircle } from "lucide-react";
import { GameDTO } from "@/types";
import { IPrediction } from "@/models/Prediction";
import { getTeam } from "@/lib/teams";

export interface FAQItem {
  question: string;
  answer: string;
}

export function buildGameFAQs(game: GameDTO, prediction: IPrediction | null): FAQItem[] {
  const home = getTeam(game.homeTeam);
  const away = getTeam(game.awayTeam);
  const year = new Date(game.kickoff).getFullYear();
  const dateStr = new Date(game.kickoff).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
  const timeStr = new Date(game.kickoff).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  });

  const winnerName = prediction?.predictedWinner === game.homeTeam
    ? home.name
    : prediction?.predictedWinner === game.awayTeam
    ? away.name
    : null;
  const conf = prediction?.confidence ? Math.round(prediction.confidence) : null;
  const homeProb = prediction?.homeWinProbability != null
    ? Math.round(prediction.homeWinProbability > 1 ? prediction.homeWinProbability : prediction.homeWinProbability * 100)
    : null;
  const awayProb = prediction?.awayWinProbability != null
    ? Math.round(prediction.awayWinProbability > 1 ? prediction.awayWinProbability : prediction.awayWinProbability * 100)
    : null;

  const isFinal = game.status === "final";
  const homeScore = game.homeScore ?? 0;
  const awayScore = game.awayScore ?? 0;

  const faqs: FAQItem[] = [];

  if (isFinal) {
    const winner = homeScore > awayScore ? home.name : awayScore > homeScore ? away.name : "Tie";
    faqs.push({
      question: `Who won the ${away.name} vs ${home.name} Week ${game.week} ${year} game?`,
      answer: winner === "Tie"
        ? `The ${away.name} and ${home.name} played to a ${awayScore}–${homeScore} tie in Week ${game.week} of the ${year} NFL season.`
        : `The ${winner} won ${Math.max(homeScore, awayScore)}–${Math.min(homeScore, awayScore)} over the ${winner === home.name ? away.name : home.name} in Week ${game.week} of the ${year} NFL season.`,
    });
    if (winnerName) {
      const correct = (winnerName === home.name && homeScore > awayScore) || (winnerName === away.name && awayScore > homeScore);
      faqs.push({
        question: `Did the NFL Predictions Hub AI model call the ${away.name} vs ${home.name} game correctly?`,
        answer: correct
          ? `Yes — our XGBoost model predicted the ${winnerName} to win with ${conf}% confidence, and the ${winnerName} closed out the ${away.name} vs ${home.name} Week ${game.week} matchup for a correct prediction.`
          : `Our model predicted the ${winnerName} to win with ${conf}% confidence, but the ${winnerName === home.name ? away.name : home.name} pulled off the win. Missed pick — one of the reasons Week ${game.week} produced fireworks.`,
      });
    }
  } else {
    faqs.push({
      question: `Who is predicted to win the ${away.name} vs ${home.name} Week ${game.week} game?`,
      answer: winnerName
        ? `Our AI prediction model picks the ${winnerName} to win the ${away.name} vs ${home.name} Week ${game.week} ${year} matchup with ${conf ?? "—"}% confidence. The model gives the ${home.name} a ${homeProb ?? "—"}% win probability and the ${away.name} a ${awayProb ?? "—"}% win probability.`
        : `Our model has not yet issued a prediction for this matchup. Check back closer to kickoff as we refresh predictions when new team stats and injury information come in.`,
    });
    faqs.push({
      question: `When and where is the ${away.name} vs ${home.name} game?`,
      answer: `The ${away.name} face the ${home.name} on ${dateStr} at ${timeStr}${game.venue ? `, hosted at ${game.venue}` : ""}. The game airs on ${game.network || "TBD"}.`,
    });
    faqs.push({
      question: `What is the confidence level on this NFL Week ${game.week} prediction?`,
      answer: conf != null
        ? `Our machine-learning model rates this pick at ${conf}% confidence, based on 4+ seasons of team performance data, offensive/defensive splits, recent form, home/road splits, and pace-adjusted efficiency. Higher confidence generally means the model sees a wider gap between the two teams.`
        : `Confidence has not yet been generated for this matchup. Our XGBoost model refreshes weekly with the latest team stats.`,
    });
  }

  faqs.push({
    question: `What TV network is broadcasting the ${away.name} at ${home.name} game?`,
    answer: `The ${away.name} at ${home.name} Week ${game.week} game is scheduled to air on ${game.network || "an NFL national or regional broadcast partner (TBD)"}. Check your local listings or the NFL Predictions Hub schedule closer to kickoff for the latest broadcast information.`,
  });

  faqs.push({
    question: `How accurate are NFL Predictions Hub's AI picks?`,
    answer: `Our XGBoost-based prediction model is trained on 4+ seasons of NFL play-by-play, team, and situational data. It tracks a rolling win rate against the moneyline that is published on our model transparency page. Individual picks are probabilistic — even a 75% confidence pick will miss 1 in 4 times over a long enough sample.`,
  });

  return faqs;
}

interface Props {
  game: GameDTO;
  prediction: IPrediction | null;
  faqs?: FAQItem[];
}

export function GameFAQ({ game, prediction, faqs }: Props) {
  const home = getTeam(game.homeTeam);
  const away = getTeam(game.awayTeam);
  const items = faqs ?? buildGameFAQs(game, prediction);

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="h-5 w-5 text-[#FF6200]" />
        <h2 className="text-lg font-bold">
          {away.name} vs {home.name} — Frequently Asked Questions
        </h2>
      </div>
      <div className="divide-y divide-border/60">
        {items.map((item, i) => (
          <details key={i} className="group py-3 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-start justify-between gap-4 text-sm font-semibold text-foreground list-none">
              <span>{item.question}</span>
              <span className="text-[#FF6200] shrink-0 transition-transform group-open:rotate-45 text-lg leading-none mt-[-2px]">
                +
              </span>
            </summary>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
