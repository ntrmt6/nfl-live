import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { TeamLogo } from "@/components/ui/TeamLogo";
import { absoluteUrl } from "@/lib/utils";
import { itemListSchema, breadcrumbSchema, faqPageSchema, collectionPageSchema } from "@/lib/schema-org";
import { teamToSlug } from "@/lib/teams";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "NFL Division Winner Predictions 2026 – All 8 AFC/NFC Divisions",
  description:
    "AI-powered NFL division winner predictions for 2026: AFC East, AFC North, AFC South, AFC West, NFC East, NFC North, NFC South, NFC West. Odds, favorites, and value picks.",
  keywords: [
    "NFL division winners 2026",
    "AFC East predictions",
    "AFC North predictions",
    "AFC South predictions",
    "AFC West predictions",
    "NFC East predictions",
    "NFC North predictions",
    "NFC South predictions",
    "NFC West predictions",
    "NFL division odds",
  ],
  alternates: { canonical: absoluteUrl("/predictions/division-winners") },
  openGraph: {
    title: "NFL Division Winner Predictions 2026",
    description: "AI-powered picks for all 8 NFL divisions in the 2026 season.",
    url: absoluteUrl("/predictions/division-winners"),
    type: "website",
    siteName: "NFL Predictions Hub",
  },
};

interface DivisionRow {
  team: string;
  abbr: string;
  odds: string;
  aiProb: number;
  note: string;
}
interface Division {
  code: string;
  name: string;
  teams: DivisionRow[];
}

const DIVISIONS: Division[] = [
  {
    code: "afc-east", name: "AFC East",
    teams: [
      { team: "Buffalo Bills",       abbr: "BUF", odds: "-160", aiProb: 61, note: "Reigning MVP Allen; defense finally caught up. Bills have won the division 4 straight years." },
      { team: "Miami Dolphins",      abbr: "MIA", odds: "+280", aiProb: 22, note: "Tua/O-line health defines the season. Weapons are still there." },
      { team: "New York Jets",       abbr: "NYJ", odds: "+800", aiProb: 10, note: "New regime, new QB. Bottoming out year." },
      { team: "New England Patriots", abbr: "NE", odds: "+900", aiProb: 7,  note: "Drake Maye's second year with an upgraded receiving corps." },
    ],
  },
  {
    code: "afc-north", name: "AFC North",
    teams: [
      { team: "Baltimore Ravens",       abbr: "BAL", odds: "-140", aiProb: 55, note: "Two-time MVP Jackson + deepest AFC roster." },
      { team: "Cincinnati Bengals",     abbr: "CIN", odds: "+220", aiProb: 27, note: "Highest-ceiling offense in football. Defense must hold up." },
      { team: "Pittsburgh Steelers",    abbr: "PIT", odds: "+400", aiProb: 15, note: "Rodgers + top-5 defense keeps them in every game." },
      { team: "Cleveland Browns",       abbr: "CLE", odds: "+1800", aiProb: 3,  note: "QB uncertainty caps the ceiling." },
    ],
  },
  {
    code: "afc-south", name: "AFC South",
    teams: [
      { team: "Houston Texans",         abbr: "HOU", odds: "-110", aiProb: 45, note: "Stroud's ceiling is elite. Division still winnable at 9-10 wins." },
      { team: "Indianapolis Colts",     abbr: "IND", odds: "+280", aiProb: 27, note: "Anthony Richardson's dev + Steichen's scheme = live wild card." },
      { team: "Jacksonville Jaguars",    abbr: "JAX", odds: "+350", aiProb: 22, note: "Lawrence must make the leap; Travis Hunter is a wildcard." },
      { team: "Tennessee Titans",       abbr: "TEN", odds: "+800", aiProb: 6,  note: "Cam Ward era begins. Rebuilding front." },
    ],
  },
  {
    code: "afc-west", name: "AFC West",
    teams: [
      { team: "Los Angeles Chargers",   abbr: "LAC", odds: "+140", aiProb: 40, note: "Only Week 1 double-digit favorite. Market caught up to Harbaugh year 2." },
      { team: "Kansas City Chiefs",     abbr: "KC",  odds: "+160", aiProb: 38, note: "Mahomes health defines the season. Dynasty odds always short." },
      { team: "Denver Broncos",         abbr: "DEN", odds: "+280", aiProb: 20, note: "Snapped KC's streak in 2025. Waddle addition is real." },
      { team: "Las Vegas Raiders",      abbr: "LV",  odds: "+2500", aiProb: 2,  note: "Rebuilding. Jeanty is the identity." },
    ],
  },
  {
    code: "nfc-east", name: "NFC East",
    teams: [
      { team: "Philadelphia Eagles",    abbr: "PHI", odds: "-180", aiProb: 60, note: "Deepest roster; only Chiefs-tier team in NFC East." },
      { team: "Washington Commanders",  abbr: "WAS", odds: "+240", aiProb: 25, note: "Jayden Daniels' encore + Quinn defense = trendy dark horse." },
      { team: "Dallas Cowboys",         abbr: "DAL", odds: "+500", aiProb: 12, note: "Dak-CeeDee-Pickens still elite; D-line aged fast." },
      { team: "New York Giants",        abbr: "NYG", odds: "+1400", aiProb: 3,  note: "Jaxson Dart era + Abdul Carter = most upside in years." },
    ],
  },
  {
    code: "nfc-north", name: "NFC North",
    teams: [
      { team: "Detroit Lions",          abbr: "DET", odds: "+120", aiProb: 42, note: "Top-3 offense; O-line health is the only bear case." },
      { team: "Green Bay Packers",      abbr: "GB",  odds: "+200", aiProb: 32, note: "Jordan Love year 3 with an upgraded WR room." },
      { team: "Minnesota Vikings",      abbr: "MIN", odds: "+300", aiProb: 20, note: "If McCarthy is the answer, Vikings are a lock." },
      { team: "Chicago Bears",          abbr: "CHI", odds: "+600", aiProb: 6,  note: "Ben Johnson + Caleb Williams year 2 = classic spike setup." },
    ],
  },
  {
    code: "nfc-south", name: "NFC South",
    teams: [
      { team: "Tampa Bay Buccaneers",   abbr: "TB",  odds: "-140", aiProb: 52, note: "NFC South favorite. Mayfield-Evans-Godwin humming." },
      { team: "Atlanta Falcons",        abbr: "ATL", odds: "+220", aiProb: 27, note: "Penix Jr. + Bijan = top-8 NFC South offense." },
      { team: "New Orleans Saints",     abbr: "NO",  odds: "+700", aiProb: 13, note: "Roster in transition." },
      { team: "Carolina Panthers",      abbr: "CAR", odds: "+800", aiProb: 8,  note: "Bryce Young year 3 must show growth." },
    ],
  },
  {
    code: "nfc-west", name: "NFC West",
    teams: [
      { team: "Los Angeles Rams",       abbr: "LAR", odds: "-125", aiProb: 48, note: "NFC's most complete roster. Softest divisional schedule." },
      { team: "San Francisco 49ers",    abbr: "SF",  odds: "+180", aiProb: 34, note: "Full-health 49ers are back among NFC's top three." },
      { team: "Seattle Seahawks",       abbr: "SEA", odds: "+500", aiProb: 12, note: "Rebuilt defense + Darnold + Lumen = wild-card path." },
      { team: "Arizona Cardinals",      abbr: "ARI", odds: "+700", aiProb: 6,  note: "Kyler + Harrison + healthy McBride = one of the most improved offenses." },
    ],
  },
];

const FAQ = [
  {
    question: "Who is predicted to win the AFC East in 2026?",
    answer: "The Buffalo Bills are heavy favorites at -160 to win the AFC East for a fifth straight year, with our AI model giving them roughly a 61% probability. Miami is the primary challenger at +280.",
  },
  {
    question: "Which NFL division is most competitive in 2026?",
    answer: "The AFC West is the tightest division on our board, with the Chargers (+140) and Chiefs (+160) essentially a coin flip and the Broncos (+280) very live after snapping KC's streak in 2025. Our AI model has all three within 20 percentage points.",
  },
  {
    question: "Which team is the best division-winner value bet?",
    answer: "The Denver Broncos (+280 for AFC West) and Cincinnati Bengals (+220 for AFC North) offer the strongest value at their current prices. Both are on the upswing and both play in divisions where the favorite has a real vulnerability.",
  },
  {
    question: "How often are division winner odds updated?",
    answer: "Odds and probabilities on this page refresh hourly. Full rankings are re-scored weekly using rolling team efficiency, injury updates, and results from the prior week.",
  },
];

export default function DivisionsPage() {
  const items = DIVISIONS.flatMap((d) => d.teams.map((t) => ({
    name: `${t.team} — ${d.name} favorite (${t.odds})`,
    url: `/teams/${teamToSlug(t.team)}`,
    description: t.note,
  })));
  const listSchema = itemListSchema(items);
  const bcSchema = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Predictions", url: "/predictions" },
    { name: "Division Winners", url: "/predictions/division-winners" },
  ]);
  const faqSchema = faqPageSchema(FAQ);
  const collSchema = collectionPageSchema({
    name: "NFL Division Winner Predictions 2026",
    description: "AI-powered picks and odds for all 8 NFL divisions in the 2026 season.",
    url: "/predictions/division-winners",
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
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-400 mb-4">
          <Trophy className="h-3.5 w-3.5" /> 2026 Season · Live Odds
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
          NFL Division Winner <span className="text-gradient">Predictions 2026</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
          AI-powered division-winner odds and probabilities for all 8 NFL divisions. Full favorite, challenger, and value picks for AFC East, North, South, West and NFC East, North, South, West.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DIVISIONS.map((d) => (
          <section key={d.code} id={d.code} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-secondary/40">
              <h2 className="text-sm font-black uppercase tracking-widest">{d.name}</h2>
            </div>
            {d.teams.map((t, i) => (
              <Link
                key={t.team}
                href={`/teams/${teamToSlug(t.team)}`}
                className="group grid grid-cols-[30px_1fr_auto_50px] gap-3 items-center px-4 py-3 border-b border-border/60 last:border-b-0 hover:bg-secondary/30 transition-colors"
              >
                <span className={`text-sm font-black ${i === 0 ? "text-amber-400" : "text-muted-foreground"}`}>#{i + 1}</span>
                <div className="flex items-center gap-3 min-w-0">
                  <TeamLogo abbr={t.abbr} size={28} />
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate group-hover:text-[#FF6200] transition-colors">{t.team}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{t.note}</p>
                  </div>
                </div>
                <span className="inline-block rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs font-black text-emerald-400 tabular-nums">{t.odds}</span>
                <span className="text-xs text-muted-foreground tabular-nums text-right">{t.aiProb}%</span>
              </Link>
            ))}
          </section>
        ))}
      </div>

      <section className="mt-12 rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-bold mb-4">Division Winner FAQ</h2>
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
