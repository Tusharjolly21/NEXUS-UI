import type { CSSProperties } from "react";
import { FONT, GRAD, TEXT, gradText, type Frame, type VideoMeta, assetUrl } from "./kit";
import tPayFile from "./assets/tile-pay.jpg";
import tRouterFile from "./assets/tile-router.jpg";
import tPendFile from "./assets/tile-pend.jpg";
import tReelFile from "./assets/tile-reel.jpg";
import tDockFile from "./assets/tile-dock.jpg";
import tIslandFile from "./assets/tile-island.jpg";
import tFolderFile from "./assets/tile-folder.jpg";
import tCopyFile from "./assets/tile-copy.jpg";
import tplNovaFile from "./assets/tpl-nova.jpg";
import tplHelixFile from "./assets/tpl-helix.jpg";
import tplLaunchFile from "./assets/tpl-launch.jpg";
import tplAetherFile from "./assets/tpl-aether.jpg";

// Imported files as URL strings, whichever bundler you use (see assetUrl in kit.ts).
const tPay = assetUrl(tPayFile);
const tRouter = assetUrl(tRouterFile);
const tPend = assetUrl(tPendFile);
const tReel = assetUrl(tReelFile);
const tDock = assetUrl(tDockFile);
const tIsland = assetUrl(tIslandFile);
const tFolder = assetUrl(tFolderFile);
const tCopy = assetUrl(tCopyFile);
const tplNova = assetUrl(tplNovaFile);
const tplHelix = assetUrl(tplHelixFile);
const tplLaunch = assetUrl(tplLaunchFile);
const tplAether = assetUrl(tplAetherFile);

export interface HeroLoopProps {
  headline: string;
  accentWord: string;
  sub: string;
  bg: string;
}

export const meta: VideoMeta<HeroLoopProps> = {
  id: "hero-loop",
  title: "Hero Loop",
  platforms: ["Website"],
  formats: ["16:9", "21:9", "9:16"],
  purpose: "Website background",
  motion: "Seamless 3D wall of your work, alternating columns",
  app: "Nexus UI",
  duration: 8,
  bpm: 120,
  cuts: [],
  loop: true,
  silent: true,
  blurb: "A silent, seamless background for a landing page hero. Your real screenshots ride up and down a tilted 3D wall in alternating columns, a soft light passes over them, and frame 0 matches the last frame exactly, so it loops forever without a seam.",
  defaults: { headline: "Make your site", accentWord: "move.", sub: "183 animated components for React.", bg: "#f5f5f7" },
  fields: [
    { key: "headline", label: "Headline (leave empty for a clean background)", type: "text", max: 22 },
    { key: "accentWord", label: "Gradient word", type: "text", max: 10 },
    { key: "sub", label: "Sub line", type: "text", max: 40 },
    { key: "bg", label: "Page background", type: "color" },
  ],
  prompt: `Make an 8-second seamless looping background video for a landing page hero, in 16:9, 21:9 (ultrawide) and 9:16 (mobile) from one React component. Silent. Light #f5f5f7.

A 3D wall of real product screenshots: a big plane tilted back (rotateX ~52°) and turned (rotateZ ~-28°) under a 2000px perspective, made of 7 columns of rounded white cards with soft shadows. Alternate columns scroll in opposite directions at slightly different speeds. Every offset is (t / 8) × the column's loop length, so frame 0 and the final frame are identical and the loop has no seam. A soft diagonal light band sweeps across the wall once per loop, and the wall breathes a degree of rotation on a sine with the same 8s period.

Fade the wall into the page colour toward the text side (left in landscape, top in portrait) and at the edges, so a headline can sit on top. Show an optional headline in Inter Display ("Make your site move." with "move." in a blue→purple→pink→orange gradient) and a grey sub line; leave it empty to export a clean background.

Pure function of time t (loop period 8s) with frame width/height props; headline, gradient word, sub line and background colour are props.`,
};

const abs: CSSProperties = { position: "absolute" };
const IMGS = [tPend, tplNova, tReel, tDock, tplHelix, tPay, tRouter, tplLaunch, tIsland, tFolder, tplAether, tCopy];
const PERIOD = 8;

export default function HeroLoop({ t, w = 1920, h = 1080, ...props }: { t: number } & Frame & Partial<HeroLoopProps>) {
  const p = { ...meta.defaults, ...props };
  const tall = h > w * 1.2;
  const u = Math.min(w, h) / 1080;
  const ph = (t % PERIOD) / PERIOD; // 0..1, seamless
  const cols = 7, tw = 420, th = 270, gap = 34, per = 5;
  const loop = per * (th + gap);
  const breathe = Math.sin(ph * Math.PI * 2);
  const planeW = cols * (tw + gap);
  const scale = (tall ? 1.15 : w / h > 2 ? 1.25 : 1.1) * u;
  const cx = tall ? w * 0.5 : w * 0.66, cy = tall ? h * 0.66 : h * 0.55;
  const fadeDir = tall ? "180deg" : "90deg";

  return (
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden", background: p.bg, fontFamily: FONT, color: "#1d1d1f" }}>
      <div style={{ ...abs, left: cx, top: cy, width: 0, height: 0, perspective: 2000 * u }}>
        <div style={{ ...abs, left: (-planeW / 2) * scale, top: -loop * 1.1 * scale, width: planeW * scale, height: loop * 2.2 * scale, transformStyle: "preserve-3d", transform: `rotateX(${52 + breathe * 1.2}deg) rotateZ(${-28 + breathe * 0.8}deg)` }}>
          {Array.from({ length: cols }, (_, c) => {
            const dir = c % 2 ? 1 : -1;
            const laps = c % 3 === 0 ? 2 : 1; // integer laps per period keeps it seamless
            const off = ((ph * laps * loop) % loop) * dir;
            return (
              <div key={c} style={{ ...abs, left: c * (tw + gap) * scale, top: (-loop + off + (c % 2 ? -th * 0.5 : 0)) * scale, width: tw * scale }}>
                {Array.from({ length: per * 4 }, (_, k) => {
                  const src = IMGS[(c * 5 + (k % per) * 7) % IMGS.length]; // repeats every `per` cards, matching the loop
                  return (
                    <div key={k} style={{ width: tw * scale, height: th * scale, marginBottom: gap * scale, borderRadius: 26 * scale, overflow: "hidden", background: "#fff", boxShadow: `0 0 0 ${1 * scale}px rgba(0,0,0,.06), 0 ${24 * scale}px ${40 * scale}px -${24 * scale}px rgba(0,0,0,.35)` }}>
                      <img src={src} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  );
                })}
              </div>
            );
          })}
          {/* light band, once per loop */}
          <div style={{ ...abs, inset: 0, background: `linear-gradient(115deg, transparent ${-30 + ph * 160}%, rgba(255,255,255,.55) ${-18 + ph * 160}%, transparent ${-6 + ph * 160}%)`, pointerEvents: "none" }} />
        </div>
      </div>

      {/* fades into the page */}
      <div style={{ ...abs, inset: 0, background: `linear-gradient(${fadeDir}, ${p.bg} ${tall ? 30 : 26}%, ${p.bg}00 ${tall ? 52 : 50}%)` }} />
      <div style={{ ...abs, inset: 0, background: `radial-gradient(ellipse at ${tall ? "50% 70%" : "70% 55%"}, transparent 45%, ${p.bg} 92%)` }} />

      {p.headline && (
        <div style={{ ...abs, left: tall ? 0 : w * 0.07, right: tall ? 0 : undefined, top: tall ? h * 0.12 : h * 0.33, textAlign: tall ? "center" : "left" }}>
          <div style={{ fontSize: (tall ? 112 : 120) * u, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1.02 }}>
            {p.headline}<br /><span style={gradText(GRAD)}>{p.accentWord}</span>
          </div>
          <div style={{ marginTop: 26 * u, fontFamily: TEXT, fontSize: 38 * u, fontWeight: 500, color: "#6e6e73", letterSpacing: "-0.015em" }}>{p.sub}</div>
        </div>
      )}
    </div>
  );
}
