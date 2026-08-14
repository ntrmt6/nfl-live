import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, ChevronRight } from "lucide-react";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { absoluteUrl } from "@/lib/utils";
import { itemListSchema, breadcrumbSchema, faqPageSchema, collectionPageSchema } from "@/lib/schema-org";
import { teamToSlug } from "@/lib/teams";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Super Bowl LXI Odds & Predictions 2026-27 – AI Model Picks",
  description:
    "Live Super Bowl LXI (61) odds tracker for the 2026-27 NFL season. AI-powered championship predictions, conference favorites, and dark horse value picks updated weekly.",
  keywords: [
    "Super Bowl LXI odds",
    "Super Bowl 61 predictions",
    "Super Bowl 2027 odds",
    "NFL championship odds",
    "Super Bowl favorites 2026",
    "Super Bowl futures",
    "AFC champion odds",
    "NFC champion odds",
  ],
  alternates: { canonical: absoluteUrl("/predictions/super-bowl") },
  openGraph: {
    title: "Super Bowl LXI Odds & Predictions – Live AI Tracker",
    description: "AI-powered Super Bowl 61 odds and championship predictions for the 2026-27 NFL season.",
    url: absoluteUrl("/predictions/super-bowl"),
    type: "website",
    siteName: "NFL Predictions Hub",
  },
  twitter: { card: "summary_large_image" },
};

interface Contender {
  rank: number;
  team: string;
  abbr: string;
  odds: string;
  conf: "AFC" | "NFC";
  aiProb: number;
  angle: string;
}

const CONTENDERS: Contender[] = [
  { rank: 1, team: "Los Angeles Rams",       abbr: "LAR", odds: "+700",  conf: "NFC", aiProb: 14.3, angle: "The NFC's most complete roster: elite pass rush, Kupp-McVay chemistry restored, and the softest divisional schedule in the conference." },
  { rank: 2, team: "Detroit Lions",           abbr: "DET", odds: "+750",  conf: "NFC", aiProb: 13.3, angle: "Dan Campbell's offense keeps posting top-3 EPA/play. Health of the O-line is the only real bear case." },
  { rank: 3, team: "Baltimore Ravens",        abbr: "BAL", odds: "+800",  conf: "AFC", aiProb: 12.5, angle: "Two-time MVP Lamar Jackson, top-5 defense, and the deepest AFC roster on paper." },
  { rank: 4, team: "Buffalo Bills",           abbr: "BUF", odds: "+850",  conf: "AFC", aiProb: 11.8, angle: "Reigning MVP Allen and a defense that finally caught up. Their playoff bracket path is the concern." },
  { rank: 5, team: "Kansas City Chiefs",      abbr: "KC",  odds: "+900",  conf: "AFC", aiProb: 11.1, angle: "Dynasty odds are always short. Mahomes health + WR corps rebuild are the big open questions." },
  { rank: 6, team: "Philadelphia Eagles",     abbr: "PHI", odds: "+1000", conf: "NFC", aiProb: 10.0, angle: "Saquon Barkley + a real deep-threat WR2 keeps Philly among NFC's top three." },
  { rank: 7, team: "San Francisco 49ers",     abbr: "SF",  odds: "+1200", conf: "NFC", aiProb: 8.3,  angle: "If the Christian McCaffrey / Brandon Aiyuk / Trent Williams core is healthy, they're a top-3 NFC threat again." },
  { rank: 8, team: "Cincinnati Bengals",      abbr: "CIN", odds: "+1600", conf: "AFC", aiProb: 6.3,  angle: "Burrow + Chase remains the highest-ceiling offense in football. Defense is the swing factor." },
  { rank: 9, team: "Green Bay Packers",       abbr: "GB",  odds: "+2000", conf: "NFC", aiProb: 5.0,  angle: "Jordan Love's sophomore-plus-one leap keeps the Packers a legit contender in a wide-open NFC North." },
  { rank: 10, team: "Los Angeles Chargers",   abbr: "LAC", odds: "+2500", conf: "AFC", aiProb: 4.0,  angle: "Harbaugh year 2. Chargers open Week 1 as the only double-digit favorite on the board — market respects them." },
  { rank: 11, team: "Houston Texans",         abbr: "HOU", odds: "+2800", conf: "AFC", aiProb: 3.6,  angle: "Stroud has an elite ceiling and an AFC South that looks winnable again." },
  { rank: 12, team: "Washington Commanders",  abbr: "WAS", odds: "+3000", conf: "NFC", aiProb: 3.3,  angle: "Jayden Daniels + a stiffened defense makes Washington the trendy dark horse." },
];

const FAQ = [
  {
    question: "Who is the current Super Bowl LXI favorite?",
    answer: "The Los Angeles Rams and Detroit Lions are co-favorites in the NFC at roughly +700 to +750, with the Baltimore Ravens and Buffalo Bills leading the AFC. Our AI probability model has the top four teams within a few percentage points of each other — this is one of the most wide-open championship boards in years.",
  },
  {
    question: "When is Super Bowl LXI (Super Bowl 61)?",
    answer: "Super Bowl LXI is scheduled for February 14, 2027, at SoFi Stadium in Inglewood, California. It caps the 2026 NFL season.",
  },
  {
    question: "Which team is the best Super Bowl value bet?",
    answer: "At their current price, the Los Angeles Chargers (+2500) and Washington Commanders (+3000) offer the strongest value. Both are on the upswing with strong second-year QB systems and manageable divisional schedules.",
  },
  {
    question: "How does your Super Bowl probability model work?",
    answer: "The model blends live sportsbook implied championship probability with a projection layer that weighs each team's projected win total, strength of schedule, roster health, and quarterback efficiency. Weekly reruns keep the numbers fresh throughout the season.",
  },
  {
    question: "Has any team won back-to-back Super Bowls recently?",
    answer: "The Kansas City Chiefs completed a back-to-back championship in 2023, becoming the first team since the 2003-04 Patriots. Our model applies a small dynasty premium — but never treats a repeat as a base case.",
  },
];

export default function SuperBowlPage() {
  const listSchema = itemListSchema(
    CONTENDERS.map((c) => ({
      name: `${c.team} — ${c.odds} to win Super Bowl LXI`,
      url: `/teams/${teamToSlug(c.team)}`,
      description: c.angle,
    }))
  );
  const bcSchema = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Predictions", url: "/predictions" },
    { name: "Super Bowl LXI", url: "/predictions/super-bowl" },
  ]);
  const faqSchema = faqPageSchema(FAQ);
  const collSchema = collectionPageSchema({
    name: "Super Bowl LXI Odds & Predictions",
    description: "Live Super Bowl 61 odds and championship predictions for the 2026 NFL season.",
    url: "/predictions/super-bowl",
    numberOfItems: CONTENDERS.length,
  });

  const afc = CONTENDERS.filter((c) => c.conf === "AFC");
  const nfc = CONTENDERS.filter((c) => c.conf === "NFC");

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
          <Trophy className="h-3.5 w-3.5" /> Super Bowl LXI · Feb 14, 2027 · SoFi Stadium
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
          Super Bowl LXI <span className="text-gradient">Odds &amp; Predictions</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
          Live AI-powered Super Bowl 61 tracker. Weekly odds refresh, championship probability model, and full contender analysis for both the AFC and NFC as the 2026 NFL season unfolds.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <ConferenceBoard title="AFC Contenders" contenders={afc} accent="#00A8FF" />
        <ConferenceBoard title="NFC Contenders" contenders={nfc} accent="#FF6200" />
      </div>

      <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {CONTENDERS.slice(0, 6).map((c) => (
          <div key={c.rank} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <TeamLogo abbr={c.abbr} size={40} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">#{c.rank} · {c.conf}</p>
                <p className="font-bold text-lg">{c.team}</p>
                <p className="text-xs text-muted-foreground">{c.odds} · {c.aiProb.toFixed(1)}% AI prob</p>
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
        <h2 className="text-xl font-bold mb-4">Super Bowl LXI Frequently Asked Questions</h2>
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
        <h2 className="text-lg font-bold mb-3">Related Predictions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <Link href="/predictions/mvp" className="p-4 rounded-lg border border-border hover:border-[#FF6200]/40 transition-colors">
            <p className="font-bold mb-1">NFL MVP Tracker</p>
            <p className="text-xs text-muted-foreground">Live MVP odds &amp; rankings</p>
          </Link>
          <Link href="/predictions/power-rankings" className="p-4 rounded-lg border border-border hover:border-[#FF6200]/40 transition-colors">
            <p className="font-bold mb-1">NFL Power Rankings</p>
            <p className="text-xs text-muted-foreground">All 32 teams ranked weekly</p>
          </Link>
          <Link href="/predictions/division-winners" className="p-4 rounded-lg border border-border hover:border-[#FF6200]/40 transition-colors">
            <p className="font-bold mb-1">Division Winner Picks</p>
            <p className="text-xs text-muted-foreground">All 8 division predictions</p>
          </Link>
        </div>
      </section>
    </div>
  );
}

function ConferenceBoard({ title, contenders, accent }: { title: string; contenders: Contender[]; accent: string }) {
  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="h-1" style={{ background: accent }} />
      <div className="p-5">
        <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: accent }}>{title}</h2>
        <ol className="space-y-2">
          {contenders.map((c) => (
            <li key={c.rank}>
              <Link href={`/teams/${teamToSlug(c.team)}`} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/40 transition-colors">
                <span className="text-xs font-black text-muted-foreground w-6">#{c.rank}</span>
                <TeamLogo abbr={c.abbr} size={28} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate group-hover:text-[#FF6200] transition-colors">{c.team}</p>
                </div>
                <span className="text-xs font-black tabular-nums text-emerald-400">{c.odds}</span>
                <span className="text-xs text-muted-foreground tabular-nums shrink-0 w-12 text-right">{c.aiProb.toFixed(1)}%</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
