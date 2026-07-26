/**
 * Generates one unique blog post per Dallas Cowboys player.
 * Run: npx tsx scripts/generate-cowboys-player-posts.ts
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

interface CowboysPlayer {
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

const COWBOYS_ROSTER: CowboysPlayer[] = [
  {
    name: "Dak Prescott",
    pos: "Quarterback",
    number: 4,
    age: 32,
    years: 10,
    overview: "Dak Prescott is the Dallas Cowboys' franchise quarterback and one of the most recognizable players in professional football. A four-time Pro Bowl selection who led Dallas to back-to-back NFC East titles, Prescott combines above-average athleticism, strong arm talent, and veteran leadership that has made him the face of America's Team. He enters 2026 leading one of the NFL's most scrutinized rosters under the brightest media spotlight in the sport.",
    strengths: [
      "Above-average arm strength with the ability to make all three levels of throws with accuracy and zip, particularly on out routes and comeback routes where his release creates natural separation from defenders.",
      "Improvisational ability in the pocket — Prescott's elusiveness and ability to extend plays with his legs creates additional time for receivers to unstack from coverage.",
      "Clutch performer in fourth-quarter situations with a track record of game-winning drives against quality opponents.",
      "Leadership and competitive toughness. Prescott's demeanor in high-pressure moments consistently elevates the play of those around him.",
    ],
    weaknesses: [
      "Decision-making under heavy pressure from elite defenses has been an area of inconsistency, particularly in playoff settings where the margin for error shrinks significantly.",
      "Injury history, including a catastrophic ankle injury earlier in his career, is a recurring concern that the Dallas medical staff monitors carefully.",
      "Turnover-worthy play rate in critical late-game situations has occasionally cost the Cowboys in crucial matchups.",
    ],
    performance: "Prescott has been among the most productive passers in the NFC over his career, consistently ranking in the top ten in passing yards and touchdowns. His production with a healthy offensive line and quality receiving talent around him is among the highest floors of any starter in the league.",
    impact: "Prescott is the Cowboys' offensive engine and the primary reason the franchise has remained relevant in the NFC East. His ability to distribute the ball across a diverse receiving corps and manage the game efficiently keeps Dallas competitive in every matchup they enter.",
    outlook: "The 2026 season represents a defining moment for Prescott and the Cowboys. With Micah Parsons traded and the defensive identity in transition, Dallas needs Prescott to carry more of the offensive burden than ever. A deep playoff run would cement his legacy as a franchise-defining quarterback; another early exit would intensify the questions that have followed this team.",
  },
  {
    name: "CeeDee Lamb",
    pos: "Wide Receiver",
    number: 88,
    age: 25,
    years: 6,
    overview: "CeeDee Lamb is the Dallas Cowboys' superstar wide receiver and one of the most complete players at his position in the NFL. A first-team All-Pro who has established himself as the undisputed WR1 in Dallas, Lamb combines elite route running, exceptional hands, elite yards-after-catch ability, and rare football IQ that make him one of the most difficult receivers to cover in professional football.",
    strengths: [
      "Route running versatility that allows him to play effectively from the slot or on the outside — Lamb's ability to create separation at every level of the route tree makes him uniquely difficult to scheme against.",
      "Elite yards after catch production. Lamb consistently turns routine completions into chunk gains through elusiveness, balance, and football instincts after the ball arrives.",
      "Exceptional hands and catch radius — Lamb makes difficult catches in traffic look routine and rarely drops catchable balls in any game situation.",
      "Football IQ that allows him to adjust routes based on coverage and find soft spots in zone schemes that most receivers miss entirely.",
    ],
    weaknesses: [
      "Target dependency on Dak Prescott means his production is directly tied to the quarterback's health and decision-making in critical games.",
      "Physical matchups against the NFL's most press-heavy cornerbacks occasionally limit his early-down effectiveness when defenses commit to eliminating him from the game plan.",
    ],
    performance: "Lamb has established himself as one of the top three receivers in the NFC, producing at an elite level consistently enough to force defenses to dedicate special coverage resources to limiting his impact. His receiving production has been among the best in the league despite facing concentrated defensive attention.",
    impact: "Lamb is the Cowboys' offensive identity. Everything Dallas does offensively is designed to create opportunities for him, and his ability to win one-on-one against any coverage makes him the most dangerous offensive weapon in the NFC East. When Lamb is locked in and getting targets, the Cowboys' offense is among the best in the conference.",
    outlook: "Lamb enters 2026 as one of the clear favorites for the league's receiving title. With George Pickens now in Dallas as a legitimate second option, defenses can no longer bracket Lamb on every play, which should translate to his most productive season yet. The Cowboys' offensive ceiling in 2026 is defined almost entirely by how well Lamb and Prescott operate in sync.",
  },
  {
    name: "George Pickens",
    pos: "Wide Receiver",
    number: 14,
    age: 23,
    years: 4,
    overview: "George Pickens is the Dallas Cowboys' dynamic second wide receiver, a physically gifted pass catcher who combines elite body control with one of the most impressive catch radiuses in the sport. Acquired to complement CeeDee Lamb and give Prescott a genuine second weapon, Pickens enters his second season in Dallas with the expectation that the Cowboys' offense reaches a new level of offensive output.",
    strengths: [
      "Exceptional body control and leaping ability that make him one of the most impressive contested-catch receivers in the league — Pickens regularly makes catches that no other receiver can replicate.",
      "Elite catch radius and hand strength that allow him to extend for difficult throws and come down with passes other receivers drop.",
      "Deep threat ability on go routes where his size and athleticism create problems for corners trying to stay in phase on vertical routes.",
      "Competitive toughness after the catch, fighting through tackles and creating additional yardage consistently.",
    ],
    weaknesses: [
      "Route running precision against experienced zone coverage defenders is an area of development — Pickens can rely too heavily on athleticism in situations that require technical precision.",
      "Consistency across a full season has been questioned after his time in Pittsburgh where emotional swings affected performance.",
      "Attention to detail in blocking assignments and understanding complex route combinations is still developing.",
    ],
    performance: "Pickens' addition to Dallas creates a genuine dual-threat receiving corps that the NFC East has not seen at Cowboy Stadium. His ability to win one-on-one against corners when defenses focus on Lamb creates legitimate big-play potential on every snap.",
    impact: "Pickens' most important contribution in Dallas is forcing defenses to choose their poison. They cannot double both Lamb and Pickens simultaneously, which means someone will consistently face single coverage. That reality gives Prescott the easiest reads of his career.",
    outlook: "Year two in Dallas should be the season Pickens fully emerges as a genuine WR1-caliber player. Chemistry with Prescott, understanding of the offense, and freedom from double coverage should all improve simultaneously, making 2026 the breakthrough season that his talent has always suggested was coming.",
  },
  {
    name: "Javonte Williams",
    pos: "Running Back",
    number: 27,
    age: 25,
    years: 5,
    overview: "Javonte Williams is the Dallas Cowboys' starting running back, a powerful north-south runner who overcame a devastating ACL injury to reestablish himself as one of the AFC's better running backs before joining Dallas. Williams brings physicality, short-yardage effectiveness, and receiving ability that fits well in the Cowboys' West Coast-influenced offensive system.",
    strengths: [
      "Power and physicality as a runner — Williams is one of the most difficult backs to bring down after initial contact, consistently gaining yards through contact rather than avoiding it.",
      "Effective short-yardage and goal-line back who converts on critical downs when the game is on the line.",
      "Receiving ability out of the backfield that adds a genuine dimension to the Cowboys' passing game attack.",
    ],
    weaknesses: [
      "Long-term durability following his ACL recovery remains a concern — Williams has shown he can return to form, but a full healthy season is still something he needs to establish.",
      "Top-end speed in the open field is not elite, limiting his ability to consistently break home-run runs when the crease opens.",
    ],
    performance: "Williams has been a quality starter whose value is concentrated in his physicality between the tackles and his reliability in short-yardage situations. His production may not be flashy, but his hard-nosed running style fits the identity Prescott and the Cowboys want to project.",
    impact: "Williams' presence gives the Cowboys' offense a legitimate ground-game threat that forces defenses to respect the run, opening up the play-action passing game that makes Prescott's job easier.",
    outlook: "Williams enters 2026 with the opportunity to establish himself as a top-15 running back if he stays healthy and finds consistent production in Dallas's system. A productive year alongside Lamb and Pickens in this offense could be his best professional season.",
  },
  {
    name: "Jake Ferguson",
    pos: "Tight End",
    number: 87,
    age: 25,
    years: 4,
    overview: "Jake Ferguson is the Dallas Cowboys' starting tight end and one of Prescott's most reliable intermediate targets. A former fourth-round pick who developed rapidly into a legitimate starting tight end in the NFL, Ferguson brings reliable hands, solid route running, and enough athleticism to stress defenses across the middle of the field.",
    strengths: [
      "Reliable target in the intermediate area — Ferguson consistently gets open against zone coverage and gives Prescott a security blanket in the 10-to-15-yard range.",
      "Red-zone presence and size advantage over linebackers in goal-to-go situations.",
      "Solid run blocker who does enough to stay on the field as a complete tight end in two-tight-end sets.",
    ],
    weaknesses: [
      "Athletic ceiling limits his ability to be a genuine seam-stretching threat against man coverage from athletic safeties.",
      "Consistency as a blocker in pass protection needs continued development to match elite tight end standards.",
    ],
    performance: "Ferguson has been a quality starter who exceeded the production typically expected from a fourth-round tight end. His connection with Prescott has grown each season, and his target share in critical situations reflects the quarterback's trust in him.",
    impact: "Ferguson's role in the Cowboys' offense is to occupy the middle of the field and create easy completions that keep drives alive. His presence alongside Lamb and Pickens creates a three-level threat that defenses must account for on every play.",
    outlook: "Ferguson enters 2026 with the opportunity to be a genuine Pro Bowl candidate if Prescott targets him consistently. The depth of talent around him in Dallas should actually create more opportunities for him, not fewer.",
  },
  {
    name: "Rashan Gary",
    pos: "Outside Linebacker",
    number: 52,
    age: 27,
    years: 6,
    overview: "Rashan Gary is the Dallas Cowboys' veteran outside linebacker who joins a rebuilding defensive front following the Micah Parsons trade. A former first-round pick who overcame an ACL injury to become one of the NFC's better edge rushers, Gary brings experience, a developed pass rush repertoire, and winning mentality to a Dallas defense looking to rebuild its identity.",
    strengths: [
      "Developed pass rush repertoire featuring an effective spin move, counter moves, and bull rush that have made him consistently productive against elite offensive tackles.",
      "Motor and effort level that is high on every snap, making him a threat to create pressure even when he doesn't win the initial rush.",
      "ACL recovery experience gives him mental toughness and context that benefits younger players on the Cowboys' defense.",
    ],
    weaknesses: [
      "Post-injury consistency has varied — Gary's best production is elite, but injury interruptions have limited his ability to sustain that level over full seasons.",
      "Coverage in zone drops is a below-average aspect of his game that some offensive coordinators have exploited.",
    ],
    performance: "Gary has been a quality edge rusher whose production is most valuable in clear passing situations where he can pin his ears back and attack the quarterback without coverage responsibility.",
    impact: "Gary's presence on the Cowboys' defensive front gives Dallas a legitimate pass rush threat that opposing quarterbacks must account for in their protection schemes. In a post-Parsons era, he becomes the most experienced pass rusher on the roster.",
    outlook: "Gary's 2026 in Dallas represents a fresh start and a clear opportunity to re-establish himself as one of the NFC's top edge rushers. The motivation of a new environment and a roster rebuilding around him should bring the best football of his career.",
  },
  {
    name: "Quinnen Williams",
    pos: "Defensive Tackle",
    number: 95,
    age: 27,
    years: 7,
    overview: "Quinnen Williams is the Dallas Cowboys' new defensive tackle anchor, acquired to replace the interior disruption the team lost with Micah Parsons' departure. A four-time Pro Bowler and 2022 first-team All-Pro from his time with the New York Jets, Williams brings the highest defensive pedigree of any player Dallas added this offseason and is expected to immediately elevate their defensive front.",
    strengths: [
      "Elite interior pass rush ability — Williams generates pressure with the quickest interior first step in the NFC, consistently beating guards with speed-to-power conversions on inside rushes.",
      "Run-stopping strength and leverage that allow him to control the point of attack against power-running offenses.",
      "All-Pro pedigree and championship-level experience that sets the standard for the Cowboys' defensive front going forward.",
      "Versatility to line up at multiple spots along the defensive line, creating matchup problems for opposing offensive lines.",
    ],
    weaknesses: [
      "Adapting to a new defensive scheme after spending his entire career in New York's system will require an adjustment period.",
      "Double-team attention is now standard against him, which can suppress his individual production even when he's dominating the game.",
    ],
    performance: "Williams' PFF defensive grade of 88.8 in 2026 ranks second in the league among defensive tackles. His consistent pressure generation has made him one of the most impactful interior defenders in the sport, and he brings that standard to Dallas's rebuilding defense.",
    impact: "Williams' arrival in Dallas transforms the Cowboys' defensive front overnight. His ability to generate consistent interior pressure takes pressure off the edge rushers and forces offensive coordinators to commit extra resources to stopping him — resources they can't use to slow down the rest of the defense.",
    outlook: "Williams enters 2026 as the most important defensive addition the Cowboys have made in years. A dominant first season in Dallas would validate the trade and lay the foundation for a defensive resurgence that the organization desperately needs after the Parsons era ends.",
  },
  {
    name: "Malachi Lawrence",
    pos: "Edge Rusher",
    number: 98,
    age: 22,
    years: 1,
    overview: "Malachi Lawrence is the Dallas Cowboys' first-round edge rusher from the 2026 NFL Draft, selected 23rd overall to spearhead a generational rebuild of the Cowboys' defensive edge. Lawrence brings elite athleticism, a developing pass rush arsenal, and the kind of explosive off-the-line quickness that made him one of the most coveted defenders in his class.",
    strengths: [
      "Elite first-step quickness that creates immediate stress for offensive tackles at the snap, limiting their ability to set their feet in protection.",
      "Natural bend around the edge on speed rushes that generates pressure without requiring technical refinement.",
      "High motor and competitive fire on every snap — Lawrence gives maximum effort regardless of game situation.",
    ],
    weaknesses: [
      "Pass rush counter moves are still developing — Lawrence relies primarily on speed and athleticism at this stage of his career.",
      "NFL-level run defense against physical tight ends and pulling guards is an adjustment area from college.",
      "Limited experience against elite NFL-caliber offensive tackles means the technical learning curve will be steep.",
    ],
    performance: "As a rookie, Lawrence's production will likely be measured in flashes rather than consistent dominance. The Cowboys selected him for his ceiling and physical tools, not immediate production.",
    impact: "Lawrence's long-term impact on the Cowboys' defense could be franchise-defining. If he develops into a legitimate starting edge rusher over the next two to three seasons, Dallas will have rebuilt their defensive identity around a homegrown talent.",
    outlook: "Lawrence enters 2026 as the Cowboys' most exciting defensive prospect since Parsons. His rookie season will be about development and adjustment, but flashes of elite potential are expected and will keep Cowboys fans optimistic about the future of the franchise's defensive front.",
  },
  {
    name: "Kenneth Murray",
    pos: "Linebacker",
    number: 9,
    age: 26,
    years: 6,
    overview: "Kenneth Murray is the Dallas Cowboys' veteran inside linebacker, a physical run defender who brings stopping power and experience to Dallas's restructuring defense. A former first-round pick with above-average athleticism for the position, Murray has developed into a reliable starting linebacker in his years in the league.",
    strengths: [
      "Physical downhill run defense — Murray attacks gaps aggressively and is one of the better run-stopping linebackers in the NFC.",
      "Athleticism and range that allow him to pursue ball carriers sideline to sideline.",
      "Experience across multiple defensive schemes gives him adaptability in Dallas's evolving system.",
    ],
    weaknesses: [
      "Pass coverage against versatile tight ends and athletic running backs remains a challenge that offensive coordinators target.",
      "Decision-making speed in gap responsibilities against run-pass options can be slower than ideal.",
    ],
    performance: "Murray has been a quality run-stopping linebacker who contributes meaningfully in his primary role. His limitations in coverage create matchup challenges that coordinators must scheme around, but his value as a run defender is genuine.",
    impact: "Murray provides the Cowboys' defense with a reliable physical presence at linebacker, anchoring the run defense while Rashan Gary and Lawrence focus on creating pressure from the edge.",
    outlook: "Murray's 2026 role will be defined by how well Dallas's new defensive scheme uses his run-stopping ability while protecting him in coverage situations. If the Cowboys scheme him correctly, he can be a productive starter on a team trying to rebuild its defensive identity.",
  },
  {
    name: "DeMarvion Overshown",
    pos: "Linebacker",
    number: 0,
    age: 24,
    years: 3,
    overview: "DeMarvion Overshown is the Dallas Cowboys' developing linebacker who brings athleticism and coverage upside that distinguish him from most players at the position. After injury interruptions early in his career, Overshown is working toward establishing himself as a legitimate starting contributor in 2026.",
    strengths: [
      "Coverage athleticism — Overshown has the speed and change of direction to match up against tight ends and backs in space.",
      "Competitive motor and pursuit effort on every snap.",
      "Developing football IQ in reading run fits and coverage assignments.",
    ],
    weaknesses: [
      "Injury history has prevented him from establishing consistent production across a full season.",
      "Physical run defense against NFL-caliber offensive linemen is still developing.",
    ],
    performance: "Overshown's best football is ahead of him, and the Cowboys believe in his ceiling as a coverage linebacker who can elevate the defense in passing situations.",
    impact: "Overshown's impact will be most visible in third-and-medium situations where the Cowboys need a linebacker who can match up in space. His development could significantly improve Dallas's defensive versatility.",
    outlook: "Overshown enters 2026 with a legitimate opportunity to establish himself as a starting-caliber linebacker. A healthy, complete season could be the breakout moment that validates the Cowboys' patience with his development.",
  },
];

function generatePlayerPost(player: CowboysPlayer) {
  const slug = slugify(`dallas-cowboys-${player.name}-player-profile-2026`, {
    lower: true, strict: true,
  });

  const title = `${player.name} — Dallas Cowboys ${player.pos} | 2026 Player Profile & Analysis`;
  const excerpt = `Complete 2026 player profile for Dallas Cowboys ${player.pos} ${player.name}. Strengths, weaknesses, performance analysis, and season outlook for America's Team.`;

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

<h2>Impact on the Cowboys</h2>
<p>${player.impact}</p>

<h2>2026 Season Outlook</h2>
<p>${player.outlook}</p>

<p><em>Analysis based on the 2026 Dallas Cowboys roster.</em></p>
`.trim();

  const tags = [
    "Dallas Cowboys",
    "America's Team",
    player.name,
    player.pos,
    "Cowboys Player Profile",
    "NFL Player Analysis",
    "2026 NFL Season",
    "NFC East",
  ];

  return {
    slug,
    title,
    excerpt,
    content,
    author: "NFL Predictions Hub Staff",
    tags,
    published: true,
    metaTitle: `${player.name} | Dallas Cowboys ${player.pos} Profile 2026 — NFL Predictions Hub`,
    metaDescription: excerpt,
  };
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  let created = 0;
  let skipped = 0;

  for (const player of COWBOYS_ROSTER) {
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
