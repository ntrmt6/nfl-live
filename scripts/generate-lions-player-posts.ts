/**
 * Generates one unique blog post per Detroit Lions player.
 * Run: npx tsx scripts/generate-lions-player-posts.ts
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

// ── Lions roster ──────────────────────────────────────────────────────────────

interface LionsPlayer {
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

const LIONS_ROSTER: LionsPlayer[] = [
  {
    name: "Jared Goff",
    pos: "Quarterback",
    number: 16,
    age: 31,
    years: 10,
    overview: "Jared Goff is the Detroit Lions' elite precision quarterback and the offensive cornerstone of Dan Campbell's transformative football culture. After being written off following his trade from the Rams, Goff has delivered the best football of his career in Detroit — emerging as a top-five quarterback in the NFC and the leader who guided the Lions to their first NFC Championship in franchise history. A master of the pocket, Goff operates Campbell's system with a precision that makes the Lions one of the most efficient offenses in professional football.",
    strengths: [
      "Elite pocket precision that ranks among the best in the NFL — Goff's ability to deliver the ball accurately on timing routes, especially to the intermediate and deep areas, is a defining skill.",
      "Pre-snap intelligence and coverage recognition that allow him to identify the best available option quickly and distribute the ball efficiently before pressure arrives.",
      "Play-action mastery in Campbell's heavy run game — Goff's boots and nakeds off the zone-run action are among the most efficient passing plays in the NFC.",
      "Clutch performance in high-leverage situations — Goff has delivered some of the most memorable fourth-quarter moments in Lions history, vindicating every organizational decision to build around him.",
    ],
    weaknesses: [
      "Athletic limitations mean he is not a threat to create with his legs — when the pocket collapses completely, Goff's options are limited to delivering the ball or taking a sack.",
      "Under continuous pressure with no clean pocket, his accuracy can fluctuate — protection is non-negotiable for his peak performance.",
      "Deep-ball velocity, while accurate, is not elite — defenses that bracket his deep targets with safety help can reduce his explosiveness.",
    ],
    performance: "Goff's performance in Detroit has been one of the most impressive rehabilitation stories in modern quarterback history. His statistical production, efficiency metrics, and clutch performance have all been at a level that commands genuine respect league-wide. The NFC Championship run validated everything Campbell and the Lions organization believed when they committed to him.",
    impact: "Goff is the operational center of an offense that has transformed Detroit from laughingstock to legitimate contender. His ability to execute LaFleur-style concepts with precision, manage Campbell's physical run game, and deliver in critical moments has been the engine of the Lions' rise to NFC relevance.",
    outlook: "Goff enters 2026 as one of the most dangerous precision passers in the NFC. With Amon-Ra St. Brown, Jameson Williams, and a powerful run game supporting his system, he has the tools to deliver another elite season. If healthy, he is a legitimate NFC MVP candidate and the leader of a team with Super Bowl aspirations.",
  },
  {
    name: "Amon-Ra St. Brown",
    pos: "Wide Receiver",
    number: 14,
    age: 25,
    years: 5,
    overview: "Amon-Ra St. Brown is the Detroit Lions' elite slot receiver and one of the most consistent offensive players in the NFC. A Pro Bowler who has developed into Goff's most reliable and frequently targeted receiver, St. Brown's consistency, toughness over the middle, and yards-after-catch ability make him the engine of Detroit's short-to-intermediate passing game.",
    strengths: [
      "Elite slot receiver who creates separation against virtually any coverage concept — St. Brown's quick feet and sharp cuts generate open windows that Goff hits consistently.",
      "Mr. Consistency: his catch rate, target share, and route efficiency have been exceptional across multiple professional seasons, making him one of the most reliable receivers in the NFC.",
      "YAC machine who turns short completions into significant gains through contact balance and open-field elusiveness.",
      "Toughness over the middle — St. Brown does not avoid contact, making him reliable in traffic where other receivers disappear.",
    ],
    weaknesses: [
      "Outside receiver production when aligned on the boundary is below his elite slot numbers — he is most dangerous in the slot.",
      "Top-end speed is average for an NFL receiver, limiting his effectiveness on vertical routes where straight-line speed is the primary separator.",
    ],
    performance: "St. Brown has been the most consistent offensive player in Detroit's system over multiple seasons, generating Pro Bowl-level production through reliability, intelligence, and competitiveness. His target volume and production efficiency rank among the best slot receivers in the NFC.",
    impact: "St. Brown is the floor of the Lions' passing game — the player who keeps the offense functional on third down and provides Goff a reliable security valve in every situation. When defenses bracket him, Jameson Williams finds open space deep. When defenses bracket Williams, St. Brown gets volume. The Lions win either way.",
    outlook: "St. Brown enters 2026 as one of the best slot receivers in professional football. Another Pro Bowl season is the floor expectation, and if the Lions' offense continues its development under Campbell, he could push toward the 1,500-yard range that defines elite receiver production.",
  },
  {
    name: "Jahmyr Gibbs",
    pos: "Running Back",
    number: 26,
    age: 23,
    years: 3,
    overview: "Jahmyr Gibbs is the Detroit Lions' explosive dual-threat running back and one of the most exciting young offensive players in the NFC. A first-round pick whose combination of speed and elusiveness makes him a dual threat as both a runner and receiver, Gibbs has developed alongside Isiah Pacheco into one of the most dynamic backfield combinations in professional football.",
    strengths: [
      "Elite open-field speed and elusiveness that generate explosive plays any time he reaches the second level — Gibbs can take any carry to the house if he finds a crease.",
      "Receiving ability out of the backfield that is genuinely elite at the position — Gibbs' route running and hands make him a legitimate mismatch weapon against linebackers.",
      "Yards-per-carry efficiency that ranks among the best running backs in the NFC, reflecting both his individual skill and the Lions' powerful offensive line.",
      "Dual-threat production in the passing game that keeps defenses from substituting out of base personnel even on clear passing downs.",
    ],
    weaknesses: [
      "Frame at 199 pounds means his durability carrying a true bell-cow workload over 17 games requires careful management.",
      "Physical power between the tackles against stacked boxes is a lesser strength than his open-field explosiveness.",
      "Pass protection against elite blitzers is still developing into a complete three-down skillset.",
    ],
    performance: "Gibbs has been one of the most exciting running backs to emerge in the NFC, delivering explosive performances that combine with Pacheco's power style to create a backfield combination that no defensive front has consistently stopped. His dual-threat ability has elevated the Lions' offense from very good to genuinely elite.",
    impact: "Gibbs' presence transforms Detroit's offensive possibilities. His speed forces defenses to account for explosive plays on every run, while his receiving ability means he cannot be replaced on passing downs. The combination of Gibbs' speed and Pacheco's power gives Campbell the most complete backfield he has fielded.",
    outlook: "Gibbs enters 2026 as one of the two or three most exciting running backs in the NFC. If the Lions continue managing his workload intelligently and his physical development continues, a 1,200-yard season with significant receiving production is a reasonable ceiling.",
  },
  {
    name: "Jameson Williams",
    pos: "Wide Receiver",
    number: 9,
    age: 24,
    years: 4,
    overview: "Jameson Williams is the Detroit Lions' deep-speed threat and one of the most athletically gifted wide receivers in the NFC. A former first-round pick whose career has been complicated by injury and suspension, Williams has now developed the consistency to channel his elite speed and explosiveness into reliable production opposite Amon-Ra St. Brown.",
    strengths: [
      "Elite straight-line speed that is among the fastest in professional football — Williams can outrun any cornerback in the league on go routes and post concepts.",
      "Explosive big-play ability that generates touchdowns and game-changing moments when he receives the ball in space.",
      "Developing consistency in route running that is expanding his effectiveness beyond pure vertical threats to a more complete receiver profile.",
    ],
    weaknesses: [
      "Consistency across a full season has been hampered by injury and off-field issues that have limited his availability.",
      "Short and intermediate route running precision is still below the level of the league's elite wide receivers.",
      "Physical durability over a full 17-game season needs to be proven before his ceiling can be fully trusted.",
    ],
    performance: "Williams has shown the talent to be a legitimate game-breaking threat when healthy and available. His best performances have been among the most explosive individual receiver games in Lions history, confirming that his elite athletic tools can produce at the highest professional level when everything aligns.",
    impact: "Williams' deep speed forces safety rotation over the top that creates the same coverage spacing benefits that Watson provides in Green Bay. His presence on the field as a home-run threat changes how defenses must allocate their coverage resources, benefiting St. Brown and the Lions' underneath passing game.",
    outlook: "Williams enters 2026 with an opportunity to prove he can be a consistent contributor over a full season. If he can stay healthy and available, his combination of speed and developing receiver skills could produce a breakout season that validates his draft position and changes the Lions' offensive ceiling.",
  },
  {
    name: "Sam LaPorta",
    pos: "Tight End",
    number: 50,
    age: 24,
    years: 2,
    overview: "Sam LaPorta is the Detroit Lions' breakout tight end and one of the most productive young players at the position to emerge in recent years. A fluid route runner with reliable hands and excellent football intelligence, LaPorta has quickly developed into a featured target for Goff and a key piece of the Lions' passing game architecture.",
    strengths: [
      "Elite receiving ability for the tight end position — LaPorta's route running precision, body control, and soft hands are well beyond what teams typically expect from a second-year tight end.",
      "Smart route running that exploits linebacker and safety weaknesses in zone coverage, consistently finding the open window that Goff targets.",
      "Excellent football intelligence that allows him to communicate effectively with Goff and identify defensive adjustments at the line of scrimmage.",
    ],
    weaknesses: [
      "Blocking development as an in-line tight end is ongoing — LaPorta's receiving skills have outpaced his blocking production.",
      "Physicality against the largest and most aggressive safeties in man coverage is still developing.",
      "Only two professional seasons of experience means his overall game continues to mature.",
    ],
    performance: "LaPorta's breakout rookie season was among the most impressive debut campaigns by a tight end in Lions history. His ability to immediately contribute as a featured receiving option in a sophisticated offense was genuinely rare, and his second season confirmed the production was real and growing.",
    impact: "LaPorta gives the Lions a third legitimate receiving option who forces defenses to account for the tight end position simultaneously with St. Brown and Williams. His seam and red-zone production adds a dimension that makes Detroit's passing game three-dimensional and virtually impossible to defend without elite secondary talent.",
    outlook: "LaPorta enters 2026 as one of the most exciting young tight ends in the NFC. A full season as Detroit's featured tight end could produce Pro Bowl-level numbers, and his developing chemistry with Goff creates a connection the Lions will invest in for years.",
  },
  {
    name: "Isiah Pacheco",
    pos: "Running Back",
    number: 10,
    age: 26,
    years: 4,
    overview: "Isiah Pacheco is the Detroit Lions' power running back complement to Jahmyr Gibbs, arriving from the Kansas City Chiefs to add the physical between-the-tackles dimension that Gibbs' speed-based game doesn't always provide. A Super Bowl champion who knows what it takes to win at the highest level, Pacheco brings a physical running style and championship experience to one of the NFC's most ambitious franchises.",
    strengths: [
      "Physical power running style that excels between the tackles on early-down carries, providing a contrasting approach to Gibbs' outside-zone explosiveness.",
      "Championship experience from Kansas City gives him situational football knowledge and winning habits that elevate the culture around him.",
      "Reliable in short-yardage and goal-line situations where physical running is required to convert.",
    ],
    weaknesses: [
      "Receiving production out of the backfield is below Gibbs' level, creating some passing-down limitations.",
      "Top-end speed in the open field is adequate but not the explosive trait that makes Gibbs so dangerous.",
    ],
    performance: "Pacheco's power running style has been the ideal complement to Gibbs in Campbell's physical offense. His ability to handle early-down carries and short-yardage situations gives the Lions a complete backfield that can produce in every game situation.",
    impact: "Pacheco's partnership with Gibbs gives the Lions an offensive backfield identity that is physically challenging and schematically diverse. His power creates the threat of inside runs that opens space for Gibbs' outside zone carries, making the ground game one of the most complete in the NFC.",
    outlook: "Pacheco enters 2026 as an important complementary piece who adds physical substance and championship culture to Detroit's backfield. His role alongside Gibbs should produce consistent production, and his experience winning at the highest level is a genuine cultural asset for a franchise seeking its first Super Bowl.",
  },
  {
    name: "Isaac TeSlaa",
    pos: "Wide Receiver",
    number: 88,
    age: 22,
    years: 1,
    overview: "Isaac TeSlaa is the Detroit Lions' 2026 rookie wide receiver and a developmental addition to a receiving corps that already features Pro Bowl talent. At 22, TeSlaa arrives with the athletic profile that earned him draft consideration, stepping into a Lions system that develops receivers effectively.",
    strengths: [
      "Athletic speed that qualifies him as a legitimate deep threat and special teams contributor from day one.",
      "Youth and developmental ceiling — TeSlaa is 22 and has the physical tools to develop into a meaningful contributor with NFL reps.",
      "Fits the Lions' receiver-development culture where emerging talent is given opportunity to grow.",
    ],
    weaknesses: [
      "Zero professional experience creates the inevitable adjustment curve against NFL defensive backs.",
      "Route precision and coverage recognition at the professional level are areas requiring significant development.",
      "Contributing meaningfully behind St. Brown and Williams in a deep receiver corps presents a high bar.",
    ],
    performance: "TeSlaa is in the earliest phase of his professional journey. His 2026 performance should be evaluated against the backdrop of realistic rookie expectations.",
    impact: "TeSlaa's primary impact in 2026 is in special teams and developmental reps. His growth will determine his future contribution to the Lions' offensive system.",
    outlook: "TeSlaa enters 2026 with the opportunity to develop behind elite receivers in one of the NFL's best offensive systems. The Lions' player development culture gives him the best possible environment to accelerate his growth toward meaningful contributions.",
  },
  {
    name: "Aidan Hutchinson",
    pos: "Defensive End",
    number: 97,
    age: 25,
    years: 4,
    overview: "Aidan Hutchinson is the Detroit Lions' franchise defensive anchor and one of the top five pass rushers in professional football. A former second overall pick who has lived up to every bit of that billing when healthy, Hutchinson's combination of elite athleticism, sophisticated technique, and relentless motor have made him the most disruptive defensive player in the NFC North — and a franchise cornerstone the Lions are building their defensive identity around for the next decade.",
    strengths: [
      "Top-five pass rusher in professional football when healthy — Hutchinson's combination of length, explosion, and advanced counter moves is among the most complete edge-rushing skill sets in the game.",
      "Elite first-step quickness that stresses tackles immediately at the snap, forcing protection adjustments that benefit every other Lions defensive player.",
      "Exceptional motor and effort level that produce disruption beyond recorded statistics — Hutchinson is a game-influencing presence on every snap.",
      "NFC North's most disruptive edge defender whose presence demands double-team attention that frees every other Lions defender.",
    ],
    weaknesses: [
      "Injury recovery is the primary concern — Hutchinson has dealt with significant injuries that have limited his availability, and returning to full explosiveness after lower-body damage takes time.",
      "Run defense on the backside can be exploited by teams that are willing to run away from his rush lane.",
      "Consistency across a full 17-game season at peak performance is the question his injury history creates.",
    ],
    performance: "When healthy, Hutchinson has been the best defensive player in the NFC North and one of the five most disruptive pass rushers in professional football. His sack totals, pressure rates, and game-impact statistics have been elite in every healthy season, confirming his draft position as one of the most justified in recent NFL history.",
    impact: "Hutchinson's impact on Detroit's defense is total. His presence as a pass rusher requires offensive coordinators to dedicate extra protection resources to his side, which creates favorable matchups throughout the defensive front. The Lions' defense is fundamentally a different unit with and without him.",
    outlook: "Hutchinson enters 2026 with the most significant health questions of his career. If he returns to full explosiveness and stays available for 15-plus games, he is a Defensive Player of Year candidate who elevates the entire Lions defense. His health will determine whether Detroit's Super Bowl aspirations are realistic.",
  },
  {
    name: "Alim McNeill",
    pos: "Defensive Tackle",
    number: 54,
    age: 26,
    years: 4,
    overview: "Alim McNeill is the Detroit Lions' interior defensive tackle and a key piece of Dan Campbell's physical defensive identity. A powerful run-stopper who has developed pass-rush ability alongside his base production, McNeill has been one of the better interior defenders in the NFC North through four professional seasons.",
    strengths: [
      "Powerful interior run defense that occupies multiple blockers and creates the pile-driving presence Campbell's defense demands from the interior.",
      "Developing pass rush from the interior that has expanded his value beyond a pure run-stopper profile.",
      "Physical and competitive personality that fits Campbell's culture of toughness and relentless effort.",
    ],
    weaknesses: [
      "Pass rush production on clear passing downs, while improving, is still below elite interior defender standards.",
      "Lateral quickness against mobile quarterbacks and misdirection blocking schemes creates pursuit challenges.",
    ],
    performance: "McNeill has been a solid starting defensive tackle who anchors the Lions' interior run defense and contributes growing pass-rush production. His physical style is emblematic of the Campbell-era Lions culture.",
    impact: "McNeill's interior presence allows Hutchinson to rush from the edge without worrying about run gaps being exposed inside. His run-stopping anchor is an important component of a defense that needs physical toughness to complement the offense.",
    outlook: "McNeill enters 2026 with an opportunity to establish himself as one of the better interior defenders in the NFC North. Continued pass-rush development alongside his run-stopping base could elevate him into Pro Bowl consideration.",
  },
  {
    name: "Kerby Joseph",
    pos: "Safety",
    number: 31,
    age: 25,
    years: 4,
    overview: "Kerby Joseph is the Detroit Lions' ball-hawk free safety and one of the most turnover-productive defensive backs in the NFC North. A player whose instincts, ball skills, and range in deep coverage have generated a turnover production that ranks among the best at the position, Joseph is the Lions' defensive playmaker whose interceptions and caused fumbles change the outcome of games.",
    strengths: [
      "Ball-hawk instincts that rank among the best safeties in the NFC — Joseph finds the football in the air consistently, generating interceptions and pass breakups at a rate that turns the defense into a turnover machine.",
      "Range in deep coverage that allows him to protect large areas of the field as a centerfield safety.",
      "Explosive play anticipation that makes him one of the most exciting defensive players to watch in the NFC North.",
    ],
    weaknesses: [
      "Aggression in coverage can occasionally be exploited by quarterbacks who pump fake to trigger early jumps on routes.",
      "Physical run support near the line of scrimmage is a less-developed part of his game relative to his coverage excellence.",
    ],
    performance: "Joseph has been the most productive turnover producer in Detroit's defense, generating interceptions and forced fumbles at a rate that has made him a game-changer in the secondary. His ball-hawk production has been the catalyst for some of the Lions' most memorable defensive moments.",
    impact: "Joseph's ability to create turnovers transforms the Lions' defensive performance. In an offense-first system like Campbell's, turnovers generated by Joseph provide the Lions' offense with short fields that accelerate scoring and change game momentum in ways that change outcomes.",
    outlook: "Joseph enters 2026 as one of the most exciting safeties in the NFC North and a player with legitimate All-Pro upside if his turnover production continues. Another season of elite ball-hawk statistics would cement his status as a franchise safety.",
  },
];

// ── Content generator ─────────────────────────────────────────────────────────

function generatePlayerPost(player: LionsPlayer) {
  const slug = slugify(`detroit-lions-${player.name}-player-profile-2026`, {
    lower: true, strict: true,
  });

  const title = `${player.name} — Detroit Lions ${player.pos} | 2026 Player Profile & Analysis`;
  const excerpt = `Complete 2026 player profile for Detroit Lions ${player.pos} ${player.name}. Strengths, weaknesses, performance analysis, and season outlook under head coach Dan Campbell.`;

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

<h2>Impact on the Lions</h2>
<p>${player.impact}</p>

<h2>2026 Season Outlook</h2>
<p>${player.outlook}</p>

<p><em>Analysis based on the 2026 Detroit Lions roster and the system installed by head coach Dan Campbell.</em></p>
`.trim();

  const tags = [
    "Detroit Lions",
    "Lions",
    "NFC North",
    player.name,
    player.pos,
    "Lions Player Profile",
    "NFL Player Analysis",
    "2026 NFL Season",
    "Dan Campbell",
  ];

  return {
    slug,
    title,
    excerpt,
    content,
    author: "NFL Predictions Hub Staff",
    tags,
    published: true,
    metaTitle: `${player.name} | Detroit Lions ${player.pos} Profile 2026 — NFL Predictions Hub`,
    metaDescription: excerpt,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  let created = 0;
  let skipped = 0;

  for (const player of LIONS_ROSTER) {
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
