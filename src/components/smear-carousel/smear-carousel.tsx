"use client";

/* eslint-disable react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { animate, motion, motionValue, useInView, useMotionValue, useReducedMotion, type AnimationPlaybackControls, type MotionValue } from "framer-motion";

export type SmearScene = "surf" | "coffee" | "run" | "sleep" | "night" | "solar";
/** the older art names still work and map to the nearest scene */
type LegacyArt = "speed" | "waves" | "sunset" | "ring" | "bloom" | "grid";
export type SmearCard = {
  id: string;
  title: string;
  subtitle: string;
  /** a small pill in the top corner */
  tag?: string;
  /** one line along the bottom */
  stat?: string;
  /** which built-in photo to paint when there's no image */
  art?: SmearScene | LegacyArt;
  /** a photo URL, cover-fitted; used instead of the built-in art */
  image?: string;
};
export type SmearCarouselProps = {
  cards?: SmearCard[];
  /** called when someone clicks the middle card, presses Enter, or presses the action button */
  onSelect?: (card: SmearCard) => void;
  /** label of the action button under the middle card (only shown when you pass onSelect) */
  actionLabel?: string;
  autoplay?: boolean;
  className?: string;
};

// Phosphor (via Iconify), inlined
const ICON = {
  left: { vb: 256, body: "<path fill=\"currentColor\" d=\"M168.49 199.51a12 12 0 0 1-17 17l-80-80a12 12 0 0 1 0-17l80-80a12 12 0 0 1 17 17L97 128Z\"/>" },
  right: { vb: 256, body: "<path fill=\"currentColor\" d=\"m184.49 136.49l-80 80a12 12 0 0 1-17-17L159 128L87.51 56.49a12 12 0 1 1 17-17l80 80a12 12 0 0 1-.02 17\"/>" },
  open: { vb: 256, body: "<path fill=\"currentColor\" d=\"M204 64v104a12 12 0 0 1-24 0V93L72.49 200.49a12 12 0 0 1-17-17L163 76H88a12 12 0 0 1 0-24h104a12 12 0 0 1 12 12\"/>" },
} as const;

const CARDS: SmearCard[] = [
  { id: "surf", title: "Swell check", subtitle: "Kelp Point", tag: "Clean", stat: "6 ft at 12 s, high tide 11:20", art: "surf" },
  { id: "roast", title: "Roast log", subtitle: "Guji, batch 31", tag: "Light", stat: "Drop at 10:15, 212 °C", art: "coffee" },
  { id: "run", title: "Tempo run", subtitle: "River loop", tag: "Live", stat: "Zone 4, 7.8 km", art: "run" },
  { id: "sleep", title: "Wind down", subtitle: "Tonight", tag: "Calm", stat: "Lights out at 22:40", art: "sleep" },
  { id: "moon", title: "Moonrise", subtitle: "Tonight", tag: "Waxing", stat: "Rises 18:42, 74% lit", art: "night" },
  { id: "solar", title: "Sun hours", subtitle: "Rooftop array", tag: "Peak", stat: "4.6 kWh by 13:10", art: "solar" },
];

const STOP = Symbol("stop");
const BG = "#f1f1f3";
const SMW = 48; // the low-res copy each smear samples from: few columns (it stretches sideways anyway), many rows (fine fibres)
const SMH = 200;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mulberry = (seed: number) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const mk = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = Math.max(1, w);
  c.height = Math.max(1, h);
  return c;
};

// ─── the built-in photographs: a lit silhouette, colour graded, smeared, with grain ───

type RGB = [number, number, number];
const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
type Scene = {
  /** background, top to bottom */
  stops: [string, string, string];
  /** key light colour and where it comes from (0..1 of the frame) */
  key: RGB;
  at: [number, number];
  /** a second, softer haze */
  haze: RGB;
  /** the rim light along the subject's lit edge */
  rim: RGB;
  /** the subject's shadow side */
  skin: string;
  /** where the smear slit is, and which rows it smears */
  slit: number;
  span: [number, number];
  grain: number;
};
const SCENES: Record<SmearScene, Scene> = {
  surf: { stops: ["#2fbf73", "#128a4f", "#033a22"], key: [120, 255, 170], at: [0.84, 0.26], haze: [50, 230, 200], rim: [226, 255, 234], skin: "#0b3a24", slit: 0.53, span: [0.2, 1], grain: 20 },
  coffee: { stops: ["#3b44c9", "#20268a", "#090b33"], key: [255, 140, 60], at: [0.92, 0.8], haze: [130, 110, 255], rim: [255, 214, 170], skin: "#141238", slit: 0.5, span: [0.22, 1], grain: 22 },
  run: { stops: ["#ff4b3a", "#e0141f", "#6e0710"], key: [255, 130, 100], at: [0.62, 0.34], haze: [255, 70, 120], rim: [255, 200, 186], skin: "#1c0306", slit: 0.5, span: [0.25, 0.8], grain: 18 },
  sleep: { stops: ["#4d8bff", "#1450f0", "#041a5c"], key: [130, 196, 255], at: [0.84, 0.18], haze: [50, 210, 255], rim: [226, 240, 255], skin: "#0a2466", slit: 0.52, span: [0.08, 1], grain: 20 },
  night: { stops: ["#9a5cff", "#6a2fd0", "#22094a"], key: [232, 200, 255], at: [0.82, 0.14], haze: [200, 100, 255], rim: [246, 234, 255], skin: "#2a0f5c", slit: 0.53, span: [0.06, 1], grain: 22 },
  solar: { stops: ["#ffcf4a", "#ff7a1a", "#8a2306"], key: [255, 226, 130], at: [0.86, 0.22], haze: [255, 130, 50], rim: [255, 244, 210], skin: "#4a1a06", slit: 0.5, span: [0.2, 1], grain: 20 },
};
const ORDER: SmearScene[] = ["surf", "coffee", "run", "sleep", "night", "solar"];
const LEGACY: Record<LegacyArt, SmearScene> = { speed: "run", waves: "surf", sunset: "solar", ring: "night", bloom: "sleep", grid: "coffee" };
const sceneOf = (c: SmearCard, i: number): SmearScene => (c.art ? (c.art in LEGACY ? LEGACY[c.art as LegacyArt] : (c.art as SmearScene)) : ORDER[i % ORDER.length]);

// silhouettes in a 100 x 125 box, facing right
const P_MAN =
  "M8 125C10 112 20 101 34 96C34 90 31 84 30 76C27 64 29 50 37 41C45 32 58 29 67 33C74 36 77 42 77 49C77 52 79 54 80 56C82 59 85 62 86 64C86 66 84 67 82 67C82 69 83 70 82 71C81 72 82 73 81 74C80 76 80 79 77 81C74 83 70 83 67 84C66 89 67 93 70 96C80 101 92 106 100 112L100 125Z";
const P_WOMAN =
  "M14 125C16 112 24 103 36 99C37 92 35 86 34 79C30 67 31 53 38 44C45 35 57 31 66 34C73 37 76 43 76 50C76 53 78 55 79 57C81 60 83 62 84 64C84 66 82 66 80 67C81 69 81 70 80 71C80 72 81 73 80 74C79 77 79 79 76 81C73 83 70 83 68 84C67 90 68 95 71 99C80 103 90 108 98 114L100 125Z";
const P_CROP = "M30 70C26 56 30 40 40 33C48 28 60 27 68 31C72 33 75 37 76 41C68 36 58 36 50 39C42 43 37 52 36 64Z";
const P_BEARD = "M50 70C54 81 63 90 74 90C78 90 81 86 82 79C78 83 73 84 67 84C61 83 55 79 50 70Z";
const P_HAND = "M68 114C66 104 70 96 77 93L86 95C87 101 85 107 80 114Z";
const P_CUP = "M78 79L95 79L94 97C94 100 91 103 88 103L84 103C81 103 79 100 79 97Z";
const P_JACKET = "M-2 125L-2 110C8 102 22 97 34 94L46 106L56 98C70 100 86 106 98 112L102 114L102 125Z";
const P_LONG_HAIR = "M42 36C28 30 10 40 -4 56L-4 100C8 86 20 79 34 81C36 70 35 52 42 36Z";

/** the subject as a white mask on a transparent canvas */
function subjectMask(kind: SmearScene, W2: number, H2: number, seed: number) {
  const m = mk(W2, H2);
  const g = m.getContext("2d", { willReadFrequently: true })!;
  g.setTransform(W2 / 100, 0, 0, H2 / 125, 0, 0);
  g.fillStyle = "#fff";
  g.strokeStyle = "#fff";
  g.lineCap = "round";
  g.lineJoin = "round";
  const fill = (d: string) => g.fill(new Path2D(d));
  const rnd = mulberry(seed);
  if (kind === "surf") {
    fill(P_MAN);
    // wet, tousled hair: short thick strands over the crown and the back of the head
    for (let k = 0; k < 70; k++) {
      // clumps that grow from the crown and fall back and down, like hair just out of the water
      const a = -Math.PI * (0.32 + rnd() * 0.62);
      const r0 = 20 + rnd() * 4;
      const x0 = 53 + Math.cos(a) * r0;
      const y0 = 55 + Math.sin(a) * r0 * 1.12;
      const len = 4 + rnd() * 6;
      g.lineWidth = 1.4 + rnd() * 2.4;
      g.beginPath();
      g.moveTo(x0 + 3, y0 + 3);
      g.quadraticCurveTo(x0 - len * 0.4, y0 - 1, x0 - len, y0 + len * 0.7);
      g.stroke();
    }
  } else if (kind === "coffee") {
    fill(P_MAN);
    fill(P_BEARD);
    fill(P_CROP);
    fill(P_HAND);
    fill(P_CUP);
    g.lineWidth = 2.6;
    g.beginPath();
    g.arc(96, 88, 4, -1.4, 1.4);
    g.stroke();
  } else if (kind === "solar") {
    fill(P_MAN);
    fill(P_CROP);
    fill(P_JACKET);
  } else if (kind === "sleep") {
    // head tipped back, eyes closed, a cloud of curls
    g.translate(58, 100);
    g.rotate(-0.26);
    g.translate(-58, -100);
    fill(P_WOMAN);
    for (let k = 0; k < 64; k++) {
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(rnd());
      const x = 36 + Math.cos(a) * 22 * r - 4;
      const y = 50 + Math.sin(a) * 28 * r;
      if (x > 64 && y > 40) continue; // keep the face clear
      g.beginPath();
      g.arc(x, y, 4.5 + rnd() * 5, 0, Math.PI * 2);
      g.fill();
    }
  } else if (kind === "night") {
    fill(P_WOMAN);
    fill(P_LONG_HAIR);
    for (let k = 0; k < 22; k++) {
      g.lineWidth = 0.7 + rnd() * 1.8;
      const y0 = 30 + rnd() * 16;
      g.beginPath();
      g.moveTo(44 + rnd() * 16, y0);
      g.bezierCurveTo(30, y0 - 8 + rnd() * 10, 14, 40 + rnd() * 30, -6, 42 + rnd() * 66);
      g.stroke();
    }
  } else {
    // a runner mid-stride
    const L = (pts: number[][], w: number) => {
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
      g.stroke();
    };
    g.beginPath();
    g.ellipse(62, 22, 6.2, 7.2, 0.2, 0, Math.PI * 2);
    g.fill();
    L([[57, 19], [51, 21], [47, 27]], 4.4); // ponytail
    L([[49, 24], [45, 31]], 2.8);
    L([[59, 30], [56, 36]], 6); // neck
    g.lineWidth = 1;
    g.beginPath(); // torso, leaning into the stride
    g.moveTo(52, 34);
    g.quadraticCurveTo(62, 33, 63, 40);
    g.quadraticCurveTo(60, 52, 55, 62);
    g.lineTo(44, 62);
    g.quadraticCurveTo(46, 48, 52, 34);
    g.fill();
    L([[60, 38], [65, 49], [74, 50]], 5.4); // front arm
    L([[52, 38], [44, 47], [41, 56]], 5.4); // back arm
    L([[52, 60], [63, 73], [59, 92]], 9.5); // front leg
    L([[59, 92], [67, 94]], 4.6);
    L([[48, 61], [40, 79], [26, 88]], 9); // back leg
    L([[26, 88], [21, 95]], 4.6);
  }
  return m;
}

/** separable box blur on a single channel, run twice: close enough to a gaussian */
function blur1(src: Float32Array, w: number, h: number, r: number) {
  const a = new Float32Array(src);
  const t = new Float32Array(src.length);
  const pass = (from: Float32Array, to: Float32Array, horiz: boolean) => {
    const len = horiz ? w : h;
    const lines = horiz ? h : w;
    const inv = 1 / (r * 2 + 1);
    for (let l = 0; l < lines; l++) {
      const at = (i: number) => (horiz ? l * w + clamp(i, 0, w - 1) : clamp(i, 0, h - 1) * w + l);
      let acc = 0;
      for (let i = -r; i <= r; i++) acc += from[at(i)];
      for (let i = 0; i < len; i++) {
        to[at(i)] = acc * inv;
        acc += from[at(i + r + 1)] - from[at(i - r)];
      }
    }
  };
  for (let k = 0; k < 2; k++) {
    pass(a, t, true);
    pass(t, a, false);
  }
  return a;
}

const FORM: Record<SmearScene, number> = { surf: 1, coffee: 1, run: 0.22, sleep: 1, night: 0.95, solar: 1 };

function shadeSubject(g: CanvasRenderingContext2D, kind: SmearScene, W2: number, H2: number, seed: number) {
  const sc = SCENES[kind];
  const M = subjectMask(kind, W2, H2, seed);
  const md = M.getContext("2d")!.getImageData(0, 0, W2, H2).data;
  const A = new Float32Array(W2 * H2);
  for (let i = 0; i < A.length; i++) A[i] = md[i * 4 + 3] / 255;
  const r1 = Math.max(3, Math.round(W2 * 0.045));
  const r2 = Math.max(1, Math.round(W2 * 0.009));
  const B1 = blur1(A, W2, H2, r1);
  const B2 = blur1(A, W2, H2, r2);
  // light direction: from the middle of the subject toward the key light
  let lx = sc.at[0] - 0.55;
  let ly = sc.at[1] - 0.6;
  const ll = Math.hypot(lx, ly) || 1;
  lx /= ll;
  ly /= ll;
  const d1 = r1 * 1.4;
  const d2 = r2 * 1.6;
  const sample = (B: Float32Array, x: number, y: number) => B[clamp(Math.round(y), 0, H2 - 1) * W2 + clamp(Math.round(x), 0, W2 - 1)];
  const skin = [parseInt(sc.skin.slice(1, 3), 16), parseInt(sc.skin.slice(3, 5), 16), parseInt(sc.skin.slice(5, 7), 16)];
  const key = sc.key;
  const rim = sc.rim;
  const form = FORM[kind];
  const id = g.getImageData(0, 0, W2, H2);
  const d = id.data;
  const rnd = mulberry(seed * 7 + 1);
  // a soft mottling so skin and hair aren't flat
  const mott = new Float32Array(W2 * H2);
  for (let i = 0; i < mott.length; i++) mott[i] = rnd();
  const mottB = blur1(mott, W2, H2, Math.max(1, Math.round(W2 * 0.006)));
  for (let y = 0; y < H2; y++) {
    for (let x = 0; x < W2; x++) {
      const i = y * W2 + x;
      const a = A[i];
      if (a <= 0.002) continue;
      const n1 = sample(B1, x - lx * d1, y - ly * d1) - sample(B1, x + lx * d1, y + ly * d1);
      const n2 = sample(B2, x - lx * d2, y - ly * d2) - sample(B2, x + lx * d2, y + ly * d2);
      const formL = Math.pow(clamp(n1 * 1.5, 0, 1), 1.3) * 0.85 * form;
      const rimL = Math.pow(clamp(n2 * 1.8, 0, 1), 1.6);
      const tex = 0.88 + (mottB[i] - 0.5) * 0.9;
      const k = i * 4;
      // a little of the background bleeds into the subject's edge (light wrap)
      const wrap = (1 - B1[i]) * 0.35;
      for (let ch = 0; ch < 3; ch++) {
        let c = skin[ch] * tex + (key[ch] - skin[ch]) * formL * tex;
        c += (rim[ch] - c) * rimL * 0.85;
        c += (d[k + ch] - c) * wrap;
        d[k + ch] += (c - d[k + ch]) * a;
      }
    }
  }
  g.putImageData(id, 0, 0);
}

/** paint one built-in photograph */
function paintScene(g: CanvasRenderingContext2D, kind: SmearScene, W2: number, H2: number, seed: number) {
  const sc = SCENES[kind];
  const rnd = mulberry(seed * 31 + 7);
  const bg = mk(W2, H2);
  const b = bg.getContext("2d")!;
  const lin = b.createLinearGradient(0, 0, 0, H2);
  lin.addColorStop(0, sc.stops[0]);
  lin.addColorStop(0.55, sc.stops[1]);
  lin.addColorStop(1, sc.stops[2]);
  b.fillStyle = lin;
  b.fillRect(0, 0, W2, H2);
  const blob = (x: number, y: number, r: number, c: RGB, a: number) => {
    const gr = b.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, rgba(c, a));
    gr.addColorStop(1, rgba(c, 0));
    b.fillStyle = gr;
    b.fillRect(0, 0, W2, H2);
  };
  const [kx, ky] = [sc.at[0] * W2, sc.at[1] * H2];
  blob(kx, ky, W2 * 1.25, sc.key, 0.9);
  blob(kx, ky, W2 * 0.4, [255, 255, 255], 0.3);
  for (let k = 0; k < 3; k++) blob(rnd() * W2, rnd() * H2, W2 * (0.35 + rnd() * 0.4), sc.haze, 0.22 + rnd() * 0.12);
  if (kind === "night") {
    for (let k = 0; k < 70; k++) {
      b.fillStyle = `rgba(255,255,255,${0.25 + rnd() * 0.6})`;
      b.beginPath();
      b.arc(rnd() * W2, rnd() * H2 * 0.55, (0.3 + rnd() * 0.9) * (W2 / 260), 0, Math.PI * 2);
      b.fill();
    }
    blob(W2 * 0.82, H2 * 0.14, W2 * 0.1, [255, 255, 255], 0.9);
  }
  if (kind === "sleep" || kind === "solar") {
    for (let k = 0; k < 10; k++) blob(rnd() * W2, rnd() * H2 * 0.8, W2 * (0.04 + rnd() * 0.07), kind === "sleep" ? [150, 220, 255] : [255, 230, 160], 0.35 + rnd() * 0.25);
  }
  if (kind === "run") {
    b.globalAlpha = 0.22;
    for (let k = 0; k < 9; k++) {
      const y = rnd() * H2;
      const gr = b.createLinearGradient(0, 0, W2, 0);
      gr.addColorStop(0, "rgba(255,200,180,0)");
      gr.addColorStop(rnd() * 0.6 + 0.2, "rgba(255,200,180,.9)");
      gr.addColorStop(1, "rgba(255,200,180,0)");
      b.fillStyle = gr;
      b.fillRect(0, y, W2, (1 + rnd() * 5) * (H2 / 320));
    }
    b.globalAlpha = 1;
  }
  // depth of field: the background is soft
  g.filter = `blur(${Math.round(W2 / 110)}px)`;
  g.drawImage(bg, 0, 0);
  g.filter = "none";

  // the subject, lit like a photograph: soft form light from the key, a rim on the lit edge, the rest in shadow
  shadeSubject(g, kind, W2, H2, seed);

  // what's in the air
  const u = W2 / 100;
  const v = H2 / 125;
  if (kind === "surf") {
    // spray: a few sharp droplets, and some out of focus
    for (let k = 0; k < 26; k++) {
      const x = (50 + rnd() * 50) * u;
      const y = (20 + rnd() * 70) * v;
      const near = rnd() < 0.25;
      const rr = (near ? 1.2 + rnd() * 2 : 0.15 + rnd() * 0.35) * u;
      g.filter = near ? `blur(${Math.round(u * 0.8)}px)` : "none";
      g.fillStyle = `rgba(225,255,235,${near ? 0.18 : 0.35 + rnd() * 0.45})`;
      g.beginPath();
      g.arc(x, y, rr, 0, Math.PI * 2);
      g.fill();
    }
    g.filter = "none";
  } else if (kind === "coffee") {
    g.globalCompositeOperation = "screen";
    g.filter = `blur(${Math.round(W2 / 70)}px)`;
    for (let k = 0; k < 4; k++) {
      g.strokeStyle = `rgba(255,236,220,${0.35 + rnd() * 0.25})`;
      g.lineWidth = (2 + rnd() * 3) * u;
      g.beginPath();
      const x0 = (84 + rnd() * 8) * u;
      g.moveTo(x0, 78 * v);
      g.bezierCurveTo(x0 - 10 * u, 66 * v, x0 + 8 * u, 56 * v, x0 - 4 * u, (38 + rnd() * 8) * v);
      g.stroke();
    }
    g.filter = "none";
    // the coffee glows from inside the cup
    const cg = g.createRadialGradient(87 * u, 80 * v, 0, 87 * u, 80 * v, 14 * u);
    cg.addColorStop(0, "rgba(255,160,80,.55)");
    cg.addColorStop(1, "rgba(255,160,80,0)");
    g.fillStyle = cg;
    g.fillRect(0, 0, W2, H2);
    g.globalCompositeOperation = "source-over";
  }

  // bloom
  const bl = mk(W2, H2);
  const bc = bl.getContext("2d")!;
  bc.filter = `blur(${Math.round(W2 / 22)}px)`;
  bc.drawImage(g.canvas, 0, 0);
  g.globalCompositeOperation = "screen";
  g.globalAlpha = 0.32;
  g.drawImage(bl, 0, 0);
  g.globalAlpha = 1;
  g.globalCompositeOperation = "source-over";
}

/** pixel-stretch: rows pulled out to the left from a vertical slit, like a long exposure of someone moving */
function pixelSmear(id: ImageData, slit: number, span: [number, number], strength: number, seed: number) {
  const { data, width: Wd, height: Hd } = id;
  const rnd = mulberry(seed * 17 + 3);
  const sx = Math.round(slit * Wd);
  const y0 = Math.round(span[0] * Hd);
  const y1 = Math.round(span[1] * Hd);
  const maxLen = Math.round(Wd * 0.78);
  const minLen = Math.round(Wd * 0.22);
  const step = Math.max(3, Math.round(Hd / 70));
  const knots: number[] = [];
  for (let k = 0; k <= Math.ceil(Hd / step) + 2; k++) knots.push(rnd());
  const row = new Float32Array((maxLen + 4) * 3);
  let jag = 0.5;
  for (let y = y0; y < y1; y++) {
    const kf = y / step;
    const k0 = Math.floor(kf);
    const fr = smooth(kf - k0);
    const nz = knots[k0] * (1 - fr) + knots[k0 + 1] * fr;
    jag = jag * 0.45 + rnd() * 0.55;
    const len = Math.round(minLen + (maxLen - minLen) * clamp(0.35 * nz + 0.8 * jag, 0, 1));
    const fade = Math.min(1, (y - y0) / (Hd * 0.06), (y1 - y) / (Hd * 0.03));
    // copy the band left of the slit first; each output pixel reads a stretched copy of it
    for (let d = 0; d < len + 2; d++) {
      const x = Math.max(0, sx - d);
      const i = (y * Wd + x) * 4;
      row[d * 3] = data[i];
      row[d * 3 + 1] = data[i + 1];
      row[d * 3 + 2] = data[i + 2];
    }
    // each streak carries a slowly changing colour (a running average of the stretched band), so it reads as silk
    let cr = row[0];
    let cg = row[1];
    let cb = row[2];
    for (let d = 0; d < len; d++) {
      const x = sx - d;
      if (x < 0) break;
      const src = Math.floor(d * 0.1) * 3;
      cr += (row[src] - cr) * 0.12;
      cg += (row[src + 1] - cg) * 0.12;
      cb += (row[src + 2] - cb) * 0.12;
      const q = d / len;
      const w = (q < 0.55 ? 1 : 1 - smooth((q - 0.55) / 0.45)) * strength * fade;
      const i = (y * Wd + x) * 4;
      data[i] += (cr - data[i]) * w;
      data[i + 1] += (cg - data[i + 1]) * w;
      data[i + 2] += (cb - data[i + 2]) * w;
    }
  }
}

type Painted = { tex: HTMLCanvasElement; small: Uint8ClampedArray | null };

let NOISE: HTMLCanvasElement | null = null;
function noiseTile() {
  if (NOISE) return NOISE;
  const c = mk(128, 128);
  const g = c.getContext("2d")!;
  const id = g.createImageData(128, 128);
  for (let i = 0; i < id.data.length; i += 4) {
    const v = Math.random() * 255;
    id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
    id.data[i + 3] = 255;
  }
  g.putImageData(id, 0, 0);
  return (NOISE = c);
}

/** a quick stand-in while the real picture is painted: the scene's colours, already smearable */
function placeholder(card: SmearCard, index: number, w: number, h: number): Painted {
  const sc = SCENES[sceneOf(card, index)];
  const c = mk(Math.max(8, Math.round(w / 4)), Math.max(8, Math.round(h / 4)));
  const g = c.getContext("2d", { willReadFrequently: true })!;
  const lin = g.createLinearGradient(0, 0, 0, c.height);
  lin.addColorStop(0, sc.stops[0]);
  lin.addColorStop(0.55, sc.stops[1]);
  lin.addColorStop(1, sc.stops[2]);
  g.fillStyle = lin;
  g.fillRect(0, 0, c.width, c.height);
  const sm = mk(SMW, SMH);
  const sg = sm.getContext("2d", { willReadFrequently: true })!;
  sg.drawImage(c, 0, 0, SMW, SMH);
  return { tex: c, small: sg.getImageData(0, 0, SMW, SMH).data };
}

/** one card's texture: a photo (yours, or a built-in one), its smear and grain, then the words on top */
function paintCard(card: SmearCard, index: number, w: number, h: number, dpr: number, photo?: HTMLImageElement, tainted = false): Painted {
  const W2 = Math.round(w * dpr);
  const H2 = Math.round(h * dpr);
  // the picture itself is soft (depth of field, grain), so it's painted at a capped resolution and scaled up
  const ps = Math.min(dpr, 1.5);
  const W3 = Math.round(w * ps);
  const H3 = Math.round(h * ps);
  const pc = mk(W3, H3);
  const pg = pc.getContext("2d", { willReadFrequently: true })!;
  const kind = sceneOf(card, index);
  const sc = SCENES[kind];
  if (photo) {
    const k = Math.max(W3 / photo.naturalWidth, H3 / photo.naturalHeight);
    const pw = photo.naturalWidth * k;
    const ph = photo.naturalHeight * k;
    pg.drawImage(photo, (W3 - pw) / 2, (H3 - ph) / 2, pw, ph);
  } else {
    paintScene(pg, kind, W3, H3, index + 1);
  }
  let small: Uint8ClampedArray | null = null;
  if (!tainted) {
    try {
      const id = pg.getImageData(0, 0, W3, H3);
      if (photo) pixelSmear(id, 0.46, [0.12, 0.92], 0.62, index + 1);
      else pixelSmear(id, sc.slit, sc.span, 0.94, index + 1);
      pg.putImageData(id, 0, 0);
      const sm = mk(SMW, SMH);
      const sg = sm.getContext("2d", { willReadFrequently: true })!;
      sg.imageSmoothingQuality = "high";
      sg.drawImage(pc, 0, 0, SMW, SMH);
      small = sg.getImageData(0, 0, SMW, SMH).data;
    } catch {
      small = null;
    }
  }
  const c = mk(W2, H2);
  const g = c.getContext("2d")!;
  g.imageSmoothingQuality = "high";
  g.drawImage(pc, 0, 0, W2, H2);
  // film grain, at full resolution
  const pat = g.createPattern(noiseTile(), "repeat");
  if (pat) {
    g.globalCompositeOperation = "overlay";
    g.globalAlpha = (photo ? 12 : sc.grain) / 160;
    g.fillStyle = pat;
    g.fillRect(0, 0, W2, H2);
    g.globalAlpha = 1;
    g.globalCompositeOperation = "source-over";
  }
  // a soft vignette and a darker foot so the words read
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const vg = g.createRadialGradient(w * 0.5, h * 0.45, h * 0.25, w * 0.5, h * 0.5, h * 0.8);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,.32)");
  g.fillStyle = vg;
  g.fillRect(0, 0, w, h);
  const foot = g.createLinearGradient(0, h * 0.7, 0, h);
  foot.addColorStop(0, "rgba(0,0,0,0)");
  foot.addColorStop(1, "rgba(0,0,0,.28)");
  g.fillStyle = foot;
  g.fillRect(0, 0, w, h);
  const top = g.createLinearGradient(0, 0, 0, h * 0.25);
  top.addColorStop(0, "rgba(0,0,0,.18)");
  top.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = top;
  g.fillRect(0, 0, w, h);

  // the words
  const font = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', 'Segoe UI', sans-serif";
  const pad = Math.round(w * 0.075);
  const fs = Math.max(9, Math.round(w * 0.058 * 10) / 10);
  g.shadowColor = "rgba(0,0,0,.28)";
  g.shadowBlur = 8;
  g.fillStyle = "#fff";
  g.textBaseline = "alphabetic";
  // the tag pill takes the top right corner; the title gets what's left, shrinking a little if it must
  const ts = Math.max(8, fs * 0.74);
  g.font = `600 ${ts}px ${font}`;
  const tagW = card.tag ? g.measureText(card.tag).width + ts * 1.5 : 0;
  const room = w - pad - (card.tag ? pad * 0.8 + tagW + ts : pad);
  const fit = (t: string, size: number) => {
    g.font = `600 ${size}px ${font}`;
    const m = g.measureText(t).width;
    return m > room ? Math.max(8, (size * room) / m) : size;
  };
  const tf = Math.min(fit(card.title, fs), fit(card.subtitle, fs));
  g.font = `600 ${tf}px ${font}`;
  g.fillText(card.title, pad, pad + fs * 0.9);
  g.fillStyle = "rgba(255,255,255,.88)";
  g.fillText(card.subtitle, pad, pad + fs * 0.9 + tf * 1.25);
  if (card.stat) {
    g.fillStyle = "#fff";
    g.font = `500 ${Math.max(9.5, fs * 0.86)}px ${font}`;
    g.fillText(card.stat, pad, h - pad * 0.95, w - pad * 2);
  }
  g.shadowBlur = 0;
  g.shadowColor = "transparent";
  if (card.tag) {
    g.font = `600 ${ts}px ${font}`;
    const ph = ts * 1.9;
    const pw = tagW;
    const px = w - pad * 0.8 - pw;
    const py = pad * 0.8;
    g.fillStyle = "rgba(255,255,255,.86)";
    g.beginPath();
    g.roundRect(px, py, pw, ph, ph / 2);
    g.fill();
    g.fillStyle = "#1d1d1f";
    g.fillText(card.tag, px + ts * 0.75, py + ph * 0.66);
  }
  return { tex: c, small };
}

function loadImage(src: string) {
  return new Promise<{ im: HTMLImageElement; tainted: boolean }>((res, rej) => {
    const a = new Image();
    a.crossOrigin = "anonymous";
    a.decoding = "async";
    a.onload = () => res({ im: a, tainted: false });
    a.onerror = () => {
      // no CORS headers: we can still draw it, just not read its pixels
      const b = new Image();
      b.decoding = "async";
      b.onload = () => res({ im: b, tainted: true });
      b.onerror = rej;
      b.src = src;
    };
    a.src = src;
  });
}

/**
 * A carousel whose neighbours smear. The card in the middle is a colour-graded photograph with its own
 * long-exposure streak; the cards either side are turned away from you, and from their outer edge the picture
 * is pulled out to the edge of the stage in long flowing streaks that flare open like the bell of a trumpet,
 * edged with a thin iridescent rim. Drag or fling it (or scroll sideways) and the cards turn and slide
 * through the smear, then settle on the nearest one with a spring. Click a side card to bring it in.
 * Keyboard: Arrow Left and Right move, Home and End jump to the ends, Enter selects the middle card.
 */
export function SmearCarousel({ cards = CARDS, onSelect, actionLabel = "Open", autoplay = false, className = "" }: SmearCarouselProps) {
  const reduced = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(rootRef, { amount: 0.15 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;
  const n = cards.length;
  // with three or more cards it loops, so there's always a neighbour on both sides
  const loop = n >= 3;
  const wrap = useCallback((k: number) => ((k % n) + n) % n, [n]);

  const [W, setW] = useState(960);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const narrow = W < 640;
  const H = Math.round(clamp(W * (narrow ? 1.06 : 0.47), 330, 520));
  const CH0 = Math.round(H * (narrow ? 0.58 : 0.62));
  const CW = Math.round(Math.min(CH0 * 0.8, W * (narrow ? 0.4 : 0.25)));
  const CH = Math.round(CW * 1.25);
  const SW = Math.round(CW * (narrow ? 0.3 : 0.52));
  const SH = Math.round(CH * 0.66);
  const GAP = narrow ? 10 : Math.round(clamp(W * 0.032, 18, 40));
  const STEP = CW * 0.9; // drag distance for one card
  const cy = Math.round(H * 0.47);
  const geo = useRef({ W, H, CW, CH, cy, STEP });
  geo.current = { W, H, CW, CH, cy, STEP };

  // where we are: a float index of the card in the middle
  const pos = useMotionValue(0);
  const [index, setIndex] = useState(0);
  useEffect(() => pos.on("change", (v) => setIndex(loop ? wrap(Math.round(v)) : clamp(Math.round(v), 0, n - 1))), [pos, n, loop, wrap]);
  const anim = useRef<AnimationPlaybackControls | null>(null);
  // where it's heading, so quick key presses add up instead of restarting from wherever it is mid-flight
  const target = useRef(0);
  const goTo = useCallback(
    (i: number, velocity = 0) => {
      anim.current?.stop();
      const to = loop ? i : clamp(i, 0, n - 1);
      target.current = to;
      if (reduced) {
        pos.set(to);
        return;
      }
      anim.current = animate(pos, to, { type: "spring", stiffness: 120, damping: 20, velocity });
    },
    [pos, n, reduced, loop],
  );

  // ─── drawing ───
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    // stand-ins first, then the real pictures one at a time, nearest the middle first, so nothing blocks
    const painted = cards.map((c, i) => placeholder(c, i, CW, CH));
    let alive = true;
    const queue = cards.map((_, i) => i).sort((a, b) => {
      const p0 = ((Math.round(pos.get()) % n) + n) % n;
      const d = (i: number) => Math.min(Math.abs(i - p0), n - Math.abs(i - p0));
      return d(a) - d(b);
    });
    let timer = 0;
    const next = () => {
      if (!alive) return;
      const i = queue.shift();
      if (i === undefined) return;
      const c = cards[i];
      if (c.image) {
        loadImage(c.image)
          .then(({ im, tainted }) => {
            if (alive) painted[i] = paintCard(c, i, CW, CH, dpr, im, tainted);
          })
          .catch(() => {
            if (alive) painted[i] = paintCard(c, i, CW, CH, dpr);
          });
      } else painted[i] = paintCard(c, i, CW, CH, dpr);
      timer = window.setTimeout(next, 16);
    };
    timer = window.setTimeout(next, 0);

    // the card's soft shadow, blurred once and stretched as the card turns
    const SP = 44;
    const shadow = mk(CW + SP * 2, CH + SP * 2);
    {
      const sg = shadow.getContext("2d")!;
      sg.filter = "blur(15px)";
      sg.fillStyle = "rgba(20,16,40,.26)";
      sg.beginPath();
      sg.roundRect(SP + 4, SP + 14, CW - 8, CH - 6, 14);
      sg.fill();
    }

    // the smear is computed at low resolution and stretched up; it's soft by nature
    const bw = Math.round(clamp(W / 7, 36, 160));
    const bh = Math.round(clamp(H / 2, 120, 260));
    const buf = mk(bw, bh);
    const bctx = buf.getContext("2d")!;
    const img = bctx.createImageData(bw, bh);
    const D = img.data;
    // per-row fibre noise: neighbouring rows pull from slightly different columns, which reads as streaks
    const rf = mulberry(99);
    const FIB = new Float32Array(SMH + 2);
    let acc = 0;
    for (let k = 0; k < FIB.length; k++) {
      acc = acc * 0.55 + (rf() * 2 - 1) * 0.45;
      FIB[k] = acc * 1.6;
    }

    const cx = W / 2;
    const R = Math.max(6, Math.round(CW * 0.045));
    let lastP = pos.get();
    let vel = 0;
    let time = 0;
    let raf = 0;
    let lastT = performance.now();

    const drawSmear = (P: Painted, side: 1 | -1, xo: number, h0: number, L: number, s: number, alpha: number, mir: boolean) => {
      const Ls = L * s;
      if (Ls < 3 || alpha < 0.02) return;
      const FL = Math.max(36, L * 0.6);
      const HT = H * 1.1;
      const hAt = (x: number) => h0 + (HT - h0) * Math.pow(Math.min(x / FL, 3), 2.5);
      const X = (x: number) => xo + side * x;
      const N = 30;
      const outline = new Path2D();
      const topP = new Path2D();
      const botP = new Path2D();
      outline.moveTo(X(-R * 2), cy - h0 / 2);
      for (let k = 0; k <= N; k++) {
        const x = (Ls * k) / N;
        const y = cy - hAt(x) / 2;
        outline.lineTo(X(x), y);
        if (k === 0) topP.moveTo(X(x + R), y);
        else topP.lineTo(X(x), y);
      }
      for (let k = N; k >= 0; k--) {
        const x = (Ls * k) / N;
        outline.lineTo(X(x), cy + hAt(x) / 2);
      }
      for (let k = 0; k <= N; k++) {
        const x = (Ls * k) / N;
        if (k === 0) botP.moveTo(X(x + R), cy + hAt(x) / 2);
        else botP.lineTo(X(x), cy + hAt(x) / 2);
      }
      outline.lineTo(X(-R * 2), cy + h0 / 2);
      outline.closePath();

      ctx.save();
      ctx.globalAlpha = alpha;
      // a soft shadow lifts it off the page: wide faint strokes along both curves, half hidden under the fill
      ctx.save();
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(40,30,80,.045)";
      for (const lw of [26, 15, 7]) {
        ctx.lineWidth = lw * Math.min(1, s * 1.4);
        ctx.stroke(topP);
        ctx.stroke(botP);
      }
      ctx.restore();

      ctx.save();
      ctx.clip(outline);
      if (P.small) {
        const S = P.small;
        const tipFade = s < 0.985;
        for (let bx = 0; bx < bw; bx++) {
          const x = ((bx + 0.5) / bw) * Ls;
          const t = Math.min(1, x / L);
          const hh = hAt(x) / 2;
          const r0 = Math.max(0, Math.floor(((cy - hh) / H) * bh) - 2);
          const r1 = Math.min(bh - 1, Math.ceil(((cy + hh) / H) * bh) + 2);
          // which column of the card this part of the smear is pulled from: its outer edge first, then further in
          const drift = 0.34 * (1 - Math.pow(1 - t, 1.7));
          const ud0 = side > 0 ? 1 - drift : drift;
          const amp = 0.12 * Math.pow(t, 0.85);
          const tipA = tipFade ? clamp((Ls - x) / (Ls * 0.35 + 6), 0, 1) : 1;
          const lift = 1.1 + 0.32 * t;
          const p1 = 6.5 * t - 1.6 * time;
          const p2 = 12.5 * t + 1.1 * time + 1.3;
          const p3 = 23 * t - 2.7 * time + 2.1;
          for (let by = r0; by <= r1; by++) {
            const y = ((by + 0.5) / bh) * H;
            let v = (y - cy) / hh;
            v = v < -1 ? -1 : v > 1 ? 1 : v;
            const tb = 0.55 * Math.sin(p1 + v * 2.3) + 0.3 * Math.sin(p2 - v * 4.1) + 0.15 * Math.sin(p3 + v * 7.7);
            let vs = v + tb * amp;
            vs = vs < -1 ? -1 : vs > 1 ? 1 : vs;
            const fy = (vs * 0.5 + 0.5) * (SMH - 1);
            const fi = fy | 0;
            const ay = fy - fi;
            const fib = FIB[fi] * (1 - ay) + FIB[fi + 1] * ay;
            let ud = ud0 + fib * 0.07 * t;
            ud = ud < 0 ? 0 : ud > 1 ? 1 : ud;
            const fx = (mir ? 1 - ud : ud) * (SMW - 1);
            const x0 = fx | 0;
            const ax = fx - x0;
            const x1 = x0 < SMW - 1 ? x0 + 1 : x0;
            const y1 = fi < SMH - 1 ? fi + 1 : fi;
            const i00 = (fi * SMW + x0) * 4;
            const i10 = (fi * SMW + x1) * 4;
            const i01 = (y1 * SMW + x0) * 4;
            const i11 = (y1 * SMW + x1) * 4;
            const k = (by * bw + bx) * 4;
            const lum = lift * (1 + fib * 0.09 * t);
            let r = 0;
            let gg = 0;
            let bb = 0;
            for (let ch = 0; ch < 3; ch++) {
              const top = S[i00 + ch] + (S[i10 + ch] - S[i00 + ch]) * ax;
              const bot = S[i01 + ch] + (S[i11 + ch] - S[i01 + ch]) * ax;
              const val = (top + (bot - top) * ay) * lum;
              if (ch === 0) r = val;
              else if (ch === 1) gg = val;
              else bb = val;
            }
            // a little more saturated than the card itself, the way light streaks read
            const l = r * 0.3 + gg * 0.59 + bb * 0.11;
            D[k] = l + (r - l) * 1.3;
            D[k + 1] = l + (gg - l) * 1.3;
            D[k + 2] = l + (bb - l) * 1.3;
            D[k + 3] = 255 * tipA;
          }
        }
        bctx.putImageData(img, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        if (side > 0) ctx.drawImage(buf, xo, 0, Ls, H);
        else {
          ctx.translate(xo, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(buf, 0, 0, Ls, H);
        }
      } else {
        // a photo we can't read: stretch its outer columns instead
        const tex = P.tex;
        const col = Math.round(((side > 0) !== mir ? 0.02 : 0.96) * tex.width);
        ctx.drawImage(tex, col, 0, Math.max(2, tex.width * 0.02), tex.height, side > 0 ? xo : xo - Ls, cy - H * 0.6, Ls, H * 1.2);
      }
      ctx.restore();

      // the iridescent rim along both curves
      const gr = ctx.createLinearGradient(xo, 0, xo + side * Math.max(L, 40), 0);
      gr.addColorStop(0, "rgba(255,255,255,0)");
      gr.addColorStop(0.1, "rgba(255,150,220,.95)");
      gr.addColorStop(0.32, "rgba(255,226,140,.95)");
      gr.addColorStop(0.55, "rgba(130,232,255,.95)");
      gr.addColorStop(0.78, "rgba(176,140,255,.95)");
      gr.addColorStop(1, "rgba(255,160,230,.9)");
      ctx.strokeStyle = gr;
      ctx.lineJoin = "round";
      ctx.globalAlpha = alpha * s * 0.22;
      ctx.lineWidth = 6;
      ctx.stroke(topP);
      ctx.stroke(botP);
      ctx.globalAlpha = alpha * Math.min(1, s * 1.3);
      ctx.lineWidth = 1.6;
      ctx.stroke(topP);
      ctx.stroke(botP);
      ctx.restore();
    };

    const drawCard = (P: Painted, xc: number, w: number, h: number, cosA: number, alpha: number, blur: number) => {
      const dw = w * Math.abs(cosA);
      if (dw < 1 || alpha < 0.02) return;
      const mir = cosA < 0;
      const r = R * (h / CH);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(xc, cy);
      // shadow
      const kx = dw / CW;
      const ky = h / CH;
      ctx.drawImage(shadow, -dw / 2 - SP * kx, -h / 2 - SP * ky, (CW + SP * 2) * kx, (CH + SP * 2) * ky);
      if (mir) ctx.scale(-1, 1);
      // moving fast: faint trailing copies, then the card itself on top
      const trail = blur > 1 ? 4 : 0;
      for (let k = trail; k >= 0; k--) {
        ctx.save();
        if (k > 0) ctx.globalAlpha = alpha * 0.16;
        const o = k > 0 ? (k / trail) * blur * (vel > 0 ? 1 : -1) * (mir ? -1 : 1) : 0;
        ctx.beginPath();
        ctx.roundRect(-dw / 2 + o, -h / 2, dw, h, r);
        ctx.clip();
        ctx.drawImage(P.tex, -dw / 2 + o, -h / 2, dw, h);
        ctx.restore();
      }
      // turning away darkens it a touch
      const shade = 0.42 * (1 - Math.abs(cosA));
      if (shade > 0.01) {
        ctx.fillStyle = `rgba(0,0,0,${shade})`;
        ctx.beginPath();
        ctx.roundRect(-dw / 2, -h / 2, dw, h, r);
        ctx.fill();
      }
      ctx.restore();
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.max(1 / 240, Math.min(0.05, (now - lastT) / 1000));
      lastT = now;
      if (!inViewRef.current) return;
      const p = pos.get();
      vel += ((p - lastP) / dt - vel) * 0.3;
      lastP = p;
      if (!reduced) time += dt * (0.45 + Math.min(3.5, Math.abs(vel) * 2.2));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const slot = CW / 2 + GAP + SW / 2;
      const slots: number[] = [];
      for (let k = Math.floor(p) - 2; k <= Math.ceil(p) + 2; k++) if (loop || (k >= 0 && k < n)) slots.push(k);
      slots.sort((a, b) => Math.abs(b - p) - Math.abs(a - p));
      for (const k of slots) {
        const o = k - p;
        const a = Math.abs(o);
        if (a > 2.05) continue;
        const P = painted[((k % n) + n) % n];
        const side = (o >= 0 ? 1 : -1) as 1 | -1;
        let xc: number;
        let w: number;
        let h: number;
        let alpha = 1;
        if (a <= 1) {
          const e = smooth(a);
          xc = lerp(cx, cx + side * slot, e);
          w = lerp(CW, SW, e);
          h = lerp(CH, SH, e);
        } else {
          const f = a - 1;
          xc = lerp(cx + side * slot, side > 0 ? W + SW * 0.7 : -SW * 0.7, smooth(f));
          w = SW * (1 - 0.35 * f);
          h = SH * (1 - 0.15 * f);
          alpha = 1 - smooth(clamp((f - 0.1) / 0.8, 0, 1));
        }
        const cosA = Math.cos(Math.PI * Math.min(a, 1));
        const s = a <= 1 ? smooth(clamp((a - 0.3) / 0.7, 0, 1)) : 1;
        const dw = w * Math.abs(cosA);
        const xo = xc + side * dw / 2;
        const L = side > 0 ? W + 8 - xo : xo + 8;
        if (s > 0.01 && L > 2) drawSmear(P, side, xo, h, L, s, alpha, cosA < 0);
        const blur = a < 0.5 && !reduced ? clamp(Math.abs(vel) * 6, 0, 12) : 0;
        drawCard(P, xc, w, h, cosA, alpha, blur);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      alive = false;
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [W, H, CW, CH, SW, SH, GAP, cy, cards, pos, reduced, loop, n]);

  // ─── dragging, flinging, scrolling ───
  const drag = useRef<{ x0: number; p0: number; hist: [number, number][]; moved: boolean } | null>(null);
  const onDown = (e: RPointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    anim.current?.stop();
    drag.current = { x0: e.clientX, p0: pos.get(), hist: [[performance.now(), pos.get()]], moved: false };
  };
  const onMove = (e: RPointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x0;
    if (Math.abs(dx) > 4) d.moved = true;
    let p = d.p0 - dx / STEP;
    if (!loop && p < 0) p *= 0.35;
    if (!loop && p > n - 1) p = n - 1 + (p - (n - 1)) * 0.35;
    pos.set(p);
    const now = performance.now();
    d.hist.push([now, p]);
    while (d.hist.length > 2 && now - d.hist[0][0] > 100) d.hist.shift();
  };
  const onUp = (e: RPointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (!d.moved) {
      // a click on a side card brings it in; on the middle one, selects it
      const r = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - r.left;
      const p = pos.get();
      if (x > W / 2 + CW / 2) goTo(Math.round(p) + 1);
      else if (x < W / 2 - CW / 2) goTo(Math.round(p) - 1);
      else onSelect?.(cards[wrap(Math.round(p))]);
      return;
    }
    const [t0, p0] = d.hist[0];
    const [t1, p1] = d.hist[d.hist.length - 1];
    const v = performance.now() - t1 > 90 || t1 - t0 < 10 ? 0 : ((p1 - p0) / (t1 - t0)) * 1000;
    goTo(Math.round(pos.get() + v * 0.2), v);
  };
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let settle = 0;
    const onWheel = (e: WheelEvent) => {
      const k = e.deltaMode === 1 ? 16 : 1;
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!dx) return;
      e.preventDefault();
      anim.current?.stop();
      const next = pos.get() + (dx * k) / (geo.current.STEP * 1.3);
      pos.set(loop ? next : clamp(next, -0.35, n - 0.65));
      clearTimeout(settle);
      settle = window.setTimeout(() => goTo(Math.round(pos.get())), 130);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      clearTimeout(settle);
    };
  }, [goTo, n, pos, loop]);
  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const at = target.current;
    const here = loop ? wrap(at) : at;
    if (e.key === "ArrowRight") goTo(at + 1);
    else if (e.key === "ArrowLeft") goTo(at - 1);
    else if (e.key === "Home") goTo(loop ? at - here : 0);
    else if (e.key === "End") goTo(loop ? at + (n - 1 - here) : n - 1);
    else if (e.key === "Enter" || e.key === " ") onSelect?.(cards[wrap(Math.round(pos.get()))]);
    else return;
    e.preventDefault();
  };

  // ─── autoplay: flick through, back and forth ───
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gs = useMotionValue(1);
  const go = useMotionValue(0);
  useEffect(() => {
    if (!autoplay || reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let alive = true;
    const own = new Set<AnimationPlaybackControls>();
    const abort = () => {
      if (!alive) return;
      alive = false;
      own.forEach((c) => c.stop());
      animate(go, 0, { duration: 0.2 });
    };
    const onTouch = (e: Event) => e.isTrusted && abort();
    root.addEventListener("pointerdown", onTouch, true);
    root.addEventListener("keydown", onTouch, true);
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        let left = ms;
        let lt = performance.now();
        const tk = () => {
          if (!alive) return rej(STOP);
          const t = performance.now();
          if (inViewRef.current) left -= t - lt;
          lt = t;
          if (left <= 0) res();
          else setTimeout(tk, Math.min(60, Math.max(16, left)));
        };
        tk();
      });
    const run = (mv: MotionValue<number>, v: number, duration: number, ease: [number, number, number, number] = [0.4, 0, 0.2, 1]) =>
      new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        if (Math.abs(mv.get() - v) < 0.01) return res();
        const c = animate(mv, v, { duration, ease, onComplete: () => (own.delete(c), res()) });
        own.add(c);
      });
    const flick = async (dir: 1 | -1) => {
      const { W: w, CW: cw, cy: y0, STEP: step } = geo.current;
      const x = w / 2 + dir * cw * 0.28;
      const y = y0 + cw * 0.2;
      gx.set(x + 34);
      gy.set(y + 46);
      await run(go, 1, 0.25);
      await Promise.all([run(gx, x, 0.35), run(gy, y, 0.35)]);
      await run(gs, 0.8, 0.08);
      anim.current?.stop();
      const p0 = pos.get();
      const dist = step * 0.75;
      const prog = motionValue(0);
      const off = prog.on("change", (k) => {
        gx.set(x - dir * dist * k);
        pos.set(p0 + ((dist * k) / step) * dir);
      });
      await run(prog, 1, 0.26, [0.5, 0, 0.7, 1]);
      off();
      goTo(Math.round(pos.get() + dir * 0.6), dir * 4);
      await run(gs, 1, 0.1);
      await run(go, 0, 0.3);
    };
    (async () => {
      await wait(1400);
      let dir: 1 | -1 = 1;
      while (alive) {
        for (let k = 0; k < n - 1; k++) {
          await flick(dir);
          await wait(1700);
        }
        if (!loop) dir = dir === 1 ? -1 : 1;
      }
    })().catch((e) => e !== STOP && console.error(e));
    return () => {
      abort();
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced, n, loop]);

  const ic = (k: keyof typeof ICON, s = 16) => <svg viewBox={`0 0 ${ICON[k].vb} ${ICON[k].vb}`} width={s} height={s} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON[k].body }} />;
  const cur = cards[index];
  const key = "grid h-[22px] w-[22px] place-items-center rounded-[6px] border border-black/[.1] bg-white/70 text-[#3a3a3e] shadow-[0_1px_0_rgba(0,0,0,.06)] outline-none transition-opacity hover:bg-white focus-visible:ring-2 focus-visible:ring-[#0071e3] disabled:opacity-35";

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Cards"
      tabIndex={0}
      onKeyDown={onKey}
      className={`relative w-full max-w-[1120px] select-none overflow-hidden rounded-[24px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] ${className}`}
      style={{ height: H, background: `radial-gradient(70% 60% at 50% 45%, #f8f8fa, ${BG})` }}
    >
      <canvas
        ref={cvRef}
        aria-hidden="true"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="absolute inset-0 h-full w-full cursor-grab [touch-action:pan-y] active:cursor-grabbing"
      />
      {onSelect && (
        <button
          type="button"
          onClick={() => onSelect(cur)}
          className="absolute left-1/2 flex h-8 items-center gap-1.5 rounded-full bg-[#1d1d1f] px-3.5 text-[12.5px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
          style={{ top: cy + CH / 2 + 18, transform: "translateX(-50%)" }}
        >
          {actionLabel}
          {ic("open", 11)}
        </button>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-3.5 flex items-center justify-center gap-1.5 text-[12px] text-[#6b6b70] sm:bottom-4">
        <span>Drag, scroll or use</span>
        <button type="button" aria-label="Previous card" onClick={() => goTo(target.current - 1)} disabled={!loop && index === 0} className={`pointer-events-auto ${key}`}>
          {ic("left", 10)}
        </button>
        <button type="button" aria-label="Next card" onClick={() => goTo(target.current + 1)} disabled={!loop && index === n - 1} className={`pointer-events-auto ${key}`}>
          {ic("right", 10)}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {`${cur.title}, ${cur.subtitle}${cur.stat ? `. ${cur.stat}` : ""}. Card ${index + 1} of ${n}.`}
      </p>

      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-30 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-[#1d1d1f]/20 shadow-[0_4px_14px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
      />
    </div>
  );
}
