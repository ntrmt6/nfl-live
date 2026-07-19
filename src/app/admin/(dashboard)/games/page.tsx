import Link from "next/link";
import { Plus } from "lucide-react";
import { connectDB } from "@/lib/db";
import Game from "@/models/Game";
import { getTeam } from "@/lib/teams";
import { formatGameTime } from "@/lib/utils";
import { GameRowActions } from "@/components/admin/GameRowActions";
import { ResolvePicksButton } from "@/components/admin/ResolvePicksButton";

async function getGames() {
  try {
    await connectDB();
    const games = await Game.find({}).sort({ kickoff: 1 }).lean();
    return JSON.parse(JSON.stringify(games));
  } catch {
    return [];
  }
}

export default async function AdminGamesPage() {
  const games = await getGames();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Games</h1>
        <div className="flex items-center gap-2">
          <ResolvePicksButton />
          <Link
            href="/admin/games/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            New Game
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="p-3 font-medium">Matchup</th>
              <th className="p-3 font-medium">Week</th>
              <th className="p-3 font-medium">Kickoff</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game: any) => {
              const home = getTeam(game.homeTeam);
              const away = getTeam(game.awayTeam);
              return (
                <tr key={game._id} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium">
                    {away.abbr} @ {home.abbr}
                  </td>
                  <td className="p-3 text-muted-foreground">{game.week}</td>
                  <td className="p-3 text-muted-foreground">{formatGameTime(game.kickoff)}</td>
                  <td className="p-3 text-muted-foreground capitalize">{game.status}</td>
                  <td className="p-3">
                    <GameRowActions id={game._id} slug={game.slug} />
                  </td>
                </tr>
              );
            })}
            {games.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No games yet. Create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
