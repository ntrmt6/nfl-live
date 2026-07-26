/**
 * Generates one unique blog post per Buffalo Bills player.
 * Run: npx tsx scripts/generate-bills-player-posts.ts
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

interface BillsPlayer {
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

const BILLS_ROSTER: BillsPlayer[] = [
  {
    name: "Josh Allen",
    pos: "Quarterback",
    number: 17,
    age: 30,
    years: 8,
    overview: "Josh Allen is the Buffalo Bills' franchise quarterback and one of the two or three most talented players at his position in professional football. A former first-round pick who has developed from a raw athlete into an elite dual-threat quarterback, Allen combines a cannon arm, elite improvisation, and freakish physical gifts with the competitive drive of a championship-caliber leader. The Bills' identity, ceiling, and championship window are defined entirely by his continued growth and health.",
    strengths: [
      "Among the strongest arms in NFL history — Allen can make every throw on the field with elite velocity and touch, including deep post routes, sideline throws against tight coverage, and comeback routes in adverse weather.",
      "Elite rushing threat from the quarterback position who regularly creates first downs and touchdowns through designed runs and scrambles that no defensive coordinator can fully neutralize.",
      "Improvisational genius in broken-play situations. Allen's ability to extend plays, buy time, and find open receivers when protection breaks down is a generational trait that makes the Bills uniquely dangerous.",
      "Competitive fire and leadership that have transformed the Bills' culture and made Buffalo one of the most passionate fan bases in professional sports.",
    ],
    weaknesses: [
      "Decision-making under pressure in the biggest moments has occasionally been the difference between a Bills playoff win and an early exit — Allen's tendency to force throws in critical situations creates turnovers at the worst possible times.",
      "Physical running style creates injury risk that compounds the more he carries the ball, and the Bills must manage his exposure as a runner to keep him healthy for the postseason.",
      "Consistency from game to game can vary, with high-production performances followed by uncharacteristic turnover-heavy games in a pattern that has defined his career.",
    ],
    performance: "Allen has been one of the most productive quarterbacks in the AFC over the last five seasons, combining elite statistical output with memorable performances that have made him the face of one of the NFL's most exciting offenses. His dual-threat ability makes the Bills' offense uniquely difficult to game-plan against, and his ceiling in a great game is among the highest of any quarterback in the sport.",
    impact: "Allen is the Bills. Without him, Buffalo is a respectable team with a quality defensive roster. With him at his best, they are legitimate Super Bowl contenders with one of the most dangerous offenses in professional football. His presence changes how every opponent prepares for Buffalo each week.",
    outlook: "Allen enters 2026 at 30 — still within his prime — with the same Super Bowl ceiling that has defined his last five seasons. The Bills have built a quality roster around him, and the pieces are in place for a deep playoff run. Everything in Buffalo flows from whether Allen can play at his best when it matters most.",
  },
  {
    name: "James Cook",
    pos: "Running Back",
    number: 4,
    age: 25,
    years: 4,
    overview: "James Cook is the Buffalo Bills' starting running back and one of the most explosive skill players in the AFC. A former second-round pick who has developed rapidly into a legitimate starting back, Cook combines elite speed, receiving ability out of the backfield, and the elusiveness to make defenders miss in the open field. His selection for the 2026 Pro Bowl alongside Josh Allen and Dion Dawkins confirmed his emergence as one of the Bills' most important offensive weapons.",
    strengths: [
      "Elite straight-line speed — Cook is one of the fastest running backs in the NFL, capable of taking any run to the house once he clears the line of scrimmage.",
      "Receiving ability out of the backfield that creates genuine mismatches against linebackers in space — Cook is a real weapon in the screen game and on wheel routes.",
      "Elusiveness and change of direction in the open field that makes him dangerous even when the initial gain appears contained.",
      "Pro Bowl selection confirms the league-wide recognition of his impact on Buffalo's offense.",
    ],
    weaknesses: [
      "Between-the-tackles power running is a limitation — Cook is most effective when given space and angles rather than grinding into stacked boxes against physical front sevens.",
      "Pass protection consistency in blitz-heavy situations is an ongoing development area.",
    ],
    performance: "Cook has been one of the best young running backs in the AFC, producing at a level that earned Pro Bowl recognition and made him a key piece of Allen's offensive success. His explosive plays in the passing game and running game give the Bills' offense a complementary weapon that defensive coordinators must account for on every play.",
    impact: "Cook's explosive ability forces defenses to account for him as a genuine big-play threat on every down. When safeties cheat toward the box to stop him in the run game, the play-action passing game Allen operates opens up significantly. Cook is the ground-game complement that makes Allen's passing more efficient.",
    outlook: "Cook enters 2026 as one of the AFC's premier running backs with the opportunity to build on his Pro Bowl season. A productive year in the passing game alongside Allen could push his receiving numbers to career highs, and his speed gives him home-run potential on every carry.",
  },
  {
    name: "DJ Moore",
    pos: "Wide Receiver",
    number: 2,
    age: 27,
    years: 8,
    overview: "DJ Moore is the Buffalo Bills' WR1 and Allen's most complete wide receiver target. A veteran who has produced at a consistent elite level across multiple systems, Moore brings route running precision, reliable hands, and the ability to win across all three levels of the route tree that makes him Allen's most trusted downfield weapon.",
    strengths: [
      "Route running versatility — Moore can play effectively on the outside or in the slot, running the full route tree with technical precision that creates separation against both man and zone coverage.",
      "Reliable hands and catch efficiency that give Allen a dependable target in every game situation, including contested catches in traffic.",
      "Yards after catch ability and open-field aggressiveness that regularly turns intermediate catches into explosive gains.",
      "Experience in multiple offensive systems gives Moore the adaptability to maximize production in any scheme.",
    ],
    weaknesses: [
      "Deep-threat ability, while solid, is not elite against the NFL's fastest cornerbacks who can compete with him on go routes.",
      "Consistency against physical press coverage from the league's biggest and most physical corners can be an occasional matchup challenge.",
    ],
    performance: "Moore has been one of the most consistent receivers in the AFC, producing elite statistics across multiple quarterbacks and systems in his career. His ability to perform at a high level in any offensive environment is the mark of a genuine star.",
    impact: "Moore is Allen's primary downfield outlet and the receiver who draws the most concentrated defensive attention in Buffalo's offense. When Moore is locked in and getting targets, the Bills' offense operates at its highest level — his production is directly correlated with Buffalo's offensive success.",
    outlook: "Moore enters 2026 as one of the most important pieces of the Bills' championship puzzle. A productive season operating alongside Cook and Allen in a complete offensive system gives him the platform for his best statistical year.",
  },
  {
    name: "Keon Coleman",
    pos: "Wide Receiver",
    number: 0,
    age: 22,
    years: 2,
    overview: "Keon Coleman is the Buffalo Bills' dynamic young wide receiver, a physically gifted pass catcher whose combination of size, leaping ability, and ball skills have made him one of the most exciting young receivers in the AFC. After a promising rookie season, Coleman enters 2026 with the expectation that he develops into a legitimate complementary receiver alongside DJ Moore.",
    strengths: [
      "Exceptional body control and leaping ability that make him one of the most impressive contested-catch receivers in his draft class.",
      "Size at 6'4\" creates natural mismatches against smaller corners in the red zone.",
      "Big-play ability and highlight-reel catches that generate explosive gains even in difficult coverage situations.",
    ],
    weaknesses: [
      "Route running precision and technical refinement against veteran NFL corners is still developing.",
      "Consistency on intermediate routes where quick footwork and deception are required rather than pure athleticism.",
    ],
    performance: "Coleman has shown enough in his first two seasons to justify the Bills' investment, with several memorable plays that demonstrate his ceiling as a big-body receiver. His best football is still ahead of him.",
    impact: "Coleman's size and contested-catch ability give Allen a red-zone target with a physical advantage that Moore doesn't provide. In scoring situations, his dimensions create problems for defenses that Moore's quicker skill set doesn't.",
    outlook: "Coleman enters 2026 at a critical development stage. A breakout second season — with more consistent route running and production on a week-to-week basis — would make him a genuine WR2 and take the Bills' receiving corps to another level.",
  },
  {
    name: "Dalton Kincaid",
    pos: "Tight End",
    number: 86,
    age: 26,
    years: 3,
    overview: "Dalton Kincaid is the Buffalo Bills' starting tight end, a receiving-first tight end who gives Allen a reliable seam target in the intermediate area of the field. A former first-round pick whose receiving ability made him one of the most productive college tight ends before arriving in Buffalo, Kincaid has developed into a trusted option in the Bills' multiple offensive system.",
    strengths: [
      "Elite receiving ability in the intermediate area — Kincaid consistently gets open against linebackers and safeties in zone coverage on seam routes and crossing patterns.",
      "Reliable hands and concentration in traffic make him a trustworthy target in critical downs.",
      "Developing chemistry with Allen that has grown each season in the Bills' system.",
    ],
    weaknesses: [
      "Blocking ability as an in-line tight end needs continued development to stay on the field as a complete tight end.",
      "Physical toughness in contested catch situations against elite safeties is still being tested at the NFL level.",
    ],
    performance: "Kincaid has been a quality starter who produces efficiently in his defined role as the Bills' primary receiving tight end. His production on third downs and in the red zone has made him a reliable piece of Allen's offense.",
    impact: "Kincaid's seam-running ability gives Allen a middle-field option that forces linebackers to play coverage rather than blitz — a key component of the Bills' ability to protect Allen in obvious passing situations.",
    outlook: "Kincaid enters 2026 with the opportunity to become one of the better receiving tight ends in the AFC. Continued development in his blocking and increased target share could make him a Pro Bowl-caliber player.",
  },
  {
    name: "Dion Dawkins",
    pos: "Left Tackle",
    number: 73,
    age: 30,
    years: 8,
    overview: "Dion Dawkins is the Buffalo Bills' veteran left tackle and Allen's blindside protector, a three-time Pro Bowl selection who has been one of the most consistent offensive linemen in the AFC for nearly a decade. Dawkins' combination of athleticism, technique, and leadership makes him one of the most important players on the Bills' roster.",
    strengths: [
      "Elite athleticism for the tackle position — Dawkins' quickness and lateral mobility allow him to handle elite speed rushers with a technique that bigger, slower tackles cannot replicate.",
      "Pass blocking consistency that gives Allen the clean pocket time needed to operate his deep passing game effectively.",
      "Leadership and veteran presence that anchor the left side and set the professional standard for the entire offensive line.",
    ],
    weaknesses: [
      "Age at 30 means the Bills must carefully manage his workload to keep him effective across a full 17-game season.",
      "Power against elite bull-rushing defensive ends in late-game situations when legs get tired can be a challenge.",
    ],
    performance: "Dawkins has been one of the most consistent left tackles in the AFC for multiple seasons, earning Pro Bowl recognition for performance that has consistently ranked among the position's best. His protection of Allen's blindside is foundational to the Bills' offensive success.",
    impact: "Dawkins' left tackle performance directly determines how much time Allen has in the pocket and how often he scrambles out of necessity rather than choice. Clean pockets let Allen operate the passing game at its highest level.",
    outlook: "Dawkins enters 2026 as one of the AFC's elite left tackles. A continued Pro Bowl-caliber season would place him in the conversation as a top-five player at the position.",
  },
  {
    name: "Bradley Chubb",
    pos: "Outside Linebacker",
    number: 55,
    age: 29,
    years: 8,
    overview: "Bradley Chubb is the Buffalo Bills' veteran outside linebacker and edge rusher, a former first-overall pick who has rebuilt his career in Buffalo after overcoming ACL and Achilles injuries. Chubb brings experience, a developed pass rush repertoire, and the competitive drive to establish himself as one of the AFC's top edge rushers.",
    strengths: [
      "Developed pass rush repertoire featuring speed-to-power, spin, and counter moves built through eight NFL seasons.",
      "Motor and competitive effort that sustain his production even when not recording sacks — Chubb influences the quarterback's decision-making even on plays where he doesn't win cleanly.",
      "Leadership and veteran experience that help elevate younger edge rushers on the Bills' defensive front.",
    ],
    weaknesses: [
      "Injury history — two significant lower-body injuries — creates durability questions that the Bills must monitor carefully across a full season.",
      "Post-injury explosiveness off the line has varied in different stretches of the season.",
    ],
    performance: "Chubb has been one of the Bills' most important defensive players when healthy, generating consistent pressure and disrupting opposing quarterbacks in ways that his sack totals don't fully capture.",
    impact: "Chubb's presence on the edge gives the Bills' defense a legitimate pass rush threat that forces offensive coordinators to commit extra resources to his side, which opens opportunities for interior rushers.",
    outlook: "Chubb enters 2026 motivated to demonstrate that his best years are still ahead. A healthy, complete season would re-establish him as one of the premier edge rushers in the AFC and validate Buffalo's investment in his talent.",
  },
  {
    name: "Maxwell Hairston",
    pos: "Cornerback",
    number: 31,
    age: 23,
    years: 2,
    overview: "Maxwell Hairston is the Buffalo Bills' starting cornerback and one of the most exciting young defensive backs in the AFC. A former first-round pick who has earned a starting role through his athleticism, ball production, and competitive press coverage ability, Hairston gives the Bills' secondary a legitimate lockdown corner with interception upside on every snap.",
    strengths: [
      "Elite ball production instincts — Hairston has a rare ability to locate the football in the air and position himself for interceptions and pass breakups that most corners never create.",
      "Press coverage athleticism and quickness that disrupt the timing of receivers at the line of scrimmage.",
      "Speed to recover from coverage mistakes and compete for the ball even when initially beaten.",
    ],
    weaknesses: [
      "Consistency against the NFL's most experienced route runners who use varied tempos and double moves to free themselves from press coverage.",
      "Technique in zone coverage assignments is still developing as he learns the nuances of playing off receivers.",
    ],
    performance: "Hairston has been one of the most productive young corners in the AFC, earning recognition with ball production that makes him a genuine turnover threat on every play. His interception ability changes how quarterbacks target his side of the field.",
    impact: "Hairston's ball-hawking ability on one side of the field forces quarterbacks to carefully consider throwing toward him, which opens up coverage opportunities for the rest of the Bills' secondary. His interception production in critical moments has directly changed the outcome of games.",
    outlook: "Hairston enters 2026 as one of the most exciting young cornerbacks in professional football. A breakout second season could establish him as a legitimate All-Pro cornerback and one of the Bills' most valuable defensive pieces.",
  },
  {
    name: "Chauncey Gardner-Johnson",
    pos: "Safety",
    number: 23,
    age: 27,
    years: 7,
    overview: "Chauncey Gardner-Johnson is the Buffalo Bills' starting safety and one of the most competitive and physical defensive backs in the AFC. Known for his physicality, ball production, and willingness to play near the line of scrimmage, CGJ brings an aggressive style to the Bills' secondary that complements their cornerback talent and gives the defense a physical presence in run support.",
    strengths: [
      "Physical press-heavy style that disrupts receivers and tight ends at the line of scrimmage — CGJ's willingness to be physical makes him one of the most feared defenders for opposing slot receivers.",
      "Ball production and turnover instincts that have made him one of the most productive safeties in the NFC over his career.",
      "Versatility to play both box safety and split safety, giving the Bills' defensive coordinators flexibility in their coverage shells.",
    ],
    weaknesses: [
      "Penalty frequency from his physical style — CGJ's aggressiveness can lead to pass interference and unnecessary roughness calls that hurt the defense.",
      "Deep coverage in pure cover-two situations against elite speed receivers at the top of the field.",
    ],
    performance: "CGJ has been one of the most impactful safeties in the AFC, combining meaningful statistical production with game-altering physical play that changes how opposing offenses approach the Bills' secondary.",
    impact: "CGJ's box safety role gives the Bills' defense a physical deterrent in the run game while maintaining enough athleticism to drop into coverage on passing downs. His presence near the line of scrimmage also allows Hairston to play more aggressively on the outside.",
    outlook: "CGJ enters 2026 as a key piece of a Bills defense that is building toward something special. His experience and physicality give Buffalo the veteran defensive presence that championship defenses require.",
  },
];

function generatePlayerPost(player: BillsPlayer) {
  const slug = slugify(`buffalo-bills-${player.name}-player-profile-2026`, {
    lower: true, strict: true,
  });

  const title = `${player.name} — Buffalo Bills ${player.pos} | 2026 Player Profile & Analysis`;
  const excerpt = `Complete 2026 player profile for Buffalo Bills ${player.pos} ${player.name}. Strengths, weaknesses, performance analysis, and season outlook for Buffalo's Super Bowl contenders.`;

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

<h2>Impact on the Bills</h2>
<p>${player.impact}</p>

<h2>2026 Season Outlook</h2>
<p>${player.outlook}</p>

<p><em>Analysis based on the 2026 Buffalo Bills roster and the offensive system installed by head coach Sean McDermott.</em></p>
`.trim();

  const tags = [
    "Buffalo Bills",
    "Bills",
    player.name,
    player.pos,
    "Bills Player Profile",
    "NFL Player Analysis",
    "2026 NFL Season",
    "Sean McDermott",
    "AFC East",
  ];

  return {
    slug,
    title,
    excerpt,
    content,
    author: "NFL Predictions Hub Staff",
    tags,
    published: true,
    metaTitle: `${player.name} | Buffalo Bills ${player.pos} Profile 2026 — NFL Predictions Hub`,
    metaDescription: excerpt,
  };
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  let created = 0;
  let skipped = 0;

  for (const player of BILLS_ROSTER) {
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
