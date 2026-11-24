import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";
import { ogText } from "@/lib/og-text";
import { CATALOG_COUNTS } from "@/lib/catalog/counts";

export const runtime = "nodejs";

/**
 * The share card for every page (Open Graph and X), in the site's own look: the #f5f5f7 page, the
 * Nexus mark, Inter in #1d1d1f, a blue bloom top left and the hero's rainbow glowing in the far
 * corner, with a thin rainbow line along the bottom.
 *
 * A page with a picture (a component or block still from scripts/capture-og-shots.mjs, a template's
 * hero, a video's poster) gets a split card: the name on the left and the picture on the right in
 * a white frame that runs off the edge, so a shared link shows the thing itself. Anything else gets
 * the big title on its own.
 *
 *   title        the page's name, without " · Nexus UI Labs" (createMetadata strips it)
 *   description  one or two lines; cut at a word with an ellipsis
 *   kind         a small pill: Component, Template, Block, Video, Docs…
 *   pro          "1" adds a Pro pill next to it
 *   shot         "<components|blocks|templates|videos>/<slug>", the picture, or "wall" for the homepage
 *                (a tilted wall of real template screenshots, so the link shows what the library makes)
 */

const RAINBOW = ["#0090f7", "#6e5bff", "#ba62fc", "#f2416b", "#f55600"];
const INK = "#1d1d1f";
const MUTED = "#6e6e73";
const W = 1200;
const H = 630;

const fonts = Promise.all([
  readFile(join(process.cwd(), "src/app/api/og/fonts/inter-latin-400-normal.woff")),
  readFile(join(process.cwd(), "src/app/api/og/fonts/inter-latin-600-normal.woff")),
]);

/** Where each kind of picture lives under public/. The slug is checked before it gets here. */
const SHOT_PATH: Record<string, (slug: string) => string> = {
  components: (s) => `og-shots/components/${s}.jpg`,
  blocks: (s) => `og-shots/blocks/${s}.jpg`,
  templates: (s) => `og-shots/templates/${s}.jpg`,
  videos: (s) => `videos/previews/${s}.jpg`,
};

/**
 * The homepage card: a tilted mosaic of real pieces (templates, components, blocks) running edge to edge,
 * with the brand, headline and the live counts on a clean panel in the middle. Five columns of five.
 * Pictures are shrunk with sharp first, so twenty-five of them stay light enough for a scraper's timeout.
 */
type WallKind = "templates" | "components" | "blocks";
const WALL: [WallKind, string][][] = [
  [["templates", "helix-ai-platform"], ["components", "halo-hero"], ["blocks", "mk-beam-pricing"], ["templates", "kiln"], ["components", "thermo-dial"]],
  [["components", "liquid-gauge"], ["templates", "pulse-landing"], ["blocks", "mk-circuit-hero"], ["components", "vinyl-player"], ["templates", "afterglow"]],
  [["templates", "orbit-ai-page"], ["components", "svg-noise-shader"], ["templates", "tally"], ["blocks", "mk-cursor-crowd-hero"], ["components", "sound-mark"]],
  [["components", "dynamic-island"], ["templates", "side-b"], ["blocks", "bento-spotlight"], ["components", "wallet-stack"], ["templates", "wayfare"]],
  [["templates", "skein"], ["components", "tilt-pass"], ["templates", "orion-ai-ops"], ["components", "squeeze-progress"], ["blocks", "mk-halo-hero"]],
];

const SHOT_DIR: Record<WallKind, string> = {
  templates: "og-shots/templates",
  components: "og-shots/components",
  blocks: "og-shots/blocks",
};

async function loadWall() {
  const { default: sharp } = await import("sharp");
  return Promise.all(
    WALL.map((col) =>
      Promise.all(
        col.map(async ([kind, slug]) => {
          const file = join(process.cwd(), "public", SHOT_DIR[kind], `${slug}.jpg`);
          const small = await sharp(file).resize({ width: 340 }).jpeg({ quality: 72 }).toBuffer();
          return `data:image/jpeg;base64,${small.toString("base64")}`;
        }),
      ),
    ),
  );
}

async function loadShot(value: string | null) {
  const m = /^(components|blocks|templates|videos)\/([a-z0-9-]{1,80})$/.exec(value ?? "");
  if (!m) return null;
  const file = join(process.cwd(), "public", SHOT_PATH[m[1]](m[2]));
  if (!existsSync(file)) return null;
  return `data:image/jpeg;base64,${(await readFile(file)).toString("base64")}`;
}

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

function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 52, height: 52, borderRadius: 15, background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Mark />
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, color: INK, letterSpacing: "-0.02em" }}>Nexus UI</div>
    </div>
  );
}

function Pill({ children, dark = false }: { children: string; dark?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 38,
        padding: "0 17px",
        borderRadius: 999,
        fontSize: 18,
        fontWeight: 600,
        color: dark ? "#fff" : INK,
        background: dark ? INK : "#fff",
        boxShadow: dark ? "none" : "0 0 0 1px rgba(0,0,0,.08)",
      }}
    >
      {children}
    </div>
  );
}

/** The soft colour behind everything, and the rainbow line along the bottom (SVG draws soft gradients faithfully). */
function Backdrop() {
  const glows: [number, number, number, string, number][] = [
    [1120, 120, 360, RAINBOW[0], 0.2],
    [980, 640, 360, RAINBOW[2], 0.22],
    [1200, 560, 300, RAINBOW[3], 0.18],
    [760, 700, 260, RAINBOW[4], 0.14],
  ];
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <radialGradient id="bloom" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#0071e3" stopOpacity="0.1" />
          <stop offset="1" stopColor="#0071e3" stopOpacity="0" />
        </radialGradient>
        {glows.map(([, , , c, o], i) => (
          <radialGradient key={i} id={`g${i}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={c} stopOpacity={o} />
            <stop offset="1" stopColor={c} stopOpacity="0" />
          </radialGradient>
        ))}
        <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
          {RAINBOW.map((c, i) => (
            <stop key={c} offset={i / (RAINBOW.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      <ellipse cx="90" cy="-10" rx="620" ry="400" fill="url(#bloom)" />
      {glows.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={`url(#g${i})`} />
      ))}
      <rect x="0" y={H - 8} width={W} height="8" fill="url(#line)" />
    </svg>
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // These come from the URL, so they are cleaned and length-limited before they go anywhere near the renderer.
  const title = ogText(searchParams.get("title"), 90) || siteConfig.siteName;
  const rawDescription = ogText(searchParams.get("description"), 240) || siteConfig.tagline;
  const kind = ogText(searchParams.get("kind"), 24);
  const pro = searchParams.get("pro") === "1";
  // always the real address, so a card made on a dev server or a preview never says localhost
  const domain = "nexus-ui.com";
  const [[regular, semibold], shot] = await Promise.all([fonts, loadShot(searchParams.get("shot"))]);

  const pills =
    kind || pro ? (
      <div style={{ display: "flex", gap: 10 }}>
        {kind ? <Pill>{kind}</Pill> : null}
        {pro ? <Pill dark>Pro</Pill> : null}
      </div>
    ) : null;

  const wallShots = searchParams.get("shot") === "wall" ? await loadWall() : null;

  const TILE_W = 244;
  const TILE_H = 183;
  const GAP = 16;
  // each column sits at its own height, so the mosaic reads as a wall and not a grid
  const COL_SHIFT = [-30, -110, -10, -90, -50];
  const stats: [string, string, string][] = [
    [String(CATALOG_COUNTS.components), "components", RAINBOW[0]],
    [String(CATALOG_COUNTS.blocks), "blocks", RAINBOW[2]],
    [String(CATALOG_COUNTS.templates), "templates", RAINBOW[4]],
  ];

  const card = wallShots ? (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", background: "#f5f5f7", fontFamily: "Inter", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: -50,
          top: -180,
          width: 5 * TILE_W + 4 * GAP,
          height: 5 * TILE_H + 4 * GAP,
          display: "flex",
          transform: "rotate(-8deg)",
        }}
      >
        {wallShots.map((col, ci) => (
          <div key={ci} style={{ display: "flex", flexDirection: "column", marginLeft: ci ? GAP : 0, marginTop: COL_SHIFT[ci] }}>
            {col.map((src, ri) => (
              <div
                key={ri}
                style={{
                  display: "flex",
                  width: TILE_W,
                  height: TILE_H,
                  marginTop: ri ? GAP : 0,
                  padding: 5,
                  borderRadius: 20,
                  background: "#fff",
                  boxShadow: "0 0 0 1px rgba(0,0,0,.06), 0 18px 30px -18px rgba(0,0,0,.35)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- share-card renderer, not a page */}
                <img src={src} alt="" width={TILE_W - 10} height={TILE_H - 10} style={{ width: TILE_W - 10, height: TILE_H - 10, borderRadius: 15, objectFit: "cover" }} />
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* a light veil pushes the mosaic back so the panel is what the eye lands on */}
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, display: "flex", background: "rgba(245,245,247,0.12)" }} />
      <div
        style={{
          position: "absolute",
          left: 170,
          top: 150,
          width: 860,
          height: 330,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 40,
          borderRadius: 40,
          background: "rgba(255,255,255,0.94)",
          boxShadow: "0 0 0 1px rgba(0,0,0,.06), 0 60px 110px -34px rgba(0,0,0,.5), 0 20px 40px -24px rgba(0,0,0,.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Brand />
          <div style={{ fontSize: 22, fontWeight: 600, color: INK, opacity: 0.45 }}>{domain}</div>
        </div>
        <div style={{ display: "flex", fontSize: 52, fontWeight: 600, color: INK, letterSpacing: "-0.04em", lineHeight: 1.04 }}>{title}</div>
        <div style={{ display: "flex", gap: 10 }}>
          {stats.map(([n, label, color]) => (
            <div
              key={label}
              style={{ display: "flex", alignItems: "center", gap: 9, height: 42, padding: "0 18px", borderRadius: 999, background: "#f5f5f7", boxShadow: "0 0 0 1px rgba(0,0,0,.07)" }}
            >
              <div style={{ width: 10, height: 10, borderRadius: 999, background: color }} />
              <div style={{ fontSize: 20, fontWeight: 600, color: INK }}>{n}</div>
              <div style={{ fontSize: 20, color: MUTED }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0, width: W, height: 8, display: "flex", background: `linear-gradient(90deg, ${RAINBOW.join(", ")})` }} />
    </div>
  ) : shot ? (
    // split: words on the left, the picture on the right in a white frame that runs off the edge
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", background: "#f5f5f7", fontFamily: "Inter" }}>
      <Backdrop />
      <div style={{ position: "absolute", left: 64, top: 56, bottom: 64, width: 440, display: "flex", flexDirection: "column" }}>
        <Brand />
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          {pills}
          <div
            style={{
              marginTop: pills ? 22 : 0,
              fontSize: title.length > 30 ? 52 : title.length > 16 ? 62 : 72,
              fontWeight: 600,
              color: INK,
              letterSpacing: "-0.035em",
              lineHeight: 1.02,
            }}
          >
            {title}
          </div>
          <div style={{ marginTop: 18, fontSize: 23, lineHeight: 1.4, color: MUTED }}>{clip(rawDescription, 92)}</div>
          <div style={{ marginTop: 26, fontSize: 20, fontWeight: 600, color: INK, opacity: 0.5 }}>{domain}</div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 548,
          top: 64,
          width: 712,
          height: 520,
          display: "flex",
          padding: 12,
          borderRadius: 34,
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,.06), 0 40px 80px -36px rgba(0,0,0,.35), 0 16px 32px -24px rgba(0,0,0,.2)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- this is the share-card renderer, not a page */}
        <img src={shot} alt="" width={688} height={496} style={{ width: 688, height: 496, borderRadius: 24, objectFit: "cover" }} />
      </div>
    </div>
  ) : (
    // no picture: the title on its own, large
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", background: "#f5f5f7", fontFamily: "Inter" }}>
      <Backdrop />
      <div style={{ position: "absolute", left: 72, right: 72, top: 60, bottom: 70, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Brand />
          {pills}
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <div style={{ fontSize: title.length > 46 ? 66 : title.length > 26 ? 78 : 94, fontWeight: 600, color: INK, letterSpacing: "-0.035em", lineHeight: 1.02, maxWidth: 1000 }}>
            {title}
          </div>
          <div style={{ marginTop: 22, fontSize: 28, lineHeight: 1.4, color: MUTED, maxWidth: 900 }}>{clip(rawDescription, 118)}</div>
          <div style={{ marginTop: 30, fontSize: 22, fontWeight: 600, color: INK, opacity: 0.5 }}>{domain}</div>
        </div>
      </div>
    </div>
  );

  return new ImageResponse(card, {
    width: W,
    height: H,
    fonts: [
      { name: "Inter", data: regular, weight: 400, style: "normal" },
      { name: "Inter", data: semibold, weight: 600, style: "normal" },
    ],
    /* The image depends only on the query string, so let the CDN keep it. Without this every
       link preview re-rendered the PNG (1-3 s), which social scrapers can time out on. */
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=31536000, stale-while-revalidate=86400" },
  });
}
