import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

export const maxDuration = 30;

// ── helpers ────────────────────────────────────────────────────────────────
function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}
function hashStr(s: string): number {
  let h = 0;
  for (const c of s) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

// ── team lookup ────────────────────────────────────────────────────────────
const TEAM_NAMES: Record<string, string> = {
  "chiefs": "KC", "kansas city": "KC",
  "ravens": "BAL", "baltimore": "BAL",
  "bills": "BUF", "buffalo": "BUF",
  "eagles": "PHI", "philadelphia": "PHI",
  "49ers": "SF", "san francisco": "SF", "niners": "SF",
  "lions": "DET", "detroit": "DET",
  "packers": "GB", "green bay": "GB",
  "cowboys": "DAL", "dallas": "DAL",
  "bengals": "CIN", "cincinnati": "CIN",
  "dolphins": "MIA", "miami": "MIA",
  "jets": "NYJ", "new york jets": "NYJ",
  "patriots": "NE", "new england": "NE",
  "steelers": "PIT", "pittsburgh": "PIT",
  "browns": "CLE", "cleveland": "CLE",
  "colts": "IND", "indianapolis": "IND",
  "texans": "HOU", "houston": "HOU",
  "titans": "TEN", "tennessee": "TEN",
  "jaguars": "JAX", "jacksonville": "JAX",
  "chargers": "LAC", "los angeles chargers": "LAC",
  "raiders": "LV", "las vegas": "LV",
  "broncos": "DEN", "denver": "DEN",
  "seahawks": "SEA", "seattle": "SEA",
  "rams": "LAR", "los angeles rams": "LAR",
  "cardinals": "ARI", "arizona": "ARI",
  "falcons": "ATL", "atlanta": "ATL",
  "saints": "NO", "new orleans": "NO",
  "buccaneers": "TB", "tampa bay": "TB", "bucs": "TB",
  "panthers": "CAR", "carolina": "CAR",
  "vikings": "MIN", "minnesota": "MIN",
  "bears": "CHI", "chicago": "CHI",
  "commanders": "WAS", "washington": "WAS",
  "giants": "NYG", "new york giants": "NYG",
};

function detectTeams(title: string): string[] {
  const lower = title.toLowerCase();
  const found: string[] = [];
  // sort by length desc so "new england" matches before "england"
  const entries = Object.entries(TEAM_NAMES).sort((a, b) => b[0].length - a[0].length);
  for (const [name, abbr] of entries) {
    if (lower.includes(name) && !found.includes(abbr)) {
      found.push(abbr);
    }
  }
  return found;
}

// ── team profiles ──────────────────────────────────────────────────────────
interface TeamProfile {
  name: string; coach: string; qb: string;
  offenseStyle: string; defenseStyle: string;
  strength: string; weakness: string;
  keyPlayer1: { name: string; pos: string; note: string };
  keyPlayer2: { name: string; pos: string; note: string };
  outlook: string[];
}

const TEAM_PROFILES: Record<string, TeamProfile> = {
  KC: { name: "Kansas City Chiefs", coach: "Andy Reid", qb: "Patrick Mahomes", offenseStyle: "dynamic, play-action heavy passing offense with elite pre-snap motion", defenseStyle: "multiple-front defense built around speed and disguise", strength: "Mahomes' ability to extend plays and create touchdowns outside of structure", weakness: "defensive depth at cornerback when starters are unavailable", keyPlayer1: { name: "Patrick Mahomes", pos: "QB", note: "The reigning standard-bearer at the position. Mahomes' combination of arm talent, mobility, and football IQ makes him nearly impossible to game-plan against consistently." }, keyPlayer2: { name: "Travis Kelce", pos: "TE", note: "Kelce remains the most reliable tight end in football in critical moments. His route running in the middle of the field and red-zone presence gives Mahomes a safety valve that defenses cannot fully eliminate." }, outlook: ["Kansas City's offensive system under Andy Reid is the most refined in the NFL.", "The Chiefs' defense is built for adaptability. Their ability to rotate coverages and generate pressure with four rushers keeps opposing offenses off-rhythm.", "Expect Kansas City to control possession time and protect early leads. Reid's teams rarely beat themselves."] },
  BAL: { name: "Baltimore Ravens", coach: "John Harbaugh", qb: "Lamar Jackson", offenseStyle: "RPO-heavy run-pass option attack built around Jackson's dual-threat ability", defenseStyle: "aggressive, press-coverage defense with elite safety play", strength: "Jackson's rushing threat that forces defenses into impossible assignment conflicts", weakness: "consistency in the red zone when the run game is bottled up", keyPlayer1: { name: "Lamar Jackson", pos: "QB", note: "A two-time MVP whose rushing ability makes every Ravens drive a potential explosive play. Jackson's combination of arm talent and running ability forces defenses to account for him on every snap." }, keyPlayer2: { name: "Zay Flowers", pos: "WR", note: "Flowers' speed and explosiveness after the catch complement Jackson's style perfectly. He creates mismatches in space and has become one of the AFC's most dangerous slot receivers." }, outlook: ["Baltimore's offense begins and ends with Lamar Jackson's legs. When the Ravens establish the run, their offense is nearly impossible to stop.", "John Harbaugh's defense is built on physicality. Baltimore takes away the opponent's primary option.", "The Ravens are at their best early — they impose their will physically and establish momentum in the first quarter."] },
  BUF: { name: "Buffalo Bills", coach: "Sean McDermott", qb: "Josh Allen", offenseStyle: "explosive, multi-faceted attack leveraging Allen's arm and legs equally", defenseStyle: "zone-heavy coverage scheme that maximizes their cornerback talent", strength: "Allen's physical dominance and ability to convert third downs with his legs", weakness: "late-game decision-making in high-pressure playoff situations", keyPlayer1: { name: "Josh Allen", pos: "QB", note: "Allen is the most physically gifted quarterback in football. His combination of arm strength and rushing ability gives Buffalo a weekly chance to beat any team in the league." }, keyPlayer2: { name: "Stefon Diggs", pos: "WR", note: "Diggs' route precision and contested-catch ability make him Allen's most reliable target in critical moments." }, outlook: ["Buffalo's offense is built around Josh Allen's ability to extend plays and create opportunities outside of structure.", "Sean McDermott's defensive scheme is built on discipline and assignment football.", "Highmark Stadium is one of the most hostile environments for visiting teams in the NFL."] },
  PHI: { name: "Philadelphia Eagles", coach: "Nick Sirianni", qb: "Jalen Hurts", offenseStyle: "run-dominant, play-action system built around Hurts' mobility and a dominant offensive line", defenseStyle: "aggressive, blitz-heavy defense anchored by one of the best defensive fronts in football", strength: "offensive line depth and run game that controls possession and field position", weakness: "passing game consistency when facing elite cornerback matchups", keyPlayer1: { name: "Jalen Hurts", pos: "QB", note: "Hurts has developed into one of the NFC's most efficient quarterbacks. His rushing ability keeps defenses honest and creates the play-action opportunities that make the Eagles' vertical passing game effective." }, keyPlayer2: { name: "A.J. Brown", pos: "WR", note: "Brown's combination of size and speed makes him one of the hardest receivers to match up against in the league." }, outlook: ["Philadelphia's offensive line is the foundation of everything they do.", "Nick Sirianni's defense generates pressure with four rushers consistently.", "The Eagles are a second-half team. Their physicality and depth wear opponents down."] },
  SF: { name: "San Francisco 49ers", coach: "Kyle Shanahan", qb: "Brock Purdy", offenseStyle: "wide-zone running scheme with layered play-action and creative receiver usage", defenseStyle: "versatile, multiple-front defense that shifts personnel based on the opponent", strength: "Shanahan's scheme creativity that generates clean looks for Purdy on every down", weakness: "injury history at key positions that has derailed multiple postseason runs", keyPlayer1: { name: "Brock Purdy", pos: "QB", note: "Purdy's processing speed and accuracy within Shanahan's system make him one of the most efficient quarterbacks in football." }, keyPlayer2: { name: "Christian McCaffrey", pos: "RB", note: "McCaffrey's versatility as both a runner and receiver out of the backfield creates matchup nightmares for linebackers and safeties." }, outlook: ["Kyle Shanahan's offensive system is the most creative in the league.", "San Francisco's defense is built around versatility and personnel flexibility.", "The 49ers are particularly dangerous in the first half."] },
  DET: { name: "Detroit Lions", coach: "Dan Campbell", qb: "Jared Goff", offenseStyle: "physical, run-first attack that creates explosive passing opportunities off play-action", defenseStyle: "aggressive, assignment-sound defense that prioritizes stopping the run", strength: "offensive line that physically dominates at the point of attack", weakness: "pass coverage in the secondary when facing elite wide receiver groups", keyPlayer1: { name: "Jared Goff", pos: "QB", note: "Goff has evolved into one of the NFL's most accurate quarterbacks within Campbell's system." }, keyPlayer2: { name: "Amon-Ra St. Brown", pos: "WR", note: "St. Brown's ability to consistently create separation in the slot and convert on third downs has made him Goff's most reliable option." }, outlook: ["Dan Campbell has built a culture of toughness in Detroit that shows up in the fourth quarter.", "Detroit's offensive line is the team's most significant competitive advantage.", "Ford Field is one of the loudest environments in the NFC."] },
  GB: { name: "Green Bay Packers", coach: "Matt LaFleur", qb: "Jordan Love", offenseStyle: "West Coast passing attack with deep play-action shots and creative route combinations", defenseStyle: "zone-based coverage scheme that limits explosive plays and forces field goals", strength: "Jordan Love's deep ball accuracy and ability to attack all three levels of the field", weakness: "red zone efficiency when facing physical man coverage", keyPlayer1: { name: "Jordan Love", pos: "QB", note: "Love has emerged as one of the NFC's most dangerous quarterbacks. His arm talent in the deep game is exceptional." }, keyPlayer2: { name: "Jayden Reed", pos: "WR", note: "Reed's explosiveness in the slot and ability to create yards after the catch make him Love's most dangerous short-to-intermediate option." }, outlook: ["Matt LaFleur's offensive system creates layered route combinations that attack every level of the defense.", "Green Bay's defense is built around limiting big plays.", "Lambeau Field is one of the most iconic home-field advantages in professional sports."] },
  DAL: { name: "Dallas Cowboys", coach: "Mike McCarthy", qb: "Dak Prescott", offenseStyle: "balanced, spread-formation attack that leverages Prescott's arm and CeeDee Lamb's talent", defenseStyle: "aggressive, Micah Parsons-anchored defense that creates havoc in opposing backfields", strength: "CeeDee Lamb's ability to create mismatches against any cornerback in the league", weakness: "road performance in elimination games has been a persistent concern", keyPlayer1: { name: "Dak Prescott", pos: "QB", note: "Prescott's arm talent and ability to operate in a spread formation make him one of the NFC's most productive passers." }, keyPlayer2: { name: "CeeDee Lamb", pos: "WR", note: "Lamb is one of the best receivers in football. His combination of route running, yards after catch, and contested-catch ability makes him nearly impossible to match up against with a single cornerback." }, outlook: ["AT&T Stadium gives Dallas a genuine home-field advantage.", "Mike McCarthy's offense generates its best football when Prescott is in rhythm early.", "Micah Parsons' impact on the defensive side multiplies the effectiveness of the entire Cowboys defense."] },
  CIN: { name: "Cincinnati Bengals", coach: "Zac Taylor", qb: "Joe Burrow", offenseStyle: "vertical, precision passing attack built around Burrow's footwork and Ja'Marr Chase's explosiveness", defenseStyle: "multiple-coverage scheme that protects against the deep ball", strength: "Burrow-to-Chase connection that creates explosive plays against any coverage", weakness: "offensive line protection consistency", keyPlayer1: { name: "Joe Burrow", pos: "QB", note: "Burrow is the most technically refined quarterback in the AFC. His footwork, pocket navigation, and touch on downfield throws make him extraordinarily dangerous." }, keyPlayer2: { name: "Ja'Marr Chase", pos: "WR", note: "Chase's combination of speed, route precision, and ball-tracking ability makes him the most dangerous receiver in the AFC." }, outlook: ["Cincinnati's offense is capable of scoring in bunches when Burrow is in rhythm.", "Zac Taylor's defense has improved each year.", "Paycor Stadium brings genuine energy when the Bengals are competitive."] },
  MIA: { name: "Miami Dolphins", coach: "Mike McDaniel", qb: "Tua Tagovailoa", offenseStyle: "speed-based, precision passing attack that leverages the NFL's deepest wide receiver corps", defenseStyle: "aggressive, pressure-first defense that generates turnovers", strength: "speed at the skill positions that creates explosive plays against any coverage", weakness: "durability concerns at quarterback have derailed multiple seasons", keyPlayer1: { name: "Tua Tagovailoa", pos: "QB", note: "When healthy, Tua is one of the AFC's most accurate passers. His ability to deliver on time makes Miami's speed-based offense extraordinarily difficult to defend." }, keyPlayer2: { name: "Tyreek Hill", pos: "WR", note: "Hill remains the fastest receiver in professional football. His ability to threaten the defense vertically forces safeties to play deep." }, outlook: ["Miami's offense is built around getting the ball to playmakers in space.", "The Dolphins' defense is built to generate turnovers through aggressive coverage.", "Hard Rock Stadium presents challenges for visiting teams, particularly in the heat of early-season games."] },
  NYJ: { name: "New York Jets", coach: "Robert Saleh", qb: "Aaron Rodgers", offenseStyle: "experience-driven, play-action attack built around Rodgers' football IQ", defenseStyle: "physical, man-coverage defense anchored by elite cornerback play", strength: "Rodgers' ability to dissect coverage and avoid sacks through quick processing", weakness: "offensive line protection in obvious passing situations", keyPlayer1: { name: "Aaron Rodgers", pos: "QB", note: "Rodgers' football IQ remains elite. His ability to process pre-snap information and manipulate defenses with eyes and pump fakes is unmatched." }, keyPlayer2: { name: "Garrett Wilson", pos: "WR", note: "Wilson is one of the most technically refined route runners in the NFL. His ability to create separation against press coverage makes him the Jets' most dangerous offensive weapon." }, outlook: ["New York's offense under Rodgers is built on precision and patience.", "Robert Saleh's defense is built on physicality at the line of scrimmage.", "MetLife Stadium benefits the team that executes best."] },
  NE: { name: "New England Patriots", coach: "Jerod Mayo", qb: "Drake Maye", offenseStyle: "developing system built around Maye's arm talent and mobility", defenseStyle: "disciplined, scheme-first defense built on Belichick-era principles", strength: "defensive discipline and the developmental ceiling Drake Maye represents", weakness: "offensive line consistency and skill position depth around the young quarterback", keyPlayer1: { name: "Drake Maye", pos: "QB", note: "Maye is one of the most intriguing young quarterbacks in the league. His arm talent and mobility give New England a genuine foundational piece." }, keyPlayer2: { name: "Ja'Lynn Polk", pos: "WR", note: "Polk's route running and ability to create separation in the slot give Maye a reliable intermediate target." }, outlook: ["New England's offense is in development mode, but Maye's ceiling is genuinely elite.", "The Patriots' defensive culture remains a strength even in a transitional period.", "Gillette Stadium's weather conditions make it a challenging road environment."] },
  PIT: { name: "Pittsburgh Steelers", coach: "Mike Tomlin", qb: "Russell Wilson", offenseStyle: "balanced, run-complemented passing attack that relies on Wilson's experience and mobility", defenseStyle: "multiple-front, pressure-generating defense with decades of scheme continuity", strength: "Mike Tomlin's ability to keep teams competitive regardless of roster construction", weakness: "offensive consistency and protecting Wilson in the pocket", keyPlayer1: { name: "Russell Wilson", pos: "QB", note: "Wilson's experience and football IQ give Pittsburgh a steady hand at quarterback. His ability to extend plays remains valuable." }, keyPlayer2: { name: "TJ Watt", pos: "OLB", note: "Watt is the most disruptive pass rusher in the AFC North. His ability to generate pressure on every down forces offensive lines to account for him with extra blockers." }, outlook: ["Pittsburgh's defense is the team's identity.", "Acrisure Stadium is one of the most intimidating environments in the AFC.", "Tomlin's teams never have losing records. Their discipline and situational football is an organizational strength."] },
  CLE: { name: "Cleveland Browns", coach: "Kevin Stefanski", qb: "Deshaun Watson", offenseStyle: "run-first, physical attack designed to control possession and limit risk", defenseStyle: "aggressive, Myles Garrett-anchored defense that disrupts in the backfield", strength: "Myles Garrett's impact at defensive end that makes the entire defense better", weakness: "offensive consistency and quarterback reliability with Watson's health history", keyPlayer1: { name: "Myles Garrett", pos: "DE", note: "Garrett is one of the best defensive players in professional football. His ability to generate pressure forces offensive coordinators to dedicate extra blockers." }, keyPlayer2: { name: "Amari Cooper", pos: "WR", note: "Cooper's route precision gives Cleveland a reliable downfield option that can move the chains on third down." }, outlook: ["Cleveland's offense is built around controlling the line of scrimmage and running the football.", "Myles Garrett's impact transforms Cleveland's defense into a legitimate threat.", "FirstEnergy Stadium brings genuine energy in AFC North divisional matchups."] },
  IND: { name: "Indianapolis Colts", coach: "Shane Steichen", qb: "Anthony Richardson", offenseStyle: "dynamic, dual-threat system built around Richardson's exceptional physical tools", defenseStyle: "assignment-sound, zone-heavy scheme designed to limit explosive plays", strength: "Richardson's ceiling as a rushing threat that no linebacker can reliably stop", weakness: "Richardson's developmental consistency and decision-making in clutch moments", keyPlayer1: { name: "Anthony Richardson", pos: "QB", note: "Richardson's physical tools are extraordinary — his combination of arm strength and speed makes him a genuine dual-threat weapon." }, keyPlayer2: { name: "Jonathan Taylor", pos: "RB", note: "Taylor remains one of the best pure runners in the AFC. His ability to create yards after contact gives Indianapolis an explosive element." }, outlook: ["Indianapolis's offensive ceiling is directly tied to Richardson's consistency.", "Shane Steichen's scheme is built to protect Richardson and create favorable situations.", "Lucas Oil Stadium creates a genuine home environment for Indianapolis."] },
  HOU: { name: "Houston Texans", coach: "DeMeco Ryans", qb: "C.J. Stroud", offenseStyle: "precise, quick-rhythm passing attack built around Stroud's processing and Nico Collins' explosiveness", defenseStyle: "aggressive, multiple-pressure scheme that creates chaos in opposing backfields", strength: "Stroud's ability to read coverages quickly and distribute to open receivers", weakness: "red zone execution against physical man-coverage defenses", keyPlayer1: { name: "C.J. Stroud", pos: "QB", note: "Stroud's football IQ is exceptional. His ability to process pre-snap information and deliver on time makes Houston's offense efficient on every down." }, keyPlayer2: { name: "Nico Collins", pos: "WR", note: "Collins' combination of size and speed makes him Stroud's most dangerous downfield target." }, outlook: ["Houston's offense is built on efficiency and quick processing.", "The Texans' defense is one of the most aggressive in the AFC.", "NRG Stadium creates a genuine home environment in Houston."] },
  TEN: { name: "Tennessee Titans", coach: "Brian Callahan", qb: "Will Levis", offenseStyle: "developing system built around Levis's arm strength and physical mobility", defenseStyle: "disciplined, zone-coverage scheme that limits explosive plays", strength: "young talent on both sides of the ball that creates long-term optimism", weakness: "offensive consistency and execution in situational football", keyPlayer1: { name: "Will Levis", pos: "QB", note: "Levis's arm strength and willingness to attack downfield give Tennessee an explosive element in the passing game." }, keyPlayer2: { name: "Tony Pollard", pos: "RB", note: "Pollard's combination of speed and receiving ability out of the backfield makes him a genuine offensive weapon." }, outlook: ["Tennessee's offense is in development mode, but their young talent shows significant upside.", "Brian Callahan's defense is focused on limiting damage.", "Nissan Stadium brings genuine energy for big home games."] },
  JAX: { name: "Jacksonville Jaguars", coach: "Doug Pederson", qb: "Trevor Lawrence", offenseStyle: "creative, spread-formation attack built around Lawrence's arm talent and receiver depth", defenseStyle: "multiple-coverage scheme that leverages their cornerback depth", strength: "Lawrence's playmaking ability that keeps Jacksonville competitive in any game", weakness: "consistency through the regular season and avoiding self-inflicted turnovers", keyPlayer1: { name: "Trevor Lawrence", pos: "QB", note: "Lawrence's arm talent and competitive drive make him one of the AFC's most dangerous quarterbacks when the Jaguars are executing." }, keyPlayer2: { name: "Calvin Ridley", pos: "WR", note: "Ridley's route running precision and ability to create separation give Lawrence a reliable deep option." }, outlook: ["Jacksonville's offense is built on Lawrence's ability to make plays in structure and outside of it.", "Doug Pederson's scheme leverages Jacksonville's athlete depth.", "TIAA Bank Field brings competitive energy when Jacksonville is winning."] },
  LAC: { name: "Los Angeles Chargers", coach: "Jim Harbaugh", qb: "Justin Herbert", offenseStyle: "balanced, physical attack that pairs Herbert's arm talent with a disciplined run game", defenseStyle: "aggressive, multiple-front defense that generates pressure with four rushers", strength: "Herbert's arm talent and the organizational discipline Harbaugh has installed", weakness: "offensive line consistency protecting Herbert in obvious passing situations", keyPlayer1: { name: "Justin Herbert", pos: "QB", note: "Herbert's combination of size, arm strength, and football IQ makes him one of the AFC's most talented quarterbacks." }, keyPlayer2: { name: "Keenan Allen", pos: "WR", note: "Allen's route precision and ability to win against zone coverage make him Herbert's most reliable option on third down." }, outlook: ["Los Angeles's offense under Harbaugh is more disciplined and balanced.", "Jim Harbaugh's defensive philosophy prioritizes generating pressure with the front four.", "SoFi Stadium is a premium environment that creates challenges for both teams."] },
  LV: { name: "Las Vegas Raiders", coach: "Antonio Pierce", qb: "Gardner Minshew", offenseStyle: "efficient, game-management system built around protecting the football", defenseStyle: "aggressive, pressure-based defense designed to create short fields", strength: "Allegiant Stadium's atmosphere and a passionate fanbase", weakness: "quarterback limitations that cap the offense's ceiling in high-scoring games", keyPlayer1: { name: "Gardner Minshew", pos: "QB", note: "Minshew's football IQ and ability to protect the ball give Las Vegas a functional offensive floor." }, keyPlayer2: { name: "Davante Adams", pos: "WR", note: "Adams' route running precision is elite. His ability to create separation against any coverage makes him the Raiders' most reliable offensive weapon." }, outlook: ["Las Vegas's offense is built on ball security and establishing the run.", "Antonio Pierce's defense is built on aggression and creating chaos.", "Allegiant Stadium is one of the most visually spectacular environments in professional sports."] },
  DEN: { name: "Denver Broncos", coach: "Sean Payton", qb: "Bo Nix", offenseStyle: "creative, play-action system designed to leverage Nix's mobility and Payton's scheme ingenuity", defenseStyle: "physical, multiple-front defense that disrupts opposing offenses at the line", strength: "Sean Payton's offensive creativity and the Mile High altitude advantage", weakness: "Nix's consistency and execution in clutch, high-leverage moments", keyPlayer1: { name: "Bo Nix", pos: "QB", note: "Nix's mobility and arm strength give Denver an explosive offensive element when he's in rhythm." }, keyPlayer2: { name: "Courtland Sutton", pos: "WR", note: "Sutton's combination of size and contested-catch ability makes him Nix's most reliable downfield target." }, outlook: ["Denver's offense under Sean Payton is built on creativity and misdirection.", "Mile High Stadium's altitude creates a genuine performance advantage for Denver.", "Empower Field at Mile High brings electric energy when the Broncos are competitive."] },
  SEA: { name: "Seattle Seahawks", coach: "Mike Macdonald", qb: "Geno Smith", offenseStyle: "balanced, quick-rhythm attack that leverages Smith's accuracy and a deep receiving corps", defenseStyle: "aggressive, press-coverage scheme inspired by the historic Legion of Boom", strength: "Lumen Field crowd noise and the 12th Man home-field advantage", weakness: "late-season consistency and sustaining drives against physical defenses", keyPlayer1: { name: "Geno Smith", pos: "QB", note: "Smith's accuracy and football IQ have made him a reliable starter. His ability to operate efficiently in the short-to-intermediate area gives Seattle a consistent offensive floor." }, keyPlayer2: { name: "DK Metcalf", pos: "WR", note: "Metcalf's combination of size and speed makes him one of the NFC's most physically imposing wide receivers." }, outlook: ["Seattle's offense is built on efficiency and taking care of the football.", "Mike Macdonald's defensive system is built on press coverage and creating disruption.", "Lumen Field is one of the loudest environments in professional football."] },
  LAR: { name: "Los Angeles Rams", coach: "Sean McVay", qb: "Matthew Stafford", offenseStyle: "innovative, motion-heavy passing attack with creative pre-snap movement", defenseStyle: "aggressive, disruptive front that creates havoc at every level", strength: "McVay's scheme creativity and Stafford's experience in pressure situations", weakness: "offensive line depth and protecting Stafford against elite pass rushers", keyPlayer1: { name: "Matthew Stafford", pos: "QB", note: "Stafford's experience and competitiveness make him valuable in high-stakes situations. His willingness to attack downfield gives the Rams an explosive element." }, keyPlayer2: { name: "Cooper Kupp", pos: "WR", note: "Kupp's route precision and ability to find open space in zone coverage make him Stafford's most reliable option on critical downs." }, outlook: ["Sean McVay's offensive system is the most innovative in the NFC.", "Los Angeles's defense has improved through strategic roster construction.", "SoFi Stadium is a premium environment that challenges visiting teams."] },
  ARI: { name: "Arizona Cardinals", coach: "Jonathan Gannon", qb: "Kyler Murray", offenseStyle: "fast-paced, spread-option attack built around Murray's dual-threat ability", defenseStyle: "zone-heavy coverage scheme designed to limit explosive plays", strength: "Murray's elite mobility and the offense's ability to generate big plays quickly", weakness: "consistency and protecting Murray in the pocket against physical pass rushers", keyPlayer1: { name: "Kyler Murray", pos: "QB", note: "Murray's speed and agility make him one of the most dangerous quarterbacks in space." }, keyPlayer2: { name: "Marvin Harrison Jr.", pos: "WR", note: "Harrison Jr. brings elite physical tools to Arizona's passing game. His combination of size, speed, and polished route running makes him a legitimate star." }, outlook: ["Arizona's offense under Gannon is building an identity around Murray's mobility.", "The Cardinals' defense prioritizes limiting big plays during roster development.", "State Farm Stadium creates a decent home atmosphere for Arizona."] },
  ATL: { name: "Atlanta Falcons", coach: "Raheem Morris", qb: "Kirk Cousins", offenseStyle: "dynamic, multi-weapon attack that leverages Cousins' accuracy and Bijan Robinson's versatility", defenseStyle: "aggressive, zone-based scheme designed to create takeaways", strength: "Bijan Robinson's dual-threat ability as both a runner and receiver out of the backfield", weakness: "Cousins' durability and ability to maintain efficiency under sustained pressure", keyPlayer1: { name: "Kirk Cousins", pos: "QB", note: "Cousins brings accuracy and experience to Atlanta's offense. His ability to deliver in rhythm makes him reliable in game-management situations." }, keyPlayer2: { name: "Bijan Robinson", pos: "RB", note: "Robinson's combination of power, speed, and receiving ability makes him one of the most complete running backs in the NFC." }, outlook: ["Atlanta's offense is built around Robinson's versatility and Cousins' accuracy.", "Raheem Morris has built an aggressive defensive identity in Atlanta.", "Mercedes-Benz Stadium is one of the most modern facilities in professional sports."] },
  NO: { name: "New Orleans Saints", coach: "Dennis Allen", qb: "Derek Carr", offenseStyle: "balanced, precise attack built around the Saints' historical ability to manufacture points", defenseStyle: "physical defense built on shutting down the run", strength: "the Superdome atmosphere and decades of competitive culture", weakness: "Carr's consistency and offensive line protection in adverse situations", keyPlayer1: { name: "Derek Carr", pos: "QB", note: "Carr's experience and accuracy make him a reliable game manager in New Orleans' system." }, keyPlayer2: { name: "Chris Olave", pos: "WR", note: "Olave's speed and route precision make him Carr's most dangerous downfield option." }, outlook: ["New Orleans' offense generates competitive scores through precision and ball security.", "The Superdome crowd is one of the most impactful in the NFC South.", "Dennis Allen's defense prioritizes stopping the run and limiting possession time."] },
  TB: { name: "Tampa Bay Buccaneers", coach: "Todd Bowles", qb: "Baker Mayfield", offenseStyle: "balanced, veteran-led attack that prioritizes ball security and big-play potential", defenseStyle: "aggressive, pressure-generating defense that leverages elite edge rusher talent", strength: "Mayfield's confidence and ability to deliver in critical game situations", weakness: "offensive consistency when the run game struggles to establish momentum", keyPlayer1: { name: "Baker Mayfield", pos: "QB", note: "Mayfield's confidence and arm talent have made him a genuine competitor in the NFC South." }, keyPlayer2: { name: "Mike Evans", pos: "WR", note: "Evans' combination of size and competitiveness makes him one of the most reliable receivers in the NFC." }, outlook: ["Tampa Bay's offense under Bowles is built on balance and protecting Mayfield.", "Todd Bowles' defense is built on generating pressure and creating negative plays.", "Raymond James Stadium brings solid energy when Tampa Bay is competitive."] },
  CAR: { name: "Carolina Panthers", coach: "Dave Canales", qb: "Bryce Young", offenseStyle: "developing, creative system built around Young's processing ability and mobility", defenseStyle: "zone-based coverage scheme focused on limiting explosive plays during a rebuild", strength: "coaching development and Bryce Young's growing comfort in the system", weakness: "roster depth and the cumulative challenges of a rebuild", keyPlayer1: { name: "Bryce Young", pos: "QB", note: "Young's football intelligence and processing speed are genuine. His ability to navigate the pocket and make accurate throws in tight windows gives Carolina a foundational piece." }, keyPlayer2: { name: "Adam Thielen", pos: "WR", note: "Thielen's experience and route running IQ give Young a reliable option in the intermediate area." }, outlook: ["Carolina's offense is in a developmental phase, but Young's growth is encouraging.", "Dave Canales' defense is focused on limiting damage in a rebuild phase.", "Bank of America Stadium creates a solid home atmosphere for Carolina."] },
  MIN: { name: "Minnesota Vikings", coach: "Kevin O'Connell", qb: "Sam Darnold", offenseStyle: "creative, motion-heavy attack built around Justin Jefferson's talent", defenseStyle: "zone-heavy coverage scheme leveraging cornerback talent", strength: "Justin Jefferson's ability to create mismatches that cannot be eliminated by any coverage", weakness: "Darnold's consistency in critical moments and decision-making under pressure", keyPlayer1: { name: "Justin Jefferson", pos: "WR", note: "Jefferson is a generational talent who creates advantages against any coverage. His combination of route precision and explosiveness after the catch makes him the most dangerous receiver in the NFC North." }, keyPlayer2: { name: "Sam Darnold", pos: "QB", note: "Darnold's experience and mobility give Minnesota a functional quarterback in O'Connell's system." }, outlook: ["Kevin O'Connell's scheme is designed to maximize Jefferson's impact on every possession.", "Minnesota's defense is built around limiting the big play.", "US Bank Stadium is one of the loudest indoor environments in professional sports."] },
  CHI: { name: "Chicago Bears", coach: "Ben Johnson", qb: "Caleb Williams", offenseStyle: "innovative, Williams-tailored system built around his arm talent and mobility", defenseStyle: "developing defensive scheme focused on creating turnovers", strength: "Williams' ceiling as a passer and the offensive creativity Ben Johnson brings", weakness: "youth and inexperience in high-leverage situations throughout the roster", keyPlayer1: { name: "Caleb Williams", pos: "QB", note: "Williams' arm talent and mobility make him one of the most exciting quarterbacks in the NFL. His ability to make difficult throws in tight windows gives Chicago an explosive ceiling." }, keyPlayer2: { name: "DJ Moore", pos: "WR", note: "Moore's route precision and ability to create separation against press coverage give Williams a reliable target at every level of the field." }, outlook: ["Chicago's offense under Ben Johnson is building something genuinely exciting.", "The Bears' defense is in development mode but shows improvement.", "Soldier Field's historic atmosphere creates a meaningful home-field advantage."] },
  WAS: { name: "Washington Commanders", coach: "Dan Quinn", qb: "Jayden Daniels", offenseStyle: "dynamic, RPO-heavy attack built around Daniels' elite dual-threat ability", defenseStyle: "aggressive, multiple-front defense that pressures quarterbacks at a high rate", strength: "Daniels' mobility and the offense's ability to create explosive plays through the air and on the ground", weakness: "experience managing high-pressure playoff-caliber environments", keyPlayer1: { name: "Jayden Daniels", pos: "QB", note: "Daniels is one of the most exciting young quarterbacks in the league. His elite mobility combined with genuine arm talent makes the Commanders' offense impossible to defend." }, keyPlayer2: { name: "Terry McLaurin", pos: "WR", note: "McLaurin's ability to create separation vertically makes him Daniels' most dangerous downfield target." }, outlook: ["Washington's offense under Dan Quinn is one of the most dynamic in the NFC.", "Quinn's defense is built on pressure and taking away the opponent's primary option.", "Northwest Stadium brings competitive energy for Washington's home games."] },
  NYG: { name: "New York Giants", coach: "Brian Daboll", qb: "Daniel Jones", offenseStyle: "run-first, physical attack designed to control the clock and protect the quarterback", defenseStyle: "multiple-front defense built around creating sacks and disrupting timing", strength: "physical identity at the line of scrimmage and the defensive talent around the edge", weakness: "offensive consistency and downfield production in meaningful games", keyPlayer1: { name: "Daniel Jones", pos: "QB", note: "Jones' mobility and competitive drive give New York a quarterback capable of manufacturing plays outside of structure." }, keyPlayer2: { name: "Darius Slayton", pos: "WR", note: "Slayton's speed and ability to create vertical opportunities make him the Giants' most dangerous downfield threat." }, outlook: ["New York's offense is built on controlling the clock and establishing the run game.", "Brian Daboll's defense is built on disrupting opposing quarterbacks through pressure.", "MetLife Stadium creates a competitive environment for New York."] },
};

function getProfile(abbr: string): TeamProfile {
  return TEAM_PROFILES[abbr.toUpperCase()] ?? {
    name: abbr, coach: "Head Coach", qb: "the quarterback",
    offenseStyle: "balanced offensive attack", defenseStyle: "disciplined defensive scheme",
    strength: "depth and competitive culture", weakness: "consistency in high-leverage situations",
    keyPlayer1: { name: "Starting QB", pos: "QB", note: "Brings leadership and playmaking ability to the offense." },
    keyPlayer2: { name: "Lead Receiver", pos: "WR", note: "Provides the offense with a reliable downfield option." },
    outlook: ["This team will look to establish their identity early.", "Their defensive scheme is designed to limit the opponent's explosive plays.", "Late-game execution will be key to their success."],
  };
}

// ── matchup templates ──────────────────────────────────────────────────────
const INTRO_T = [
  (a: string, h: string) => `<p>One of the most compelling matchups on the schedule pits the <strong>${a}</strong> against the <strong>${h}</strong> in a game that has all the ingredients of a hard-fought, meaningful contest. Both franchises arrive with something to prove, and the strategic questions on both sides of the ball make this worth analyzing closely.</p>`,
  (a: string, h: string) => `<p>The NFL schedule delivers a compelling contest as the <strong>${a}</strong> prepare to face the <strong>${h}</strong>. With stakes rising across the league, this matchup carries weight for both franchises looking to establish momentum.</p>`,
  (a: string, h: string) => `<p>Few matchups on the schedule generate as many interesting strategic questions as <strong>${a}</strong> vs. <strong>${h}</strong>. Both teams bring unique offensive identities, and the scheme battles in this game will be worth watching closely from the opening kickoff.</p>`,
];

const H2H_T = [
  (a: string, h: string) => `<p>The history between these franchises adds an extra layer of intrigue to this matchup. Recent meetings have been competitive, with the margin of victory often coming down to turnover differential and third-down conversion rates. Expect this contest to follow a similar pattern.</p><p>The team that protects the ball and converts in critical moments will find a way to win. That has been the consistent thread connecting every recent chapter of this series.</p>`,
  (a: string, h: string) => `<p>The series between the <strong>${a}</strong> and the <strong>${h}</strong> has produced several memorable moments. Both coaching staffs have familiarity with each other's personnel tendencies, which typically results in game plans that prioritize scheme discipline over trick plays.</p><p>Expect this meeting to be decided by execution and which team makes fewer mistakes in the second half. The team that wins the turnover battle will almost certainly be celebrating at the final whistle.</p>`,
  (a: string, h: string) => `<p>While this matchup may not carry the weight of a decades-long rivalry, the <strong>${a}</strong> and <strong>${h}</strong> have developed a competitive thread in recent seasons. Both franchises are trending, which makes this game meaningful beyond the standings.</p><p>The last time these teams met, field position and turnover margin proved decisive. Both coaching staffs will emphasize ball security and red-zone efficiency as key performance indicators heading into this contest.</p>`,
];

const KEYS_T = [
  (a: string, h: string, ap: TeamProfile, hp: TeamProfile) => `<ul><li><strong>Turnover battle:</strong> Both offenses are capable of scoring in bunches, meaning a single turnover in the wrong moment can flip the outcome entirely.</li><li><strong>${a} third-down conversion:</strong> The ${a} must stay ahead of the chains to keep ${hp.qb} and the ${h} offense on the sideline. Sustained drives that end in points will be decisive.</li><li><strong>Home field execution:</strong> ${hp.coach}'s team has structural advantages playing at home. The crowd, familiar conditions, and situational comfort give them an edge the ${a} must overcome through consistent execution.</li></ul>`,
  (a: string, h: string, ap: TeamProfile, hp: TeamProfile) => `<ul><li><strong>Controlling the line of scrimmage:</strong> Whichever front five dominates in the trenches will dictate the game's flow. Physical dominance at the point of attack is the most reliable path to victory in this matchup.</li><li><strong>${hp.qb} vs. the ${a} pass rush:</strong> ${hp.qb}'s ability to avoid sacks and deliver on third down is the ${h}'s most important offensive variable. Consistent pressure disrupts the entire offensive rhythm.</li><li><strong>Red-zone efficiency:</strong> The team that converts scoring opportunities — rather than settling for field goals — will almost certainly win.</li></ul>`,
  (a: string, h: string, ap: TeamProfile, hp: TeamProfile) => `<ul><li><strong>Special teams execution:</strong> Field position is often overlooked but consistently proves decisive in evenly matched games. A muffed punt or a long return can change the entire strategic calculus.</li><li><strong>${ap.qb}'s rhythm in the first half:</strong> The ${a} need their quarterback operating in rhythm early. If ${ap.qb} can establish confidence through the first two possessions, the offense will find its footing.</li><li><strong>Halftime adjustments:</strong> Both ${ap.coach} and ${hp.coach} are respected in-game adjusters. Whoever makes the better halftime correction will likely see the benefit in the third quarter.</li></ul>`,
];

const PRED_T = [
  (a: string, h: string, ap: TeamProfile, hp: TeamProfile) => `<p>This is a competitive matchup that could go either way, but home-field advantage tips the scales toward the <strong>${h}</strong>. ${hp.coach}'s team has the personnel to exploit the ${a}'s <strong>${ap.weakness}</strong>, and their <strong>${hp.strength}</strong> should prove decisive in the second half.</p><p>The <strong>${a}</strong> will compete and keep this game close — ${ap.qb} is too talented to be completely shut out — but the ${h} should find a way to win. Look for the ${h} to pull away in the fourth quarter behind ${hp.qb}'s poise and a timely defensive stop.</p><p><strong>Final: ${h} win</strong></p>`,
  (a: string, h: string, ap: TeamProfile, hp: TeamProfile) => `<p>The <strong>${a}</strong> are a dangerous opponent, and ${ap.qb}'s ability to create off-schedule plays makes them a genuine threat to win outright. But the <strong>${h}</strong> have the structural advantage — home field, scheme familiarity, and the continuity ${hp.coach}'s program has built.</p><p>Expect the ${a} to make this competitive into the fourth quarter. Their <strong>${ap.strength}</strong> will generate scoring opportunities. In the end, the ${h} should hold on behind ${hp.qb}'s steady performance and a defense that limits explosive plays in critical moments.</p><p><strong>Final: ${h} win in a close game</strong></p>`,
  (a: string, h: string, ap: TeamProfile, hp: TeamProfile) => `<p>This game sets up as a genuine toss-up, with both teams capable of winning depending on execution and turnovers. The <strong>${a}</strong>'s <strong>${ap.strength}</strong> gives them a real path to victory, but the <strong>${h}</strong>'s <strong>${hp.strength}</strong> is a consistent advantage in close games.</p><p>Our lean is toward the ${h} based on home-field advantage and ${hp.coach}'s track record in contested games. But do not be surprised if ${ap.qb} and the ${a} keep this within one score until the final minutes.</p><p><strong>Final: ${h} win, but it will be close</strong></p>`,
];

// ── single-team analysis templates ─────────────────────────────────────────
const TEAM_INTRO_T = [
  (t: TeamProfile) => `<p>As the 2025 NFL season reaches a critical phase, the <strong>${t.name}</strong> find themselves at an important crossroads. With their distinctive identity built around a <strong>${t.offenseStyle}</strong> on offense and a <strong>${t.defenseStyle}</strong> on the defensive side of the ball, this is a team worth examining closely — both for what they have accomplished and what they still need to prove.</p>`,
  (t: TeamProfile) => `<p>Few teams in the NFL present as many interesting analytical questions as the <strong>${t.name}</strong>. Built around a <strong>${t.offenseStyle}</strong> and complemented by a <strong>${t.defenseStyle}</strong>, head coach <strong>${t.coach}</strong> has constructed a roster with genuine strengths — and meaningful vulnerabilities that opposing coordinators will continue to target.</p>`,
  (t: TeamProfile) => `<p>The <strong>${t.name}</strong> are one of the more compelling stories in the 2025 NFL season. Under head coach <strong>${t.coach}</strong>, this team has developed a clear identity: <strong>${t.offenseStyle}</strong> offensively, and <strong>${t.defenseStyle}</strong> on the other side. The question now is whether this roster can sustain that identity through the season's most demanding stretch.</p>`,
];

const TEAM_STRENGTH_T = [
  (t: TeamProfile) => `<p>The foundation of this team's success runs through <strong>${t.strength}</strong>. This is not a coincidence — it is the product of deliberate roster construction and a coaching staff that understands exactly how to maximize their best personnel.</p><p>When <strong>${t.qb}</strong> is executing at a high level, the offense reaches a ceiling that very few opponents can match. The scheme is designed to create favorable matchups, and the results are visible in the most important statistical categories.</p>`,
  (t: TeamProfile) => `<p>Ask anyone who has studied this team closely and they'll point to the same thing: <strong>${t.strength}</strong> is what makes the <strong>${t.name}</strong> genuinely dangerous. <strong>${t.coach}</strong> has built the entire program around this competitive advantage, and it shows up in how the team performs in the most critical moments.</p><p><strong>${t.qb}</strong> remains the engine that drives everything. When the offense operates in rhythm and protects the ball, there are very few defenses in the league capable of holding this team down for sixty minutes.</p>`,
];

const TEAM_WEAKNESS_T = [
  (t: TeamProfile) => `<p>No team is without its vulnerabilities, and for the <strong>${t.name}</strong>, the primary area of concern is <strong>${t.weakness}</strong>. Smart opposing coordinators have identified this as the area most likely to create disruption, and the coaching staff will need to address it proactively as the schedule intensifies.</p><p>The good news is that <strong>${t.coach}</strong> has demonstrated the ability to make meaningful in-season adjustments. How quickly this staff can shore up the weakness while maintaining the offensive and defensive identity they have built will go a long way toward determining this team's ceiling.</p>`,
  (t: TeamProfile) => `<p>Every roster has limitations, and this team's most significant concern is <strong>${t.weakness}</strong>. In a league where the best offenses and defenses can expose any vulnerability over the course of a sixty-minute game, this is an area that deserves honest scrutiny from fans and analysts alike.</p><p>The coaching staff is aware of the challenge. Their ability to scheme around the weakness — rather than simply hoping it doesn't get exposed — will be critical to their success in high-stakes games.</p>`,
];

const TEAM_OUTLOOK_T = [
  (t: TeamProfile) => `<p>${t.outlook[0]} ${t.outlook[1]}</p><p>${t.outlook[2]}</p>`,
  (t: TeamProfile) => `<p>${t.outlook[1]} ${t.outlook[2]}</p><p>${t.outlook[0]}</p>`,
];

// ── topic templates ────────────────────────────────────────────────────────
function getTopicType(title: string): string {
  const lower = title.toLowerCase();
  if (/fantasy|waiver|start|sit|lineup|pickup/.test(lower)) return "fantasy";
  if (/trade|deal|deadline|acquire/.test(lower)) return "trade";
  if (/injur|hurt|questionable|ir |injured reserve/.test(lower)) return "injury";
  if (/rank|power ranking|top \d|best team/.test(lower)) return "rankings";
  if (/pick|prediction|preview|week \d|betting/.test(lower)) return "picks";
  if (/draft|prospect|combine|scouting/.test(lower)) return "draft";
  if (/superbowl|super bowl|championship|playoff/.test(lower)) return "playoffs";
  return "analysis";
}

const TOPIC_CONTENT: Record<string, (title: string, seed: number) => string> = {
  fantasy: (title, seed) => {
    const tips = [
      ["Start your studs in marquee matchups — game-script predictability is your best friend in the fantasy playoffs.", "Target receivers who see heavy target share regardless of game outcome. Reliability beats upside when the stakes are high.", "Running backs in positive game scripts are the most consistent fantasy assets. Chase backs on teams projected to build leads.", "Quarterbacks facing bottom-five pass defenses are the safest streaming options in any given week."],
      ["Bye weeks separate contenders from pretenders. Managing your roster depth through the middle of the season is critical.", "Never overlook tight ends who run routes at an elite rate — targets in the middle of the field translate directly to PPR points.", "Weather matters. Wind over 15 mph suppresses passing games and inflates rushing attempts. Adjust your lineup accordingly.", "The waiver wire wins championships. The difference between a 10-win fantasy season and a 14-win season is often one well-timed add."],
    ];
    const intros = [
      `<p>Fantasy football success comes down to two things: understanding personnel trends and making better decisions than your leaguemates on the waiver wire. In a game where the margins are razor-thin, the most consistent managers are the ones who do their homework every single week.</p>`,
      `<p>The most underrated skill in fantasy football isn't identifying studs — everyone knows the studs. The real edge comes from finding the players whose role is expanding faster than the consensus has recognized. That gap between perception and reality is where championships are won.</p>`,
    ];
    const selected = pick(tips, seed);
    return `${pick(intros, seed)}
<h2>Key Principles for This Week</h2>
<ul>${selected.map(t => `<li>${t}</li>`).join("")}</ul>
<h2>Matchup-Based Strategy</h2>
<p>Every week, the best fantasy managers spend time identifying which defenses are vulnerable and which matchups are traps. A skill player on a bad team can have an elite fantasy game if the scheme creates volume, while a star on a slow-paced team may disappoint against a stout unit.</p>
<p>Focus on target share, snap counts, and route participation rates. These underlying metrics tell you more about a player's week-to-week ceiling than touchdowns — which are the most fluky and unpredictable part of any player's production.</p>
<h2>Waiver Wire Intelligence</h2>
<p>The difference between good and great fantasy managers is the waiver wire. The best pickups are not reactive — they're anticipatory. Identify the running back who is one injury away from a starting role. Find the receiver who just posted four targets on a team that lost their number one option. These are the adds that win seasons.</p>
<p>Processing speed on the wire is everything. Injury reports drop overnight; the managers who act first lock down the best adds. Set your morning alarms on Thursday and Saturday during the season — it's worth it.</p>
<h2>Final Thoughts</h2>
<p>Fantasy football is a long season. Variance is real. The goal isn't to win every week — it's to make better decisions than your opponents consistently enough that you're in the playoffs when it counts. Trust the process, stay analytical, and don't let a bad week derail your season management strategy.</p>`.trim();
  },

  trade: (title, seed) => {
    const intros = [
      `<p>NFL trade season is one of the most fascinating periods on the football calendar. Rumors circulate, front offices gauge market value, and the right deal at the right time can fundamentally alter a franchise's trajectory. Understanding the mechanics of how trades develop — and what each side is actually trying to accomplish — gives you a significant edge in reading the news cycle.</p>`,
      `<p>Every meaningful NFL trade involves at least one team that believes the status quo isn't good enough. Whether it's a playoff team going all-in, a rebuilding franchise accelerating a timeline, or a contender addressing a glaring hole, the motivations behind trades are as interesting as the deals themselves.</p>`,
    ];
    return `${pick(intros, seed)}
<h2>What Both Sides Are Looking For</h2>
<p>Trades happen when two teams' needs align. A contending team with draft capital is willing to sacrifice future picks for a player who can help them win now. A rebuilding team accepts that player in exchange for exactly the assets they need to build toward the future. The art of the deal is finding the price point where both sides feel they've won.</p>
<p>The most significant trades in recent NFL history have come when a player's current team undervalues their contribution — or when a player's presence creates chemistry issues that outweigh their production. Front offices operate on information the public doesn't have, which is why trades can seem surprising from the outside but make perfect sense internally.</p>
<h2>Impact on the Roster</h2>
<p>Beyond the player being moved, the ripple effects of any significant trade reshape how both rosters function. A team adding a pass rusher changes how their defensive coordinator can call games. A team trading away a receiver forces their quarterback to redistribute targets in ways that may take time to develop into productive chemistry.</p>
<p>The best analysis of any trade looks beyond the immediate headline and asks: how does this change each team's ceiling and floor? The answers to those questions determine whether a deal will be remembered as a franchise-altering move or a costly mistake.</p>
<h2>The Bigger Picture</h2>
<p>In today's NFL, the most successful front offices treat trade assets as a continuous portfolio rather than a static inventory. They're always accumulating capital when the opportunity presents itself and deploying it strategically when a specific need arises. The teams that consistently make intelligent trades — rather than reactive ones — are the teams that sustain excellence over multiple seasons.</p>`.trim();
  },

  injury: (title, seed) => {
    const intros = [
      `<p>Injuries are the most unpredictable variable in professional football. No team escapes the season healthy, and the franchises that win championships are almost always the ones with the depth and adaptability to absorb significant losses without fundamentally changing their identity.</p>`,
      `<p>Every significant injury in the NFL carries a ripple effect that extends well beyond the individual player. Offensive schemes adapt, usage patterns shift, and the coaching staff's game-planning calculus changes in ways that aren't always immediately visible to outside observers.</p>`,
    ];
    return `${pick(intros, seed)}
<h2>Understanding the Impact</h2>
<p>When evaluating the impact of an injury, the most important question isn't just "how good is the player?" — it's "how irreplaceable is their specific role?" A veteran backup who plays a well-defined, limited role is often easier to replace than a versatile performer whose contributions span multiple scheme concepts.</p>
<p>Modern NFL offenses and defenses are designed with redundancy in mind. Coaching staffs spend significant time in training camp building contingency plans for exactly these moments. The quality of that preparation often determines how much a team's performance declines after a significant loss.</p>
<h2>The Replacement Picture</h2>
<p>The player stepping into an expanded role will face a learning curve, but NFL rosters are constructed with the understanding that contributors at every depth chart position need to be ready. The players who rise to the moment in these situations are often the ones who studied relentlessly during their backup seasons, preparing for exactly this opportunity.</p>
<p>Practice film, training camp observations, and preseason performance all provide context for how ready a replacement might be. The coaching staff's confidence in their depth is often the best signal of how much a team's game plan will need to change.</p>
<h2>Recovery Timeline and Outlook</h2>
<p>Modern sports medicine has dramatically reduced recovery timelines for many injuries that would have ended seasons a generation ago. The combination of advanced imaging, improved surgical techniques, and more sophisticated rehabilitation protocols means that players return faster and more completely than ever before.</p>
<p>Until the official injury designation clarifies the situation, expect the coaching staff to remain cautious in their public statements. Their goal is to maintain uncertainty in the opponent's preparation — which is itself a strategic advantage worth protecting.</p>`.trim();
  },

  rankings: (title, seed) => {
    const teams = Object.values(TEAM_PROFILES);
    const s1 = pick(teams, seed);
    const s2 = pick(teams, seed + 3);
    const s3 = pick(teams, seed + 7);
    const s4 = pick(teams, seed + 11);
    const s5 = pick(teams, seed + 15);
    const intros = [
      `<p>Power rankings are inherently subjective — they blend performance data with schedule strength, injury context, and trend analysis to produce a snapshot of the league's hierarchy at a specific moment. The best rankings account not just for what teams have done, but for the trajectory they're on and the challenges that lie ahead.</p>`,
      `<p>The NFL power rankings conversation is never settled for long. A single bad week can send a perceived contender tumbling, while an impressive win on the road can elevate a team from "interesting" to "legitimate threat." That volatility is what makes this exercise worth repeating every week of the season.</p>`,
    ];
    return `${pick(intros, seed)}
<h2>The Elite Tier</h2>
<p>At the top of any honest power rankings conversation, you find teams that combine offensive consistency with defensive reliability and — critically — a quarterback who can win the game single-handedly when the scheme doesn't produce clean opportunities. The <strong>${s1.name}</strong> belong in this conversation. Their <strong>${s1.strength}</strong> gives them an advantage that few opponents can overcome for sixty minutes.</p>
<p>Close behind, the <strong>${s2.name}</strong> have demonstrated the kind of two-sided competence that sustains deep playoff runs. When <strong>${s2.qb}</strong> is executing at their ceiling and the defense is eliminating explosive plays, this is a team that nobody wants to face in January.</p>
<h2>The Contender Tier</h2>
<p>The <strong>${s3.name}</strong> are a fascinating case study in 2025. Their <strong>${s3.offenseStyle}</strong> creates consistent scoring opportunities, and <strong>${s3.coach}</strong>'s ability to make halftime adjustments has been a consistent competitive advantage throughout the season. The question isn't whether they can beat anyone — it's whether they can do it consistently against elite competition.</p>
<p>Similarly, the <strong>${s4.name}</strong> have quietly built one of the more complete rosters in the league. Their biggest strength — <strong>${s4.strength}</strong> — is exactly the kind of advantage that compounds as games go on and fatigue sets in for opposing defenders.</p>
<h2>Teams on the Rise</h2>
<p>Don't sleep on the <strong>${s5.name}</strong>. Their <strong>${s5.offenseStyle}</strong> is generating the kind of results that demand respect from every defensive coordinator in the league. If <strong>${s5.qb}</strong> continues at their current pace, this team's ranking will only move in one direction.</p>
<p>The bottom line: the 2025 NFL season has produced more genuine contenders than any recent year. The gap between the top tier and the field is smaller than the standings might suggest — which makes the back half of the schedule appointment viewing for anyone who loves this game.</p>`.trim();
  },

  picks: (title, seed) => {
    const teams = Object.values(TEAM_PROFILES);
    const g1a = pick(teams, seed);
    const g1h = pick(teams, seed + 5);
    const g2a = pick(teams, seed + 9);
    const g2h = pick(teams, seed + 13);
    const g3a = pick(teams, seed + 17);
    const g3h = pick(teams, seed + 21);
    const intros = [
      `<p>Every week of the NFL season provides a new set of analytical puzzles to work through. The most accurate predictors aren't the ones who swing for home runs on every pick — they're the ones who identify structural advantages, assess injury impact honestly, and resist the temptation to over-correct based on last week's results.</p>`,
      `<p>NFL predictions are hard. Anyone who tells you otherwise is either lying or hasn't been paying attention long enough. The goal isn't to pick every game correctly — it's to identify the games where the betting market or public perception has created an exploitable gap between perceived probability and actual probability.</p>`,
    ];
    return `${pick(intros, seed)}
<h2>Featured Matchup: ${g1a.name} vs. ${g1h.name}</h2>
<p>This is the headliner of the week. The <strong>${g1h.name}</strong> have a structural advantage: their <strong>${g1h.strength}</strong> is precisely the kind of weapon that creates problems for the <strong>${g1a.name}</strong>'s well-documented <strong>${g1a.weakness}</strong>. Home field adds another layer of advantage for the ${g1h.name}.</p>
<p>${g1a.coach}'s team will compete — they always do — but the matchup math leans toward the home side. <strong>Pick: ${g1h.name}</strong></p>
<h2>${g2a.name} at ${g2h.name}</h2>
<p>The public loves the <strong>${g2h.name}</strong> in this spot, but there's a case to be made for the <strong>${g2a.name}</strong>. Their <strong>${g2a.strength}</strong> is a genuine weapon, and <strong>${g2a.qb}</strong> has been more productive on the road than the numbers suggest. Don't overlook the visiting side here.</p>
<p>That said, the ${g2h.name}'s <strong>${g2h.defenseStyle}</strong> is exactly what the doctor ordered against the ${g2a.name}'s offensive tendencies. <strong>Pick: ${g2h.name} at home</strong></p>
<h2>${g3a.name} at ${g3h.name}</h2>
<p>This is the most interesting game of the week from a scheme perspective. Both teams have genuine strengths — the ${g3a.name}'s <strong>${g3a.offenseStyle}</strong> versus the ${g3h.name}'s <strong>${g3h.defenseStyle}</strong> — and neither side has a dominant edge on paper.</p>
<p>In games this close, we lean on coaching. <strong>${g3h.coach}</strong> has demonstrated the ability to win contested games at home more often than the record suggests. <strong>Pick: ${g3h.name}</strong></p>
<h2>Best Bet of the Week</h2>
<p>If there's one game where the analysis points clearly in one direction, it's the <strong>${g1h.name}</strong> matchup. The combination of home field, favorable scheme matchup, and the opponent's documented vulnerability creates the kind of structural edge that is rare in a week-to-week NFL slate. This is the game to be confident on.</p>`.trim();
  },

  draft: (title, seed) => `<p>NFL draft evaluation is one of the most complex analytical challenges in professional sports. Every year, millions of dollars in scouting investment, thousands of hours of film study, and the collective wisdom of experienced personnel executives come together — and still, approximately half of first-round picks fail to meet expectations. Understanding why reveals a great deal about what separates good franchises from great ones.</p>
<h2>What Scouts Actually Look For</h2>
<p>At the top of the board, teams are looking for players whose athletic profile translates to performance at the NFL level. But raw athleticism is only one dimension. The most important trait that separates elite prospects from disappointing busts is the ability to process information quickly — to understand what a defense is doing before the snap and adjust accordingly in real time.</p>
<p>For quarterbacks, this cognitive processing speed is non-negotiable. The physical tools matter, but every year there are quarterbacks who tested off the charts athletically and couldn't survive the transition to NFL-speed pattern recognition. The players who thrive are the ones who were already operating at an advanced cognitive level in college.</p>
<h2>The Positional Value Question</h2>
<p>Modern draft strategy has evolved significantly in how teams value positions. The conventional wisdom about not drafting running backs highly has given way to a more nuanced view: the question isn't "is this position valuable?" but "is this specific player valuable enough relative to the alternatives at this pick?"</p>
<p>Offensive linemen remain consistently undervalued by casual observers and consistently prioritized by the best front offices. The ability to protect your quarterback and create running lanes is the foundation on which every successful offensive identity is built. Teams that invest early and often in elite offensive line talent give themselves a structural advantage that compounds over years.</p>
<h2>Projection vs. Production</h2>
<p>The most common mistake in draft evaluation is projecting a player's ceiling rather than evaluating their floor. High-ceiling, low-floor players produce the memorable busts. Low-ceiling, high-floor players produce the underdrafted steals that general managers build careers around finding.</p>
<p>The best draft classes in franchise history aren't the ones with the most first-round talent. They're the ones with the most productive players across all rounds — built by organizations that understood the difference between projection and probability.</p>`.trim(),

  playoffs: (title, seed) => {
    const teams = Object.values(TEAM_PROFILES);
    const t1 = pick(teams, seed);
    const t2 = pick(teams, seed + 7);
    const t3 = pick(teams, seed + 13);
    const intros = [
      `<p>Playoff football is a different animal. The margin for error disappears, the coaching adjustments come faster, and the teams that thrive are the ones that have built systems capable of executing under maximum pressure. Analyzing playoff contenders requires a different lens than regular-season analysis — what matters in Week 5 is not always what matters in January.</p>`,
      `<p>Every January, the NFL playoff field reveals itself, and the pretenders are separated from the contenders. The teams that advance deepest are almost never the ones with the most talent — they're the ones with the best combination of quarterback play, defensive reliability, and coaching intelligence. Understanding which franchises check those boxes is the foundation of playoff prediction.</p>`,
    ];
    return `${pick(intros, seed)}
<h2>The Top Contenders</h2>
<p>Any honest Super Bowl conversation has to begin with the <strong>${t1.name}</strong>. Their <strong>${t1.strength}</strong> is a genuine postseason weapon, and <strong>${t1.coach}</strong> has demonstrated the ability to make critical adjustments between possessions that lesser coaches miss entirely. When this team is playing their best football, they're an extraordinarily difficult out in a single-elimination bracket.</p>
<p>In the opposite conference, the <strong>${t2.name}</strong> present a compelling case. <strong>${t2.qb}</strong>'s ability to operate at a high level in high-pressure situations is well-documented, and the defense — built around a <strong>${t2.defenseStyle}</strong> — creates the kind of sustained pressure that wears offenses down over four quarters.</p>
<h2>The Sleeper Pick</h2>
<p>Every January produces at least one team that the field underestimated. This year's best sleeper candidate is the <strong>${t3.name}</strong>. Their <strong>${t3.strength}</strong> is the kind of weapon that gets more dangerous in the playoffs, when defensive game plans have less time to adjust between matchups.</p>
<p>${t3.coach}'s history of in-season improvement is real. This is a team that peaks in December and January, which is exactly the trait that produces deep postseason runs that few saw coming in September.</p>
<h2>What Wins in January</h2>
<p>Consistent with decades of data, the teams that win championships share specific traits: a quarterback who elevates in big moments, a defensive coordinator who can make halftime adjustments that hold up for a full second half, and — critically — a roster deep enough to absorb the inevitable injury attrition of a deep playoff run.</p>
<p>The teams that check all three boxes are rare. When they exist, they're worth betting on — not because the playoffs are predictable, but because those structural advantages compound when the margin for error drops to zero.</p>`.trim();
  },

  analysis: (title, seed) => {
    const teams = Object.values(TEAM_PROFILES);
    const t1 = pick(teams, seed);
    const t2 = pick(teams, seed + 9);
    const intros = [
      `<p>The 2025 NFL season has produced compelling storylines at every level of the league — from breakout individual performances to franchise-altering scheme changes to the ongoing evolution of how the game is played at the highest level. Understanding the forces shaping this season requires looking beyond the box score to the structural dynamics beneath the surface.</p>`,
      `<p>Professional football is a game of chess played at full speed. The strategic battles between offensive coordinators and defensive coordinators, between personnel departments and salary cap architects, and between players and their own physical limitations create a continuous stream of fascinating analytical questions. The 2025 season is no exception.</p>`,
    ];
    return `${pick(intros, seed)}
<h2>The Biggest Storylines</h2>
<p>The conversation around the <strong>${t1.name}</strong> has dominated the early part of the season, and for good reason. Their <strong>${t1.strength}</strong> has been on full display, and <strong>${t1.qb}</strong>'s performance has elevated the entire roster's ceiling. When this offense is executing, they put up points against anyone — and that fact changes how every opponent prepares.</p>
<p>The counterpoint to that offensive dominance narrative is the performance of teams like the <strong>${t2.name}</strong>, who have demonstrated that the path to winning in today's NFL isn't necessarily through scoring more points — it's through eliminating the opponent's ability to score efficiently. Their <strong>${t2.defenseStyle}</strong> is a genuine constraint on opposing offenses.</p>
<h2>Scheme Trends Worth Watching</h2>
<p>This season has accelerated several trends that began percolating over the last few years. The proliferation of RPO-based offenses has created a new generation of defensive adjustments, particularly at the linebacker level where the old "box player" archetype is being replaced by more versatile athletes who can match up against receiving backs.</p>
<p>On the other side of the ball, the league-wide investment in pass rush talent has driven offensive lines to evolve their protection schemes at an unprecedented rate. The best blocking units in 2025 are far more flexible in their protection assignments than their counterparts five years ago — a direct response to the creativity of defensive coordinators in generating pressure.</p>
<h2>The Bottom Line</h2>
<p>What makes the 2025 NFL season compelling is the genuine uncertainty at the top. Multiple franchises have legitimate Super Bowl aspirations, and the gap between a team that wins a championship and one that loses in the divisional round often comes down to execution in two or three critical moments over the course of a playoff run.</p>
<p>That uncertainty is what makes this game worth watching week after week — and what makes the analytical work of understanding who holds structural advantages so rewarding for fans who go deep on the film and the numbers.</p>`.trim();
  },
};

// ── main generation function ───────────────────────────────────────────────
function generatePost(title: string): { content: string; excerpt: string; tags: string[]; metaTitle: string; metaDescription: string } {
  const seed = hashStr(title);
  const teams = detectTeams(title);

  // Matchup: 2+ teams
  if (teams.length >= 2) {
    const ap = getProfile(teams[0]);
    const hp = getProfile(teams[1]);
    const away = ap.name;
    const home = hp.name;

    const content = `
<h2>Game Overview</h2>
${pick(INTRO_T, seed)(away, home)}

<h2>${away} Outlook</h2>
<p>${pick(ap.outlook, seed)}</p>
<p>Head coach <strong>${ap.coach}</strong> has built a team around a <strong>${ap.offenseStyle}</strong> on offense and a <strong>${ap.defenseStyle}</strong> on defense. The team's primary strength is <strong>${ap.strength}</strong>, while the coaching staff will look to address their <strong>${ap.weakness}</strong> in this contest.</p>
<p>${pick(ap.outlook, seed + 1)}</p>

<h2>${home} Outlook</h2>
<p>${pick(hp.outlook, seed + 2)}</p>
<p><strong>${hp.coach}</strong> has the ${home} operating a <strong>${hp.offenseStyle}</strong> complemented by a <strong>${hp.defenseStyle}</strong>. Their biggest advantage is <strong>${hp.strength}</strong>, which presents a meaningful challenge for the visiting ${away}.</p>
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
${pick(H2H_T, seed + 1)(away, home)}

<h2>Keys to the Game</h2>
${pick(KEYS_T, seed + 2)(away, home, ap, hp)}

<h2>Prediction</h2>
${pick(PRED_T, seed + 3)(away, home, ap, hp)}
`.trim();

    return {
      content,
      excerpt: `Complete analysis of ${away} vs ${home}. Team outlooks, key players to watch, head-to-head history, and a final score prediction for the 2025 NFL season.`,
      tags: [away, home, "Matchup Preview", "NFL Predictions", "NFL Analysis", "2025 NFL Season"],
      metaTitle: `${away} vs ${home} Preview & Prediction | NFL Predictions Hub`,
      metaDescription: `Deep-dive matchup analysis: ${away} at ${home}. Outlooks, key players, H2H history, and prediction. Updated 2025 NFL season coverage.`,
    };
  }

  // Single team deep-dive
  if (teams.length === 1) {
    const tp = getProfile(teams[0]);
    const content = `
<h2>Team Overview</h2>
${pick(TEAM_INTRO_T, seed)(tp)}

<h2>What Makes Them Dangerous</h2>
${pick(TEAM_STRENGTH_T, seed + 1)(tp)}

<h3>${tp.keyPlayer1.name} — ${tp.keyPlayer1.pos}</h3>
<p>${tp.keyPlayer1.note}</p>

<h3>${tp.keyPlayer2.name} — ${tp.keyPlayer2.pos}</h3>
<p>${tp.keyPlayer2.note}</p>

<h2>Areas of Concern</h2>
${pick(TEAM_WEAKNESS_T, seed + 2)(tp)}

<h2>Season Outlook</h2>
${pick(TEAM_OUTLOOK_T, seed + 3)(tp)}

<h2>Verdict</h2>
<p>The <strong>${tp.name}</strong> are a team that can beat anyone when performing at their ceiling — and a team that can lose to anyone when they're not. The margin between those two outcomes is thinner than it might appear from the outside. How <strong>${tp.coach}</strong> manages that margin over the back half of the 2025 season will determine where this franchise stands come January.</p>
`.trim();

    return {
      content,
      excerpt: `${tp.name} 2025 season analysis: strengths, weaknesses, key players, and full outlook under head coach ${tp.coach}. Everything you need to know.`,
      tags: [tp.name, tp.coach, tp.qb, "Team Analysis", "NFL 2025", "NFL Predictions"],
      metaTitle: `${tp.name} 2025 Analysis: Strengths, Weaknesses & Outlook`,
      metaDescription: `Complete ${tp.name} breakdown for 2025: offensive identity, defensive scheme, key players, and season outlook. In-depth NFL analysis.`,
    };
  }

  // Topic-based post
  const topicType = getTopicType(title);
  const generator = TOPIC_CONTENT[topicType] ?? TOPIC_CONTENT.analysis;
  const content = generator(title, seed);

  const topicMeta: Record<string, { tags: string[]; metaDesc: string }> = {
    fantasy: { tags: ["Fantasy Football", "Waiver Wire", "Fantasy Tips", "NFL Fantasy", "Start Sit", "2025 NFL"], metaDesc: `Fantasy football strategy, waiver wire tips, and lineup advice for the 2025 NFL season. Make better decisions and win your league.` },
    trade: { tags: ["NFL Trades", "Trade Deadline", "NFL News", "Roster Moves", "2025 NFL"], metaDesc: `Latest NFL trade analysis and impact breakdown. What it means for both rosters and the league's competitive balance in 2025.` },
    injury: { tags: ["NFL Injuries", "Injury Report", "NFL News", "Roster Updates", "2025 NFL"], metaDesc: `NFL injury update and analysis. Impact assessment, replacement options, and what it means for fantasy football and the standings.` },
    rankings: { tags: ["NFL Power Rankings", "NFL Analysis", "NFL 2025", "Team Rankings", "NFL Predictions"], metaDesc: `2025 NFL power rankings with in-depth analysis of the top contenders, rising teams, and who to watch as the season develops.` },
    picks: { tags: ["NFL Picks", "NFL Predictions", "Weekly Picks", "NFL Analysis", "2025 NFL Season"], metaDesc: `NFL picks and predictions for the 2025 season. Matchup breakdowns, trend analysis, and the best bets of the week.` },
    draft: { tags: ["NFL Draft", "Draft Prospects", "Scouting Report", "NFL Analysis", "2025 NFL Draft"], metaDesc: `NFL Draft analysis, prospect breakdowns, and scouting reports. Everything you need to know about the next generation of NFL talent.` },
    playoffs: { tags: ["NFL Playoffs", "Super Bowl", "Playoff Predictions", "NFL 2025", "Championship"], metaDesc: `2025 NFL playoff outlook and Super Bowl predictions. Who are the real contenders, who are the pretenders, and what wins in January.` },
    analysis: { tags: ["NFL Analysis", "NFL 2025", "NFL Predictions", "Football Strategy", "NFL Hub"], metaDesc: `In-depth NFL analysis covering the key storylines, scheme trends, and competitive dynamics shaping the 2025 NFL season.` },
  };

  const meta = topicMeta[topicType] ?? topicMeta.analysis;

  return {
    content,
    excerpt: `${title} — in-depth NFL analysis, strategic breakdown, and key takeaways for the 2025 season. Stay ahead with NFL Predictions Hub.`,
    tags: meta.tags,
    metaTitle: `${title} | NFL Predictions Hub`,
    metaDescription: meta.metaDesc,
  };
}

// ── route handler ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const result = generatePost(title.trim());
  return NextResponse.json(result);
}
