"use client";

import type { CSSProperties } from "react";
import { FONT, GRAD, P, TEXT, blobsFor, clamp, ease, gradText, lerp, rise, spring, type Frame, type VideoMeta } from "./kit";
import { Odometer, num } from "./parts";

export interface BeforeAfterProps {
  title: string;
  sub: string;
  metric: string;
  amount: string;
  delta: string;
  toggle: string;
  button: string;
  after: string;
  brand: string;
  url: string;
}

export const meta: VideoMeta<BeforeAfterProps> = {
  id: "before-after",
  title: "Before / After",
  platforms: ["LinkedIn", "X", "Instagram feed"],
  formats: ["4:5", "1:1", "16:9"],
  purpose: "Comparison ad",
  motion: "A wipe that brings the UI to life as it passes",
  app: "Nexus UI",
  duration: 10,
  bpm: 120,
  cuts: [1.5, 2.0, 3.5, 5.0, 6.0, 8.0],
  blurb: "The same dashboard card twice: a flat static version and the Nexus version. A divider wipes across it and everything it passes wakes up, numbers roll, bars grow, the switch springs on, then it settles on the side that moves.",
  defaults: {
    title: "Same UI.",
    sub: "Different feeling.",
    metric: "Revenue this month",
    amount: "48210",
    delta: "+12.4%",
    toggle: "Yearly billing",
    button: "Upgrade plan",
    after: "Now it moves.",
    brand: "Nexus UI",
    url: "nexus-ui.com",
  },
  fields: [
    { key: "title", label: "Opening line", type: "text", max: 18 },
    { key: "sub", label: "Second line", type: "text", max: 22 },
    { key: "metric", label: "Card label", type: "text", max: 22 },
    { key: "amount", label: "Amount (digits)", type: "text", max: 7 },
    { key: "delta", label: "Change", type: "text", max: 8 },
    { key: "toggle", label: "Switch label", type: "text", max: 18 },
    { key: "button", label: "Button", type: "text", max: 16 },
    { key: "after", label: "Closing line", type: "text", max: 20 },
    { key: "brand", label: "Name", type: "text", max: 14 },
    { key: "url", label: "Address", type: "text", max: 22 },
  ],
};

const abs: CSSProperties = { position: "absolute" };
const BARS = [0.42, 0.55, 0.48, 0.66, 0.6, 0.78, 0.7, 0.92];

/** Divider position, as a fraction of the card width (1 = all Before, 0 = all After). */
function divider(t: number) {
  if (t < 2.1) return 1;
  if (t < 3.6) return lerp(1, 0.5, ease.inOut(P(t, 2.1, 3.6)));
  if (t < 5.0) return 0.5 - Math.sin(P(t, 3.9, 4.8) * Math.PI) * 0.07 * (1 - P(t, 4.6, 5.0));
  return lerp(0.5, 0, ease.inOut(P(t, 5.0, 6.2)));
}

export default function BeforeAfter({ t, w = 1080, h = 1350, ...props }: { t: number } & Frame & Partial<BeforeAfterProps>) {
  const p = { ...meta.defaults, ...props };
  const land = w > h * 1.2;
  const u = Math.min(w, h) / 1080;
  const cw = land ? 1060 * u : Math.min(w * 0.84, 920 * u);
  const ch = land ? 700 * u : cw * (h / w > 1.15 ? 0.95 : 0.78);
  const k = cw / 900;
  const cx = (w - cw) / 2;
  const cy = land ? h * 0.62 - ch / 2 + 20 * u : h * 0.58 - ch / 2;
  const hx = divider(t);
  const cardIn = spring(t - 1.45, 0.75, 9);
  const out = ease.in(P(t, 7.9, 8.4));
  const amount = +p.amount.replace(/\D/g, "") || 0;

  // how alive an After element at card-x fraction `fx` is: grows as the divider passes it
  const alive = (fx: number) => clamp((fx - hx) / 0.22);
  const live = Math.max(0, t - 6.2);
  const tickUp = amount + Math.floor(live * 3.2) * 37;

  const title = ease.inOut(P(t, 1.25, 1.85));
  const titleY = lerp(h * 0.42, (land ? 0.08 : 0.07) * h, title);
  const titleS = lerp(1, 0.62, title);
  const swapLine = P(t, 6.1, 6.4);

  const card = (after: boolean) => {
    const A = (fx: number) => (after ? alive(fx) : 0);
    const radius = after ? 34 * k : 6 * k;
    const sw = A(0.86);
    const swS = spring(sw * 1.3, 0.5, 11);
    const btn = A(0.5);
    return (
      <div style={{ ...abs, inset: 0, borderRadius: radius, background: "#fff", border: after ? "none" : `${1.5 * k}px solid #cfcfcf`, boxShadow: after ? "0 0 0 1px rgba(0,0,0,.05),0 40px 80px -40px rgba(0,0,0,.45)" : "none", overflow: "hidden", fontFamily: after ? FONT : "Arial, Helvetica, sans-serif" }}>
        <div style={{ ...abs, left: 44 * k, top: 40 * k, fontSize: 26 * k, fontWeight: after ? 600 : 400, color: after ? "#86868b" : "#555" }}>{p.metric}</div>
        <div style={{ ...abs, left: 40 * k, top: 82 * k, display: "flex", alignItems: "center", gap: 20 * k }}>
          {after ? (
            <span style={{ fontSize: 86 * k, fontWeight: 700, letterSpacing: "-0.04em", color: "#1d1d1f" }}>
              ${live > 0 ? num(tickUp) : <Odometer text={num(amount)} q={A(0.15)} size={86 * k} />}
            </span>
          ) : (
            <span style={{ fontSize: 78 * k, fontWeight: 400, color: "#333" }}>${num(amount)}</span>
          )}
          <span style={{ padding: `${8 * k}px ${16 * k}px`, borderRadius: after ? 999 : 3 * k, fontSize: 24 * k, fontWeight: after ? 700 : 400, background: after ? `rgba(48,209,88,${0.15 * A(0.38)})` : "#eee", color: after ? "#248a3d" : "#666", transform: after ? `scale(${lerp(0.6, 1, spring(A(0.38) * 1.2, 0.5, 12))})` : undefined }}>{p.delta}</span>
        </div>
        {/* switch */}
        <div style={{ ...abs, right: 44 * k, top: 52 * k, display: "flex", alignItems: "center", gap: 16 * k, fontSize: 24 * k, color: after ? "#1d1d1f" : "#555", fontWeight: after ? 600 : 400 }}>
          {p.toggle}
          {after ? (
            <span style={{ position: "relative", width: 76 * k, height: 44 * k, borderRadius: 22 * k, background: `rgb(${lerp(229, 48, clamp(swS))},${lerp(229, 209, clamp(swS))},${lerp(234, 88, clamp(swS))})` }}>
              <span style={{ ...abs, top: 4 * k, left: 4 * k + 32 * k * swS, width: 36 * k, height: 36 * k, borderRadius: 18 * k, background: "#fff", boxShadow: "0 3px 8px rgba(0,0,0,.25)" }} />
            </span>
          ) : (
            <span style={{ position: "relative", width: 70 * k, height: 36 * k, borderRadius: 4 * k, background: "#ddd", border: `${1.5 * k}px solid #bbb` }}>
              <span style={{ ...abs, top: 3 * k, left: 3 * k, width: 28 * k, height: 28 * k, borderRadius: 2 * k, background: "#fff", border: `${1 * k}px solid #bbb` }} />
            </span>
          )}
        </div>
        {/* chart */}
        <div style={{ ...abs, left: 44 * k, right: 44 * k, top: 210 * k, bottom: 150 * k, display: "flex", alignItems: "flex-end", gap: 18 * k }}>
          {BARS.map((b, i) => {
            const fx = (44 * k + (i + 0.5) * ((cw - 88 * k) / BARS.length)) / cw;
            const a = A(fx);
            const g = spring(a * 1.4, 0.55, 10);
            const breathe = live > 0 ? Math.sin(live * 2.2 + i * 0.9) * 0.05 : 0;
            const hh = after ? clamp(b * g + breathe, 0, 1) : b * 0.8;
            return (
              <div key={i} style={{ position: "relative", flex: 1, height: `${hh * 100}%`, borderRadius: after ? 14 * k : 0, background: after ? (i === 7 ? "linear-gradient(#5e5ce6,#0a84ff)" : "linear-gradient(#cfe3ff,#9cc6ff)") : "#c8c8c8" }}>
                {after && i === 7 && a > 0.95 && (
                  <span style={{ ...abs, right: 0, bottom: "100%", marginBottom: 14 * k, transform: `scale(${spring(t - 5.6, 0.5, 13)})`, transformOrigin: "90% 100%", padding: `${8 * k}px ${14 * k}px`, borderRadius: 12 * k, background: "#1d1d1f", color: "#fff", fontFamily: TEXT, fontSize: 20 * k, fontWeight: 600, whiteSpace: "nowrap" }}>{p.delta} this week</span>
                )}
              </div>
            );
          })}
        </div>
        {/* button */}
        <div style={{ ...abs, left: 44 * k, right: 44 * k, bottom: 40 * k, height: 82 * k, borderRadius: after ? 41 * k : 4 * k, padding: after ? 2 * k : 0, background: after ? `conic-gradient(from ${t * 140}deg, #0a84ff, #bf5af2, #ff375f, #0a84ff)` : "#9a9a9a", opacity: after ? lerp(0.4, 1, btn) : 1 }}>
          <div style={{ width: "100%", height: "100%", borderRadius: after ? 39 * k : 4 * k, background: after ? "#0071e3" : "#9a9a9a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 28 * k, fontWeight: after ? 600 : 400 }}>{p.button}</div>
        </div>
      </div>
    );
  };

  const hxPx = cx + hx * cw;

  return (
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden", background: "#f5f5f7", fontFamily: FONT, color: "#1d1d1f" }}>
      {blobsFor(t, w, h).map((s, i) => <div key={i} style={s} />)}

      {/* title -> caption */}
      <div style={{ ...abs, left: 0, right: 0, top: titleY, textAlign: "center", transformOrigin: "50% 0", transform: `scale(${titleS})`, opacity: 1 - out }}>
        <div style={{ fontSize: 132 * u, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1.05, ...rise(ease.expo(P(t, 0.05, 0.6)), 60, 14), opacity: clamp(ease.expo(P(t, 0.05, 0.6)) * 1.6) * (1 - swapLine) }}>{p.title}</div>
        <div style={{ fontSize: 76 * u, fontWeight: 600, letterSpacing: "-0.04em", color: "#86868b", marginTop: 6 * u, ...rise(ease.expo(P(t, 0.55, 1.1)), 40, 12), opacity: clamp(ease.expo(P(t, 0.55, 1.1)) * 1.6) * (1 - swapLine) }}>{p.sub}</div>
        <div style={{ ...abs, left: 0, right: 0, top: 30 * u, fontSize: 150 * u, fontWeight: 700, letterSpacing: "-0.05em", ...rise(ease.expo(P(t, 6.2, 6.75)), 40, 12) }}><span style={gradText(GRAD)}>{p.after}</span></div>
      </div>

      {t > 1.4 && (
        <div style={{ ...abs, inset: 0, opacity: 1 - out, transformOrigin: `${w / 2}px ${cy + ch / 2}px`, transform: `scale(${1 - out * 0.1})`, filter: out ? `blur(${out * 14}px)` : undefined }}>
          <div style={{ ...abs, left: cx, top: cy, width: cw, height: ch, transform: `translateY(${(1 - cardIn) * 260 * u}px)`, opacity: clamp(cardIn * 3) }}>
            {card(false)}
            <div style={{ ...abs, inset: -60 * u, clipPath: `inset(0 0 0 ${60 * u + hx * cw}px)` }}>
              <div style={{ ...abs, left: 60 * u, top: 60 * u, width: cw, height: ch }}>{card(true)}</div>
            </div>
            {/* labels */}
            {(["Before", "After"] as const).map((s, i) => (
              <span key={s} style={{ ...abs, top: -64 * u, [i ? "right" : "left"]: 0, padding: `${10 * u}px ${20 * u}px`, borderRadius: 999, fontFamily: TEXT, fontSize: 24 * u, fontWeight: 700, background: i ? "#1d1d1f" : "#e5e5ea", color: i ? "#fff" : "#6e6e73", opacity: clamp(P(t, 1.8, 2.1)) * (i ? clamp(hx * 8) * 0 + 1 : clamp(hx * 6)) } as CSSProperties}>{s}</span>
            ))}
          </div>
          {/* divider */}
          {t > 1.7 && hx > 0.002 && (
            <div style={{ ...abs, left: hxPx - 2 * u, top: cy - 30 * u + (1 - cardIn) * 260 * u, width: 4 * u, height: ch + 60 * u, borderRadius: 2 * u, background: "#1d1d1f", opacity: clamp(P(t, 1.7, 2.0)) * clamp(hx * 20) }}>
              <div style={{ ...abs, left: -34 * u, top: ch / 2 + 30 * u - 34 * u, width: 72 * u, height: 72 * u, borderRadius: 36 * u, background: "#fff", boxShadow: "0 0 0 2px #1d1d1f,0 14px 30px -10px rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={34 * u} height={34 * u} viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" /></svg>
              </div>
            </div>
          )}
        </div>
      )}

      {t > 8.2 && (
        <div style={{ ...abs, inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 * u }}>
          <div style={{ fontSize: 140 * u, fontWeight: 700, letterSpacing: "-0.05em", ...rise(ease.expo(P(t, 8.3, 8.9)), 50, 14) }}>{p.brand}</div>
          <div style={{ fontSize: 58 * u, fontWeight: 600, letterSpacing: "-0.03em", ...rise(ease.expo(P(t, 8.5, 9.05)), 30, 10) }}><span style={gradText(GRAD)}>{p.url}</span></div>
        </div>
      )}
    </div>
  );
}
