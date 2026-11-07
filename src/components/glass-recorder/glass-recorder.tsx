"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useEffect, useId, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

export type GlassRecorderProps = {
  /** Height of the scene in px, or "fill" to fill a positioned parent. */
  height?: number | "fill";
  /** Width of the glass bar while recording, in px. It never grows past 86% of the scene. */
  barWidth?: number;
  /** Height of the glass bar while recording, in px. The resting drop is a little larger. */
  barHeight?: number;
  /**
   * "microphone" listens to the microphone after a tap (it only measures loudness and tone, and keeps nothing);
   * if the microphone is blocked or missing it falls back to a sample voice. "simulate" always uses the sample voice.
   */
  listen?: "microphone" | "simulate";
  /** An image for the glass to sit on (it must allow cross-origin use). Without one it sits on moving satin. */
  backdrop?: string;
  /** Five colours for the satin behind the glass. */
  scene?: string[];
  /** Four colours for the light your voice pours into the glass, from the low end of the bar to the high end. */
  colors?: string[];
  /** Icon and timer colour: white over a dark or colourful backdrop, dark over a light one. */
  ink?: "white" | "dark";
  /** Demo itself, with a pointer, until the first touch. Off by default. */
  autoplay?: boolean;
  onStart?: () => void;
  /** Called with how many seconds were recorded. */
  onStop?: (seconds: number) => void;
  onMicrophoneError?: (error: unknown) => void;
  className?: string;
};

// Icons: Phosphor Icons (MIT) via Iconify, inlined so the file has no icon dependency.
const MIC_OUTLINE =
  "M128 176a48.05 48.05 0 0 0 48-48V64a48 48 0 0 0-96 0v64a48.05 48.05 0 0 0 48 48M96 64a32 32 0 0 1 64 0v64a32 32 0 0 1-64 0Zm40 143.6V240a8 8 0 0 1-16 0v-32.4A80.11 80.11 0 0 1 48 128a8 8 0 0 1 16 0a64 64 0 0 0 128 0a8 8 0 0 1 16 0a80.11 80.11 0 0 1-72 79.6";
const STOP = "M216 56v144a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16V56a16 16 0 0 1 16-16h144a16 16 0 0 1 16 16";
const CURSOR =
  "m220.49 207.8l-12.69 12.69a12 12 0 0 1-17 0l-56.57-56.57L115 214.08l-.13.33a15.84 15.84 0 0 1-14.61 9.59h-.78a15.82 15.82 0 0 1-14.41-11L32.8 52.92A15.95 15.95 0 0 1 52.92 32.8L213 85.07a16 16 0 0 1 1.41 29.8l-.33.13l-50.16 19.27l56.57 56.56a12 12 0 0 1 0 16.97";

const DEFAULT_SCENE = ["#17195e", "#4a37b4", "#bd4c9c", "#ff8a68", "#ffd7a8"];
const DEFAULT_LIGHT = ["#ffb347", "#ff4f8b", "#b46bff", "#52b6ff"];
const TAU = Math.PI * 2;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const smooth = (x: number) => {
  const c = clamp(x);
  return c * c * (3 - 2 * c);
};
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const rgb01 = (hex: string): [number, number, number] => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  const n = m ? parseInt(m[1], 16) : 0x8888ff;
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

// ───────────────────────── springs ─────────────────────────
type Spr = { x: number; v: number };
const spr = (x: number): Spr => ({ x, v: 0 });
const step = (s: Spr, to: number, hz: number, z: number, dt: number) => {
  const w = TAU * hz;
  s.v += (w * w * (to - s.x) - 2 * z * w * s.v) * dt;
  s.x += s.v * dt;
};

// ───────────────────────── voices ─────────────────────────
type Reading = { level: number; bands: [number, number, number] };
type MicHandle = { read: () => Reading; stop: () => void };

/** A sample voice: phrases of a few syllables with natural pauses, each syllable with its own tone. */
const sampleVoice = (seed: number) => {
  let s = seed >>> 0 || 1;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  let t = 0;
  let start = 0.25;
  let dur = 0.2;
  let peak = 0.8;
  let tone: [number, number, number] = [0.8, 0.5, 0.3];
  let left = 4;
  const next = () => {
    if (left > 0) {
      left -= 1;
      start = start + dur + 0.03 + rnd() * 0.09;
    } else {
      left = 3 + Math.floor(rnd() * 5);
      start = start + dur + 0.32 + rnd() * 0.5;
    }
    dur = 0.11 + rnd() * 0.19;
    peak = 0.45 + rnd() * 0.55;
    const v = rnd();
    tone = [0.5 + 0.5 * (1 - v), 0.45 + 0.4 * rnd(), 0.2 + 0.7 * v];
  };
  return (dt: number): Reading => {
    t += dt;
    while (t > start + dur) next();
    const u = (t - start) / dur;
    const env = u > 0 && u < 1 ? Math.pow(Math.sin(Math.PI * u), 0.7) : 0;
    const shimmer = 1 + 0.08 * Math.sin(TAU * 6.3 * t) + 0.05 * Math.sin(TAU * 11.7 * t + 1);
    return { level: clamp(env * peak * shimmer + 0.015), bands: tone };
  };
};

/** Listens to the microphone and measures only loudness and the balance of low, middle and high tones. */
const openMic = async (): Promise<MicHandle> => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC();
  const an = ctx.createAnalyser();
  an.fftSize = 1024;
  an.smoothingTimeConstant = 0.55;
  ctx.createMediaStreamSource(stream).connect(an);
  const td = new Float32Array(an.fftSize);
  const fd = new Uint8Array(an.frequencyBinCount);
  const hz = ctx.sampleRate / an.fftSize;
  const band = (a: number, b: number) => {
    let sum = 0;
    let n = 0;
    for (let i = Math.max(1, Math.floor(a / hz)); i <= Math.ceil(b / hz) && i < fd.length; i++) {
      sum += fd[i];
      n += 1;
    }
    return n ? sum / n / 255 : 0;
  };
  return {
    read: () => {
      an.getFloatTimeDomainData(td);
      let e = 0;
      for (let i = 0; i < td.length; i++) e += td[i] * td[i];
      const db = 20 * Math.log10(Math.sqrt(e / td.length) + 1e-7);
      an.getByteFrequencyData(fd);
      const b: [number, number, number] = [band(80, 350), band(350, 1800), band(1800, 6000)];
      const top = Math.max(0.12, b[0], b[1], b[2]);
      return { level: clamp((db + 54) / 36), bands: [b[0] / top, b[1] / top, b[2] / top] };
    },
    stop: () => {
      stream.getTracks().forEach((tr) => tr.stop());
      void ctx.close();
    },
  };
};

// ───────────────────────── shaders ─────────────────────────
const VERT = `#version 300 es
in vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

const NOISE = `
float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float noise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y); }
`;

// The backdrop: folds of silk, lit from the top left, that drift slowly and ripple outward from the glass while
// you talk. Its colour runs from the deep folds to the lit crests through the five scene colours.
const SCENE = `#version 300 es
precision highp float;
uniform vec2 uSize; uniform float uScale; uniform float uTime;
uniform vec3 uPal[5]; uniform vec2 uC; uniform float uRipple;
uniform sampler2D uImg; uniform float uUseImg; uniform vec2 uImgSize;
out vec4 o;
${NOISE}
// big soft folds, with fine pleats running through them: rounded on top, creased sharply between
float folds(vec2 q, float t){
  return 0.5 * sin(q.x * 2.1 + q.y * 1.3 + t * 0.17) + 0.28 * sin(-q.x * 1.1 + q.y * 2.9 + 1.7 - t * 0.12) + 0.14 * sin(q.x * 4.3 + q.y * 0.7 + 3.1 + t * 0.2);
}
float silk(vec2 p, float t){
  vec2 q = p + 0.42 * vec2(noise(p * 0.9 + vec2(t * 0.05, 0.0)), noise(p * 0.9 + vec2(5.2, t * 0.04)));
  float big = folds(q, t);
  float ph = (q.x * 0.42 + q.y * 0.9) * 24.0 + big * 2.2 + 1.4 * noise(q * 1.3 + vec2(0.0, t * 0.03));
  return big + 0.085 * abs(sin(ph));
}
vec3 ramp(float x){
  x = clamp(x, 0.0, 1.0) * 4.0;
  int i = int(min(floor(x), 3.0));
  return mix(uPal[i], uPal[i + 1], smoothstep(0.0, 1.0, x - float(i)));
}
void main(){
  vec2 css = gl_FragCoord.xy / uScale;
  if (uUseImg > 0.5) {
    float ra = uSize.x / uSize.y, ia = uImgSize.x / uImgSize.y;
    vec2 uv = css / uSize;
    if (ra > ia) uv.y = (uv.y - 0.5) * ia / ra + 0.5; else uv.x = (uv.x - 0.5) * ra / ia + 0.5;
    o = vec4(texture(uImg, vec2(uv.x, 1.0 - uv.y)).rgb, 1.0);
    return;
  }
  float H = uSize.y;
  float t = uTime;
  vec2 p = css / H * 1.7;
  vec2 dc = (css - uC) / H;
  float r = length(dc * vec2(0.8, 1.4));
  p += dc / max(r, 1e-3) * uRipple * 0.028 * sin(r * 30.0 - t * 6.0) * exp(-r * 2.2);
  float e = 0.006;
  float h = silk(p, t);
  float hx = silk(p + vec2(e, 0.0), t);
  float hy = silk(p + vec2(0.0, e), t);
  vec3 N = normalize(vec3(-(hx - h) / e * 0.3, -(hy - h) / e * 0.3, 1.0));
  vec3 Ld = normalize(vec3(-0.45, 0.65, 0.62));
  float dif = max(dot(N, Ld), 0.0);
  float spec = pow(max(dot(N, normalize(Ld + vec3(0.0, 0.0, 1.0))), 0.0), 26.0);
  vec2 uv = css / uSize;
  vec3 base = ramp(0.5 + 0.4 * h + 0.22 * (uv.x - 0.5) - 0.12 * (uv.y - 0.5));
  vec3 c = base * (0.22 + 0.95 * dif) + mix(base, vec3(1.0), 0.55) * spec * 0.42;
  vec2 v = uv - 0.5;
  c *= 1.0 - 0.55 * dot(v, v);
  o = vec4(c, 1.0);
}`;

// The glass: one signed distance field for the drop, the knob and the swell towards your pointer; light bent by it,
// split into a spectrum at the rim, frosted when pressed, focused into caustics, and the light your voice pours in.
const GLASS = `#version 300 es
precision highp float;
uniform vec2 uSize; uniform float uDpr; uniform sampler2D uScene;
uniform vec4 uBody; uniform vec2 uSquash; uniform vec4 uBulge; uniform vec4 uBead; uniform float uBeadLens;
uniform float uMilky; uniform float uOpen; uniform float uLevel; uniform float uGlow;
uniform float uWave[32]; uniform vec3 uLiq[4]; uniform vec3 uBands;
out vec4 o;
${NOISE}
float smin(float a, float b, float k){ if (k < 0.001) return min(a, b); float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float sdBody(vec2 p){ vec2 q = (p - uBody.xy) / uSquash; q.x -= clamp(q.x, -uBody.z, uBody.z); return (length(q) - uBody.w) * min(uSquash.x, uSquash.y); }
float sdf(vec2 p){
  float d = sdBody(p);
  // the swell towards the pointer: a smooth bump raised on the surface at the point nearest it
  if (uBulge.z > 0.05) { vec2 q = p - uBulge.xy; d -= uBulge.z * exp(-dot(q, q) / (uBulge.w * uBulge.w)); }
  if (uBead.z > 0.2) d = smin(d, length(p - uBead.xy) - uBead.z, uBead.w);
  return d;
}
vec3 scene(vec2 css){ return texture(uScene, css / uSize).rgb; }
vec3 frost(vec2 css, float r){
  if (r < 0.6) return scene(css);
  vec3 s = scene(css) * 0.2;
  for (int i = 0; i < 8; i++) { float a = float(i) * 0.785398 + 0.39; s += scene(css + vec2(cos(a), sin(a)) * r) * 0.1; }
  return s;
}
// weights that split white light into a spectrum across five samples (they add up to white)
const vec3 SPEC[5] = vec3[5](vec3(0.0, 0.05, 0.62), vec3(0.08, 0.38, 0.38), vec3(0.24, 0.42, 0.0), vec3(0.4, 0.15, 0.0), vec3(0.28, 0.0, 0.0));
float wave(float u){ float x = clamp(u, 0.0, 1.0) * 31.0; int i = int(floor(x)); return mix(uWave[i], uWave[min(i + 1, 31)], fract(x)); }
vec3 liq(float u){ float x = clamp(u, 0.0, 1.0) * 3.0; int i = int(min(floor(x), 2.0)); return mix(uLiq[i], uLiq[i + 1], smoothstep(0.0, 1.0, x - float(i))); }
void main(){
  vec2 p = gl_FragCoord.xy / uDpr;
  float d = sdf(p);
  vec3 bg = scene(p);
  float grain = hash(floor(gl_FragCoord.xy)) - 0.5;
  // the shadow the glass casts, and the coloured light it throws onto what is beneath
  float ds = sdf(p + vec2(0.0, uBody.w * 0.22));
  float shade = (1.0 - smoothstep(-uBody.w * 0.3, uBody.w * 0.55, ds)) * 0.42;
  vec3 spill = (uLiq[0] + uLiq[1] + uLiq[2] + uLiq[3]) * 0.25 * uGlow * exp(-max(ds, 0.0) / (uBody.w * 0.7)) * 0.45;
  vec3 outside = bg * (1.0 - shade) + spill + grain * 0.035;
  outside *= 1.0 - 0.3 * exp(-pow((d - 1.0) / 0.9, 2.0));
  if (d > 2.0) { o = vec4(outside, 1.0); return; }

  // the surface's slope; where shapes melt together inside, the field flattens out and so should the bending
  vec2 e = vec2(1.5, 0.0);
  vec2 gd = vec2(sdf(p + e.xy) - sdf(p - e.xy), sdf(p + e.yx) - sdf(p - e.yx));
  float glen = length(gd) / (2.0 * e.x);
  vec2 n = gd / max(length(gd), 1e-4);
  float sure = smoothstep(0.35, 0.85, glen);
  float R = uBody.w;
  float s = clamp(-d / (R * 0.94), 0.0, 1.0);
  float edge = 1.0 - s;
  // a thick lens: the middle magnifies, and the rim bends light so hard the picture folds over
  float bend = R * (0.24 * edge + 0.35 * pow(edge, 2.4) + 0.7 * pow(edge, 6.0));
  vec2 bc = p - uBead.xy;
  float lens = uBead.z > 0.2 ? (1.0 - smoothstep(uBead.z * 0.62, uBead.z * 0.95, length(bc))) * uBeadLens : 0.0;
  vec2 off = -n * bend * sure - bc * 0.45 * lens;
  float fr = 0.7 + uMilky * 9.0;
  float disp = 0.02 + 0.3 * pow(edge, 2.2);
  vec3 c = vec3(0.0);
  for (int i = 0; i < 5; i++) {
    float k = 1.0 + disp * (float(i) - 2.0);
    c += frost(p + off * k, fr) * SPEC[i];
  }
  c += (hash(floor((p + off) * uDpr)) - 0.5) * 0.04;
  c *= vec3(0.9, 0.92, 0.99);
  // the knob is a darker, stronger lens: it holds the stop button
  c *= 1.0 - 0.42 * lens * (0.55 + 0.45 * smoothstep(uBead.y + uBead.z, uBead.y - uBead.z, p.y));
  c = mix(c, vec3(0.9, 0.93, 1.0), 0.14 * pow(edge, 3.0));

  // your voice: a glowing liquid inside the bar whose surface carries the waves you make
  float bd = sdBody(p);
  if (uOpen > 0.01 && bd < 0.0) {
    float x0 = uBody.x - uBody.z - R;
    float u = (p.x - x0) / (2.0 * (uBody.z + R));
    float fill = (0.12 + 0.5 * uLevel) * uOpen;
    float ys = uBody.y - R + 2.0 * R * fill + wave(u) * R;
    float inside = smoothstep(ys + 1.2, ys - 1.2, p.y);
    float depth = clamp((ys - p.y) / (2.0 * R), 0.0, 1.0);
    vec3 b = u < 0.5 ? mix(vec3(uBands.x), vec3(uBands.y), u * 2.0) : mix(vec3(uBands.y), vec3(uBands.z), u * 2.0 - 1.0);
    vec3 lc = liq(u) * (0.75 + 0.5 * b);
    float mask = smoothstep(0.0, 0.2, clamp(-bd / R, 0.0, 1.0)) * uOpen;
    c = mix(c, c * 0.3 + lc * (1.05 - 0.55 * depth), inside * mask * 0.82);
    c += lc * exp(-pow((p.y - ys) / 1.3, 2.0)) * mask * 0.75;
    c += lc * exp(-max(p.y - ys, 0.0) / (R * 0.32)) * (1.0 - inside) * mask * 0.42 * uGlow;
  }

  // pressed, the glass turns milky
  c = mix(c, vec3(0.9, 0.92, 0.97), 0.4 * uMilky);
  // light from the top left: a gloss along that rim, and light focused through the glass onto the far side
  vec2 L = normalize(vec2(-0.55, 0.84));
  float nl = dot(n, L);
  float band1 = smoothstep(0.0, 0.03, s) * (1.0 - smoothstep(0.07, 0.24, s));
  c += vec3(1.0) * band1 * pow(max(nl, 0.0), 6.0) * 0.55;
  float band2 = smoothstep(0.05, 0.16, s) * (1.0 - smoothstep(0.24, 0.46, s));
  // (strongest under the curved ends, where the glass focuses light the most)
  float curve = smoothstep(0.12, 0.7, abs(n.x));
  float caus = band2 * pow(max(-nl, 0.0), 3.0) * curve;
  c += vec3(1.0, 0.96, 0.9) * caus * 0.62;
  c += vec3(1.0, 0.7, 0.32) * band2 * (1.0 - smoothstep(0.12, 0.2, s)) * pow(max(-nl, 0.0), 3.0) * curve * 0.3;
  // a thin film of colour just inside the rim, the way thick glass splits light at its edge
  float film = smoothstep(0.015, 0.05, s) * (1.0 - smoothstep(0.07, 0.15, s));
  vec3 hue = 0.5 + 0.5 * cos(6.2832 * (s * 7.0 + vec3(0.0, 0.33, 0.67)) + atan(n.y, n.x));
  c += (hue - 0.5) * film * 0.24;
  // the rim: a fine bright edge, brightest where it faces the light and directly away from it
  float rim = exp(-pow((d + 0.75) / 0.7, 2.0));
  c = mix(c, vec3(1.0), rim * (0.3 + 0.65 * abs(nl)));
  // the knob's own bevel and the glint on it
  if (uBead.z > 0.2) {
    float lr = length(bc) - uBead.z * 0.8;
    vec2 bn = bc / max(length(bc), 1e-3);
    c = mix(c, vec3(1.0), exp(-pow(lr / 0.8, 2.0)) * (0.25 + 0.55 * max(dot(bn, L), 0.0)) * uBeadLens);
    vec2 g = bc - uBead.z * vec2(-0.32, 0.34);
    c += vec3(1.0) * exp(-dot(g, g) / (uBead.z * uBead.z * 0.012)) * 0.7 * uBeadLens;
  }
  float a = smoothstep(1.0, -1.0, d);
  o = vec4(mix(outside, c, a), 1.0);
}`;

type GL = {
  gl: WebGL2RenderingContext;
  scene: WebGLProgram;
  glass: WebGLProgram;
  fbo: WebGLFramebuffer;
  tex: WebGLTexture;
  img: WebGLTexture;
  imgSize: [number, number] | null;
  fw: number;
  fh: number;
  u: Record<string, WebGLUniformLocation | null>;
  v: Record<string, WebGLUniformLocation | null>;
};

const compile = (gl: WebGL2RenderingContext, vs: string, fs: string) => {
  const mk = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, mk(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(p, 0, "aPos");
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || "link");
  return p;
};
const locs = (gl: WebGL2RenderingContext, p: WebGLProgram, names: string[]) => Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(p, n)]));

// ───────────────────────── the timer ─────────────────────────
function Digit({ d }: { d: string }) {
  return (
    <span className="relative inline-block overflow-hidden" style={{ width: "0.62em", height: "1.15em" }}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={d}
          className="absolute inset-0 text-center"
          initial={{ y: "70%", opacity: 0, filter: "blur(3px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-70%", opacity: 0, filter: "blur(3px)" }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
        >
          {d}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * Glass recorder: a voice button for AI apps, made of liquid glass that really bends the light behind it. At rest it
 * is one thick drop: the middle magnifies, the rim folds the picture over and splits it into a thin spectrum, and
 * light focused through it pools on the far side. Bring the pointer near and the drop swells out towards it like a
 * liquid drawn to a finger, following you round the edge; press and it squashes and turns milky.
 *
 * Tap and the drop spreads into a bar while a knob of glass buds out of its right end: a darker, stronger lens that
 * holds the stop button. As you talk your voice pours in as glowing liquid that rises with your loudness, warm at
 * the low end and cool at the high end, and every word sends a wave along its surface and a ripple through the satin
 * behind. Tap stop and the knob pinches off, carrying your recording's length away like a bubble, while the bar
 * gathers back into a drop with a wobble.
 *
 * Drawn with WebGL over its own backdrop (moving satin, or an image you pass). It listens to the microphone only
 * after a tap, measures loudness and tone and keeps nothing; if the microphone is blocked it shows a sample voice.
 * It is one real button (Space or Enter) with a spoken status, stops drawing off screen, and switches states without
 * motion under reduced motion. Without WebGL 2 it shows a plain frosted version.
 */
export default function GlassRecorder({
  height = 420,
  barWidth = 340,
  barHeight = 80,
  listen = "microphone",
  backdrop,
  scene,
  colors,
  ink = "white",
  autoplay = false,
  onStart,
  onStop,
  onMicrophoneError,
  className = "",
}: GlassRecorderProps) {
  const uid = useId().replace(/:/g, "");
  const reduced = !!useReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const inView = useInView(host, { amount: 0.15 });
  const [recording, setRecording] = useState(false);
  const [secs, setSecs] = useState(0);
  const [saved, setSaved] = useState(0);
  const [announce, setAnnounce] = useState("");
  const [glOk, setGlOk] = useState(true);
  const [box, setBox] = useState({ w: 0, h: 0 });

  const el = {
    mic: useRef<HTMLDivElement>(null),
    micFill: useRef<SVGRectElement>(null),
    timer: useRef<HTMLDivElement>(null),
    stop: useRef<HTMLDivElement>(null),
    note: useRef<HTMLDivElement>(null),
    button: useRef<HTMLButtonElement>(null),
    cursor: useRef<HTMLDivElement>(null),
    plain: useRef<HTMLDivElement>(null),
  };

  // state the animation loop reads
  const rec = useRef(false);
  const touched = useRef(false);
  const pressT = useRef(0);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const startedAt = useRef(0);
  const secsShown = useRef(0);
  const voice = useRef<{ kind: "none" | "wait" | "sim" | "mic"; sim?: (dt: number) => Reading; mic?: MicHandle }>({ kind: "none" });
  const seed = useRef(11);
  const props = useRef({ onStart, onStop, onMicrophoneError, listen });
  props.current = { onStart, onStop, onMicrophoneError, listen };
  const events = useRef<("start" | "stop")[]>([]);

  const start = (sample: boolean) => {
    if (rec.current) return;
    rec.current = true;
    events.current.push("start");
    startedAt.current = performance.now();
    secsShown.current = 0;
    setSecs(0);
    setRecording(true);
    setAnnounce("Recording");
    props.current.onStart?.();
    seed.current += 7;
    voice.current = { kind: "sim", sim: sampleVoice(seed.current) };
    if (!sample && props.current.listen === "microphone") {
      if (!navigator.mediaDevices?.getUserMedia) {
        setAnnounce("Recording. No microphone here, so this shows a sample voice");
        return;
      }
      voice.current = { kind: "wait" };
      openMic().then(
        (h) => {
          if (rec.current && voice.current.kind === "wait") voice.current = { kind: "mic", mic: h };
          else h.stop();
        },
        (err) => {
          props.current.onMicrophoneError?.(err);
          if (rec.current && voice.current.kind === "wait") {
            voice.current = { kind: "sim", sim: sampleVoice(seed.current) };
            setAnnounce("Recording. The microphone is blocked, so this shows a sample voice");
          }
        },
      );
    }
  };
  const stop = () => {
    if (!rec.current) return;
    rec.current = false;
    events.current.push("stop");
    voice.current.mic?.stop();
    voice.current = { kind: "none" };
    const s = Math.floor((performance.now() - startedAt.current) / 1000);
    setSaved(s);
    setRecording(false);
    setAnnounce(`Recording saved, ${fmt(s)}`);
    props.current.onStop?.(s);
  };
  const ctl = useRef({ start, stop });
  ctl.current = { start, stop };

  useEffect(
    () => () => {
      voice.current.mic?.stop();
    },
    [],
  );

  // size
  useEffect(() => {
    const n = host.current;
    if (!n) return;
    const ro = new ResizeObserver(() => setBox({ w: n.clientWidth, h: n.clientHeight }));
    ro.observe(n);
    setBox({ w: n.clientWidth, h: n.clientHeight });
    return () => ro.disconnect();
  }, []);

  // geometry, in css px with y pointing up (as the shader sees it)
  const W = box.w;
  const Hh = box.h;
  const bw = Math.max(160, Math.min(barWidth, W * 0.86));
  const bh = clamp(barHeight, 48, 120);
  const r = bh / 2; // the bar's end caps
  const R0 = bh * 0.62; // the resting drop
  const KNOB = r * 0.78; // the knob that holds stop
  const sceneCols = (scene && scene.length >= 5 ? scene.slice(0, 5) : DEFAULT_SCENE).map(rgb01);
  const lightCols = (colors && colors.length >= 4 ? colors.slice(0, 4) : DEFAULT_LIGHT).map(rgb01);
  const colKey = JSON.stringify([sceneCols, lightCols]);
  const inkColor = ink === "dark" ? "#1d1d1f" : "#ffffff";
  const inkShadow = ink === "dark" ? "rgba(255,255,255,0.55)" : "rgba(8,10,40,0.45)";

  // everything that moves persists across re-renders
  const sim = useRef({
    t: 0,
    R: spr(R0),
    half: spr(0),
    press: spr(0),
    milky: spr(0),
    open: spr(0),
    prox: spr(0),
    dx: spr(1),
    dy: spr(0),
    ax: 0,
    knob: spr(0),
    level: spr(0),
    glow: spr(0),
    wob: spr(0),
    free: null as null | { x: Spr; y: Spr; r: Spr; age: number },
    wave: new Float64Array(32),
    wv: new Float64Array(32),
    bands: [0.6, 0.6, 0.6] as [number, number, number],
    quiet: true,
    demo: 0,
    demoHeld: false,
  });

  useEffect(() => {
    const cv = canvas.current;
    if (W < 10 || Hh < 10) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const S = sim.current;
    const cx = W / 2;
    const cy = Hh / 2;
    S.ax = cx;

    // WebGL setup
    let G: GL | null = null;
    if (glOk && cv) {
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(Hh * dpr);
      try {
        const gl = cv.getContext("webgl2", { antialias: false, alpha: false, premultipliedAlpha: false });
        if (!gl) throw new Error("no webgl2");
        const sp = compile(gl, VERT, SCENE);
        const gp = compile(gl, VERT, GLASS);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        const fw = Math.max(64, Math.round(W * dpr * 0.6));
        const fh = Math.max(64, Math.round(Hh * dpr * 0.6));
        const tex = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fw, fh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const fbo = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        const img = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, img);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
        G = {
          gl,
          scene: sp,
          glass: gp,
          fbo,
          tex,
          img,
          imgSize: null,
          fw,
          fh,
          u: locs(gl, sp, ["uSize", "uScale", "uTime", "uPal", "uC", "uRipple", "uImg", "uUseImg", "uImgSize"]),
          v: locs(gl, gp, ["uSize", "uDpr", "uScene", "uBody", "uSquash", "uBulge", "uBead", "uBeadLens", "uMilky", "uOpen", "uLevel", "uGlow", "uWave", "uLiq", "uBands"]),
        };
      } catch {
        setGlOk(false);
        return;
      }
    }
    let alive = true;
    if (G && backdrop) {
      const g0 = G;
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = () => {
        if (!alive) return;
        const gl = g0.gl;
        gl.bindTexture(gl.TEXTURE_2D, g0.img);
        try {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          g0.imgSize = [im.naturalWidth, im.naturalHeight];
        } catch {
          g0.imgSize = null; // an image the browser will not share with WebGL: stay on the satin
        }
      };
      im.src = backdrop;
    }
    const palFlat = new Float32Array(sceneCols.flat());
    const liqFlat = new Float32Array(lightCols.flat());
    const waveF = new Float32Array(32);
    const half1 = bw / 2 - r;

    /** the self-demo: a pointer that wanders up to the drop, presses it, runs along the bar, then presses stop */
    const demoPointer = (t: number): { x: number; y: number } | null => {
      const ease = (a: number, b: number) => smooth((t - a) / (b - a));
      const lerp2 = (a: [number, number], b: [number, number], k: number) => ({ x: mix(a[0], b[0], k), y: mix(a[1], b[1], k) });
      const far: [number, number] = [cx + R0 * 3.4, cy - R0 * 2.6];
      const side = (a: number): [number, number] => [cx + Math.cos(a) * R0 * 1.22, cy + Math.sin(a) * R0 * 1.22];
      const mid: [number, number] = [cx + R0 * 0.1, cy + R0 * 0.05];
      const knob: [number, number] = [cx + half1 + r + KNOB * 0.5, cy - 2];
      if (t < 0.9) return null;
      if (t < 1.9) return lerp2(far, side(-0.42), ease(0.9, 1.9));
      if (t < 2.7) return { x: side(mix(-0.42, 0.62, ease(1.9, 2.7)))[0], y: side(mix(-0.42, 0.62, ease(1.9, 2.7)))[1] };
      if (t < 3.1) return lerp2(side(0.62), mid, ease(2.7, 3.1));
      if (t < 3.5) return { x: mid[0], y: mid[1] };
      if (t < 4.3) return lerp2(mid, [cx + R0 * 0.6, cy - R0 * 3], ease(3.5, 4.3));
      if (t < 5.2) return null;
      if (t < 7.4) {
        const k = ease(5.2, 7.4);
        return { x: cx - half1 * 1.05 + k * half1 * 2.1, y: cy + r * 1.55 + Math.sin(k * Math.PI) * r * 0.15 };
      }
      if (t < 8.3) return lerp2([cx + half1 * 1.05, cy + r * 1.55], [cx + half1 * 1.4, cy + r * 3], ease(7.4, 8.3));
      if (t < 9.0) return lerp2([cx + half1 * 1.4, cy + r * 3], knob, ease(8.3, 9.0));
      if (t < 9.6) return { x: knob[0], y: knob[1] };
      if (t < 10.6) return lerp2(knob, far, ease(9.6, 10.6));
      return null;
    };

    const physics = (dt: number) => {
      S.t += dt;
      // the self-demo
      let demoP: { x: number; y: number } | null = null;
      // the demo waits while a real pointer is in the scene, and ends for good at the first press
      if (autoplay && !touched.current && !reduced && pointer.current && S.demoHeld) {
        S.demoHeld = false;
        pressT.current = 0;
      }
      if (autoplay && !touched.current && !reduced && !pointer.current) {
        const prev = S.demo;
        S.demo = (S.demo + dt) % 12.5;
        const t = S.demo;
        const at = (k: number) => prev < k && t >= k;
        demoP = demoPointer(t);
        if (at(3.2) || at(9.2)) {
          pressT.current = 1;
          S.demoHeld = true;
        }
        if (at(3.38) && S.demoHeld) {
          pressT.current = 0;
          S.demoHeld = false;
          if (!rec.current) ctl.current.start(true);
        }
        if (at(9.38) && S.demoHeld) {
          pressT.current = 0;
          S.demoHeld = false;
          if (rec.current) ctl.current.stop();
        }
        if (prev > t && rec.current) ctl.current.stop();
      }
      if (el.cursor.current) {
        el.cursor.current.style.opacity = !pointer.current && demoP ? "1" : "0";
        if (demoP) el.cursor.current.style.transform = `translate(${(demoP.x - 3).toFixed(1)}px,${(Hh - demoP.y - 3).toFixed(1)}px) scale(${(1 - 0.14 * S.press.x).toFixed(3)})`;
      }
      const P = pointer.current ?? demoP;

      // the voice
      const v = voice.current;
      let read: Reading = { level: 0, bands: S.bands };
      if (v.kind === "sim" && v.sim) read = v.sim(dt);
      else if (v.kind === "mic" && v.mic) read = v.mic.read();
      for (let k = 0; k < 3; k++) S.bands[k] += (read.bands[k] - S.bands[k]) * (1 - Math.exp(-dt / 0.14));
      const loud = rec.current ? read.level : 0;
      if (rec.current && S.quiet && loud > 0.3 && !reduced) {
        // a word: a wave sets off from the microphone end
        S.wv[2] -= 2.2 * loud;
        S.wv[3] -= 1.6 * loud;
        S.quiet = false;
      }
      if (loud < 0.15) S.quiet = true;

      const o = rec.current ? 1 : 0;
      const n = Math.max(1, Math.ceil(dt / (1 / 240)));
      const h = dt / n;
      const halfBefore = S.half.x;
      for (let k = 0; k < n; k++) {
        if (reduced) {
          S.half.x = o ? half1 : 0;
          S.R.x = o ? r : R0;
          S.open.x = o;
          S.knob.x = o;
          S.press.x = S.milky.x = S.prox.x = S.wob.x = 0;
        } else {
          // opening, the drop spreads slowly and settles with an overshoot; closing, it gathers back with a wobble
          step(S.half, o ? half1 : 0, o ? 1.75 : 2.1, o ? 0.5 : 0.36, h);
          step(S.R, o ? r : R0, o ? 2.2 : 2.6, 0.4, h);
          step(S.open, o, 1.7, 0.95, h);
          step(S.knob, o === 1 && S.half.x > half1 * 0.62 ? 1 : 0, 2.6, 0.42, h);
          step(S.press, pressT.current, 7.5, 0.34, h);
          step(S.milky, pressT.current, 6, 1, h);
          step(S.wob, 0, 3.4, 0.22, h);
        }
        step(S.level, loud, 2.1, 0.5, h);
        step(S.glow, rec.current ? 0.35 + 0.65 * loud : 0, 4, 1, h);
      }
      // the bar is a liquid: stretching it fast thins it for a moment, and sloshes what is inside
      const stretch = (S.half.x - halfBefore) / Math.max(1e-4, dt);
      if (!reduced) {
        S.wob.v += stretch * 0.0022 * dt * 60;
        S.wv[0] += stretch * 0.0009;
        S.wv[31] -= stretch * 0.0009;
        for (let k = 0; k < n; k++) {
          for (let i = 0; i < 32; i++) {
            const l = S.wave[i === 0 ? 0 : i - 1];
            const rr = S.wave[i === 31 ? 31 : i + 1];
            S.wv[i] += (900 * (l + rr - 2 * S.wave[i]) - 3.2 * S.wv[i] - 14 * S.wave[i]) * h;
          }
          for (let i = 0; i < 32; i++) S.wave[i] += S.wv[i] * h;
        }
        const ripple = rec.current ? loud * 0.012 : 0;
        for (let i = 0; i < 32; i++) S.wave[i] = clamp(S.wave[i] + (Math.random() - 0.5) * ripple, -0.34, 0.34);
      } else S.wave.fill(0);

      // the swell towards the pointer: from the nearest point on the bar's spine, reach out towards it
      const Rn = S.R.x;
      const half = Math.max(0, S.half.x);
      if (P && !reduced) {
        const ax = clamp(P.x, cx - half, cx + half);
        const vx = P.x - ax;
        const vy = P.y - cy;
        const dist = Math.hypot(vx, vy);
        const near = 1 - smooth((dist - Rn + Rn * 0.55) / (Rn * 2.1));
        const inner = smooth((dist - Rn * 0.25) / (Rn * 0.5));
        S.ax += (ax - S.ax) * (1 - Math.exp(-dt / 0.06));
        for (let k = 0; k < n; k++) {
          step(S.prox, near * inner, 3.6, 0.46, h);
          if (dist > 1) {
            step(S.dx, vx / dist, 5, 0.8, h);
            step(S.dy, vy / dist, 5, 0.8, h);
          }
        }
      } else for (let k = 0; k < n; k++) step(S.prox, 0, 3.2, 0.36, h);

      // the knob: on the right end while recording; on stop it pinches off and floats away
      for (const e of events.current.splice(0)) {
        if (e === "stop" && S.knob.x > 0.2) {
          const kk = Math.min(1, S.knob.x);
          S.free = { x: spr(cx + half + Rn + KNOB * (0.5 - 1.6 * (1 - kk))), y: spr(cy), r: spr(KNOB * (0.4 + 0.6 * kk)), age: 0 };
          S.free.x.v = 40;
          S.knob.x = 0;
          S.knob.v = 0;
        }
        if (e === "start") S.free = null;
      }
      if (S.free) {
        const f = S.free;
        f.age += dt;
        for (let k = 0; k < n; k++) {
          step(f.x, cx + bw / 2 + r * 0.25, 1.3, 0.75, h);
          step(f.y, cy + r * 1.25 + f.age * r * 0.35, 1.2, 0.8, h);
          step(f.r, f.age > 1.1 ? 0 : KNOB * 0.92, f.age > 1.1 ? 1.4 : 3, 0.9, h);
        }
        if (reduced || (f.age > 1.4 && f.r.x < 0.6)) S.free = null;
      }
    };

    const layout = () => {
      const Rn = S.R.x;
      const half = Math.max(0, S.half.x);
      const sq = S.press.x;
      const wob = clamp(S.wob.x, -0.25, 0.25);
      const sx = 1 + 0.06 * sq + 0.12 * wob;
      const sy = 1 - 0.09 * sq - 0.25 * wob;
      // the swell
      const prox = clamp(S.prox.x, 0, 1.2);
      const dl = Math.hypot(S.dx.x, S.dy.x) || 1;
      const ux = S.dx.x / dl;
      const uy = S.dy.x / dl;
      const rb = Rn * 0.55 * prox;
      const bx = S.ax + ux * Rn * sx;
      const by = cy + uy * Rn * sy;
      // the knob
      let kn = { x: 0, y: 0, r: 0, k: 0, lens: 0 };
      if (S.free) kn = { x: S.free.x.x, y: S.free.y.x, r: Math.max(0, S.free.r.x), k: Rn * 0.42, lens: 1 };
      else if (S.knob.x > 0.01) {
        const kk = clamp(S.knob.x, 0, 1.3);
        kn = { x: cx + half * sx + Rn + KNOB * (0.5 - 1.6 * (1 - kk)), y: cy, r: KNOB * (0.4 + 0.6 * Math.min(1, kk)), k: Rn * 0.42, lens: smooth(kk) };
      }
      return { Rn, half, sx, sy, rb, bx, by, prox, kn };
    };

    const draw = () => {
      const L = layout();
      const o = clamp(S.open.x);
      // the overlays: microphone at the left end, timer in the middle, stop in the knob
      const ms = bh * 0.36;
      const micX = mix(cx, cx - L.half * L.sx - L.Rn * 0.1, smooth(o)) + (o > 0.5 ? r * 0.12 : 0);
      if (el.mic.current) el.mic.current.style.transform = `translate(${(micX - ms / 2).toFixed(2)}px,${(Hh - cy - ms / 2).toFixed(2)}px) scale(${(1 - 0.08 * S.press.x).toFixed(3)})`;
      if (el.micFill.current) {
        const f = rec.current ? clamp(S.level.x * 1.3) : 0;
        el.micFill.current.setAttribute("y", (160 - 128 * f).toFixed(1));
        el.micFill.current.setAttribute("height", (128 * f).toFixed(1));
      }
      if (el.timer.current) {
        const k = smooth((o - 0.5) / 0.45);
        el.timer.current.style.opacity = k.toFixed(3);
        el.timer.current.style.filter = k > 0.99 ? "none" : `blur(${(4 * (1 - k)).toFixed(2)}px)`;
        el.timer.current.style.transform = `translate(${(cx - L.Rn * 0.05).toFixed(1)}px,${(Hh - cy).toFixed(1)}px) translate(-50%,-50%) scale(${(0.9 + 0.1 * k).toFixed(3)})`;
      }
      if (el.stop.current) {
        const show = !S.free && L.kn.r > 0 ? smooth((L.kn.lens - 0.55) / 0.4) : 0;
        el.stop.current.style.opacity = show.toFixed(3);
        el.stop.current.style.transform = `translate(${L.kn.x.toFixed(1)}px,${(Hh - L.kn.y).toFixed(1)}px) translate(-50%,-50%) scale(${(0.6 + 0.4 * show).toFixed(3)})`;
      }
      if (el.note.current) {
        const f = S.free;
        const show = f ? smooth((f.r.x / (KNOB * 0.92) - 0.35) / 0.5) * smooth(f.age / 0.25) : 0;
        el.note.current.style.opacity = show.toFixed(3);
        if (f) el.note.current.style.transform = `translate(${f.x.x.toFixed(1)}px,${(Hh - f.y.x).toFixed(1)}px) translate(-50%,-50%) scale(${(0.7 + 0.3 * show).toFixed(3)})`;
      }
      if (el.button.current) {
        const bs = el.button.current.style;
        const x0 = cx - L.half * L.sx - L.Rn;
        const x1 = rec.current ? Math.max(cx + L.half * L.sx + L.Rn, L.kn.x + L.kn.r) : cx + L.half * L.sx + L.Rn;
        bs.left = `${x0.toFixed(1)}px`;
        bs.top = `${(Hh - cy - L.Rn).toFixed(1)}px`;
        bs.width = `${(x1 - x0).toFixed(1)}px`;
        bs.height = `${(L.Rn * 2).toFixed(1)}px`;
      }
      if (!G) {
        // the plain version
        const pl = el.plain.current;
        if (pl) {
          const x0 = cx - L.half * L.sx - L.Rn;
          const w = Math.max(cx + L.half * L.sx + L.Rn, !S.free && L.kn.r > 0 ? L.kn.x + L.kn.r + 4 : 0) - x0;
          pl.style.left = `${x0.toFixed(1)}px`;
          pl.style.top = `${(Hh - cy - L.Rn * L.sy).toFixed(1)}px`;
          pl.style.width = `${w.toFixed(1)}px`;
          pl.style.height = `${(L.Rn * 2 * L.sy).toFixed(1)}px`;
        }
        return;
      }
      const gl = G.gl;
      const cw = gl.drawingBufferWidth;
      // the backdrop
      gl.bindFramebuffer(gl.FRAMEBUFFER, G.fbo);
      gl.viewport(0, 0, G.fw, G.fh);
      gl.useProgram(G.scene);
      gl.uniform2f(G.u.uSize, W, Hh);
      gl.uniform1f(G.u.uScale, G.fw / W);
      gl.uniform1f(G.u.uTime, reduced ? 4 : S.t);
      gl.uniform3fv(G.u.uPal, palFlat);
      gl.uniform2f(G.u.uC, cx, cy);
      gl.uniform1f(G.u.uRipple, reduced ? 0 : clamp(S.level.x) * o);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, G.img);
      gl.uniform1i(G.u.uImg, 1);
      gl.uniform1f(G.u.uUseImg, G.imgSize ? 1 : 0);
      gl.uniform2f(G.u.uImgSize, G.imgSize?.[0] ?? 1, G.imgSize?.[1] ?? 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      // the glass
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.useProgram(G.glass);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, G.tex);
      gl.uniform1i(G.v.uScene, 0);
      gl.uniform2f(G.v.uSize, W, Hh);
      gl.uniform1f(G.v.uDpr, cw / W);
      gl.uniform4f(G.v.uBody, cx, cy, L.half, L.Rn);
      gl.uniform2f(G.v.uSquash, L.sx, L.sy);
      gl.uniform4f(G.v.uBulge, L.bx, L.by, L.rb, L.Rn * 1.0);
      gl.uniform4f(G.v.uBead, L.kn.x, L.kn.y, L.kn.r, L.kn.k);
      gl.uniform1f(G.v.uBeadLens, L.kn.lens);
      gl.uniform1f(G.v.uMilky, clamp(S.milky.x));
      gl.uniform1f(G.v.uOpen, o);
      gl.uniform1f(G.v.uLevel, clamp(S.level.x, 0, 1.2));
      gl.uniform1f(G.v.uGlow, clamp(S.glow.x));
      for (let i = 0; i < 32; i++) waveF[i] = S.wave[i] * clamp(o * 1.5);
      gl.uniform1fv(G.v.uWave, waveF);
      gl.uniform3fv(G.v.uLiq, liqFlat);
      gl.uniform3f(G.v.uBands, S.bands[0], S.bands[1], S.bands[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let raf = 0;
    let last = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      physics(dt);
      if (rec.current) {
        const s = Math.floor((performance.now() - startedAt.current) / 1000);
        if (s !== secsShown.current) {
          secsShown.current = s;
          setSecs(s);
        }
      }
      draw();
      raf = requestAnimationFrame(frame);
    };
    physics(0.016);
    draw();
    if (inView) raf = requestAnimationFrame(frame);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      if (G) {
        const gl = G.gl;
        gl.deleteProgram(G.scene);
        gl.deleteProgram(G.glass);
        gl.deleteTexture(G.tex);
        gl.deleteTexture(G.img);
        gl.deleteFramebuffer(G.fbo);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [W, Hh, bw, bh, reduced, inView, autoplay, glOk, backdrop, colKey]);

  const onKey = (e: RKeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") pressT.current = 1;
  };
  const release = () => {
    pressT.current = 0;
  };
  const toggle = () => {
    touched.current = true;
    if (rec.current) ctl.current.stop();
    else ctl.current.start(false);
  };
  const track = (e: RPointerEvent) => {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    const b = host.current?.getBoundingClientRect();
    if (!b) return;
    pointer.current = { x: e.clientX - b.left, y: b.height - (e.clientY - b.top) };
  };

  const mm = String(Math.min(99, Math.floor(secs / 60))).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const fill = height === "fill";

  return (
    <div
      ref={host}
      className={`${fill ? "absolute inset-0" : "relative w-full"} select-none overflow-hidden ${className}`}
      style={{ height: fill ? undefined : height, WebkitTapHighlightColor: "transparent", background: "#1a1240" }}
      onPointerMove={track}
      onPointerLeave={() => (pointer.current = null)}
    >
      {glOk ? (
        <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" />
      ) : (
        <>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: "radial-gradient(120% 90% at 30% 20%,#ffd7a8 0%,#ff8a68 22%,#bd4c9c 46%,#4a37b4 72%,#17195e 100%)" }}
          />
          <div
            ref={el.plain}
            aria-hidden
            className="absolute rounded-full"
            style={{
              backdropFilter: "blur(14px) saturate(1.4)",
              WebkitBackdropFilter: "blur(14px) saturate(1.4)",
              background: "rgba(255,255,255,0.18)",
              boxShadow: "inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 1px rgba(255,255,255,0.4), 0 12px 30px -12px rgba(10,10,40,0.6)",
            }}
          />
        </>
      )}

      <div
        ref={el.timer}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 flex font-medium tabular-nums"
        style={{ color: inkColor, fontSize: bh * 0.36, letterSpacing: "-0.01em", lineHeight: 1, opacity: 0, textShadow: `0 1px 12px ${inkShadow}, 0 0 2px ${inkShadow}` }}
      >
        <Digit d={mm[0]} />
        <Digit d={mm[1]} />
        <span style={{ width: "0.32em", textAlign: "center", height: "1.15em" }}>:</span>
        <Digit d={ss[0]} />
        <Digit d={ss[1]} />
      </div>

      <div ref={el.mic} aria-hidden className="pointer-events-none absolute left-0 top-0" style={{ width: bh * 0.36, height: bh * 0.36 }}>
        <svg viewBox="0 0 256 256" width={bh * 0.36} height={bh * 0.36} style={{ filter: `drop-shadow(0 1px 5px ${inkShadow})`, overflow: "visible" }}>
          <defs>
            <clipPath id={`${uid}cap`}>
              <rect x="96" y="32" width="64" height="128" rx="32" />
            </clipPath>
          </defs>
          <rect ref={el.micFill} x="90" y="160" width="76" height="0" fill="#ff3b30" clipPath={`url(#${uid}cap)`} />
          <path d={MIC_OUTLINE} fill={inkColor} />
        </svg>
      </div>

      <div ref={el.stop} aria-hidden className="pointer-events-none absolute left-0 top-0" style={{ opacity: 0 }}>
        <svg viewBox="0 0 256 256" width={KNOB * 0.66} height={KNOB * 0.66} style={{ display: "block", filter: `drop-shadow(0 1px 4px ${inkShadow})` }}>
          <path d={STOP} fill={inkColor} />
        </svg>
      </div>

      <div
        ref={el.note}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 font-semibold tabular-nums"
        style={{ opacity: 0, color: inkColor, fontSize: Math.max(11, KNOB * 0.42), textShadow: `0 1px 6px ${inkShadow}` }}
      >
        {fmt(saved)}
      </div>

      {autoplay && (
        <div ref={el.cursor} aria-hidden className="pointer-events-none absolute left-0 top-0 transition-opacity duration-300" style={{ opacity: 0 }}>
          <svg viewBox="0 0 256 256" width="22" height="22" style={{ display: "block", overflow: "visible", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))" }}>
            <path d={CURSOR} fill="#fff" stroke="#111" strokeWidth="14" strokeLinejoin="round" style={{ paintOrder: "stroke" }} />
          </svg>
        </div>
      )}

      <button
        ref={el.button}
        type="button"
        aria-label={recording ? "Stop recording" : "Start recording"}
        onClick={toggle}
        onPointerDown={() => {
          touched.current = true;
          pressT.current = 1;
        }}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
        onKeyDown={onKey}
        onKeyUp={release}
        onBlur={release}
        className="absolute cursor-pointer rounded-full bg-transparent outline-none focus-visible:ring-[3px] focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0071e3]"
        style={{ left: W / 2 - R0, top: Hh / 2 - R0, width: R0 * 2, height: R0 * 2, touchAction: "manipulation" }}
      />
      <span className="sr-only" role="status" aria-live="polite">
        {announce}
      </span>
    </div>
  );
}
