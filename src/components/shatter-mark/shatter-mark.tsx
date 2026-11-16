"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { motion, useReducedMotion } from "framer-motion";
import {
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

/** one piece of the mark, in a 64 by 64 box: a path that's filled, stroked with round ends when it has a stroke width,
 * or cut out of what's drawn before it when `cut` is set */
export type MarkPart = { d: string; stroke?: number; cut?: boolean };
export type ShatterMarkProps = {
  /** the mark, as paths in a 64 by 64 box; a bolt by default */
  parts?: MarkPart[];
  /** what the mark is called, for screen readers and the caption */
  label?: string;
  /** a line under the mark; empty for none */
  caption?: string;
  /** Soft synthesised sounds as you use it. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

// ───────────── sound: small synthesised notes, no audio files. The browser keeps it silent until the visitor has
// clicked or pressed a key somewhere on the page, so autoplay only makes sound once someone is using the page. ─────────────

type Engine = { ctx: AudioContext; noise: AudioBuffer };
const ENGINE_KEY = "__uiSoundEngine";
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = {
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  glide?: number;
  bell?: number;
};
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (from: number, to: number, o?: { at?: number; dur?: number; gain?: number }) => void;
  /** a tiny dry click */
  tick: (o?: { at?: number; freq?: number; gain?: number }) => void;
};

function useSound(enabled: boolean, volume: number, allow: () => boolean = () => true): Sound {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [enabled]);
  const on = useRef(enabled);
  const vol = useRef(Math.max(0, Math.min(1, volume)));
  const allowRef = useRef(allow);
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
    allowRef.current = allow;
  });
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running" ? e : null;
    };
    const env = (ctx: AudioContext, t: number, peak: number, attack: number, dur: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      return g;
    };
    return {
      note(freq, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = o.dur ?? 0.3;
        const peak = (o.gain ?? 0.14) * vol.current;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 7000;
        lp.connect(ctx.destination);
        const g = env(ctx, t, peak, 0.006, dur);
        g.connect(lp);
        const a = ctx.createOscillator();
        a.type = o.type ?? "sine";
        a.frequency.setValueAtTime(freq, t);
        if (o.glide) a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide) b.frequency.exponentialRampToValueAtTime(o.glide * 2.76, t + dur * 0.6);
          b.connect(g2);
          b.start(t);
          b.stop(t + dur * 0.4 + 0.05);
        }
      },
      whoosh(from, to, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = Math.min(0.95, o.dur ?? 0.4);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = ctx.createGain();
        const peak = (o.gain ?? 0.08) * vol.current;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.3);
        src.stop(t + dur + 0.05);
      },
      tick(o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.005 + (o.at ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = o.freq ?? 3200;
        bp.Q.value = 4;
        const g = env(ctx, t, (o.gain ?? 0.09) * vol.current, 0.001, 0.03);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.5);
        src.stop(t + 0.05);
      },
    } satisfies Sound;
  }, []);
}

/** a circle as a path, for marks built from them */
export const circlePath = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
/** the default mark, for a made-up studio called Volt: a heavy bolt with sharp points, made to break well */
const BOLT: MarkPart[] = [{ d: "M39.5 5L13 36.5H29.5L22.5 60L51.5 25.5H35.5L44.5 5Z" }];

// the mark's square, in the 64 box: centred on (32, CY), reaching HALF either way; logo units run -1 to 1 across it
const HALF = 29;
const CY = 32.5;
const TEX = 512;
const DEPTH = 0.12; // half the mark's thickness
const CAM = 3.4;

// ---------------------------------------------------------------- the mark, rasterised: a sharp mask and a soft height

function rasterise(parts: MarkPart[]) {
  const c = document.createElement("canvas");
  c.width = c.height = TEX;
  const ctx = c.getContext("2d")!;
  const k = TEX / (2 * HALF);
  ctx.setTransform(k, 0, 0, k, -(32 - HALF) * k, -(CY - HALF) * k);
  ctx.fillStyle = ctx.strokeStyle = "#fff";
  ctx.lineCap = ctx.lineJoin = "round";
  for (const p of parts) {
    const path = new Path2D(p.d);
    ctx.globalCompositeOperation = p.cut ? "destination-out" : "source-over";
    if (p.stroke) {
      ctx.lineWidth = p.stroke;
      ctx.stroke(path);
    } else ctx.fill(path);
  }
  ctx.globalCompositeOperation = "source-over";
  const src = ctx.getImageData(0, 0, TEX, TEX).data;
  const sharp = new Float32Array(TEX * TEX);
  for (let i = 0; i < sharp.length; i++) sharp[i] = src[i * 4 + 3] / 255;
  // soft copies (three box blurs each way, about a gaussian): a tight one whose slope is the bevel, and a wide one
  // that domes each part a little, so the polish catches a gradient across it instead of one flat tone
  const blur = (R: number) => {
    let a = Float32Array.from(sharp);
    let b = new Float32Array(sharp.length);
    for (let pass = 0; pass < 3; pass++) {
      for (const horiz of [true, false]) {
        for (let line = 0; line < TEX; line++) {
          let acc = 0;
          const at = (i: number) => (horiz ? line * TEX + i : i * TEX + line);
          for (let i = -R; i <= R; i++) acc += a[at(Math.max(0, Math.min(TEX - 1, i)))];
          for (let i = 0; i < TEX; i++) {
            b[at(i)] = acc / (2 * R + 1);
            acc += a[at(Math.min(TEX - 1, i + R + 1))] - a[at(Math.max(0, i - R))];
          }
        }
        [a, b] = [b, a];
      }
    }
    return a;
  };
  const a = blur(4);
  const wide = blur(22);
  const rgba = new Uint8Array(TEX * TEX * 4);
  for (let i = 0; i < sharp.length; i++) {
    rgba[i * 4] = sharp[i] * 255;
    rgba[i * 4 + 1] = Math.min(255, a[i] * 255);
    rgba[i * 4 + 2] = Math.min(255, wide[i] * 255);
    rgba[i * 4 + 3] = 255;
  }
  return { rgba, sharp, canvas: c };
}

const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type V3 = [number, number, number];
type Shard = {
  t: [V3, V3, V3]; // its three corners, in place
  c: V3; // its centre
  n: V3; // which way it faces, in place
  kind: number; // 0 on the front face, 1 on the back, 2 on a side
  ax: V3; // the axis it tumbles about
  r: number[]; // its own random numbers
  k: number; // its spring
  o: Float64Array; // offset x, y, z, then angle
  vel: Float64Array; // and their speeds
  broken: boolean;
};

/**
 * The mark as a solid: a front, a back and the sides between them along its outline, and the whole surface cut
 * into thin triangles, the way a 3D model is. The front and back are cut by straight lines right across them and
 * fanned into slivers; the sides are cut along the outline at uneven lengths, each strip split corner to corner into
 * two long needles. When it breaks, every one of these triangles comes away on its own, as a thin plane.
 */
function buildMesh(sharp: Float32Array) {
  const rand = rng(11);
  type Pt = [number, number];
  const at = (x: number, y: number) => {
    if (x < -1 || x > 1 || y < -1 || y > 1) return 0;
    return sharp[Math.round(((1 - y) / 2) * (TEX - 1)) * TEX + Math.round(((x + 1) / 2) * (TEX - 1))];
  };
  const shards: Shard[] = [];
  const add = (t: [V3, V3, V3], n: V3, kind: number) => {
    const c: V3 = [
      (t[0][0] + t[1][0] + t[2][0]) / 3,
      (t[0][1] + t[1][1] + t[2][1]) / 3,
      (t[0][2] + t[1][2] + t[2][2]) / 3,
    ];
    let ax = [rand() - 0.5, rand() - 0.5, rand() - 0.5];
    const l = Math.hypot(ax[0], ax[1], ax[2]) || 1;
    ax = ax.map((v) => v / l);
    shards.push({
      t,
      c,
      n,
      kind,
      ax: ax as V3,
      r: Array.from({ length: 8 }, rand),
      k: 110 + rand() * 130,
      o: new Float64Array(4),
      vel: new Float64Array(4),
      broken: false,
    });
  };

  // the faces: straight cuts right across, fanned into slivers, keeping what overlaps the mark
  let polys: Pt[][] = [
    [
      [-1.05, -1.05],
      [1.05, -1.05],
      [1.05, 1.05],
      [-1.05, 1.05],
    ],
  ];
  for (let l = 0; l < 40; l++) {
    const px = (rand() * 2 - 1) * 0.9;
    const py = (rand() * 2 - 1) * 0.9;
    const th = rand() * Math.PI;
    const nx = Math.cos(th);
    const ny = Math.sin(th);
    const d = px * nx + py * ny;
    const next: Pt[][] = [];
    for (const poly of polys) {
      const a: Pt[] = [];
      const b: Pt[] = [];
      for (let i = 0; i < poly.length; i++) {
        const P = poly[i];
        const Q = poly[(i + 1) % poly.length];
        const sp = P[0] * nx + P[1] * ny - d;
        const sq = Q[0] * nx + Q[1] * ny - d;
        (sp >= 0 ? a : b).push(P);
        if (sp >= 0 !== sq >= 0) {
          const t = sp / (sp - sq);
          const m: Pt = [P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t];
          a.push(m);
          b.push(m);
        }
      }
      if (a.length >= 3) next.push(a);
      if (b.length >= 3) next.push(b);
    }
    polys = next;
  }
  for (const poly of polys)
    for (let i = 1; i < poly.length - 1; i++) {
      const tri: Pt[] = [poly[0], poly[i], poly[i + 1]];
      const area =
        Math.abs(
          (tri[1][0] - tri[0][0]) * (tri[2][1] - tri[0][1]) - (tri[2][0] - tri[0][0]) * (tri[1][1] - tri[0][1]),
        ) / 2;
      if (area < 1e-5) continue;
      const probes: Pt[] = [...tri, [(tri[0][0] + tri[1][0] + tri[2][0]) / 3, (tri[0][1] + tri[1][1] + tri[2][1]) / 3]];
      for (let e = 0; e < 3; e++)
        for (const k of [0.25, 0.5, 0.75])
          probes.push([
            tri[e][0] + (tri[(e + 1) % 3][0] - tri[e][0]) * k,
            tri[e][1] + (tri[(e + 1) % 3][1] - tri[e][1]) * k,
          ]);
      if (!probes.some(([x, y]) => at(x, y) > 0.4)) continue;
      add(
        [
          [tri[0][0], tri[0][1], DEPTH],
          [tri[1][0], tri[1][1], DEPTH],
          [tri[2][0], tri[2][1], DEPTH],
        ],
        [0, 0, 1],
        0,
      );
      add(
        [
          [tri[0][0], tri[0][1], -DEPTH],
          [tri[2][0], tri[2][1], -DEPTH],
          [tri[1][0], tri[1][1], -DEPTH],
        ],
        [0, 0, -1],
        1,
      );
    }

  // the sides: trace the outline (marching squares on a coarser grid), then walk it in uneven steps
  const G = 220;
  const val = (i: number, j: number) => at((i / (G - 1)) * 2 - 1, 1 - (j / (G - 1)) * 2);
  const xy = (i: number, j: number): Pt => [(i / (G - 1)) * 2 - 1, 1 - (j / (G - 1)) * 2];
  const segs: [Pt, Pt][] = [];
  const lerp = (p: Pt, q: Pt, a: number, b: number): Pt => {
    const t = (0.5 - a) / (b - a || 1e-6);
    return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  };
  for (let j = 0; j < G - 1; j++)
    for (let i = 0; i < G - 1; i++) {
      const a = val(i, j);
      const b = val(i + 1, j);
      const c = val(i + 1, j + 1);
      const d = val(i, j + 1);
      const code = (a > 0.5 ? 8 : 0) | (b > 0.5 ? 4 : 0) | (c > 0.5 ? 2 : 0) | (d > 0.5 ? 1 : 0);
      if (code === 0 || code === 15) continue;
      const T = lerp(xy(i, j), xy(i + 1, j), a, b);
      const Rr = lerp(xy(i + 1, j), xy(i + 1, j + 1), b, c);
      const B = lerp(xy(i, j + 1), xy(i + 1, j + 1), d, c);
      const L = lerp(xy(i, j), xy(i, j + 1), a, d);
      const table: Record<number, [Pt, Pt][]> = {
        1: [[L, B]],
        2: [[B, Rr]],
        3: [[L, Rr]],
        4: [[T, Rr]],
        5: [
          [L, T],
          [B, Rr],
        ],
        6: [[T, B]],
        7: [[L, T]],
        8: [[L, T]],
        9: [[T, B]],
        10: [
          [L, B],
          [T, Rr],
        ],
        11: [[T, Rr]],
        12: [[L, Rr]],
        13: [[B, Rr]],
        14: [[L, B]],
      };
      for (const sgm of table[code]) segs.push(sgm);
    }
  // chain the little segments into loops
  const key = (q: Pt) => `${q[0].toFixed(5)},${q[1].toFixed(5)}`;
  const ends = new Map<string, number[]>();
  segs.forEach(([a, b], i) => {
    for (const q of [a, b]) {
      const k = key(q);
      if (!ends.has(k)) ends.set(k, []);
      ends.get(k)!.push(i);
    }
  });
  const used = new Uint8Array(segs.length);
  const loops: Pt[][] = [];
  for (let s0 = 0; s0 < segs.length; s0++) {
    if (used[s0]) continue;
    used[s0] = 1;
    const loop: Pt[] = [segs[s0][0], segs[s0][1]];
    for (;;) {
      const tail = loop[loop.length - 1];
      const nexts = (ends.get(key(tail)) ?? []).filter((i) => !used[i]);
      if (!nexts.length) break;
      const i = nexts[0];
      used[i] = 1;
      const [a, b] = segs[i];
      loop.push(key(a) === key(tail) ? b : a);
    }
    if (loop.length > 6) loops.push(loop);
  }
  for (const loop of loops) {
    // walk it, dropping a corner every so often (uneven, so the strips are all different widths)
    const pts: Pt[] = [loop[0]];
    let acc = 0;
    let step = 0.04 + rand() * 0.16;
    for (let i = 1; i < loop.length; i++) {
      acc += Math.hypot(loop[i][0] - loop[i - 1][0], loop[i][1] - loop[i - 1][1]);
      if (acc >= step) {
        pts.push(loop[i]);
        acc = 0;
        step = 0.04 + rand() * 0.16;
      }
    }
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      let nx = b[1] - a[1];
      let ny = -(b[0] - a[0]);
      const l = Math.hypot(nx, ny) || 1;
      nx /= l;
      ny /= l;
      // outward is where the mark isn't
      const mx = (a[0] + b[0]) / 2;
      const my = (a[1] + b[1]) / 2;
      if (at(mx + nx * 0.02, my + ny * 0.02) > 0.5) {
        nx = -nx;
        ny = -ny;
      }
      const A1: V3 = [a[0], a[1], DEPTH];
      const B1: V3 = [b[0], b[1], DEPTH];
      const B0: V3 = [b[0], b[1], -DEPTH];
      const A0: V3 = [a[0], a[1], -DEPTH];
      if (rand() < 0.5) {
        add([A1, B1, B0], [nx, ny, 0], 2);
        add([A1, B0, A0], [nx, ny, 0], 2);
      } else {
        add([A1, B1, A0], [nx, ny, 0], 2);
        add([B1, B0, A0], [nx, ny, 0], 2);
      }
    }
  }
  return shards;
}

// ---------------------------------------------------------------- the renderer (WebGL, with a 2D canvas behind it)

const VS = `
attribute vec3 aPos; attribute vec3 aCen; attribute vec3 aN; attribute float aKind; attribute vec3 aOff; attribute vec4 aQ;
uniform vec2 uTilt; uniform vec2 uScale; uniform float uOffY;
varying vec2 vUV; varying vec3 vR0; varying vec3 vR1; varying vec3 vR2; varying vec3 vN; varying float vKind; varying float vLift; varying vec3 vPos;
vec3 qrot(vec4 q, vec3 v) { return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v); }
void main() {
  vec3 p = qrot(aQ, aPos - aCen) + aCen + aOff;
  float cy = cos(uTilt.y), sy = sin(uTilt.y), cx = cos(uTilt.x), sx = sin(uTilt.x);
  mat3 G = mat3(1.0, 0.0, 0.0, 0.0, cx, sx, 0.0, -sx, cx) * mat3(cy, 0.0, -sy, 0.0, 1.0, 0.0, sy, 0.0, cy);
  p = G * p;
  vPos = p;
  float f = ${CAM.toFixed(2)} / (${CAM.toFixed(2)} - p.z);
  gl_Position = vec4(p.x * f * uScale.x, p.y * f * uScale.y + uOffY, -p.z * 0.2, 1.0);
  vUV = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  vR0 = G * qrot(aQ, vec3(1.0, 0.0, 0.0));
  vR1 = G * qrot(aQ, vec3(0.0, 1.0, 0.0));
  vR2 = G * qrot(aQ, vec3(0.0, 0.0, 1.0));
  vN = G * qrot(aQ, aN);
  vKind = aKind; vLift = length(aOff) + abs(aQ.x) + abs(aQ.y) + abs(aQ.z);
}`;
const FS = `
precision highp float;
uniform sampler2D uMask; uniform vec3 uL; uniform float uT;
varying vec2 vUV; varying vec3 vR0; varying vec3 vR1; varying vec3 vR2; varying vec3 vN; varying float vKind; varying float vLift; varying vec3 vPos;
float h(vec2 uv) { return texture2D(uMask, uv).g; }
float w(vec2 uv) { return texture2D(uMask, uv).b; }
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) { return noise(p) * 0.55 + noise(p * 2.1 + 3.7) * 0.28 + noise(p * 4.3 + 9.1) * 0.17; }
// the world the chrome reflects: an overcast sky with cloud, a sharp horizon, dark rocky ground, a lamp where the pointer is
vec3 env(vec3 R) {
  float y = R.y;
  vec2 sp = R.xz / (max(y, 0.0) + 0.28);
  vec3 sky = mix(vec3(0.8, 0.81, 0.83), vec3(0.4, 0.42, 0.46), smoothstep(0.0, 0.9, y));
  sky += (fbm(sp * 2.2) - 0.5) * vec3(0.5, 0.5, 0.52) * smoothstep(0.0, 0.2, y);
  vec3 ground = vec3(0.04, 0.042, 0.046) + fbm(R.xz / (0.3 - min(y, 0.0)) * 2.5) * vec3(0.1, 0.1, 0.105);
  vec3 c = mix(ground, sky, smoothstep(-0.015, 0.015, y));
  c += vec3(0.2, 0.2, 0.21) * smoothstep(0.55, 1.0, R.z);
  float k = max(dot(R, normalize(uL)), 0.0);
  c += vec3(1.0, 0.98, 0.95) * (pow(k, 90.0) * 1.6 + pow(k, 9.0) * 0.16);
  return c;
}
void main() {
  float a = 1.0;
  vec3 N;
  float lifted = smoothstep(0.0, 0.04, vLift);
  if (vKind < 1.5) {
    // a piece of the front or back: only what lies on the mark, with the bevel while it's in place
    float m = texture2D(uMask, vUV).r;
    a = smoothstep(0.3, 0.62, m);
    if (a < 0.01) discard;
    float e = 1.0 / 512.0 * 2.5;
    vec2 out_ = vec2(-(h(vUV + vec2(e, 0.0)) - h(vUV - vec2(e, 0.0))), h(vUV + vec2(0.0, e)) - h(vUV - vec2(0.0, e)));
    float f2 = 1.0 / 512.0 * 6.0;
    vec2 dome = vec2(-(w(vUV + vec2(f2, 0.0)) - w(vUV - vec2(f2, 0.0))), w(vUV + vec2(0.0, f2)) - w(vUV - vec2(0.0, f2)));
    float side = vKind < 0.5 ? 1.0 : -1.0;
    vec3 nl = normalize(mix(vec3(out_ * 6.0 + dome * 1.0, side), vec3(0.0, 0.0, side), lifted));
    N = normalize(mat3(vR0, vR1, vR2) * nl);
  } else {
    N = normalize(vN);
  }
  vec3 V = normalize(vec3(0.0, 0.0, ${CAM.toFixed(2)}) - vPos);
  // a loose piece is a thin plane: whichever side faces you is the one you see
  if (dot(N, V) < 0.0) N = -N;
  vec3 R = reflect(-V, N);
  vec3 col = env(R) * 0.94;
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
  col += fres * vec3(0.16, 0.17, 0.19);
  col += vec3(1.0, 0.98, 0.95) * pow(max(dot(R, normalize(uL)), 0.0), 18.0) * lifted * 0.7;
  col = col / (1.0 + col * 0.25) * 1.12;
  gl_FragColor = vec4(col * a, a);
}`;

type Frame = {
  W: number;
  H: number;
  tilt: [number, number];
  scale: [number, number];
  offY: number;
  L: number[];
  t: number;
  dirty: boolean;
};
type Renderer = {
  draw: (f: Frame) => void;
  setShards: (s: Shard[]) => void;
  dispose: () => void;
};
const pendingLose = new WeakMap<HTMLCanvasElement, ReturnType<typeof setTimeout>>();

function makeGL(canvas: HTMLCanvasElement, rgba: Uint8Array): Renderer | null {
  clearTimeout(pendingLose.get(canvas));
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl", {
      premultipliedAlpha: true,
      alpha: true,
      antialias: true,
    });
  } catch {
    gl = null;
  }
  if (!gl || gl.isContextLost()) return null;
  const g = gl;
  const sh = (type: number, src: string) => {
    const s = g.createShader(type)!;
    g.shaderSource(s, src);
    g.compileShader(s);
    if (g.getShaderParameter(s, g.COMPILE_STATUS)) return s;
    console.warn("ShatterMark: the glass shader didn't compile, so it draws without WebGL.", g.getShaderInfoLog(s));
    return null;
  };
  const vs = sh(g.VERTEX_SHADER, VS);
  const fs = sh(g.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return null;
  const prog = g.createProgram()!;
  g.attachShader(prog, vs);
  g.attachShader(prog, fs);
  ["aPos", "aCen", "aN", "aKind", "aOff", "aQ"].forEach((n, i) => g.bindAttribLocation(prog, i, n));
  g.linkProgram(prog);
  if (!g.getProgramParameter(prog, g.LINK_STATUS)) return null;
  g.useProgram(prog);

  // each piece is one triangle; its corners carry where it sits, its centre, which way it faces and what it is
  const ST = 10;
  const sb = g.createBuffer();
  const db = g.createBuffer();
  let shards: Shard[] = [];
  let nv = 0;
  let dyn = new Float32Array(0);
  const setShards = (list: Shard[]) => {
    shards = list;
    nv = list.length * 3;
    const stat = new Float32Array(nv * ST);
    let k = 0;
    for (const s of list)
      for (const v of s.t) {
        stat.set([v[0], v[1], v[2], s.c[0], s.c[1], s.c[2], s.n[0], s.n[1], s.n[2], s.kind], k);
        k += ST;
      }
    dyn = new Float32Array(nv * 7);
    g.bindBuffer(g.ARRAY_BUFFER, sb);
    g.bufferData(g.ARRAY_BUFFER, stat, g.STATIC_DRAW);
    g.enableVertexAttribArray(0);
    g.vertexAttribPointer(0, 3, g.FLOAT, false, ST * 4, 0);
    g.enableVertexAttribArray(1);
    g.vertexAttribPointer(1, 3, g.FLOAT, false, ST * 4, 12);
    g.enableVertexAttribArray(2);
    g.vertexAttribPointer(2, 3, g.FLOAT, false, ST * 4, 24);
    g.enableVertexAttribArray(3);
    g.vertexAttribPointer(3, 1, g.FLOAT, false, ST * 4, 36);
    g.bindBuffer(g.ARRAY_BUFFER, db);
    g.bufferData(g.ARRAY_BUFFER, dyn, g.DYNAMIC_DRAW);
    g.enableVertexAttribArray(4);
    g.vertexAttribPointer(4, 3, g.FLOAT, false, 28, 0);
    g.enableVertexAttribArray(5);
    g.vertexAttribPointer(5, 4, g.FLOAT, false, 28, 12);
  };

  const tex = g.createTexture();
  g.bindTexture(g.TEXTURE_2D, tex);
  g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, TEX, TEX, 0, g.RGBA, g.UNSIGNED_BYTE, rgba);
  g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
  g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
  g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
  g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
  const u = (n: string) => g.getUniformLocation(prog, n);
  const U = {
    tilt: u("uTilt"),
    scale: u("uScale"),
    offY: u("uOffY"),
    L: u("uL"),
    t: u("uT"),
  };
  g.uniform1i(u("uMask"), 0);
  g.enable(g.DEPTH_TEST);
  g.enable(g.BLEND);
  g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA);

  return {
    draw(f) {
      if (canvas.width !== f.W || canvas.height !== f.H) {
        canvas.width = f.W;
        canvas.height = f.H;
      }
      g.viewport(0, 0, f.W, f.H);
      if (f.dirty) {
        let q = 0;
        for (const s of shards) {
          const half = s.o[3] / 2;
          const sn = Math.sin(half);
          const v = [s.o[0], s.o[1], s.o[2], s.ax[0] * sn, s.ax[1] * sn, s.ax[2] * sn, Math.cos(half)];
          for (let n = 0; n < 3; n++) {
            dyn.set(v, q);
            q += 7;
          }
        }
        g.bindBuffer(g.ARRAY_BUFFER, db);
        g.bufferSubData(g.ARRAY_BUFFER, 0, dyn);
      }
      g.uniform2f(U.tilt, f.tilt[0], f.tilt[1]);
      g.uniform2f(U.scale, f.scale[0], f.scale[1]);
      g.uniform1f(U.offY, f.offY);
      g.uniform3f(U.L, f.L[0], f.L[1], f.L[2]);
      g.uniform1f(U.t, f.t);
      g.clearColor(0, 0, 0, 0);
      g.clear(g.COLOR_BUFFER_BIT | g.DEPTH_BUFFER_BIT);
      g.drawArrays(g.TRIANGLES, 0, nv);
    },
    setShards,
    dispose() {
      pendingLose.set(
        canvas,
        setTimeout(() => g.getExtension("WEBGL_lose_context")?.loseContext(), 300),
      );
    },
  };
}

/** without WebGL: the same pieces, cut from a painted chrome mark and drawn flat */
function make2D(canvas: HTMLCanvasElement, mask: HTMLCanvasElement): Renderer | null {
  let shards: Shard[] = [];
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const art = document.createElement("canvas");
  art.width = art.height = TEX;
  const a = art.getContext("2d")!;
  const gr = a.createLinearGradient(0, 0, 0, TEX);
  gr.addColorStop(0, "#f2f4f8");
  gr.addColorStop(0.45, "#8d939e");
  gr.addColorStop(0.55, "#3b3f47");
  gr.addColorStop(1, "#c9ced8");
  a.fillStyle = gr;
  a.fillRect(0, 0, TEX, TEX);
  a.globalCompositeOperation = "destination-in";
  a.drawImage(mask, 0, 0);
  return {
    draw(f) {
      if (canvas.width !== f.W || canvas.height !== f.H) {
        canvas.width = f.W;
        canvas.height = f.H;
      }
      ctx.clearRect(0, 0, f.W, f.H);
      const sx = (f.scale[0] * f.W) / 2;
      const sy = (f.scale[1] * f.H) / 2;
      const cx = f.W / 2;
      const cy = f.H / 2 - (f.offY * f.H) / 2;
      for (const s of shards) {
        if (s.kind !== 0) continue;
        const z = 1 + s.o[2] * 0.5;
        ctx.save();
        ctx.translate(cx + (s.c[0] + s.o[0]) * sx * z, cy - (s.c[1] + s.o[1]) * sy * z);
        ctx.rotate(s.o[3] * s.ax[2] * 2);
        ctx.scale(z, z);
        ctx.beginPath();
        s.t.forEach(([x, y], i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, (x - s.c[0]) * sx, -(y - s.c[1]) * sy));
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(art, (-1 - s.c[0]) * sx, -(1 - s.c[1]) * sy, 2 * sx, 2 * sy);
        ctx.restore();
      }
    },
    setShards(list) {
      shards = list;
    },
    dispose() {},
  };
}

// ---------------------------------------------------------------- the component

/**
 * A mark made of thick glass that breaks where you point at it.
 *
 * The mark is cut in advance into a few hundred slivers. Point at it and the ones near the pointer come away: each
 * flies out from the pointer and towards you on its own spring, tumbling about its own axis, catching the light
 * and a film of colour as it turns, its broken edges glowing faintly from inside. Move on and the cloud follows
 * you while the pieces behind fly home and settle, overshooting a little, with a faint tinkle as they go and a
 * tick as they land. A quick flick throws the pieces harder. The whole mark leans towards the pointer and floats
 * when left alone. Enter or Space breaks the whole thing at once. With reduced motion it stays whole.
 *   <ShatterMark label="Nexus UI" />
 */
export default function ShatterMark({
  parts = BOLT,
  label = "Volt",
  caption = "",
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: ShatterMarkProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const sfxRef = useRef(sfx);
  sfxRef.current = sfx;
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flatRef = useRef<HTMLCanvasElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const autoRef = useRef(autoplay);
  autoRef.current = autoplay;
  // the pointer, in logo units; and a burst from the keyboard
  const ptr = useRef({ x: 0, y: 0, vx: 0, vy: 0, inside: false, t: 0 });
  const burst = useRef(0);
  const [mode, setMode] = useState<"gl" | "2d" | "none">("none");

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const { rgba, sharp, canvas: mask } = rasterise(parts);
    const shards = buildMesh(sharp);
    let r = makeGL(canvas, rgba);
    let used: "gl" | "2d" = "gl";
    // a canvas that refused WebGL can't give a 2D context either, so the fallback draws on its own canvas
    if (!r && flatRef.current) {
      r = make2D(flatRef.current, mask);
      used = "2d";
    }
    if (!r) return;
    const R = r;
    R.setShards(shards);
    setMode(used);

    const tilt = { x: 0, y: 0, vx: 0, vy: 0 };
    let hover = 0; // how much the field is on: eases in when pointed at, out after
    let entry = 0;
    let wasOn = false;
    let t = 0;
    let last = performance.now();
    let raf = 0;
    let lastNote = 0;
    let quiet = 0;
    const lamp = [-0.2, 0.78, 0.6];

    const frame = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      t += dt;
      const rect = wrap.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8) {
        raf = 0;
        return;
      }
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = Math.max(2, Math.round(rect.width * dpr));
      const H = Math.max(2, Math.round(rect.height * dpr));
      const Lh = Math.min(rect.width, rect.height) * 0.4; // half the mark, in css px
      const offY = 0.07;

      // where the field is: the pointer, a keyboard burst from the middle, or the demo's ghost pointer
      const p = ptr.current;
      let fx = p.x;
      let fy = p.y;
      let on = p.inside && !reduce;
      let radius = 0.62 + entry * entry * 1.6;
      if (burst.current > 0) {
        burst.current = Math.max(0, burst.current - dt);
        fx = 0;
        fy = 0.05;
        on = true;
        radius = 1.7;
      } else if (!p.inside && autoRef.current && !touched.current && !reduce) {
        const cyc = t % 6.5;
        if (cyc > 1.2 && cyc < 4.6) {
          const k = (cyc - 1.2) / 3.4;
          fx = -1.5 + k * 3;
          fy = 0.35 * Math.sin(k * Math.PI * 1.6) - 0.05;
          on = true;
        }
      }
      // arriving blows the whole mark apart for a moment; within a third of a second the break draws in to the pointer
      if (on && !wasOn) entry = 1;
      wasOn = on;
      entry = Math.max(0, entry - dt * 2.6);
      hover += ((on ? 1 : 0) - hover) * Math.min(1, dt * (on ? 12 : 3));

      // the shards: each on a spring towards where the field would put it
      let moving = false;
      let breaks = 0;
      let lands = 0;
      const kick = Math.min(4, Math.hypot(p.vx, p.vy));
      for (const s of shards) {
        const dx = s.c[0] - fx;
        const dy = s.c[1] - fy;
        const d = Math.hypot(dx, dy) || 1e-4;
        const x = Math.max(0, 1 - d / radius);
        const f = reduce ? 0 : hover * Math.sqrt(x) * (0.6 + 0.4 * x);
        const [r0, r1, r2, r3, r4, r5] = s.r;
        const nx = dx / d;
        const ny = dy / d;
        const drift = Math.sin(t * (0.7 + r5) + r0 * 6.3) * 0.035 * f;
        // flung out from the pointer (hardest close to it, clearing a hole), scattered sideways, some right up to you
        const push = 0.07 + 0.5 * r1 * r1 + Math.max(0, 0.3 - d) * 1.3;
        const tx = nx * f * push - ny * f * 0.2 * (r2 - 0.5) + drift + (p.inside ? p.vx * 0.05 * f * r3 : 0);
        const ty = ny * f * push + nx * f * 0.2 * (r2 - 0.5) - drift * 0.6 + (p.inside ? p.vy * 0.05 * f * r3 : 0);
        const tz = f * (r3 * r3 * r3 * 1.7 + 0.04 * (r4 - 0.5)) + Math.cos(t * (0.6 + r4) + r1 * 6.3) * 0.03 * f;
        const ta =
          f * (1.4 + 3.6 * r4) * (r5 > 0.5 ? 1 : -1) * (1 + kick * 0.15) +
          Math.sin(t * (0.5 + r0) + r2 * 6.3) * 0.4 * f;
        const target = [tx, ty, tz, ta];
        for (let i = 0; i < 4; i++) {
          // the turn springs back a little behind the travel, so a patch coming home crumples before it lies flat
          const k = i === 3 ? s.k * 0.6 : s.k;
          const acc = k * (target[i] - s.o[i]) - 2 * Math.sqrt(k) * 0.52 * s.vel[i];
          s.vel[i] += acc * dt;
          s.o[i] += s.vel[i] * dt;
          if (Math.abs(s.vel[i]) > 1e-3 || Math.abs(s.o[i] - target[i]) > 1e-3) moving = true;
        }
        const off = Math.hypot(s.o[0], s.o[1], s.o[2]);
        if (!s.broken && (off > 0.06 || Math.abs(s.o[3]) > 0.9)) {
          s.broken = true;
          breaks++;
        } else if (s.broken && off < 0.01 && Math.abs(s.o[3]) < 0.08) {
          s.broken = false;
          lands++;
        }
      }
      p.vx *= 0.85;
      p.vy *= 0.85;

      // sound: a few high glassy notes as pieces come away, a soft tick as they land, never a wash
      if ((breaks || lands) && now - lastNote > 45) {
        lastNote = now;
        const s = sfxRef.current;
        if (breaks)
          s.note(2400 + Math.random() * 2200, {
            dur: 0.22,
            gain: Math.min(0.03, 0.008 + breaks * 0.002),
            bell: 0.9,
          });
        else
          s.tick({
            freq: 3600 + Math.random() * 800,
            gain: Math.min(0.02, 0.006 + lands * 0.0015),
          });
      }

      // the whole mark leans towards the pointer, and floats when left alone
      const idleY = reduce ? 0 : Math.sin(t * 0.55) * 0.16;
      const idleX = reduce ? 0 : Math.sin(t * 0.41) * 0.07;
      const wantY = (on ? fx * 0.55 : 0) * hover + idleY * (1 - hover * 0.6);
      const wantX = (on ? -fy * 0.45 : 0) * hover + idleX * (1 - hover * 0.6) - 0.06;
      tilt.vx += (90 * (wantX - tilt.x) - 12 * tilt.vx) * dt;
      tilt.vy += (90 * (wantY - tilt.y) - 12 * tilt.vy) * dt;
      tilt.x += tilt.vx * dt;
      tilt.y += tilt.vy * dt;
      // the lamp follows the pointer
      // (it hangs above and in front, so it glints off the bevels rather than flooding the flat faces)
      const lx = (on ? fx * 0.55 : -0.3 + Math.sin(t * 0.3) * 0.25) * (0.4 + hover * 0.6);
      const ly = (on ? fy * 0.4 : 0) + 0.85;
      const lz = 0.65;
      const ll = Math.hypot(lx, ly, lz);
      lamp[0] += (lx / ll - lamp[0]) * Math.min(1, dt * 6);
      lamp[1] += (ly / ll - lamp[1]) * Math.min(1, dt * 6);
      lamp[2] += (lz / ll - lamp[2]) * Math.min(1, dt * 6);

      R.draw({
        W,
        H,
        tilt: [tilt.x, tilt.y],
        scale: [(2 * Lh) / rect.width, (2 * Lh) / rect.height],
        offY,
        L: lamp,
        t,
        dirty: moving || quiet < 2,
      });
      quiet = moving ? 0 : quiet + 1;
      if (shadowRef.current) {
        const lift = hover * 0.6;
        shadowRef.current.style.opacity = String(0.75 - lift * 0.45);
        shadowRef.current.style.transform = `translateX(calc(-50% + ${tilt.y * 40}px)) scale(${1 - lift * 0.15}, 1)`;
      }
      raf = 0;
      if (!reduce && visible) raf = requestAnimationFrame(frame);
    };
    let visible = true;
    const kick = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    kick();
    // start again when it comes back into view
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(wrap);
    // a new size always gets a fresh frame (and a still one, under reduced motion)
    const ro = new ResizeObserver(() => kick());
    ro.observe(wrap);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      R.dispose();
    };
    // the parts are compared by what they draw, not by identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(parts), reduce]);

  const toLogo = (e: RPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const Lh = Math.min(r.width, r.height) * 0.4;
    const x = (e.clientX - r.left - r.width / 2) / Lh;
    const y = -(e.clientY - r.top - r.height / 2 + 0.07 * (r.height / 2)) / Lh;
    return { x, y };
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const { x, y } = toLogo(e);
    const p = ptr.current;
    const now = performance.now();
    const dt = Math.max(0.008, (now - p.t) / 1000);
    if (p.inside) {
      p.vx = p.vx * 0.5 + ((x - p.x) / dt) * 0.5;
      p.vy = p.vy * 0.5 + ((y - p.y) / dt) * 0.5;
    }
    p.x = x;
    p.y = y;
    p.t = now;
    p.inside = true;
    if (e.isTrusted) touched.current = true;
  };

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label={`${label} mark, in glass`}
      tabIndex={0}
      onPointerMove={move}
      onPointerDown={(e) => {
        move(e);
        unlockAudio();
      }}
      onPointerLeave={() => {
        ptr.current.inside = false;
      }}
      onKeyDown={(e: RKeyboardEvent<HTMLDivElement>) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        touched.current = true;
        unlockAudio();
        if (!reduce) burst.current = 1.1;
      }}
      className={`relative h-[460px] w-full max-w-[620px] cursor-crosshair select-none overflow-hidden rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-[#8ab4ff]/70 focus-visible:ring-offset-2 ${className}`}
      style={{
        background: "radial-gradient(130% 95% at 50% 22%, #5b5e64 0%, #3b3d42 45%, #1f2023 100%)",
        boxShadow: "0 0 0 1px rgba(0,0,0,.4), 0 24px 48px -28px rgba(0,0,0,.6)",
      }}
    >
      {/* the floor: a faint sheen where the light lands, and the mark's soft shadow on it */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%]"
        style={{
          background: "radial-gradient(60% 70% at 50% 100%, rgba(0,0,0,.28), rgba(0,0,0,0) 70%)",
        }}
      />
      <div
        ref={shadowRef}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[9%] left-1/2 h-7 w-[52%] rounded-[50%] bg-black blur-[14px]"
        style={{ opacity: 0.75, transform: "translateX(-50%)" }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        style={{ display: mode === "2d" ? "none" : undefined }}
      />
      <canvas
        ref={flatRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        style={{ display: mode === "2d" ? undefined : "none" }}
      />
      {mode === "none" && (
        <div className="absolute inset-0 grid place-items-center text-[13px] text-white/40">{label}</div>
      )}
      {caption && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-[12.5px] text-white/45"
          initial={false}
        >
          {caption}
        </motion.div>
      )}
    </div>
  );
}
