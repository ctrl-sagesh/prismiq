import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Prismiq: Summarize YouTube, PDFs and Websites Instantly";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#07070f",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow blobs */}
        <div style={{
          position: "absolute", top: "-100px", left: "-100px",
          width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "-80px", right: "-80px",
          width: "450px", height: "450px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%)",
        }} />

        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", gap: "14px", marginBottom: "32px",
        }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px",
            background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 40px rgba(139,92,246,0.5)",
          }}>
            <div style={{ color: "white", fontSize: "30px", fontWeight: "bold" }}>P</div>
          </div>
          <span style={{ color: "white", fontSize: "38px", fontWeight: "800", letterSpacing: "-1px" }}>
            Prismiq
          </span>
        </div>

        {/* Headline */}
        <div style={{
          fontSize: "62px", fontWeight: "800", textAlign: "center",
          lineHeight: 1.1, marginBottom: "20px", letterSpacing: "-2px",
          color: "white",
        }}>
          Stop scrolling.{" "}
          <span style={{
            background: "linear-gradient(to right, #a78bfa, #f472b6)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}>
            Just understand.
          </span>
        </div>

        {/* Subtext */}
        <div style={{
          fontSize: "24px", color: "rgba(255,255,255,0.5)", textAlign: "center",
          maxWidth: "700px", lineHeight: 1.5,
        }}>
          Summarize any YouTube video, PDF, website or image in seconds.
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: "12px", marginTop: "36px" }}>
          {["🎬 YouTube", "📄 PDF", "🌐 Website", "🖼️ Image"].map((label) => (
            <div key={label} style={{
              padding: "8px 18px", borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.5)", fontSize: "16px",
            }}>
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
