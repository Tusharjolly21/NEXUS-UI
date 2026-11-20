# Charge Menu

Add the "Charge Menu" component from Nexus UI to my project.

A battery menu with the charge as a glass cell lying on its side, the liquid inside glowing green. Plugged in, it fizzes and creeps along the tube; unplugged, it goes quiet and drains, turning amber and then red. Move over the cell and it turns in your hand, the light sliding along the glass. Plugging in sends a wave of light through the charge.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { ChargeMenu } from "@/components/charge-menu";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/charge-menu/charge-menu.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { type CSSProperties, type PointerEvent as RPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type EnergyApp = { name: string; icon: keyof typeof I };
export type ChargeMenuProps = {
  /** starting charge, 0 to 100 */
  level?: number;
  plugged?: boolean;
  apps?: EnergyApp[];
  onPlugChange?: (plugged: boolean) => void;
  onSettings?: () => void;
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
  bolt: "m213.85 125.46l-112 120a8 8 0 0 1-13.69-7l14.66-73.33l-57.63-21.64a8 8 0 0 1-3-13l112-120a8 8 0 0 1 13.69 7l-14.7 73.41l57.63 21.61a8 8 0 0 1 3 12.95Z",
  globe:
    "M128 24a104 104 0 1 0 104 104A104.12 104.12 0 0 0 128 24m87.62 96h-39.83c-1.79-36.51-15.85-62.33-27.38-77.6a88.19 88.19 0 0 1 67.22 77.6ZM96.23 136h63.54c-2.31 41.61-22.23 67.11-31.77 77c-9.55-9.9-29.46-35.4-31.77-77m0-16c2.31-41.61 22.23-67.11 31.77-77c9.55 9.93 29.46 35.43 31.77 77Zm11.36-77.6C96.06 57.67 82 83.49 80.21 120H40.37a88.19 88.19 0 0 1 67.22-77.6M40.37 136h39.84c1.82 36.51 15.85 62.33 27.38 77.6A88.19 88.19 0 0 1 40.37 136m108 77.6c11.53-15.27 25.56-41.09 27.38-77.6h39.84a88.19 88.19 0 0 1-67.18 77.6Z",
  code: "M69.12 94.15L28.5 128l40.62 33.85a8 8 0 1 1-10.24 12.29l-48-40a8 8 0 0 1 0-12.29l48-40a8 8 0 0 1 10.24 12.3m176 27.7l-48-40a8 8 0 1 0-10.24 12.3L227.5 128l-40.62 33.85a8 8 0 1 0 10.24 12.29l48-40a8 8 0 0 0 0-12.29m-82.39-89.37a8 8 0 0 0-10.25 4.79l-64 176a8 8 0 0 0 4.79 10.26A8.1 8.1 0 0 0 96 224a8 8 0 0 0 7.52-5.27l64-176a8 8 0 0 0-4.79-10.25",
  film: "M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16M40 88h80v80H40Zm96-16V56h32v16Zm-16 0H88V56h32Zm0 112v16H88v-16Zm16 0h32v16h-32Zm0-16V88h80v80Zm80-96h-32V56h32ZM72 56v16H40V56ZM40 184h32v16H40Zm176 16h-32v-16h32z",
  music:
    "M212.92 17.69a8 8 0 0 0-6.86-1.45l-128 32A8 8 0 0 0 72 56v110.08A36 36 0 1 0 88 196V62.25l112-28v99.83A36 36 0 1 0 216 164V24a8 8 0 0 0-3.08-6.31M52 216a20 20 0 1 1 20-20a20 20 0 0 1-20 20m128-32a20 20 0 1 1 20-20a20 20 0 0 1-20 20",
  caret:
    "m181.66 133.66l-80 80a8 8 0 0 1-11.32-11.32L164.69 128L90.34 53.66a8 8 0 0 1 11.32-11.32l80 80a8 8 0 0 1 0 11.32",
};
const Ico = ({ d, size, style }: { d: string; size: number; style?: CSSProperties }) => (
  <svg
    viewBox="0 0 256 256"
    width={size}
    height={size}
    style={{ display: "block", flex: "none", ...style }}
    aria-hidden="true"
  >
    <path fill="currentColor" d={d} />
  </svg>
);

const DEFAULT_APPS: EnergyApp[] = [
  { name: "Browser", icon: "globe" },
  { name: "Code editor", icon: "code" },
];

// a glass cell lying on its side, raymarched: the tube, the metal terminal, and the charge inside as a glowing
// cylinder of liquid whose front face is the level. Everything is in the cell's own space, the x axis along it.
const FS = `precision highp float;
uniform vec2 uRes; uniform float uDpr; uniform mat3 uM; uniform float uLevel; uniform float uTime; uniform vec3 uCol;
uniform float uGlow; uniform float uFizz; uniform float uPulse;
const float HL = 1.55; const float R = 0.6; const float RI = 0.49;
float cylX(vec3 p, float r, float h, float rr){
  vec2 d = abs(vec2(length(p.yz), p.x)) - vec2(r - rr, h - rr);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - rr;
}
float xa(){ return -HL + 0.1; }
float xb(){ return xa() + max(0.06, uLevel * (2.0 * HL - 0.2)); }
float glass(vec3 p){ return cylX(p, R, HL, 0.16); }
float term(vec3 p){ return cylX(p - vec3(HL + 0.06, 0.0, 0.0), 0.2, 0.08, 0.03); }
float liq(vec3 p){
  float a = xa(); float b = xb();
  float h = (b - a) * 0.5;
  return cylX(p - vec3(a + h, 0.0, 0.0), RI, h, min(0.08, h * 0.9));
}
vec3 nrm(vec3 p, int k){
  vec2 e = vec2(0.002, 0.0);
  if (k == 0) return normalize(vec3(glass(p + e.xyy) - glass(p - e.xyy), glass(p + e.yxy) - glass(p - e.yxy), glass(p + e.yyx) - glass(p - e.yyx)));
  if (k == 1) return normalize(vec3(term(p + e.xyy) - term(p - e.xyy), term(p + e.yxy) - term(p - e.yxy), term(p + e.yyx) - term(p - e.yyx)));
  return normalize(vec3(liq(p + e.xyy) - liq(p - e.xyy), liq(p + e.yxy) - liq(p - e.yxy), liq(p + e.yyx) - liq(p - e.yyx)));
}
float h21(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
// bubbles: a grid of cells wrapped round the liquid, each with a dot drifting towards the level
float fizz(vec2 uv){
  vec2 id = floor(uv); vec2 f = fract(uv) - 0.5;
  float r = h21(id);
  vec2 o = vec2(h21(id + 3.1), h21(id + 7.7)) - 0.5;
  float s = 0.05 + 0.08 * r;
  return smoothstep(s, s * 0.35, length(f - o * 0.6)) * step(0.35, r);
}
void main(){
  vec2 f = gl_FragCoord.xy / uDpr;
  vec2 uv = (f - uRes * 0.5) / (uRes.y * 0.5);
  vec3 ro = uM * vec3(0.0, 0.0, 6.0);
  vec3 rd = uM * normalize(vec3(uv * 0.21, -1.0));
  float t = 0.0; float mL = 9.0; int hit = -1;
  for (int i = 0; i < 70; i++) {
    vec3 p = ro + rd * t;
    float g = glass(p); float m = term(p);
    mL = min(mL, liq(p));
    float d = min(g, m);
    if (d < 0.001) { hit = g < m ? 0 : 1; break; }
    t += d;
    if (t > 12.0) break;
  }
  vec3 green = uCol;
  // light that spills round the charge
  float halo = exp(-max(0.0, mL) * 5.0) * 0.32 * uGlow;
  vec4 col = vec4(green * halo, halo * 0.9);
  if (hit == 1) {
    vec3 p = ro + rd * t; vec3 n = nrm(p, 1);
    float l = 0.35 + 0.65 * max(0.0, dot(n, normalize(vec3(-0.3, 0.8, 0.5))));
    vec3 c = vec3(0.32, 0.33, 0.35) * l + pow(max(0.0, reflect(rd, n).y), 8.0) * 0.5;
    col = vec4(c, 1.0);
  } else if (hit == 0) {
    vec3 p = ro + rd * t; vec3 n = nrm(p, 0);
    float fr = pow(1.0 - abs(dot(n, -rd)), 3.0);
    vec3 rf = reflect(rd, n);
    // a softbox above: a long highlight along the top of the tube
    float spec = smoothstep(0.3, 0.55, rf.y) * smoothstep(1.0, 0.75, rf.y) * 0.55;
    // thicker glass at the shoulders shows as bright rings
    float ring = exp(-pow((abs(p.x) - (HL - 0.2)) / 0.025, 2.0)) * 0.22 + exp(-pow((abs(p.x) - (HL - 0.07)) / 0.02, 2.0)) * 0.14;
    // look through the glass for the liquid
    vec3 inner = vec3(0.1, 0.105, 0.11); float ia = 0.26; float s = 0.02;
    for (int i = 0; i < 56; i++) {
      vec3 q = p + rd * s;
      float d = liq(q);
      if (d < 0.0015) {
        vec3 nl = nrm(q, 2);
        float a = xa(); float b = xb();
        float along = clamp((q.x - a) / max(0.01, b - a), 0.0, 1.0);
        float face = smoothstep(0.6, 0.95, nl.x);
        float lit = 0.72 + 0.4 * max(0.0, dot(nl, normalize(vec3(-0.2, 0.9, 0.4))));
        float edge = pow(1.0 - abs(dot(nl, -rd)), 2.0);
        vec3 c = green * (0.45 + 0.7 * along) * lit;
        c = mix(c, green * 0.5, edge * 0.45);
        // light scattered inside the charge
        c += green * 0.18 * (1.0 - edge);
        // the front face glows, brightest at its rim
        float rr = length(q.yz) / RI;
        c = mix(c, mix(green, vec3(0.85, 1.0, 0.88), 0.35) * (0.8 + 0.6 * smoothstep(0.55, 1.0, rr)), face);
        // a wave of light running to the level when it's plugged in
        c += green * exp(-pow((along - uPulse) / 0.08, 2.0)) * step(0.001, uPulse) * step(uPulse, 0.999) * 0.9;
        float ang = atan(q.z, q.y);
        float side = fizz(vec2(q.x * 9.0 - uTime * 0.8, ang * 3.0 + q.x * 0.6)) * (1.0 - face);
        float cap = fizz(vec2(rr * 6.0 - uTime * 0.6, ang * 2.5)) * face;
        c += vec3(0.85, 1.0, 0.9) * (side + cap) * 0.55 * uFizz * (0.4 + 0.6 * along);
        inner = c; ia = 1.0;
        break;
      }
      if (glass(q) > 0.002 && s > 0.1) break;
      s += max(0.004, d);
      if (s > 2.0 * R + 0.5) break;
    }
    vec3 c = inner * ia * (1.0 - fr * 0.4) + vec3(0.9, 0.95, 1.0) * (spec + ring + fr * 0.35);
    float a = clamp(ia + spec + ring + fr * 0.5, 0.0, 1.0);
    // premultiplied: the glass sits over the glow
    col = vec4(c, a) + col * (1.0 - a);
  }
  gl_FragColor = col;
}`;

const hexRGB = (h: string) => {
  const v = parseInt(h.slice(1), 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
};
type Sp = { x: number; v: number };
const spring = (s: Sp, to: number, k: number, d: number, dt: number) => {
  s.v += ((to - s.x) * k - s.v * d) * dt;
  s.x += s.v * dt;
};
type M3 = number[][];
const rx = (a: number): M3 => [
  [1, 0, 0],
  [0, Math.cos(a), -Math.sin(a)],
  [0, Math.sin(a), Math.cos(a)],
];
const ry = (a: number): M3 => [
  [Math.cos(a), 0, Math.sin(a)],
  [0, 1, 0],
  [-Math.sin(a), 0, Math.cos(a)],
];
const mul = (a: M3, b: M3): M3 => a.map((r) => [0, 1, 2].map((j) => r[0] * b[0][j] + r[1] * b[1][j] + r[2] * b[2][j]));
const YAW = -0.42;
const PITCH = 0.26;
const BH = 150;

/**
 * A battery menu in the style of a desktop menu bar, with the charge shown as a glass cell lying on its side. The
 * charge is a cylinder of glowing liquid inside it whose front face is the level: plugged in, it fizzes and creeps
 * along the tube; unplugged, it goes quiet and slowly drains, turning amber at 20% and red at 10%. Move the pointer
 * over the cell and it turns in your hand on a spring, the light sliding along the glass. Click it, or the power
 * source, to unplug or plug in; plugging in sends a wave of light along the charge.
 */
export default function ChargeMenu({
  level: level0 = 60,
  plugged: plugged0 = true,
  apps = DEFAULT_APPS,
  onPlugChange,
  onSettings,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: ChargeMenuProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [level, setLevel] = useState(level0);
  const levelRef = useRef(level);
  levelRef.current = level;
  const [plugged, setPlugged] = useState(plugged0);
  const pluggedRef = useRef(plugged);
  pluggedRef.current = plugged;
  const [noGL, setNoGL] = useState(false);
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const st = useRef({
    lvl: level0 / 100,
    yaw: { x: YAW, v: 0 },
    pitch: { x: PITCH, v: 0 },
    aim: [YAW, PITCH],
    col: hexRGB("#30d158"),
    glow: plugged0 ? 1 : 0.3,
    fizz: plugged0 ? 1 : 0,
    pulse: 0,
    t: 0,
  });

  const color = level <= 10 ? "#ff453a" : level <= 20 ? "#ff9f0a" : "#30d158";
  const colorRef = useRef(color);
  colorRef.current = color;

  // charging and draining
  useEffect(() => {
    const id = window.setInterval(
      () => {
        setLevel((l) => {
          const n = pluggedRef.current ? Math.min(100, l + 1) : Math.max(1, l - 1);
          if (pluggedRef.current && n === 100 && l < 100) sfx.note(1046, { dur: 0.3, gain: 0.03, bell: 0.5 });
          return n;
        });
      },
      plugged ? 1400 : 2400,
    );
    return () => window.clearInterval(id);
  }, [plugged, sfx]);

  const plug = (to: boolean) => {
    if (to === pluggedRef.current) return;
    setPlugged(to);
    onPlugChange?.(to);
    if (to) {
      st.current.pulse = 0.001;
      sfx.tick({ freq: 900, gain: 0.05 });
      sfx.note(523, { at: 0.06, dur: 0.18, gain: 0.035 });
      sfx.note(784, { at: 0.16, dur: 0.3, gain: 0.035, bell: 0.5 });
    } else {
      sfx.tick({ freq: 700, gain: 0.045 });
      sfx.note(440, { at: 0.05, dur: 0.25, gain: 0.03, glide: 330 });
    }
  };

  // the cell, every frame
  useEffect(() => {
    const c = cv.current;
    const el = box.current;
    if (!c || !el) return;
    const gl = c.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
    });
    if (!gl) {
      setNoGL(true);
      return;
    }
    const mk = (t: number, src: string) => {
      const s = gl.createShader(t)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s));
      return s;
    };
    const pr = gl.createProgram()!;
    gl.attachShader(pr, mk(gl.VERTEX_SHADER, "attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }"));
    gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
      setNoGL(true);
      return;
    }
    gl.useProgram(pr);
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const la = gl.getAttribLocation(pr, "a");
    gl.enableVertexAttribArray(la);
    gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(pr, n);
    const M = new Float32Array(9);
    let vis = true;
    const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting));
    io.observe(el);
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!vis) return;
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      const S = st.current;
      const W = el.clientWidth;
      const H = el.clientHeight;
      const want = hexRGB(colorRef.current);
      const k = reduce ? 1 : Math.min(1, dt * 3);
      S.col = S.col.map((v, i) => v + (want[i] - v) * k);
      S.glow += ((pluggedRef.current ? 1 : 0.3) - S.glow) * k;
      S.fizz += ((pluggedRef.current ? 1 : 0) - S.fizz) * Math.min(1, dt * 1.5);
      S.lvl += (levelRef.current / 100 - S.lvl) * (reduce ? 1 : Math.min(1, dt * 4));
      if (reduce) {
        S.yaw.x = YAW;
        S.pitch.x = PITCH;
        S.pulse = 0;
      } else {
        S.t += dt;
        spring(S.yaw, S.aim[0], 70, 9, dt);
        spring(S.pitch, S.aim[1], 70, 9, dt);
        if (S.pulse > 0) S.pulse = S.pulse + dt * 1.6 >= 1 ? 0 : S.pulse + dt * 1.6;
      }
      // world to the cell's space: the cell is pitched towards you, then turned; this undoes both
      const m = mul(rx(-S.pitch.x), ry(-S.yaw.x));
      // column-major for GLSL
      M.set([m[0][0], m[1][0], m[2][0], m[0][1], m[1][1], m[2][1], m[0][2], m[1][2], m[2][2]]);
      const dpr = Math.min(2, devicePixelRatio || 1);
      if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      }
      gl.viewport(0, 0, c.width, c.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U("uRes"), W, H);
      gl.uniform1f(U("uDpr"), dpr);
      gl.uniformMatrix3fv(U("uM"), false, M);
      gl.uniform1f(U("uLevel"), Math.max(0.02, Math.min(1, S.lvl)));
      gl.uniform1f(U("uTime"), S.t);
      gl.uniform3f(U("uCol"), S.col[0], S.col[1], S.col[2]);
      gl.uniform1f(U("uGlow"), S.glow);
      gl.uniform1f(U("uFizz"), S.fizz);
      gl.uniform1f(U("uPulse"), S.pulse);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      const ext = gl.getExtension("WEBGL_lose_context");
      window.setTimeout(() => ext?.loseContext(), 300);
    };
  }, [reduce]);

  // the pointer turns it
  const turn = (fx: number, fy: number) => {
    st.current.aim = [YAW + (fx - 0.5) * 0.6, PITCH + (fy - 0.5) * 0.36];
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    turn((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  };

  // autoplay: turn it over, unplug, plug back in
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  const [ghostDown, setGhostDown] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const rect = (sel: string) => {
      const c = card.current;
      const e = c?.querySelector(sel);
      if (!c || !e) return null;
      const r = e.getBoundingClientRect();
      const cb = c.getBoundingClientRect();
      return {
        x: r.left - cb.left,
        y: r.top - cb.top,
        w: r.width,
        h: r.height,
      };
    };
    const go = async (x: number, y: number, ms = 600) => {
      setGhost(true);
      await Promise.all([
        animate(gx, x, { duration: ms / 1000, ease: [0.4, 0, 0.2, 1] }),
        animate(gy, y, { duration: ms / 1000, ease: [0.4, 0, 0.2, 1] }),
      ]);
    };
    const tap = async () => {
      setGhostDown(true);
      await wait(110);
      setGhostDown(false);
    };
    const run = async () => {
      await wait(1200);
      while (ok()) {
        const b = rect("[data-battery]");
        if (!b) return;
        await go(b.x + b.w * 0.2, b.y + b.h * 0.35);
        // sweep across it and back, turning the cell
        for (const [fx, fy] of [
          [0.85, 0.7],
          [0.15, 0.25],
          [0.55, 0.45],
        ]) {
          if (!ok()) return;
          await animate(0, 1, {
            duration: 1.1,
            ease: [0.45, 0, 0.55, 1],
            onUpdate: (u) => {
              const x0 = (gx.get() - b.x) / b.w;
              const y0 = (gy.get() - b.y) / b.h;
              const nx = x0 + (fx - x0) * u * 0.25;
              const ny = y0 + (fy - y0) * u * 0.25;
              gx.set(b.x + nx * b.w);
              gy.set(b.y + ny * b.h);
              turn(nx, ny);
            },
          });
        }
        if (!ok()) return;
        await tap();
        plug(false);
        await wait(2600);
        if (!ok()) return;
        const s = rect("[data-source]");
        if (s) await go(s.x + s.w * 0.4, s.y + s.h / 2);
        st.current.aim = [YAW, PITCH];
        await tap();
        plug(true);
        await wait(2600);
        setGhost(false);
        await wait(1400);
      }
    };
    run().catch((err) => {
      // torn down mid-step (the tile scrolled away): its elements are gone, so there is nothing to report
      if (alive) throw err;
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const mins = plugged ? Math.round((100 - level) * 0.6) : Math.round(level * 4.1);
  const timeText = useMemo(() => {
    if (plugged && level >= 100) return "Fully charged";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const t = h ? `${h}h ${m}m` : `${m}m`;
    return plugged ? `${t} until fully charged` : `${t} remaining`;
  }, [mins, plugged, level]);
  const volts = (3.3 + level * 0.0092).toFixed(2);
  const item: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "5px 10px",
    borderRadius: 6,
    fontSize: 13,
    color: "rgba(255,255,255,0.88)",
  };
  const rule = (
    <div
      aria-hidden="true"
      style={{
        height: 1,
        background: "rgba(255,255,255,0.08)",
        margin: "5px 10px",
      }}
    />
  );

  return (
    <div
      className={`relative w-full max-w-[300px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#fff",
      }}
    >
      <div
        ref={card}
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        style={{
          position: "relative",
          borderRadius: 13,
          background: "rgba(30,30,32,0.94)",
          boxShadow:
            "inset 0 0 0 0.5px rgba(255,255,255,0.14), 0 0 0 0.5px rgba(0,0,0,0.6), 0 24px 50px -20px rgba(0,0,0,0.55)",
          padding: 5,
          backdropFilter: "blur(30px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            padding: "6px 10px 0",
          }}
        >
          <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Battery</div>
          <div
            aria-live="polite"
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.55)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {level}%
          </div>
        </div>

        {/* the cell */}
        <div
          ref={box}
          data-battery
          role="button"
          tabIndex={0}
          aria-label={`Battery ${level}%, ${plugged ? "charging" : "on battery"}. Press to ${plugged ? "unplug" : "plug in"}.`}
          onPointerMove={onMove}
          onPointerLeave={() => (st.current.aim = [YAW, PITCH])}
          onClick={() => {
            touched.current = true;
            plug(!pluggedRef.current);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              touched.current = true;
              plug(!pluggedRef.current);
            }
          }}
          className="outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          style={{
            position: "relative",
            height: BH,
            borderRadius: 8,
            cursor: "pointer",
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
              display: noGL ? "none" : "block",
            }}
          />
          {noGL && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "12%",
                right: "14%",
                top: "26%",
                bottom: "26%",
                borderRadius: 40,
                boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.25)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${level}%`,
                  background: color,
                  transition: "width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.4s",
                }}
              />
            </div>
          )}
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 10,
              textAlign: "center",
              fontSize: 9,
              color: "rgba(255,255,255,0.4)",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "0.04em",
              pointerEvents: "none",
            }}
          >
            {volts} V
          </span>
          <AnimatePresence>
            {plugged && (
              <motion.div
                key="bolt"
                aria-hidden="true"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 20 }}
                style={{
                  position: "absolute",
                  left: "48%",
                  top: "50%",
                  x: "-50%",
                  y: "-50%",
                  color: "#fff",
                  filter: "drop-shadow(0 0 8px rgba(255,255,255,0.45))",
                  pointerEvents: "none",
                }}
              >
                <Ico d={I.bolt} size={34} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {rule}
        <button
          type="button"
          data-source
          onClick={() => {
            touched.current = true;
            plug(!pluggedRef.current);
          }}
          className="w-full text-left outline-none hover:bg-white/[0.08] focus-visible:bg-white/[0.08]"
          style={{
            display: "block",
            border: 0,
            background: undefined,
            padding: "4px 10px",
            borderRadius: 6,
            color: "inherit",
            cursor: "pointer",
          }}
        >
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            Power Source: {plugged ? "Power Adapter" : "Battery"}
          </div>
          <div style={{ position: "relative", height: 18, overflow: "hidden" }}>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={timeText}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {timeText}
              </motion.div>
            </AnimatePresence>
          </div>
        </button>

        <div
          style={{
            margin: "5px 0 0",
            padding: "6px 0 4px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.045)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              padding: "0 10px 2px",
            }}
          >
            Using Significant Energy
          </div>
          {apps.map((a) => (
            <div key={a.name} style={{ ...item, padding: "3px 10px" }}>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>
                <Ico d={I[a.icon]} size={14} />
              </span>
              {a.name}
            </div>
          ))}
        </div>

        {rule}
        <button
          type="button"
          onClick={() => onSettings?.()}
          className="w-full outline-none hover:bg-white/[0.08] focus-visible:bg-white/[0.08]"
          style={{
            ...item,
            width: "100%",
            border: 0,
            background: undefined,
            cursor: "pointer",
            marginBottom: 1,
          }}
        >
          <span style={{ flex: 1, textAlign: "left" }}>Battery Settings…</span>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>
            <Ico d={I.caret} size={11} />
          </span>
        </button>

        {ghost && (
          <motion.span
            aria-hidden="true"
            animate={{ scale: ghostDown ? 0.78 : 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 26 }}
            style={{
              position: "absolute",
              left: -12,
              top: -12,
              x: gx,
              y: gy,
              width: 24,
              height: 24,
              borderRadius: 12,
              background: "rgba(255,255,255,0.2)",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.75), 0 6px 14px -4px rgba(0,0,0,0.5)",
              pointerEvents: "none",
              zIndex: 9,
            }}
          />
        )}
      </div>
    </div>
  );
}
```

--- components/charge-menu/index.ts ---

```ts
export { default as ChargeMenu } from "./charge-menu";
export type { ChargeMenuProps } from "./charge-menu";
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
