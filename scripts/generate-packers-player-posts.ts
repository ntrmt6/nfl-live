/**
 * Generates one unique blog post per Green Bay Packers player.
 * Run: npx tsx scripts/generate-packers-player-posts.ts
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

// ── Packers roster ────────────────────────────────────────────────────────────

interface PackersPlayer {
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

const PACKERS_ROSTER: PackersPlayer[] = [
  {
    name: "Jordan Love",
    pos: "Quarterback",
    number: 10,
    age: 27,
    years: 5,
    overview: "Jordan Love is the Green Bay Packers' franchise quarterback and a player who has fully emerged from Aaron Rodgers' shadow to establish his own identity as one of the NFC's rising signal-callers. After years of development behind one of the greatest quarterbacks in history, Love has delivered on the promise that made Green Bay trade up for him, showing improved accuracy, growing dual-threat ability, and the poise of a quarterback who is just entering his prime.",
    strengths: [
      "Dramatically improved accuracy in the short and intermediate areas — Love has refined the mechanics that were raw during his developmental years and now executes Matt LaFleur's system with precision.",
      "Emerging as a genuine dual-threat, adding a running dimension that LaFleur can exploit in bootlegs and designed quarterback runs that the offense couldn't run under Rodgers.",
      "Deep ball accuracy that was always a natural gift — Love can make throws Rodgers routinely made, and the added confidence of being the undisputed franchise quarterback has unlocked his consistency.",
      "Pre-snap processing and decisiveness have improved each season, allowing him to operate efficiently in LaFleur's complex motion-based system.",
    ],
    weaknesses: [
      "Consistency over the course of a full 17-game season is still proving itself — Love has shown the ability to be elite in stretches but must sustain that level.",
      "Still developing the complete command of defensive coverages that only comes with extensive starting experience at the highest level.",
      "When his mechanics slip under pressure, he can miss throws that he makes cleanly in clean pockets — protecting him remains an offensive line priority.",
    ],
    performance: "Love has produced some of the most impressive offensive stretches the Packers have seen since the height of the Rodgers era. His chemistry with Jayden Reed and Christian Watson has generated an explosive offense, and the addition of Micah Parsons on defense has freed the offense to take calculated risks knowing the defense can win on its own.",
    impact: "Love's emergence as a legitimate franchise quarterback validates the Packers' controversial decision to move on from Rodgers. He gives LaFleur the young, athletic quarterback the system was always designed for — a player who can extend plays with his legs while delivering accurate passes at every level.",
    outlook: "Love enters 2026 as one of the most exciting quarterbacks in the NFC. With Parsons on defense eliminating any pressure to be perfect every game, and an offensive supporting cast that includes Jacobs, Watson, and Reed, Love is positioned for the best statistical season of his career. He is a legitimate MVP candidate if everything falls into place.",
  },
  {
    name: "Josh Jacobs",
    pos: "Running Back",
    number: 8,
    age: 27,
    years: 7,
    overview: "Josh Jacobs is the Green Bay Packers' workhorse running back and the 2023 rushing champion who has established himself as one of the premier ball carriers in the NFC. A physical, decisive runner who consistently produces above his carry average, Jacobs gives LaFleur's offense the ground game foundation that makes the play-action passing game function at its highest level.",
    strengths: [
      "Elite contact balance and ability to break first and second tackles — Jacobs consistently generates yards after contact that rank among the best running backs in the NFC.",
      "2023 rushing champion with a 1,000-yard season that proved his workhorse ability when given the proper offensive line support.",
      "Three-down capability including solid receiving and pass protection, making him an every-down back who doesn't leave the field in obvious passing situations.",
      "Football IQ and vision behind the line of scrimmage allow him to cut decisively and hit gaps before they close.",
    ],
    weaknesses: [
      "Durability over a full 17-game season has shown some concern — Jacobs has dealt with lower-body injuries that have limited his availability.",
      "Top-end speed is not elite, meaning that when initial blockers are defeated, the long run potential is lower than the most explosive backs in the league.",
      "Pass protection against elite pass rushers is adequate but not exceptional — Love's blindside must be protected carefully.",
    ],
    performance: "Jacobs has been one of the most productive running backs in the NFC since arriving in Green Bay, with his physical running style and three-down utility giving LaFleur consistent ground game production. His presence as a legitimate 1,000-yard threat forces defenses to commit resources against the run.",
    impact: "Jacobs is the engine of Green Bay's run game and the foundation of Love's play-action passing attack. When Jacobs is productive, the Packers' entire offense operates more efficiently — defenders who commit to stopping him create the coverage mismatches that Love exploits with Watson and Reed.",
    outlook: "Jacobs enters 2026 as a Pro Bowl-caliber running back with the opportunity to deliver his best professional season. The Packers' offensive line and LaFleur's zone-blocking scheme are ideally suited to his strengths, and with Parsons eliminating defensive attention from the offense, Jacobs should see favorable box counts throughout the season.",
  },
  {
    name: "Christian Watson",
    pos: "Wide Receiver",
    number: 9,
    age: 25,
    years: 4,
    overview: "Christian Watson is the Green Bay Packers' number-one wide receiver and one of the most electric speed threats at the position in the NFC. A former second-round pick who has developed into Love's primary deep-ball target, Watson combines rare straight-line speed with improving route running to create a receiver the Packers can build their passing game around.",
    strengths: [
      "Elite speed that ranks among the fastest receivers in the NFC — Watson can run by any cornerback in the league on go routes and double moves, demanding safety attention on every snap.",
      "Explosive big-play ability that has produced some of the most memorable touchdowns in recent Packers history, including game-breaking long scores that change momentum.",
      "Emerging as a true WR1 with the expanded route tree and catching consistency that justifies top receiver usage.",
      "Growing chemistry with Love on the deep ball — their timing on post and fly routes is one of the most dangerous duos in the NFC.",
    ],
    weaknesses: [
      "Injury history has been a concern — Watson has missed time in multiple seasons, and his availability is critical to the Packers' offensive ceiling.",
      "Consistency in the short and intermediate areas is still developing — Watson is most dangerous on vertical routes rather than the complete route tree.",
      "Contested-catch production in traffic needs continued development for him to truly become an elite every-down receiver.",
    ],
    performance: "Watson has been the Packers' most explosive offensive player and the receiver defenses fear most in coverage. His ability to score from anywhere on the field gives LaFleur a legitimate game-breaking threat, and the growing precision of his route running has made him harder to defend even when opponents know the deep ball is coming.",
    impact: "Watson forces safety rotation over the top on every play, which opens the underneath and intermediate areas that Reed and Jacobs exploit consistently. His presence as a vertical threat changes how defenses allocate their coverage resources against the Packers more dramatically than any other offensive player.",
    outlook: "Watson enters 2026 as one of the most exciting breakout candidates in the NFC. With Love developing, Jacobs setting up play-action, and Parsons removing defensive pressure from the offense, Watson is positioned for a 1,200-yard season and double-digit touchdowns that could earn him his first Pro Bowl invitation.",
  },
  {
    name: "Jayden Reed",
    pos: "Wide Receiver",
    number: 11,
    age: 25,
    years: 3,
    overview: "Jayden Reed is the Green Bay Packers' slot receiver and Jordan Love's most reliable target across three professional seasons. A quick-twitch route runner who generates consistent production in the underneath and intermediate areas, Reed has developed into the security blanket that allows Love to operate with confidence in LaFleur's complex passing concepts.",
    strengths: [
      "Elite short-area quickness in the slot — Reed's burst off the line and sharp route breaks create consistent separation against zone and man coverage.",
      "Love's most reliable and trusted receiver, providing a consistent target in high-pressure moments when the quarterback needs a safe, effective option.",
      "YAC production after the catch is excellent — Reed regularly extends plays by making defenders miss in the open field.",
      "Consistency and reliability that make him the most dependable receiver in a wide receiver corps with significant upside elsewhere.",
    ],
    weaknesses: [
      "Outside receiver production when moved to the boundary is more limited than his elite slot numbers suggest.",
      "Size limitations create contested-catch vulnerabilities against bigger defenders in traffic.",
      "Target volume can fluctuate based on defensive coverage attention and game script.",
    ],
    performance: "Reed has been the most consistent receiving threat in Green Bay's offense, generating reliable production on short and intermediate routes that keep drives alive and create explosive plays when he gets to open space. His efficiency metrics — yards per route run, catch rate — rank among the best slot receivers in the NFC.",
    impact: "Reed is the floor of the Packers' passing game and the player who makes the entire offense function on third down. When defenses commit coverage resources to Watson's deep routes and Jacobs' checkdowns, Reed finds open windows in the intermediate areas that Love hits consistently.",
    outlook: "Reed enters 2026 as a legitimate Pro Bowl-caliber slot receiver whose consistent production should be rewarded. Another season as Love's top target could result in the highest receiving totals of his career, and his chemistry with the quarterback gives Green Bay a reliable connection they can count on in every game situation.",
  },
  {
    name: "Matthew Golden",
    pos: "Wide Receiver",
    number: 17,
    age: 22,
    years: 1,
    overview: "Matthew Golden is the Green Bay Packers' 2026 rookie wide receiver and a speedy addition to an already talented receiving corps. At 22, Golden arrives with the athletic profile that has made teams excited about his long-term upside, providing LaFleur with another speed option to complement Watson's vertical ability.",
    strengths: [
      "Elite speed that immediately qualifies him as a legitimate deep threat and a player defenses must account for on every snap.",
      "Athletic profile designed for the modern passing game — Golden's quickness and separation ability fit naturally in LaFleur's motion-based concepts.",
      "Youth and developmental upside — at 22 in his first professional season, Golden is just beginning his growth trajectory.",
    ],
    weaknesses: [
      "NFL experience is zero, creating the inevitable learning curve in route precision, coverage recognition, and professional competition.",
      "Route running refinement and play recognition against sophisticated defensive schemes are areas requiring significant development.",
      "Establishing himself in an already talented receiving corps alongside Watson and Reed creates a high bar for immediate impact.",
    ],
    performance: "Golden is in the developmental phase of his career. His 2026 performance will appropriately be evaluated against rookie expectations while acknowledging the significant upside his athletic profile suggests.",
    impact: "Golden's primary value in 2026 is adding a third speed element to the Packers' receiving corps that forces defenses to account for vertical threats on both sides of the field simultaneously. His presence opens space for Reed and creates hesitation in safety rotation.",
    outlook: "Golden enters 2026 with manageable expectations and significant upside. A productive rookie season in a complementary role would lay the foundation for expanded production in 2027 and beyond. His development alongside Watson and Reed could make Green Bay's wide receiver corps one of the deepest in the NFC.",
  },
  {
    name: "Tucker Kraft",
    pos: "Tight End",
    number: 85,
    age: 24,
    years: 3,
    overview: "Tucker Kraft is the Green Bay Packers' developing receiving tight end and a player whose athletic upside has generated significant excitement within the organization. A fluid mover for his size, Kraft has been building chemistry with Jordan Love that positions him to become a featured receiving option in LaFleur's offense as his NFL experience accumulates.",
    strengths: [
      "Athletic movement skills for the tight end position — Kraft's ability to separate from linebackers in the seam and on crossing routes creates genuine mismatch opportunities.",
      "Growing connection with Jordan Love that has produced increasingly efficient production as their timing and communication improve.",
      "Youth and developmental upside at 24 — Kraft is ascending rather than peaking, with the ceiling of a Pro Bowl tight end in a system that uses the position effectively.",
    ],
    weaknesses: [
      "Blocking consistency as an in-line tight end needs continued development — Kraft's receiving skills have outpaced his blocking production.",
      "NFL experience accumulation is still ongoing — his route precision and coverage recognition against veteran defenders continue to develop.",
      "Consistency over a full season as a featured option is still proving itself.",
    ],
    performance: "Kraft has shown genuine progress as a receiving tight end, delivering some impressive performances that have confirmed the organization's belief in his development. His chemistry with Love in the seam and red zone has created a connection the Packers will invest in expanding.",
    impact: "Kraft gives the Packers a legitimate receiving tight end who creates matchup problems for linebackers and provides Love a big target in the red zone. His development into a featured option would add a dimension to the Green Bay offense that forces defensive coordinators to dedicate coverage resources inside.",
    outlook: "Kraft enters 2026 with genuine potential to break through as a featured receiving option if he continues his development trajectory. A healthy, productive season could see him enter the conversation as one of the better tight ends in the NFC North.",
  },
  {
    name: "Micah Parsons",
    pos: "Linebacker",
    number: 44,
    age: 26,
    years: 5,
    overview: "Micah Parsons is the Green Bay Packers' transformative defensive acquisition — one of the NFL's most feared pass rushers traded from the Dallas Cowboys and immediately installed as the centerpiece of Green Bay's defensive identity. Already considered one of the two or three best defenders in professional football, Parsons brings Defensive Player of Year credentials, relentless motor, and the ability to line up at multiple positions to a Packers defense that has needed a game-changer at the position.",
    strengths: [
      "Elite pass rush ability from multiple alignments — Parsons can rush from the edge, the interior, and as an off-ball linebacker, creating matchup nightmares that no single blocker can solve.",
      "Defensive Player of Year-caliber production that has included double-digit sacks, multiple forced fumbles, and consistent game-wrecking performances against the best offenses in the NFC.",
      "Athleticism that is genuinely unique for a linebacker his size — Parsons' combination of speed, power, and explosiveness is unmatched at the position in professional football.",
      "Motor and competitive intensity on every snap that generates disruption far beyond his recorded statistics.",
    ],
    weaknesses: [
      "Coverage responsibilities in drop-back zone concepts are a lesser strength compared to his pass rushing dominance.",
      "The highest contract value he commands is a roster-building challenge that reduces flexibility elsewhere on the defensive side.",
      "Offenses have begun scheming specifically to limit his individual production, which means he must continue expanding his counter-move arsenal.",
    ],
    performance: "Parsons' arrival in Green Bay transforms the franchise's defensive identity in the most dramatic way possible. His pressure rates, sack production, and game-impact statistics are among the highest of any defender in the NFL, and his ability to function as a one-man problem for any offense is exactly what the Packers have needed for years.",
    impact: "Parsons' impact on the Packers extends far beyond his individual statistics. His presence forces offensive coordinators to dedicate extra blockers to his side, which frees every other Packers defender to operate in more favorable one-on-one situations. He is the most important defensive acquisition in Green Bay history since Reggie White.",
    outlook: "Parsons enters 2026 as the Defensive Player of Year frontrunner and the most disruptive defensive player in the NFC North. His partnership with Rashan Gary creates the most feared edge-rushing combination in the conference, and his ability to terrorize every opposing quarterback the Packers face gives Green Bay a realistic Super Bowl ceiling. He is the most exciting defensive player in Packers history in at least a generation.",
  },
  {
    name: "Tyrod Taylor",
    pos: "Quarterback",
    number: 2,
    age: 37,
    years: 15,
    overview: "Tyrod Taylor is the Green Bay Packers' veteran backup quarterback bringing 15 seasons of professional experience to a roster built around Jordan Love. A steady hand who has started games for multiple franchises throughout his career, Taylor provides the Packers with reliable insurance at the most critical position on the field.",
    strengths: [
      "Exceptional veteran experience across 15 NFL seasons — Taylor has seen virtually every defensive scheme, pressure package, and game situation the league can generate.",
      "Mobile quarterback who can extend plays with his legs and maintain the Packers' run-game identity if Love misses time.",
      "Composure and professionalism that makes him a valuable locker room presence for younger players including Love.",
    ],
    weaknesses: [
      "At 37, arm strength and explosiveness have declined from his peak years — Taylor cannot make the full range of throws that Love can.",
      "NFL starting experience has shown limitations in sustaining elite production over extended multi-game stretches.",
    ],
    performance: "Taylor has been a consistent professional backup whose primary value is extensive experience and steady performance in limited action. He does not dramatically alter the Packers' offensive identity but keeps them competitive if Love misses games.",
    impact: "Taylor's impact is as a safety net and mentorship resource. His 15 seasons of experience give Love a veteran resource in film study and game preparation that accelerates the younger quarterback's development.",
    outlook: "Taylor enters 2026 likely in the final season of an impressive professional career. His primary role is supporting Love's development and providing dependable backup coverage.",
  },
  {
    name: "MarShawn Lloyd",
    pos: "Running Back",
    number: 34,
    age: 24,
    years: 3,
    overview: "MarShawn Lloyd is the Green Bay Packers' change-of-pace running back and a complement to Josh Jacobs in the Packers' ground attack. An explosive, shifty runner who offers a different style than Jacobs' physical power approach, Lloyd gives LaFleur formation versatility and the ability to maintain production if Jacobs misses time.",
    strengths: [
      "Explosive quickness and elusiveness that provide a distinct contrast to Jacobs' power style — Lloyd can make defenders miss in the open field in ways Jacobs cannot.",
      "Receiving ability out of the backfield that creates additional matchup opportunities in spread formations.",
      "Youth at 24 with the developmental upside to continue growing into a more complete back.",
    ],
    weaknesses: [
      "Between-the-tackles power is below Jacobs' level, limiting his effectiveness on early-down carries in physical game situations.",
      "Limited NFL experience means his usage is appropriately managed in a complementary role.",
    ],
    performance: "Lloyd has been a productive change-of-pace option who changes the texture of the Packers' run game when inserted into series. His explosiveness on designed outside runs and screens creates the kind of explosive plays that complement Jacobs' consistent interior production.",
    impact: "Lloyd's presence in the rotation prevents defenses from fully committing to stopping Jacobs on every play. His speed in space on jet sweeps and perimeter runs forces defenders to widen their alignments, which opens the interior run game for Jacobs.",
    outlook: "Lloyd enters 2026 as a quality backup with upside. If Jacobs stays healthy, Lloyd's role is defined but productive. If Jacobs misses time, Lloyd has the athleticism to contribute meaningful production as the primary back.",
  },
  {
    name: "Rashan Gary",
    pos: "Linebacker",
    number: 52,
    age: 27,
    years: 6,
    overview: "Rashan Gary is the Green Bay Packers' veteran edge rusher and Micah Parsons' counterpart in what has become the most fearsome pass rushing duo in the NFC North. Returning to form after a significant knee injury, Gary pairs his natural athleticism with six seasons of professional development to create a two-sided edge threat that opposing offensive coordinators cannot solve with conventional protection schemes.",
    strengths: [
      "Athletic edge rushing profile that includes elite first-step quickness, bend around the corner, and a developing counter-move repertoire.",
      "Partnership with Parsons on the opposite edge creates a two-sided problem no offensive line can solve by double-teaming one player.",
      "Six years of professional development have refined his technique and expanded his pass-rush moves well beyond the raw athleticism he entered with.",
    ],
    weaknesses: [
      "Knee injury recovery creates questions about whether he has fully returned to his pre-injury explosiveness.",
      "Consistency over a full 17-game season of high-level pass rush production is still proving itself post-injury.",
      "Run defense assignments have been an area of inconsistency that requires continued coaching attention.",
    ],
    performance: "When healthy, Gary has been one of the better edge rushers in the NFC, and his return to form alongside Parsons creates a combination that is genuinely unprecedented in Green Bay's defensive history. His production when fully healthy matches the production of players with significantly higher profiles.",
    impact: "Gary's impact alongside Parsons is multiplicative rather than additive. The two working simultaneously from opposite edges creates a pressure dynamic that forces offensive coordinators into impossible choices — resources committed to one side leave the other dangerously uncovered.",
    outlook: "Gary enters 2026 as one of the most important players in Green Bay's Super Bowl aspirations. A fully healthy Gary alongside Parsons gives the Packers a pass rushing combination that could genuinely rival any defensive edge pairing in the history of the franchise.",
  },
];

// ── Content generator ─────────────────────────────────────────────────────────

function generatePlayerPost(player: PackersPlayer) {
  const slug = slugify(`green-bay-packers-${player.name}-player-profile-2026`, {
    lower: true, strict: true,
  });

  const title = `${player.name} — Green Bay Packers ${player.pos} | 2026 Player Profile & Analysis`;
  const excerpt = `Complete 2026 player profile for Green Bay Packers ${player.pos} ${player.name}. Strengths, weaknesses, performance analysis, and season outlook under head coach Matt LaFleur.`;

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

<h2>Impact on the Packers</h2>
<p>${player.impact}</p>

<h2>2026 Season Outlook</h2>
<p>${player.outlook}</p>

<p><em>Analysis based on the 2026 Green Bay Packers roster and the system installed by head coach Matt LaFleur.</em></p>
`.trim();

  const tags = [
    "Green Bay Packers",
    "Packers",
    "NFC North",
    player.name,
    player.pos,
    "Packers Player Profile",
    "NFL Player Analysis",
    "2026 NFL Season",
    "Matt LaFleur",
  ];

  return {
    slug,
    title,
    excerpt,
    content,
    author: "NFL Predictions Hub Staff",
    tags,
    published: true,
    metaTitle: `${player.name} | Green Bay Packers ${player.pos} Profile 2026 — NFL Predictions Hub`,
    metaDescription: excerpt,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  let created = 0;
  let skipped = 0;

  for (const player of PACKERS_ROSTER) {
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
