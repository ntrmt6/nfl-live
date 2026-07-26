/**
 * Generates one unique blog post per Kansas City Chiefs player.
 * Run: npx tsx scripts/generate-chiefs-player-posts.ts
 * Existing posts are never overwritten.
 */

import "dotenv/config";
import mongoose from "mongoose";
import slugify from "slugify";

const MONGO_URI = process.env.MONGODB_URI || "";
if (!MONGO_URI) { console.error("MONGODB_URI not set"); process.exit(1); }

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

interface ChiefsPlayer {
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

const CHIEFS_ROSTER: ChiefsPlayer[] = [
  {
    name: "Patrick Mahomes",
    pos: "Quarterback",
    number: 15,
    age: 30,
    years: 9,
    overview: "Patrick Mahomes is the Kansas City Chiefs' franchise quarterback and the defining player of his NFL generation. A three-time Super Bowl champion and two-time NFL MVP, Mahomes combines an elite arm, generational improvisation skills, and an unmatched competitive drive that has made the Chiefs the dominant force in professional football over the past seven seasons. He enters 2026 on a comeback trail from a late-season ACL/LCL injury, with every indication he will be healthy for Week 1.",
    strengths: [
      "Arm talent that is simply unprecedented in the modern NFL — Mahomes can make throws from any platform, at any angle, with consistent velocity and touch that no other quarterback can replicate.",
      "Elite improvisation under pressure. When protection breaks down, Mahomes turns chaos into production with scrambles, off-platform throws, and play-extension ability that routinely creates explosive gains.",
      "Championship pedigree under pressure. In eight playoff runs, Mahomes has engineered multiple fourth-quarter comebacks and delivered in the defining moments of multiple Super Bowls.",
      "Advanced football IQ allows him to diagnose blitzes before the snap and manipulate defenders with his eyes, creating opportunities downfield that most quarterbacks would never see.",
    ],
    weaknesses: [
      "ACL/LCL injury from the 2025 season raises durability questions entering 2026 — how quickly he returns to his peak mobility and confidence on scrambles will define the first half of the season.",
      "Occasional lapses in ball security against elite pass rushes, where his tendency to hold the ball and wait for plays to develop can result in sacks and fumbles.",
      "Turnover-worthy play rate in certain game states can climb when he attempts high-difficulty throws in contested situations.",
    ],
    performance: "When healthy, Mahomes is the best quarterback in professional football by a considerable margin. His regular-season consistency is matched only by his postseason brilliance, and the Chiefs have built their entire organizational identity around his unique skill set. Even coming off injury, his preparation and football intelligence give Kansas City the highest quarterback floor in the AFC.",
    impact: "Mahomes is the irreplaceable center of gravity for everything Kansas City does on offense. His presence on the field changes how defenses prepare, practice, and game-plan, creating advantages for every player around him. The Chiefs' dynasty — three Super Bowl titles in four years — is built entirely on his ability to win when it matters most.",
    outlook: "The central storyline for the Chiefs in 2026 is Mahomes' return from injury. If his knee is fully healed and his mobility is restored, Kansas City has the same ceiling they have had every year of his career — a legitimate Super Bowl contender. Even operating at 90 percent of his peak, Mahomes is the most dangerous player at the position, and the Chiefs have assembled enough talent around him to win a fourth championship.",
  },
  {
    name: "Justin Fields",
    pos: "Quarterback",
    number: 2,
    age: 27,
    years: 5,
    overview: "Justin Fields is the Kansas City Chiefs' backup quarterback, providing elite athletic insurance behind Patrick Mahomes. A former first-round pick who rebuilt his career through improved mechanics and decision-making, Fields brings a dual-threat dimension that gives the Chiefs a genuinely different look if Mahomes misses time.",
    strengths: [
      "Elite rushing ability — Fields is among the most dangerous scrambling quarterbacks in professional football, capable of turning broken plays into significant gains with his speed and power.",
      "Strong arm capable of making every throw on the field, particularly on deep post routes where his velocity creates opportunities others can't.",
      "Football intelligence has improved significantly compared to his early career, leading to better reads and fewer forced throws.",
    ],
    weaknesses: [
      "Consistency in the pocket against complex zone coverages remains a developmental area — Fields can struggle to identify and attack soft spots in coverage quickly.",
      "Decision-making under pressure in clutch moments has shown inconsistency throughout his career.",
      "Limited starting experience in Andy Reid-style offensive systems may create an adjustment period if pressed into action.",
    ],
    performance: "Fields has served as a high-upside backup in Kansas City's system, showing enough in practice and limited action to give the organization confidence that the offense won't collapse if Mahomes misses time. His athleticism alone gives the Chiefs a Plan B that most teams don't have.",
    impact: "The value of Fields as a backup is that the Chiefs don't need to abandon their offensive identity if Mahomes goes down. His ability to run the ball effectively means Andy Reid can adapt the game plan rather than completely changing it.",
    outlook: "Fields' future remains tied to whether he can remain Mahomes' backup without growing restless for a starting role. His talent warrants starting opportunities in the NFL, and Kansas City's championship window could benefit from his continued development into an elite second option.",
  },
  {
    name: "Kenneth Walker III",
    pos: "Running Back",
    number: 9,
    age: 24,
    years: 4,
    overview: "Kenneth Walker III is the Kansas City Chiefs' featured running back, bringing explosive burst, elite contact balance, and receiving ability to one of the NFL's most sophisticated offensive systems. After proving himself as a dynamic weapon in Seattle, Walker joins Kansas City's potent attack where his skill set fits perfectly in Andy Reid's creative rushing schemes.",
    strengths: [
      "Elite burst through the line of scrimmage — Walker reaches full speed within two steps, consistently turning small gaps into significant gains before linebackers can react.",
      "Outstanding contact balance that allows him to absorb hits and continue moving forward, regularly turning would-be two-yard gains into six-yard runs.",
      "Reliable receiver out of the backfield, capable of creating mismatches against linebackers in the flat and on crossing routes.",
      "High-effort runner who fights for every yard and regularly creates self-made production when the initial hole closes.",
    ],
    weaknesses: [
      "Pass protection consistency needs continued development in Kansas City's system, where protecting Mahomes on obvious passing downs is a key requirement for backs.",
      "Fumble security has been an occasional concern that needs to be cleaned up in a system where ball security is paramount.",
      "Durability over a full season carries some question marks after injury interruptions in his career.",
    ],
    performance: "Walker is a legitimate bell-cow back who combines between-the-tackles production with enough receiving ability to be a genuine three-down option. His burst is among the top at the position, and his ability to make defenders miss in the open field creates explosive plays that elevate the Chiefs' entire offensive attack.",
    impact: "Walker's addition gives the Chiefs a true featured back that adds a legitimate run threat to complement Mahomes' passing game. Defenses that struggle to account for the run game will face consistent exploitation, and his presence in the red zone gives Kansas City a reliable short-yardage weapon.",
    outlook: "Walker enters 2026 with significant motivation to establish himself as one of the AFC's top running backs. Playing alongside Mahomes in Reid's system is the best possible context for a skilled running back, and Walker's combination of speed, vision, and receiving ability should produce a career season.",
  },
  {
    name: "Travis Kelce",
    pos: "Tight End",
    number: 87,
    age: 36,
    years: 14,
    overview: "Travis Kelce is the Kansas City Chiefs' legendary tight end and the greatest player at his position in NFL history. A seven-time All-Pro selection with seven consecutive 1,000-yard seasons at his peak, Kelce has been the most unstoppable weapon in professional football for the better part of a decade. At 36, he enters 2026 in what could be the final chapter of his historic career, still serving as Mahomes' most trusted target.",
    strengths: [
      "Route running precision that remains elite even at 36 — Kelce's ability to manipulate linebacker leverage with head fakes, tempo changes, and precise footwork is simply unmatchable by any tight end in history.",
      "Receiving IQ that goes beyond athleticism — Kelce identifies soft spots in zone coverage instinctively and creates separation through football intelligence rather than speed alone.",
      "Red-zone dominance and contested-catch reliability that makes him a genuine mismatch in every game situation.",
      "Chemistry with Mahomes that is one of the most lethal quarterback-receiver partnerships in NFL history, built over more than a decade of practice reps and game experience.",
    ],
    weaknesses: [
      "Age at 36 has noticeably reduced his burst off the line of scrimmage, making him more dependent on route craft and scheme than athletic separation.",
      "Blocking contribution has declined with age and is no longer a strength, limiting some of the Chiefs' two-tight-end run game concepts.",
      "Recovery time between games has become a more significant factor, requiring load management to stay effective deep into the season.",
    ],
    performance: "Even at 36, Kelce remains among the most productive tight ends in the AFC when healthy. His connection with Mahomes is so deeply embedded in the Chiefs' offensive system that even reduced production from him elevates every other skill position player on the roster by drawing consistent defensive attention.",
    impact: "Kelce's impact on the Chiefs' offense extends far beyond his statistics. His presence in the formation forces defensive coordinators to dedicate resources to covering him, creating single-coverage opportunities for Xavier Worthy and Rashee Rice that define the Chiefs' explosive passing game.",
    outlook: "The 2026 season could be Kelce's last, and the football world will be watching. If he stays healthy and productive, the Chiefs' offense remains one of the AFC's most dangerous units. His experience and preparation give him the best possible chance to contribute meaningfully, and Mahomes' trust in him has never wavered. A championship run would be the perfect ending to the most decorated career at the position.",
  },
  {
    name: "Xavier Worthy",
    pos: "Wide Receiver",
    number: 1,
    age: 22,
    years: 2,
    overview: "Xavier Worthy is the Kansas City Chiefs' most dynamic wide receiver and one of the fastest players in professional football. The 2024 first-round pick out of Texas set the NFL Combine 40-yard dash record and has quickly emerged as one of the league's most explosive deep threats, giving Mahomes a vertical weapon that defenses simply cannot eliminate from their game plans.",
    strengths: [
      "Historic straight-line speed — Worthy's 4.21-second 40-yard dash is the fastest ever recorded at the NFL Combine, and he translates that speed into genuine game-breaking ability on go routes and deep crosses.",
      "Elite burst off the line of scrimmage creates immediate separation, forcing defensive backs to give cushion that opens up the entire field underneath.",
      "Developing route tree that is expanding rapidly under Andy Reid's coaching — Worthy is adding precision and depth to his game that complements his natural gifts.",
      "Ability to affect the game without the ball by occupying safeties, creating space for Kelce in the seam and Rice in the slot.",
    ],
    weaknesses: [
      "Smaller frame at 165 pounds raises durability questions and limits his effectiveness on contested catches in traffic.",
      "Route running precision and consistency against physical press coverage is still developing — elite corners can disrupt his timing at the line.",
      "Catch radius and contested-catch ability are below average for a featured receiver at his draft position.",
    ],
    performance: "Worthy's rookie season showed the explosive potential that made him a first-round pick, with several electric plays that reminded fans of Tyreek Hill's early impact in Kansas City. His speed alone forces defensive adjustments that benefit every other offensive player on the field.",
    impact: "Worthy gives Mahomes a genuine deep threat that no defensive coordinator can scheme away entirely. His ability to score from anywhere on the field — including on jet sweeps, screens, and deep shots — creates a different kind of anxiety for defenses than any other Chiefs receiver.",
    outlook: "Year two is often when explosive receivers make the jump from promising to dominant. Worthy's combination of elite speed and developing route craft, in Kansas City's offensive system under Andy Reid, gives him one of the highest ceilings of any young receiver in the AFC. A breakout 2026 season is not just possible — it is expected.",
  },
  {
    name: "Rashee Rice",
    pos: "Wide Receiver",
    number: 4,
    age: 24,
    years: 3,
    overview: "Rashee Rice is the Kansas City Chiefs' primary slot receiver and one of Mahomes' most reliable intermediate targets. After a breakthrough season that established him as one of the AFC's top young receivers, Rice enters 2026 as the Chiefs' primary possession weapon in the middle of the field.",
    strengths: [
      "Elite quickness and route precision in the slot — Rice consistently creates separation against zone coverage and wins in man coverage with sharp cuts and excellent footwork.",
      "Yards after catch production that ranks among the league's best at his position, regularly turning short completions into significant chunk gains.",
      "High football IQ and chemistry with Mahomes that has developed over multiple seasons in Kansas City's system.",
      "Reliable hands and consistent target efficiency — Rice rarely drops catchable balls, giving Mahomes a dependable safety valve on every possession.",
    ],
    weaknesses: [
      "Limited effectiveness as an outside receiver, where his size and release technique are less effective against physical press coverage from bigger corners.",
      "Deep threat ability is below average, limiting his role to primarily intermediate and short-area routes.",
    ],
    performance: "Rice has been one of the most efficient receivers in the AFC, producing at a level that makes him one of the best value contributors in the league relative to his draft position. His ability to consistently find soft spots in zone coverage makes him one of Mahomes' most trusted targets in critical situations.",
    impact: "Rice's presence in the slot forces defenses to assign their best nickel defender to him, opening the field for Worthy on the outside and Kelce in the seam. His production in the intermediate area is the foundation of the Chiefs' ball-control passing game.",
    outlook: "Rice enters 2026 as an established star with Pro Bowl upside. A full, healthy season alongside Mahomes and Kelce in Reid's system gives him the production platform to make a genuine push for the league's top-tier receivers, and the Chiefs need him to stay healthy to maintain their offensive ceiling.",
  },
  {
    name: "Chris Jones",
    pos: "Defensive Tackle",
    number: 95,
    age: 30,
    years: 10,
    overview: "Chris Jones is the Kansas City Chiefs' anchor on the defensive line and one of the most dominant interior defensive players in NFL history. A consistent Pro Bowl and All-Pro performer, Jones has been the most disruptive force in the AFC for nearly a decade, combining elite pass rush with run-stopping ability that few interior defenders can match.",
    strengths: [
      "Interior pass rush that is genuinely elite — Jones' combination of first-step quickness, hand technique, and power generates consistent pressure on a snap-to-snap basis that offensive guards struggle to contain.",
      "Versatility to line up at various spots along the defensive line, creating schematic flexibility that makes him impossible to game-plan against consistently.",
      "Run-stopping strength and leverage that allow him to control the point of attack against run-heavy offenses trying to neutralize his pass-rush threat.",
      "Leadership and veteran presence that anchors Kansas City's defensive identity and sets the standard for effort and preparation on that side of the ball.",
    ],
    weaknesses: [
      "Age at 30 means the Chiefs will need to manage his workload carefully to keep him fresh and explosive into January.",
      "Double-team attention is now standard operating procedure for opposing offensive lines, which can limit his individual production even when he influences the game.",
    ],
    performance: "Jones continues to be one of the most productive interior pass rushers in the NFL, generating pressure at an elite rate even as offensive lines devote extra resources to slowing him down. His impact on the game extends far beyond his sack totals — his presence consistently disrupts the quarterback's timing and rhythm.",
    impact: "Jones is the centerpiece of the Chiefs' defensive identity. Without him, Kansas City is a respectable defense; with him at his best, they have the most disruptive front seven in the AFC. His presence allows the linebackers behind him to pursue aggressively because he handles the interior pressure responsibility.",
    outlook: "Jones enters 2026 as the unquestioned leader of the Chiefs' defense and still one of the NFL's most feared defensive players. A healthy season at peak production would push him deeper into the conversation as the greatest interior defender of his generation.",
  },
  {
    name: "Nick Bolton",
    pos: "Linebacker",
    number: 32,
    age: 25,
    years: 5,
    overview: "Nick Bolton is the Kansas City Chiefs' starting inside linebacker and the defensive signal caller who organizes the entire defense. A former second-round pick who has developed into one of the AFC's better coverage linebackers, Bolton brings range, instincts, and communication skills that are foundational to Steve Spagnuolo's defensive system.",
    strengths: [
      "Coverage range and instincts that allow him to patrol the intermediate zone effectively — Bolton consistently finds himself in position to make plays on the football.",
      "Defensive communication and pre-snap organization that keeps the Chiefs' complex defensive system operating at full efficiency.",
      "Consistent tackling mechanics and pursuit angles that lead to high tackle efficiency.",
    ],
    weaknesses: [
      "Physical limitation in taking on blocks from NFL-caliber fullbacks and tight ends in run defense.",
      "Pass rush contribution is minimal — Bolton is primarily a coverage and run-defense linebacker.",
    ],
    performance: "Bolton has been a reliable starter who maximizes his football IQ and preparation in Spagnuolo's system. His tackle numbers consistently rank among the league's leaders at the position, and his coverage grades have improved each season.",
    impact: "As the defensive signal caller, Bolton's preparation and communication are as valuable as his physical contributions. His ability to keep the Chiefs' defense organized against complex offensive formations prevents the blown coverages that lead to explosive plays.",
    outlook: "Bolton enters 2026 as one of the Chiefs' most dependable players — not a star, but an irreplaceable piece who keeps the defense functioning at a high level. His continued development as a pass rusher could elevate him into the conversation as a complete linebacker.",
  },
  {
    name: "Drue Tranquill",
    pos: "Linebacker",
    number: 23,
    age: 29,
    years: 6,
    overview: "Drue Tranquill is the Kansas City Chiefs' veteran linebacker who provides experienced depth and versatility alongside Nick Bolton. Known for his football intelligence, pass coverage ability, and special teams contributions, Tranquill is one of the most underappreciated contributors on Kansas City's defensive roster.",
    strengths: [
      "Elite pass coverage ability for a linebacker — Tranquill can cover tight ends and running backs in man coverage, a rare and highly valued skill.",
      "Special teams impact that adds significant value beyond his defensive contributions.",
      "Football IQ and preparation that allow him to contribute in multiple roles without the processing delays that limit younger linebackers.",
    ],
    weaknesses: [
      "Physical run defense against powerful interior rushing attacks is a limitation at his size.",
      "Age at 29 means the Chiefs will need to continue managing his workload over a full season.",
    ],
    performance: "Tranquill has been one of the most productive special teams linebackers in the AFC while contributing meaningfully in coverage on defense. His intelligence makes him more effective than his athletic testing would suggest.",
    impact: "Tranquill's versatility gives Steve Spagnuolo schematic options that keep offensive coordinators from exploiting the linebacker position as a coverage liability. His contributions may not show in the box score, but they show in the results.",
    outlook: "Tranquill's value in 2026 is as a trusted veteran contributor who does his job without fanfare. In a championship-caliber environment, that kind of reliable professional is exactly what contenders need.",
  },
  {
    name: "Nohl Williams",
    pos: "Cornerback",
    number: 22,
    age: 23,
    years: 2,
    overview: "Nohl Williams is the Kansas City Chiefs' developing cornerback, a young defensive back working to establish himself as a reliable starter in Steve Spagnuolo's competitive secondary. Williams brings athleticism and ball skills that make him a promising piece of the Chiefs' defensive backfield.",
    strengths: [
      "Ball production instincts that show up in practice and games — Williams has demonstrated the ability to find the football in the air.",
      "Athleticism and straight-line speed that allow him to match up with receivers across all areas of the field.",
      "Learning under Steve Spagnuolo's system, which consistently develops secondary players into productive contributors.",
    ],
    weaknesses: [
      "Technique in press coverage against experienced route runners is still developing.",
      "Consistency over a full season is still being established at the NFL level.",
    ],
    performance: "Williams has shown enough to earn a starting role on one of the AFC's most competitive rosters. His best football is clearly ahead of him, and the coaching environment in Kansas City gives him the best possible context for continued growth.",
    impact: "Williams' development is important to the Chiefs' ability to maintain their defensive standard without relying entirely on veteran free agent additions. A productive season from him would significantly enhance Kansas City's defensive ceiling.",
    outlook: "Williams enters 2026 at a pivotal point in his development. A strong season could establish him as a legitimate starting corner for the Chiefs' next playoff run, and the talent is present for that to happen.",
  },
  {
    name: "Alohi Gilman",
    pos: "Safety",
    number: 32,
    age: 28,
    years: 6,
    overview: "Alohi Gilman is the Kansas City Chiefs' starting safety and a key communicator in Steve Spagnuolo's defensive backfield. Known for his football intelligence, anticipation, and reliable tackling, Gilman provides the deep coverage security that allows the Chiefs' cornerbacks to play aggressively.",
    strengths: [
      "Football intelligence and pre-snap processing that consistently put him in the right position before the snap.",
      "Reliable tackler whose angles and pursuit are technically sound — Gilman rarely over-pursues or misses tackles in space.",
      "Communication and leadership in the secondary that improve the performance of every player around him.",
    ],
    weaknesses: [
      "Athletic limitations in one-on-one coverage against elite receiving tight ends can be a matchup challenge.",
      "Deep-speed limitations can be exploited by teams that attack the top of the coverage with vertical routes.",
    ],
    performance: "Gilman has been a dependable starting safety who consistently performs at an above-average level without making headline-generating plays. His quiet reliability is exactly what a championship defense needs from the safety position.",
    impact: "Gilman's organization of the back end of the Chiefs' defense keeps Spagnuolo's system running smoothly. His pre-snap communication reduces blown assignments and keeps the secondary coordinated against complex offensive formations.",
    outlook: "Gilman enters 2026 as a trusted veteran contributor in one of the AFC's most decorated defensive systems. His consistency and professionalism make him a perfect fit for a team chasing another championship.",
  },
];

function generatePlayerPost(player: ChiefsPlayer) {
  const slug = slugify(`kansas-city-chiefs-${player.name}-player-profile-2026`, {
    lower: true, strict: true,
  });

  const title = `${player.name} — Kansas City Chiefs ${player.pos} | 2026 Player Profile & Analysis`;
  const excerpt = `Complete 2026 player profile for Kansas City Chiefs ${player.pos} ${player.name}. Strengths, weaknesses, performance analysis, and season outlook under head coach Andy Reid.`;

  const strengthsHtml = player.strengths.map((s) => `<li>${s}</li>`).join("\n");
  const weaknessesHtml = player.weaknesses.map((w) => `<li>${w}</li>`).join("\n");

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

<h2>Impact on the Chiefs</h2>
<p>${player.impact}</p>

<h2>2026 Season Outlook</h2>
<p>${player.outlook}</p>

<p><em>Analysis based on the 2026 Kansas City Chiefs roster and the offensive system installed by head coach Andy Reid.</em></p>
`.trim();

  const tags = [
    "Kansas City Chiefs",
    "KC Chiefs",
    player.name,
    player.pos,
    "Chiefs Player Profile",
    "NFL Player Analysis",
    "2026 NFL Season",
    "Andy Reid",
    "AFC West",
  ];

  return {
    slug,
    title,
    excerpt,
    content,
    author: "NFL Predictions Hub Staff",
    tags,
    published: true,
    metaTitle: `${player.name} | KC Chiefs ${player.pos} Profile 2026 — NFL Predictions Hub`,
    metaDescription: excerpt,
  };
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  let created = 0;
  let skipped = 0;

  for (const player of CHIEFS_ROSTER) {
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
