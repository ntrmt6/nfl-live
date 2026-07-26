/**
 * Generates one unique blog post per Minnesota Vikings player.
 * Run: npx tsx scripts/generate-vikings-player-posts.ts
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

// ── Vikings roster ────────────────────────────────────────────────────────────

interface VikingsPlayer {
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

const VIKINGS_ROSTER: VikingsPlayer[] = [
  {
    name: "Kyler Murray",
    pos: "Quarterback",
    number: 1,
    age: 28,
    years: 7,
    overview: "Kyler Murray is the Minnesota Vikings' starting quarterback — a former MVP-caliber talent who signed a bargain deal after the Arizona Cardinals released him, immediately winning the starting competition over former first-round pick JJ McCarthy. One of the most electric dual-threat quarterbacks in professional football when at his peak, Murray enters Minnesota with a genuine chip on his shoulder and a rejuvenation storyline that has all the ingredients of one of 2026's most compelling individual narratives.",
    strengths: [
      "Elite dual-threat ability that no defensive coordinator can prepare for without committing extra resources — Murray's combination of arm talent and explosive rushing creates a dimension that transforms Kevin O'Connell's system into something uniquely dangerous.",
      "MVP-caliber ceiling when healthy and operating in a system that maximizes his dual-threat skills — Murray's best football has been among the most impressive individual quarterback performances in the NFC.",
      "Quick release and processing speed that allow him to operate efficiently even against complex blitz packages and disguised coverages.",
      "Competitive chip from Arizona's decision to release him creates a motivation that often produces the best football of a quarterback's career.",
    ],
    weaknesses: [
      "Injury history is the most significant concern of his career — Murray has missed substantial time to ACL, hamstring, and shoulder issues that raise legitimate questions about his ability to last a full 17-game season.",
      "Size at 5'10\" creates some durability concerns when he takes designed runs against physical defensive fronts.",
      "Consistency from week to week, even when healthy, has shown more variance than elite franchise quarterbacks typically display.",
    ],
    performance: "Murray's best performances — including a 2021 campaign that produced Pro Bowl numbers and MVP consideration — rank among the most impressive individual quarterback seasons in recent NFC history. The challenge has always been health and sustained consistency. In Minnesota, with Justin Jefferson as his primary target and O'Connell's system, he has the best offensive infrastructure of his career.",
    impact: "Murray transforms the Vikings' offensive ceiling. With Justin Jefferson, TJ Hockenson, and Jordan Addison as targets, and a system designed by O'Connell that is ideally suited to mobile quarterbacks, Murray gives Minnesota an offense that can compete with anyone in the NFC North.",
    outlook: "Murray enters 2026 as one of the most exciting offensive stories in the NFC. If he stays healthy — always the central question — the ceiling for this Vikings offense with Murray at the helm is genuinely elite. A productive, healthy season would vindicate the organizational commitment to him over McCarthy and potentially position Minnesota as a dark-horse Super Bowl contender.",
  },
  {
    name: "Justin Jefferson",
    pos: "Wide Receiver",
    number: 18,
    age: 27,
    years: 6,
    overview: "Justin Jefferson is the Minnesota Vikings' superstar wide receiver and the centerpiece of one of the best offensive configurations in the NFC North. A top-three receiver in professional football whose combination of contested-catch mastery, route running excellence, and YAC production makes him genuinely impossible to cover reliably, Jefferson is the player defenses must prioritize — which means every other Viking benefits from his presence on every snap.",
    strengths: [
      "Top-three receiver in professional football — Jefferson's combination of contested-catch ability, route running precision, and yards-after-catch makes him the most complete receiver in the NFC North.",
      "Contested catch specialist whose hand strength, body control, and timing at the highest point of the ball makes him win jump balls against even the biggest and most physical corners.",
      "Elite route running that generates separation at every level — Jefferson's ability to win against man, zone, and bracket coverage makes him uniquely uncoverable.",
      "Football IQ and separation technique that have elevated each season, making him more sophisticated than the raw athleticism that was already elite.",
    ],
    weaknesses: [
      "Defenses that commit bracket coverage and safety help over the top can reduce his raw target volume, though his efficiency against single coverage remains exceptional.",
      "When the quarterback situation is unstable, Jefferson's production suffers — the quarterback is the critical variable in his statistical output.",
    ],
    performance: "Jefferson has been the most productive receiver in the NFC North across multiple seasons, delivering Pro Bowl-level numbers despite inconsistent quarterback play. His ability to generate elite production regardless of who is throwing him the ball confirms that his talent is independent of external factors.",
    impact: "Jefferson's impact on the Vikings' offense is total. Every coverage resource committed to eliminating him creates one-on-one opportunities for Addison and Hockenson. No defensive coordinator can solve Jefferson without weakening every other element of their coverage scheme — which is the most powerful attribute a receiver can possess.",
    outlook: "Jefferson enters 2026 with the best quarterback of his professional career throwing him the ball. Murray's dual-threat ability and quick release give Jefferson the separation he needs to operate against pressed coverage, and the combination could produce the highest statistical season of his career. Jefferson is the early frontrunner for Offensive Player of the Year.",
  },
  {
    name: "JJ McCarthy",
    pos: "Quarterback",
    number: 9,
    age: 22,
    years: 2,
    overview: "JJ McCarthy is the Minnesota Vikings' former first-round quarterback pick whose starting future in Minnesota was complicated by the team's decision to sign Kyler Murray on a bargain deal. After losing the 2026 starting competition to Murray, McCarthy enters a critical developmental season as the backup — learning behind a legitimate starting quarterback while his own future with the franchise remains an open and defining question.",
    strengths: [
      "First-round pedigree backed by impressive collegiate credentials — McCarthy has the football intelligence and competitive drive that justified his draft position.",
      "Natural leadership and competitive composure developed through Michigan's championship culture under Jim Harbaugh.",
      "Developing arm talent and accuracy that O'Connell's system can continue to refine with extensive practice reps.",
    ],
    weaknesses: [
      "Limited NFL starting experience creates questions about his ability to execute consistently against professional defensive complexity.",
      "The quarterback competition loss to Murray signals that the organization does not yet believe he is ready to lead the offense at full efficiency.",
      "Proving his worth as the future of the franchise while serving as backup requires patience and professionalism that tests young quarterbacks.",
    ],
    performance: "McCarthy's primary performance arena in 2026 is in practice and preparation. His ability to absorb knowledge from Murray, develop his own game with O'Connell's coaching staff, and demonstrate growth in limited action will determine how quickly he reclaims the starting competition.",
    impact: "McCarthy's impact in 2026 is primarily in his own development and in his ability to keep the Vikings competitive if Murray faces injury. His preparation and growth rate this season will directly determine the franchise's long-term quarterback direction.",
    outlook: "McCarthy's 2026 is a character-defining season. Whether he handles the backup role with professionalism and accelerates his development — or struggles with the demotion — will say everything about his long-term prospects in the NFL. The talent is present; the question is trajectory.",
  },
  {
    name: "Jordan Addison",
    pos: "Wide Receiver",
    number: 3,
    age: 23,
    years: 3,
    overview: "Jordan Addison is the Minnesota Vikings' second wide receiver and a developing speed complement to Justin Jefferson. A former first-round pick who has been growing into his WR2 role alongside the best receiver in the NFC North, Addison brings the quick-twitch athleticism and deep-threat capability that forces defenses to account for the vertical game even while prioritizing Jefferson.",
    strengths: [
      "Elite acceleration and straight-line speed that qualify him as a legitimate deep threat on vertical routes, forcing safety rotation away from Jefferson.",
      "Developing WR2 role that rewards the coverage attention Jefferson demands — Addison operates in single coverage more than any receiver on his level.",
      "Youth at 23 with continued upside as his route running and receiver craft mature through professional experience.",
    ],
    weaknesses: [
      "Consistency against elite press corners who can disrupt his releases and limit his explosiveness at the top of routes.",
      "Route running precision in the short and intermediate areas is still developing toward the level of a true WR2 in a sophisticated passing offense.",
    ],
    performance: "Addison has shown genuine development as Jefferson's complement, and the arrival of Murray should elevate his production by providing a quarterback whose quick release and ability to extend plays give Addison more opportunities to create in space.",
    impact: "Addison's presence forces defenses to account for a vertical threat on every snap, which opens the intermediate routes and underneath throws that keep offensive drives alive. His chemistry with Murray — a quarterback who can threaten defenses with his legs — could be the highest-ceiling relationship in the offense.",
    outlook: "Addison enters 2026 with an opportunity to deliver a genuine breakout season. With Murray throwing him the ball and Jefferson drawing the bulk of coverage attention, the conditions for an 800-plus yard season with multiple touchdowns are present. His development trajectory makes him one of the NFC North's most exciting young receivers.",
  },
  {
    name: "TJ Hockenson",
    pos: "Tight End",
    number: 87,
    age: 27,
    years: 6,
    overview: "TJ Hockenson is the Minnesota Vikings' elite receiving tight end and Comeback Player of the Year Award winner whose return from injury demonstrated exactly how important he is to Minnesota's offensive system. One of the best tight ends in the NFC North, Hockenson provides Murray with a massive, athletic seam-runner who creates matchup nightmares for every linebacker and safety in the division.",
    strengths: [
      "Elite receiving tight end who would be the top target on most NFL rosters — Hockenson's size, athleticism, and route running are genuinely all-pro caliber.",
      "Comeback Player of the Year Award winner whose return from serious injury demonstrated the physical resilience and dedication that define his professional character.",
      "Key target for Murray in every game situation — Hockenson's ability to win in the seam, the red zone, and on third down gives Murray a reliable option in every critical moment.",
      "Mismatch weapon against linebackers and safeties simultaneously — no single defender can cover Hockenson reliably given his combination of size and athleticism.",
    ],
    weaknesses: [
      "Injury history creates durability concerns — Hockenson's recovery from a serious injury means availability is not guaranteed across a full 17-game season.",
      "Blocking in the run game has been a lesser strength relative to his elite receiving production.",
    ],
    performance: "Hockenson's healthy seasons have been among the most productive tight end campaigns in Vikings history. His Comeback Player award reflects both the severity of his injury and the quality of his return — and a fully healthy Hockenson in 2026 gives Minnesota one of the best offensive mismatches in the NFC North.",
    impact: "Hockenson alongside Jefferson creates a coverage problem that forces defensive coordinators to make impossible choices. Committing safety help to Jefferson leaves Hockenson in linebacker coverage. Doubling Hockenson in the seam leaves Jefferson in one-on-one situations. No scheme solves both simultaneously.",
    outlook: "Hockenson enters 2026 as one of the most important players in Minnesota's offensive success. A fully healthy season could produce the highest statistical totals of his career, and his partnership with Murray — a quarterback who has historically used the tight end position effectively — creates exciting production potential.",
  },
  {
    name: "Jauan Jennings",
    pos: "Wide Receiver",
    number: 15,
    age: 28,
    years: 5,
    overview: "Jauan Jennings is the Minnesota Vikings' veteran slot receiver addition and a reliable chain-mover who provides O'Connell's offense with proven production in the underneath passing game. A veteran who has been productive across multiple teams, Jennings brings the kind of slot expertise and reliability that gives Murray a trusted short-yardage option.",
    strengths: [
      "Reliable slot receiver production built through five professional seasons — Jennings is a proven target who catches the ball and generates first downs consistently.",
      "Route running and football intelligence developed through an extensive professional career that allows him to find open windows quickly.",
      "Chain-mover reliability on third and short situations where his catch production sustains drives.",
    ],
    weaknesses: [
      "Top-end speed is below the level of the league's most explosive slot receivers, limiting his explosiveness on extended plays.",
      "Role as a complementary piece behind Jefferson and Addison limits his target volume.",
    ],
    performance: "Jennings has been a reliable rotational contributor whose short-area production gives O'Connell a trusted option in specific game situations. His veteran reliability is valuable in a passing game that also features younger receivers still developing consistency.",
    impact: "Jennings provides depth and reliability in the slot that complements Addison and ensures Minnesota's underneath passing game remains functional even when defenses commit coverage resources to Jefferson and Hockenson.",
    outlook: "Jennings enters 2026 as a solid depth receiver whose primary value is veteran reliability. His role within Minnesota's deep receiving corps is defined but productive.",
  },
  {
    name: "Christian Darrisaw",
    pos: "Offensive Tackle",
    number: 71,
    age: 26,
    years: 5,
    overview: "Christian Darrisaw is the Minnesota Vikings' Pro Bowl left tackle and one of the best blindside protectors in the NFC North. A premier offensive lineman who has developed into a top-five tackle in professional football, Darrisaw's protection of Justin Jefferson's passes and Kyler Murray's blindside is the foundational element of Minnesota's offensive architecture.",
    strengths: [
      "Top-five left tackle in professional football — Darrisaw's combination of length, athleticism, and pass-protection technique is genuinely elite, providing Jefferson and Murray with consistent blindside security.",
      "Pro Bowl recognition that reflects the league-wide acknowledgment of his importance to Minnesota's offensive success.",
      "Versatility to handle both power rushers and speed rushers effectively, making him reliable against every edge rusher in the NFC North.",
      "Murray protector and Jefferson enabler — his performance directly determines the offensive ceiling of the Vikings' most important players.",
    ],
    weaknesses: [
      "Run blocking at the second level, while solid, occasionally falls below his elite pass protection standard.",
      "Injuries have limited him to fewer games than his talent deserves — durability management across a full season is important.",
    ],
    performance: "Darrisaw has been the most important lineman in Minnesota's offense, providing the pass protection that allows Murray's quick release to operate efficiently and Jefferson's route tree to develop fully. His Pro Bowl performance has been central to every offensive success the Vikings have achieved.",
    impact: "Darrisaw's protection of Murray's blindside is a non-negotiable component of the offense functioning. Murray's effectiveness as a passer depends on pocket integrity, and Darrisaw provides that consistently against the best edge rushers in the NFC North.",
    outlook: "Darrisaw enters 2026 as one of the five best left tackles in professional football and a player whose continued development could push him toward All-Pro consideration. His partnership with Murray is the most important relationship on the offensive side of the roster.",
  },
  {
    name: "Jonathan Greenard",
    pos: "Defensive End",
    number: 57,
    age: 28,
    years: 6,
    overview: "Jonathan Greenard is the Minnesota Vikings' elite edge rusher acquired this offseason — the best pressure rate in the NFL last season, now deployed by Kevin O'Connell and defensive coordinator Brian Flores to transform Minnesota's pass rush identity. Greenard brings the kind of quarterback-disruption ability that the Vikings have lacked and that can elevate the entire defense.",
    strengths: [
      "Best pressure rate in the NFL last season — Greenard's ability to generate consistent quarterback pressure is the single most valuable defensive skill in the modern NFL, and he has demonstrated it at the elite level.",
      "Diverse and sophisticated pass rush repertoire that works against every offensive tackle technique — Greenard is not a one-move rusher.",
      "Six seasons of professional experience mean his production is proven and sustainable rather than a one-year anomaly.",
      "Veteran leadership on a defense that needs a captain-level pass rusher to anchor its identity.",
    ],
    weaknesses: [
      "Adjustment to a new defensive system requires some early-season acclimatization, though his fundamentals are system-agnostic.",
      "Run defense has been a secondary strength — Greenard's value is concentrated in his pass-rushing production.",
    ],
    performance: "Greenard's performance last season — the best pressure rate in the NFL — was the single most important factor in Minnesota's decision to acquire him this offseason. His ability to generate consistent pressure that forces quick throws and disrupts pocket presence is exactly what the Vikings have been missing.",
    impact: "Greenard's impact on Minnesota's defense is potentially transformative. A genuine top-tier pass rusher gives the entire secondary more time to operate in coverage, and his quarterback disruption reduces the precision required from cornerbacks who benefit from rushed throws and early exits.",
    outlook: "Greenard enters 2026 as the most important defensive addition in Minnesota's recent history. If he replicates his league-best pressure rate in O'Connell's system, the Vikings' defense transforms from a group relying on individual coverage ability to a unit with a genuine pass-rush identity that can win games independently.",
  },
  {
    name: "Harrison Smith",
    pos: "Safety",
    number: 22,
    age: 34,
    years: 14,
    overview: "Harrison Smith is the Minnesota Vikings' legendary veteran safety and a franchise institution across 14 professional seasons. One of the most complete safeties in the history of the position, Smith has been the defensive foundation of multiple Vikings eras and continues to contribute leadership, communication, and high-level defensive play in what may be the final chapter of an extraordinary career.",
    strengths: [
      "14 seasons of professional excellence that have established Smith as one of the greatest safeties in Vikings franchise history — his tenure encompasses multiple generations of organizational leadership.",
      "Coverage intelligence and pre-snap processing that remain elite — Smith reads offenses with the mastery of a defensive coordinator in a safety's body.",
      "Communication and leadership in the secondary that organize coverage assignments, eliminate blown coverages, and make every player around him more effective.",
      "Veteran instincts that produce turnovers and big plays beyond what his declining athleticism would suggest.",
    ],
    weaknesses: [
      "Athletic decline at 34 has reduced his range in deep coverage and his ability to match speed with the fastest receivers.",
      "Snap count management is increasingly important to maintaining his effectiveness through the later weeks of the season.",
    ],
    performance: "Smith has been the most respected defensive player in Vikings history, and his continued production at 34 through technique and intelligence rather than athleticism is a testament to his preparation and competitive drive. His communication in the secondary has been invaluable across every season.",
    impact: "Smith's most important contributions at this stage may be in the meeting room as much as on the field. His communication organizes the entire secondary into a functioning unit, and his veteran instincts produce the timely plays that change game outcomes.",
    outlook: "Smith enters 2026 likely in his final season as an active player. The organization will lean on his leadership, communication, and positional expertise while managing his physical workload appropriately. His presence as a franchise legend elevates every young defensive back who shares the field with him.",
  },
  {
    name: "Brian Asamoah",
    pos: "Linebacker",
    number: 33,
    age: 25,
    years: 4,
    overview: "Brian Asamoah is the Minnesota Vikings' developing inside linebacker and an athletic piece of O'Connell's defensive system. A player whose coverage ability and lateral quickness have been the focus of his development, Asamoah represents Minnesota's investment in a linebacker who can handle the coverage responsibilities that modern NFL defenses demand.",
    strengths: [
      "Athletic linebacker profile with the lateral quickness to cover running backs and slot receivers in zone and man concepts.",
      "Developing coverage ability that has improved each professional season — Asamoah's athleticism gives him a legitimate path to becoming a three-down linebacker.",
      "Youth at 25 with continued developmental trajectory in the defensive system.",
    ],
    weaknesses: [
      "Physicality against elite offensive lines and power running attacks is still developing — Asamoah's value is concentrated in coverage rather than run defense.",
      "NFL experience accumulation is ongoing — four professional seasons have provided development but not yet elite starting consistency.",
    ],
    performance: "Asamoah has been a developing contributor who plays within his defined role effectively. His coverage ability has shown genuine improvement, and his role in the Vikings' system should expand as his physicality catches up to his athleticism.",
    impact: "Asamoah's coverage ability gives the Vikings a linebacker who can handle the passing-game responsibilities that modern offenses exploit against traditional run-stuffing linebackers. His presence allows the Vikings to maintain coverage integrity on third downs without substituting to a nickel package.",
    outlook: "Asamoah enters 2026 with an opportunity to establish himself as a starter-level linebacker in the NFC North. His coverage ability and athletic profile give him the tools to become an important defensive piece as Smith gradually reduces his role.",
  },
];

// ── Content generator ─────────────────────────────────────────────────────────

function generatePlayerPost(player: VikingsPlayer) {
  const slug = slugify(`minnesota-vikings-${player.name}-player-profile-2026`, {
    lower: true, strict: true,
  });

  const title = `${player.name} — Minnesota Vikings ${player.pos} | 2026 Player Profile & Analysis`;
  const excerpt = `Complete 2026 player profile for Minnesota Vikings ${player.pos} ${player.name}. Strengths, weaknesses, performance analysis, and season outlook under head coach Kevin O'Connell.`;

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

<h2>Impact on the Vikings</h2>
<p>${player.impact}</p>

<h2>2026 Season Outlook</h2>
<p>${player.outlook}</p>

<p><em>Analysis based on the 2026 Minnesota Vikings roster and the system installed by head coach Kevin O'Connell.</em></p>
`.trim();

  const tags = [
    "Minnesota Vikings",
    "Vikings",
    "NFC North",
    player.name,
    player.pos,
    "Vikings Player Profile",
    "NFL Player Analysis",
    "2026 NFL Season",
    "Kevin O'Connell",
  ];

  return {
    slug,
    title,
    excerpt,
    content,
    author: "NFL Predictions Hub Staff",
    tags,
    published: true,
    metaTitle: `${player.name} | Minnesota Vikings ${player.pos} Profile 2026 — NFL Predictions Hub`,
    metaDescription: excerpt,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  let created = 0;
  let skipped = 0;

  for (const player of VIKINGS_ROSTER) {
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
