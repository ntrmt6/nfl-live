import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";
import { connectDB } from "@/lib/db";
import Game from "@/models/Game";
import CollegeGame from "@/models/CollegeGame";
import Post from "@/models/Post";
import { NFL_TEAM_PROFILES, getNFLProfile, type TeamProfile } from "@/lib/team-profiles";

export const maxDuration = 300;

// ─── Helpers ────────────────────────────────────────────────────────────────

function hashStr(s: string): number {
  let h = 0;
  for (const c of s) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

// ─── NFL Content ─────────────────────────────────────────────────────────────

const NFL_INTRO_TEMPLATES = [
  (away: string, home: string, w: number, venue?: string) =>
    `<p>Week ${w} brings one of the most compelling matchups on the schedule as the <strong>${away}</strong> travel to take on the <strong>${home}</strong>${venue ? ` at ${venue}` : ""}. Both franchises arrive with something to prove, and this contest has all the ingredients of a hard-fought, meaningful game.</p>`,
  (away: string, home: string, w: number, venue?: string) =>
    `<p>The Week ${w} NFL schedule delivers a compelling road test as the <strong>${away}</strong> make the trip to face the <strong>${home}</strong>${venue ? ` at ${venue}` : ""}. With stakes rising across the league, this matchup carries weight for both franchises.</p>`,
  (away: string, home: string, w: number, venue?: string) =>
    `<p>Week ${w} features an intriguing matchup as the <strong>${away}</strong> head on the road to challenge the <strong>${home}</strong>${venue ? ` inside ${venue}` : ""}. Both teams are looking to build momentum, and the scheme matchups on both sides of the ball make this a game worth watching closely.</p>`,
  (away: string, home: string, w: number, venue?: string) =>
    `<p>One of the more anticipated matchups on the Week ${w} slate pits the road-weary <strong>${away}</strong> against a <strong>${home}</strong> side eager to protect their home field${venue ? ` at ${venue}` : ""}. The stakes, the storylines, and the strategic questions all make this a must-watch game.</p>`,
];

const NFL_H2H_TEMPLATES = [
  (away: string, home: string) =>
    `<p>The history between these two franchises adds an extra layer of intrigue to this matchup. The <strong>${home}</strong> have enjoyed home-field advantage in this series in recent years, but the <strong>${away}</strong> have proven capable of winning on the road against quality opponents.</p><p>Recent meetings have been competitive, with the margin of victory often coming down to turnover differential and third-down conversion rates. Expect this game to follow a similar pattern — the team that protects the ball and converts in critical moments will find a way to win.</p>`,
  (away: string, home: string) =>
    `<p>The series between the <strong>${away}</strong> and the <strong>${home}</strong> has produced several memorable moments in recent years. Home-field advantage has been a factor historically, giving the ${home} a slight edge in games played at their stadium.</p><p>Both coaching staffs have familiarity with each other's personnel tendencies, which typically results in game plans that prioritize scheme discipline over trick plays. Expect this meeting to be decided by execution and which team makes fewer mistakes in the second half.</p>`,
  (away: string, home: string) =>
    `<p>While this matchup does not carry the weight of a decades-long rivalry, the <strong>${away}</strong> and <strong>${home}</strong> have developed a competitive thread in recent seasons. Both franchises are trending, which makes this week's game meaningful beyond the standings.</p><p>The last time these teams met, field position and turnover margin proved decisive. Both coaching staffs will emphasize ball security and red-zone efficiency as key performance indicators heading into this contest.</p>`,
];

const NFL_KEYS_TEMPLATES = [
  (away: string, home: string, ap: TeamProfile, hp: TeamProfile) => `<ul>
  <li><strong>Turnover battle:</strong> The team that protects the football will control the scoreboard. Both offenses are capable of scoring in bunches, meaning a single turnover in the wrong moment can flip the outcome entirely.</li>
  <li><strong>${away} third-down conversion:</strong> The ${away} must stay ahead of the chains to keep ${hp.qb} and the ${home} offense on the sideline. Sustained drives that end in points will be the difference between a comfortable victory and a close game.</li>
  <li><strong>Home-field advantage for ${home}:</strong> ${hp.coach}'s team has been strong at home. The crowd, familiar conditions, and situational comfort give them a structural edge the ${away} must overcome through consistent execution.</li>
</ul>`,
  (away: string, home: string, ap: TeamProfile, hp: TeamProfile) => `<ul>
  <li><strong>Controlling the line of scrimmage:</strong> Whichever front five dominates in the trenches will dictate the game's flow. Physical dominance at the point of attack is the most reliable path to victory in this matchup.</li>
  <li><strong>${hp.qb} vs. the ${away} pass rush:</strong> ${hp.qb}'s ability to avoid sacks and deliver on third down is the ${home}'s most important offensive variable. Consistent pressure disrupts the entire ${home} offensive rhythm.</li>
  <li><strong>Red-zone efficiency:</strong> Both defenses are capable of limiting long drives but susceptible to giving up points in the red zone. The team that converts scoring opportunities — rather than settling for field goals — will almost certainly win.</li>
</ul>`,
  (away: string, home: string, ap: TeamProfile, hp: TeamProfile) => `<ul>
  <li><strong>Special teams execution:</strong> Field position is often overlooked but consistently proves decisive in evenly matched games. A muffed punt, a long return, or a blocked kick can change the entire strategic calculus for both coaching staffs.</li>
  <li><strong>${ap.qb}'s rhythm in the first half:</strong> The ${away} need their quarterback operating in rhythm early. If ${ap.qb} can establish confidence through the first two possessions, the offense will find its footing and put pressure on the ${home} defense throughout.</li>
  <li><strong>Halftime adjustments:</strong> Both ${ap.coach} and ${hp.coach} are respected in-game adjusters. Whoever makes the better halftime correction will likely see the benefit in the third quarter when games often swing decisively.</li>
</ul>`,
];

const NFL_PREDICTION_TEMPLATES = [
  (away: string, home: string, ap: TeamProfile, hp: TeamProfile) =>
    `<p>This is a competitive matchup that could go either way, but home-field advantage tips the scales toward the <strong>${home}</strong>. ${hp.coach}'s team has the personnel to exploit the ${away}'s <strong>${ap.weakness}</strong>, and their <strong>${hp.strength}</strong> should prove decisive in the second half.</p><p>The <strong>${away}</strong> will compete and keep this game close — ${ap.qb} is too talented to be completely shut out — but the ${home} should find a way to win. Look for the ${home} to pull away in the fourth quarter behind ${hp.qb}'s poise and a timely defensive stop.</p><p><strong>Prediction: ${home} win</strong></p>`,
  (away: string, home: string, ap: TeamProfile, hp: TeamProfile) =>
    `<p>The <strong>${away}</strong> are a dangerous road team, and ${ap.qb}'s ability to create off-schedule plays makes them a genuine threat to win outright. But the <strong>${home}</strong> have the structural advantage — home field, scheme familiarity, and the continuity ${hp.coach}'s program has built.</p><p>Expect the ${away} to make this competitive into the fourth quarter. Their <strong>${ap.strength}</strong> will generate scoring opportunities. In the end, the ${home} should hold on behind ${hp.qb}'s steady performance and a defense that limits explosive plays in critical moments.</p><p><strong>Prediction: ${home} win in a close game</strong></p>`,
  (away: string, home: string, ap: TeamProfile, hp: TeamProfile) =>
    `<p>This game sets up as a genuine toss-up, with both teams capable of winning depending on execution and turnovers. The <strong>${away}</strong>'s <strong>${ap.strength}</strong> gives them a real path to victory on the road, but the <strong>${home}</strong>'s <strong>${hp.strength}</strong> is a consistent advantage in close games.</p><p>Our lean is toward the ${home} based on home-field advantage and ${hp.coach}'s track record in contested games. But do not be surprised if ${ap.qb} and the ${away} keep this within one score until the final minutes. This is exactly the kind of game that makes the NFL compelling every week.</p><p><strong>Prediction: ${home} win, but it will be close</strong></p>`,
];

function generateNFLContent(game: {
  awayTeamFull: string; homeTeamFull: string;
  awayTeam: string; homeTeam: string;
  week: number; season: number;
  kickoff: Date; venue?: string; network?: string;
}) {
  const { awayTeamFull: away, homeTeamFull: home, awayTeam, homeTeam, week, season, venue, network } = game;
  const ap = getNFLProfile(awayTeam);
  const hp = getNFLProfile(homeTeam);
  const seed = hashStr(`${away}-${home}-${week}-${season}`);

  const kickoffStr = new Date(game.kickoff).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const content = `
<h2>Game Overview</h2>
${pick(NFL_INTRO_TEMPLATES, seed)(away, home, week, venue)}

<h2>${away} Outlook</h2>
<p>${pick(ap.outlook, seed)}${network ? ` The game airs on <strong>${network}</strong>, giving this matchup national exposure that reflects its competitive quality.` : ""}</p>
<p>Head coach <strong>${ap.coach}</strong> has built a team around a <strong>${ap.offenseStyle}</strong> on offense and a <strong>${ap.defenseStyle}</strong> on defense. The team's primary strength is <strong>${ap.strength}</strong>, while the coaching staff will look to address their <strong>${ap.weakness}</strong> in this week's contest.</p>
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
${pick(NFL_H2H_TEMPLATES, seed + 1)(away, home)}

<h2>Keys to the Game</h2>
${pick(NFL_KEYS_TEMPLATES, seed + 2)(away, home, ap, hp)}

<h2>Prediction</h2>
<p><em>Kickoff: ${kickoffStr}${venue ? ` | ${venue}` : ""}${network ? ` | ${network}` : ""}</em></p>
${pick(NFL_PREDICTION_TEMPLATES, seed + 3)(away, home, ap, hp)}
`.trim();

  return {
    slug: slugify(`${away}-vs-${home}-week-${week}-${season}-preview`, { lower: true, strict: true }),
    title: `${away} vs ${home}: Week ${week} Matchup Preview & Predictions`,
    excerpt: `Complete Week ${week} preview for ${away} at ${home}. Team analysis, key players to watch, head-to-head history, and our final score prediction for the ${season} NFL season.`,
    content,
    author: "NFL Predictions Hub Staff",
    tags: [away, home, `Week ${week}`, "Matchup Preview", "NFL Predictions", `${season} NFL Season`, "NFL Analysis"],
    published: true,
    metaTitle: `${away} vs ${home} Week ${week} Preview | NFL Predictions Hub`,
    metaDescription: `${away} at ${home} — Week ${week} matchup preview with predictions, key players, and analysis for the ${season} NFL season.`,
  };
}

// ─── CFB Content ─────────────────────────────────────────────────────────────

const CFB_OFFENSE_STYLES = ["spread", "pro-style", "option", "air raid", "run-power", "RPO-based"];
const CFB_DEFENSE_STYLES = ["4-2-5 zone", "3-3-5 stack", "4-3 base", "3-4 hybrid", "cover-2 shell", "press-man scheme"];

const CFB_INTRO_TEMPLATES = [
  (away: string, home: string, week: number, venue?: string, rivalry?: boolean, bowl?: string, bowlName?: string) => {
    if (bowl && bowlName) return `<p>The <strong>${bowlName}</strong> sets the stage for a postseason showdown between the <strong>${away}</strong> and the <strong>${home}</strong>${venue ? ` at ${venue}` : ""}. Bowl season brings out the best in college football, and both programs have earned the right to compete on this stage.</p>`;
    if (rivalry) return `<p>Rivalry week arrives as the <strong>${away}</strong> travel to face the <strong>${home}</strong>${venue ? ` at ${venue}` : ""} in one of the most anticipated matchups on the Week ${week} college football schedule. The history between these programs adds meaning to every snap.</p>`;
    return `<p>Week ${week} of the college football season features a compelling matchup as the <strong>${away}</strong> travel to take on the <strong>${home}</strong>${venue ? ` at ${venue}` : ""}. Both programs are competing for positioning, and this game carries real implications for both fan bases.</p>`;
  },
  (away: string, home: string, week: number, venue?: string, rivalry?: boolean, bowl?: string, bowlName?: string) => {
    if (bowl && bowlName) return `<p>Postseason football arrives with the <strong>${bowlName}</strong>, as the <strong>${away}</strong> meet the <strong>${home}</strong>${venue ? ` in ${venue}` : ""}. Both programs earned their way here, and the stakes of bowl season give this matchup extra weight.</p>`;
    if (rivalry) return `<p>Few matchups in college football carry the weight of a rivalry game. The <strong>${away}</strong> and <strong>${home}</strong> renew their rivalry in Week ${week}${venue ? ` at ${venue}` : ""}, and both programs understand what's at stake beyond the win column.</p>`;
    return `<p>The Week ${week} college football slate delivers an intriguing road test as the <strong>${away}</strong> head into hostile territory to face the <strong>${home}</strong>${venue ? ` at ${venue}` : ""}. Scheme matchups and execution will determine the outcome in what figures to be a competitive contest.</p>`;
  },
];

const CFB_AWAY_TEMPLATES = [
  (away: string, conf?: string, offStyle?: string, defStyle?: string) =>
    `<p>The <strong>${away}</strong>${conf ? ` represent the ${conf} conference` : ""} and bring a <strong>${offStyle ?? "balanced"} offense</strong> into this matchup. Their ability to move the chains and create explosive plays will be critical against a home defense that has been tested this season.</p><p>Defensively, the ${away} operate a <strong>${defStyle ?? "disciplined"}</strong> that has given opponents problems converting on third down. Their ability to generate pressure and limit chunk plays will be the key variable on that side of the ball.</p>`,
  (away: string, conf?: string, offStyle?: string, defStyle?: string) =>
    `<p>The <strong>${away}</strong>${conf ? `, coming out of the ${conf}` : ""}, enter this matchup riding a <strong>${offStyle ?? "multi-dimensional"} offensive system</strong> that creates problems for opposing defenses. When their skill players have space to operate, they're capable of putting points on the board in a hurry.</p><p>On defense, the ${away} employ a <strong>${defStyle ?? "scheme-first"}</strong> that rewards disciplined execution. Road environments can be a factor, but this group has shown the ability to compete when the crowd is against them.</p>`,
];

const CFB_HOME_TEMPLATES = [
  (home: string, conf?: string, offStyle?: string, defStyle?: string) =>
    `<p>The <strong>${home}</strong>${conf ? ` of the ${conf}` : ""} bring home-field advantage and a <strong>${offStyle ?? "physical"} offensive approach</strong> that has worn down opponents at their own venue this season. Their crowd creates genuine noise that affects visiting offenses at critical moments.</p><p>The home defense runs a <strong>${defStyle ?? "aggressive"}</strong> that has been disruptive against spread offenses in particular. Expect them to test the visitors early and force the away team to prove they can execute in a hostile environment.</p>`,
  (home: string, conf?: string, offStyle?: string, defStyle?: string) =>
    `<p>The <strong>${home}</strong>${conf ? `, representing the ${conf}` : ""}, are at their best at home, where their <strong>${offStyle ?? "tempo-based"} offense</strong> thrives with the crowd behind them. Their ability to establish the run and control field position gives them a structural edge in this contest.</p><p>Defensively, they run a <strong>${defStyle ?? "multiple-front"}</strong> that creates confusion in opposing offensive line protection schemes. Their home-field advantage amplifies what is already a disruptive defensive unit.</p>`,
];

const CFB_KEYS_TEMPLATES = [
  (away: string, home: string) => `<ul>
  <li><strong>Turnover margin:</strong> College football games are frequently decided by turnovers more than any other factor. The team that protects the ball and creates takeaways will have a decisive advantage in the final score.</li>
  <li><strong>Third-down conversion rate:</strong> Sustained drives require converting on third down. The ${away} and ${home} both have the offensive weapons to move the chains — but execution in critical moments will separate them.</li>
  <li><strong>Home-field energy:</strong> The ${home} crowd will be a factor in the first quarter. If the ${away} can weather the early energy and stay within one score before halftime, their chances of pulling off the road win improve dramatically.</li>
</ul>`,
  (away: string, home: string) => `<ul>
  <li><strong>Offensive line play:</strong> Both teams want to establish the run, which means the battle in the trenches will be decisive. Whichever front creates more push in the first half will set the tone for the entire game.</li>
  <li><strong>Red-zone efficiency:</strong> Both offenses are capable of moving the ball but have shown vulnerability when it comes to converting red-zone trips into touchdowns. Settling for field goals in a tight game can prove costly.</li>
  <li><strong>Special teams momentum:</strong> A blocked kick, a big return, or a catastrophic punt can swing a college football game immediately. Both coaching staffs will emphasize discipline on special teams heading into kickoff.</li>
</ul>`,
];

const CFB_PREDICTION_TEMPLATES = [
  (away: string, home: string) =>
    `<p>Home-field advantage in college football is more significant than in the NFL, and the <strong>${home}</strong> should benefit from the energy of their crowd throughout this contest. Their ability to control the line of scrimmage and force the <strong>${away}</strong> into third-and-long situations should be the decisive factor.</p><p>The ${away} have the offensive weapons to make this competitive, but road wins are earned through consistent execution — and consistency has been the challenge. Expect a competitive first half that gives way to a ${home} advantage in the second half.</p><p><strong>Prediction: ${home} win</strong></p>`,
  (away: string, home: string) =>
    `<p>This matchup is closer than the records suggest. The <strong>${away}</strong> bring genuine offensive talent that can exploit the ${home} defense, but road environments in college football create real challenges that statistics don't always capture.</p><p>Our lean is toward the <strong>${home}</strong> based on home-field advantage and the difficulty of winning on the road in this type of environment. A close first half is the most likely scenario, with the home team pulling ahead in the third quarter behind a more comfortable crowd and scheme advantage.</p><p><strong>Prediction: ${home} win in a competitive game</strong></p>`,
];

function generateCFBContent(game: {
  awayTeamFull: string; homeTeamFull: string;
  awayTeam: string; homeTeam: string;
  week: number; season: number;
  kickoff: Date; venue?: string; network?: string;
  isRivalry?: boolean; isBowlGame?: boolean; bowlName?: string;
  conference?: string; awayConference?: string;
}) {
  const {
    awayTeamFull: away, homeTeamFull: home,
    awayTeam, homeTeam, week, season, venue, network,
    isRivalry, isBowlGame, bowlName, conference, awayConference,
  } = game;
  const seed = hashStr(`${away}-${home}-${week}-${season}-cfb`);

  const awayOffStyle = pick(CFB_OFFENSE_STYLES, seed);
  const awayDefStyle = pick(CFB_DEFENSE_STYLES, seed + 1);
  const homeOffStyle = pick(CFB_OFFENSE_STYLES, seed + 2);
  const homeDefStyle = pick(CFB_DEFENSE_STYLES, seed + 3);

  const kickoffStr = new Date(game.kickoff).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const isBowl = isBowlGame || week === 0;
  const weekLabel = isBowl ? (bowlName ?? "Bowl Game") : `Week ${week}`;

  const content = `
<h2>Game Overview</h2>
${pick(CFB_INTRO_TEMPLATES, seed)(away, home, week, venue, isRivalry, isBowl ? "bowl" : undefined, bowlName)}

<h2>${away} Outlook</h2>
${pick(CFB_AWAY_TEMPLATES, seed)(away, awayConference, awayOffStyle, awayDefStyle)}

<h2>${home} Outlook</h2>
${pick(CFB_HOME_TEMPLATES, seed + 1)(home, conference, homeOffStyle, homeDefStyle)}

<h2>Keys to the Game</h2>
${pick(CFB_KEYS_TEMPLATES, seed + 2)(away, home)}

<h2>Prediction</h2>
<p><em>Kickoff: ${kickoffStr}${venue ? ` | ${venue}` : ""}${network ? ` | ${network}` : ""}</em></p>
${pick(CFB_PREDICTION_TEMPLATES, seed + 3)(away, home)}
`.trim();

  const tags = [
    away, home,
    "College Football", "CFB Preview", "NCAA Football",
    `${season} CFB Season`,
    ...(isBowl ? ["Bowl Game", bowlName ?? "Bowl Season"] : [`Week ${week}`]),
    ...(isRivalry ? ["Rivalry Game"] : []),
    ...(conference ? [conference] : []),
    ...(awayConference && awayConference !== conference ? [awayConference] : []),
  ].filter(Boolean) as string[];

  return {
    slug: slugify(`${away}-vs-${home}-week-${week}-${season}-cfb-preview`, { lower: true, strict: true }),
    title: isBowl && bowlName
      ? `${bowlName}: ${away} vs ${home} Preview & Prediction`
      : `${away} vs ${home}: ${weekLabel} CFB Matchup Preview`,
    excerpt: isBowl && bowlName
      ? `${bowlName} preview for ${away} vs ${home}. Complete analysis, team outlooks, keys to the game, and our final prediction for ${season} bowl season.`
      : `Complete ${weekLabel} preview for ${away} at ${home}. Team analysis, keys to the game, and our final prediction for the ${season} college football season.`,
    content,
    author: "NFL Predictions Hub Staff",
    tags,
    published: true,
    metaTitle: isBowl && bowlName
      ? `${bowlName} Preview: ${away} vs ${home} | NFL Predictions Hub`
      : `${away} vs ${home} CFB Week ${week} Preview | NFL Predictions Hub`,
    metaDescription: isBowl && bowlName
      ? `${bowlName} preview — ${away} vs ${home}. Analysis, team outlooks, and prediction for the ${season} bowl game.`
      : `${away} at ${home} — CFB Week ${week} matchup preview with analysis and prediction for the ${season} season.`,
  };
}

// ─── Route handlers ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { sport = "all", overwrite = false } = await req.json();
  await connectDB();

  let nflCreated = 0, nflSkipped = 0;
  let cfbCreated = 0, cfbSkipped = 0;

  if (sport === "nfl" || sport === "all") {
    const nflGames = await Game.find({ status: "scheduled" }).sort({ kickoff: 1 }).lean();

    for (const game of nflGames) {
      const doc = generateNFLContent(game as any);
      const existing = await Post.exists({ slug: doc.slug });

      if (existing && !overwrite) { nflSkipped++; continue; }
      if (existing && overwrite) {
        await Post.updateOne({ slug: doc.slug }, { $set: doc });
      } else {
        await Post.create(doc);
      }
      nflCreated++;
    }
  }

  if (sport === "cfb" || sport === "all") {
    const cfbGames = await CollegeGame.find({ status: "scheduled" }).sort({ kickoff: 1 }).lean();

    for (const game of cfbGames) {
      const doc = generateCFBContent(game as any);
      const existing = await Post.exists({ slug: doc.slug });

      if (existing && !overwrite) { cfbSkipped++; continue; }
      if (existing && overwrite) {
        await Post.updateOne({ slug: doc.slug }, { $set: doc });
      } else {
        await Post.create(doc);
      }
      cfbCreated++;
    }
  }

  const total = nflCreated + nflSkipped + cfbCreated + cfbSkipped;

  return NextResponse.json({
    message: `Done. NFL: ${nflCreated} created, ${nflSkipped} skipped. CFB: ${cfbCreated} created, ${cfbSkipped} skipped.`,
    nflCreated, nflSkipped, cfbCreated, cfbSkipped, total,
  });
}

export async function GET(req: NextRequest) {
  await connectDB();

  const nflGames = await Game.find({ status: "scheduled" })
    .select("awayTeamFull homeTeamFull week season")
    .sort({ week: 1, kickoff: 1 })
    .lean();

  const cfbGames = await CollegeGame.find({ status: "scheduled" })
    .select("awayTeamFull homeTeamFull week season isBowlGame bowlName")
    .sort({ week: 1, kickoff: 1 })
    .lean();

  const nflWithStatus = await Promise.all(
    nflGames.map(async (g) => {
      const slug = slugify(`${g.awayTeamFull}-vs-${g.homeTeamFull}-week-${g.week}-${g.season}-preview`, { lower: true, strict: true });
      const hasPost = await Post.exists({ slug });
      return { sport: "nfl", awayTeam: g.awayTeamFull, homeTeam: g.homeTeamFull, week: g.week, season: g.season, hasPost: !!hasPost };
    })
  );

  const cfbWithStatus = await Promise.all(
    cfbGames.map(async (g) => {
      const slug = slugify(`${g.awayTeamFull}-vs-${g.homeTeamFull}-week-${g.week}-${g.season}-cfb-preview`, { lower: true, strict: true });
      const hasPost = await Post.exists({ slug });
      return { sport: "cfb", awayTeam: g.awayTeamFull, homeTeam: g.homeTeamFull, week: g.week, season: g.season, hasPost: !!hasPost };
    })
  );

  const nflPending = nflWithStatus.filter((g) => !g.hasPost).length;
  const cfbPending = cfbWithStatus.filter((g) => !g.hasPost).length;

  return NextResponse.json({
    nfl: { total: nflGames.length, pending: nflPending, games: nflWithStatus },
    cfb: { total: cfbGames.length, pending: cfbPending, games: cfbWithStatus },
  });
}
