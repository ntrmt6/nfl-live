/**
 * Generates one unique blog post per San Francisco 49ers player.
 * Run: npx tsx scripts/generate-49ers-player-posts.ts
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

interface NinersPlayer {
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

const NINERS_ROSTER: NinersPlayer[] = [
  {
    name: "Brock Purdy",
    pos: "Quarterback",
    number: 13,
    age: 26,
    years: 4,
    overview: "Brock Purdy is the San Francisco 49ers' franchise quarterback and one of the most unlikely success stories in NFL history. The final pick of the 2022 NFL Draft — forever known as 'Mr. Irrelevant' — Purdy stepped into Kyle Shanahan's system and immediately produced at an elite level, proving that his success is not a product of luck or circumstance but of genuine quarterback talent, decision-making, and the rare ability to execute a complex system at an exceptional standard.",
    strengths: [
      "Elite accuracy and ball placement in the short and intermediate areas — Purdy consistently puts the ball where only his receiver can catch it, limiting defensive pass interference while maximizing yards after catch.",
      "Decision-making speed that is genuinely exceptional — Purdy processes Shanahan's complex pre-snap reads and post-snap route combinations faster than almost any quarterback in the league.",
      "Arm talent sufficient for every throw in Shanahan's system, including deep shots, back-shoulder fades, and compressed-window completions.",
      "Football IQ and preparation that allow him to manage the game's complexity while producing at an elite statistical level — a combination that most quarterbacks in NFL history have never been able to sustain.",
    ],
    weaknesses: [
      "Arm strength is not elite by NFL standards — in adverse weather conditions or in situations requiring deep throws against man coverage, his physical limitations become more apparent.",
      "Elbow injury history creates durability concerns, and the organization must manage his workload carefully to ensure a full, healthy season.",
      "Questions persist about his ability to carry a team when Shanahan's system is disrupted — in games where the run game struggles and the scheme is compromised, Purdy's production can decline sharply.",
    ],
    performance: "Purdy has been one of the most efficient quarterbacks in the NFC over two full seasons, consistently ranking among the top five in passer rating and producing at a level that has made the 'system quarterback' criticism increasingly hollow. His performance in big moments has been remarkable for a player of his draft pedigree.",
    impact: "Purdy's impact extends beyond his statistics because of how well he serves as the perfect executor of Shanahan's vision. His ability to make the correct decision quickly — getting the ball to Christian McCaffrey, George Kittle, or the open receiver on schedule — is the engine that drives everything the 49ers do offensively.",
    outlook: "Purdy enters 2026 as an established NFC starter with a legitimate Super Bowl ceiling. The departure of players like Deebo Samuel has forced the offense to adapt, but Purdy's ability to distribute across a diverse receiving corps makes him well-suited for any personnel configuration Shanahan deploys.",
  },
  {
    name: "Christian McCaffrey",
    pos: "Running Back",
    number: 23,
    age: 30,
    years: 9,
    overview: "Christian McCaffrey is the San Francisco 49ers' superstar running back and the 2025 NFL Comeback Player of the Year. One of the most complete offensive players in professional football, McCaffrey combines elite rushing with perhaps the best receiving ability of any running back in NFL history. At 30, coming off a remarkable comeback season, McCaffrey remains the most important offensive weapon on one of the NFC's most dangerous rosters.",
    strengths: [
      "Receiving ability out of the backfield that is simply unmatched at the running back position — McCaffrey can line up in the slot, in the backfield, or in the wing position and create mismatches against any defensive alignment.",
      "After-catch production that regularly turns short completions into explosive gains through elusiveness, contact balance, and football instincts in the open field.",
      "Elite understanding of Shanahan's system built through multiple seasons studying and executing some of the most complex route combinations asked of a running back.",
      "Comeback season production that validated the physical recovery and confirmed that his elite level of play is still present.",
    ],
    weaknesses: [
      "Injury history is the dominant concern — McCaffrey missed significant time in the years before his comeback, and managing his durability across a full season is the primary challenge.",
      "Age at 30 means the explosive burst that once made him untouchable will continue to gradually diminish, requiring continued adjustments in how Shanahan uses him.",
    ],
    performance: "McCaffrey's 2025 comeback season was historic in context — returning from injury to lead the 49ers' offense while winning Comeback Player of the Year was a testament to his preparation and physical talent. His production as both a runner and receiver remains among the best of any skill position player in the conference.",
    impact: "McCaffrey's presence creates the ultimate pick-your-poison dilemma for defensive coordinators. Do they bring an extra defender into the box to stop his rushing production, knowing that leaves a linebacker in coverage against the best receiving back in the sport? There is no good answer, which is why the 49ers' offense is uniquely dangerous when he is on the field.",
    outlook: "McCaffrey enters 2026 as the 49ers' most irreplaceable player. A second consecutive healthy season would confirm his full recovery and make him a genuine MVP contender. At 30, every fully healthy season is increasingly precious, and Shanahan will manage his workload with the championship in mind.",
  },
  {
    name: "George Kittle",
    pos: "Tight End",
    number: 85,
    age: 31,
    years: 8,
    overview: "George Kittle is the San Francisco 49ers' legendary tight end and one of the most complete players at his position in NFL history. An all-time elite receiving tight end who is simultaneously one of the best blocking tight ends in the league, Kittle has been the heartbeat of the 49ers' offense and one of the most beloved players in professional football for nearly a decade.",
    strengths: [
      "Elite receiving ability in the intermediate and seam areas — Kittle's combination of route running, hands, and yards-after-catch production is among the best at the tight end position in history.",
      "Blocking ability that is genuinely elite — Kittle is rated annually as one of the best blocking tight ends in the league, a combination with his receiving that makes him uniquely dangerous.",
      "Explosive plays after the catch. Kittle regularly turns routine completions into 30-plus-yard gains through effort, elusiveness, and a physical running style.",
      "Leadership and energy that define the 49ers' identity. His enthusiasm is contagious and his competitive drive elevates everyone around him.",
    ],
    weaknesses: [
      "Injury history, including hamstring and knee issues, has interrupted seasons and forced the 49ers to manage his availability carefully.",
      "Age at 31 means the physical demands of Kittle's blocking-heavy role may require adjustments to extend his peak years.",
    ],
    performance: "Kittle has been one of the most productive tight ends in NFL history when healthy, combining elite statistics with blocking grades that no other receiving tight end in the sport can match. His impact on the 49ers' offense is so complete that he elevates both the run game and the passing game simultaneously.",
    impact: "Kittle's dual-threat ability as a blocker and receiver is the foundation of Shanahan's offensive identity. When Kittle is on the field, the 49ers can run outside zone effectively and throw to the seam on the same down, giving defenses an impossible choice on every snap.",
    outlook: "Kittle enters 2026 as one of the NFL's elite players and a future Hall of Famer still operating near his peak. A healthy season would likely produce another Pro Bowl appearance, and his presence gives Purdy the most reliable safety valve in the NFC.",
  },
  {
    name: "Nick Bosa",
    pos: "Defensive End",
    number: 97,
    age: 28,
    years: 7,
    overview: "Nick Bosa is the San Francisco 49ers' star defensive end and one of the most dominant pass rushers in professional football. A former Defensive Player of the Year and perennial All-Pro, Bosa enters 2026 on a comeback trail from an ACL injury suffered in the 2025 season. His recovery and return to full effectiveness will be the defining story of the 49ers' defensive aspirations.",
    strengths: [
      "Elite pass rush arsenal featuring a diverse set of moves — Bosa's combination of speed-to-power conversion, spin, and counter moves make him one of the most complete pass rushers in NFL history.",
      "Technical excellence refined through seven NFL seasons under Robert Saleh's coaching — Bosa's hand fighting and leverage are textbook standards at the defensive end position.",
      "Motor that never stops — Bosa's effort level and pursuit on every play makes him a threat to create disruption even on plays where he doesn't get a clean path to the quarterback.",
      "Football IQ that allows him to manipulate offensive tackle sets and exploit their tendencies in ways that go beyond raw athleticism.",
    ],
    weaknesses: [
      "ACL recovery from the 2025 injury creates genuine uncertainty about his effectiveness, particularly his explosion off the line and bend around the edge, which are the most ACL-dependent aspects of his game.",
      "Double-team attention is now standard against him, which can limit individual statistical production even when he is playing at a high level.",
    ],
    performance: "Bosa before the injury was the most dominant pass rusher in the NFC, generating pressure at an elite rate and winning individual battles against the AFC's best offensive tackles. The question for 2026 is how much of that ability survives the recovery process.",
    impact: "Bosa's impact on the 49ers' defense cannot be overstated. When he is healthy and explosive, San Francisco has one of the most threatening defensive fronts in professional football. His ability to win one-on-one against elite tackles disrupts the entire opposing offense's timing and confidence.",
    outlook: "The 2026 season is Bosa's chance to prove he has fully recovered from one of the most feared injuries in professional football. If he returns to pre-injury form in the second half of the season, the 49ers become one of the most dangerous playoff teams in the NFC. His health is their Super Bowl variable.",
  },
  {
    name: "Fred Warner",
    pos: "Linebacker",
    number: 54,
    age: 28,
    years: 7,
    overview: "Fred Warner is the San Francisco 49ers' All-Pro linebacker and the NFL's premier coverage linebacker. Ranked No. 54 on the NFL Top 100 Players of 2026, Warner combines elite athleticism, exceptional football intelligence, and the rare ability to cover receivers, tight ends, and running backs in man coverage that most linebackers in the league simply cannot attempt.",
    strengths: [
      "Coverage ability that is elite by any standard — Warner can match up against tight ends and even receivers in man coverage, a capability that gives the 49ers' defense matchup flexibility that no other linebacker in the league provides.",
      "Football IQ and pre-snap processing that allow him to anticipate plays before the snap, positioning himself for interceptions and pass breakups that other linebackers never get close to.",
      "Range and athleticism — Warner's ability to cover sideline to sideline in zone coverage keeps him involved in every play, even when the action initially goes away from him.",
      "Leadership and communication as the defensive signal caller, organizing the 49ers' complex defensive scheme with consistent excellence.",
    ],
    weaknesses: [
      "Physical run defense against NFL-caliber fullbacks and tight ends who use size to disengage him from blockers can be a matchup challenge given his frame.",
      "Pass rush contribution is limited — Warner is a coverage and run-defense player, not a blitzer.",
    ],
    performance: "Warner has been the best coverage linebacker in professional football for four consecutive seasons, earning recognition as the player who has redefined what the position can be in the modern NFL. His impact on the 49ers' defensive system is as significant as any non-edge-rusher in the conference.",
    impact: "Warner's coverage ability gives the 49ers' defensive coordinators the freedom to deploy creative schemes without the linebacker position becoming a liability. When Warner can cover the seam, the secondary can play aggressively on the outside, and that freedom generates turnovers and disrupted plays that define San Francisco's defensive identity.",
    outlook: "Warner enters 2026 as the best linebacker in professional football and one of the most important defensive players in the NFC. A healthy season should produce another All-Pro selection, and his continued excellence at 28 suggests several more peak years ahead.",
  },
  {
    name: "Mike Evans",
    pos: "Wide Receiver",
    number: 13,
    age: 33,
    years: 13,
    overview: "Mike Evans is the San Francisco 49ers' veteran wide receiver, a future Hall of Famer who joins Kyle Shanahan's system after a legendary career in Tampa Bay. The only receiver in NFL history to begin his career with ten consecutive 1,000-yard seasons, Evans brings elite red-zone dominance, contested-catch ability, and veteran savvy to a 49ers receiving corps rebuilding around him.",
    strengths: [
      "Red-zone and contested-catch ability that is simply the best the game has seen at his position — Evans' combination of size (6'5\"), leaping ability, and hand strength makes him virtually uncoverable in the end zone.",
      "Route running refinement built through 13 NFL seasons, adding the technical depth to complement his naturally elite physical tools.",
      "Veteran presence and professionalism that raises the standard for the entire receiving corps.",
    ],
    weaknesses: [
      "Age at 33 means his vertical athleticism and speed have declined, requiring more reliance on positioning and route running than in his peak years.",
      "Adjusting to a new system after 13 years in Tampa Bay will require time and patience.",
    ],
    performance: "Evans remains one of the most dominant red-zone receivers in professional football, even at 33. His production may shift from high-volume receiving to high-efficiency touchdown scoring, but his impact in scoring situations is undiminished.",
    impact: "Evans' arrival transforms the 49ers' red-zone offense. Opposing safeties cannot bracket both Kittle and Evans simultaneously, which creates easier looks for Purdy in scoring situations that the 49ers have not had in years.",
    outlook: "Evans enters 2026 with the opportunity to add a Super Bowl ring to a Hall of Fame career. A productive first season in San Francisco, particularly in the red zone and on big-game occasions, would be a fitting chapter in one of the most decorated receiving careers in NFL history.",
  },
  {
    name: "Christian Kirk",
    pos: "Wide Receiver",
    number: 13,
    age: 28,
    years: 8,
    overview: "Christian Kirk is the San Francisco 49ers' slot receiver and a key intermediate target in Kyle Shanahan's system. Known for his route running precision, reliable hands, and ability to generate yards after catch in the short area, Kirk gives Purdy a dependable target in the intermediate zone that Shanahan's scheme is built to exploit.",
    strengths: [
      "Precise route running in the slot that creates consistent separation against zone coverage defenders.",
      "Reliable hands and catch efficiency that give Purdy a safety valve on every possession.",
      "Yards after catch ability in the short area through quickness and change of direction.",
    ],
    weaknesses: [
      "Size limitations (5'11\") reduce his effectiveness in contested-catch situations and against physical press coverage.",
      "Deep-threat production is limited, keeping his role primarily to short and intermediate routes.",
    ],
    performance: "Kirk has been a quality slot receiver who maximizes his production through efficiency rather than volume. His ability to consistently be open on third down is his most valuable attribute in Shanahan's offense.",
    impact: "Kirk's slot production gives Purdy a reliable third-down option that extends drives and keeps scoring opportunities alive. His presence alongside Evans and Kittle creates coverage challenges that favor every receiver on the roster.",
    outlook: "Kirk enters 2026 as a reliable piece of the 49ers' receiving corps who will produce efficiently in his role. His production may not headline the offense, but his consistency will make him one of Purdy's most trusted targets in critical situations.",
  },
  {
    name: "Ricky Pearsall",
    pos: "Wide Receiver",
    number: 14,
    age: 24,
    years: 2,
    overview: "Ricky Pearsall is the San Francisco 49ers' developing wide receiver, a former first-round pick who brings athleticism and speed to a receiving corps in transition. After overcoming the adversity of a shooting incident during training camp in his rookie year, Pearsall enters 2026 healthy and motivated to establish himself as a legitimate starting receiver in Shanahan's system.",
    strengths: [
      "Elite athleticism and speed that create vertical threat opportunities on go routes and crossing patterns.",
      "Ball tracking and catch radius that allow him to make difficult catches in tight coverage.",
      "Mental toughness demonstrated through his recovery from adversity in his first professional season.",
    ],
    weaknesses: [
      "Route running precision against veteran NFL cornerbacks is still developing.",
      "Consistency and production over a full season is still being established.",
    ],
    performance: "Pearsall's best football remains ahead of him, and the 49ers believe his ceiling is significantly higher than his production to date would suggest. His speed and athleticism are genuine assets that Shanahan's scheme can exploit.",
    impact: "Pearsall's development into a reliable receiver would significantly enhance the 49ers' offensive versatility. As a younger option alongside the veteran Evans and Kirk, his emergence would give San Francisco a complete receiving corps at multiple age levels.",
    outlook: "Pearsall enters 2026 with the opportunity to make the jump from promising second-year player to legitimate starter. A productive season would validate the 49ers' first-round investment and give Purdy another quality option in critical situations.",
  },
  {
    name: "Osa Odighizuwa",
    pos: "Defensive Tackle",
    number: 96,
    age: 26,
    years: 5,
    overview: "Osa Odighizuwa is the San Francisco 49ers' starting defensive tackle, a versatile interior defender who joins the team's defensive front as one of the key additions of their offseason rebuild. Odighizuwa brings interior pass rush ability, run-stopping physicality, and the kind of positional versatility that fits Kyle Shanahan's multiple defensive alignments.",
    strengths: [
      "Interior pass rush quickness that creates consistent pressure on passing downs.",
      "Run-stopping physicality and leverage at the point of attack.",
      "Versatility across the defensive front to play multiple techniques.",
    ],
    weaknesses: [
      "Adjusting to a new defensive system after his time in Dallas will require time.",
      "Consistency sustaining elite production over a full 17-game season.",
    ],
    performance: "Odighizuwa has been a productive interior defender who brings specific skills that the 49ers' defensive front needed after losing depth at the position. His pass rush ability from inside gives Nick Bosa better opportunities outside.",
    impact: "Odighizuwa's interior presence ensures that even when Bosa is doubled, the 49ers' pass rush doesn't collapse. His ability to create interior pressure independently elevates the entire defensive front.",
    outlook: "Odighizuwa enters 2026 as an important piece of the 49ers' defensive rebuild. A productive season alongside Bosa would give San Francisco one of the most complete defensive fronts in the NFC.",
  },
  {
    name: "Nate Hobbs",
    pos: "Cornerback",
    number: 39,
    age: 26,
    years: 5,
    overview: "Nate Hobbs is the San Francisco 49ers' slot cornerback, a physical and technically sound defensive back who joins from Las Vegas to anchor San Francisco's interior coverage. Hobbs' ability to press slot receivers and generate turnovers from the nickel position gives the 49ers' secondary a versatile and reliable piece in the middle of the field.",
    strengths: [
      "Physical press coverage technique that disrupts the timing of slot receivers across the middle of the field.",
      "Ball production instincts that have led to turnovers throughout his career.",
      "Reliability and consistency that make him a trusted piece in a complex defensive system.",
    ],
    weaknesses: [
      "Speed limitations against the very fastest slot receivers in the league.",
      "Adjusting to a new defensive system and new teammates in 2026.",
    ],
    performance: "Hobbs has been one of the better slot corners in the AFC, and his transition to the NFC with San Francisco gives the 49ers a proven answer at a position that had been a question mark.",
    impact: "Hobbs' slot coverage ability frees the 49ers' outside corners to play more aggressively, knowing the middle of the field is secured. His presence elevates the entire secondary's ability to operate in man and zone coverage.",
    outlook: "Hobbs enters 2026 with the opportunity to establish himself as one of the better nickel corners in the NFC. His experience and technique make him a reliable piece of a secondary that needs to perform at a high level to support a defense in transition.",
  },
];

function generatePlayerPost(player: NinersPlayer) {
  const slug = slugify(`san-francisco-49ers-${player.name}-player-profile-2026`, {
    lower: true, strict: true,
  });

  const title = `${player.name} — San Francisco 49ers ${player.pos} | 2026 Player Profile & Analysis`;
  const excerpt = `Complete 2026 player profile for San Francisco 49ers ${player.pos} ${player.name}. Strengths, weaknesses, performance analysis, and season outlook under head coach Kyle Shanahan.`;

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

<h2>Impact on the 49ers</h2>
<p>${player.impact}</p>

<h2>2026 Season Outlook</h2>
<p>${player.outlook}</p>

<p><em>Analysis based on the 2026 San Francisco 49ers roster and the offensive system installed by head coach Kyle Shanahan.</em></p>
`.trim();

  const tags = [
    "San Francisco 49ers",
    "49ers",
    "Niners",
    player.name,
    player.pos,
    "49ers Player Profile",
    "NFL Player Analysis",
    "2026 NFL Season",
    "Kyle Shanahan",
    "NFC West",
  ];

  return {
    slug,
    title,
    excerpt,
    content,
    author: "NFL Predictions Hub Staff",
    tags,
    published: true,
    metaTitle: `${player.name} | San Francisco 49ers ${player.pos} Profile 2026 — NFL Predictions Hub`,
    metaDescription: excerpt,
  };
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  let created = 0;
  let skipped = 0;

  for (const player of NINERS_ROSTER) {
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
