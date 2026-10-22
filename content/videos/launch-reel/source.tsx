import type { CSSProperties, ReactNode } from "react";
import { FONT, GRAD, H, P, W, bgBlobs, clamp, ease, gradText, lerp, rise, spring, type VideoMeta } from "./kit";
import pageImg from "./assets/nexus-page.jpg";
import navImg from "./assets/nexus-nav.jpg";
import wPort from "./assets/word-port.jpg";
import wDash from "./assets/word-dash.jpg";
import wPrice from "./assets/word-price.jpg";
import wBlank from "./assets/word-blank.jpg";
import logoImg from "./assets/nexus-logo.png";
import tPay from "./assets/tile-pay.jpg";
import tRouter from "./assets/tile-router.jpg";
import tPend from "./assets/tile-pend.jpg";
import tReel from "./assets/tile-reel.jpg";
import tDock from "./assets/tile-dock.jpg";
import tIsland from "./assets/tile-island.jpg";
import tFolder from "./assets/tile-folder.jpg";
import tCopy from "./assets/tile-copy.jpg";

export interface LaunchReelProps {
  words: string;
  caption: string;
  shelves: string;
  stat: string;
  sub: string;
  brand: string;
  url: string;
  pill: string;
}

export const meta: VideoMeta<LaunchReelProps> = {
  id: "launch-reel",
  title: "Launch Reel",
  platforms: ["Reels", "TikTok", "Shorts"],
  purpose: "Product launch",
  motion: "Type match-cut into the live site",
  app: "Nexus UI",
  duration: 12,
  bpm: 120,
  cuts: [2, 4.5, 7.5, 10],
  blurb: "Big words swap on the beat, then shrink onto your real homepage headline. The site scrolls past, your best pieces cascade in, and it lands on the logo.",
  defaults: {
    words: "landing page, dashboard, pricing page, portfolio",
    caption: "Motion, ready to paste.",
    shelves: "Components. Blocks. Templates.",
    stat: "183 animated components.",
    sub: "Each with its own physics.",
    brand: "Nexus UI",
    url: "nexus-ui.com",
    pill: "Free to start · React + Motion",
  },
  fields: [
    { key: "words", label: "Intro words (comma separated)", type: "text" },
    { key: "caption", label: "Caption over the site", type: "text", max: 30 },
    { key: "shelves", label: "Caption while scrolling", type: "text", max: 32 },
    { key: "stat", label: "Headline over the tiles", type: "text", max: 28 },
    { key: "sub", label: "Line under it", type: "text", max: 40 },
    { key: "brand", label: "Name on the end card", type: "text", max: 14 },
    { key: "url", label: "Address", type: "text", max: 22 },
    { key: "pill", label: "End card pill", type: "text", max: 34 },
  ],
  prompt: `Make a 12-second vertical (1080×1920, 30fps) launch reel for my site in a clean Apple keynote style. Light background (#f5f5f7) with two very soft blurred colour lights (blue top-left, pink bottom-right) drifting slowly. Font: Inter Display, bold, tight tracking (-0.045em). Music: 120 BPM soft beat, every cut and word change lands on a beat.

0–2s: Centered three-line headline "Make your / [word] / move.". Line 1 and 3 rise in with blur. The middle word is a blue→purple→pink→orange gradient and swaps every half second (landing page → dashboard → pricing page → portfolio): the old word lifts and blurs out, the new one rises from below out of a blur.

2–2.75s: Match cut. The headline shrinks and moves until it sits exactly on top of the real headline in a screenshot of my homepage, which fades in inside a floating window (rounded 34px, soft layered shadow, slim top bar with three grey dots and a centred "nexus-ui.com" address pill). While the type travels, hide the site's own headline under a background-coloured patch; when they line up, crossfade type and patch away so it reads as one headline.

2.75–4.5s: Slow push-in (1 → 1.2) on the headline. The site's coloured word swaps on the beat too (use crops of the real page for each word, blurred cross-dissolve). Caption above the window: "Motion, ready to paste." words rising in one by one.

4.5–7.5s: The window scrolls a stitched full-page screenshot in two eased moves (to the component grid, hold, then to the bottom), with a tiny vertical motion blur that follows scroll speed and the site's floating nav pinned at the top. Caption builds on the beats: "Components." "Blocks." "Templates." (last word in the gradient).

7.5–10s: The window lifts, shrinks and blurs away. Eight real component tiles (crops from the site, rounded 26px cards with soft shadows) spring up from below in a staggered, alternating order into a two-row-height mosaic that drifts upward slowly. Title "183 animated components." with a grey line "Each with its own physics."

10–12s: Tiles dissolve. End card: the logo springs in from a small rotated state, then "Nexus UI" (132px bold), "nexus-ui.com" in the gradient, and a white pill "Free to start · React + Motion" with a green dot, each rising in 0.15s apart. The card breathes in by 2%.

Build it as a React component that is a pure function of time t (no timers inside), so it can be scrubbed and rendered frame by frame to MP4.`,
};

const S = 1000 / 1248; // site px -> window px
const PAGE_H = 3867 * S;
const OY = 250;
const K = 0.4484; // type scale that matches the site headline inside the window
const LH = 169.5;
const BO = 145;
const zoomAt = (t: number) => lerp(1, 1.2, ease.inOut(P(t, 2.76, 3.75)));
const scFor = (y: number, at: number, z: number) => OY + (y - OY) * z - at;
function scrollAt(t: number) {
  const a = scFor(905 * S, 40, 1.2), m = scFor(PAGE_H, 1308, 1.2);
  if (t < 4.5) return 0;
  if (t < 5.7) return a * ease.inOut(P(t, 4.5, 5.7));
  if (t < 6.0) return a;
  return lerp(a, m, ease.inOut(P(t, 6.0, 7.35)));
}

const TILES: [string, number, number, number, number][] = [
  [tPay, 45, 0, 300, 337], [tRouter, 375, -12, 660, 361],
  [tPend, 45, 391, 480, 262], [tReel, 555, 391, 480, 262],
  [tDock, 45, 683, 660, 361], [tIsland, 735, 695, 300, 337],
  [tFolder, 45, 1074, 300, 337], [tCopy, 375, 1062, 660, 361],
];
const ORDER = [1, 0, 3, 2, 4, 5, 7, 6];

const abs: CSSProperties = { position: "absolute" };
const line: CSSProperties = { position: "absolute", left: -540, width: 1080, textAlign: "center", fontWeight: 700, letterSpacing: "-0.045em", whiteSpace: "nowrap", lineHeight: 1, fontSize: 168 };

export default function LaunchReel({ t, ...props }: { t: number } & Partial<LaunchReelProps>) {
  const p = { ...meta.defaults, ...props };
  const words = p.words.split(",").map((w) => w.trim()).filter(Boolean).slice(0, 4);
  while (words.length < 4) words.push(words[words.length - 1] ?? "site");

  // type block: centred, then travels onto the site headline
  const mv = ease.inOut(P(t, 2.0, 2.56));
  const CY0 = 940 - (-0.72 * 168 + 2 * LH + 3) / 2;
  const k = lerp(1, K, mv), cx = lerp(540, 538.6, mv), cy = lerp(CY0, 591.2, mv);
  const typeOp = 1 - P(t, 2.56, 2.76);

  const wordWin: [number, number][] = [[-1, 0.5], [0.5, 1.0], [1.0, 1.5], [1.5, 99]];

  // window
  const wIn = P(t, 2.0, 2.58), wOut = P(t, 7.45, 8.05);
  const ws = lerp(1.06, 1, ease.out(wIn)) * lerp(1, 0.9, ease.inOut(wOut));
  const wy = (1 - ease.out(wIn)) * 50 - ease.in(wOut) * 320;
  const z = zoomAt(t);
  const sc = scrollAt(t), vel = Math.abs(scrollAt(t + 1 / 60) - scrollAt(t - 1 / 60)) * 30;

  // in-site word swaps (crops of the real page)
  const blank = t > 2.9 && t < 4.35;
  const swap = (a: number, b: number) => {
    const pin = a < 0 ? 1 : ease.expo(P(t, a + 0.03, a + 0.32));
    const pout = ease.out(P(t, b, b + 0.18));
    return { opacity: clamp(pin * 1.5) * (1 - pout), transform: `translateY(${(1 - pin) * 26 - pout * 20}px)`, filter: `blur(${(1 - pin) * 8 + pout * 8}px)` } as CSSProperties;
  };
  const siteWords: [string, CSSProperties][] = blank
    ? [[wPort, t < 3.5 ? swap(-1, 2.98) : swap(4.0, 99)], [wDash, swap(3.0, 3.48)], [wPrice, swap(3.5, 3.98)]]
    : [];

  const capWords = p.caption.split(" ");
  const shelfWords = p.shelves.split(" ");
  const dOut = P(t, 9.72, 9.95);
  const drift = lerp(110, -40, ease.out(P(t, 7.5, 10)));
  const ls = spring(P(t, 9.98, 11.0), 0.5, 13);
  const g = lerp(1, 1.025, ease.inOut(P(t, 10.0, 12.0)));

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#f5f5f7", fontFamily: FONT, color: "#1d1d1f" }}>
      {bgBlobs(t).map((s, i) => <div key={i} style={s} />)}

      {t >= 1.98 && t <= 8.1 && (
        <div style={{ ...abs, left: 40, top: 340, width: 1000, height: 1360, borderRadius: 34, background: "#fff", overflow: "hidden", boxShadow: "0 0 0 1px rgba(0,0,0,.06),0 50px 120px -40px rgba(0,0,0,.35),0 20px 40px -24px rgba(0,0,0,.18)", transformOrigin: "50% 30%", opacity: clamp(P(t, 2.0, 2.32)) * (1 - P(t, 7.6, 8.05)), transform: `translateY(${wy}px) scale(${ws})`, filter: wOut ? `blur(${wOut * 10}px)` : undefined }}>
          <div style={{ ...abs, left: 0, top: 0, right: 0, height: 52, background: "#fbfbfd", borderBottom: "1px solid rgba(0,0,0,.06)", zIndex: 5 }}>
            {[22, 42, 62].map((x) => <span key={x} style={{ ...abs, top: 20, left: x, width: 12, height: 12, borderRadius: 6, background: "#d9d9de" }} />)}
            <div style={{ ...abs, left: "50%", top: 11, transform: "translateX(-50%)", height: 30, padding: "0 18px", borderRadius: 999, background: "#efeff2", font: "500 15px Inter, sans-serif", color: "#6e6e73", display: "flex", alignItems: "center", gap: 7 }}>
              <svg width="12" height="13" viewBox="0 0 12 14" fill="#8e8e93"><rect x="1" y="6" width="10" height="8" rx="2" /><path d="M3.2 6V4.4a2.8 2.8 0 015.6 0V6" stroke="#8e8e93" strokeWidth="1.6" fill="none" /></svg>
              {p.url}
            </div>
          </div>
          <div style={{ ...abs, left: 0, top: 52, width: 1000, height: 1308, overflow: "hidden", background: "#f5f5f7" }}>
            <div style={{ ...abs, left: 0, top: 0, width: 1000, transformOrigin: `500px ${OY}px`, transform: `translateY(${-sc}px) scale(${z})`, filter: vel > 40 ? `blur(${Math.min(2.2, vel / 1300)}px)` : undefined }}>
              <img src={pageImg} alt="" style={{ display: "block", width: 1000 }} />
              <div style={{ ...abs, left: (480 - 130) * S, top: 262 * S, width: 560 * S, height: 106 * S, overflow: "hidden" }}>
                {blank && <img src={wBlank} alt="" style={{ ...abs, inset: 0, width: "100%", height: "100%" }} />}
                {siteWords.map(([src, st]) => <img key={src} src={src} alt="" style={{ ...abs, inset: 0, width: "100%", height: "100%", ...st }} />)}
              </div>
              <div style={{ ...abs, background: "#f5f5f7", left: (495 - 130) * S, top: 160 * S, width: 525 * S, height: 300 * S, opacity: 1 - P(t, 2.56, 2.76) }} />
              <div style={{ ...abs, left: (318 - 130) * S, top: OY + (14 + sc - OY) / z, width: 872 * S, height: 45 * S, borderRadius: 18, overflow: "hidden", boxShadow: "0 10px 30px -14px rgba(0,0,0,.25)", opacity: clamp(sc / 25) }}>
                <img src={navImg} alt="" style={{ display: "block", width: "100%", height: "100%" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {t < 2.78 && (
        <div style={{ ...abs, left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${cx}px,${cy}px) scale(${k})`, opacity: typeOp }}>
          <div style={{ ...line, top: -BO, ...rise(ease.expo(P(t, 0, 0.55)), 70, 16) }}>Make your</div>
          {words.map((w, i) => {
            const [a, b] = wordWin[i];
            const pin = a < 0 ? ease.expo(P(t, 0.06, 0.6)) : ease.expo(P(t, a + 0.04, a + 0.36));
            const pout = ease.out(P(t, b, b + 0.2));
            return (
              <div key={i} style={{ ...line, top: LH - BO, opacity: clamp(pin * 1.5) * (1 - pout), transform: `translateY(${(1 - pin) * 55 - pout * 40}px)`, filter: `blur(${(1 - pin) * 14 + pout * 12}px)` }}>
                <span style={{ ...gradText(), padding: "0 .06em .12em" }}>{w}</span>
              </div>
            );
          })}
          <div style={{ ...line, top: 2 * LH - BO, ...rise(ease.expo(P(t, 0.12, 0.67)), 70, 16) }}>move.</div>
        </div>
      )}

      {/* captions */}
      {t > 2.5 && t < 4.6 && (
        <Cap top={196} size={62} style={{ opacity: 1 - P(t, 4.35, 4.55), filter: `blur(${P(t, 4.35, 4.55) * 8}px)` }}>
          {capWords.map((w, i) => <span key={i} style={{ display: "inline-block", whiteSpace: "pre", ...rise(ease.expo(P(t, 2.62 + i * 0.09, 3.1 + i * 0.09)), 30, 10) }}>{w + (i < capWords.length - 1 ? " " : "")}</span>)}
        </Cap>
      )}
      {t > 4.5 && t < 7.65 && (
        <Cap top={196} size={62} style={{ opacity: 1 - P(t, 7.4, 7.6), filter: `blur(${P(t, 7.4, 7.6) * 8}px)` }}>
          {shelfWords.map((w, i) => <span key={i} style={{ display: "inline-block", whiteSpace: "pre", ...(i === shelfWords.length - 1 ? gradText() : {}), ...rise(ease.expo(P(t, 4.55 + i * 0.5, 4.95 + i * 0.5)), 30, 10) }}>{w + (i < shelfWords.length - 1 ? " " : "")}</span>)}
        </Cap>
      )}
      {t > 7.5 && t < 10 && (
        <>
          <Cap top={170} size={72} style={{ ...rise(ease.expo(P(t, 7.62, 8.15)), 40, 12), opacity: clamp(ease.expo(P(t, 7.62, 8.15)) * 1.6) * (1 - dOut) }}>{p.stat}</Cap>
          <Cap top={262} size={40} style={{ fontWeight: 500, color: "#86868b", letterSpacing: "-0.02em", ...rise(ease.expo(P(t, 7.85, 8.35)), 30, 10), opacity: clamp(ease.expo(P(t, 7.85, 8.35)) * 1.6) * (1 - dOut) }}>{p.sub}</Cap>
          <div style={{ ...abs, inset: 0, transform: `translateY(${drift}px)` }}>
            {ORDER.map((ti, n) => {
              const [src, x, y, w, h] = TILES[ti];
              const pp = P(t, 7.62 + n * 0.12, 7.62 + n * 0.12 + 0.9);
              const sp = spring(pp * 1.4, 0.62, 9);
              const o = P(t, 9.7 + n * 0.025, 9.98 + n * 0.025);
              return (
                <div key={ti} style={{ ...abs, left: x, top: 400 + y, width: w, height: h, borderRadius: 26, overflow: "hidden", background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,.05),0 34px 60px -34px rgba(0,0,0,.32)", opacity: clamp(pp * 4) * (1 - o), transform: `translateY(${(1 - sp) * 120 - o * 50}px) scale(${lerp(0.88, 1, sp) * (1 - o * 0.05)})`, filter: `blur(${Math.max(0, (1 - ease.expo(pp)) * 10) + o * 8}px)` }}>
                  <img src={src} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              );
            })}
          </div>
        </>
      )}

      {t >= 9.9 && (
        <div style={{ ...abs, inset: 0, transformOrigin: "540px 960px", transform: `scale(${g})` }}>
          <div style={{ ...abs, left: 440, top: 600, width: 200, height: 200, borderRadius: 46, overflow: "hidden", boxShadow: "0 30px 60px -24px rgba(0,0,0,.45)", opacity: clamp(P(t, 9.98, 10.18)), transform: `scale(${lerp(0.35, 1, ls)}) rotate(${(1 - ls) * -25}deg)` }}>
            <img src={logoImg} alt="" style={{ display: "block", width: "100%", height: "100%" }} />
          </div>
          <Cap top={850} size={132} style={{ fontWeight: 700, letterSpacing: "-0.05em", ...rise(ease.expo(P(t, 10.12, 10.7)), 50, 14) }}>{p.brand}</Cap>
          <Cap top={1010} size={66} style={rise(ease.expo(P(t, 10.3, 10.85)), 40, 12)}><span style={gradText(GRAD)}>{p.url}</span></Cap>
          <Cap top={1140} size={32} style={{ fontWeight: 500, letterSpacing: "-0.01em", ...rise(ease.expo(P(t, 10.48, 11.0)), 30, 10) }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 999, padding: "16px 30px", boxShadow: "0 0 0 1px rgba(0,0,0,.06),0 18px 36px -20px rgba(0,0,0,.3)", fontFamily: "Inter, sans-serif" }}>
              <span style={{ width: 13, height: 13, borderRadius: 7, background: "#30d158" }} />{p.pill}
            </span>
          </Cap>
        </div>
      )}
    </div>
  );
}

export function Cap({ top, size, style, children }: { top: number; size: number; style?: CSSProperties; children: ReactNode }) {
  return <div style={{ position: "absolute", left: 0, top, width: W, textAlign: "center", fontWeight: 600, letterSpacing: "-0.035em", whiteSpace: "nowrap", fontSize: size, lineHeight: 1.15, ...style }}>{children}</div>;
}
