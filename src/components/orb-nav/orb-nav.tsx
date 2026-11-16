"use client";

/* eslint-disable react-hooks/immutability, react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  type KeyboardEvent as RKeyboardEvent,
  type MutableRefObject,
  type PointerEvent as RPointerEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type OrbNavItem = {
  id: string;
  label: string;
  accent: string;
  line?: string;
};
export type OrbNavSuggestion = { label: string; hint: string; go?: string };
export type OrbNavProps = {
  brand?: string;
  items?: OrbNavItem[];
  defaultActive?: string;
  cta?: string;
  suggestions?: OrbNavSuggestion[];
  onNavigate?: (id: string) => void;
  onAsk?: (question: string) => void;
  /** leave out the studio behind the bar, for use at the top of a real page */
  bare?: boolean;
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
  menu: "M228 128a12 12 0 0 1-12 12H40a12 12 0 0 1 0-24h176a12 12 0 0 1 12 12M40 76h176a12 12 0 0 0 0-24H40a12 12 0 0 0 0 24m176 104H40a12 12 0 0 0 0 24h176a12 12 0 0 0 0-24",
  close:
    "M208.49 191.51a12 12 0 0 1-17 17L128 145l-63.51 63.49a12 12 0 0 1-17-17L111 128L47.51 64.49a12 12 0 0 1 17-17L128 111l63.51-63.52a12 12 0 0 1 17 17L145 128Z",
  search:
    "M232.49 215.51L185 168a92.12 92.12 0 1 0-17 17l47.53 47.54a12 12 0 0 0 17-17ZM44 112a68 68 0 1 1 68 68a68.07 68.07 0 0 1-68-68",
  arrow:
    "m224.49 136.49l-72 72a12 12 0 0 1-17-17L187 140H40a12 12 0 0 1 0-24h147l-51.49-51.52a12 12 0 0 1 17-17l72 72a12 12 0 0 1-.02 17.01",
  enter:
    "M204 32v144a12 12 0 0 1-12 12H77l27.52 27.51a12 12 0 0 1-17 17l-48-48a12 12 0 0 1 0-17l48-48a12 12 0 1 1 17 17L77 164h103V32a12 12 0 0 1 24 0",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

// a glassblowing studio: the orb is one of its pieces
const ITEMS: OrbNavItem[] = [
  {
    id: "collection",
    label: "Collection",
    accent: "#2f6fdb",
    line: "Fourteen pieces, blown this winter.",
  },
  {
    id: "process",
    label: "Process",
    accent: "#e0902a",
    line: "Every piece starts as sand at 1,100 degrees.",
  },
  {
    id: "studio",
    label: "Studio",
    accent: "#239c86",
    line: "Four furnaces, two benches, one dog.",
  },
  {
    id: "visit",
    label: "Visit",
    accent: "#d4547a",
    line: "Open Thursday to Sunday, by the canal.",
  },
];
const SUGGESTIONS: OrbNavSuggestion[] = [
  { label: "Book a studio visit", hint: "Visit", go: "visit" },
  {
    label: "Cobalt pieces in the collection",
    hint: "Collection",
    go: "collection",
  },
  { label: "How a piece is blown", hint: "Process", go: "process" },
  { label: "Commission a piece", hint: "Studio", go: "studio" },
  { label: "Opening hours", hint: "Visit", go: "visit" },
];

// ---------------------------------------------------------------- the glass (WebGL)

const VS = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const FS = `precision highp float;
uniform vec2 uRes;
uniform float uK;
uniform float uT;
uniform float uRot;
uniform vec3 uTint;
uniform float uTintAmt;
uniform vec3 uL;
uniform float uEnergy;
uniform float uPulse;
uniform float uFloor;
uniform float uSmall;

vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}


// a curated, cyclic palette for the light inside: electric cyan, violet, magenta, warm gold
vec3 pal(float x){
  x = fract(x);
  vec3 c0 = vec3(0.22, 0.9, 1.0);
  vec3 c1 = vec3(0.52, 0.36, 1.0);
  vec3 c2 = vec3(1.0, 0.3, 0.82);
  vec3 c3 = vec3(1.0, 0.7, 0.26);
  float s = x * 4.0;
  return s < 1.0 ? mix(c0, c1, smoothstep(0.0, 1.0, s)) : s < 2.0 ? mix(c1, c2, smoothstep(0.0, 1.0, s - 1.0)) : s < 3.0 ? mix(c2, c3, smoothstep(0.0, 1.0, s - 2.0)) : mix(c3, c0, smoothstep(0.0, 1.0, s - 3.0));
}

// the studio around the ball. Behind it (z < 0): the pale surface it sits in front of. In front (z > 0): a grey room
// that is a little brighter toward the lamp.
vec3 env(vec3 d){
  vec3 col;
  if (d.z < 0.0) {
    col = mix(vec3(0.8, 0.815, 0.85), vec3(0.985, 0.986, 0.99), smoothstep(-0.95, 0.45, d.y));
    // where the backdrop curves into the floor: a soft darker band
    col *= 1.0 - 0.22 * exp(-pow((d.y + 0.28) / 0.12, 2.0));
    // looking sideways out of the ball you see the dim room, not the bright backdrop: this is what draws the dark
    // line round the inside of real glass
    col *= mix(0.32, 1.0, smoothstep(0.05, 0.75, -d.z));
    col = mix(col, uTint * 0.85 + 0.15, uTintAmt * 0.07);
  } else {
    col = mix(vec3(0.22, 0.23, 0.27), vec3(0.72, 0.74, 0.79), smoothstep(-0.65, 0.75, d.y));
    // no hard-edged lamps in the room: just a broad, soft brightening toward the lamp, so the glass keeps a gentle
    // sheen that follows the pointer without a white window or strip printed on it
    vec3 L = normalize(uL);
    col += vec3(0.75, 0.76, 0.8) * pow(max(dot(d, L), 0.0), 3.0);
  }
  return col;
}

// one wavelength through the ball: in at the front, across, out at the back (or reflected back in if it can't leave)
vec3 through(vec3 n, float ior, out float t, out vec3 d1){
  d1 = refract(vec3(0.0, 0.0, -1.0), n, 1.0 / ior);
  t = -2.0 * dot(n, d1);
  vec3 P2 = n + d1 * t;
  vec3 d2 = refract(d1, -P2, ior);
  if (dot(d2, d2) < 1e-4) d2 = reflect(d1, -P2);
  return env(d2);
}

void main(){
  vec2 p = (gl_FragCoord.xy / uRes) * 2.0 - 1.0;
  vec2 b = p * uK;
  float px = 2.0 * uK / uRes.x;
  float r = length(b);
  vec3 L = normalize(uL);

  // ------------------------------------------------ what the ball does to the floor under it
  // Only a ball standing on a floor casts anything; the one in the bar is drawn clean, with no shadow or spill.
  vec3 lightC = mix(pal(uT * 0.04 + 0.15), uTint, uTintAmt * 0.6);
  vec4 ground = vec4(0.0);
  if (uFloor > 0.5) {
    // the floor seen at a low angle: distances along it squash vertically on screen
    vec2 fp = vec2(b.x, (b.y + 1.0) * 5.2);
    // contact: small and dense right under the point where it touches
    vec2 c1 = fp * vec2(3.4, 1.7);
    float contact = exp(-dot(c1, c1)) * 0.5;
    // ambient occlusion: a wide, faint pool where the ball hides the sky
    vec2 c2 = fp * vec2(1.05, 0.7);
    float ao = exp(-dot(c2, c2)) * 0.2;
    // the cast shadow: thrown away from the lamp, longer and softer the further it reaches
    float away = clamp(-L.x, -1.0, 1.0);
    vec2 c3 = (fp - vec2(away * 0.75, 0.25)) * vec2(0.85 - 0.15 * abs(away), 0.7);
    float thrown = exp(-dot(c3, c3)) * 0.16;
    float sh = clamp(contact + ao + thrown, 0.0, 0.7);
    // smoked glass still lets light through: a faint, soft glow of its colour lands inside the shadow
    vec2 c4 = (fp - vec2(away * 0.55, 0.1)) * vec2(1.5, 1.1);
    float glowF = exp(-dot(c4, c4)) * (0.16 + 0.12 * uEnergy);
    ground = vec4(lightC * glowF * 0.7, sh * (1.0 - 0.5 * glowF));
  }

  float inside = 1.0 - smoothstep(1.0 - 1.4 * px, 1.0, r);
  if (inside <= 0.0) { gl_FragColor = ground; return; }

  // ------------------------------------------------ the ball
  float rr = min(r, 0.9995);
  float z = sqrt(1.0 - rr * rr);
  vec3 n = vec3(b * (rr / max(r, 1e-4)), z);
  vec3 I = vec3(0.0, 0.0, -1.0);
  vec3 R = reflect(I, n);
  vec3 refl = env(R);
  // three wavelengths bend by slightly different amounts: a faint rainbow at the edges
  float tR; float tG; float tB; vec3 dR; vec3 dG; vec3 dB;
  vec3 eR = through(n, 1.488, tR, dR);
  vec3 eG = through(n, 1.5, tG, dG);
  vec3 eB = through(n, 1.516, tB, dB);
  vec3 trans = vec3(eR.r, eG.g, eB.b);
  // the glass itself: a faint cool body tint that deepens with thickness, and a hint of the colour you point at
  trans *= exp(-tG * vec3(0.07, 0.035, 0.018));
  trans *= mix(vec3(1.0), uTint, uTintAmt * 0.12);

  // ------------------------------------------------ the strands suspended inside
  const int N = 22;
  float stepL = tG / float(N);
  float ca = cos(uRot), sa = sin(uRot);
  mat3 spin = mat3(ca, 0.0, -sa, 0.0, 1.0, 0.0, sa, 0.0, ca);
  float ct = cos(0.42), st = sin(0.42);
  mat3 tilt = mat3(1.0, 0.0, 0.0, 0.0, ct, st, 0.0, -st, ct);
  vec3 glow = vec3(0.0);
  vec3 haze = vec3(0.0);
  vec3 filt = vec3(1.0);
  for (int i = 0; i < N; i++) {
    vec3 s = n + dG * (stepL * (float(i) + 0.5));
    float l = length(s);
    vec3 q = tilt * (spin * s);
    float sw = (1.0 - l) * 1.5;
    float cs = cos(sw), ss = sin(sw);
    q.xz = vec2(cs * q.x - ss * q.z, ss * q.x + cs * q.z);
    vec3 qa = q * 0.92 + vec3(0.0, uT * 0.07, uT * 0.03);
    float f = snoise(qa) + 0.36 * snoise(qa * 2.15 + vec3(4.1, -uT * 0.05, 1.3));
    float rib = clamp(1.0 - abs(f) * 1.6, 0.0, 1.0);
    float inner = smoothstep(0.98, 0.7, l);
    // each filament: a soft halo and a hot core
    float halo = pow(rib, 7.0) * inner;
    float hot = pow(rib, 34.0) * inner;
    // cyan high in the glass, through violet and magenta, to gold at the bottom, drifting slowly
    float hx = clamp(0.36 - s.y * 0.62 + f * 0.14 + 0.05 * sin(uT * 0.25), 0.0, 0.76);
    vec3 c = pal(hx);
    c = mix(c, uTint * 1.15, uTintAmt * 0.65);
    // pulses of light travelling along the filaments
    float run = 0.6 + 0.4 * sin(q.y * 8.0 + f * 6.0 - uT * 2.6);
    float lum = 0.85 + 0.8 * uEnergy + 0.3 * uFloor + 0.25 * uSmall;
    glow += (c * (halo * 1.0 + hot * 3.4 * run) * lum + vec3(1.0) * hot * hot * 0.35 * run) * stepL;
    // the cores are dense enough to colour the light behind them a little
    filt *= mix(vec3(1.0), c * 0.8, clamp(hot * stepL * (1.0 + uSmall * 2.0), 0.0, 0.45));
    // a faint coloured haze filling the glass between them
    haze += pal(clamp(hx + 0.06, 0.0, 0.76)) * smoothstep(-0.1, 0.75, snoise(q * 0.55 + vec3(7.0, uT * 0.03, 0.0))) * inner * stepL;
    float core = exp(-l * l * 12.0) * 0.4 * uEnergy;
    float shell = exp(-pow(l - uPulse * 1.05, 2.0) * 70.0) * (1.0 - uPulse) * step(0.0005, uPulse);
    glow += (vec3(1.0, 0.72, 0.4) * core + mix(c, vec3(1.0), 0.3) * shell * 1.3) * stepL;
  }
  glow += haze * (0.16 + 0.1 * uEnergy);
  // smoked crystal: darker where the glass is thicker, clear toward the rim, so the light inside burns against it
  trans *= exp(-tG * vec3(0.92, 0.9, 0.8));
  trans = trans * filt + glow;

  float F = 0.04 + 0.96 * pow(1.0 - z, 5.0);
  vec3 col = mix(trans, refl, F);
  col = col / (1.0 + 0.1 * col) * 1.1;
  col = clamp(col, 0.0, 1.0);
  vec4 ball = vec4(col, 1.0);
  gl_FragColor = ball * inside + ground * (1.0 - inside);
}`;

// releasing a context is deferred a moment, so a remount on the same canvas (React's dev double-run) can take it back
const pendingLose = new WeakMap<HTMLCanvasElement, ReturnType<typeof setTimeout>>();
type Draw = {
  W: number;
  K: number;
  t: number;
  rot: number;
  tint: number[];
  tintAmt: number;
  L: number[];
  energy: number;
  pulse: number;
  floor: number;
  small: number;
};
type GLOrb = { draw: (u: Draw) => void; dispose: () => void };
function makeOrb(canvas: HTMLCanvasElement): GLOrb | null {
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
    return g.getShaderParameter(s, g.COMPILE_STATUS) ? s : null;
  };
  const vs = sh(g.VERTEX_SHADER, VS);
  const fs = sh(g.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return null;
  const prog = g.createProgram()!;
  g.attachShader(prog, vs);
  g.attachShader(prog, fs);
  g.bindAttribLocation(prog, 0, "p");
  g.linkProgram(prog);
  if (!g.getProgramParameter(prog, g.LINK_STATUS)) return null;
  g.useProgram(prog);
  const buf = g.createBuffer();
  g.bindBuffer(g.ARRAY_BUFFER, buf);
  g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
  g.enableVertexAttribArray(0);
  g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0);
  const u = (s: string) => g.getUniformLocation(prog, s);
  const U = {
    res: u("uRes"),
    k: u("uK"),
    t: u("uT"),
    rot: u("uRot"),
    tint: u("uTint"),
    tintAmt: u("uTintAmt"),
    L: u("uL"),
    energy: u("uEnergy"),
    pulse: u("uPulse"),
    floor: u("uFloor"),
    small: u("uSmall"),
  };
  return {
    draw(o) {
      // check both: a fresh canvas is 300 by 150, so a square of 300 would otherwise keep the wrong height
      if (canvas.width !== o.W || canvas.height !== o.W) {
        canvas.width = o.W;
        canvas.height = o.W;
      }
      g.viewport(0, 0, o.W, o.W);
      g.uniform2f(U.res, o.W, o.W);
      g.uniform1f(U.k, o.K);
      g.uniform1f(U.t, o.t);
      g.uniform1f(U.rot, o.rot);
      g.uniform3f(U.tint, o.tint[0], o.tint[1], o.tint[2]);
      g.uniform1f(U.tintAmt, o.tintAmt);
      g.uniform3f(U.L, o.L[0], o.L[1], o.L[2]);
      g.uniform1f(U.energy, o.energy);
      g.uniform1f(U.pulse, o.pulse);
      g.uniform1f(U.floor, o.floor);
      g.uniform1f(U.small, o.small);
      g.clearColor(0, 0, 0, 0);
      g.clear(g.COLOR_BUFFER_BIT);
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      pendingLose.set(
        canvas,
        setTimeout(() => g.getExtension("WEBGL_lose_context")?.loseContext(), 300),
      );
    },
  };
}
const rgb = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

type OrbState = {
  tint: number[];
  tintAmt: number;
  L: number[];
  energy: number;
  pulseAt: number;
};
const LAMP = [-0.5, 0.62, 0.6];

/**
 * A ball of clear glass with coloured strands suspended in it, rendered per pixel at the screen's true resolution.
 *
 * It refracts the studio around it (the surface behind shows through upside down and magnified, with a faint
 * rainbow at the edge where red and blue bend differently) and catches a soft sheen from the lamp. Standing on a
 * floor it casts a natural shadow; in the bar it casts nothing. It re-renders sharper whenever the page is zoomed.
 */
function GlassOrb({
  size,
  state,
  reduce,
  floor = false,
  scale = 1,
}: {
  size: number;
  state: MutableRefObject<OrbState>;
  reduce: boolean;
  floor?: boolean;
  scale?: number;
}) {
  // the bar's ball casts nothing, so its canvas hugs it; the floor ball needs room for its shadow
  const K = floor ? 2.5 : 1.04;
  const cvRef = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLSpanElement>(null);
  const inView = useInView(wrap, { margin: "80px" });
  const [fallback, setFallback] = useState(false);
  const glRef = useRef<GLOrb | null>(null);
  // one context for the life of the orb
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const orb = makeOrb(cv);
    if (!orb) {
      setFallback(true);
      return;
    }
    glRef.current = orb;
    return () => {
      glRef.current = null;
      orb.dispose();
    };
  }, []);
  // drawing only runs while it's on screen
  useEffect(() => {
    if (!inView || fallback) return;
    let raf = 0;
    let t = 7;
    let rot = 0.8;
    let last = performance.now();
    const cur = {
      tint: [...state.current.tint],
      tintAmt: state.current.tintAmt,
      L: [...LAMP],
      energy: 0,
    };
    // dynamic resolution: full sharpness when the GPU keeps up, a little less when it doesn't, back up when it can
    let quality = 1;
    let slow = 0;
    const frame = (now: number) => {
      const raw = now - last;
      const dt = Math.min(0.05, raw / 1000);
      last = now;
      if (raw > 26) slow = Math.min(30, slow + 1);
      else if (raw < 18) slow = Math.max(-60, slow - 1);
      if (slow >= 30) {
        quality = Math.max(0.45, quality * 0.88);
        slow = 0;
      } else if (slow <= -60) {
        quality = Math.min(1, quality * 1.08);
        slow = 0;
      }
      const s = state.current;
      const k = Math.min(1, dt * 5);
      for (let i = 0; i < 3; i++) {
        cur.tint[i] += (s.tint[i] - cur.tint[i]) * k;
        cur.L[i] += (s.L[i] - cur.L[i]) * Math.min(1, dt * 7);
      }
      cur.tintAmt += (s.tintAmt - cur.tintAmt) * k;
      cur.energy += (s.energy - cur.energy) * Math.min(1, dt * 3);
      if (!reduce) {
        t += dt * (0.5 + cur.energy * 1.3);
        rot += dt * (0.18 + cur.energy * 0.55);
      }
      const pulse = s.pulseAt ? Math.min(1, (now - s.pulseAt) / 900) : 0;
      // the true pixel size: CSS size, times the device's pixel ratio (which browser zoom changes), times any pinch zoom
      const zoom = window.visualViewport?.scale ?? 1;
      const W = Math.min(
        1600,
        Math.max(16, Math.round(size * K * scale * (window.devicePixelRatio || 1) * Math.max(1, zoom) * quality)),
      );
      glRef.current?.draw({
        W,
        K,
        t,
        rot,
        tint: cur.tint,
        tintAmt: cur.tintAmt,
        L: cur.L,
        energy: cur.energy,
        pulse: pulse >= 1 ? 0 : pulse,
        floor: floor ? 1 : 0,
        small: size < 60 ? 1 : 0,
      });
      if (reduce && now - startedAt > 200) return;
      raf = requestAnimationFrame(frame);
    };
    const startedAt = performance.now();
    raf = requestAnimationFrame(frame);
    // reduced motion still answers the pointer: redraw on demand
    const poke = () => {
      if (!reduce) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    };
    const iv = reduce ? setInterval(poke, 120) : 0;
    return () => {
      cancelAnimationFrame(raf);
      if (iv) clearInterval(iv);
    };
  }, [inView, fallback, size, scale, reduce, state, floor, K]);

  const pad = (size * (K - 1)) / 2;
  return (
    <span ref={wrap} className="relative block shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      {fallback ? (
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 34% 26%, rgba(255,255,255,1), rgba(255,255,255,0) 18%), radial-gradient(circle at 52% 74%, rgba(255,255,255,.75), rgba(255,255,255,0) 30%), radial-gradient(circle at 45% 52%, rgba(120,110,230,.35), rgba(60,190,180,.18) 40%, rgba(255,255,255,0) 62%), radial-gradient(circle at 50% 50%, #eef0f5 55%, #b9bdc8 100%)",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08), 0 6px 10px -4px rgba(20,30,60,.35)",
          }}
        />
      ) : (
        <canvas
          ref={cvRef}
          className="pointer-events-none absolute"
          style={{ left: -pad, top: -pad, width: size * K, height: size * K }}
        />
      )}
    </span>
  );
}

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .6 0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * A minimal navigation bar whose mark is a small ball of smoked crystal with glowing filaments inside it.
 *
 * The bar itself is nothing but the ball and the name, plain links (the current one underlined with a hairline), a
 * search icon and one flat button, over a hairline; no container and no shadow. The ball does the talking: your
 * pointer is its lamp, so its sheen follows you, pointing at a link tints the light inside it, and pressing it turns
 * the bar into search (the ball glows brighter and every key sends a ring of light through it). On a narrow screen
 * the links fold into a menu. The demo stands a larger ball on the floor of the page, with a natural shadow: a dense
 * contact point, a soft pool and a shadow thrown away from the light. The glass is drawn per pixel at the screen's
 * real resolution and redrawn sharper when you zoom.
 *   <OrbNav brand="Lumen" items={items} onNavigate={(id) => router.push(`/${id}`)} bare />
 */
export default function OrbNav({
  brand = "Lumen",
  items = ITEMS,
  defaultActive,
  cta = "Book a visit",
  suggestions = SUGGESTIONS,
  onNavigate,
  onAsk,
  bare = false,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: OrbNavProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const orbBox = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const touched = useRef(false);
  const [active, setActive] = useState(defaultActive ?? items[0].id);
  const [hover, setHover] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [menu, setMenu] = useState(false);
  const [w, setW] = useState(800);
  const orb = useRef<OrbState>({
    tint: rgb(items[0].accent),
    tintAmt: 0,
    L: [...LAMP],
    energy: 0,
    pulseAt: 0,
  });
  const page = items.find((i) => i.id === active) ?? items[0];
  const hero = useRef<OrbState>({
    tint: rgb(page.accent),
    tintAmt: 0.85,
    L: [...LAMP],
    energy: 0,
    pulseAt: 0,
  });

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.getBoundingClientRect().width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const narrow = w < 640;
  const tiny = w < 400;

  const hovItem = items.find((i) => i.id === hover);
  useEffect(() => {
    const o = orb.current;
    o.energy = asking ? 1 : 0;
    if (!asking && hovItem) {
      o.tint = rgb(hovItem.accent);
      o.tintAmt = 1;
    } else o.tintAmt = 0;
  }, [asking, hovItem]);
  useEffect(() => {
    hero.current.tint = rgb(page.accent);
  }, [page.accent]);

  // the lamp: where the pointer is, relative to each ball; kept in front of the glass
  const aim = (st: OrbState, el: Element | null | undefined, x: number, y: number, reachX: number, reachY: number) => {
    const b = el?.getBoundingClientRect();
    if (!b) return;
    const dx = Math.max(-1.3, Math.min(1.3, (x - (b.left + b.width / 2)) / reachX));
    const dy = Math.max(-1, Math.min(1.1, -(y - (b.top + b.height / 2)) / reachY));
    st.L = [dx, dy * 0.75 + 0.3, 0.62];
  };
  const heroBox = useRef<HTMLDivElement>(null);
  const lampAt = (x: number, y: number) => {
    aim(orb.current, orbBox.current, x, y, 280, 90);
    aim(hero.current, heroBox.current, x, y, 420, 300);
  };
  const lampHome = () => {
    orb.current.L = [...LAMP];
    hero.current.L = [...LAMP];
  };

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = suggestions.filter((s) => words.every((w) => (s.label + " " + s.hint).toLowerCase().includes(w)));
    return (q.trim() ? hits : suggestions).slice(0, 5);
  }, [q, suggestions]);
  const rows = q.trim()
    ? [...results, { label: `Ask ${brand}: "${q.trim()}"`, hint: "Answer", go: undefined }]
    : results;

  const touch = () => {
    touched.current = true;
  };
  const go = (id: string) => {
    if (id !== active)
      sfx.note(620 + items.findIndex((i) => i.id === id) * 90, {
        dur: 0.3,
        gain: 0.05,
        bell: 0.6,
      });
    setActive(id);
    onNavigate?.(id);
  };
  const openAsk = () => {
    if (asking) return;
    setAsking(true);
    setMenu(false);
    setQ("");
    setSel(0);
    // a struck glass: a clear note with its bell partial, and a softer one a fifth above
    sfx.note(1046, { dur: 0.9, gain: 0.05, bell: 0.7 });
    sfx.note(1568, { dur: 0.7, gain: 0.03, at: 0.05, bell: 0.6 });
    setTimeout(() => inputRef.current?.focus(), reduce ? 0 : 260);
  };
  // focus goes back to the ball for a person; the demo leaves focus where it was
  const closeAsk = (refocus = true) => {
    if (!asking) return;
    setAsking(false);
    setQ("");
    sfx.note(784, { dur: 0.4, gain: 0.035, bell: 0.5 });
    if (refocus) setTimeout(() => orbBox.current?.focus({ preventScroll: true }), 60);
  };
  const choose = (i: number, refocus = true) => {
    const r = rows[i];
    if (!r) return;
    if (r.go) go(r.go);
    else onAsk?.(q.trim());
    closeAsk(refocus);
  };
  const typed = (v: string) => {
    setQ(v);
    setSel(0);
    orb.current.pulseAt = performance.now();
    sfx.tick({ freq: 2600 + Math.random() * 900, gain: 0.022 });
  };
  const onInputKey = (e: RKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => (s + (e.key === "ArrowDown" ? 1 : rows.length - 1)) % Math.max(1, rows.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(sel);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeAsk();
    }
  };

  // ------------------------------------------------------------ autoplay
  const ap = useRef({
    setHover,
    lampAtFrac: (_x: number, _y?: number) => {},
    openAsk,
    typed,
    choose,
    closeAsk,
  });
  ap.current = {
    setHover,
    lampAtFrac: (fx: number, fy = 1.4) => {
      const b = barRef.current?.getBoundingClientRect();
      if (b) lampAt(b.left + b.width * fx, b.top + b.height * fy);
    },
    openAsk,
    typed,
    choose,
    closeAsk,
  };
  useEffect(() => {
    if (!autoplay || !inView || reduce) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      while (ok()) {
        await sleep(800);
        // the lamp sweeps along the bar, pausing on each link
        for (let k = 0; k < items.length && ok(); k++) {
          ap.current.setHover(items[k].id);
          ap.current.lampAtFrac(0.32 + k * 0.11, 0.4);
          await sleep(1000);
        }
        if (!ok()) break;
        ap.current.setHover(null);
        ap.current.lampAtFrac(0.02, -0.6);
        await sleep(900);
        if (!ok()) break;
        ap.current.openAsk();
        await sleep(700);
        let s = "";
        for (const ch of "blown") {
          if (!ok()) break;
          s += ch;
          ap.current.typed(s);
          await sleep(140 + Math.random() * 90);
        }
        await sleep(1200);
        if (!ok()) break;
        ap.current.choose(0, false);
        await sleep(2400);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, reduce]);

  const ORB = narrow ? 24 : 26;
  const flatBtn =
    "rounded-full bg-[#1d1d1f] text-white outline-none transition-colors hover:bg-black focus-visible:ring-2 focus-visible:ring-[#0071e3]/60 focus-visible:ring-offset-2";
  const ghost =
    "grid place-items-center rounded-full text-[#1d1d1f] outline-none transition-colors hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60";

  const bar = (
    <div className={`relative z-20 ${bare ? "" : "pt-2"}`}>
      <div
        ref={barRef}
        onPointerMove={(e: RPointerEvent<HTMLDivElement>) => lampAt(e.clientX, e.clientY)}
        onPointerLeave={() => {
          lampHome();
          setHover(null);
        }}
        className={`relative mx-auto flex h-[64px] max-w-[880px] items-center gap-3 ${narrow ? "px-5" : "px-8"}`}
      >
        {/* the ball and the name */}
        <button
          ref={orbBox}
          type="button"
          onClick={() => {
            touch();
            asking ? closeAsk() : openAsk();
          }}
          aria-label={asking ? `Close ${brand} search` : `Ask ${brand}`}
          aria-expanded={asking}
          className="relative -ml-1 flex shrink-0 items-center gap-2.5 rounded-full py-1 pl-1 pr-2 outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
        >
          <motion.span
            className="block"
            animate={{ scale: asking ? 1.12 : 1 }}
            whileTap={reduce ? undefined : { scale: 0.92 }}
            transition={{ type: "spring", stiffness: 520, damping: 20 }}
          >
            <GlassOrb size={ORB} scale={1.15} state={orb} reduce={reduce} />
          </motion.span>
          <AnimatePresence initial={false}>
            {!(asking && narrow) && (
              <motion.span
                className="text-[16px] font-semibold tracking-[-0.02em] text-[#1d1d1f]"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.18 }}
              >
                {brand}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <div className="relative flex h-full min-w-0 flex-1 items-center">
          <AnimatePresence mode="popLayout" initial={false}>
            {asking ? (
              <motion.div
                key="ask"
                className="flex h-full min-w-0 flex-1 items-center gap-2"
                initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0 100% 0 0)" }}
                animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
                exit={
                  reduce
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        clipPath: "inset(0 100% 0 0)",
                        transition: { duration: 0.2 },
                      }
                }
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
              >
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => {
                    touch();
                    typed(e.target.value);
                  }}
                  onKeyDown={onInputKey}
                  placeholder={tiny ? `Ask ${brand}` : `Ask ${brand}, or jump to a page`}
                  role="combobox"
                  aria-expanded={rows.length > 0}
                  aria-controls={`${uid}-list`}
                  aria-activedescendant={rows.length ? `${uid}-r${sel}` : undefined}
                  aria-label={`Ask ${brand}`}
                  className="h-full min-w-0 flex-1 bg-transparent pl-2 text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#86868b]"
                />
                <button
                  type="button"
                  onClick={() => closeAsk()}
                  aria-label="Close"
                  className={`${ghost} h-9 w-9 shrink-0 text-[#6e6e73]`}
                >
                  <Ico d={I.close} size={14} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="links"
                className="flex h-full min-w-0 flex-1 items-center"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4, transition: { duration: 0.14 } }}
                transition={{
                  duration: 0.25,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.04,
                }}
              >
                {!narrow && (
                  <nav
                    aria-label="Main"
                    className="mx-auto flex h-full items-center gap-1"
                    onPointerLeave={() => setHover(null)}
                  >
                    {items.map((it) => {
                      const on = it.id === active;
                      return (
                        <button
                          key={it.id}
                          type="button"
                          aria-current={on ? "page" : undefined}
                          onPointerEnter={() => setHover(it.id)}
                          onFocus={() => setHover(it.id)}
                          onBlur={() => setHover(null)}
                          onClick={() => {
                            touch();
                            go(it.id);
                          }}
                          className={`relative flex h-full items-center px-3.5 text-[14px] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071e3]/60 ${on ? "text-[#1d1d1f]" : "text-[#6e6e73] hover:text-[#1d1d1f]"}`}
                        >
                          {it.label}
                          {on && (
                            <motion.span
                              layoutId={`${uid}-cur`}
                              aria-hidden="true"
                              className="absolute bottom-[15px] left-3.5 right-3.5 h-px bg-[#1d1d1f]"
                              transition={
                                reduce
                                  ? { duration: 0 }
                                  : {
                                      type: "spring",
                                      stiffness: 420,
                                      damping: 36,
                                    }
                              }
                            />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                )}
                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      touch();
                      openAsk();
                    }}
                    aria-label={`Search ${brand}`}
                    className={`${ghost} h-9 w-9`}
                  >
                    <Ico d={I.search} size={16} />
                  </button>
                  {narrow ? (
                    <button
                      type="button"
                      aria-label="Menu"
                      aria-expanded={menu}
                      onClick={() => {
                        touch();
                        setMenu((m) => !m);
                      }}
                      className={`${ghost} h-9 w-9`}
                    >
                      <motion.span
                        key={menu ? "x" : "m"}
                        initial={reduce ? false : { rotate: -90, scale: 0.6 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 26,
                        }}
                      >
                        <Ico d={menu ? I.close : I.menu} size={17} />
                      </motion.span>
                    </button>
                  ) : (
                    <button type="button" className={`${flatBtn} ml-2 h-9 px-4 text-[13.5px] font-medium`}>
                      {cta}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* a hairline under the bar, and nothing else */}
      <div aria-hidden="true" className={`mx-auto h-px max-w-[880px] bg-black/[0.07] ${narrow ? "mx-5" : "mx-8"}`} />

      {/* what drops down: suggestions while asking, the links on a narrow screen */}
      <AnimatePresence>
        {(asking || (menu && narrow)) && (
          <motion.div
            key={asking ? "ask" : "menu"}
            className={`absolute top-[calc(100%+8px)] mx-auto max-w-[880px] overflow-hidden rounded-[16px] bg-white p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.07)] ${narrow ? "left-5 right-5" : "left-8 right-8"}`}
            style={{ originY: 0 }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4, transition: { duration: 0.14 } }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          >
            {asking ? (
              <ul id={`${uid}-list`} role="listbox" aria-label="Suggestions">
                {rows.map((r, i) => (
                  <li
                    key={r.label}
                    id={`${uid}-r${i}`}
                    role="option"
                    aria-selected={i === sel}
                    onPointerEnter={() => setSel(i)}
                    onClick={() => {
                      touch();
                      choose(i);
                    }}
                    className="relative flex cursor-pointer items-center gap-3 rounded-[11px] px-3 py-2.5"
                  >
                    {i === sel && (
                      <motion.span
                        layoutId={`${uid}-sel`}
                        className="absolute inset-0 rounded-[11px] bg-black/[0.04]"
                        transition={{
                          type: "spring",
                          stiffness: 520,
                          damping: 40,
                        }}
                      />
                    )}
                    <span className="relative min-w-0 flex-1 truncate text-[14px] text-[#1d1d1f]">{r.label}</span>
                    <span className="relative hidden shrink-0 text-[12.5px] text-[#86868b] sm:block">{r.hint}</span>
                    <span
                      className={`relative shrink-0 text-[#86868b] transition-opacity ${i === sel ? "opacity-100" : "opacity-0"}`}
                    >
                      <Ico d={I.enter} size={13} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <nav aria-label="Main">
                {items.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    aria-current={it.id === active ? "page" : undefined}
                    onClick={() => {
                      go(it.id);
                      setMenu(false);
                    }}
                    className={`flex w-full items-center rounded-[11px] px-3 py-3 text-left text-[16px] outline-none hover:bg-black/[0.03] focus-visible:bg-black/[0.05] ${it.id === active ? "font-medium text-[#1d1d1f]" : "text-[#6e6e73]"}`}
                  >
                    {it.label}
                  </button>
                ))}
                <button type="button" className={`${flatBtn} mt-1 h-11 w-full text-[15px] font-medium`}>
                  {cta}
                </button>
              </nav>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const font = {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Inter, system-ui, sans-serif",
  };
  if (bare)
    return (
      <div
        ref={rootRef}
        onPointerDownCapture={touch}
        onKeyDownCapture={touch}
        className={`relative w-full ${className}`}
        style={font}
      >
        {bar}
      </div>
    );

  const mid = !narrow && w < 800;
  const HERO = narrow ? 104 : mid ? 120 : 150;
  return (
    <div
      ref={rootRef}
      onPointerDownCapture={touch}
      onKeyDownCapture={touch}
      onPointerMove={(e) => {
        if (!barRef.current?.contains(e.target as Node)) lampAt(e.clientX, e.clientY);
      }}
      onPointerLeave={lampHome}
      className={`relative h-[440px] w-full max-w-[940px] overflow-hidden rounded-[28px] text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-28px_rgba(0,0,0,.3)] ${className}`}
      style={{
        ...font,
        background: "linear-gradient(180deg, #e4e6eb 0%, #eceef2 38%, #f3f4f6 62%, #f8f8fa 100%)",
      }}
    >
      {/* a studio sweep: a soft top light and a floor that falls off toward the camera */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 50% -10%, rgba(255,255,255,.85), rgba(255,255,255,0) 70%), radial-gradient(90% 40% at 50% 112%, rgba(0,0,0,.05), rgba(0,0,0,0) 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-multiply"
        style={{ backgroundImage: GRAIN }}
      />
      {bar}

      {/* the piece on the floor, and what the page says */}
      <div
        ref={heroBox}
        className="pointer-events-none absolute"
        style={{
          right: narrow ? 28 : mid ? 44 : 96,
          bottom: narrow ? 120 : mid ? 150 : 70,
        }}
        aria-hidden="true"
      >
        <GlassOrb size={HERO} state={hero} reduce={reduce} floor />
      </div>
      <div className={`pointer-events-none absolute inset-x-0 bottom-0 ${narrow ? "px-6 pb-7" : "px-12 pb-11"}`}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={page.id}
            initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
              filter: { duration: 0.3 },
            }}
          >
            <p className="text-[13px] font-medium text-[#6e6e73]">{page.label}</p>
            <p
              className={`mt-1.5 font-semibold leading-[1.06] tracking-[-0.032em] text-[#1d1d1f] ${narrow ? "max-w-[300px] text-[26px]" : mid ? "max-w-[400px] text-[33px]" : "max-w-[440px] text-[38px]"}`}
            >
              {page.line ?? page.label}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
