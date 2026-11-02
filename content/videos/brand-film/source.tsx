import type { CSSProperties, ReactNode } from "react";
import { MONO, P, clamp, ease, lerp, rand, spring, type Frame, type VideoMeta, assetUrl } from "./kit";
import jakarta from "@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2";
import grainFile from "./assets/grain.png";
import tileCopyFile from "./assets/tile-copy.jpg";
import tileDockFile from "./assets/tile-dock.jpg";
import tileFolderFile from "./assets/tile-folder.jpg";
import tileIslandFile from "./assets/tile-island.jpg";
import tilePayFile from "./assets/tile-pay.jpg";
import tilePendFile from "./assets/tile-pend.jpg";
import tileReelFile from "./assets/tile-reel.jpg";
import tileRouterFile from "./assets/tile-router.jpg";

// Imported files as URL strings, whichever bundler you use (see assetUrl in kit.ts).
const grain = assetUrl(grainFile);
const tileCopy = assetUrl(tileCopyFile);
const tileDock = assetUrl(tileDockFile);
const tileFolder = assetUrl(tileFolderFile);
const tileIsland = assetUrl(tileIslandFile);
const tilePay = assetUrl(tilePayFile);
const tilePend = assetUrl(tilePendFile);
const tileReel = assetUrl(tileReelFile);
const tileRouter = assetUrl(tileRouterFile);

export interface BrandFilmProps {
  hook: string;
  turn: string;
  prompt: string;
  install: string;
  tagline: string;
  name: string;
  url: string;
  accent: string;
}

export const meta: VideoMeta<BrandFilmProps> = {
  id: "brand-film",
  title: "Brand Film",
  platforms: ["Reels", "YouTube", "X"],
  formats: ["9:16", "16:9"],
  purpose: "Brand film / launch hero",
  motion: "Dark aurora, a prompt bar typed in close-up, crash zooms, white bar wipes and a hub of live components",
  app: "Nexus UI",
  duration: 24.6,
  bpm: 100,
  cuts: [1.5, 3.3, 7.4, 9.5, 11.4, 13.5, 17.6, 19.7, 22.4],
  dark: true,
  blurb:
    "A 25-second motion-graphics film in the dark, glassy style of high-end AI launch reels. A question types itself and glitches into a promise, a prompt bar draws itself in extreme close-up, a click crash-zooms into the install, white bars wipe through the real components, and everything resolves into a hub around the Nexus mark. Every move has its own sound: soft key ticks, glass pops, whooshes, risers and a deep sub under the cuts.",
  defaults: {
    hook: "Need a landing page?",
    turn: "Stop building from scratch.",
    prompt: "Animated pricing section",
    install: "npx shadcn add @nexus-labs/pricing-cards",
    tagline: "From prompt to production. Built with",
    name: "Nexus UI",
    url: "nexus-ui.com",
    accent: "#7d96ff",
  },
  fields: [
    { key: "hook", label: "Opening question", type: "text", max: 26 },
    { key: "turn", label: "The turn", type: "text", max: 30 },
    { key: "prompt", label: "Typed prompt", type: "text", max: 28 },
    { key: "install", label: "Install line", type: "text", max: 48 },
    { key: "tagline", label: "Tagline", type: "text", max: 44 },
    { key: "name", label: "Brand", type: "text", max: 12 },
    { key: "url", label: "URL", type: "text", max: 24 },
    { key: "accent", label: "Accent", type: "color" },
  ],
  prompt: `Make a 24.6-second high-end motion-graphics brand film for my React component library Nexus UI (nexus-ui.com), in the style of premium AI-product launch reels: near-black background with a slowly drifting aurora of blue and violet light, film grain, a geometric sans (Plus Jakarta Sans), soft white text glow, crash zooms with motion blur and clean, expensive sound design. Render it from one React component in 9:16 (Reels) and 16:9 (YouTube), re-laying out every scene for the frame. It is a pure function of time t.

Scenes:
0–3.3s Hook. An arrow, then "Need a landing page?" types in letter by letter, each letter de-blurring in with a glow. At 1.5s the line glitches (RGB split, scrambled characters, jitter) into "Stop building from scratch." with the arrow flipping to the other side. It then crash-zooms into the camera.
3.3–7.4s Prompt bar, shot like a camera move. Starts in extreme close-up on the Nexus mark where two hairline guides cross; the guides shoot out, the pill-shaped prompt bar draws its outline from that point and the mark morphs into a plus. Chips pop in above (React, Tailwind, Framer Motion, shadcn/ui; Framer Motion selected with a glowing outline). The camera pulls back, "Animated pricing section" types in, a white send button pops, the camera pushes in to the right, a macOS cursor glides in and clicks, and the camera crash-zooms through the button into a white flash.
7.4–9.5s Install. Warm coral scene with a giant slowly rotating coral Nexus mark cropped off the corner. "Installing." with a blinking caret, the shadcn add command as a comment, and real CLI output streaming in line by line.
9.5–11.4s A white bar wipes up: "Live preview." with three real component screenshots popping in as glass cards next to a large blue-violet curved shape.
11.4–13.5s A white bar wipes in from the side: "Copy. Paste. Ship." word by word, a little node graph drawing itself out of a small Nexus mark and a giant outlined mark cropped in the corner. The camera zooms onto the small mark.
13.5–17.6s Hub. The mark alone with twinkling specks; a circle draws around it, morphs into a pill and the name slides out. Eight curved connectors grow to eight component thumbnails, which pop in with springs, then light pulses travel along the connectors.
17.6–19.7s A quiet line "From prompt to production. Built with Nexus UI" with a focus pull.
19.7–24.6s End card. The mark spins in with a gradient glow, the name slides out from behind it, a light sweep, then the URL fades in under it and everything settles to black.

Sound: no music track, only designed sound locked to the picture. A deep sub drone and a soft dark pad underneath; soft glassy key ticks for every typed character; a digital glitch burst; whooshes on every camera move and wipe; a rising riser into the crash zoom with a deep impact on the cut; glass pops for chips, cards and satellites (pitched up a pentatonic scale); sparkle chimes on the mark; and a bloom-chord sting on the logo.`,
};

/* ------------------------------------------------------------------ */
/* helpers                                                              */
/* ------------------------------------------------------------------ */

const FONT = "'Jakarta','Plus Jakarta Sans','Inter',-apple-system,sans-serif";
const abs: CSSProperties = { position: "absolute" };
const GLOW = "0 0 26px rgba(150,180,255,.55), 0 0 8px rgba(205,220,255,.55)";
const FR = (t: number) => Math.floor(t * 30);

/** letters typing in from t0 at `cps` characters per second, each de-blurring with a glow */
function Typed({ text, t, t0, cps, style, caret }: { text: string; t: number; t0: number; cps: number; style?: CSSProperties; caret?: string }) {
  const n = clamp(Math.floor((t - t0) * cps) + 1, 0, text.length);
  const done = t - t0 > text.length / cps;
  return (
    <span style={{ whiteSpace: "pre", ...style }}>
      {Array.from(text.slice(0, t >= t0 ? n : 0)).map((c, i) => {
        const a = t - (t0 + i / cps);
        return <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: clamp(a / 0.07), filter: `blur(${(1 - clamp(a / 0.16)) * 7}px)`, transform: `translateY(${(1 - ease.out(clamp(a / 0.16))) * 6}px)` }}>{c}</span>;
      })}
      {caret && t >= t0 && <span style={{ display: "inline-block", width: "0.08em", height: "0.95em", marginLeft: "0.06em", verticalAlign: "-0.1em", background: caret, opacity: done ? (FR(t) % 30 < 16 ? 1 : 0) : 1 }} />}
    </span>
  );
}

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghkmnopqrstuvwxyz0123456789#%&*+/<>";
function scramble(from: string, to: string, p: number, t: number) {
  const len = Math.round(lerp(from.length, to.length, ease.inOut(p)));
  let s = "";
  for (let i = 0; i < len; i++) {
    const done = p > 0.25 + (i / len) * 0.6 + rand(i * 7.3) * 0.12;
    if (done) s += to[i] ?? " ";
    else if ((to[i] ?? from[i]) === " " && rand(i + FR(t)) > 0.4) s += " ";
    else s += GLYPHS[Math.floor(rand(i * 31 + FR(t) * 3.7) * GLYPHS.length)];
  }
  return s;
}

/** The Nexus mark: three spokes from a centre node to three end nodes. Drawn in a -100..100 box. */
function Mark({ size, spoke = "#f4f1ea", node = "#7d96ff", ends, outline, rot = 0, grow = 1, glow }: { size: number; spoke?: string; node?: string; ends?: string; outline?: { color: string; w: number }; rot?: number; grow?: number; glow?: string }) {
  const L = 62 * grow;
  const A = [-90, 150, 30].map((d) => (d * Math.PI) / 180);
  const pts = A.map((a) => [Math.cos(a) * L, Math.sin(a) * L]);
  const layer = (sw: number, er: number, cr: number, col: string, ncol: string, ecol: string, key: string) => (
    <g key={key}>
      {pts.map(([x, y], i) => <line key={i} x1={0} y1={0} x2={x} y2={y} stroke={col} strokeWidth={sw} strokeLinecap="round" />)}
      {pts.map(([x, y], i) => <circle key={`e${i}`} cx={x} cy={y} r={er * clamp(grow * 1.4)} fill={ecol} />)}
      <circle cx={0} cy={0} r={cr} fill={ncol} />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox="-100 -100 200 200" style={{ overflow: "visible", filter: glow ? `drop-shadow(0 0 ${size * 0.08}px ${glow})` : undefined }}>
      {outline && (
        <defs>
          <mask id="bf-outline" maskUnits="userSpaceOnUse" x="-150" y="-150" width="300" height="300">
            <rect x="-150" y="-150" width="300" height="300" fill="#fff" />
            {layer(9, 12, 15, "#000", "#000", "#000", "i")}
          </mask>
        </defs>
      )}
      <g transform={`rotate(${rot})`} mask={outline ? "url(#bf-outline)" : undefined}>
        {outline
          ? layer(9 + outline.w * 2, 12 + outline.w, 15 + outline.w, outline.color, outline.color, outline.color, "o")
          : layer(9, 12, 15, spoke, node, ends ?? spoke, "m")}
      </g>
    </svg>
  );
}

/** Drifting aurora: soft radial lights over near-black. `pal` = three rgba colours. */
function Aurora({ t, w, h, pal, base = "#05060a", k = 1 }: { t: number; w: number; h: number; pal: string[]; base?: string; k?: number }) {
  const S = Math.max(w, h);
  const blobs = [
    { x: 0.2 + Math.sin(t * 0.21) * 0.08, y: 0.74 + Math.cos(t * 0.17) * 0.06, r: 0.5 },
    { x: 0.6 + Math.cos(t * 0.19) * 0.1, y: 0.22 + Math.sin(t * 0.23) * 0.07, r: 0.44 },
    { x: 0.95 + Math.sin(t * 0.15) * 0.05, y: 0.8 + Math.cos(t * 0.2) * 0.08, r: 0.42 },
  ];
  return (
    <div style={{ ...abs, inset: 0, background: base, overflow: "hidden" }}>
      {blobs.map((b, i) => (
        <div key={i} style={{ ...abs, left: b.x * w - b.r * S, top: b.y * h - b.r * S, width: b.r * S * 2, height: b.r * S * 2, borderRadius: "50%", opacity: k, background: `radial-gradient(circle, ${pal[i]} 0%, transparent 66%)`, mixBlendMode: "screen" }} />
      ))}
    </div>
  );
}

function Grain({ t, o = 0.07 }: { t: number; o?: number }) {
  const f = FR(t);
  return <div style={{ ...abs, inset: 0, backgroundImage: `url(${grain})`, backgroundSize: "256px 256px", backgroundPosition: `${(f * 73) % 256}px ${(f * 151) % 256}px`, opacity: o, mixBlendMode: "overlay", pointerEvents: "none" }} />;
}
function Vignette({ o = 0.75 }: { o?: number }) {
  return <div style={{ ...abs, inset: 0, background: `radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,${o}) 100%)`, pointerEvents: "none" }} />;
}

/** Camera: shows world point (fx, fy) at the frame centre at scale s. */
function Cam({ w, h, s, fx, fy, blur = 0, children }: { w: number; h: number; s: number; fx: number; fy: number; blur?: number; children: ReactNode }) {
  return (
    <div style={{ ...abs, left: 0, top: 0, width: w, height: h, transformOrigin: "0 0", transform: `translate(${w / 2}px,${h / 2}px) scale(${s}) translate(${-fx}px,${-fy}px)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>{children}</div>
  );
}

function Scene({ show, children, style }: { show: boolean; children: ReactNode; style?: CSSProperties }) {
  if (!show) return null;
  return <div style={{ ...abs, inset: 0, overflow: "hidden", ...style }}>{children}</div>;
}

/** macOS pointer */
function Pointer({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 20 28" style={{ overflow: "visible", filter: "drop-shadow(0 3px 6px rgba(0,0,0,.45))" }}>
      <path d="M1.5 1.5 L1.5 22 L6.6 17.4 L10.2 25.6 L13.6 24.1 L10.1 16.1 L17 16.1 Z" fill="#fff" stroke="#111" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

const CHIPS = [
  { label: "React", dot: "#61dafb" },
  { label: "Tailwind", dot: "#38bdf8" },
  { label: "Framer Motion", dot: "#c084fc" },
  { label: "shadcn/ui", dot: "#e5e7eb" },
];
const CLI = [
  ["✔", " Checking registry."],
  ["✔", " Resolving @nexus-labs/pricing-cards."],
  ["✔", " Installing dependencies: framer-motion"],
  ["✔", " Created 3 files:"],
  [" ", "   - components/pricing/pricing-cards.tsx"],
  [" ", "   - components/pricing/plan-toggle.tsx"],
  [" ", "   - lib/use-spring-number.ts"],
  ["", ""],
  ["→", " Done in 1.8s"],
];
const SATS = [tileCopy, tileDock, tileFolder, tileIsland, tilePay, tilePend, tileReel, tileRouter];

/* ------------------------------------------------------------------ */
/* film                                                                 */
/* ------------------------------------------------------------------ */

export default function BrandFilm({ t, w = 1080, h = 1920, ...props }: { t: number } & Frame & Partial<BrandFilmProps>) {
  const p = { ...meta.defaults, ...props };
  const land = w > h;

  return (
    <div style={{ ...abs, inset: 0, width: w, height: h, background: "#05060a", overflow: "hidden", fontFamily: FONT, color: "#fff" }}>
      <style>{`@font-face{font-family:'Jakarta';src:url(${jakarta}) format('woff2');font-weight:200 800;font-display:block}`}</style>
      <Hook t={t} w={w} h={h} p={p} land={land} />
      <Prompt t={t} w={w} h={h} p={p} land={land} />
      <Install t={t} w={w} h={h} p={p} land={land} />
      <Preview t={t} w={w} h={h} land={land} />
      <Ship t={t} w={w} h={h} land={land} />
      <Hub t={t} w={w} h={h} p={p} land={land} />
      <Line t={t} w={w} h={h} p={p} land={land} />
      <End t={t} w={w} h={h} p={p} land={land} />
      {/* white flash out of the crash zoom */}
      <div style={{ ...abs, inset: 0, background: "#fff", opacity: P(t, 7.0, 7.38) * (1 - ease.out(P(t, 7.4, 7.85))), pointerEvents: "none" }} />
      <Grain t={t} />
      <div style={{ ...abs, inset: 0, background: "#000", opacity: P(t, 24.1, 24.6), pointerEvents: "none" }} />
    </div>
  );
}

type SP = { t: number; w: number; h: number; land: boolean; p?: BrandFilmProps };

/* 0 – 3.3  hook ------------------------------------------------------ */
function Hook({ t, w, h, p, land }: SP & { p: BrandFilmProps }) {
  if (t > 3.45) return null;
  const fs = land ? 54 : 64;
  const glitch = P(t, 1.5, 1.95);
  const inGlitch = t >= 1.5 && t < 1.95;
  const second = t >= 1.95;
  const text = !second ? (inGlitch ? scramble(p.hook, p.turn, glitch, t) : p.hook) : p.turn;
  const j = inGlitch ? (rand(FR(t) * 1.7) - 0.5) * 18 : 0;
  const exit = ease.in(P(t, 2.85, 3.35));
  const arrowOut = ease.in(P(t, 1.45, 1.7));
  const arrowIn = ease.expo(P(t, 1.95, 2.45));
  const intro = ease.expo(P(t, 0.15, 0.7));
  return (
    <Scene show>
      <Aurora t={t} w={w} h={h} pal={["rgba(70,95,190,.55)", "rgba(110,70,190,.42)", "rgba(150,170,230,.45)"]} k={0.55 + intro * 0.45} />
      <Vignette />
      <div style={{ ...abs, inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + exit * 2.6})`, opacity: 1 - exit, filter: `blur(${exit * 16}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: fs * 0.55, fontSize: fs, fontWeight: 500, letterSpacing: "-0.02em", textShadow: GLOW, transform: `translateX(${j}px) skewX(${inGlitch ? j * 0.6 : 0}deg)` }}>
          {!second && (
            <svg width={fs * 0.9} height={fs * 0.6} viewBox="0 0 30 20" style={{ opacity: intro * (1 - arrowOut), transform: `translateX(${arrowOut * 260}px) scaleX(${1 + arrowOut * 3})`, filter: `drop-shadow(0 0 8px rgba(180,200,255,.8)) blur(${arrowOut * 4}px)` }}>
              <path d="M2 10 H27 M19 3 L27 10 L19 17" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <span style={{ position: "relative", whiteSpace: "pre" }}>
            {!second && !inGlitch ? (
              <Typed text={p.hook} t={t} t0={0.55} cps={24} />
            ) : (
              <>
                {inGlitch && <span style={{ ...abs, left: -6, top: 0, color: "rgba(255,40,90,.85)", mixBlendMode: "screen" }}>{text}</span>}
                {inGlitch && <span style={{ ...abs, left: 6, top: 0, color: "rgba(40,220,255,.85)", mixBlendMode: "screen" }}>{text}</span>}
                <span style={{ position: "relative", clipPath: inGlitch ? `inset(${rand(FR(t)) * 40}% 0 ${rand(FR(t) + 3) * 40}% 0)` : undefined }}>{text}</span>
                {inGlitch && <span style={{ ...abs, left: (rand(FR(t) + 9) - 0.5) * 40, top: 0, opacity: 0.7, clipPath: `inset(${30 + rand(FR(t) + 5) * 30}% 0 ${20 + rand(FR(t) + 6) * 20}% 0)` }}>{text}</span>}
              </>
            )}
          </span>
          {second && (
            <svg width={fs * 0.9} height={fs * 0.6} viewBox="0 0 30 20" style={{ opacity: arrowIn, transform: `translateX(${(1 - arrowIn) * 300}px)`, filter: `drop-shadow(0 0 8px rgba(180,200,255,.8)) blur(${(1 - arrowIn) * 6}px)` }}>
              <path d="M28 10 H3 M11 3 L3 10 L11 17" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
    </Scene>
  );
}

/* 3.3 – 7.4  prompt bar ---------------------------------------------- */
function Prompt({ t, w, h, p, land }: SP & { p: BrandFilmProps }) {
  if (t < 3.2 || t > 7.45) return null;
  const barW = land ? 1000 : 920;
  const barH = land ? 124 : 120;
  const bx = (w - barW) / 2;
  const by = h / 2 - barH / 2 + 40;
  const P0x = bx + 74;
  const P0y = by + barH / 2;
  const btnX = bx + barW - 66;
  const fs = land ? 46 : 44;

  // camera
  const cam = (tt: number) => {
    const a = ease.inOut(P(tt, 3.3, 4.7));
    const s1 = land ? 1.3 : 1;
    let s = lerp(2.3, s1, a);
    let fx = lerp(P0x, w / 2, a);
    let fy = lerp(P0y, by + 10, a);
    s *= 1 + P(tt, 4.7, 5.6) * 0.04;
    const b = ease.inOut(P(tt, 5.55, 6.35));
    s = lerp(s, land ? 2.05 : 1.75, b);
    fx = lerp(fx, btnX - (land ? 150 : 110), b);
    fy = lerp(fy, P0y, b);
    const c = ease.in(P(tt, 6.55, 7.35));
    s *= Math.pow(16, c);
    fx = lerp(fx, btnX, ease.out(P(tt, 6.55, 6.9)));
    return { s, fx, fy };
  };
  const C = cam(t);
  const C1 = cam(t - 1 / 30);
  const mblur = clamp(Math.abs(Math.log(C.s / C1.s)) * 70 + Math.hypot(C.fx - C1.fx, C.fy - C1.fy) * C.s * 0.12, 0, 12);

  const lines = ease.expo(P(t, 3.3, 3.75));
  const linesOut = P(t, 4.0, 4.5);
  const draw = ease.inOut(P(t, 3.5, 4.15));
  const fill = P(t, 3.95, 4.4);
  const markIn = spring(t - 3.32, 0.5, 12);
  const plus = P(t, 3.95, 4.15);
  const btn = spring(t - 5.55, 0.45, 13);
  const press = t > 6.33 && t < 6.5 ? 0.88 : 1;
  const ptr = ease.inOut(P(t, 5.75, 6.3));
  const ptrX = lerp(btnX + 260, btnX + 6, ptr);
  const ptrY = lerp(P0y + 230, P0y + 8, ptr);
  const ripple = P(t, 6.36, 6.9);

  const rr = barH / 2;
  const per = 2 * (barW - barH) + Math.PI * barH;
  const path = `M ${74} ${barH} L ${barW - rr} ${barH} A ${rr} ${rr} 0 0 0 ${barW - rr} 0 L ${rr} 0 A ${rr} ${rr} 0 0 0 ${rr} ${barH} L 74 ${barH}`;

  return (
    <Scene show>
      <Aurora t={t + 3} w={w} h={h} pal={["rgba(70,90,200,.5)", "rgba(120,70,200,.42)", "rgba(170,190,240,.5)"]} />
      <Vignette />
      <Cam w={w} h={h} s={C.s} fx={C.fx} fy={C.fy} blur={mblur}>
        {/* guides */}
        <div style={{ ...abs, left: P0x - 2400 * lines, top: P0y - 0.75, width: 4800 * lines, height: 1.5, background: "linear-gradient(90deg,transparent,rgba(255,255,255,.8) 30%,rgba(255,255,255,.8) 70%,transparent)", opacity: 1 - linesOut }} />
        <div style={{ ...abs, left: P0x - 0.75, top: P0y - 1600 * lines, width: 1.5, height: 3200 * lines, background: "linear-gradient(180deg,transparent,rgba(255,255,255,.8) 30%,rgba(255,255,255,.8) 70%,transparent)", opacity: 1 - linesOut }} />
        {/* chips */}
        <div style={{ ...abs, left: bx + 34, top: by - 78, display: "flex", gap: 12 }}>
          {CHIPS.map((c, i) => {
            const s = spring(t - 3.8 - i * 0.09, 0.5, 12);
            const sel = c.label === "Framer Motion";
            const lit = sel ? P(t, 4.3, 4.6) : 0;
            return (
              <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 10, height: 50, padding: "0 20px 0 14px", borderRadius: 25, fontSize: 20, fontWeight: 500, color: "rgba(255,255,255,.88)", background: "rgba(255,255,255,.04)", boxShadow: `inset 0 0 0 1.5px rgba(255,255,255,${0.32 - lit * 0.1}), 0 0 ${lit * 22}px ${p.accent}${lit ? "aa" : "00"}, inset 0 0 0 ${lit * 2}px ${p.accent}`, opacity: clamp(s * 1.4), transform: `translateY(${(1 - s) * 18}px) scale(${0.8 + s * 0.2})`, filter: `blur(${(1 - clamp(s)) * 6}px)` }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: c.dot, boxShadow: `0 0 10px ${c.dot}` }} />
                {c.label}
              </div>
            );
          })}
        </div>
        {/* bar */}
        <div style={{ ...abs, left: bx, top: by, width: barW, height: barH, borderRadius: rr, background: `linear-gradient(180deg, rgba(255,255,255,${0.07 * fill}), rgba(255,255,255,${0.025 * fill}))`, boxShadow: `0 30px 80px -30px rgba(0,0,0,${0.8 * fill})` }} />
        <svg width={barW} height={barH} style={{ ...abs, left: bx, top: by, overflow: "visible" }}>
          <path d={path} fill="none" stroke="rgba(255,255,255,.85)" strokeWidth={2} strokeDasharray={per} strokeDashoffset={per * (1 - draw)} style={{ filter: "drop-shadow(0 0 6px rgba(190,205,255,.7))" }} />
        </svg>
        {/* mark → plus */}
        <div style={{ ...abs, left: P0x - 36, top: P0y - 36, width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...abs, opacity: 1 - plus, transform: `scale(${markIn * (1 - plus * 0.6)}) rotate(${(1 - markIn) * -90 + plus * 90}deg)` }}>
            <Mark size={64} glow="rgba(160,185,255,.9)" node={p.accent} />
          </div>
          <svg width={40} height={40} viewBox="0 0 40 40" style={{ ...abs, opacity: plus, transform: `rotate(${(1 - plus) * -90}deg) scale(${0.6 + plus * 0.4})` }}>
            <path d="M20 4 V36 M4 20 H36" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
          </svg>
        </div>
        {/* typed prompt */}
        <div style={{ ...abs, left: bx + 128, top: by, height: barH, display: "flex", alignItems: "center", fontSize: fs, fontWeight: 400, letterSpacing: "-0.02em", textShadow: GLOW }}>
          <Typed text={p.prompt} t={t} t0={4.4} cps={20} caret={t < 5.75 ? "rgba(255,255,255,.9)" : undefined} />
        </div>
        {/* send button */}
        <div style={{ ...abs, left: btnX - 34, top: P0y - 34, width: 68, height: 68, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${btn * press})`, boxShadow: "0 0 30px rgba(200,215,255,.55)" }}>
          <svg width={30} height={30} viewBox="0 0 30 30"><path d="M15 25 V6 M7 13 L15 5 L23 13" stroke="#0b0c10" strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        {ripple > 0 && ripple < 1 && <div style={{ ...abs, left: btnX - 34, top: P0y - 34, width: 68, height: 68, borderRadius: "50%", boxShadow: "0 0 0 2px rgba(255,255,255,.9)", transform: `scale(${1 + ripple * 2.2})`, opacity: 1 - ripple }} />}
        {t > 5.7 && <div style={{ ...abs, left: ptrX, top: ptrY, transform: `scale(${t > 6.32 && t < 6.48 ? 0.86 : 1})`, transformOrigin: "0 0" }}><Pointer size={34} /></div>}
      </Cam>
    </Scene>
  );
}

/* 7.4 – 9.6  install ------------------------------------------------- */
function Install({ t, w, h, p, land }: SP & { p: BrandFilmProps }) {
  if (t < 7.3 || t > 9.95) return null;
  const wipe = ease.inOut(P(t, 9.3, 9.85));
  const size = land ? 1500 : 1500;
  const mx = land ? w * 0.84 : w * 0.86;
  const my = land ? h * 0.78 : h * 0.82;
  const mIn = spring(t - 7.38, 0.55, 7);
  const rot = (t - 7.4) * 14 + (1 - mIn) * -50;
  const left = land ? 170 : 90;
  const top = land ? 190 : 380;
  const drift = (t - 7.4) * 10;
  return (
    <Scene show style={{ transform: `translateY(${-wipe * h}px)` }}>
      <div style={{ ...abs, inset: 0, background: "radial-gradient(ellipse at 68% 62%, #c96f58 0%, #7a3a2e 38%, #26120f 72%, #120807 100%)" }} />
      <div style={{ ...abs, left: mx - size / 2, top: my - size / 2 - drift, transform: `scale(${0.6 + mIn * 0.4})` }}>
        <Mark size={size} spoke="#ec7f63" node="#ec7f63" rot={rot} />
      </div>
      <Vignette o={0.55} />
      <div style={{ ...abs, left, top: top - drift * 0.5 }}>
        <div style={{ fontSize: land ? 92 : 104, fontWeight: 600, letterSpacing: "-0.03em", textShadow: "0 0 24px rgba(255,200,180,.35)" }}>
          <Typed text="Installing." t={t} t0={7.5} cps={26} caret="#fff" />
        </div>
        <div style={{ marginTop: 16, fontSize: land ? 28 : 30, color: "rgba(255,240,235,.62)", fontFamily: MONO }}>
          <Typed text={`// ${p.install}`} t={t} t0={7.8} cps={70} />
        </div>
        <div style={{ marginTop: 26, fontFamily: MONO, fontSize: land ? 27 : 29, lineHeight: 1.6, color: "rgba(255,245,240,.9)" }}>
          {CLI.map(([g, l], i) => {
            const a = t - (8.42 + i * 0.1);
            return (
              <div key={i} style={{ opacity: clamp(a / 0.08), transform: `translateY(${(1 - ease.out(clamp(a / 0.2))) * 10}px)`, whiteSpace: "pre", minHeight: "1.6em" }}>
                <span style={{ color: g === "✔" ? "#9ff0b8" : g === "→" ? "#ffd7c9" : undefined }}>{g}</span>{l}
              </div>
            );
          })}
        </div>
      </div>
    </Scene>
  );
}

/* white bar used by the wipes */
function Bar({ x, y, ww, hh }: { x: number; y: number; ww: number; hh: number }) {
  return <div style={{ ...abs, left: x, top: y, width: ww, height: hh, background: "#fff", boxShadow: "0 0 40px rgba(255,255,255,.35)" }} />;
}

/* 9.5 – 11.6  live preview ------------------------------------------- */
function Preview({ t, w, h, land }: SP) {
  if (t < 9.3 || t > 11.95) return null;
  const up = ease.inOut(P(t, 9.3, 9.85));
  const side = ease.inOut(P(t, 11.2, 11.75));
  const y0 = (1 - up) * h;
  const x0 = -side * w;
  const band = land ? 26 : 30;
  const shape = ease.expo(P(t, 9.55, 10.6));
  const push = 1 + P(t, 9.6, 11.6) * 0.06;
  const tl = land ? 360 : 110;
  const tt = land ? 170 : 470;
  const k = land ? 1.55 : 1.9;
  const card = (src: string, x: number, y: number, cw: number, ch: number, d: number) => {
    const s = spring(t - d, 0.48, 11);
    const fl = Math.sin((t - d) * 2.2 + x) * 4;
    return (
      <div style={{ ...abs, left: x, top: y + fl, width: cw, height: ch, borderRadius: 16 * k, overflow: "hidden", background: "#fff", boxShadow: "0 26px 60px -24px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.4)", opacity: clamp(s * 1.5), transform: `translateY(${(1 - s) * 50}px) scale(${0.7 + s * 0.3})`, filter: `blur(${(1 - clamp(s)) * 8}px)` }}>
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  };
  const gx = tl + (land ? 10 : 20);
  const gy = tt + (land ? 140 : 150);
  return (
    <Scene show style={{ transform: `translate(${x0}px, ${y0}px)`, overflow: "visible" }}>
      <Bar x={-200} y={-band} ww={w + 400} hh={band} />
      <div style={{ ...abs, inset: 0, overflow: "hidden" }}>
        <Aurora t={t} w={w} h={h} base="#070912" pal={["rgba(60,80,170,.45)", "rgba(90,70,170,.35)", "rgba(120,150,230,.45)"]} />
        <svg width={w} height={h} style={{ ...abs, left: 0, top: 0 }}>
          <defs>
            <linearGradient id="bf-shape" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5fb6ff" />
              <stop offset="0.55" stopColor="#6b7cff" />
              <stop offset="1" stopColor="#b26bff" />
            </linearGradient>
          </defs>
          <g transform={`translate(${w} ${h}) scale(${0.5 + shape * 0.5}) rotate(${(1 - shape) * 20})`}>
            <path d={`M 0 ${-h * (land ? 0.62 : 0.5)} C ${-w * 0.05} ${-h * 0.2}, ${-w * 0.25} ${-h * 0.06}, ${-w * (land ? 0.42 : 0.75)} 0 L 0 0 Z`} fill="url(#bf-shape)" opacity={shape} />
          </g>
        </svg>
        <div style={{ ...abs, inset: 0, transform: `scale(${push})`, transformOrigin: "40% 50%" }}>
          <div style={{ ...abs, left: tl, top: tt, fontSize: land ? 80 : 84, fontWeight: 600, letterSpacing: "-0.03em", textShadow: "0 0 30px rgba(170,190,255,.35)" }}>
            <Typed text="Live preview." t={t} t0={9.65} cps={28} />
          </div>
          {card(tilePay, gx, gy, 170 * k, 190 * k, 9.95)}
          {card(tileIsland, gx + 186 * k, gy, 170 * k, 190 * k, 10.05)}
          {card(tileCopy, gx, gy + 206 * k, 356 * k, 196 * k, 10.15)}
        </div>
        <Vignette o={0.5} />
      </div>
      <Bar x={w} y={-band} ww={land ? 26 : 30} hh={h + band} />
    </Scene>
  );
}

/* 11.4 – 13.6  copy paste ship --------------------------------------- */
function Ship({ t, w, h, land }: SP) {
  if (t < 11.15 || t > 13.65) return null;
  const side = ease.inOut(P(t, 11.2, 11.75));
  const x0 = (1 - side) * w;
  const tl = land ? 200 : 100;
  const tt = land ? 220 : 500;
  const fs = land ? 96 : 92;
  const gy = tt + (land ? 330 : 340);
  const mkX = tl + (land ? 380 : 340);
  const words = ["Copy.", "Paste.", "Ship."];
  const ln = ease.inOut(P(t, 11.85, 12.35));
  const ln2 = ease.inOut(P(t, 12.3, 12.7));
  const d1 = spring(t - 12.35, 0.45, 13);
  const d2 = spring(t - 12.7, 0.45, 13);
  const zoom = ease.inOut(P(t, 12.95, 13.55));
  const out = P(t, 13.0, 13.4);
  const giant = land ? 1500 : 1500;
  const gIn = ease.expo(P(t, 11.3, 12.2));
  const vert = land ? 170 : 190;
  const right = land ? 210 : 190;
  return (
    <Scene show style={{ transform: `translateX(${x0}px)` }}>
      <div style={{ ...abs, inset: 0, background: "#030305" }} />
      <Aurora t={t} w={w} h={h} base="transparent" pal={["rgba(40,50,110,.35)", "rgba(60,40,110,.25)", "rgba(40,60,120,.3)"]} />
      <Cam w={w} h={h} s={lerp(1, 1.6, zoom)} fx={lerp(w / 2, mkX, zoom)} fy={lerp(h / 2, gy, zoom)} blur={zoom > 0 && zoom < 1 ? Math.sin(zoom * Math.PI) * 5 : 0}>
        <div style={{ ...abs, left: w * (land ? 0.86 : 0.9) - giant / 2 + (1 - gIn) * 400, top: h * (land ? 0.9 : 0.92) - giant / 2, opacity: 1 - out }}>
          <Mark size={giant} outline={{ color: "#fff", w: 2.4 }} rot={-12 + (t - 11.3) * 4} />
        </div>
        <div style={{ ...abs, left: tl, top: tt, fontSize: fs, fontWeight: 600, letterSpacing: "-0.035em", display: "flex", gap: fs * 0.28, opacity: 1 - out }}>
          {words.map((wd, i) => {
            const s = spring(t - 11.7 - i * 0.26, 0.5, 14);
            return <span key={wd} style={{ display: "inline-block", opacity: clamp(s * 1.6), transform: `translateY(${(1 - s) * 30}px)`, filter: `blur(${(1 - clamp(s)) * 10}px)` }}>{wd}</span>;
          })}
        </div>
        {/* node graph */}
        <div style={{ ...abs, left: tl - 20, top: gy - 1, width: (mkX - tl - 30) * ln, height: 2, background: "linear-gradient(90deg,transparent,#fff)", opacity: 1 - out }} />
        <div style={{ ...abs, left: mkX + 40, top: gy - 1, width: right * ln2, height: 2, background: "#fff", opacity: 1 - out }} />
        <div style={{ ...abs, left: mkX - 1, top: gy + 40, width: 2, height: vert * ln2, background: "#fff", opacity: 1 - out }} />
        <div style={{ ...abs, left: mkX + 40 + right, top: gy - 13, width: 26, height: 26, borderRadius: "50%", background: "#fff", transform: `translateX(-13px) scale(${d1})`, opacity: 1 - out }} />
        <div style={{ ...abs, left: mkX - 13, top: gy + 40 + vert, width: 26, height: 26, borderRadius: "50%", background: "#fff", transform: `translateY(-13px) scale(${d2})` , opacity: 1 - out }} />
        <div style={{ ...abs, left: mkX - 65, top: gy - 65, transform: `scale(${spring(t - 11.9, 0.5, 12)}) rotate(${(t - 11.9) * 30}deg)` }}>
          <Mark size={130} glow="rgba(170,190,255,.8)" />
        </div>
      </Cam>
      <Vignette o={0.5} />
    </Scene>
  );
}

/* 13.5 – 17.7  hub --------------------------------------------------- */
function Hub({ t, w, h, p, land }: SP & { p: BrandFilmProps }) {
  if (t < 13.35 || t > 17.85) return null;
  const cx = w / 2;
  const cy = h / 2;
  const fade = P(t, 13.35, 13.55);
  const ring = ease.inOut(P(t, 14.3, 14.75));
  const morph = ease.inOut(P(t, 14.9, 15.45));
  const pillW = lerp(150, 520, morph);
  const pillH = 150 - morph * 34;
  const nameP = ease.out(P(t, 15.3, 15.8));
  const out = ease.in(P(t, 17.2, 17.75));
  const camS = (1 + P(t, 15.4, 17.2) * -0.07) * (1 + out * 0.6);
  const mk = 150 * 0.72;
  const sats: [number, number][] = land
    ? [[-270, -320], [270, -320], [-600, -105], [-600, 105], [600, -105], [600, 105], [-270, 320], [270, 320]]
    : [[-235, -470], [235, -470], [-385, -190], [-385, 190], [385, -190], [385, 190], [-235, 470], [235, 470]];
  const R = land ? 64 : 64;
  const CW = R * 2.5;
  const CH = R * 1.8;
  const from = (sx: number, sy: number): [number, number] => (Math.abs(sy) > 250 ? [Math.sign(sx) * 150, Math.sign(sy) * pillH * 0.5] : [Math.sign(sx) * pillW * 0.5, sy * 0.15]);
  const order = [2, 0, 4, 6, 3, 1, 5, 7];
  return (
    <Scene show style={{ opacity: fade }}>
      <div style={{ ...abs, inset: 0, background: "#030306" }} />
      <Aurora t={t} w={w} h={h} base="transparent" pal={["rgba(40,60,140,.32)", "rgba(70,50,140,.22)", "rgba(60,80,160,.3)"]} />
      <div style={{ ...abs, inset: 0, transform: `scale(${camS})`, filter: out > 0.02 ? `blur(${out * 14}px)` : undefined, opacity: 1 - out }}>
        {/* specks */}
        {Array.from({ length: 26 }, (_, i) => {
          const a = rand(i * 3.1) * Math.PI * 2;
          const r = (land ? 160 : 140) + rand(i * 5.7) * (land ? 520 : 460);
          const tw = 0.5 + 0.5 * Math.sin(t * (2 + rand(i) * 3) + i);
          const on = P(t, 13.6 + rand(i * 9.1) * 0.7, 13.9 + rand(i * 9.1) * 0.7) * (1 - P(t, 15.3, 15.8));
          return <div key={i} style={{ ...abs, left: cx + Math.cos(a) * r * (land ? 1.4 : 0.8), top: cy + Math.sin(a) * r, width: 4, height: 4, borderRadius: "50%", background: "#fff", opacity: on * tw * 0.8, boxShadow: "0 0 8px #fff" }} />;
        })}
        {/* connectors + satellites */}
        <svg width={w} height={h} style={{ ...abs, left: 0, top: 0, overflow: "visible" }}>
          {sats.map(([sx, sy], i) => {
            const k = order.indexOf(i);
            const g = ease.inOut(P(t, 15.55 + k * 0.07, 15.95 + k * 0.07));
            const [fx, fy] = from(sx, sy);
            const x1 = cx + fx, y1 = cy + fy, x2 = cx + sx - Math.sign(sx) * (Math.abs(sy) > 250 ? 0 : CW / 2), y2 = cy + sy - (Math.abs(sy) > 250 ? Math.sign(sy) * CH / 2 : 0);
            const vertical = Math.abs(sy) > 250;
            const c1: [number, number] = vertical ? [x1, (y1 + y2) / 2] : [(x1 + x2) / 2, y1];
            const c2: [number, number] = vertical ? [x2, (y1 + y2) / 2] : [(x1 + x2) / 2, y2];
            const d = `M ${x1} ${y1} C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${x2} ${y2}`;
            const len = 700;
            const pulse = (t - 16.3 - k * 0.11) % 1.1;
            const u = clamp(pulse / 0.7);
            const bz = (a: number, b: number, c: number, e: number) => (1 - u) ** 3 * a + 3 * (1 - u) ** 2 * u * b + 3 * (1 - u) * u * u * c + u ** 3 * e;
            const px = bz(x1, c1[0], c2[0], x2);
            const py = bz(y1, c1[1], c2[1], y2);
            return (
              <g key={i}>
                <path d={d} fill="none" stroke="rgba(255,255,255,.4)" strokeWidth={2} strokeDasharray={len} strokeDashoffset={len * (1 - g)} pathLength={len} />
                {t > 16.3 && pulse >= 0 && pulse < 0.7 && <circle cx={px} cy={py} r={4.5} fill="#fff" opacity={Math.sin(u * Math.PI)} style={{ filter: "drop-shadow(0 0 6px #9fb4ff)" }} />}
              </g>
            );
          })}
        </svg>
        {sats.map(([sx, sy], i) => {
          const k = order.indexOf(i);
          const s = spring(t - 15.9 - k * 0.07, 0.45, 12);
          return (
            <div key={i} style={{ ...abs, left: cx + sx - CW / 2, top: cy + sy - CH / 2, width: CW, height: CH, borderRadius: 18, overflow: "hidden", background: "#fff", boxShadow: "0 0 0 2px rgba(150,160,210,.5), 0 0 30px rgba(120,140,255,.18), 0 18px 34px -14px rgba(0,0,0,.9)", transform: `scale(${s})`, opacity: clamp(s * 2) }}>
              <img src={SATS[i]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 60%" }} />
            </div>
          );
        })}
        {/* ring → pill */}
        <svg width={w} height={h} style={{ ...abs, left: 0, top: 0, overflow: "visible", opacity: morph > 0 ? 0 : 1 }}>
          <circle cx={cx} cy={cy} r={75} fill="none" stroke="#fff" strokeWidth={2.5} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - ring)} transform={`rotate(-90 ${cx} ${cy})`} />
        </svg>
        {morph > 0 && <div style={{ ...abs, left: cx - pillW / 2, top: cy - pillH / 2, width: pillW, height: pillH, borderRadius: pillH / 2, boxShadow: "inset 0 0 0 2.5px #fff, 0 0 40px rgba(150,170,255,.2)", background: "rgba(10,11,18,.9)" }} />}
        <div style={{ ...abs, left: cx - mk / 2 - morph * (land ? 165 : 165), top: cy - mk / 2, transform: `scale(${spring(t - 13.45, 0.6, 10) * (1 - morph * 0.35)})` }}>
          <Mark size={mk} glow="rgba(170,190,255,.9)" node={p.accent} rot={(t - 13.4) * 8} />
        </div>
        <div style={{ ...abs, left: cx - 95, top: cy - 50, height: 100, display: "flex", alignItems: "center", fontSize: 66, fontWeight: 500, letterSpacing: "-0.03em", whiteSpace: "nowrap", clipPath: `inset(0 ${(1 - nameP) * 100}% 0 0)`, transform: `translateX(${(1 - nameP) * -30}px)`, opacity: nameP }}>
          {p.name}
        </div>
      </div>
    </Scene>
  );
}

/* 17.6 – 19.8  line -------------------------------------------------- */
function Line({ t, w, h, p, land }: SP & { p: BrandFilmProps }) {
  if (t < 17.45 || t > 19.95) return null;
  const inn = P(t, 17.5, 17.9);
  const out = P(t, 19.45, 19.85);
  const focus = Math.abs(lerp(-1, 1, P(t, 17.6, 19.6)));
  const rev = ease.inOut(P(t, 17.75, 18.9));
  const sweep = P(t, 18.5, 19.3);
  const drift = lerp(40, -40, P(t, 17.5, 19.8));
  const fs = land ? 40 : 44;
  const cut = p.tagline.indexOf(". ");
  const first = !land && cut > 0 ? p.tagline.slice(0, cut + 1) : "";
  const rest = !land && cut > 0 ? p.tagline.slice(cut + 2) : p.tagline;
  const words = (
    <>
      {first}
      {first && <br />}
      {rest} <b style={{ fontWeight: 700 }}>{p.name}</b>
    </>
  );
  return (
    <Scene show style={{ opacity: inn * (1 - out) }}>
      <Aurora t={t} w={w} h={h} base="#05060c" pal={["rgba(80,110,220,.5)", "rgba(110,90,210,.35)", "rgba(170,190,250,.45)"]} />
      <Vignette o={0.6} />
      <div style={{ ...abs, inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `translateX(${drift}px)`, filter: `blur(${focus * focus * 5}px)` }}>
        <div style={{ position: "relative", fontSize: fs, fontWeight: 400, letterSpacing: "-0.01em", textAlign: "center", lineHeight: 1.35, clipPath: `inset(0 ${(1 - rev) * 100}% 0 0)`, maxWidth: land ? 1200 : 760 }}>
          <span style={{ color: "rgba(255,255,255,.85)" }}>{words}</span>
          <span style={{ ...abs, inset: 0, color: "transparent", backgroundImage: `linear-gradient(100deg, transparent ${sweep * 140 - 30}%, rgba(255,255,255,1) ${sweep * 140 - 15}%, transparent ${sweep * 140}%)`, WebkitBackgroundClip: "text", backgroundClip: "text", filter: "blur(0.6px)" }}>{words}</span>
        </div>
      </div>
    </Scene>
  );
}

/* 19.7 – 24.6  end card ---------------------------------------------- */
function End({ t, w, h, p, land }: SP & { p: BrandFilmProps }) {
  if (t < 19.55) return null;
  const cx = w / 2;
  const cy = h / 2;
  const mIn = spring(t - 19.7, 0.5, 9);
  const name = ease.expo(P(t, 20.05, 20.65));
  const sweep = P(t, 20.75, 21.55);
  const settle = ease.inOut(P(t, 22.3, 23.0));
  const url = ease.expo(P(t, 22.6, 23.2));
  const msz = land ? 168 : 140;
  const fs = land ? 132 : 104;
  const nameW = p.name.length * fs * 0.52;
  const gap = 34;
  const total = msz + gap + nameW;
  const markX = cx - (msz / 2) * (1 - name) - (total / 2 - msz / 2) * name;
  const lift = settle * (land ? 40 : 60);
  const scale = 1 - settle * 0.12;
  return (
    <Scene show style={{ opacity: P(t, 19.55, 19.75) }}>
      <div style={{ ...abs, inset: 0, background: "#040509" }} />
      <Aurora t={t} w={w} h={h} base="transparent" pal={["rgba(40,60,150,.3)", "rgba(80,60,160,.22)", "rgba(110,140,230,.42)"]} k={1 - settle * 0.4} />
      <Vignette o={0.6} />
      <div style={{ ...abs, inset: 0, transform: `translateY(${-lift}px) scale(${scale})` }}>
        {/* bloom */}
        <div style={{ ...abs, left: markX + msz / 2 - 260, top: cy - 260, width: 520, height: 520, borderRadius: "50%", background: `radial-gradient(circle, ${p.accent}55, transparent 65%)`, opacity: mIn * (1 - P(t, 20.4, 21.6) * 0.6) }} />
        <div style={{ ...abs, left: markX, top: cy - msz / 2, width: msz, height: msz, transform: `scale(${mIn}) rotate(${(1 - mIn) * 140}deg)` }}>
          <svg width={msz} height={msz} viewBox="-100 -100 200 200" style={{ overflow: "visible", filter: `drop-shadow(0 0 ${18 + (1 - P(t, 19.8, 21)) * 30}px ${p.accent})` }}>
            <defs>
              <linearGradient id="bf-spoke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#9ec5ff" />
                <stop offset="0.5" stopColor="#ffffff" />
                <stop offset="1" stopColor="#c3a6ff" />
              </linearGradient>
            </defs>
            {[-90, 150, 30].map((d) => {
              const a = (d * Math.PI) / 180;
              return (
                <g key={d}>
                  <line x1={0} y1={0} x2={Math.cos(a) * 62} y2={Math.sin(a) * 62} stroke="url(#bf-spoke)" strokeWidth={9} strokeLinecap="round" />
                  <circle cx={Math.cos(a) * 62} cy={Math.sin(a) * 62} r={12} fill="#fff" />
                </g>
              );
            })}
            <circle r={16} fill={p.accent} />
          </svg>
        </div>
        <div style={{ ...abs, left: markX + msz + gap, top: cy - fs * 0.62, height: fs * 1.24, display: "flex", alignItems: "center", fontSize: fs, fontWeight: 600, letterSpacing: "-0.04em", whiteSpace: "nowrap", clipPath: `inset(-20% ${(1 - name) * 100}% -20% 0)`, transform: `translateX(${(1 - name) * -60}px)`, textShadow: "0 0 30px rgba(170,190,255,.35)" }}>
          <span style={{ position: "relative" }}>
            {p.name}
            <span style={{ ...abs, inset: 0, color: "transparent", backgroundImage: `linear-gradient(100deg, transparent ${sweep * 140 - 30}%, rgba(255,255,255,.9) ${sweep * 140 - 15}%, transparent ${sweep * 140}%)`, WebkitBackgroundClip: "text", backgroundClip: "text", filter: "blur(1px)" }}>{p.name}</span>
          </span>
        </div>
        <div style={{ ...abs, left: 0, right: 0, top: cy + msz * 0.75 + 24, textAlign: "center", fontSize: land ? 38 : 36, fontWeight: 500, letterSpacing: `${0.02 + (1 - url) * 0.25}em`, color: "rgba(255,255,255,.72)", opacity: url, filter: `blur(${(1 - url) * 8}px)` }}>
          {p.url}
        </div>
      </div>
    </Scene>
  );
}
