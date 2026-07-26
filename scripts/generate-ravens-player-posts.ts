/**
 * Generates one unique blog post per Baltimore Ravens player.
 * Run: npx tsx scripts/generate-ravens-player-posts.ts
 * Existing posts are never overwritten.
 */

import "dotenv/config";
import mongoose from "mongoose";
import slugify from "slugify";

const MONGO_URI = process.env.MONGODB_URI || "";
if (!MONGO_URI) { console.error("MONGODB_URI not set"); process.exit(1); }

// ── Minimal models ────────────────────────────────────────────────────────────

const PostSchema = new mongoose.Schema({
  slug:            { type: String, required: true, unique: true },
  title:           { type: String, required: true },
  excerpt:         { type: String, required: true },
  content:         { type: String, required: true },
  coverImage:      { type: String },
  author:          { type: String, default: "NFL Predictions Hub Staff" },
  tags:            { type: [String], default: [] },
  published:       { type: Boolean, default: true },
  metaTitle:       { type: String },
  metaDescription: { type: String },
  schemaMarkup:    { type: String },
}, { timestamps: true });

const Post = mongoose.models?.Post || mongoose.model("Post", PostSchema);

// ── Ravens roster ─────────────────────────────────────────────────────────────

interface RavensPlayer {
  name: string;
  pos: string;
  number: number;
  age?: number;
  years?: number;
  overview: string;
  strengths: string[];
  weaknesses: string[];
  performance: string;
  impact: string;
  outlook: string;
}

const RAVENS_ROSTER: RavensPlayer[] = [
  {
    name: "Lamar Jackson",
    pos: "Quarterback",
    number: 8,
    age: 29,
    years: 8,
    overview: "Lamar Jackson is the Baltimore Ravens' franchise quarterback and a two-time NFL MVP who has redefined how the position is played in the modern era. The most elusive and dangerous dual-threat signal-caller in the AFC, Jackson combines elite play-action mastery with explosive scrambling ability that no defensive scheme has consistently solved.",
    strengths: [
      "Two-time MVP and the most dynamic rushing quarterback in NFL history — Jackson's ability to turn broken plays into major gains keeps every defense permanently off-balance.",
      "Elite play-action execution in John Harbaugh's system, generating some of the highest completion percentages in the league when operating off the run fake.",
      "Exceptional arm talent with the ability to throw with velocity, touch, and accuracy at every level of the field — his deep ball has improved significantly each season.",
      "Football IQ and pre-snap processing have elevated dramatically, making him as dangerous through the air as he is on the ground.",
    ],
    weaknesses: [
      "As a rusher, he absorbs physical punishment that accumulates over a full season — durability is the most cited concern about his long-term health.",
      "Can occasionally over-rely on improvisation in critical late-game situations rather than trusting the designed play to develop fully.",
      "Turnover risk rises slightly in playoff situations when defenses game-plan specifically around eliminating his running lanes.",
    ],
    performance: "Jackson has been the most valuable quarterback in the AFC for multiple consecutive seasons, posting rushing and passing numbers that no other player in league history has replicated. His 2023 season — which included a unanimous MVP award — stands as one of the most dominant individual campaigns in modern NFL history. He continues to improve his pocket passing, making him even harder to defend.",
    impact: "Jackson is the Ravens' offense in its entirety. Every schematic decision, every personnel grouping, and every play concept is built around maximizing what he can do. When Jackson is healthy and operating in the Ravens' system under Harbaugh, Baltimore is the most difficult team to prepare for in the entire AFC.",
    outlook: "Jackson enters 2026 as the most complete version of himself. His passing has refined, his decision-making has sharpened, and he is surrounded by his most complete supporting cast. If the Ravens stay healthy, this is the roster configuration capable of a deep Super Bowl run, with Jackson as the most dangerous player on either side of the ball.",
  },
  {
    name: "Derrick Henry",
    pos: "Running Back",
    number: 22,
    age: 32,
    years: 9,
    overview: "Derrick Henry is the Baltimore Ravens' featured running back and one of the most physically imposing ball carriers in NFL history. After a historic 2023 season with the Tennessee Titans that included a 2,000-yard campaign, Henry joined Baltimore and immediately became the ideal complement to Lamar Jackson's dual-threat attack, giving opposing defenses an impossible physical problem to solve.",
    strengths: [
      "The most powerful runner in professional football — Henry's combination of size (6'3\", 247 lbs) and speed (sub-4.5 40-yard dash) is essentially impossible to replicate at the position.",
      "Still capable of dominating entire games at 32, as demonstrated by his continued elite production in a Ravens offense that already demands defensive attention for Jackson.",
      "Exceptional contact balance for his frame — Henry regularly breaks first and second tackles before generating significant yards after contact.",
      "His reputation and physical presence forces opposing defenses to commit extra defenders near the box, creating the exact coverage situations Jackson exploits through the air.",
    ],
    weaknesses: [
      "Age at 32 is the primary concern — elite production from a power back at this stage of a career is rare, and workload management becomes increasingly important.",
      "Receiving production out of the backfield is limited, which allows defensive coordinators to substitute nickel packages without fearing a mismatch.",
      "Pass protection, while adequate, is not a strength that allows him to handle elite edge rushers in complex blitz packages.",
    ],
    performance: "Henry's arrival in Baltimore completed one of the most fearsome offensive combinations in AFC history. Pairing a 2,000-yard runner with a two-time MVP quarterback created defensive conflicts that no scheme has adequately addressed. His production has remained elite, a testament to both his physical conditioning and the schematic advantages the Ravens' offense provides.",
    impact: "Henry fundamentally changes how defenses must prepare for Baltimore. No defensive coordinator can commit to coverage-heavy schemes when Henry is in the backfield — the threat of a 70-yard run on any given carry forces run-first alignment that opens everything in the passing game for Jackson. His presence makes this offense historically difficult to stop.",
    outlook: "Henry enters 2026 with something to prove — that elite production at 32 was not a one-year anomaly. The Ravens' offensive system is ideally suited to preserve his career: designed runs, play-action that eliminates pursuit angles, and a passing game that prevents defenses from stacking the box. If Harbaugh manages his workload intelligently, Henry remains one of the three most dangerous running backs in the league.",
  },
  {
    name: "Mark Andrews",
    pos: "Tight End",
    number: 89,
    age: 29,
    years: 7,
    overview: "Mark Andrews is the Baltimore Ravens' elite receiving tight end and Lamar Jackson's most trusted target in critical situations. A three-time Pro Bowler who has established himself as one of the top two or three tight ends in professional football, Andrews brings contested-catch ability, red-zone dominance, and the unique chemistry with Jackson that makes Baltimore's offense so difficult to defend.",
    strengths: [
      "Elite hands and contested-catch ability that make him a reliable target even when defenses prioritize covering him — Andrews wins at the catch point against nearly any coverage.",
      "Red-zone nightmare for opposing defenses: his size (6'5\"), athleticism, and body control allow him to win in goal-to-go situations against any linebacker or safety assignment.",
      "Deep chemistry with Lamar Jackson built over seven seasons — the two have a timing and trust that extends to the most critical moments of games.",
      "Route running precision for the tight end position that creates genuine separation in the intermediate areas where defenses least expect it.",
    ],
    weaknesses: [
      "Injury history is the defining concern — Andrews has missed significant time to ankle injuries and must prove he can sustain a full season of elite production.",
      "Blocking as an in-line tight end is not his primary strength, which limits some of the Ravens' formation versatility when they need a true inline blocker.",
      "When healthy opponents bracket him with safety help, his target volume can drop significantly — Lamar must find secondary options.",
    ],
    performance: "When healthy, Andrews is the most productive tight end in the AFC and one of the best in the entire league. His numbers in red-zone situations and on third down are consistently among the league leaders at the position, and his role as Jackson's security blanket in high-pressure moments is unmatched. His comeback from injury was essential to Baltimore's offensive continuity.",
    impact: "Andrews is the irreplaceable piece of Baltimore's passing game. Without him, the Ravens' offense loses its most reliable intermediate target and its best red-zone weapon. His presence forces defensive coordinators to dedicate coverage resources that would otherwise be available to limit Jackson's other threats.",
    outlook: "Andrews' 2026 campaign hinges on staying healthy for a full season. A healthy Andrews alongside Henry and Jackson gives Baltimore one of the three most complete offenses in professional football. If he can deliver 16-plus games, he is a Pro Bowl lock and a top-five fantasy tight end with genuine All-Pro potential.",
  },
  {
    name: "Zay Flowers",
    pos: "Wide Receiver",
    number: 4,
    age: 24,
    years: 3,
    overview: "Zay Flowers is the Baltimore Ravens' emerging wide receiver star and one of the most explosive playmakers at the position in the AFC. After a remarkable rookie breakout that established him as the most dynamic pass-catching weapon outside the tight end position in Baltimore, Flowers has developed into a legitimate number-one wide receiver who demands consistent coverage attention.",
    strengths: [
      "Explosive speed and quickness that create separation at every level of the field — Flowers can beat press coverage, find openings in zone, and turn short completions into major gains with his after-the-catch ability.",
      "YAC machine: Flowers' elusiveness after the catch rivals anyone at the wide receiver position in the AFC, regularly turning five-yard completions into fifteen or twenty-yard gains.",
      "Natural chemistry with Jackson that has developed rapidly — the timing on crossing routes and dig concepts gives Baltimore a reliable intermediate threat to pair with Andrews.",
      "Youth and upside — at 24 in his third season, Flowers is still ascending toward his ceiling.",
    ],
    weaknesses: [
      "Size at 5'9\" creates physical matchup disadvantages against bigger press corners who can disrupt his releases at the line of scrimmage.",
      "Contested-catch consistency in the air needs continued development — Flowers is at his best when he has a step of separation rather than winning in traffic.",
      "Route precision and route tree expansion are still maturing for a receiver who was asked to produce immediately as a rookie.",
    ],
    performance: "Flowers' rookie season was one of the most impressive debut campaigns by a wide receiver in Ravens history, and his subsequent development has confirmed that the production was real and sustainable. His explosiveness in the open field — particularly on jet sweeps, screens, and crossing routes — gives Baltimore a dimension no other AFC offense can replicate with a wide receiver.",
    impact: "Flowers has become the most dangerous perimeter weapon in Baltimore's offense, forcing defenses to choose between stopping him or stopping Andrews — a choice that benefits Jackson regardless of which way the coverage tilts. His explosiveness on quick-game concepts gives the Ravens instant offense on first and second down.",
    outlook: "Flowers enters 2026 as one of the most exciting receivers in the AFC, poised for a breakout season that could include 1,000 receiving yards and double-digit touchdowns. His trajectory suggests continued improvement, and the Ravens' offensive system gives him the usage and schematic support to reach his full potential.",
  },
  {
    name: "Rashod Bateman",
    pos: "Wide Receiver",
    number: 7,
    age: 25,
    years: 5,
    overview: "Rashod Bateman is the Baltimore Ravens' veteran wide receiver with significant untapped upside. A former first-round pick whose career has been repeatedly interrupted by injuries, Bateman possesses the route running precision and deep-threat ability to be a genuine WR2 in Baltimore's offense when healthy.",
    strengths: [
      "Excellent route running technique refined through five professional seasons — Bateman's double moves and sharp cuts create legitimate separation against zone and man coverage.",
      "Deep-threat capability that few Ravens receivers can offer — his ability to threaten vertically stretches the defense and creates space for Andrews and Flowers underneath.",
      "Soft hands and reliable catches in traffic, particularly on comeback and post routes where physicality is required.",
    ],
    weaknesses: [
      "Injury history is the defining narrative of his career — Bateman has rarely played a full season of healthy football, limiting his ability to develop sustained chemistry with Jackson.",
      "Consistency in blocking on the perimeter, an important component of the Ravens' heavy run game, needs development.",
      "Durability questions create legitimate roster concerns about whether he can be counted on for a full 17-game season.",
    ],
    performance: "When healthy, Bateman has shown flashes of the receiver his first-round status projected — crisp routes, reliable hands, and the ability to create explosive plays. The challenge has always been availability, and his production comes in bursts interrupted by extended absences.",
    impact: "A healthy Bateman elevates the Ravens' passing game from very good to elite. His presence as a third legitimate receiving option forces defensive coordinators to spread their coverage resources in ways that benefit Andrews and Flowers simultaneously.",
    outlook: "Bateman's 2026 is a make-or-break season in terms of establishing himself as a reliable starter. If he can stay healthy for 15-plus games, the talent is clearly present for him to be a 700-800 yard receiver in this offense. His upside remains genuinely high — the question is whether his body will allow it to be realized.",
  },
  {
    name: "Devontez Walker",
    pos: "Wide Receiver",
    number: 17,
    age: 23,
    years: 2,
    overview: "Devontez Walker is a speedy rotational wide receiver developing within the Baltimore Ravens' offensive system. A young receiver still finding his role in the NFL, Walker brings the kind of straight-line speed that complements the Ravens' deep-threat concepts and forces defenses to account for the vertical game.",
    strengths: [
      "Elite straight-line speed that qualifies him as a legitimate deep threat on any route concept designed to attack the top of the defense.",
      "Young developmental profile at 23 — Walker is still learning the details of professional route running and coverage recognition.",
      "Fits the Ravens' system by providing a different look from Flowers and Bateman in four-receiver sets.",
    ],
    weaknesses: [
      "Limited NFL experience means route running precision and release technique against press coverage are still maturing.",
      "Consistency in run-after-catch situations needs development before he can be counted on as a primary option.",
      "Must earn and expand his role from a rotational baseline — starting production is not yet established.",
    ],
    performance: "Walker is in the developmental phase of his career, contributing primarily as a rotational piece who provides depth and speed. His upside is evident but requires continued refinement in the technical aspects of playing receiver at the NFL level.",
    impact: "Walker's value in 2026 is as a depth piece who can execute specific route concepts where his speed is the primary asset. His presence on the field as a potential deep threat forces safeties to cheat back, which opens space for the Ravens' more established receivers.",
    outlook: "Walker enters 2026 with an opportunity to carve out a larger role in the Baltimore offense. His speed is a genuine NFL asset, and another season of development could elevate him into a more prominent role if Bateman's injury issues persist.",
  },
  {
    name: "Tyler Huntley",
    pos: "Quarterback",
    number: 2,
    age: 27,
    years: 5,
    overview: "Tyler Huntley is the Baltimore Ravens' backup quarterback and a mobile signal-caller who fits naturally into John Harbaugh's system. Huntley has proven himself capable of filling in for Lamar Jackson in emergency situations, maintaining offensive productivity through his own rushing ability and comfortable execution of the Ravens' run-pass option concepts.",
    strengths: [
      "Mobile quarterback who can execute the Ravens' designed QB run game effectively, maintaining the threat of the ground attack even when Jackson is unavailable.",
      "Five seasons of deep immersion in Baltimore's offensive system means Huntley understands the concepts and communication at a level few backups in the league can match.",
      "Competitive and composed under pressure — Huntley has shown the ability to keep the Ravens in games when asked to start.",
    ],
    weaknesses: [
      "Arm talent and accuracy in the intermediate-to-deep passing game are below starter quality, which limits the vertical dimension of the offense when he plays.",
      "Defenses can simplify their game plan significantly against Huntley compared to Jackson, removing much of the schematic complexity that makes Baltimore's offense so difficult to prepare for.",
      "Limited upside as a starter over an extended stretch makes the Ravens' season significantly more fragile when Jackson misses games.",
    ],
    performance: "Huntley has been the most capable backup quarterback in the AFC for multiple seasons, largely because his mobility keeps the Ravens' identity intact in a limited way. When he has started, he has generally kept the team competitive, which is the highest bar a backup can reasonably be asked to meet.",
    impact: "The gap between Jackson and Huntley is significant, but Huntley's mobility ensures the Ravens don't have to completely abandon their identity when the starter misses time. His presence as a rushing threat prevents defenses from simply loading up against the run without Jackson in the game.",
    outlook: "Huntley's 2026 goal is to remain healthy and prepared so that if Jackson needs rest or faces injury, the Ravens can survive with a mobile backup who knows the system deeply. His value is entirely contingent on Jackson's availability.",
  },
  {
    name: "Justice Hill",
    pos: "Running Back",
    number: 43,
    age: 27,
    years: 6,
    overview: "Justice Hill is the Baltimore Ravens' receiving back and speed specialist who complements Derrick Henry in the Ravens' ground attack. A versatile backfield piece who excels in the passing game, Hill gives Jackson a reliable outlet and mismatch weapon against linebackers in space.",
    strengths: [
      "Receiving ability out of the backfield is among the best at the running back position in the AFC — Hill can line up in the slot and run routes as a legitimate receiving threat rather than just a checkdown option.",
      "Elite speed for the position allows him to create explosive plays when given open space on screens, wheel routes, and designed releases.",
      "Versatility allows Harbaugh to split him wide or use him in traditional backfield sets, creating defensive assignment conflicts.",
    ],
    weaknesses: [
      "Between-the-tackles production is limited — Hill is not a physical runner who can handle early-down carries in a traditional power running game.",
      "Durability at 27 has been mildly concerning, with some missed time to minor injuries.",
      "Pass protection against elite blitzers is a developmental area that limits his use on obvious passing downs.",
    ],
    performance: "Hill has been the Ravens' most important passing-down back, providing Jackson with a reliable outlet who turns short completions into meaningful gains. His receiving production is the best among Baltimore's running backs, and his presence as a mismatch in coverage has been exploited effectively by the offense.",
    impact: "Hill's ability to align in various positions and create receiving mismatches against linebackers gives the Ravens' offense a dimension that Derrick Henry cannot provide. His role in the passing game is essential to the offense's three-down functionality.",
    outlook: "Hill enters 2026 as an important complementary piece whose role expands when the Ravens face nickel and dime defenses. His receiving ability and speed keep him relevant in an offense dominated by Henry's carrying volume and Jackson's passing.",
  },
  {
    name: "Nnamdi Madubuike",
    pos: "Defensive Tackle",
    number: 92,
    age: 27,
    years: 5,
    overview: "Nnamdi Madubuike is the Baltimore Ravens' Pro Bowl-caliber defensive tackle and the anchor of a defensive interior that has been one of the AFC's most disruptive units. A legitimate two-way threat who excels against both the run and the passer, Madubuike has developed into one of the best interior defenders in the AFC.",
    strengths: [
      "Pro Bowl-level interior pass rush ability — Madubuike's quickness off the snap and developing counter move repertoire generate consistent pressure through interior offensive linemen.",
      "Elite run-stopping anchor who holds his gap assignment consistently, preventing cutback lanes that allow running backs to find open space.",
      "Motor and effort on every down make him a disruptive presence throughout the game, not just in obvious passing situations.",
      "Rare combination of run defense and pass rush production that makes him unmovable from the starting lineup regardless of game situation.",
    ],
    weaknesses: [
      "Against elite offensive guards using double teams, his interior push can be neutralized — the Ravens' scheme must account for this with linebacker run-support.",
      "Consistency across a full 17-game season has shown minor variance — he performs at an elite level in some games and a high-quality-starter level in others.",
      "Pass rush counter move diversification is still developing to complement his primary speed moves.",
    ],
    performance: "Madubuike has been the most productive interior defender in Baltimore's system, generating pressure rates that rank among the best defensive tackles in the AFC. His ability to collapse the pocket from inside forces quarterbacks to step into pressure generated by the edge rushers — a critical component of Baltimore's defensive identity.",
    impact: "Madubuike is the cornerstone of a Ravens defensive front that has been among the AFC's most disruptive. His interior pressure forces offensive coordinators to dedicate additional protection resources inside, freeing the edge rushers to win one-on-one matchups on the perimeter.",
    outlook: "Madubuike enters 2026 as a legitimate All-Pro candidate if he can sustain his peak performance across a full season. The Ravens have built their defensive identity around his interior disruption, and continued development in his counter move repertoire could elevate him to the top tier of interior defenders in professional football.",
  },
  {
    name: "Travis Jones",
    pos: "Defensive Tackle",
    number: 96,
    age: 25,
    years: 4,
    overview: "Travis Jones is the Baltimore Ravens' massive interior defensive tackle and a developing run-stopping anchor alongside Nnamdi Madubuike. At 6'4\" and 325 pounds, Jones brings the kind of interior presence that makes the Ravens' run defense one of the most physically imposing in the AFC.",
    strengths: [
      "Exceptional size and power at the point of attack — Jones occupies multiple blockers with his frame, freeing linebackers to pursue the ball carrier without obstruction.",
      "Run-stopping fundamentals that have improved steadily each season — Jones reads run keys quickly and uses his mass to clog interior gaps.",
      "Developing pass rush ability that has shown genuine improvement, expanding his value beyond pure run defense.",
    ],
    weaknesses: [
      "Pass rush production is still developing — Jones is primarily a run defender who has not yet reached consistent pressure rates as a pass rusher.",
      "Lateral quickness limitations against mobile quarterbacks and misdirection run concepts can create pursuit problems.",
      "Consistency across all four quarters needs continued development as he establishes himself in an expanded role.",
    ],
    performance: "Jones has been a dependable rotational defender whose primary value is in run defense. His presence alongside Madubuike gives the Ravens' defensive interior a physical mass that few offenses can match, and his developing pass rush has added a new dimension to his game.",
    impact: "Jones' partnership with Madubuike creates one of the most physically imposing defensive tackle duos in the AFC. His run-stopping presence allows Madubuike to focus on rushing the passer without worrying about gap integrity, making the overall defensive front more versatile.",
    outlook: "Jones enters 2026 with genuine upside to become a more complete defensive tackle. If his pass rush development continues and he can sustain his run-stopping production over a full season, he has the physical tools to become one of the better defensive tackles in the AFC within the next two seasons.",
  },
];

// ── Content generator ─────────────────────────────────────────────────────────

function generatePlayerPost(player: RavensPlayer) {
  const slug = slugify(`baltimore-ravens-${player.name}-player-profile-2026`, {
    lower: true, strict: true,
  });

  const title = `${player.name} — Baltimore Ravens ${player.pos} | 2026 Player Profile & Analysis`;
  const excerpt = `Complete 2026 player profile for Baltimore Ravens ${player.pos} ${player.name}. Strengths, weaknesses, performance analysis, and season outlook under head coach John Harbaugh.`;

  const strengthsHtml = player.strengths
    .map((s) => `<li>${s}</li>`)
    .join("\n");

  const weaknessesHtml = player.weaknesses
    .map((w) => `<li>${w}</li>`)
    .join("\n");

  const content = `
<h2>Player Overview</h2>
<p>${player.overview}</p>

<h2>Strengths</h2>
<ul>
${strengthsHtml}
</ul>

<h2>Weaknesses</h2>
<ul>
${weaknessesHtml}
</ul>

<h2>Performance &amp; Role</h2>
<p>${player.performance}</p>

<h2>Impact on the Ravens</h2>
<p>${player.impact}</p>

<h2>2026 Season Outlook</h2>
<p>${player.outlook}</p>

<p><em>Analysis based on the 2026 Baltimore Ravens roster and the system installed by head coach John Harbaugh.</em></p>
`.trim();

  const tags = [
    "Baltimore Ravens",
    "Ravens",
    "AFC North",
    player.name,
    player.pos,
    "Ravens Player Profile",
    "NFL Player Analysis",
    "2026 NFL Season",
    "John Harbaugh",
  ];

  return {
    slug,
    title,
    excerpt,
    content,
    author: "NFL Predictions Hub Staff",
    tags,
    published: true,
    metaTitle: `${player.name} | Baltimore Ravens ${player.pos} Profile 2026 — NFL Predictions Hub`,
    metaDescription: excerpt,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  let created = 0;
  let skipped = 0;

  for (const player of RAVENS_ROSTER) {
    const doc = generatePlayerPost(player);
    const existing = await Post.exists({ slug: doc.slug });

    if (existing) {
      console.log(`  ⟳ skip  ${player.name}`);
      skipped++;
      continue;
    }

    await Post.create(doc);
    console.log(`  ✎ gen   ${player.name}`);
    created++;
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped (already exist).`);
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
