"use client";
/* eslint-disable @next/next/no-img-element -- the videos are drawn on a fixed canvas and rendered frame by frame; next/image would change what is captured */

import type { CSSProperties, ReactNode } from "react";
import { FONT, GRAD, H, P, TEXT, W, clamp, ease, gradText, lerp, rise, spring, type VideoMeta } from "./kit";
const logoImg = "/videos/assets/nexus-logo.png";

export interface ManifestoProps {
  l1: string; btn: string; l1b: string;
  l2: string; num: string; l2b: string;
  l3: string; l3b: string;
  l4: string; typed: string;
  slams: string;
  url: string;
  sub: string;
}

export const meta: VideoMeta<ManifestoProps> = {
  id: "manifesto",
  title: "Kinetic Manifesto",
  purpose: "Brand hook",
  motion: "Kinetic type with live UI inside the words",
  app: "Nexus UI",
  duration: 10,
  bpm: 120,
  cuts: [1.0, 1.5, 2.5, 3.0, 4.0, 4.5, 6.5, 7.0, 7.5, 8.0],
  blurb: "The scroll-stopper. Keynote-black kinetic type where the key word in each line is a real working component: a button that gets pressed, digits that roll, a switch that flips, text that types itself.",
  defaults: {
    l1: "Buttons that", btn: "press", l1b: "back.",
    l2: "Numbers that", num: "128", l2b: "roll.",
    l3: "Switches that", l3b: "flip.",
    l4: "Text that", typed: "types itself.",
    slams: "Copy. Paste. Ship.",
    url: "nexus-ui.com",
    sub: "Motion you can copy and paste.",
  },
  fields: [
    { key: "l1", label: "Line 1", type: "text", max: 14 },
    { key: "btn", label: "Button label", type: "text", max: 7 },
    { key: "l1b", label: "Line 1 ending", type: "text", max: 8 },
    { key: "l2", label: "Line 2", type: "text", max: 14 },
    { key: "num", label: "Rolling number", type: "text", max: 4 },
    { key: "l2b", label: "Line 2 ending", type: "text", max: 8 },
    { key: "l3", label: "Line 3", type: "text", max: 14 },
    { key: "l3b", label: "Line 3 ending", type: "text", max: 8 },
    { key: "l4", label: "Line 4", type: "text", max: 14 },
    { key: "typed", label: "Typed words", type: "text", max: 14 },
    { key: "slams", label: "Three slam words", type: "text", max: 30 },
    { key: "url", label: "Address", type: "text", max: 18 },
    { key: "sub", label: "Line under it", type: "text", max: 34 },
  ],
  dark: true,
};

const abs: CSSProperties = { position: "absolute" };
const INK = "#f5f5f7";

function Line({ t, a, b, rowA, rowB, glow }: { t: number; a: number; b: number; rowA: ReactNode; rowB: ReactNode; glow: string }) {
  if (t < a - 0.05 || t > b + 0.45) return null;
  const pin = ease.expo(P(t, a, a + 0.5));
  const pout = ease.in(P(t, b, b + 0.4));
  const st: CSSProperties = { opacity: clamp(pin * 1.6) * (1 - pout), transform: `translateY(${(1 - pin) * 120 - pout * 260}px)`, filter: `blur(${(1 - pin) * 16 + pout * 18}px)` };
  return (
    <div style={{ ...abs, left: 0, right: 0, top: 720, ...st }}>
      <div style={{ ...abs, left: 290, top: 120, width: 500, height: 300, borderRadius: "50%", background: glow, filter: "blur(90px)", opacity: 0.55 }} />
      <div style={{ position: "relative", textAlign: "center", fontSize: 112, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1.1, color: INK, whiteSpace: "nowrap" }}>{rowA}</div>
      <div style={{ position: "relative", marginTop: 26, display: "flex", alignItems: "center", justifyContent: "center", gap: 30, fontSize: 112, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1.1, color: INK, whiteSpace: "nowrap" }}>{rowB}</div>
    </div>
  );
}

function Odo({ text, q, size }: { text: string; q: number; size: number }) {
  const chars = [...text];
  return (
    <span style={{ display: "inline-flex", fontVariantNumeric: "tabular-nums" }}>
      {chars.map((c, i) => {
        if (!/\d/.test(c)) return <span key={i}>{c}</span>;
        const local = clamp((q - i * 0.12) / (1 - 0.12 * (chars.length - 1)));
        const e = ease.quint(local);
        const target = +c + 10 * (1 + i);
        return (
          <span key={i} style={{ position: "relative", display: "inline-block", height: size * 1.2, overflow: "hidden", WebkitMaskImage: "linear-gradient(transparent, #000 18%, #000 82%, transparent)", maskImage: "linear-gradient(transparent, #000 18%, #000 82%, transparent)" }}>
            <span style={{ visibility: "hidden", lineHeight: 1.2 }}>0</span>
            <span style={{ ...abs, left: 0, top: 0, lineHeight: 1.2, transform: `translateY(${-target * e * size * 1.2}px)` }}>
              {Array.from({ length: target + 1 }, (_, k) => <span key={k} style={{ display: "block", height: size * 1.2 }}>{k % 10}</span>)}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default function Manifesto({ t, ...props }: { t: number } & Partial<ManifestoProps>) {
  const p = { ...meta.defaults, ...props };
  const press = P(t, 0.98, 1.12);
  const pressSpring = t > 1.1 ? spring(t - 1.1, 0.35, 18) : 0;
  const btnScale = t < 0.98 ? 1 : t < 1.1 ? 1 - Math.sin(press * Math.PI * 0.5) * 0.1 : 0.9 + 0.1 * pressSpring;
  const flip = spring(t - 3.92, 0.55, 15);
  const typedN = Math.floor(P(t, 4.75, 5.75) * p.typed.length + 0.0001);
  const slams = p.slams.split(/(?<=\.)\s+/).slice(0, 3);
  const slamAt = [6.5, 7.0, 7.5];

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#000", fontFamily: FONT, color: INK }}>
      <Line t={t} a={0.05} b={1.5} glow="#0a84ff" rowA={p.l1} rowB={<>
        <span style={{ position: "relative", display: "inline-flex", alignItems: "center", height: 150, padding: "0 56px", borderRadius: 75, background: "#0a84ff", color: "#fff", transform: `scale(${btnScale})`, boxShadow: "0 30px 60px -20px rgba(10,132,255,.6), inset 0 1px 0 rgba(255,255,255,.35)" }}>
          {p.btn}
          {t > 1.0 && <span style={{ ...abs, inset: -14 - 60 * ease.out(P(t, 1.0, 1.5)), borderRadius: 999, border: "3px solid #0a84ff", opacity: 1 - P(t, 1.0, 1.5) }} />}
        </span>
        <span>{p.l1b}</span>
      </>} />

      <Line t={t} a={1.5} b={3.0} glow="#bf5af2" rowA={p.l2} rowB={<>
        <span style={{ display: "inline-flex", alignItems: "center", height: 150, padding: "0 40px", borderRadius: 40, background: "rgba(255,255,255,.08)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.14)" }}>
          <Odo text={p.num} q={P(t, 1.75, 2.5)} size={112} />
        </span>
        <span>{p.l2b}</span>
      </>} />

      <Line t={t} a={3.0} b={4.5} glow="#30d158" rowA={p.l3} rowB={<>
        <span style={{ position: "relative", width: 236, height: 140, borderRadius: 70, background: `rgb(${lerp(58, 48, clamp(flip))},${lerp(58, 209, clamp(flip))},${lerp(60, 88, clamp(flip))})`, boxShadow: "inset 0 0 0 2px rgba(255,255,255,.1)" }}>
          <span style={{ ...abs, top: 10, left: 10 + 96 * flip, width: 120, height: 120, borderRadius: 60, background: "#fff", boxShadow: "0 6px 16px rgba(0,0,0,.4)", transform: `scaleX(${1 + Math.sin(clamp(P(t, 3.92, 4.15)) * Math.PI) * 0.18})` }} />
        </span>
        <span>{p.l3b}</span>
      </>} />

      <Line t={t} a={4.5} b={6.05} glow="#ff375f" rowA={p.l4} rowB={
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          <span style={{ ...gradText(GRAD), paddingBottom: 12 }}>{p.typed.slice(0, typedN) || "​"}</span>
          <span style={{ display: "inline-block", width: 8, height: 110, marginLeft: 6, borderRadius: 4, background: INK, opacity: Math.floor(t * 4) % 2 === 0 || (t > 4.75 && t < 5.75) ? 1 : 0 }} />
        </span>
      } />

      {slams.map((w, i) => {
        const a = slamAt[i];
        const b = i < 2 ? slamAt[i + 1] : 8.0;
        if (t < a || t >= b) return null;
        const s = ease.expo(P(t, a, a + 0.22));
        return (
          <div key={i} style={{ ...abs, left: 0, right: 0, top: 820, textAlign: "center", fontSize: 230, fontWeight: 800, letterSpacing: "-0.06em", lineHeight: 1, transform: `scale(${lerp(1.4, 1, s)})`, filter: `blur(${(1 - s) * 14}px)`, opacity: clamp(s * 2), ...(i === 2 ? gradText(GRAD) : {}) }}>{w}</div>
        );
      })}

      {t >= 8.0 && (
        <div style={{ ...abs, inset: 0 }}>
          <div style={{ ...abs, left: 470, top: 680, width: 140, height: 140, borderRadius: 36, overflow: "hidden", boxShadow: "0 0 0 1px rgba(255,255,255,.15),0 30px 60px -20px rgba(94,92,230,.6)", transform: `scale(${lerp(0.3, 1, spring(t - 8.0, 0.5, 13))}) rotate(${(1 - spring(t - 8.0, 0.5, 13)) * -30}deg)`, opacity: clamp(P(t, 8.0, 8.12)) }}>
            <img src={logoImg} alt="" style={{ display: "block", width: "100%", height: "100%" }} />
          </div>
          <div style={{ ...abs, left: 0, right: 0, top: 880, textAlign: "center", fontSize: 118, fontWeight: 700, letterSpacing: "-0.05em", ...rise(ease.expo(P(t, 8.12, 8.7)), 50, 14) }}><span style={gradText(GRAD)}>{p.url}</span></div>
          <div style={{ ...abs, left: 0, right: 0, top: 1040, textAlign: "center", fontFamily: TEXT, fontSize: 44, fontWeight: 500, color: "#86868b", letterSpacing: "-0.02em", ...rise(ease.expo(P(t, 8.35, 8.9)), 30, 10) }}>{p.sub}</div>
        </div>
      )}
    </div>
  );
}
