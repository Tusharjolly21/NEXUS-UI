import type { CSSProperties } from "react";
import { FONT, H, P, TEXT, W, clamp, ease, lerp, rise, spring, type VideoMeta } from "./kit";

export interface TeaserProps {
  n1: string; n2: string; n3: string; n4: string; n5: string;
  sticky: string;
  app: string;
  line: string;
  soon: string;
  cta: string;
  c1: string;
  c2: string;
}

export const meta: VideoMeta<TeaserProps> = {
  id: "teaser",
  title: "Coming Soon Teaser",
  platforms: ["Reels", "TikTok", "Shorts"],
  purpose: "Waitlist & teasers",
  motion: "Live multiplayer canvas folds into a logo",
  app: "DrawDocs",
  duration: 10,
  bpm: 120,
  cuts: [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.5, 5.0, 7.5],
  blurb: "Tease a product by showing how it feels. Three named cursors build a diagram on a dot grid, on the beat, then every node folds into your logo and the name snaps into place letter by letter.",
  defaults: {
    n1: "Idea", n2: "Sketch", n3: "Diagram", n4: "Doc", n5: "Share",
    sticky: "ship it?",
    app: "DrawDocs",
    line: "Diagrams and docs, together.",
    soon: "Coming soon",
    cta: "Join the waitlist · Link in bio",
    c1: "#ff375f",
    c2: "#ff9f0a",
  },
  fields: [
    { key: "n1", label: "Node 1", type: "text", max: 10 },
    { key: "n2", label: "Node 2", type: "text", max: 10 },
    { key: "n3", label: "Node 3", type: "text", max: 10 },
    { key: "n4", label: "Node 4", type: "text", max: 10 },
    { key: "n5", label: "Node 5", type: "text", max: 10 },
    { key: "sticky", label: "Sticky note", type: "text", max: 12 },
    { key: "app", label: "Product name", type: "text", max: 10 },
    { key: "line", label: "Line under the name", type: "text", max: 32 },
    { key: "soon", label: "Status chip", type: "text", max: 16 },
    { key: "cta", label: "Call to action", type: "text", max: 34 },
    { key: "c1", label: "Brand colour", type: "color" },
    { key: "c2", label: "Second colour", type: "color" },
  ],
  prompt: `Make a 10-second vertical (1080×1920, 30fps) "coming soon" teaser for my collaborative diagramming app DrawDocs, Apple-clean, white canvas with a soft grey dot grid. Inter Display. Music 120 BPM with a light pluck on every node landing.

0–3.6s: A live multiplayer canvas. Three Figma-style cursors with coloured name tags (Maya pink, Leo blue, Sam green) glide in. Every half second something lands on the beat: Maya drags a connector out of the "Idea" node and where she lets go a "Sketch" node springs in; Leo drags from Sketch to make "Diagram"; Sam drops a slightly rotated yellow sticky note and types "ship it?" with a caret; then "Doc" and "Share" appear the same way, and a dashed curved connector links Sketch to Share. Connectors draw like a pen stroke (stroke-dashoffset) with an arrowhead that appears when they finish. Cursors follow the connector heads exactly and drift a little when idle.
3.6–4.4s: The camera eases out a touch and a gradient light runs around every node border.
4.4–5.2s: The cursors fly off-screen, connectors retract, and every node flies to the centre, shrinking and blurring, folding into one point.
5.0–7.4s: Out of that point the app mark springs in (a rounded square with a pink→orange gradient and a white two-node glyph), then the name "DrawDocs" drops in letter by letter with springs like objects snapping to a grid, then a grey line "Diagrams and docs, together."
7.5–10s: A pill "Coming soon" with a softly pulsing dot, and below it a dark pill "Join the waitlist · Link in bio".

React component, pure function of time t; node labels, sticky text, name, lines and the two brand colours are props.`,
};

const abs: CSSProperties = { position: "absolute" };
type Node = { x: number; y: number; w: number; h: number; at: number };
const NODES: Node[] = [
  { x: 300, y: 560, w: 250, h: 112, at: 0.45 },
  { x: 720, y: 800, w: 270, h: 112, at: 1.0 },
  { x: 330, y: 1060, w: 300, h: 112, at: 1.5 },
  { x: 420, y: 1420, w: 230, h: 112, at: 2.5 },
  { x: 780, y: 1600, w: 250, h: 112, at: 3.0 },
];
const STICKY = { x: 800, y: 1220, w: 240, h: 210, at: 2.0 };
const EDGES: { a: number; b: number; t0: number; t1: number; dashed?: boolean }[] = [
  { a: 0, b: 1, t0: 0.6, t1: 1.0 },
  { a: 1, b: 2, t0: 1.1, t1: 1.5 },
  { a: 2, b: 3, t0: 2.1, t1: 2.5 },
  { a: 3, b: 4, t0: 2.6, t1: 3.0 },
  { a: 1, b: 4, t0: 3.15, t1: 3.6, dashed: true },
];
function edgeCtrl(a: Node, b: Node, dashed?: boolean) {
  const mx = dashed ? Math.max(a.x, b.x) + 260 : (a.x + b.x) / 2;
  return { x0: a.x, y0: a.y + a.h / 2 - 8, c1x: dashed ? mx : a.x, c1y: dashed ? a.y + 200 : (a.y + b.y) / 2, c2x: dashed ? mx : b.x, c2y: dashed ? b.y - 200 : (a.y + b.y) / 2, x1: b.x, y1: b.y - b.h / 2 - 8, mid: mx };
}
const cub = (a: number, b: number, c: number, d: number, u: number) => { const m = 1 - u; return m * m * m * a + 3 * m * m * u * b + 3 * m * u * u * c + u * u * u * d; };
function edgePoint(e: (typeof EDGES)[number], u: number) {
  const c = edgeCtrl(NODES[e.a], NODES[e.b], e.dashed);
  return { x: cub(c.x0, c.c1x, c.c2x, c.x1, u), y: cub(c.y0, c.c1y, c.c2y, c.y1, u) };
}

type KF = [number, number, number] | [number, "edge", number];
const CURSORS: { name: string; color: string; keys: KF[] }[] = [
  { name: "Maya", color: "#ff375f", keys: [[0.1, 120, 380], [0.55, 300, 600], [0.6, "edge", 0], [1.0, "edge", 0], [1.75, 560, 980], [2.08, 330, 1100], [2.1, "edge", 2], [2.5, "edge", 2], [3.4, 170, 1580]] },
  { name: "Leo", color: "#0a84ff", keys: [[0.2, 1020, 560], [1.05, 720, 840], [1.1, "edge", 1], [1.5, "edge", 1], [2.25, 640, 1320], [2.58, 420, 1460], [2.6, "edge", 3], [3.0, "edge", 3], [3.6, 960, 1760]] },
  { name: "Sam", color: "#30d158", keys: [[1.2, 1120, 1360], [1.95, 860, 1250], [2.7, 880, 1270], [3.1, 720, 840], [3.15, "edge", 4], [3.6, "edge", 4], [4.0, 980, 1460]] },
];
function cursorAt(keys: KF[], t: number) {
  const pos = (k: KF, tt: number) => {
    if (k[1] === "edge") { const e = EDGES[k[2]]; return edgePoint(e, ease.inOut(P(tt, e.t0, e.t1))); }
    return { x: k[1] as number, y: k[2] };
  };
  if (t <= keys[0][0]) return pos(keys[0], t);
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t <= b[0]) {
      if (a[1] === "edge" && b[1] === "edge") return pos(a, t);
      const pa = pos(a, a[0]), pb = pos(b, b[0]);
      const q = ease.inOut(P(t, a[0], b[0]));
      return { x: lerp(pa.x, pb.x, q), y: lerp(pa.y, pb.y, q) };
    }
  }
  const last = keys[keys.length - 1];
  const pl = pos(last, last[0]);
  return { x: pl.x + Math.sin(t * 1.3) * 12, y: pl.y + Math.cos(t * 1.1) * 10 };
}

export default function Teaser({ t, ...props }: { t: number } & Partial<TeaserProps>) {
  const p = { ...meta.defaults, ...props };
  const labels = [p.n1, p.n2, p.n3, p.n4, p.n5];
  const zoom = lerp(1, 0.93, ease.inOut(P(t, 3.6, 4.4)));
  const fold = ease.inOut(P(t, 4.4, 5.05));
  const glow = P(t, 3.6, 4.4);
  const markIn = spring(t - 4.95, 0.5, 12);
  const letters = [...p.app];

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#fbfbfd", fontFamily: FONT, color: "#1d1d1f" }}>
      <div style={{ ...abs, inset: -40, backgroundImage: "radial-gradient(circle, #c9c9d1 2.2px, transparent 2.6px)", backgroundSize: "40px 40px", opacity: clamp(P(t, 0, 0.5)) * lerp(1, 0.35, fold), transform: `scale(${zoom})` }} />
      <div style={{ ...abs, inset: 0, background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(251,251,253,.9) 100%)" }} />

      {/* canvas */}
      <div style={{ ...abs, inset: 0, transformOrigin: "540px 1000px", transform: `scale(${zoom})` }}>
        <svg width={W} height={H} style={{ ...abs, left: 0, top: 0, overflow: "visible" }}>
          <defs>
            <marker id="tz-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#1d1d1f" /></marker>
          </defs>
          {EDGES.map((e, i) => {
            const c = edgeCtrl(NODES[e.a], NODES[e.b], e.dashed);
            const q = ease.inOut(P(t, e.t0, e.t1)) * (1 - fold);
            if (q <= 0.001) return null;
            const d = `M${c.x0},${c.y0} C${c.c1x},${c.c1y} ${c.c2x},${c.c2y} ${c.x1},${c.y1}`;
            return (
              <path key={i} d={d} pathLength={1} fill="none" stroke="#1d1d1f" strokeWidth={3.5} strokeLinecap="round"
                strokeDasharray={e.dashed ? undefined : "1 1"} strokeDashoffset={e.dashed ? undefined : 1 - q}
                style={e.dashed ? { strokeDasharray: "0.02 0.018", clipPath: `inset(0 0 ${(1 - q) * 100}% 0)` } : undefined}
                markerEnd={q > 0.97 ? "url(#tz-arrow)" : undefined} opacity={0.8 * (1 - P(t, 4.4, 4.6))} />
            );
          })}
        </svg>

        {NODES.map((n, k) => {
          const pop = spring(t - n.at, 0.5, 13);
          if (t < n.at) return null;
          const fx = lerp(n.x, 540, fold), fy = lerp(n.y, 960, fold);
          const typing = k === 0 ? labels[k] : labels[k];
          return (
            <div key={k} style={{ ...abs, left: fx - n.w / 2, top: fy - n.h / 2, width: n.w, height: n.h, transform: `scale(${pop * lerp(1, 0.2, fold)})`, opacity: 1 - P(t, 4.8, 5.05), filter: fold ? `blur(${fold * 8}px)` : undefined }}>
              {glow > 0 && <div style={{ ...abs, inset: -3, borderRadius: 31, background: `conic-gradient(from ${glow * 360 + k * 50}deg, ${p.c1}, ${p.c2}, transparent 40%, transparent 70%, ${p.c1})`, opacity: Math.sin(glow * Math.PI) }} />}
              <div style={{ ...abs, inset: 0, borderRadius: 28, background: "#fff", boxShadow: "0 0 0 2px #1d1d1f,0 14px 30px -14px rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em" }}>{typing}</div>
            </div>
          );
        })}
        {t > STICKY.at && (() => {
          const pop = spring(t - STICKY.at, 0.5, 12);
          const txt = p.sticky.slice(0, Math.floor(P(t, 2.1, 2.6) * p.sticky.length + 0.001));
          const fx = lerp(STICKY.x, 540, fold), fy = lerp(STICKY.y, 960, fold);
          return (
            <div style={{ ...abs, left: fx - STICKY.w / 2, top: fy - STICKY.h / 2, width: STICKY.w, height: STICKY.h, borderRadius: 10, background: "#ffe066", boxShadow: "0 18px 30px -16px rgba(120,90,0,.5)", transform: `rotate(-4deg) scale(${pop * lerp(1, 0.2, fold)})`, opacity: 1 - P(t, 4.8, 5.05), padding: 24, fontFamily: "'Lora',Georgia,serif", fontStyle: "italic", fontSize: 40, filter: fold ? `blur(${fold * 8}px)` : undefined }}>
              {txt}{t > 2.05 && t < 2.9 && Math.floor(t * 4) % 2 === 0 && <span style={{ display: "inline-block", width: 3, height: 38, background: "#1d1d1f", verticalAlign: -6, marginLeft: 2 }} />}
            </div>
          );
        })()}

        {/* cursors */}
        {CURSORS.map((c, i) => {
          if (t < c.keys[0][0] - 0.2) return null;
          const pos = cursorAt(c.keys, t);
          const fly = ease.in(P(t, 4.3, 4.85));
          const dirx = pos.x < 540 ? -1 : 1;
          return (
            <div key={i} style={{ ...abs, left: pos.x + dirx * fly * 700, top: pos.y + fly * 200 * (i - 1), opacity: clamp(P(t, c.keys[0][0] - 0.2, c.keys[0][0] + 0.1)) * (1 - fly) }}>
              <svg width="40" height="40" viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,.25))" }}><path d="M4 2l15 9.5-6.6 1.4 3.6 7-2.6 1.3-3.6-7L4 18.5z" fill={c.color} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" /></svg>
              <span style={{ ...abs, left: 30, top: 32, padding: "6px 14px", borderRadius: 12, background: c.color, color: "#fff", fontFamily: TEXT, fontSize: 22, fontWeight: 600, whiteSpace: "nowrap" }}>{c.name}</span>
            </div>
          );
        })}
      </div>

      {/* reveal */}
      {t > 4.9 && (
        <>
          <div style={{ ...abs, left: 460, top: 640, width: 160, height: 160, borderRadius: 46, background: `linear-gradient(140deg, ${p.c1}, ${p.c2})`, boxShadow: `0 30px 60px -20px ${p.c1}88`, transform: `scale(${markIn}) rotate(${(1 - markIn) * -40}deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="96" height="96" viewBox="0 0 48 48" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round"><rect x="6" y="8" width="16" height="12" rx="4" /><rect x="26" y="28" width="16" height="12" rx="4" /><path d="M14 20c0 10 6 14 12 14" /></svg>
          </div>
          <div style={{ ...abs, left: 0, right: 0, top: 860, textAlign: "center", fontSize: 150, fontWeight: 700, letterSpacing: "-0.05em", whiteSpace: "nowrap" }}>
            {letters.map((ch, i) => {
              const s = spring(t - 5.25 - i * 0.055, 0.5, 14);
              return <span key={i} style={{ display: "inline-block", transform: `translateY(${(1 - s) * -160}px) rotate(${(1 - s) * (i % 2 ? 12 : -12)}deg)`, opacity: clamp((t - 5.25 - i * 0.055) * 8) }}>{ch}</span>;
            })}
          </div>
          <div style={{ ...abs, left: 0, right: 0, top: 1050, textAlign: "center", fontSize: 50, fontWeight: 500, color: "#86868b", letterSpacing: "-0.02em", ...rise(ease.expo(P(t, 6.2, 6.8)), 30, 10) }}>{p.line}</div>
          <div style={{ ...abs, left: 0, right: 0, top: 1190, textAlign: "center", ...rise(ease.expo(P(t, 7.5, 8.0)), 30, 10) }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "16px 30px", borderRadius: 999, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,.06),0 18px 36px -20px rgba(0,0,0,.3)", fontFamily: TEXT, fontSize: 34, fontWeight: 600 }}>
              <span style={{ position: "relative", width: 14, height: 14 }}>
                <span style={{ ...abs, inset: 0, borderRadius: 7, background: p.c1 }} />
                <span style={{ ...abs, inset: 0, borderRadius: 7, background: p.c1, transform: `scale(${1 + ((t * 1.2) % 1) * 1.8})`, opacity: 0.5 * (1 - ((t * 1.2) % 1)) }} />
              </span>{p.soon}
            </span>
          </div>
          <div style={{ ...abs, left: 0, right: 0, top: 1300, textAlign: "center", ...rise(ease.expo(P(t, 7.75, 8.3)), 30, 10) }}>
            <span style={{ display: "inline-flex", padding: "16px 30px", borderRadius: 999, background: "#1d1d1f", color: "#fff", fontFamily: TEXT, fontSize: 30, fontWeight: 600 }}>{p.cta}</span>
          </div>
        </>
      )}
    </div>
  );
}
