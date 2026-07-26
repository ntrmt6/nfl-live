/**
 * Generates one unique blog post per Pittsburgh Steelers player.
 * Run: npx tsx scripts/generate-steelers-player-posts.ts
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

// ── Steelers roster ───────────────────────────────────────────────────────────

interface SteelersPlayer {
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

const STEELERS_ROSTER: SteelersPlayer[] = [
  {
    name: "Aaron Rodgers",
    pos: "Quarterback",
    number: 8,
    age: 42,
    years: 20,
    overview: "Aaron Rodgers is the Pittsburgh Steelers' legendary starting quarterback in what he has publicly declared to be his final NFL season. A four-time MVP and Super Bowl champion, Rodgers brings 20 seasons of elite quarterback play to Pittsburgh, reuniting with head coach Mike McCarthy in a partnership that once produced extraordinary results in Green Bay. Targeting DK Metcalf deep and leveraging his veteran craft, Rodgers is determined to add a final chapter of championship glory to one of the most decorated careers in NFL history.",
    strengths: [
      "All-time great quarterback with one of the deepest arsenals of arm talent and improvisation ability in the history of the position — Rodgers can still make throws that no other quarterback in the league attempts.",
      "Pre-snap mastery developed through 20 seasons — Rodgers' ability to identify coverage, manipulate secondary rotation, and call the perfect play at the line of scrimmage remains elite.",
      "Chemistry with McCarthy provides an established communication system — the two produced historic results in Green Bay, and their reconnection gives Pittsburgh a proven partnership.",
      "Deep-ball connection with DK Metcalf is one of the most physically imposing quarterback-receiver combinations in the AFC — the combination of Rodgers' arm and Metcalf's size creates an unstoppable red-zone weapon.",
    ],
    weaknesses: [
      "Age at 42 creates legitimate questions about his arm strength, processing speed, and physical resilience across a full 17-game season.",
      "Mobility has declined significantly — Rodgers is a pure pocket passer whose ability to extend plays with his legs is essentially gone.",
      "Chemistry building with an entirely new receiving corps requires preseason and early-season reps that compress his effectiveness timeline.",
    ],
    performance: "Rodgers' performance in Pittsburgh will be the most scrutinized story of the 2026 NFL season. When operating from a clean pocket against coverage designed for lesser quarterbacks, he remains capable of producing elite results. His veteran processing and timing ability can compensate for reduced athleticism in the right game situations.",
    impact: "Rodgers' impact on Pittsburgh extends beyond statistics. His competitive intensity, preparation standards, and 20 years of championship-caliber habits set a tone for a Steelers franchise that has always demanded excellence. His final season could provide the veteran leadership that propels a talented roster to unexpected heights.",
    outlook: "Rodgers enters 2026 with the motivation of one final championship pursuit driving every preparation decision. If his arm holds, Metcalf delivers the contested catches his body guarantees, and McCarthy designs the right game plan, Pittsburgh is a legitimate dark-horse AFC contender. His final season is the most compelling individual narrative in professional football.",
  },
  {
    name: "DK Metcalf",
    pos: "Wide Receiver",
    number: 14,
    age: 28,
    years: 7,
    overview: "DK Metcalf is the Pittsburgh Steelers' physically dominant elite wide receiver — one of the most imposing pass-catching presences in the history of the position. At 6'4\" and 235 pounds with 4.33 speed, Metcalf represents the highest ceiling for any receiver in professional football, combining freak athleticism with the size to dominate contested situations that smaller receivers cannot survive. Developing chemistry with Rodgers is the central task of the 2026 preseason, and when that connection matures, Pittsburgh's offense becomes genuinely dangerous.",
    strengths: [
      "The most physically dominant receiver in professional football — Metcalf's combination of size, speed, and strength at 6'4\" and 235 pounds cannot be replicated by any defensive back alignment.",
      "Contested-catch monster whose catch radius, body control, and physicality at the catch point make him nearly impossible to cover in jump-ball situations.",
      "Red-zone presence that no defensive coordinator can neutralize — Metcalf in the end zone against any safety or linebacker is an unfair matchup.",
      "Deep speed that forces safety rotation over the top, creating the coverage openings that Rodgers' veteran processing can identify and exploit.",
    ],
    weaknesses: [
      "Chemistry with Rodgers is building from scratch — a new quarterback relationship requires time and reps that affect early-season timing.",
      "Route running precision and the full route tree still represent development areas relative to the absolute elite receiver tier.",
      "Consistency against elite press corners who can disrupt his releases and force him into physical battles at the line has been variable.",
    ],
    performance: "Metcalf has been one of the two or three most physically imposing receivers in professional football since his rookie season, and his production — while occasionally inconsistent — includes some of the most spectacular individual plays of any receiver in the AFC. His physical tools guarantee that on any given snap, he can produce an explosive play.",
    impact: "Metcalf's impact on Pittsburgh's offense is in changing how every defense must prepare for the Steelers. No defensive coordinator can ignore a 6'4\", 4.33 speed receiver who can dominate any individual coverage — the resources committed to stopping him create opportunities for Pittman and the rest of the offense.",
    outlook: "Metcalf enters 2026 as the most physically gifted receiver in the AFC and the player with the highest ceiling in Pittsburgh's offense. As his chemistry with Rodgers develops through the season, his production should accelerate — and in the right game situations, he is capable of the kind of dominant individual performance that defines playoff outcomes.",
  },
  {
    name: "Michael Pittman Jr.",
    pos: "Wide Receiver",
    number: 11,
    age: 28,
    years: 6,
    overview: "Michael Pittman Jr. is the Pittsburgh Steelers' polished possession receiver and the complement to DK Metcalf's explosive physical game. A reliable route runner with exceptional hands and developing deep-threat capability, Pittman brings the consistency and football intelligence that make him Rodgers' most dependable target in the intermediate areas where precise timing routes are most efficient.",
    strengths: [
      "Reliable hands and exceptional catch consistency — Pittman rarely drops catchable balls, making him one of the safest intermediate targets in the AFC.",
      "Route running polish that generates consistent separation against zone and man coverage — his timing and precision are why Rodgers will trust him quickly.",
      "Career-high touchdown production demonstrates his ability to convert opportunities in the red zone and on possession routes.",
      "Football intelligence and communication that allow him to adjust routes and find coverage windows at the professional level.",
    ],
    weaknesses: [
      "Top-end speed, while adequate, means he cannot consistently separate from elite corners on pure vertical routes.",
      "Physical frame at 6'4\" and 220 pounds means contested catches against the biggest cornerbacks require winning technique rather than physical dominance.",
    ],
    performance: "Pittman has been one of the more underrated wide receivers in the AFC, delivering consistent production as both a possession receiver and developing red-zone threat. His ability to generate reliable efficiency numbers makes him the ideal complement to Metcalf's boom-or-bust explosiveness.",
    impact: "Pittman's consistency is the stabilizing element of Pittsburgh's receiving corps. When defenses load coverage onto Metcalf, Pittman operates in single coverage against the team's second-best corner — a matchup that his route running and hands win consistently. His reliability on third down is critical to Rodgers' offensive functionality.",
    outlook: "Pittman enters 2026 as an important piece of Pittsburgh's offense and a player who will develop significant chemistry with Rodgers quickly because of his route precision and football IQ. A full season as the secondary target behind Metcalf could produce career-high statistical totals.",
  },
  {
    name: "Pat Freiermuth",
    pos: "Tight End",
    number: 88,
    age: 26,
    years: 5,
    overview: "Pat Freiermuth is the Pittsburgh Steelers' starting tight end and a natural fit for Aaron Rodgers' passing preferences. A seam runner and red-zone target who has been one of the better receiving tight ends in the AFC North, Freiermuth provides Rodgers with the tight end target that has historically been central to Rodgers' most efficient passing games.",
    strengths: [
      "Seam-running ability that is exactly what Rodgers values most from the tight end position — Freiermuth's ability to run vertical routes down the middle of the field creates consistent coverage conflicts.",
      "Red-zone presence and reliable hands in the end zone make him a trusted target in goal-to-go situations.",
      "Five seasons of professional experience give him the situational understanding to communicate effectively with Rodgers from day one.",
    ],
    weaknesses: [
      "Blocking consistency as an in-line tight end is a developmental area — Freiermuth's receiving skills are more refined than his run-blocking contribution.",
      "Separation against elite safeties in man coverage is not elite — he is most effective in zone concepts where seam routes find open windows.",
    ],
    performance: "Freiermuth has been the Steelers' most reliable receiving tight end in recent seasons, generating consistent production in the seam and red zone. His connection with whoever is playing quarterback has always been productive, and the arrival of Rodgers should elevate his role.",
    impact: "Freiermuth is the third piece of Pittsburgh's passing attack, providing a reliable interior target that defenses must account for alongside Metcalf and Pittman. His seam production opens the intermediate areas for Pittman and creates decision-making complexity for opposing coordinators.",
    outlook: "Freiermuth enters 2026 with the best quarterback of his career throwing him the ball. A healthy season with Rodgers could produce the highest statistical totals of his career, as Rodgers' legendary tight end usage patterns suggest Freiermuth will be featured regularly in the offense.",
  },
  {
    name: "Jaylen Warren",
    pos: "Running Back",
    number: 30,
    age: 26,
    years: 4,
    overview: "Jaylen Warren is the Pittsburgh Steelers' starting running back and one of the more underrated offensive players in the AFC North. An explosive, physical runner who has established himself as a genuine starter capable of carrying the running game, Warren's combination of power and third-down receiving ability gives Pittsburgh a legitimate ground threat alongside Rodgers' passing attack.",
    strengths: [
      "Explosive starting running back whose burst through the line of scrimmage generates consistent yards on standard down-and-distance situations.",
      "Elite third-down back role — Warren's receiving ability, pass protection, and football IQ make him one of the better third-down backs in the AFC North.",
      "Strong physical running style that allows him to generate yards after contact and break tackles consistently.",
    ],
    weaknesses: [
      "Top-end speed is adequate but not elite — Warren relies on power and contact balance rather than outrunning defenders.",
      "Volume workload management across a full 17-game season requires intelligent rotation with Dowdle.",
    ],
    performance: "Warren has been one of the more productive running backs in Pittsburgh's recent history, delivering starter-quality production through both his running and receiving. His effectiveness on third down is particularly valuable in an offense built around Rodgers' precision passing.",
    impact: "Warren's ability to handle early-down running and third-down receiving gives Rodgers' offense the complete backfield profile needed to keep defenses from loading up against the pass. His ground game production is essential to making the play-action that Rodgers will use extensively.",
    outlook: "Warren enters 2026 as Pittsburgh's featured back with the opportunity to deliver his best professional season. Playing alongside Rodgers and Metcalf elevates the entire offense, and Warren's role in making play-action work effectively is critical to the Steelers' AFC aspirations.",
  },
  {
    name: "Rico Dowdle",
    pos: "Running Back",
    number: 23,
    age: 28,
    years: 6,
    overview: "Rico Dowdle is the Pittsburgh Steelers' complementary power running back and the committee partner who provides Warren with necessary rest while maintaining the Steelers' ground game production. A physical runner who excels in short-yardage situations, Dowdle brings the between-the-tackles toughness that has always been part of Pittsburgh's offensive identity.",
    strengths: [
      "Physical power running style that provides a distinct contrast to Warren's explosiveness — Dowdle's physicality gives the Steelers short-yardage and goal-line reliability.",
      "Six years of professional experience provide the situational football intelligence to execute his role without costly errors.",
      "Reliable in the committee running approach that extends Warren's effectiveness by limiting his carry total.",
    ],
    weaknesses: [
      "Receiving ability out of the backfield is below Warren's level, which limits his three-down utility.",
      "Explosive potential in the open field is below the level of the league's most dangerous complementary backs.",
    ],
    performance: "Dowdle has been a reliable committee back who provides physical running that complements Warren's more explosive style. His short-yardage efficiency has been a genuine asset in critical game situations.",
    impact: "Dowdle's presence in the backfield committee allows Warren to stay fresh and explosive through a full season. His goal-line production adds a red-zone dimension to Pittsburgh's offense.",
    outlook: "Dowdle enters 2026 as a quality backup whose role is clearly defined. His production within the committee approach will be consistent and valuable, contributing to Pittsburgh's ground game without demanding feature status.",
  },
  {
    name: "Darnell Washington",
    pos: "Tight End",
    number: 80,
    age: 23,
    years: 3,
    overview: "Darnell Washington is the Pittsburgh Steelers' massive backup tight end and one of the most physically imposing players at his position in professional football. At 6'7\" and 264 pounds, Washington creates blocking mismatches that no edge linebacker can solve and presents a developing receiving threat that gives Pittsburgh a unique personnel dimension.",
    strengths: [
      "Exceptional blocking ability as an in-line tight end — Washington's combination of size and athleticism creates mismatches against edge defenders and gives the Steelers a significant run-blocking advantage when he is on the field.",
      "Developing receiving ability that has shown improvement each professional season — Washington is not solely a blocking specialist.",
      "Size and frame that are genuinely rare at the position and create formation flexibility for McCarthy's game plan.",
    ],
    weaknesses: [
      "Receiving production and route running are still significantly below Freiermuth's level — Washington's role as a receiver is developmental.",
      "Age and experience at 23 mean his full potential as a receiving tight end is still years away.",
    ],
    performance: "Washington has been an excellent run blocker who provides Pittsburgh with a physically dominant inline option. His receiving development has been gradual but real, and his size creates unique advantages in two-tight-end formations.",
    impact: "Washington's blocking ability gives McCarthy the option to run physical inside-zone concepts from two-tight-end formations that most defenses cannot stop when both he and Freiermuth are on the field simultaneously.",
    outlook: "Washington enters 2026 with developing upside as a receiving tight end alongside his established blocking excellence. His combination of physical tools and continued receiving development could eventually make him one of the most complete tight ends in the AFC North.",
  },
  {
    name: "T.J. Watt",
    pos: "Linebacker",
    number: 90,
    age: 31,
    years: 8,
    overview: "T.J. Watt is the Pittsburgh Steelers' legendary edge rusher and one of the greatest pass rushers in the history of professional football. A Defensive Player of Year winner who has been the most dominant edge defender in the AFC North for years, Watt brings leadership, elite technique, and a relentless competitive intensity that makes him the most important defensive player on Pittsburgh's roster — and one of the five best defenders in the entire league.",
    strengths: [
      "All-time-level pass rushing ability — Watt's combination of athleticism, technique, and counter-move repertoire is among the most complete edge-rushing skill sets in NFL history.",
      "Defensive Player of Year credentials that reflect not just sack production but total defensive impact — Watt changes blocking assignments, quarterback decision-making, and offensive game plans the moment he lines up.",
      "Leadership and competitive standard-setting that elevate every player on Pittsburgh's defensive roster and establish the culture of excellence the franchise demands.",
      "Motor and effort that are genuinely inexhaustible — Watt pursues the ball on every snap and produces disruption beyond his recorded statistics.",
    ],
    weaknesses: [
      "Age at 31 and the physical nature of edge rushing mean workload management becomes increasingly important to maintaining peak performance through January.",
      "Offenses have begun dedicating tight end chips and running back help consistently to his side, which can temporarily reduce his individual statistical production.",
    ],
    performance: "Watt has been the most impactful defensive player in the AFC North across his professional career, consistently delivering Defensive Player of Year-caliber performances. His presence changes how every offensive coordinator prepares for Pittsburgh — and his continued elite production at 31 confirms that his peak is not yet behind him.",
    impact: "Watt's impact on Pittsburgh's defense is total. Every blocker that commits to stopping him creates a one-on-one opportunity for the next rusher in line. His mere presence changes the structure of opposing offenses, and the productivity of every Steelers defender benefits from the attention he commands.",
    outlook: "Watt enters 2026 as one of the two or three most feared defensive players in professional football. Another Defensive Player of Year campaign is entirely achievable, and his motivation to win a championship in Rodgers' final season provides an emotional driver that could produce the most impactful defensive season of his legendary career.",
  },
  {
    name: "Cameron Heyward",
    pos: "Defensive Tackle",
    number: 79,
    age: 34,
    years: 14,
    overview: "Cameron Heyward is the Pittsburgh Steelers' veteran defensive tackle legend and the emotional and cultural anchor of the franchise's defense. In his 14th professional season at age 34, Heyward has earned franchise icon status through consistent excellence, leadership, and the competitive intensity that defines Steelers football. His mentorship role for younger defensive linemen is as important as his remaining on-field production.",
    strengths: [
      "14 seasons of elite professional production have established Heyward as one of the great interior defensive linemen in franchise history.",
      "Veteran leadership and mentorship that accelerate the development of every young defensive lineman on Pittsburgh's roster.",
      "Technical excellence refined through a career of competing against the best offensive linemen in the AFC — Heyward's technique remains professionally instructive.",
    ],
    weaknesses: [
      "Athletic decline at 34 has reduced his explosiveness and snap count — Heyward must be managed as a rotational player to maintain effectiveness.",
      "Pass rush production from the interior has declined from his peak years as athleticism has reduced.",
    ],
    performance: "Heyward's contributions at 34 are more about quality than quantity — he provides peak rotational production alongside the cultural leadership that keeps Pittsburgh's defensive standards elevated. His technical ability to still generate disruption in limited snaps is a testament to his preparation.",
    impact: "Heyward's greatest impact at this stage of his career may be in the locker room and meeting room rather than in game statistics. His presence as a franchise icon who embodies the Steelers' defensive identity elevates every player around him.",
    outlook: "Heyward enters what may be the final season of his remarkable career. His contributions will be valuable within an appropriate snap count, and his leadership role in Pittsburgh's defensive culture makes him an irreplaceable organizational presence regardless of individual statistics.",
  },
  {
    name: "Minkah Fitzpatrick",
    pos: "Safety",
    number: 39,
    age: 27,
    years: 7,
    overview: "Minkah Fitzpatrick is the Pittsburgh Steelers' elite free safety and one of the best defensive backs in professional football. A two-time Pro Bowler whose range, ball skills, and coverage versatility have made him the centerpiece of Pittsburgh's secondary for years, Fitzpatrick is the turnover machine and coverage anchor that gives Pittsburgh's defense its elite ceiling alongside Watt.",
    strengths: [
      "Elite free safety range and ball-hawk instincts that produce interceptions and pass breakups at a rate that ranks among the best safeties in the NFL.",
      "Coverage versatility — Fitzpatrick can play split-safety, cover man-to-man on tight ends, and rotate down into the box, giving defensive coordinators unlimited alignment flexibility.",
      "Turnover production that consistently changes game outcomes — Fitzpatrick's interceptions often come at the most critical moments of close games.",
      "Leadership and communication in the secondary that organize coverage assignments and eliminate blown coverages.",
    ],
    weaknesses: [
      "Physical run support in the box against the largest tight ends and fullbacks creates occasional mismatches.",
      "Aggression in coverage can occasionally be exploited by quarterbacks willing to challenge him on double moves.",
    ],
    performance: "Fitzpatrick has been the most valuable defensive back in the AFC North for multiple seasons. His interception production, coverage efficiency, and big-play creation have been consistently elite, and his ability to be everywhere on the field reflects a unique combination of athleticism and intelligence.",
    impact: "Fitzpatrick's presence in the secondary gives every Pittsburgh cornerback a safety net that allows more aggressive man coverage. His range and ball skills make every opposing quarterback's deep throws dangerous, changing risk-reward calculations that quarterbacks must make against Pittsburgh.",
    outlook: "Fitzpatrick enters 2026 as one of the best safeties in professional football and a legitimate All-Pro candidate. His partnership with Watt — the best pass rusher and the best free safety working simultaneously — gives Pittsburgh a defense with a genuine championship ceiling.",
  },
];

// ── Content generator ─────────────────────────────────────────────────────────

function generatePlayerPost(player: SteelersPlayer) {
  const slug = slugify(`pittsburgh-steelers-${player.name}-player-profile-2026`, {
    lower: true, strict: true,
  });

  const title = `${player.name} — Pittsburgh Steelers ${player.pos} | 2026 Player Profile & Analysis`;
  const excerpt = `Complete 2026 player profile for Pittsburgh Steelers ${player.pos} ${player.name}. Strengths, weaknesses, performance analysis, and season outlook under head coach Mike McCarthy.`;

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

<h2>Impact on the Steelers</h2>
<p>${player.impact}</p>

<h2>2026 Season Outlook</h2>
<p>${player.outlook}</p>

<p><em>Analysis based on the 2026 Pittsburgh Steelers roster and the system installed by head coach Mike McCarthy.</em></p>
`.trim();

  const tags = [
    "Pittsburgh Steelers",
    "Steelers",
    "AFC North",
    player.name,
    player.pos,
    "Steelers Player Profile",
    "NFL Player Analysis",
    "2026 NFL Season",
    "Mike McCarthy",
  ];

  return {
    slug,
    title,
    excerpt,
    content,
    author: "NFL Predictions Hub Staff",
    tags,
    published: true,
    metaTitle: `${player.name} | Pittsburgh Steelers ${player.pos} Profile 2026 — NFL Predictions Hub`,
    metaDescription: excerpt,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  let created = 0;
  let skipped = 0;

  for (const player of STEELERS_ROSTER) {
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
