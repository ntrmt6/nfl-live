/**
 * Generates one unique blog post per Cincinnati Bengals player.
 * Run: npx tsx scripts/generate-bengals-player-posts.ts
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

// ── Bengals roster ────────────────────────────────────────────────────────────

interface BengalsPlayer {
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

const BENGALS_ROSTER: BengalsPlayer[] = [
  {
    name: "Joe Burrow",
    pos: "Quarterback",
    number: 9,
    age: 29,
    years: 6,
    overview: "Joe Burrow is the Cincinnati Bengals' elite franchise quarterback and the best pocket passer in the AFC. Returning from a significant wrist surgery that ended his 2023 season, Burrow has fully recaptured the laser-accurate, methodical passing game that made him one of the most dangerous quarterbacks in professional football. Under Zac Taylor, Burrow has transformed the Bengals into perennial AFC contenders with his rare combination of accuracy, poise, and the unshakeable confidence of a player who has already reached a Super Bowl.",
    strengths: [
      "Elite pocket passing accuracy that ranks among the best in the NFL — Burrow's ability to deliver the ball to precise locations on timing routes is genuinely best-in-class.",
      "Exceptional processing speed that allows him to identify coverages pre-snap and redirect the offense with the kind of clarity that separates great quarterbacks from good ones.",
      "Deep-ball precision that is among the best in the AFC — his connection with Ja'Marr Chase on post and go routes is one of the most dangerous passing combinations in professional football.",
      "Poise under pressure that is a defining characteristic — Burrow thrives in two-minute situations and high-leverage moments where the best quarterbacks separate from the field.",
    ],
    weaknesses: [
      "Wrist surgery recovery requires monitoring — any signs of reduced velocity or mechanical compensation could indicate lingering effects that need to be managed carefully.",
      "Offensive line protection has been a persistent concern throughout his career, and Burrow absorbs more sacks and hits than a quarterback of his caliber should.",
      "When the offensive line collapses, Burrow's passing efficiency declines significantly — he needs pocket integrity to operate at his elite level.",
    ],
    performance: "Burrow's pre-injury performance firmly established him as the best quarterback in the AFC — posting some of the highest passer ratings and most efficient passing seasons in Bengals history. His return from wrist surgery has been watched carefully, and early indications suggest his accuracy, velocity, and command of the offense are fully intact.",
    impact: "Burrow is the reason the Bengals are relevant every season. His ability to single-handedly elevate the performance of every receiver, tight end, and running back around him through accuracy, decision-making, and leadership makes Cincinnati's offense among the most efficient in the AFC regardless of defensive game plan.",
    outlook: "Burrow enters 2026 with a full season of post-surgery recovery behind him and a supporting cast — Chase, Higgins, Brown, and Hendrickson on defense — that is arguably the best of his career. If healthy, he is the favorite to be the best quarterback in the AFC and a legitimate MVP contender who gives Cincinnati a Super Bowl ceiling.",
  },
  {
    name: "Ja'Marr Chase",
    pos: "Wide Receiver",
    number: 1,
    age: 25,
    years: 5,
    overview: "Ja'Marr Chase is the Cincinnati Bengals' generational wide receiver and arguably the best receiver in professional football. The LSU connection with Joe Burrow that began in college has translated seamlessly to the NFL, where Chase has established himself as the most complete receiver of his generation — combining elite separation ability, contested-catch mastery, and yards-after-catch production that makes him impossible to reliably cover.",
    strengths: [
      "Generational separation ability that works against man coverage, zone coverage, and every coverage concept in between — Chase creates open windows that other receivers cannot find.",
      "Contested-catch king who wins more 50-50 balls than any receiver in the AFC — his hand strength, body control, and tracking ability at the highest point make him an unstoppable red-zone weapon.",
      "LSU chemistry with Burrow that predates their NFL careers — the timing, trust, and anticipation between the two is at a level that typically takes NFL receivers years to develop.",
      "Yards after catch production that ranks among the best receivers in professional football — Chase's elusiveness after the reception extends routine completions into explosive plays.",
    ],
    weaknesses: [
      "As the clear number-one option, defenses routinely dedicate their best corner and bracket coverage to eliminating him, which creates consistency variance in raw numbers.",
      "Physicality at the line of scrimmage against elite press corners who can disrupt his release timing occasionally affects his production in individual games.",
    ],
    performance: "Chase has produced at an All-Pro level since his rookie season, delivering some of the most statistically impressive campaigns in recent Bengals history. His partnership with Burrow has generated one of the most productive quarterback-receiver connections in the AFC, and his evolution as a complete receiver has only accelerated each season.",
    impact: "Chase's impact on the Bengals' offense is total — every route he runs, covered or uncovered, changes how defenses allocate their resources. When defenses commit to stopping him, Tee Higgins and the remainder of the passing game operate in single coverage. No defensive scheme has consistently neutralized him.",
    outlook: "Chase enters 2026 as the frontrunner for the NFL's top receiving honor and a legitimate Offensive Player of the Year candidate. With Burrow healthy and Higgins alongside him, the Bengals have the best passing attack in the AFC, and Chase is its most dangerous weapon. A healthy 2026 season will produce statistics that cement his status as the best receiver of his generation.",
  },
  {
    name: "Tee Higgins",
    pos: "Wide Receiver",
    number: 5,
    age: 26,
    years: 5,
    overview: "Tee Higgins is the Cincinnati Bengals' number-two receiver and one of the best big-bodied possession receivers in professional football. Operating alongside Ja'Marr Chase, Higgins has established himself as a legitimate WR1-caliber talent who simply plays on a team where he cannot be the primary option — a situation that consistently benefits the Bengals' entire offense by providing Burrow two elite receiving threats simultaneously.",
    strengths: [
      "Big-body receiver profile at 6'4\" who wins physically in contested situations against any coverage — Higgins cannot be held off the ball by smaller corners in physical matchups.",
      "Red-zone dominance that complements Chase's presence — with two elite receivers in goal-to-go situations, Cincinnati has an unstoppable offensive advantage.",
      "Reliable possession receiver who consistently produces first downs and conversions on third down, giving Burrow a dependable option in critical situations.",
      "Route running precision that has improved each season, making him more than just a physical possession receiver.",
    ],
    weaknesses: [
      "Top-end speed is below the elite level of Chase, which limits some vertical route effectiveness against elite cornerbacks who can recover.",
      "Production can fluctuate based on defensive coverage allocation — when Chase draws all the attention, Higgins' volume can be inconsistent.",
      "Injury history has included some missed games that remind the roster of his durability as a concern.",
    ],
    performance: "Higgins has consistently produced at a level that would make him the number-one receiver on most NFL rosters. His ability to perform at that level while playing second fiddle to Chase is a reflection of his professionalism and the depth of Cincinnati's receiving corps. His red-zone production and third-down conversion rate have been excellent.",
    impact: "Higgins gives Burrow a second elite option that makes the Bengals' passing game impossible to defend with conventional coverage. When defenses bracket Chase, Higgins operates in single coverage against the team's second-best corner — a matchup Cincinnati wins consistently.",
    outlook: "Higgins enters 2026 as one of the most valuable number-two receivers in professional football. His partnership with Chase and Burrow gives Cincinnati an offensive ceiling that few AFC teams can match, and a fully healthy Higgins is the second piece needed to make that ceiling a reality.",
  },
  {
    name: "Chase Brown",
    pos: "Running Back",
    number: 30,
    age: 24,
    years: 3,
    overview: "Chase Brown is the Cincinnati Bengals' breakout running back and the player who has emerged as the team's first genuine ground game threat in several seasons. After posting his first career 1,000-yard season in a true breakout campaign, Brown has established himself as a three-down back capable of carrying Cincinnati's run game while providing Burrow with a quality receiving option in the backfield.",
    strengths: [
      "Explosive first step and cutting ability that consistently generates yards through the line of scrimmage on inside and outside zone runs.",
      "Three-down capability including receiving production out of the backfield — Brown is comfortable running routes and is a reliable target in the flat and on wheel routes.",
      "Burst through the hole that has produced runs that shift field position and create momentum swings the Bengals' offense needs.",
      "Workhorse mentality and physical conditioning that allows him to handle a true bell-cow workload.",
    ],
    weaknesses: [
      "Pass protection against elite blitzers is still developing — Burrow's safety on designed blitz packages occasionally requires substitution.",
      "Top-end speed in the open field, while adequate, is not elite — Brown relies on quickness and cuts rather than outrunning defenders.",
      "Consistency against run-first defensive coordinators who load the box to eliminate the ground game.",
    ],
    performance: "Brown's breakout season validated the organizational belief in him as a featured back. His ability to generate consistent yards, complement the passing game, and provide a genuine ground threat that forces defenses to commit defenders near the line of scrimmage has transformed the Bengals' offensive identity.",
    impact: "Brown's impact on Cincinnati's offense is in creating the balanced attack that makes Burrow's play-action passing more dangerous. When defenses cannot ignore the running game, the coverage shell relaxes in ways that Chase and Higgins exploit. Brown's effectiveness as a runner is a prerequisite for the Bengals' offense reaching its ceiling.",
    outlook: "Brown enters 2026 as one of the AFC's most important young running backs. A second consecutive 1,000-yard season would confirm his status as a franchise-caliber back, and with Burrow healthy and Chase demanding coverage, Brown has the best possible conditions to post career-high production.",
  },
  {
    name: "Mike Gesicki",
    pos: "Tight End",
    number: 88,
    age: 29,
    years: 7,
    overview: "Mike Gesicki is the Cincinnati Bengals' starting tight end and a large receiving threat who brings red-zone danger and intermediate production to a passing game already stacked with elite options. A classic move tight end who aligns in multiple formations, Gesicki gives Burrow another mismatch weapon that defensive coordinators must account for in the coverage.",
    strengths: [
      "Exceptional size (6'6\") that creates height mismatches against linebackers and safeties in the red zone and on seam routes.",
      "Receiving specialist whose route running from the slot and as a move tight end generates quality separation against interior defenders.",
      "Seven seasons of professional experience provide the situational understanding to find open windows in complex coverage schemes.",
    ],
    weaknesses: [
      "Blocking as an in-line tight end is a known limitation — Gesicki is primarily a receiving specialist whose blocking contribution is below the standard of a complete tight end.",
      "Against elite over-the-top safeties who can match his size with range, his separation can be neutralized.",
      "Target competition from Chase, Higgins, and Brown limits his volume regardless of his individual effectiveness.",
    ],
    performance: "Gesicki has been a productive receiving tight end who provides Burrow with a reliable red-zone option and intermediate target. His presence forces defensive coordinators to address his mismatch potential even as they prepare for Chase and Higgins, adding a layer of complexity to coverage planning.",
    impact: "Gesicki's impact is in the red zone, where his size and soft hands give Burrow a target that is genuinely difficult to defend in goal-to-go situations. His presence alongside Chase and Higgins makes Cincinnati's red-zone offense among the most difficult to defend in the AFC.",
    outlook: "Gesicki enters 2026 as an important receiving complement whose role is clearly defined. His red-zone production and intermediate reliability should continue as long as Burrow is healthy, making him a steady contributor to one of the best passing attacks in the conference.",
  },
  {
    name: "Andrei Iosivas",
    pos: "Wide Receiver",
    number: 80,
    age: 25,
    years: 2,
    overview: "Andrei Iosivas is the Cincinnati Bengals' developing third receiver and one of the more intriguing background stories in professional football. A Princeton graduate bringing academic excellence to match his athletic potential, Iosivas has been developing his game behind Chase and Higgins while working to establish himself as a reliable third option in Zac Taylor's offense.",
    strengths: [
      "Athletic profile that includes genuine speed and agility developed through a combination of elite academics and physical training.",
      "Football intelligence developed through Princeton's program that allows him to process coverages and execute assignments at a high level.",
      "Youth at 25 with continued developmental upside as he accumulates NFL reps against professional defensive backs.",
    ],
    weaknesses: [
      "Limited NFL experience competing against the level of defensive back talent in the AFC creates ongoing adjustment challenges.",
      "Target volume behind Chase and Higgins severely limits his opportunity to establish rhythm and consistency.",
      "Route precision and separation creation against veteran corners are still developing through professional competition.",
    ],
    performance: "Iosivas has been working his way into the Bengals' rotation as a developing third receiver. His athletic tools and intelligence give him a path to a larger role, but the presence of Chase and Higgins means his opportunity has been limited.",
    impact: "Iosivas provides the Bengals with a depth receiver who can be trusted to execute specific route concepts without major errors. His presence on the roster gives Zac Taylor coverage options in four-wide formations.",
    outlook: "Iosivas enters 2026 with an opportunity to expand his role as a genuine third option. His continued development behind two elite receivers is a legitimate advantage — learning from Chase and Higgins provides an education in receiver play that most developing receivers never access.",
  },
  {
    name: "Samaje Perine",
    pos: "Running Back",
    number: 34,
    age: 30,
    years: 8,
    overview: "Samaje Perine is the Cincinnati Bengals' veteran passing-down back and trusted complementary piece alongside Chase Brown. After eight professional seasons, Perine brings the reliability, intelligence, and situational expertise that make him one of the more valuable backup running backs in the AFC.",
    strengths: [
      "Elite situational football intelligence built through eight professional seasons — Perine understands his role, the offense's needs, and how to execute without error.",
      "Receiving ability out of the backfield that is above average — Perine is a trusted checkdown option for Burrow in third-down situations.",
      "Pass protection proficiency that is among the better standards for running backs in the AFC.",
    ],
    weaknesses: [
      "Age at 30 has reduced his explosiveness between the tackles compared to his peak years.",
      "Role as a complementary back limits his fantasy and statistical production even when healthy.",
    ],
    performance: "Perine has been the ideal veteran complement to Brown — providing rest, handling passing-down responsibilities, and offering a steady option whose production doesn't vary dramatically based on game situation.",
    impact: "Perine's reliability allows the Bengals to use Brown as a workhorse without burning him out over a full season. His third-down pass protection gives Burrow clean pockets in the situations where protecting the quarterback is most critical.",
    outlook: "Perine enters 2026 in a clearly defined but important role. His veteran presence and situational reliability are exactly what a Super Bowl-caliber offense needs behind its featured back.",
  },
  {
    name: "Joe Flacco",
    pos: "Quarterback",
    number: 15,
    age: 41,
    years: 17,
    overview: "Joe Flacco is the Cincinnati Bengals' veteran backup quarterback and the most experienced insurance policy in the AFC. A Super Bowl champion who has maintained his arm and football intelligence deep into his 40s, Flacco provides the Bengals with the highest-quality backup quarterback available should anything happen to Burrow.",
    strengths: [
      "17 seasons of professional experience including Super Bowl victory — Flacco has been in virtually every possible game situation and handled them successfully.",
      "Arm talent that has held up remarkably well — Flacco can still make every throw required by an NFL offense, particularly the deep ball.",
      "Pocket presence and poise that come only from a career of starting at the highest level of professional football.",
    ],
    weaknesses: [
      "Mobility at 41 is essentially zero — Flacco must be protected against pressure, and designed QB runs are not part of any game plan involving him.",
      "Age-related limitations mean this is likely the final season he can serve as a quality backup.",
    ],
    performance: "Flacco's recent history of stepping in for injured starters and performing at starter quality is one of the more remarkable accomplishments of any backup quarterback in recent NFL history. His ability to maintain efficiency and produce wins in relief situations is a genuine advantage.",
    impact: "Flacco's impact is entirely contingent on Burrow's health. If Burrow stays healthy, Flacco's value is in veteran leadership and mentorship. If Burrow misses time, Flacco is one of the few backups in the league who can keep a playoff-caliber team competitive.",
    outlook: "Flacco enters 2026 as the most experienced backup in professional football. His presence gives the Bengals an option that most teams would be thrilled to have as a starter, and his insurance value for a Burrow-centric offense cannot be overstated.",
  },
  {
    name: "Trey Hendrickson",
    pos: "Defensive End",
    number: 91,
    age: 30,
    years: 8,
    overview: "Trey Hendrickson is the Cincinnati Bengals' elite edge rusher and one of the most productive pass rushers in the AFC. A perennial sack leader who has established himself as the premier edge defender in the division, Hendrickson brings the relentless motor, technical precision, and competitive intensity that have made him a consistent double-digit sack threat.",
    strengths: [
      "Elite sack production that consistently ranks among the AFC's best — Hendrickson has been a 10-plus sack performer in multiple seasons, generating pressure at a rate that demands offensive coordinator attention.",
      "Diverse and sophisticated pass-rush repertoire including speed-to-power, spin, and rip moves that work against every offensive tackle technique.",
      "Motor and effort level that produce disruption beyond recorded statistics — Hendrickson's presence changes blocking assignments and protection schemes from the first play of the game.",
      "Veteran leadership on a defense that needs a captain-level player to anchor its identity.",
    ],
    weaknesses: [
      "Run defense has been inconsistently stout — Hendrickson's value is concentrated in pass-rush situations, and dedicated run teams can limit his impact.",
      "At 30, managing his workload and maintaining peak explosiveness over a full 17-game season becomes increasingly important.",
      "Defenses that chip him with tight ends and running backs can reduce his pressure production in obvious passing situations.",
    ],
    performance: "Hendrickson has been the most productive defensive player in Bengals history over the last several seasons. His sack totals, pressure rates, and game-impact statistics have been consistently elite, and his ability to produce against the best offensive tackles in the AFC has firmly established him as one of the top pass rushers in conference history.",
    impact: "Hendrickson's ability to generate pressure from one edge forces offensive coordinators to direct protection resources specifically at him, creating one-on-one opportunities for Sam Hubbard on the opposite side. His presence is the foundation of the Bengals' defensive pass-rush identity and the reason Cincinnati can generate consistent quarterback pressure.",
    outlook: "Hendrickson enters 2026 as the frontrunner for AFC defensive player of the year honors and one of the two or three most feared edge rushers in professional football. His continued presence alongside Hubbard gives the Bengals a pass-rush combination that any AFC offense must solve as the first priority of their game plan preparation.",
  },
  {
    name: "Sam Hubbard",
    pos: "Defensive End",
    number: 94,
    age: 29,
    years: 7,
    overview: "Sam Hubbard is the Cincinnati Bengals' veteran edge defender and Trey Hendrickson's partner in one of the AFC's most productive pass-rush pairings. A Pro Bowl performer who has delivered some of the most memorable defensive plays in Bengals history — including a critical fumble return — Hubbard brings professional-grade edge rushing to complement Hendrickson's elite production.",
    strengths: [
      "Pro Bowl-caliber edge rushing production that would be the focal point of any defensive front without Hendrickson present — Hubbard is a top-12 edge rusher in the AFC.",
      "Veteran technique and understanding of offensive pass protection schemes built through seven professional seasons.",
      "Big-play ability and the demonstrated capacity to deliver in the highest-pressure situations — Hubbard's most memorable plays have come at the most critical moments.",
    ],
    weaknesses: [
      "Target of additional protection resources when defenses commit chip blocks to the Hendrickson side, which can reduce his individual production.",
      "At 29 entering the back half of his prime, maintaining peak explosiveness requires conditioning management.",
    ],
    performance: "Hubbard's partnership with Hendrickson has produced one of the most feared pass-rushing combinations in the AFC, and his individual production has been consistently at the Pro Bowl level. His ability to generate pressure from the opposite edge is the critical second element that makes Cincinnati's pass rush truly elite.",
    impact: "Hubbard's impact is inseparable from his partnership with Hendrickson. The two working simultaneously from opposite edges create a pressure problem that no single protection adjustment can solve — teams that slide protection toward Hendrickson leave Hubbard in one-on-one matchups he wins consistently.",
    outlook: "Hubbard enters 2026 as one of the most important defensive players in the AFC North. His continued production alongside Hendrickson gives the Bengals the best edge-rushing combination in the division, and his veteran leadership within the defensive unit elevates the performance of every player alongside him.",
  },
];

// ── Content generator ─────────────────────────────────────────────────────────

function generatePlayerPost(player: BengalsPlayer) {
  const slug = slugify(`cincinnati-bengals-${player.name}-player-profile-2026`, {
    lower: true, strict: true,
  });

  const title = `${player.name} — Cincinnati Bengals ${player.pos} | 2026 Player Profile & Analysis`;
  const excerpt = `Complete 2026 player profile for Cincinnati Bengals ${player.pos} ${player.name}. Strengths, weaknesses, performance analysis, and season outlook under head coach Zac Taylor.`;

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

<h2>Impact on the Bengals</h2>
<p>${player.impact}</p>

<h2>2026 Season Outlook</h2>
<p>${player.outlook}</p>

<p><em>Analysis based on the 2026 Cincinnati Bengals roster and the system installed by head coach Zac Taylor.</em></p>
`.trim();

  const tags = [
    "Cincinnati Bengals",
    "Bengals",
    "AFC North",
    player.name,
    player.pos,
    "Bengals Player Profile",
    "NFL Player Analysis",
    "2026 NFL Season",
    "Zac Taylor",
  ];

  return {
    slug,
    title,
    excerpt,
    content,
    author: "NFL Predictions Hub Staff",
    tags,
    published: true,
    metaTitle: `${player.name} | Cincinnati Bengals ${player.pos} Profile 2026 — NFL Predictions Hub`,
    metaDescription: excerpt,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  let created = 0;
  let skipped = 0;

  for (const player of BENGALS_ROSTER) {
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
