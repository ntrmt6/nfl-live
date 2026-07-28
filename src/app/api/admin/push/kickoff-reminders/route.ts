import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { connectDB } from "@/lib/db";
import Game from "@/models/Game";
import Pick from "@/models/Pick";
import { sendPushToUsers } from "@/lib/push";

// Games kicking off within this window (and not yet reminded) get a push.
const WINDOW_MINUTES = 60;

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const now = new Date();
  const windowEnd = new Date(now.getTime() + WINDOW_MINUTES * 60_000);

  const upcoming = await Game.find({
    status: "scheduled",
    kickoff: { $gte: now, $lte: windowEnd },
    kickoffReminderSent: { $ne: true },
  }).lean();

  let gamesReminded = 0;
  let notificationsSent = 0;

  for (const game of upcoming) {
    const picks = await Pick.find({ gameSlug: game.slug }).lean();
    if (picks.length > 0) {
      const matchup = `${game.awayTeamFull} @ ${game.homeTeamFull}`;
      const minutesOut = Math.max(1, Math.round((new Date(game.kickoff).getTime() - now.getTime()) / 60_000));

      await sendPushToUsers(
        picks.map((pick) => ({
          userId: pick.userId,
          payload: {
            title: `Kickoff in ~${minutesOut} min`,
            body: `${matchup} — you picked the ${pick.choice === "home" ? game.homeTeamFull : game.awayTeamFull}.`,
            url: `/games/${game.slug}`,
            tag: `kickoff-${game.slug}`,
          },
        }))
      );
      notificationsSent += picks.length;
    }

    await Game.updateOne({ _id: game._id }, { $set: { kickoffReminderSent: true } });
    gamesReminded++;
  }

  return NextResponse.json({ success: true, gamesReminded, notificationsSent });
}
