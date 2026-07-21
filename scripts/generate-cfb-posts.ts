/**
 * Generate unique blog posts for every CFB matchup in the database.
 *
 * Usage:
 *   npx tsx scripts/generate-cfb-posts.ts
 *   npx tsx scripts/generate-cfb-posts.ts --overwrite
 */

import "dotenv/config";
import mongoose from "mongoose";
import slugify from "slugify";
import CollegeGame from "../src/models/CollegeGame";
import Post from "../src/models/Post";
import { COLLEGE_TEAMS, getCollegeTeam, type CollegeTeamInfo } from "../src/lib/college-teams";

const MONGODB_URI = process.env.MONGODB_URI!;
const overwrite = process.argv.includes("--overwrite");

// ── Streaming / where-to-watch map ───────────────────────────────────────────

const NETWORK_STREAM: Record<string, { label: string; stream: string; url: string }> = {
  ESPN:  { label: "ESPN",    stream: "ESPN+ / ESPN App",    url: "https://www.espn.com/watch/" },
  ESPN2: { label: "ESPN2",   stream: "ESPN+ / ESPN App",    url: "https://www.espn.com/watch/" },
  ESPNU: { label: "ESPNU",   stream: "ESPN+ / ESPN App",    url: "https://www.espn.com/watch/" },
  "ESPN+": { label: "ESPN+", stream: "ESPN+ (streaming only)", url: "https://www.espn.com/espnplus/" },
  ABC:   { label: "ABC",     stream: "ESPN App / Hulu Live", url: "https://www.espn.com/watch/" },
  FOX:   { label: "FOX",     stream: "FOX Sports App / YouTube TV", url: "https://www.foxsports.com/" },
  FS1:   { label: "FS1",     stream: "FOX Sports App / Fubo TV",    url: "https://www.foxsports.com/" },
  CBS:   { label: "CBS",     stream: "Paramount+ / CBS Sports App",  url: "https://www.cbssports.com/" },
  NBC:   { label: "NBC",     stream: "Peacock / NBC Sports App",    url: "https://www.nbcsports.com/" },
  PEACOCK: { label: "Peacock", stream: "Peacock (streaming only)",   url: "https://www.peacocktv.com/" },
  TNT:   { label: "TNT",     stream: "Max / TNT Sports App",        url: "https://www.tntdrama.com/" },
  TBS:   { label: "TBS",     stream: "Max / TBS App",               url: "https://www.tbs.com/" },
  SECN:  { label: "SEC Network", stream: "ESPN+ / ESPN App",         url: "https://www.espn.com/watch/" },
  ACCN:  { label: "ACC Network", stream: "ESPN+ / ESPN App",         url: "https://www.espn.com/watch/" },
  BTN:   { label: "Big Ten Network", stream: "Fubo TV / Sling TV",    url: "https://www.btn.com/" },
  PAC12: { label: "Pac-12 Network", stream: "Fubo TV",               url: "https://www.pac-12.com/" },
  CBSSN: { label: "CBS Sports Network", stream: "Paramount+",        url: "https://www.cbssports.com/" },
};

function getWatchInfo(network: string): { label: string; stream: string; url: string } {
  const key = network?.toUpperCase().replace(/\s+/g, "");
  return NETWORK_STREAM[key] || NETWORK_STREAM[network?.toUpperCase()] || {
    label: network || "TBD",
    stream: "Check local listings",
    url: "https://www.espn.com/",
  };
}

// ── Analysis helpers ──────────────────────────────────────────────────────────

function ratingLabel(r: number): string {
  if (r >= 90) return "Elite Program";
  if (r >= 80) return "National Contender";
  if (r >= 70) return "Conference Power";
  if (r >= 60) return "Solid Program";
  return "Developing Program";
}

function offenseDescriptor(team: CollegeTeamInfo): string {
  if (team.avgPPG >= 36) return "one of the most explosive offenses in the country, capable of scoring from anywhere on the field";
  if (team.avgPPG >= 32) return "a high-powered offense that consistently puts up big numbers against Power conference opponents";
  if (team.avgPPG >= 28) return "a balanced offensive attack that mixes the run and pass to keep defenses guessing";
  if (team.avgPPG >= 24) return "a methodical offense that controls the ball and relies on efficiency over explosiveness";
  return "an offense focused on ball security and field position rather than big plays";
}

function defenseDescriptor(team: CollegeTeamInfo): string {
  if (team.avgPAG <= 14) return "a historically dominant defense that routinely shuts down even the best offenses in the country";
  if (team.avgPAG <= 18) return "an elite defensive unit that forces opponents into negative plays and creates turnovers at a high rate";
  if (team.avgPAG <= 22) return "a fundamentally sound defense that controls field position and limits explosive plays";
  if (team.avgPAG <= 26) return "a developing defensive group that competes hard but can be exploited by superior offensive talent";
  return "a defense that has struggled to contain the run and protect against big-play passing attacks";
}

function homeFieldEdge(team: CollegeTeamInfo): string {
  const pct = Math.round(team.homeWinPct * 100);
  if (team.homeWinPct >= 0.90) return `${team.stadium} is one of the most intimidating venues in college football — the home team wins ${pct}% of their games there`;
  if (team.homeWinPct >= 0.80) return `${team.stadium} provides a genuine home-field advantage with a ${pct}% win rate`;
  if (team.homeWinPct >= 0.70) return `${team.stadium} is a solid home venue where the team wins roughly ${pct}% of games`;
  return `${team.stadium} (${team.capacity.toLocaleString()} capacity) gives the home team an edge they have leveraged ${pct}% of the time`;
}

function recentRecord(team: CollegeTeamInfo): string {
  const w = team.seasonWins;
  const l = team.seasonLosses;
  const last = w.length - 1;
  return `${w[last]}-${l[last]} last season (${w[last - 1]}-${l[last - 1]} the year before)`;
}

function confStrength(conf: string): string {
  const map: Record<string, string> = {
    "SEC": "the toughest conference in college football",
    "Big Ten": "one of the deepest conferences in the country",
    "Big 12": "a pass-happy, high-scoring conference known for parity",
    "ACC": "a conference with elite talent at the top but significant variance top to bottom",
    "Mountain West": "a mid-major conference that regularly produces Group of Five playoff hopefuls",
    "AAC": "a competitive Group of Five conference",
    "Sun Belt": "a Group of Five conference known for physical, run-first football",
    "Independent": "an independent program that schedules nationally",
  };
  return map[conf] || conf;
}

function predictionBlock(home: CollegeTeamInfo, away: CollegeTeamInfo, isNeutral: boolean): { winner: CollegeTeamInfo; margin: number; reasoning: string } {
  let homeAdv = isNeutral ? 0 : 3.5;
  const ratingDiff = home.historicalRating - away.historicalRating;
  const margin = Math.round(Math.abs(ratingDiff * 0.22 + homeAdv));
  const winner = (ratingDiff + homeAdv) >= 0 ? home : away;
  const loser = winner === home ? away : home;

  const reasonings = [
    `${winner.name}'s ${offenseDescriptor(winner)} should be the decisive factor. The ${loser.mascot} will struggle to keep pace if ${winner.name} establishes their identity early.`,
    `The matchup favors ${winner.name} because their defensive efficiency (${winner.avgPAG.toFixed(1)} points allowed per game) should limit the ${loser.mascot} offense enough to control the game.`,
    `${winner.name}'s superior historical rating (${winner.historicalRating} vs ${loser.historicalRating}) reflects real talent advantages across the roster that tend to show up in close games.`,
  ];
  const reasoning = reasonings[Math.abs(home.espnId + away.espnId) % reasonings.length];

  return { winner, margin: Math.max(3, margin), reasoning };
}

function keyMatchup(home: CollegeTeamInfo, away: CollegeTeamInfo): { title: string; detail: string }[] {
  return [
    {
      title: `${away.name} Offense vs. ${home.name} Defense`,
      detail: `The ${away.mascot} bring ${offenseDescriptor(away)} into a game against a ${home.name} defense that allows ${home.avgPAG.toFixed(1)} points per game. The ability of ${home.name} to disrupt ${away.name}'s rhythm will be the first defining factor of this contest.`,
    },
    {
      title: `${home.name} Offense vs. ${away.name} Defense`,
      detail: `On the other side, ${home.name} averages ${home.avgPPG.toFixed(1)} PPG against ${defenseDescriptor(away)}. If the home offense can establish a consistent run game and keep the chains moving, the game's pace will favor the home side.`,
    },
    {
      title: "Turnover Battle",
      detail: `In games between programs of this caliber, turnovers decide outcomes. The team that wins the turnover margin by even one will have a significant advantage in field position and scoring opportunities throughout four quarters.`,
    },
    {
      title: "Special Teams and Field Position",
      detail: `College football is often won in the hidden yards — punt coverage, kick return explosiveness, and field goal range. Both programs have invested in special teams depth, and a big play on the third phase could be the difference in a one-score game.`,
    },
  ];
}

// ── HTML Builder ──────────────────────────────────────────────────────────────

function buildPostHTML(game: any, home: CollegeTeamInfo, away: CollegeTeamInfo): string {
  const watch = getWatchInfo(game.network);
  const kickoffDate = new Date(game.kickoff);
  const dateStr = kickoffDate.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = kickoffDate.toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  });
  const neutral = game.neutral;
  const isRivalry = game.isRivalry;
  const isBowl = game.isBowlGame || game.isPlayoff;
  const bowlLabel = game.bowlName ? game.bowlName : (game.isPlayoff ? "College Football Playoff" : "Bowl Game");

  const pred = predictionBlock(home, away, neutral);
  const matchups = keyMatchup(home, away);
  const homeRecord = recentRecord(home);
  const awayRecord = recentRecord(away);

  return `
<div style="font-family: 'Inter', sans-serif; color: #e4e4e7; max-width: 900px; margin: 0 auto;">

  <!-- Matchup Banner -->
  <div style="background: linear-gradient(135deg, ${away.color}22 0%, #18181b 50%, ${home.color}22 100%); border: 1px solid #3f3f46; border-radius: 1rem; padding: 2rem; margin-bottom: 2rem; text-align: center;">
    ${isBowl ? `<div style="color: #f59e0b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.75rem;">🏆 ${bowlLabel}</div>` : ""}
    ${isRivalry ? `<div style="color: #f59e0b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.75rem;">⚔️ Rivalry Game</div>` : ""}
    <div style="display: flex; align-items: center; justify-content: center; gap: 2rem; flex-wrap: wrap;">
      <div style="text-align: center;">
        <div style="font-size: 2rem; font-weight: 800; color: ${away.color};">${away.abbr}</div>
        <div style="color: #a1a1aa; font-size: 0.8rem; margin-top: 4px;">${away.name}</div>
        <div style="color: #71717a; font-size: 0.7rem;">${away.conference}</div>
        <div style="color: #f59e0b; font-size: 0.75rem; margin-top: 4px;">★ ${away.historicalRating} — ${ratingLabel(away.historicalRating)}</div>
      </div>
      <div style="text-align: center;">
        <div style="color: #71717a; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em;">at</div>
        <div style="font-size: 1.5rem; font-weight: 900; color: #fff; margin: 0.25rem 0;">VS</div>
        <div style="color: #71717a; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em;">${neutral ? "Neutral Site" : "Home"}</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 2rem; font-weight: 800; color: ${home.color};">${home.abbr}</div>
        <div style="color: #a1a1aa; font-size: 0.8rem; margin-top: 4px;">${home.name}</div>
        <div style="color: #71717a; font-size: 0.7rem;">${home.conference}</div>
        <div style="color: #f59e0b; font-size: 0.75rem; margin-top: 4px;">★ ${home.historicalRating} — ${ratingLabel(home.historicalRating)}</div>
      </div>
    </div>
  </div>

  <!-- Game Info Grid -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
    <div style="border: 1px solid #3f3f46; border-radius: 0.75rem; padding: 1rem; background: rgba(24,24,27,0.5);">
      <div style="color: #71717a; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">📅 Date</div>
      <div style="color: #fff; font-size: 0.9rem; font-weight: 600;">${dateStr}</div>
    </div>
    <div style="border: 1px solid #3f3f46; border-radius: 0.75rem; padding: 1rem; background: rgba(24,24,27,0.5);">
      <div style="color: #71717a; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">🕐 Kickoff</div>
      <div style="color: #fff; font-size: 0.9rem; font-weight: 600;">${timeStr}</div>
    </div>
    <div style="border: 1px solid #3f3f46; border-radius: 0.75rem; padding: 1rem; background: rgba(24,24,27,0.5);">
      <div style="color: #71717a; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">📺 Where to Watch</div>
      <div style="color: #fff; font-size: 0.9rem; font-weight: 600;">${watch.label}</div>
    </div>
    <div style="border: 1px solid #3f3f46; border-radius: 0.75rem; padding: 1rem; background: rgba(24,24,27,0.5);">
      <div style="color: #71717a; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">📡 Stream</div>
      <div style="color: #00A8FF; font-size: 0.85rem; font-weight: 600;">${watch.stream}</div>
    </div>
    <div style="border: 1px solid #3f3f46; border-radius: 0.75rem; padding: 1rem; background: rgba(24,24,27,0.5);">
      <div style="color: #71717a; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">🏟️ Venue</div>
      <div style="color: #fff; font-size: 0.9rem; font-weight: 600;">${neutral ? "Neutral Site" : home.stadium}</div>
      ${!neutral ? `<div style="color: #71717a; font-size: 0.75rem; margin-top: 2px;">Capacity: ${home.capacity.toLocaleString()}</div>` : ""}
    </div>
    <div style="border: 1px solid #3f3f46; border-radius: 0.75rem; padding: 1rem; background: rgba(24,24,27,0.5);">
      <div style="color: #71717a; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">🏈 Season</div>
      <div style="color: #fff; font-size: 0.9rem; font-weight: 600;">${game.season} · Week ${game.week}</div>
    </div>
  </div>

  <!-- Game Preview -->
  <h2 style="font-size: 1.4rem; font-weight: 700; color: #fff; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #27272a;">Game Preview</h2>
  <p style="color: #a1a1aa; line-height: 1.7; margin-bottom: 1.5rem;">
    ${away.name} travel${neutral ? " to a neutral site" : ` to ${home.stadium}`} to face the ${home.name} in what shapes up as one of the more intriguing matchups on the ${game.season} college football calendar.
    ${isRivalry ? ` This is one of college football's storied rivalries, with decades of shared history adding extra weight to every snap.` : ""}
    ${isBowl ? ` The stakes couldn't be higher — both programs have earned their place here and will leave everything on the field.` : ""}
    The ${away.mascot} (${awayRecord}) bring ${offenseDescriptor(away)} on offense, while the ${home.mascot} (${homeRecord}) counter with ${defenseDescriptor(home)} on that side of the ball.
  </p>

  <!-- Where to Watch Section -->
  <div style="border: 1px solid #00A8FF44; border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 2rem; background: rgba(0,168,255,0.05);">
    <h3 style="font-size: 1rem; font-weight: 700; color: #00A8FF; margin-bottom: 0.75rem;">📺 How to Watch ${away.abbr} vs. ${home.abbr}</h3>
    <ul style="list-style: none; padding: 0; margin: 0; display: grid; gap: 0.5rem;">
      <li style="color: #d4d4d8; font-size: 0.9rem;">📡 <strong style="color:#fff;">TV:</strong> ${watch.label}</li>
      <li style="color: #d4d4d8; font-size: 0.9rem;">💻 <strong style="color:#fff;">Stream:</strong> ${watch.stream}</li>
      <li style="color: #d4d4d8; font-size: 0.9rem;">📅 <strong style="color:#fff;">Kickoff:</strong> ${dateStr} at ${timeStr}</li>
      <li style="color: #d4d4d8; font-size: 0.9rem;">🏟️ <strong style="color:#fff;">Location:</strong> ${neutral ? "Neutral Site" : `${home.stadium} (${home.capacity.toLocaleString()} capacity)`}</li>
    </ul>
    <p style="color: #71717a; font-size: 0.8rem; margin-top: 0.75rem;">
      Cable/satellite subscribers can watch on ${watch.label}. Cord-cutters can stream via ${watch.stream}.
      Out-of-market fans should check VPN compatibility with their preferred streaming provider.
    </p>
  </div>

  <!-- Team Breakdown -->
  <h2 style="font-size: 1.4rem; font-weight: 700; color: #fff; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #27272a;">Team Breakdown</h2>

  <!-- Away Team -->
  <div style="border: 1px solid #3f3f46; border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1rem; background: rgba(24,24,27,0.4); border-left: 3px solid ${away.color};">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
      <div>
        <div style="font-size: 1.1rem; font-weight: 700; color: #fff;">${away.name}</div>
        <div style="color: #71717a; font-size: 0.8rem;">${away.conference} · ${ratingLabel(away.historicalRating)}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 1.4rem; font-weight: 900; color: ${away.color};">${away.abbr}</div>
        <div style="color: #71717a; font-size: 0.75rem;">★ Rating: ${away.historicalRating}</div>
      </div>
    </div>
    <div style="display: grid; grid-template-columns: repeat(3,1fr); gap: 0.75rem; margin-bottom: 1rem;">
      <div style="text-align: center; border: 1px solid #3f3f46; border-radius: 0.5rem; padding: 0.5rem;">
        <div style="color: #71717a; font-size: 10px; text-transform: uppercase; margin-bottom: 3px;">Avg PPG</div>
        <div style="color: #fff; font-weight: 700;">${away.avgPPG.toFixed(1)}</div>
      </div>
      <div style="text-align: center; border: 1px solid #3f3f46; border-radius: 0.5rem; padding: 0.5rem;">
        <div style="color: #71717a; font-size: 10px; text-transform: uppercase; margin-bottom: 3px;">Avg PAG</div>
        <div style="color: #fff; font-weight: 700;">${away.avgPAG.toFixed(1)}</div>
      </div>
      <div style="text-align: center; border: 1px solid #3f3f46; border-radius: 0.5rem; padding: 0.5rem;">
        <div style="color: #71717a; font-size: 10px; text-transform: uppercase; margin-bottom: 3px;">Home W%</div>
        <div style="color: #fff; font-weight: 700;">${(away.homeWinPct * 100).toFixed(0)}%</div>
      </div>
    </div>
    <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.6; margin: 0;">
      The ${away.mascot} play in ${confStrength(away.conference)}, which has hardened their roster and sharpened their execution under pressure.
      Their offense is ${offenseDescriptor(away)}, while their defense ${defenseDescriptor(away)}.
      Coming in at ${awayRecord}, they arrive with ${away.historicalRating >= 75 ? "legitimate championship aspirations" : "something to prove on a big stage"}.
    </p>
  </div>

  <!-- Home Team -->
  <div style="border: 1px solid #3f3f46; border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 2rem; background: rgba(24,24,27,0.4); border-left: 3px solid ${home.color};">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
      <div>
        <div style="font-size: 1.1rem; font-weight: 700; color: #fff;">${home.name}</div>
        <div style="color: #71717a; font-size: 0.8rem;">${home.conference} · ${ratingLabel(home.historicalRating)} ${!neutral ? "· Home Side" : ""}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 1.4rem; font-weight: 900; color: ${home.color};">${home.abbr}</div>
        <div style="color: #71717a; font-size: 0.75rem;">★ Rating: ${home.historicalRating}</div>
      </div>
    </div>
    <div style="display: grid; grid-template-columns: repeat(3,1fr); gap: 0.75rem; margin-bottom: 1rem;">
      <div style="text-align: center; border: 1px solid #3f3f46; border-radius: 0.5rem; padding: 0.5rem;">
        <div style="color: #71717a; font-size: 10px; text-transform: uppercase; margin-bottom: 3px;">Avg PPG</div>
        <div style="color: #fff; font-weight: 700;">${home.avgPPG.toFixed(1)}</div>
      </div>
      <div style="text-align: center; border: 1px solid #3f3f46; border-radius: 0.5rem; padding: 0.5rem;">
        <div style="color: #71717a; font-size: 10px; text-transform: uppercase; margin-bottom: 3px;">Avg PAG</div>
        <div style="color: #fff; font-weight: 700;">${home.avgPAG.toFixed(1)}</div>
      </div>
      <div style="text-align: center; border: 1px solid #3f3f46; border-radius: 0.5rem; padding: 0.5rem;">
        <div style="color: #71717a; font-size: 10px; text-transform: uppercase; margin-bottom: 3px;">Home W%</div>
        <div style="color: #fff; font-weight: 700;">${(home.homeWinPct * 100).toFixed(0)}%</div>
      </div>
    </div>
    <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.6; margin: 0;">
      The ${home.mascot} compete in ${confStrength(home.conference)}, which prepares them for the physicality of big-game environments.
      Their offense features ${offenseDescriptor(home)}, while on defense they boast ${defenseDescriptor(home)}.
      ${!neutral ? homeFieldEdge(home) + "." : ""}
      Recording ${homeRecord}, the ${home.mascot} enter with ${home.historicalRating >= 75 ? "the experience of competing at the highest level" : "hunger to prove they belong in elite company"}.
    </p>
  </div>

  <!-- Key Matchups -->
  <h2 style="font-size: 1.4rem; font-weight: 700; color: #fff; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #27272a;">Key Matchups to Watch</h2>
  <div style="display: grid; gap: 0.875rem; margin-bottom: 2rem;">
    ${matchups.map((m, i) => `
    <div style="border: 1px solid #3f3f46; border-radius: 0.75rem; padding: 1.1rem; background: rgba(24,24,27,0.3);">
      <div style="color: #f59e0b; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.4rem;">Matchup ${i + 1}</div>
      <div style="color: #fff; font-size: 0.95rem; font-weight: 600; margin-bottom: 0.5rem;">${m.title}</div>
      <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.6; margin: 0;">${m.detail}</p>
    </div>`).join("")}
  </div>

  <!-- Conference Context -->
  <h2 style="font-size: 1.4rem; font-weight: 700; color: #fff; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #27272a;">Conference &amp; Historical Context</h2>
  <p style="color: #a1a1aa; line-height: 1.7; margin-bottom: 1.25rem;">
    ${away.name} represent ${confStrength(away.conference)} — a competitive environment that prepares programs for cross-conference challenges.
    ${home.name}, playing out of ${confStrength(home.conference)}, bring a different stylistic identity shaped by the demands of their schedule.
  </p>
  <p style="color: #a1a1aa; line-height: 1.7; margin-bottom: 2rem;">
    Historically, ${away.name} have peaked at #${away.apPeaks.filter(Boolean).length > 0 ? Math.min(...(away.apPeaks.filter((x): x is number => x !== null))) : "unranked"} in the AP Poll,
    while ${home.name} have reached as high as #${home.apPeaks.filter(Boolean).length > 0 ? Math.min(...(home.apPeaks.filter((x): x is number => x !== null))) : "unranked"}.
    ${isBowl ? `The ${bowlLabel} setting elevates the stakes even further — both programs have earned the right to compete here, and neither will take the opportunity lightly.` : ""}
  </p>

  <!-- Prediction -->
  <div style="border: 1px solid #f59e0b44; border-radius: 0.75rem; padding: 1.5rem; background: rgba(245,158,11,0.05); margin-bottom: 2rem;">
    <div style="color: #f59e0b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 0.75rem;">🎯 Editor's Prediction</div>
    <div style="font-size: 1.2rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem;">
      ${pred.winner.name} win by ~${pred.margin} points
    </div>
    <p style="color: #a1a1aa; font-size: 0.9rem; line-height: 1.6; margin: 0;">
      ${pred.reasoning}
      ${!neutral && pred.winner === home ? ` The home-field advantage at ${home.stadium} will be a factor, especially late in a competitive game.` : ""}
    </p>
  </div>

  <!-- Bottom CTA -->
  <div style="border: 1px solid #3f3f46; border-radius: 0.75rem; padding: 1.25rem; background: rgba(24,24,27,0.4); text-align: center;">
    <p style="color: #71717a; font-size: 0.8rem; margin: 0;">
      Analysis based on program statistics from 2019–2025. For live scores, odds, and real-time updates,
      visit our <a href="/college-football" style="color: #00A8FF; text-decoration: none;">College Football hub</a>
      or check our <a href="/predictions" style="color: #00A8FF; text-decoration: none;">AI predictions</a> for deeper analysis.
    </p>
  </div>

</div>
`.trim();
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI not set in .env");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const games = await CollegeGame.find({}).sort({ kickoff: 1 }).lean();
  console.log(`Found ${games.length} CFB games`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const game of games) {
    const home = getCollegeTeam(game.homeTeam);
    const away = getCollegeTeam(game.awayTeam);

    const bowlLabel = game.bowlName || (game.isPlayoff ? "CFP" : "");
    const titleSuffix = bowlLabel ? ` – ${bowlLabel}` : ` – Week ${game.week} Preview`;
    const title = `${away.name} vs. ${home.name}${titleSuffix} (${game.season})`;

    const postSlug = slugify(`cfb-${away.abbr}-vs-${home.abbr}-${game.season}-week-${game.week}${bowlLabel ? "-" + slugify(bowlLabel, { lower: true, strict: true }) : ""}`, {
      lower: true, strict: true,
    });

    // Check existing
    const existing = await Post.findOne({ slug: postSlug }).lean();
    if (existing && !overwrite) {
      console.log(`  ↷ Skip: ${title}`);
      skipped++;
      continue;
    }

    const kickoffDate = new Date(game.kickoff);
    const dateStr = kickoffDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const watch = getWatchInfo(game.network ?? "TBD");

    const excerpt = `Complete preview of ${away.name} vs. ${home.name} — where to watch on ${watch.label}, game time, analysis, key matchups, and prediction for the ${game.season} season.`;

    const content = buildPostHTML(game, home, away);

    const tags = [
      "College Football",
      home.conference !== away.conference ? "Cross-Conference" : home.conference,
      home.name,
      away.name,
      game.isPlayoff ? "CFP" : (game.isBowlGame ? "Bowl Game" : `Week ${game.week}`),
      "Game Preview",
      "Where to Watch",
    ].filter(Boolean);

    try {
      if (existing && overwrite) {
        await Post.findByIdAndUpdate(existing._id, { title, excerpt, content, tags, published: true });
        console.log(`  ✓ Updated: ${title}`);
      } else {
        await Post.create({ slug: postSlug, title, excerpt, content, tags, published: true, author: "CFB Editorial Staff" });
        console.log(`  ✓ Created: ${title}`);
      }
      created++;
    } catch (err) {
      console.error(`  ✗ Error for ${title}:`, (err as Error).message);
      errors++;
    }
  }

  console.log(`\nDone. Created: ${created} | Skipped: ${skipped} | Errors: ${errors}`);
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
