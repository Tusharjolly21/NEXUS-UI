# Brain Atlas

Add the "Brain Atlas" section from Nexus UI to my project.

A brain made of neurons that you can turn in your hand. Signals run along the links between them in cascades, so it looks alive. Point at it and the neurons under your pointer fire and that region lights in its own colour; click a region and the brain turns to show it while a live trace counts its signals.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { BrainAtlas } from "@/components/brain-atlas";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/brain-atlas/index.ts ---

```ts
export { default as BrainAtlas } from "./brain-atlas";
export type { BrainAtlasProps } from "./brain-atlas";
```

--- components/brain-atlas/brain-atlas.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/purity, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type PointerEvent as RPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type BrainRegion = { name: string; detail: string; color: string };
export type BrainAtlasProps = {
  /** the six regions in order: frontal, parietal, temporal, occipital, cerebellum, brainstem */
  regions?: BrainRegion[];
  /** called when a region is chosen, with its index, or -1 for the whole brain */
  onSelect?: (index: number) => void;
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

const DEFAULT_REGIONS: BrainRegion[] = [
  {
    name: "Frontal lobe",
    detail: "Planning, decisions, speech and movement.",
    color: "#9b87ff",
  },
  {
    name: "Parietal lobe",
    detail: "Touch, space and where your body is.",
    color: "#38c8ff",
  },
  {
    name: "Temporal lobe",
    detail: "Hearing, language and memory.",
    color: "#ffb340",
  },
  {
    name: "Occipital lobe",
    detail: "Vision: shape, colour and motion.",
    color: "#41e39a",
  },
  {
    name: "Cerebellum",
    detail: "Balance, timing and smooth movement.",
    color: "#ff74ad",
  },
  {
    name: "Brainstem",
    detail: "Breathing, heartbeat and sleep.",
    color: "#e9edff",
  },
];
// where the camera goes for each region: [yaw, pitch]
const VIEWS: [number, number][] = [
  [-0.75, 0.22],
  [-1.45, 0.62],
  [-1.6, -0.08],
  [-2.45, 0.18],
  [-2.55, -0.32],
  [-2.0, -0.2],
];
const HOME: [number, number] = [-1.42, 0.14];
const STAR = 6;
const MAXS = 170;

// ───────────── the brain: points sampled over its surfaces, joined to their nearest neighbours ─────────────

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash3(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise3(x: number, y: number, z: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const w = fz * fz * (3 - 2 * fz);
  const L = (a: number, b: number, t: number) => a + (b - a) * t;
  const h = (dx: number, dy: number, dz: number) => hash3(ix + dx, iy + dy, iz + dz);
  return (
    L(
      L(L(h(0, 0, 0), h(1, 0, 0), u), L(h(0, 1, 0), h(1, 1, 0), u), v),
      L(L(h(0, 0, 1), h(1, 0, 1), u), L(h(0, 1, 1), h(1, 1, 1), u), v),
      w,
    ) *
      2 -
    1
  );
}
const folds = (x: number, y: number, z: number) =>
  noise3(x * 5.2, y * 5.2, z * 5.2) * 0.6 + noise3(x * 11, y * 11, z * 11) * 0.4;

/** is a point inside one hemisphere of the cerebrum (side s = 1 or -1) */
function inCerebrum(x: number, y: number, z: number) {
  for (const s of [1, -1]) {
    const lx = (x - s * 0.3) / (s * (x - s * 0.3) < 0 ? 0.5 : 0.44);
    const ly = (y - 0.12) / (y < 0.12 ? 0.42 : 0.64);
    const lz = z / (z > 0 ? 0.96 : 1.02);
    if (lx * lx + ly * ly + lz * lz < 1) return true;
  }
  return false;
}

type Brain = {
  pos: Float32Array;
  reg: Float32Array;
  edges: Uint16Array;
  nbr: number[][];
  n: number;
  nStars: number;
  centre: [number, number, number][];
};

function buildBrain(): Brain {
  const r = rng(7);
  const P: number[] = [];
  const R: number[] = [];
  const add = (x: number, y: number, z: number, g: number) => {
    P.push(x, y, z);
    R.push(g);
  };
  const dir = () => {
    const u = r() * 2 - 1;
    const t = r() * Math.PI * 2;
    const q = Math.sqrt(1 - u * u);
    return [q * Math.cos(t), u, q * Math.sin(t)];
  };
  // cerebrum: two hemispheres, flatter underneath and against each other, with folds pushed in and out
  for (const s of [1, -1])
    for (let i = 0; i < 1500; i++) {
      const [dx, dy, dz] = dir();
      let x = dx * (s * dx < 0 ? 0.5 : 0.44);
      let y = dy * (dy < 0 ? 0.42 : 0.64);
      let z = dz * (dz > 0 ? 0.96 : 1.02);
      // the front of the frontal lobe sits lower, the back of the occipital tapers
      y += z > 0.4 ? -(z - 0.4) * 0.18 : 0;
      if (z < -0.6) x *= 1 - (-z - 0.6) * 0.5;
      const k = 1 + folds(x + s, y, z) * 0.05;
      x = x * k + s * 0.3;
      y = y * k + 0.12;
      z *= k;
      // the two halves meet: their inner faces are flat walls a hair apart, as in a real brain
      if (s * x < 0.014) {
        // points that would cross the middle go onto the wall, so it's no denser than the rest
        if (r() < 0.45) continue;
        x = s * (0.014 + r() * 0.01);
      }
      // under the cerebrum is the temporal lobe; leave that space to it
      if (y < -0.12 && z > -0.45 && z < 0.55 && Math.abs(x) > 0.2) continue;
      const g = z > 0.2 ? 0 : z < -0.45 ? 3 : 1;
      add(x, y, z, g);
    }
  // temporal lobes, hanging below the side of each hemisphere
  for (const s of [1, -1])
    for (let i = 0; i < 420; i++) {
      const [dx, dy, dz] = dir();
      let x = s * 0.4 + dx * 0.25;
      let y = -0.24 + dy * 0.22;
      const z = 0.04 + dz * 0.56;
      if (z > 0.3) y += (z - 0.3) * 0.25;
      const k = 1 + folds(x, y + 3, z) * 0.04;
      x *= k;
      if (inCerebrum(x, y, z) && y > -0.12) continue;
      add(x, y, z, 2);
    }
  // the bridge between the halves (corpus callosum), arching along the middle
  for (let i = 0; i < 260; i++) {
    const t = r();
    const z = -0.46 + t * 0.98;
    const y = 0.02 + Math.sin(t * Math.PI) * 0.17 + (r() - 0.5) * 0.05;
    add((r() * 2 - 1) * 0.14, y, z, z > 0.2 ? 0 : z < -0.45 ? 3 : 1);
  }
  // the core under it (thalamus and midbrain), joining the cerebrum to the brainstem
  for (let i = 0; i < 300; i++) {
    const [dx, dy, dz] = dir();
    add(dx * 0.2, -0.14 + dy * 0.16, -0.14 + dz * 0.3, 5);
  }
  // cerebellum, tucked under the back, finely layered
  for (let i = 0; i < 700; i++) {
    const [dx, dy, dz] = dir();
    const x = dx * 0.52;
    let y = -0.44 + dy * 0.24;
    const z = -0.62 + dz * 0.32;
    y += Math.sin((y + 0.44) * 60) * 0.008;
    if (inCerebrum(x, y, z)) continue;
    add(x, y, z, 4);
  }
  // brainstem, running down and slightly back
  for (let i = 0; i < 220; i++) {
    const t = r();
    const a = r() * Math.PI * 2;
    const rad = 0.13 - t * 0.05;
    add(Math.cos(a) * rad, -0.28 - t * 0.78, -0.22 - t * 0.16 + Math.sin(a) * rad, 5);
  }
  // a few deep points so the inside isn't empty
  for (let i = 0; i < 520; i++) {
    const x = (r() * 2 - 1) * 0.7;
    const y = (r() * 2 - 1) * 0.6 + 0.1;
    const z = (r() * 2 - 1) * 0.9;
    if (!inCerebrum(x, y, z)) continue;
    add(x, y, z, z > 0.2 ? 0 : z < -0.45 ? 3 : 1);
  }
  const n = R.length;
  // neighbours: each point to its three nearest, found through a grid
  const cell = 0.13;
  const grid = new Map<string, number[]>();
  const key = (x: number, y: number, z: number) =>
    `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`;
  for (let i = 0; i < n; i++) {
    const k = key(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]);
    (grid.get(k) ?? grid.set(k, []).get(k)!).push(i);
  }
  const seen = new Set<number>();
  const E: number[] = [];
  const nbr: number[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    const x = P[i * 3];
    const y = P[i * 3 + 1];
    const z = P[i * 3 + 2];
    const cx = Math.floor(x / cell);
    const cy = Math.floor(y / cell);
    const cz = Math.floor(z / cell);
    const near: [number, number][] = [];
    for (let a = -1; a <= 1; a++)
      for (let b = -1; b <= 1; b++)
        for (let c = -1; c <= 1; c++)
          for (const j of grid.get(`${cx + a},${cy + b},${cz + c}`) ?? []) {
            if (j === i) continue;
            const d = Math.hypot(P[j * 3] - x, P[j * 3 + 1] - y, P[j * 3 + 2] - z);
            if (d < cell) near.push([d, j]);
          }
    near.sort((p, q) => p[0] - q[0]);
    for (const [, j] of near.slice(0, 4)) {
      const kk = i < j ? i * n + j : j * n + i;
      if (seen.has(kk)) continue;
      seen.add(kk);
      E.push(i, j);
      nbr[i].push(j);
      nbr[j].push(i);
    }
  }
  // a field of faint stars far behind
  const nStars = 260;
  for (let i = 0; i < nStars; i++) {
    const [dx, dy, dz] = dir();
    const d = 7 + r() * 5;
    P.push(dx * d, dy * d, dz * d);
    R.push(STAR);
  }
  const centre: [number, number, number][] = Array.from({ length: 6 }, () => [0, 0, 0]);
  const cnt = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < n; i++) {
    const g = R[i];
    centre[g][0] += P[i * 3];
    centre[g][1] += P[i * 3 + 1];
    centre[g][2] += P[i * 3 + 2];
    cnt[g]++;
  }
  centre.forEach((c, g) => {
    c[0] /= cnt[g] || 1;
    c[1] /= cnt[g] || 1;
    c[2] /= cnt[g] || 1;
  });
  return {
    pos: new Float32Array(P),
    reg: new Float32Array(R),
    edges: new Uint16Array(E),
    nbr,
    n,
    nStars,
    centre,
  };
}

// ───────────── camera ─────────────

function matrix(yaw: number, pitch: number, dist: number, aspect: number, look: [number, number, number] = [0, 0, 0]) {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  // rotation: yaw about Y, then pitch about X; then pushed back by dist; then perspective
  const r00 = cy;
  const r01 = 0;
  const r02 = sy;
  const r10 = sy * sp;
  const r11 = cp;
  const r12 = -cy * sp;
  const r20 = -sy * cp;
  const r21 = sp;
  const r22 = cy * cp;
  const f = 1 / Math.tan((34 * Math.PI) / 360);
  const near = 0.1;
  const far = 40;
  const a = (far + near) / (near - far);
  const b = (2 * far * near) / (near - far);
  const fx = f / aspect;
  // the point the camera looks at, turned with the brain
  const tx = r00 * look[0] + r01 * look[1] + r02 * look[2];
  const ty = r10 * look[0] + r11 * look[1] + r12 * look[2];
  const tz = r20 * look[0] + r21 * look[1] + r22 * look[2];
  // column-major: clip = P * (R * (p - look) + (0, 0, -dist))
  return new Float32Array([
    fx * r00,
    f * r10,
    a * r20,
    -r20,
    fx * r01,
    f * r11,
    a * r21,
    -r21,
    fx * r02,
    f * r12,
    a * r22,
    -r22,
    -fx * tx,
    -f * ty,
    a * (-tz - dist) + b,
    dist + tz,
  ]);
}

// ───────────── WebGL ─────────────

const VS = `
attribute vec3 aPos; attribute float aAct; attribute float aReg;
uniform mat4 uM; uniform float uFocus; uniform float uHover; uniform vec3 uCol[7]; uniform float uSize; uniform float uDim; uniform float uMode;
varying vec3 vC; varying float vA;
void main(){
  vec4 p = uM * vec4(aPos, 1.0);
  gl_Position = p;
  float depth = clamp((p.w - 2.4) / 2.2, 0.0, 1.0);
  int r = int(aReg + 0.5);
  float lit = (abs(aReg - uFocus) < 0.5 || abs(aReg - uHover) < 0.5) ? 1.0 : 0.0;
  float dim = (uFocus > -0.5 && lit < 0.5) ? uDim : 1.0;
  vec3 base = vec3(0.27, 0.55, 0.85);
  float fade = mix(1.0, 0.4, depth);
  vec3 col; float b; float size;
  if (uMode < 0.5) {
    // the network itself
    col = mix(base, uCol[r], clamp(max(lit * 0.9, aAct), 0.0, 1.0));
    b = (0.3 + 0.6 * lit + 1.7 * aAct) * dim * fade;
    size = uSize * (1.0 + aAct * 1.8 + lit * 0.35) * (3.4 / p.w);
  } else if (uMode < 1.5) {
    // a signal's tail: the link it is running along lights up behind it, brightest at the head
    col = mix(uCol[r], vec3(1.0), aAct * aAct * 0.55);
    b = aAct * aAct * 1.8 * dim * fade;
    size = 1.0;
  } else {
    // a signal's head: a hot core
    col = mix(uCol[r], vec3(1.0), 0.6);
    b = 1.9 * aAct * dim * fade;
    size = uSize * 3.4 * (3.4 / p.w);
  }
  if (r == 6) { col = vec3(0.72, 0.78, 0.95); b = 0.28; size = uSize * 0.8; }
  vC = col; vA = b; gl_PointSize = size;
}`;
const FS_POINT = `precision mediump float; varying vec3 vC; varying float vA;
void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - d), 1.7); gl_FragColor = vec4(vC * vA * a, 1.0); }`;
const FS_LINE = `precision mediump float; varying vec3 vC; varying float vA; uniform float uLine;
void main(){ gl_FragColor = vec4(vC * vA * uLine, 1.0); }`;
// the glow: the bright parts are blurred at half size and laid back over the picture
const QVS = `attribute vec2 aQ; varying vec2 vUv; void main(){ vUv = aQ * 0.5 + 0.5; gl_Position = vec4(aQ, 0.0, 1.0); }`;
const FS_BLUR = `precision mediump float; varying vec2 vUv; uniform sampler2D uT; uniform vec2 uDir; uniform float uThr;
vec3 tap(vec2 o){ return max(texture2D(uT, vUv + o).rgb - uThr, 0.0); }
void main(){
  vec3 s = tap(vec2(0.0)) * 0.2270;
  s += (tap(uDir) + tap(-uDir)) * 0.1946;
  s += (tap(uDir * 2.0) + tap(-uDir * 2.0)) * 0.1216;
  s += (tap(uDir * 3.0) + tap(-uDir * 3.0)) * 0.0541;
  s += (tap(uDir * 4.0) + tap(-uDir * 4.0)) * 0.0162;
  gl_FragColor = vec4(s, 1.0);
}`;
const FS_ADD = `precision mediump float; varying vec2 vUv; uniform sampler2D uB; uniform float uK;
void main(){ gl_FragColor = vec4(texture2D(uB, vUv).rgb * uK, 1.0); }`;

type GL = {
  draw: (
    m: Float32Array,
    act: Float32Array,
    tails: Float32Array,
    nt: number,
    heads: Float32Array,
    nh: number,
    focus: number,
    hover: number,
    dim: number,
  ) => void;
  size: (w: number, h: number) => void;
  dispose: () => void;
};

function makeGL(canvas: HTMLCanvasElement, B: Brain, cols: string[]): GL | null {
  const g = canvas.getContext("webgl", {
    antialias: true,
    premultipliedAlpha: false,
    alpha: false,
  }) as WebGLRenderingContext | null;
  if (!g) return null;
  const sh = (type: number, src: string) => {
    const s = g.createShader(type)!;
    g.shaderSource(s, src);
    g.compileShader(s);
    if (!g.getShaderParameter(s, g.COMPILE_STATUS)) console.warn(g.getShaderInfoLog(s));
    return s;
  };
  const prog = (vs: string, fs: string) => {
    const p = g.createProgram()!;
    g.attachShader(p, sh(g.VERTEX_SHADER, vs));
    g.attachShader(p, sh(g.FRAGMENT_SHADER, fs));
    g.linkProgram(p);
    if (!g.getProgramParameter(p, g.LINK_STATUS)) {
      console.warn(g.getProgramInfoLog(p));
      return null;
    }
    return p;
  };
  const pp = prog(VS, FS_POINT);
  const pl = prog(VS, FS_LINE);
  const pBlur = prog(QVS, FS_BLUR);
  const pComp = prog(QVS, FS_ADD);
  if (!pp || !pl || !pBlur || !pComp) return null;
  const total = B.n + B.nStars;
  const buf = (data: ArrayBufferView | number, usage: number, target: number = g.ARRAY_BUFFER) => {
    const b = g.createBuffer();
    g.bindBuffer(target, b);
    g.bufferData(target, data as BufferSource, usage);
    return b;
  };
  const bPos = buf(B.pos, g.STATIC_DRAW);
  const bReg = buf(B.reg, g.STATIC_DRAW);
  const bAct = buf(new Float32Array(total), g.DYNAMIC_DRAW);
  const bIdx = buf(B.edges, g.STATIC_DRAW, g.ELEMENT_ARRAY_BUFFER);
  // signals: x, y, z, strength, region
  const bTail = buf(MAXS * 8 * 2 * 5 * 4, g.DYNAMIC_DRAW);
  const bHead = buf(MAXS * 5 * 4, g.DYNAMIC_DRAW);
  const bQuad = buf(new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
  const rgb = cols.map((c) => {
    const v = parseInt(c.slice(1), 16);
    return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
  });
  const colArr = new Float32Array([...rgb.flat(), 1, 1, 1]);
  const actAll = new Float32Array(total);
  const loc = (p: WebGLProgram) => ({
    pos: g.getAttribLocation(p, "aPos"),
    act: g.getAttribLocation(p, "aAct"),
    reg: g.getAttribLocation(p, "aReg"),
    M: g.getUniformLocation(p, "uM"),
    focus: g.getUniformLocation(p, "uFocus"),
    hover: g.getUniformLocation(p, "uHover"),
    col: g.getUniformLocation(p, "uCol"),
    size: g.getUniformLocation(p, "uSize"),
    dim: g.getUniformLocation(p, "uDim"),
    mode: g.getUniformLocation(p, "uMode"),
    line: g.getUniformLocation(p, "uLine"),
  });
  const LP = loc(pp);
  const LL = loc(pl);
  const qBlur = {
    q: g.getAttribLocation(pBlur, "aQ"),
    T: g.getUniformLocation(pBlur, "uT"),
    dir: g.getUniformLocation(pBlur, "uDir"),
    thr: g.getUniformLocation(pBlur, "uThr"),
  };
  const qComp = {
    q: g.getAttribLocation(pComp, "aQ"),
    B: g.getUniformLocation(pComp, "uB"),
    K: g.getUniformLocation(pComp, "uK"),
  };
  // render targets: the full picture, and two half-size ones for the glow
  type Target = {
    fb: WebGLFramebuffer | null;
    tex: WebGLTexture | null;
    w: number;
    h: number;
  };
  const target = (): Target => ({
    fb: g.createFramebuffer(),
    tex: g.createTexture(),
    w: 1,
    h: 1,
  });
  const T0 = target();
  const T1 = target();
  const T2 = target();
  const alloc = (t: Target, w: number, h: number) => {
    t.w = w;
    t.h = h;
    g.bindTexture(g.TEXTURE_2D, t.tex);
    g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, w, h, 0, g.RGBA, g.UNSIGNED_BYTE, null);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
    g.bindFramebuffer(g.FRAMEBUFFER, t.fb);
    g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, t.tex, 0);
    const ok = g.checkFramebufferStatus(g.FRAMEBUFFER) === g.FRAMEBUFFER_COMPLETE;
    g.bindFramebuffer(g.FRAMEBUFFER, null);
    return ok;
  };
  let glow = true;
  let dpr = 1;
  const common = (
    L: ReturnType<typeof loc>,
    m: Float32Array,
    focus: number,
    hover: number,
    dim: number,
    mode: number,
  ) => {
    g.uniformMatrix4fv(L.M, false, m);
    g.uniform1f(L.focus, focus);
    g.uniform1f(L.hover, hover);
    g.uniform3fv(L.col, colArr);
    g.uniform1f(L.size, 2.6 * dpr);
    g.uniform1f(L.dim, dim);
    g.uniform1f(L.mode, mode);
  };
  const attrib = (L: ReturnType<typeof loc>, b: WebGLBuffer | null, interleaved: boolean) => {
    if (interleaved) {
      g.bindBuffer(g.ARRAY_BUFFER, b);
      g.enableVertexAttribArray(L.pos);
      g.vertexAttribPointer(L.pos, 3, g.FLOAT, false, 20, 0);
      g.enableVertexAttribArray(L.act);
      g.vertexAttribPointer(L.act, 1, g.FLOAT, false, 20, 12);
      g.enableVertexAttribArray(L.reg);
      g.vertexAttribPointer(L.reg, 1, g.FLOAT, false, 20, 16);
      return;
    }
    g.bindBuffer(g.ARRAY_BUFFER, bPos);
    g.enableVertexAttribArray(L.pos);
    g.vertexAttribPointer(L.pos, 3, g.FLOAT, false, 0, 0);
    g.bindBuffer(g.ARRAY_BUFFER, bAct);
    g.enableVertexAttribArray(L.act);
    g.vertexAttribPointer(L.act, 1, g.FLOAT, false, 0, 0);
    g.bindBuffer(g.ARRAY_BUFFER, bReg);
    g.enableVertexAttribArray(L.reg);
    g.vertexAttribPointer(L.reg, 1, g.FLOAT, false, 0, 0);
  };
  const quad = (loc: number) => {
    for (let i = 0; i < 8; i++) if (i !== loc) g.disableVertexAttribArray(i);
    g.bindBuffer(g.ARRAY_BUFFER, bQuad);
    g.enableVertexAttribArray(loc);
    g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
  };
  const blur = (src: Target, dst: Target, dx: number, dy: number, thr: number) => {
    g.bindFramebuffer(g.FRAMEBUFFER, dst.fb);
    g.viewport(0, 0, dst.w, dst.h);
    g.useProgram(pBlur);
    g.activeTexture(g.TEXTURE0);
    g.bindTexture(g.TEXTURE_2D, src.tex);
    g.uniform1i(qBlur.T, 0);
    g.uniform2f(qBlur.dir, dx, dy);
    g.uniform1f(qBlur.thr, thr);
    quad(qBlur.q);
  };
  return {
    size(w, h) {
      dpr = Math.min(2, devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const W = canvas.width;
      const H = canvas.height;
      glow =
        alloc(T0, W, H) &&
        alloc(T1, Math.max(1, W >> 1), Math.max(1, H >> 1)) &&
        alloc(T2, Math.max(1, W >> 1), Math.max(1, H >> 1));
    },
    draw(m, act, tails, nt, heads, nh, focus, hover, dim) {
      actAll.set(act);
      g.bindBuffer(g.ARRAY_BUFFER, bAct);
      g.bufferSubData(g.ARRAY_BUFFER, 0, actAll);
      const W = canvas.width;
      const H = canvas.height;
      const network = () => {
        g.useProgram(pl);
        common(LL, m, focus, hover, dim, 0);
        g.uniform1f(LL.line, 0.5);
        attrib(LL, null, false);
        g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, bIdx);
        g.drawElements(g.LINES, B.edges.length, g.UNSIGNED_SHORT, 0);
        g.useProgram(pp);
        common(LP, m, focus, hover, dim, 0);
        attrib(LP, null, false);
        g.drawArrays(g.POINTS, 0, total);
      };
      const signals = () => {
        if (nt > 0) {
          g.useProgram(pl);
          g.bindBuffer(g.ARRAY_BUFFER, bTail);
          g.bufferSubData(g.ARRAY_BUFFER, 0, tails.subarray(0, nt * 5) as unknown as BufferSource);
          common(LL, m, focus, hover, dim, 1);
          g.uniform1f(LL.line, 1);
          attrib(LL, bTail, true);
          g.drawArrays(g.LINES, 0, nt);
        }
        if (nh > 0) {
          g.useProgram(pp);
          g.bindBuffer(g.ARRAY_BUFFER, bHead);
          g.bufferSubData(g.ARRAY_BUFFER, 0, heads.subarray(0, nh * 5) as unknown as BufferSource);
          common(LP, m, focus, hover, dim, 2);
          attrib(LP, bHead, true);
          g.drawArrays(g.POINTS, 0, nh);
        }
      };
      // the brain, as it was: crisp points and links on the dark
      g.bindFramebuffer(g.FRAMEBUFFER, null);
      g.viewport(0, 0, W, H);
      g.clearColor(0.035, 0.04, 0.065, 1);
      g.clear(g.COLOR_BUFFER_BIT);
      g.enable(g.BLEND);
      g.blendFunc(g.ONE, g.ONE);
      network();
      signals();
      if (!glow || (nt === 0 && nh === 0)) {
        g.disable(g.BLEND);
        return;
      }
      // only the signals glow: they are drawn again on their own, blurred at half size and added back
      g.bindFramebuffer(g.FRAMEBUFFER, T0.fb);
      g.clearColor(0, 0, 0, 1);
      g.clear(g.COLOR_BUFFER_BIT);
      signals();
      g.disable(g.BLEND);
      blur(T0, T1, 2 / W, 0, 0);
      blur(T1, T2, 0, 2 / H, 0);
      blur(T2, T1, 4 / W, 0, 0);
      blur(T1, T2, 0, 4 / H, 0);
      g.bindFramebuffer(g.FRAMEBUFFER, null);
      g.viewport(0, 0, W, H);
      g.enable(g.BLEND);
      g.blendFunc(g.ONE, g.ONE);
      g.useProgram(pComp);
      g.activeTexture(g.TEXTURE0);
      g.bindTexture(g.TEXTURE_2D, T2.tex);
      g.uniform1i(qComp.B, 0);
      g.uniform1f(qComp.K, 1.6);
      quad(qComp.q);
      g.disable(g.BLEND);
    },
    dispose() {
      const ext = g.getExtension("WEBGL_lose_context");
      window.setTimeout(() => ext?.loseContext(), 300);
    },
  };
}

/**
 * A brain made of neurons you can turn in your hand. Thousands of points sampled over its surfaces (two folded
 * hemispheres, the temporal lobes, the cerebellum and the brainstem) are joined to their nearest neighbours, and
 * signals run along those links: a neuron fires, lights up, and passes the spike to a neighbour or two, so cascades
 * ripple through it. Point at it and the neurons under your pointer fire and the region you're over lights in its
 * own colour with its name; click a region (or choose it below) and the brain turns to show it, the rest dims, and
 * a live trace counts its signals. Drag to turn it; it keeps spinning a little when you let go.
 */
export default function BrainAtlas({
  regions = DEFAULT_REGIONS,
  onSelect,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: BrainAtlasProps) {
  const reduce = useReducedMotion() ?? false;
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
  const box = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const spark = useRef<HTMLCanvasElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const brain = useMemo(() => buildBrain(), []);
  const [focus, setFocusS] = useState(-1);
  const focusRef = useRef(-1);
  const [hover, setHover] = useState(-1);
  const hoverRef = useRef(-1);
  const [rate, setRate] = useState(0);
  const [noGL, setNoGL] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const touched = useRef(false);
  const ptr = useRef({
    x: 0,
    y: 0,
    in: false,
    down: false,
    sx: 0,
    sy: 0,
    moved: 0,
    lx: 0,
    ly: 0,
    click: false,
  });
  const cam = useRef({
    yaw: HOME[0],
    pitch: HOME[1],
    vy: 0,
    vp: 0,
    dist: 3.9,
    tYaw: NaN,
    tPitch: NaN,
    tDist: 3.9,
    look: [0, 0, 0] as [number, number, number],
  });

  const setFocus = (i: number) => {
    focusRef.current = i;
    setFocusS(i);
    onSelect?.(i);
    const c = cam.current;
    if (i >= 0) {
      // turn the short way round to the region's view
      let ty = VIEWS[i][0];
      while (ty - c.yaw > Math.PI) ty -= Math.PI * 2;
      while (ty - c.yaw < -Math.PI) ty += Math.PI * 2;
      c.tYaw = ty;
      c.tPitch = VIEWS[i][1];
      c.tDist = 3.35;
      sfxRef.current.note([392, 440, 330, 494, 262, 196][i] ?? 392, {
        dur: 0.6,
        gain: 0.05,
        bell: 0.7,
      });
    } else {
      c.tYaw = NaN;
      c.tPitch = HOME[1];
      c.tDist = 3.9;
      sfxRef.current.note(294, { dur: 0.4, gain: 0.04 });
    }
  };
  const setFocusRef = useRef(setFocus);
  setFocusRef.current = setFocus;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setNarrow(el.clientWidth < 600));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const c = cv.current;
    const el = box.current;
    if (!c || !el) return;
    const B = brain;
    const N = B.n;
    const R = makeGL(
      c,
      B,
      regions.map((r) => r.color),
    );
    const ctx2d = R ? null : c.getContext("2d");
    if (!R) setNoGL(true);
    const act = new Float32Array(N + B.nStars);
    const refr = new Float32Array(N);
    // a signal runs along a chain of links, like an impulse down an axon: path, distances along it, how far it's got
    type Sig = {
      path: number[];
      cum: number[];
      d: number;
      speed: number;
      lit: number;
    };
    const sigs: Sig[] = [];
    const TAIL = 8;
    const tails = new Float32Array(MAXS * TAIL * 2 * 5);
    const heads = new Float32Array(MAXS * 5);
    const screen = new Float32Array(N * 3);
    const fires = new Float32Array(6);
    const hist: number[][] = Array.from({ length: 7 }, () => Array(48).fill(0));
    let bucket = 0;
    let w = 1;
    let h = 1;
    let vis = true;
    let raf = 0;
    let last = performance.now();
    let stimT = 0;
    let lastTick = 0;
    let now0 = 0;
    const resize = () => {
      w = el.clientWidth;
      h = el.clientHeight;
      if (R) R.size(w, h);
      else {
        const dpr = Math.min(2, devicePixelRatio || 1);
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting));
    io.observe(el);

    const P3 = B.pos;
    const flash = (i: number, k: number) => {
      act[i] = Math.min(1, act[i] + k);
    };
    // start a signal at neuron i: it picks its way from link to link, mostly carrying on in the same direction
    const spawn = (i: number, hops: number) => {
      if (sigs.length >= MAXS || refr[i] > now0) return;
      refr[i] = now0 + 0.25;
      const path = [i];
      const cum = [0];
      let dx = Math.random() - 0.5;
      let dy = Math.random() - 0.5;
      let dz = Math.random() - 0.5;
      let cur = i;
      for (let hp = 0; hp < hops; hp++) {
        let bestJ = -1;
        let bestS = -1e9;
        for (const j of B.nbr[cur]) {
          if (path.includes(j)) continue;
          const ex = P3[j * 3] - P3[cur * 3];
          const ey = P3[j * 3 + 1] - P3[cur * 3 + 1];
          const ez = P3[j * 3 + 2] - P3[cur * 3 + 2];
          const l = Math.hypot(ex, ey, ez) || 1;
          const sc = (ex * dx + ey * dy + ez * dz) / l + Math.random() * 0.9;
          if (sc > bestS) {
            bestS = sc;
            bestJ = j;
          }
        }
        if (bestJ < 0) break;
        const ex = P3[bestJ * 3] - P3[cur * 3];
        const ey = P3[bestJ * 3 + 1] - P3[cur * 3 + 1];
        const ez = P3[bestJ * 3 + 2] - P3[cur * 3 + 2];
        const l = Math.hypot(ex, ey, ez) || 1;
        dx = dx * 0.4 + ex / l;
        dy = dy * 0.4 + ey / l;
        dz = dz * 0.4 + ez / l;
        path.push(bestJ);
        cum.push(cum[cum.length - 1] + l);
        cur = bestJ;
      }
      if (path.length < 2) return;
      flash(i, 0.9);
      fires[B.reg[i]]++;
      sigs.push({
        path,
        cum,
        d: 0,
        speed: 0.42 + Math.random() * 0.22,
        lit: 0,
      });
    };
    // where a signal is after travelling dist along its path
    const at = (sg: Sig, dist: number, out: Float32Array, o: number) => {
      const d = Math.max(0, Math.min(sg.cum[sg.cum.length - 1], dist));
      let k = 0;
      while (k < sg.cum.length - 2 && sg.cum[k + 1] < d) k++;
      const seg = sg.cum[k + 1] - sg.cum[k] || 1;
      const t = (d - sg.cum[k]) / seg;
      const a = sg.path[k] * 3;
      const b = sg.path[k + 1] * 3;
      out[o] = P3[a] + (P3[b] - P3[a]) * t;
      out[o + 1] = P3[a + 1] + (P3[b + 1] - P3[a + 1]) * t;
      out[o + 2] = P3[a + 2] + (P3[b + 2] - P3[a + 2]) * t;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!vis) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      now0 = now / 1000;
      const C = cam.current;
      const P = ptr.current;
      const f = focusRef.current;
      // camera: dragged with inertia, or eased to a region, or turning slowly on its own
      if (!P.down) {
        if (!Number.isNaN(C.tYaw)) {
          C.vy += ((C.tYaw - C.yaw) * 30 - C.vy * 9) * dt;
          if (Math.abs(C.tYaw - C.yaw) < 0.002 && Math.abs(C.vy) < 0.01) C.tYaw = NaN;
        } else {
          const idle = reduce || f >= 0 || hoverRef.current >= 0 ? 0 : 0.14;
          C.vy += (idle - C.vy) * Math.min(1, dt * 1.2);
        }
        C.vp += (((Number.isNaN(C.tPitch) ? HOME[1] : C.tPitch) - C.pitch) * 18 - C.vp * 7) * dt;
        C.yaw += C.vy * dt;
        C.pitch += C.vp * dt;
      }
      C.dist += (C.tDist - C.dist) * Math.min(1, dt * 4);
      // and drifts toward the chosen region, so it sits in the middle
      const goal = f >= 0 ? B.centre[f] : [0, -0.05, 0];
      for (let k = 0; k < 3; k++) C.look[k] += (goal[k] * (f >= 0 ? 0.6 : 1) - C.look[k]) * Math.min(1, dt * 3);
      const m = matrix(C.yaw, C.pitch, C.dist * (w < 600 ? 1.3 : 1), w / h, C.look);
      // on a wide card the brain sits a little right of centre, clear of the words
      const ox = w < 600 ? 0 : 0.14;
      const oy = w < 600 ? -0.24 : -0.02;
      for (let col = 0; col < 4; col++) {
        m[col * 4] += ox * m[col * 4 + 3];
        m[col * 4 + 1] += oy * m[col * 4 + 3];
      }

      // where every neuron is on screen, for pointing
      let best = -1;
      let bd = 26 * 26;
      for (let i = 0; i < N; i++) {
        const x = B.pos[i * 3];
        const y = B.pos[i * 3 + 1];
        const z = B.pos[i * 3 + 2];
        const cw = m[3] * x + m[7] * y + m[11] * z + m[15];
        const sx = (((m[0] * x + m[4] * y + m[8] * z + m[12]) / cw) * 0.5 + 0.5) * w;
        const sy = (0.5 - ((m[1] * x + m[5] * y + m[9] * z + m[13]) / cw) * 0.5) * h;
        screen[i * 3] = sx;
        screen[i * 3 + 1] = sy;
        screen[i * 3 + 2] = cw;
        if (P.in && !P.down) {
          const d = (sx - P.x) ** 2 + (sy - P.y) ** 2;
          // prefer the near side
          if (d + (cw - 2.6) * 120 < bd) {
            bd = d + (cw - 2.6) * 120;
            best = i;
          }
        }
      }
      const hv = best >= 0 ? B.reg[best] : -1;
      // a click is settled here, once we know what is under it
      if (P.click) {
        P.click = false;
        setFocusRef.current(hv >= 0 && hv !== focusRef.current ? hv : -1);
      }
      if (hv !== hoverRef.current) {
        hoverRef.current = hv;
        setHover(hv);
        if (hv >= 0) sfxRef.current.tick({ freq: 1400 + hv * 160, gain: 0.02 });
      }
      // the pointer is a stimulus: the neuron under it sends signals out
      if (!reduce) {
        stimT -= dt;
        if (best >= 0 && stimT <= 0) {
          stimT = 0.11;
          spawn(best, 5 + ((Math.random() * 5) | 0));
          flash(best, 0.6);
          if (now - lastTick > 120) {
            lastTick = now;
            sfxRef.current.tick({
              freq: 2600 + Math.random() * 900,
              gain: 0.006,
            });
          }
        }
        // neurons flicker on their own, as before
        const flick = dt * 22;
        for (let q = 0; q < Math.floor(flick) + (Math.random() < flick % 1 ? 1 : 0); q++) {
          const i = (Math.random() * N) | 0;
          flash(i, 0.85);
          fires[B.reg[i]]++;
        }
        // background activity, busier in the region you've chosen
        const spont = dt * 12;
        if (Math.random() < spont) spawn((Math.random() * N) | 0, 5 + ((Math.random() * 6) | 0));
        if (f >= 0 && Math.random() < dt * 9) {
          for (let tries = 0; tries < 12; tries++) {
            const i = (Math.random() * N) | 0;
            if (B.reg[i] === f) {
              spawn(i, 4 + ((Math.random() * 5) | 0));
              break;
            }
          }
        }
      }
      // signals travel at a steady speed with a fading tail; the neurons they pass glow, the last one flares
      let nt = 0;
      let nh = 0;
      const span = 0.3;
      for (let k = sigs.length - 1; k >= 0; k--) {
        const sg = sigs[k];
        sg.d += sg.speed * dt;
        const total = sg.cum[sg.cum.length - 1];
        while (sg.lit < sg.path.length - 1 && sg.cum[sg.lit + 1] <= sg.d) {
          sg.lit++;
          flash(sg.path[sg.lit], 0.45);
        }
        if (sg.d - span >= total) {
          sigs.splice(k, 1);
          continue;
        }
        if (sg.d >= total && sg.lit === sg.path.length - 1) {
          // the end of the line: a synapse flares and may set off the next neuron
          const end = sg.path[sg.path.length - 1];
          flash(end, 1);
          fires[B.reg[end]]++;
          sg.lit = sg.path.length;
          if (Math.random() < 0.55) spawn(end, 4 + ((Math.random() * 5) | 0));
        }
        const reg = B.reg[sg.path[0]];
        const fadeIn = Math.min(1, sg.d / 0.06);
        const fadeOut = sg.d > total ? Math.max(0, 1 - (sg.d - total) / span) : 1;
        for (let q = 0; q < TAIL; q++) {
          const d0 = sg.d - (span * q) / TAIL;
          const d1 = sg.d - (span * (q + 1)) / TAIL;
          if (d0 <= 0) break;
          const o = nt * 5;
          at(sg, d0, tails, o);
          tails[o + 3] = (1 - q / TAIL) * fadeIn * fadeOut;
          tails[o + 4] = reg;
          at(sg, Math.max(0, d1), tails, o + 5);
          tails[o + 8] = (1 - (q + 1) / TAIL) * fadeIn * fadeOut;
          tails[o + 9] = reg;
          nt += 2;
        }
        if (sg.d <= total) {
          at(sg, sg.d, heads, nh * 5);
          heads[nh * 5 + 3] = fadeIn;
          heads[nh * 5 + 4] = reg;
          nh++;
        }
      }
      for (let i = 0; i < N; i++) act[i] *= Math.exp(-dt * 3.2);

      // the trace: signals per second, for the chosen region or the whole brain
      bucket += dt;
      if (bucket >= 0.12) {
        const scale = 1 / bucket;
        for (let g = 0; g < 6; g++) {
          hist[g].shift();
          hist[g].push(fires[g] * scale);
        }
        hist[6].shift();
        hist[6].push((fires[0] + fires[1] + fires[2] + fires[3] + fires[4] + fires[5]) * scale);
        fires.fill(0);
        bucket = 0;
        const H = hist[f >= 0 ? f : 6];
        const avg = H.slice(-8).reduce((s, v) => s + v, 0) / 8;
        setRate(Math.round(avg));
        const sp = spark.current;
        const sc = sp?.getContext("2d");
        if (sp && sc) {
          const dpr = Math.min(2, devicePixelRatio || 1);
          const W = sp.clientWidth;
          const Hh = sp.clientHeight;
          if (sp.width !== Math.round(W * dpr)) {
            sp.width = Math.round(W * dpr);
            sp.height = Math.round(Hh * dpr);
          }
          sc.setTransform(dpr, 0, 0, dpr, 0, 0);
          sc.clearRect(0, 0, W, Hh);
          const mx = Math.max(20, ...H);
          const col = f >= 0 ? regions[f].color : "#7fb6ff";
          const grad = sc.createLinearGradient(0, 0, 0, Hh);
          grad.addColorStop(0, col + "55");
          grad.addColorStop(1, col + "00");
          sc.beginPath();
          H.forEach((v, k) => {
            const x = (k / (H.length - 1)) * W;
            const y = Hh - 2 - (v / mx) * (Hh - 6);
            if (k) sc.lineTo(x, y);
            else sc.moveTo(x, y);
          });
          sc.strokeStyle = col;
          sc.lineWidth = 1.5;
          sc.lineJoin = "round";
          sc.stroke();
          sc.lineTo(W, Hh);
          sc.lineTo(0, Hh);
          sc.fillStyle = grad;
          sc.fill();
        }
      }

      // the floating name of the region you're pointing at
      const lb = label.current;
      if (lb) {
        const g = hoverRef.current >= 0 && hoverRef.current !== f ? hoverRef.current : -1;
        if (g >= 0) {
          const [x, y, z] = B.centre[g];
          const cw = m[3] * x + m[7] * y + m[11] * z + m[15];
          const sx = (((m[0] * x + m[4] * y + m[8] * z + m[12]) / cw) * 0.5 + 0.5) * w;
          const sy = (0.5 - ((m[1] * x + m[5] * y + m[9] * z + m[13]) / cw) * 0.5) * h;
          lb.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -140%)`;
          lb.style.opacity = "1";
        } else lb.style.opacity = "0";
      }

      if (R) R.draw(m, act, tails, nt, heads, nh, f, hoverRef.current, 0.22);
      else if (ctx2d) {
        // without WebGL: the same brain, drawn flat
        const dpr = Math.min(2, devicePixelRatio || 1);
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx2d.fillStyle = "#090a11";
        ctx2d.fillRect(0, 0, w, h);
        ctx2d.lineWidth = 0.6;
        for (let e = 0; e < B.edges.length; e += 2) {
          const a = B.edges[e];
          const b = B.edges[e + 1];
          const g = B.reg[a];
          const lit = g === f || g === hoverRef.current;
          ctx2d.strokeStyle = lit
            ? regions[g].color + "66"
            : f >= 0
              ? "rgba(70,140,215,0.06)"
              : "rgba(70,140,215,0.18)";
          ctx2d.beginPath();
          ctx2d.moveTo(screen[a * 3], screen[a * 3 + 1]);
          ctx2d.lineTo(screen[b * 3], screen[b * 3 + 1]);
          ctx2d.stroke();
        }
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      R?.dispose();
    };
  }, [brain, regions, reduce]);

  // autoplay: visit each region in turn, then the whole brain
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const run = async () => {
      await wait(2200);
      let k = 0;
      while (alive && !touched.current) {
        setFocusRef.current(k % 6);
        await wait(3200);
        if (!alive || touched.current) return;
        k++;
        if (k % 6 === 0) {
          setFocusRef.current(-1);
          await wait(4200);
        }
      }
    };
    void run();
    return () => {
      alive = false;
    };
  }, [autoplay, reduce]);

  const local = (e: RPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    const { x, y } = local(e);
    Object.assign(ptr.current, {
      x,
      y,
      in: true,
      down: true,
      sx: x,
      sy: y,
      lx: x,
      ly: y,
      moved: 0,
    });
    cam.current.tYaw = NaN;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const { x, y } = local(e);
    const P = ptr.current;
    const C = cam.current;
    if (e.pointerType === "mouse") touched.current = true;
    if (P.down) {
      const dx = x - P.lx;
      const dy = y - P.ly;
      P.moved += Math.abs(dx) + Math.abs(dy);
      C.yaw += dx * 0.008;
      C.pitch = Math.max(-0.9, Math.min(0.9, C.pitch + dy * 0.006));
      C.vy = (dx * 0.008) / 0.016;
      C.tPitch = C.pitch;
    }
    Object.assign(P, { x, y, lx: x, ly: y, in: true });
  };
  const onUp = () => {
    const P = ptr.current;
    P.down = false;
    if (P.moved < 6) P.click = true;
    else {
      cam.current.vy = Math.max(-3, Math.min(3, cam.current.vy));
    }
  };

  const current = focus >= 0 ? regions[focus] : null;
  const btn = "outline-none focus-visible:ring-2 focus-visible:ring-white/80";

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[28px] ${className}`}
      style={{
        background: "#090a11",
        color: "#fff",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.06) inset, 0 40px 80px -40px rgba(8,10,30,0.8)",
      }}
    >
      <div
        ref={box}
        role="img"
        aria-label={`A brain made of neurons. ${current ? `${current.name} selected.` : "Whole brain."} Drag to turn it.`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={() => {
          if (!ptr.current.down) ptr.current.in = false;
        }}
        style={{
          position: "relative",
          height: narrow ? 470 : 560,
          cursor: hover >= 0 ? "pointer" : "grab",
          touchAction: "pan-y",
        }}
      >
        <canvas
          ref={cv}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(80% 70% at 50% 50%, transparent 55%, rgba(5,6,10,0.75) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          ref={label}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            opacity: 0,
            transition: "opacity 0.2s",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            height: 28,
            padding: "0 11px",
            borderRadius: 14,
            background: "rgba(14,16,26,0.72)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
            fontSize: 12.5,
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              background: hover >= 0 ? regions[hover]?.color : "#fff",
            }}
          />
          {hover >= 0 ? regions[hover]?.name : ""}
        </div>
        {noGL && (
          <div
            style={{
              position: "absolute",
              right: 16,
              top: 16,
              fontSize: 11.5,
              color: "rgba(255,255,255,0.45)",
            }}
          >
            Simplified view
          </div>
        )}
      </div>

      {/* what's selected, and how busy it is */}
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 22,
          maxWidth: narrow ? "calc(100% - 48px)" : 300,
          pointerEvents: "none",
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={focus}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {current && (
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 5,
                    background: current.color,
                    boxShadow: `0 0 12px ${current.color}`,
                  }}
                />
              )}
              <span
                style={{
                  fontSize: narrow ? 22 : 26,
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                }}
              >
                {current ? current.name : "Whole brain"}
              </span>
            </div>
            <div
              style={{
                fontSize: 13.5,
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.62)",
                marginTop: 4,
              }}
            >
              {current ? current.detail : "Point at a region to wake it. Drag to turn the brain."}
            </div>
          </motion.div>
        </AnimatePresence>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
            marginTop: 14,
          }}
        >
          <canvas ref={spark} aria-hidden="true" style={{ width: 132, height: 34, display: "block" }} />
          <div style={{ fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{rate}</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)" }}>signals a second</div>
          </div>
        </div>
      </div>

      {/* the regions */}
      <div
        role="group"
        aria-label="Brain regions"
        style={{
          position: narrow ? "relative" : "absolute",
          left: narrow ? undefined : 24,
          right: narrow ? undefined : 24,
          bottom: narrow ? undefined : 20,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: narrow ? "flex-start" : "center",
          gap: 6,
          padding: narrow ? "0 16px 18px" : 0,
        }}
      >
        {regions.map((r, i) => {
          const on = focus === i;
          return (
            <motion.button
              key={r.name}
              type="button"
              aria-pressed={on}
              onClick={() => {
                touched.current = true;
                setFocus(on ? -1 : i);
              }}
              onPointerEnter={() => {
                hoverRef.current = i;
                setHover(i);
              }}
              onPointerLeave={() => {
                hoverRef.current = -1;
                setHover(-1);
              }}
              whileTap={{ scale: 0.95 }}
              className={btn}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                height: 32,
                padding: "0 12px",
                borderRadius: 16,
                border: 0,
                cursor: "pointer",
                fontSize: 12.5,
                fontWeight: 600,
                color: on ? "#0b0c12" : "rgba(255,255,255,0.82)",
                background: on ? r.color : "rgba(255,255,255,0.06)",
                boxShadow: on ? `0 8px 22px -8px ${r.color}` : "inset 0 0 0 1px rgba(255,255,255,0.09)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                transition: "background 0.25s, color 0.25s, box-shadow 0.25s",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 4,
                  background: on ? "#0b0c12" : r.color,
                }}
              />
              {r.name}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    playbackSession();
    master = ctx.createGain();
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
}
```
