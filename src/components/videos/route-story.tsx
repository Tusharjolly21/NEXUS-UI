"use client";

import type { CSSProperties } from "react";
import { FONT, H, P, TEXT, W, clamp, ease, lerp, rand, rise, spring, type VideoMeta } from "./kit";

export interface RouteStoryProps {
  title: string;
  stop1: string; stop2: string; stop3: string; stop4: string;
  note2: string; note3: string; note4: string;
  km: string;
  app: string;
  line: string;
  url: string;
  accent: string;
}

export const meta: VideoMeta<RouteStoryProps> = {
  id: "route-story",
  title: "Route Story",
  purpose: "Travel & creators",
  motion: "Route draws with a follow camera",
  app: "Routecast",
  duration: 10,
  bpm: 100,
  cuts: [1.2, 3.0, 5.4, 7.2, 8.4],
  blurb: "A trip told as one line. The camera rides along as the route draws itself across a soft map, stops pop up with the day, a distance counter rolls, then it pulls back to show the whole journey.",
  defaults: {
    title: "Tokyo to Osaka.",
    stop1: "Tokyo", stop2: "Hakone", stop3: "Kyoto", stop4: "Osaka",
    note2: "Day 2 · Lake Ashi", note3: "Day 3 · Gion at night", note4: "Day 4 · Dotonbori",
    km: "515",
    app: "Routecast",
    line: "Your trip, as a video.",
    url: "Link in bio",
    accent: "#0a84ff",
  },
  fields: [
    { key: "title", label: "Opening title", type: "text", max: 18 },
    { key: "stop1", label: "Start", type: "text", max: 12 },
    { key: "stop2", label: "Stop 2", type: "text", max: 12 },
    { key: "stop3", label: "Stop 3", type: "text", max: 12 },
    { key: "stop4", label: "End", type: "text", max: 12 },
    { key: "note2", label: "Stop 2 note", type: "text", max: 22 },
    { key: "note3", label: "Stop 3 note", type: "text", max: 22 },
    { key: "note4", label: "End note", type: "text", max: 22 },
    { key: "km", label: "Total distance (km)", type: "text", max: 5 },
    { key: "accent", label: "Route colour", type: "color" },
    { key: "app", label: "App name", type: "text", max: 12 },
    { key: "line", label: "End card line", type: "text", max: 26 },
    { key: "url", label: "Address or CTA", type: "text", max: 22 },
  ],
};

/* ---------- route geometry (map space) ---------- */
type Pt = [number, number];
const STOPS: Pt[] = [[2320, 880], [2020, 1250], [1230, 1480], [960, 1760]];
const CTRL: [Pt, Pt][] = [
  [[2250, 1000], [2150, 1180]],
  [[1800, 1340], [1460, 1330]],
  [[1120, 1580], [1060, 1700]],
];
function bez(a: Pt, b: Pt, c: Pt, d: Pt, u: number): Pt {
  const m = 1 - u;
  return [m * m * m * a[0] + 3 * m * m * u * b[0] + 3 * m * u * u * c[0] + u * u * u * d[0], m * m * m * a[1] + 3 * m * m * u * b[1] + 3 * m * u * u * c[1] + u * u * u * d[1]];
}
const PTS: Pt[] = [];
const LEG_START: number[] = [];
for (let s = 0; s < 3; s++) {
  LEG_START.push(PTS.length);
  for (let i = 0; i < 160; i++) PTS.push(bez(STOPS[s], CTRL[s][0], CTRL[s][1], STOPS[s + 1], i / 160));
}
PTS.push(STOPS[3]);
LEG_START.push(PTS.length - 1);
const CUM = PTS.map(() => 0);
for (let i = 1; i < PTS.length; i++) CUM[i] = CUM[i - 1] + Math.hypot(PTS[i][0] - PTS[i - 1][0], PTS[i][1] - PTS[i - 1][1]);
const TOTAL = CUM[CUM.length - 1];
const LEG_LEN = LEG_START.map((i) => CUM[i]);

function at(d: number) {
  d = clamp(d, 0, TOTAL);
  let lo = 0, hi = CUM.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (CUM[mid] < d) lo = mid; else hi = mid; }
  const q = (d - CUM[lo]) / Math.max(1e-6, CUM[hi] - CUM[lo]);
  const x = lerp(PTS[lo][0], PTS[hi][0], q), y = lerp(PTS[lo][1], PTS[hi][1], q);
  const ang = Math.atan2(PTS[hi][1] - PTS[lo][1], PTS[hi][0] - PTS[lo][0]);
  return { x, y, ang, i: lo };
}

/* ---------- land: a wobbly band around an extended route ---------- */
const LAND = (() => {
  const spine: Pt[] = [[3400, 200], [2800, 520], ...PTS.filter((_, i) => i % 22 === 0), [500, 2100], [-300, 2500]];
  const L: Pt[] = [], R: Pt[] = [];
  for (let i = 0; i < spine.length; i++) {
    const a = spine[Math.max(0, i - 1)], b = spine[Math.min(spine.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const wl = 360 + 120 * Math.sin(i * 0.55) + 45 * Math.sin(i * 1.3 + 1);
    const wr = 400 + 130 * Math.sin(i * 0.45 + 2) + 50 * Math.sin(i * 1.1);
    L.push([spine[i][0] + nx * wl, spine[i][1] + ny * wl]);
    R.push([spine[i][0] - nx * wr, spine[i][1] - ny * wr]);
  }
  const ring = [...L, ...R.reverse()];
  // closed Catmull-Rom spline through the ring, as cubic beziers
  const n = ring.length, g = (i: number) => ring[(i + n) % n];
  let d = `M${g(0)[0].toFixed(1)},${g(0)[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + "Z";
})();
const BLOCKS = STOPS.flatMap(([cx, cy], s) => Array.from({ length: 26 }, (_, k) => {
  const r = 40 + rand(s * 50 + k) * 150, a = rand(s * 70 + k) * Math.PI * 2;
  return { x: cx + Math.cos(a) * r - 14, y: cy + Math.sin(a) * r - 10, w: 18 + rand(k + s * 9) * 22, h: 14 + rand(k * 3 + s) * 18 };
}));
const PARKS: Pt[] = [[2150, 1060], [1650, 1250], [1400, 1560], [1900, 1420], [2500, 760]];
const ROADS = [0, 1, 2, 3].map((r) => {
  const off = [-150, 120, -260, 230][r];
  return PTS.filter((_, i) => i % 6 === 0).map(([x, y], i) => `${i ? "L" : "M"}${x + off * 0.4 + Math.sin(i * 0.5 + r) * 30},${y + off + Math.cos(i * 0.4 + r) * 30}`).join(" ");
});

/* ---------- timeline ---------- */
const LEGS: [number, number][] = [[1.25, 2.95], [3.55, 5.35], [5.95, 6.95]];
function distAt(t: number) {
  for (let k = 2; k >= 0; k--) {
    const [a, b] = LEGS[k];
    if (t >= a) return lerp(LEG_LEN[k], LEG_LEN[k + 1], ease.inOut(P(t, a, b)));
  }
  return 0;
}
const STOP_T = [1.2, 2.95, 5.35, 6.95];
const OVER = { x: 1640, y: 1330, z: 0.62 };

const abs: CSSProperties = { position: "absolute" };

export default function RouteStory({ t, ...props }: { t: number } & Partial<RouteStoryProps>) {
  const p = { ...meta.defaults, ...props };
  const A = p.accent;
  const names = [p.stop1, p.stop2, p.stop3, p.stop4];
  const notes = ["Day 1", p.note2, p.note3, p.note4];
  const d = distAt(t);
  const head = at(d);
  const look = at(d + 120);

  // camera: dive in, follow (with look-ahead), pull back
  const dive = ease.inOut(P(t, 0.7, 1.5));
  const back = ease.inOut(P(t, 7.15, 8.3));
  const fx0 = lerp(head.x, look.x, 0.5), fy0 = lerp(head.y, look.y, 0.5);
  let cx = lerp(OVER.x, fx0, dive), cy = lerp(OVER.y, fy0, dive), z = lerp(0.55, 1.1, dive);
  cx = lerp(cx, OVER.x, back); cy = lerp(cy, OVER.y, back); z = lerp(z, OVER.z, back);
  const blur = (1 - dive) * 8;

  // drawn route as a path string
  const drawn = PTS.slice(0, head.i + 1).map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ") + ` L${head.x.toFixed(1)},${head.y.toFixed(1)}`;
  const full = PTS.map((q, i) => `${i ? "L" : "M"}${q[0]},${q[1]}`).join(" ");
  const km = Math.round((+p.km || 0) * (d / TOTAL));
  const day = STOP_T.filter((s) => t >= s + 0.05).length || 1;
  const veil = ease.inOut(P(t, 8.3, 8.8));

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#cfe3f5", fontFamily: FONT, color: "#1d1d1f" }}>
      <div style={{ ...abs, left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${540 - cx * z}px, ${980 - cy * z}px) scale(${z})`, filter: blur > 0.05 ? `blur(${blur}px)` : undefined }}>
        <svg width="3000" height="3000" viewBox="0 0 3000 3000" style={{ display: "block", overflow: "visible" }}>
          <defs>
            <linearGradient id="rs-route" x1="2320" y1="880" x2="960" y2="1760" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={A} /><stop offset="1" stopColor="#bf5af2" /></linearGradient>
            <filter id="rs-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14" /></filter>
            <filter id="rs-shadow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="22" /></filter>
          </defs>
          <rect x="-2000" y="-2000" width="7000" height="7000" fill="#cfe3f5" />
          <path d={LAND} fill="#b9d3ea" transform="translate(0,14)" filter="url(#rs-shadow)" />
          <path d={LAND} fill="#f4f1ea" />
          {PARKS.map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={90 + i * 14} ry={60 + i * 9} fill="#d7ead0" />)}
          {ROADS.map((r, i) => <path key={i} d={r} fill="none" stroke="#fff" strokeWidth={i % 2 ? 6 : 10} strokeLinecap="round" strokeLinejoin="round" opacity={0.95} />)}
          {BLOCKS.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={4} fill="#e4e0d7" />)}
          <text x="2350" y="1900" fontFamily="Inter, sans-serif" fontStyle="italic" fontSize="42" fill="#6f98c4" letterSpacing="6">Pacific Ocean</text>
          <text x="760" y="820" fontFamily="Inter, sans-serif" fontStyle="italic" fontSize="42" fill="#6f98c4" letterSpacing="6">Sea of Japan</text>
          <path d={full} fill="none" stroke="#9aa3ad" strokeWidth="5" strokeDasharray="4 18" strokeLinecap="round" opacity={0.7} />
          {d > 1 && <path d={drawn} fill="none" stroke={A} strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" opacity={0.35} filter="url(#rs-glow)" />}
          {d > 1 && <path d={drawn} fill="none" stroke="#fff" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />}
          {d > 1 && <path d={drawn} fill="none" stroke="url(#rs-route)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />}
        </svg>

        {/* pins + cards */}
        {STOPS.map(([x, y], k) => {
          const s = STOP_T[k];
          if (t < s - 0.02) return null;
          const pop = spring(t - s, 0.45, 13);
          const card = spring(t - s - 0.12, 0.6, 12);
          const left = k % 2 === 1;
          return (
            <div key={k} style={{ ...abs, left: x, top: y }}>
              <div style={{ ...abs, left: -18, top: -18, width: 36, height: 36, borderRadius: 18, background: k === 0 || k === 3 ? "#1d1d1f" : A, border: "6px solid #fff", boxShadow: "0 6px 14px rgba(0,0,0,.25)", transform: `scale(${pop})` }} />
              <div style={{ ...abs, top: -120, left: left ? -400 : 40, width: 360, transformOrigin: left ? "100% 100%" : "0 100%", transform: `scale(${lerp(0.6, 1, card)})`, opacity: clamp(card * 3) }}>
                <div style={{ display: "inline-block", padding: "16px 22px", borderRadius: 22, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,.05),0 18px 36px -16px rgba(0,0,0,.3)", float: left ? "right" : "left" }}>
                  <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>{names[k]}</div>
                  <div style={{ marginTop: 4, fontFamily: TEXT, fontSize: 20, fontWeight: 500, color: "#86868b", whiteSpace: "nowrap" }}>{notes[k]}</div>
                </div>
              </div>
            </div>
          );
        })}

        {/* train */}
        {t > 1.15 && (
          <div style={{ ...abs, left: head.x, top: head.y, width: 0, height: 0, transform: `rotate(${head.ang}rad)` }}>
            <div style={{ ...abs, left: -34, top: -16, width: 68, height: 32, borderRadius: 16, background: "#fff", boxShadow: "0 8px 16px rgba(0,0,0,.3)", overflow: "hidden" }}>
              <div style={{ ...abs, left: 0, right: 0, top: 13, height: 6, background: A }} />
              <div style={{ ...abs, right: 6, top: 6, width: 12, height: 20, borderRadius: 6, background: "#1d1d1f", opacity: 0.85 }} />
            </div>
          </div>
        )}
      </div>

      {/* title */}
      {t < 1.5 && (
        <div style={{ ...abs, left: 0, right: 0, top: 820, textAlign: "center", fontSize: 140, fontWeight: 700, letterSpacing: "-0.05em", whiteSpace: "nowrap", color: "#1d1d1f", ...rise(ease.expo(P(t, 0.0, 0.6)), 60, 16), opacity: clamp(ease.expo(P(t, 0, 0.6)) * 1.6) * (1 - P(t, 0.9, 1.3)) }}>{p.title}</div>
      )}

      {/* bottom bar */}
      {t > 1.0 && t < 8.6 && (
        <div style={{ ...abs, left: 90, right: 90, top: 1500, height: 130, borderRadius: 40, background: "rgba(255,255,255,.8)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", boxShadow: "0 0 0 1px rgba(0,0,0,.05),0 24px 50px -24px rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", ...rise(ease.expo(P(t, 1.0, 1.5)), 60, 10), opacity: clamp(ease.expo(P(t, 1.0, 1.5)) * 1.6) * (1 - P(t, 8.2, 8.5)) }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontSize: 68, fontWeight: 700, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>{km}</span>
            <span style={{ fontFamily: TEXT, fontSize: 30, fontWeight: 600, color: "#86868b" }}>km</span>
          </div>
          <div style={{ position: "relative", height: 64, width: 190, overflow: "hidden", borderRadius: 32, background: "#1d1d1f" }}>
            {[1, 2, 3, 4].map((n) => {
              const s = STOP_T[n - 1];
              const into = n === 1 ? 1 : ease.inOut(P(t, s, s + 0.3));
              const out = n === 4 ? 0 : ease.inOut(P(t, STOP_T[n], STOP_T[n] + 0.3));
              return <span key={n} style={{ ...abs, inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: TEXT, fontSize: 28, fontWeight: 600, transform: `translateY(${(1 - into) * 64 - out * 64}px)`, opacity: n <= day + 1 ? 1 : 0 }}>Day {n}</span>;
            })}
          </div>
        </div>
      )}

      {/* veil + end card */}
      {veil > 0 && (
        <div style={{ ...abs, inset: 0, background: `rgba(245,245,247,${veil * 0.86})`, backdropFilter: `blur(${veil * 14}px)`, WebkitBackdropFilter: `blur(${veil * 14}px)` }}>
          <div style={{ ...abs, left: 0, right: 0, top: 780, textAlign: "center", fontSize: 92, fontWeight: 700, letterSpacing: "-0.045em", whiteSpace: "nowrap", ...rise(ease.expo(P(t, 8.45, 9.05)), 50, 14) }}>{p.line}</div>
          <div style={{ ...abs, left: 0, right: 0, top: 920, textAlign: "center", fontSize: 60, fontWeight: 600, letterSpacing: "-0.03em", color: A, ...rise(ease.expo(P(t, 8.65, 9.2)), 40, 12) }}>{p.app}</div>
          <div style={{ ...abs, left: 0, right: 0, top: 1040, textAlign: "center", ...rise(ease.expo(P(t, 8.85, 9.4)), 30, 10) }}>
            <span style={{ display: "inline-flex", alignItems: "center", padding: "16px 30px", borderRadius: 999, background: "#1d1d1f", color: "#fff", fontFamily: TEXT, fontSize: 32, fontWeight: 600 }}>{p.url}</span>
          </div>
        </div>
      )}
    </div>
  );
}
