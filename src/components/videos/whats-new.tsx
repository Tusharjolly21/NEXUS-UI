"use client";

import type { CSSProperties, ReactNode } from "react";
import { FONT, GRAD, H, P, TEXT, W, bgBlobs, clamp, ease, gradText, lerp, rise, spring, type VideoMeta } from "./kit";

export interface WhatsNewProps {
  kicker: string;
  from: string;
  to: string;
  count: string;
  countWord: string;
  item1: string; item2: string; item3: string; item4: string;
  more: string;
  url: string;
  pill: string;
}

export const meta: VideoMeta<WhatsNewProps> = {
  id: "whats-new",
  title: "What's New",
  purpose: "Changelog & updates",
  motion: "Split-flap month, beam timeline, live mini demos",
  app: "Nexus UI",
  duration: 10,
  bpm: 120,
  cuts: [0.6, 2.0, 3.0, 4.0, 5.0, 6.0, 7.75],
  blurb: "Your monthly update without a wall of text. The month flips like a departures board, a beam draws down a timeline and each release lands on the beat with a tiny live demo of itself.",
  defaults: {
    kicker: "What's new in Nexus UI",
    from: "September",
    to: "October",
    count: "121",
    countWord: "new components",
    item1: "Slide to Confirm | Drag to confirm | Pro",
    item2: "Cursor Buddy | Follows your pointer | Pro",
    item3: "Toast Stack | Stacks, then fans out | Free",
    item4: "Dynamic Island | Morphs with what's on | Pro",
    more: "+117 more",
    url: "nexus-ui.com",
    pill: "Pro gets every release",
  },
  fields: [
    { key: "kicker", label: "Kicker", type: "text", max: 26 },
    { key: "from", label: "Last month", type: "text", max: 10 },
    { key: "to", label: "This month", type: "text", max: 10 },
    { key: "count", label: "How many", type: "text", max: 4 },
    { key: "countWord", label: "Of what", type: "text", max: 18 },
    { key: "item1", label: "Release 1 (name | line | tag)", type: "text" },
    { key: "item2", label: "Release 2", type: "text" },
    { key: "item3", label: "Release 3", type: "text" },
    { key: "item4", label: "Release 4", type: "text" },
    { key: "more", label: "More chip", type: "text", max: 12 },
    { key: "url", label: "Address", type: "text", max: 22 },
    { key: "pill", label: "End card pill", type: "text", max: 26 },
  ],
};

const abs: CSSProperties = { position: "absolute" };

/** Split-flap word: flips from `a` to `b` while q goes 0..1 */
function Flap({ a, b, q }: { a: string; b: string; q: number }) {
  const n = Math.max(a.length, b.length);
  const A = a.padEnd(n, " "), B = b.padEnd(n, " ");
  const tileW = 86, tileH = 128;
  return (
    <div style={{ display: "inline-flex", gap: 8 }}>
      {Array.from({ length: n }, (_, i) => {
        const local = clamp((q - i * 0.07) / 0.45);
        const fold = ease.inOut(local);
        const top = fold < 0.5 ? A[i] : B[i];
        const shade = Math.sin(fold * Math.PI);
        const half = (ch: string, which: "top" | "bot", extra?: CSSProperties) => (
          <div style={{ ...abs, left: 0, width: tileW, height: tileH / 2, overflow: "hidden", top: which === "top" ? 0 : tileH / 2, background: "#fff", borderRadius: which === "top" ? "18px 18px 0 0" : "0 0 18px 18px", ...extra }}>
            <div style={{ ...abs, left: 0, width: tileW, height: tileH, top: which === "top" ? 0 : -tileH / 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 92, fontWeight: 700, letterSpacing: "-0.03em", color: "#1d1d1f" }}>{ch}</div>
          </div>
        );
        return (
          <div key={i} style={{ position: "relative", width: B[i] === " " ? tileW * (1 - ease.inOut(clamp((local - 0.6) / 0.4))) : A[i] === " " ? tileW * ease.inOut(clamp(local / 0.4)) : tileW, marginRight: B[i] === " " && local >= 1 ? -8 : 0, height: tileH, perspective: 600, opacity: B[i] === " " ? 1 - clamp((local - 0.5) / 0.4) : 1, filter: "drop-shadow(0 10px 18px rgba(0,0,0,.12))" }}>
            {half(fold > 0 ? B[i] : A[i], "top")}
            {half(fold < 1 ? A[i] : B[i], "bot")}
            {/* flipping leaf */}
            {fold > 0 && fold < 1 && (fold < 0.5
              ? half(top, "top", { transformOrigin: "50% 100%", transform: `rotateX(${-fold * 180}deg)`, filter: `brightness(${1 - shade * 0.25})` })
              : half(B[i], "bot", { transformOrigin: "50% 0%", transform: `rotateX(${(1 - fold) * 180}deg)`, filter: `brightness(${1 - shade * 0.25})` }))}
            <div style={{ ...abs, left: 0, right: 0, top: tileH / 2 - 1, height: 2, background: "rgba(0,0,0,.08)" }} />
          </div>
        );
      })}
    </div>
  );
}

/* ---------- tiny live demos, u = seconds since the card arrived ---------- */
function DemoSlide({ u }: { u: number }) {
  const c = u % 2.4;
  const k = ease.inOut(P(c, 0.3, 1.2));
  const done = c > 1.25 && c < 2.2;
  return (
    <div style={{ ...abs, left: 24, top: 84, width: 250, height: 62, borderRadius: 31, background: "#f2f2f5", overflow: "hidden" }}>
      <div style={{ ...abs, left: 0, top: 0, bottom: 0, width: 62 + k * 188, borderRadius: 31, background: done ? "#30d158" : "#0071e3", opacity: 0.9 }} />
      <div style={{ ...abs, inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TEXT, fontSize: 19, fontWeight: 600, color: done ? "#fff" : "#86868b", opacity: done ? 1 : 1 - k }}>{done ? "Confirmed" : "Slide to confirm"}</div>
      <div style={{ ...abs, top: 5, left: 5 + k * 188, width: 52, height: 52, borderRadius: 26, background: "#fff", boxShadow: "0 4px 10px rgba(0,0,0,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={done ? "#30d158" : "#0071e3"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{done ? <path d="M5 12l5 5 9-10" /> : <path d="M9 6l6 6-6 6" />}</svg>
      </div>
    </div>
  );
}
function cursorPath(u: number) {
  return { x: 140 + Math.sin(u * 1.7) * 90 + Math.sin(u * 3.1) * 20, y: 110 + Math.cos(u * 1.3) * 50 };
}
function DemoBuddy({ u }: { u: number }) {
  const a = cursorPath(u), b = cursorPath(u - 0.35);
  const arrow = (fill: string) => <svg width="30" height="30" viewBox="0 0 24 24"><path d="M4 2l15 9.5-6.6 1.4 3.6 7-2.6 1.3-3.6-7L4 18.5z" fill={fill} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" /></svg>;
  return (
    <>
      <div style={{ ...abs, left: b.x, top: b.y }}>{arrow("#bf5af2")}<span style={{ ...abs, left: 22, top: 24, padding: "3px 10px", borderRadius: 10, background: "#bf5af2", color: "#fff", fontFamily: TEXT, fontSize: 15, fontWeight: 600, whiteSpace: "nowrap" }}>Buddy</span></div>
      <div style={{ ...abs, left: a.x, top: a.y }}>{arrow("#1d1d1f")}</div>
    </>
  );
}
function DemoToast({ u }: { u: number }) {
  const c = u % 3;
  const fan = ease.inOut(P(c, 1.6, 2.1)) * (1 - ease.inOut(P(c, 2.6, 2.95)));
  return (
    <>
      {[0, 1, 2].map((k) => {
        const arrive = spring(c - k * 0.35, 0.6, 12);
        const depth = 2 - k; // newest on top
        const y = lerp(-depth * 12, -depth * 52, fan);
        const s = lerp(1 - depth * 0.07, 1, fan);
        return (
          <div key={k} style={{ ...abs, left: 26, top: 112 + (1 - arrive) * -80 + y, width: 250, height: 50, borderRadius: 16, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,.07),0 8px 16px -8px rgba(0,0,0,.25)", transform: `scale(${s})`, opacity: clamp(arrive * 3), zIndex: k, display: "flex", alignItems: "center", gap: 10, padding: "0 14px", fontFamily: TEXT, fontSize: 16, fontWeight: 600 }}>
            <span style={{ width: 18, height: 18, borderRadius: 9, background: ["#30d158", "#0a84ff", "#ff9f0a"][k] }} />{["Saved", "Copied link", "Uploaded"][k]}
          </div>
        );
      })}
    </>
  );
}
function DemoIsland({ u }: { u: number }) {
  const c = u % 2.6;
  const g = spring(c - 0.2, 0.62, 11) * (1 - ease.inOut(P(c, 1.9, 2.4)));
  const w = lerp(110, 250, g), h = lerp(34, 62, g);
  return (
    <div style={{ ...abs, left: 150 - w / 2, top: 112 - h / 2, width: w, height: h, borderRadius: h / 2, background: "#000", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", overflow: "hidden" }}>
      <span style={{ width: 26, height: 26, borderRadius: 13, background: "#ff9f0a", opacity: g, transform: `scale(${g})` }} />
      <span style={{ fontFamily: TEXT, fontSize: 26, fontWeight: 600, color: "#ff9f0a", fontVariantNumeric: "tabular-nums", opacity: clamp(g * 2 - 1) }}>2:0{Math.floor(c * 3) % 10}</span>
    </div>
  );
}
const DEMOS = [DemoSlide, DemoBuddy, DemoToast, DemoIsland];

export default function WhatsNew({ t, ...props }: { t: number } & Partial<WhatsNewProps>) {
  const p = { ...meta.defaults, ...props };
  const items = [p.item1, p.item2, p.item3, p.item4].map((s) => { const [name = "", line = "", tag = ""] = s.split("|").map((x) => x.trim()); return { name, line, tag }; });
  const up = ease.inOut(P(t, 1.7, 2.25));
  const endOut = ease.in(P(t, 7.75, 8.15));
  const NODE0 = 700, GAP = 270, X = 150;
  const beamEnd = NODE0 + 3 * GAP + 190;
  const beamY = lerp(NODE0 - 120, beamEnd, ease.inOut(P(t, 2.0, 7.0)));
  const nodeAt = (k: number) => 2.4 + k * 1.0; // beat-bar per release
  const n = Math.round(+p.count || 0);
  const cnt = Math.round(n * ease.out(P(t, 1.15, 1.75)));

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#f5f5f7", fontFamily: FONT, color: "#1d1d1f" }}>
      {bgBlobs(t, "rgba(10,132,255,.14)", "rgba(191,90,242,.12)").map((s, i) => <div key={i} style={s} />)}

      <div style={{ ...abs, inset: 0, opacity: 1 - endOut, transform: `translateY(${-endOut * 120}px)`, filter: endOut ? `blur(${endOut * 10}px)` : undefined }}>
        {/* header */}
        <div style={{ ...abs, left: 0, right: 0, top: 0, height: 1000, transformOrigin: "540px 0", transform: `translateY(${lerp(0, -180, up)}px) scale(${lerp(1, 0.62, up)})` }}>
          <div style={{ ...abs, left: 0, right: 0, top: 640, textAlign: "center", fontSize: 46, fontWeight: 600, color: "#86868b", letterSpacing: "-0.02em", ...rise(ease.expo(P(t, 0.0, 0.5)), 24, 8) }}>{p.kicker}</div>
          <div style={{ ...abs, left: 0, right: 0, top: 720, textAlign: "center", ...rise(ease.expo(P(t, 0.05, 0.5)), 50, 10) }}>
            <Flap a={p.from} b={p.to} q={P(t, 0.6, 1.3)} />
          </div>
          <div style={{ ...abs, left: 0, right: 0, top: 890, textAlign: "center", fontSize: 64, fontWeight: 700, letterSpacing: "-0.035em", ...rise(ease.expo(P(t, 1.1, 1.5)), 30, 10) }}>
            <span style={{ ...gradText(GRAD), fontVariantNumeric: "tabular-nums" }}>{cnt}</span> {p.countWord}
          </div>
        </div>

        {/* beam */}
        {t > 1.95 && (
          <>
            <div style={{ ...abs, left: X - 2, top: NODE0 - 120, width: 4, height: beamEnd - NODE0 + 120, borderRadius: 2, background: "rgba(0,0,0,.06)" }} />
            <div style={{ ...abs, left: X - 2, top: NODE0 - 120, width: 4, height: Math.max(0, beamY - NODE0 + 120), borderRadius: 2, background: "linear-gradient(#0a84ff,#6a5ae0 50%,#c24fae)" }} />
            <div style={{ ...abs, left: X - 14, top: beamY - 14, width: 28, height: 28, borderRadius: 14, background: "radial-gradient(circle,#fff 0 30%,rgba(194,79,174,.55) 45%,transparent 70%)", filter: "blur(1px)", opacity: 1 - P(t, 7.0, 7.3) }} />
          </>
        )}
        {items.map((it, k) => {
          const at = nodeAt(k);
          if (t < at - 0.1) return null;
          const pop = spring(t - at, 0.45, 14);
          const slide = spring(t - at - 0.05, 0.7, 10);
          const Demo = DEMOS[k];
          const y = NODE0 + k * GAP;
          return (
            <div key={k}>
              <div style={{ ...abs, left: X - 13, top: y - 13, width: 26, height: 26, borderRadius: 13, background: "#fff", boxShadow: "0 0 0 4px #6a5ae0", transform: `scale(${pop})` }} />
              <div style={{ ...abs, left: 210, top: y - 115, width: 820, height: 230, borderRadius: 34, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,.05),0 30px 60px -34px rgba(0,0,0,.3)", transform: `translateX(${(1 - slide) * 300}px)`, opacity: clamp(slide * 3), overflow: "hidden" }}>
                <div style={{ ...abs, left: 14, top: 14, width: 300, height: 202, borderRadius: 24, background: "#f7f7f9", overflow: "hidden" }}><Demo u={Math.max(0, t - at)} /></div>
                <div style={{ ...abs, left: 350, top: 52 }}>
                  <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: "-0.035em", whiteSpace: "nowrap" }}>{it.name}</div>
                  <div style={{ marginTop: 10, fontSize: 30, fontWeight: 500, color: "#86868b", letterSpacing: "-0.015em", whiteSpace: "nowrap" }}>{it.line}</div>
                  {it.tag && <span style={{ display: "inline-block", marginTop: 16, padding: "6px 16px", borderRadius: 999, fontFamily: TEXT, fontSize: 20, fontWeight: 700, color: it.tag.toLowerCase() === "pro" ? "#fff" : "#1d1d1f", background: it.tag.toLowerCase() === "pro" ? "#1d1d1f" : "#e8e8ed" }}>{it.tag}</span>}
                </div>
              </div>
            </div>
          );
        })}
        {t > 6.9 && (
          <div style={{ ...abs, left: 92, top: beamEnd - 6, transformOrigin: "58px 30px", transform: `scale(${spring(t - 7.0, 0.45, 13)})` }}>
            <span style={{ display: "inline-flex", alignItems: "center", height: 62, padding: "0 28px", borderRadius: 31, background: "#1d1d1f", color: "#fff", fontFamily: TEXT, fontSize: 28, fontWeight: 600 }}>{p.more}</span>
          </div>
        )}
      </div>

      {t > 7.8 && <EndCard t={t} big={<><span style={gradText(GRAD)}>{p.count}</span> new this month.</>} url={p.url} pill={p.pill} />}
    </div>
  );
}

export function EndCard({ t, big, url, pill, at = 7.9, dot = "#30d158", size = 96 }: { t: number; big: ReactNode; url: string; pill: string; at?: number; dot?: string; size?: number }) {
  return (
    <div style={{ ...abs, inset: 0 }}>
      <div style={{ ...abs, left: 0, right: 0, top: 790, textAlign: "center", fontSize: size, fontWeight: 700, letterSpacing: "-0.045em", whiteSpace: "nowrap", ...rise(ease.expo(P(t, at + 0.1, at + 0.7)), 60, 16) }}>{big}</div>
      <div style={{ ...abs, left: 0, right: 0, top: 790 + size * 1.3, textAlign: "center", fontSize: 50, fontWeight: 500, color: "#86868b", letterSpacing: "-0.02em", ...rise(ease.expo(P(t, at + 0.3, at + 0.85)), 40, 12) }}>{url}</div>
      <div style={{ ...abs, left: 0, right: 0, top: 790 + size * 1.3 + 120, textAlign: "center", ...rise(ease.expo(P(t, at + 0.5, at + 1.05)), 30, 10) }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "16px 30px", borderRadius: 999, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,.06),0 18px 36px -20px rgba(0,0,0,.3)", fontFamily: TEXT, fontSize: 32, fontWeight: 500, color: "#1d1d1f" }}>
          <span style={{ width: 13, height: 13, borderRadius: 7, background: dot }} />{pill}
        </span>
      </div>
    </div>
  );
}
