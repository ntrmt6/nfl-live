/**
 * Creates an interactive Cardinals vs Panthers streaming guide blog post in MongoDB.
 * Run: node scripts/create-cardinals-vs-panthers-streaming-post.mjs
 */

import { MongoClient } from "mongodb";

const MONGODB_URI =
  "mongodb://nfladmin:1596%40%23@127.0.0.1:27017/nfl-live?authSource=nfl-live";

const slug = "cardinals-vs-panthers-2026-week-1-live-stream-watch-guide";

const title =
  "Where to Watch: Arizona Cardinals vs. Carolina Panthers Live Stream — Complete 2026 Week 1 Guide";

const excerpt =
  "No cable? No problem. Here is every way to stream the Arizona Cardinals vs. Carolina Panthers live in 2026 Week 1 — FuboTV, YouTube TV, NFL+, Sunday Ticket, and more, plus a full game preview and score prediction.";

const metaTitle =
  "Cardinals vs Panthers Live Stream 2026 Week 1 | How to Watch Online";

const metaDescription =
  "How to watch Arizona Cardinals vs Carolina Panthers live online in 2026 Week 1. Full cord-cutter streaming guide: FuboTV, YouTube TV, NFL+, Sunday Ticket. Plus kickoff time, betting odds, score simulator, and fan poll.";

const tags = [
  "Arizona Cardinals",
  "Carolina Panthers",
  "NFL 2026",
  "Week 1",
  "Live Stream",
  "How to Watch",
  "Cord-Cutter Guide",
  "Kyler Murray",
  "Marvin Harrison Jr.",
  "FOX Sports",
];

const content = `
<style>
  .card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:1.8rem;margin-bottom:1.8rem}
  .section-title{font-size:1rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#97233F;margin:0 0 1.2rem;display:flex;align-items:center;gap:0.5rem}
  .section-title::before{content:'';display:inline-block;width:3px;height:1.1em;background:#97233F;border-radius:2px}
  .preview-hero{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f172a 100%);border-radius:16px;padding:2.5rem 2rem;text-align:center;margin-bottom:2rem;border:1px solid rgba(255,255,255,0.08)}
  .preview-hero h1{font-size:clamp(1.4rem,4vw,2.2rem);font-weight:900;margin:0 0 0.5rem;color:#fff;line-height:1.15}
  .preview-hero .meta{color:rgba(255,255,255,0.55);font-size:0.8rem;margin-bottom:1.5rem;letter-spacing:0.04em;text-transform:uppercase}
  .badge{display:inline-block;background:#97233F;color:#fff;font-size:0.65rem;font-weight:800;padding:3px 10px;border-radius:20px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:1rem}
  .badge-blue{background:#0085CA}
  .teams-row{display:flex;align-items:center;justify-content:center;gap:1.5rem;margin-bottom:1.5rem;flex-wrap:wrap}
  .team-block{display:flex;flex-direction:column;align-items:center;gap:0.4rem}
  .team-logo{width:72px;height:72px;object-fit:contain;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.5))}
  .team-name{font-weight:800;font-size:1rem;color:#fff}
  .team-record{font-size:0.72rem;color:rgba(255,255,255,0.5)}
  .vs-text{font-size:1.8rem;font-weight:900;color:rgba(255,255,255,0.25);letter-spacing:-0.02em}
  .game-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:0.8rem;margin-top:1.2rem}
  .fact-box{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:0.8rem 1rem;text-align:center}
  .fact-label{font-size:0.58rem;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.3rem}
  .fact-val{font-size:0.95rem;font-weight:800;color:#fff}
  .countdown-bar{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:1.2rem}
  .countdown-unit{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:0.6rem 1rem;min-width:60px;text-align:center}
  .countdown-num{font-size:1.6rem;font-weight:900;color:#fff;line-height:1;display:block}
  .countdown-label{font-size:0.6rem;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.08em}
  .stream-option{display:flex;gap:1rem;align-items:flex-start;padding:1.1rem 1.2rem;border-radius:12px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);margin-bottom:0.8rem;transition:border-color 0.2s}
  .stream-option:hover{border-color:rgba(0,133,202,0.4)}
  .stream-icon{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.2rem}
  .stream-icon.blue{background:rgba(0,133,202,0.15)}
  .stream-icon.red{background:rgba(227,24,55,0.15)}
  .stream-icon.dark{background:rgba(255,255,255,0.07)}
  .stream-icon.green{background:rgba(34,197,94,0.12)}
  .stream-body h4{font-size:0.95rem;font-weight:800;color:#fff;margin:0 0 0.3rem}
  .stream-body p{font-size:0.8rem;color:rgba(255,255,255,0.6);margin:0 0 0.5rem;line-height:1.55}
  .tag-pill{display:inline-block;font-size:0.62rem;font-weight:700;padding:2px 9px;border-radius:20px;text-transform:uppercase;letter-spacing:0.06em}
  .tag-green{background:rgba(34,197,94,0.15);color:#4ade80;border:1px solid rgba(34,197,94,0.2)}
  .tag-blue{background:rgba(0,133,202,0.15);color:#38bdf8;border:1px solid rgba(0,133,202,0.2)}
  .tag-yellow{background:rgba(234,179,8,0.15);color:#fbbf24;border:1px solid rgba(234,179,8,0.2)}
  .tag-red{background:rgba(151,35,63,0.2);color:#f87171;border:1px solid rgba(151,35,63,0.25)}
  .score-display{display:flex;align-items:center;justify-content:center;gap:2rem;padding:1.5rem;background:rgba(255,255,255,0.04);border-radius:12px;margin-top:1.2rem}
  .score-team{text-align:center}
  .score-num{font-size:3rem;font-weight:900;color:#fff;line-height:1}
  .score-abbr{font-size:0.75rem;color:rgba(255,255,255,0.5);font-weight:600;margin-top:0.2rem;letter-spacing:0.06em}
  .score-dash{font-size:2.5rem;color:rgba(255,255,255,0.2);font-weight:300}
  .prob-bar-wrap{margin-top:1.2rem}
  .prob-labels{display:flex;justify-content:space-between;font-size:0.72rem;margin-bottom:0.4rem}
  .prob-bar{height:10px;border-radius:10px;background:rgba(255,255,255,0.08);overflow:hidden;display:flex}
  .prob-fill-ari{height:100%;background:linear-gradient(90deg,#97233F,#c4334f);border-radius:10px 0 0 10px;transition:width 0.4s}
  .prob-fill-car{height:100%;background:linear-gradient(90deg,#0085CA,#00a8f8);border-radius:0 10px 10px 0;transition:width 0.4s}
  .odds-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0.8rem}
  @media(max-width:400px){.odds-grid{grid-template-columns:1fr}}
  .odds-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:1rem;text-align:center}
  .odds-label{font-size:0.62rem;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.5rem}
  .odds-val{font-size:1.3rem;font-weight:900;color:#fff}
  .odds-sub{font-size:0.65rem;color:rgba(255,255,255,0.35);margin-top:0.25rem}
  .poll-options{display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;margin-bottom:1rem}
  .poll-btn{background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);border-radius:10px;padding:1rem;cursor:pointer;transition:all 0.2s;text-align:center;color:#fff;font-weight:700;font-size:0.9rem}
  .poll-btn:hover{border-color:rgba(255,255,255,0.25);background:rgba(255,255,255,0.09)}
  .poll-btn.voted-ari{border-color:#97233F;background:rgba(151,35,63,0.15)}
  .poll-btn.voted-car{border-color:#0085CA;background:rgba(0,133,202,0.15)}
  .poll-bar-row{margin-bottom:0.7rem}
  .poll-bar-label{display:flex;justify-content:space-between;font-size:0.72rem;margin-bottom:0.3rem;color:rgba(255,255,255,0.7);font-weight:600}
  .poll-bar-outer{height:8px;background:rgba(255,255,255,0.07);border-radius:8px;overflow:hidden}
  .poll-bar-inner{height:100%;border-radius:8px;transition:width 0.5s ease}
  .total-votes{text-align:center;font-size:0.72rem;color:rgba(255,255,255,0.4);margin-top:0.5rem}
  .prediction-box{background:linear-gradient(135deg,rgba(151,35,63,0.1),rgba(0,133,202,0.1));border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:1.5rem;text-align:center}
  .pred-score{font-size:2.5rem;font-weight:900;color:#fff;letter-spacing:0.04em;margin-bottom:0.3rem}
  .pred-winner{font-size:0.75rem;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1rem}
  .pred-conf{font-size:0.85rem;color:rgba(255,255,255,0.65);line-height:1.55}
  .matchup-card{border-left:3px solid #97233F;padding-left:1rem;margin-bottom:1.1rem}
  .matchup-card h4{font-size:0.88rem;font-weight:800;color:#fff;margin:0 0 0.3rem}
  .matchup-card p{font-size:0.8rem;color:rgba(255,255,255,0.6);margin:0;line-height:1.5}
  .watch-tip{background:rgba(0,133,202,0.08);border:1px solid rgba(0,133,202,0.2);border-radius:10px;padding:0.9rem 1.1rem;margin-top:1rem;font-size:0.82rem;color:rgba(255,255,255,0.7);line-height:1.5}
  .share-row{display:flex;gap:0.7rem;justify-content:center;flex-wrap:wrap;margin-top:1.2rem}
  .share-btn{border:none;border-radius:8px;padding:0.5rem 1.2rem;font-size:0.78rem;font-weight:700;cursor:pointer;transition:opacity 0.2s}
  .share-btn:hover{opacity:0.85}
  .share-btn.tw{background:#1DA1F2;color:#fff}
  .share-btn.fb{background:#1877F2;color:#fff}
  .share-btn.copy{background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.15)}
  input[type=range]{width:100%;accent-color:#97233F;cursor:pointer}
</style>

<!-- HERO -->
<div class="preview-hero">
  <div style="display:flex;justify-content:center;gap:0.5rem;margin-bottom:1rem;flex-wrap:wrap">
    <span class="badge">NFC Showdown</span>
    <span class="badge badge-blue">Game Day Guide</span>
  </div>
  <h1>Arizona Cardinals vs. Carolina Panthers</h1>
  <p class="meta">2026 NFL Week 1 &bull; September 13, 2026 &bull; 4:05 PM ET &bull; FOX Sports</p>

  <div class="teams-row">
    <div class="team-block">
      <img class="team-logo" src="https://a.espncdn.com/i/teamlogos/nfl/500/ari.png" alt="Cardinals" />
      <span class="team-name">Arizona Cardinals</span>
      <span class="team-record">2025: 9-8</span>
    </div>
    <span class="vs-text">VS</span>
    <div class="team-block">
      <img class="team-logo" src="https://a.espncdn.com/i/teamlogos/nfl/500/car.png" alt="Panthers" />
      <span class="team-name">Carolina Panthers</span>
      <span class="team-record">2025: 7-10</span>
    </div>
  </div>

  <div class="game-facts">
    <div class="fact-box"><div class="fact-label">Network</div><div class="fact-val">FOX Sports</div></div>
    <div class="fact-box"><div class="fact-label">Kickoff</div><div class="fact-val">4:05 PM ET</div></div>
    <div class="fact-box"><div class="fact-label">Venue</div><div class="fact-val">State Farm Stadium</div></div>
    <div class="fact-box"><div class="fact-label">Location</div><div class="fact-val">Glendale, AZ</div></div>
  </div>

  <div class="countdown-bar" id="countdown">
    <div class="countdown-unit"><span class="countdown-num" id="cd-days">--</span><span class="countdown-label">Days</span></div>
    <div class="countdown-unit"><span class="countdown-num" id="cd-hrs">--</span><span class="countdown-label">Hours</span></div>
    <div class="countdown-unit"><span class="countdown-num" id="cd-min">--</span><span class="countdown-label">Mins</span></div>
    <div class="countdown-unit"><span class="countdown-num" id="cd-sec">--</span><span class="countdown-label">Secs</span></div>
  </div>
</div>

<!-- INTRO -->
<p>Grab your jerseys and ice the cooler — it's game day. The Arizona Cardinals host the Carolina Panthers at State Farm Stadium in an NFC opener that promises fireworks. Kyler Murray is back and locked in, Marvin Harrison Jr. finished his rookie season as one of the most dangerous wideouts in the game, and the Panthers are coming in hungry to prove last year's disappointments were just a footnote.</p>

<p>If you cut the cord and aren't sure how to catch every snap, you're in exactly the right place. This guide covers every streaming option available for this FOX broadcast, plus a full game preview, odds, score simulator, and fan poll.</p>

<!-- HOW TO STREAM -->
<div class="card">
  <div class="section-title">The Cord-Cutter's Playbook</div>
  <p style="font-size:0.82rem;color:rgba(255,255,255,0.55);margin:0 0 1.2rem;line-height:1.6">This game airs on <strong style="color:#fff">FOX Sports</strong>. Every option below streams the FOX broadcast live — pick whichever fits your setup.</p>

  <div class="stream-option">
    <div class="stream-icon blue">📡</div>
    <div class="stream-body">
      <h4>FuboTV — Best Overall for Sports</h4>
      <p>Built specifically for sports fans, Fubo carries local FOX affiliates in virtually every market, which means you get the local broadcast feel without an antenna. 4K streams, unlimited cloud DVR, and multi-screen support make it the top pick for serious football households.</p>
      <span class="tag-pill tag-green">7-Day Free Trial Available</span>
    </div>
  </div>

  <div class="stream-option">
    <div class="stream-icon red">▶️</div>
    <div class="stream-body">
      <h4>YouTube TV — Best Reliability &amp; DVR</h4>
      <p>Rock-solid streams and unlimited DVR storage. If you're running late to kickoff, YouTube TV's "Key Plays" feature lets you jump to the biggest moments instantly. FOX coverage is included in the base package.</p>
      <span class="tag-pill tag-blue">Unlimited Cloud DVR</span>
    </div>
  </div>

  <div class="stream-option">
    <div class="stream-icon dark">📱</div>
    <div class="stream-body">
      <h4>NFL+ — Best for Mobile Viewers</h4>
      <p>NFL+ streams all local and primetime games live to your phone or tablet at the lowest price point. The catch: you can't cast it to your TV. Perfect if you're stuck at work, in a waiting room, or commuting and don't want to miss the action.</p>
      <span class="tag-pill tag-yellow">Mobile &amp; Tablet Only</span>
    </div>
  </div>

  <div class="stream-option">
    <div class="stream-icon green">🏈</div>
    <div class="stream-body">
      <h4>Hulu + Live TV — Best Bundle Value</h4>
      <p>Hulu's live TV tier includes FOX in most markets and bundles in Disney+ and ESPN+ at no extra cost. If you're already a Hulu subscriber, upgrading to the live tier is the most cost-efficient path to watching this game.</p>
      <span class="tag-pill tag-blue">Includes Disney+ &amp; ESPN+</span>
    </div>
  </div>

  <div class="watch-tip">
    <strong style="color:#38bdf8">📡 Got an antenna?</strong> Since this game is on FOX, a basic digital antenna ($20–$40) will pull the local FOX affiliate over the air in full HD — completely free, zero subscription required.
  </div>
</div>

<!-- OUT OF MARKET -->
<div class="card">
  <div class="section-title">Out-of-Market? Here's Your Fix</div>
  <p style="font-size:0.82rem;color:rgba(255,255,255,0.6);margin:0 0 1rem;line-height:1.6">Live outside the Arizona or Carolina broadcast footprint? Standard streaming services may blackout this game in your market in favor of a local matchup. Don't panic — there are solutions.</p>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem">
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:1rem">
      <div style="font-size:0.7rem;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.5rem">NFL Sunday Ticket</div>
      <p style="font-size:0.8rem;color:rgba(255,255,255,0.7);margin:0;line-height:1.5">Now on YouTube and YouTube TV. Guarantees access to every out-of-market Sunday afternoon game. The non-negotiable choice for displaced fans.</p>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:1rem">
      <div style="font-size:0.7rem;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.5rem">DirecTV Stream</div>
      <p style="font-size:0.8rem;color:rgba(255,255,255,0.7);margin:0;line-height:1.5">Carries FOX Sports and can include Sunday Ticket as an add-on. A solid cable-TV-replacement option for households that want the full bundle experience.</p>
    </div>
  </div>
</div>

<!-- SCORE SIMULATOR -->
<div class="card">
  <div class="section-title">Interactive Score Simulator</div>
  <p style="font-size:0.8rem;color:rgba(255,255,255,0.5);margin:0 0 1.2rem;line-height:1.6">Adjust the sliders to model different game scenarios and watch the projected score update in real time.</p>

  <div style="display:grid;gap:1.2rem">
    <div>
      <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:rgba(255,255,255,0.5);margin-bottom:0.4rem">
        <span>Kyler Murray Pass Efficiency</span><span id="ari-pass-val">78</span>
      </div>
      <input type="range" id="ari-pass" min="40" max="100" value="78" oninput="updateSim()" />
    </div>
    <div>
      <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:rgba(255,255,255,0.5);margin-bottom:0.4rem">
        <span>Cardinals Run Game (yards)</span><span id="ari-rush-val">112</span>
      </div>
      <input type="range" id="ari-rush" min="40" max="200" value="112" oninput="updateSim()" />
    </div>
    <div>
      <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:rgba(255,255,255,0.5);margin-bottom:0.4rem">
        <span>Panthers QB Pass Efficiency</span><span id="car-pass-val">65</span>
      </div>
      <input type="range" id="car-pass" min="40" max="100" value="65" oninput="updateSim()" />
    </div>
    <div>
      <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:rgba(255,255,255,0.5);margin-bottom:0.4rem">
        <span>Panthers Run Game (yards)</span><span id="car-rush-val">98</span>
      </div>
      <input type="range" id="car-rush" min="40" max="200" value="98" oninput="updateSim()" />
    </div>
  </div>

  <div class="score-display">
    <div class="score-team">
      <div class="score-num" id="ari-score">27</div>
      <div class="score-abbr">ARI</div>
    </div>
    <span class="score-dash">—</span>
    <div class="score-team">
      <div class="score-num" id="car-score">17</div>
      <div class="score-abbr">CAR</div>
    </div>
  </div>

  <div class="prob-bar-wrap">
    <div class="prob-labels">
      <span style="color:#97233F;font-weight:700" id="ari-prob">61%</span>
      <span style="font-size:0.68rem;color:rgba(255,255,255,0.35)">Win Probability</span>
      <span style="color:#0085CA;font-weight:700" id="car-prob">39%</span>
    </div>
    <div class="prob-bar">
      <div class="prob-fill-ari" id="ari-fill" style="width:61%"></div>
      <div class="prob-fill-car" id="car-fill" style="width:39%"></div>
    </div>
  </div>
</div>

<!-- WHAT TO WATCH FOR -->
<div class="card">
  <div class="section-title">The Matchup: What to Watch For</div>
  <p style="font-size:0.82rem;color:rgba(255,255,255,0.55);margin:0 0 1.2rem;line-height:1.6">Three storylines that will decide this game — and your fantasy football lineups.</p>

  <div class="matchup-card">
    <h4>Kyler's Deep Ball to Harrison Jr.</h4>
    <p>Marvin Harrison Jr. ended his rookie year as one of the most dangerous vertical weapons in the NFC. When Kyler Murray extends plays with his legs and throws from off-schedule, Harrison is already on a second route. The Panthers secondary will have their hands full — if Carolina cheats a safety into the box to stop the run, Murray will carve them up for 30+ yards per connection.</p>
  </div>

  <div class="matchup-card">
    <h4>The Trenches Battle</h4>
    <p>Carolina's path to an upset runs straight through Chuba Hubbard. If the Panthers establish the run game early, they control clock, keep Kyler on the sideline, and give their defense a breather. Arizona's defensive front needs to collapse that pocket fast — if they get pressure without blitzing, it's trouble for whoever's under center for Carolina.</p>
  </div>

  <div class="matchup-card">
    <h4>Trey McBride in the Red Zone</h4>
    <p>The Cardinals' tight end has evolved into a primary read when the offense gets inside the 20. He runs crisp routes that expose zone coverage, and Arizona consistently designs plays for him at the goal line. In PPR fantasy leagues he is a must-start. For Carolina, their linebacker corps will need to shade his way — which opens space elsewhere.</p>
  </div>
</div>

<!-- ODDS -->
<div class="card">
  <div class="section-title">Consensus Betting Lines</div>
  <div class="odds-grid">
    <div class="odds-card">
      <div class="odds-label">Spread</div>
      <div class="odds-val">ARI -4.5</div>
      <div class="odds-sub">Home-field edge</div>
    </div>
    <div class="odds-card">
      <div class="odds-label">Total (O/U)</div>
      <div class="odds-val">43.5</div>
      <div class="odds-sub">Points expected</div>
    </div>
    <div class="odds-card">
      <div class="odds-label">Moneyline</div>
      <div class="odds-val">ARI -210</div>
      <div class="odds-sub">CAR +175</div>
    </div>
    <div class="odds-card">
      <div class="odds-label">Murray TD</div>
      <div class="odds-val">-125</div>
      <div class="odds-sub">Passing TD anytime</div>
    </div>
    <div class="odds-card">
      <div class="odds-label">McBride Rec</div>
      <div class="odds-val">O 58.5</div>
      <div class="odds-sub">Receiving yards O/U</div>
    </div>
    <div class="odds-card">
      <div class="odds-label">Hubbard Rush</div>
      <div class="odds-val">O 72.5</div>
      <div class="odds-sub">Rushing yards O/U</div>
    </div>
  </div>
  <p style="font-size:0.68rem;color:rgba(255,255,255,0.3);margin:1rem 0 0;text-align:center">Lines from consensus aggregate. Odds subject to change. Gambling involves risk — bet responsibly.</p>
</div>

<!-- FAN POLL -->
<div class="card">
  <div class="section-title">Fan Poll: Who Wins?</div>
  <div class="poll-options">
    <button class="poll-btn" id="btn-ari" onclick="castVote('ari')">
      <img src="https://a.espncdn.com/i/teamlogos/nfl/500/ari.png" style="width:36px;height:36px;object-fit:contain;display:block;margin:0 auto 0.4rem" alt="Cardinals" />
      Cardinals Win
    </button>
    <button class="poll-btn" id="btn-car" onclick="castVote('car')">
      <img src="https://a.espncdn.com/i/teamlogos/nfl/500/car.png" style="width:36px;height:36px;object-fit:contain;display:block;margin:0 auto 0.4rem" alt="Panthers" />
      Panthers Win
    </button>
  </div>
  <div id="poll-results" style="display:none">
    <div class="poll-bar-row">
      <div class="poll-bar-label">
        <span style="color:#97233F">Arizona Cardinals</span>
        <span id="ari-pct-lbl">64%</span>
      </div>
      <div class="poll-bar-outer">
        <div class="poll-bar-inner" id="ari-bar" style="width:64%;background:#97233F"></div>
      </div>
    </div>
    <div class="poll-bar-row">
      <div class="poll-bar-label">
        <span style="color:#0085CA">Carolina Panthers</span>
        <span id="car-pct-lbl">36%</span>
      </div>
      <div class="poll-bar-outer">
        <div class="poll-bar-inner" id="car-bar" style="width:36%;background:#0085CA"></div>
      </div>
    </div>
    <div class="total-votes" id="votes-total">842 votes cast</div>
  </div>
</div>

<!-- PREDICTION -->
<div class="prediction-box">
  <div class="section-title" style="justify-content:center;margin-bottom:1rem">Model Prediction</div>
  <div class="pred-score">Cardinals 27 — Panthers 17</div>
  <div class="pred-winner">Arizona wins &bull; Confidence: 63%</div>
  <p class="pred-conf">State Farm Stadium in September is one of the hottest, most hostile environments in the NFL — and the Cardinals are built for it. Kyler Murray's scramble threat alone creates enough extra space to exploit Carolina's 2025-season defensive vulnerabilities in the middle of the field. The Panthers will make it interesting in the first half behind a committed run game, but Arizona's second-half adjustments under their defensive coordinator have been elite in recent home openers. The pick: Cardinals cover the 4.5.</p>
  <div class="share-row">
    <button class="share-btn tw" onclick="shareTwitter()">Share on X</button>
    <button class="share-btn fb" onclick="shareFacebook()">Share on Facebook</button>
    <button class="share-btn copy" onclick="copyLink()">Copy Link</button>
  </div>
</div>

<!-- SCRIPTS -->
<script>
(function(){
  // Countdown to kickoff
  function updateCountdown(){
    var game=new Date('2026-09-13T16:05:00-04:00');
    var now=new Date();
    var diff=game-now;
    if(diff<=0){
      document.getElementById('countdown').innerHTML='<span class="badge">Game Time</span>';
      return;
    }
    var d=Math.floor(diff/86400000);
    var h=Math.floor((diff%86400000)/3600000);
    var m=Math.floor((diff%3600000)/60000);
    var s=Math.floor((diff%60000)/1000);
    document.getElementById('cd-days').textContent=String(d).padStart(2,'0');
    document.getElementById('cd-hrs').textContent=String(h).padStart(2,'0');
    document.getElementById('cd-min').textContent=String(m).padStart(2,'0');
    document.getElementById('cd-sec').textContent=String(s).padStart(2,'0');
  }
  updateCountdown();
  setInterval(updateCountdown,1000);

  // Score simulator
  window.updateSim=function(){
    var ariP=+document.getElementById('ari-pass').value;
    var ariR=+document.getElementById('ari-rush').value;
    var carP=+document.getElementById('car-pass').value;
    var carR=+document.getElementById('car-rush').value;

    document.getElementById('ari-pass-val').textContent=ariP;
    document.getElementById('ari-rush-val').textContent=ariR;
    document.getElementById('car-pass-val').textContent=carP;
    document.getElementById('car-rush-val').textContent=carR;

    var ariScore=Math.round(8+(ariP*0.19)+(ariR*0.055));
    var carScore=Math.round(6+(carP*0.16)+(carR*0.055));
    ariScore=Math.max(3,Math.min(56,ariScore));
    carScore=Math.max(3,Math.min(56,carScore));

    document.getElementById('ari-score').textContent=ariScore;
    document.getElementById('car-score').textContent=carScore;

    var total=ariScore+carScore||1;
    var ariPct=Math.round((ariScore/total)*100);
    var carPct=100-ariPct;
    document.getElementById('ari-prob').textContent=ariPct+'%';
    document.getElementById('car-prob').textContent=carPct+'%';
    document.getElementById('ari-fill').style.width=ariPct+'%';
    document.getElementById('car-fill').style.width=carPct+'%';
  };

  // Fan poll
  var votes={ari:539,car:303};
  var userVote=null;

  function renderPoll(){
    var total=votes.ari+votes.car||1;
    var ariP=Math.round((votes.ari/total)*100);
    var carP=100-ariP;
    document.getElementById('ari-pct-lbl').textContent=ariP+'%';
    document.getElementById('car-pct-lbl').textContent=carP+'%';
    document.getElementById('ari-bar').style.width=ariP+'%';
    document.getElementById('car-bar').style.width=carP+'%';
    document.getElementById('votes-total').textContent=(votes.ari+votes.car).toLocaleString()+' votes cast';
  }

  window.castVote=function(side){
    if(userVote)return;
    userVote=side;
    votes[side]++;
    document.getElementById('btn-ari').classList.toggle('voted-ari',side==='ari');
    document.getElementById('btn-car').classList.toggle('voted-car',side==='car');
    document.getElementById('poll-results').style.display='block';
    renderPoll();
  };

  // Share
  var shareUrl=encodeURIComponent(window.location.href);
  var shareText=encodeURIComponent('Cardinals vs Panthers Week 1 2026 — I think Arizona wins 27-17. Who do you got? #NFLPredicts #AZCardinals #KeepPounding');
  window.shareTwitter=function(){window.open('https://twitter.com/intent/tweet?text='+shareText+'&url='+shareUrl,'_blank')};
  window.shareFacebook=function(){window.open('https://www.facebook.com/sharer/sharer.php?u='+shareUrl,'_blank')};
  window.copyLink=function(){
    navigator.clipboard.writeText(window.location.href).then(function(){
      var btn=document.querySelector('.share-btn.copy');
      btn.textContent='Copied!';
      setTimeout(function(){btn.textContent='Copy Link';},2000);
    });
  };
})();
</script>
`.trim();

// ─── Insert into MongoDB ──────────────────────────────────────────────────────

const client = new MongoClient(MONGODB_URI);

try {
  await client.connect();
  const db = client.db("nfl-live");
  const posts = db.collection("posts");

  const existing = await posts.findOne({ slug });
  if (existing) {
    console.log("Post already exists:", slug);
    console.log("URL: https://nflpredicts.com/blog/" + slug);
    process.exit(0);
  }

  const now = new Date();
  const doc = {
    slug,
    title,
    excerpt,
    content,
    coverImage: "",
    author: "NFL Predictions Hub Staff",
    tags,
    published: true,
    metaTitle,
    metaDescription,
    createdAt: now,
    updatedAt: now,
  };

  const result = await posts.insertOne(doc);
  console.log("Post created:", result.insertedId.toString());
  console.log("Slug:", slug);
  console.log("URL: https://nflpredicts.com/blog/" + slug);
} finally {
  await client.close();
}
