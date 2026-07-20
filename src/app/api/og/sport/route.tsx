import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const awayFull    = searchParams.get("awayFull")  || "Away Team";
  const homeFull    = searchParams.get("homeFull")  || "Home Team";
  const awayAbbr    = searchParams.get("away")      || "AWY";
  const homeAbbr    = searchParams.get("home")      || "HME";
  const awayProb    = parseFloat(searchParams.get("awayProb")  || "50");
  const homeProb    = parseFloat(searchParams.get("homeProb")  || "50");
  const drawProb    = parseFloat(searchParams.get("drawProb")  || "0");
  const winner      = searchParams.get("winner")    || homeFull;
  const conf        = parseFloat(searchParams.get("confidence") || "0");
  const league      = searchParams.get("league")    || "SPORT";
  const awayLogoUrl = searchParams.get("awayLogo")  || "";
  const homeLogoUrl = searchParams.get("homeLogo")  || "";
  const awayColor   = `#${(searchParams.get("awayColor") || "00A8FF").replace("#", "")}`;
  const homeColor   = `#${(searchParams.get("homeColor") || "FF6200").replace("#", "")}`;
  const isDraw      = winner === "DRAW";
  const outcome     = isDraw ? "DRAW PREDICTED" : winner;

  const [awayBuf, homeBuf] = await Promise.all([
    awayLogoUrl ? fetch(awayLogoUrl).then(r => r.ok ? r.arrayBuffer() : null).catch(() => null) : Promise.resolve(null),
    homeLogoUrl ? fetch(homeLogoUrl).then(r => r.ok ? r.arrayBuffer() : null).catch(() => null) : Promise.resolve(null),
  ]);

  const awayLogo = awayBuf ? `data:image/png;base64,${Buffer.from(awayBuf).toString("base64")}` : null;
  const homeLogo = homeBuf ? `data:image/png;base64,${Buffer.from(homeBuf).toString("base64")}` : null;

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
        {/* Ambient glow away */}
        <div style={{
          position: "absolute", top: -100, left: -100,
          width: 400, height: 400, borderRadius: "50%",
          background: awayColor, opacity: 0.12, filter: "blur(80px)", display: "flex",
        }} />
        {/* Ambient glow home */}
        <div style={{
          position: "absolute", top: -100, right: -100,
          width: 400, height: 400, borderRadius: "50%",
          background: homeColor, opacity: 0.12, filter: "blur(80px)", display: "flex",
        }} />

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "32px 56px", borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <span style={{ color: "#FF6200", fontSize: "18px", fontWeight: 800, letterSpacing: "3px" }}>
              PREDICTIONS HUB
            </span>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", letterSpacing: "2px" }}>
              AI-POWERED MACHINE LEARNING MODEL
            </span>
          </div>
          <div style={{
            display: "flex", background: "rgba(255,98,0,0.12)",
            border: "1px solid rgba(255,98,0,0.35)", borderRadius: "8px",
            padding: "10px 24px", color: "#FF6200", fontSize: "15px", fontWeight: 800, letterSpacing: "4px",
          }}>
            {league.toUpperCase()}
          </div>
        </div>

        {/* Teams */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "40px 56px 24px",
        }}>
          {/* Away */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", flex: 1 }}>
            {awayLogo
              ? <img src={awayLogo} width={148} height={148} style={{ objectFit: "contain", filter: "drop-shadow(0 6px 24px rgba(0,0,0,0.8))" }} />
              : <div style={{ width: 148, height: 148, borderRadius: "50%", background: awayColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "52px", fontWeight: 900, color: "white" }}>{awayAbbr.slice(0, 3)}</div>
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
              : <div style={{ width: 148, height: 148, borderRadius: "50%", background: homeColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "52px", fontWeight: 900, color: "white" }}>{homeAbbr.slice(0, 3)}</div>
            }
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <span style={{ color: "white", fontSize: "20px", fontWeight: 700, textAlign: "center", maxWidth: "200px" }}>{homeFull}</span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", fontWeight: 600, letterSpacing: "4px" }}>HOME</span>
            </div>
          </div>
        </div>

        {/* Win probability bar */}
        <div style={{ padding: "0 56px 28px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "3px", fontWeight: 700 }}>
            {drawProb > 0 ? "WIN / DRAW PROBABILITY" : "WIN PROBABILITY"}
          </span>
          <div style={{ display: "flex", height: "38px", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{
              width: `${awayProb}%`, background: `linear-gradient(90deg, ${awayColor}, ${awayColor}cc)`,
              display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "10px 0 0 10px",
            }}>
              <span style={{ color: "white", fontSize: "16px", fontWeight: 900, textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>{awayProb}%</span>
            </div>
            {drawProb > 0 && (
              <div style={{
                width: `${drawProb}%`, background: "linear-gradient(90deg, #555, #777)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "white", fontSize: "13px", fontWeight: 800 }}>{drawProb}%</span>
              </div>
            )}
            <div style={{ width: "2px", background: "#0d1117", display: "flex" }} />
            <div style={{
              flex: 1, background: `linear-gradient(90deg, ${homeColor}cc, ${homeColor})`,
              display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0 10px 10px 0",
            }}>
              <span style={{ color: "white", fontSize: "16px", fontWeight: 900, textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>{homeProb}%</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>{awayFull}</span>
            {drawProb > 0 && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>DRAW</span>}
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>{homeFull}</span>
          </div>
        </div>

        {/* Model Pick Banner */}
        <div style={{
          margin: "0 56px 28px", padding: "22px 32px",
          background: "linear-gradient(135deg, rgba(255,98,0,0.1) 0%, rgba(255,140,0,0.06) 100%)",
          border: "1px solid rgba(255,98,0,0.28)", borderRadius: "14px",
          display: "flex", alignItems: "center", gap: "20px",
        }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "3px" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "3px", fontWeight: 700 }}>MODEL PREDICTION</span>
            <span style={{ color: "white", fontSize: "28px", fontWeight: 900, letterSpacing: "0.5px" }}>{outcome}</span>
          </div>
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            background: "rgba(255,98,0,0.15)", border: "1px solid rgba(255,98,0,0.35)",
            borderRadius: "10px", padding: "12px 24px", gap: "2px",
          }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", letterSpacing: "2px", fontWeight: 700 }}>CONFIDENCE</span>
            <span style={{ color: "#FF6200", fontSize: "34px", fontWeight: 900, lineHeight: 1 }}>{conf.toFixed(0)}%</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: "auto", padding: "18px 56px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
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
