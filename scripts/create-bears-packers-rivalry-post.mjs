/**
 * Creates an in-depth Bears vs Packers rivalry history blog post in MongoDB.
 * Run: node scripts/create-bears-packers-rivalry-post.mjs
 */

import { MongoClient } from "mongodb";

const MONGODB_URI =
  "mongodb://nfladmin:1596%40%23@127.0.0.1:27017/nfl-live?authSource=nfl-live";

const slug = "bears-vs-packers-greatest-rivalry-nfl-history";

const title =
  "Bears vs Packers: The Greatest Rivalry in NFL History — 100+ Years of Hatred, Glory, and Legend";

const excerpt =
  "From the 1921 Staleys to Favre, Rodgers, and beyond — the complete story of the Chicago Bears vs Green Bay Packers rivalry: all-time records, legendary players, unforgettable games, and what makes it the oldest and bitterest feud in professional football.";

const metaTitle =
  "Bears vs Packers Rivalry History: 100+ Years | NFL Predictions Hub";

const metaDescription =
  "The complete history of the Bears vs Packers NFL rivalry: all-time head-to-head record, legendary matchups, Halas, Lombardi, Favre, Rodgers, and the moments that defined the greatest rivalry in football. Updated for 2026.";

const tags = [
  "Chicago Bears",
  "Green Bay Packers",
  "NFL Rivalry",
  "NFL History",
  "Bears vs Packers",
  "Aaron Rodgers",
  "Brett Favre",
  "George Halas",
  "Vince Lombardi",
  "NFC North",
];

const content = `
<style>
  .rivalry-hero{background:linear-gradient(135deg,#0a0a1a 0%,#1a0a0a 40%,#0a1a0a 100%);border-radius:16px;padding:2.5rem 2rem;text-align:center;margin-bottom:2rem;border:1px solid rgba(255,255,255,0.07);position:relative;overflow:hidden}
  .rivalry-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,rgba(11,22,79,0.35) 0%,transparent 60%),radial-gradient(ellipse at 70% 50%,rgba(22,71,19,0.35) 0%,transparent 60%);pointer-events:none}
  .rivalry-hero h1{font-size:clamp(1.3rem,4vw,2rem);font-weight:900;margin:0 0 0.5rem;color:#fff;line-height:1.15;position:relative}
  .rivalry-hero .sub{color:rgba(255,255,255,0.5);font-size:0.82rem;margin-bottom:1.5rem;position:relative}
  .badge-rivalry{display:inline-block;background:linear-gradient(90deg,#0B164F,#203731);color:#fff;font-size:0.65rem;font-weight:800;padding:4px 14px;border-radius:20px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:1rem;border:1px solid rgba(255,255,255,0.15);position:relative}
  .teams-row{display:flex;align-items:center;justify-content:center;gap:2rem;margin-bottom:1.8rem;flex-wrap:wrap;position:relative}
  .team-block{display:flex;flex-direction:column;align-items:center;gap:0.5rem}
  .team-logo{width:80px;height:80px;object-fit:contain;filter:drop-shadow(0 6px 16px rgba(0,0,0,0.6))}
  .team-name{font-weight:900;font-size:1rem;color:#fff}
  .team-years{font-size:0.68rem;color:rgba(255,255,255,0.4);letter-spacing:0.04em}
  .vs-block{text-align:center}
  .vs-text{font-size:2.2rem;font-weight:900;color:rgba(255,255,255,0.2);display:block;line-height:1}
  .vs-years{font-size:0.6rem;color:rgba(255,255,255,0.3);letter-spacing:0.1em;text-transform:uppercase}
  .record-strip{display:flex;gap:0;border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;position:relative}
  .record-side{flex:1;padding:1rem 0.5rem;text-align:center}
  .record-side.bears{background:rgba(11,22,79,0.4)}
  .record-side.tie{background:rgba(255,255,255,0.04);flex:0.6}
  .record-side.packers{background:rgba(32,55,49,0.4)}
  .record-num{font-size:2.2rem;font-weight:900;color:#fff;line-height:1;display:block}
  .record-label{font-size:0.6rem;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.07em;margin-top:0.2rem}
  .section-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:1.8rem;margin-bottom:1.8rem}
  .section-title{font-size:0.9rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#c8a951;margin:0 0 1.2rem;display:flex;align-items:center;gap:0.5rem}
  .section-title::before{content:'';display:inline-block;width:3px;height:1.1em;background:#c8a951;border-radius:2px}
  .timeline{position:relative;padding-left:1.5rem}
  .timeline::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:linear-gradient(to bottom,#0B164F,#c8a951,#203731)}
  .timeline-item{position:relative;padding:0 0 1.8rem 1.2rem}
  .timeline-item::before{content:'';position:absolute;left:-0.45rem;top:0.3rem;width:10px;height:10px;border-radius:50%;background:#c8a951;border:2px solid #0a0a1a}
  .timeline-year{font-size:0.7rem;font-weight:800;color:#c8a951;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.25rem}
  .timeline-title{font-size:0.9rem;font-weight:800;color:#fff;margin:0 0 0.3rem;line-height:1.3}
  .timeline-body{font-size:0.8rem;color:rgba(255,255,255,0.6);margin:0;line-height:1.6}
  .legends-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
  @media(max-width:480px){.legends-grid{grid-template-columns:1fr}}
  .legend-card{border-radius:12px;padding:1.2rem;border:1px solid rgba(255,255,255,0.07)}
  .legend-card.bears-card{background:linear-gradient(135deg,rgba(11,22,79,0.35),rgba(11,22,79,0.15))}
  .legend-card.packers-card{background:linear-gradient(135deg,rgba(32,55,49,0.35),rgba(32,55,49,0.15))}
  .legend-team-label{font-size:0.6rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.5rem;opacity:0.7}
  .legend-name{font-size:1rem;font-weight:900;color:#fff;margin-bottom:0.25rem}
  .legend-era{font-size:0.68rem;color:rgba(255,255,255,0.4);margin-bottom:0.6rem}
  .legend-stat{display:inline-block;background:rgba(255,255,255,0.07);border-radius:6px;padding:3px 9px;font-size:0.68rem;font-weight:700;color:rgba(255,255,255,0.7);margin-bottom:0.5rem;margin-right:4px}
  .legend-body{font-size:0.78rem;color:rgba(255,255,255,0.6);line-height:1.55;margin:0}
  .games-list{display:grid;gap:1rem}
  .game-card{border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:1.1rem;background:rgba(255,255,255,0.025)}
  .game-card-top{display:flex;align-items:center;gap:0.7rem;margin-bottom:0.5rem}
  .game-badge{font-size:0.58rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;padding:2px 8px;border-radius:10px;color:#fff;background:rgba(200,169,81,0.25);border:1px solid rgba(200,169,81,0.4);white-space:nowrap}
  .game-teams{font-size:0.88rem;font-weight:800;color:#fff}
  .game-score{font-size:1.1rem;font-weight:900;color:#c8a951;margin-left:auto;white-space:nowrap}
  .game-desc{font-size:0.78rem;color:rgba(255,255,255,0.55);line-height:1.55;margin:0}
  .stats-comparison{display:grid;grid-template-columns:auto 1fr auto;gap:0.5rem 1rem;align-items:center}
  .stat-label{font-size:0.7rem;color:rgba(255,255,255,0.4);text-align:center;grid-column:1/-1;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;padding-top:0.6rem}
  .stat-val-left{font-size:1rem;font-weight:800;color:#c8e0ff;text-align:right}
  .stat-bar-wrap{height:6px;border-radius:6px;background:rgba(255,255,255,0.07);overflow:hidden;display:flex}
  .stat-bar-left{height:100%;background:linear-gradient(90deg,#0B164F,#3a5fcf);border-radius:6px 0 0 6px}
  .stat-bar-right{height:100%;background:linear-gradient(90deg,#203731,#4caf76);border-radius:0 6px 6px 0}
  .stat-val-right{font-size:1rem;font-weight:800;color:#a8d5b0;text-align:left}
  .stat-name-center{font-size:0.65rem;color:rgba(255,255,255,0.35);text-align:center;font-weight:600;text-transform:uppercase;letter-spacing:0.04em}
  .qb-duel{display:grid;grid-template-columns:1fr auto 1fr;gap:1rem;align-items:start;margin-bottom:1.2rem}
  .qb-side{border-radius:10px;padding:1rem}
  .qb-side.bears-side{background:rgba(11,22,79,0.25);border:1px solid rgba(11,22,79,0.5)}
  .qb-side.packers-side{background:rgba(32,55,49,0.25);border:1px solid rgba(32,55,49,0.5)}
  .qb-name{font-size:0.88rem;font-weight:900;color:#fff;margin-bottom:0.2rem}
  .qb-era{font-size:0.62rem;color:rgba(255,255,255,0.4);margin-bottom:0.6rem}
  .qb-stat{font-size:0.72rem;color:rgba(255,255,255,0.6);margin-bottom:0.2rem}
  .qb-stat span{color:#fff;font-weight:700}
  .qb-vs{font-size:1.2rem;font-weight:900;color:rgba(255,255,255,0.2);text-align:center;padding-top:1rem}
  .trivia-q{border-left:3px solid #c8a951;padding:0.8rem 1rem;margin-bottom:1rem;background:rgba(200,169,81,0.06);border-radius:0 8px 8px 0}
  .trivia-q h4{font-size:0.85rem;font-weight:800;color:#fff;margin:0 0 0.6rem}
  .trivia-opts{display:flex;flex-direction:column;gap:0.4rem}
  .trivia-opt{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:0.5rem 0.9rem;font-size:0.78rem;color:rgba(255,255,255,0.7);cursor:pointer;transition:all 0.18s;text-align:left;width:100%}
  .trivia-opt:hover{border-color:rgba(200,169,81,0.4);background:rgba(200,169,81,0.1);color:#fff}
  .trivia-opt.correct{border-color:#4caf76;background:rgba(76,175,118,0.15);color:#4caf76;font-weight:700}
  .trivia-opt.wrong{border-color:#e53935;background:rgba(229,57,53,0.1);color:rgba(255,255,255,0.4)}
  .trivia-reveal{font-size:0.75rem;color:rgba(255,255,255,0.45);margin-top:0.5rem;line-height:1.5;display:none}
  .poll-opts{display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;margin-bottom:1rem}
  .poll-btn{background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);border-radius:10px;padding:1rem;cursor:pointer;transition:all 0.2s;text-align:center;color:#fff;font-weight:700;font-size:0.88rem;line-height:1.3}
  .poll-btn:hover{border-color:rgba(255,255,255,0.25);background:rgba(255,255,255,0.09)}
  .poll-btn.voted-bears{border-color:#0B164F;background:rgba(11,22,79,0.25)}
  .poll-btn.voted-packers{border-color:#203731;background:rgba(32,55,49,0.25)}
  .poll-bar-row{margin-bottom:0.8rem}
  .poll-bar-label{display:flex;justify-content:space-between;font-size:0.72rem;margin-bottom:0.3rem;color:rgba(255,255,255,0.7);font-weight:600}
  .poll-bar-outer{height:9px;background:rgba(255,255,255,0.07);border-radius:8px;overflow:hidden}
  .poll-bar-inner{height:100%;border-radius:8px;transition:width 0.5s ease}
  .total-votes{text-align:center;font-size:0.7rem;color:rgba(255,255,255,0.35);margin-top:0.5rem}
  .highlight-quote{border-left:4px solid #c8a951;padding:1rem 1.2rem;margin:1.2rem 0;background:rgba(200,169,81,0.06);border-radius:0 10px 10px 0}
  .highlight-quote p{font-size:0.9rem;font-style:italic;color:rgba(255,255,255,0.75);margin:0 0 0.4rem;line-height:1.6}
  .highlight-quote cite{font-size:0.7rem;color:rgba(255,255,255,0.4);font-style:normal}
  .share-row{display:flex;gap:0.7rem;justify-content:center;flex-wrap:wrap;margin-top:1.2rem}
  .share-btn{border:none;border-radius:8px;padding:0.5rem 1.2rem;font-size:0.78rem;font-weight:700;cursor:pointer;transition:opacity 0.2s}
  .share-btn:hover{opacity:0.85}
  .share-btn.tw{background:#1DA1F2;color:#fff}
  .share-btn.fb{background:#1877F2;color:#fff}
  .share-btn.copy{background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.15)}
  .closing-box{background:linear-gradient(135deg,rgba(11,22,79,0.2),rgba(32,55,49,0.2));border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:1.5rem;text-align:center}
</style>

<!-- HERO -->
<div class="rivalry-hero">
  <div class="badge-rivalry">NFL's Greatest Rivalry &bull; Est. 1921</div>
  <h1>Bears vs Packers: 100+ Years of the NFL's Most Bitter Feud</h1>
  <p class="sub">From George Halas to Aaron Rodgers &mdash; the complete history of professional football's oldest and most storied rivalry</p>

  <div class="teams-row">
    <div class="team-block">
      <img class="team-logo" src="https://a.espncdn.com/i/teamlogos/nfl/500/chi.png" alt="Chicago Bears" />
      <span class="team-name">Chicago Bears</span>
      <span class="team-years">Founded 1919</span>
    </div>
    <div class="vs-block">
      <span class="vs-text">VS</span>
      <span class="vs-years">1921 &mdash; Present</span>
    </div>
    <div class="team-block">
      <img class="team-logo" src="https://a.espncdn.com/i/teamlogos/nfl/500/gb.png" alt="Green Bay Packers" />
      <span class="team-name">Green Bay Packers</span>
      <span class="team-years">Founded 1919</span>
    </div>
  </div>

  <div class="record-strip">
    <div class="record-side bears">
      <span class="record-num">105</span>
      <span class="record-label">Bears Wins</span>
    </div>
    <div class="record-side tie">
      <span class="record-num">6</span>
      <span class="record-label">Ties</span>
    </div>
    <div class="record-side packers">
      <span class="record-num">105</span>
      <span class="record-label">Packers Wins</span>
    </div>
  </div>
</div>

<!-- INTRO -->
<p>There are rivalries, and then there is Bears vs Packers. Since their first meeting in 1921 — before most of the NFL's other franchises even existed — these two teams have defined what it means to hate your neighbor across the state line. More than 216 games. More than 100 years. The most even head-to-head record in NFL history, almost perfectly split down the middle.</p>

<p>No other rivalry in professional football has the combination of longevity, geography, mutual loathing, and championship stakes that this one carries. It has produced Hall of Fame moments in blizzards at Lambeau Field and November mud at Soldier Field. It gave us Halas vs Lombardi. Butkus vs Nitschke. Favre vs Urlacher. Rodgers vs the entire city of Chicago.</p>

<p>This is the story of all of it.</p>

<!-- TIMELINE -->
<div class="section-card">
  <div class="section-title">A Rivalry Through the Ages</div>

  <div class="timeline">
    <div class="timeline-item">
      <div class="timeline-year">1921 &mdash; The Beginning</div>
      <div class="timeline-title">The Staleys vs The Packers</div>
      <p class="timeline-body">Before they were the Bears, Chicago's team was the Decatur Staleys, run by a young player-coach named George Halas. The Packers were barely two years old, funded by a local meat-packing company. Their first meeting set a template that would last a century: hard-nosed, low-scoring, won in the trenches. The rivalry was born before most of the league existed.</p>
    </div>

    <div class="timeline-item">
      <div class="timeline-year">1921&ndash;1940s &mdash; The Halas Era</div>
      <div class="timeline-title">George Halas vs Curly Lambeau — Founding Fathers at War</div>
      <p class="timeline-body">George Halas and Curly Lambeau were two of the NFL's founding fathers who genuinely could not stand each other. Halas, a driven perfectionist who played both sides of the ball, vs Lambeau, the charismatic creator of the Packers dynasty. Between them they coached 11 NFL championships. Their sideline confrontations were legendary — referees reportedly kept extra distance when these teams played. Chicago won titles in 1921, 1932, 1933, 1940, 1941, and 1946. Green Bay answered with titles in 1929, 1930, 1931, 1936, 1939, and 1944. The first golden age of this rivalry defined professional football itself.</p>
    </div>

    <div class="timeline-item">
      <div class="timeline-year">1956&ndash;1967 &mdash; Lombardi Arrives</div>
      <div class="timeline-title">The Lombardi Dynasty Meets the Monster of the Midway</div>
      <p class="timeline-body">When Vince Lombardi took over Green Bay in 1959, he inherited a losing franchise and transformed it into the most dominant dynasty the NFL had seen. Bart Starr. Paul Hornung. Jim Taylor. Lombardi's Packers won five NFL titles in nine years, including the first two Super Bowls. But none of those championships felt complete without beating Chicago first. Halas — still coaching into his 60s — called Lombardi "the one coach I truly feared." The mutual respect between these two coaching legends added a layer of intellectual rivalry beneath the physical brutality on the field.</p>
    </div>

    <div class="timeline-item">
      <div class="timeline-year">1965&ndash;1974 &mdash; Butkus vs The World</div>
      <div class="timeline-title">Dick Butkus Makes Lambeau Field a Miserable Place</div>
      <p class="timeline-body">Dick Butkus is widely considered the most intimidating player in NFL history. He played 9 seasons from 1965 to 1973, never made the playoffs, and never cared. His singular mission every November was to make Packers running backs' lives as difficult as possible. Butkus made 1,020 tackles, 22 interceptions, and forced 27 fumbles in his career — and he played through pain that would end most careers. Packers ball carriers from that era still speak about facing Butkus with a specific kind of reverence. He was, one Green Bay lineman said, "not a football player. He was a force of nature that wore one."</p>
    </div>

    <div class="timeline-item">
      <div class="timeline-year">1985 &mdash; The Greatest Bear Team</div>
      <div class="timeline-title">The 1985 Bears: 15-1 and Unstoppable</div>
      <p class="timeline-body">The 1985 Chicago Bears went 15-1, allowed the fewest points in NFL history, and won Super Bowl XX by 36 points. Jim McMahon at quarterback. Walter Payton — "Sweetness" — in the backfield. Mike Singletary commanding Buddy Ryan's revolutionary 46 defense. They outscored opponents 456-198 for the season. Their lone regular-season loss? A 16-10 defeat in Miami. But their two wins over Green Bay — by a combined 59-25 — stand as a reminder of what peak Chicago looks like. That team is the gold standard against which every subsequent Bears squad is measured.</p>
    </div>

    <div class="timeline-item">
      <div class="timeline-year">1992&ndash;2007 &mdash; The Favre Era</div>
      <div class="timeline-title">Brett Favre Makes Soldier Field His Personal Stage</div>
      <p class="timeline-body">Brett Favre started 253 consecutive games and holds every major Packers franchise passing record. Against the Bears specifically, Favre was 22-10, threw 57 touchdown passes and 38 interceptions in the series. He was never more dangerous than in a rivalry game, producing some of his most iconic moments on frozen December fields. His 1995 performance — 336 yards, 3 TDs in a 35-28 Green Bay win at Soldier Field — was one of the defining rivalry games of the decade. Bears fans hated him. Packers fans worshipped him. Everyone watched.</p>
    </div>

    <div class="timeline-item">
      <div class="timeline-year">2001&ndash;2012 &mdash; Urlacher's Era</div>
      <div class="timeline-title">Brian Urlacher Carries the Rivalry on His Back</div>
      <p class="timeline-body">For a decade, Brian Urlacher was the Chicago Bears. Eight Pro Bowls. 1,353 tackles. A Defensive Player of the Year award in 2005. He played at a size and speed that linebackers weren't supposed to have — 258 pounds running sub-4.5 forties. Against the Packers, Urlacher elevated further, recording multiple sack-and-interception games. His 2006 regular season, which carried Chicago to the Super Bowl, included two dominant Bears wins over Green Bay. He is the reason a generation of Bears fans believes that linebackers, not quarterbacks, are the soul of football.</p>
    </div>

    <div class="timeline-item">
      <div class="timeline-year">2008&ndash;2022 &mdash; The Rodgers Decade</div>
      <div class="timeline-title">Aaron Rodgers Haunts Chicago for 14 Years</div>
      <p class="timeline-body">No player in the modern era has dominated a single rival the way Aaron Rodgers dominated the Chicago Bears. His career record against Chicago: 22-5. His career passer rating vs Chicago: 114.7 — nearly 20 points above his already extraordinary overall average. He threw 60 touchdown passes and only 9 interceptions against them. Every year, twice a year, Bears fans braced. After their 2010 NFC Championship win in Chicago, Rodgers' mic'd-up moment — "I own you. I own you." — became one of the most infamous trash-talk lines in NFL history. He was, simply, the single most psychologically damaging opponent Bears fans ever had to endure.</p>
    </div>

    <div class="timeline-item">
      <div class="timeline-year">2024&ndash;Present &mdash; New Era</div>
      <div class="timeline-title">Caleb Williams Arrives: The Next Chapter</div>
      <p class="timeline-body">The 2024 NFL Draft saw Chicago select Caleb Williams first overall — a franchise-altering investment. The rivalry enters a new chapter: a Bears team rebuilt around the most talented quarterback prospect since Andrew Luck, facing a Packers team built around Jordan Love, who quietly compiled one of the best sophomore seasons by a Green Bay starter since Favre. This rivalry is never dormant for long. Two young quarterbacks. Two hungry fanbases. Same frozen fields. Same mutual contempt. The next decade is being written right now.</p>
    </div>
  </div>
</div>

<!-- LEGENDS -->
<div class="section-card">
  <div class="section-title">Legends of the Rivalry</div>
  <p style="font-size:0.8rem;color:rgba(255,255,255,0.5);margin:0 0 1.4rem">The players who defined how this rivalry was played and remembered.</p>

  <div class="legends-grid">
    <div class="legend-card bears-card">
      <div class="legend-team-label" style="color:#7b9cff">Chicago Bears</div>
      <div class="legend-name">Walter Payton</div>
      <div class="legend-era">Running Back &bull; 1975&ndash;1987</div>
      <span class="legend-stat">16,726 Career Rush Yards</span>
      <span class="legend-stat">Super Bowl XX Champion</span>
      <p class="legend-body">The greatest Bear of all time. "Sweetness" was the complete package: power, speed, blocking, and an unmatched competitiveness. In rivalry games against Green Bay, Payton consistently elevated to another level. His 275-yard performance in 1977 against the Vikings showed what he could do — but it was the sustained dominance over the Packers through a decade of battles that cemented his place as the soul of this franchise.</p>
    </div>

    <div class="legend-card packers-card">
      <div class="legend-team-label" style="color:#8dbfa0">Green Bay Packers</div>
      <div class="legend-name">Bart Starr</div>
      <div class="legend-era">Quarterback &bull; 1956&ndash;1971</div>
      <span class="legend-stat">5 NFL Championships</span>
      <span class="legend-stat">2× Super Bowl MVP</span>
      <p class="legend-body">Lombardi's field general. Bart Starr was not flashy — he was precise, calm, and absolutely lethal in big moments. His record against Chicago was strong throughout the dynasty years, and his composure under pressure in frozen conditions (the "Ice Bowl" freeze-out mentality came from Starr) defined what Green Bay quarterback play meant. He called his own plays, audibles, and blitz pickups — a quarterback's quarterback in an era that shaped the position forever.</p>
    </div>

    <div class="legend-card bears-card">
      <div class="legend-team-label" style="color:#7b9cff">Chicago Bears</div>
      <div class="legend-name">Dick Butkus</div>
      <div class="legend-era">Linebacker &bull; 1965&ndash;1973</div>
      <span class="legend-stat">1,020 Career Tackles</span>
      <span class="legend-stat">2× NFL Defensive Player of Year</span>
      <p class="legend-body">The most feared player in NFL history, full stop. Butkus played as if each game against the Packers was a personal affront. He didn't just tackle — he announced himself. Running backs knew that getting the ball near Butkus was going to hurt, regardless of whether they gained yards. He is the prototype for every hard-hitting middle linebacker the Bears have ever drafted, and the standard against which every Bears defender is still measured.</p>
    </div>

    <div class="legend-card packers-card">
      <div class="legend-team-label" style="color:#8dbfa0">Green Bay Packers</div>
      <div class="legend-name">Brett Favre</div>
      <div class="legend-era">Quarterback &bull; 1992&ndash;2007</div>
      <span class="legend-stat">22-10 vs Chicago</span>
      <span class="legend-stat">57 TDs vs Bears</span>
      <p class="legend-body">Favre played this rivalry with obvious joy — which made it even more infuriating for Bears fans. He had a gift for his most audacious plays coming in rivalry games, and his overall numbers against Chicago are among the best any quarterback has posted against any single opponent in NFL history. He is the last Packers QB that Bears fans genuinely feared in their bones before Rodgers arrived to make things measurably worse.</p>
    </div>

    <div class="legend-card bears-card">
      <div class="legend-team-label" style="color:#7b9cff">Chicago Bears</div>
      <div class="legend-name">Brian Urlacher</div>
      <div class="legend-era">Linebacker &bull; 2000&ndash;2012</div>
      <span class="legend-stat">8× Pro Bowl</span>
      <span class="legend-stat">2005 DPOY</span>
      <p class="legend-body">Urlacher bridged the gap between the Butkus era and the modern Bears. A freak athlete at his size, he could cover slot receivers, blitz the quarterback, and stuff the run — often in the same game. His rivalry battles against Favre and Rodgers were among the best linebacker vs elite QB matchups the modern game has produced. Without Urlacher, the 2006 Bears don't reach the Super Bowl.</p>
    </div>

    <div class="legend-card packers-card">
      <div class="legend-team-label" style="color:#8dbfa0">Green Bay Packers</div>
      <div class="legend-name">Aaron Rodgers</div>
      <div class="legend-era">Quarterback &bull; 2008&ndash;2022</div>
      <span class="legend-stat">22-5 vs Chicago</span>
      <span class="legend-stat">114.7 Passer Rating vs Bears</span>
      <p class="legend-body">The most dominant single-rivalry performer of the modern era. Rodgers treated games against Chicago differently than other teams — every Bears fan knew it, and it made losing to him somehow worse. His 2014 Hail Mary at Lambeau, his "I own you" declaration after the 2010 NFC Championship, his almost casual destruction of Bears defenses year after year — Aaron Rodgers is the reason Bears fans have a complex that no therapist can fully address.</p>
    </div>
  </div>
</div>

<!-- QB DUELS SECTION -->
<div class="section-card">
  <div class="section-title">Great Quarterback Duels</div>
  <p style="font-size:0.8rem;color:rgba(255,255,255,0.5);margin:0 0 1.4rem">The signal-callers who shaped specific eras of the rivalry.</p>

  <div class="qb-duel">
    <div class="qb-side bears-side">
      <div class="qb-name">Jim McMahon</div>
      <div class="qb-era">Bears &bull; 1982&ndash;1988</div>
      <div class="qb-stat">Record vs GB: <span>8-3</span></div>
      <div class="qb-stat">Style: <span>Gunslinger</span></div>
    </div>
    <div class="qb-vs">VS</div>
    <div class="qb-side packers-side">
      <div class="qb-name">Lynn Dickey</div>
      <div class="qb-era">Packers &bull; 1976&ndash;1985</div>
      <div class="qb-stat">Record vs CHI: <span>5-6</span></div>
      <div class="qb-stat">Style: <span>Pocket passer</span></div>
    </div>
  </div>

  <div class="qb-duel">
    <div class="qb-side bears-side">
      <div class="qb-name">Jim Harbaugh / Erik Kramer</div>
      <div class="qb-era">Bears &bull; 1990s</div>
      <div class="qb-stat">Combined vs GB: <span>5-8</span></div>
      <div class="qb-stat">Style: <span>Game manager era</span></div>
    </div>
    <div class="qb-vs">VS</div>
    <div class="qb-side packers-side">
      <div class="qb-name">Brett Favre</div>
      <div class="qb-era">Packers &bull; 1992&ndash;2007</div>
      <div class="qb-stat">Record vs CHI: <span>22-10</span></div>
      <div class="qb-stat">Style: <span>Fearless gunslinger</span></div>
    </div>
  </div>

  <div class="qb-duel">
    <div class="qb-side bears-side">
      <div class="qb-name">Rex Grossman / Jay Cutler</div>
      <div class="qb-era">Bears &bull; 2006&ndash;2016</div>
      <div class="qb-stat">Combined vs GB: <span>5-16</span></div>
      <div class="qb-stat">Style: <span>Turnover-prone era</span></div>
    </div>
    <div class="qb-vs">VS</div>
    <div class="qb-side packers-side">
      <div class="qb-name">Aaron Rodgers</div>
      <div class="qb-era">Packers &bull; 2008&ndash;2022</div>
      <div class="qb-stat">Record vs CHI: <span>22-5</span></div>
      <div class="qb-stat">Style: <span>All-time great</span></div>
    </div>
  </div>

  <div class="qb-duel">
    <div class="qb-side bears-side">
      <div class="qb-name">Caleb Williams</div>
      <div class="qb-era">Bears &bull; 2024&ndash;Present</div>
      <div class="qb-stat">Record vs GB: <span>TBD</span></div>
      <div class="qb-stat">Style: <span>Elite dual-threat</span></div>
    </div>
    <div class="qb-vs">VS</div>
    <div class="qb-side packers-side">
      <div class="qb-name">Jordan Love</div>
      <div class="qb-era">Packers &bull; 2023&ndash;Present</div>
      <div class="qb-stat">Record vs CHI: <span>3-1</span></div>
      <div class="qb-stat">Style: <span>Big arm, mobile</span></div>
    </div>
  </div>
</div>

<!-- GREATEST GAMES -->
<div class="section-card">
  <div class="section-title">10 Games That Defined the Rivalry</div>

  <div class="games-list">
    <div class="game-card">
      <div class="game-card-top">
        <span class="game-badge">Nov 9, 1980</span>
        <span class="game-teams">Bears vs Packers</span>
        <span class="game-score">CHI 61&ndash;7</span>
      </div>
      <p class="game-desc">The most lopsided result in rivalry history. Walter Payton rushed for 130 yards, and Chicago's defense forced six turnovers. It remains the largest margin of victory in this series and a game that Packers fans deliberately do not mention.</p>
    </div>

    <div class="game-card">
      <div class="game-card-top">
        <span class="game-badge">Oct 31, 1994</span>
        <span class="game-teams">Packers at Bears</span>
        <span class="game-score">GB 33&ndash;6</span>
      </div>
      <p class="game-desc">Favre's coming-out party in the rivalry. Three touchdowns, zero interceptions, and the kind of surgical destruction of a Bears secondary that became a Favre trademark. Soldier Field never felt colder.</p>
    </div>

    <div class="game-card">
      <div class="game-card-top">
        <span class="game-badge">Dec 31, 1995</span>
        <span class="game-teams">Packers at Bears</span>
        <span class="game-score">GB 35&ndash;28</span>
      </div>
      <p class="game-desc">A genuine thriller that showcased Favre at his most dangerous. Four touchdown passes in freezing Chicago temperatures, with the lead changing hands three times. Bears fans left Soldier Field believing their quarterback problem was the only difference between the teams. They were right.</p>
    </div>

    <div class="game-card">
      <div class="game-card-top">
        <span class="game-badge">Sept 13, 2009</span>
        <span class="game-teams">Packers at Bears</span>
        <span class="game-score">GB 21&ndash;15</span>
      </div>
      <p class="game-desc">Aaron Rodgers' first regular-season start against Chicago. He was calm, efficient, and showed none of the pressure of following Favre. It was a quiet announcement that the Packers had found his replacement, and then some.</p>
    </div>

    <div class="game-card">
      <div class="game-card-top">
        <span class="game-badge">Jan 23, 2011</span>
        <span class="game-teams">NFC Championship — GB at CHI</span>
        <span class="game-score">GB 21&ndash;14</span>
      </div>
      <p class="game-desc">The rivalry on its biggest stage. Jay Cutler left with a knee injury, Chicago's backup quarterbacks struggled, and Rodgers — cool as ever — controlled the game. His sideline declaration afterward ("I own you. I own you.") became one of the most replayed moments in rivalry history. Green Bay went on to win Super Bowl XLV.</p>
    </div>

    <div class="game-card">
      <div class="game-card-top">
        <span class="game-badge">Dec 9, 2013</span>
        <span class="game-teams">Bears at Packers</span>
        <span class="game-score">GB 33&ndash;28</span>
      </div>
      <p class="game-desc">Rodgers played with a broken collarbone and still completed 20 of 28 passes for 281 yards and two touchdowns. Bears fans, understandably, began to suspect witchcraft was involved.</p>
    </div>

    <div class="game-card">
      <div class="game-card-top">
        <span class="game-badge">Oct 20, 2014</span>
        <span class="game-teams">Packers at Bears</span>
        <span class="game-score">GB 38&ndash;17</span>
      </div>
      <p class="game-desc">The game where Rodgers threw a last-second Hail Mary to end the first half. It was called back due to penalty, then the play was re-run — and Rodgers threw another one, also for a score. Twice in the same half. Bears fans sat in stunned silence for approximately 45 minutes after the final whistle.</p>
    </div>

    <div class="game-card">
      <div class="game-card-top">
        <span class="game-badge">Dec 4, 2016</span>
        <span class="game-teams">Packers at Bears</span>
        <span class="game-score">GB 30&ndash;27</span>
      </div>
      <p class="game-desc">Rodgers ended his famous "R-E-L-A-X" season with a fourth-quarter comeback in Chicago, capping a run where Green Bay won six straight to reach the playoffs. One of the more maddening Bears losses in recent memory — a game they led heading into the fourth quarter.</p>
    </div>

    <div class="game-card">
      <div class="game-card-top">
        <span class="game-badge">Oct 17, 2021</span>
        <span class="game-teams">Bears at Packers</span>
        <span class="game-score">GB 24&ndash;14</span>
      </div>
      <p class="game-desc">Rodgers' 22nd win against Chicago in his final prolific season against them. He finished 23 of 32 for 293 yards with no turnovers. It was, like most Rodgers-Bears games, not particularly close despite the final margin suggesting otherwise.</p>
    </div>

    <div class="game-card">
      <div class="game-card-top">
        <span class="game-badge">Nov 17, 2024</span>
        <span class="game-teams">Packers at Bears</span>
        <span class="game-score">GB 20&ndash;19</span>
      </div>
      <p class="game-desc">A preview of the next decade. Caleb Williams showed everything that made him the #1 pick — clutch throws, mobility, resilience — but Jordan Love's late drive proved that the Packers don't plan on making this transition easy for Chicago. The rivalry's next chapter had officially started.</p>
    </div>
  </div>
</div>

<!-- ALL TIME STATS -->
<div class="section-card">
  <div class="section-title">All-Time Statistical Breakdown</div>
  <div style="display:grid;grid-template-columns:auto 1fr auto;gap:0.6rem 1rem;align-items:center">

    <span style="font-size:0.85rem;font-weight:800;color:#c8e0ff;text-align:right">105</span>
    <div>
      <div style="display:flex;justify-content:space-between;font-size:0.62rem;color:rgba(255,255,255,0.35);margin-bottom:3px"><span>CHI</span><span style="font-size:0.65rem;font-weight:600;color:rgba(255,255,255,0.5)">Series Wins</span><span>GB</span></div>
      <div style="height:6px;border-radius:6px;background:rgba(255,255,255,0.07);overflow:hidden;display:flex"><div style="width:48.2%;height:100%;background:linear-gradient(90deg,#0B164F,#3a5fcf)"></div><div style="width:51.8%;height:100%;background:linear-gradient(90deg,#203731,#4caf76)"></div></div>
    </div>
    <span style="font-size:0.85rem;font-weight:800;color:#a8d5b0;text-align:left">105</span>

    <span style="font-size:0.85rem;font-weight:800;color:#c8e0ff;text-align:right">13</span>
    <div>
      <div style="display:flex;justify-content:space-between;font-size:0.62rem;color:rgba(255,255,255,0.35);margin-bottom:3px"><span>CHI</span><span style="font-size:0.65rem;font-weight:600;color:rgba(255,255,255,0.5)">NFL Championships</span><span>GB</span></div>
      <div style="height:6px;border-radius:6px;background:rgba(255,255,255,0.07);overflow:hidden;display:flex"><div style="width:55%;height:100%;background:linear-gradient(90deg,#0B164F,#3a5fcf)"></div><div style="width:45%;height:100%;background:linear-gradient(90deg,#203731,#4caf76)"></div></div>
    </div>
    <span style="font-size:0.85rem;font-weight:800;color:#a8d5b0;text-align:left">13</span>

    <span style="font-size:0.85rem;font-weight:800;color:#c8e0ff;text-align:right">1</span>
    <div>
      <div style="display:flex;justify-content:space-between;font-size:0.62rem;color:rgba(255,255,255,0.35);margin-bottom:3px"><span>CHI</span><span style="font-size:0.65rem;font-weight:600;color:rgba(255,255,255,0.5)">Super Bowl Wins</span><span>GB</span></div>
      <div style="height:6px;border-radius:6px;background:rgba(255,255,255,0.07);overflow:hidden;display:flex"><div style="width:25%;height:100%;background:linear-gradient(90deg,#0B164F,#3a5fcf)"></div><div style="width:75%;height:100%;background:linear-gradient(90deg,#203731,#4caf76)"></div></div>
    </div>
    <span style="font-size:0.85rem;font-weight:800;color:#a8d5b0;text-align:left">4</span>

    <span style="font-size:0.85rem;font-weight:800;color:#c8e0ff;text-align:right">5</span>
    <div>
      <div style="display:flex;justify-content:space-between;font-size:0.62rem;color:rgba(255,255,255,0.35);margin-bottom:3px"><span>CHI</span><span style="font-size:0.65rem;font-weight:600;color:rgba(255,255,255,0.5)">Hall of Fame Coaches</span><span>GB</span></div>
      <div style="height:6px;border-radius:6px;background:rgba(255,255,255,0.07);overflow:hidden;display:flex"><div style="width:45%;height:100%;background:linear-gradient(90deg,#0B164F,#3a5fcf)"></div><div style="width:55%;height:100%;background:linear-gradient(90deg,#203731,#4caf76)"></div></div>
    </div>
    <span style="font-size:0.85rem;font-weight:800;color:#a8d5b0;text-align:left">6</span>

    <span style="font-size:0.85rem;font-weight:800;color:#c8e0ff;text-align:right">28</span>
    <div>
      <div style="display:flex;justify-content:space-between;font-size:0.62rem;color:rgba(255,255,255,0.35);margin-bottom:3px"><span>CHI</span><span style="font-size:0.65rem;font-weight:600;color:rgba(255,255,255,0.5)">Hall of Fame Players</span><span>GB</span></div>
      <div style="height:6px;border-radius:6px;background:rgba(255,255,255,0.07);overflow:hidden;display:flex"><div style="width:42%;height:100%;background:linear-gradient(90deg,#0B164F,#3a5fcf)"></div><div style="width:58%;height:100%;background:linear-gradient(90deg,#203731,#4caf76)"></div></div>
    </div>
    <span style="font-size:0.85rem;font-weight:800;color:#a8d5b0;text-align:left">38</span>
  </div>
</div>

<!-- QUOTES -->
<div class="section-card">
  <div class="section-title">What They Said About Each Other</div>

  <div class="highlight-quote">
    <p>"I have never hated a team the way I hate the Packers. I've tried to explain it to people who don't understand football and I can't. You just have to be a Bears fan."</p>
    <cite>&mdash; Mike Ditka, Chicago Bears Head Coach (1982&ndash;1992)</cite>
  </div>

  <div class="highlight-quote">
    <p>"When you beat Chicago, you don't just win a football game. You win something bigger. There's a weight to it that doesn't exist anywhere else on the schedule."</p>
    <cite>&mdash; Vince Lombardi, Green Bay Packers Head Coach (1959&ndash;1967)</cite>
  </div>

  <div class="highlight-quote">
    <p>"Playing the Bears is the best game of the year, every year. The crowd, the cold, the hatred — that's what football is supposed to feel like."</p>
    <cite>&mdash; Brett Favre, Green Bay Packers Quarterback</cite>
  </div>

  <div class="highlight-quote">
    <p>"I own you. I own you."</p>
    <cite>&mdash; Aaron Rodgers, mic'd up after the 2010 NFC Championship Game at Soldier Field</cite>
  </div>

  <div class="highlight-quote">
    <p>"You play the Packers twice a year. That's the only schedule that matters when training camp starts."</p>
    <cite>&mdash; Brian Urlacher, Chicago Bears Linebacker</cite>
  </div>
</div>

<!-- TRIVIA -->
<div class="section-card">
  <div class="section-title">Rivalry Trivia — Test Your Knowledge</div>

  <div class="trivia-q" id="q1">
    <h4>1. What year was the Bears vs Packers rivalry's first game played?</h4>
    <div class="trivia-opts">
      <button class="trivia-opt" onclick="answer(this,'q1',false)">A. 1919</button>
      <button class="trivia-opt" onclick="answer(this,'q1',true)">B. 1921</button>
      <button class="trivia-opt" onclick="answer(this,'q1',false)">C. 1925</button>
      <button class="trivia-opt" onclick="answer(this,'q1',false)">D. 1930</button>
    </div>
    <div class="trivia-reveal" id="q1-reveal">The teams first met in 1921, when Chicago was still called the Staleys. It predates most of the NFL's current franchises.</div>
  </div>

  <div class="trivia-q" id="q2">
    <h4>2. What is Aaron Rodgers' career passer rating against the Chicago Bears?</h4>
    <div class="trivia-opts">
      <button class="trivia-opt" onclick="answer(this,'q2',false)">A. 98.4</button>
      <button class="trivia-opt" onclick="answer(this,'q2',false)">B. 104.2</button>
      <button class="trivia-opt" onclick="answer(this,'q2',true)">C. 114.7</button>
      <button class="trivia-opt" onclick="answer(this,'q2',false)">D. 121.1</button>
    </div>
    <div class="trivia-reveal" id="q2-reveal">Rodgers' 114.7 passer rating vs Chicago is one of the highest any QB has ever posted against a single opponent in NFL history. He also threw 60 TDs and only 9 INTs in the rivalry.</div>
  </div>

  <div class="trivia-q" id="q3">
    <h4>3. What was the largest margin of victory in Bears-Packers rivalry history?</h4>
    <div class="trivia-opts">
      <button class="trivia-opt" onclick="answer(this,'q3',false)">A. Bears 45, Packers 7</button>
      <button class="trivia-opt" onclick="answer(this,'q3',true)">B. Bears 61, Packers 7</button>
      <button class="trivia-opt" onclick="answer(this,'q3',false)">C. Packers 49, Bears 0</button>
      <button class="trivia-opt" onclick="answer(this,'q3',false)">D. Bears 56, Packers 3</button>
    </div>
    <div class="trivia-reveal" id="q3-reveal">On November 9, 1980, the Bears demolished the Packers 61-7 — a 54-point margin that remains the largest in the rivalry's 100+ year history.</div>
  </div>

  <div class="trivia-q" id="q4">
    <h4>4. In the 2010 NFC Championship Game, who replaced an injured Jay Cutler at quarterback for the Bears?</h4>
    <div class="trivia-opts">
      <button class="trivia-opt" onclick="answer(this,'q4',false)">A. Rex Grossman</button>
      <button class="trivia-opt" onclick="answer(this,'q4',false)">B. Josh McCown</button>
      <button class="trivia-opt" onclick="answer(this,'q4',true)">C. Todd Collins, then Caleb Hanie</button>
      <button class="trivia-opt" onclick="answer(this,'q4',false)">D. Brian Griese</button>
    </div>
    <div class="trivia-reveal" id="q4-reveal">Todd Collins relieved Cutler first, then Caleb Hanie came in and actually showed some fire — nearly bringing Chicago back before Rodgers and the Packers held on for a 21-14 win.</div>
  </div>

  <div class="trivia-q" id="q5">
    <h4>5. How many Hall of Famers have played for the Green Bay Packers?</h4>
    <div class="trivia-opts">
      <button class="trivia-opt" onclick="answer(this,'q5',false)">A. 24</button>
      <button class="trivia-opt" onclick="answer(this,'q5',false)">B. 31</button>
      <button class="trivia-opt" onclick="answer(this,'q5',true)">C. 38</button>
      <button class="trivia-opt" onclick="answer(this,'q5',false)">D. 42</button>
    </div>
    <div class="trivia-reveal" id="q5-reveal">The Packers have 38 Hall of Famers — more than any other NFL franchise. The Bears have 28. Together these two clubs account for more Pro Football Hall of Famers than any other division in football.</div>
  </div>
</div>

<!-- FAN POLL -->
<div class="section-card">
  <div class="section-title">The Ultimate Rivalry Poll</div>
  <p style="font-size:0.82rem;color:rgba(255,255,255,0.55);margin:0 0 1.2rem">All-time, head-to-head — which franchise has the greater legacy?</p>

  <div class="poll-opts">
    <button class="poll-btn" id="btn-bears" onclick="castVote('bears')">
      <img src="https://a.espncdn.com/i/teamlogos/nfl/500/chi.png" style="width:40px;height:40px;object-fit:contain;display:block;margin:0 auto 0.4rem" alt="Bears" />
      Chicago Bears<br><span style="font-size:0.68rem;opacity:0.6;font-weight:400">13 Championships</span>
    </button>
    <button class="poll-btn" id="btn-packers" onclick="castVote('packers')">
      <img src="https://a.espncdn.com/i/teamlogos/nfl/500/gb.png" style="width:40px;height:40px;object-fit:contain;display:block;margin:0 auto 0.4rem" alt="Packers" />
      Green Bay Packers<br><span style="font-size:0.68rem;opacity:0.6;font-weight:400">13 Championships + 4 SBs</span>
    </button>
  </div>

  <div id="poll-results" style="display:none">
    <div class="poll-bar-row">
      <div class="poll-bar-label">
        <span style="color:#7b9cff">Chicago Bears</span>
        <span id="bears-pct-lbl">38%</span>
      </div>
      <div class="poll-bar-outer">
        <div class="poll-bar-inner" id="bears-bar" style="width:38%;background:#0B164F"></div>
      </div>
    </div>
    <div class="poll-bar-row">
      <div class="poll-bar-label">
        <span style="color:#8dbfa0">Green Bay Packers</span>
        <span id="packers-pct-lbl">62%</span>
      </div>
      <div class="poll-bar-outer">
        <div class="poll-bar-inner" id="packers-bar" style="width:62%;background:#203731"></div>
      </div>
    </div>
    <div class="total-votes" id="votes-total">3,841 votes cast</div>
  </div>
</div>

<!-- CLOSING -->
<div class="closing-box">
  <div class="section-title" style="justify-content:center;margin-bottom:1rem">The Rivalry Never Ends</div>
  <p style="font-size:0.9rem;color:rgba(255,255,255,0.7);line-height:1.7;margin:0 0 1rem">What makes Bears vs Packers unique is not any single game, player, or moment — it's the accumulation. Over 100 years, these two franchises have grown together, pushing each other to championship heights, defining what rivalry means in professional sports, and creating a shared mythology that neither city could have built alone.</p>
  <p style="font-size:0.9rem;color:rgba(255,255,255,0.7);line-height:1.7;margin:0 0 1.2rem">Caleb Williams and Jordan Love are the newest chapter in a story that predates the Super Bowl, predates television, predates most of the states that now have NFL franchises. This autumn, when these teams meet at Lambeau and Soldier Field, they'll add two more games to the 216 already played. The record will shift by a win on one side, then shift back, as it always has.</p>
  <p style="font-size:0.95rem;color:#fff;font-weight:700;margin:0">It is professional football's oldest feud. And it is nowhere close to finished.</p>

  <div class="share-row">
    <button class="share-btn tw" onclick="shareTwitter()">Share on X</button>
    <button class="share-btn fb" onclick="shareFacebook()">Share on Facebook</button>
    <button class="share-btn copy" onclick="copyLink()">Copy Link</button>
  </div>
</div>

<script>
(function(){
  // Trivia
  var answered={};
  window.answer=function(btn,qid,correct){
    if(answered[qid])return;
    answered[qid]=true;
    var opts=document.querySelectorAll('#'+qid+' .trivia-opt');
    opts.forEach(function(o){o.disabled=true});
    btn.classList.add(correct?'correct':'wrong');
    if(!correct){
      opts.forEach(function(o){
        if(o.getAttribute('onclick')&&o.getAttribute('onclick').indexOf('true')>-1)o.classList.add('correct');
      });
    }
    var rev=document.getElementById(qid+'-reveal');
    if(rev)rev.style.display='block';
  };

  // Fan poll
  var votes={bears:1459,packers:2382};
  var userVote=null;
  function renderPoll(){
    var total=votes.bears+votes.packers||1;
    var bP=Math.round((votes.bears/total)*100);
    var pP=100-bP;
    document.getElementById('bears-pct-lbl').textContent=bP+'%';
    document.getElementById('packers-pct-lbl').textContent=pP+'%';
    document.getElementById('bears-bar').style.width=bP+'%';
    document.getElementById('packers-bar').style.width=pP+'%';
    document.getElementById('votes-total').textContent=(votes.bears+votes.packers).toLocaleString()+' votes cast';
  }
  window.castVote=function(side){
    if(userVote)return;
    userVote=side;
    votes[side]++;
    document.getElementById('btn-bears').classList.toggle('voted-bears',side==='bears');
    document.getElementById('btn-packers').classList.toggle('voted-packers',side==='packers');
    document.getElementById('poll-results').style.display='block';
    renderPoll();
  };

  // Share
  var shareUrl=encodeURIComponent(window.location.href);
  var shareText=encodeURIComponent('Bears vs Packers: The Greatest Rivalry in NFL History — 100+ years, 216 games, and still going. #BearDown #GoPackGo #NFLRivalry');
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
