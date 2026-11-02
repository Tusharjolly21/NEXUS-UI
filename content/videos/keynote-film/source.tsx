import type { CSSProperties, ReactNode } from "react";
import { FONT, P, TEXT, clamp, ease, lerp, spring, type Frame, type VideoMeta, assetUrl } from "./kit";
import siteFile from "./assets/nexus-page.jpg";
import tCairnFile from "./assets/kn/t-cairn.jpg";
import tKilnFile from "./assets/kn/t-kiln.jpg";
import tTallyFile from "./assets/kn/t-tally.jpg";
import tSidebFile from "./assets/kn/t-sideb.jpg";
import tWayfareFile from "./assets/kn/t-wayfare.jpg";
import mTallyFile from "./assets/kn/m-tally.jpg";
import mKilnFile from "./assets/kn/m-kiln.jpg";
import mSidebFile from "./assets/kn/m-sideb.jpg";
import mWayfareFile from "./assets/kn/m-wayfare.jpg";
import mRelayFile from "./assets/kn/m-relay.jpg";
import mStrataFile from "./assets/kn/m-strata.jpg";
import tileCopyFile from "./assets/tile-copy.jpg";
import tileDockFile from "./assets/tile-dock.jpg";
import tileFolderFile from "./assets/tile-folder.jpg";
import tileIslandFile from "./assets/tile-island.jpg";
import tilePayFile from "./assets/tile-pay.jpg";
import tilePendFile from "./assets/tile-pend.jpg";
import tileReelFile from "./assets/tile-reel.jpg";
import tileRouterFile from "./assets/tile-router.jpg";

// Imported files as URL strings, whichever bundler you use (see assetUrl in kit.ts).
const site = assetUrl(siteFile);
const tCairn = assetUrl(tCairnFile);
const tKiln = assetUrl(tKilnFile);
const tTally = assetUrl(tTallyFile);
const tSideb = assetUrl(tSidebFile);
const tWayfare = assetUrl(tWayfareFile);
const mTally = assetUrl(mTallyFile);
const mKiln = assetUrl(mKilnFile);
const mSideb = assetUrl(mSidebFile);
const mWayfare = assetUrl(mWayfareFile);
const mRelay = assetUrl(mRelayFile);
const mStrata = assetUrl(mStrataFile);
const tileCopy = assetUrl(tileCopyFile);
const tileDock = assetUrl(tileDockFile);
const tileFolder = assetUrl(tileFolderFile);
const tileIsland = assetUrl(tileIslandFile);
const tilePay = assetUrl(tilePayFile);
const tilePend = assetUrl(tilePendFile);
const tileReel = assetUrl(tileReelFile);
const tileRouter = assetUrl(tileRouterFile);

export interface KeynoteFilmProps {
  name: string;
  line1: string;
  line2: string;
  count: number;
  line3: string;
  cta: string;
  url: string;
}

export const meta: VideoMeta<KeynoteFilmProps> = {
  id: "keynote-film",
  title: "Keynote Film",
  platforms: ["YouTube", "Reels", "X", "Website"],
  formats: ["16:9", "9:16"],
  purpose: "Flagship brand film",
  motion: "Apple-keynote film with no devices: frameless screens, a dive through the page, floating screen lineups and themes that morph scene to scene",
  app: "Nexus UI",
  duration: 30.6,
  bpm: 112,
  cuts: [0.9, 3.4, 8.4, 13.3, 18.2, 19.4, 20.6, 21.8, 23.2, 24.6, 27.2],
  blurb:
    "A 30-second film cut like an Apple keynote. The name rises out of black, the real Nexus UI site scrolls on a frameless floating screen, the camera dives into the page and out into a light theme, and desktop, tablet and phone-sized screens line up with real templates on them. No device frames, just the work. The whole stage then morphs: into colour for the whole component library orbiting a phone-sized screen, through each template's own palette, and from light to dark with one flip of a switch. Original 112 BPM score with every move scored.",
  defaults: {
    name: "Nexus UI",
    line1: "Motion you can copy and paste.",
    line2: "One library. Every screen.",
    count: 175,
    line3: "Templates that feel finished.",
    cta: "Free to start. Pro when you're ready.",
    url: "nexus-ui.com",
  },
  fields: [
    { key: "name", label: "Name", type: "text", max: 14 },
    { key: "line1", label: "Opening line", type: "text", max: 34 },
    { key: "line2", label: "Lineup line", type: "text", max: 30 },
    { key: "count", label: "Component count", type: "number", min: 10, max: 999 },
    { key: "line3", label: "Templates line", type: "text", max: 32 },
    { key: "cta", label: "Closing line", type: "text", max: 40 },
    { key: "url", label: "URL", type: "text", max: 24 },
  ],
  prompt: `Make a 30.6-second Apple-keynote-style brand film for my React component library Nexus UI (nexus-ui.com) that renders in 16:9 and 9:16 from one React component (pure function of time t, frame width/height as props). Typography: Inter Display, tight tracking, huge headlines, Apple grey sub-lines. The whole stage is one continuous space whose THEME morphs between scenes (background, two soft lights and ink colour all interpolate), never hard cuts.

No device frames anywhere. Every screen is a frameless rounded panel with a soft layered shadow, in desktop (16:10), tablet (4:3) and phone (9:19.5) proportions, like the floating UI on apple.com. Screens show real screenshots: the nexus-ui.com homepage, and desktop/mobile captures of my templates (Kiln, Cairn, Tally, Side B, Wayfare, Relay, Strata). Screens scroll with eased pauses like a person reading.

Scenes:
0–3.4 dark: "Introducing" fades up, the name rises letter by letter out of a blur with tracking tightening; it lifts away while the desktop screen rises in with a rim light.
3.4–8.4: the site scrolls on the desktop screen under "Motion you can copy and paste."; the camera then dives through the screen until it fills the frame while the theme morphs to light.
8.4–13.3 light: "One library. Every screen." as the camera pulls back out of the page and tablet and phone screens spring in beside it with staggered parallax, each scrolling.
13.3–18.2 colour: the theme blooms into a blue-violet-pink gradient; the phone screen moves to centre and pages through component previews, the count rolls to 175, preview cards orbit it in 3D with depth blur, and a dark toast grows out above it: "Copied to clipboard".
18.2–23.2: "Templates that feel finished." A tablet and a phone screen show the same template; every 1.2 s the template changes and the entire stage morphs to its palette (Kiln dark amber, Tally sage, Side B lavender, Wayfare cream-orange) with a rolling name chip.
23.2–27.2: "Light." next to a phone screen; a big iOS switch flips and a circle of dark theme expands from the knob over the whole frame, the screen switching to a dark template, "And dark."
27.2–30.6: the mark and name lock up on black with the closing line and a blue nexus-ui.com link.

Score: original 112 BPM keynote bed (soft kick, claps, hats, sidechained pad, plucked arpeggio, sub bass) that drops on the light theme, filters down for the colour scene, changes chord with each template and blooms on the end card; plus whooshes, glass pops, a switch click and deep hits on every major move.`,
};

/* ------------------------------------------------------------------ */
/* colour + theme                                                       */
/* ------------------------------------------------------------------ */

const hx = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, p: number) => {
  const A = hx(a), B = hx(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], p))).join(",")})`;
};
const mixA = (a: string, b: string, p: number, al: number) => mix(a, b, p).replace("rgb", "rgba").replace(")", `,${al})`);

interface Theme { bg: string; l1: string; l2: string; ink: string; sub: string; glow: number }
const TH: Record<string, Theme> = {
  dark: { bg: "#000000", l1: "#1d3a8a", l2: "#4b2a8a", ink: "#f5f5f7", sub: "#86868b", glow: 0.35 },
  light: { bg: "#f5f5f7", l1: "#dfe9ff", l2: "#f3e3ff", ink: "#1d1d1f", sub: "#6e6e73", glow: 0.9 },
  color: { bg: "#0d1033", l1: "#3366ff", l2: "#c44dff", ink: "#ffffff", sub: "#c9c9ff", glow: 0.85 },
  kiln: { bg: "#0b0b0b", l1: "#8a5a10", l2: "#3a2a10", ink: "#f5f2ea", sub: "#a8a39a", glow: 0.7 },
  tally: { bg: "#eef3ec", l1: "#cfe9c6", l2: "#e5f0dc", ink: "#141a14", sub: "#5f6b5d", glow: 0.9 },
  sideb: { bg: "#f2edff", l1: "#d9c8ff", l2: "#ffd9f0", ink: "#1b1530", sub: "#6b6385", glow: 0.9 },
  wayfare: { bg: "#fbf3e8", l1: "#ffd9b0", l2: "#ffe9c9", ink: "#2a1a0e", sub: "#7a6a5c", glow: 0.9 },
  night: { bg: "#000000", l1: "#14244f", l2: "#2a1a4f", ink: "#f5f5f7", sub: "#86868b", glow: 0.4 },
};
/** [time the morph starts, duration, theme] */
const TIMELINE: [number, number, string][] = [
  [0, 0, "dark"],
  [7.55, 0.9, "light"],
  [12.9, 1.0, "color"],
  [17.9, 0.7, "kiln"],
  [19.1, 0.7, "tally"],
  [20.3, 0.7, "sideb"],
  [21.5, 0.7, "wayfare"],
  [22.9, 0.7, "light"],
  [27.0, 0.6, "night"],
];
function themeAt(t: number): Theme {
  let cur = TH.dark;
  for (let i = 1; i < TIMELINE.length; i++) {
    const [a, d, name] = TIMELINE[i];
    const p = ease.inOut(P(t, a, a + d));
    if (t < a) break;
    const nx = TH[name];
    cur = { bg: mix(cur.bg, nx.bg, p), l1: mix(cur.l1, nx.l1, p), l2: mix(cur.l2, nx.l2, p), ink: mix(cur.ink, nx.ink, p), sub: mix(cur.sub, nx.sub, p), glow: lerp(cur.glow, nx.glow, p) };
    // store as hex-ish for further mixing
    cur = toHex(cur);
  }
  return cur;
}
function toHex(th: Theme): Theme {
  const h = (c: string) => (c.startsWith("#") ? c : "#" + c.slice(4, -1).split(",").map((v) => (+v).toString(16).padStart(2, "0")).join(""));
  return { bg: h(th.bg), l1: h(th.l1), l2: h(th.l2), ink: h(th.ink), sub: h(th.sub), glow: th.glow };
}

/* ------------------------------------------------------------------ */
/* building blocks                                                      */
/* ------------------------------------------------------------------ */

const abs: CSSProperties = { position: "absolute" };

function Stage({ t, w, h, th }: { t: number; w: number; h: number; th: Theme }) {
  const S = Math.max(w, h);
  return (
    <div style={{ ...abs, inset: 0, background: th.bg }}>
      <div style={{ ...abs, left: w * (0.2 + Math.sin(t * 0.17) * 0.06) - S * 0.5, top: h * (0.25 + Math.cos(t * 0.13) * 0.05) - S * 0.5, width: S, height: S, borderRadius: "50%", background: `radial-gradient(circle, ${th.l1} 0%, transparent 62%)`, opacity: th.glow }} />
      <div style={{ ...abs, left: w * (0.82 + Math.cos(t * 0.15) * 0.05) - S * 0.5, top: h * (0.78 + Math.sin(t * 0.19) * 0.05) - S * 0.5, width: S, height: S, borderRadius: "50%", background: `radial-gradient(circle, ${th.l2} 0%, transparent 62%)`, opacity: th.glow }} />
    </div>
  );
}

/** a screenshot that scrolls inside a screen; `y` in screenshot pixels at the screen's width */
function Screen({ src, y = 0, bg = "#fff", children, style }: { src?: string; y?: number; bg?: string; children?: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ ...abs, inset: 0, overflow: "hidden", background: bg, ...style }}>
      {src && <img src={src} alt="" style={{ ...abs, left: 0, top: 0, width: "100%", transform: `translateY(${-y}px)` }} />}
      {children}
    </div>
  );
}

const MAC = { l: 11.366, t: 5.242, w: 77.432, h: 71.21, ar: 1830 / 1240 };
const PANEL_SHADOW = "0 50px 100px -40px rgba(0,0,0,.45), 0 18px 40px -24px rgba(0,0,0,.25), 0 0 0 1px rgba(0,0,0,.06)";

/**
 * Frameless "desktop" screen: just the page on a rounded panel, no device.
 * Keeps the old MacBook footprint (w × w/ar) so layouts and camera moves are unchanged;
 * the panel sits where the screen used to be.
 */
function MacBook({ w, children }: { w: number; children?: ReactNode; shadow?: number }) {
  const h = w / MAC.ar;
  const sw = (w * MAC.w) / 100;
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      <div style={{ ...abs, left: `${MAC.l}%`, top: `${MAC.t}%`, width: `${MAC.w}%`, height: `${MAC.h}%`, overflow: "hidden", borderRadius: sw * 0.018, background: "#fff", boxShadow: PANEL_SHADOW }}>
        {children}
      </div>
    </div>
  );
}

/** Frameless phone-sized screen with a floating toast above it (no device frame). */
function IPhone({ w, children, island, dark = false }: { w: number; children?: ReactNode; island?: ReactNode; dark?: boolean; tint?: string; safe?: boolean }) {
  const h = w * 2.061;
  const inset = w * 0.052;
  const sw = w - 2 * inset;
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      <div style={{ ...abs, inset, borderRadius: sw * 0.13, overflow: "hidden", background: dark ? "#000" : "#fff", boxShadow: dark ? "0 50px 100px -40px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.1)" : PANEL_SHADOW }}>
        {children}
      </div>
      {island && <div style={{ ...abs, left: "50%", top: inset - sw * 0.15, transform: "translateX(-50%)", zIndex: 5, filter: "drop-shadow(0 12px 24px rgba(0,0,0,.35))" }}>{island}</div>}
    </div>
  );
}

/** Frameless tablet-sized screen (landscape). */
function IPad({ w, children }: { w: number; children?: ReactNode }) {
  const h = w / 1.39;
  const inset = w * 0.028;
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      <div style={{ ...abs, inset, borderRadius: w * 0.026, overflow: "hidden", background: "#fff", boxShadow: PANEL_SHADOW }}>
        {children}
      </div>
    </div>
  );
}

/** positions a device by its centre */
function At({ x, y, s = 1, r = 0, o = 1, blur = 0, z, children }: { x: number; y: number; s?: number; r?: number; o?: number; blur?: number; z?: number; children: ReactNode }) {
  return (
    <div style={{ ...abs, left: x, top: y, transform: `translate(-50%,-50%) scale(${s}) rotate(${r}deg)`, opacity: o, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, zIndex: z }}>{children}</div>
  );
}

/** Apple-style headline: rises out of a blur, tracking tightens */
function Head({ t, a, b = 99, text, size, color, weight = 600, style, grad }: { t: number; a: number; b?: number; text: string; size: number; color: string; weight?: number; style?: CSSProperties; grad?: string }) {
  const i = ease.expo(P(t, a, a + 0.9));
  const o = ease.inOut(P(t, b, b + 0.45));
  if (t < a || t > b + 0.5) return null;
  return (
    <div style={{ fontFamily: FONT, fontSize: size, fontWeight: weight, color, letterSpacing: `${lerp(0.02, -0.035, i)}em`, lineHeight: 1.05, opacity: clamp(i * 1.4) * (1 - o), transform: `translateY(${(1 - i) * size * 0.35 - o * size * 0.25}px)`, filter: `blur(${(1 - i) * 14 + o * 10}px)`, whiteSpace: "pre-wrap", ...(grad ? { background: grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } : {}), ...style }}>
      {text}
    </div>
  );
}

/** human-like scroll: pauses, then glides */
function readScroll(t: number, a: number, stops: number[], dwell = 0.55, glide = 0.75) {
  let y = 0;
  let at = a;
  for (const s of stops) {
    at += dwell;
    y = lerp(y, s, ease.inOut(P(t, at, at + glide)));
    at += glide;
  }
  return y;
}

const TILES = [tileDock, tilePay, tileCopy, tileIsland, tileReel, tileFolder, tilePend, tileRouter];

/* ------------------------------------------------------------------ */
/* film                                                                 */
/* ------------------------------------------------------------------ */

export default function KeynoteFilm({ t, w = 1920, h = 1080, ...props }: { t: number } & Frame & Partial<KeynoteFilmProps>) {
  const p = { ...meta.defaults, ...props };
  const land = w > h;
  const th = themeAt(t);
  return (
    <div style={{ ...abs, inset: 0, width: w, height: h, overflow: "hidden", fontFamily: FONT }}>
      <Stage t={t} w={w} h={h} th={th} />
      <Intro t={t} w={w} h={h} land={land} th={th} p={p} />
      <Lineup t={t} w={w} h={h} land={land} th={th} p={p} />
      <Components t={t} w={w} h={h} land={land} th={th} p={p} />
      <Templates t={t} w={w} h={h} land={land} th={th} p={p} />
      <Toggle t={t} w={w} h={h} land={land} />
      <End t={t} w={w} h={h} land={land} p={p} />
      <div style={{ ...abs, inset: 0, background: "#000", opacity: P(t, 30.15, 30.6), pointerEvents: "none" }} />
    </div>
  );
}

type SP = { t: number; w: number; h: number; land: boolean; th: Theme; p: KeynoteFilmProps };

/* 0 – 8.6  intro + MacBook + dive ------------------------------------ */
function Intro({ t, w, h, land, th, p }: SP) {
  if (t > 8.27) return null;
  const cx = w / 2, cy = h / 2;
  const macW = land ? 1220 : 1000;
  const macH = macW / MAC.ar;
  const rise = ease.expo(P(t, land ? 2.55 : 2.35, land ? 3.8 : 3.6));
  const macY = lerp(h + macH * 0.6, land ? cy + 90 : cy + 140, rise);
  // dive through the screen
  const dive = P(t, 6.9, 8.25);
  const dv = ease.inOut(dive);
  const scrW = macW * MAC.w / 100;
  const scrH = macH * MAC.h / 100;
  const scrCx = cx;
  const scrCy = macY - macH / 2 + macH * (MAC.t / 100) + scrH / 2;
  const target = Math.max(w / scrW, h / scrH) * 1.02;
  const s = lerp(1, target, dv);
  const blur = Math.sin(dive * Math.PI) * 3;
  const scroll = readScroll(t, 3.4, [520, 1180, 1880], 0.5, 0.75);
  const nameSize = land ? 230 : 190;
  const nameUp = ease.inOut(P(t, land ? 2.1 : 2.3, land ? 3.0 : 3.3));
  const fadeName = P(t, land ? 2.7 : 3.15, land ? 3.1 : 3.6);
  const letters = Array.from(p.name);
  // after the dive, the site fills the frame and fades into the light stage
  return (
    <div style={{ ...abs, inset: 0 }}>
      {/* rim light behind the Mac */}
      <div style={{ ...abs, left: cx - macW * 0.7, top: macY - macH * 0.9, width: macW * 1.4, height: macH * 1.3, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(90,120,255,.35), transparent 65%)", opacity: rise * (1 - dv) }} />
      {/* introducing + name */}
      <div style={{ ...abs, left: 0, right: 0, top: cy - nameSize * 0.75 - nameUp * (land ? 410 : 520), textAlign: "center", opacity: 1 - fadeName, transform: `scale(${1 - nameUp * 0.58})`, zIndex: 4 }}>
        <div style={{ fontFamily: FONT, fontSize: land ? 40 : 46, fontWeight: 500, color: th.sub, opacity: ease.out(P(t, 0.25, 0.9)) * (1 - P(t, 2.1, 2.5)), filter: `blur(${(1 - P(t, 0.25, 0.9)) * 8}px)`, marginBottom: 18 }}>Introducing</div>
        <div style={{ fontFamily: FONT, fontSize: nameSize, fontWeight: 700, letterSpacing: `${lerp(0.08, -0.045, ease.expo(P(t, 0.9, 2.2)))}em`, lineHeight: 1, whiteSpace: "nowrap" }}>
          {letters.map((c, i) => {
            const a = ease.expo(P(t, 0.9 + i * 0.05, 1.8 + i * 0.05));
            return (
              <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: a, transform: `translateY(${(1 - a) * nameSize * 0.4}px)`, filter: `blur(${(1 - a) * 18}px)`, background: "linear-gradient(180deg,#ffffff 20%,#a1a1a6 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{c}</span>
            );
          })}
        </div>
      </div>
      {/* headline over the Mac */}
      <div style={{ ...abs, left: 0, right: 0, top: land ? 92 : 300, textAlign: "center", opacity: 1 - ease.in(P(t, 6.8, 7.3)) }}>
        <Head t={t} a={3.5} text={land ? p.line1 : p.line1.replace(" copy", "\ncopy")} size={land ? 74 : 84} color={th.ink} />
      </div>
      {/* camera */}
      <div style={{ ...abs, inset: 0, transformOrigin: `${scrCx}px ${scrCy}px`, transform: `scale(${s})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
        <At x={cx} y={macY}>
          <MacBook w={macW}>
            <Screen src={site} y={scroll * (scrW / 1248)} />
          </MacBook>
        </At>
      </div>
    </div>
  );
}

/* 8.3 – 13.6  lineup -------------------------------------------------- */
function Lineup({ t, w, h, land, th, p }: SP) {
  if (t < 8.1 || t > 13.9) return null;
  const cx = w / 2, cy = h / 2;
  const out = ease.inOut(P(t, 12.8, 13.6));
  const dev = (d: number) => spring(t - d, 0.62, 7.5);
  const sPad = dev(8.95), sPhone = dev(9.1);
  const mw = land ? 900 : 860;
  const pw = land ? 600 : 560;
  const iw = land ? 220 : 230;
  const pos = land
    ? { mac: [cx, cy + 110], pad: [cx - 540, cy + 190], phone: [cx + 560, cy + 160] }
    : { mac: [cx, cy - 40], pad: [cx - 200, cy + 470], phone: [cx + 310, cy + 430] };
  const drift = P(t, 8.5, 13.5) * 30;
  const yPad = readScroll(t, 9.2, [260, 620], 0.7, 0.9) * (pw / 1180) * 1.2;
  const yPhone = readScroll(t, 9.4, [380, 900, 1500], 0.5, 0.75) * ((iw * 0.9) / 540);
  const pull = ease.inOut(P(t, 8.25, 9.35));
  const macH = mw / MAC.ar;
  const scrW = (mw * MAC.w) / 100, scrH = (macH * MAC.h) / 100;
  const scrDy = -macH / 2 + macH * (MAC.t / 100) + scrH / 2; // screen centre relative to the Mac's centre
  const target = Math.max(w / scrW, h / scrH) * 1.02;
  const macS = lerp(target, 1, pull);
  const macCx = lerp(cx, pos.mac[0], pull);
  const macCy = lerp(cy - scrDy * target, pos.mac[1], pull);
  const sitePx = lerp(1880, 0, ease.inOut(P(t, 8.3, 9.6))) + readScroll(t, 10.2, [600, 1250], 0.7, 0.9);
  const yMac = sitePx * (scrW / 1248);
  return (
    <div style={{ ...abs, inset: 0 }}>
      <div style={{ ...abs, left: 0, right: 0, top: land ? 90 : 300, textAlign: "center", opacity: 1 - out }}>
        <Head t={t} a={9.0} text={land ? p.line2 : p.line2.replace(". ", ".\n")} size={land ? 80 : 92} color={th.ink} />
      </div>
      <At x={macCx - out * w * 0.3} y={macCy - drift * pull} s={macS} o={1 - out}>
        <MacBook w={mw} shadow={0.6}><Screen src={site} y={yMac} /></MacBook>
      </At>
      <At x={pos.pad[0] - out * w * 0.4} y={pos.pad[1] + (1 - sPad) * 600 - drift * 1.5} s={0.9 + sPad * 0.1} o={clamp(sPad * 2) * (1 - out)} z={2}>
        <IPad w={pw}><Screen src={tCairn} y={yPad} /></IPad>
      </At>
      <At x={lerp(pos.phone[0], cx, out)} y={lerp(pos.phone[1] + (1 - sPhone) * 700 - drift * 2, cy + (land ? 40 : 60), out)} s={lerp(0.9 + sPhone * 0.1, land ? 1.75 : 2.15, ease.inOut(out))} o={clamp(sPhone * 2) * (1 - P(t, 13.45, 13.6))} z={3}>
        <IPhone w={iw}><Screen src={mTally} y={lerp(yPhone, 0, out)} /></IPhone>
      </At>
    </div>
  );
}

/* 13.3 – 18.4  components -------------------------------------------- */
function Components({ t, w, h, land, th, p }: SP) {
  if (t < 13.4 || t > 18.6) return null;
  const cx = w / 2 + (land ? 230 : 0), cy = h / 2;
  const iw = land ? 385 : 495;
  const out = ease.inOut(P(t, 17.85, 18.45));
  const ph = (t - 13.5) / 0.62;
  const idx = Math.max(0, Math.floor(ph));
  const fr = ph - idx;
  const sl = ease.inOut(clamp((fr - 0.62) / 0.38));
  const cur = TILES[idx % TILES.length];
  const nxt = TILES[(idx + 1) % TILES.length];
  const count = Math.round(ease.out(P(t, 13.8, 16.2)) * (Number(p.count) || 0));
  const isl = ease.inOut(P(t, 15.5, 15.95)) * (1 - ease.inOut(P(t, 16.9, 17.3)));
  const toastOn = clamp(isl * 4);
  const sw = iw - 2 * (iw * 0.052);
  const island = (
    <div style={{ opacity: toastOn, transform: `scale(${0.6 + toastOn * 0.4})`, width: lerp(sw * 0.31, sw * 0.9, isl), height: lerp(sw * 0.092, sw * 0.2, isl), borderRadius: lerp(sw * 0.05, sw * 0.1, isl), background: "#1d1d1f", display: "flex", alignItems: "center", padding: `0 ${sw * 0.04}px`, gap: sw * 0.03, overflow: "hidden", fontFamily: TEXT, color: "#fff" }}>
      <span style={{ width: sw * 0.11, height: sw * 0.11, borderRadius: "50%", background: "#30d158", display: "flex", alignItems: "center", justifyContent: "center", opacity: clamp(isl * 3 - 1.5), transform: `scale(${clamp(isl * 3 - 1.5)})`, flex: "none" }}>
        <svg width={sw * 0.06} height={sw * 0.06} viewBox="0 0 20 20"><path d="M4 10.5l4 4 8-9" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <span style={{ fontSize: sw * 0.05, fontWeight: 600, whiteSpace: "nowrap", opacity: clamp(isl * 3 - 1.8) }}>Copied to clipboard</span>
    </div>
  );
  // orbiting cards
  const orbit = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + (t - 13.5) * 0.45;
    const rx = land ? 500 : 430;
    const ry = land ? 110 : 520;
    const z = Math.sin(a);
    const x = cx + Math.cos(a) * rx;
    const y = cy + (land ? Math.sin(a) * ry + Math.sin(a * 2 + i) * 40 : Math.sin(a) * ry * 0.85);
    const sc = (0.75 + z * 0.25) * (land ? 1 : 1.05);
    const inn = spring(t - 13.7 - i * 0.07, 0.6, 9);
    return { i, x, y, z, sc, inn };
  }).sort((a, b) => a.z - b.z);
  const cardW = land ? 300 : 280;
  const card = (o: (typeof orbit)[number]) => (
    <div key={o.i} style={{ ...abs, left: o.x, top: o.y, width: cardW, height: cardW * 0.6, borderRadius: 22, overflow: "hidden", background: "#fff", boxShadow: "0 30px 60px -25px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.35)", transform: `translate(-50%,-50%) scale(${o.sc * o.inn}) rotateY(0deg)`, filter: `blur(${Math.max(0, -o.z) * 7}px)`, opacity: clamp(o.inn * 2) * (0.55 + (o.z + 1) * 0.225) * (1 - out) }}>
      <img src={TILES[o.i]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
  const sPhone = 1 - out * 0.3;
  return (
    <div style={{ ...abs, inset: 0 }}>
      {orbit.filter((o) => o.z < 0).map(card)}
      <At x={cx} y={cy + (land ? 40 : 60) + out * h * 0.7} s={sPhone} r={out * 8}>
        <IPhone w={iw} dark island={island} safe={false}>
          <Screen bg="#f5f5f7">
            <div style={{ ...abs, left: 0, right: 0, top: sw * 0.14, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: sw * 0.07, color: "#1d1d1f" }}>Components</div>
            {[cur, nxt].map((src, k) => (
              <div key={k} style={{ ...abs, left: sw * 0.06, right: sw * 0.06, top: sw * 0.32, height: sw * 1.25, borderRadius: sw * 0.06, overflow: "hidden", background: "#fff", boxShadow: "0 20px 40px -24px rgba(0,0,0,.35)", transform: k === 0 ? `translateX(${-sl * 110}%) scale(${1 - sl * 0.1})` : `translateX(${(1 - sl) * 110}%) scale(${0.9 + sl * 0.1})` }}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff" }} />
              </div>
            ))}
            <div style={{ ...abs, left: 0, right: 0, top: sw * 1.66, display: "flex", justifyContent: "center", gap: sw * 0.025 }}>
              {TILES.map((_, i) => <span key={i} style={{ width: i === idx % TILES.length ? sw * 0.06 : sw * 0.02, height: sw * 0.02, borderRadius: sw * 0.01, background: i === idx % TILES.length ? "#1d1d1f" : "#c7c7cc" }} />)}
            </div>
          </Screen>
        </IPhone>
      </At>
      {orbit.filter((o) => o.z >= 0).map(card)}
      {/* count */}
      <div style={{ ...abs, left: land ? 130 : 0, right: land ? undefined : 0, top: land ? cy - 170 : 150, textAlign: land ? "left" : "center", opacity: ease.out(P(t, 13.7, 14.3)) * (1 - ease.inOut(P(t, 17.5, 17.85))), color: th.ink, zIndex: 6 }}>
        <div style={{ fontFamily: FONT, fontSize: land ? 220 : 240, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 0.95, fontVariantNumeric: "tabular-nums" }}>{count}</div>
        <div style={{ fontFamily: FONT, fontSize: land ? 44 : 52, fontWeight: 600, letterSpacing: "-0.02em", color: th.sub }}>components.</div>
      </div>
    </div>
  );
}

/* 17.9 – 23.4  templates --------------------------------------------- */
const TPL = [
  { name: "Kiln", t: tKiln, m: mKiln, at: 17.9 },
  { name: "Tally", t: tTally, m: mTally, at: 19.1 },
  { name: "Side B", t: tSideb, m: mSideb, at: 20.3 },
  { name: "Wayfare", t: tWayfare, m: mWayfare, at: 21.5 },
];
function Templates({ t, w, h, land, th, p }: SP) {
  if (t < 17.8 || t > 23.6) return null;
  const cx = w / 2, cy = h / 2;
  const inn = spring(t - 17.95, 0.62, 7);
  const out = ease.inOut(P(t, 22.8, 23.25));
  const pw = land ? 1000 : 900;
  const iw = land ? 250 : 260;
  const k = TPL.reduce((acc, x, i) => (t >= x.at ? i : acc), 0);
  const swap = (i: number) => ease.inOut(P(t, TPL[i].at, TPL[i].at + 0.7));
  const padX = land ? cx + 210 : cx;
  const padY = land ? cy + 90 : cy + 140;
  const phX = land ? padX + pw * 0.42 : cx + 300;
  const phY = land ? padY + 110 : padY + 330;
  const layer = (kind: "t" | "m", scale: number) =>
    TPL.map((x, i) => {
      const s = swap(i);
      if (i > k + 1 || (i < k && swap(i + 1) >= 1)) return null;
      return (
        <div key={x.name} style={{ ...abs, inset: 0, clipPath: i === 0 ? undefined : `inset(${(1 - s) * 100}% 0 0 0)`, transform: i === 0 ? undefined : `translateY(${(1 - s) * 6}%)` }}>
          <Screen src={kind === "t" ? x.t : x.m} y={readScroll(t, x.at + 0.2, [kind === "t" ? 220 : 500], 0.4, 0.6) * scale} />
        </div>
      );
    });
  const nameRoll = (i: number) => {
    const a = ease.inOut(P(t, TPL[i].at, TPL[i].at + 0.6));
    const b = i + 1 < TPL.length ? ease.inOut(P(t, TPL[i + 1].at, TPL[i + 1].at + 0.6)) : 0;
    return { y: (1 - a) * 60 - b * 60, o: a * (1 - b) };
  };
  return (
    <div style={{ ...abs, inset: 0, opacity: 1 - out }}>
      <div style={{ ...abs, left: land ? 120 : 0, right: land ? undefined : 0, top: land ? 120 : 260, textAlign: land ? "left" : "center", color: th.ink }}>
        <Head t={t} a={18.05} text={land ? p.line3.replace(" feel", "\nfeel") : p.line3.replace(" feel", "\nfeel")} size={land ? 76 : 88} color={th.ink} />
        <div style={{ position: "relative", height: land ? 64 : 72, marginTop: 26, display: "flex", justifyContent: land ? "flex-start" : "center" }}>
          {TPL.map((x, i) => {
            const r = nameRoll(i);
            return (
              <div key={x.name} style={{ ...abs, left: land ? 0 : "50%", transform: `translate(${land ? 0 : "-50%"}, ${r.y}px)`, opacity: r.o, display: "inline-flex", alignItems: "center", gap: 12, height: land ? 56 : 64, padding: "0 26px", borderRadius: 40, background: mixA(th.ink, th.ink, 0, 0.08), color: th.ink, fontFamily: FONT, fontSize: land ? 28 : 32, fontWeight: 600 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: th.l1, boxShadow: `0 0 0 3px ${mixA(th.ink, th.ink, 0, 0.15)}` }} />
                {x.name}
              </div>
            );
          })}
        </div>
      </div>
      <At x={padX + (1 - inn) * w * 0.4} y={padY} s={0.94 + inn * 0.06} o={clamp(inn * 2)}>
        <IPad w={pw}>{layer("t", pw / 1180)}</IPad>
      </At>
      <At x={phX + (1 - spring(t - 18.15, 0.6, 7.5)) * w * 0.5} y={phY} r={(1 - spring(t - 18.15, 0.6, 7.5)) * 10} z={3}>
        <IPhone w={iw}>{layer("m", (iw * 0.9) / 540)}</IPhone>
      </At>
    </div>
  );
}

/* 23.0 – 27.4  light / dark ----------------------------------------- */
function Toggle({ t, w, h, land }: Omit<SP, "p" | "th">) {
  if (t < 22.95 || t > 27.6) return null;
  const cx = w / 2, cy = h / 2;
  const inn = ease.expo(P(t, 23.3, 23.95));
  const flip = ease.inOut(P(t, 24.55, 24.85));
  const reveal = ease.inOut(P(t, 24.6, 25.55));
  const out = ease.inOut(P(t, 26.9, 27.45));
  const swW = land ? 300 : 300;
  const swH = swW * 0.6;
  const swX = land ? cx - 470 : cx;
  const swY = land ? cy + 260 : cy + 30;
  const knobX = swX - swW / 2 + swH / 2 + flip * (swW - swH);
  const R = Math.hypot(w, h) * 1.1 * reveal;
  const phX = land ? cx + 420 : cx;
  const phY = land ? cy + 30 : cy + 640;
  const iw = land ? 300 : 300;
  const scr = (dark: boolean) => (
    <IPhone w={iw} dark={dark}>
      <Screen src={dark ? mStrata : mRelay} bg={dark ? "#000" : "#fff"} y={readScroll(t, 23.6, [260], 0.6, 0.9) * ((iw * 0.9) / 540)} />
    </IPhone>
  );
  const textL = (label: string, color: string, sub: string, k: number) => (
    <div style={{ ...abs, left: land ? cx - 470 - 280 : 0, right: land ? undefined : 0, top: land ? cy - 260 : 330, width: land ? 560 : undefined, textAlign: land ? "left" : "center", color, opacity: k }}>
      <div style={{ fontFamily: FONT, fontSize: land ? 150 : 160, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1 }}>{label}</div>
      <div style={{ fontFamily: FONT, fontSize: land ? 34 : 40, fontWeight: 500, color: sub, marginTop: 18, opacity: ease.out(P(t, 25.4, 25.9)) }}>Every component, both themes.</div>
    </div>
  );
  const sw = (on: boolean) => (
    <div style={{ ...abs, left: swX - swW / 2, top: swY - swH / 2, width: swW, height: swH, borderRadius: swH, background: on ? "#30d158" : "#e9e9eb", boxShadow: on ? "inset 0 0 0 0 transparent" : "inset 0 0 0 2px rgba(0,0,0,.06)", transform: `scale(${inn})` }}>
      <div style={{ ...abs, left: knobX - (swX - swW / 2) - swH / 2 + swH * 0.06, top: swH * 0.06, width: swH * 0.88 + Math.sin(flip * Math.PI) * swH * 0.25, height: swH * 0.88, borderRadius: swH, background: "#fff", boxShadow: "0 6px 14px rgba(0,0,0,.18), 0 0 0 .5px rgba(0,0,0,.04)" }} />
    </div>
  );
  const phIn = spring(t - 23.4, 0.62, 7);
  const phone = (dark: boolean) => (
    <At x={phX} y={phY + (1 - phIn) * 600 + out * 900} r={(1 - phIn) * -8}>{scr(dark)}</At>
  );
  return (
    <div style={{ ...abs, inset: 0 }}>
      {/* light layer */}
      <div style={{ ...abs, inset: 0 }}>
        {textL("Light.", "#1d1d1f", "#6e6e73", inn)}
        {phone(false)}
        {sw(false)}
      </div>
      {/* dark layer revealed from the knob */}
      <div style={{ ...abs, inset: 0, clipPath: `circle(${R}px at ${knobX}px ${swY}px)`, background: "#000" }}>
        <div style={{ ...abs, left: w * 0.3, top: -h * 0.2, width: w, height: w, borderRadius: "50%", background: "radial-gradient(circle, rgba(60,80,200,.35), transparent 60%)" }} />
        {textL("And dark.", "#f5f5f7", "#86868b", 1)}
        {phone(true)}
        {sw(true)}
      </div>
    </div>
  );
}

/* 27.0 – 30.6  end card --------------------------------------------- */
function End({ t, w, h, land, p }: Omit<SP, "th">) {
  if (t < 27.0) return null;
  const cx = w / 2, cy = h / 2;
  const fade = P(t, 27.0, 27.4);
  const m = spring(t - 27.3, 0.55, 8);
  const name = ease.expo(P(t, 27.6, 28.3));
  const line = ease.expo(P(t, 28.3, 29.0));
  const link = ease.expo(P(t, 28.7, 29.4));
  const msz = land ? 176 : 160;
  const fs = land ? 150 : 124;
  const nameW = Array.from(p.name).length * fs * 0.53;
  const gap = 36;
  const total = msz + gap + nameW;
  const mx = cx - total / 2 + (msz / 2) * 0 + (1 - name) * (total / 2 - msz / 2);
  return (
    <div style={{ ...abs, inset: 0, background: "#000", opacity: fade }}>
      <div style={{ ...abs, left: cx - 600, top: cy - 600, width: 1200, height: 1200, borderRadius: "50%", background: "radial-gradient(circle, rgba(70,100,255,.28), transparent 60%)", opacity: m }} />
      <div style={{ ...abs, left: mx, top: cy - 80 - msz / 2, width: msz, height: msz, transform: `scale(${m}) rotate(${(1 - m) * 120}deg)` }}>
        <svg width={msz} height={msz} viewBox="-100 -100 200 200" style={{ overflow: "visible", filter: "drop-shadow(0 0 22px rgba(125,150,255,.8))" }}>
          <defs>
            <linearGradient id="kn-spoke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#9ec5ff" /><stop offset="0.5" stopColor="#ffffff" /><stop offset="1" stopColor="#c3a6ff" />
            </linearGradient>
          </defs>
          {[-90, 150, 30].map((d) => { const a = (d * Math.PI) / 180; return <g key={d}><line x1={0} y1={0} x2={Math.cos(a) * 62} y2={Math.sin(a) * 62} stroke="url(#kn-spoke)" strokeWidth={9} strokeLinecap="round" /><circle cx={Math.cos(a) * 62} cy={Math.sin(a) * 62} r={12} fill="#fff" /></g>; })}
          <circle r={16} fill="#7d96ff" />
        </svg>
      </div>
      <div style={{ ...abs, left: mx + msz + gap, top: cy - 80 - fs * 0.62, height: fs * 1.24, display: "flex", alignItems: "center", fontFamily: FONT, fontSize: fs, fontWeight: 700, letterSpacing: "-0.045em", color: "#f5f5f7", whiteSpace: "nowrap", clipPath: `inset(-20% ${(1 - name) * 100}% -20% 0)`, transform: `translateX(${(1 - name) * -50}px)` }}>{p.name}</div>
      <div style={{ ...abs, left: 0, right: 0, top: cy + msz * 0.35, textAlign: "center", fontFamily: FONT, fontSize: land ? 40 : 44, fontWeight: 500, color: "#86868b", opacity: line, transform: `translateY(${(1 - line) * 20}px)`, filter: `blur(${(1 - line) * 8}px)`, padding: "0 60px" }}>{p.cta}</div>
      <div style={{ ...abs, left: 0, right: 0, top: cy + msz * 0.35 + (land ? 80 : 150), textAlign: "center", fontFamily: TEXT, fontSize: land ? 34 : 40, fontWeight: 500, color: "#2997ff", opacity: link, transform: `translateY(${(1 - link) * 16}px)` }}>
        {p.url} <span style={{ display: "inline-block", transform: `translateX(${Math.sin(Math.max(0, t - 29.4) * 3) * 4}px)` }}>›</span>
      </div>
    </div>
  );
}
