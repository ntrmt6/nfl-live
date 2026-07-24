import { getNFLProfile } from "@/lib/team-profiles";

interface Props {
  awayTeam: string;
  homeTeam: string;
  awayTeamFull: string;
  homeTeamFull: string;
  awayPPG?: number;
  homePPG?: number;
  awayDefPts?: number;
  homeDefPts?: number;
  awayWinRate?: number;
  homeWinRate?: number;
}

function StatBar({
  awayVal,
  homeVal,
  label,
  lowerIsBetter = false,
  format,
}: {
  awayVal?: number;
  homeVal?: number;
  label: string;
  lowerIsBetter?: boolean;
  format: (v: number) => string;
}) {
  const awayBetter =
    awayVal != null && homeVal != null
      ? lowerIsBetter
        ? awayVal < homeVal
        : awayVal > homeVal
      : false;
  const homeBetter =
    awayVal != null && homeVal != null
      ? lowerIsBetter
        ? homeVal < awayVal
        : homeVal > awayVal
      : false;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={`w-16 text-right font-bold tabular-nums ${awayBetter ? "text-[#FF6200]" : "text-foreground"}`}
      >
        {awayVal != null ? format(awayVal) : "—"}
      </span>
      <span className="flex-1 text-center text-xs text-muted-foreground">{label}</span>
      <span
        className={`w-16 text-left font-bold tabular-nums ${homeBetter ? "text-[#FF6200]" : "text-foreground"}`}
      >
        {homeVal != null ? format(homeVal) : "—"}
      </span>
    </div>
  );
}

function PosBadge({ pos }: { pos: string }) {
  return (
    <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-[#FF6200]/15 text-[#FF6200]">
      {pos}
    </span>
  );
}

export function PlayerComparison({
  awayTeam,
  homeTeam,
  awayTeamFull,
  homeTeamFull,
  awayPPG,
  homePPG,
  awayDefPts,
  homeDefPts,
  awayWinRate,
  homeWinRate,
}: Props) {
  const ap = getNFLProfile(awayTeam);
  const hp = getNFLProfile(homeTeam);

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-6">
      <h2 className="font-semibold text-lg">Team &amp; Player Breakdown</h2>

      <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1">
          <span>{awayTeamFull}</span>
          <span>{homeTeamFull}</span>
        </div>
        <StatBar
          awayVal={awayPPG}
          homeVal={homePPG}
          label="Points Per Game"
          format={(v) => v.toFixed(1)}
        />
        <StatBar
          awayVal={awayDefPts}
          homeVal={homeDefPts}
          label="Points Allowed"
          lowerIsBetter
          format={(v) => v.toFixed(1)}
        />
        <StatBar
          awayVal={awayWinRate != null ? awayWinRate * 100 : undefined}
          homeVal={homeWinRate != null ? homeWinRate * 100 : undefined}
          label="Win Rate"
          format={(v) => `${v.toFixed(0)}%`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { profile: ap, teamFull: awayTeamFull },
          { profile: hp, teamFull: homeTeamFull },
        ].map(({ profile, teamFull }) => (
          <div key={teamFull} className="rounded-lg border border-border bg-secondary/20 p-4 space-y-3">
            <p className="text-xs font-bold text-foreground truncate">{teamFull}</p>

            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Head Coach</p>
              <p className="text-sm font-semibold text-foreground">{profile.coach}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Starting QB</p>
              <p className="text-sm font-semibold text-foreground">{profile.qb}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs italic text-muted-foreground leading-snug">{profile.offenseStyle}</p>
              <p className="text-xs italic text-muted-foreground leading-snug">{profile.defenseStyle}</p>
            </div>

            <div className="rounded-md bg-green-500/10 border border-green-500/20 px-3 py-2 text-xs text-green-400 leading-snug">
              <span className="font-semibold">&#128170; Strength:</span> {profile.strength}
            </div>

            <div className="rounded-md bg-[#FF6200]/10 border border-[#FF6200]/20 px-3 py-2 text-xs text-[#FF6200] leading-snug">
              <span className="font-semibold">&#9888; Weakness:</span> {profile.weakness}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Key Players</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-secondary/20 p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{ap.keyPlayer1.name}</span>
              <PosBadge pos={ap.keyPlayer1.pos} />
            </div>
            <p className="text-xs text-muted-foreground leading-snug">{ap.keyPlayer1.note}</p>
          </div>
          <div className="rounded-lg border border-border bg-secondary/20 p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{hp.keyPlayer1.name}</span>
              <PosBadge pos={hp.keyPlayer1.pos} />
            </div>
            <p className="text-xs text-muted-foreground leading-snug">{hp.keyPlayer1.note}</p>
          </div>
          <div className="rounded-lg border border-border bg-secondary/20 p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{ap.keyPlayer2.name}</span>
              <PosBadge pos={ap.keyPlayer2.pos} />
            </div>
            <p className="text-xs text-muted-foreground leading-snug">{ap.keyPlayer2.note}</p>
          </div>
          <div className="rounded-lg border border-border bg-secondary/20 p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{hp.keyPlayer2.name}</span>
              <PosBadge pos={hp.keyPlayer2.pos} />
            </div>
            <p className="text-xs text-muted-foreground leading-snug">{hp.keyPlayer2.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
