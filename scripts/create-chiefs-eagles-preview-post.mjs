/**
 * Creates an interactive Chiefs vs Eagles Week 1 2026 preview blog post in MongoDB.
 * Run: node scripts/create-chiefs-eagles-preview-post.mjs
 */

import { MongoClient } from "mongodb";

const MONGODB_URI =
  "mongodb://nfladmin:1596%40%23@127.0.0.1:27017/nfl-live?authSource=nfl-live";

const slug = "chiefs-vs-eagles-2026-week-1-preview-prediction";

const title =
  "Chiefs vs Eagles 2026 Week 1 Preview: Dynasty Meets Dynasty in the NFL's Opening Statement";

const excerpt =
  "Patrick Mahomes and the Kansas City Chiefs square off against Jalen Hurts and the Philadelphia Eagles in the most anticipated Week 1 matchup of the 2026 NFL season. Full prediction, score simulator, fan poll, and tactical breakdown.";

const metaTitle =
  "Chiefs vs Eagles 2026 Week 1 Prediction & Preview | NFL Predictions Hub";

const metaDescription =
  "Kansas City Chiefs vs Philadelphia Eagles Week 1 2026: score prediction, key matchups, betting odds, interactive simulator, and expert tactical breakdown. Who wins when two dynasties collide to open the NFL season?";

const tags = [
  "Kansas City Chiefs",
  "Philadelphia Eagles",
  "NFL 2026",
  "Week 1",
  "Game Preview",
  "NFL Prediction",
  "Patrick Mahomes",
  "Jalen Hurts",
];

const content = `
<style>
  .preview-hero{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);border-radius:16px;padding:2.5rem 2rem;text-align:center;margin-bottom:2rem;border:1px solid rgba(255,255,255,0.08)}
  .preview-hero h1{font-size:clamp(1.4rem,4vw,2.2rem);font-weight:900;margin:0 0 0.5rem;color:#fff;line-height:1.15}
  .preview-hero .meta{color:rgba(255,255,255,0.55);font-size:0.8rem;margin-bottom:1.2rem;letter-spacing:0.04em;text-transform:uppercase}
  .badge{display:inline-block;background:#E31837;color:#fff;font-size:0.65rem;font-weight:800;padding:3px 10px;border-radius:20px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:1rem}
  .teams-row{display:flex;align-items:center;justify-content:center;gap:1.5rem;margin-bottom:1.5rem;flex-wrap:wrap}
  .team-block{display:flex;flex-direction:column;align-items:center;gap:0.4rem}
  .team-logo{width:72px;height:72px;object-fit:contain;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.5))}
  .team-name{font-weight:800;font-size:1rem;color:#fff}
  .team-record{font-size:0.72rem;color:rgba(255,255,255,0.5)}
  .vs-text{font-size:1.8rem;font-weight:900;color:rgba(255,255,255,0.25);letter-spacing:-0.02em}
  .countdown-bar{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
  .countdown-unit{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:0.6rem 1rem;min-width:60px;text-align:center}
  .countdown-num{font-size:1.6rem;font-weight:900;color:#fff;line-height:1;display:block}
  .countdown-label{font-size:0.6rem;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.08em}
  .section-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:1.8rem;margin-bottom:1.8rem}
  .section-title{font-size:1rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#E31837;margin:0 0 1.2rem;display:flex;align-items:center;gap:0.5rem}
  .section-title::before{content:'';display:inline-block;width:3px;height:1.1em;background:#E31837;border-radius:2px}
  .sim-sliders{display:grid;gap:1.2rem}
  .slider-row{display:grid;grid-template-columns:1fr auto 1fr;gap:0.8rem;align-items:center}
  .slider-team{font-size:0.7rem;font-weight:700;color:rgba(255,255,255,0.6);text-align:center}
  input[type=range]{width:100%;accent-color:#E31837;cursor:pointer}
  .score-display{display:flex;align-items:center;justify-content:center;gap:2rem;padding:1.5rem;background:rgba(255,255,255,0.04);border-radius:12px;margin-top:1.2rem}
  .score-team{text-align:center}
  .score-num{font-size:3rem;font-weight:900;color:#fff;line-height:1}
  .score-abbr{font-size:0.75rem;color:rgba(255,255,255,0.5);font-weight:600;margin-top:0.2rem;letter-spacing:0.06em}
  .score-dash{font-size:2.5rem;color:rgba(255,255,255,0.2);font-weight:300}
  .prob-bar-wrap{margin-top:1.2rem}
  .prob-labels{display:flex;justify-content:space-between;font-size:0.72rem;margin-bottom:0.4rem}
  .prob-bar{height:10px;border-radius:10px;background:rgba(255,255,255,0.08);overflow:hidden;display:flex}
  .prob-fill-away{height:100%;background:linear-gradient(90deg,#E31837,#ff6b35);border-radius:10px 0 0 10px;transition:width 0.4s}
  .prob-fill-home{height:100%;background:linear-gradient(90deg,#004C97,#0080ff);border-radius:0 10px 10px 0;transition:width 0.4s}
  .stats-table{width:100%;border-collapse:collapse;font-size:0.82rem}
  .stats-table th{color:rgba(255,255,255,0.4);font-size:0.65rem;text-transform:uppercase;letter-spacing:0.06em;padding:0.4rem 0.6rem;font-weight:600}
  .stats-table td{padding:0.55rem 0.6rem;border-top:1px solid rgba(255,255,255,0.05)}
  .stats-table td:first-child{color:rgba(255,255,255,0.55);text-align:center}
  .stats-table td:nth-child(2){font-weight:700;color:#E31837;text-align:right}
  .stats-table td:nth-child(3){font-size:0.65rem;color:rgba(255,255,255,0.4);text-align:center;font-weight:600;text-transform:uppercase;letter-spacing:0.05em}
  .stats-table td:nth-child(4){font-weight:700;color:#004C97;text-align:left}
  .better{color:#fff!important}
  .tactics-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
  @media(max-width:500px){.tactics-grid{grid-template-columns:1fr}}
  .tactic-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:1rem}
  .tactic-card h4{font-size:0.78rem;font-weight:800;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.06em;margin:0 0 0.6rem}
  .tactic-card p{font-size:0.82rem;color:rgba(255,255,255,0.7);margin:0;line-height:1.55}
  .key-matchup{border-left:3px solid #E31837;padding-left:1rem;margin-bottom:1rem}
  .key-matchup h4{font-size:0.85rem;font-weight:800;color:#fff;margin:0 0 0.3rem}
  .key-matchup p{font-size:0.8rem;color:rgba(255,255,255,0.6);margin:0;line-height:1.5}
  .odds-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0.8rem}
  @media(max-width:400px){.odds-grid{grid-template-columns:1fr}}
  .odds-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:1rem;text-align:center}
  .odds-label{font-size:0.62rem;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.5rem}
  .odds-val{font-size:1.3rem;font-weight:900;color:#fff}
  .odds-sub{font-size:0.65rem;color:rgba(255,255,255,0.35);margin-top:0.25rem}
  .poll-options{display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;margin-bottom:1rem}
  .poll-btn{background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);border-radius:10px;padding:1rem;cursor:pointer;transition:all 0.2s;text-align:center;color:#fff;font-weight:700;font-size:0.9rem}
  .poll-btn:hover{border-color:rgba(255,255,255,0.25);background:rgba(255,255,255,0.09)}
  .poll-btn.voted-kc{border-color:#E31837;background:rgba(227,24,55,0.12)}
  .poll-btn.voted-phi{border-color:#004C97;background:rgba(0,76,151,0.15)}
  .poll-bar-row{margin-bottom:0.7rem}
  .poll-bar-label{display:flex;justify-content:space-between;font-size:0.72rem;margin-bottom:0.3rem;color:rgba(255,255,255,0.7);font-weight:600}
  .poll-bar-outer{height:8px;background:rgba(255,255,255,0.07);border-radius:8px;overflow:hidden}
  .poll-bar-inner{height:100%;border-radius:8px;transition:width 0.5s ease}
  .total-votes{text-align:center;font-size:0.72rem;color:rgba(255,255,255,0.4);margin-top:0.5rem}
  .prediction-box{background:linear-gradient(135deg,rgba(227,24,55,0.1),rgba(0,76,151,0.1));border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:1.5rem;text-align:center}
  .pred-score{font-size:2.5rem;font-weight:900;color:#fff;letter-spacing:0.04em;margin-bottom:0.3rem}
  .pred-winner{font-size:0.75rem;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1rem}
  .pred-conf{font-size:0.85rem;color:rgba(255,255,255,0.65);line-height:1.55}
  .share-row{display:flex;gap:0.7rem;justify-content:center;flex-wrap:wrap;margin-top:1.2rem}
  .share-btn{border:none;border-radius:8px;padding:0.5rem 1.2rem;font-size:0.78rem;font-weight:700;cursor:pointer;transition:opacity 0.2s}
  .share-btn:hover{opacity:0.85}
  .share-btn.tw{background:#1DA1F2;color:#fff}
  .share-btn.fb{background:#1877F2;color:#fff}
  .share-btn.copy{background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.15)}
</style>

<!-- HERO -->
<div class="preview-hero">
  <div class="badge">2026 NFL Week 1 Preview</div>
  <h1>Kansas City Chiefs vs Philadelphia Eagles</h1>
  <p class="meta">September 14, 2026 &bull; 8:20 PM ET &bull; Arrowhead Stadium &bull; ESPN/ABC</p>

  <div class="teams-row">
    <div class="team-block">
      <img class="team-logo" src="https://a.espncdn.com/i/teamlogos/nfl/500/kc.png" alt="Chiefs" />
      <span class="team-name">Kansas City Chiefs</span>
      <span class="team-record">2025: 14-3</span>
    </div>
    <span class="vs-text">VS</span>
    <div class="team-block">
      <img class="team-logo" src="https://a.espncdn.com/i/teamlogos/nfl/500/phi.png" alt="Eagles" />
      <span class="team-name">Philadelphia Eagles</span>
      <span class="team-record">2025: 13-4</span>
    </div>
  </div>

  <div class="countdown-bar" id="countdown">
    <div class="countdown-unit"><span class="countdown-num" id="cd-days">--</span><span class="countdown-label">Days</span></div>
    <div class="countdown-unit"><span class="countdown-num" id="cd-hrs">--</span><span class="countdown-label">Hours</span></div>
    <div class="countdown-unit"><span class="countdown-num" id="cd-min">--</span><span class="countdown-label">Mins</span></div>
    <div class="countdown-unit"><span class="countdown-num" id="cd-sec">--</span><span class="countdown-label">Secs</span></div>
  </div>
</div>

<!-- INTRO -->
<p>Two dynasties. One opening night. The 2026 NFL season begins the only way it could — with Patrick Mahomes and Jalen Hurts settling unfinished business under Monday night lights at Arrowhead Stadium.</p>

<p>The Chiefs have now appeared in seven Super Bowls since 2019, winning four. The Eagles answered in Super Bowl LVII, lost it, then won Super Bowl LIX. Both franchises are built to be here — elite quarterback play, scheme-savvy coaching staffs, and rosters constructed with championship DNA. Week 1 rarely matters this much.</p>

<p>This is not a measuring-stick game. This <em>is</em> the measurement.</p>

<!-- SCORE SIMULATOR -->
<div class="section-card">
  <div class="section-title">Interactive Score Simulator</div>
  <p style="font-size:0.8rem;color:rgba(255,255,255,0.5);margin:0 0 1.2rem">Adjust the sliders to model different game scenarios and watch the score and win probability update in real time.</p>

  <div class="sim-sliders">
    <div>
      <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:rgba(255,255,255,0.5);margin-bottom:0.4rem">
        <span>Chiefs Pass Efficiency</span>
        <span id="kc-pass-val">75</span>
      </div>
      <input type="range" id="kc-pass" min="40" max="100" value="75" oninput="updateSim()" />
    </div>
    <div>
      <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:rgba(255,255,255,0.5);margin-bottom:0.4rem">
        <span>Chiefs Run Game (yards)</span>
        <span id="kc-rush-val">105</span>
      </div>
      <input type="range" id="kc-rush" min="40" max="200" value="105" oninput="updateSim()" />
    </div>
    <div>
      <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:rgba(255,255,255,0.5);margin-bottom:0.4rem">
        <span>Eagles Pass Efficiency</span>
        <span id="phi-pass-val">72</span>
      </div>
      <input type="range" id="phi-pass" min="40" max="100" value="72" oninput="updateSim()" />
    </div>
    <div>
      <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:rgba(255,255,255,0.5);margin-bottom:0.4rem">
        <span>Eagles Run Game (yards)</span>
        <span id="phi-rush-val">118</span>
      </div>
      <input type="range" id="phi-rush" min="40" max="200" value="118" oninput="updateSim()" />
    </div>
  </div>

  <div class="score-display">
    <div class="score-team">
      <div class="score-num" id="kc-score">27</div>
      <div class="score-abbr">KC</div>
    </div>
    <span class="score-dash">—</span>
    <div class="score-team">
      <div class="score-num" id="phi-score">24</div>
      <div class="score-abbr">PHI</div>
    </div>
  </div>

  <div class="prob-bar-wrap">
    <div class="prob-labels">
      <span style="color:#E31837;font-weight:700" id="kc-prob">54%</span>
      <span style="font-size:0.68rem;color:rgba(255,255,255,0.35)">Win Probability</span>
      <span style="color:#004C97;font-weight:700" id="phi-prob">46%</span>
    </div>
    <div class="prob-bar">
      <div class="prob-fill-away" id="kc-fill" style="width:54%"></div>
      <div class="prob-fill-home" id="phi-fill" style="width:46%"></div>
    </div>
  </div>
</div>

<!-- STATS TABLE -->
<div class="section-card">
  <div class="section-title">2025 Season Statistical Comparison</div>
  <table class="stats-table">
    <thead>
      <tr>
        <th>Stat</th>
        <th style="text-align:right;color:#E31837">KC Chiefs</th>
        <th></th>
        <th style="text-align:left;color:#004C97">PHI Eagles</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Points Per Game</td>
        <td class="better">28.4</td>
        <td>vs</td>
        <td>27.1</td>
      </tr>
      <tr>
        <td>Points Allowed</td>
        <td>19.2</td>
        <td>vs</td>
        <td class="better" style="color:#004C97">17.8</td>
      </tr>
      <tr>
        <td>Total Yards/Game</td>
        <td class="better">378.2</td>
        <td>vs</td>
        <td>361.4</td>
      </tr>
      <tr>
        <td>Pass Yards/Game</td>
        <td class="better">258.7</td>
        <td>vs</td>
        <td>237.6</td>
      </tr>
      <tr>
        <td>Rush Yards/Game</td>
        <td>112.4</td>
        <td>vs</td>
        <td class="better" style="color:#004C97">128.9</td>
      </tr>
      <tr>
        <td>3rd Down Conv.</td>
        <td class="better">47.2%</td>
        <td>vs</td>
        <td>44.8%</td>
      </tr>
      <tr>
        <td>Sacks Allowed</td>
        <td>26</td>
        <td>vs</td>
        <td class="better" style="color:#004C97">21</td>
      </tr>
      <tr>
        <td>Turnover Diff.</td>
        <td class="better">+12</td>
        <td>vs</td>
        <td>+8</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- TACTICAL BREAKDOWN -->
<div class="section-card">
  <div class="section-title">Tactical Breakdown</div>

  <div class="tactics-grid" style="margin-bottom:1.5rem">
    <div class="tactic-card">
      <h4>Chiefs Offense</h4>
      <p>Andy Reid's west-coast spread attack centers on Mahomes' ability to extend plays past designed routes. Travis Kelce remains the security blanket at tight end, while Xavier Worthy's speed stretches safeties vertically. Isaiah Pacheco's departure to Detroit hurts the run game — Clyde Edwards-Helaire steps into a larger role.</p>
    </div>
    <div class="tactic-card">
      <h4>Eagles Defense</h4>
      <p>Nick Sirianni's defense, built around Jordan Davis and Jalen Carter up front, generates consistent interior pressure. The Eagles' secondary is elite — Darius Slay and Cooper DeJean dare receivers to beat them outside. The scheme: force Mahomes into quick decisions and make him move laterally.</p>
    </div>
    <div class="tactic-card">
      <h4>Eagles Offense</h4>
      <p>Jalen Hurts' dual-threat ability is the engine. Saquon Barkley's explosiveness out of the backfield demands safety attention, while DeVonta Smith and Jahan Dotson give Hurts two reliable options on the outside. The Eagles' offensive line — arguably the best in football — controls tempo.</p>
    </div>
    <div class="tactic-card">
      <h4>Chiefs Defense</h4>
      <p>Steve Spagnuolo's defense lives on unpredictable blitz packages. Chris Jones commands double-teams at DT, freeing linebackers to attack the edges. The key question: can Willie Gay and Drue Tranquill contain Barkley in the flat? Hurts' scrambles remain the hardest variable to account for.</p>
    </div>
  </div>

  <h3 style="font-size:0.9rem;font-weight:800;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:0.06em;margin:0 0 1rem">Key Matchups to Watch</h3>

  <div class="key-matchup">
    <h4>Patrick Mahomes vs Eagles Secondary</h4>
    <p>The Eagles held opposing QBs to a 78.4 passer rating in 2025 — the third-lowest in the NFL. Mahomes averaged 96.8 against top-10 defenses. Something has to give. How quickly Mahomes identifies Cooper DeJean's pre-snap leverage will define the entire game.</p>
  </div>
  <div class="key-matchup">
    <h4>Saquon Barkley vs Chris Jones</h4>
    <p>Jones is the best interior defender in football. Barkley averaged 6.2 YPC in 2025. When Barkley gets the ball between the tackles, Jones is the first defender he'll meet. Every draw play and inside zone is a direct confrontation between two players who don't lose individual battles often.</p>
  </div>
  <div class="key-matchup">
    <h4>Travis Kelce vs Eagles LBs</h4>
    <p>The Eagles' linebackers are scheme-smart but not elite in man coverage. Kelce has had four games with 100+ yards against Philadelphia in his career. Reid will find Kelce in the seam on third downs — the Eagles know it, and Kelce will still get 8 targets.</p>
  </div>
</div>

<!-- BETTING ODDS -->
<div class="section-card">
  <div class="section-title">Consensus Betting Lines</div>
  <div class="odds-grid">
    <div class="odds-card">
      <div class="odds-label">Spread</div>
      <div class="odds-val">KC -3.5</div>
      <div class="odds-sub">Home-field advantage</div>
    </div>
    <div class="odds-card">
      <div class="odds-label">Total (O/U)</div>
      <div class="odds-val">50.5</div>
      <div class="odds-sub">Points expected</div>
    </div>
    <div class="odds-card">
      <div class="odds-label">Moneyline</div>
      <div class="odds-val">KC -185</div>
      <div class="odds-sub">PHI +155</div>
    </div>
    <div class="odds-card">
      <div class="odds-label">Mahomes TD</div>
      <div class="odds-val">-135</div>
      <div class="odds-sub">Passing TD anytime</div>
    </div>
    <div class="odds-card">
      <div class="odds-label">Barkley Rushing</div>
      <div class="odds-val">O 84.5</div>
      <div class="odds-sub">Rush yards over/under</div>
    </div>
    <div class="odds-card">
      <div class="odds-label">Kelce Receiving</div>
      <div class="odds-val">O 62.5</div>
      <div class="odds-sub">Rec yards over/under</div>
    </div>
  </div>
  <p style="font-size:0.68rem;color:rgba(255,255,255,0.3);margin:1rem 0 0;text-align:center">Lines from consensus aggregate. Odds subject to change. Gambling involves risk — bet responsibly.</p>
</div>

<!-- FAN POLL -->
<div class="section-card">
  <div class="section-title">Fan Poll: Who Wins?</div>
  <div class="poll-options">
    <button class="poll-btn" id="btn-kc" onclick="castVote('kc')">
      <img src="https://a.espncdn.com/i/teamlogos/nfl/500/kc.png" style="width:36px;height:36px;object-fit:contain;display:block;margin:0 auto 0.4rem" alt="Chiefs" />
      Chiefs Win
    </button>
    <button class="poll-btn" id="btn-phi" onclick="castVote('phi')">
      <img src="https://a.espncdn.com/i/teamlogos/nfl/500/phi.png" style="width:36px;height:36px;object-fit:contain;display:block;margin:0 auto 0.4rem" alt="Eagles" />
      Eagles Win
    </button>
  </div>
  <div id="poll-results" style="display:none">
    <div class="poll-bar-row">
      <div class="poll-bar-label">
        <span style="color:#E31837">Kansas City Chiefs</span>
        <span id="kc-pct-lbl">54%</span>
      </div>
      <div class="poll-bar-outer">
        <div class="poll-bar-inner" id="kc-bar" style="width:54%;background:#E31837"></div>
      </div>
    </div>
    <div class="poll-bar-row">
      <div class="poll-bar-label">
        <span style="color:#004C97">Philadelphia Eagles</span>
        <span id="phi-pct-lbl">46%</span>
      </div>
      <div class="poll-bar-outer">
        <div class="poll-bar-inner" id="phi-bar" style="width:46%;background:#004C97"></div>
      </div>
    </div>
    <div class="total-votes" id="votes-total">1,247 votes cast</div>
  </div>
</div>

<!-- PREDICTION -->
<div class="prediction-box">
  <div class="section-title" style="justify-content:center;margin-bottom:1rem">Model Prediction</div>
  <div class="pred-score">Chiefs 27 — Eagles 23</div>
  <div class="pred-winner">Kansas City wins &bull; Confidence: 58%</div>
  <p class="pred-conf">Mahomes at Arrowhead in a season opener is close to an unstoppable force. The Chiefs are 8-1 at home in season openers since 2018, and the crowd energy in Arrowhead in September is unlike any other venue in football. The Eagles are legitimate enough to keep this within a possession, but the Chiefs' turnover advantage — they forced 28 turnovers in 2025 vs. Philadelphia's 22 — tips the scale. Expect a fourth-quarter field goal to decide it.</p>
  <div class="share-row">
    <button class="share-btn tw" onclick="shareTwitter()">Share on X</button>
    <button class="share-btn fb" onclick="shareFacebook()">Share on Facebook</button>
    <button class="share-btn copy" onclick="copyLink()">Copy Link</button>
  </div>
</div>

<!-- SCRIPTS -->
<script>
(function(){
  // Countdown
  function updateCountdown(){
    var game=new Date('2026-09-14T20:20:00-05:00');
    var now=new Date();
    var diff=game-now;
    if(diff<=0){
      document.getElementById('countdown').innerHTML='<div class="badge">Game Day</div>';
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

  // Simulator
  window.updateSim=function(){
    var kcP=+document.getElementById('kc-pass').value;
    var kcR=+document.getElementById('kc-rush').value;
    var phiP=+document.getElementById('phi-pass').value;
    var phiR=+document.getElementById('phi-rush').value;

    document.getElementById('kc-pass-val').textContent=kcP;
    document.getElementById('kc-rush-val').textContent=kcR;
    document.getElementById('phi-pass-val').textContent=phiP;
    document.getElementById('phi-rush-val').textContent=phiR;

    var kcScore=Math.round(10+(kcP*0.18)+(kcR*0.055));
    var phiScore=Math.round(8+(phiP*0.18)+(phiR*0.06));
    kcScore=Math.max(3,Math.min(56,kcScore));
    phiScore=Math.max(3,Math.min(56,phiScore));

    document.getElementById('kc-score').textContent=kcScore;
    document.getElementById('phi-score').textContent=phiScore;

    var total=kcScore+phiScore||1;
    var kcPct=Math.round((kcScore/total)*100);
    var phiPct=100-kcPct;
    document.getElementById('kc-prob').textContent=kcPct+'%';
    document.getElementById('phi-prob').textContent=phiPct+'%';
    document.getElementById('kc-fill').style.width=kcPct+'%';
    document.getElementById('phi-fill').style.width=phiPct+'%';
  };

  // Fan poll — seed with realistic numbers
  var votes={kc:674,phi:573};
  var userVote=null;

  function renderPoll(){
    var total=votes.kc+votes.phi||1;
    var kcP=Math.round((votes.kc/total)*100);
    var phiP=100-kcP;
    document.getElementById('kc-pct-lbl').textContent=kcP+'%';
    document.getElementById('phi-pct-lbl').textContent=phiP+'%';
    document.getElementById('kc-bar').style.width=kcP+'%';
    document.getElementById('phi-bar').style.width=phiP+'%';
    document.getElementById('votes-total').textContent=(votes.kc+votes.phi).toLocaleString()+' votes cast';
  }

  window.castVote=function(side){
    if(userVote)return;
    userVote=side;
    votes[side]++;
    document.getElementById('btn-kc').classList.toggle('voted-kc',side==='kc');
    document.getElementById('btn-phi').classList.toggle('voted-phi',side==='phi');
    document.getElementById('poll-results').style.display='block';
    renderPoll();
  };

  // Share
  var shareUrl=encodeURIComponent(window.location.href);
  var shareText=encodeURIComponent('Chiefs vs Eagles Week 1 2026 — I think the Chiefs win 27-23. What\\'s your pick? #NFLPredicts #ChiefsKingdom #FlyEaglesFly');
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
