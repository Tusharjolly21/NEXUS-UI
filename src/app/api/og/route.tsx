import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";
import { ogText } from "@/lib/og-text";

export const runtime = "nodejs";

/**
 * The share card for every page (Open Graph and X), in the site's own look: the #f5f5f7 page with
 * a white tile on it, the Nexus mark, Inter in #1d1d1f, and the hero's rainbow as a soft glow in
 * the corner and a thin line along the bottom.
 *
 *   title        the page's name, without " · Nexus UI Labs" (createMetadata strips it)
 *   description  one or two lines; cut at a word with an ellipsis
 *   kind         a small pill: Component, Template, Block, Video, Docs…
 *   pro          "1" adds a Pro pill next to it
 */

const RAINBOW = ["#0090f7", "#6e5bff", "#ba62fc", "#f2416b", "#f55600"];
const INK = "#1d1d1f";
const MUTED = "#6e6e73";

const fonts = Promise.all([
  readFile(join(process.cwd(), "src/app/api/og/fonts/inter-latin-400-normal.woff")),
  readFile(join(process.cwd(), "src/app/api/og/fonts/inter-latin-600-normal.woff")),
]);

/** Cuts at the last whole word that fits and adds an ellipsis. */
function clip(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max + 1);
  const at = cut.lastIndexOf(" ");
  return `${cut.slice(0, at > max * 0.6 ? at : max).replace(/[\s,.;:—–-]+$/, "")}…`;
}

function Mark() {
  return (
    <svg width="30" height="30" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="6" r="3.5" fill="#fff" />
      <circle cx="6" cy="50" r="3.5" fill="#fff" />
      <circle cx="58" cy="50" r="3.5" fill="#fff" />
      <path d="M32 9 L32 32 M9 49 L32 32 M55 49 L32 32" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="32" r="6" fill="#4aa8ff" />
    </svg>
  );
}

function Pill({ children, dark = false }: { children: string; dark?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 40,
        padding: "0 18px",
        borderRadius: 999,
        fontSize: 19,
        fontWeight: 600,
        color: dark ? "#fff" : INK,
        background: dark ? INK : "#f5f5f7",
        boxShadow: dark ? "none" : "0 0 0 1px rgba(0,0,0,.06)",
      }}
    >
      {children}
    </div>
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // These come from the URL, so they are cleaned and length-limited before they go anywhere near the renderer.
  const title = ogText(searchParams.get("title"), 90) || siteConfig.siteName;
  const description = clip(ogText(searchParams.get("description"), 240) || siteConfig.tagline, 118);
  const kind = ogText(searchParams.get("kind"), 24);
  const pro = searchParams.get("pro") === "1";
  const domain = siteConfig.url.replace(/^https?:\/\/(www\.)?/, "");
  const [regular, semibold] = await fonts;
  const size = title.length > 46 ? 64 : title.length > 26 ? 76 : 92;

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#f5f5f7", padding: 36, fontFamily: "Inter" }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          borderRadius: 40,
          background: "#fff",
          overflow: "hidden",
          boxShadow: "0 0 0 1px rgba(0,0,0,.05), 0 30px 60px -30px rgba(0,0,0,.25)",
          padding: "56px 64px 60px",
        }}
      >
        {/* the site's blue bloom, top left, and the hero's rainbow glowing from the far corner (an SVG, which
            draws soft gradients more faithfully than CSS does here) */}
        <svg width="1128" height="558" viewBox="0 0 1128 558" style={{ position: "absolute", left: 0, top: 0 }}>
          <defs>
            <clipPath id="tile">
              <rect width="1128" height="558" rx="40" />
            </clipPath>
            <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
              {RAINBOW.map((c, i) => (
                <stop key={c} offset={i / (RAINBOW.length - 1)} stopColor={c} />
              ))}
            </linearGradient>
            <radialGradient id="bloom" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#0071e3" stopOpacity="0.09" />
              <stop offset="1" stopColor="#0071e3" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="g0" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={RAINBOW[0]} stopOpacity="0.2" />
              <stop offset="1" stopColor={RAINBOW[0]} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="g2" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={RAINBOW[2]} stopOpacity="0.22" />
              <stop offset="1" stopColor={RAINBOW[2]} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="g3" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={RAINBOW[3]} stopOpacity="0.2" />
              <stop offset="1" stopColor={RAINBOW[3]} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="g4" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={RAINBOW[4]} stopOpacity="0.16" />
              <stop offset="1" stopColor={RAINBOW[4]} stopOpacity="0" />
            </radialGradient>
          </defs>
          <g clipPath="url(#tile)">
            <ellipse cx="80" cy="0" rx="560" ry="360" fill="url(#bloom)" />
            <circle cx="1090" cy="330" r="300" fill="url(#g0)" />
            <circle cx="930" cy="560" r="300" fill="url(#g2)" />
            <circle cx="1110" cy="600" r="260" fill="url(#g3)" />
            <circle cx="760" cy="640" r="220" fill="url(#g4)" />
            <rect x="0" y="550" width="1128" height="8" fill="url(#line)" />
          </g>
        </svg>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mark />
            </div>
            <div style={{ fontSize: 28, fontWeight: 600, color: INK, letterSpacing: "-0.02em" }}>Nexus UI</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {kind ? <Pill>{kind}</Pill> : null}
            {pro ? <Pill dark>Pro</Pill> : null}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <div style={{ fontSize: size, fontWeight: 600, color: INK, letterSpacing: "-0.035em", lineHeight: 1.02, maxWidth: 960 }}>{title}</div>
          <div style={{ marginTop: 22, fontSize: 28, lineHeight: 1.4, color: MUTED, maxWidth: 900 }}>{description}</div>
          <div style={{ marginTop: 34, fontSize: 22, fontWeight: 600, color: INK, opacity: 0.55 }}>{domain}</div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: semibold, weight: 600, style: "normal" },
      ],
      /* The image depends only on the query string, so let the CDN keep it. Without this every
         link preview re-rendered the PNG (1-3 s), which social scrapers can time out on. */
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=31536000, stale-while-revalidate=86400" },
    },
  );
}
