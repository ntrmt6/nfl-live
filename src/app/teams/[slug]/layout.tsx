import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { TeamNav } from "@/components/teams/TeamNav";
import { getTeamBySlug } from "@/lib/teams";
import { absoluteUrl } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const team = getTeamBySlug(slug);
  if (!team) return {};
  return {
    title: `${team.name} Hub — Games, Predictions & News`,
    description: `Everything ${team.name}: upcoming games, AI predictions, blog posts, and team analysis on NFL Predictions Hub.`,
    alternates: { canonical: absoluteUrl(`/teams/${slug}`) },
  };
}

export default async function TeamLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = getTeamBySlug(slug);
  if (!team) notFound();

  return (
    <div>
      {/* Team hero */}
      <div
        style={{
          background: `linear-gradient(135deg, ${team.color} 0%, ${team.colorTo || "#000"} 100%)`,
        }}
        className="relative overflow-hidden"
      >
        {/* subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h40v1H0zm0 39h40v1H0zM0 0h1v40H0zm39 0h1v40h-1z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container py-8 md:py-10 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div
                className="h-20 w-20 rounded-2xl flex items-center justify-center shadow-2xl"
                style={{ background: "rgba(0,0,0,0.25)" }}
              >
                <TeamLogo abbr={team.abbr} size={60} className="drop-shadow-xl" />
              </div>
            </div>
            <div>
              <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-1">
                Team Hub
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow">
                {team.name}
              </h1>
              <p className="text-white/50 text-sm mt-1 font-medium">
                Games · Predictions · Articles
              </p>
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <TeamNav slug={slug} />
      </div>

      {/* Page content */}
      <div className="container py-8">
        {children}
      </div>
    </div>
  );
}
