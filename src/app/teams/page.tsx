import type { Metadata } from "next";
import Link from "next/link";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { TEAM_LIST, teamToSlug } from "@/lib/teams";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "NFL Team Hubs — All 32 Teams",
  description:
    "Explore every NFL team hub: game schedules, AI predictions, and the latest articles for all 32 teams.",
  alternates: { canonical: absoluteUrl("/teams") },
};

const CONFERENCES = [
  {
    name: "AFC",
    divisions: [
      { name: "AFC East", abbrs: ["BUF", "MIA", "NE", "NYJ"] },
      { name: "AFC North", abbrs: ["BAL", "CIN", "CLE", "PIT"] },
      { name: "AFC South", abbrs: ["HOU", "IND", "JAX", "TEN"] },
      { name: "AFC West", abbrs: ["DEN", "KC", "LV", "LAC"] },
    ],
  },
  {
    name: "NFC",
    divisions: [
      { name: "NFC East", abbrs: ["DAL", "NYG", "PHI", "WAS"] },
      { name: "NFC North", abbrs: ["CHI", "DET", "GB", "MIN"] },
      { name: "NFC South", abbrs: ["ATL", "CAR", "NO", "TB"] },
      { name: "NFC West", abbrs: ["ARI", "LAR", "SF", "SEA"] },
    ],
  },
];

const teamMap = Object.fromEntries(TEAM_LIST.map((t) => [t.abbr, t]));

export default function TeamsIndexPage() {
  return (
    <div className="container py-12">
      <div className="max-w-2xl mb-10">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
          NFL <span className="text-gradient">Team Hubs</span>
        </h1>
        <p className="text-muted-foreground">
          Pick a team to see their schedule, AI predictions, and the latest articles — all in one place.
        </p>
      </div>

      <div className="space-y-10">
        {CONFERENCES.map((conf) => (
          <div key={conf.name}>
            <h2 className="text-lg font-black uppercase tracking-widest text-muted-foreground/60 mb-5 border-b border-border pb-2">
              {conf.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {conf.divisions.map((div) => (
                <div key={div.name}>
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
                    {div.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {div.abbrs.map((abbr) => {
                      const team = teamMap[abbr];
                      if (!team) return null;
                      return (
                        <Link
                          key={abbr}
                          href={`/teams/${teamToSlug(team.name)}`}
                          className="group flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-[#FF6200]/40 hover:shadow-sm transition-all"
                        >
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${team.color}22, ${team.colorTo}22)`,
                              border: `1px solid ${team.color}30`,
                            }}
                          >
                            <TeamLogo abbr={abbr} size={32} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black leading-tight group-hover:text-[#FF6200] transition-colors line-clamp-1">
                              {team.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Team Hub →</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
