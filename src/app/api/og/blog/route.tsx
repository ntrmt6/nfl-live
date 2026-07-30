import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title   = searchParams.get("title")   || "NFL Blog";
  const excerpt = searchParams.get("excerpt") || "";
  const tags    = (searchParams.get("tags")   || "").split(",").filter(Boolean).slice(0, 4);

  const truncatedTitle   = title.length > 80   ? title.slice(0, 79) + "…"   : title;
  const truncatedExcerpt = excerpt.length > 130 ? excerpt.slice(0, 129) + "…" : excerpt;

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
        {/* Ambient glow top-left */}
        <div style={{
          position: "absolute", top: -120, left: -120,
          width: 500, height: 500, borderRadius: "50%",
          background: "#FF6200", opacity: 0.09, filter: "blur(100px)", display: "flex",
        }} />
        {/* Ambient glow bottom-right */}
        <div style={{
          position: "absolute", bottom: -120, right: -120,
          width: 400, height: 400, borderRadius: "50%",
          background: "#00A8FF", opacity: 0.07, filter: "blur(90px)", display: "flex",
        }} />

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "36px 60px", borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ color: "#FF6200", fontSize: "20px", fontWeight: 800, letterSpacing: "3px" }}>
              NFLPREDICTS.COM
            </span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", letterSpacing: "2px" }}>
              AI-POWERED FOOTBALL ANALYTICS
            </span>
          </div>
          <div style={{
            display: "flex",
            background: "rgba(255,98,0,0.12)",
            border: "1px solid rgba(255,98,0,0.35)",
            borderRadius: "8px",
            padding: "10px 24px",
            color: "#FF6200",
            fontSize: "13px",
            fontWeight: 800,
            letterSpacing: "3px",
          }}>
            NFL BLOG
          </div>
        </div>

        {/* Main content */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "60px 60px 40px",
          justifyContent: "center",
          gap: "32px",
        }}>
          {/* Title */}
          <div style={{
            display: "flex",
            color: "white",
            fontSize: truncatedTitle.length > 50 ? "46px" : "56px",
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-0.5px",
          }}>
            {truncatedTitle}
          </div>

          {/* Divider */}
          <div style={{
            display: "flex",
            width: "80px",
            height: "4px",
            background: "linear-gradient(90deg, #FF6200, #FF6200aa)",
            borderRadius: "2px",
          }} />

          {/* Excerpt */}
          {truncatedExcerpt && (
            <div style={{
              display: "flex",
              color: "rgba(255,255,255,0.55)",
              fontSize: "22px",
              lineHeight: 1.6,
              fontWeight: 400,
            }}>
              {truncatedExcerpt}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {tags.map((tag) => (
                <div key={tag} style={{
                  display: "flex",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "100px",
                  padding: "8px 20px",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "14px",
                  fontWeight: 600,
                  letterSpacing: "1px",
                }}>
                  #{tag}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "22px 60px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ color: "rgba(255,98,0,0.6)", fontSize: "14px", fontWeight: 700, letterSpacing: "2px" }}>
            READ THE FULL ARTICLE
          </span>
          <span style={{ color: "rgba(255,255,255,0.18)", fontSize: "12px", letterSpacing: "1px" }}>
            nflpredicts.com/blog
          </span>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 }
  );
}
