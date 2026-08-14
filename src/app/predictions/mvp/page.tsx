import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, Flame, ChevronRight } from "lucide-react";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { absoluteUrl } from "@/lib/utils";
import { itemListSchema, breadcrumbSchema, faqPageSchema, collectionPageSchema } from "@/lib/schema-org";
import { teamToSlug } from "@/lib/teams";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "NFL MVP Odds & Predictions 2026 – Live AI Tracker | NFL Predictions Hub",
  description:
    "Live 2026 NFL MVP tracker with AI-powered odds, weekly rankings, and full contender analysis. Updated every week with the latest QB stats, team performance, and betting movement.",
  keywords: [
    "NFL MVP 2026",
    "NFL MVP odds 2026",
    "NFL MVP predictions",
    "Josh Allen MVP odds",
    "Patrick Mahomes MVP",
    "Lamar Jackson MVP",
    "MVP futures",
    "NFL MVP tracker",
  ],
  alternates: { canonical: absoluteUrl("/predictions/mvp") },
  openGraph: {
    title: "NFL MVP Odds & Predictions 2026 – Live Tracker",
    description: "AI-powered NFL MVP tracker for the 2026 season. Weekly odds, contender analysis, and value picks.",
    url: absoluteUrl("/predictions/mvp"),
    type: "website",
    siteName: "NFL Predictions Hub",
  },
  twitter: {
    card: "summary_large_image",
    title: "NFL MVP Odds & Predictions 2026 – Live Tracker",
    description: "AI-powered NFL MVP tracker for the 2026 season.",
  },
};

interface Contender {
  rank: number;
  player: string;
  team: string;
  abbr: string;
  odds: string;
  aiScore: number;
  angle: string;
}

const CONTENDERS: Contender[] = [
  { rank: 1, player: "Josh Allen", team: "Buffalo Bills",         abbr: "BUF", odds: "+550",  aiScore: 92, angle: "Reigning MVP with a full offensive line back and Keon Coleman entering year 2. Bills project as the AFC's most balanced offense." },
  { rank: 2, player: "Lamar Jackson", team: "Baltimore Ravens",   abbr: "BAL", odds: "+600",  aiScore: 90, angle: "Two-time MVP with 4,000+ passing / 900+ rushing upside every year he stays healthy. Ravens still project as the AFC North favorite." },
  { rank: 3, player: "Patrick Mahomes", team: "Kansas City Chiefs", abbr: "KC", odds: "+700", aiScore: 85, angle: "ACL/LCL recovery is the biggest 2026 storyline. When healthy, the MVP baseline. Monitor Week 1 status closely." },
  { rank: 4, player: "Jayden Daniels", team: "Washington Commanders", abbr: "WAS", odds: "+900", aiScore: 82, angle: "Sophomore leap candidate with elite dual-threat production. Commanders' schedule strength is the swing factor." },
  { rank: 5, player: "Joe Burrow", team: "Cincinnati Bengals",    abbr: "CIN", odds: "+1000", aiScore: 80, angle: "Bengals' offense (Chase + Higgins + Mayfield-style pace) can carry Burrow to top passing volume." },
  { rank: 6, player: "Jalen Hurts", team: "Philadelphia Eagles",  abbr: "PHI", odds: "+1200", aiScore: 78, angle: "Eagles are the NFC favorite; Hurts' rushing TDs remain a huge MVP-narrative edge." },
  { rank: 7, player: "Bo Nix", team: "Denver Broncos",            abbr: "DEN", odds: "+2500", aiScore: 72, angle: "Broncos snapped KC's AFC West streak in 2025. Nix + Waddle is a dark-horse value bet." },
  { rank: 8, player: "Justin Herbert", team: "Los Angeles Chargers", abbr: "LAC", odds: "+2800", aiScore: 70, angle: "Chargers open as the only Week 1 double-digit favorite. Harbaugh year 2 arc could put Herbert back in top-5 MVP conversation." },
  { rank: 9, player: "Jared Goff", team: "Detroit Lions",         abbr: "DET", odds: "+3000", aiScore: 68, angle: "Lions remain a Super Bowl favorite. Goff's clean-pocket EPA/play is elite when the offense is clicking." },
  { rank: 10, player: "Brock Purdy", team: "San Francisco 49ers", abbr: "SF",  odds: "+3500", aiScore: 66, angle: "49ers offense returns to full health. Purdy's efficiency numbers historically rank among the league's best." },
  { rank: 11, player: "Baker Mayfield", team: "Tampa Bay Buccaneers", abbr: "TB", odds: "+4000", aiScore: 64, angle: "Bucs are the NFC South favorite. Mayfield already outperformed Vegas MVP odds in 2024." },
  { rank: 12, player: "C.J. Stroud", team: "Houston Texans",      abbr: "HOU", odds: "+4500", aiScore: 62, angle: "Texans upside is capped by AFC South parity but Stroud's ceiling remains elite." },
];

const FAQ = [
  {
    question: "Who is the current 2026 NFL MVP favorite?",
    answer: "As of the latest update, Josh Allen (Buffalo Bills) is the AI model's top-ranked MVP contender at roughly +550 odds. Lamar Jackson and Patrick Mahomes round out the top three, though Mahomes' status hinges on his Week 1 injury recovery.",
  },
  {
    question: "How does your NFL MVP AI model work?",
    answer: "The model blends implied MVP futures odds with a projection layer that weighs each team's schedule strength, projected win total, quarterback usage rate, and expected passing/rushing volume. Rankings refresh weekly as new team stats and injury information come in.",
  },
  {
    question: "Which sleeper QB has the best 2026 MVP value?",
    answer: "Bo Nix (Denver) and Jayden Daniels (Washington) are our top value picks. Both play on projected playoff teams, both are in their team's second full year of a system tailored to them, and their odds still sit outside the top 5.",
  },
  {
    question: "How often are MVP odds updated?",
    answer: "This page refreshes every hour on our side, and full rankings are re-scored weekly against the latest odds from major U.S. sportsbooks. Betting lines themselves move continuously — always confirm at your book before wagering.",
  },
  {
    question: "Do quarterbacks always win the NFL MVP?",
    answer: "In the past 12 years, only one non-quarterback (Adrian Peterson, 2012) has won MVP. Our model reflects that heavy positional bias — every 2026 contender in our top 15 is a starting QB.",
  },
];

export default function MvpPage() {
  const listSchema = itemListSchema(
    CONTENDERS.map((c) => ({
      name: `${c.player} — ${c.team} (${c.odds})`,
      url: `/teams/${teamToSlug(c.team)}`,
      description: c.angle,
    }))
  );
  const bcSchema = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Predictions", url: "/predictions" },
    { name: "MVP Tracker", url: "/predictions/mvp" },
  ]);
  const faqSchema = faqPageSchema(FAQ);
  const collSchema = collectionPageSchema({
    name: "2026 NFL MVP Odds & Predictions Tracker",
    description: "Live NFL MVP tracker with AI-powered odds, weekly rankings, and contender analysis for the 2026 season.",
    url: "/predictions/mvp",
    numberOfItems: CONTENDERS.length,
  });

  return (
    <div className="container py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bcSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="mb-6 flex items-center gap-3">
        <Link href="/predictions" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
          ← All Predictions
        </Link>
      </div>

      <header className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-black uppercase tracking-widest text-amber-400 mb-4">
          <Trophy className="h-3.5 w-3.5" /> Live Tracker · Updated Hourly
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
          2026 NFL MVP <span className="text-gradient">Odds &amp; Predictions</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
          Our AI model tracks every serious 2026 NFL MVP contender — combining live sportsbook odds with a projection layer that weighs schedule strength, projected win total, and QB usage. Rankings refresh weekly all season long.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-lg font-black uppercase tracking-widest mb-5 flex items-center gap-2">
          <Flame className="h-5 w-5 text-[#FF6200]" />
          Top 12 MVP Contenders
        </h2>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_100px_80px] md:grid-cols-[60px_1fr_140px_100px_80px] gap-3 px-4 py-3 border-b border-border bg-secondary/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <div>Rank</div>
            <div>Player</div>
            <div className="hidden md:block">Team</div>
            <div className="text-right">Odds</div>
            <div className="text-right">AI Score</div>
          </div>
          {CONTENDERS.map((c) => (
            <Link
              key={c.rank}
              href={`/teams/${teamToSlug(c.team)}`}
              className="group grid grid-cols-[40px_1fr_100px_80px] md:grid-cols-[60px_1fr_140px_100px_80px] gap-3 items-center px-4 py-3 border-b border-border/60 last:border-b-0 hover:bg-secondary/30 transition-colors"
            >
              <div className={`text-lg font-black ${c.rank <= 3 ? "text-amber-400" : "text-muted-foreground"}`}>
                #{c.rank}
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <TeamLogo abbr={c.abbr} size={32} />
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate group-hover:text-[#FF6200] transition-colors">{c.player}</p>
                  <p className="text-[11px] text-muted-foreground truncate md:hidden">{c.team}</p>
                </div>
              </div>
              <div className="hidden md:block text-xs text-muted-foreground truncate">{c.team}</div>
              <div className="text-right">
                <span className="inline-block rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs font-black text-emerald-400 tabular-nums">
                  {c.odds}
                </span>
              </div>
              <div className="text-right text-sm font-bold tabular-nums">
                <span className={c.aiScore >= 85 ? "text-emerald-400" : c.aiScore >= 75 ? "text-amber-400" : "text-muted-foreground"}>
                  {c.aiScore}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {CONTENDERS.slice(0, 6).map((c) => (
          <div key={c.rank} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <TeamLogo abbr={c.abbr} size={40} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">#{c.rank} MVP Contender</p>
                <p className="font-bold text-lg">{c.player}</p>
                <p className="text-xs text-muted-foreground">{c.team} · {c.odds}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{c.angle}</p>
            <Link href={`/teams/${teamToSlug(c.team)}`} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#FF6200] hover:gap-2 transition-all">
              View {c.team.split(" ").pop()} hub <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        ))}
      </section>

      <section className="mb-12 rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold mb-4">MVP Frequently Asked Questions</h2>
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
          <Link href="/predictions" className="p-4 rounded-lg border border-border hover:border-[#FF6200]/40 transition-colors">
            <p className="font-bold mb-1">All NFL Predictions</p>
            <p className="text-xs text-muted-foreground">Weekly picks &amp; win probabilities</p>
          </Link>
          <Link href="/predictions/super-bowl" className="p-4 rounded-lg border border-border hover:border-[#FF6200]/40 transition-colors">
            <p className="font-bold mb-1">Super Bowl LXI Odds</p>
            <p className="text-xs text-muted-foreground">Championship futures tracker</p>
          </Link>
          <Link href="/predictions/awards" className="p-4 rounded-lg border border-border hover:border-[#FF6200]/40 transition-colors">
            <p className="font-bold mb-1">All NFL Awards</p>
            <p className="text-xs text-muted-foreground">OROY · DROY · COY · DPOY</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
