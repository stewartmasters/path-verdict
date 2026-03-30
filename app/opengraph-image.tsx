import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Am I Underpaid? — Free Salary Checker";
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
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #f97316, #ea580c)",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(249,115,22,0.15)",
            border: "1px solid rgba(249,115,22,0.3)",
            borderRadius: "100px",
            padding: "8px 20px",
            marginBottom: "32px",
          }}
        >
          <span style={{ color: "#f97316", fontSize: "18px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Free · No signup · Instant result
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "40px",
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontSize: "80px",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            am i underpaid
            <span style={{ color: "#f97316" }}>?</span>
          </span>
        </div>

        {/* Subheading */}
        <div
          style={{
            color: "#9ca3af",
            fontSize: "28px",
            lineHeight: 1.4,
            maxWidth: "680px",
            marginBottom: "56px",
          }}
        >
          Check your salary against the market. See your percentile. Find out in 30 seconds.
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "48px" }}>
          {[
            { value: "6", label: "Role categories" },
            { value: "12", label: "Locations" },
            { value: "90+", label: "Salary guides" },
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
          salaryverdict.com
        </div>
      </div>
    ),
    { ...size }
  );
}
