import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, MapPin, Tv, ChevronLeft } from "lucide-react";
import { LiveStreamPlayer } from "@/components/player/LiveStreamPlayer";
import { Badge } from "@/components/ui/badge";
import { getGameBySlug, getAllGameSlugs } from "@/lib/data/games";
import { getTeam } from "@/lib/teams";
import { formatGameTime, isLiveNow, absoluteUrl } from "@/lib/utils";
import { sportsEventSchema, breadcrumbSchema } from "@/lib/schema-org";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllGameSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) return {};

  const home = getTeam(game.homeTeam);
  const away = getTeam(game.awayTeam);
  const title = `${away.name} vs ${home.name} - Live Schedule & Coverage`;
  const description =
    game.description ||
    `Kickoff time, TV network, and live game-day coverage for ${away.name} at ${home.name}, Week ${game.week}.`;

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(`/games/${game.slug}`) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/games/${game.slug}`),
      type: "website",
    },
  };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) notFound();

  const home = getTeam(game.homeTeam);
  const away = getTeam(game.awayTeam);
  const live = game.status === "live" || isLiveNow(game.kickoff);

  const jsonLd = sportsEventSchema({
    ...game,
    kickoff: new Date(game.kickoff),
  } as any);
  const breadcrumb = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: `${away.name} vs ${home.name}`, url: `/games/${game.slug}` },
  ]);

  return (
    <div className="container py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <Link
        href="/#schedule"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to schedule
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={live ? "live" : "neon"}>
                {live ? "LIVE NOW" : `WEEK ${game.week}`}
              </Badge>
              <span className="text-sm text-muted-foreground">{game.network}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              {away.name} <span className="text-muted-foreground">@</span> {home.name}
            </h1>
          </div>

          <LiveStreamPlayer
            affiliateUrl={game.affiliateUrl}
            homeTeam={game.homeTeam}
            awayTeam={game.awayTeam}
            viewerCountBase={game.viewerCountBase}
            isLive={live}
          />

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-lg mb-4">Game Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <InfoRow icon={<CalendarDays className="h-4 w-4" />} label="Kickoff" value={formatGameTime(game.kickoff)} />
              <InfoRow icon={<Tv className="h-4 w-4" />} label="Network" value={game.network || "TBD"} />
              {game.venue && (
                <InfoRow icon={<MapPin className="h-4 w-4" />} label="Venue" value={game.venue} />
              )}
            </div>
            {game.description && (
              <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
                {game.description}
              </p>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Matchup</h3>
            <div className="space-y-4">
              <TeamBlock abbr={away.abbr} name={away.name} color={away.color} score={game.awayScore} />
              <div className="text-center text-xs text-muted-foreground">at</div>
              <TeamBlock abbr={home.abbr} name={home.name} color={home.color} score={game.homeScore} />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground leading-relaxed">
            Streaming access is provided through our verified third-party
            broadcast partner. NFL Live Zone is an independent fan media
            outlet and receives referral compensation when you use the
            stream partner link above.
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        {icon}
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function TeamBlock({
  abbr,
  name,
  color,
  score,
}: {
  abbr: string;
  name: string;
  color: string;
  score?: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-secondary/40 p-3">
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-md text-xs font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {abbr}
        </span>
        <span className="font-medium text-sm">{name}</span>
      </div>
      {typeof score === "number" && (
        <span className="text-lg font-bold tabular-nums">{score}</span>
      )}
    </div>
  );
}
