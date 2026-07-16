import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const TEAMS: Record<string, { name: string; color: string; colorTo: string }> = {
  ARI: { name: "Arizona Cardinals",        color: "#97233F", colorTo: "#000000" },
  ATL: { name: "Atlanta Falcons",           color: "#A71930", colorTo: "#000000" },
  BAL: { name: "Baltimore Ravens",          color: "#241773", colorTo: "#9E7C0C" },
  BUF: { name: "Buffalo Bills",             color: "#00338D", colorTo: "#C60C30" },
  CAR: { name: "Carolina Panthers",         color: "#0085CA", colorTo: "#101820" },
  CHI: { name: "Chicago Bears",             color: "#0B162A", colorTo: "#C83803" },
  CIN: { name: "Cincinnati Bengals",        color: "#FB4F14", colorTo: "#000000" },
  CLE: { name: "Cleveland Browns",          color: "#311D00", colorTo: "#FF3C00" },
  DAL: { name: "Dallas Cowboys",            color: "#041E42", colorTo: "#869397" },
  DEN: { name: "Denver Broncos",            color: "#FB4F14", colorTo: "#002244" },
  DET: { name: "Detroit Lions",             color: "#0076B6", colorTo: "#B0B7BC" },
  GB:  { name: "Green Bay Packers",         color: "#203731", colorTo: "#FFB612" },
  HOU: { name: "Houston Texans",            color: "#03202F", colorTo: "#A71930" },
  IND: { name: "Indianapolis Colts",        color: "#002C5F", colorTo: "#A2AAAD" },
  JAX: { name: "Jacksonville Jaguars",      color: "#101820", colorTo: "#D7A22A" },
  KC:  { name: "Kansas City Chiefs",        color: "#E31837", colorTo: "#FFB81C" },
  LV:  { name: "Las Vegas Raiders",         color: "#000000", colorTo: "#A5ACAF" },
  LAC: { name: "Los Angeles Chargers",      color: "#0080C6", colorTo: "#FFC20E" },
  LAR: { name: "Los Angeles Rams",          color: "#003594", colorTo: "#FFA300" },
  MIA: { name: "Miami Dolphins",            color: "#008E97", colorTo: "#FC4C02" },
  MIN: { name: "Minnesota Vikings",         color: "#4F2683", colorTo: "#FFC62F" },
  NE:  { name: "New England Patriots",      color: "#002244", colorTo: "#C60C30" },
  NO:  { name: "New Orleans Saints",        color: "#D3BC8D", colorTo: "#101820" },
  NYG: { name: "New York Giants",           color: "#0B2265", colorTo: "#A71930" },
  NYJ: { name: "New York Jets",             color: "#125740", colorTo: "#000000" },
  PHI: { name: "Philadelphia Eagles",       color: "#004C54", colorTo: "#A5ACAF" },
  PIT: { name: "Pittsburgh Steelers",       color: "#FFB612", colorTo: "#101820" },
  SF:  { name: "San Francisco 49ers",       color: "#AA0000", colorTo: "#B3995D" },
  SEA: { name: "Seattle Seahawks",          color: "#002244", colorTo: "#69BE28" },
  TB:  { name: "Tampa Bay Buccaneers",      color: "#D50A0A", colorTo: "#34302B" },
  TEN: { name: "Tennessee Titans",          color: "#0C2340", colorTo: "#4B92DB" },
  WAS: { name: "Washington Commanders",     color: "#5A1414", colorTo: "#FFB612" },
};

function espnLogo(abbr: string) {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr.toLowerCase()}.png`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const away = (searchParams.get("away") || "NFL").toUpperCase();
  const home = (searchParams.get("home") || "NFL").toUpperCase();
  const week = searchParams.get("week") || "1";

  const awayTeam = TEAMS[away] || { name: away, color: "#1a1a2e", colorTo: "#16213e" };
  const homeTeam = TEAMS[home] || { name: home, color: "#0f3460", colorTo: "#533483" };

  const [awayBuf, homeBuf] = await Promise.all([
    fetch(espnLogo(away)).then((r) => r.ok ? r.arrayBuffer() : null).catch(() => null),
    fetch(espnLogo(home)).then((r) => r.ok ? r.arrayBuffer() : null).catch(() => null),
  ]);

  const awayLogo = awayBuf ? `data:image/png;base64,${Buffer.from(awayBuf).toString("base64")}` : null;
  const homeLogo = homeBuf ? `data:image/png;base64,${Buffer.from(homeBuf).toString("base64")}` : null;

  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 675, display: "flex", position: "relative", overflow: "hidden", fontFamily: "sans-serif" }}>

        {/* Split background */}
        <div style={{ position: "absolute", inset: "0", display: "flex" }}>
          <div style={{ flex: 1, background: `linear-gradient(135deg, ${awayTeam.color} 0%, ${awayTeam.colorTo} 100%)` }} />
          <div style={{ flex: 1, background: `linear-gradient(225deg, ${homeTeam.color} 0%, ${homeTeam.colorTo} 100%)` }} />
        </div>

        {/* Dark vignette overlay */}
        <div style={{ position: "absolute", inset: "0", background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)", display: "flex" }} />

        {/* Center divider */}
        <div style={{ position: "absolute", left: "598px", top: "0", bottom: "0", width: "4px", background: "rgba(255,255,255,0.2)", display: "flex" }} />

        {/* Main content */}
        <div style={{ position: "absolute", inset: "0", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "0 56px 48px 56px" }}>

          {/* Away team */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", flex: 1 }}>
            {awayLogo
              ? <img src={awayLogo} width={190} height={190} style={{ objectFit: "contain", filter: "drop-shadow(0 6px 24px rgba(0,0,0,0.7))" }} />
              : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "190px", height: "190px", fontSize: "72px", fontWeight: 900, color: "white", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>{away}</div>
            }
            <div style={{ display: "flex", color: "white", fontSize: "24px", fontWeight: 700, textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.9)", letterSpacing: "0.5px" }}>{awayTeam.name}</div>
            <div style={{ display: "flex", color: "rgba(255,255,255,0.65)", fontSize: "14px", fontWeight: 600, letterSpacing: "4px" }}>AWAY</div>
          </div>

          {/* VS center */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", minWidth: "160px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.13)", border: "2px solid rgba(255,255,255,0.28)", borderRadius: "8px", padding: "5px 18px", color: "rgba(255,255,255,0.9)", fontSize: "13px", fontWeight: 700, letterSpacing: "4px" }}>
              {"WEEK " + week}
            </div>
            <div style={{ display: "flex", color: "white", fontSize: "60px", fontWeight: 900, letterSpacing: "3px", textShadow: "0 2px 20px rgba(0,0,0,0.8)", lineHeight: "1" }}>VS</div>
            <div style={{ display: "flex", color: "rgba(255,255,255,0.45)", fontSize: "13px", fontWeight: 500, letterSpacing: "3px" }}>NFL 2026</div>
          </div>

          {/* Home team */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", flex: 1 }}>
            {homeLogo
              ? <img src={homeLogo} width={190} height={190} style={{ objectFit: "contain", filter: "drop-shadow(0 6px 24px rgba(0,0,0,0.7))" }} />
              : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "190px", height: "190px", fontSize: "72px", fontWeight: 900, color: "white", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>{home}</div>
            }
            <div style={{ display: "flex", color: "white", fontSize: "24px", fontWeight: 700, textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.9)", letterSpacing: "0.5px" }}>{homeTeam.name}</div>
            <div style={{ display: "flex", color: "rgba(255,255,255,0.65)", fontSize: "14px", fontWeight: 600, letterSpacing: "4px" }}>HOME</div>
          </div>

        </div>

        {/* Bottom bar */}
        <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", height: "48px", background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", color: "rgba(255,255,255,0.45)", fontSize: "13px", fontWeight: 600, letterSpacing: "4px" }}>HDNFLTV.COM  ·  2026 NFL SEASON PREVIEW</div>
        </div>

      </div>
    ),
    { width: 1200, height: 675 }
  );
}
