import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Pick from "@/models/Pick";

export const revalidate = 60;

export async function GET() {
  await connectDB();

  const agg = await Pick.aggregate([
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
    { $limit: 50 },
  ]);

  // Compute streak per user from resolved picks only
  const leaderboard = await Promise.all(
    agg.map(async (entry) => {
      const picks = await Pick.find({ userId: entry._id, correct: { $exists: true } })
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
        userId: entry._id,
        username: entry.username,
        total: entry.total,
        correct: entry.correct,
        wrong: entry.wrong,
        resolved: entry.resolved,
        accuracy: Math.round(entry.accuracy),
        streak,
        bestStreak,
      };
    })
  );

  leaderboard.sort((a, b) => b.correct - a.correct || b.accuracy - a.accuracy);

  return NextResponse.json({ leaderboard });
}
