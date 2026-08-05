import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeamGameCard } from "@/components/teams/TeamGameCard";
import { getTeamBySlug, TEAM_LIST, teamToSlug } from "@/lib/teams";
import { getTeamGames } from "@/lib/data/games";

export const revalidate = 60;

export async function generateStaticParams() {
  return TEAM_LIST.map((t) => ({ slug: teamToSlug(t.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const team = getTeamBySlug(slug);
  if (!team) return {};
  return {
    title: `${team.name} Schedule & Predictions 2026`,
    description: `Full ${team.name} 2026 game schedule with AI win probability predictions, scores, and kickoff times.`,
  };
}

export default async function TeamGamesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = getTeamBySlug(slug);
  if (!team) notFound();

  const games = await getTeamGames(team.abbr, 40);

  const upcoming = games.filter(
    (g) => g.status !== "final" && !isInPast(g.kickoff)
  );
  const past = games.filter(
    (g) => g.status === "final" || isInPast(g.kickoff)
  ).reverse();

  return (
    <div className="space-y-10">
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-lg font-black mb-4 uppercase tracking-wide text-muted-foreground/70">
            Upcoming
          </h2>
          <div className="space-y-2">
            {upcoming.map((game) => (
              <TeamGameCard key={game._id} game={game} highlightAbbr={team.abbr} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-black mb-4 uppercase tracking-wide text-muted-foreground/70">
            Recent Results
          </h2>
          <div className="space-y-2">
            {past.map((game) => (
              <TeamGameCard key={game._id} game={game} highlightAbbr={team.abbr} />
            ))}
          </div>
        </section>
      )}

      {games.length === 0 && (
        <p className="text-muted-foreground text-sm py-10 text-center border border-dashed border-border rounded-xl">
          No games found for {team.name} yet.
        </p>
      )}
    </div>
  );
}

function isInPast(kickoff: string): boolean {
  return new Date(kickoff).getTime() < Date.now() - 4 * 60 * 60 * 1000;
}
