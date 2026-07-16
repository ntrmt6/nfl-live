import "dotenv/config";
import mongoose from "mongoose";
import slugify from "slugify";
import Game from "../src/models/Game";
import Post from "../src/models/Post";

const MONGODB_URI = process.env.MONGODB_URI!;

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

const TEAM_FACTS: Record<string, {
  stadium: string; founded: number; sb: number; nickname: string;
  coach: string; qb: string; city: string; state: string; mascot: string;
  colors: string; homeCrowd: string;
}> = {
  KC:  { stadium:"GEHA Field at Arrowhead Stadium", founded:1960, sb:4, nickname:"Chiefs Kingdom", coach:"Andy Reid", qb:"Patrick Mahomes", city:"Kansas City", state:"MO", mascot:"Chiefs", colors:"red and gold", homeCrowd:"one of the loudest in the NFL" },
  BAL: { stadium:"M&T Bank Stadium", founded:1996, sb:2, nickname:"Ravens Nation", coach:"John Harbaugh", qb:"Lamar Jackson", city:"Baltimore", state:"MD", mascot:"Ravens", colors:"purple and black", homeCrowd:"a deafening purple sea" },
  BUF: { stadium:"Highmark Stadium", founded:1960, sb:0, nickname:"Bills Mafia", coach:"Sean McDermott", qb:"Josh Allen", city:"Buffalo", state:"NY", mascot:"Bills", colors:"blue and red", homeCrowd:"Bills Mafia — electric in any weather" },
  PHI: { stadium:"Lincoln Financial Field", founded:1933, sb:1, nickname:"Eagles Nation", coach:"Nick Sirianni", qb:"Jalen Hurts", city:"Philadelphia", state:"PA", mascot:"Eagles", colors:"midnight green and silver", homeCrowd:"the most passionate in the NFC" },
  SF:  { stadium:"Levi's Stadium", founded:1946, sb:5, nickname:"Faithful", coach:"Kyle Shanahan", qb:"Brock Purdy", city:"San Francisco", state:"CA", mascot:"49ers", colors:"scarlet and gold", homeCrowd:"the Faithful — fiercely loyal" },
  DAL: { stadium:"AT&T Stadium", founded:1960, sb:5, nickname:"America's Team", coach:"Mike McCarthy", qb:"Dak Prescott", city:"Dallas", state:"TX", mascot:"Cowboys", colors:"navy, silver, and white", homeCrowd:"a nationwide fanbase with 90,000 at Jerry World" },
  DET: { stadium:"Ford Field", founded:1930, sb:0, nickname:"Pride of the Lions", coach:"Dan Campbell", qb:"Jared Goff", city:"Detroit", state:"MI", mascot:"Lions", colors:"Honolulu blue and silver", homeCrowd:"a rejuvenated fanbase hungry for history" },
  GB:  { stadium:"Lambeau Field", founded:1919, sb:4, nickname:"Cheeseheads", coach:"Matt LaFleur", qb:"Jordan Love", city:"Green Bay", state:"WI", mascot:"Packers", colors:"green and gold", homeCrowd:"the frozen tundra faithful — legendary" },
  MIN: { stadium:"U.S. Bank Stadium", founded:1961, sb:0, nickname:"Skol Nation", coach:"Kevin O'Connell", qb:"Sam Darnold", city:"Minneapolis", state:"MN", mascot:"Vikings", colors:"purple and gold", homeCrowd:"Skol Nation — thunderous indoors" },
  CIN: { stadium:"Paycor Stadium", founded:1968, sb:0, nickname:"Who Dey Nation", coach:"Zac Taylor", qb:"Joe Burrow", city:"Cincinnati", state:"OH", mascot:"Bengals", colors:"black and orange", homeCrowd:"Who Dey Nation fired up along the Ohio River" },
  PIT: { stadium:"Acrisure Stadium", founded:1933, sb:6, nickname:"Steeler Nation", coach:"Mike Tomlin", qb:"Russell Wilson", city:"Pittsburgh", state:"PA", mascot:"Steelers", colors:"black and gold", homeCrowd:"a Terrible Towel-waving sea of black and gold" },
  CLE: { stadium:"Huntington Bank Field", founded:1946, sb:0, nickname:"Dawg Pound", coach:"Kevin Stefanski", qb:"Deshaun Watson", city:"Cleveland", state:"OH", mascot:"Browns", colors:"orange and brown", homeCrowd:"the Dawg Pound — relentless" },
  HOU: { stadium:"NRG Stadium", founded:2002, sb:0, nickname:"Texans Nation", coach:"DeMeco Ryans", qb:"C.J. Stroud", city:"Houston", state:"TX", mascot:"Texans", colors:"deep steel blue and battle red", homeCrowd:"a growing powerhouse crowd" },
  IND: { stadium:"Lucas Oil Stadium", founded:1953, sb:2, nickname:"Horseshoe Nation", coach:"Shane Steichen", qb:"Anthony Richardson", city:"Indianapolis", state:"IN", mascot:"Colts", colors:"royal blue and white", homeCrowd:"a passionate Midwest crowd" },
  JAX: { stadium:"EverBank Stadium", founded:1995, sb:0, nickname:"DUUVAL", coach:"Doug Pederson", qb:"Trevor Lawrence", city:"Jacksonville", state:"FL", mascot:"Jaguars", colors:"teal and gold", homeCrowd:"DUUVAL faithful packed in along the St. Johns River" },
  TEN: { stadium:"Nissan Stadium", founded:1960, sb:0, nickname:"Titans Up", coach:"Brian Callahan", qb:"Will Levis", city:"Nashville", state:"TN", mascot:"Titans", colors:"navy, Columbia blue, and red", homeCrowd:"Tennessee Titans fans ready to make noise in Music City" },
  MIA: { stadium:"Hard Rock Stadium", founded:1966, sb:2, nickname:"Fins Up", coach:"Mike McDaniel", qb:"Tua Tagovailoa", city:"Miami", state:"FL", mascot:"Dolphins", colors:"aqua and orange", homeCrowd:"a vibrant South Florida crowd" },
  NE:  { stadium:"Gillette Stadium", founded:1960, sb:6, nickname:"Patriot Nation", coach:"Jerod Mayo", qb:"Drake Maye", city:"Boston", state:"MA", mascot:"Patriots", colors:"red, white, and blue", homeCrowd:"New England faithful — battle-tested and proud" },
  NYJ: { stadium:"MetLife Stadium", founded:1960, sb:1, nickname:"Gang Green", coach:"Robert Saleh", qb:"Aaron Rodgers", city:"New York", state:"NJ", mascot:"Jets", colors:"green and white", homeCrowd:"Gang Green faithful ready to erupt in East Rutherford" },
  NYG: { stadium:"MetLife Stadium", founded:1925, sb:4, nickname:"Big Blue", coach:"Brian Daboll", qb:"Daniel Jones", city:"New York", state:"NJ", mascot:"Giants", colors:"blue, red, and white", homeCrowd:"Big Blue Nation passionate at MetLife" },
  WAS: { stadium:"Northwest Stadium", founded:1932, sb:3, nickname:"Burgundy & Gold", coach:"Dan Quinn", qb:"Jayden Daniels", city:"Washington", state:"DC", mascot:"Commanders", colors:"burgundy and gold", homeCrowd:"a rejuvenated DMV fanbase behind a young QB" },
  CHI: { stadium:"Soldier Field", founded:1920, sb:1, nickname:"Da Bears", coach:"Ben Johnson", qb:"Caleb Williams", city:"Chicago", state:"IL", mascot:"Bears", colors:"navy and orange", homeCrowd:"Da Bears fans electric on the lakefront at Soldier Field" },
  ATL: { stadium:"Mercedes-Benz Stadium", founded:1966, sb:0, nickname:"Rise Up", coach:"Raheem Morris", qb:"Kirk Cousins", city:"Atlanta", state:"GA", mascot:"Falcons", colors:"red, black, and silver", homeCrowd:"Rise Up Nation in one of the NFL's finest indoor venues" },
  NO:  { stadium:"Caesars Superdome", founded:1967, sb:1, nickname:"Who Dat Nation", coach:"Dennis Allen", qb:"Derek Carr", city:"New Orleans", state:"LA", mascot:"Saints", colors:"black and gold", homeCrowd:"Who Dat Nation — one of the loudest domes in football" },
  CAR: { stadium:"Bank of America Stadium", founded:1995, sb:0, nickname:"Keep Pounding", coach:"Dave Canales", qb:"Bryce Young", city:"Charlotte", state:"NC", mascot:"Panthers", colors:"black and blue", homeCrowd:"Panthers fans keeping the pound going in the Carolinas" },
  TB:  { stadium:"Raymond James Stadium", founded:1976, sb:2, nickname:"Pewter Pirates", coach:"Todd Bowles", qb:"Baker Mayfield", city:"Tampa Bay", state:"FL", mascot:"Buccaneers", colors:"red, pewter, and black", homeCrowd:"Pewter Pirates Nation proud of back-to-back Lombardi trophies" },
  LAR: { stadium:"SoFi Stadium", founded:1936, sb:2, nickname:"Rams Fandom", coach:"Sean McVay", qb:"Matthew Stafford", city:"Los Angeles", state:"CA", mascot:"Rams", colors:"blue and yellow", homeCrowd:"a Hollywood-glam LA crowd at the most expensive stadium ever built" },
  LAC: { stadium:"SoFi Stadium", founded:1960, sb:0, nickname:"Charger Nation", coach:"Jim Harbaugh", qb:"Justin Herbert", city:"Los Angeles", state:"CA", mascot:"Chargers", colors:"navy and powder blue", homeCrowd:"Charger Nation energized by Harbaugh's rebuild" },
  SEA: { stadium:"Lumen Field", founded:1976, sb:1, nickname:"12s", coach:"Mike Macdonald", qb:"Geno Smith", city:"Seattle", state:"WA", mascot:"Seahawks", colors:"college navy and action green", homeCrowd:"the 12s — the loudest stadium crowd in NFL history" },
  ARI: { stadium:"State Farm Stadium", founded:1920, sb:0, nickname:"Cardinal Nation", coach:"Jonathan Gannon", qb:"Kyler Murray", city:"Glendale", state:"AZ", mascot:"Cardinals", colors:"cardinal red and white", homeCrowd:"Cardinal Nation growing behind Kyler Murray's return" },
  DEN: { stadium:"Empower Field at Mile High", founded:1960, sb:3, nickname:"Broncos Country", coach:"Sean Payton", qb:"Bo Nix", city:"Denver", state:"CO", mascot:"Broncos", colors:"orange and navy", homeCrowd:"Mile High faithful at 5,280 feet — a true home-field advantage" },
  LV:  { stadium:"Allegiant Stadium", founded:1960, sb:1, nickname:"Raider Nation", coach:"Antonio Pierce", qb:"Gardner Minshew", city:"Las Vegas", state:"NV", mascot:"Raiders", colors:"silver and black", homeCrowd:"Raider Nation — passionate and globe-trotting" },
};

// Streaming details per broadcast network
const STREAMING_INFO: Record<string, {
  tvChannel: string;
  description: string;
  services: string[];
  free: string[];
  mobile: string;
  notes: string;
}> = {
  "NBC": {
    tvChannel: "NBC",
    description: "NBC's Sunday Night Football — the #1 primetime show in America",
    services: ["Peacock Premium", "fuboTV", "Hulu + Live TV", "YouTube TV", "DirecTV Stream", "Sling TV (Blue)"],
    free: ["Peacock (limited markets)", "Over-the-air antenna (free HD)"],
    mobile: "NFL+ (mobile & tablet streaming)",
    notes: "Peacock is NBC's exclusive streaming home for Sunday Night Football. Some games are simulcast on Peacock only.",
  },
  "CBS": {
    tvChannel: "CBS",
    description: "CBS's Sunday afternoon NFL window",
    services: ["Paramount+ with SHOWTIME", "fuboTV", "Hulu + Live TV", "YouTube TV", "DirecTV Stream", "Sling TV (Blue)"],
    free: ["Paramount+ (free trial available)", "Over-the-air antenna (free HD)"],
    mobile: "NFL+ (mobile & tablet streaming)",
    notes: "Paramount+ is CBS's streaming home. A Paramount+ Essential plan is enough to stream CBS NFL games.",
  },
  "FOX": {
    tvChannel: "FOX",
    description: "FOX's NFL Sunday broadcast slate",
    services: ["fuboTV", "Hulu + Live TV", "YouTube TV", "DirecTV Stream", "Sling TV (Blue & Orange)"],
    free: ["Tubi (select FOX games — completely free, no subscription)", "Over-the-air antenna (free HD)"],
    mobile: "NFL+ (mobile & tablet streaming)",
    notes: "FOX does not have a standalone streaming app for live sports, but fuboTV and Hulu + Live TV carry it. Check Tubi for free replays.",
  },
  "ABC/ESPN": {
    tvChannel: "ABC & ESPN",
    description: "ESPN's Monday Night Football — simulcast on ABC",
    services: ["ESPN+ (with TV provider login)", "fuboTV", "Hulu + Live TV", "YouTube TV", "DirecTV Stream", "Sling TV (Orange)"],
    free: ["DirecTV Stream (7-day free trial)", "Over-the-air antenna for ABC (free HD)"],
    mobile: "NFL+ (mobile & tablet streaming)",
    notes: "Monday Night Football airs on both ESPN and ABC. The ABC feed is free over-the-air. ESPN+ requires a cable/satellite login to watch live.",
  },
  "Prime": {
    tvChannel: "Amazon Prime Video (streaming exclusive)",
    description: "Amazon Prime Video's exclusive Thursday Night Football",
    services: ["Amazon Prime Video (included with Prime membership — $14.99/month or $139/year)"],
    free: ["30-day Amazon Prime free trial for new members"],
    mobile: "Amazon Prime Video app (iOS, Android, Fire TV, Roku, Apple TV, smart TVs)",
    notes: "Thursday Night Football is a Prime Video exclusive — it is NOT available on cable TV (except on local over-the-air in some markets). You must have an Amazon Prime or Prime Video subscription.",
  },
  "Peacock": {
    tvChannel: "Peacock (streaming exclusive)",
    description: "Peacock's exclusive NFL streaming game",
    services: ["Peacock Premium ($7.99/month) or Peacock Premium Plus ($13.99/month, ad-free)"],
    free: ["Peacock free trial for new subscribers"],
    mobile: "Peacock app (iOS, Android, Roku, Fire TV, Apple TV, smart TVs)",
    notes: "This game is a Peacock exclusive — it will NOT air on any cable or broadcast channel. A Peacock Premium subscription is required.",
  },
  "NFL Network": {
    tvChannel: "NFL Network",
    description: "NFL Network's game broadcast",
    services: ["NFL+ Premium ($13.99/month)", "fuboTV", "DirecTV Stream", "Hulu + Live TV", "Sling TV (Blue + Sports Extra)"],
    free: ["DirecTV Stream (7-day free trial)"],
    mobile: "NFL+ Premium (mobile, tablet, and connected TV streaming)",
    notes: "NFL Network is not available on basic cable in all markets. NFL+ Premium is the most reliable way to stream without a traditional cable package.",
  },
};

function getPhotoUrl(away: string, home: string, week: number): string {
  return `https://picsum.photos/seed/nfl-${away}-${home}-w${week}/1200/675`;
}

function isDivisionRival(a: string, b: string): boolean {
  return !!(DIVISIONS[a] && DIVISIONS[a] === DIVISIONS[b]);
}

function isConferenceGame(a: string, b: string): boolean {
  return DIVISIONS[a]?.startsWith("AFC") === DIVISIONS[b]?.startsWith("AFC");
}

function formatKickoff(kickoff: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  }).format(kickoff);
}

function formatDate(kickoff: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  }).format(kickoff);
}

// Select article angle for uniqueness — rotates through 6 styles
type Angle = "watch-guide" | "rivalry" | "everything" | "cord-cutter" | "kickoff-info" | "analysis";

function selectAngle(week: number, network: string, isRival: boolean, away: string, home: string): Angle {
  if (network === "Prime" || network === "Peacock") return "cord-cutter";
  if (isRival && week >= 12) return "rivalry";
  const seed = (away.charCodeAt(0) * 3 + home.charCodeAt(1) * 7 + week * 11) % 6;
  const angles: Angle[] = ["watch-guide", "everything", "kickoff-info", "analysis", "watch-guide", "cord-cutter"];
  return angles[seed];
}

function sbHistory(team: string, facts: typeof TEAM_FACTS[string]): string {
  if (facts.sb >= 5) return `a storied franchise with ${facts.sb} Super Bowl rings`;
  if (facts.sb >= 3) return `a championship-caliber program with ${facts.sb} Lombardi Trophies`;
  if (facts.sb === 2) return `a franchise with ${facts.sb} Super Bowl titles`;
  if (facts.sb === 1) return `a franchise that knows how to win it all — one Lombardi to their name`;
  return `a franchise still searching for their first Super Bowl championship`;
}

function streamingBlock(network: string): string {
  const info = STREAMING_INFO[network] || STREAMING_INFO["CBS"];
  const servicesList = info.services.map(s => `<li><strong>${s}</strong></li>`).join("\n");
  const freeList = info.free.map(s => `<li>${s}</li>`).join("\n");
  return `
<h2>How to Watch ${info.tvChannel} — Live Stream & TV Options</h2>
<p>
  The game airs on <strong>${info.tvChannel}</strong> — ${info.description}. Here is every way to watch, whether you have cable or have cut the cord entirely:
</p>
<h3>Paid Streaming Services</h3>
<ul>
${servicesList}
</ul>
<h3>Free or Trial Options</h3>
<ul>
${freeList}
</ul>
<h3>Mobile Streaming</h3>
<p>${info.mobile}</p>
<p><em>Note: ${info.notes}</em></p>
`.trim();
}

function generateFaqs(g: {
  awayTeamFull: string; homeTeamFull: string; awayTeam: string; homeTeam: string;
  venue: string; network: string; week: number; kickoff: Date;
}): { question: string; answer: string }[] {
  const info = STREAMING_INFO[g.network] || STREAMING_INFO["CBS"];
  const kickoffStr = formatKickoff(g.kickoff);
  const dateStr = formatDate(g.kickoff);
  const topService = info.services[0];

  const faqs: { question: string; answer: string }[] = [
    {
      question: `What time does ${g.awayTeamFull} vs. ${g.homeTeamFull} kick off?`,
      answer: `${g.awayTeamFull} vs. ${g.homeTeamFull} kicks off at ${kickoffStr} on ${dateStr}. This is a Week ${g.week} NFL game.`,
    },
    {
      question: `What channel is ${g.awayTeamFull} vs. ${g.homeTeamFull} on?`,
      answer: `The game is on ${info.tvChannel}. ${info.description}. Check your local listings for the exact channel number in your market.`,
    },
    {
      question: `How can I stream ${g.awayTeamFull} vs. ${g.homeTeamFull} without cable?`,
      answer: `You can stream this game without cable using ${info.services.slice(0, 3).join(", ")}. ${g.network === "Prime" ? "Amazon Prime Video is the exclusive home of Thursday Night Football." : `${topService} is a popular option for cord-cutters.`}`,
    },
    {
      question: `Where is ${g.awayTeamFull} vs. ${g.homeTeamFull} being played?`,
      answer: `This Week ${g.week} game is being played at ${g.venue}. The ${g.homeTeamFull} are the home team.`,
    },
    {
      question: `Is the ${g.awayTeamFull} vs. ${g.homeTeamFull} game available on NFL+?`,
      answer: `${info.mobile}. NFL+ allows mobile and tablet streaming of live local and national games. Check NFL+ availability for your location and device.`,
    },
  ];

  // Add a network-specific FAQ
  if (g.network === "Prime") {
    faqs.push({
      question: "Do I need Amazon Prime to watch Thursday Night Football?",
      answer: "Yes, Thursday Night Football is exclusive to Amazon Prime Video. You need an Amazon Prime membership ($14.99/month or $139/year) or a standalone Prime Video subscription ($8.99/month). New members can start with a 30-day free trial.",
    });
  } else if (g.network === "Peacock") {
    faqs.push({
      question: "Is this NFL game only on Peacock?",
      answer: "Yes, this game is a Peacock exclusive and will not air on any cable or broadcast channel. You need a Peacock Premium subscription ($7.99/month) to watch live. Peacock Premium Plus ($13.99/month) removes ads.",
    });
  } else if (g.network === "NBC") {
    faqs.push({
      question: "Is Sunday Night Football on Peacock?",
      answer: "Sunday Night Football airs on NBC and is also available to stream on Peacock Premium. Some special SNF games are Peacock exclusives, so check the schedule. Peacock Premium costs $7.99/month.",
    });
  } else if (g.network === "ABC/ESPN") {
    faqs.push({
      question: "Is Monday Night Football free to watch?",
      answer: "Monday Night Football airs on both ESPN and ABC. The ABC broadcast is free over-the-air with an antenna. The ESPN broadcast requires a cable/satellite subscription or a live TV streaming service like Hulu + Live TV, YouTube TV, or fuboTV.",
    });
  }

  return faqs;
}

function faqHtml(faqs: { question: string; answer: string }[]): string {
  const items = faqs.map(f => `
<div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
  <h3 itemprop="name">${f.question}</h3>
  <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
    <p itemprop="text">${f.answer}</p>
  </div>
</div>`.trim()).join("\n");
  return `<section itemscope itemtype="https://schema.org/FAQPage">\n<h2>Frequently Asked Questions</h2>\n${items}\n</section>`;
}

function generateContent(g: {
  awayTeam: string; awayTeamFull: string;
  homeTeam: string; homeTeamFull: string;
  venue: string; network: string; week: number; season: number;
  kickoff: Date;
}): { title: string; excerpt: string; content: string; tags: string[]; schemaMarkup: string } {
  const awayF = TEAM_FACTS[g.awayTeam] ?? {
    stadium: "their home stadium", founded: 1960, sb: 0, nickname: "the fans",
    coach: "their head coach", qb: "their quarterback", city: g.awayTeamFull,
    state: "USA", mascot: g.awayTeam, colors: "team colors", homeCrowd: "passionate fans",
  };
  const homeF = TEAM_FACTS[g.homeTeam] ?? {
    stadium: g.venue, founded: 1960, sb: 0, nickname: "the home crowd",
    coach: "their head coach", qb: "their quarterback", city: g.homeTeamFull,
    state: "USA", mascot: g.homeTeam, colors: "team colors", homeCrowd: "the home crowd",
  };

  const isRival = isDivisionRival(g.awayTeam, g.homeTeam);
  const isSameConf = isConferenceGame(g.awayTeam, g.homeTeam);
  const division = DIVISIONS[g.homeTeam] || "";
  const info = STREAMING_INFO[g.network] || STREAMING_INFO["CBS"];
  const angle = selectAngle(g.week, g.network, isRival, g.awayTeam, g.homeTeam);
  const kickoffStr = formatKickoff(g.kickoff);
  const dateStr = formatDate(g.kickoff);
  const faqs = generateFaqs({ ...g, venue: g.venue });

  // Build rivalry/conference context paragraph
  const contextLine = isRival
    ? `This is a ${division} divisional clash — the most personal rivalry in football. Division opponents know each other's schemes, personnel, and tendencies better than any other foe on the schedule, and that familiarity breeds an intensity rarely matched in the regular season.`
    : isSameConf
    ? `As a ${division.startsWith("AFC") ? "AFC" : "NFC"} conference matchup, conference record is the first tiebreaker for playoff seeding — making every intra-conference win a leveraged investment in January positioning.`
    : `This inter-conference clash is a genuine measuring-stick game: rarely do these franchises meet, so coordinators are forced to scheme against unfamiliar systems, and the element of surprise can be decisive.`;

  // Title and excerpt vary by angle
  let title: string;
  let excerpt: string;

  if (angle === "cord-cutter") {
    title = `How to Stream ${g.awayTeamFull} vs. ${g.homeTeamFull} Without Cable — Week ${g.week}`;
    excerpt = `${g.awayTeamFull} vs. ${g.homeTeamFull} is on ${info.tvChannel} on ${dateStr}. Here's exactly how to watch it live — with or without cable — including every streaming option, free trials, and mobile viewing for Week ${g.week}.`;
  } else if (angle === "watch-guide") {
    title = `${g.awayTeamFull} vs. ${g.homeTeamFull}: How to Watch Live — Week ${g.week} TV & Stream Guide`;
    excerpt = `Kickoff is ${kickoffStr} on ${info.tvChannel}. Everything you need to watch ${g.awayTeamFull} vs. ${g.homeTeamFull} live in Week ${g.week}: TV channel, live stream options, kickoff time, and a full game preview.`;
  } else if (angle === "rivalry") {
    title = `${g.awayTeamFull} vs. ${g.homeTeamFull} Week ${g.week}: ${division} Showdown — How to Watch & Preview`;
    excerpt = `${division} rivals collide in Week ${g.week} as the ${g.awayTeamFull} head to ${g.venue} to face the ${g.homeTeamFull}. Kickoff: ${kickoffStr} on ${info.tvChannel}. Full rivalry preview, key matchups, and every way to watch live.`;
  } else if (angle === "kickoff-info") {
    title = `${g.awayTeamFull} vs. ${g.homeTeamFull} Kickoff Time, TV Channel & Live Stream — Week ${g.week}`;
    excerpt = `${g.awayTeamFull} vs. ${g.homeTeamFull} kicks off at ${kickoffStr} on ${info.tvChannel} from ${g.venue}. Here's the complete Week ${g.week} viewing guide: channel, stream options, game preview, and what's at stake.`;
  } else if (angle === "analysis") {
    title = `${g.awayTeamFull} vs. ${g.homeTeamFull}: Week ${g.week} Preview, Analysis & Where to Watch`;
    excerpt = `The ${g.awayTeamFull} travel to ${g.venue} to face the ${g.homeTeamFull} in a high-stakes Week ${g.week} matchup. Full analysis of both teams, key player matchups, predictions, and how to watch live on ${info.tvChannel}.`;
  } else {
    title = `${g.awayTeamFull} vs. ${g.homeTeamFull}: Everything to Know for Week ${g.week}`;
    excerpt = `Complete Week ${g.week} guide for ${g.awayTeamFull} vs. ${g.homeTeamFull}: kickoff time (${kickoffStr}), TV channel (${info.tvChannel}), streaming options, game preview, and key matchups at ${g.venue}.`;
  }

  // Content body
  const content = `
<h2>Game at a Glance</h2>
<ul>
  <li><strong>Matchup:</strong> ${g.awayTeamFull} (away) vs. ${g.homeTeamFull} (home)</li>
  <li><strong>Kickoff:</strong> ${kickoffStr}</li>
  <li><strong>Venue:</strong> ${g.venue}${homeF.city ? `, ${homeF.city}, ${homeF.state}` : ""}</li>
  <li><strong>TV Channel:</strong> ${info.tvChannel}</li>
  <li><strong>Week:</strong> ${g.week} of the ${g.season} NFL Season</li>
  <li><strong>Stream:</strong> ${info.services[0]}${info.services[1] ? `, ${info.services[1]}` : ""}, and more</li>
</ul>

${streamingBlock(g.network)}

<h2>Game Preview: ${g.awayTeamFull} vs. ${g.homeTeamFull}</h2>
<p>
  Week ${g.week} of the ${g.season} NFL season brings a compelling contest as ${sbHistory(g.awayTeamFull, awayF)} — the <strong>${g.awayTeamFull}</strong> — travel to <strong>${g.venue}</strong> to face the <strong>${g.homeTeamFull}</strong>, ${sbHistory(g.homeTeamFull, homeF)}. ${contextLine}
</p>

<h2>The ${g.awayTeamFull}: Can ${awayF.qb} Win on the Road?</h2>
<p>
  Head coach <strong>${awayF.coach}</strong> brings his squad into hostile territory at ${g.venue}, where the ${homeF.homeCrowd} will be at full volume. The ${g.awayTeamFull} lean heavily on quarterback <strong>${awayF.qb}</strong> to lead the offense, and his ability to process quickly under crowd noise will be a decisive factor. ${awayF.nickname} will be watching closely — a road victory would send a statement to the rest of the league.
</p>
<p>
  The ${g.awayTeamFull}'s success on the road this season depends on establishing a run game to control clock, limiting third-down conversions against them, and avoiding early turnovers. Any of those three break down, and the advantage shifts firmly to the home side.
</p>

<h2>The ${g.homeTeamFull}: Home Fortress at ${g.venue}</h2>
<p>
  Coach <strong>${homeF.coach}</strong>'s squad holds the significant edge of playing in front of ${homeF.homeCrowd} at <strong>${homeF.stadium}</strong>. The ${g.homeTeamFull} know this stadium's quirks — the crowd noise disrupting communication, the turf conditions, the sight lines — and they will use every bit of that institutional knowledge to manufacture early advantages. Quarterback <strong>${homeF.qb}</strong> has shown comfort working from home, where the play-action game and RPO concepts generate explosive plays against crowded boxes.
</p>
<p>
  The ${g.homeTeamFull} are ${sbHistory(g.homeTeamFull, homeF)}, and the franchise views home games as non-negotiable wins on their path toward postseason contention. Expect a highly scripted first-quarter game plan designed to neutralize the ${g.awayTeamFull}'s best weapons.
</p>

<h2>Key Matchups to Watch</h2>
<p>
  <strong>${awayF.qb} vs. ${homeF.nickname} crowd noise:</strong> Communication breakdowns at the line of scrimmage are one of the most underrated factors in road games. Watch how ${awayF.qb} handles pre-snap adjustments and whether the ${g.awayTeamFull} come out with a quick-tempo approach to minimize noise impact.
</p>
<p>
  <strong>Trenches battle:</strong> The collision between the ${g.awayTeamFull}'s offensive line and the ${g.homeTeamFull}'s defensive front sets the physical tone. If ${awayF.qb} has a clean pocket, the ${g.awayTeamFull} move the chains. If the home pass rush generates early disruption, ${homeF.qb} can take over in a controlled environment.
</p>
<p>
  <strong>Red-zone efficiency:</strong> Both teams' red-zone offense and defense will be under the microscope — scoring touchdowns instead of settling for field goals is often the difference in close NFL games, and this matchup figures to be exactly that.
</p>

<h2>What's at Stake in Week ${g.week}</h2>
<p>
  ${isRival
    ? `In divisional play, the winner gains a critical leg up in the ${division} standings. With each divisional game worth double in the playoff race — win percentage against division opponents is the second tiebreaker — both franchises are treating this as essential.`
    : isSameConf
    ? `Conference record carries enormous weight in playoff seeding, and both the ${g.awayTeamFull} and ${g.homeTeamFull} are acutely aware that wins against conference opponents carry extra value come January. This game could separate a division leader from a wild card hopeful.`
    : `While inter-conference games don't directly affect playoff tiebreakers, they're crucial proof-of-concept moments. Winning against a different conference's style of play builds momentum and confidence heading into the back half of the schedule.`
  }
</p>
<p>
  With ${g.week <= 4 ? "the season still finding its footing" : g.week <= 9 ? "the season at the midpoint" : g.week <= 13 ? "playoff seeding crystallizing" : "the playoff picture nearly locked in"}, this Week ${g.week} matchup between the ${g.awayTeamFull} and ${g.homeTeamFull} carries outsized importance. Don't miss a snap.
</p>

<h2>How to Watch on Every Device</h2>
<p>Whether you're watching on your TV, phone, or tablet, here's the full breakdown:</p>
<ul>
  <li><strong>Smart TV (Roku, Fire TV, Apple TV):</strong> Download the ${info.services[0].split(" ")[0]} app and sign in.</li>
  <li><strong>iPhone / Android:</strong> ${info.mobile}</li>
  <li><strong>Laptop / Desktop:</strong> Stream at ${
    g.network === "Prime" ? "primevideo.com" :
    g.network === "Peacock" ? "peacocktv.com" :
    g.network === "NBC" ? "peacocktv.com or nbcsports.com" :
    g.network === "CBS" ? "paramountplus.com" :
    g.network === "ABC/ESPN" ? "espn.com/watch" :
    "the broadcaster's official website"
  } or any of the live TV streaming services listed above.</li>
  <li><strong>Cable / Satellite subscribers:</strong> Tune to ${info.tvChannel} on your provider. No extra action needed.</li>
</ul>

${faqHtml(faqs)}
`.trim();

  // Build tags — keyword-rich for SEO
  const tags: string[] = [
    g.awayTeamFull,
    g.homeTeamFull,
    awayF.mascot,
    homeF.mascot,
    `Week ${g.week}`,
    `${g.season} NFL Season`,
    "How to Watch NFL",
    "NFL Live Stream",
    "Watch NFL Online",
    isRival ? `${division} Rivalry` : isSameConf ? "Conference Game" : "NFL Preview",
    info.tvChannel === "Amazon Prime Video (streaming exclusive)" ? "Thursday Night Football" :
    g.network === "NBC" ? "Sunday Night Football" :
    g.network === "ABC/ESPN" ? "Monday Night Football" : "NFL on TV",
    "NFL Schedule 2026",
  ].filter(Boolean);

  // FAQ schema for schemaMarkup
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  // SportsEvent schema
  const sportsEventSchema = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${g.awayTeamFull} vs. ${g.homeTeamFull}`,
    alternateName: `${g.awayTeam} at ${g.homeTeam} Week ${g.week} ${g.season}`,
    startDate: g.kickoff.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    location: {
      "@type": "Place",
      name: g.venue,
      address: { "@type": "PostalAddress", addressLocality: homeF.city, addressRegion: homeF.state, addressCountry: "US" },
    },
    homeTeam: { "@type": "SportsTeam", name: g.homeTeamFull, sport: "American Football" },
    awayTeam: { "@type": "SportsTeam", name: g.awayTeamFull, sport: "American Football" },
    sport: "American Football",
    organizer: { "@type": "Organization", name: "National Football League", url: "https://www.nfl.com" },
    description: excerpt,
    broadcastOfEvent: {
      "@type": "BroadcastEvent",
      name: `${g.awayTeamFull} vs. ${g.homeTeamFull} Live Broadcast`,
      broadcastDisplayName: info.tvChannel,
    },
  };

  const schemaMarkup = JSON.stringify([faqSchema, sportsEventSchema]);

  // SEO-optimized meta title / description
  const metaTitle = angle === "kickoff-info" || angle === "cord-cutter"
    ? title
    : `${g.awayTeamFull} vs. ${g.homeTeamFull} Week ${g.week}: How to Watch, TV & Stream`;
  const metaDescription = `${g.awayTeamFull} vs. ${g.homeTeamFull} kicks off ${kickoffStr} on ${info.tvChannel}. Watch live online: ${info.services.slice(0, 2).join(", ")}. Full Week ${g.week} preview, kickoff time & streaming guide.`;

  return { title, excerpt, content, tags, schemaMarkup };
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const games = await Game.find({ season: 2026 }).sort({ week: 1, kickoff: 1 }).lean();
  console.log(`Found ${games.length} games — generating articles…`);

  let inserted = 0;
  let updated = 0;

  for (const game of games) {
    const g = game as any;
    const { title, excerpt, content, tags, schemaMarkup } = generateContent({
      awayTeam: g.awayTeam,
      awayTeamFull: g.awayTeamFull,
      homeTeam: g.homeTeam,
      homeTeamFull: g.homeTeamFull,
      venue: g.venue || "the stadium",
      network: g.network || "CBS",
      week: g.week,
      season: g.season,
      kickoff: new Date(g.kickoff),
    });

    const slug = slugify(title, { lower: true, strict: true });
    const coverImage = getPhotoUrl(g.awayTeam, g.homeTeam, g.week);

    const existing = await Post.findOne({
      $or: [
        { slug },
        // also match older slugs generated by the previous seed format
        { slug: slugify(`${g.awayTeamFull} vs. ${g.homeTeamFull} Week ${g.week} Matchup Preview Analysis`, { lower: true, strict: true }) },
        { slug: slugify(`${g.awayTeamFull} vs. ${g.homeTeamFull} Week ${g.week} Division Rivalry Preview`, { lower: true, strict: true }) },
      ],
    }).lean();

    const doc = {
      slug,
      title,
      excerpt,
      content,
      coverImage,
      author: "NFL Live Zone Staff",
      tags,
      published: true,
      metaTitle: title,
      metaDescription: excerpt,
      schemaMarkup,
    };

    if (existing) {
      await Post.updateOne({ _id: existing._id }, { $set: doc });
      updated++;
    } else {
      await Post.create(doc);
      inserted++;
    }

    if ((inserted + updated) % 25 === 0) {
      console.log(`  ${inserted} inserted, ${updated} updated…`);
    }
  }

  console.log(`Done: ${inserted} new articles, ${updated} updated.`);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
