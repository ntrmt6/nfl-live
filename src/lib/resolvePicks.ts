import { connectDB } from "@/lib/db";
import Pick from "@/models/Pick";
import Game from "@/models/Game";
import { sendPushToUsers } from "@/lib/push";

/**
 * Resolves all unresolved picks for a single final game.
 * Returns the number of picks updated.
 */
export async function resolvePicksForGame(gameSlug: string): Promise<number> {
  await connectDB();

  const game = await Game.findOne({ slug: gameSlug }).lean();
  if (!game || game.status !== "final") return 0;
  if (game.homeScore == null || game.awayScore == null) return 0;

  const winner: "home" | "away" | "tie" =
    game.homeScore > game.awayScore ? "home" :
    game.awayScore > game.homeScore ? "away" : "tie";

  const unresolved = await Pick.find({ gameSlug, correct: { $exists: false } });
  if (unresolved.length === 0) return 0;

  const now = new Date();
  const ops = unresolved.map((pick) => ({
    updateOne: {
      filter: { _id: pick._id },
      update: {
        $set: {
          correct: winner === "tie" ? false : pick.choice === winner,
          resolvedAt: now,
        },
      },
    },
  }));

  await Pick.bulkWrite(ops);

  const matchup = `${game.awayTeamFull} @ ${game.homeTeamFull}`;
  sendPushToUsers(
    unresolved.map((pick) => {
      const correct = winner !== "tie" && pick.choice === winner;
      return {
        userId: pick.userId,
        payload: {
          title: correct ? "Your pick hit! ✅" : "Pick result is in",
          body: correct
            ? `You called it: ${matchup} — final ${game.awayScore}-${game.homeScore}.`
            : `${matchup} finished ${game.awayScore}-${game.homeScore}. Better luck next pick.`,
          url: `/games/${gameSlug}`,
          tag: `pick-result-${gameSlug}`,
        },
      };
    })
  ).catch(() => {});

  return unresolved.length;
}

/**
 * Resolves picks for ALL final games that have unresolved picks.
 * Returns total picks updated.
 */
export async function resolveAllPendingPicks(): Promise<number> {
  await connectDB();

  const finalGames = await Game.find({
    status: "final",
    homeScore: { $exists: true },
    awayScore: { $exists: true },
  }).lean();

  let total = 0;
  for (const game of finalGames) {
    total += await resolvePicksForGame(game.slug);
  }
  return total;
}
