import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { absoluteUrl } from "@/lib/utils";
import { itemListSchema, breadcrumbSchema, faqPageSchema, collectionPageSchema } from "@/lib/schema-org";
import { teamToSlug } from "@/lib/teams";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "NFL Power Rankings 2026: All 32 Teams Ranked (AI Model)",
  description:
    "Complete 2026 NFL power rankings for all 32 teams. AI-powered composite of projected wins, roster strength, and schedule difficulty — updated weekly with movement arrows.",
  keywords: [
    "NFL Power Rankings",
    "NFL power rankings 2026",
    "NFL preseason power rankings",
    "NFL Week 1 power rankings",
    "AI NFL rankings",
    "best NFL teams 2026",
    "NFL team rankings",
  ],
  alternates: { canonical: absoluteUrl("/predictions/power-rankings") },
  openGraph: {
    title: "NFL Power Rankings 2026: All 32 Teams Ranked",
    description: "AI-powered NFL power rankings for the 2026 season — updated weekly.",
    url: absoluteUrl("/predictions/power-rankings"),
    type: "website",
    siteName: "NFL Predictions Hub",
  },
};

interface Ranked {
  rank: number;
  prev: number;
  team: string;
  abbr: string;
  projWins: string;
  note: string;
}

const RANKINGS: Ranked[] = [
  { rank: 1, prev: 2, team: "Los Angeles Rams",        abbr: "LAR", projWins: "12.5", note: "NFC's most complete roster. Elite front seven, restored WR corps, and a schedule that projects as top-5 easiest." },
  { rank: 2, prev: 1, team: "Detroit Lions",           abbr: "DET", projWins: "12.0", note: "Still elite on both sides of the ball. O-line health is the only real bear case." },
  { rank: 3, prev: 3, team: "Baltimore Ravens",        abbr: "BAL", projWins: "11.5", note: "Deepest AFC roster on paper. Two-time MVP Jackson leads the AFC North favorite." },
  { rank: 4, prev: 4, team: "Buffalo Bills",           abbr: "BUF", projWins: "11.5", note: "Reigning MVP Allen + a top-10 defense. AFC path is the only concern." },
  { rank: 5, prev: 5, team: "Philadelphia Eagles",     abbr: "PHI", projWins: "11.0", note: "Saquon + Hurts + retooled secondary. Still a top-3 NFC threat." },
  { rank: 6, prev: 8, team: "Los Angeles Chargers",    abbr: "LAC", projWins: "10.5", note: "Harbaugh year 2. Only Week 1 double-digit favorite. Market has caught up." },
  { rank: 7, prev: 6, team: "Kansas City Chiefs",      abbr: "KC",  projWins: "10.5", note: "Mahomes health is the biggest 2026 storyline. Ceiling remains dynasty-level." },
  { rank: 8, prev: 7, team: "San Francisco 49ers",     abbr: "SF",  projWins: "10.0", note: "Full-health 49ers are back among NFC's top three. Injuries were the whole story in 2025." },
  { rank: 9, prev: 9, team: "Cincinnati Bengals",      abbr: "CIN", projWins: "10.0", note: "Highest-ceiling offense in football. Defense must show up in December." },
  { rank: 10, prev: 12, team: "Green Bay Packers",     abbr: "GB",  projWins: "10.0", note: "Jordan Love's second full year with an upgraded WR room." },
  { rank: 11, prev: 10, team: "Washington Commanders", abbr: "WAS", projWins: "9.5",  note: "Jayden Daniels' encore + a stiffer defense. Dark-horse NFC champ." },
  { rank: 12, prev: 11, team: "Houston Texans",        abbr: "HOU", projWins: "9.5",  note: "Stroud's ceiling remains top-5 QB. AFC South still winnable." },
  { rank: 13, prev: 15, team: "Denver Broncos",        abbr: "DEN", projWins: "9.5",  note: "Snapped KC's AFC West streak in 2025. Waddle addition is a real WR1 leap." },
  { rank: 14, prev: 13, team: "Minnesota Vikings",     abbr: "MIN", projWins: "9.0",  note: "If J.J. McCarthy is the answer, Vikings are a wild-card lock." },
  { rank: 15, prev: 14, team: "Tampa Bay Buccaneers",  abbr: "TB",  projWins: "9.0",  note: "NFC South favorite. Mayfield-Evans-Godwin trio still humming." },
  { rank: 16, prev: 16, team: "Pittsburgh Steelers",   abbr: "PIT", projWins: "9.0",  note: "Rodgers year 1 with a top-5 defense. Ceiling capped by AFC gauntlet." },
  { rank: 17, prev: 18, team: "Seattle Seahawks",      abbr: "SEA", projWins: "8.5",  note: "Rebuilt defense + Sam Darnold + Lumen Field is a legit wild-card path." },
  { rank: 18, prev: 17, team: "Arizona Cardinals",     abbr: "ARI", projWins: "8.5",  note: "Kyler + Harrison + a healthy Trey McBride = one of the league's most improved offenses." },
  { rank: 19, prev: 19, team: "Chicago Bears",         abbr: "CHI", projWins: "8.5",  note: "Ben Johnson + Caleb Williams year 2 = classic COY spike setup." },
  { rank: 20, prev: 21, team: "Atlanta Falcons",       abbr: "ATL", projWins: "8.0",  note: "Michael Penix Jr. + Bijan Robinson = top-8 NFC South offense." },
  { rank: 21, prev: 20, team: "Miami Dolphins",        abbr: "MIA", projWins: "7.5",  note: "Tua health and O-line are the season pivot points." },
  { rank: 22, prev: 22, team: "Indianapolis Colts",    abbr: "IND", projWins: "7.5",  note: "Anthony Richardson's dev arc + Shane Steichen's scheme are worth watching." },
  { rank: 23, prev: 23, team: "Jacksonville Jaguars",  abbr: "JAX", projWins: "7.5",  note: "Trevor Lawrence needs to make the leap. Travis Hunter is a wildcard on both sides of the ball." },
  { rank: 24, prev: 24, team: "Dallas Cowboys",        abbr: "DAL", projWins: "7.0",  note: "Dak-CeeDee-Pickens is elite; the D-line got old fast." },
  { rank: 25, prev: 25, team: "New York Giants",       abbr: "NYG", projWins: "7.0",  note: "Jaxson Dart + Abdul Carter give the Giants their most upside in years." },
  { rank: 26, prev: 26, team: "Las Vegas Raiders",     abbr: "LV",  projWins: "6.5",  note: "Ashton Jeanty gives Vegas a real identity. QB is the ceiling cap." },
  { rank: 27, prev: 27, team: "Tennessee Titans",      abbr: "TEN", projWins: "6.5",  note: "Cam Ward era begins with plus weapons but a rebuilding front." },
  { rank: 28, prev: 28, team: "New Orleans Saints",    abbr: "NO",  projWins: "6.0",  note: "Roster in transition. Full rebuild watch." },
  { rank: 29, prev: 29, team: "New England Patriots",  abbr: "NE",  projWins: "6.0",  note: "Drake Maye year 2 + reinvested WR room = under-covered." },
  { rank: 30, prev: 30, team: "Cleveland Browns",      abbr: "CLE", projWins: "5.5",  note: "Everything hinges on QB — Sanders or Watson." },
  { rank: 31, prev: 31, team: "New York Jets",         abbr: "NYJ", projWins: "5.5",  note: "New regime, new QB. Bottoming out before the climb." },
  { rank: 32, prev: 32, team: "Carolina Panthers",     abbr: "CAR", projWins: "4.5",  note: "Bryce Young must show meaningful growth, or this stays the NFL's basement floor." },
];

const FAQ = [
  {
    question: "Who is the #1 team in NFL power rankings for 2026?",
    answer: "The Los Angeles Rams sit at #1 in our AI-powered 2026 NFL power rankings, projected for 12.5 wins with the most complete roster in the NFC. The Detroit Lions and Baltimore Ravens round out the top three.",
  },
  {
    question: "How are the NFL power rankings calculated?",
    answer: "Our rankings blend the AI model's projected win total for each team with roster-strength and strength-of-schedule adjustments. Rankings update weekly using rolling team efficiency metrics from ESPN, injury updates, and results from the prior week.",
  },
  {
    question: "Which NFL team improved the most in the 2026 power rankings?",
    answer: "The Los Angeles Chargers jumped from #8 to #6 on the strength of a fully-healthy Justin Herbert and a Harbaugh year-two defensive leap. The Denver Broncos (up 2 spots) and Green Bay Packers (up 2 spots) also gained ground.",
  },
  {
    question: "Which team fell the most in the power rankings?",
    answer: "Movement between preseason and Week 1 is small since no games have been played. Real movement kicks in after Weeks 1-3 as our model incorporates actual results.",
  },
];

export default function PowerRankingsPage() {
  const listSchema = itemListSchema(
    RANKINGS.map((r) => ({
      name: `#${r.rank} ${r.team} — ${r.projWins} projected wins`,
      url: `/teams/${teamToSlug(r.team)}`,
      description: r.note,
    }))
  );
  const bcSchema = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Predictions", url: "/predictions" },
    { name: "Power Rankings", url: "/predictions/power-rankings" },
  ]);
  const faqSchema = faqPageSchema(FAQ);
  const collSchema = collectionPageSchema({
    name: "NFL Power Rankings 2026",
    description: "All 32 NFL teams ranked by AI model for the 2026 season, refreshed weekly.",
    url: "/predictions/power-rankings",
    numberOfItems: RANKINGS.length,
  });

  return (
    <div className="container py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bcSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="mb-6">
        <Link href="/predictions" className="text-sm text-muted-foreground hover:text-foreground">← All Predictions</Link>
      </div>

      <header className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#00A8FF]/10 border border-[#00A8FF]/30 px-3 py-1 text-xs font-black uppercase tracking-widest text-[#00A8FF] mb-4">
          <TrendingUp className="h-3.5 w-3.5" /> Updated Weekly · Preseason Edition
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
          NFL Power Rankings <span className="text-gradient">2026</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
          All 32 NFL teams ranked by our AI model — a composite of projected wins, roster strength, and schedule difficulty. Rankings refresh every Tuesday with movement arrows and updated notes.
        </p>
      </header>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[50px_40px_1fr_80px] md:grid-cols-[60px_40px_1fr_100px] gap-3 px-4 py-3 border-b border-border bg-secondary/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <div>Rank</div>
          <div>Move</div>
          <div>Team</div>
          <div className="text-right">Proj Wins</div>
        </div>
        {RANKINGS.map((r) => {
          const diff = r.prev - r.rank;
          return (
            <Link
              key={r.rank}
              href={`/teams/${teamToSlug(r.team)}`}
              className="group grid grid-cols-[50px_40px_1fr_80px] md:grid-cols-[60px_40px_1fr_100px] gap-3 items-center px-4 py-3 border-b border-border/60 last:border-b-0 hover:bg-secondary/30 transition-colors"
            >
              <div className={`text-xl font-black ${r.rank <= 5 ? "text-amber-400" : r.rank <= 10 ? "text-emerald-400" : "text-muted-foreground"}`}>
                #{r.rank}
              </div>
              <div className="flex items-center gap-0.5 text-xs">
                {diff > 0 ? <><TrendingUp className="h-3 w-3 text-emerald-400" /><span className="text-emerald-400 font-bold">{diff}</span></>
                  : diff < 0 ? <><TrendingDown className="h-3 w-3 text-red-400" /><span className="text-red-400 font-bold">{Math.abs(diff)}</span></>
                  : <Minus className="h-3 w-3 text-muted-foreground/40" />}
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <TeamLogo abbr={r.abbr} size={32} />
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate group-hover:text-[#FF6200] transition-colors">{r.team}</p>
                  <p className="text-[11px] text-muted-foreground truncate hidden sm:block">{r.note}</p>
                </div>
              </div>
              <div className="text-right text-sm font-bold tabular-nums text-emerald-400">{r.projWins}</div>
            </Link>
          );
        })}
      </div>

      <section className="mt-12 rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold mb-4">Power Rankings FAQ</h2>
        <div className="divide-y divide-border/60">
          {FAQ.map((f, i) => (
            <details key={i} className="group py-3 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-start justify-between gap-4 text-sm font-semibold text-foreground list-none">
                <span>{f.question}</span>
                <span className="text-[#FF6200] shrink-0 transition-transform group-open:rotate-45 text-lg leading-none mt-[-2px]">+</span>
              </summary>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
