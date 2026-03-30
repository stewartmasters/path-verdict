import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "PathVerdict — Am I saving enough?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#111827",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 90px",
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Left accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "10px",
            background: "#0d9488",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(13,148,136,0.15)",
            border: "1px solid rgba(13,148,136,0.3)",
            borderRadius: "100px",
            padding: "8px 20px",
            marginBottom: "40px",
          }}
        >
          <span style={{ color: "#0d9488", fontSize: "18px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Free · No signup · Instant result
          </span>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", marginBottom: "32px" }}>
          <span
            style={{
              color: "#ffffff",
              fontSize: "80px",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            am i saving
          </span>
          <span
            style={{
              color: "#ffffff",
              fontSize: "80px",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            enough<span style={{ color: "#0d9488" }}>?</span>
          </span>
        </div>

        {/* Subheading */}
        <div
          style={{
            color: "#9ca3af",
            fontSize: "28px",
            lineHeight: 1.4,
            maxWidth: "700px",
            marginBottom: "56px",
          }}
        >
          See your savings rate vs. your income-level benchmark. Get your financial identity in 60 seconds.
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "48px" }}>
          {[
            { value: "11", label: "Countries" },
            { value: "7",  label: "Financial identities" },
            { value: "6",  label: "Verdict tiers" },
          ].map(({ value, label }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ color: "#ffffff", fontSize: "40px", fontWeight: 800, lineHeight: 1 }}>{value}</span>
              <span style={{ color: "#6b7280", fontSize: "18px", marginTop: "6px" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Bottom right URL */}
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            right: "90px",
            color: "#4b5563",
            fontSize: "20px",
            letterSpacing: "0.02em",
          }}
        >
          pathverdict.com
        </div>
      </div>
    ),
    { ...size }
  );
}
