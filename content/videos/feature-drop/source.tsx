import type { CSSProperties } from "react";
import { FONT, H, P, TEXT, W, bgBlobs, clamp, ease, lerp, rise, spring, type VideoMeta } from "./kit";
import tPay from "./assets/tile-pay.jpg";
import tIsland from "./assets/tile-island.jpg";
import tFolder from "./assets/tile-folder.jpg";
import tDock from "./assets/tile-dock.jpg";
import tRouter from "./assets/tile-router.jpg";
import tReel from "./assets/tile-reel.jpg";
import tPend from "./assets/tile-pend.jpg";
import tCopy from "./assets/tile-copy.jpg";

export interface FeatureDropProps {
  app: string;
  feature: string;
  line: string;
  brandName: string;
  c1: string;
  c2: string;
  c3: string;
  spinLine: string;
  url: string;
  pill: string;
}

export const meta: VideoMeta<FeatureDropProps> = {
  id: "feature-drop",
  title: "Feature Drop",
  platforms: ["Reels", "TikTok", "Shorts"],
  purpose: "Feature announcement",
  motion: "3D carousel re-skins in a wave",
  app: "MockFrame",
  duration: 10,
  bpm: 120,
  cuts: [2, 3.3, 4.75, 5.75, 6.75, 7.5],
  blurb: "Announce one feature and show it working. A brand kit slides up, a cursor clicks Apply, and every screenshot in a 3D carousel repaints in a wave, then spins on the beat.",
  defaults: {
    app: "MockFrame",
    feature: "Brand kits.",
    line: "Your brand on every screenshot.",
    brandName: "Tidepool",
    c1: "#ff6a3d",
    c2: "#ffeadb",
    c3: "#1b1f3b",
    spinLine: "Every screenshot. One click.",
    url: "mockframe.app",
    pill: "New · Brand kits",
  },
  fields: [
    { key: "app", label: "App name", type: "text", max: 14 },
    { key: "feature", label: "Feature name", type: "text", max: 16 },
    { key: "line", label: "One-line benefit", type: "text", max: 34 },
    { key: "brandName", label: "Sample brand", type: "text", max: 14 },
    { key: "c1", label: "Brand colour", type: "color" },
    { key: "c2", label: "Light colour", type: "color" },
    { key: "c3", label: "Ink colour", type: "color" },
    { key: "spinLine", label: "Line during the spin", type: "text", max: 32 },
    { key: "url", label: "Address", type: "text", max: 22 },
    { key: "pill", label: "End card pill", type: "text", max: 24 },
  ],
  prompt: `Make a 10-second vertical (1080×1920, 30fps) feature announcement video for my app MockFrame (a screenshot mockup studio), clean Apple style on a light #f5f5f7 background with soft drifting colour light. Inter Display for UI type, a serif (Lora / Instrument Serif) for the "brand" captions. Music at 120 BPM; the click, the repaint wave and every carousel spin land on beats.

0–1.6s: A white pill "New in MockFrame" springs in. Below it "Brand kits." in huge bold type rises out of a blur, then a grey line "Your brand on every screenshot."
1.6–2.2s: The headline group shrinks to 60% and glides to the top of the frame.
1.9–2.7s: Three app-store style screenshot cards (520×760, rounded 40px: a caption at the top, an app screenshot below with its own shadow) rise into a 3D carousel: a ring of 8 cards around the vertical axis, 45° apart, perspective 1800px, only the front three visible. They start neutral grey with black sans captions.
2.5–3.3s: A "Brand kit" panel slides up from the bottom: logo dot, brand name, three colour swatches, an "Aa Lora" font chip and a blue "Apply to all" button. A cursor glides in and clicks the button (button squashes, a ring ripples out).
3.45–4.6s: The three visible cards repaint one after another, left to right: the brand style is revealed by a circle that grows from the bottom of each card (clip-path), turning the background into the brand gradient and the caption into a cream italic serif. Odd cards use the light colour with a brand-coloured caption so the set feels designed, not repeated. The panel slides away.
4.6–7.4s: The headline swaps to "Every screenshot. One click." The ring turns 45° three times on the beat (eased in-out with a small settle), showing the rest of the screenshots already in the brand style. Cards fade with their angle so the back of the ring disappears.
7.4–8.2s: All cards fly to the centre into a tidy stack and shrink away.
8.0–10s: End card: "MockFrame" (bold, 120px), "mockframe.app" in grey, and a pill "New · Brand kits" whose dot uses the brand colour, each rising in.

Build it as a React component that is a pure function of time t with props for the app name, feature, sample brand name and the three brand colours, so changing a colour repaints the whole video.`,
};

const IMGS = [tPay, tIsland, tFolder, tDock, tRouter, tReel, tPend, tCopy];
const CAPS = ["Split bills\nin seconds", "Calls that\nfeel native", "Files,\nbeautifully kept", "Everything\nin one dock", "Route every\nrequest", "Collect what\nyou love", "Small joys,\nevery tap", "Ship with\none command"];
const R = 540;
const abs: CSSProperties = { position: "absolute" };

function Card({ i, skin, p }: { i: number; skin: number; p: FeatureDropProps }) {
  const light = i % 2 === 1;
  const caption = (brand: boolean): CSSProperties => brand
    ? { fontFamily: "'Lora','Instrument Serif',Georgia,serif", fontStyle: "italic", fontWeight: 500, fontSize: 50, letterSpacing: "-0.01em", lineHeight: 1.05, color: light ? p.c1 : p.c2 }
    : { fontFamily: FONT, fontWeight: 700, fontSize: 46, letterSpacing: "-0.035em", lineHeight: 1.05, color: "#1d1d1f" };
  const face = (brand: boolean) => (
    <div style={{ ...abs, inset: 0, background: brand ? (light ? `linear-gradient(170deg, ${p.c2}, #ffffff)` : `linear-gradient(165deg, ${p.c1}, ${p.c3})`) : "linear-gradient(170deg,#ececf0,#dedee3)" }}>
      <div style={{ ...abs, left: 0, right: 0, top: 64, textAlign: "center", whiteSpace: "pre-line", ...caption(brand) }}>{CAPS[i]}</div>
      <div style={{ ...abs, left: 60, top: 250, width: 400, height: 450, borderRadius: 30, overflow: "hidden", background: "#fff", boxShadow: brand ? "0 30px 60px -20px rgba(0,0,0,.45)" : "0 24px 50px -24px rgba(0,0,0,.3)" }}>
        <img src={IMGS[i]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%" }} />
      </div>
    </div>
  );
  return (
    <div style={{ ...abs, inset: 0, borderRadius: 40, overflow: "hidden", boxShadow: "0 0 0 1px rgba(0,0,0,.05)" }}>
      {face(false)}
      {skin > 0 && <div style={{ ...abs, inset: 0, clipPath: `circle(${skin * 135}% at 50% 108%)` }}>{face(true)}</div>}
    </div>
  );
}

export default function FeatureDrop({ t, ...props }: { t: number } & Partial<FeatureDropProps>) {
  const p = { ...meta.defaults, ...props };

  // ---- headline group
  const up = ease.inOut(P(t, 1.6, 2.2));
  const swapLine = P(t, 4.55, 4.85);
  const endOut = P(t, 7.35, 7.7);

  // ---- carousel rotation: three beat-locked 45° clicks
  const click = (a: number) => { const q = P(t, a, a + 0.5); return ease.inOut(q) + Math.sin(q * Math.PI) * 0.04; };
  const rot = 45 * (click(4.75) + click(5.75) + click(6.75));
  const collapse = ease.inOut(P(t, 7.4, 8.1));
  const vanish = P(t, 7.85, 8.25);

  // ---- brand kit panel + cursor
  const panelIn = spring(P(t, 2.5, 3.6) * 1.1, 0.7, 10);
  const panelOut = ease.in(P(t, 4.3, 4.7));
  const press = P(t, 3.28, 3.42);
  const curP = ease.inOut(P(t, 2.85, 3.25));
  const curX = lerp(980, 802, curP), curY = lerp(1960, 1640, curP);

  // repaint wave: which ring slot paints when (front three by screen position, the rest are pre-painted)
  const paintAt: Record<number, number> = { 7: 3.45, 0: 3.7, 1: 3.95 };

  const cards = Array.from({ length: 8 }, (_, i) => {
    const slot = i === 7 ? -1 : i; // card 7 sits on the left of the front card
    const theta = ((slot * 45 - rot) * Math.PI) / 180;
    const x = Math.sin(theta) * R * (1 - collapse);
    const zz = (Math.cos(theta) * R - R) * (1 - collapse) - collapse * (8 - i) * 6;
    const ry = (slot * 45 - rot) * (1 - collapse);
    const facing = Math.cos(theta);
    const arrive = i === 7 || i === 0 || i === 1 ? spring(P(t, 1.9 + (i === 7 ? 0.12 : i === 0 ? 0 : 0.24), 3.0), 0.68, 10) : P(t, 4.6, 5.0);
    const op = clamp((facing - 0.05) * 2.2) * clamp(arrive * 3) * (1 - vanish);
    const skin = i in paintAt ? ease.inOut(P(t, paintAt[i], paintAt[i] + 0.55)) : 1;
    const sc = lerp(1, 0.55, ease.in(vanish));
    return { i, x, zz, ry, op, skin, sc, arrive, facing };
  });

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#f5f5f7", fontFamily: FONT, color: "#1d1d1f" }}>
      {bgBlobs(t, "rgba(10,132,255,.13)", `${p.c1}22`).map((s, i) => <div key={i} style={s} />)}

      {/* headline group */}
      <div style={{ ...abs, inset: 0, transformOrigin: "540px 720px", transform: `translateY(${-560 * up}px) scale(${lerp(1, 0.6, up)})`, opacity: 1 - endOut }}>
        <div style={{ ...abs, left: 0, right: 0, top: 560, textAlign: "center", opacity: 1 - up }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "16px 30px", borderRadius: 999, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,.06),0 18px 36px -20px rgba(0,0,0,.3)", fontFamily: TEXT, fontSize: 34, fontWeight: 600, letterSpacing: "-0.01em", transform: `scale(${lerp(0.6, 1, spring(P(t, 0.05, 1.2), 0.5, 12))})`, opacity: clamp(P(t, 0.05, 0.2)) }}>
            <span style={{ width: 14, height: 14, borderRadius: 7, background: p.c1 }} />New in {p.app}
          </span>
        </div>
        <div style={{ ...abs, left: 0, right: 0, top: 690, textAlign: "center", fontSize: 170, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1, whiteSpace: "nowrap", ...rise(ease.expo(P(t, 0.25, 0.9)), 70, 18) }}>{p.feature}</div>
        <div style={{ ...abs, left: 0, right: 0, top: 900, textAlign: "center", fontSize: 50, fontWeight: 500, color: "#6e6e73", letterSpacing: "-0.02em", whiteSpace: "nowrap", ...rise(ease.expo(P(t, 0.5, 1.1)), 40, 12), opacity: clamp(ease.expo(P(t, 0.5, 1.1)) * 1.6) * (1 - swapLine) }}>{p.line}</div>
        <div style={{ ...abs, left: 0, right: 0, top: 900, textAlign: "center", fontSize: 50, fontWeight: 500, color: "#6e6e73", letterSpacing: "-0.02em", whiteSpace: "nowrap", ...rise(ease.expo(P(t, 4.7, 5.2)), 30, 10) }}>{p.spinLine}</div>
      </div>

      {/* 3D ring */}
      <div style={{ ...abs, left: 540, top: 1060, width: 0, height: 0, perspective: 1800, perspectiveOrigin: "0 0" }}>
        <div style={{ ...abs, left: 0, top: 0, transformStyle: "preserve-3d" }}>
          {cards.filter((c) => c.op > 0.001).sort((a, b) => a.facing - b.facing).map((c) => (
            <div key={c.i} style={{ ...abs, left: -260, top: -380, width: 520, height: 760, opacity: c.op, transform: `translate3d(${c.x}px, ${(1 - c.arrive) * 320}px, ${c.zz}px) rotateY(${c.ry}deg) rotateX(${(1 - c.arrive) * 24}deg) scale(${c.sc})`, filter: c.arrive < 1 ? `blur(${(1 - clamp(c.arrive)) * 10}px)` : undefined }}>
              <div style={{ ...abs, inset: 0, borderRadius: 40, boxShadow: "0 50px 90px -40px rgba(0,0,0,.4)" }} />
              <Card i={c.i} skin={c.skin} p={p} />
            </div>
          ))}
        </div>
      </div>

      {/* brand kit panel */}
      {t > 2.4 && t < 4.75 && (
        <div style={{ ...abs, left: 120, top: 1520, width: 840, height: 230, borderRadius: 36, background: "rgba(255,255,255,.92)", backdropFilter: "blur(20px)", boxShadow: "0 0 0 1px rgba(0,0,0,.06),0 40px 80px -30px rgba(0,0,0,.35)", transform: `translateY(${(1 - panelIn) * 360 + panelOut * 420}px)`, fontFamily: TEXT, padding: "30px 36px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ width: 44, height: 44, borderRadius: 13, background: `linear-gradient(140deg, ${p.c1}, ${p.c3})` }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#86868b", letterSpacing: "0.04em", textTransform: "uppercase" }}>Brand kit</div>
              <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>{p.brandName}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 28 }}>
            {[p.c1, p.c2, p.c3].map((c, k) => (
              <span key={k} style={{ width: 62, height: 62, borderRadius: 31, background: c, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08)", transform: `scale(${lerp(0.4, 1, spring(P(t, 2.75 + k * 0.08, 3.6), 0.5, 13))})` }} />
            ))}
            <span style={{ marginLeft: 6, height: 62, padding: "0 22px", borderRadius: 31, background: "#f5f5f7", display: "inline-flex", alignItems: "center", gap: 10, fontSize: 26 }}>
              <span style={{ fontFamily: "'Lora',Georgia,serif", fontStyle: "italic", fontSize: 32 }}>Aa</span>Lora
            </span>
          </div>
          <div style={{ ...abs, right: 36, bottom: 40, height: 70, padding: "0 34px", borderRadius: 35, background: "#0071e3", color: "#fff", fontSize: 28, fontWeight: 600, display: "flex", alignItems: "center", transform: `scale(${1 - Math.sin(press * Math.PI) * 0.07})` }}>Apply to all</div>
          {t > 3.3 && <span style={{ ...abs, right: 36 + 100 - 120 * ease.out(P(t, 3.3, 3.9)), bottom: 75 - 120 * ease.out(P(t, 3.3, 3.9)), width: 240 * ease.out(P(t, 3.3, 3.9)), height: 240 * ease.out(P(t, 3.3, 3.9)), borderRadius: "50%", border: "3px solid #0071e3", opacity: 1 - P(t, 3.3, 3.9) }} />}
        </div>
      )}

      {/* cursor */}
      {t > 2.8 && t < 3.9 && (
        <svg width="54" height="54" viewBox="0 0 24 24" style={{ ...abs, left: curX, top: curY + (press > 0 && press < 1 ? 3 : 0), opacity: 1 - P(t, 3.6, 3.85), filter: "drop-shadow(0 6px 10px rgba(0,0,0,.3))" }}>
          <path d="M4 2l15 9.5-6.6 1.4 3.6 7-2.6 1.3-3.6-7L4 18.5z" fill="#1d1d1f" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      )}

      {/* end card */}
      {t > 7.9 && (
        <div style={{ ...abs, inset: 0 }}>
          <div style={{ ...abs, left: 0, right: 0, top: 760, textAlign: "center", fontSize: 128, fontWeight: 700, letterSpacing: "-0.05em", ...rise(ease.expo(P(t, 8.05, 8.65)), 60, 16) }}>{p.app}</div>
          <div style={{ ...abs, left: 0, right: 0, top: 920, textAlign: "center", fontSize: 54, fontWeight: 500, color: "#86868b", letterSpacing: "-0.02em", ...rise(ease.expo(P(t, 8.25, 8.8)), 40, 12) }}>{p.url}</div>
          <div style={{ ...abs, left: 0, right: 0, top: 1050, textAlign: "center", ...rise(ease.expo(P(t, 8.45, 9.0)), 30, 10) }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "16px 30px", borderRadius: 999, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,.06),0 18px 36px -20px rgba(0,0,0,.3)", fontFamily: TEXT, fontSize: 32, fontWeight: 500 }}>
              <span style={{ width: 13, height: 13, borderRadius: 7, background: p.c1 }} />{p.pill}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
