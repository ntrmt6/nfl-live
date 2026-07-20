import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const TEAMS: Record<string, { name: string; color: string; colorTo: string }> = {
  ARI: { name: "Arizona Cardinals",     color: "#97233F", colorTo: "#000000" },
  ATL: { name: "Atlanta Falcons",        color: "#A71930", colorTo: "#000000" },
  BAL: { name: "Baltimore Ravens",       color: "#241773", colorTo: "#9E7C0C" },
  BUF: { name: "Buffalo Bills",          color: "#00338D", colorTo: "#C60C30" },
  CAR: { name: "Carolina Panthers",      color: "#0085CA", colorTo: "#101820" },
  CHI: { name: "Chicago Bears",          color: "#0B162A", colorTo: "#C83803" },
  CIN: { name: "Cincinnati Bengals",     color: "#FB4F14", colorTo: "#000000" },
  CLE: { name: "Cleveland Browns",       color: "#311D00", colorTo: "#FF3C00" },
  DAL: { name: "Dallas Cowboys",         color: "#041E42", colorTo: "#869397" },
  DEN: { name: "Denver Broncos",         color: "#FB4F14", colorTo: "#002244" },
  DET: { name: "Detroit Lions",          color: "#0076B6", colorTo: "#B0B7BC" },
  GB:  { name: "Green Bay Packers",      color: "#203731", colorTo: "#FFB612" },
  HOU: { name: "Houston Texans",         color: "#03202F", colorTo: "#A71930" },
  IND: { name: "Indianapolis Colts",     color: "#002C5F", colorTo: "#A2AAAD" },
  JAX: { name: "Jacksonville Jaguars",   color: "#101820", colorTo: "#D7A22A" },
  KC:  { name: "Kansas City Chiefs",     color: "#E31837", colorTo: "#FFB81C" },
  LV:  { name: "Las Vegas Raiders",      color: "#000000", colorTo: "#A5ACAF" },
  LAC: { name: "Los Angeles Chargers",   color: "#0080C6", colorTo: "#FFC20E" },
  LAR: { name: "Los Angeles Rams",       color: "#003594", colorTo: "#FFA300" },
  MIA: { name: "Miami Dolphins",         color: "#008E97", colorTo: "#FC4C02" },
  MIN: { name: "Minnesota Vikings",      color: "#4F2683", colorTo: "#FFC62F" },
  NE:  { name: "New England Patriots",   color: "#002244", colorTo: "#C60C30" },
  NO:  { name: "New Orleans Saints",     color: "#D3BC8D", colorTo: "#101820" },
  NYG: { name: "New York Giants",        color: "#0B2265", colorTo: "#A71930" },
  NYJ: { name: "New York Jets",          color: "#125740", colorTo: "#000000" },
  PHI: { name: "Philadelphia Eagles",    color: "#004C54", colorTo: "#A5ACAF" },
  PIT: { name: "Pittsburgh Steelers",    color: "#FFB612", colorTo: "#101820" },
  SF:  { name: "San Francisco 49ers",    color: "#AA0000", colorTo: "#B3995D" },
  SEA: { name: "Seattle Seahawks",       color: "#002244", colorTo: "#69BE28" },
  TB:  { name: "Tampa Bay Buccaneers",   color: "#D50A0A", colorTo: "#34302B" },
  TEN: { name: "Tennessee Titans",       color: "#0C2340", colorTo: "#4B92DB" },
  WAS: { name: "Washington Commanders",  color: "#5A1414", colorTo: "#FFB612" },
};

function espnLogo(abbr: string) {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr.toLowerCase()}.png`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const away     = (searchParams.get("away") || "NFL").toUpperCase();
  const home     = (searchParams.get("home") || "NFL").toUpperCase();
  const awayFull = searchParams.get("awayFull") || away;
  const homeFull = searchParams.get("homeFull") || home;
  const awayProb = parseFloat(searchParams.get("awayProb") || "50");
  const homeProb = parseFloat(searchParams.get("homeProb") || "50");
  const winner   = (searchParams.get("winner") || "").toUpperCase();
  const conf     = parseFloat(searchParams.get("confidence") || "0");
  const week     = searchParams.get("week") || "1";
  const awayPPG  = searchParams.get("awayPPG") || "—";
  const homePPG  = searchParams.get("homePPG") || "—";
  const awayDef  = searchParams.get("awayDef") || "—";
  const homeDef  = searchParams.get("homeDef") || "—";
  const awayWR   = searchParams.get("awayWR")  || "—";
  const homeWR   = searchParams.get("homeWR")  || "—";

  const [awayBuf, homeBuf] = await Promise.all([
    fetch(espnLogo(away)).then(r => r.ok ? r.arrayBuffer() : null).catch(() => null),
    fetch(espnLogo(home)).then(r => r.ok ? r.arrayBuffer() : null).catch(() => null),
  ]);

  const awayLogo = awayBuf ? `data:image/png;base64,${Buffer.from(awayBuf).toString("base64")}` : null;
  const homeLogo = homeBuf ? `data:image/png;base64,${Buffer.from(homeBuf).toString("base64")}` : null;

  const winnerFull  = winner === away ? awayFull : homeFull;
  const awayColor   = TEAMS[away]?.color  || "#00A8FF";
  const awayColorTo = TEAMS[away]?.colorTo || "#0060C0";
  const homeColor   = TEAMS[home]?.color  || "#FF6200";
  const homeColorTo = TEAMS[home]?.colorTo || "#CC4000";

  return new ImageResponse(
    (
      <div style={{
        width: 1080, height: 1080,
        background: "#0d1117",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Ambient glow top-left (away) */}
        <div style={{
          position: "absolute", top: -120, left: -120,
          width: 400, height: 400,
          borderRadius: "50%",
          background: awayColor,
          opacity: 0.12,
          filter: "blur(80px)",
          display: "flex",
        }} />
        {/* Ambient glow top-right (home) */}
        <div style={{
          position: "absolute", top: -120, right: -120,
          width: 400, height: 400,
          borderRadius: "50%",
          background: homeColor,
          opacity: 0.12,
          filter: "blur(80px)",
          display: "flex",
        }} />

        {/* ── Header ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "32px 56px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ display: "flex", fontSize: "32px" }}>🏈</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ color: "#FF6200", fontSize: "18px", fontWeight: 800, letterSpacing: "3px" }}>
                NFL PREDICTIONS HUB
              </span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", letterSpacing: "2px" }}>
                AI-POWERED MACHINE LEARNING MODEL
              </span>
            </div>
          </div>
          <div style={{
            display: "flex",
            background: "rgba(255,98,0,0.12)",
            border: "1px solid rgba(255,98,0,0.35)",
            borderRadius: "8px",
            padding: "10px 24px",
            color: "#FF6200",
            fontSize: "15px",
            fontWeight: 800,
            letterSpacing: "4px",
          }}>
            WEEK {week}
          </div>
        </div>

        {/* ── Teams ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "36px 56px 24px",
        }}>
          {/* Away */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", flex: 1 }}>
            {awayLogo
              ? <img src={awayLogo} width={148} height={148} style={{ objectFit: "contain", filter: "drop-shadow(0 6px 24px rgba(0,0,0,0.8))" }} />
              : <div style={{ width: 148, height: 148, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "56px", fontWeight: 900, color: "white" }}>{away}</div>
            }
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <span style={{ color: "white", fontSize: "20px", fontWeight: 700, textAlign: "center", maxWidth: "200px" }}>{awayFull}</span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", fontWeight: 600, letterSpacing: "4px" }}>AWAY</span>
            </div>
          </div>

          {/* VS */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "100px" }}>
            <span style={{ color: "rgba(255,255,255,0.12)", fontSize: "58px", fontWeight: 900, letterSpacing: "4px", lineHeight: 1 }}>VS</span>
          </div>

          {/* Home */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", flex: 1 }}>
            {homeLogo
              ? <img src={homeLogo} width={148} height={148} style={{ objectFit: "contain", filter: "drop-shadow(0 6px 24px rgba(0,0,0,0.8))" }} />
              : <div style={{ width: 148, height: 148, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "56px", fontWeight: 900, color: "white" }}>{home}</div>
            }
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <span style={{ color: "white", fontSize: "20px", fontWeight: 700, textAlign: "center", maxWidth: "200px" }}>{homeFull}</span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", fontWeight: 600, letterSpacing: "4px" }}>HOME</span>
            </div>
          </div>
        </div>

        {/* ── Win Probability Bar ── */}
        <div style={{ padding: "0 56px 28px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "3px", fontWeight: 700 }}>WIN PROBABILITY</span>
          </div>
          <div style={{ display: "flex", height: "38px", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{
              width: `${awayProb}%`,
              background: `linear-gradient(90deg, ${awayColor} 0%, ${awayColorTo || awayColor} 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "10px 0 0 10px",
            }}>
              <span style={{ color: "white", fontSize: "16px", fontWeight: 900, textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
                {awayProb.toFixed(0)}%
              </span>
            </div>
            <div style={{ width: "2px", background: "#0d1117", display: "flex" }} />
            <div style={{
              flex: 1,
              background: `linear-gradient(90deg, ${homeColorTo || homeColor} 0%, ${homeColor} 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "0 10px 10px 0",
            }}>
              <span style={{ color: "white", fontSize: "16px", fontWeight: 900, textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
                {homeProb.toFixed(0)}%
              </span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>{awayFull}</span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>{homeFull}</span>
          </div>
        </div>

        {/* ── Model Pick Banner ── */}
        <div style={{
          margin: "0 56px 28px",
          padding: "22px 32px",
          background: "linear-gradient(135deg, rgba(255,98,0,0.1) 0%, rgba(255,140,0,0.06) 100%)",
          border: "1px solid rgba(255,98,0,0.28)",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}>
          <span style={{ fontSize: "40px", lineHeight: 1 }}>🏆</span>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "3px" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "3px", fontWeight: 700 }}>MODEL PICK</span>
            <span style={{ color: "white", fontSize: "28px", fontWeight: 900, letterSpacing: "0.5px" }}>{winnerFull}</span>
          </div>
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            background: "rgba(255,98,0,0.15)",
            border: "1px solid rgba(255,98,0,0.35)",
            borderRadius: "10px",
            padding: "12px 24px",
            gap: "2px",
          }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", letterSpacing: "2px", fontWeight: 700 }}>CONFIDENCE</span>
            <span style={{ color: "#FF6200", fontSize: "34px", fontWeight: 900, lineHeight: 1 }}>{conf.toFixed(0)}%</span>
          </div>
        </div>

        {/* ── Key Stats ── */}
        <div style={{ margin: "0 56px 32px", display: "flex", gap: "12px" }}>
          {[
            { label: "OFF PPG", away: awayPPG, home: homePPG, icon: "⚡" },
            { label: "DEF PPG", away: awayDef, home: homeDef, icon: "🛡️" },
            { label: "WIN RATE", away: awayWR !== "—" ? awayWR + "%" : "—", home: homeWR !== "—" ? homeWR + "%" : "—", icon: "📊" },
          ].map((stat, i) => (
            <div key={i} style={{
              flex: 1,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px",
              padding: "18px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "14px" }}>{stat.icon}</span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", letterSpacing: "2px", fontWeight: 700 }}>{stat.label}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                  <span style={{ color: "#60A5FA", fontSize: "22px", fontWeight: 900 }}>{stat.away}</span>
                  <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px", letterSpacing: "2px" }}>AWAY</span>
                </div>
                <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "13px" }}>vs</span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                  <span style={{ color: "#FF6200", fontSize: "22px", fontWeight: 900 }}>{stat.home}</span>
                  <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px", letterSpacing: "2px" }}>HOME</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <div style={{
          marginTop: "auto",
          padding: "18px 56px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ color: "#FF6200", fontSize: "14px", fontWeight: 700, letterSpacing: "2px", opacity: 0.7 }}>
            NFLPREDICTS.COM
          </span>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", letterSpacing: "1px" }}>
            Powered by XGBoost ML · For entertainment purposes
          </span>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 }
  );
}
