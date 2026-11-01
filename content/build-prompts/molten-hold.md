# Molten Hold

Add the "Molten Hold" component from Nexus UI to my project.

Hold to confirm by pouring molten metal. Press and hold and metal pours into the channel: the front is a glowing meniscus, white-orange at the lip, that shivers as it runs and throws heat onto the groove ahead, while behind it the metal cools through orange and red into chrome, its skin breaking into slow cells. Let go early and it drains back. Hold to the end and the glow fades, one ripple runs the length of the set bar, and the label is pressed into the metal. Space or Enter hold it from the keyboard. Until you touch it, it holds and lets go by itself.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { MoltenHold } from "@/components/molten-hold";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/molten-hold/index.ts ---

```ts
export { MoltenHold } from "./molten-hold";
export type { MoltenHoldProps } from "./molten-hold";
```

--- components/molten-hold/molten-hold-sound.ts ---

```ts
/**
 * Molten Hold's sounds, made with the Web Audio API (no audio files), scored to the pour.
 *
 *   ignite   a low thump and a short whoosh as the metal starts to run
 *   grain    one grain of the sizzle. The component plays them while it pours, closer together and brighter as the
 *            channel fills, so the hiss and crackle follow the front
 *   drain    an airy slide downward with a few bubbly notes stepping down, for letting go early
 *   set      a heavy thunk, a hiss of steam as the metal quenches, a ring of chrome as it sets and a sheen that runs
 *            the length of the bar with the ripple
 *   undo     a soft reverse blip, for pressing a finished bar again
 *
 * `arg` is how full the channel is, 0 to 1, for the sounds that follow the pour.
 */
import { hiss, tone, type SoundDef } from "@/lib/ui-sounds";

type Out = AudioNode;

/** Chrome ringing: a note with the odd overtones of struck metal. */
function ring(c: AudioContext, o: Out, freq: number, at: number, gain: number, decay = 0.9) {
  tone(c, o, { freq, at, attack: 0.002, decay, gain });
  tone(c, o, { freq: freq * 2.76, at, attack: 0.001, decay: decay * 0.5, gain: gain * 0.5 });
  tone(c, o, { freq: freq * 5.4, at, attack: 0.001, decay: decay * 0.25, gain: gain * 0.25 });
}

export type MoltenHoldSound = "ignite" | "grain" | "drain" | "set" | "undo";

export function moltenHoldSound(name: MoltenHoldSound, arg = 0): SoundDef {
  switch (name) {
    case "ignite":
      return {
        category: "Molten Hold",
        label: "Ignite",
        play: (c, o) => {
          tone(c, o, { freq: 70, to: 48, glide: 0.12, attack: 0.004, decay: 0.2, gain: 0.22 });
          hiss(c, o, { filter: "lowpass", freq: 500, to: 1500, attack: 0.12, decay: 0.3, gain: 0.06 });
          hiss(c, o, { filter: "highpass", freq: 6000, decay: 0.02, gain: 0.05 });
        },
      };
    case "grain":
      return {
        category: "Molten Hold",
        label: "Sizzle",
        play: (c, o) => {
          const r = Math.random();
          hiss(c, o, { filter: "bandpass", freq: (2400 + arg * 3200) * (0.7 + Math.random() * 0.6), attack: 0.002, decay: 0.03, gain: 0.08 + 0.05 * Math.random(), q: 2.2 });
          // now and then a spit, and a low glug from deep in the crucible
          if (r < 0.28) tone(c, o, { freq: 700 + Math.random() * 1500, to: 450, glide: 0.02, attack: 0.001, decay: 0.03, gain: 0.035 });
          if (r > 0.78) tone(c, o, { freq: 110 + arg * 60, to: 90, glide: 0.05, attack: 0.004, decay: 0.08, gain: 0.05 });
        },
      };
    case "drain":
      return {
        category: "Molten Hold",
        label: "Drain",
        play: (c, o) => {
          hiss(c, o, { filter: "bandpass", freq: 2800, to: 500, attack: 0.05, decay: 0.35, gain: 0.05, q: 0.8 });
          [900, 700, 520].forEach((f, i) => tone(c, o, { freq: f, to: f * 0.6, glide: 0.06, at: 0.05 + i * 0.09, attack: 0.003, decay: 0.1, gain: 0.06 * (1 - i * 0.18) }));
        },
      };
    case "set":
      return {
        category: "Molten Hold",
        label: "Set",
        play: (c, o) => {
          tone(c, o, { freq: 120, to: 70, glide: 0.1, attack: 0.003, decay: 0.28, gain: 0.24 });
          hiss(c, o, { filter: "lowpass", freq: 700, decay: 0.08, gain: 0.12 });
          hiss(c, o, { filter: "highpass", freq: 7000, to: 3500, attack: 0.02, decay: 0.55, gain: 0.05 });
          ring(c, o, 1046.5, 0.03, 0.12, 0.9);
          ring(c, o, 1568, 0.11, 0.08, 0.7);
          tone(c, o, { freq: 2093, to: 3136, glide: 0.6, at: 0.45, attack: 0.2, decay: 0.5, gain: 0.02 });
        },
      };
    case "undo":
      return {
        category: "Molten Hold",
        label: "Undo",
        play: (c, o) => {
          tone(c, o, { freq: 400, to: 180, glide: 0.08, attack: 0.003, decay: 0.12, gain: 0.09 });
          hiss(c, o, { filter: "bandpass", freq: 2000, to: 800, decay: 0.2, gain: 0.03, q: 0.8 });
        },
      };
  }
}
```

--- components/molten-hold/molten-hold.tsx ---

```tsx
"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { audioAwake, playDef, useAutoplaySoundAllowed } from "@/lib/ui-sounds";
import { moltenHoldSound, type MoltenHoldSound } from "./molten-hold-sound";

/* ------------------------------------------------------------------ liquid chrome, shaded per pixel
 * The shape is a signed distance field (`map`, in css px, negative inside). Its depth is a pillow: round at the rim,
 * flat on top, so every point has a real surface normal. That normal reflects a studio (a bright softbox, a dark
 * horizon line, a warm floor bounce) whose image is warped by slow currents; red, green and blue are looked up a hair
 * apart, more at the rims, which is where real chrome shows its rainbow. A soft shadow falls below and to the right. */
const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const chrome = (o: { uniforms: string; map: string; thick: string; shadow: [number, number, number, number]; extra?: string; outside?: string; warp?: string }) => `
precision highp float;
uniform vec2 uRes, uOff; // the canvas covers only part of the component; uOff is where its corner sits
uniform float uDpr, uT, uFlow;
${o.uniforms}
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float smax(float a, float b, float k){ return -smin(-a, -b, k); }
float sdE(vec2 p, vec4 b){ vec2 q = (p - b.xy) / b.zw; return (length(q) - 1.0) * min(b.z, b.w); }
float sdRound(vec2 p, vec2 c, vec2 h, float r){ vec2 q = abs(p - c) - h + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
// the studio the chrome reflects, by direction: a bright sky with a softbox up and to the left, a thin lit stripe,
// a dark horizon line, and a warm, dim floor. It turns slowly, so highlights drift over the metal.
float envL(vec3 r, float t){
  float az = atan(r.x, r.z) + t * 0.12;
  float y = r.y + 0.035 * sin(az * 3.0 + t * 0.5);
  float sky = 0.36 + 0.6 * smoothstep(0.0, 0.85, y);
  float box = exp(-pow((y - 0.6) * 4.5, 2.0)) * exp(-pow((az + 0.55) * 1.4, 2.0)) * 1.15;
  float box2 = exp(-pow((y - 0.42) * 6.0, 2.0)) * exp(-pow((az - 1.4) * 1.8, 2.0)) * 0.55;
  float stripe = exp(-pow((y - 0.24) * 14.0, 2.0)) * 0.3;
  float fl = 0.17 + 0.16 * smoothstep(-1.0, -0.15, y);
  float b = mix(fl, sky + box + box2 + stripe, smoothstep(-0.07, 0.015, y));
  b *= 1.0 - 0.8 * exp(-pow((y + 0.02) * 26.0, 2.0));
  return b;
}
${o.map}
void main(){
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr + uOff;
  float d = map(p);
  // far from any metal: nothing to draw, not even a shadow (most of the canvas, so it costs almost nothing)
  if (d > ${(Math.hypot(o.shadow[0], o.shadow[1]) + o.shadow[2] * 1.6 + 2).toFixed(1)} && ${o.outside ? "true" : "false"} == false) { gl_FragColor = vec4(0.0); return; }
  float sh = (1.0 - smoothstep(-${o.shadow[2].toFixed(1)}, ${(o.shadow[2] * 1.6).toFixed(1)}, map(p - vec2(${o.shadow[0].toFixed(1)}, ${o.shadow[1].toFixed(1)})))) * ${o.shadow[3].toFixed(2)};
  float a = clamp(-d * uDpr + 0.5, 0.0, 1.0);
  ${o.outside ?? ""}
  if (a <= 0.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, sh); return; }
  float R = ${o.thick};
  float x = clamp(-d / R, 0.0, 1.0);
  float h = sqrt(max(1.0 - (1.0 - x) * (1.0 - x), 0.0));
  vec2 e = vec2(0.6, 0.0);
  vec2 g = vec2(map(p + e.xy) - map(p - e.xy), map(p + e.yx) - map(p - e.yx)) / 1.2;
  g.y = -g.y;
  float t = uT * (1.0 + uFlow * 2.2);
  // the surface itself is never quite still: slow swells move across it, faster while the metal is moving
  vec2 sw = vec2(vnoise(p * 0.035 + vec2(t * 0.3, 0.0)), vnoise(p * 0.035 + vec2(4.1, t * 0.27))) - 0.5;
  vec2 sl = g * (1.0 - x) / max(h, 0.1) + sw * (0.16 + 0.3 * uFlow) * (0.4 + 0.6 * h);
  ${o.warp ?? ""}
  // red, green and blue bend by slightly different amounts: a fine rainbow where the surface turns steeply
  vec3 c;
  for (int j = 0; j < 3; j++) {
    float f = 1.0 + (float(j) - 1.0) * 0.07;
    vec3 nn = normalize(vec3(sl * f, 1.0));
    vec3 rr = reflect(normalize(vec3(0.0, 0.1, -1.0)), nn);
    float v = envL(rr, t);
    if (j == 0) c.r = v; else if (j == 1) c.g = v; else c.b = v;
  }
  vec3 n = normalize(vec3(sl, 1.0));
  vec3 r = reflect(normalize(vec3(0.0, 0.1, -1.0)), n);
  c *= mix(vec3(1.0, 0.93, 0.84), vec3(0.94, 0.95, 1.0), smoothstep(-0.25, 0.3, r.y));
  float fres = pow(1.0 - n.z, 2.0);
  c += fres * 0.1;
  c *= 0.62 + 0.38 * smoothstep(0.0, 0.14, x);
  ${o.extra ?? ""}
  gl_FragColor = vec4(c * a, a + sh * (1.0 - a));
}`;
const within = (host: HTMLElement, el: Element, pad = 0) => { const s = host.getBoundingClientRect(), b = el.getBoundingClientRect(), k = s.width / (host.offsetWidth || 1); return { l: (b.left - s.left) / k - pad, t: (b.top - s.top) / k - pad, r: (b.right - s.left) / k + pad, b: (b.bottom - s.top) / k + pad }; };
/** Fit a canvas over just the part of `host` that `area` covers (both in host px), so only those pixels are shaded. */
function fitCanvas(cv: HTMLCanvasElement, host: HTMLElement, area: { l: number; t: number; r: number; b: number }) {
  const k = host.getBoundingClientRect().width / (host.offsetWidth || 1);
  const l = Math.max(0, Math.floor(area.l)), t = Math.max(0, Math.floor(area.t));
  const w = Math.min(host.offsetWidth, Math.ceil(area.r)) - l, h = Math.min(host.offsetHeight, Math.ceil(area.b)) - t;
  const dpr = Math.min(2, window.devicePixelRatio || 1) * k;
  Object.assign(cv.style, { left: `${l}px`, top: `${t}px`, width: `${w}px`, height: `${h}px` });
  cv.width = Math.max(1, Math.round(w * dpr)); cv.height = Math.max(1, Math.round(h * dpr));
  return { dpr, off: [l, t] as const };
}
/** Compile the shader into a WebGL canvas. Returns null where WebGL isn't available. */
function glSetup(cv: HTMLCanvasElement, frag: string) {
  const g = cv.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!g) return null;
  const mk = (type: number, src: string) => { const s = g.createShader(type)!; g.shaderSource(s, src); g.compileShader(s); if (!g.getShaderParameter(s, g.COMPILE_STATUS)) console.warn(g.getShaderInfoLog(s)); return s; };
  const pr = g.createProgram()!;
  g.attachShader(pr, mk(g.VERTEX_SHADER, VERT)); g.attachShader(pr, mk(g.FRAGMENT_SHADER, frag)); g.linkProgram(pr);
  if (!g.getProgramParameter(pr, g.LINK_STATUS)) return null;
  g.useProgram(pr);
  const b = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, b);
  g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
  const loc = g.getAttribLocation(pr, "p"); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
  const U = (n: string) => g.getUniformLocation(pr, n);
  return { g, U };
}

const FRAG = chrome({
  uniforms: "uniform vec4 uCh; uniform float uFront, uHeat, uRip, uWave;",
  thick: "11.0",
  shadow: [0, 2, 2.5, 0.35],
  map: `
// the channel the metal fills (centre x, centre y, half width, half height), and the molten front
float frontAt(float y){
  float cy = uCh.y, hh = uCh.w;
  float q = (y - cy) / hh;
  // a meniscus that bulges forward in the middle, and shivers while it flows
  return uFront + 7.0 * (1.0 - q * q) + uWave * (1.6 * sin(y * 0.42 + uT * 11.0) + 1.1 * sin(y * 0.19 - uT * 7.0));
}
float map(vec2 p){
  float body = sdRound(p, uCh.xy, uCh.zw, uCh.w);
  return smax(body, p.x - frontAt(p.y), 7.0);
}`,
  outside: `
  // the heat the molten front throws onto the groove ahead of it
  if (a <= 0.0) {
    float ahead = p.x - frontAt(p.y);
    float inCh = 1.0 - smoothstep(-2.0, 6.0, sdRound(p, uCh.xy, uCh.zw + 2.0, uCh.w + 2.0));
    float gl = exp(-max(ahead, 0.0) / 14.0) * uHeat * inCh * step(0.0, ahead) * 0.55;
    vec3 hc = vec3(1.0, 0.42, 0.1) * gl;
    gl_FragColor = vec4(hc, max(sh, gl * 0.9));
    return;
  }`,
  warp: `
  // once it sets, a single ripple runs the length of the bar
  float ph = (p.x - (uCh.x - uCh.z)) - uRip * (uCh.z * 2.0 + 80.0) + 40.0;
  float wv = exp(-pow(ph / 16.0, 2.0)) * (1.0 - uRip);
  sl.x += -ph / 16.0 * wv * 1.1;`,
  extra: `
  // molten near the front: glowing white-orange at the lip, cooling through orange and red into chrome behind it;
  // the cooling skin breaks into slowly turning cells, as molten metal does
  float behind = frontAt(p.y) - p.x;
  float cells = vnoise(p * 0.045 + vec2(uT * 0.5, -uT * 0.3)) * 0.65 + vnoise(p * 0.1 - vec2(uT * 0.7, 0.0)) * 0.35;
  float heat = exp(-behind / 70.0) * uHeat * (0.75 + 0.5 * cells);
  heat = clamp(heat, 0.0, 1.0);
  vec3 hot = mix(vec3(0.75, 0.12, 0.02), mix(vec3(1.0, 0.45, 0.08), vec3(1.0, 0.9, 0.62), smoothstep(0.55, 1.0, heat)), smoothstep(0.15, 0.6, heat));
  c = mix(c, hot * (0.5 + 0.9 * heat) + c * 0.18, smoothstep(0.05, 0.7, heat));`,
});

type Phase = "idle" | "pouring" | "set" | "done" | "draining";

export interface MoltenHoldProps {
  /** plays its own sounds (a thump as the metal starts to run, a sizzle that follows the front, a drain if you let go early, and a thunk, a hiss of steam and a ring of chrome when it sets). They follow the site-wide sound switch */
  enableSound?: boolean;
  /** loudness of the sounds, 0 to 1 */
  volume?: number;
  /** the words on the bar before it is held */
  label?: string;
  /** the words pressed into the metal once the hold is complete */
  doneLabel?: string;
  /** seconds of holding it takes to fill the channel */
  duration?: number;
  /** holds and lets go by itself until the first touch */
  autoplay?: boolean;
  /** called once, when the channel is full */
  onConfirm?: () => void;
}

/**
 * MoltenHold: hold to confirm, by pouring molten metal.
 *
 * Press and hold and metal starts to pour into the button's channel from the left: slowly at first, then steadily.
 * The front is a glowing meniscus that bulges forward and shivers as it runs, white-orange at the lip and throwing
 * its heat onto the groove ahead. Behind it the metal cools: orange, then dull red, then set chrome, its skin breaking
 * into slowly turning cells as it goes. Let go too soon and it drains back. Hold to the end and the bar is full; the
 * last of the glow fades, a single ripple runs the length of the solid chrome, and the label, which the metal has
 * been rising over all along, is now pressed into it.
 *
 * `label`, `doneLabel`, `duration` (seconds to fill), `onConfirm`. Space or Enter held works the same. `autoplay`
 * shows a short hold and a full one until the first real press. Reduced motion fills without the heat.
 */
export function MoltenHold({ label = "Hold to publish", doneLabel = "Published", duration = 1.8, autoplay = false, enableSound = true, volume = 0.8, onConfirm }: MoltenHoldProps) {
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const chan = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  const lit = useRef<HTMLSpanElement>(null);
  const dim = useRef<HTMLSpanElement>(null);
  const holding = useRef(false);
  const touched = useRef(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  useLayoutEffect(() => { phaseRef.current = phase; }, [phase]);
  const [gl, setGl] = useState(true);
  const fillRef = useRef(0);
  const [fallback, setFallback] = useState(0);
  const autoSoundOk = useAutoplaySoundAllowed();
  const soundCfg = useRef({ enableSound, volume, autoSoundOk });
  useLayoutEffect(() => { soundCfg.current = { enableSound, volume, autoSoundOk }; }, [enableSound, volume, autoSoundOk]);
  // Sound plays when asked for and the site-wide switch is on. A demo playing itself makes sound only where demos may, once the visitor has used the page.
  const sound = (name: MoltenHoldSound, arg?: number) => {
    const c = soundCfg.current;
    if (!c.enableSound) return;
    if (!touched.current && !(c.autoSoundOk && audioAwake())) return;
    playDef(`molten-hold:${name}`, moltenHoldSound(name, arg), Math.min(1, Math.max(0, c.volume)));
  };

  useEffect(() => {
    const cv = cvs.current, st = wrap.current; if (!cv || !st) return;
    const w = glSetup(cv, FRAG);
    if (!w) { setGl(false); }
    const { g, U } = w ?? { g: null as unknown as WebGLRenderingContext, U: () => null };
    const uRes = U("uRes"), uDpr = U("uDpr"), uT = U("uT"), uFlow = U("uFlow"), uCh = U("uCh"), uFront = U("uFront"), uHeat = U("uHeat"), uRip = U("uRip"), uWave = U("uWave");
    let dpr = 1, off: readonly [number, number] = [0, 0];
    const uOff = U("uOff");
    // the canvas covers just the button, plus room for the heat it throws
    const size = () => {
      if (!chan.current) return;
      const f = fitCanvas(cv, st, within(st, chan.current, 8));
      dpr = f.dpr; off = f.off;
      if (g) g.viewport(0, 0, cv.width, cv.height);
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(st);
    let raf = 0, last = performance.now(), time = 1, fill = 0, speed = 0, heat = 0, rip = 1, wave = 0, setAt = 0, grain = 0;
    const set = (p: Phase) => { phaseRef.current = p; setPhase(p); };
    const draw = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000); last = now;
      const ph = phaseRef.current;
      if (holding.current && (ph === "idle" || ph === "pouring" || ph === "draining")) {
        if (ph !== "pouring") { set("pouring"); sound("ignite"); }
        // the pour gathers pace, like a crucible tipping
        speed += (1 / duration * 1.12 - speed) * Math.min(1, dt * 3.2);
        fill = Math.min(1, fill + speed * dt);
        heat += (1 - heat) * Math.min(1, dt * 6);
        // the sizzle follows the front: grains come closer together, and brighter, as the channel fills
        grain += dt;
        if (grain > 0.08 - 0.045 * fill) { grain = 0; sound("grain", fill); }
        if (fill >= 1) { set("set"); sound("set"); setAt = now; onConfirm?.(); }
      } else if (ph === "pouring" || ph === "draining") {
        if (ph !== "draining") { set("draining"); if (fill > 0.04) sound("drain", fill); }
        speed = 0;
        fill = Math.max(0, fill - dt * (0.9 + fill * 0.8));
        heat *= Math.exp(-dt * 1.2);
        if (fill <= 0) { set("idle"); heat = 0; }
      } else if (ph === "set") {
        heat *= Math.exp(-dt * 2.2);
        rip = Math.min(1, (now - setAt) / 1100 - 0.45);
        if (now - setAt > 1500) { set("done"); }
      } else if (ph === "done") {
        rip = 1;
      }
      if (reduce) heat = 0;
      const moving = ph === "pouring" || ph === "draining" ? 1 : 0;
      wave += (moving - wave) * Math.min(1, dt * 5);
      time += dt;
      fillRef.current = fill;
      const sr = st.getBoundingClientRect(), k = sr.width / (st.offsetWidth || 1), cr = chan.current!.getBoundingClientRect();
      const cx = (cr.left + cr.width / 2 - sr.left) / k, cy = (cr.top + cr.height / 2 - sr.top) / k, hw = cr.width / k / 2 - 5, hh = cr.height / k / 2 - 5;
      const x0 = cx - hw - 12, front = x0 + fill * (hw * 2 + 22);
      // the label above the metal reads as pressed into it; the rest stays a plain label on the groove
      const pct = Math.max(0, Math.min(100, ((front - (cx - hw - 5)) / (hw * 2 + 10)) * 100));
      lit.current?.style.setProperty("clip-path", `inset(0 ${100 - pct}% 0 0)`);
      dim.current?.style.setProperty("clip-path", `inset(0 0 0 ${pct}%)`);
      if (g) {
        g.clearColor(0, 0, 0, 0); g.clear(g.COLOR_BUFFER_BIT);
        g.uniform2f(uRes, cv.width, cv.height); g.uniform2f(uOff, off[0], off[1]); g.uniform1f(uDpr, dpr); g.uniform1f(uT, time); g.uniform1f(uFlow, wave * 0.4);
        g.uniform4f(uCh, cx, cy, hw, hh); g.uniform1f(uFront, fill > 0.001 ? front : -1000); g.uniform1f(uHeat, heat); g.uniform1f(uRip, Math.max(0, rip)); g.uniform1f(uWave, wave);
        g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
      } else setFallback(fill);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, duration]);

  const reset = () => { holding.current = false; phaseRef.current = "draining"; setPhase("draining"); };
  const press = (v: boolean, real = true) => {
    if (real) touched.current = true;
    if (v && phaseRef.current === "done") { sound("undo"); reset(); return; }
    holding.current = v;
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    let live = true;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      await sleep(1200);
      while (live && !touched.current) {
        press(true, false); await sleep(800); press(false, false); await sleep(1500); if (!live || touched.current) break;
        press(true, false); await sleep(duration * 1000 + 600); press(false, false); await sleep(2600); if (!live || touched.current) break;
        reset(); await sleep(1800);
      }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const done = phase === "done" || phase === "set";
  const hint = phase === "idle" ? "Press and hold" : phase === "pouring" ? "Keep holding" : phase === "draining" ? "Let go too soon" : phase === "set" ? "Setting" : "Press again to undo";

  return (
    <div ref={wrap} className="relative grid w-full max-w-[560px] select-none place-items-center gap-4 rounded-[28px] bg-[radial-gradient(120%_90%_at_50%_0%,#262628_0%,#141415_60%,#0c0c0d_100%)] px-6 py-12" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" }}>
      <button
        type="button"
        aria-label={done ? `${doneLabel}. Press to undo` : label}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); press(true); }}
        onPointerUp={() => press(false)}
        onPointerCancel={() => press(false)}
        onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); press(true); } }}
        onKeyUp={(e) => { if (e.key === " " || e.key === "Enter") press(false); }}
        onContextMenu={(e) => e.preventDefault()}
        className="relative h-[68px] w-full max-w-[320px] touch-none rounded-[24px] p-[5px] outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        style={{ background: "linear-gradient(180deg,#1d1d20,#141416)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px #050506, 0 16px 34px -18px rgba(0,0,0,.9)" }}
      >
        <div ref={chan} className="relative h-full w-full rounded-[19px]" style={{ background: "#09090a", boxShadow: "inset 0 2px 6px rgba(0,0,0,.9), inset 0 -1px 0 rgba(255,255,255,.05)" }}>
          {!gl && <div aria-hidden className="absolute inset-y-0 left-0 rounded-[19px]" style={{ width: `${fallback * 100}%`, background: "linear-gradient(180deg,#f2f3f8,#9a9eb0 55%,#5b5e6b)" }} />}
          <span className="absolute inset-0 z-[2] grid place-items-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={done ? "d" : "l"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }} className="relative block">
                <span ref={dim} className="flex items-center gap-1.5 text-[16px] font-semibold tracking-[-0.01em] text-white/55">{done ? doneLabel : label}</span>
                {/* the same words, pressed into the metal as it rises under them */}
                <span ref={lit} aria-hidden className="absolute inset-0 flex items-center gap-1.5 text-[16px] font-semibold tracking-[-0.01em]" style={{ color: "rgba(20,20,24,.62)", textShadow: "0 1px 0 rgba(255,255,255,.45), 0 -1px 0 rgba(0,0,0,.25)" }}>{done ? doneLabel : label}</span>
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
      </button>
      <p className="m-0 text-[12.5px] text-white/55" aria-live="polite">{hint}</p>
      <canvas ref={cvs} aria-hidden className="pointer-events-none absolute" style={{ display: gl ? "block" : "none", zIndex: 1 }} />
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
