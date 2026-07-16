import "dotenv/config";
import mongoose from "mongoose";
import slugify from "slugify";
import Game from "../src/models/Game";
import Post from "../src/models/Post";

const MONGODB_URI = process.env.MONGODB_URI!;

// Division membership for rivalry detection
const DIVISIONS: Record<string, string> = {
  KC:"AFC West", LV:"AFC West", LAC:"AFC West", DEN:"AFC West",
  BAL:"AFC North", PIT:"AFC North", CLE:"AFC North", CIN:"AFC North",
  BUF:"AFC East", MIA:"AFC East", NE:"AFC East", NYJ:"AFC East",
  HOU:"AFC South", IND:"AFC South", JAX:"AFC South", TEN:"AFC South",
  PHI:"NFC East", DAL:"NFC East", NYG:"NFC East", WAS:"NFC East",
  GB:"NFC North", DET:"NFC North", MIN:"NFC North", CHI:"NFC North",
  TB:"NFC South", ATL:"NFC South", NO:"NFC South", CAR:"NFC South",
  SF:"NFC West", LAR:"NFC West", SEA:"NFC West", ARI:"NFC West",
};

// Curated facts per team
const TEAM_FACTS: Record<string, { stadium: string; founded: number; sb: number; nickname: string; coach: string; qb: string; city: string }> = {
  KC:  { stadium:"GEHA Field at Arrowhead Stadium", founded:1960, sb:4, nickname:"Chiefs Kingdom", coach:"Andy Reid", qb:"Patrick Mahomes", city:"Kansas City" },
  BAL: { stadium:"M&T Bank Stadium", founded:1996, sb:2, nickname:"Ravens Nation", coach:"John Harbaugh", qb:"Lamar Jackson", city:"Baltimore" },
  BUF: { stadium:"Highmark Stadium", founded:1960, sb:0, nickname:"Bills Mafia", coach:"Sean McDermott", qb:"Josh Allen", city:"Buffalo" },
  PHI: { stadium:"Lincoln Financial Field", founded:1933, sb:1, nickname:"Eagles Nation", coach:"Nick Sirianni", qb:"Jalen Hurts", city:"Philadelphia" },
  SF:  { stadium:"Levi's Stadium", founded:1946, sb:5, nickname:"Faithful", coach:"Kyle Shanahan", qb:"Brock Purdy", city:"San Francisco" },
  DAL: { stadium:"AT&T Stadium", founded:1960, sb:5, nickname:"America's Team", coach:"Mike McCarthy", qb:"Dak Prescott", city:"Dallas" },
  DET: { stadium:"Ford Field", founded:1930, sb:0, nickname:"Pride of the Lions", coach:"Dan Campbell", qb:"Jared Goff", city:"Detroit" },
  GB:  { stadium:"Lambeau Field", founded:1919, sb:4, nickname:"Cheeseheads", coach:"Matt LaFleur", qb:"Jordan Love", city:"Green Bay" },
  MIN: { stadium:"U.S. Bank Stadium", founded:1961, sb:0, nickname:"Skol Nation", coach:"Kevin O'Connell", qb:"Sam Darnold", city:"Minneapolis" },
  CIN: { stadium:"Paycor Stadium", founded:1968, sb:0, nickname:"Who Dey Nation", coach:"Zac Taylor", qb:"Joe Burrow", city:"Cincinnati" },
  PIT: { stadium:"Acrisure Stadium", founded:1933, sb:6, nickname:"Steeler Nation", coach:"Mike Tomlin", qb:"Russell Wilson", city:"Pittsburgh" },
  CLE: { stadium:"Huntington Bank Field", founded:1946, sb:0, nickname:"Dawg Pound", coach:"Kevin Stefanski", qb:"Deshaun Watson", city:"Cleveland" },
  HOU: { stadium:"NRG Stadium", founded:2002, sb:0, nickname:"Texans Nation", coach:"DeMeco Ryans", qb:"C.J. Stroud", city:"Houston" },
  IND: { stadium:"Lucas Oil Stadium", founded:1953, sb:2, nickname:"Horseshoe Nation", coach:"Shane Steichen", qb:"Anthony Richardson", city:"Indianapolis" },
  JAX: { stadium:"EverBank Stadium", founded:1995, sb:0, nickname:"DUUVAL", coach:"Doug Pederson", qb:"Trevor Lawrence", city:"Jacksonville" },
  TEN: { stadium:"Nissan Stadium", founded:1960, sb:0, nickname:"Titans Up", coach:"Brian Callahan", qb:"Will Levis", city:"Nashville" },
  MIA: { stadium:"Hard Rock Stadium", founded:1966, sb:2, nickname:"Fins Up", coach:"Mike McDaniel", qb:"Tua Tagovailoa", city:"Miami" },
  NE:  { stadium:"Gillette Stadium", founded:1960, sb:6, nickname:"Patriot Nation", coach:"Jerod Mayo", qb:"Drake Maye", city:"Boston" },
  NYJ: { stadium:"MetLife Stadium", founded:1960, sb:1, nickname:"Gang Green", coach:"Robert Saleh", qb:"Aaron Rodgers", city:"New York" },
  NYG: { stadium:"MetLife Stadium", founded:1925, sb:4, nickname:"Big Blue", coach:"Brian Daboll", qb:"Daniel Jones", city:"New York" },
  WAS: { stadium:"Northwest Stadium", founded:1932, sb:3, nickname:"Burgundy & Gold", coach:"Dan Quinn", qb:"Jayden Daniels", city:"Washington" },
  CHI: { stadium:"Soldier Field", founded:1920, sb:1, nickname:"Da Bears", coach:"Ben Johnson", qb:"Caleb Williams", city:"Chicago" },
  ATL: { stadium:"Mercedes-Benz Stadium", founded:1966, sb:0, nickname:"Rise Up", coach:"Raheem Morris", qb:"Kirk Cousins", city:"Atlanta" },
  NO:  { stadium:"Caesars Superdome", founded:1967, sb:1, nickname:"Who Dat Nation", coach:"Dennis Allen", qb:"Derek Carr", city:"New Orleans" },
  CAR: { stadium:"Bank of America Stadium", founded:1995, sb:0, nickname:"Keep Pounding", coach:"Dave Canales", qb:"Bryce Young", city:"Charlotte" },
  TB:  { stadium:"Raymond James Stadium", founded:1976, sb:2, nickname:"Pewter Pirates", coach:"Todd Bowles", qb:"Baker Mayfield", city:"Tampa Bay" },
  LAR: { stadium:"SoFi Stadium", founded:1936, sb:2, nickname:"Rams Fandom", coach:"Sean McVay", qb:"Matthew Stafford", city:"Los Angeles" },
  LAC: { stadium:"SoFi Stadium", founded:1960, sb:0, nickname:"Charger Nation", coach:"Jim Harbaugh", qb:"Justin Herbert", city:"Los Angeles" },
  SEA: { stadium:"Lumen Field", founded:1976, sb:1, nickname:"12s", coach:"Mike Macdonald", qb:"Geno Smith", city:"Seattle" },
  ARI: { stadium:"State Farm Stadium", founded:1920, sb:0, nickname:"Cardinal Nation", coach:"Jonathan Gannon", qb:"Kyler Murray", city:"Arizona" },
  DEN: { stadium:"Empower Field at Mile High", founded:1960, sb:3, nickname:"Broncos Country", coach:"Sean Payton", qb:"Bo Nix", city:"Denver" },
  LV:  { stadium:"Allegiant Stadium", founded:1960, sb:1, nickname:"Raider Nation", coach:"Antonio Pierce", qb:"Gardner Minshew", city:"Las Vegas" },
};

// Unique Unsplash photo IDs — football stadiums, game day, NFL action
const PHOTO_IDS = [
  "1566577739-9b9e57e6ef25","1508098682722-e99c43a406b2","1551958219-acbc595d1d96",
  "1552667466-07770ae110d0","1614632537197-38a17061c2bd","1574629810360-7efbbe195018",
  "1571019614242-c5c5dee9f50b","1600679472829-3044539781c8","1589487391730-58f20eb4d3f7",
  "1504016798967-23c6e43e8c43","1541747618780-b0aecdc2e4ad","1519766304817-4f37bda74b28",
  "1560272564-d83d04ed2ad6","1522778119026-1e67b3dab0a3","1526232761682-d26e03ac148e",
  "1547347298-4074ad3086f0","1543351611-58f4e80d5c8f","1529900748604-07360bb6e596",
  "1473492201326-7c01dd2e596b","1614271538965-8e28f0a7efec","1562552052-9de8f6f7f1f4",
  "1624526267942-ab0ff8a3f972","1508701145011-f2c94cb4cb7e","1553772961-b1e94dc91f68",
  "1535131749-80a3428b0a93","1612872087720-bb876e2e67d3","1631744853079-c17c98da7a1a",
  "1578662996442-48f60103fc96","1600432589340-e5eb9b0cdba8","1555679486-4bf14b8f7c21",
];

function getPhotoUrl(away: string, home: string, week: number): string {
  // deterministic index based on team chars + week
  const seed = (away.charCodeAt(0) + home.charCodeAt(0) + week * 7) % PHOTO_IDS.length;
  return `https://images.unsplash.com/photo-${PHOTO_IDS[seed]}?w=1200&h=675&fit=crop&auto=format`;
}

function isDivisionRival(a: string, b: string): boolean {
  return DIVISIONS[a] === DIVISIONS[b];
}

function isConferenceGame(a: string, b: string): boolean {
  return DIVISIONS[a]?.startsWith("AFC") === DIVISIONS[b]?.startsWith("AFC");
}

function networkContext(network: string): string {
  const map: Record<string, string> = {
    "NBC": "NBC's Sunday Night Football — the most-watched primetime show in America",
    "CBS": "CBS's afternoon broadcast window",
    "FOX": "FOX's regional broadcast slate",
    "ABC/ESPN": "ESPN's Monday Night Football",
    "Prime": "Amazon Prime Video's Thursday Night Football",
  };
  return map[network] || network;
}

function weekContext(week: number): string {
  if (week === 1) return "Opening weekend sets the tone for the entire season — every snap matters as teams look to establish early momentum.";
  if (week === 2) return "Week 2 separates early movers from stumbling blocks, as the sample size grows and real trends start to emerge.";
  if (week <= 4) return `Early in the ${2026} season, every win and loss carries playoff seeding implications that will echo for months.`;
  if (week <= 8) return "The midpoint of the season is approaching, and contenders are beginning to separate from pretenders.";
  if (week === 12) return "The Thanksgiving stretch is one of the most-watched weeks in the NFL calendar — stakes are at a premium.";
  if (week <= 14) return "The final stretch of the regular season looms, with playoff positioning becoming the central conversation around the league.";
  if (week >= 15) return "With the playoffs just weeks away, every game carries enormous weight for teams on the bubble and division leaders alike.";
  return "The season is in full swing, with playoff implications hanging over every snap.";
}

function generateContent(g: {
  awayTeam: string; awayTeamFull: string;
  homeTeam: string; homeTeamFull: string;
  venue: string; network: string; week: number; season: number;
  kickoff: Date;
}): { title: string; excerpt: string; content: string; tags: string[] } {
  const away = TEAM_FACTS[g.awayTeam] || { stadium: "their home stadium", founded: 1960, sb: 0, nickname: "the fans", coach: "their head coach", qb: "their quarterback", city: g.awayTeamFull };
  const home = TEAM_FACTS[g.homeTeam] || { stadium: g.venue, founded: 1960, sb: 0, nickname: "the home crowd", coach: "their head coach", qb: "their quarterback", city: g.homeTeamFull };

  const isRival = isDivisionRival(g.awayTeam, g.homeTeam);
  const isSameConf = isConferenceGame(g.awayTeam, g.homeTeam);
  const rivalryLine = isRival
    ? `This is a division rivalry — one of the most heated in the ${DIVISIONS[g.awayTeam]} — where every point and every turnover can swing the entire standings.`
    : isSameConf
    ? `As a conference matchup, the stakes extend beyond a single win: conference record is the first tiebreaker for playoff seeding, meaning both franchises will be treating this as a must-win scenario.`
    : `This inter-conference clash offers a rare measuring-stick opportunity for both sides, pitting philosophies from different parts of the league against each other.`;

  const sbLine = (team: string, facts: typeof away) =>
    facts.sb > 0
      ? `${team} bring the weight of ${facts.sb} Super Bowl championship${facts.sb > 1 ? "s" : ""} to their identity`
      : `${team} have been hunting their first Lombardi Trophy`;

  const kickoffStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  }).format(g.kickoff);

  const title = isRival
    ? `${g.awayTeamFull} vs. ${g.homeTeamFull}: Week ${g.week} Division Rivalry Preview`
    : `${g.awayTeamFull} vs. ${g.homeTeamFull}: Week ${g.week} Matchup Preview & Analysis`;

  const excerpt = isRival
    ? `${g.awayTeamFull} travel to ${g.venue} for a high-stakes ${DIVISIONS[g.homeTeam]} rivalry clash with the ${g.homeTeamFull} in Week ${g.week}. Here's everything you need to know before kickoff.`
    : `The ${g.awayTeamFull} head to ${g.venue} to face the ${g.homeTeamFull} in a pivotal Week ${g.week} matchup. Full preview, key players to watch, and how to catch every snap.`;

  const content = `
<h2>Game Overview</h2>
<p>
  Week ${g.week} of the ${g.season} NFL season delivers a compelling contest as the <strong>${g.awayTeamFull}</strong> travel to <strong>${g.venue}</strong> to take on the <strong>${g.homeTeamFull}</strong>. Kickoff is set for <strong>${kickoffStr}</strong> on <strong>${g.network}</strong> — ${networkContext(g.network)}.
</p>
<p>${weekContext(g.week)}</p>
<p>${rivalryLine}</p>

<h2>${g.awayTeamFull}: Road Warriors or Road Casualties?</h2>
<p>
  The ${g.awayTeamFull} arrive with high expectations from <strong>${away.nickname}</strong>. ${sbLine(g.awayTeamFull, away)}, and under the direction of head coach <strong>${away.coach}</strong>, the franchise has been building a roster capable of making a deep postseason run. Quarterback <strong>${away.qb}</strong> will be the focal point of the offense and the player most likely to determine whether the ${g.awayTeamFull} leave ${g.homeTeam === "LV" || g.homeTeam === "LAC" || g.homeTeam === "LAR" ? "Los Angeles" : home.city} with a victory.
</p>
<p>
  Road games are always a mental and physical challenge in the NFL. The travel, the crowd noise, and the disrupted routine all conspire against visiting teams. How the ${g.awayTeamFull} handle the hostile atmosphere at ${g.venue} will be one of the key subplots heading into this contest. Their ability to convert on third downs and protect the ball early will go a long way toward managing road-game adversity.
</p>

<h2>${g.homeTeamFull}: Fortress at ${g.venue}</h2>
<p>
  The ${g.homeTeamFull} enjoy the considerable advantage of playing in front of ${home.nickname} at <strong>${g.venue}</strong>. Under head coach <strong>${home.coach}</strong>, the team has cultivated a culture that feeds off home energy. Quarterback <strong>${home.qb}</strong> is expected to thrive with the support of a partisan crowd, using play-action and RPO concepts to keep the defense off-balance.
</p>
<p>
  ${sbLine(g.homeTeamFull, home)}, and the franchise is keenly aware that home-field dominance is a cornerstone of any deep playoff run. Expect the coaching staff to deploy creative schemes designed specifically to exploit weaknesses identified in the ${g.awayTeamFull}'s recent tape.
</p>

<h2>Key Matchup: Offensive Line vs. Pass Rush</h2>
<p>
  Every NFL game is won or lost in the trenches, and this matchup is no different. The battle between the ${g.awayTeamFull}'s offensive line and the ${g.homeTeamFull}'s defensive front — and vice versa — will dictate the tempo of the entire afternoon. If ${away.qb} has a clean pocket and time to survey the field, the ${g.awayTeamFull} have the weapons to move the chains. If the ${g.homeTeamFull} can generate early pressure, they can force hurried decisions and create opportunities for their secondary to make plays.
</p>
<p>
  Similarly, ${home.qb} will need to read the ${g.awayTeamFull}'s defensive schemes quickly. The modern NFL demands quarterbacks process information at an elite level, and this Week ${g.week} clash will put both signal-callers to the test.
</p>

<h2>Players to Watch</h2>
<p>
  Beyond the headline quarterbacks, keep a close eye on each team's skill players. Pass-catchers who can create separation in traffic and running backs who can punish linebackers on checkdowns will be crucial in what promises to be a close, physical game. Special teams — often an afterthought — could also prove decisive, particularly if field position becomes a determining factor in the fourth quarter.
</p>
<p>
  Watch for rookie contributors on both rosters who have been developing throughout the week's practice sessions. Fresh legs and unpredictability can catch veteran defenses off-guard, and both coaching staffs are likely to manufacture touches for emerging playmakers.
</p>

<h2>Historical Perspective</h2>
<p>
  The ${g.awayTeamFull} and ${g.homeTeamFull} have a ${isRival ? "storied divisional" : "respectful interleague"} history. ${isRival ? `As members of the same division, these teams know each other's schemes, personnel, and tendencies better than almost any other opponent on the schedule. Divisional games tend to be lower-scoring, defensive battles decided by turnovers and red-zone efficiency.` : `Cross-conference matchups offer unique challenges — coordinators spend extra time scheming against unfamiliar offensive systems, and the wrinkle of playing an opponent seen rarely can produce surprising results.`}
</p>
<p>
  Both franchises have invested heavily in scouting and analytics departments to gain an edge in exactly these situations. Expect the game plan to feature wrinkles not seen earlier in the season.
</p>

<h2>Broadcast Information & How to Watch</h2>
<p>
  The ${g.awayTeamFull} vs. ${g.homeTeamFull} game kicks off on <strong>${kickoffStr}</strong>. The game airs on <strong>${g.network}</strong> — ${networkContext(g.network)}. Local broadcast markets will carry the game in standard definition and HD. Streaming options are available through the network's official app as well as NFL+.
</p>
<p>
  For fans unable to access traditional broadcasts, our site provides links to live coverage options so you never miss a snap of this Week ${g.week} showdown.
</p>

<h2>Prediction</h2>
<p>
  This figures to be a competitive game decided in the fourth quarter. The home-field advantage at ${g.venue} gives the ${g.homeTeamFull} a slight edge, but the ${g.awayTeamFull} have shown they can win on the road when executing their game plan consistently. Expect ${home.qb} and ${away.qb} to trade big plays, with turnovers and red-zone efficiency ultimately separating the two teams.
</p>
<p>
  Regardless of the final score, NFL fans are in for a Week ${g.week} treat. Both rosters are talented, both coaching staffs are motivated, and ${g.venue} will be rocking from the opening kickoff. Don't miss a moment of the action.
</p>
`.trim();

  const tags = [
    g.awayTeamFull,
    g.homeTeamFull,
    `Week ${g.week}`,
    `${g.season} NFL Season`,
    isRival ? "Division Rivalry" : "Preview",
    "NFL Schedule",
  ];

  return { title, excerpt, content, tags };
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const games = await Game.find({ season: 2026 }).sort({ week: 1, kickoff: 1 }).lean();
  console.log(`Found ${games.length} games to generate articles for…`);

  let inserted = 0;
  let skipped = 0;

  for (const game of games) {
    const g = game as any;
    const { title, excerpt, content, tags } = generateContent({
      awayTeam: g.awayTeam,
      awayTeamFull: g.awayTeamFull,
      homeTeam: g.homeTeam,
      homeTeamFull: g.homeTeamFull,
      venue: g.venue || "the stadium",
      network: g.network || "TBD",
      week: g.week,
      season: g.season,
      kickoff: new Date(g.kickoff),
    });

    const slug = slugify(title, { lower: true, strict: true });
    const coverImage = getPhotoUrl(g.awayTeam, g.homeTeam, g.week);

    const existing = await Post.findOne({ slug }).lean();
    if (existing) { skipped++; continue; }

    await Post.create({
      slug,
      title,
      excerpt,
      content,
      coverImage,
      author: "HD NFL TV Staff",
      tags,
      published: true,
      metaTitle: title,
      metaDescription: excerpt,
    });

    inserted++;
    if (inserted % 25 === 0) console.log(`  ${inserted} articles created…`);
  }

  console.log(`Done: ${inserted} inserted, ${skipped} already existed.`);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
