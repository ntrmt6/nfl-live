/**
 * Generates one unique blog post per Miami Dolphins player.
 * Run: npx tsx scripts/generate-dolphins-player-posts.ts
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

// ── Dolphins roster ───────────────────────────────────────────────────────────

interface DolphinsPlayer {
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

const DOLPHINS_ROSTER: DolphinsPlayer[] = [
  {
    name: "Quinn Ewers",
    pos: "Quarterback",
    number: 10,
    age: 23,
    years: 1,
    overview: "Quinn Ewers is the Miami Dolphins' new starting quarterback after the benching of Tua Tagovailoa — a former Texas Longhorns standout taking over one of the most high-profile offenses in the AFC East. Raw but undeniably talented, Ewers arrives with a powerful arm and the competitive edge that defined his college career, stepping into a major rebuild that gives him the opportunity to define his NFL identity on his own terms.",
    strengths: [
      "Elite arm talent that immediately gives the Dolphins a legitimate downfield passing threat — Ewers can make every throw on the field and has the velocity to challenge tight windows.",
      "Competitive DNA forged at Texas, where he played under intense scrutiny and consistently delivered in high-stakes moments against top college competition.",
      "Natural accuracy in the short and intermediate areas, a critical skill in Mike McDaniel's system where precise timing routes are the foundation of the passing game.",
    ],
    weaknesses: [
      "NFL experience is essentially zero, meaning the learning curve in terms of processing speed, blitz recognition, and defensive complexity will be steep.",
      "Decision-making under NFL-caliber pressure is unproven — Ewers has yet to face the speed and sophistication of professional pass rushes over a full season.",
      "Developing rapport with receivers requires time and reps that only come through regular-season experience, making early-season efficiency a genuine concern.",
    ],
    performance: "Ewers is at the very beginning of his professional career, and his performance must be evaluated against the backdrop of a major organizational transition. The Dolphins have committed to a rebuild, and Ewers is the centerpiece of that new direction. His early-season performances will set the tone for how the organization and fanbase view the transition.",
    impact: "Ewers' impact on the 2026 Dolphins is both immediate and long-term. Immediately, he gives Miami an exciting new identity at quarterback that energizes the roster. Long-term, his development will determine whether this rebuild produces a legitimate playoff contender or requires another reset.",
    outlook: "Ewers enters 2026 with lower immediate expectations but enormous long-term upside. Mike McDaniel's offense is built around the quarterback, and if Ewers can accelerate his development through reps and coaching, the Dolphins' rebuild could move faster than anticipated. He is one of the most intriguing developmental stories in the AFC this season.",
  },
  {
    name: "Malik Willis",
    pos: "Quarterback",
    number: 6,
    age: 26,
    years: 4,
    overview: "Malik Willis is the Miami Dolphins' backup quarterback and a dual-threat athlete who gives the team a different look when deployed. A former third-round pick who has bounced between rosters, Willis has found a home in Miami where his athletic ability and arm strength provide genuine backup insurance behind the developing Ewers.",
    strengths: [
      "Exceptional athleticism as a dual-threat quarterback — Willis can extend plays with his legs and manufacture offense in broken situations that would result in sacks for traditional pocket passers.",
      "Arm strength to threaten defenses deep, creating legitimate shot-play opportunities when he is in the game.",
      "Four years of NFL experience navigating multiple offensive systems has sharpened his situational football understanding.",
    ],
    weaknesses: [
      "Accuracy and decision-making in the intermediate passing game have been inconsistent throughout his career, limiting his ability to be a reliable starter.",
      "Processing speed against complex NFL defensive coverages remains a work in progress after four professional seasons.",
      "Has yet to establish himself as a starting-caliber quarterback in the league, which is the ceiling that defines his value.",
    ],
    performance: "Willis has been a capable backup who provides the Dolphins with a genuine alternative identity if Ewers struggles or gets injured. His athletic ability keeps defenders honest and allows Miami to insert designed runs and scramble drills that give offensive coordinators flexibility.",
    impact: "As the backup, Willis' primary value is roster stability and emergency option quality. His athleticism means the Dolphins don't have to completely abandon McDaniel's motion-heavy system if Ewers misses time — Willis can execute enough of the offense to remain competitive.",
    outlook: "Willis enters 2026 as a high-quality backup with legitimate starting upside if opportunity presents itself. His athletic ceiling remains intriguing and he is young enough at 26 to continue developing. His primary role is supporting Ewers' development while remaining ready.",
  },
  {
    name: "Tyreek Hill",
    pos: "Wide Receiver",
    number: 17,
    age: 30,
    years: 10,
    overview: "Tyreek Hill is the Miami Dolphins' marquee wide receiver and one of the most electrifying offensive weapons in professional football history. Recovering from injury, Hill remains the fastest player on any field he enters and the primary identity of Miami's passing game — the player every defensive coordinator must account for first before addressing anything else the Dolphins threaten.",
    strengths: [
      "Generational straight-line speed that no cornerback in the league can consistently match — Hill's ability to run past defenders is a permanent feature of every defensive game plan against Miami.",
      "Elite route running that pairs with his speed to create separation at every level, making him dangerous on every route in the tree regardless of coverage type.",
      "Yards after catch production that transforms short completions into major gains — Hill turns five-yard passes into sixty-yard touchdowns in a way no other receiver can.",
      "Decade of experience and football IQ that makes him a sophisticated route runner beyond his physical gifts.",
    ],
    weaknesses: [
      "Injury recovery creates questions about his availability and explosiveness in 2026 — the Dolphins need a healthy Hill to function at their ceiling.",
      "At 30, the long-term trajectory eventually trends toward reduced explosiveness, though Hill has shown an ability to age well.",
      "Without a capable quarterback throwing him the ball, his production can be limited regardless of his individual ability.",
    ],
    performance: "Hill has been one of the three most productive receivers in the NFL over multiple seasons, generating explosive plays at a rate no other receiver can match. His ability to create touchdowns from anywhere on the field — whether on go routes, screens, or end-arounds — gives Miami an unpredictable attack that stresses every layer of a defense simultaneously.",
    impact: "Hill is the reason defensive coordinators lose sleep preparing for the Dolphins. His presence demands safety help over the top, which opens the running game and every intermediate route for the rest of the offense. Even on plays where he doesn't touch the ball, his presence changes how the defense aligns.",
    outlook: "A healthy Hill in 2026 gives Miami's new quarterback the best possible target to develop chemistry with — one who can make average throws look great and create explosive plays from conservative designs. His return from injury is the most important storyline in Miami's season, and if he's fully healthy, the Dolphins' offense retains legitimate AFC relevance.",
  },
  {
    name: "Darren Waller",
    pos: "Tight End",
    number: 83,
    age: 31,
    years: 10,
    overview: "Darren Waller is the Miami Dolphins' veteran tight end stepping into an expanded role while Tyreek Hill recovers from injury. A big-bodied receiving tight end with elite movement skills for his size, Waller brings the veteran savvy and reliable target quality that give Ewers a trusted safety valve as he navigates his first NFL season.",
    strengths: [
      "Exceptional size-speed combination at the tight end position — at 6'6\" and 255 pounds, Waller can outrun safeties and out-physical corners simultaneously.",
      "Veteran receiving intelligence built through a decade of professional football, including elite seasons in Las Vegas — Waller understands how to leverage coverage and find open windows.",
      "Big-target catch radius that gives a developing quarterback like Ewers a reliable option where placement precision can be slightly imprecise.",
    ],
    weaknesses: [
      "Injury history over the last several seasons has significantly limited his availability and sustained production.",
      "At 31, his best seasons may be behind him in terms of peak athletic performance and separation ability.",
      "Blocking consistency in the run game has never been his primary strength, limiting some formation versatility.",
    ],
    performance: "Waller has been a vital piece of Miami's passing game during Hill's injury absence, providing Ewers with the veteran receiving target that anchors a young offense. His production gives the Dolphins a genuine threat in the seam and red zone that offsets some of what they lose without Hill in the lineup.",
    impact: "Waller's role as the primary receiving option while Hill recovers is critical to Miami's offensive functionality in 2026. His veteran presence also provides Ewers with a mentorship resource — a reliable target who can help the young quarterback develop timing and confidence in critical situations.",
    outlook: "Waller's outlook depends heavily on his health and on Hill's recovery timeline. If Hill returns quickly, Waller settles into a complementary role that he is perfectly suited for. If Hill misses significant time, Waller becomes the featured receiving option and his durability becomes the central question in Miami's passing game.",
  },
  {
    name: "Jaylen Waddle",
    pos: "Wide Receiver",
    number: 11,
    age: 25,
    years: 5,
    overview: "Jaylen Waddle is the Miami Dolphins' slot receiver and quick-twitch complementary weapon alongside Tyreek Hill. A former top-five pick who has developed into one of the better slot receivers in the AFC East, Waddle brings explosive short-area quickness and reliable hands that make him an important part of McDaniel's motion-based passing concepts.",
    strengths: [
      "Elite quickness in the slot — Waddle's burst off the line and sharp cuts create separation against zone and man coverage in the short and intermediate areas.",
      "Reliable target in the screen and quick game, where his ability to make defenders miss in open space generates consistent YAC production.",
      "Complementary chemistry with Hill means defenses cannot bracket either receiver without leaving the other in single coverage.",
    ],
    weaknesses: [
      "Outside receiver production when asked to play on the boundary is below the level of true elite wide receivers.",
      "Volume can be inconsistent when Hill is healthy and commanding coverage attention — Waddle's production fluctuates based on Hill's availability.",
      "Contested-catch situations in traffic are not his strongest environment given his smaller frame.",
    ],
    performance: "Waddle has been a productive slot receiver who thrives in the pick-play concepts and motion game McDaniel uses to create space. His ability to generate consistent first downs and big plays in the short area has made him one of the more reliable receivers in the AFC East.",
    impact: "Waddle's slot expertise is essential to McDaniel's offense because it allows the Dolphins to create width and spacing that forces defenses into uncomfortable alignments. His quick-game production is the engine of Miami's underneath passing attack.",
    outlook: "Waddle enters 2026 as an important piece of Miami's rebuild. With Ewers learning the offense, Waddle's reliability as a short-to-intermediate option is particularly valuable — a receiver who can help a young quarterback build confidence and rhythm. His 2026 production could be the highest of his career if the offense develops cohesion.",
  },
  {
    name: "Jaelan Phillips",
    pos: "Defensive End",
    number: 15,
    age: 25,
    years: 5,
    overview: "Jaelan Phillips is the Miami Dolphins' premier pass rusher and one of the most talented edge defenders in the AFC when healthy. A first-round pick whose career has been repeatedly interrupted by injury, Phillips possesses the athletic tools and pass-rush technique to be a legitimate difference-maker on the defensive perimeter when available.",
    strengths: [
      "Elite edge rushing athleticism — Phillips' combination of length, first-step quickness, and bend around the corner is genuinely rare and matches up against any offensive tackle in the league.",
      "Diverse pass rush repertoire including speed-to-power, spin, and counter moves that create problems for tackles who prepare primarily for his initial speed.",
      "Motor and competitive intensity that generate consistent effort on every snap, creating disruption beyond recorded sacks.",
    ],
    weaknesses: [
      "Injury history is the defining concern of his career — Phillips has been unable to stay healthy for a full season consistently, which limits the Dolphins' defensive planning.",
      "Run defense in the gap against power running schemes needs development to complete his profile as an every-down defender.",
      "When opposing tackles adjust to his primary moves, his counter-move library needs continued expansion.",
    ],
    performance: "When healthy, Phillips has been one of the most productive young pass rushers in the AFC, generating pressure at a rate that ranks among the best in the division. His ability to win one-on-one against elite tackles is a genuine defensive weapon.",
    impact: "Phillips' ability to generate pressure from the edge is the most important factor in Miami's defensive performance. A healthy Phillips makes the entire defense more effective by forcing earlier throws and creating knockdowns that impact passing efficiency.",
    outlook: "Phillips' 2026 represents a critical year in determining whether he can be a sustained impact player or whether injury concerns will define his career. If he can stay healthy for 15-plus games, the production suggests he is an elite pass rusher. His health is the most important variable in Miami's defensive planning.",
  },
  {
    name: "Bradley Chubb",
    pos: "Linebacker",
    number: 2,
    age: 28,
    years: 8,
    overview: "Bradley Chubb is the Miami Dolphins' veteran edge rusher returning from a significant injury. A former top-five pick who has produced elite sack numbers when healthy, Chubb brings pass rush experience and veteran savvy to a Miami defense looking to rebuild its identity in tandem with the organizational reset at quarterback.",
    strengths: [
      "Proven sack production at the professional level — Chubb has been one of the more productive edge rushers in the AFC when healthy.",
      "Veteran technique and understanding of offensive tendencies developed through eight professional seasons.",
      "Pass rush repertoire that includes both speed and power moves, making him more than a one-trick speed rusher.",
    ],
    weaknesses: [
      "Injury comeback creates significant questions about his explosiveness, bend, and long-term effectiveness at the position.",
      "At 28 and returning from a major lower-body injury, his burst and recovery quickness may not return fully.",
      "Coverage responsibilities in zone concepts have never been his strongest contribution.",
    ],
    performance: "Chubb's performance in 2026 will be measured entirely against the backdrop of his injury recovery. His best football generated elite pressure statistics, but the path back from a significant injury at 28 is uncertain. Early-season performance will be the most informative data.",
    impact: "Chubb alongside Phillips gives Miami a two-edge-rusher combination that could be among the most dangerous in the AFC East if both players are healthy. His veteran presence also provides leadership and communication in the defensive front.",
    outlook: "Chubb's 2026 is fundamentally a comeback story. If he returns to even 80 percent of his pre-injury form, the Dolphins' pass rush becomes a legitimate strength. His health and recovery trajectory will define his impact.",
  },
  {
    name: "Jevon Holland",
    pos: "Safety",
    number: 8,
    age: 25,
    years: 5,
    overview: "Jevon Holland is the Miami Dolphins' physical starting safety and one of the most underrated defensive backs in the AFC East. A versatile playmaker who can line up in multiple positions, Holland brings the kind of coverage intelligence and aggressive run defense that anchors a secondary.",
    strengths: [
      "Physical coverage ability at the safety position — Holland attacks receivers and tight ends with a physicality that disrupts timing routes.",
      "Playmaker instincts in coverage, generating turnovers and pass breakups at a rate that ranks among the best safeties in the division.",
      "Versatility to play both free and strong safety, giving the defensive coordinator multiple alignment options.",
    ],
    weaknesses: [
      "Aggressive style can lead to coverage busts when gambling for turnovers creates gaps in the deep coverage shell.",
      "At 25, his long-speed against elite receiving tight ends in pure man coverage can be a vulnerability.",
    ],
    performance: "Holland has been Miami's most consistent defensive player over multiple seasons, and his production in coverage and run defense has been the foundation of a secondary in transition. His playmaking has resulted in some of the most memorable defensive moments in recent Dolphins history.",
    impact: "Holland's ability to create turnovers and disrupt passing lanes gives the Dolphins a defensive back who can single-handedly change a game's momentum. His presence in the secondary allows the Dolphins to be aggressive with blitz packages that leave the coverage more exposed.",
    outlook: "Holland enters 2026 as one of the better safeties in the AFC East and a player with Pro Bowl upside if he can stay healthy and continue his turnover production. The Dolphins' rebuild gives him an opportunity to be a defensive centerpiece during a transitional season.",
  },
  {
    name: "Kadyn Proctor",
    pos: "Offensive Tackle",
    number: 73,
    age: 21,
    years: 1,
    overview: "Kadyn Proctor is the Miami Dolphins' 2026 draft pick and one of the most physically gifted offensive tackle prospects to enter the league this year. At 21 years old and with prototypical size and athleticism, Proctor represents Miami's investment in protecting their new franchise quarterback for the next decade.",
    strengths: [
      "Prototypical offensive tackle size and length that immediately qualifies him as a blindside protector capable of handling elite NFL edge rushers.",
      "Athletic profile that includes the foot speed and lateral agility to mirror speed rushers on the outside.",
      "Youth and upside — at 21 in his first professional season, Proctor's developmental ceiling is genuinely high.",
    ],
    weaknesses: [
      "NFL experience is zero, meaning the transition from college to professional competition will include an adjustment period.",
      "Technical refinement in pass-set footwork and hand placement needs development before he can be fully trusted against elite professional edge rushers.",
      "Needs time to develop before the expectation of immediate elite starting production is reasonable.",
    ],
    performance: "Proctor is at the very beginning of his professional journey. His 2026 performance will be measured against reasonable rookie expectations while acknowledging the significant development trajectory ahead.",
    impact: "Proctor's long-term impact on the Dolphins' rebuild could be enormous. Protecting Quinn Ewers during his developmental years is an organizational priority, and Proctor has the physical tools to become that blindside cornerstone.",
    outlook: "Proctor enters 2026 as the most important developmental player on Miami's roster. His growth as a pass protector over the next three seasons will directly determine how quickly Ewers can reach his ceiling — making the two rookies' careers fundamentally intertwined.",
  },
  {
    name: "Calais Campbell",
    pos: "Defensive Tackle",
    number: 93,
    age: 39,
    years: 18,
    overview: "Calais Campbell is the Miami Dolphins' ageless veteran defensive lineman and one of the most respected leaders in professional football. In his 18th season at age 39, Campbell has transitioned into a rotational role and mentor figure whose veteran presence, pass rushing savvy, and leadership are invaluable to a Dolphins defense in transition.",
    strengths: [
      "18 seasons of professional football intelligence — Campbell understands offensive tendencies, blocking techniques, and situational football at a level that no younger player can replicate.",
      "Still capable of generating interior pass rush pressure using technique and leverage in a rotational capacity.",
      "Locker room leadership and mentorship that accelerate the development of Miami's younger defensive linemen.",
    ],
    weaknesses: [
      "At 39, athleticism and recovery have declined significantly, limiting his snap count and explosiveness against younger offensive linemen.",
      "Starting-caliber production over a full game is no longer realistic — his role as a rotational specialist is appropriate and necessary.",
    ],
    performance: "Campbell has continued to generate value as a rotational pass rusher and run defender through technique and experience rather than athleticism. His ability to still contribute meaningfully at 39 is a testament to his preparation and conditioning.",
    impact: "Campbell's most important contribution to the 2026 Dolphins may be in the meeting room and practice field rather than in game statistics. His leadership of Miami's young defensive linemen and his ability to model professional habits give the organization an invaluable culture asset during a rebuild.",
    outlook: "Campbell enters 2026 likely in the final season of his remarkable career. His primary value is mentorship, leadership, and situational pass rush contribution. Whether he retires after this season or continues into 2027 depends on his physical condition and the team's needs.",
  },
];

// ── Content generator ─────────────────────────────────────────────────────────

function generatePlayerPost(player: DolphinsPlayer) {
  const slug = slugify(`miami-dolphins-${player.name}-player-profile-2026`, {
    lower: true, strict: true,
  });

  const title = `${player.name} — Miami Dolphins ${player.pos} | 2026 Player Profile & Analysis`;
  const excerpt = `Complete 2026 player profile for Miami Dolphins ${player.pos} ${player.name}. Strengths, weaknesses, performance analysis, and season outlook under head coach Mike McDaniel.`;

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

<h2>Impact on the Dolphins</h2>
<p>${player.impact}</p>

<h2>2026 Season Outlook</h2>
<p>${player.outlook}</p>

<p><em>Analysis based on the 2026 Miami Dolphins roster and the system installed by head coach Mike McDaniel.</em></p>
`.trim();

  const tags = [
    "Miami Dolphins",
    "Dolphins",
    "AFC East",
    player.name,
    player.pos,
    "Dolphins Player Profile",
    "NFL Player Analysis",
    "2026 NFL Season",
    "Mike McDaniel",
  ];

  return {
    slug,
    title,
    excerpt,
    content,
    author: "NFL Predictions Hub Staff",
    tags,
    published: true,
    metaTitle: `${player.name} | Miami Dolphins ${player.pos} Profile 2026 — NFL Predictions Hub`,
    metaDescription: excerpt,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  let created = 0;
  let skipped = 0;

  for (const player of DOLPHINS_ROSTER) {
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
