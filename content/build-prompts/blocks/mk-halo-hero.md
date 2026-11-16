# Halo Hero

Add the "Halo Hero" section from Nexus UI to my project.

A hero section inside a living halo of light: tens of thousands of particles on a shell that breathes, wobbles in slow lobes and turns, coloured top to bottom from amber through rose and violet to blue. Point at the halo and it flares where you are, the particles thrown out, stirred and burning white hot; move into the hollow and it breathes in. Press the button and it goes nova. Switch its form and the particles flow into a ring, a torus or a disc.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { HaloHero } from "@/components/halo-hero";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/halo-hero/index.ts ---

```ts
export { default as HaloHero } from "./halo-hero";
export type { HaloHeroProps } from "./halo-hero";
```

--- components/halo-hero/halo-hero.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type PointerEvent as RPointerEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type HaloShape = "sphere" | "ring" | "torus" | "disc";
export type HaloHeroProps = {
  title?: string;
  body?: string;
  cta?: string;
  onCta?: () => void;
  /** the form the particles take; with `switcher` they flow between forms */
  shape?: HaloShape;
  /** four colours, top to bottom, or one of the built-in palettes */
  palette?: "ember" | "ice" | "aurora" | [string, string, string, string];
  /** show the row of forms to switch between */
  switcher?: boolean;
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

const I = {
  arrow:
    "M204 64v104a12 12 0 0 1-24 0V93L72.49 200.49a12 12 0 0 1-17-17L163 76H88a12 12 0 0 1 0-24h104a12 12 0 0 1 12 12",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const PALETTES: Record<string, [string, string, string, string]> = {
  ember: ["#ffb02e", "#ff4d5e", "#a259ff", "#3a6dff"],
  ice: ["#f2fbff", "#7fe3ff", "#4a8dff", "#9b6bff"],
  aurora: ["#c9ff6b", "#2ff0b0", "#22c7ff", "#8b5cff"],
};
const SHAPES: { id: HaloShape; label: string }[] = [
  { id: "sphere", label: "Sphere" },
  { id: "ring", label: "Ring" },
  { id: "torus", label: "Torus" },
  { id: "disc", label: "Disc" },
];
// each form turns about its own axis
const AXES: Record<HaloShape, [number, number, number]> = {
  sphere: [0, 1, 0],
  ring: [0, 0, 1],
  torus: [0, Math.cos(0.75), Math.sin(0.75)],
  disc: [0, Math.cos(0.42), Math.sin(0.42)],
};
const CAM = 4;

const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** every particle's resting place and outward direction, for one form; particle i keeps its own random numbers in each */
function layout(shape: HaloShape, n: number) {
  const P = new Float32Array(n * 3);
  const N = new Float32Array(n * 3);
  const rand = rng(17);
  const tiltX = (v: number[], a: number) => [
    v[0],
    v[1] * Math.cos(a) - v[2] * Math.sin(a),
    v[1] * Math.sin(a) + v[2] * Math.cos(a),
  ];
  for (let i = 0; i < n; i++) {
    const u = rand();
    const w = rand();
    let p: number[];
    let q: number[];
    if (shape === "sphere") {
      // evenly over a sphere's surface
      const z = u * 2 - 1;
      const a = w * Math.PI * 2;
      const r = Math.sqrt(1 - z * z);
      p = [r * Math.cos(a), r * Math.sin(a), z];
      q = p;
    } else if (shape === "ring") {
      // a band facing you
      const a = u * Math.PI * 2;
      p = [Math.cos(a), Math.sin(a), (w - 0.5) * 0.14];
      q = [Math.cos(a), Math.sin(a), 0];
    } else if (shape === "torus") {
      // a tube round a circle, tipped towards you
      const a = u * Math.PI * 2;
      const b = w * Math.PI * 2;
      const R = 0.72;
      const r = 0.3;
      const c = [Math.cos(a), 0, Math.sin(a)];
      q = [c[0] * Math.cos(b), Math.sin(b), c[2] * Math.cos(b)];
      p = [c[0] * R + q[0] * r, q[1] * r, c[2] * R + q[2] * r];
      p = tiltX(p, 0.75);
      q = tiltX(q, 0.75);
    } else {
      // a flat disc, denser towards the middle, tipped so it reads as an ellipse
      const a = u * Math.PI * 2;
      const r = Math.sqrt(w) * 1.05;
      p = tiltX([Math.cos(a) * r, 0, Math.sin(a) * r], 0.42);
      q = tiltX([0, 1, 0], 0.42);
    }
    P.set(p, i * 3);
    N.set(q, i * 3);
  }
  return { P, N };
}

// ---------------------------------------------------------------- the particles (WebGL)

const NOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const VS = `
precision highp float;
attribute vec3 aA; attribute vec3 aNA; attribute vec3 aB; attribute vec3 aNB; attribute vec4 aR;
uniform float uT; uniform float uRot; uniform vec3 uAxis; uniform vec2 uLean; uniform vec2 uScale; uniform float uOffY;
uniform vec2 uPtr; uniform float uHover; uniform float uInside; uniform float uPulse; uniform float uMorph;
uniform float uSize; uniform float uDpr; uniform vec3 uC0; uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3;
varying vec3 vCol; varying float vA;
${NOISE}
vec3 turn(vec3 p, vec3 k, float a) { float c = cos(a), s = sin(a); return p * c + cross(k, p) * s + k * dot(k, p) * (1.0 - c); }
void main() {
  // between two forms: each particle sets off at its own moment, and swings out on the way
  float m = smoothstep(0.0, 1.0, clamp(uMorph * 1.5 - aR.z * 0.5, 0.0, 1.0));
  vec3 base = mix(aA, aB, m);
  vec3 n = normalize(mix(aNA, aNB, m) + vec3(1e-4));
  base += n * sin(m * 3.14159) * (0.25 + aR.x * 0.35);
  // the shell breathes and wobbles in slow lobes, with a fine ripple on top; its particles are spread through a thickness,
  // a few flung further out as dust
  float lobes = snoise(base * 1.5 + vec3(0.0, uT * 0.13, uT * 0.05));
  float fine = snoise(base * 4.5 + vec3(uT * 0.32));
  float spread = (aR.x + aR.y - 1.0) * 0.07 + max(0.0, aR.w - 0.93) * 2.6;
  float breath = 1.0 + 0.025 * sin(uT * 0.9) - uInside * 0.05;
  vec3 p = base * breath + n * (lobes * 0.12 + fine * 0.035 + spread);
  // and every particle wanders a little round its place
  p += vec3(sin(uT * (0.6 + aR.y) + aR.z * 6.28), cos(uT * (0.5 + aR.z) + aR.w * 6.28), sin(uT * (0.7 + aR.w) + aR.y * 6.28)) * 0.014;
  // a nova: the whole form throws out and settles
  float nova = uPulse > 0.0 ? (uPulse / 0.14) * exp(1.0 - uPulse / 0.14) : 0.0;
  p += normalize(p + vec3(1e-4)) * nova * (0.12 + aR.x * 0.4);
  p = turn(p, uAxis, uRot);
  vec3 nr = turn(n, uAxis, uRot);
  // the whole thing leans a touch towards the pointer
  p = turn(p, vec3(0.0, 1.0, 0.0), uLean.x);
  p = turn(p, vec3(1.0, 0.0, 0.0), -uLean.y);
  // under the pointer it flares: the particles there are thrown out and stirred, and burn hotter
  float f = ${CAM.toFixed(1)} / (${CAM.toFixed(1)} - p.z);
  vec2 sp = p.xy * f;
  float d = length(sp - uPtr);
  float inf = exp(-d * d / 0.075) * uHover;
  if (inf > 0.002) {
    vec3 out_ = normalize(p + vec3(1e-4));
    vec3 stir = vec3(snoise(p * 3.5 + vec3(uT * 0.9)), snoise(p * 3.5 + vec3(13.1, uT * 0.9, 0.0)), snoise(p * 3.5 + vec3(0.0, 27.3, uT * 0.9)));
    p += out_ * inf * (0.12 + aR.x * 0.32) + stir * inf * 0.14;
    f = ${CAM.toFixed(1)} / (${CAM.toFixed(1)} - p.z);
  }
  gl_Position = vec4(p.x * f * uScale.x, p.y * f * uScale.y + uOffY, 0.0, 1.0);
  // colour runs top to bottom through the palette
  float k = clamp(0.5 - p.y * f * 0.5 + (aR.y - 0.5) * 0.08, 0.0, 1.0) * 3.0;
  vec3 col = k < 1.0 ? mix(uC0, uC1, k) : k < 2.0 ? mix(uC1, uC2, k - 1.0) : mix(uC2, uC3, k - 2.0);
  col = mix(col, vec3(1.0, 0.96, 0.9), clamp(inf * 0.5 + nova * 0.35, 0.0, 0.8));
  vCol = col;
  float depth = clamp((p.z + 1.3) / 2.6, 0.0, 1.0);
  // a shell is brightest where you look along it, at its edge; the faces turned to you are a faint veil
  float limb = mix(0.2, 1.0, pow(1.0 - abs(nr.z), 1.4));
  vA = (0.3 + depth * 0.5) * (0.5 + aR.w * 0.5) * limb * (1.0 + inf * 2.2 + nova * 0.8 + uInside * 0.15);
  gl_PointSize = max(1.0, uSize * uDpr * f * (0.45 + aR.y * 0.8) * (1.0 + inf * 0.6));
}`;
const FS = `
precision mediump float;
varying vec3 vCol; varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.05, d) * vA;
  gl_FragColor = vec4(vCol * a * 1.7, a * 0.7);
}`;

type Frame = {
  W: number;
  H: number;
  t: number;
  rot: number;
  axis: number[];
  lean: [number, number];
  scale: [number, number];
  offY: number;
  ptr: [number, number];
  hover: number;
  inside: number;
  pulse: number;
  morph: number;
  size: number;
  dpr: number;
  pal: number[][];
};
type Renderer = {
  draw: (f: Frame) => void;
  setForms: (from: HaloShape, to: HaloShape) => void;
  dispose: () => void;
};
const pendingLose = new WeakMap<HTMLCanvasElement, ReturnType<typeof setTimeout>>();

function makeGL(canvas: HTMLCanvasElement, n: number): Renderer | null {
  clearTimeout(pendingLose.get(canvas));
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl", {
      premultipliedAlpha: true,
      alpha: true,
      antialias: false,
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
    console.warn("HaloHero: a shader didn't compile, so it draws without WebGL.", g.getShaderInfoLog(s));
    return null;
  };
  const vs = sh(g.VERTEX_SHADER, VS);
  const fs = sh(g.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return null;
  const prog = g.createProgram()!;
  g.attachShader(prog, vs);
  g.attachShader(prog, fs);
  ["aA", "aNA", "aB", "aNB", "aR"].forEach((s, i) => g.bindAttribLocation(prog, i, s));
  g.linkProgram(prog);
  if (!g.getProgramParameter(prog, g.LINK_STATUS)) return null;
  g.useProgram(prog);
  const buf = (data: Float32Array, loc: number, size: number) => {
    const b = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, b);
    g.bufferData(g.ARRAY_BUFFER, data, g.STATIC_DRAW);
    g.enableVertexAttribArray(loc);
    g.vertexAttribPointer(loc, size, g.FLOAT, false, 0, 0);
    return b;
  };
  const rand = rng(5);
  const R = new Float32Array(n * 4);
  for (let i = 0; i < R.length; i++) R[i] = rand();
  buf(R, 4, 4);
  const cache = new Map<HaloShape, { P: Float32Array; N: Float32Array }>();
  const form = (s: HaloShape) => {
    if (!cache.has(s)) cache.set(s, layout(s, n));
    return cache.get(s)!;
  };
  const bufs = [g.createBuffer(), g.createBuffer(), g.createBuffer(), g.createBuffer()];
  const setForms = (from: HaloShape, to: HaloShape) => {
    const A = form(from);
    const B = form(to);
    [A.P, A.N, B.P, B.N].forEach((d, i) => {
      g.bindBuffer(g.ARRAY_BUFFER, bufs[i]);
      g.bufferData(g.ARRAY_BUFFER, d, g.STATIC_DRAW);
      g.enableVertexAttribArray(i);
      g.vertexAttribPointer(i, 3, g.FLOAT, false, 0, 0);
    });
  };
  const u = (s: string) => g.getUniformLocation(prog, s);
  const U = Object.fromEntries(
    [
      "uT",
      "uRot",
      "uAxis",
      "uLean",
      "uScale",
      "uOffY",
      "uPtr",
      "uHover",
      "uInside",
      "uPulse",
      "uMorph",
      "uSize",
      "uDpr",
      "uC0",
      "uC1",
      "uC2",
      "uC3",
    ].map((s) => [s, u(s)]),
  );
  g.disable(g.DEPTH_TEST);
  g.enable(g.BLEND);
  g.blendFunc(g.ONE, g.ONE);
  return {
    setForms,
    draw(f) {
      if (canvas.width !== f.W || canvas.height !== f.H) {
        canvas.width = f.W;
        canvas.height = f.H;
      }
      g.viewport(0, 0, f.W, f.H);
      g.uniform1f(U.uT, f.t);
      g.uniform1f(U.uRot, f.rot);
      g.uniform3f(U.uAxis, f.axis[0], f.axis[1], f.axis[2]);
      g.uniform2f(U.uLean, f.lean[0], f.lean[1]);
      g.uniform2f(U.uScale, f.scale[0], f.scale[1]);
      g.uniform1f(U.uOffY, f.offY);
      g.uniform2f(U.uPtr, f.ptr[0], f.ptr[1]);
      g.uniform1f(U.uHover, f.hover);
      g.uniform1f(U.uInside, f.inside);
      g.uniform1f(U.uPulse, f.pulse);
      g.uniform1f(U.uMorph, f.morph);
      g.uniform1f(U.uSize, f.size);
      g.uniform1f(U.uDpr, f.dpr);
      f.pal.forEach((c, i) => g.uniform3f(U[`uC${i}`], c[0], c[1], c[2]));
      g.clearColor(0, 0, 0, 0);
      g.clear(g.COLOR_BUFFER_BIT);
      g.drawArrays(g.POINTS, 0, n);
    },
    dispose() {
      pendingLose.set(
        canvas,
        setTimeout(() => g.getExtension("WEBGL_lose_context")?.loseContext(), 300),
      );
    },
  };
}

/** without WebGL: fewer particles, placed on the CPU and drawn as glowing dots */
function make2D(canvas: HTMLCanvasElement): Renderer | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const n = 5000;
  const rand = rng(5);
  const R = Array.from({ length: n }, () => [rand(), rand(), rand(), rand()]);
  let A = layout("sphere", n);
  let B = A;
  return {
    setForms(from, to) {
      A = layout(from, n);
      B = layout(to, n);
    },
    draw(f) {
      if (canvas.width !== f.W || canvas.height !== f.H) {
        canvas.width = f.W;
        canvas.height = f.H;
      }
      ctx.clearRect(0, 0, f.W, f.H);
      ctx.globalCompositeOperation = "lighter";
      const [ax, ay, az] = f.axis;
      const c = Math.cos(f.rot);
      const s = Math.sin(f.rot);
      for (let i = 0; i < n; i++) {
        const r = R[i];
        const m = Math.min(1, Math.max(0, f.morph * 1.5 - r[2] * 0.5));
        let x = A.P[i * 3] + (B.P[i * 3] - A.P[i * 3]) * m;
        let y = A.P[i * 3 + 1] + (B.P[i * 3 + 1] - A.P[i * 3 + 1]) * m;
        let z = A.P[i * 3 + 2] + (B.P[i * 3 + 2] - A.P[i * 3 + 2]) * m;
        const k = 1 + (r[0] + r[1] - 1) * 0.1 + Math.sin(f.t * 0.7 + r[3] * 9) * 0.03;
        x *= k;
        y *= k;
        z *= k;
        const d = ax * x + ay * y + az * z;
        const cx = ay * z - az * y;
        const cy = az * x - ax * z;
        const cz = ax * y - ay * x;
        const px = x * c + cx * s + ax * d * (1 - c);
        const py = y * c + cy * s + ay * d * (1 - c);
        const pz = z * c + cz * s + az * d * (1 - c);
        const pf = CAM / (CAM - pz);
        const sx = px * pf;
        const sy = py * pf;
        const near = Math.exp(-((sx - f.ptr[0]) ** 2 + (sy - f.ptr[1]) ** 2) / 0.075) * f.hover;
        const t = Math.min(0.999, Math.max(0, 0.5 - sy * 0.5)) * 3;
        const j = Math.floor(t);
        const q = t - j;
        const col = f.pal[j].map((v, e) => v + (f.pal[j + 1][e] - v) * q);
        const a = (0.25 + ((pz + 1.3) / 2.6) * 0.55) * (1 + near * 1.6);
        ctx.fillStyle = `rgba(${Math.round(col[0] * 255)},${Math.round(col[1] * 255)},${Math.round(col[2] * 255)},${Math.min(1, a)})`;
        const X = f.W / 2 + (sx * f.scale[0] * f.W) / 2;
        const Y = f.H / 2 - ((sy * f.scale[1] + f.offY) * f.H) / 2;
        const S = f.size * f.dpr * pf * 0.8;
        ctx.fillRect(X - S / 2, Y - S / 2, S, S);
      }
      ctx.globalCompositeOperation = "source-over";
    },
    dispose() {},
  };
}

const rgb = (hex: string) => {
  const v = parseInt(hex.slice(1), 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
};

// ---------------------------------------------------------------- the component

/**
 * A hero section inside a living halo of light: tens of thousands of particles on a shell that breathes, wobbles in
 * slow lobes and turns, coloured top to bottom through a palette.
 *
 * Point at the halo and it flares where you are: the particles there are thrown outward and stirred, and burn white
 * hot; move into the hollow and it breathes in. Press the button (or the halo) and it goes nova, throwing everything
 * out and settling. With `switcher` it can become a ring, a torus or a disc, and the particles flow from one form to
 * the next, each setting off at its own moment and swinging out on the way.
 *   <HaloHero title="Lumen" cta="Start writing" onCta={start} />
 */
export default function HaloHero({
  title = "Lumen",
  body = "Notes that gather your scattered ideas, and light up the ones you need right now.",
  cta = "Start writing",
  onCta,
  shape = "sphere",
  palette = "ember",
  switcher = false,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: HaloHeroProps) {
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
  const uid = useId().replace(/:/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const flatRef = useRef<HTMLCanvasElement>(null);
  const touched = useRef(false);
  const autoRef = useRef(autoplay);
  autoRef.current = autoplay;
  const [form, setForm] = useState<HaloShape>(shape);
  useEffect(() => setForm(shape), [shape]);
  const [mode, setMode] = useState<"gl" | "2d" | "none">("none");
  // the pointer in halo units, and requests for the frame loop
  const ptr = useRef({ x: 9, y: 9, inside: false });
  const pulseAt = useRef(-1);
  const want = useRef<HaloShape>(shape);
  want.current = form;
  const pal = useMemo(
    () => (Array.isArray(palette) ? palette : (PALETTES[palette] ?? PALETTES.ember)).map(rgb),
    [palette],
  );
  const palRef = useRef(pal);
  palRef.current = pal;
  const kickRef = useRef<() => void>(() => {});
  const switcherRef = useRef(switcher);
  switcherRef.current = switcher;
  const setFormRef = useRef(setForm);
  setFormRef.current = setForm;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !glRef.current) return;
    const rect0 = wrap.getBoundingClientRect();
    const n = Math.round(Math.max(22000, Math.min(70000, ((rect0.width * rect0.height) / (860 * 540)) * 70000)));
    let r = makeGL(glRef.current, n);
    let used: "gl" | "2d" = "gl";
    if (!r && flatRef.current) {
      r = make2D(flatRef.current);
      used = "2d";
    }
    if (!r) return;
    const R = r;
    setMode(used);
    let from: HaloShape = want.current;
    let to: HaloShape = want.current;
    R.setForms(from, to);
    let morph = 1;
    let axis = [...AXES[to]];
    let t = 0;
    let rot = 0;
    let hover = 0;
    let inside = 0;
    const sp = { x: 9, y: 9 };
    const lean: [number, number] = [0, 0];
    let last = performance.now();
    let raf = 0;
    let visible = true;
    let flareCool = 0;
    let wasNear = false;
    let lastForm = performance.now();

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      const rect = wrap.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8) return;
      if (!reduce) t += dt;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const Lh = Math.min(rect.width * 0.45, rect.height * 0.36);
      const offY = 0.04;

      // a new form: start flowing towards it from wherever it is now
      if (want.current !== to) {
        from = morph < 0.5 ? from : to;
        to = want.current;
        R.setForms(from, to);
        morph = 0;
        sfxRef.current.whoosh(500, 1600, { dur: 0.7, gain: 0.025 });
      }
      morph = reduce ? 1 : Math.min(1, morph + dt / 1.6);
      const ax = AXES[to];
      axis = axis.map((v, i) => v + (ax[i] - v) * Math.min(1, dt * 3));
      const al = Math.hypot(axis[0], axis[1], axis[2]) || 1;
      axis = axis.map((v) => v / al);

      // the demo: a ghost pointer circles the halo, it goes nova now and then, and changes form
      const p = ptr.current;
      let tx = p.x;
      let ty = p.y;
      let on = p.inside;
      if (!p.inside && autoRef.current && !touched.current && !reduce) {
        const a = t * 0.9;
        tx = Math.cos(a) * 1.02;
        ty = Math.sin(a * 1.3) * 0.75 + 0.1;
        on = true;
        if (t % 9 < dt) pulseAt.current = t;
        if (switcherRef.current && now - lastForm > 6000) {
          lastForm = now;
          const i = SHAPES.findIndex((s) => s.id === want.current);
          setFormRef.current(SHAPES[(i + 1) % SHAPES.length].id);
        }
      }
      sp.x += (tx - sp.x) * Math.min(1, dt * 10);
      sp.y += (ty - sp.y) * Math.min(1, dt * 10);
      hover += ((on && !reduce ? 1 : 0) - hover) * Math.min(1, dt * (on ? 6 : 2.5));
      const rr = Math.hypot(sp.x, sp.y);
      inside += ((on && rr < 0.7 && !reduce ? 1 : 0) - inside) * Math.min(1, dt * 3);
      lean[0] += ((on ? sp.x * 0.12 : 0) - lean[0]) * Math.min(1, dt * 3);
      lean[1] += ((on ? sp.y * 0.12 : 0) - lean[1]) * Math.min(1, dt * 3);
      rot += dt * (0.18 + hover * 0.12);

      // a faint shimmer as the pointer reaches the shell
      const near = on && Math.abs(rr - 1) < 0.25;
      flareCool -= dt;
      if (near && !wasNear && flareCool <= 0 && !reduce) {
        sfxRef.current.note(1800 + Math.random() * 900, {
          dur: 0.6,
          gain: 0.012,
          bell: 0.8,
        });
        flareCool = 0.35;
      }
      wasNear = near;

      if (pulseAt.current === -2) pulseAt.current = t; // a press asks for one now, on this clock
      const age = pulseAt.current >= 0 ? t - pulseAt.current : -1;
      R.draw({
        W: Math.round(rect.width * dpr),
        H: Math.round(rect.height * dpr),
        t,
        rot,
        axis,
        lean,
        scale: [(2 * Lh) / rect.width, (2 * Lh) / rect.height],
        offY,
        ptr: [sp.x, sp.y],
        hover,
        inside,
        pulse: age >= 0 && age < 2.5 && !reduce ? age : 0,
        morph,
        size: Math.max(1.4, Math.min(2.1, Lh / 110)),
        dpr,
        pal: palRef.current,
      });
      if (!reduce && visible) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    kickRef.current = kick;
    kick();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(wrap);
    const ro = new ResizeObserver(() => kick());
    ro.observe(wrap);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      R.dispose();
    };
  }, [reduce]);
  // a still frame again when anything it shows changes under reduced motion
  useEffect(() => kickRef.current(), [form, pal]);

  const toHalo = (e: RPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const Lh = Math.min(r.width * 0.45, r.height * 0.36);
    return {
      x: (e.clientX - r.left - r.width / 2) / Lh,
      y: -(e.clientY - r.top - r.height / 2) / Lh - 0.04 * (r.height / 2 / Lh),
    };
  };
  const nova = () => {
    unlockAudio();
    if (!reduce) {
      pulseAt.current = -2; // the frame loop starts it on its own clock
      sfx.whoosh(300, 2400, { dur: 0.9, gain: 0.04 });
      sfx.note(660, { dur: 1.1, gain: 0.03, bell: 0.7 });
    }
  };

  return (
    <div
      ref={wrapRef}
      onPointerMove={(e) => {
        const q = toHalo(e);
        ptr.current = { ...q, inside: true };
        if (e.isTrusted) touched.current = true;
      }}
      onPointerLeave={() => (ptr.current = { ...ptr.current, inside: false })}
      onPointerDown={(e) => {
        touched.current = true;
        unlockAudio();
        const q = toHalo(e);
        // pressing on the halo itself sets it off
        if (Math.abs(Math.hypot(q.x, q.y) - 1) < 0.3 && !(e.target as HTMLElement).closest("button")) nova();
      }}
      className={`relative h-[540px] w-full max-w-[880px] select-none overflow-hidden rounded-[28px] text-white ${className}`}
      style={{
        background: "radial-gradient(90% 80% at 50% 45%, #0d0c16 0%, #06060a 70%, #040406 100%)",
        boxShadow: "0 0 0 1px rgba(255,255,255,.06), 0 30px 60px -30px rgba(0,0,0,.6)",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Inter, system-ui, sans-serif",
      }}
    >
      <canvas
        ref={glRef}
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

      <section
        aria-labelledby={`${uid}-t`}
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 pb-8 text-center"
      >
        <h3
          id={`${uid}-t`}
          className="text-[clamp(34px,7vw,64px)] font-semibold leading-[1.02] tracking-[-0.045em]"
          style={{ textShadow: "0 2px 30px rgba(0,0,0,.6)" }}
        >
          {title}
        </h3>
        <p
          className="mt-3 max-w-[min(300px,62%)] text-[14.5px] leading-[1.45] text-white/65"
          style={{ textShadow: "0 1px 12px rgba(0,0,0,.8)" }}
        >
          {body}
        </p>
        <motion.button
          type="button"
          onClick={() => {
            touched.current = true;
            nova();
            onCta?.();
          }}
          whileHover={reduce ? undefined : { scale: 1.03 }}
          whileTap={reduce ? undefined : { scale: 0.96 }}
          transition={{ type: "spring", stiffness: 500, damping: 26 }}
          className="pointer-events-auto relative mt-6 flex h-11 items-center gap-2.5 rounded-full pl-5 pr-1.5 text-[14px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          style={{
            background: `linear-gradient(#0b0a12, #0b0a12) padding-box, linear-gradient(110deg, ${(Array.isArray(palette) ? palette : (PALETTES[palette] ?? PALETTES.ember)).join(", ")}) border-box`,
            border: "1px solid transparent",
            boxShadow: "0 10px 30px -12px rgba(160,90,255,.55), inset 0 1px 0 rgba(255,255,255,.08)",
          }}
        >
          {cta}
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#0b0a12]">
            <Ico d={I.arrow} size={14} />
          </span>
        </motion.button>
      </section>

      {switcher && (
        <div role="radiogroup" aria-label="Form" className="absolute inset-x-0 bottom-5 flex justify-center">
          <div className="flex gap-1 rounded-full bg-white/[0.06] p-1 backdrop-blur">
            {SHAPES.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={form === s.id}
                onClick={() => {
                  touched.current = true;
                  unlockAudio();
                  setForm(s.id);
                }}
                className={`relative rounded-full px-3.5 py-1.5 text-[12.5px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/60 ${form === s.id ? "text-[#0b0a12]" : "text-white/60 hover:text-white"}`}
              >
                <AnimatePresence>
                  {form === s.id && (
                    <motion.span
                      layoutId={reduce ? undefined : `${uid}-f`}
                      className="absolute inset-0 -z-0 rounded-full bg-white"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 36,
                      }}
                    />
                  )}
                </AnimatePresence>
                <span className="relative">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
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
