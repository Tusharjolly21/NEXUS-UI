"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, motionValue, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControls, type MotionValue, type ValueAnimationTransition } from "framer-motion";
import { getSoundsEnabled, useAutoplaySoundAllowed } from "@/lib/ui-sounds";
import { createShredderSound, type ShredderHit, type ShredderSound } from "./shredder-sound";

type Kind = "pdf" | "doc" | "sheet" | "deck";
type Doc = { id: string; name: string; size: string; kind: Kind; color: string; label: string; title: string; sub: string };
const ALL: Doc[] = [
  { id: "q3", name: "Q3-report.pdf", size: "2.4 MB", kind: "pdf", color: "#ff3b30", label: "PDF", title: "Q3 Report", sub: "Revenue by month" },
  { id: "offer", name: "Offer-letter.docx", size: "86 KB", kind: "doc", color: "#0071e3", label: "DOC", title: "Offer Letter", sub: "Confidential" },
  { id: "budget", name: "Budget-2026.xlsx", size: "412 KB", kind: "sheet", color: "#30d158", label: "XLS", title: "Budget 2026", sub: "Operating plan" },
  { id: "deck", name: "Launch-deck.key", size: "18.6 MB", kind: "deck", color: "#ff9f0a", label: "KEY", title: "Launch Deck", sub: "Keynote, 24 slides" },
];

/* ------------------------------------------------------------------ */
/* printed page                                                         */
/* ------------------------------------------------------------------ */
const SW = 96, SH = 124, TEXK = 3;

function paintDoc(c: HTMLCanvasElement, d: Doc, k: number) {
  c.width = Math.round(SW * k); c.height = Math.round(SH * k);
  const g = c.getContext("2d");
  if (!g) return;
  g.setTransform(k, 0, 0, k, 0, 0);
  g.fillStyle = "#fdfdfb"; g.fillRect(0, 0, SW, SH);
  g.fillStyle = d.color; g.fillRect(0, 0, SW, 3);
  const font = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
  g.fillStyle = "#1d1d1f"; g.font = `700 8px ${font}`; g.fillText(d.title, 7, 15);
  g.fillStyle = "#86868b"; g.font = `500 5px ${font}`; g.fillText(d.sub, 7, 22);
  const line = (x: number, y: number, w: number, c = "#d4d4d9", h = 2) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const W1 = [76, 70, 80, 58, 74, 66, 79, 44];
  if (d.kind === "pdf") {
    const hs = [16, 22, 19, 29, 25, 34, 40];
    hs.forEach((h, i) => {
      const grd = g.createLinearGradient(0, 72 - h, 0, 72);
      grd.addColorStop(0, i === 6 ? "#0071e3" : "#ff6b5e"); grd.addColorStop(1, i === 6 ? "#2997ff" : "#ff3b30");
      g.fillStyle = grd; g.fillRect(9 + i * 11.5, 72 - h, 8, h);
    });
    line(7, 73, 82, "#c7c7cc", 1);
    for (let i = 0; i < 6; i++) line(7, 82 + i * 6.5, W1[i]);
    g.fillStyle = "#1d1d1f"; g.font = `700 6px ${font}`; g.fillText("+18%", 66, 34);
  } else if (d.kind === "doc") {
    line(7, 30, 40, "#0071e3", 2.5);
    for (let i = 0; i < 7; i++) line(7, 38 + i * 6, W1[i % W1.length]);
    for (let i = 0; i < 4; i++) line(7, 85 + i * 6, W1[(i + 3) % W1.length] - 6);
    g.strokeStyle = "#0071e3"; g.lineWidth = 1.2; g.beginPath();
    g.moveTo(9, 116); g.bezierCurveTo(16, 104, 20, 122, 27, 111); g.bezierCurveTo(32, 104, 34, 118, 44, 112); g.stroke();
  } else if (d.kind === "sheet") {
    g.fillStyle = "#e3f8e9"; g.fillRect(7, 29, 82, 9);
    for (let r = 0; r < 9; r++) {
      const y = 29 + r * 9;
      if (r > 0) for (let c2 = 0; c2 < 4; c2++) line(10 + c2 * 21, y + 3.5, [12, 9, 14, 8][(r + c2) % 4], r === 8 ? "#30d158" : "#c7c7cc", 2);
      line(7, y, 82, "#e5e5ea", 0.6);
    }
    for (let c2 = 0; c2 < 4; c2++) line(10 + c2 * 21, 32.5, 10, "#248a3d", 2);
    for (let c2 = 1; c2 < 4; c2++) { g.fillStyle = "#e5e5ea"; g.fillRect(7 + c2 * 20.5, 29, 0.6, 81); }
    line(7, 112, 30, "#d4d4d9");
  } else {
    const grd = g.createLinearGradient(7, 28, 89, 76);
    grd.addColorStop(0, "#ff9f0a"); grd.addColorStop(0.55, "#ff375f"); grd.addColorStop(1, "#bf5af2");
    g.fillStyle = grd; g.fillRect(7, 28, 82, 48);
    g.fillStyle = "rgba(255,255,255,.9)"; g.beginPath(); g.arc(30, 52, 9, 0, Math.PI * 2); g.fill();
    line(46, 46, 34, "rgba(255,255,255,.85)", 3); line(46, 54, 24, "rgba(255,255,255,.6)", 2);
    for (let i = 0; i < 5; i++) { g.fillStyle = d.color; g.fillRect(8, 85 + i * 7, 2, 2); line(13, 85 + i * 7, W1[i] - 10); }
  }
  // paper tooth: a faint deterministic fibre speckle so the sheet reads as matte stock
  let seed = 7;
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 900; i++) { g.fillStyle = r() > 0.5 ? "rgba(0,0,0,.035)" : "rgba(255,255,255,.5)"; g.fillRect(r() * SW, r() * SH, 0.45, 0.45); }
}

/* ------------------------------------------------------------------ */
/* camera + tiny 3D toolkit                                              */
/* ------------------------------------------------------------------ */
type V3 = [number, number, number];
type P2 = [number, number];
const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const nrm3 = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const mid3 = (a: V3, b: V3): V3 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
/** The clock, read only from event handlers and the animation loop, never while rendering. */
const nowMs = () => performance.now();
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

// camera: yaw shows the right flank, pitch looks down onto the head, mild perspective
const YAW = -0.36, PITCH = 0.47, FOC = 950, YC = 96;
const CYW = Math.cos(YAW), SYW = Math.sin(YAW), CPT = Math.cos(PITCH), SPT = Math.sin(PITCH);
let OX = 0, OY = 0;
const P = (x: number, y: number, z: number): P2 => {
  const x1 = x * CYW + z * SYW, z1 = -x * SYW + z * CYW, yy = y - YC;
  const y2 = yy * CPT - z1 * SPT, z2 = yy * SPT + z1 * CPT, s = FOC / (FOC - z2);
  return [OX + x1 * s, OY - y2 * s];
};
/** projection into a flat buffer, returns camera depth (bigger = nearer) */
const projTo = (x: number, y: number, z: number, out: Float32Array, o: number) => {
  const x1 = x * CYW + z * SYW, z1 = -x * SYW + z * CYW, yy = y - YC;
  const y2 = yy * CPT - z1 * SPT, z2 = yy * SPT + z1 * CPT, s = FOC / (FOC - z2);
  out[o] = OX + x1 * s; out[o + 1] = OY - y2 * s;
  return z2;
};
const CAM: V3 = [-FOC * CPT * SYW, FOC * SPT + YC, FOC * CPT * CYW];
const KEY: V3 = [-420, 660, 560], FILL: V3 = [560, 220, 300], RIM: V3 = [300, 520, -520];
const LK = nrm3(sub3(KEY, [0, 90, 0])), VD = nrm3(sub3(CAM, [0, 90, 0]));

type Mat = { c: V3; amb: number; kd: number; ks: number; sh: number; env: number; fr: number };
const PLASTIC: Mat = { c: [27, 27, 31], amb: 0.62, kd: 0.95, ks: 120, sh: 46, env: 16, fr: 70 };
function lit(p: V3, n: V3, m: Mat): V3 {
  const V = nrm3(sub3(CAM, p));
  let r = m.c[0] * m.amb, g = m.c[1] * m.amb, b = m.c[2] * m.amb;
  const ls: [V3, number][] = [[KEY, 1], [FILL, 0.32], [RIM, 0.55]];
  for (const [lp, I] of ls) {
    const L = nrm3(sub3(lp, p)), d = Math.max(0, dot3(n, L));
    const H = nrm3(add3(L, V)), s = Math.pow(Math.max(0, dot3(n, H)), m.sh) * m.ks * I;
    r += m.c[0] * m.kd * d * I + s; g += m.c[1] * m.kd * d * I + s; b += m.c[2] * m.kd * d * I + s * 1.04;
  }
  const e = m.env * (0.5 + 0.5 * n[1]);
  const f = m.fr * Math.pow(1 - Math.max(0, dot3(n, V)), 4) * (0.35 + 0.65 * Math.max(0, n[1] + 0.3));
  return [clamp(r + e + f, 0, 255), clamp(g + e + f, 0, 255), clamp(b + e * 1.05 + f, 0, 255)];
}
const css = (c: V3, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const poly = (g: CanvasRenderingContext2D, pts: P2[]) => {
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath();
};
/** rounded rectangle in plan (x, z), with outward normals */
function plan(hw: number, hd: number, r: number, seg: number) {
  const p: P2[] = [], n: P2[] = [];
  const cs: [number, number, number][] = [[hw - r, hd - r, 0], [-(hw - r), hd - r, Math.PI / 2], [-(hw - r), -(hd - r), Math.PI], [hw - r, -(hd - r), Math.PI * 1.5]];
  for (const [cx, cz, a0] of cs) for (let j = 0; j <= seg; j++) {
    const a = a0 + (j / seg) * (Math.PI / 2);
    p.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]); n.push([Math.cos(a), Math.sin(a)]);
  }
  return { p, n };
}

/* ------------------------------------------------------------------ */
/* the machine (world units ~ CSS px)                                   */
/* ------------------------------------------------------------------ */
const BH = 146, BHW = 88, BHD = 34, BTP = 3, BR = 9, BT = 2.6, FLOOR = 4.5;
const HY = BH + 0.5, HHW = 101, HHD = 43, HR = 17, HWALL = 32, HBV = 8, HTOP = HY + HWALL + HBV;
const SZ = -4, TL = 60, TBACK = 13, TFRONT = 8, TS = 5, TDEP = 3.5;
const NS = 30, SWD = SW / NS, NP = 15, DS = SH / (NP - 1), EXY = HY - 1.2, HWID = (SWD - 0.5) / 2;
const XI = BHW - BTP - BT - 1.4, ZI = BHD - BTP - BT - 1.4;
const ROCK = { x: 64, z: 24, hw: 11, hd: 5.5 }, LEDP = { x: 38, z: 26 };
const FEED = 80, G = 640, MAXF = 260;

const GEO = (() => {
  const pts: P2[] = [];
  const hp = plan(HHW, HHD, HR, 6).p, bp = plan(BHW - BTP, BHD - BTP, BR, 3).p;
  for (const [x, z] of hp) pts.push(P(x, HY, z), P(x, HTOP, z), P(x + 12, 0, z - 16));
  for (const [x, z] of bp) pts.push(P(x, 0, z));
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  OX = 16 - x0; OY = 8 - y0;
  const CW = Math.ceil(x1 - x0 + 32), CH = Math.ceil(y1 - y0 + 30);
  // head silhouette box (for the drop zone)
  let hx0 = 1e9, hy0 = 1e9, hx1 = -1e9, hy1 = -1e9;
  for (const [x, z] of hp) for (const y of [HY, HTOP]) { const q = P(x, y, z); hx0 = Math.min(hx0, q[0]); hx1 = Math.max(hx1, q[0]); hy0 = Math.min(hy0, q[1]); hy1 = Math.max(hy1, q[1]); }
  return { CW, CH, head: { x0: hx0, x1: hx1, y0: hy0, y1: hy1 } };
})();

const LIP_C = SZ + (TFRONT - TBACK) / 2, LIP_HD = (TFRONT + TBACK) / 2;
const LIP: P2[] = plan(TL, LIP_HD, LIP_HD - 0.01, 9).p.map(([x, z]) => P(x, HTOP, z + LIP_C));
// cutter discs, two interleaved shafts under the throat (projected once, lit live)
const CUT: { a: P2; b: P2; x: number; s: number }[] = [];
for (let x = -TL + 10; x <= TL - 10; x += SWD) for (const s of [-1, 1]) {
  const z = SZ + s * 2.1, xx = x + (s > 0 ? SWD / 2 : 0);
  CUT.push({ a: P(xx, HTOP - TDEP + 0.7, z), b: P(xx, HTOP - TDEP - 2.6, z), x: xx, s });
}
const LED_C = P(LEDP.x, HTOP + 0.4, LEDP.z);

function paintShadow(g: CanvasRenderingContext2D, d: number) {
  const off = 4000;
  const shape = (pts: P2[]) => poly(g, pts.map(([x, y]) => [x - off, y] as P2));
  g.save();
  g.shadowOffsetX = off * d;
  g.fillStyle = "#000";
  g.shadowColor = "rgba(0,0,0,0.16)"; g.shadowBlur = 26 * d;
  shape(plan(HHW - 4, HHD - 2, HR, 6).p.map(([x, z]) => P(x + 14, 0, z - 18))); g.fill();
  g.shadowColor = "rgba(0,0,0,0.10)"; g.shadowBlur = 10 * d;
  shape(plan(BHW - BTP + 3, BHD - BTP + 3, BR, 3).p.map(([x, z]) => P(x + 4, 0, z - 4))); g.fill();
  g.shadowColor = "rgba(0,0,0,0.22)"; g.shadowBlur = 3 * d;
  shape(plan(BHW - BTP, BHD - BTP, BR, 3).p.map(([x, z]) => P(x, 0, z))); g.fill();
  g.restore();
}

function binFacets() {
  const bot = plan(BHW - BTP, BHD - BTP, BR, 3), top = plan(BHW, BHD, BR, 3), n = bot.p.length;
  const out: { q: V3[]; n: V3; nl: V3; nr: V3; front: boolean }[] = [];
  for (let j = 0; j < n; j++) {
    const j2 = (j + 1) % n;
    const q: V3[] = [[bot.p[j][0], 0, bot.p[j][1]], [bot.p[j2][0], 0, bot.p[j2][1]], [top.p[j2][0], BH, top.p[j2][1]], [top.p[j][0], BH, top.p[j][1]]];
    if (Math.hypot(q[0][0] - q[1][0], q[0][2] - q[1][2]) < 0.01) continue;
    const nl: V3 = [bot.n[j][0], -0.02, bot.n[j][1]], nr: V3 = [bot.n[j2][0], -0.02, bot.n[j2][1]];
    const nn = nrm3(add3(nl, nr)), c = mid3(mid3(q[0], q[1]), mid3(q[2], q[3]));
    out.push({ q, n: nn, nl, nr, front: dot3(nn, sub3(CAM, c)) > 0 });
  }
  return out;
}

function paintBinBack(g: CanvasRenderingContext2D) {
  const fs = binFacets();
  for (const f of fs) {
    if (f.front) continue;
    const pts = f.q.map((v) => P(...v));
    poly(g, pts);
    const a = P(...mid3(f.q[0], f.q[1])), b = P(...mid3(f.q[2], f.q[3]));
    const gr = g.createLinearGradient(a[0], a[1], b[0], b[1]);
    gr.addColorStop(0, "rgba(58,62,72,0.09)"); gr.addColorStop(0.5, "rgba(70,74,84,0.05)"); gr.addColorStop(1, "rgba(70,74,84,0.04)");
    g.fillStyle = gr; g.fill();
  }
  // inner floor
  const fl = plan(BHW - BTP - BT, BHD - BTP - BT, BR - BT, 3).p.map(([x, z]) => P(x, FLOOR, z));
  poly(g, fl);
  const a = P(0, FLOOR, -BHD), b = P(0, FLOOR, BHD);
  const gr = g.createLinearGradient(a[0], a[1], b[0], b[1]);
  gr.addColorStop(0, "rgba(60,64,74,0.08)"); gr.addColorStop(1, "rgba(60,64,74,0.04)");
  g.fillStyle = gr; g.fill();
  g.strokeStyle = "rgba(255,255,255,0.5)"; g.lineWidth = 0.6; g.stroke();
  // far vertical edges of the box catch a little light
  for (const f of fs) {
    if (f.front) continue;
    const p0 = P(...f.q[0]), p3 = P(...f.q[3]);
    g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p3[0], p3[1]);
    g.strokeStyle = "rgba(255,255,255,0.10)"; g.lineWidth = 0.6; g.stroke();
  }
}

function paintBinFront(g: CanvasRenderingContext2D) {
  const fs = binFacets().filter((f) => f.front);
  const union = () => { g.beginPath(); for (const f of fs) { const p = f.q.map((v) => P(...v)); g.moveTo(p[0][0], p[0][1]); for (let i = 1; i < 4; i++) g.lineTo(p[i][0], p[i][1]); g.closePath(); } };
  // smoked tint + Fresnel: grazing facets (the rounded corners) turn silvery
  for (const f of fs) {
    const pts = f.q.map((v) => P(...v));
    poly(g, pts);
    g.fillStyle = "rgba(30,32,38,0.11)"; g.fill();
    const ml = mid3(f.q[0], f.q[3]), mr = mid3(f.q[1], f.q[2]);
    const fl = 0.02 + 0.62 * Math.pow(1 - Math.abs(dot3(nrm3(f.nl), nrm3(sub3(CAM, ml)))), 3);
    const fr = 0.02 + 0.62 * Math.pow(1 - Math.abs(dot3(nrm3(f.nr), nrm3(sub3(CAM, mr)))), 3);
    const a = P(...ml), b = P(...mr);
    if (Math.hypot(a[0] - b[0], a[1] - b[1]) > 0.3) {
      const gr = g.createLinearGradient(a[0], a[1], b[0], b[1]);
      gr.addColorStop(0, `rgba(255,255,255,${fl})`); gr.addColorStop(1, `rgba(255,255,255,${fr})`);
      g.fillStyle = gr;
    } else g.fillStyle = `rgba(255,255,255,${(fl + fr) / 2})`;
    g.fill();
  }
  g.save();
  union(); g.clip();
  // the head casts a soft shadow onto the top of the bin
  {
    const a = P(0, BH, BHD), b = P(0, BH - 30, BHD);
    const gr = g.createLinearGradient(a[0], a[1], b[0], b[1]);
    gr.addColorStop(0, "rgba(0,0,0,0.42)"); gr.addColorStop(0.35, "rgba(0,0,0,0.12)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(0, 0, GEO.CW, GEO.CH);
  }
  // studio reflections: two soft streaks and a hairline, slanted
  {
    const c = P(-20, BH * 0.55, BHD);
    g.translate(c[0], c[1]); g.rotate(0.3);
    const band = (x: number, w: number, a: number) => {
      const gr = g.createLinearGradient(x, 0, x + w, 0);
      gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, `rgba(255,255,255,${a})`); gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr; g.fillRect(x, -300, w, 600);
    };
    band(-62, 30, 0.22); band(-26, 7, 0.28); band(62, 46, 0.09);
  }
  g.restore();
  // the thick acrylic base, seen through the front faces
  for (const f of fs) {
    const b0 = P(f.q[0][0], 0, f.q[0][2]), b1 = P(f.q[1][0], 0, f.q[1][2]);
    const t1 = P(f.q[1][0] * 0.995, FLOOR + 1, f.q[1][2] * 0.995), t0 = P(f.q[0][0] * 0.995, FLOOR + 1, f.q[0][2] * 0.995);
    poly(g, [b0, b1, t1, t0]); g.fillStyle = "rgba(34,38,46,0.16)"; g.fill();
    g.beginPath(); g.moveTo(t0[0], t0[1]); g.lineTo(t1[0], t1[1]); g.strokeStyle = "rgba(255,255,255,0.55)"; g.lineWidth = 0.7; g.stroke();
    g.beginPath(); g.moveTo(b0[0], b0[1]); g.lineTo(b1[0], b1[1]); g.strokeStyle = "rgba(0,0,0,0.28)"; g.lineWidth = 0.8; g.stroke();
  }
  // silhouette edges: bright outer edge + inner wall line (wall thickness)
  let lft = fs[0], rgt = fs[0];
  for (const f of fs) { if (P(...f.q[0])[0] < P(...lft.q[0])[0]) lft = f; if (P(...f.q[1])[0] > P(...rgt.q[1])[0]) rgt = f; }
  const edge = (a: V3, b: V3, inset: number, s: string, w: number) => {
    const k0 = a[0] === 0 ? 1 : (Math.abs(a[0]) - inset) / Math.abs(a[0]);
    const pa = P(a[0] * k0, a[1], a[2]), pb = P(b[0] * k0, b[1], b[2]);
    g.beginPath(); g.moveTo(pa[0], pa[1]); g.lineTo(pb[0], pb[1]); g.strokeStyle = s; g.lineWidth = w; g.stroke();
  };
  edge(lft.q[0], lft.q[3], 0, "rgba(255,255,255,0.85)", 1);
  edge(lft.q[0], lft.q[3], 2.6, "rgba(40,44,52,0.16)", 1.2);
  edge(rgt.q[1], rgt.q[2], 0, "rgba(255,255,255,0.75)", 1);
  edge(rgt.q[1], rgt.q[2], 2.6, "rgba(40,44,52,0.14)", 1.2);
}

function paintHead(g: CanvasRenderingContext2D) {
  type Ring = { y: number; th: number; pl: ReturnType<typeof plan> };
  const rings: Ring[] = [{ y: HY, th: 0, pl: plan(HHW, HHD, HR, 6) }, { y: HY + HWALL, th: 0, pl: plan(HHW, HHD, HR, 6) }];
  for (let k = 1; k <= 3; k++) {
    const th = (k / 3) * (Math.PI / 2), ins = HBV * (1 - Math.cos(th));
    rings.push({ y: HY + HWALL + HBV * Math.sin(th), th, pl: plan(HHW - ins, HHD - ins, HR - ins, 6) });
  }
  const n = rings[0].pl.p.length;
  const vtx = (r: number, j: number): V3 => [rings[r].pl.p[j][0], rings[r].y, rings[r].pl.p[j][1]];
  const vnm = (r: number, j: number): V3 => { const c = Math.cos(rings[r].th); return [rings[r].pl.n[j][0] * c, Math.sin(rings[r].th), rings[r].pl.n[j][1] * c]; };
  const wallVis: number[] = [];
  for (let b = 0; b < rings.length - 1; b++) for (let j = 0; j < n; j++) {
    const j2 = (j + 1) % n;
    const a0 = vtx(b, j), a1 = vtx(b, j2), b1 = vtx(b + 1, j2), b0 = vtx(b + 1, j);
    if (Math.hypot(a0[0] - a1[0], a0[2] - a1[2]) < 0.01) continue;
    const nl = nrm3(add3(vnm(b, j), vnm(b + 1, j))), nr = nrm3(add3(vnm(b, j2), vnm(b + 1, j2)));
    const nf = nrm3(add3(nl, nr)), cen = mid3(mid3(a0, a1), mid3(b0, b1));
    if (dot3(nf, sub3(CAM, cen)) <= 0) continue;
    if (b === 0) wallVis.push(j);
    const ml = mid3(a0, b0), mr = mid3(a1, b1);
    const cl = lit(ml, nl, PLASTIC), cr = lit(mr, nr, PLASTIC);
    const pl = P(...ml), pr = P(...mr);
    const pts = [P(...a0), P(...a1), P(...b1), P(...b0)];
    let fill: string | CanvasGradient;
    if (Math.hypot(pl[0] - pr[0], pl[1] - pr[1]) > 0.3) {
      const gr = g.createLinearGradient(pl[0], pl[1], pr[0], pr[1]);
      gr.addColorStop(0, css(cl)); gr.addColorStop(1, css(cr)); fill = gr;
    } else fill = css([(cl[0] + cr[0]) / 2, (cl[1] + cr[1]) / 2, (cl[2] + cr[2]) / 2]);
    poly(g, pts); g.fillStyle = fill; g.fill(); g.strokeStyle = fill; g.lineWidth = 0.5; g.stroke();
    if (b === 0) {
      // the lower wall falls into the shadow of its own overhang; a faint bounce at the very bottom edge
      const lo = P(...mid3(a0, a1)), hi = P(...mid3(b0, b1));
      const gr = g.createLinearGradient(lo[0], lo[1], hi[0], hi[1]);
      gr.addColorStop(0, "rgba(255,255,255,0.05)"); gr.addColorStop(0.06, "rgba(0,0,0,0.38)"); gr.addColorStop(0.55, "rgba(0,0,0,0)");
      poly(g, pts); g.fillStyle = gr; g.fill();
    }
  }
  // moulding seam (parting line) around the visible walls
  for (const j of wallVis) {
    const j2 = (j + 1) % n, ys = HY + 9;
    const a = P(rings[0].pl.p[j][0], ys, rings[0].pl.p[j][1]), b = P(rings[0].pl.p[j2][0], ys, rings[0].pl.p[j2][1]);
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.strokeStyle = "rgba(0,0,0,0.7)"; g.lineWidth = 0.8; g.stroke();
    g.beginPath(); g.moveTo(a[0], a[1] + 0.8); g.lineTo(b[0], b[1] + 0.8); g.strokeStyle = "rgba(255,255,255,0.07)"; g.lineWidth = 0.6; g.stroke();
  }
  // vents on the right flank
  for (let i = 0; i < 5; i++) {
    const y = HY + 13 + i * 3.6;
    const a = P(HHW + 0.05, y, -17), b = P(HHW + 0.05, y, 17);
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.strokeStyle = "rgba(0,0,0,0.85)"; g.lineWidth = 1.3; g.lineCap = "round"; g.stroke();
    g.beginPath(); g.moveTo(a[0], a[1] + 0.95); g.lineTo(b[0], b[1] + 0.95); g.strokeStyle = "rgba(255,255,255,0.09)"; g.lineWidth = 0.5; g.stroke();
  }
  g.lineCap = "butt";
  // top face
  const topR = rings[rings.length - 1];
  const topPts = topR.pl.p.map(([x, z]) => P(x, HTOP, z));
  {
    const A: V3 = [-HHW, HTOP, HHD], B: V3 = [HHW, HTOP, -HHD];
    const pa = P(...A), pb = P(...B);
    const gr = g.createLinearGradient(pa[0], pa[1], pb[0], pb[1]);
    gr.addColorStop(0, css(lit(A, [0, 1, 0], PLASTIC))); gr.addColorStop(1, css(lit(B, [0, 1, 0], PLASTIC)));
    poly(g, topPts); g.fillStyle = gr; g.fill();
    g.save(); poly(g, topPts); g.clip();
    const s0 = P(-80, HTOP, 44), s1 = P(40, HTOP, -44);
    const sb = g.createLinearGradient(s0[0], s0[1], s1[0], s1[1]);
    sb.addColorStop(0, "rgba(255,255,255,0)"); sb.addColorStop(0.36, "rgba(255,255,255,0)"); sb.addColorStop(0.47, "rgba(255,255,255,0.075)");
    sb.addColorStop(0.53, "rgba(255,255,255,0.035)"); sb.addColorStop(0.66, "rgba(255,255,255,0)"); sb.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = sb; g.fillRect(0, 0, GEO.CW, GEO.CH);
    g.restore();
  }
  // feed throat: back funnel face catching light, then the dark slot
  {
    const a = P(0, HTOP, SZ - TBACK), b = P(0, HTOP, SZ + TFRONT), m = P(0, HTOP - TDEP, SZ - TS);
    const L2 = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2;
    const t = clamp(((m[0] - a[0]) * (b[0] - a[0]) + (m[1] - a[1]) * (b[1] - a[1])) / L2, 0.1, 0.95);
    const gr = g.createLinearGradient(a[0], a[1], b[0], b[1]);
    gr.addColorStop(0, "#46464c"); gr.addColorStop(t * 0.85, "#202024"); gr.addColorStop(t, "#060607"); gr.addColorStop(1, "#050506");
    poly(g, LIP); g.fillStyle = gr; g.fill();
    g.strokeStyle = "rgba(0,0,0,0.6)"; g.lineWidth = 0.8; g.stroke();
    const f0 = P(-TL + LIP_HD, HTOP, SZ + TFRONT), f1 = P(TL - LIP_HD, HTOP, SZ + TFRONT);
    g.beginPath(); g.moveTo(f0[0], f0[1] + 0.5); g.lineTo(f1[0], f1[1] + 0.5); g.strokeStyle = "rgba(255,255,255,0.26)"; g.lineWidth = 0.8; g.stroke();
  }
  // rocker switch: recess, raised "I" half, lower "O" half
  {
    const { x, z, hw, hd } = ROCK;
    const rec = plan(hw, hd, 2.4, 3).p.map(([px, pz]) => P(x + px, HTOP, z + pz));
    poly(g, rec); g.fillStyle = "#060607"; g.fill();
    const e0 = P(x - hw + 2, HTOP, z + hd), e1 = P(x + hw - 2, HTOP, z + hd);
    g.beginPath(); g.moveTo(e0[0], e0[1] + 0.6); g.lineTo(e1[0], e1[1] + 0.6); g.strokeStyle = "rgba(255,255,255,0.16)"; g.lineWidth = 0.7; g.stroke();
    const i = 1.3, zf = z + hd - i, zb = z - hd + i, xl = x - hw + i, xr = x + hw - i;
    const side = [P(xl, HTOP, zf), P(x, HTOP, zf), P(x, HTOP + 0.8, zf), P(xl, HTOP + 2.4, zf)];
    poly(g, side); g.fillStyle = css(lit([x - 5, HTOP + 1, zf], [0, 0, 1], PLASTIC)); g.fill();
    const lq = [P(xl, HTOP + 2.4, zb), P(x, HTOP + 0.8, zb), P(x, HTOP + 0.8, zf), P(xl, HTOP + 2.4, zf)];
    poly(g, lq); g.fillStyle = css(lit([x - 5, HTOP + 1.6, z], nrm3([0.16, 1, 0]), { ...PLASTIC, c: [36, 36, 40] })); g.fill();
    const rq = [P(x, HTOP + 0.8, zb), P(xr, HTOP + 0.3, zb), P(xr, HTOP + 0.3, zf), P(x, HTOP + 0.8, zf)];
    poly(g, rq); g.fillStyle = css(lit([x + 5, HTOP + 0.5, z], nrm3([0.05, 1, 0]), { ...PLASTIC, c: [30, 30, 34] })); g.fill();
    const s0 = P(x, HTOP + 0.85, zb), s1 = P(x, HTOP + 0.85, zf);
    g.beginPath(); g.moveTo(s0[0], s0[1]); g.lineTo(s1[0], s1[1]); g.strokeStyle = "rgba(0,0,0,0.6)"; g.lineWidth = 0.6; g.stroke();
    const i0 = P(x - 5.4, HTOP + 1.7, z - 2.2), i1 = P(x - 5.4, HTOP + 1.7, z + 2.2);
    g.beginPath(); g.moveTo(i0[0], i0[1]); g.lineTo(i1[0], i1[1]); g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineWidth = 0.7; g.stroke();
    const ring: P2[] = []; for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; ring.push(P(x + 5.4 + Math.cos(a) * 1.9, HTOP + 0.6, z + Math.sin(a) * 1.9)); }
    poly(g, ring); g.strokeStyle = "rgba(255,255,255,0.5)"; g.lineWidth = 0.6; g.stroke();
  }
  // LED bezel
  {
    const ring = (r: number) => { const pts: P2[] = []; for (let k = 0; k < 18; k++) { const a = (k / 18) * Math.PI * 2; pts.push(P(LEDP.x + Math.cos(a) * r, HTOP, LEDP.z + Math.sin(a) * r)); } return pts; };
    poly(g, ring(4.4)); g.fillStyle = "#08080a"; g.fill();
    g.strokeStyle = "rgba(255,255,255,0.13)"; g.lineWidth = 0.6; g.stroke();
  }
}

/* ------------------------------------------------------------------ */
/* strips: verlet ribbons with curl, twist and flutter                  */
/* ------------------------------------------------------------------ */
type Strip = {
  i: number; ex: number; ez: number;
  p: Float32Array; q: Float32Array; a: Float32Array; f: Float32Array; pr: Float32Array;
  ar: V3; curl: number; tw: number; twA: number; ph: number; flA: number; air: number;
  still: number; sleep: boolean; stamped: boolean;
};
const mkStrip = (i: number): Strip => {
  const st: Strip = {
    i, ex: -SW / 2 + (i + 0.5) * SWD, ez: SZ + (i % 2 ? 0.9 : -0.9) + rnd(-0.4, 0.4),
    p: new Float32Array(NP * 3), q: new Float32Array(NP * 3), a: new Float32Array(NP * 3), f: new Float32Array(NP * 3), pr: new Float32Array(NP * 5),
    ar: [1, 0, 0], curl: (i % 2 ? 1 : -1) * rnd(260, 700) * (Math.random() < 0.2 ? 0.3 : 1), tw: rnd(-1, 1) * rnd(0.5, 2.4), twA: 0,
    ph: rnd(0, 6.28), flA: 0, air: 0, still: 0, sleep: false, stamped: false,
  };
  for (let k = 0; k < NP; k++) { st.a[k * 3] = 1; const y = EXY + k * DS; st.p[k * 3] = st.q[k * 3] = st.ex; st.p[k * 3 + 1] = st.q[k * 3 + 1] = y; st.p[k * 3 + 2] = st.q[k * 3 + 2] = st.ez; }
  return st;
};

const HC = 4, HNX = Math.ceil((2 * XI) / HC) + 1, HNZ = Math.ceil((2 * ZI) / HC) + 1;
const hAt = (H: Float32Array, x: number, z: number) => {
  const fx = clamp((x + XI) / HC, 0, HNX - 1.001), fz = clamp((z + ZI) / HC, 0, HNZ - 1.001);
  const ix = Math.floor(fx), iz = Math.floor(fz), tx = fx - ix, tz = fz - iz;
  const i0 = iz * HNX + ix;
  return (H[i0] * (1 - tx) + H[i0 + 1] * tx) * (1 - tz) + (H[i0 + HNX] * (1 - tx) + H[i0 + HNX + 1] * tx) * tz;
};
const stamp = (H: Float32Array, st: Strip) => {
  for (let k = 0; k < NP; k++) {
    const x = st.p[k * 3], y = st.p[k * 3 + 1], z = st.p[k * 3 + 2];
    if (y > EXY) continue;
    const ix = Math.round((x + XI) / HC), iz = Math.round((z + ZI) / HC);
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      const cx = ix + dx, cz = iz + dz;
      if (cx < 0 || cz < 0 || cx >= HNX || cz >= HNZ) continue;
      const h = y + 1.3 - 0.55 * (Math.abs(dx) + Math.abs(dz));
      const id = cz * HNX + cx;
      if (h > H[id]) H[id] = h;
    }
  }
  st.stamped = true;
};

/** across-vectors by parallel transport from the cutter end (minimal rotation in time), then twist + flutter */
function frameAcross(st: Strip, t: number, dt: number, released: boolean) {
  if (released) st.twA = Math.min(1, st.twA + dt * 1.6);
  st.flA += ((released ? 0.55 : 0.12) * st.air - st.flA) * Math.min(1, dt * 5);
  const p = st.a, pos = st.p;
  let bx = st.ar[0], by = st.ar[1], bz = st.ar[2];
  for (let k = NP - 1; k >= 0; k--) {
    const k0 = k > 0 ? k - 1 : k, k1 = k < NP - 1 ? k + 1 : k;
    let tx = pos[k1 * 3] - pos[k0 * 3], ty = pos[k1 * 3 + 1] - pos[k0 * 3 + 1], tz = pos[k1 * 3 + 2] - pos[k0 * 3 + 2];
    let tl = Math.hypot(tx, ty, tz);
    if (tl < 1e-4) { tx = 0; ty = 1; tz = 0; tl = 1; }
    tx /= tl; ty /= tl; tz /= tl;
    const d = bx * tx + by * ty + bz * tz;
    bx -= d * tx; by -= d * ty; bz -= d * tz;
    let bl = Math.hypot(bx, by, bz);
    if (bl < 1e-3) { bx = tz; by = 0; bz = -tx; bl = Math.hypot(bx, bz) || 1; }
    bx /= bl; by /= bl; bz /= bl;
    if (k === NP - 1) st.ar = [bx, by, bz];
    const s01 = (NP - 1 - k) / (NP - 1);
    const phi = st.tw * st.twA * s01 * 2.2 + st.flA * Math.sin(t * 8.5 + st.ph + k * 0.75);
    const c = Math.cos(phi), s = Math.sin(phi);
    const cx = ty * bz - tz * by, cy = tz * bx - tx * bz, cz = tx * by - ty * bx;
    p[k * 3] = bx * c + cx * s; p[k * 3 + 1] = by * c + cy * s; p[k * 3 + 2] = bz * c + cz * s;
  }
}

// shade lookup (no string building per segment)
const SHADE_N = 48;
const BLK = Array.from({ length: SHADE_N + 1 }, (_, i) => `rgba(0,0,0,${(i / SHADE_N).toFixed(3)})`);
const BACKC = Array.from({ length: SHADE_N + 1 }, (_, i) => { const b = i / SHADE_N; return `rgb(${(250 * b) | 0},${(249 * b) | 0},${(244 * b) | 0})`; });
const segOrder: number[] = [], segDepth = new Float32Array(NS * NP * 6);

function drawStrips(g: CanvasRenderingContext2D, strips: Strip[], img: HTMLCanvasElement, d: number, ox: number, oy: number) {
  let n = 0;
  segOrder.length = 0;
  for (let si = 0; si < strips.length; si++) {
    const st = strips[si], p = st.p, a = st.a, pr = st.pr;
    for (let k = 0; k < NP; k++) {
      const o = k * 3, x = p[o], y = p[o + 1], z = p[o + 2], ax = a[o] * HWID, ay = a[o + 1] * HWID, az = a[o + 2] * HWID;
      projTo(x - ax, y - ay, z - az, pr, k * 5);
      projTo(x + ax, y + ay, z + az, pr, k * 5 + 2);
      pr[k * 5 + 4] = (y - YC) * SPT + (-x * SYW + z * CYW) * CPT;
    }
    for (let k = 0; k < NP - 1; k++) {
      if (p[k * 3 + 1] > EXY + 0.05 && p[(k + 1) * 3 + 1] > EXY + 0.05) continue;
      segDepth[si * NP + k] = (pr[k * 5 + 4] + pr[(k + 1) * 5 + 4]) * 0.5;
      segOrder.push(si * NP + k); n++;
    }
  }
  if (!n) return;
  segOrder.sort((A, B) => segDepth[A] - segDepth[B]);
  const tw = (SWD - 0.5) * TEXK, th = DS * TEXK;
  for (let s = 0; s < n; s++) {
    const id = segOrder[s], si = (id / NP) | 0, k = id - si * NP;
    const st = strips[si], pr = st.pr, p = st.p, a = st.a;
    const o1 = (k + 1) * 5, o0 = k * 5;
    const Ox = pr[o1], Oy = pr[o1 + 1];
    const Xx = pr[o1 + 2] - Ox, Xy = pr[o1 + 3] - Oy, Yx = pr[o0] - Ox, Yy = pr[o0 + 1] - Oy;
    const cr = Xx * Yy - Xy * Yx;
    // lighting: normal = across x tangent, flipped toward the viewer
    const i0 = k * 3, i1 = i0 + 3;
    let tx = p[i1] - p[i0], ty = p[i1 + 1] - p[i0 + 1], tz = p[i1 + 2] - p[i0 + 2];
    const tl = Math.hypot(tx, ty, tz) || 1; tx /= tl; ty /= tl; tz /= tl;
    const ax = a[i0] + a[i1], ay = a[i0 + 1] + a[i1 + 1], az = a[i0 + 2] + a[i1 + 2];
    let nx = ay * tz - az * ty, ny = az * tx - ax * tz, nz = ax * ty - ay * tx;
    const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
    if (nx * VD[0] + ny * VD[1] + nz * VD[2] < 0) { nx = -nx; ny = -ny; nz = -nz; }
    const lam = Math.max(0, nx * LK[0] + ny * LK[1] + nz * LK[2]);
    const ym = (p[i0 + 1] + p[i1 + 1]) * 0.5;
    let b = (0.8 + 0.2 * lam) * (0.88 + 0.12 * clamp((ym - FLOOR) / 70, 0, 1));
    b *= 1 - 0.28 * clamp((ym - (EXY - 26)) / 26, 0, 1);
    g.setTransform(d * Xx, d * Xy, d * Yx, d * Yy, d * (Ox + ox), d * (Oy + oy));
    if (cr > 0) {
      g.drawImage(img, (st.i * SWD + 0.25) * TEXK, (SH - (k + 1) * DS) * TEXK, tw, th, 0, 0, 1, 1.08);
      const sh = Math.round((1 - b) * SHADE_N);
      if (sh > 0) { g.fillStyle = BLK[clamp(sh, 0, SHADE_N)]; g.fillRect(0, 0, 1, 1.08); }
    } else {
      g.fillStyle = BACKC[clamp(Math.round(b * SHADE_N), 0, SHADE_N)];
      g.fillRect(0, 0, 1, 1.08);
    }
  }
  g.setTransform(d, 0, 0, d, 0, 0);
}

/* ------------------------------------------------------------------ */
/* the sheet: a bent mesh standing in the throat                        */
/* ------------------------------------------------------------------ */
const PC = 8, PR = 14;
const LEAN = (() => {
  const y = new Float32Array(SH + 12), z = new Float32Array(SH + 12);
  let yy = 0, zz = 0;
  for (let v = 0; v < SH + 12; v++) { y[v] = yy; z[v] = zz; const th = 0.03 + 0.2 * Math.pow(v / SH, 1.5); yy += Math.cos(th); zz -= Math.sin(th); }
  return { y, z };
})();
const leanAt = (v: number): P2 => {
  if (v <= 0) return [v, 0];
  const i = Math.min(SH + 10, Math.floor(v)), t = v - i;
  return [LEAN.y[i] + (LEAN.y[i + 1] - LEAN.y[i]) * t, LEAN.z[i] + (LEAN.z[i + 1] - LEAN.z[i]) * t];
};
const MX = new Float32Array((PR + 1) * (PC + 1)), MY = new Float32Array((PR + 1) * (PC + 1)), MB = new Float32Array((PR + 1) * (PC + 1)), MTEX = new Float32Array(PR + 1);
const tmp2 = new Float32Array(2);

type Paper = { mode: "in" | "on" | "out"; t: number; e: number; F: { x: number; y: number; w: number; h: number }; done: boolean };
type Scene = {
  T: number; strips: Strip[]; L: number; feeding: boolean; released: boolean; simT: number; acc: number;
  rec: Float32Array | null; recT: Float32Array; recL: Float32Array; recN: number; recNext: number; recOn: boolean;
  play: { t: number; D: number; T0: number } | null;
  H: Float32Array; Hb: Float32Array; paper: Paper | null;
  motor: number; motorT: number; motorOffAt: number; dir: number; rot: number; jolt: number;
  led: V3; armed: number; armedT: number; pileA: number; pileFade: number;
  hv: P2; bv: P2; mOff: P2; ow: number; oh: number; ovDirty: boolean; pileHas: boolean;
};
const newScene = (): Scene => ({
  T: 0, strips: [], L: 0, feeding: false, released: false, simT: 0, acc: 0,
  rec: null, recT: new Float32Array(MAXF), recL: new Float32Array(MAXF), recN: 0, recNext: 0, recOn: false,
  play: null, H: new Float32Array(HNX * HNZ).fill(FLOOR), Hb: new Float32Array(HNX * HNZ).fill(FLOOR), paper: null,
  motor: 0, motorT: 0, motorOffAt: 0, dir: 1, rot: 0, jolt: 0,
  led: [48, 209, 88], armed: 0, armedT: 0, pileA: 1, pileFade: -1,
  hv: [0, 0], bv: [0, 0], mOff: [0, 0], ow: 0, oh: 0, ovDirty: false, pileHas: false,
});

function drawPaper(g: CanvasRenderingContext2D, s: Scene, pp: Paper, img: HTMLCanvasElement, d: number) {
  const e = pp.e, Lrem = SH - s.L, texBot = Math.min(SH, Lrem + 6 * clamp(Lrem / 8, 0, 1));
  if (texBot <= 0.3) return;
  const ox = s.mOff[0] + s.hv[0], oy = s.mOff[1] + s.hv[1];
  const { x: fx, y: fy, w: fw, h: fh } = pp.F;
  const jd = s.motor * 0.22 * Math.sin(s.T * 97);
  // vertices: morph between the flat card-facing sheet and the bent sheet in 3D
  for (let r = 0; r <= PR; r++) {
    const tex = (texBot * r) / PR, v = Lrem - tex;
    MTEX[r] = tex;
    const [ly, lz] = leanAt(v);
    const vp = Math.max(0, v), bowK = Math.min(1, vp / 40), v2 = (vp / SH) ** 2;
    const flut = s.motor * 0.9 * Math.sin(s.T * 39 + r * 0.3) * v2;
    const th = 0.03 + 0.2 * Math.pow(vp / SH, 1.5);
    for (let c = 0; c <= PC; c++) {
      const u = -SW / 2 + (SW * c) / PC, uu = (2 * u) / SW, id = r * (PC + 1) + c;
      const z = SZ + lz + bowK * 2.4 * (1 - uu * uu) - 2.4 * uu * uu * v2 + flut * (0.6 + 0.4 * uu);
      projTo(u + jd, HTOP + ly, z, tmp2, 0);
      const px = tmp2[0] + ox, py = tmp2[1] + oy;
      const qx = fx + (c / PC) * fw, qy = fy + (tex / SH) * fh;
      MX[id] = qx + (px - qx) * e; MY[id] = qy + (py - qy) * e;
      // matte paper: Lambert on the bent normal, dark inside the throat
      const dzdu = -bowK * 2.4 * 2 * uu * (2 / SW) - 2.4 * 2 * uu * v2 * (2 / SW);
      const n = nrm3([-dzdu, Math.sin(th), Math.cos(th)]);
      const lam = Math.max(0, dot3(n, LK));
      let b = 0.9 + 0.12 * lam;
      b *= 1 - 0.75 * clamp((4 - v) / 9, 0, 1);
      MB[id] = Math.min(1, b);
    }
  }
  g.setTransform(d, 0, 0, d, 0, 0);
  g.save();
  // everything below the front lip of the throat is inside the machine
  const la = P(-TL, HTOP, SZ + TFRONT), lb = P(TL, HTOP, SZ + TFRONT);
  const k = (lb[1] - la[1]) / (lb[0] - la[0]);
  const yAt = (x: number) => oy + la[1] + k * (x - ox - la[0]);
  g.beginPath(); g.moveTo(-20, -20); g.lineTo(s.ow + 20, -20); g.lineTo(s.ow + 20, yAt(s.ow + 20)); g.lineTo(-20, yAt(-20)); g.closePath(); g.clip();
  // its shadow on the top of the head, behind the slot
  if (e > 0.01) {
    const vis = Math.min(1, Lrem / 40) * e * 0.4;
    if (vis > 0.01) {
      const q = [P(-SW / 2 + 6, HTOP, SZ - 2), P(SW / 2 + 12, HTOP, SZ - 2), P(SW / 2 + 20, HTOP, SZ - TBACK - 16), P(-SW / 2 + 14, HTOP, SZ - TBACK - 16)].map(([x, y]) => [x + ox, y + oy] as P2);
      const a = P(0, HTOP, SZ - 2), b = P(0, HTOP, SZ - TBACK - 16);
      const gr = g.createLinearGradient(a[0] + ox, a[1] + oy, b[0] + ox, b[1] + oy);
      gr.addColorStop(0, `rgba(0,0,0,${vis})`); gr.addColorStop(1, "rgba(0,0,0,0)");
      poly(g, q); g.fillStyle = gr; g.fill();
    }
  }
  // outline (soft separation from the white card)
  const outline = () => {
    g.beginPath();
    for (let r = 0; r <= PR; r++) { const id = r * (PC + 1); if (r === 0) g.moveTo(MX[id], MY[id]); else g.lineTo(MX[id], MY[id]); }
    for (let c = 1; c <= PC; c++) { const id = PR * (PC + 1) + c; g.lineTo(MX[id], MY[id]); }
    for (let r = PR - 1; r >= 0; r--) { const id = r * (PC + 1) + PC; g.lineTo(MX[id], MY[id]); }
    for (let c = PC - 1; c > 0; c--) g.lineTo(MX[c], MY[c]);
    g.closePath();
  };
  g.save();
  g.shadowColor = `rgba(0,0,0,${0.2 - 0.1 * e})`; g.shadowBlur = (20 - 8 * e) * d; g.shadowOffsetY = (12 - 6 * e) * d;
  outline(); g.fillStyle = "#fff"; g.fill();
  g.restore();
  const cw = (SW / PC) * TEXK;
  for (let r = 0; r < PR; r++) {
    const t0 = MTEX[r], t1 = MTEX[r + 1];
    for (let c = 0; c < PC; c++) {
      const id = r * (PC + 1) + c;
      const Ox = MX[id], Oy = MY[id];
      g.setTransform(d * (MX[id + 1] - Ox), d * (MY[id + 1] - Oy), d * (MX[id + PC + 1] - Ox), d * (MY[id + PC + 1] - Oy), d * Ox, d * Oy);
      g.drawImage(img, c * cw, t0 * TEXK, cw, (t1 - t0) * TEXK, 0, 0, 1.04, 1.04);
    }
  }
  g.setTransform(d, 0, 0, d, 0, 0);
  // smooth light falloff along the bend and into the throat (one gradient, no per-cell banding)
  if (e > 0.01) {
    const cm = PC >> 1, top = cm, bot = PR * (PC + 1) + cm;
    if (Math.hypot(MX[bot] - MX[top], MY[bot] - MY[top]) > 1) {
      const gr = g.createLinearGradient(MX[top], MY[top], MX[bot], MY[bot]);
      for (let r = 0; r <= PR; r++) gr.addColorStop(r / PR, `rgba(0,0,0,${((1 - MB[r * (PC + 1) + cm]) * e).toFixed(3)})`);
      outline(); g.fillStyle = gr; g.fill();
    }
  }
  outline(); g.strokeStyle = "rgba(0,0,0,0.08)"; g.lineWidth = 0.8; g.stroke();
  g.restore();
}

/* ------------------------------------------------------------------ */
/* small DOM bits                                                       */
/* ------------------------------------------------------------------ */
function FileIcon({ d }: { d: Doc }) {
  return (
    <svg width="26" height="32" viewBox="0 0 26 32" className="flex-none" aria-hidden="true">
      <path d="M3.5 1h13L24 8.5V28a3 3 0 0 1-3 3H3.5a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3z" fill="#fff" stroke="#d2d2d7" />
      <path d="M16.5 1v5.5a2 2 0 0 0 2 2H24" fill="#f2f2f5" stroke="#d2d2d7" />
      <rect x="0.5" y="18" width="20" height="9" rx="2.5" fill={d.color} />
      <text x="10.5" y="24.6" textAnchor="middle" fontSize="6.2" fontWeight="700" fill="#fff" style={{ letterSpacing: ".02em" }}>{d.label}</text>
    </svg>
  );
}

function Toast({ name, onUndo }: { name: string; onUndo: () => void }) {
  const [left, setLeft] = useState(5);
  useEffect(() => {
    const t0 = performance.now();
    const id = setInterval(() => setLeft(Math.max(0, 5 - Math.floor((performance.now() - t0) / 1000))), 200);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.div
      initial={{ y: 26, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 18, opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 520, damping: 26 }}
      className="absolute bottom-3 left-1/2 z-50 flex max-w-[calc(100%-24px)] items-center gap-2.5 whitespace-nowrap rounded-full bg-[#1d1d1f] py-1.5 pl-2 pr-1.5 text-[13px] text-white shadow-[0_14px_30px_-12px_rgba(0,0,0,.55)]"
      style={{ x: "-50%" }}
    >
      <span className="relative flex h-[22px] w-[22px] flex-none items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 22 22" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="11" cy="11" r="9" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="2" />
          <motion.circle cx="11" cy="11" r="9" fill="none" stroke="#2997ff" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 1 }} animate={{ pathLength: 0 }} transition={{ duration: 5, ease: "linear" }} />
        </svg>
        <span className="text-[10px] font-semibold tabular-nums">{left}</span>
      </span>
      <span className="min-w-0 truncate">Deleted <span className="font-semibold">{name}</span></span>
      <span className="text-white/40" aria-hidden="true">·</span>
      <button type="button" onClick={onUndo} className="rounded-full px-2.5 py-1 font-semibold text-[#2997ff] outline-none transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2997ff]">Undo</button>
    </motion.div>
  );
}

type RowMv = { x: MotionValue<number>; y: MotionValue<number>; r: MotionValue<number>; s: MotionValue<number> };
type Layers = { shadow: HTMLCanvasElement; back: HTMLCanvasElement; front: HTMLCanvasElement; head: HTMLCanvasElement; pile: HTMLCanvasElement };

export interface ShredderDeleteProps {
  /**
   * Shreds a file by itself, undoes it, then shreds another, until the visitor touches it. A small
   * Auto switch in the card turns it back on or off. Off by default, so a copied component reacts only to the visitor.
   */
  autoplay?: boolean;
  /**
   * Plays the shredder: a motor that follows the machine's speed, cutters that chew while paper goes
   * through and strips rustling into the bin. It follows the site-wide sound switch (setSoundsEnabled),
   * stays silent until the visitor has clicked or pressed a key once on the page, and mutes while the
   * card is off screen or the tab is hidden. Pass false to silence this component.
   */
  enableSound?: boolean;
  /** How loud the shredder is, 0 to 1. */
  volume?: number;
  /** Extra classes for the outer card. */
  className?: string;
}

/**
 * Delete files by feeding them to an office shredder. Drag a document row onto
 * the machine (or focus it and press Delete): it becomes a printed sheet that
 * the cutters pull down through the throat, and it comes out underneath as
 * thin curling strips that flutter into the smoked bin and pile up. Undo within
 * five seconds runs the machine in reverse and the row springs back.
 *
 * It sounds like one too, and the sound is driven by the machine, not played over it: the motor's pitch
 * follows its speed, the cutters chew only while paper is in them, and the strips rustle while they fall.
 */
export function ShredderDelete({ autoplay = false, enableSound = true, volume = 0.7, className = "" }: ShredderDeleteProps) {
  const [docs, setDocs] = useState<Doc[]>(ALL);
  const docsRef = useRef(docs);
  useLayoutEffect(() => {
    docsRef.current = docs;
  }, [docs]);
  const [ghost, setGhost] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [sheetDoc, setSheetDoc] = useState<Doc | null>(null);
  const [toast, setToast] = useState<{ key: number; name: string } | null>(null);
  const [status, setStatus] = useState("");
  // the demo: starts from `autoplay`, ends the moment the visitor touches the card, and the Auto switch turns it back on
  const reduce = useReducedMotion();
  const wantAuto = autoplay && !reduce;
  const [auto, setAuto] = useState(wantAuto);
  const [seenAuto, setSeenAuto] = useState(wantAuto);
  if (seenAuto !== wantAuto) {
    setSeenAuto(wantAuto);
    setAuto(wantAuto);
  }

  const root = useRef<HTMLDivElement>(null);
  const mcan = useRef<HTMLCanvasElement>(null);
  const ocan = useRef<HTMLCanvasElement>(null);
  const sheetEl = useRef<HTMLDivElement | null>(null);
  const domVis = useRef(true);
  const src = useRef<HTMLCanvasElement | null>(null);
  const layers = useRef<Layers | null>(null);
  const rowEls = useRef(new Map<string, HTMLLIElement>());
  // every row's motion values, made once: the list is fixed, rows only come and go
  const [rowMvs] = useState(() => new Map<string, RowMv>(ALL.map((d) => [d.id, { x: motionValue(0), y: motionValue(0), r: motionValue(0), s: motionValue(1) }])));
  const touched = useRef(false);
  const alive = useRef(true);
  const busy = useRef(false);
  const pending = useRef<{ doc: Doc } | null>(null);
  const finalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const ctls = useRef(new Set<AnimationPlaybackControls>());
  // false while hydrating, true after: rows that come back later fade in, the first ones are simply there
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const toastKey = useRef(0);
  const S = useRef<Scene>(newScene());
  const waiters = useRef(new Map<string, (() => void)[]>());
  const raf = useRef(0);
  const last = useRef(0);
  const dpr = useRef(1);
  // sound: one engine per card, made on the visitor's first click or key press
  const snd = useRef<ShredderSound | null>(null);
  const inView = useRef(true);
  const autoSoundOk = useAutoplaySoundAllowed();
  const soundCfg = useRef({ enableSound, volume, autoSoundOk });
  useEffect(() => {
    soundCfg.current = { enableSound, volume, autoSoundOk };
  }, [enableSound, volume, autoSoundOk]);

  // DOM sheet (row -> page morph) motion values
  const sx = useMotionValue(0), sy = useMotionValue(0), sw = useMotionValue(SW), sh = useMotionValue(SH);
  const srad = useMotionValue(3), face = useMotionValue(1), srot = useMotionValue(0);
  const faceRow = useTransform(face, [0, 0.45], [1, 0]);
  const facePaper = useTransform(face, [0.2, 0.85], [0, 1]);
  const sheetRadius = useTransform(srad, (v) => `${v}px`);

  // ---------- sound ----------
  /** Whether the shredder may make sound right now: asked for, switched on, on screen, and (for the demo) allowed. */
  const soundOn = () => {
    const c = soundCfg.current;
    if (!c.enableSound || !getSoundsEnabled() || document.hidden || !inView.current) return false;
    // the demo plays itself: it stays quiet where the site mutes demos, and until the visitor has used the page
    return touched.current || c.autoSoundOk;
  };
  /** Makes the engine. Browsers only allow audio after a click or key press; the demo may start it once the visitor has used the page. */
  const wake = (gesture: boolean) => {
    if (snd.current) { snd.current.wake(); return; }
    if (!soundCfg.current.enableSound) return;
    if (!gesture && !navigator.userActivation?.hasBeenActive) return;
    snd.current = createShredderSound(soundCfg.current.volume);
    snd.current?.wake();
  };
  const sfx = (name: ShredderHit) => {
    if (!soundOn()) return;
    wake(false);
    const e = snd.current;
    if (e && e.awake()) e.hit(name);
  };
  /** The sound of this frame, from what the machine is doing: called once per animation frame, so it stays in step with the picture. */
  const soundFrame = (s: Scene) => {
    const e = snd.current;
    if (!e) return;
    let fl = 0;
    for (const st of s.strips) if (!st.sleep && st.air > 0.04) fl++;
    const rustle = s.play ? 0.5 : s.strips.length ? Math.min(1, fl / (s.strips.length * 0.6)) : 0;
    e.frame(
      { motor: s.motor, dir: s.dir, paper: s.play ? 0.85 : s.feeding ? 1 : 0, rustle, progress: s.play ? 1 - s.L / SH : s.L / SH },
      soundOn() && e.awake(),
    );
  };

  const mv = (id: string): RowMv => rowMvs.get(id)!;
  const anim = (v: MotionValue<number>, to: number | number[], t: ValueAnimationTransition<number>) => {
    const c = animate(v, to as number, t);
    ctls.current.add(c);
    return new Promise<void>((res) => c.then(() => { ctls.current.delete(c); res(); }));
  };
  const wait = (ms: number) => new Promise<void>((res) => { const id = setTimeout(() => { timers.current.delete(id); res(); }, ms); timers.current.add(id); });
  const nextFrame = () => new Promise<void>((res) => requestAnimationFrame(() => requestAnimationFrame(() => res())));
  const until = (ev: string) => new Promise<void>((res) => { const l = waiters.current.get(ev) ?? []; l.push(res); waiters.current.set(ev, l); });
  const fire = (ev: string) => { const l = waiters.current.get(ev); if (!l) return; waiters.current.delete(ev); l.forEach((f) => f()); };
  const scale = () => { const r = root.current; return r ? r.getBoundingClientRect().width / r.offsetWidth || 1 : 1; };
  const rel = (el: Element) => {
    const rr = root.current!.getBoundingClientRect(), r = el.getBoundingClientRect(), s = scale();
    return { x: (r.left - rr.left) / s, y: (r.top - rr.top) / s, w: r.width / s, h: r.height / s };
  };
  const measure = () => {
    const m = rel(mcan.current!);
    S.current.mOff = [m.x, m.y];
    const pc = P(0, HTOP, SZ);
    const slot = { x: m.x + pc[0], y: m.y + pc[1] };
    return { slot, m, F: { x: Math.round(slot.x - SW / 2), y: Math.round(slot.y - SH - 16), w: SW, h: SH } };
  };

  // ---------- simulation ----------
  const recordFrame = (s: Scene) => {
    if (!s.rec || s.recN >= MAXF) { s.recOn = false; return; }
    const f = s.recN, base = f * NS * NP * 6;
    for (let i = 0; i < s.strips.length; i++) {
      const st = s.strips[i], o = base + i * NP * 6;
      for (let k = 0; k < NP; k++) {
        const j = o + k * 6;
        s.rec[j] = st.p[k * 3]; s.rec[j + 1] = st.p[k * 3 + 1]; s.rec[j + 2] = st.p[k * 3 + 2];
        s.rec[j + 3] = st.a[k * 3]; s.rec[j + 4] = st.a[k * 3 + 1]; s.rec[j + 5] = st.a[k * 3 + 2];
      }
    }
    s.recT[f] = s.simT; s.recL[f] = s.L; s.recN++;
  };
  const applyRec = (s: Scene, tau: number) => {
    const rec = s.rec;
    if (!rec || s.recN < 1) return;
    let f = Math.max(0, s.recN - 2);
    while (f > 0 && s.recT[f] > tau) f--;
    const f1 = Math.min(s.recN - 1, f + 1);
    const t0 = s.recT[f], t1 = s.recT[f1];
    const al = t1 > t0 ? clamp((tau - t0) / (t1 - t0), 0, 1) : 0;
    s.L = s.recL[f] + (s.recL[f1] - s.recL[f]) * al;
    for (let i = 0; i < s.strips.length; i++) {
      const st = s.strips[i], b0 = (f * NS + i) * NP * 6, b1 = (f1 * NS + i) * NP * 6;
      for (let k = 0; k < NP; k++) {
        const j0 = b0 + k * 6, j1 = b1 + k * 6, o = k * 3;
        for (let c = 0; c < 3; c++) st.p[o + c] = rec[j0 + c] + (rec[j1 + c] - rec[j0 + c]) * al;
        let ax = rec[j0 + 3] + (rec[j1 + 3] - rec[j0 + 3]) * al, ay = rec[j0 + 4] + (rec[j1 + 4] - rec[j0 + 4]) * al, az = rec[j0 + 5] + (rec[j1 + 5] - rec[j0 + 5]) * al;
        const l = Math.hypot(ax, ay, az) || 1; ax /= l; ay /= l; az /= l;
        st.a[o] = ax; st.a[o + 1] = ay; st.a[o + 2] = az;
      }
    }
  };

  const simStep = (s: Scene, h: number) => {
    if (s.feeding) {
      s.L += FEED * s.motor * h * (1 + 0.1 * Math.sin(s.simT * 71) + 0.06 * Math.sin(s.simT * 163 + 1));
      if (s.L >= SH) { s.L = SH; s.feeding = false; s.released = true; s.paper = null; s.ovDirty = true; fire("consumed"); sfx("done"); }
    }
    s.simT += h;
    const L = s.L, rel2 = s.released, damp = Math.exp(-h * 2.5), hh = h * h;
    for (const st of s.strips) {
      if (st.sleep) continue;
      const p = st.p, q = st.q, a = st.a, f = st.f;
      f.fill(0);
      const inside = (k: number) => !rel2 && k * DS > L;
      let sp = 0, nf = 0;
      for (let k = 0; k < NP; k++) if (!inside(k)) { const o = k * 3; sp += Math.hypot(p[o] - q[o], p[o + 1] - q[o + 1], p[o + 2] - q[o + 2]); nf++; }
      st.air = nf ? Math.min(1, sp / nf / h / 110) : 0;
      // curl: a bending moment about the across axis (net force zero)
      for (let k = 1; k < NP - 1; k++) {
        if (!rel2 && L - k * DS < 7) continue;
        const o = k * 3, om = o - 3, op = o + 3;
        let tx = p[op] - p[om], ty = p[op + 1] - p[om + 1], tz = p[op + 2] - p[om + 2];
        const tl = Math.hypot(tx, ty, tz) || 1; tx /= tl; ty /= tl; tz /= tl;
        const ax = a[o], ay = a[o + 1], az = a[o + 2];
        let nx = ay * tz - az * ty, ny = az * tx - ax * tz, nz = ax * ty - ay * tx;
        const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
        const c = st.curl * (k < 4 ? 2.2 - k * 0.3 : 1);
        f[o] += c * nx; f[o + 1] += c * ny; f[o + 2] += c * nz;
        f[om] -= 0.5 * c * nx; f[om + 1] -= 0.5 * c * ny; f[om + 2] -= 0.5 * c * nz;
        f[op] -= 0.5 * c * nx; f[op + 1] -= 0.5 * c * ny; f[op + 2] -= 0.5 * c * nz;
      }
      const fl = (rel2 ? 190 : 150) * st.air, fan = rel2 ? 0 : 60 * (st.ex / (SW / 2));
      for (let k = 0; k < NP; k++) {
        const o = k * 3;
        if (inside(k)) {
          const y = EXY + (k * DS - L);
          p[o] = st.ex; p[o + 1] = y; p[o + 2] = st.ez;
          q[o] = st.ex; q[o + 1] = y + FEED * s.motor * h; q[o + 2] = st.ez;
          continue;
        }
        const fx = fl * Math.sin(s.simT * 7.7 + st.ph + k * 0.6), fz = fl * Math.cos(s.simT * 5.3 + st.ph * 1.7 + k * 0.5);
        const vx = (p[o] - q[o]) * damp, vy = (p[o + 1] - q[o + 1]) * damp, vz = (p[o + 2] - q[o + 2]) * damp;
        q[o] = p[o]; q[o + 1] = p[o + 1]; q[o + 2] = p[o + 2];
        p[o] += vx + (f[o] + fx + fan) * hh; p[o + 1] += vy + (f[o + 1] - G) * hh; p[o + 2] += vz + (f[o + 2] + fz) * hh;
      }
      for (let it = 0; it < 4; it++) {
        for (let k = 0; k < NP - 1; k++) {
          const w0 = inside(k) ? 0 : 1, w1 = inside(k + 1) ? 0 : 1;
          if (!w0 && !w1) continue;
          const o = k * 3, o1 = o + 3;
          const dx = p[o1] - p[o], dy = p[o1 + 1] - p[o + 1], dz = p[o1 + 2] - p[o + 2];
          const len = Math.hypot(dx, dy, dz) || 1e-6, df = (len - DS) / len / (w0 + w1);
          p[o] += dx * df * w0; p[o + 1] += dy * df * w0; p[o + 2] += dz * df * w0;
          p[o1] -= dx * df * w1; p[o1 + 1] -= dy * df * w1; p[o1 + 2] -= dz * df * w1;
        }
        for (let k = 0; k < NP - 2; k++) {
          const w0 = inside(k) ? 0 : 1, w1 = inside(k + 2) ? 0 : 1;
          if (!w0 && !w1) continue;
          const o = k * 3, o2 = o + 6;
          const dx = p[o2] - p[o], dy = p[o2 + 1] - p[o + 1], dz = p[o2 + 2] - p[o + 2];
          const len = Math.hypot(dx, dy, dz) || 1e-6, mn = DS * 1.86;
          if (len >= mn) continue;
          const df = ((len - mn) / len / (w0 + w1)) * 0.5;
          p[o] += dx * df * w0; p[o + 1] += dy * df * w0; p[o + 2] += dz * df * w0;
          p[o2] -= dx * df * w1; p[o2 + 1] -= dy * df * w1; p[o2 + 2] -= dz * df * w1;
        }
        for (let k = 0; k < NP; k++) {
          if (inside(k)) continue;
          const o = k * 3;
          if (p[o] < -XI) { p[o] = -XI; q[o] = p[o]; } else if (p[o] > XI) { p[o] = XI; q[o] = p[o]; }
          if (p[o + 2] < -ZI) { p[o + 2] = -ZI; q[o + 2] = p[o + 2]; } else if (p[o + 2] > ZI) { p[o + 2] = ZI; q[o + 2] = p[o + 2]; }
          const fy = hAt(s.H, p[o], p[o + 2]) + 0.9;
          if (p[o + 1] < fy) {
            p[o + 1] = fy;
            q[o] = p[o] - (p[o] - q[o]) * 0.55; q[o + 2] = p[o + 2] - (p[o + 2] - q[o + 2]) * 0.55;
          }
          if (p[o + 1] > EXY - 0.3) p[o + 1] = EXY - 0.3;
        }
      }
      if (rel2) {
        let mx = 0;
        for (let k = 0; k < NP * 3; k++) mx = Math.max(mx, Math.abs(p[k] - q[k]));
        st.still = mx < 0.014 ? st.still + h : 0;
        if (st.still > 0.3 || s.simT > 7.2) { st.sleep = true; q.set(p); stamp(s.H, st); }
      }
    }
    if (s.recOn && s.simT >= s.recNext) {
      recordFrame(s); s.recNext += 1 / 30;
      if (s.released && s.strips.every((st) => st.sleep)) s.recOn = false;
    }
  };

  // ---------- frame ----------
  const update = (dt: number) => {
    const s = S.current;
    s.T += dt;
    if (s.motorOffAt && s.T >= s.motorOffAt) { s.motorT = 0; s.motorOffAt = 0; }
    s.motor += (s.motorT - s.motor) * (1 - Math.exp(-dt * (s.motorT > s.motor ? 14 : 6)));
    if (Math.abs(s.motor - s.motorT) < 0.004) s.motor = s.motorT;
    s.rot += dt * s.motor * s.dir * 24;
    s.jolt *= Math.exp(-dt * 16);
    if (s.jolt < 0.01) s.jolt = 0;
    const amp = 0.55 * s.motor, T = s.T;
    s.hv = s.motor > 0 || s.jolt > 0
      ? [amp * (0.6 * Math.sin(T * 184) + 0.4 * Math.sin(T * 296 + 1.3)), amp * 0.5 * Math.sin(T * 237 + 0.4) + s.jolt * 0.9 * Math.sin(T * 60)]
      : [0, 0];
    s.bv = [s.hv[0] * 0.3, s.hv[1] * 0.25];
    // LED: green ready, amber shredding, blue reversing
    const tgt: V3 = s.motorT > 0 ? (s.dir > 0 ? [255, 159, 10] : [10, 132, 255]) : [48, 209, 88];
    const kk = 1 - Math.exp(-dt * 10);
    let ledMoving = false;
    for (let i = 0; i < 3; i++) { s.led[i] += (tgt[i] - s.led[i]) * kk; if (Math.abs(tgt[i] - s.led[i]) > 0.6) ledMoving = true; else s.led[i] = tgt[i]; }
    s.armed += (s.armedT - s.armed) * (1 - Math.exp(-dt * 14));
    if (Math.abs(s.armed - s.armedT) < 0.003) s.armed = s.armedT;
    // sheet morphs
    const pp = s.paper;
    if (pp) {
      if (pp.done) { s.paper = null; s.ovDirty = true; }
      else if (pp.mode === "in") {
        if (pp.t === 0 && sheetEl.current) { domVis.current = false; sheetEl.current.style.visibility = "hidden"; }
        pp.t += dt;
        pp.e = easeIO(Math.min(1, pp.t / 0.36));
        if (pp.t >= 0.36) { pp.e = 1; pp.mode = "on"; fire("in"); }
      } else if (pp.mode === "out") {
        pp.t += dt;
        pp.e = 1 - easeIO(Math.min(1, pp.t / 0.3));
        if (pp.t >= 0.3) {
          pp.e = 0; pp.done = true;
          domVis.current = true;
          if (sheetEl.current) sheetEl.current.style.visibility = "visible";
          fire("out");
        }
      }
    }
    // strips
    if (s.play) {
      const pl = s.play;
      pl.t += dt;
      const k = Math.min(1, pl.t / pl.D);
      applyRec(s, pl.T0 * (1 - easeSine(k)));
      if (k >= 1) { s.play = null; s.strips = []; s.L = 0; fire("play"); }
    } else if (s.strips.length && (s.feeding || s.strips.some((st) => !st.sleep))) {
      s.acc += dt;
      const H = 1 / 120;
      while (s.acc >= H) { simStep(s, H); s.acc -= H; }
      for (const st of s.strips) if (!st.sleep) frameAcross(st, s.simT, dt, s.released);
    }
    if (s.pileFade >= 0) {
      s.pileFade += dt;
      const k = Math.min(1, s.pileFade / 0.7);
      s.pileA = 1 - easeIO(k);
      if (k >= 1) {
        s.pileFade = -1; s.pileA = 1; s.pileHas = false;
        const pg = layers.current?.pile.getContext("2d");
        if (pg) { pg.setTransform(1, 0, 0, 1, 0, 0); pg.clearRect(0, 0, layers.current!.pile.width, layers.current!.pile.height); }
        s.H.fill(FLOOR); s.Hb.fill(FLOOR);
        fire("empty");
      }
    }
    soundFrame(s);
    return s.motor > 0 || s.motorT > 0 || s.jolt > 0 || !!s.paper || !!s.play || s.pileFade >= 0 || ledMoving || s.armed !== s.armedT
      || s.feeding || s.strips.some((st) => !st.sleep) || s.ovDirty;
  };

  const renderMachine = () => {
    const c = mcan.current, Ls = layers.current;
    if (!c || !Ls) return;
    const g = c.getContext("2d");
    if (!g) return;
    const s = S.current, d = dpr.current, { CW, CH } = GEO;
    g.setTransform(d, 0, 0, d, 0, 0);
    g.clearRect(0, 0, CW, CH);
    g.drawImage(Ls.shadow, 0, 0, CW, CH);
    const [bx, by] = s.bv, [hx, hy] = s.hv;
    g.drawImage(Ls.back, bx, by, CW, CH);
    if (s.pileHas && s.pileA > 0) { g.globalAlpha = s.pileA; g.drawImage(Ls.pile, bx, by, CW, CH); g.globalAlpha = 1; }
    if (s.strips.length && src.current) drawStrips(g, s.strips, src.current, d, bx, by);
    g.drawImage(Ls.front, bx, by, CW, CH);
    g.drawImage(Ls.head, hx, hy, CW, CH);
    // live parts of the head: cutters, LED, sensor glow
    g.save();
    g.translate(hx, hy);
    g.save();
    poly(g, LIP); g.clip();
    g.lineWidth = 1.05;
    for (const cu of CUT) {
      const gl = Math.pow(Math.max(0, Math.sin(cu.x * 0.37 + s.rot * cu.s)), 10);
      const base = 0.5 + 0.5 * Math.sin(cu.x * 1.9 + cu.s);
      const b = Math.min(255, 60 + 120 * (0.25 + 0.35 * base) + 150 * gl) | 0;
      g.strokeStyle = `rgb(${b},${b},${Math.min(255, b + 8)})`;
      g.beginPath(); g.moveTo(cu.a[0], cu.a[1]); g.lineTo(cu.b[0], cu.b[1]); g.stroke();
    }
    g.restore();
    if (s.armed > 0.01) {
      g.globalCompositeOperation = "lighter";
      poly(g, LIP);
      g.strokeStyle = `rgba(41,151,255,${0.22 * s.armed})`; g.lineWidth = 6; g.stroke();
      g.strokeStyle = `rgba(80,170,255,${0.9 * s.armed})`; g.lineWidth = 1.2; g.stroke();
      g.globalCompositeOperation = "source-over";
    }
    const [lr, lg2, lb] = s.led;
    const I = s.motorT > 0 ? 0.9 + 0.1 * Math.sin(s.T * 14) : 0.75;
    g.translate(LED_C[0], LED_C[1]);
    g.scale(1, 0.62);
    g.globalCompositeOperation = "lighter";
    const glow = g.createRadialGradient(0, 0, 0, 0, 0, 15);
    glow.addColorStop(0, `rgba(${lr | 0},${lg2 | 0},${lb | 0},${0.5 * I})`); glow.addColorStop(1, `rgba(${lr | 0},${lg2 | 0},${lb | 0},0)`);
    g.fillStyle = glow; g.beginPath(); g.arc(0, 0, 15, 0, Math.PI * 2); g.fill();
    g.globalCompositeOperation = "source-over";
    const dome = g.createRadialGradient(-0.8, -1, 0.2, 0, 0, 3);
    dome.addColorStop(0, `rgb(${Math.min(255, lr + 120) | 0},${Math.min(255, lg2 + 120) | 0},${Math.min(255, lb + 120) | 0})`);
    dome.addColorStop(0.5, `rgb(${lr | 0},${lg2 | 0},${lb | 0})`); dome.addColorStop(1, `rgb(${(lr * 0.45) | 0},${(lg2 * 0.45) | 0},${(lb * 0.45) | 0})`);
    g.fillStyle = dome; g.beginPath(); g.arc(0, 0, 3, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,.85)"; g.beginPath(); g.arc(-1, -1.3, 0.75, 0, Math.PI * 2); g.fill();
    g.restore();
  };

  const renderOverlay = () => {
    const c = ocan.current, s = S.current;
    if (!c) return;
    const g = c.getContext("2d");
    if (!g) return;
    const pp = s.paper;
    if (!pp && !s.ovDirty) return;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, c.width, c.height);
    s.ovDirty = false;
    if (pp && src.current) { drawPaper(g, s, pp, src.current, dpr.current); s.ovDirty = true; }
  };

  const loop = (now: number) => {
    raf.current = 0;
    if (!alive.current) return;
    const dt = Math.min(1 / 30, Math.max(0, (now - last.current) / 1000));
    last.current = now;
    const more = update(dt);
    renderMachine();
    renderOverlay();
    if (more) raf.current = requestAnimationFrame(loop);
  };
  function kick() {
    if (raf.current || !alive.current) return;
    last.current = nowMs();
    raf.current = requestAnimationFrame(loop);
  }

  // ---------- actions ----------
  const bake = () => {
    const s = S.current, Ls = layers.current;
    if (!Ls || !src.current || !s.strips.length) return;
    const g = Ls.pile.getContext("2d");
    if (!g) return;
    g.setTransform(dpr.current, 0, 0, dpr.current, 0, 0);
    drawStrips(g, s.strips, src.current, dpr.current, 0, 0);
    s.pileHas = true;
  };
  const finalize = () => {
    if (finalTimer.current) { clearTimeout(finalTimer.current); finalTimer.current = null; }
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    setToast(null);
    const s = S.current;
    for (const st of s.strips) { if (!st.sleep) { st.sleep = true; st.q.set(st.p); } if (!st.stamped) stamp(s.H, st); }
    s.recOn = false;
    bake();
    s.Hb.set(s.H);
    s.strips = [];
    kick();
    setStatus(`${p.doc.name} was permanently deleted.`);
  };
  const emptyBin = () => {
    const s = S.current;
    if (!s.pileHas) { s.H.fill(FLOOR); s.Hb.fill(FLOOR); return Promise.resolve(); }
    s.pileFade = 0;
    kick();
    return until("empty");
  };

  const shred = async (id: string) => {
    if (busy.current || !alive.current) return;
    const el = rowEls.current.get(id), doc = docsRef.current.find((d) => d.id === id);
    if (!el || !doc || !root.current || !mcan.current) return;
    busy.current = true;
    if (pending.current) finalize();
    const { F } = measure();
    const r = rel(el);
    const m = mv(id);
    const idx = docsRef.current.findIndex((d) => d.id === id);
    const hadFocus = el.contains(document.activeElement);
    if (!src.current) src.current = document.createElement("canvas");
    paintDoc(src.current, doc, TEXK);
    // unrotated size, centred on the (possibly tilted) row; jump() so no stale velocity leaks into the springs
    const ow = el.offsetWidth, oh = el.offsetHeight;
    sx.jump(r.x + r.w / 2 - ow / 2); sy.jump(r.y + r.h / 2 - oh / 2); sw.jump(ow); sh.jump(oh); srad.jump(14); face.jump(0); srot.jump(m.r.get());
    domVis.current = true;
    if (sheetEl.current) sheetEl.current.style.visibility = "visible";
    setSheetDoc(doc);
    setDocs((ds) => ds.filter((d) => d.id !== id));
    setDragging(null);
    S.current.armedT = 0; kick();
    m.x.set(0); m.y.set(0); m.r.set(0);
    setStatus(`Shredding ${doc.name}`);
    if (hadFocus) requestAnimationFrame(() => {
      const rest = docsRef.current;
      const next = rest[Math.min(idx, rest.length - 1)];
      if (next) rowEls.current.get(next.id)?.focus();
    });
    const sp: ValueAnimationTransition<number> = { type: "spring", stiffness: 300, damping: 28, restDelta: 0.4, restSpeed: 10 };
    void anim(srad, 2, sp); void anim(srot, 0, { type: "spring", stiffness: 260, damping: 16, restDelta: 0.2, restSpeed: 4 });
    await Promise.all([
      anim(sx, F.x, sp), anim(sy, F.y, sp), anim(sw, F.w, sp), anim(sh, F.h, sp),
      anim(face, 1, { type: "spring", stiffness: 240, damping: 26, restDelta: 0.01, restSpeed: 0.1 }),
    ]);
    if (!alive.current) return;
    sx.jump(F.x); sy.jump(F.y); sw.jump(F.w); sh.jump(F.h); srot.jump(0);
    const s = S.current;
    if (!s.rec) s.rec = new Float32Array(MAXF * NS * NP * 6);
    s.strips = Array.from({ length: NS }, (_, i) => mkStrip(i));
    s.L = 0; s.released = false; s.feeding = false; s.simT = 0; s.acc = 0; s.recN = 0; s.recNext = 0; s.recOn = true; s.play = null;
    s.paper = { mode: "in", t: 0, e: 0, F, done: false };
    sfx("slide");
    kick();
    await until("in");
    if (!alive.current) return;
    setSheetDoc(null);
    // the sensor sees the sheet: motor bites
    s.dir = 1; s.motorT = 1; s.motorOffAt = 0; s.jolt = 1; s.feeding = true;
    sfx("bite");
    kick();
    await until("consumed");
    if (!alive.current) return;
    s.motorOffAt = s.T + 0.6;
    pending.current = { doc };
    toastKey.current += 1;
    setToast({ key: toastKey.current, name: doc.name });
    setStatus(`Deleted ${doc.name}. Undo is available for 5 seconds.`);
    finalTimer.current = setTimeout(() => { finalTimer.current = null; finalize(); }, 5000);
    busy.current = false;
  };

  const undo = async () => {
    const p = pending.current;
    if (!p || busy.current || !alive.current) return;
    busy.current = true;
    if (finalTimer.current) { clearTimeout(finalTimer.current); finalTimer.current = null; }
    pending.current = null;
    setToast(null);
    setStatus(`Restoring ${p.doc.name}`);
    const s = S.current;
    if (s.recOn || (s.recN > 0 && s.recT[s.recN - 1] < s.simT - 1e-4)) { if (s.recN < MAXF) recordFrame(s); }
    s.recOn = false;
    for (const st of s.strips) st.sleep = true;
    s.H.set(s.Hb);
    const { F } = measure();
    const T0 = s.recN ? s.recT[s.recN - 1] : 0;
    s.play = { t: 0, D: clamp(T0 / 2.1, 1.1, 2.0), T0 };
    s.paper = { mode: "on", t: 0, e: 1, F, done: false };
    s.dir = -1; s.motorT = 1; s.motorOffAt = 0; s.jolt = 0.6;
    sfx("bite-reverse");
    kick();
    await until("play");
    if (!alive.current) return;
    s.motorOffAt = s.T + 0.12;
    // get the DOM page ready (hidden) exactly where the canvas page will land
    sx.jump(F.x); sy.jump(F.y); sw.jump(F.w); sh.jump(F.h); srad.jump(2); face.jump(1); srot.jump(0);
    domVis.current = false;
    if (sheetEl.current) sheetEl.current.style.visibility = "hidden";
    setSheetDoc(p.doc);
    setDocs((ds) => {
      const keep = new Set(ds.map((d) => d.id)); keep.add(p.doc.id);
      return ALL.filter((d) => keep.has(d.id));
    });
    setGhost(p.doc.id);
    if (s.paper) { s.paper.mode = "out"; s.paper.t = 0; }
    kick();
    await until("out");
    if (!alive.current) return;
    await nextFrame();
    if (!alive.current) return;
    const el = rowEls.current.get(p.doc.id);
    if (el) {
      const r = rel(el);
      const sp: ValueAnimationTransition<number> = { type: "spring", stiffness: 340, damping: 28 };
      await Promise.all([anim(sx, r.x, sp), anim(sy, r.y, sp), anim(sw, r.w, sp), anim(sh, r.h, sp), anim(srad, 14, sp), anim(face, 0, { type: "spring", stiffness: 260, damping: 30 })]);
    }
    if (!alive.current) return;
    setGhost(null);
    setSheetDoc(null);
    void anim(mv(p.doc.id).s, [1.04, 1], { type: "spring", stiffness: 500, damping: 14 });
    sfx("land");
    setStatus(`Restored ${p.doc.name}`);
    busy.current = false;
  };

  const restoreAll = async () => {
    if (busy.current) return;
    busy.current = true;
    finalize();
    setDocs(ALL);
    setStatus("Files restored, bin emptied");
    await emptyBin();
    busy.current = false;
  };

  // ---------- drag ----------
  const drag = useRef<{ id: string; px: number; py: number; active: boolean; lx: number; lt: number; pid: number } | null>(null);
  const overSlot = (clientX: number, clientY: number) => {
    if (!root.current || !mcan.current) return false;
    const rr = root.current.getBoundingClientRect(), s = scale();
    const x = (clientX - rr.left) / s, y = (clientY - rr.top) / s;
    const m = rel(mcan.current), h = GEO.head;
    return x > m.x + h.x0 - 30 && x < m.x + h.x1 + 30 && y > m.y + h.y0 - 80 && y < m.y + h.y1 + 24;
  };
  const setArmed = (on: boolean) => { const s = S.current; const t = on ? 1 : 0; if (s.armedT !== t) { s.armedT = t; if (on) sfx("arm"); kick(); } };
  const onDown = (e: RPointerEvent<HTMLLIElement>, id: string) => {
    touched.current = true;
    if (busy.current || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id, px: e.clientX, py: e.clientY, active: false, lx: e.clientX, lt: nowMs(), pid: e.pointerId };
  };
  const onMove = (e: RPointerEvent<HTMLLIElement>) => {
    const d = drag.current;
    if (!d || d.pid !== e.pointerId) return;
    const s = scale();
    const dx = (e.clientX - d.px) / s, dy = (e.clientY - d.py) / s;
    if (!d.active && Math.hypot(dx, dy) > 5) { d.active = true; setDragging(d.id); }
    if (!d.active) return;
    const m = mv(d.id);
    m.x.set(dx); m.y.set(dy);
    const now = nowMs(), vx = (e.clientX - d.lx) / Math.max(1, now - d.lt);
    d.lx = e.clientX; d.lt = now;
    m.r.set(m.r.get() * 0.8 + clamp(vx * 4, -8, 8) * 0.2);
    setArmed(overSlot(e.clientX, e.clientY));
  };
  const onUp = (e: RPointerEvent<HTMLLIElement>) => {
    const d = drag.current;
    if (!d || d.pid !== e.pointerId) return;
    drag.current = null;
    if (!d.active) return;
    if (overSlot(e.clientX, e.clientY)) { void shred(d.id); return; }
    const m = mv(d.id), sp: ValueAnimationTransition<number> = { type: "spring", stiffness: 420, damping: 24 };
    void anim(m.x, 0, sp); void anim(m.y, 0, sp); void anim(m.r, 0, sp);
    setDragging(null); setArmed(false);
  };
  const onKey = (e: RKeyboardEvent<HTMLLIElement>, id: string) => {
    if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); void shred(id); }
  };

  // autoplay: carry a row onto the slot like a hand would
  const fakeDrag = async (id: string) => {
    const el = rowEls.current.get(id);
    if (!el || !root.current || !mcan.current || busy.current) return;
    const { slot } = measure(), r = rel(el), m = mv(id);
    setDragging(id);
    const dx = slot.x - (r.x + r.w / 2), dy = slot.y - 46 - (r.y + r.h / 2);
    const armT = setTimeout(() => setArmed(true), 650);
    timers.current.add(armT);
    await Promise.all([
      anim(m.x, dx, { type: "spring", stiffness: 90, damping: 17 }),
      anim(m.y, dy, { type: "spring", stiffness: 90, damping: 17 }),
      anim(m.r, [0, -7, -3], { duration: 1, ease: "easeInOut" }),
    ]);
  };

  useEffect(() => {
    alive.current = true;
    const t = timers.current, c = ctls.current;
    return () => {
      alive.current = false;
      cancelAnimationFrame(raf.current); raf.current = 0;
      t.forEach(clearTimeout); t.clear();
      c.forEach((x) => x.stop()); c.clear();
      if (finalTimer.current) clearTimeout(finalTimer.current);
      snd.current?.close(); snd.current = null;
    };
  }, []);

  // mute while the card is off screen or the tab is hidden, so a demo is never heard from somewhere you cannot see
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => {
      inView.current = en.isIntersecting;
      if (!en.isIntersecting) snd.current?.hush();
    }, { threshold: 0.15 });
    io.observe(el);
    const hide = () => { if (document.hidden) snd.current?.hush(); };
    document.addEventListener("visibilitychange", hide);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", hide); };
  }, []);
  useEffect(() => { snd.current?.setVolume(volume); }, [volume]);

  // static layers of the machine, painted once
  useEffect(() => {
    const c = mcan.current;
    if (!c) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    dpr.current = d;
    const { CW, CH } = GEO;
    c.width = Math.round(CW * d); c.height = Math.round(CH * d);
    const mk = (paint?: (g: CanvasRenderingContext2D) => void) => {
      const cv = document.createElement("canvas");
      cv.width = c.width; cv.height = c.height;
      const g = cv.getContext("2d");
      if (g && paint) { g.setTransform(d, 0, 0, d, 0, 0); paint(g); }
      return cv;
    };
    const prevPile = layers.current?.pile;
    layers.current = {
      shadow: mk((g) => paintShadow(g, d)), back: mk(paintBinBack), front: mk(paintBinFront), head: mk(paintHead),
      pile: prevPile && prevPile.width === c.width ? prevPile : mk(),
    };
    renderMachine();
  }, []);

  // overlay canvas tracks the card size
  useEffect(() => {
    const r = root.current, c = ocan.current;
    if (!r || !c) return;
    const fit = () => {
      const d = Math.min(2, window.devicePixelRatio || 1);
      const s = S.current;
      s.ow = r.offsetWidth; s.oh = r.offsetHeight;
      c.width = Math.round(s.ow * d); c.height = Math.round(s.oh * d);
      if (mcan.current) { const m = rel(mcan.current); s.mOff = [m.x, m.y]; }
      s.ovDirty = true; kick();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(r);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!auto) return;
    let off = false;
    const stop = () => off || touched.current || !alive.current;
    const resetDrag = (id: string) => {
      if (busy.current) return;
      const m = mv(id), sp: ValueAnimationTransition<number> = { type: "spring", stiffness: 420, damping: 26 };
      void anim(m.x, 0, sp); void anim(m.y, 0, sp); void anim(m.r, 0, sp);
      setDragging(null); setArmed(false);
    };
    const run = async () => {
      await wait(900);
      // switched on again after the visitor shredded some files: let that finish, then start from a full list
      while (busy.current && !stop()) await wait(200);
      if (stop()) return;
      if (docsRef.current.length < ALL.length || pending.current) await restoreAll();
      while (!stop()) {
        // pause while the card is off screen
        if (!inView.current) { await wait(300); continue; }
        await fakeDrag("q3"); if (stop()) return resetDrag("q3");
        await wait(120); if (stop()) return resetDrag("q3");
        await shred("q3"); if (stop()) return;
        await wait(2100); if (stop()) return;
        await undo(); if (stop()) return;
        await wait(1100); if (stop()) return;
        await fakeDrag("budget"); if (stop()) return resetDrag("budget");
        await wait(120); if (stop()) return resetDrag("budget");
        await shred("budget"); if (stop()) return;
        await wait(5400); if (stop()) return;
        finalize();
        await wait(700); if (stop()) return;
        setDocs(ALL);
        setStatus("Documents reset");
        await emptyBin();
        await wait(1500);
      }
    };
    void run();
    return () => { off = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto]);

  const toggleAuto = () => {
    if (auto) { setAuto(false); return; }
    touched.current = false;
    setAuto(true);
    wake(true);
  };
  /** The Auto switch is not "touching the card": it must not end the demo it controls. */
  const onAutoSwitch = (t: EventTarget) => t instanceof Element && !!t.closest("[data-auto-switch]");

  const visibleCount = docs.filter((d) => d.id !== ghost).length;

  return (
    <div
      ref={root}
      className={`relative w-full max-w-[440px] select-none rounded-[24px] bg-white px-5 pb-12 pt-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
      onPointerDownCapture={(e) => {
        wake(true);
        if (onAutoSwitch(e.target)) return;
        touched.current = true;
        setAuto(false);
      }}
      onKeyDownCapture={(e) => {
        wake(true);
        if (onAutoSwitch(e.target)) return;
        touched.current = true;
        setAuto(false);
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Documents</h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={auto}
            aria-label="Auto demo"
            data-auto-switch=""
            onClick={toggleAuto}
            className="flex h-7 items-center gap-2 rounded-full bg-[#f5f5f7] pl-3 pr-1.5 text-[12px] font-medium text-[#6e6e73] outline-none transition-colors hover:bg-[#ebebf0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3]"
          >
            Auto
            <span aria-hidden="true" className={`relative h-[18px] w-[30px] flex-none rounded-full transition-colors duration-200 ${auto ? "bg-[#34c759]" : "bg-[#d1d1d6]"}`}>
              <span className={`absolute left-[2px] top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.25)] transition-transform duration-200 ${auto ? "translate-x-3" : "translate-x-0"}`} />
            </span>
          </button>
          <span className="text-[13px] tabular-nums text-[#6e6e73]">{visibleCount} {visibleCount === 1 ? "item" : "items"}</span>
        </div>
      </div>

      <ul className="relative z-20 flex h-[210px] flex-col gap-1.5" aria-label="Documents">
        {docs.map((d) => {
          const m = mv(d.id);
          const isDrag = dragging === d.id;
          return (
            <motion.li
              key={d.id}
              ref={(el: HTMLLIElement | null) => { if (el) rowEls.current.set(d.id, el); else rowEls.current.delete(d.id); }}
              layout="position"
              initial={mounted && d.id !== ghost ? { opacity: 0, scale: 0.94 } : false}
              animate={{ opacity: 1, scale: 1, boxShadow: isDrag ? "0 0 0 1px rgba(0,0,0,.06), 0 18px 34px -14px rgba(0,0,0,.35)" : "0 0 0 1px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)" }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              style={{ x: m.x, y: m.y, rotate: m.r, scale: m.s, zIndex: isDrag ? 30 : 1, visibility: d.id === ghost ? "hidden" : "visible" }}
              tabIndex={0}
              aria-label={`${d.name}, ${d.size}. Press Delete to shred.`}
              onPointerDown={(e) => onDown(e, d.id)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onKeyDown={(e) => onKey(e, d.id)}
              className={`relative flex h-12 flex-none touch-none items-center gap-3 rounded-[14px] bg-white pl-3 pr-1.5 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3] ${isDrag ? "cursor-grabbing" : "cursor-grab"}`}
            >
              <FileIcon d={d} />
              <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate text-[14px] font-medium tracking-[-0.01em] text-[#1d1d1f]">{d.name}</span>
                <span className="text-[12px] tabular-nums text-[#6e6e73]">{d.size}</span>
              </span>
              <button
                type="button"
                aria-label={`Shred ${d.name}`}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => { touched.current = true; void shred(d.id); }}
                className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-[#6e6e73] outline-none transition-colors hover:bg-[#f5f5f7] hover:text-[#ff3b30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
                </svg>
              </button>
            </motion.li>
          );
        })}
        {docs.length === 0 && (
          <li className="flex flex-1 flex-col items-center justify-center gap-2 text-[13px] text-[#6e6e73]">
            <span>All files shredded.</span>
            <button
              type="button"
              onClick={() => { touched.current = true; void restoreAll(); }}
              className="rounded-full bg-[#f5f5f7] px-3.5 py-1.5 text-[13px] font-medium text-[#0071e3] outline-none transition-colors hover:bg-[#ebebf0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3]"
            >
              Restore files
            </button>
          </li>
        )}
      </ul>

      {/* the shredder */}
      <div className="relative z-10 mt-3 flex justify-center" aria-hidden="true">
        <canvas ref={mcan} style={{ width: GEO.CW, height: GEO.CH }} />
      </div>

      {/* the page while it morphs between a row and a sheet */}
      {sheetDoc && (
        <motion.div
          ref={(el: HTMLDivElement | null) => { sheetEl.current = el; if (el) el.style.visibility = domVis.current ? "visible" : "hidden"; }}
          className="pointer-events-none absolute left-0 top-0 z-30"
          style={{ x: sx, y: sy, width: sw, height: sh, rotate: srot }}
          aria-hidden="true"
        >
          <motion.div className="relative h-full w-full overflow-hidden bg-white shadow-[0_0_0_1px_rgba(0,0,0,.07),0_12px_24px_-12px_rgba(0,0,0,.35)]" style={{ borderRadius: sheetRadius }}>
            <motion.canvas
              className="absolute inset-0 h-full w-full"
              style={{ opacity: facePaper }}
              ref={(c: HTMLCanvasElement | null) => {
                if (!c || !src.current) return;
                c.width = src.current.width; c.height = src.current.height;
                c.getContext("2d")?.drawImage(src.current, 0, 0);
              }}
            />
            <motion.div className="absolute inset-0 flex items-center gap-3 pl-3" style={{ opacity: faceRow }}>
              <FileIcon d={sheetDoc} />
              <span className="truncate whitespace-nowrap text-[14px] font-medium text-[#1d1d1f]">{sheetDoc.name}</span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* the sheet in the machine: bent, lit and occluded by the throat */}
      <canvas ref={ocan} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-40" style={{ width: "100%", height: "100%" }} />

      <AnimatePresence mode="wait">
        {toast ? <Toast key={toast.key} name={toast.name} onUndo={() => { touched.current = true; void undo(); }} /> : (
          <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-x-0 bottom-4 text-center text-[12px] text-[#6e6e73]">
            Drag a file into the shredder, or press Delete.
          </motion.p>
        )}
      </AnimatePresence>
      <div className="sr-only" aria-live="polite">{status}</div>
    </div>
  );
}
