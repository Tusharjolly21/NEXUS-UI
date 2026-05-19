import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const runtime = "nodejs"; //changed edge to nodejs for better image rendering performance

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? siteConfig.name;
  const description = searchParams.get("description") ?? siteConfig.tagline;
  const domain = siteConfig.url.replace(/^https?:\/\//, "");
  const type = searchParams.get("type") ?? "";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#09090b",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      {/* Cyan glow top-right */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 560,
          height: 560,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 68%)",
        }}
      />

      {/* Violet glow bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 68%)",
        }}
      />

      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background:
            "linear-gradient(90deg, transparent, rgba(34,211,238,0.8), transparent)",
        }}
      />

      {/* Brand — top left */}
      <div
        style={{
          position: "absolute",
          top: 52,
          left: 64,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 800,
            color: "white",
          }}
        >
          N
        </div>
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "-0.01em",
          }}
        >
          {domain}
        </span>
      </div>

      {/* Main content — bottom aligned */}
      <div
        style={{
          position: "absolute",
          bottom: 64,
          left: 64,
          right: 64,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Type pill */}
        {type && (
          <div
            style={{
              display: "flex",
              marginBottom: 20,
              width: "fit-content",
              background: "rgba(34,211,238,0.1)",
              border: "1px solid rgba(34,211,238,0.25)",
              borderRadius: 999,
              padding: "5px 16px",
              fontSize: 12,
              fontWeight: 700,
              color: "#22d3ee",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {type}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 42 ? 46 : 60,
            fontWeight: 800,
            color: "white",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            maxWidth: 960,
            marginBottom: 18,
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.5,
            maxWidth: 820,
            marginBottom: 40,
          }}
        >
          {description.length > 110
            ? description.slice(0, 110) + "…"
            : description}
        </div>

        {/* Bottom rule */}
        <div
          style={{
            width: "100%",
            height: 1,
            background: "rgba(255,255,255,0.07)",
            marginBottom: 20,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.25)" }}>
            {siteConfig.tagline}
          </span>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.18)" }}>
            {domain}
          </span>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
