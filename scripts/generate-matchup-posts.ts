/**
 * Generate matchup preview posts for scheduled NFL games (no AI API needed).
 *
 * Usage:
 *   npx tsx scripts/generate-matchup-posts.ts               # all scheduled games
 *   npx tsx scripts/generate-matchup-posts.ts --week 1      # Week 1 only
 *   npx tsx scripts/generate-matchup-posts.ts --week 1 --season 2026
 *   npx tsx scripts/generate-matchup-posts.ts --overwrite   # regenerate existing
 */

import "dotenv/config";
import mongoose from "mongoose";
import slugify from "slugify";
import Game from "../src/models/Game";
import Post from "../src/models/Post";

const MONGODB_URI = process.env.MONGODB_URI!;

const args = process.argv.slice(2);
const weekArg = args.includes("--week") ? Number(args[args.indexOf("--week") + 1]) : null;
const seasonArg = args.includes("--season") ? Number(args[args.indexOf("--season") + 1]) : null;
const overwrite = args.includes("--overwrite");

// ─── Team profiles ────────────────────────────────────────────────────────────

interface TeamProfile {
  coach: string;
  qb: string;
  offenseStyle: string;
  defenseStyle: string;
  strength: string;
  weakness: string;
  keyPlayer1: { name: string; pos: string; note: string };
  keyPlayer2: { name: string; pos: string; note: string };
  outlook: string[];
}

const TEAM_PROFILES: Record<string, TeamProfile> = {
  KC: {
    coach: "Andy Reid", qb: "Patrick Mahomes",
    offenseStyle: "dynamic, play-action heavy passing offense with elite pre-snap motion",
    defenseStyle: "multiple-front defense built around speed and disguise",
    strength: "Mahomes' ability to extend plays and create touchdowns outside of structure",
    weakness: "defensive depth at cornerback when starters are unavailable",
    keyPlayer1: { name: "Patrick Mahomes", pos: "QB", note: "The reigning standard-bearer at the position. Mahomes' combination of arm talent, mobility, and football IQ makes him nearly impossible to game-plan against consistently. Look for him to exploit single coverage and generate explosive plays in the second half." },
    keyPlayer2: { name: "Travis Kelce", pos: "TE", note: "Kelce remains the most reliable tight end in football in critical moments. His route running in the middle of the field and red-zone presence gives Mahomes a safety valve that defenses cannot fully eliminate." },
    outlook: ["Kansas City's offensive system under Andy Reid is the most refined in the NFL. The Chiefs consistently manufacture clean throws for Mahomes through creative motion, shifts, and play-action design.", "The Chiefs' defense is built for adaptability. Their ability to rotate coverages and generate pressure with four rushers keeps opposing offenses off-rhythm throughout games.", "Expect Kansas City to control possession time and protect early leads. Reid's teams rarely beat themselves — turnovers are low, penalties are managed, and situational football is a consistent strength."],
  },
  BAL: {
    coach: "John Harbaugh", qb: "Lamar Jackson",
    offenseStyle: "RPO-heavy run-pass option attack built around Jackson's dual-threat ability",
    defenseStyle: "aggressive, press-coverage defense with elite safety play",
    strength: "Jackson's rushing threat that forces defenses into impossible assignment conflicts",
    weakness: "consistency in the red zone when the run game is bottled up",
    keyPlayer1: { name: "Lamar Jackson", pos: "QB", note: "A two-time MVP whose rushing ability makes every Ravens drive a potential explosive play. Jackson's combination of arm talent and running ability forces defenses to account for him on every snap, opening the field for his receivers." },
    keyPlayer2: { name: "Zay Flowers", pos: "WR", note: "Flowers' speed and explosiveness after the catch complement Jackson's style perfectly. He creates mismatches in space and has become one of the AFC's most dangerous slot receivers when healthy." },
    outlook: ["Baltimore's offense begins and ends with Lamar Jackson's legs. When the Ravens can establish the run and control the line of scrimmage, their offense is nearly impossible to stop.", "John Harbaugh's defense is built on physicality. Baltimore takes away the opponent's primary option and dares them to beat them with their secondary or tertiary reads.", "The Ravens are at their best early — they impose their will physically and establish momentum in the first quarter. If they build a lead, their defense finishes the job."],
  },
  BUF: {
    coach: "Sean McDermott", qb: "Josh Allen",
    offenseStyle: "explosive, multi-faceted attack leveraging Allen's arm and legs equally",
    defenseStyle: "zone-heavy coverage scheme that maximizes their cornerback talent",
    strength: "Allen's physical dominance and ability to convert third downs with his legs",
    weakness: "deep playoff runs have exposed decision-making under sustained pressure",
    keyPlayer1: { name: "Josh Allen", pos: "QB", note: "Allen is the most physically gifted quarterback in football. His combination of arm strength and rushing ability gives Buffalo a weekly advantage in contested games. He has matured as a decision-maker and is at his best in high-leverage situations." },
    keyPlayer2: { name: "Stefon Diggs", pos: "WR", note: "Diggs' route precision and contested-catch ability make him Allen's most reliable target in critical moments. He wins on all three levels of the field and understands how to manipulate cornerback leverage." },
    outlook: ["Buffalo's offense is built around Josh Allen's ability to extend plays and create opportunities outside of structure. When the Bills get Allen moving, the entire defense has to account for both his passing and rushing threat.", "Sean McDermott's defensive scheme is built on discipline and assignment football. The Bills rarely give up easy touchdowns and force opposing offenses to be precise on every snap.", "Highmark Stadium is one of the most difficult road environments in football. The Bills' crowd gives them a meaningful home-field advantage in contested games."],
  },
  PHI: {
    coach: "Nick Sirianni", qb: "Jalen Hurts",
    offenseStyle: "run-dominant, play-action system built around Hurts' mobility and a dominant offensive line",
    defenseStyle: "aggressive, blitz-heavy defense anchored by one of the best defensive fronts in football",
    strength: "offensive line depth and run game that controls possession and field position",
    weakness: "passing game consistency when facing elite cornerback matchups",
    keyPlayer1: { name: "Jalen Hurts", pos: "QB", note: "Hurts has developed into one of the NFC's most efficient quarterbacks. His rushing ability keeps defenses honest and creates the play-action opportunities that make the Eagles' vertical passing game effective." },
    keyPlayer2: { name: "A.J. Brown", pos: "WR", note: "Brown's combination of size and speed makes him one of the hardest receivers to match up against in the league. He's at his best in contested situations and consistently wins in the red zone." },
    outlook: ["Philadelphia's offensive line is the foundation of everything they do. When the Eagles can run the football and control the line of scrimmage, their offense becomes nearly impossible to defend for a full sixty minutes.", "Nick Sirianni's defense generates pressure with four rushers consistently, which allows the secondary to play aggressive man coverage. The Eagles' ability to create disruption at the line of scrimmage is their biggest defensive advantage.", "The Eagles are a second-half team. Their physicality and depth wear opponents down as games progress, and their winning percentage in games within seven points in the fourth quarter is elite."],
  },
  SF: {
    coach: "Kyle Shanahan", qb: "Brock Purdy",
    offenseStyle: "wide-zone running scheme with layered play-action and creative receiver usage",
    defenseStyle: "versatile, multiple-front defense that shifts personnel based on the opponent",
    strength: "Shanahan's scheme creativity that generates clean looks for Purdy on every down",
    weakness: "injury history at key positions that has derailed multiple postseason runs",
    keyPlayer1: { name: "Brock Purdy", pos: "QB", note: "Purdy's processing speed and accuracy within Shanahan's system make him one of the most efficient quarterbacks in football. His ability to identify and attack soft spots in coverage quickly is a genuine skill, not just a product of his system." },
    keyPlayer2: { name: "Christian McCaffrey", pos: "RB", note: "McCaffrey's versatility as both a runner and receiver out of the backfield creates matchup nightmares for linebackers and safeties. He is the offense's most important player and the focal point of every defensive game plan." },
    outlook: ["Kyle Shanahan's offensive system is the most creative in the league. His ability to use motion, shifts, and play-action to generate clean throws for Purdy makes the 49ers offense extraordinarily difficult to prepare for.", "San Francisco's defense is built around versatility and personnel flexibility. They can match any offensive formation and present multiple fronts that create confusion in protection assignments.", "The 49ers are particularly dangerous in the first half. Shanahan front-loads game plans with schematic wrinkles designed to establish advantages before halftime adjustments can neutralize them."],
  },
  DET: {
    coach: "Dan Campbell", qb: "Jared Goff",
    offenseStyle: "physical, run-first attack that creates explosive passing opportunities off play-action",
    defenseStyle: "aggressive, assignment-sound defense that prioritizes stopping the run",
    strength: "offensive line that physically dominates at the point of attack",
    weakness: "pass coverage in the secondary when facing elite wide receiver groups",
    keyPlayer1: { name: "Jared Goff", pos: "QB", note: "Goff has evolved into one of the NFL's most accurate quarterbacks within Campbell's system. His ability to process quickly and deliver in rhythm makes the Lions' play-action passing game consistently explosive." },
    keyPlayer2: { name: "Amon-Ra St. Brown", pos: "WR", note: "St. Brown's ability to consistently create separation in the slot and convert on third downs has made him Goff's most reliable option. He's at his best in high-leverage moments and leads the team in contested catch situations." },
    outlook: ["Dan Campbell has built a culture of toughness in Detroit that shows up in the fourth quarter. The Lions consistently outperform their opponents in the final fifteen minutes of games.", "Detroit's offensive line is the team's most significant competitive advantage. Their ability to control the line of scrimmage and impose their run game physically wears opposing defenses down over sixty minutes.", "Ford Field is one of the loudest environments in the NFC. The Lions' home-field advantage is genuine and has been a meaningful factor in their success during the regular season."],
  },
  GB: {
    coach: "Matt LaFleur", qb: "Jordan Love",
    offenseStyle: "West Coast passing attack with deep play-action shots and creative route combinations",
    defenseStyle: "zone-based coverage scheme that limits explosive plays and forces field goals",
    strength: "Jordan Love's deep ball accuracy and ability to attack all three levels of the field",
    weakness: "red zone efficiency when facing physical man coverage",
    keyPlayer1: { name: "Jordan Love", pos: "QB", note: "Love has emerged as one of the NFC's most dangerous quarterbacks. His arm talent in the deep game is exceptional, and his comfort in LaFleur's system has grown dramatically in his development years." },
    keyPlayer2: { name: "Jayden Reed", pos: "WR", note: "Reed's explosiveness in the slot and ability to create yards after the catch make him Love's most dangerous short-to-intermediate option. His route running has improved and he consistently finds the soft spots in zone coverage." },
    outlook: ["Matt LaFleur's offensive system creates layered route combinations that attack every level of the defense. The Packers' ability to generate explosive plays down the field is their biggest offensive weapon.", "Green Bay's defense is built around limiting big plays and keeping opponents in manageable situations. Their zone coverage scheme forces offenses to execute sustained drives to score.", "Lambeau Field is one of the most iconic home-field advantages in professional sports. The Packers' home record in contested games is consistently excellent regardless of roster construction."],
  },
  DAL: {
    coach: "Mike McCarthy", qb: "Dak Prescott",
    offenseStyle: "balanced, spread-formation attack that leverages Prescott's arm and CeeDee Lamb's talent",
    defenseStyle: "aggressive, Micah Parsons-anchored defense that creates havoc in opposing backfields",
    strength: "CeeDee Lamb's ability to create mismatches against any cornerback in the league",
    weakness: "road performance in elimination games has been a persistent concern",
    keyPlayer1: { name: "Dak Prescott", pos: "QB", note: "Prescott's arm talent and ability to operate in a spread formation make him one of the NFC's most productive passers. He's at his best when the Cowboys can establish early success and build rhythm in the passing game." },
    keyPlayer2: { name: "CeeDee Lamb", pos: "WR", note: "Lamb is the most dangerous wide receiver in the NFC East and one of the best in football. His combination of route running, yards after catch, and contested-catch ability makes him nearly impossible to match up against with a single cornerback." },
    outlook: ["AT&T Stadium gives Dallas a genuine home-field advantage. The Cowboys' record at home in prime-time games is excellent, and their fan base creates a raucous environment for opposing offenses.", "Mike McCarthy's offense generates its best football when Prescott is in rhythm early. Quick, decisive throws that get Lamb the ball in space are the foundation of everything Dallas does well.", "Micah Parsons' impact on the defensive side cannot be overstated. When he generates consistent pressure, the Cowboys' secondary can play more aggressively, which creates a multiplying effect across the entire defense."],
  },
  CIN: {
    coach: "Zac Taylor", qb: "Joe Burrow",
    offenseStyle: "vertical, precision passing attack built around Burrow's footwork and Ja'Marr Chase's explosiveness",
    defenseStyle: "multiple-coverage scheme that protects against the deep ball and limits explosive plays",
    strength: "Burrow-to-Chase connection that creates explosive plays against any coverage",
    weakness: "offensive line protection consistency has been an ongoing concern",
    keyPlayer1: { name: "Joe Burrow", pos: "QB", note: "Burrow is the most technically refined quarterback in the AFC. His footwork, pocket navigation, and touch on downfield throws make him extraordinarily dangerous when given time to operate." },
    keyPlayer2: { name: "Ja'Marr Chase", pos: "WR", note: "Chase's combination of speed, route precision, and ball-tracking ability makes him the most dangerous receiver in the AFC. His connection with Burrow is one of the best in professional football and creates explosive play potential on every snap." },
    outlook: ["Cincinnati's offense is capable of scoring in bunches when Burrow is in rhythm. The Bengals' vertical passing game puts points on the board quickly and can overcome deficits in a hurry.", "Zac Taylor's defense has improved each year, focusing on protecting against the explosive play and forcing opponents to execute sustained drives. They're at their best when their pass rush can generate consistent pressure.", "Paycor Stadium brings genuine energy when the Bengals are competitive. Cincinnati's home-field advantage is meaningful in contested divisional games."],
  },
  MIA: {
    coach: "Mike McDaniel", qb: "Tua Tagovailoa",
    offenseStyle: "speed-based, precision passing attack that leverages the NFL's deepest wide receiver corps",
    defenseStyle: "aggressive, pressure-first defense that generates turnovers",
    strength: "speed at the skill positions that creates explosive plays against any coverage",
    weakness: "durability concerns at quarterback have derailed multiple seasons",
    keyPlayer1: { name: "Tua Tagovailoa", pos: "QB", note: "When healthy, Tua is one of the AFC's most accurate passers. His ability to deliver on time and in rhythm makes Miami's speed-based offense extraordinarily difficult to defend against for a full game." },
    keyPlayer2: { name: "Tyreek Hill", pos: "WR", note: "Hill remains the fastest receiver in professional football. His ability to threaten the defense vertically on every snap forces safeties to play deep, which creates space for Miami's other receivers underneath." },
    outlook: ["Miami's offense is built around getting the ball to playmakers in space. McDaniel's scheme leverages the Dolphins' speed advantage on every down, and when Tua is healthy, the results are explosive.", "The Dolphins' defense is built to generate turnovers through aggressive coverage and pressure packages. When Miami can create takeaways, their offense's ability to score quickly makes those advantages decisive.", "Hard Rock Stadium presents challenges for visiting teams, particularly in the heat and humidity of early-season games. Miami's conditioning advantage in warm weather is meaningful."],
  },
  NYJ: {
    coach: "Robert Saleh", qb: "Aaron Rodgers",
    offenseStyle: "experience-driven, play-action attack built around Rodgers' football IQ and downfield precision",
    defenseStyle: "physical, man-coverage defense anchored by elite cornerback play",
    strength: "Rodgers' ability to dissect coverage and avoid sacks through quick processing",
    weakness: "offensive line protection in obvious passing situations",
    keyPlayer1: { name: "Aaron Rodgers", pos: "QB", note: "Rodgers' football IQ remains elite. His ability to process pre-snap information and manipulate defenses with eyes and pump fakes is unmatched. When his mechanics are sound, he still has the arm talent to attack all three levels." },
    keyPlayer2: { name: "Garrett Wilson", pos: "WR", note: "Wilson is one of the most technically refined route runners in the NFL. His ability to create separation against press coverage and make contested catches has made him the Jets' most dangerous offensive weapon." },
    outlook: ["New York's offense under Rodgers is built on precision and patience. The Jets do not beat themselves — Rodgers protects the football and waits for the defense to give up an exploitable look.", "Robert Saleh's defense is built on physicality at the line of scrimmage. When the Jets' defensive line generates pressure, their secondary can play aggressively, which creates a punishing combination for opposing offenses.", "MetLife Stadium is a neutral-site-style environment that benefits the team that executes best. The Jets' home advantage is meaningful when Rodgers is managing games effectively."],
  },
  NE: {
    coach: "Jerod Mayo", qb: "Drake Maye",
    offenseStyle: "developing system built around Maye's arm talent and mobility",
    defenseStyle: "disciplined, scheme-first defense built on Belichick-era principles",
    strength: "defensive discipline and the developmental ceiling Drake Maye represents",
    weakness: "offensive line consistency and skill position depth around the young quarterback",
    keyPlayer1: { name: "Drake Maye", pos: "QB", note: "Maye is one of the most intriguing young quarterbacks in the league. His arm talent, processing speed, and mobility give New England a genuine foundational piece to build around for the next decade." },
    keyPlayer2: { name: "Ja'Lynn Polk", pos: "WR", note: "Polk's route running and ability to create separation in the slot give Maye a reliable intermediate target. His development alongside the young quarterback has been an encouraging sign for the Patriots' rebuild." },
    outlook: ["New England's offense is in development mode, but Maye's ceiling is genuinely elite. When the Patriots get into favorable down-and-distance situations, Maye's ability to improvise and extend plays is a real asset.", "The Patriots' defensive culture remains a strength. Even in a transitional period, New England's defenders play disciplined, assignment-sound football that keeps them competitive in lower-scoring games.", "Gillette Stadium's crowd and weather conditions make it a challenging road environment, particularly in late-season games. The Patriots' home advantage is real and historically impactful."],
  },
  PIT: {
    coach: "Mike Tomlin", qb: "Russell Wilson",
    offenseStyle: "balanced, run-complemented passing attack that relies on Wilson's experience and mobility",
    defenseStyle: "multiple-front, pressure-generating defense with decades of scheme continuity",
    strength: "Mike Tomlin's ability to keep teams competitive regardless of roster construction",
    weakness: "offensive consistency and protecting Wilson in the pocket",
    keyPlayer1: { name: "Russell Wilson", pos: "QB", note: "Wilson's experience and football IQ give Pittsburgh a steady hand at quarterback. His ability to extend plays and make something out of broken situations remains valuable, even as his physical tools have evolved." },
    keyPlayer2: { name: "TJ Watt", pos: "OLB", note: "Watt is the most disruptive pass rusher in the AFC North. His ability to generate pressure on every down forces opposing offenses to account for him with extra blockers, which creates opportunities for Pittsburgh's other defenders." },
    outlook: ["Pittsburgh's defense is the team's identity. Mike Tomlin's defensive continuity and scheme sophistication give the Steelers a genuine competitive advantage that offsets offensive limitations.", "Acrisure Stadium is one of the most intimidating environments for road teams in the AFC. Pittsburgh's crowd and tradition create pressure that affects game management decisions for opposing coaches.", "Tomlin's teams never have losing records. Their ability to compete in close games through discipline and situational football is a genuine organizational strength."],
  },
  CLE: {
    coach: "Kevin Stefanski", qb: "Deshaun Watson",
    offenseStyle: "run-first, physical attack designed to control possession and limit risk",
    defenseStyle: "aggressive, Myles Garrett-anchored defense that disrupts in the backfield",
    strength: "Myles Garrett's impact at defensive end that makes the entire defense better",
    weakness: "offensive consistency and quarterback reliability with Watson's health history",
    keyPlayer1: { name: "Myles Garrett", pos: "DE", note: "Garrett is one of the best defensive players in professional football. His ability to generate pressure on every snap forces offensive coordinators to dedicate extra blockers, which creates advantages elsewhere in Cleveland's defense." },
    keyPlayer2: { name: "Amari Cooper", pos: "WR", note: "Cooper's route precision and ability to win against press coverage give Cleveland a reliable downfield option that can move the chains on third down. He's the offense's most consistent playmaker in contested situations." },
    outlook: ["Cleveland's offense is built around controlling the line of scrimmage and running the football effectively. When the Browns can impose their physical style, they limit possessions and force opponents into low-scoring games.", "Myles Garrett's impact transforms Cleveland's defense into a legitimate threat against any offense. The Browns' ability to disrupt backfield actions makes them dangerous even when the offense is inconsistent.", "FirstEnergy Stadium is one of the more difficult AFC North road environments. Cleveland's home crowd brings genuine energy that affects close games."],
  },
  IND: {
    coach: "Shane Steichen", qb: "Anthony Richardson",
    offenseStyle: "dynamic, dual-threat system built around Richardson's exceptional physical tools",
    defenseStyle: "assignment-sound, zone-heavy scheme designed to limit explosive plays",
    strength: "Richardson's ceiling as a rushing threat that no linebacker can reliably stop",
    weakness: "Richardson's developmental consistency and decision-making in clutch moments",
    keyPlayer1: { name: "Anthony Richardson", pos: "QB", note: "Richardson's physical tools are extraordinary — his combination of arm strength and speed makes him a genuine dual-threat weapon. When he's in rhythm and making quick decisions, the Colts' offense is nearly impossible to defend." },
    keyPlayer2: { name: "Jonathan Taylor", pos: "RB", note: "Taylor remains one of the best pure runners in the AFC. His ability to create yards after contact and break tackles in the open field gives Indianapolis an explosive element in their run game that defenses must prioritize." },
    outlook: ["Indianapolis's offensive ceiling is directly tied to Richardson's consistency. When the young quarterback is decisive and in rhythm, the Colts' combination of his running ability and Taylor's ground game is difficult to contain.", "Shane Steichen's scheme is built to protect Richardson and create favorable situations. The Colts' use of play-action and designed runs keeps defenses from pin-pointing the offense.", "Lucas Oil Stadium creates a genuine home environment for Indianapolis. The Colts' fans are knowledgeable and create pressure for opposing teams in close games."],
  },
  HOU: {
    coach: "DeMeco Ryans", qb: "C.J. Stroud",
    offenseStyle: "precise, quick-rhythm passing attack built around Stroud's processing and Nico Collins' explosiveness",
    defenseStyle: "aggressive, multiple-pressure scheme that creates chaos in opposing backfields",
    strength: "Stroud's ability to read coverages quickly and distribute to open receivers",
    weakness: "red zone execution against physical man-coverage defenses",
    keyPlayer1: { name: "C.J. Stroud", pos: "QB", note: "Stroud's football IQ is exceptional for a second-year quarterback. His ability to process pre-snap information and deliver on time makes Houston's offense efficient on every down." },
    keyPlayer2: { name: "Nico Collins", pos: "WR", note: "Collins' combination of size and speed makes him Stroud's most dangerous downfield target. His ability to beat single coverage vertically and make plays in contested situations gives Houston an explosive element that defenses must account for." },
    outlook: ["Houston's offense is built on efficiency and quick processing. DeMeco Ryans and Stroud have developed a sophisticated system that leverages the young quarterback's strengths and minimizes his exposure to negative plays.", "The Texans' defense is one of the most aggressive in the AFC. DeMeco Ryans' pressure packages create confusion in protection assignments and generate takeaways at a high rate.", "NRG Stadium creates a genuine home environment in Houston. The Texans' fan base has renewed energy behind their young quarterback."],
  },
  TEN: {
    coach: "Brian Callahan", qb: "Will Levis",
    offenseStyle: "developing system built around Levis's arm strength and physical mobility",
    defenseStyle: "disciplined, zone-coverage scheme that limits explosive plays",
    strength: "young talent on both sides of the ball that creates long-term optimism",
    weakness: "offensive consistency and execution in situational football",
    keyPlayer1: { name: "Will Levis", pos: "QB", note: "Levis's arm strength and willingness to attack downfield give Tennessee an explosive element in the passing game. His development trajectory is the most important variable in the Titans' competitive outlook." },
    keyPlayer2: { name: "Tony Pollard", pos: "RB", note: "Pollard's combination of speed and receiving ability out of the backfield makes him a genuine offensive weapon. His ability to create in space gives Levis a reliable check-down option that can become an explosive play." },
    outlook: ["Tennessee's offense is in development mode, but their young talent shows flashes of significant upside. When Levis can execute quick decisions and Pollard can get the ball in space, the Titans' offense is capable of competing with any defense.", "Brian Callahan's defense is built on limiting the big play and forcing sustained drives. When Tennessee can keep opponents under forty points, their offense has enough to win.", "Nissan Stadium brings genuine energy for big home games. Tennessee's home advantage is meaningful in competitive contests."],
  },
  JAX: {
    coach: "Doug Pederson", qb: "Trevor Lawrence",
    offenseStyle: "creative, spread-formation attack built around Lawrence's arm talent and receiver depth",
    defenseStyle: "multiple-coverage scheme that leverages their cornerback depth",
    strength: "Lawrence's playmaking ability that keeps Jacksonville competitive in any game",
    weakness: "consistency through the regular season and avoiding self-inflicted turnovers",
    keyPlayer1: { name: "Trevor Lawrence", pos: "QB", note: "Lawrence's arm talent and competitive drive make him one of the AFC's most dangerous quarterbacks when the Jaguars are executing. His ability to extend plays and attack downfield keeps defenses from being comfortable." },
    keyPlayer2: { name: "Calvin Ridley", pos: "WR", note: "Ridley's route running precision and ability to create separation against press coverage give Lawrence a reliable deep option. He's at his best on go routes and post patterns that attack the defense vertically." },
    outlook: ["Jacksonville's offense is built on Lawrence's ability to make plays in structure and outside of it. When the Jaguars can establish balance and get Lawrence in rhythm, they're capable of scoring on any defense.", "Doug Pederson's scheme leverages Jacksonville's athlete depth and creates favorable matchups through creative formation usage. The Jaguars are at their best when they can dictate the game's tempo.", "TIAA Bank Field brings competitive energy when Jacksonville is winning. The Jaguars' home advantage is meaningful when the team is performing at a high level."],
  },
  LAC: {
    coach: "Jim Harbaugh", qb: "Justin Herbert",
    offenseStyle: "balanced, physical attack that pairs Herbert's arm talent with a disciplined run game",
    defenseStyle: "aggressive, multiple-front defense that generates pressure with four rushers",
    strength: "Herbert's arm talent and the organizational discipline Harbaugh has installed",
    weakness: "offensive line consistency protecting Herbert in obvious passing situations",
    keyPlayer1: { name: "Justin Herbert", pos: "QB", note: "Herbert's combination of size, arm strength, and football IQ makes him one of the AFC's most talented quarterbacks. Under Harbaugh's disciplined system, he's become more decisive and effective in rhythm." },
    keyPlayer2: { name: "Keenan Allen", pos: "WR", note: "Allen's route precision and ability to win against zone coverage make him Herbert's most reliable option on third down. His experience and football IQ help him manipulate coverage and find the open window." },
    outlook: ["Los Angeles's offense under Harbaugh is more disciplined and balanced than the Chargers' previous iterations. When Herbert can operate play-action off a functional run game, the offense reaches its ceiling.", "Jim Harbaugh's defensive philosophy prioritizes generating pressure with the front four. The Chargers' ability to create disruption without blitzing gives their secondary an advantage in coverage.", "SoFi Stadium is a premium environment that creates challenges for both teams. Los Angeles's home advantage is meaningful in close contests."],
  },
  LV: {
    coach: "Antonio Pierce", qb: "Gardner Minshew",
    offenseStyle: "efficient, game-management system built around protecting the football",
    defenseStyle: "aggressive, pressure-based defense designed to create short fields for the offense",
    strength: "Allegiant Stadium's atmosphere and a passionate fanbase",
    weakness: "quarterback limitations that cap the offense's ceiling in high-scoring games",
    keyPlayer1: { name: "Gardner Minshew", pos: "QB", note: "Minshew's football IQ and ability to protect the ball give Las Vegas a functional offensive floor. He's at his best when the Raiders can establish the run and use play-action to attack the defense." },
    keyPlayer2: { name: "Davante Adams", pos: "WR", note: "Adams' route running precision is elite. His ability to create separation against any coverage and win in the red zone makes him the Raiders' most reliable offensive weapon regardless of the quarterback situation." },
    outlook: ["Las Vegas's offense is built on ball security and establishing the run. When the Raiders can control possession and limit turnovers, their defense gives them a chance to win close games.", "Antonio Pierce's defense is built on aggression and creating chaos in opposing backfields. The Raiders' pressure packages are designed to force quick decisions and generate turnovers.", "Allegiant Stadium is one of the most visually spectacular environments in professional sports. The Raiders' home-field advantage is genuine and impacts how visiting teams approach game management."],
  },
  DEN: {
    coach: "Sean Payton", qb: "Bo Nix",
    offenseStyle: "creative, play-action system designed to leverage Nix's mobility and Payton's scheme ingenuity",
    defenseStyle: "physical, multiple-front defense that disrupts opposing offenses at the line",
    strength: "Sean Payton's offensive creativity and the Mile High altitude advantage",
    weakness: "Nix's consistency and execution in clutch, high-leverage moments",
    keyPlayer1: { name: "Bo Nix", pos: "QB", note: "Nix's mobility and arm strength give Denver an explosive offensive element when he's in rhythm. His development under Payton's system has been encouraging, and his ability to improvise keeps defenses from being predictable in their coverage calls." },
    keyPlayer2: { name: "Courtland Sutton", pos: "WR", note: "Sutton's combination of size and contested-catch ability makes him Nix's most reliable downfield target. His willingness to compete for the ball in traffic and his red-zone presence give Denver a genuine weapon in scoring situations." },
    outlook: ["Denver's offense under Sean Payton is built on creativity and misdirection. When Nix can execute the scheme's demands and Payton's play-action concepts hit, the Broncos' offense is capable of competing with any defense.", "Mile High Stadium's altitude creates a genuine performance advantage for Denver. Visiting teams — particularly those coming from sea level — have historically struggled in the second half as fatigue compounds.", "Empower Field at Mile High brings electric energy when the Broncos are competitive. Denver's home advantage is one of the most tangible in the AFC."],
  },
  SEA: {
    coach: "Mike Macdonald", qb: "Geno Smith",
    offenseStyle: "balanced, quick-rhythm attack that leverages Smith's accuracy and a deep receiving corps",
    defenseStyle: "aggressive, Legion-of-Boom-inspired press-coverage scheme",
    strength: "CenturyLink Field's crowd noise and the 12th Man home-field advantage",
    weakness: "late-season consistency and ability to sustain drives against physical defenses",
    keyPlayer1: { name: "Geno Smith", pos: "QB", note: "Smith's accuracy and football IQ have made him a reliable starter. His ability to operate efficiently in the short-to-intermediate area and protect the football gives Seattle a consistent offensive floor." },
    keyPlayer2: { name: "DK Metcalf", pos: "WR", note: "Metcalf's combination of size and speed makes him one of the NFC's most physically imposing wide receivers. His ability to threaten the deep ball forces safeties to play deep, which opens up the rest of Seattle's offense underneath." },
    outlook: ["Seattle's offense is built on efficiency and taking care of the football. When Smith can spread the ball around and the Seahawks establish their run game, they control games and limit opponent possessions.", "Mike Macdonald's defensive system is built on press coverage and creating disruption at the line of scrimmage. Seattle's cornerback depth and willingness to be physical at the line creates advantages against timing-based offenses.", "Lumen Field is one of the loudest environments in professional football. The 12s create a genuine home-field advantage that has impacted games at a measurable rate over the past decade."],
  },
  LAR: {
    coach: "Sean McVay", qb: "Matthew Stafford",
    offenseStyle: "innovative, motion-heavy passing attack with creative pre-snap movement",
    defenseStyle: "aggressive, Suh-era-inspired front that creates disruption at every level",
    strength: "McVay's scheme creativity and Stafford's experience in pressure situations",
    weakness: "offensive line depth and protecting an aging quarterback against elite pass rushers",
    keyPlayer1: { name: "Matthew Stafford", pos: "QB", note: "Stafford's experience and competitiveness make him valuable in high-stakes situations. His willingness to attack downfield and make difficult throws under pressure gives the Rams an explosive element that McVay's system leverages effectively." },
    keyPlayer2: { name: "Cooper Kupp", pos: "WR", note: "Kupp's route precision and ability to find open space in zone coverage make him Stafford's most reliable option on critical downs. His understanding of McVay's system is the deepest on the roster." },
    outlook: ["Sean McVay's offensive system is the most innovative in the NFC. His ability to create clean looks for Stafford through pre-snap motion and creative formation usage is a genuine week-to-week advantage.", "Los Angeles's defense has improved through strategic roster construction. When the Rams can generate pressure and their secondary can execute McVay's coverage calls, they're competitive against any offense.", "SoFi Stadium is a premium environment that challenges visiting teams. The Rams' home advantage is meaningful in contested games."],
  },
  ARI: {
    coach: "Jonathan Gannon", qb: "Kyler Murray",
    offenseStyle: "fast-paced, spread-option attack built around Murray's dual-threat ability",
    defenseStyle: "zone-heavy coverage scheme designed to limit explosive plays",
    strength: "Murray's elite mobility and the offense's ability to generate big plays quickly",
    weakness: "consistency and protecting Murray in the pocket against physical pass rushers",
    keyPlayer1: { name: "Kyler Murray", pos: "QB", note: "Murray's speed and agility make him one of the most dangerous quarterbacks in space. When healthy, his ability to extend plays and create out of structure gives Arizona an explosive element that defenses cannot fully prepare for." },
    keyPlayer2: { name: "Marvin Harrison Jr.", pos: "WR", note: "Harrison Jr. brings elite physical tools to Arizona's passing game. His combination of size, speed, and polished route running makes him a legitimate star in a young offense still finding its identity." },
    outlook: ["Arizona's offense under Gannon is building an identity around Murray's mobility and the young talent surrounding him. When the Cardinals can establish pace and force defenses into space, their offense reaches its ceiling.", "The Cardinals' defense is in development mode, prioritizing limiting big plays over generating turnovers. When Arizona can keep games close, Murray's ability to create gives them a chance to win.", "State Farm Stadium is a modern, comfortable environment that creates a decent home atmosphere for Arizona."],
  },
  ATL: {
    coach: "Raheem Morris", qb: "Kirk Cousins",
    offenseStyle: "dynamic, multi-weapon attack that leverages Cousins' accuracy and Bijan Robinson's versatility",
    defenseStyle: "aggressive, zone-based scheme designed to create takeaways",
    strength: "Bijan Robinson's dual-threat ability as both a runner and receiver out of the backfield",
    weakness: "Cousins' durability and ability to maintain efficiency under sustained defensive pressure",
    keyPlayer1: { name: "Kirk Cousins", pos: "QB", note: "Cousins brings accuracy and experience to Atlanta's offense. His ability to deliver in rhythm and exploit soft zones makes him reliable in game-management situations and effective when the scheme creates clean looks." },
    keyPlayer2: { name: "Bijan Robinson", pos: "RB", note: "Robinson's combination of power, speed, and receiving ability out of the backfield makes him one of the most complete running backs in the NFC. His threat on every down forces defenses to account for him both as a runner and as a receiver." },
    outlook: ["Atlanta's offense is built around Robinson's versatility and Cousins' accuracy. When the Falcons can get Robinson in space and Cousins in rhythm with his receivers, their offense creates favorable situations consistently.", "Raheem Morris has built an aggressive defensive identity in Atlanta. The Falcons create turnovers at a meaningful rate when their pressure packages get home.", "Mercedes-Benz Stadium is one of the most modern facilities in professional sports. Atlanta's home advantage is meaningful in contested games."],
  },
  NO: {
    coach: "Dennis Allen", qb: "Derek Carr",
    offenseStyle: "balanced, precise attack built around the Saints' historical ability to manufacture points",
    defenseStyle: "physical, New Orleans-style defense built on shutting down the run",
    strength: "the Superdome atmosphere and decades of competitive culture",
    weakness: "Carr's consistency and offensive line protection in adverse situations",
    keyPlayer1: { name: "Derek Carr", pos: "QB", note: "Carr's experience and accuracy make him a reliable game manager in New Orleans' system. His ability to get the ball to his playmakers quickly and protect the football is the foundation of the Saints' offensive identity." },
    keyPlayer2: { name: "Chris Olave", pos: "WR", note: "Olave's speed and route precision make him Carr's most dangerous downfield option. His ability to threaten the vertical game forces safeties to play deep, which opens space for New Orleans' underneath passing game." },
    outlook: ["New Orleans' offense is built on Payton-era principles even without Payton. The Saints generate competitive scores through precision and ball security rather than explosive plays.", "The Superdome crowd is one of the most impactful in the NFC South. New Orleans' home advantage is genuine and historically decisive in close games.", "Dennis Allen's defense prioritizes stopping the run and limiting possession time. When the Saints can keep opponents off the field, their offense's ball-control style creates an advantage."],
  },
  TB: {
    coach: "Todd Bowles", qb: "Baker Mayfield",
    offenseStyle: "balanced, veteran-led attack that prioritizes ball security and big-play potential",
    defenseStyle: "aggressive, pressure-generating defense that leverages elite edge rusher talent",
    strength: "Mayfield's confidence and ability to deliver in critical game situations",
    weakness: "offensive consistency when the run game struggles to establish momentum",
    keyPlayer1: { name: "Baker Mayfield", pos: "QB", note: "Mayfield's confidence and arm talent have made him a genuine competitor in the NFC South. His ability to deliver in clutch situations and attack downfield gives Tampa Bay an explosive passing game when he's in rhythm." },
    keyPlayer2: { name: "Mike Evans", pos: "WR", note: "Evans' combination of size and competitiveness makes him one of the most reliable receivers in the NFC. His ability to win in contested situations and convert on third downs has been consistent throughout his career in Tampa Bay." },
    outlook: ["Tampa Bay's offense under Bowles is built on balance and protecting Mayfield. When the Buccaneers can establish the run and use play-action to create explosive opportunities, they're competitive with any offense in the NFC.", "Todd Bowles' defense is built on generating pressure and creating negative plays. When the Buccaneers' front four gets home consistently, their coverage scheme is effective enough to win games.", "Raymond James Stadium brings solid energy when Tampa Bay is competitive. The home advantage is meaningful in NFC South divisional games."],
  },
  CAR: {
    coach: "Dave Canales", qb: "Bryce Young",
    offenseStyle: "developing, creative system built around Young's processing ability and mobility",
    defenseStyle: "zone-based coverage scheme focused on limiting explosive plays during a rebuild",
    strength: "coaching development and Bryce Young's growing comfort in the system",
    weakness: "roster depth and the cumulative challenges of a rebuild on both sides of the ball",
    keyPlayer1: { name: "Bryce Young", pos: "QB", note: "Young's football intelligence and processing speed are genuine. His ability to navigate the pocket and make accurate throws in tight windows gives Carolina a foundational piece to build the offense around as the roster improves." },
    keyPlayer2: { name: "Adam Thielen", pos: "WR", note: "Thielen's experience and route running IQ give Young a reliable option in the intermediate area. His ability to find soft spots in zone coverage and convert on third down is the offensive unit's most consistent element." },
    outlook: ["Carolina's offense is in a developmental phase, but Young's growth within Canales' system has been encouraging. When the Panthers can create favorable situations and get Young in rhythm, they're competitive.", "Dave Canales' defense is focused on limiting the damage in a rebuild phase. The Panthers prioritize avoiding the catastrophic play and keeping games close enough for their offense to compete.", "Bank of America Stadium creates a solid home atmosphere for Carolina in competitive games."],
  },
  MIN: {
    coach: "Kevin O'Connell", qb: "Sam Darnold",
    offenseStyle: "creative, motion-heavy attack built around Justin Jefferson's talent",
    defenseStyle: "zone-heavy coverage scheme leveraging cornerback talent",
    strength: "Justin Jefferson's ability to create mismatches that cannot be eliminated by any coverage",
    weakness: "Darnold's consistency in critical moments and decision-making under pressure",
    keyPlayer1: { name: "Justin Jefferson", pos: "WR", note: "Jefferson is a generational talent who creates advantages against any coverage. His combination of route precision, contested-catch ability, and explosiveness after the catch makes him the most dangerous receiver in the NFC North." },
    keyPlayer2: { name: "Sam Darnold", pos: "QB", note: "Darnold's experience and mobility give Minnesota a functional quarterback in O'Connell's system. When he's decisive and getting the ball to Jefferson early, the Vikings' offense generates consistent production." },
    outlook: ["Kevin O'Connell's scheme is designed to maximize Jefferson's impact on every possession. When the Vikings can get their star receiver in space early, the entire offense opens up around him.", "Minnesota's defense is built around limiting the big play and creating pressure through stunts and movement. When the Vikings can keep games close, their offense's ability to score quickly creates a meaningful advantage.", "US Bank Stadium is one of the loudest indoor environments in professional sports. Minnesota's home advantage is genuine and consistently impacts close games."],
  },
  CHI: {
    coach: "Ben Johnson", qb: "Caleb Williams",
    offenseStyle: "innovative, Williams-tailored system built around his arm talent and mobility",
    defenseStyle: "developing defensive scheme focused on creating turnovers",
    strength: "Williams' ceiling as a passer and the offensive creativity Ben Johnson brings",
    weakness: "youth and inexperience in high-leverage situations throughout the roster",
    keyPlayer1: { name: "Caleb Williams", pos: "QB", note: "Williams' arm talent and mobility make him one of the most exciting quarterbacks in the NFL. His ability to make difficult throws in tight windows and extend plays with his legs gives Chicago an explosive ceiling that grows with each week of experience." },
    keyPlayer2: { name: "DJ Moore", pos: "WR", note: "Moore's route precision and ability to create separation against press coverage give Williams a reliable target at every level of the field. His comfort in Johnson's system has made him the Bears' most consistent offensive producer." },
    outlook: ["Chicago's offense under Ben Johnson is building something genuinely exciting. When Williams can operate in structure and Johnson's creative play design creates clean looks, the Bears' offense shows the potential to compete at a high level.", "The Bears' defense is in development mode but shows improvement. When Chicago can generate turnovers and protect field position, Williams' ability to score quickly makes those advantages decisive.", "Soldier Field's historic atmosphere creates a meaningful home-field advantage. Chicago's crowd is passionate and consistently impacts the opponent's ability to communicate."],
  },
  WAS: {
    coach: "Dan Quinn", qb: "Jayden Daniels",
    offenseStyle: "dynamic, RPO-heavy attack built around Daniels' elite dual-threat ability",
    defenseStyle: "aggressive, multiple-front defense that pressures quarterbacks at a high rate",
    strength: "Daniels' mobility and the offense's ability to create explosive plays through the air and on the ground",
    weakness: "experience managing high-pressure playoff-caliber environments",
    keyPlayer1: { name: "Jayden Daniels", pos: "QB", note: "Daniels is one of the most exciting young quarterbacks in the league. His elite mobility combined with genuine arm talent makes the Commanders' offense impossible to defend without accounting for his running threat on every snap." },
    keyPlayer2: { name: "Terry McLaurin", pos: "WR", note: "McLaurin's ability to create separation vertically and compete in contested situations makes him Daniels' most dangerous downfield target. His reliability on critical downs and red-zone presence give Washington a legitimate threat in scoring situations." },
    outlook: ["Washington's offense under Dan Quinn is one of the most dynamic in the NFC. When Daniels can operate in space and the Commanders can establish their dual-threat rhythm, they create explosive plays against any defense.", "Quinn's defense is built on pressure and taking away the opponent's primary option. When Washington can disrupt the quarterback's timing, their secondary creates takeaways at a meaningful rate.", "Northwest Stadium brings competitive energy for Washington's home games. The Commanders' fan base has renewed enthusiasm behind their exciting young quarterback."],
  },
  NYG: {
    coach: "Brian Daboll", qb: "Daniel Jones",
    offenseStyle: "run-first, physical attack designed to control the clock and protect the quarterback",
    defenseStyle: "multiple-front defense built around creating sacks and disrupting timing",
    strength: "Saquon Barkley's ability to create explosive plays as both a runner and receiver",
    weakness: "Jones' consistency in generating the downfield production needed to complement the run game",
    keyPlayer1: { name: "Daniel Jones", pos: "QB", note: "Jones' mobility and competitive drive give New York a quarterback capable of manufacturing plays outside of structure. His development within Daboll's system has been inconsistent, but his ceiling in favorable game situations is real." },
    keyPlayer2: { name: "Darius Slayton", pos: "WR", note: "Slayton's speed and ability to create vertical opportunities make him the Giants' most dangerous downfield threat. His willingness to attack the deep ball gives Jones an option to create explosive plays against aggressive coverages." },
    outlook: ["New York's offense is built on Barkley's ability to control games as a runner and receiver. When the Giants can establish the run and force defenses into predictable coverage, Jones' downfield ability creates explosive opportunities.", "Brian Daboll's defense is built on disrupting opposing quarterbacks through pressure. When the Giants can keep opponents out of rhythm, their disciplined coverage scheme keeps them competitive in low-scoring games.", "MetLife Stadium creates a competitive environment for New York. The Giants' home advantage is meaningful when the team is performing at a high level."],
  },
};

function getProfile(abbr: string): TeamProfile {
  return TEAM_PROFILES[abbr.toUpperCase()] ?? {
    coach: "Head Coach",
    qb: "the quarterback",
    offenseStyle: "balanced offensive attack",
    defenseStyle: "disciplined defensive scheme",
    strength: "depth and competitive culture",
    weakness: "consistency in high-leverage situations",
    keyPlayer1: { name: "The Starting QB", pos: "QB", note: "Brings leadership and playmaking ability to the offense." },
    keyPlayer2: { name: "Lead Receiver", pos: "WR", note: "Provides the offense with a reliable downfield option." },
    outlook: [
      "This team will look to establish their identity early and control the game's tempo.",
      "Their defensive scheme is designed to limit the opponent's explosive plays and force sustained drives.",
      "Late-game execution will be key to their success in this matchup.",
    ],
  };
}

// ─── Intro variants ───────────────────────────────────────────────────────────

const INTRO_TEMPLATES = [
  (away: string, home: string, w: number, venue?: string) =>
    `<p>Week ${w} brings one of the most compelling matchups on the schedule as the <strong>${away}</strong> travel to take on the <strong>${home}</strong>${venue ? ` at ${venue}` : ""}. Both franchises arrive with something to prove, and this contest has all the ingredients of a hard-fought, meaningful game. Here is everything you need to know heading into kickoff.</p>`,
  (away: string, home: string, w: number, venue?: string) =>
    `<p>The Week ${w} NFL schedule delivers a compelling road test as the <strong>${away}</strong> make the trip to face the <strong>${home}</strong>${venue ? ` at ${venue}` : ""}. With stakes rising across the league, this matchup carries weight for both franchises. Here is our full preview and prediction.</p>`,
  (away: string, home: string, w: number, venue?: string) =>
    `<p>Week ${w} features an intriguing inter-conference battle as the <strong>${away}</strong> head on the road to challenge the <strong>${home}</strong>${venue ? ` inside ${venue}` : ""}. Both teams are looking to build momentum, and the matchup presents fascinating strategic questions on both sides of the ball. Here is the complete breakdown.</p>`,
  (away: string, home: string, w: number, venue?: string) =>
    `<p>One of the more anticipated matchups on the Week ${w} NFL slate pits the road-weary <strong>${away}</strong> against a <strong>${home}</strong> side eager to protect their home field${venue ? ` at ${venue}` : ""}. The stakes, the storylines, and the scheme matchups all make this a game worth watching closely. Here is our full preview.</p>`,
];

const H2H_TEMPLATES = [
  (away: string, home: string) =>
    `<p>The history between these two franchises adds an extra layer of intrigue to this Week matchup. The <strong>${home}</strong> have enjoyed home-field advantage in this series over recent years, but the <strong>${away}</strong> have proven capable of winning on the road against quality opponents. Neither team carries significant playoff baggage into this regular-season meeting, which keeps the emphasis squarely on execution and scheme.</p><p>Recent meetings have been competitive, with the margin of victory often coming down to turnover differential and third-down conversion rates. Expect this game to follow a similar pattern — the team that protects the ball and converts in critical moments will find a way to win.</p>`,
  (away: string, home: string) =>
    `<p>The series between the <strong>${away}</strong> and the <strong>${home}</strong> has produced several memorable moments in recent years, and both organizations have quality players who remember the results. Home-field advantage has been a factor historically, giving the ${home} a slight edge in games played at their stadium.</p><p>The coaching staffs on both sides have familiarity with each other's personnel tendencies, which typically results in game plans that prioritize scheme discipline over trick plays. Expect this meeting to be decided by execution, depth, and which team makes fewer mistakes in the second half.</p>`,
  (away: string, home: string) =>
    `<p>While this matchup does not carry the weight of a decades-long rivalry, the <strong>${away}</strong> and <strong>${home}</strong> have developed a competitive thread in recent seasons. Both franchises are trending in similar directions, which makes this week's game meaningful beyond the standings.</p><p>The last time these teams met, field position and turnover margin proved decisive. Both coaching staffs will emphasize ball security and red-zone efficiency as key performance indicators heading into this week's contest.</p>`,
];

const KEYS_TEMPLATES = [
  (away: string, home: string, ap: TeamProfile, hp: TeamProfile) => `
<ul>
  <li><strong>Turnover battle:</strong> The team that protects the football will control the scoreboard. Both offenses are capable of scoring in bunches, meaning a single turnover in the wrong moment can flip the outcome entirely.</li>
  <li><strong>${away} third-down conversion:</strong> The ${away} must stay ahead of the chains to keep ${hp.qb} and the ${home} offense on the sideline. Sustained drives that end in points — rather than punts — will be the difference between a comfortable victory and a close game.</li>
  <li><strong>Home-field advantage for ${home}:</strong> ${hp.coach}'s team has been strong at home this season. The crowd, familiar field conditions, and comfort of a known environment give them a structural edge that the ${away} must overcome through consistent execution.</li>
</ul>`,
  (away: string, home: string, ap: TeamProfile, hp: TeamProfile) => `
<ul>
  <li><strong>Controlling the line of scrimmage:</strong> Both teams have invested heavily in their offensive lines, and whichever front five dominates in the trenches will dictate the game's flow. Physical dominance at the point of attack is the most reliable path to victory in this matchup.</li>
  <li><strong>${hp.qb} vs. the ${away} pass rush:</strong> ${hp.qb}'s ability to avoid sacks and deliver on third down is the ${home}'s most important offensive variable. If the ${away} can generate consistent pressure, it disrupts the entire ${home} offensive rhythm.</li>
  <li><strong>Red-zone efficiency:</strong> Both defenses are capable of limiting long touchdown drives but susceptible to giving up points in the red zone. The team that converts its scoring opportunities — rather than settling for field goals — will almost certainly win this game.</li>
</ul>`,
  (away: string, home: string, ap: TeamProfile, hp: TeamProfile) => `
<ul>
  <li><strong>Special teams execution:</strong> Field position is often overlooked but consistently proves decisive in evenly matched games. A muffed punt, a long kick return, or a blocked field goal can change the entire strategic calculus for both coaching staffs.</li>
  <li><strong>${ap.qb}'s rhythm in the first half:</strong> The ${away} need their quarterback operating in rhythm early. If ${ap.qb} can establish confidence through the first two possessions, the offense will find its footing and put pressure on the ${home} defense throughout the game.</li>
  <li><strong>Defensive adjustments at halftime:</strong> Both ${ap.coach} and ${hp.coach} are respected in-game adjusters. Whoever makes the better halftime correction — whether it's scheme, personnel, or tempo — will likely see the benefit in the third quarter when games often swing.</li>
</ul>`,
];

const PREDICTION_TEMPLATES = [
  (away: string, home: string, ap: TeamProfile, hp: TeamProfile) =>
    `<p>This is a competitive matchup that could go either way, but the home-field advantage tips the scales toward the <strong>${home}</strong>. ${hp.coach}'s team has the personnel to exploit the ${away}'s <strong>${ap.weakness}</strong>, and their <strong>${hp.strength}</strong> should prove decisive in the second half.</p><p>The <strong>${away}</strong> will compete and keep this game close — ${ap.qb} is too good to be completely shut out — but the ${home} should find a way to win at home. Look for a contested final score with the ${home} pulling away in the fourth quarter as ${hp.qb} manages the game and the defense makes a critical stop.</p><p><strong>Prediction: ${home} win</strong></p>`,
  (away: string, home: string, ap: TeamProfile, hp: TeamProfile) =>
    `<p>The <strong>${away}</strong> are a dangerous road team, and ${ap.qb}'s ability to create off-schedule plays makes them a threat to win this game outright. But the <strong>${home}</strong> have the structural advantage — home field, scheme familiarity, and the continuity that ${hp.coach}'s program has built over time.</p><p>Expect the ${away} to make this competitive well into the fourth quarter. Their <strong>${ap.strength}</strong> will generate scoring opportunities and keep the game tight. In the end, the ${home} should hold on behind ${hp.qb}'s steady performance and a defense that limits explosive plays when it matters most.</p><p><strong>Prediction: ${home} win in a close game</strong></p>`,
  (away: string, home: string, ap: TeamProfile, hp: TeamProfile) =>
    `<p>This game sets up as a genuine toss-up, with both teams capable of winning depending on execution and turnovers. The <strong>${away}</strong>'s <strong>${ap.strength}</strong> gives them a real path to victory on the road, but the <strong>${home}</strong>'s <strong>${hp.strength}</strong> is a consistent advantage that tends to show up in close games.</p><p>Our lean is toward the ${home} based on home-field advantage and ${hp.coach}'s track record in contested games. But do not be surprised if ${ap.qb} and the ${away} keep this within one score until the final minutes. This is exactly the kind of game that makes the NFL the most compelling weekly sports product in the world.</p><p><strong>Prediction: ${home} win, but cover is in question</strong></p>`,
];

// ─── Deterministic pick based on game data ───────────────────────────────────

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function hashStr(s: string): number {
  let h = 0;
  for (const c of s) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

// ─── Main generator ───────────────────────────────────────────────────────────

function generateContent(game: {
  awayTeamFull: string;
  homeTeamFull: string;
  awayTeam: string;
  homeTeam: string;
  week: number;
  season: number;
  kickoff: Date;
  venue?: string;
  network?: string;
}): { title: string; excerpt: string; content: string; metaTitle: string; metaDescription: string; tags: string[] } {
  const { awayTeamFull: away, homeTeamFull: home, awayTeam, homeTeam, week, season, venue, network } = game;
  const ap = getProfile(awayTeam);
  const hp = getProfile(homeTeam);
  const seed = hashStr(`${away}-${home}-${week}-${season}`);

  const kickoffStr = new Date(game.kickoff).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const intro = pick(INTRO_TEMPLATES, seed)(away, home, week, venue);
  const h2h = pick(H2H_TEMPLATES, seed + 1)(away, home);
  const keys = pick(KEYS_TEMPLATES, seed + 2)(away, home, ap, hp);
  const prediction = pick(PREDICTION_TEMPLATES, seed + 3)(away, home, ap, hp);

  const content = `
<h2>Game Overview</h2>
${intro}

<h2>${away} Outlook</h2>
<p>${pick(ap.outlook, seed)}${network ? ` The game airs on <strong>${network}</strong>, giving this matchup national exposure that reflects its competitive quality.` : ""}</p>
<p>Head coach <strong>${ap.coach}</strong> has built a team around a <strong>${ap.offenseStyle}</strong> on offense and a <strong>${ap.defenseStyle}</strong> on defense. The team's primary strength is <strong>${ap.strength}</strong>, while the coaching staff will be looking to shore up their <strong>${ap.weakness}</strong> heading into this week's contest.</p>
<p>${pick(ap.outlook, seed + 1)}</p>

<h2>${home} Outlook</h2>
<p>${pick(hp.outlook, seed + 2)}</p>
<p><strong>${hp.coach}</strong> has the ${home} operating a <strong>${hp.offenseStyle}</strong> complemented by a <strong>${hp.defenseStyle}</strong>. Their biggest advantage this week is <strong>${hp.strength}</strong>, which presents a meaningful challenge for the visiting ${away}.</p>
<p>${pick(hp.outlook, seed + 3)}</p>

<h2>Key Players to Watch</h2>

<h3>${ap.keyPlayer1.name} — ${ap.keyPlayer1.pos}, ${away}</h3>
<p>${ap.keyPlayer1.note}</p>

<h3>${ap.keyPlayer2.name} — ${ap.keyPlayer2.pos}, ${away}</h3>
<p>${ap.keyPlayer2.note}</p>

<h3>${hp.keyPlayer1.name} — ${hp.keyPlayer1.pos}, ${home}</h3>
<p>${hp.keyPlayer1.note}</p>

<h3>${hp.keyPlayer2.name} — ${hp.keyPlayer2.pos}, ${home}</h3>
<p>${hp.keyPlayer2.note}</p>

<h2>Head-to-Head History</h2>
${h2h}

<h2>Keys to the Game</h2>
${keys}

<h2>Prediction</h2>
<p><em>Kickoff: ${kickoffStr}${venue ? ` | ${venue}` : ""}${network ? ` | ${network}` : ""}</em></p>
${prediction}
`.trim();

  const title = `${away} vs ${home}: Week ${week} Matchup Preview & Predictions`;
  const excerpt = `Complete Week ${week} preview for ${away} at ${home}. Team analysis, key players to watch, head-to-head history, and our final score prediction for the ${season} NFL season.`;
  const metaTitle = `${away} vs ${home} Week ${week} Preview | NFL Predictions Hub`;
  const metaDescription = `${away} at ${home} — Week ${week} matchup preview with predictions, key players, and analysis for the ${season} NFL season.`;
  const tags = [away, home, `Week ${week}`, "Matchup Preview", "NFL Predictions", `${season} NFL Season`, "NFL Analysis"];

  return { title, excerpt, content, metaTitle, metaDescription, tags };
}

// ─── Runner ───────────────────────────────────────────────────────────────────

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected to MongoDB");

  const query: Record<string, unknown> = { status: "scheduled" };
  if (weekArg) query.week = weekArg;
  if (seasonArg) query.season = seasonArg;

  const games = await Game.find(query).sort({ week: 1, kickoff: 1 }).lean();

  if (games.length === 0) {
    console.log("No scheduled games found for the given filters.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${games.length} scheduled game(s)${weekArg ? ` for Week ${weekArg}` : ""}.\n`);

  let created = 0, skipped = 0, failed = 0;

  for (const game of games) {
    const label = `${game.awayTeamFull} @ ${game.homeTeamFull} (W${game.week})`;
    const slug = slugify(
      `${game.awayTeamFull}-vs-${game.homeTeamFull}-week-${game.week}-${game.season}-preview`,
      { lower: true, strict: true }
    );

    const existing = await Post.exists({ slug });
    if (existing && !overwrite) {
      console.log(`  ⟳ skip   ${label}`);
      skipped++;
      continue;
    }

    process.stdout.write(`  ✎ gen    ${label}…`);

    try {
      const { title, excerpt, content, metaTitle, metaDescription, tags } = generateContent(game);
      const doc = { slug, title, excerpt, content, author: "NFL Predictions Hub Staff", tags, published: true, metaTitle, metaDescription };

      if (existing && overwrite) {
        await Post.updateOne({ slug }, { $set: doc });
        process.stdout.write(" updated\n");
      } else {
        await Post.create(doc);
        process.stdout.write(" created\n");
      }
      created++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stdout.write(` FAILED: ${msg}\n`);
      failed++;
    }
  }

  console.log(`\n✓ Done: ${created} created, ${skipped} skipped, ${failed} failed.`);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
