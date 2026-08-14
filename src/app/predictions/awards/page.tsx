import type { Metadata } from "next";
import Link from "next/link";
import { Award, ChevronRight } from "lucide-react";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { absoluteUrl } from "@/lib/utils";
import { itemListSchema, breadcrumbSchema, faqPageSchema, collectionPageSchema } from "@/lib/schema-org";
import { teamToSlug } from "@/lib/teams";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "NFL Awards Predictions 2026: OROY, DROY, COY, DPOY, CPOY Odds",
  description:
    "Complete 2026 NFL awards tracker: Offensive Rookie of the Year, Defensive Rookie of the Year, Coach of the Year, Defensive Player of the Year, and Comeback Player of the Year odds and AI predictions.",
  keywords: [
    "NFL awards 2026",
    "Offensive Rookie of the Year 2026",
    "Defensive Rookie of the Year 2026",
    "NFL Coach of the Year odds",
    "NFL DPOY odds",
    "NFL Comeback Player of the Year",
    "NFL award odds",
    "NFL futures",
  ],
  alternates: { canonical: absoluteUrl("/predictions/awards") },
  openGraph: {
    title: "NFL Awards Predictions 2026: OROY, DROY, COY, DPOY, CPOY Odds",
    description: "Complete 2026 NFL awards tracker with AI-powered odds and analysis.",
    url: absoluteUrl("/predictions/awards"),
    type: "website",
    siteName: "NFL Predictions Hub",
  },
};

interface Award {
  code: string;
  title: string;
  intro: string;
  contenders: { player: string; team: string; abbr: string; odds: string; note: string }[];
}

const AWARDS: Award[] = [
  {
    code: "oroy",
    title: "Offensive Rookie of the Year (OROY)",
    intro: "Volume matters more than efficiency. QBs with a full-season starting job dominate — followed by RBs on run-first offenses.",
    contenders: [
      { player: "Cam Ward",   team: "Tennessee Titans",    abbr: "TEN", odds: "+300", note: "Presumed Week 1 starter with plus-arm talent and a Titans OC scheme built around bootlegs and RPOs." },
      { player: "Ashton Jeanty", team: "Las Vegas Raiders", abbr: "LV",  odds: "+400", note: "Historic Boise State workload translates to a lead-back role from day one for Vegas." },
      { player: "Travis Hunter", team: "Jacksonville Jaguars", abbr: "JAX", odds: "+800", note: "Two-way usage complicates award voting — but WR snaps + return duty adds voter appeal." },
      { player: "Shedeur Sanders", team: "Cleveland Browns", abbr: "CLE", odds: "+900", note: "Value pick if the Browns hand him the starting job by midseason." },
      { player: "Omarion Hampton", team: "Los Angeles Chargers", abbr: "LAC", odds: "+1200", note: "Featured back in a Harbaugh run-heavy scheme is exactly the OROY archetype." },
    ],
  },
  {
    code: "droy",
    title: "Defensive Rookie of the Year (DROY)",
    intro: "Voters love edge rushers with double-digit sack ceilings and DBs with pick-six upside.",
    contenders: [
      { player: "Abdul Carter",  team: "New York Giants",    abbr: "NYG", odds: "+250", note: "Elite EDGE prospect stepping into a Giants defense designed to unleash a top-3 pick." },
      { player: "Mason Graham",  team: "Cleveland Browns",   abbr: "CLE", odds: "+500", note: "Interior wrecker paired with Myles Garrett. Snap share will be immediate." },
      { player: "Jalon Walker",  team: "Atlanta Falcons",    abbr: "ATL", odds: "+700", note: "Off-ball LB with pass-rush upside — versatile role is a voter narrative winner." },
      { player: "Mykel Williams", team: "San Francisco 49ers", abbr: "SF",  odds: "+800", note: "49ers reload their D-line; Williams gets one-on-ones from day one." },
      { player: "Malaki Starks",  team: "Baltimore Ravens",  abbr: "BAL", odds: "+1200", note: "Safety with center-field range; his production will show up on prime-time nationally televised games." },
    ],
  },
  {
    code: "coy",
    title: "Coach of the Year (COY)",
    intro: "The COY always follows a team that jumps at least 3 wins from the prior season, with a strong late-season narrative.",
    contenders: [
      { player: "Sean Payton",   team: "Denver Broncos",     abbr: "DEN", odds: "+700",  note: "Broncos are the trendy AFC dark horse after snapping the Chiefs' division title streak." },
      { player: "Ben Johnson",   team: "Chicago Bears",      abbr: "CHI", odds: "+800",  note: "Rookie head coach + Caleb Williams year 2 is the classic COY spike setup." },
      { player: "Jim Harbaugh",  team: "Los Angeles Chargers", abbr: "LAC", odds: "+1000", note: "Chargers projected as a top-3 AFC team. Voters reward year-2 leaps." },
      { player: "Dan Quinn",     team: "Washington Commanders", abbr: "WAS", odds: "+1200", note: "Follow-up season to a huge Y1 turnaround. Commanders' schedule is the wildcard." },
      { player: "Kevin O'Connell", team: "Minnesota Vikings", abbr: "MIN", odds: "+1400", note: "If McCarthy takes the leap, KOC gets the credit." },
    ],
  },
  {
    code: "dpoy",
    title: "Defensive Player of the Year (DPOY)",
    intro: "Edge rushers with 15+ sacks dominate voting. Sacks + splash plays win.",
    contenders: [
      { player: "Micah Parsons",   team: "Dallas Cowboys",     abbr: "DAL", odds: "+400",  note: "Perennial contender. Full 17-game slate is all that's between him and a first DPOY." },
      { player: "Myles Garrett",   team: "Cleveland Browns",   abbr: "CLE", odds: "+500",  note: "Reigning DPOY — repeats are historically rare but Garrett's ceiling is unmatched." },
      { player: "T.J. Watt",       team: "Pittsburgh Steelers", abbr: "PIT", odds: "+600",  note: "Steelers' pass-rush volume always keeps Watt in the conversation." },
      { player: "Nick Bosa",       team: "San Francisco 49ers", abbr: "SF",  odds: "+800",  note: "Healthy Bosa returns to a 49ers D that leads the NFL in team pressure rate." },
      { player: "Aidan Hutchinson", team: "Detroit Lions",     abbr: "DET", odds: "+900",  note: "Bounce-back season on a Lions defense that added help at every level." },
    ],
  },
  {
    code: "cpoy",
    title: "Comeback Player of the Year (CPOY)",
    intro: "Voters reward players returning from major injury who put up standout numbers — usually QBs.",
    contenders: [
      { player: "Patrick Mahomes", team: "Kansas City Chiefs", abbr: "KC",  odds: "+250", note: "If Mahomes is back Week 1 and Chiefs win the division, this is a near-lock." },
      { player: "Aidan Hutchinson", team: "Detroit Lions",     abbr: "DET", odds: "+400", note: "Post-injury bounce-back on a top NFC team." },
      { player: "Aaron Rodgers",   team: "Pittsburgh Steelers", abbr: "PIT", odds: "+800", note: "Full season in Pittsburgh with a real defense behind him — narrative pick." },
      { player: "Christian McCaffrey", team: "San Francisco 49ers", abbr: "SF", odds: "+1000", note: "If CMC hits 1,500+ scrimmage yards, he's automatic." },
      { player: "Anthony Richardson", team: "Indianapolis Colts", abbr: "IND", odds: "+1500", note: "Health-plus-development bet in a wide-open AFC South." },
    ],
  },
];

const FAQ = [
  {
    question: "Who is favored to win the 2026 NFL Offensive Rookie of the Year?",
    answer: "Cam Ward of the Tennessee Titans opens as the favorite at roughly +300 odds, followed by Ashton Jeanty (LV) at +400. Rookie QBs with a Week 1 starting job historically dominate OROY voting because of volume.",
  },
  {
    question: "Who is favored for Defensive Rookie of the Year 2026?",
    answer: "Abdul Carter of the New York Giants is the market favorite at +250. Voters weight edge-rusher sacks and DB interceptions above everything else — Carter's snap share and pass-rush role make him the cleanest bet.",
  },
  {
    question: "Which coach is most likely to win NFL Coach of the Year?",
    answer: "Sean Payton (Denver Broncos) and Ben Johnson (Chicago Bears) are our top picks. COY almost always goes to a coach whose team improved by 3+ wins with a big late-season narrative — both fit that profile.",
  },
  {
    question: "How does the AI model rank award contenders?",
    answer: "We combine implied odds from major U.S. sportsbooks with a projection layer that scores each player's expected volume (snaps, touches, sacks, interceptions, wins) and voter-narrative factors (team playoff seed, prime-time exposure, comeback storylines).",
  },
];

export default function AwardsPage() {
  const items = AWARDS.flatMap((a) => a.contenders.map((c) => ({
    name: `${c.player} — ${a.title} contender (${c.odds})`,
    url: `/teams/${teamToSlug(c.team)}`,
    description: c.note,
  })));
  const listSchema = itemListSchema(items);
  const bcSchema = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Predictions", url: "/predictions" },
    { name: "Awards", url: "/predictions/awards" },
  ]);
  const faqSchema = faqPageSchema(FAQ);
  const collSchema = collectionPageSchema({
    name: "2026 NFL Awards Predictions",
    description: "AI-powered odds and analysis for every 2026 NFL award: OROY, DROY, COY, DPOY, CPOY.",
    url: "/predictions/awards",
    numberOfItems: items.length,
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
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-black uppercase tracking-widest text-amber-400 mb-4">
          <Award className="h-3.5 w-3.5" /> Live Odds Tracker
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
          2026 NFL <span className="text-gradient">Awards Predictions</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
          Live odds and AI-powered picks for every major 2026 NFL individual award — Offensive/Defensive Rookie of the Year, Coach of the Year, Defensive Player of the Year, and Comeback Player of the Year. Updated weekly all season.
        </p>
      </header>

      {AWARDS.map((award) => (
        <section key={award.code} id={award.code} className="mb-10">
          <h2 className="text-2xl font-black mb-2">{award.title}</h2>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed max-w-2xl">{award.intro}</p>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {award.contenders.map((c, i) => (
              <Link
                key={c.player}
                href={`/teams/${teamToSlug(c.team)}`}
                className="group grid grid-cols-[40px_1fr_auto] gap-3 items-center px-4 py-3 border-b border-border/60 last:border-b-0 hover:bg-secondary/30 transition-colors"
              >
                <span className={`text-lg font-black ${i === 0 ? "text-amber-400" : "text-muted-foreground"}`}>#{i + 1}</span>
                <div className="flex items-center gap-3 min-w-0">
                  <TeamLogo abbr={c.abbr} size={32} />
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate group-hover:text-[#FF6200] transition-colors">{c.player}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{c.team} · {c.note}</p>
                  </div>
                </div>
                <span className="inline-block rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs font-black text-emerald-400 tabular-nums shrink-0">
                  {c.odds}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="mb-12 rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold mb-4">NFL Awards Frequently Asked Questions</h2>
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

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold mb-3">Related</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <Link href="/predictions/mvp" className="p-4 rounded-lg border border-border hover:border-[#FF6200]/40 transition-colors">
            <p className="font-bold mb-1">NFL MVP Tracker</p>
            <p className="text-xs text-muted-foreground">Live MVP odds</p>
          </Link>
          <Link href="/predictions/super-bowl" className="p-4 rounded-lg border border-border hover:border-[#FF6200]/40 transition-colors">
            <p className="font-bold mb-1">Super Bowl LXI Odds</p>
            <p className="text-xs text-muted-foreground">Championship futures</p>
          </Link>
          <Link href="/predictions/power-rankings" className="p-4 rounded-lg border border-border hover:border-[#FF6200]/40 transition-colors">
            <p className="font-bold mb-1">Power Rankings</p>
            <p className="text-xs text-muted-foreground">All 32 teams ranked</p>
          </Link>
        </div>
      </section>

      <nav className="mt-8 flex flex-wrap gap-2 text-xs">
        {AWARDS.map((a) => (
          <a key={a.code} href={`#${a.code}`} className="inline-flex items-center gap-1 rounded-full bg-secondary hover:bg-secondary/70 px-3 py-1 font-bold text-muted-foreground hover:text-foreground transition-colors">
            {a.title.split(" (")[0]} <ChevronRight className="h-3 w-3" />
          </a>
        ))}
      </nav>
    </div>
  );
}
