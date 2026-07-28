import Pick from "@/models/Pick";
import type { FilterQuery } from "mongoose";
import type { IPick } from "@/models/Pick";

export interface LeaderboardEntry {
  userId: string;
  username: string;
  total: number;
  correct: number;
  wrong: number;
  resolved: number;
  accuracy: number;
  streak: number;
  bestStreak: number;
}

/**
 * Aggregates Pick'em standings for any filter (global, a single season, or a
 * league's member set). Streak/bestStreak are computed per-user from the same
 * filter, so a league leaderboard reflects only that league's members/season.
 */
export async function buildLeaderboard(
  match: FilterQuery<IPick>,
  limit = 50
): Promise<LeaderboardEntry[]> {
  const agg = await Pick.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$userId",
        username: { $last: "$username" },
        total: { $sum: 1 },
        correct: { $sum: { $cond: [{ $eq: ["$correct", true] }, 1, 0] } },
        wrong: { $sum: { $cond: [{ $eq: ["$correct", false] }, 1, 0] } },
      },
    },
    {
      $addFields: {
        resolved: { $add: ["$correct", "$wrong"] },
        accuracy: {
          $cond: [
            { $gt: [{ $add: ["$correct", "$wrong"] }, 0] },
            {
              $multiply: [
                { $divide: ["$correct", { $add: ["$correct", "$wrong"] }] },
                100,
              ],
            },
            0,
          ],
        },
      },
    },
    { $sort: { correct: -1, accuracy: -1 } },
    { $limit: limit },
  ]);

  const leaderboard = await Promise.all(
    agg.map(async (entry) => {
      const picks = await Pick.find({ ...match, userId: entry._id, correct: { $exists: true } })
        .sort({ createdAt: -1 })
        .lean();

      let streak = 0;
      for (const p of picks) {
        if (p.correct) streak++;
        else break;
      }

      let bestStreak = 0;
      let cur = 0;
      for (const p of [...picks].reverse()) {
        if (p.correct) { cur++; bestStreak = Math.max(bestStreak, cur); }
        else cur = 0;
      }

      return {
        userId: entry._id as string,
        username: entry.username as string,
        total: entry.total as number,
        correct: entry.correct as number,
        wrong: entry.wrong as number,
        resolved: entry.resolved as number,
        accuracy: Math.round(entry.accuracy),
        streak,
        bestStreak,
      };
    })
  );

  leaderboard.sort((a, b) => b.correct - a.correct || b.accuracy - a.accuracy);
  return leaderboard;
}
