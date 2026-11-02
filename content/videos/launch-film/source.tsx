import type { CSSProperties, ReactNode } from "react";
import { FONT, MONO, TEXT, P, clamp, ease, lerp, rand, spring, type Frame, type VideoMeta, assetUrl } from "./kit";
import { Cursor, Odometer } from "./parts";
import { GlassBubbles } from "../components/nexus/glass-bubbles";
import { CurvedReel } from "../components/nexus/curved-reel";
import { IslandMorph } from "../components/nexus/island-morph";
import { MagnifyDock } from "../components/nexus/magnify-dock";
import { StretchNav } from "../components/nexus/stretch-nav";
import { RulerPicker } from "../components/nexus/ruler-picker";
import { FolderPeek } from "../components/nexus/folder-peek";
import { PriceOdometer } from "../components/nexus/price-odometer";
import { PacketRouter } from "../components/nexus/packet-router";
import { DotSphere } from "../components/nexus/dot-sphere";
import { MacKeyboard } from "../components/keyboard";
import shotHomeFile from "./assets/site/home.jpg";
import shotKeyboardFile from "./assets/site/mac-keyboard.jpg";
import shotHeroLightFile from "./assets/site/hero-light.jpg";
import shotHeroDarkFile from "./assets/site/hero-dark.jpg";

// Imported files as URL strings, whichever bundler you use (see assetUrl in kit.ts).
const shotHome = assetUrl(shotHomeFile);
const shotKeyboard = assetUrl(shotKeyboardFile);
const shotHeroLight = assetUrl(shotHeroLightFile);
const shotHeroDark = assetUrl(shotHeroDarkFile);

export interface LaunchFilmProps {
  brand: string;
  url: string;
  blue: string;
  count: number;
  pkg: string;
  /** Optional live shelf counts for the "Introducing" card; the numbers below are the original snapshot. */
  free?: number | string;
  sections?: number | string;
  blocks?: number | string;
  templates?: number | string;
  sounds?: number | string;
}

export const meta: VideoMeta<LaunchFilmProps> = {
  id: "launch-film",
  title: "Launch Film",
  platforms: ["X", "YouTube", "LinkedIn", "Product Hunt"],
  formats: ["16:9", "9:16", "1:1"],
  purpose: "Product launch film",
  motion: "Real Nexus UI components running live, the real site in a browser window, glass cards, chain links, a component network and the lockup",
  app: "Nexus UI",
  duration: 44,
  bpm: 100,
  cuts: [2.9, 4.5, 5.1, 9.2, 11.0, 13.6, 15.3, 17.2, 20.8, 26.2, 28.6, 31.2, 32.4, 35.6, 38.8, 40.4],
  blurb:
    "A 44-second launch film for Nexus UI built from the library itself. Ten real components (Glass Bubbles, Curved Reel, Island Morph, Magnify Dock, Packet Router, Ruler Picker, Stretch Nav, Folder Peek, Price Odometer, Dot Sphere) and the Mac Keyboard run live in the frame on their own autoplay. The real nexus-ui.com scrolls in a browser window, from the hero to the gallery to the Mac Keyboard props, with light and dark versions of the site, the real logo, the real counts and the real release notes. Original 100 BPM score with every move scored.",
  defaults: {
    brand: "Nexus UI",
    url: "nexus-ui.com",
    blue: "#0071e3",
    count: 205,
    pkg: "@nexus-labs/mac-keyboard",
  },
  fields: [
    { key: "brand", label: "Brand", type: "text", max: 16 },
    { key: "url", label: "URL", type: "text", max: 24 },
    { key: "pkg", label: "Package", type: "text", max: 32 },
    { key: "count", label: "Components", type: "number", min: 1, max: 999 },
    { key: "blue", label: "Accent", type: "color" },
  ],
  prompt: `Make a 44-second launch film for my React component library Nexus UI (nexus-ui.com) in 16:9 (also 9:16 and 1:1), as one React component that is a pure function of time t, except for my own components, which run live inside it on their own autoplay (render with a virtual clock so they stay frame-accurate).

Look: my site's own look. Off-white #f5f5f7 canvas, white cards with 28px corners, Inter Display, ink #1d1d1f, primary blue #0071e3, and my rainbow gradient (blue → violet → pink → orange) on the one word that matters in each line. My real logo everywhere: the black app-icon tile with the three-spoke mark and periwinkle core, and the Converge mark (three nodes meeting at a lit core). No stock photos, no device frames. Every word fades in with a short blur.

Shots:
0–2.9 a wall of my real components in their gallery cards, drained to grey and soft: "Component libraries feel stuck in the past."
2.9–4.5 the wall snaps into colour and focus; "Ours" then the letters of "doesn't." fall in and settle with a spring.
4.5–5.1 the mark pulls back out of the frame with the live wall inside it, red/cyan fringes on its edge.
5.1–9.2 white with a blurred blue ring: "Introducing Nexus UI" types in, moves up, and a card rises with my real shelf counts (205 components, 106 blocks, 25 templates, 24 sounds) rolling up, and live components inside.
9.2–11 "Not bolted onto your app." over a deep blue glow rising from the bottom.
11–13.6 "Built into your codebase." two white pills (Nexus UI with the app icon, Your app) and two glossy chain links, silver and blue, that fly in and interlock.
13.6–17.2 a giant "One component" zooms out to size beside the app icon, which flips and doubles, "becomes"; a blue stage fills with component tiles while the count rolls to 205: "205 components. One system."
17.2–20.8 my real hero (light) fills the frame under a glass install card; a white panel slides in with "One install. Light and dark, built in." and two child cards holding the light and dark versions of the site on dashed connectors.
20.8–26.2 the real nexus-ui.com in a frameless browser window over a soft colour wash: it scrolls from the hero into the live gallery under "Every component.", then opens the Mac Keyboard page and scrolls to its props table under "Every prop."
26.2–28.6 "The docs are the playground." the real Mac Keyboard typing on its own in a card, with three glass prop chips (theme, accent, layout) wired to it.
28.6–31.2 white: "Every prop typed. Automatically." a code card for the keyboard with a blue and a violet success pill.
31.2–32.4 "Automatically." zooms through the frame into the live component wall: "And it keeps moving."
32.4–35.6 a notification from the app icon ("New in Nexus UI: Glass Bubbles") with a red badge; a cursor grabs it and drags it into a components table where it becomes the highlighted top row: "Every new one lands."
35.6–38.8 a wavy blue badge with rings, then my real release list (#68 Mac sound style, #66 type on your real keyboard, #64 recorded key clicks, #63 Pro sound pack, #62 sound for 73 components): the top row sweeps green from Building to Live: "Every release shipped."
38.8–40.4 a glossy blue "Automatically." pill inside soft glass rings.
40.4–44 "Welcome to" + the big app icon, then the lockup: icon + "Nexus UI", "205 animated components, free to start" and nexus-ui.com.

Sound: an original light 100 BPM bed (soft kick, rim, shaker, warm pad, plucks), whooshes on every move, small pops on falling letters, a glassy clink when the links lock, ticks as numbers roll, a notification chime, a soft drag rustle, a success chime on the green sweep and a shimmer on the lockup.`,
};

/* ------------------------------------------------------------------ brand + helpers */
const abs: CSSProperties = { position: "absolute" };
type Ctx = { t: number; w: number; h: number; u: number; land: boolean; cx: number; cy: number; p: LaunchFilmProps };
const INK = "#1d1d1f";
const SUB = "#86868b";
const CANVAS = "#f5f5f7";
const CORE = "oklch(0.72 0.18 250)";
const RAINBOW = "linear-gradient(90deg,#1b7cf5 0%,#6a5cf2 34%,#c14fd6 56%,#ec4a7a 76%,#f6681f 100%)";
const rainbow: CSSProperties = { background: RAINBOW, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };

type Seg = [string, CSSProperties?];
/** Words (or letters) that fade in with a short blur, one after another. */
function Reveal({ t, at, segs, per = 0.07, dur = 0.5, by = "word", out, style }: { t: number; at: number; segs: Seg[]; per?: number; dur?: number; by?: "word" | "char"; out?: number; style?: CSSProperties }) {
  let i = 0;
  const po = out == null ? 0 : ease.inOut(P(t, out, out + 0.35));
  return (
    <span style={{ display: "inline-block", whiteSpace: "pre", opacity: 1 - po, filter: po > 0.01 ? `blur(${po * 14}px)` : undefined, ...style }}>
      {segs.map(([text, st], si) => {
        const units = by === "word" ? text.split(/(\s+)/) : Array.from(text);
        return units.map((un, k) => {
          if (/^\s+$/.test(un)) return <span key={`${si}-${k}`}>{un}</span>;
          const q = ease.out(P(t, at + i * per, at + i * per + dur));
          i++;
          return (
            <span key={`${si}-${k}`} style={{ display: "inline-block", opacity: clamp(q * 1.4), filter: q < 0.99 ? `blur(${(1 - q) * 14}px)` : undefined, transform: `translateY(${(1 - q) * 0.18}em)`, ...st }}>
              {un}
            </span>
          );
        });
      })}
    </span>
  );
}

const glass = (u: number, r = 26): CSSProperties => ({
  background: "linear-gradient(160deg, rgba(255,255,255,.62), rgba(255,255,255,.3))",
  backdropFilter: "blur(22px) saturate(1.6)",
  WebkitBackdropFilter: "blur(22px) saturate(1.6)",
  border: `${1.5 * u}px solid rgba(255,255,255,.7)`,
  borderRadius: r * u,
  boxShadow: `0 ${18 * u}px ${44 * u}px rgba(20,30,60,.16), inset 0 ${1 * u}px 0 rgba(255,255,255,.8)`,
});
const card = (u: number, r = 22): CSSProperties => ({
  background: "#fff",
  borderRadius: r * u,
  boxShadow: `0 0 0 ${1 * u}px rgba(20,30,60,.06), 0 ${2 * u}px ${4 * u}px rgba(20,30,60,.04), 0 ${18 * u}px ${48 * u}px rgba(20,30,60,.12)`,
});

/** Nexus mark, Converge direction: the site's own artwork on its 64×64 grid. */
function NexusMark({ size, color = INK, accent = CORE, sw = 2.5 }: { size: number; color?: string; accent?: string; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ display: "block", overflow: "visible" }}>
      <circle cx="32" cy="6" r="3" fill={color} />
      <circle cx="6" cy="50" r="3" fill={color} />
      <circle cx="58" cy="50" r="3" fill={color} />
      <path d="M32 9 L32 32 M9 49 L32 32 M55 49 L32 32" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <circle cx="32" cy="32" r="5" fill={accent} />
      <circle cx="32" cy="32" r="5" fill="none" stroke={color} strokeWidth="1.25" />
    </svg>
  );
}
/** The app icon: black tile, cream spokes, periwinkle core. */
function AppIcon({ size, style }: { size: number; style?: CSSProperties }) {
  const N = [[50, 21], [21, 69], [79, 69]];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", ...style }}>
      <defs>
        <linearGradient id="ai-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1a1c" />
          <stop offset="1" stopColor="#050506" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" rx="22.5" fill="url(#ai-tile)" />
      {N.map(([x, y], i) => <line key={i} x1="50" y1="50" x2={x} y2={y} stroke="#f2efe8" strokeWidth="2.8" strokeLinecap="round" />)}
      {N.map(([x, y], i) => <circle key={`n${i}`} cx={x} cy={y} r="4.3" fill="#f2efe8" />)}
      <circle cx="50" cy="50" r="7.4" fill="#7d96ff" stroke="#f2efe8" strokeWidth="1.8" />
    </svg>
  );
}
/** Bold version of the mark as a CSS mask (white on transparent). */
const MARK_MASK = (() => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><g fill='white'><circle cx='32' cy='6' r='7.5'/><circle cx='6' cy='50' r='7.5'/><circle cx='58' cy='50' r='7.5'/><circle cx='32' cy='32' r='12'/></g><path d='M32 9 L32 32 M9 49 L32 32 M55 49 L32 32' stroke='white' stroke-width='9' stroke-linecap='round'/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
})();
function MarkOutline({ size, color, sw }: { size: number; color: string; sw: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ overflow: "visible", display: "block" }}>
      <g fill={color}>
        <circle cx="32" cy="6" r={7.5 + sw / 2} />
        <circle cx="6" cy="50" r={7.5 + sw / 2} />
        <circle cx="58" cy="50" r={7.5 + sw / 2} />
        <circle cx="32" cy="32" r={12 + sw / 2} />
      </g>
      <path d="M32 9 L32 32 M9 49 L32 32 M55 49 L32 32" stroke={color} strokeWidth={9 + sw} strokeLinecap="round" />
    </svg>
  );
}

function Check({ size, color = "#fff", sw = 3 }: { size: number; color?: string; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
      <path d="M6 12.5l4 4 8-9" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function wavy(r: number, lobes = 8, amp = 0.07, ph = 0) {
  let d = "";
  for (let i = 0; i <= 160; i++) {
    const a = (i / 160) * Math.PI * 2;
    const rr = r * (1 + amp * Math.sin(a * lobes + ph));
    d += `${i ? "L" : "M"}${(Math.cos(a) * rr).toFixed(2)},${(Math.sin(a) * rr).toFixed(2)}`;
  }
  return d + "Z";
}

function Hand({ x, y, size, grab }: { x: number; y: number; size: number; grab: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ ...abs, left: x - size * 0.45, top: y - size * 0.35, filter: "drop-shadow(0 3px 6px rgba(0,0,0,.25))", zIndex: 30 }}>
      {grab ? (
        <path d="M10 12c0-1.6 2.4-1.6 2.4 0v-.6c0-1.6 2.4-1.6 2.4 0v.2c0-1.6 2.4-1.6 2.4 0v.6c0-1.4 2.4-1.4 2.4.2v6.4c0 3.6-2.4 6.2-6 6.2h-1c-2.6 0-4-1.2-5.2-3.2l-1.6-3c-.8-1.4 1-2.4 2-1.2l1.2 1.4z" fill="#fff" stroke="#111" strokeWidth="1.3" strokeLinejoin="round" />
      ) : (
        <path d="M11 15V7.4c0-1.6 2.4-1.6 2.4 0V13V5.8c0-1.6 2.4-1.6 2.4 0V13V6.6c0-1.6 2.4-1.6 2.4 0V13V8.6c0-1.6 2.4-1.6 2.4 0v10c0 3.6-2.4 6.2-6 6.2h-1c-2.6 0-4-1.2-5.2-3.2l-2.6-4.6c-.8-1.4 1-2.4 2-1.2z" fill="#fff" stroke="#111" strokeWidth="1.3" strokeLinejoin="round" />
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ live components */
type LiveDef = { key: string; name: string; w: number; h: number; el: () => ReactNode };
const LIVE: LiveDef[] = [
  { key: "bubbles", name: "Glass Bubbles", w: 440, h: 336, el: () => <GlassBubbles autoplay /> },
  { key: "reel", name: "Curved Reel", w: 760, h: 336, el: () => <CurvedReel autoplay /> },
  { key: "island", name: "Island Morph", w: 380, h: 270, el: () => <IslandMorph autoplay enableSound={false} /> },
  { key: "dock", name: "Magnify Dock", w: 470, h: 150, el: () => <MagnifyDock autoplay enableSound={false} /> },
  { key: "router", name: "Packet Router", w: 760, h: 320, el: () => <PacketRouter autoplay /> },
  { key: "ruler", name: "Ruler Picker", w: 400, h: 230, el: () => <RulerPicker autoplay enableSound={false} /> },
  { key: "nav", name: "Stretch Nav", w: 440, h: 60, el: () => <StretchNav autoplay enableSound={false} /> },
  { key: "folder", name: "Folder Peek", w: 300, h: 260, el: () => <FolderPeek autoplay enableSound={false} /> },
  { key: "odometer", name: "Price Odometer", w: 460, h: 300, el: () => <PriceOdometer autoplay /> },
  { key: "sphere", name: "Dot Sphere", w: 360, h: 380, el: () => <DotSphere autoplay hint="" radius={130} /> },
  { key: "keyboard", name: "Mac Keyboard", w: 640, h: 300, el: () => <MacKeyboard layout="compact" theme="light" autoplay autoplayText="make it move" placeholder="Start typing..." enableSound={false} /> },
];
const LIVE_BY = Object.fromEntries(LIVE.map((d) => [d.key, d])) as Record<string, LiveDef>;

/** One live component, centred and scaled to fit a box of bw×bh (pixels). */
function Live({ k, bw, bh, fill = 0.86, maxScale = 1.6 }: { k: string; bw: number; bh: number; fill?: number; maxScale?: number }) {
  const d = LIVE_BY[k];
  const s = Math.min((bw * fill) / d.w, (bh * fill) / d.h, maxScale);
  return (
    <div style={{ ...abs, left: (bw / 2 - (d.w * s) / 2) / s, top: (bh / 2 - (d.h * s) / 2) / s, width: d.w, height: d.h, zoom: s, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TEXT } as CSSProperties}>
      {d.el()}
    </div>
  );
}

/** A gallery card like the site's: white, 28px corners, a "New" tag and the component inside. */
function GalleryCard({ k, x, y, cw, ch, u }: { k: string; x: number; y: number; cw: number; ch: number; u: number }) {
  return (
    <div style={{ ...abs, left: x, top: y, width: cw, height: ch, borderRadius: 26 * u, background: "#fff", boxShadow: `0 0 0 ${1 * u}px rgba(0,0,0,.04), 0 ${10 * u}px ${30 * u}px -${16 * u}px rgba(0,0,0,.18)`, overflow: "hidden" }}>
      <span style={{ ...abs, left: 18 * u, top: 16 * u, fontFamily: TEXT, fontSize: 13 * u, fontWeight: 600, color: "#c2410c", background: "rgba(249,115,22,.1)", padding: `${3 * u}px ${9 * u}px`, borderRadius: 99, zIndex: 2 }}>New</span>
      <Live k={k} bw={cw} bh={ch} fill={0.8} maxScale={1.4 * u} />
    </div>
  );
}

const WALL = ["bubbles", "reel", "island", "dock", "router", "ruler", "nav", "folder", "odometer", "sphere", "keyboard", "island"];
/** The live component wall, laid out for the frame, with a slow camera drift. */
function Wall({ t, w, h, u, land, t0, push = 0.05 }: { t: number; w: number; h: number; u: number; land: boolean; t0: number; push?: number }) {
  const cols = land ? 4 : w / h > 0.8 ? 3 : 2;
  const rows = land ? 3 : w / h > 0.8 ? 3 : 5;
  const gap = 18 * u;
  const W = w * 1.12, H = h * 1.12;
  const cw = (W - gap * (cols + 1)) / cols;
  const ch = (H - gap * (rows + 1)) / rows;
  const s = 1 + push * 0 * ease.out(P(t, t0, t0 + 6));
  const dx = 0 * Math.sin((t - t0) * 0.25) * 14 * u;
  return (
    <div style={{ ...abs, inset: 0, background: CANVAS, overflow: "hidden" }}>
      <div style={{ ...abs, left: (w - W) / 2 + dx, top: (h - H) / 2, width: W, height: H, transform: `scale(${s})` }}>
        {Array.from({ length: cols * rows }, (_, i) => {
          const c = i % cols, r = Math.floor(i / cols);
          return <GalleryCard key={i} k={WALL[i % WALL.length]} x={gap + c * (cw + gap)} y={gap + r * (ch + gap)} cw={cw} ch={ch} u={u} />;
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ scenes */

/* 0 – 5.1 · the wall, "stuck in the past", "Ours doesn't.", the mark pulls out */
function Open({ t, w, h, u, land, cx, cy }: Ctx) {
  const fs = (land ? 78 : 66) * u;
  const alive = ease.inOut(P(t, 2.75, 3.15));
  const word2 = "doesn't.";
  const pk = ease.inOut(P(t, 4.45, 5.1));
  const k0 = (Math.hypot(w, h) / 2 / 12) * 1.04;
  const k = Math.exp(lerp(Math.log(k0), Math.log(2.6 * u), pk));
  const S = 64 * k;
  const masked = t > 4.45;
  const fade = ease.out(P(t, 4.95, 5.2));
  const veil = lerp(0.55, 0.3, alive);
  const inner = (
    <>
      <div style={{ ...abs, inset: 0, filter: `grayscale(${1 - alive}) blur(${(1 - alive) * 5}px) contrast(${lerp(0.85, 1, alive)})`, transform: `scale(${lerp(1, 0.9, pk)})` }}>
        <Wall t={t} w={w} h={h} u={u} land={land} t0={0} push={0.06} />
      </div>
      <div style={{ ...abs, inset: 0, background: `radial-gradient(ellipse 60% 42% at 50% 50%, rgba(245,245,247,${veil + 0.35}), rgba(245,245,247,${veil}) 55%, rgba(245,245,247,${veil * 0.4}) 100%)` }} />
      {t < 2.95 && (
        <div style={{ ...abs, left: 0, right: 0, top: cy - fs * (land ? 0.6 : 1.15), textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: fs, letterSpacing: "-0.04em", color: INK, padding: `0 ${70 * u}px`, lineHeight: 1.08 }}>
          <Reveal t={t} at={0.35} per={0.1} segs={[["Component libraries feel stuck in the past."]]} out={2.55} style={{ whiteSpace: land ? "pre" : "normal" }} />
        </div>
      )}
      {t >= 2.85 && (
        <div style={{ ...abs, left: 0, right: 0, top: cy - fs * 0.66, display: "flex", justifyContent: "center", fontFamily: FONT, fontWeight: 700, fontSize: fs * 1.2, letterSpacing: "-0.045em", color: INK, transform: `scale(${lerp(1, 0.92, pk)})` }}>
          <Reveal t={t} at={2.9} segs={[["Ours"]]} />
          <span>&nbsp;</span>
          {Array.from(word2).map((c, i) => {
            const st = 3.15 + i * 0.07;
            const s = spring(t - st, 0.62, 13);
            const q = clamp((t - st) / 0.25);
            const dx = (rand(i * 3.1 + 1) - 0.5) * 700 * u;
            const dy = -(220 + rand(i * 5.7 + 2) * 380) * u;
            const rot = (rand(i * 9.3) - 0.5) * 90;
            return (
              <span key={i} style={{ display: "inline-block", opacity: clamp(q * 2), transform: `translate(${(1 - s) * dx}px, ${(1 - s) * dy}px) rotate(${(1 - s) * rot}deg)`, filter: q < 1 ? `blur(${(1 - q) * 8}px)` : undefined, ...rainbow }}>
                {c}
              </span>
            );
          })}
        </div>
      )}
    </>
  );
  return (
    <div style={{ ...abs, inset: 0, background: "#fff" }}>
      {masked && (
        <>
          <div style={{ ...abs, left: cx - S / 2 - 8 * u, top: cy - S / 2 + 3 * u, opacity: 0.55 * (1 - fade), filter: `blur(${4 * u}px)` }}><MarkOutline size={S} color="#ff4f7a" sw={(7 * 64) / S} /></div>
          <div style={{ ...abs, left: cx - S / 2 + 8 * u, top: cy - S / 2 - 3 * u, opacity: 0.6 * (1 - fade), filter: `blur(${4 * u}px)` }}><MarkOutline size={S} color="#3cc9ff" sw={(7 * 64) / S} /></div>
        </>
      )}
      <div
        style={{
          ...abs,
          inset: 0,
          opacity: 1 - fade,
          filter: fade > 0 ? `blur(${fade * 10}px)` : undefined,
          ...(masked
            ? { WebkitMaskImage: MARK_MASK, maskImage: MARK_MASK, WebkitMaskSize: `${S}px ${S}px`, maskSize: `${S}px ${S}px`, WebkitMaskPosition: `${cx - S / 2}px ${cy - S / 2}px`, maskPosition: `${cx - S / 2}px ${cy - S / 2}px`, WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat" }
            : {}),
        }}
      >
        {inner}
      </div>
    </div>
  );
}

/** Soft blurred blue ring + streaks on white. */
function RingBg({ t, w, h, u, o = 1, x = 0.5, y = 0.5, R = 640 }: { t: number; w: number; h: number; u: number; o?: number; x?: number; y?: number; R?: number }) {
  const r = R * u;
  return (
    <div style={{ ...abs, inset: 0, background: "#fff", overflow: "hidden" }}>
      <div style={{ ...abs, left: w * x - r, top: h * y - r, width: r * 2, height: r * 2, borderRadius: "50%", opacity: o, transform: `rotate(${t * 12}deg) scale(${1 + Math.sin(t * 0.7) * 0.03})`, background: "radial-gradient(circle, rgba(255,255,255,0) 30%, rgba(40,130,240,.55) 47%, rgba(120,110,240,.25) 56%, rgba(255,255,255,0) 68%)", filter: `blur(${36 * u}px)` }} />
      <div style={{ ...abs, left: w * x - r * 1.1, top: h * y - r * 0.4, width: r * 1.2, height: r * 1.2, borderRadius: "50%", opacity: o * 0.6, background: "radial-gradient(circle, rgba(30,120,240,.4), transparent 60%)", filter: `blur(${50 * u}px)`, transform: `translate(${Math.sin(t * 0.5) * 40 * u}px, ${Math.cos(t * 0.4) * 30 * u}px)` }} />
      <div style={{ ...abs, inset: 0, opacity: o * 0.5, background: "repeating-linear-gradient(115deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0) 120px, rgba(255,255,255,.35) 160px, rgba(255,255,255,0) 210px)" }} />
    </div>
  );
}

/* 5.1 – 9.2 · Introducing + the shelves card */
function Intro({ t, w, h, u, land, cx, cy, p }: Ctx) {
  const up = ease.inOut(P(t, 6.55, 7.35));
  const fs = (land ? 80 : 70) * u;
  const ty = lerp(cy - fs * 0.6, h * (land ? 0.12 : 0.17), up);
  const CW = land ? Math.min(1500 * u, w * 0.8) : w * 0.9;
  const cRise = ease.expo(P(t, 6.75, 7.75));
  const cTop = lerp(h + 60 * u, h * (land ? 0.32 : 0.3), cRise);
  const shelves = [
    { k: "Components", v: String(p.count), d: `${p.free ?? 68} free` },
    { k: "Blocks", v: String(p.sections ?? 106), d: `in ${p.blocks ?? 21} blocks` },
    { k: "Templates", v: String(p.templates ?? 25), d: "landing pages" },
    { k: "Sounds", v: String(p.sounds ?? 24), d: "made in code" },
  ];
  const out = ease.in(P(t, 9.0, 9.25));
  const liveH = (land ? 330 : 520) * u;
  const trio = land ? ["bubbles", "island", "ruler"] : ["bubbles", "island"];
  return (
    <div style={{ ...abs, inset: 0, opacity: 1 - out, filter: out ? `blur(${out * 12}px)` : undefined, transform: `scale(${1 + out * 0.04})` }}>
      <RingBg t={t} w={w} h={h} u={u} y={lerp(0.5, 0.4, up)} R={land ? 620 : 520} />
      <div style={{ ...abs, left: 0, right: 0, top: ty, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: fs, letterSpacing: "-0.04em", color: INK, lineHeight: 1.1 }}>
        <Reveal t={t} at={5.25} by="char" per={0.045} dur={0.4} segs={[["Introducing "], [p.brand, rainbow]]} />
      </div>
      <div style={{ ...abs, left: cx - CW / 2, top: cTop, width: CW, ...card(u, 28), overflow: "hidden", padding: `${26 * u}px ${30 * u}px ${30 * u}px` }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 * u, marginBottom: 18 * u }}>
          <AppIcon size={34 * u} />
          <span style={{ fontFamily: TEXT, fontWeight: 600, fontSize: 20 * u, color: INK }}>What&apos;s on the shelves</span>
        </div>
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: land ? "repeat(4, 1fr)" : "repeat(2, 1fr)", gap: 12 * u }}>
          {shelves.map((tl, i) => {
            const q = ease.out(P(t, 7.2 + i * 0.08, 7.8 + i * 0.08));
            return (
              <div key={i} style={{ borderRadius: 16 * u, padding: `${14 * u}px ${18 * u}px`, background: i === 0 ? "rgba(0,113,227,.06)" : CANVAS, boxShadow: i === 0 ? `0 0 0 ${2 * u}px ${p.blue}` : undefined, opacity: clamp(q * 1.5), transform: `translateY(${(1 - q) * 14 * u}px)` }}>
                <div style={{ fontFamily: TEXT, fontSize: 15 * u, color: SUB, fontWeight: 500 }}>{tl.k}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 * u, marginTop: 4 * u }}>
                  <Odometer text={tl.v} q={ease.out(P(t, 7.3 + i * 0.1, 8.6))} size={34 * u} style={{ fontFamily: FONT, fontWeight: 600, fontSize: 34 * u, color: INK }} />
                  <span style={{ fontFamily: TEXT, fontSize: 13 * u, color: i === 0 ? "#1f8a46" : SUB, fontWeight: 500 }}>{tl.d}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: `repeat(${trio.length}, 1fr)`, gap: 12 * u, marginTop: 14 * u, height: liveH }}>
          {trio.map((k, i) => {
            const q = ease.out(P(t, 7.5 + i * 0.1, 8.1 + i * 0.1));
            const bw = (CW - 60 * u - 12 * u * (trio.length - 1)) / trio.length;
            return (
              <div key={k} style={{ position: "relative", borderRadius: 18 * u, background: CANVAS, overflow: "hidden", opacity: clamp(q * 1.4), transform: `translateY(${(1 - q) * 20 * u}px)` }}>
                {t > 6.4 && <Live k={k} bw={bw} bh={liveH} fill={0.84} maxScale={1.3 * u} />}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ ...abs, left: 0, right: 0, bottom: 0, height: h * 0.1, background: "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,.9))" }} />
    </div>
  );
}

function BlueRise({ t, w, h, u, k }: { t: number; w: number; h: number; u: number; k: number }) {
  return (
    <div style={{ ...abs, inset: 0, background: "#fff", overflow: "hidden" }}>
      <div style={{ ...abs, left: -w * 0.25, top: lerp(h * 0.9, h * 0.5, k), width: w * 1.5, height: h * 1.1, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 50%, #0058c4 0%, #0a74e8 32%, rgba(90,150,245,.75) 52%, rgba(255,255,255,0) 70%)", filter: `blur(${30 * u}px)`, transform: `translateX(${Math.sin(t * 0.6) * 30 * u}px)` }} />
    </div>
  );
}

/* 9.2 – 11 · Not bolted onto your app. */
function NotBolted({ t, w, h, u, land, cy }: Ctx) {
  const fs = (land ? 92 : 76) * u;
  const k = ease.out(P(t, 9.15, 10.4));
  return (
    <div style={{ ...abs, inset: 0 }}>
      <BlueRise t={t} w={w} h={h} u={u} k={k} />
      <div style={{ ...abs, left: 0, right: 0, top: cy - fs * 0.62, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: fs, letterSpacing: "-0.04em", color: INK, padding: `0 ${50 * u}px`, lineHeight: 1.08 }}>
        <Reveal t={t} at={9.3} per={0.2} segs={[["Not "], ["bolted", rainbow], [" onto your app."]]} out={10.75} />
      </div>
    </div>
  );
}

function Chain({ size, pa, pb, rot }: { size: number; pa: number; pb: number; rot: number }) {
  const L = 168, H = 74, sw = 22;
  const link = (x: number, id: string) => (
    <g transform={`translate(${x},0)`}>
      <rect x={-L / 2} y={-H / 2} width={L} height={H} rx={H / 2} fill="none" stroke={`url(#${id})`} strokeWidth={sw} />
      <rect x={-L / 2} y={-H / 2} width={L} height={H} rx={H / 2} fill="none" stroke="rgba(255,255,255,.75)" strokeWidth={3} transform="translate(0,-5)" />
      <rect x={-L / 2 + 8} y={-H / 2 + 8} width={L - 16} height={H - 16} rx={H / 2 - 8} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth={2} />
    </g>
  );
  const ax = -70 - (1 - pa) * 520;
  const bx = 70 + (1 - pb) * 520;
  return (
    <svg width={size} height={size} viewBox="-200 -200 400 400" style={{ overflow: "visible", display: "block", filter: "drop-shadow(0 18px 24px rgba(20,60,140,.25))" }}>
      <defs>
        <linearGradient id="lf-silver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f6fb" />
          <stop offset="0.45" stopColor="#b9c0cf" />
          <stop offset="0.7" stopColor="#e9edf5" />
          <stop offset="1" stopColor="#8c95a8" />
        </linearGradient>
        <linearGradient id="lf-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b5d6ff" />
          <stop offset="0.4" stopColor="#2f8bf5" />
          <stop offset="0.75" stopColor="#7fb6ff" />
          <stop offset="1" stopColor="#0058c4" />
        </linearGradient>
        <clipPath id="lf-cross">
          <circle cx={ax + 70} cy={-29} r={22} />
        </clipPath>
      </defs>
      <g transform={`rotate(${rot})`}>
        {link(ax, "lf-silver")}
        {link(bx, "lf-blue")}
        {pa > 0.97 && pb > 0.97 && <g clipPath="url(#lf-cross)">{link(ax, "lf-silver")}</g>}
      </g>
    </svg>
  );
}

function Pill({ u, icon, label, style }: { u: number; icon: ReactNode; label: string; style?: CSSProperties }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 18 * u, padding: `${16 * u}px ${38 * u}px ${16 * u}px ${16 * u}px`, borderRadius: 999, background: "#fff", boxShadow: `0 0 0 ${1 * u}px rgba(20,30,60,.05), 0 ${14 * u}px ${36 * u}px rgba(20,40,90,.10)`, fontFamily: FONT, fontWeight: 600, fontSize: 46 * u, letterSpacing: "-0.02em", color: INK, ...style }}>
      <div style={{ width: 70 * u, height: 70 * u, borderRadius: "50%", background: CANVAS, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      {label}
    </div>
  );
}

/* 11 – 13.6 · Built into your codebase. */
function Built({ t, w, h, u, land, cx, cy, p }: Ctx) {
  const fs = (land ? 66 : 60) * u;
  const pl = ease.expo(P(t, 11.15, 11.85));
  const pa = ease.out(P(t, 11.7, 12.15));
  const pb = ease.out(P(t, 11.75, 12.2));
  const snap = spring(t - 12.18, 0.4, 16);
  const rot = lerp(-15, -42, ease.out(P(t, 11.7, 12.3))) + (t > 12.18 ? (1 - snap) * 6 : 0);
  const glow = ease.out(P(t, 11.0, 12.4));
  const gap = land ? 480 * u : 0;
  const out = ease.in(P(t, 13.35, 13.6));
  const iconA = <AppIcon size={46 * u} />;
  const iconB = <span style={{ fontFamily: MONO, fontSize: 26 * u, fontWeight: 600, color: INK }}>{"</>"}</span>;
  return (
    <div style={{ ...abs, inset: 0, opacity: 1 - out * 0.6, transform: `scale(${1 + out * 0.25})`, filter: out ? `blur(${out * 14}px)` : undefined }}>
      <div style={{ ...abs, inset: 0, background: "#fff" }} />
      <div style={{ ...abs, left: -w * 0.2, top: h * 0.7, width: w * 1.4, height: h * 0.8, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(10,116,232,.8), rgba(90,150,245,.45) 40%, rgba(255,255,255,0) 68%)", filter: `blur(${40 * u}px)`, opacity: lerp(0.4, 1, glow) }} />
      <div style={{ ...abs, left: 0, right: 0, top: h * (land ? 0.18 : 0.2), textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: fs, letterSpacing: "-0.04em", color: INK }}>
        <Reveal t={t} at={11.05} per={0.12} segs={[["Built into your "], ["codebase.", rainbow]]} />
      </div>
      {land ? (
        <>
          <div style={{ ...abs, right: cx + gap * 0.25, top: cy - 51 * u, opacity: clamp(pl * 1.5), transform: `translateX(${(1 - pl) * -160 * u}px)` }}>
            <Pill u={u} label={p.brand} icon={iconA} />
          </div>
          <div style={{ ...abs, left: cx + gap * 0.25, top: cy - 51 * u, opacity: clamp(pl * 1.5), transform: `translateX(${(1 - pl) * 160 * u}px)` }}>
            <Pill u={u} label="Your app" icon={iconB} />
          </div>
        </>
      ) : (
        <>
          <div style={{ ...abs, left: 0, right: 0, top: h * 0.53 - 270 * u, display: "flex", justifyContent: "center", opacity: clamp(pl * 1.5), transform: `translateY(${(1 - pl) * -80 * u}px)` }}>
            <Pill u={u} label={p.brand} icon={iconA} />
          </div>
          <div style={{ ...abs, left: 0, right: 0, top: h * 0.53 + 170 * u, display: "flex", justifyContent: "center", opacity: clamp(pl * 1.5), transform: `translateY(${(1 - pl) * 80 * u}px)` }}>
            <Pill u={u} label="Your app" icon={iconB} />
          </div>
        </>
      )}
      <div style={{ ...abs, left: cx - (land ? 230 : 170) * u, top: (land ? cy : h * 0.53) - (land ? 230 : 170) * u, transform: land ? undefined : "rotate(90deg)" }}>
        <Chain size={(land ? 460 : 340) * u} pa={pa} pb={pb} rot={rot} />
      </div>
    </div>
  );
}

/* 13.6 – 17.2 · One component becomes … 205 components, one system */
const TILE_BG = ["linear-gradient(180deg,#5ac8fa,#007aff)", "linear-gradient(180deg,#ff6482,#ff2d55)", "linear-gradient(180deg,#ffe066,#ffcc00)", "linear-gradient(180deg,#7ee08f,#34c759)", "linear-gradient(180deg,#bf9bff,#8b5cf6)", "linear-gradient(180deg,#ffb36b,#ff8a00)", "linear-gradient(180deg,#f5f5f7,#d9d9de)", "linear-gradient(180deg,#2c2c2e,#000)"];
function Network({ t, w, h, u, land, cx, cy, p }: Ctx) {
  const z = ease.expo(P(t, 13.6, 14.45));
  const sc = lerp(9, 1, z);
  const fs = (land ? 96 : 84) * u;
  const ico = (land ? 150 : 140) * u;
  const flip = ease.inOut(P(t, 14.6, 15.0));
  const dbl = ease.out(P(t, 14.75, 15.1));
  const wipe = ease.inOut(P(t, 15.15, 15.7));
  const R = wipe * Math.hypot(w, h) * 1.05;
  const net = t > 15.15;
  const cs = (land ? 70 : 66) * u;
  const tiles: { x: number; y: number; d: number; i: number }[] = [];
  const cols = Math.ceil(w / (cs * 1.25)) + 1;
  const rows = Math.ceil(h / (cs * 1.25)) + 1;
  let n = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const x = c * cs * 1.25 + (r % 2 ? cs * 0.62 : 0) - cs * 0.2;
      const y = r * cs * 1.25 - cs * 0.1;
      const fx = x / w, fy = y / h;
      const field = Math.sin(fx * 6.1 + fy * 2.3) + Math.cos(fy * 5.3 - fx * 3.1) + Math.sin((fx + fy) * 4.7);
      if (field < 0.2) continue;
      if (Math.abs(y - cy) < fs * (land ? 1.1 : 1.7) && Math.abs(x - cx) < w * (land ? 0.33 : 0.48)) continue;
      tiles.push({ x, y, d: Math.hypot(x - cx, y - cy) / Math.hypot(w, h), i: n++ });
    }
  const fsN = (land ? 84 : 70) * u;
  const end = ease.in(P(t, 17.0, 17.25));
  const roll = ease.out(P(t, 15.5, 16.6));
  return (
    <div style={{ ...abs, inset: 0, background: "#fff", opacity: 1 - end }}>
      <div style={{ ...abs, left: -w * 0.2, top: h * 0.78, width: w * 1.4, height: h * 0.7, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(10,116,232,.35), rgba(255,255,255,0) 65%)", filter: `blur(${40 * u}px)` }} />
      <div style={{ ...abs, inset: 0, display: "flex", flexDirection: land ? "row" : "column", alignItems: "center", justifyContent: "center", gap: 34 * u, transformOrigin: land ? "30% 50%" : "50% 40%", transform: `scale(${sc})`, filter: z < 0.9 ? `blur(${(1 - z) * 6}px)` : undefined }}>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: fs, letterSpacing: "-0.045em", color: INK, whiteSpace: "pre" }}>One component</div>
        <div style={{ position: "relative", width: ico, height: ico, transform: `translateX(${-dbl * ico * 0.25}px)` }}>
          <div style={{ ...abs, left: dbl * ico * 0.5, top: dbl * ico * 0.18, opacity: dbl, filter: `drop-shadow(0 ${10 * u}px ${20 * u}px rgba(0,0,0,.2))` }}>
            <AppIcon size={ico * 0.86} />
          </div>
          <div style={{ ...abs, left: 0, top: 0, transform: `perspective(${ico * 6}px) rotateY(${flip * 180}deg) scale(${1 + Math.sin(flip * Math.PI) * 0.08})`, filter: `drop-shadow(0 ${12 * u}px ${24 * u}px rgba(0,0,0,.22))` }}>
            <AppIcon size={ico} />
          </div>
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: fs * 0.9, letterSpacing: "-0.04em", color: "#6e6e73", whiteSpace: "pre", marginLeft: dbl * ico * 0.2 }}>
          <Reveal t={t} at={14.85} segs={[["becomes"]]} />
        </div>
      </div>
      {net && (
        <div style={{ ...abs, inset: 0, clipPath: `circle(${R}px at ${land ? cx + 60 * u : cx}px ${cy}px)`, background: "linear-gradient(180deg, #2f8bf5 0%, #0a6fe0 45%, #0052b8 100%)", overflow: "hidden" }}>
          <div style={{ ...abs, inset: 0, background: "repeating-linear-gradient(118deg, rgba(255,255,255,0) 0, rgba(255,255,255,0) 160px, rgba(255,255,255,.1) 230px, rgba(255,255,255,0) 300px)", transform: `translateX(${(t - 15) * 30 * u}px)` }} />
          {tiles.map((c) => {
            const st = 15.3 + c.d * 1.2;
            if (t < st) return null;
            const s = spring(t - st, 0.55, 12);
            const dx = Math.sin(t * 0.8 + c.i) * 4 * u;
            const dy = Math.cos(t * 0.7 + c.i * 1.3) * 4 * u;
            const icon = c.i % 9 === 4;
            return (
              <div key={c.i} style={{ ...abs, left: c.x + dx - cs / 2, top: c.y + dy - cs / 2, width: cs, height: cs, transform: `scale(${s})` }}>
                {icon ? (
                  <AppIcon size={cs} style={{ filter: "drop-shadow(0 6px 12px rgba(0,20,80,.35))" }} />
                ) : (
                  <div style={{ width: cs, height: cs, borderRadius: cs * 0.225, background: TILE_BG[Math.floor(rand(c.i * 7.7) * TILE_BG.length)], boxShadow: `inset 0 ${1 * u}px 0 rgba(255,255,255,.35), 0 ${6 * u}px ${12 * u}px rgba(0,20,80,.3)`, opacity: 0.95 }} />
                )}
              </div>
            );
          })}
          <div style={{ ...abs, left: 0, right: 0, top: cy - fsN * (land ? 0.66 : 1.2), textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: fsN, letterSpacing: "-0.045em", color: "#fff", textShadow: "0 4px 30px rgba(0,20,90,.35)" }}>
            <span style={{ display: "inline-flex", alignItems: "baseline", opacity: clamp(P(t, 15.55, 15.8) * 2) }}>
              <Odometer text={String(p.count)} q={roll} size={fsN} style={{ fontFamily: FONT, fontWeight: 700 }} />
            </span>
            <Reveal t={t} at={15.75} per={0.14} segs={[[" components."]]} />
            {land ? " " : <br />}
            <Reveal t={t} at={16.05} per={0.14} segs={[["One system.", { fontWeight: 700 }]]} />
          </div>
        </div>
      )}
    </div>
  );
}

/** A screenshot of the real site, fitted into a box, scrolled by `sy` page pixels. */
function Shot({ src, pw, ph, bw, bh, sy = 0, fit = "width" }: { src: string; pw: number; ph: number; bw: number; bh: number; sy?: number; fit?: "width" | "cover" }) {
  const s = fit === "width" ? bw / pw : Math.max(bw / pw, bh / ph);
  return (
    <div style={{ ...abs, left: 0, top: 0, width: bw, height: bh, overflow: "hidden", background: CANVAS }}>
      <img src={src} alt="" style={{ ...abs, left: (bw - pw * s) / 2, top: -sy * s, width: pw * s, height: ph * s, maxWidth: "none" }} />
    </div>
  );
}

/* 17.2 – 20.8 · One install, split screen over the real hero */
function Install({ t, w, h, u, land, p }: Ctx) {
  const split = ease.inOut(P(t, 17.85, 18.5));
  const panel = land ? lerp(0, w * 0.5, split) : lerp(0, h * 0.42, split);
  const photoBox = land ? { left: panel, top: 0, width: w - panel, height: h } : { left: 0, top: panel, width: w, height: h - panel };
  const pcx = photoBox.left + photoBox.width / 2;
  const mainIn = spring(t - 17.25, 0.7, 10);
  const mainS = lerp(1.2, land ? 0.82 : 0.9, split) * lerp(0.9, 1, mainIn);
  const mainY = photoBox.top + photoBox.height * lerp(0.5, land ? 0.3 : 0.26, split);
  const lines = ease.inOut(P(t, 18.55, 19.1));
  const kids = [0, 1].map((i) => ease.expo(P(t, 18.9 + i * 0.12, 19.6 + i * 0.12)));
  const kidY = photoBox.top + photoBox.height * 0.62;
  const kidDX = (land ? 0.22 : 0.24) * photoBox.width;
  const MW = 640 * u;
  const KW = (land ? 360 : 400) * u;
  const KH = KW * (784 / 1490) + 46 * u;
  const out = ease.in(P(t, 20.55, 20.8));
  const fs = (land ? 76 : 70) * u;
  const heroS = lerp(1.12, 1.02, ease.out(P(t, 17.2, 20.8)));
  return (
    <div style={{ ...abs, inset: 0, background: "#fff", opacity: 1 - out }}>
      <div style={{ ...abs, ...photoBox, overflow: "hidden" }}>
        <div style={{ ...abs, left: 0, top: 0, width: photoBox.width, height: photoBox.height, transform: `scale(${heroS})`, transformOrigin: "50% 40%" }}>
          <Shot src={shotHeroLight} pw={1490} ph={784} bw={photoBox.width} bh={photoBox.height} fit="cover" />
        </div>
        <div style={{ ...abs, inset: 0, background: "linear-gradient(180deg, rgba(20,40,90,.05), rgba(20,40,90,.22))" }} />
      </div>
      <svg width={w} height={h} style={{ ...abs, left: 0, top: 0, overflow: "visible" }}>
        {[-1, 1].map((sgn) => {
          const midY = (mainY + 70 * u + kidY - KH / 2) / 2;
          const d = `M${pcx},${mainY + 60 * u} L${pcx},${midY} L${pcx + sgn * kidDX},${midY} L${pcx + sgn * kidDX},${kidY - KH / 2}`;
          return <path key={sgn} d={d} fill="none" stroke="rgba(29,29,31,.55)" strokeWidth={2.5 * u} pathLength={1000} style={{ strokeDasharray: `${lines * 1000} 1000` }} />;
        })}
        {lines > 0.4 && <circle cx={pcx} cy={(mainY + 70 * u + kidY - KH / 2) / 2} r={6 * u * clamp((lines - 0.4) * 3)} fill={INK} />}
      </svg>
      <div style={{ ...abs, left: pcx - MW / 2, top: mainY - 60 * u, width: MW, height: 120 * u, transform: `scale(${mainS})`, opacity: clamp(mainIn * 2), ...glass(u, 28), display: "flex", alignItems: "center", gap: 20 * u, padding: `0 ${24 * u}px` }}>
        <AppIcon size={72 * u} style={{ flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 13 * u, letterSpacing: "0.08em", color: "rgba(20,25,40,.7)" }}>INSTALL</div>
          <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 24 * u, letterSpacing: "-0.01em", color: INK, whiteSpace: "nowrap" }}>npx shadcn add {p.pkg}</div>
        </div>
      </div>
      {[-1, 1].map((sgn, i) => (
        <div key={sgn} style={{ ...abs, left: pcx + sgn * kidDX - KW / 2, top: kidY - KH / 2, width: KW, height: KH, opacity: clamp(kids[i] * 1.5), transform: `translateY(${(1 - kids[i]) * 40 * u}px) scale(${lerp(0.9, 1, kids[i])})`, ...glass(u, 20), padding: 8 * u }}>
          <div style={{ position: "relative", width: KW - 16 * u, height: (KW - 16 * u) * (784 / 1490), borderRadius: 13 * u, overflow: "hidden" }}>
            <Shot src={i === 0 ? shotHeroLight : shotHeroDark} pw={1490} ph={784} bw={KW - 16 * u} bh={(KW - 16 * u) * (784 / 1490)} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${9 * u}px ${6 * u}px 0` }}>
            <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 22 * u, color: INK, letterSpacing: "-0.02em" }}>{i === 0 ? "Light" : "Dark"}</span>
            <span style={{ fontFamily: MONO, fontSize: 13 * u, color: "rgba(20,25,40,.65)" }}>theme=&quot;{i === 0 ? "light" : "dark"}&quot;</span>
          </div>
        </div>
      ))}
      <div style={{ ...abs, left: 0, top: 0, width: land ? panel : w, height: land ? h : panel, overflow: "hidden", background: "#fff" }}>
        <div style={{ ...abs, left: land ? 110 * u - (w * 0.5 - panel) : 80 * u, top: land ? h / 2 - fs * 1.75 : panel - fs * 3.5 - 50 * u, width: land ? w * 0.42 : w - 120 * u, fontFamily: FONT, fontWeight: 600, fontSize: fs, letterSpacing: "-0.045em", color: INK, lineHeight: 1.08 }}>
          <div><Reveal t={t} at={18.2} segs={[["One install."]]} /></div>
          <div><Reveal t={t} at={18.55} segs={[["Light and dark,"]]} /></div>
          <div><Reveal t={t} at={18.85} segs={[["built in.", rainbow]]} /></div>
        </div>
      </div>
    </div>
  );
}

/** Soft colour wash in the site's gradient colours. */
function Wash({ t, w, h, u }: { t: number; w: number; h: number; u: number }) {
  const S = Math.max(w, h);
  const b = (x: number, y: number, r: number, c: string, k: number) => (
    <div style={{ ...abs, left: w * x - S * r + Math.sin(t * 0.3 + k) * 40 * u, top: h * y - S * r + Math.cos(t * 0.25 + k) * 30 * u, width: S * r * 2, height: S * r * 2, borderRadius: "50%", background: `radial-gradient(circle, ${c}, transparent 62%)`, filter: `blur(${40 * u}px)` }} />
  );
  return (
    <div style={{ ...abs, inset: 0, background: CANVAS, overflow: "hidden" }}>
      {b(0.1, 0.15, 0.45, "rgba(27,124,245,.38)", 0)}
      {b(0.85, 0.1, 0.4, "rgba(193,79,214,.28)", 1.3)}
      {b(0.9, 0.95, 0.45, "rgba(246,104,31,.26)", 2.1)}
      {b(0.15, 0.95, 0.4, "rgba(106,92,242,.3)", 3.4)}
    </div>
  );
}

/** A frameless browser window around a page screenshot. */
function Browser({ u, W, H, url, children }: { u: number; W: number; H: number; url: string; children: ReactNode }) {
  const bar = 44 * u;
  return (
    <div style={{ width: W, height: H, borderRadius: 18 * u, overflow: "hidden", background: "#fff", boxShadow: `0 0 0 ${1 * u}px rgba(0,0,0,.06), 0 ${30 * u}px ${80 * u}px rgba(20,30,70,.25)`, position: "relative" }}>
      <div style={{ height: bar, display: "flex", alignItems: "center", gap: 8 * u, padding: `0 ${16 * u}px`, background: "#fbfbfd", borderBottom: `${1 * u}px solid rgba(0,0,0,.06)` }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} style={{ width: 12 * u, height: 12 * u, borderRadius: "50%", background: c }} />)}
        <div style={{ margin: "0 auto", height: 26 * u, padding: `0 ${18 * u}px`, borderRadius: 8 * u, background: "#f0f0f3", display: "flex", alignItems: "center", gap: 6 * u, fontFamily: TEXT, fontSize: 13 * u, color: "#4a4a50" }}>
          <svg width={11 * u} height={11 * u} viewBox="0 0 24 24" fill="none" stroke="#86868b" strokeWidth="2.6"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
          {url}
        </div>
        <span style={{ width: 52 * u }} />
      </div>
      <div style={{ position: "relative", height: H - bar }}>{children}</div>
    </div>
  );
}

/* 20.8 – 26.2 · the real site in a browser window */
function Docs({ t, w, h, u, land, cx, cy, p }: Ctx) {
  const PW = 1490;
  const vh = land ? 784 : Math.round(PW * 1.55);
  const W = land ? Math.min(w * 0.84, (h * 0.86 - 44 * u) * (PW / vh)) : w * 0.9;
  const s = W / PW;
  const H = vh * s + 44 * u;
  const pull = ease.inOut(P(t, 20.8, 21.8));
  const sc = lerp(1.3, 1, pull);
  const ry = lerp(10, 0, pull);
  const rx = lerp(7, 0, pull);
  const page2 = t > 23.45;
  const xf = ease.inOut(P(t, 23.3, 23.65));
  const sy1 = ease.inOut(P(t, 21.6, 23.1)) * (land ? 1150 : 700);
  const sy2 = ease.inOut(P(t, 23.9, 25.5)) * (land ? 1900 : 1350);
  const cap1 = t < 23.55;
  const fs = (land ? 92 : 84) * u;
  const capT = cap1 ? 21.5 : 23.7;
  const out = ease.in(P(t, 26.0, 26.25));
  const winIn = ease.out(P(t, 20.8, 21.3));
  return (
    <div style={{ ...abs, inset: 0, opacity: 1 - out }}>
      <Wash t={t} w={w} h={h} u={u} />
      <div style={{ ...abs, left: cx - W / 2, top: cy - H / 2 - (land ? 20 : 60) * u, width: W, height: H, transform: `perspective(2400px) scale(${sc}) rotateY(${ry}deg) rotateX(${rx}deg)`, opacity: clamp(winIn * 1.5) }}>
        <Browser u={u} W={W} H={H} url={page2 ? `${p.url}/components/mac-keyboard` : p.url}>
          <div style={{ ...abs, inset: 0, opacity: 1 - xf }}>
            <Shot src={shotHome} pw={PW} ph={2996} bw={W} bh={H - 44 * u} sy={sy1} />
          </div>
          {xf > 0 && (
            <div style={{ ...abs, inset: 0, opacity: xf, transform: `translateY(${(1 - xf) * 16 * u}px)` }}>
              <Shot src={shotKeyboard} pw={PW} ph={2680} bw={W} bh={H - 44 * u} sy={sy2} />
            </div>
          )}
        </Browser>
      </div>
      <div style={{ ...abs, left: 0, right: 0, bottom: 0, height: h * 0.34, background: "linear-gradient(180deg, rgba(245,245,247,0), rgba(245,245,247,.92) 70%)", opacity: ease.out(P(t, 21.3, 21.8)) }} />
      <div style={{ ...abs, left: 0, right: 0, bottom: h * 0.07, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: fs, letterSpacing: "-0.045em", color: INK }}>
        <Reveal key={cap1 ? "a" : "b"} t={t} at={capT} segs={cap1 ? [["Every "], ["component.", rainbow]] : [["Every "], ["prop.", rainbow]]} out={cap1 ? 23.35 : 25.95} />
      </div>
    </div>
  );
}

/** Code card for the keyboard, used in the "automatically" shot. */
function CodeCard({ u, p, typed }: { u: number; p: LaunchFilmProps; typed: number }) {
  const lines: [string, string][] = [
    ["<MacKeyboard", ""],
    ["  layout=", '"compact"'],
    ["  theme=", '"light"'],
    ["  accent=", '"#0a84ff"'],
    ["  autoplay", ""],
    ["/>", ""],
  ];
  return (
    <div style={{ width: 470 * u, ...card(u, 22), padding: `${18 * u}px ${22 * u}px`, fontFamily: TEXT }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 * u, paddingBottom: 14 * u, borderBottom: `${1 * u}px solid rgba(20,30,60,.07)` }}>
        <AppIcon size={30 * u} />
        <span style={{ fontWeight: 600, fontSize: 19 * u, color: INK }}>Mac Keyboard</span>
        <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 12 * u, color: SUB }}>keyboard.tsx</span>
      </div>
      <div style={{ padding: `${14 * u}px 0`, fontFamily: MONO, fontSize: 16 * u, lineHeight: 1.65 }}>
        {lines.map(([a, b], i) => (
          <div key={i} style={{ opacity: clamp(typed * 8 - i), color: INK }}>
            <span style={{ color: i === 0 || i === 5 ? "#c2410c" : "#5856d6" }}>{a}</span>
            <span style={{ color: p.blue }}>{b}</span>
          </div>
        ))}
      </div>
      <div style={{ height: 42 * u, borderRadius: 10 * u, background: "rgba(48,209,88,.12)", boxShadow: `inset 0 0 0 ${1 * u}px rgba(48,209,88,.35)`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 * u, color: "#1f8a46", fontWeight: 600, fontSize: 15 * u }}>
        <span style={{ width: 20 * u, height: 20 * u, borderRadius: "50%", background: "#2fb75c", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={14 * u} /></span>
        {Math.round(lerp(0, 17, typed))} props, all typed
      </div>
    </div>
  );
}

/* 26.2 – 31.2 · the live keyboard as a playground → white, automatically */
function Playground({ t, w, h, u, land, cx, cy, p }: Ctx) {
  const white = ease.inOut(P(t, 28.5, 29.0));
  const fs = (land ? 68 : 58) * u;
  const kIn = spring(t - 26.35, 0.7, 10);
  const KW = (land ? 760 : 900) * u;
  const KH = KW * 0.5;
  const kY = cy + (land ? 90 : 60) * u;
  const chips = [
    { k: "theme", v: '"light"', x: land ? -0.3 : -0.27, y: land ? -0.2 : -0.13 },
    { k: "accent", v: '"#0a84ff"', x: 0, y: land ? -0.25 : -0.17 },
    { k: "layout", v: '"compact"', x: land ? 0.3 : 0.27, y: land ? -0.2 : -0.13 },
  ];
  const typed = ease.out(P(t, 29.3, 30.4));
  const zoom = ease.in(P(t, 31.0, 31.25));
  const pills = [
    { label: "TypeScript types included", color: p.blue, bg: "rgba(0,113,227,.08)", ring: "rgba(0,113,227,.25)" },
    { label: "Light and dark themes", color: "#8b5cf6", bg: "rgba(139,92,246,.08)", ring: "rgba(139,92,246,.25)" },
  ];
  const pq = [0, 1].map((i) => ease.expo(P(t, 29.45 + i * 0.25, 30.1 + i * 0.25)));
  const cardY = cy + (land ? 40 : 0) * u;
  const plY = land ? cardY : cardY + 260 * u;
  return (
    <div style={{ ...abs, inset: 0, opacity: 1 - zoom }}>
      <div style={{ ...abs, inset: 0, opacity: 1 - white }}>
        <Wash t={t} w={w} h={h} u={u} />
      </div>
      <div style={{ ...abs, inset: 0, background: "#fff", opacity: white }} />
      <div style={{ ...abs, left: 0, right: 0, top: h * (land ? 0.1 : 0.15), textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: fs, letterSpacing: "-0.04em", color: INK, padding: `0 ${40 * u}px` }}>
        {t < 28.75 ? (
          <Reveal t={t} at={26.3} per={0.1} segs={[["The docs are "], ["the playground.", rainbow]]} out={28.45} />
        ) : (
          <Reveal t={t} at={28.75} per={0.1} segs={[["Every prop typed. "], ["Automatically.", t > 29.9 ? rainbow : { color: "rgba(29,29,31,.4)" }]]} />
        )}
      </div>
      <div style={{ ...abs, left: cx - KW / 2, top: kY - KH / 2, width: KW, height: KH, opacity: clamp(kIn * 2) * (1 - white), transform: `scale(${lerp(0.94, 1, kIn) * lerp(1, 0.9, white)})`, ...card(u, 28), overflow: "hidden" }}>
        {t < 29.1 && <Live k="keyboard" bw={KW} bh={KH} fill={0.9} maxScale={2.2 * u} />}
      </div>
      <svg width={w} height={h} style={{ ...abs, left: 0, top: 0, overflow: "visible", opacity: 1 - white }}>
        {chips.map((c, i) => {
          const q = ease.inOut(P(t, 27.1 + i * 0.12, 27.6 + i * 0.12));
          const x = cx + c.x * w, y = cy + c.y * h + 30 * u;
          const ex = cx + c.x * KW * 0.8;
          return <path key={i} d={`M${x},${y + 36 * u} C${x},${kY - KH / 2 - 50 * u} ${ex},${kY - KH / 2 - 50 * u} ${ex},${kY - KH / 2}`} fill="none" stroke="rgba(29,29,31,.35)" strokeWidth={2 * u} pathLength={1000} style={{ strokeDasharray: `${q * 1000} 1000` }} />;
        })}
      </svg>
      {chips.map((c, i) => {
        const q = ease.expo(P(t, 26.75 + i * 0.12, 27.4 + i * 0.12));
        const x = cx + c.x * w, y = cy + c.y * h + 30 * u;
        return (
          <div key={i} style={{ ...abs, left: x - 120 * u, top: y - 36 * u, width: 240 * u, opacity: clamp(q * 1.5) * (1 - white), transform: `translateY(${(1 - q) * 30 * u}px)`, ...glass(u, 16), padding: `${10 * u}px ${16 * u}px` }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: TEXT, fontSize: 13 * u, color: "rgba(20,25,40,.7)", fontWeight: 600 }}><span>{c.k}</span><span>▾</span></div>
            <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 22 * u, color: INK, marginTop: 2 * u }}>{c.v}</div>
          </div>
        );
      })}
      <svg width={w} height={h} style={{ ...abs, left: 0, top: 0, overflow: "visible" }}>
        {[-1, 1].map((sgn, i) => {
          const q = ease.inOut(P(t, 29.35 + i * 0.25, 29.8 + i * 0.25));
          const x0 = land ? cx + sgn * 235 * u : cx;
          const x1 = land ? cx + sgn * 420 * u : cx;
          const y0 = land ? cardY : cardY + 175 * u;
          const y1 = land ? cardY : plY + i * 90 * u - 28 * u;
          return <path key={sgn} d={`M${x0},${y0} L${x1},${y1}`} fill="none" stroke="rgba(20,30,60,.18)" strokeWidth={2 * u} pathLength={1000} style={{ strokeDasharray: `${q * 1000} 1000` }} />;
        })}
      </svg>
      {pills.map((pl, i) => {
        const sgn = i === 0 ? -1 : 1;
        const q = pq[i];
        const PW = 360 * u;
        const left = land ? (sgn < 0 ? cx - 420 * u - PW : cx + 420 * u) : cx - PW / 2;
        const top = land ? cardY - 28 * u : plY + i * 90 * u - 28 * u;
        return (
          <div key={i} style={{ ...abs, left, top, width: PW, height: 56 * u, borderRadius: 99, background: pl.bg, boxShadow: `inset 0 0 0 ${1.5 * u}px ${pl.ring}`, display: "flex", alignItems: "center", gap: 10 * u, padding: `0 ${18 * u}px`, fontFamily: TEXT, fontWeight: 600, fontSize: 17 * u, color: pl.color, opacity: clamp(q * 1.5), transform: `translateX(${(1 - q) * -sgn * 40 * u}px)`, justifyContent: "center" }}>
            <span style={{ width: 24 * u, height: 24 * u, borderRadius: "50%", background: pl.color, display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={16 * u} /></span>
            {pl.label}
          </div>
        );
      })}
      {white > 0 && (
        <div style={{ ...abs, left: cx - 235 * u, top: cardY - 175 * u, opacity: clamp(white * 1.5), transform: `scale(${lerp(0.94, 1, white)})` }}>
          <CodeCard u={u} p={p} typed={typed} />
        </div>
      )}
    </div>
  );
}

/* 31.2 – 32.4 · zoom through "Automatically." into the live wall */
function ZoomThrough({ t, w, h, u, land, cx, cy }: Ctx) {
  const z = ease.in(P(t, 31.15, 31.95));
  const s = Math.exp(lerp(0, Math.log(26), z));
  const fs = (land ? 68 : 58) * u;
  const bgOut = ease.inOut(P(t, 31.35, 31.7));
  const fadeOut = ease.inOut(P(t, 32.15, 32.4));
  const ox = land ? cx + 150 * u : cx + 80 * u;
  const oy = h * (land ? 0.1 : 0.15) + fs * 0.62;
  return (
    <div style={{ ...abs, inset: 0, opacity: 1 - fadeOut }}>
      <Wall t={t} w={w} h={h} u={u} land={land} t0={31.15} push={0.04} />
      <div style={{ ...abs, inset: 0, background: "rgba(245,245,247,.35)" }} />
      <div style={{ ...abs, inset: 0, background: "#fff", opacity: 1 - bgOut }} />
      <div style={{ ...abs, left: 0, right: 0, top: h * (land ? 0.1 : 0.15), textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: fs, letterSpacing: "-0.04em", color: bgOut > 0.5 ? "#fff" : INK, transformOrigin: `${ox}px ${oy - h * (land ? 0.1 : 0.15)}px`, transform: `scale(${s})`, whiteSpace: "pre" }}>
        Every prop typed. Automatically.
      </div>
      <div style={{ ...abs, left: 0, right: 0, top: cy - (land ? 54 : 80) * u, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: (land ? 88 : 76) * u, letterSpacing: "-0.045em", color: INK, lineHeight: 1.05, textShadow: "0 0 40px rgba(245,245,247,1), 0 0 80px rgba(245,245,247,1)" }}>
        <Reveal t={t} at={31.65} segs={[["And it keeps"]]} />
        {land ? " " : <br />}
        <Reveal t={t} at={31.8} segs={[["moving.", rainbow]]} />
      </div>
    </div>
  );
}

const ROWS: [string, string, string, string][] = [
  ["Curved Reel", "Drag", "—", "2d ago"],
  ["Island Morph", "Press", "Sound", "2d ago"],
  ["Magnify Dock", "Hover", "Sound", "3d ago"],
  ["Packet Router", "Press", "—", "4d ago"],
  ["Ruler Picker", "Drag", "Sound", "5d ago"],
  ["Stretch Nav", "Press", "Sound", "1w ago"],
  ["Folder Peek", "Hover", "Sound", "1w ago"],
  ["Price Odometer", "Press", "—", "1w ago"],
];

function Notif({ u, badge }: { u: number; badge: number }) {
  return (
    <div style={{ position: "relative", width: 580 * u, ...card(u, 22), padding: `${18 * u}px ${22 * u}px`, display: "flex", gap: 14 * u, alignItems: "center", fontFamily: TEXT }}>
      <AppIcon size={54 * u} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700, fontSize: 18 * u, color: INK }}>New in Nexus UI: Glass Bubbles</span>
          <span style={{ fontSize: 14 * u, color: SUB }}>now</span>
        </div>
        <div style={{ fontSize: 16 * u, color: "#3d414c", marginTop: 3 * u }}>Glass orbs on threads. One command to add it.</div>
      </div>
      <div style={{ ...abs, right: -12 * u, top: -12 * u, width: 30 * u, height: 30 * u, borderRadius: "50%", background: "#ff3b30", color: "#fff", fontWeight: 700, fontSize: 15 * u, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${badge})` }}>1</div>
    </div>
  );
}

/* 32.4 – 35.6 · notification dragged into the table */
function Updates({ t, w, h, u, land, cx, cy }: Ctx) {
  const nIn = spring(t - 32.45, 0.65, 11);
  const badge = spring(t - 32.75, 0.4, 14);
  const TW = land ? 1180 * u : 960 * u;
  const tIn = ease.out(P(t, 33.3, 33.8));
  const shift = ease.inOut(P(t, 34.15, 34.8));
  const tx = land ? cx - TW / 2 + shift * 260 * u : cx - TW / 2;
  const ty = land ? h * 0.16 : h * 0.3 + shift * 60 * u;
  const rowH = 58 * u;
  const headH = 150 * u;
  const grabT = 33.15;
  const drag = ease.inOut(P(t, 33.3, 33.95));
  const nx0 = cx - 290 * u, ny0 = cy - 50 * u;
  const nx1 = tx + 20 * u, ny1 = ty + headH;
  const nx = lerp(nx0, nx1, drag), ny = lerp(ny0, ny1, drag);
  const landed = t > 33.95;
  const morph = ease.out(P(t, 33.85, 34.1));
  const curX = t < grabT ? lerp(w * 0.85, nx0 + 430 * u, ease.inOut(P(t, 32.7, grabT))) : nx + 430 * u;
  const curY = t < grabT ? lerp(h * 0.92, ny0 + 60 * u, ease.inOut(P(t, 32.7, grabT))) : ny + 60 * u;
  const fs = (land ? 84 : 70) * u;
  const out = ease.in(P(t, 35.4, 35.6));
  const maxRows = land ? 9 : Math.max(5, Math.min(9, Math.floor((h - ty - 260 * u) / rowH)));
  const all = [["Glass Bubbles", "Hover", "—", "now"] as [string, string, string, string], ...ROWS].slice(0, maxRows);
  return (
    <div style={{ ...abs, inset: 0, background: CANVAS, opacity: 1 - out }}>
      <div style={{ ...abs, left: tx, top: ty, width: TW, ...card(u, 24), padding: `${26 * u}px ${30 * u}px`, opacity: tIn, transform: `translateY(${(1 - tIn) * 30 * u}px)`, fontFamily: TEXT }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 30 * u, color: INK, letterSpacing: "-0.02em" }}>Your components</div>
        <div style={{ display: "inline-flex", marginTop: 12 * u, padding: `${6 * u}px ${12 * u}px`, borderRadius: 99, boxShadow: `0 0 0 ${1 * u}px rgba(20,30,60,.1)`, fontSize: 14 * u, color: "#4a4f5c" }}>◌ Moves on</div>
        <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1.2fr 1fr 1fr", marginTop: 18 * u, padding: `${10 * u}px ${12 * u}px`, fontSize: 14 * u, color: SUB, borderBottom: `${1 * u}px solid rgba(20,30,60,.08)` }}>
          <span>Component</span><span>Moves on</span><span>Sound</span><span>Added</span>
        </div>
        <div style={{ position: "relative", height: rowH * (maxRows - (land ? 1 : 0)) }}>
          {all.map((r, i) => {
            if (i === 0 && !landed) return null;
            const y = (i === 0 ? 0 : i - (landed ? 0 : 1) * (1 - ease.out(P(t, 33.85, 34.15)))) * rowH;
            const hl = i === 0 ? morph : 0;
            return (
              <div key={r[0]} style={{ ...abs, left: i === 0 ? lerp(-16, -40, hl) * u : 0, right: i === 0 ? lerp(-16, -40, hl) * u : 0, top: y, height: rowH, display: "grid", gridTemplateColumns: "2.2fr 1.2fr 1fr 1fr", alignItems: "center", padding: `0 ${12 * u + (i === 0 ? lerp(16, 40, hl) * u : 0)}px`, fontSize: 16 * u, color: i === 0 ? `rgba(255,255,255,${hl})` : "#2b2e36", borderRadius: i === 0 ? 14 * u : 0, background: i === 0 ? `linear-gradient(90deg, rgba(0,113,227,${hl}), rgba(60,140,240,${hl}))` : undefined, boxShadow: i === 0 ? `0 ${12 * u}px ${30 * u}px rgba(0,90,200,${0.35 * hl})` : undefined, borderBottom: i ? `${1 * u}px solid rgba(20,30,60,.05)` : undefined, zIndex: i === 0 ? 2 : 1 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 12 * u, fontWeight: 600 }}>
                  <span style={{ width: 30 * u, height: 30 * u, borderRadius: 8 * u, background: i === 0 ? "rgba(255,255,255,.25)" : TILE_BG[i % 6], boxShadow: "inset 0 1px 0 rgba(255,255,255,.35)" }} />
                  {r[0]}
                </span>
                <span>{r[1]}</span>
                <span>{r[2]}</span>
                <span>{r[3]}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ ...abs, left: land ? 90 * u : 0, right: land ? undefined : 0, top: land ? cy - fs * 1.1 : h * 0.13, textAlign: land ? "left" : "center", fontFamily: FONT, fontWeight: 600, fontSize: fs, letterSpacing: "-0.045em", color: INK, lineHeight: 1.04, opacity: shift > 0 ? 1 : 0, zIndex: 5 }}>
        <div style={{ background: land ? `linear-gradient(90deg,${CANVAS} 70%, rgba(245,245,247,0))` : undefined, paddingRight: 40 * u }}>
          <Reveal t={t} at={34.4} segs={[["Every new one"]]} />
          <br />
          <Reveal t={t} at={34.6} segs={[["lands.", rainbow]]} />
        </div>
      </div>
      {!landed && (
        <div style={{ ...abs, left: nx, top: ny, opacity: clamp(nIn * 2), transformOrigin: "0 0", transform: `scale(${lerp(0.9, 1, nIn) * lerp(1, 0.92, drag)}) rotate(${Math.sin(drag * Math.PI) * -3}deg)`, zIndex: 10 }}>
          <Notif u={u} badge={badge} />
        </div>
      )}
      {t > 32.65 && t < 34.3 && (t < grabT ? <Cursor x={curX} y={curY} size={44 * u} /> : <Hand x={curX} y={curY} size={46 * u} grab={t < 33.95} />)}
    </div>
  );
}

/** Real release notes from the Nexus UI repo. */
const REL: [string, string, string][] = [
  ["#68", "Mac sound style: every free sound re-voiced for a Mac or iPhone", "Live"],
  ["#66", "Mac Keyboard: type with your real keyboard on every preview", "Live"],
  ["#64", "Keyboards play a recorded key click the instant a key goes down", "Live"],
  ["#63", "Pro sound pack: 24 Pro sounds and a full sounds board", "Live"],
  ["#62", "Interface sound for 73 components, with a site-wide switch", "Live"],
  ["#60", "Every variant gets the same polish", "Live"],
  ["#59", "Open any preview full page", "Live"],
];

/* 35.6 – 38.8 · badge → releases table */
function Releases({ t, h, u, land, cx, cy, p }: Ctx) {
  const bIn = spring(t - 35.65, 0.55, 10);
  const rings = P(t, 35.7, 36.6);
  const fly = ease.inOut(P(t, 36.35, 36.95));
  const TW = land ? 1360 * u : 980 * u;
  const tIn = ease.out(P(t, 36.4, 37.0));
  const push = ease.inOut(P(t, 37.0, 37.5));
  const tTop = lerp(h * 0.22, h * (land ? 0.3 : 0.28), push);
  const bs = lerp(300 * u, 110 * u, fly);
  const bx = cx, by = lerp(cy, tTop - 10 * u, fly);
  const sweep = ease.inOut(P(t, 37.75, 38.25));
  const live = t > 38.15;
  const fs = (land ? 74 : 62) * u;
  const out = ease.in(P(t, 38.6, 38.8));
  const rowH = 62 * u;
  return (
    <div style={{ ...abs, inset: 0, background: CANVAS, opacity: 1 - out }}>
      <div style={{ ...abs, left: 0, right: 0, top: h * (land ? 0.1 : 0.12), textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: fs, letterSpacing: "-0.045em", color: INK, opacity: push > 0 ? 1 : 0 }}>
        <Reveal t={t} at={37.1} per={0.12} segs={[["Every release "], ["shipped.", rainbow]]} />
      </div>
      <div style={{ ...abs, left: cx - TW / 2, top: tTop, width: TW, ...card(u, 24), padding: `${24 * u}px ${28 * u}px`, opacity: tIn, transform: `translateY(${(1 - tIn) * 40 * u}px)`, fontFamily: TEXT, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 12 * u, fontFamily: FONT, fontWeight: 700, fontSize: 28 * u, color: INK, letterSpacing: "-0.02em" }}><AppIcon size={34 * u} />Releases</span>
          <span style={{ padding: `${8 * u}px ${14 * u}px`, borderRadius: 10 * u, background: p.blue, color: "#fff", fontSize: 14 * u, fontWeight: 600 }}>{p.url}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: land ? "0.5fr 4fr 1fr" : "0.6fr 3.4fr 1.2fr", marginTop: 18 * u, padding: `${10 * u}px ${12 * u}px`, fontSize: 14 * u, color: SUB, background: CANVAS, borderRadius: 10 * u }}>
          <span>PR</span><span>Change</span><span>Status</span>
        </div>
        {REL.map((r, i) => {
          const first = i === 0;
          return (
            <div key={r[0]} style={{ position: "relative", height: rowH, display: "grid", gridTemplateColumns: land ? "0.5fr 4fr 1fr" : "0.6fr 3.4fr 1.2fr", alignItems: "center", padding: `0 ${12 * u}px`, fontSize: (land ? 16 : 15) * u, color: "#2b2e36", borderBottom: `${1 * u}px solid rgba(20,30,60,.05)` }}>
              {first && <div style={{ ...abs, left: 0, top: 4 * u, bottom: 4 * u, width: `${sweep * 100}%`, borderRadius: 10 * u, background: "linear-gradient(90deg, rgba(126,200,90,.15), rgba(90,180,70,.5) 70%, rgba(126,210,96,.8))", opacity: lerp(1, 0.55, ease.out(P(t, 38.25, 38.7))) }} />}
              <span style={{ position: "relative", fontFamily: MONO, fontSize: 14 * u, fontWeight: 600 }}>{r[0]}</span>
              <span style={{ position: "relative", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 12 * u }}>{r[1]}</span>
              <span style={{ position: "relative" }}>
                {first && !live ? (
                  <span style={{ padding: `${5 * u}px ${12 * u}px`, borderRadius: 99, background: "rgba(0,113,227,.1)", color: p.blue, fontSize: 13 * u, fontWeight: 600 }}>◷ Building</span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 * u, padding: `${5 * u}px ${12 * u}px`, borderRadius: 99, background: "rgba(48,209,88,.12)", color: "#1f8a46", fontSize: 13 * u, fontWeight: 600, transform: first ? `scale(${lerp(0.8, 1, spring(t - 38.15, 0.45, 14))})` : undefined }}>
                    <Check size={13 * u} color="#1f8a46" sw={3.4} /> {r[2]}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ ...abs, left: bx - bs / 2, top: by - bs / 2, width: bs, height: bs, opacity: lerp(1, 0, ease.in(P(t, 36.75, 37.0))), zIndex: 4 }}>
        <svg width={bs} height={bs} viewBox="-160 -160 320 320" style={{ overflow: "visible", position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="lf-badge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8ec2ff" />
              <stop offset="1" stopColor={p.blue} />
            </linearGradient>
          </defs>
          {[0, 1, 2].map((k) => {
            const q = clamp(rings * 1.4 - k * 0.2);
            return <path key={k} d={wavy(100 + q * (40 + k * 30), 8, 0.06, t * 0.8 + k)} fill={k === 0 ? "rgba(240,243,250,.9)" : "none"} stroke="rgba(0,90,200,.25)" strokeWidth={1.5} opacity={q * (1 - fly)} />;
          })}
          <g transform={`scale(${bIn}) rotate(${(1 - bIn) * -30 + t * 6})`}>
            <path d={wavy(100, 8, 0.07, 0)} fill="url(#lf-badge)" />
          </g>
        </svg>
        <div style={{ ...abs, inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${bIn})` }}>
          <NexusMark size={bs * 0.4} color="#fff" accent="#fff" sw={3.4} />
        </div>
      </div>
    </div>
  );
}

/* 38.8 – 40.4 · the pill */
function PillShot({ t, w, h, u, land, cx, cy }: Ctx) {
  const s = spring(t - 38.85, 0.55, 9);
  const r1 = ease.out(P(t, 38.95, 39.6));
  const r2 = ease.out(P(t, 39.05, 39.8));
  const PW = (land ? 640 : 600) * u;
  const PH = 200 * u;
  const out = ease.in(P(t, 40.2, 40.45));
  return (
    <div style={{ ...abs, inset: 0, background: "#fff", opacity: 1 - out, transform: `scale(${1 + out * 0.06})` }}>
      <div style={{ ...abs, left: -w * 0.1, top: h * 0.35, width: w * 0.7, height: h * 0.9, borderRadius: "50%", background: "radial-gradient(circle, rgba(10,116,232,.4), rgba(255,255,255,0) 65%)", filter: `blur(${50 * u}px)` }} />
      {[r2, r1].map((r, k) => {
        const pad = (k === 0 ? 130 : 70) * u * r;
        return <div key={k} style={{ ...abs, left: cx - PW / 2 - pad, top: cy - PH / 2 - pad, width: PW + pad * 2, height: PH + pad * 2, borderRadius: 999, background: "rgba(225,233,250,.55)", boxShadow: `inset 0 0 0 ${1.5 * u}px rgba(255,255,255,.9), 0 ${10 * u}px ${40 * u}px rgba(0,90,200,.08)`, opacity: r }} />;
      })}
      <div style={{ ...abs, left: cx - PW / 2, top: cy - PH / 2, width: PW, height: PH, borderRadius: 999, transform: `scale(${s})`, background: "linear-gradient(180deg, #3d9bff 0%, #0071e3 55%, #005fc2 100%)", boxShadow: `inset 0 ${3 * u}px ${2 * u}px rgba(255,255,255,.45), inset 0 ${-6 * u}px ${14 * u}px rgba(0,40,120,.35), 0 ${20 * u}px ${50 * u}px rgba(0,90,200,.4)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 600, fontSize: 76 * u, letterSpacing: "-0.04em", color: "#fff" }}>
        <Reveal t={t} at={39.0} by="char" per={0.03} dur={0.3} segs={[["Automatically."]]} />
      </div>
    </div>
  );
}

/* 40.4 – 44 · Welcome to + lockup */
function Lockup({ t, w, h, u, land, cx, cy, p }: Ctx) {
  const m = spring(t - 40.5, 0.6, 9);
  const to2 = ease.inOut(P(t, 41.9, 42.5));
  const fs = (land ? 92 : 78) * u;
  const big = (land ? 300 : 260) * u;
  const small = (land ? 116 : 104) * u;
  const ms = lerp(big, small, to2);
  const wcX = land ? cx - 140 * u : cx;
  const mx0 = land ? cx + 290 * u : cx;
  const my0 = land ? cy : cy + 170 * u;
  const lockW = small + 28 * u + (p.brand.length * 0.56 + 0.3) * 116 * u;
  const mx1 = cx - lockW / 2 + small / 2;
  const mx = lerp(mx0, mx1, to2), my = lerp(my0, cy - 20 * u, to2);
  const subQ = ease.out(P(t, 42.7, 43.3));
  const urlQ = ease.out(P(t, 42.95, 43.5));
  return (
    <div style={{ ...abs, inset: 0, background: "#fff", overflow: "hidden" }}>
      <RingBg t={t} w={w} h={h} u={u} x={lerp(land ? 0.65 : 0.5, 0.5, to2)} y={lerp(land ? 0.5 : 0.59, 0.48, to2)} R={lerp(land ? 380 : 340, 700, to2)} o={0.85} />
      <div style={{ ...abs, left: 0, right: 0, top: land ? cy - fs * 0.62 : cy - 260 * u, display: "flex", justifyContent: land ? "flex-start" : "center", paddingLeft: land ? wcX - 520 * u : 0, fontFamily: FONT, fontWeight: 600, fontSize: fs, letterSpacing: "-0.045em", color: INK, opacity: 1 - to2, filter: to2 ? `blur(${to2 * 12}px)` : undefined }}>
        <Reveal t={t} at={40.6} per={0.22} segs={[["Welcome to"]]} />
      </div>
      <div style={{ ...abs, left: mx - ms / 2, top: my - ms / 2, width: ms, height: ms, transform: `scale(${m}) rotate(${(1 - m) * -30}deg)`, filter: `drop-shadow(0 ${ms * 0.08}px ${ms * 0.14}px rgba(0,30,90,.3))` }}>
        <AppIcon size={ms} />
      </div>
      <div style={{ ...abs, left: mx1 + small / 2 + 28 * u, top: cy - 20 * u - 70 * u, fontFamily: FONT, fontWeight: 700, fontSize: 116 * u, letterSpacing: "-0.05em", color: INK, whiteSpace: "pre", lineHeight: 1.1 }}>
        <Reveal t={t} at={42.25} per={0.16} segs={[[p.brand]]} />
      </div>
      <div style={{ ...abs, left: 0, right: 0, top: cy + 100 * u, textAlign: "center", fontFamily: TEXT, fontWeight: 500, color: INK, opacity: subQ, transform: `translateY(${(1 - subQ) * 12 * u}px)`, filter: subQ < 1 ? `blur(${(1 - subQ) * 6}px)` : undefined }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 * u, padding: `${8 * u}px ${18 * u}px`, borderRadius: 99, background: "#fff", boxShadow: `0 0 0 ${1 * u}px rgba(0,0,0,.06), 0 ${6 * u}px ${18 * u}px rgba(0,0,0,.06)`, fontSize: 22 * u }}>
          <span style={{ width: 10 * u, height: 10 * u, borderRadius: "50%", background: "#30d158" }} />
          {p.count} animated components, free to start
        </span>
      </div>
      <div style={{ ...abs, left: 0, right: 0, top: cy + 168 * u, textAlign: "center", fontFamily: TEXT, fontWeight: 500, fontSize: 28 * u, color: "#6e6e73", opacity: urlQ }}>{p.url}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ main */
export default function LaunchFilm({ t, w = 1920, h = 1080, ...props }: { t: number } & Frame & Partial<LaunchFilmProps>) {
  const p = { ...meta.defaults, ...props };
  const land = w > h * 1.2;
  const u = land ? h / 1080 : w / 1080;
  const c: Ctx = { t, w, h, u, land, cx: w / 2, cy: h / 2, p };
  const scenes: [number, number, (c: Ctx) => ReactNode][] = [
    [0, 5.25, Open],
    [5.05, 9.3, Intro],
    [9.15, 11.05, NotBolted],
    [10.95, 13.65, Built],
    [13.6, 17.25, Network],
    [17.2, 20.85, Install],
    [20.8, 26.3, Docs],
    [26.2, 31.3, Playground],
    [31.15, 32.45, ZoomThrough],
    [32.4, 35.65, Updates],
    [35.6, 38.85, Releases],
    [38.8, 40.5, PillShot],
    [40.4, 44.1, Lockup],
  ];
  return (
    <div style={{ ...abs, inset: 0, width: w, height: h, overflow: "hidden", background: "#fff", fontFamily: FONT }}>
      {scenes.map(([a, b, S], i) => (t >= a && t < b ? <div key={i} style={{ ...abs, inset: 0, opacity: i ? ease.out(P(t, a, a + 0.15)) : 1 }}>{S(c)}</div> : null))}
    </div>
  );
}
