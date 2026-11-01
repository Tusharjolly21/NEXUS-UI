# Mercury Upload

Add the "Mercury Upload" component from Nexus UI to my project.

A file upload that pours the file in as mercury. A bead swells under the file's chip, stretches on a thinning neck and falls, lengthening as it speeds up, then merges into the pool below with ripples running off both ways. Drop by drop the pool spreads from the middle of the channel, which is the progress. When the last drop is in, the whole pool pulls itself together into a single bead and a check is pressed into it. Real file picker and drag and drop; wire progress to your upload. Until you touch it, it uploads a sample file by itself.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { MercuryUpload } from "@/components/mercury-upload";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/mercury-upload/index.ts ---

```ts
export { MercuryUpload } from "./mercury-upload";
export type { MercuryUploadProps } from "./mercury-upload";
```

--- components/mercury-upload/mercury-upload-sound.ts ---

```ts
/**
 * Mercury Upload's sounds, made with the Web Audio API (no audio files), scored to the pour.
 *
 *   catch   a soft thock as the file arrives
 *   drip    a tick as a bead lets go under the chip
 *   plop    the bead landing in the pool: a bubble, with a ripple running off after it. Its pitch rises with the pool
 *           (`arg`, 0 to 1), the way a bottle rings higher as it fills, so you can hear the progress
 *   pull    the pool gathering itself into one bead: a rising swell of air and a low note drawing in
 *   done    a thunk as the bead settles and a ring of chrome as the check is pressed into it
 */
import { hiss, tone, type SoundDef } from "@/lib/ui-sounds";

type Out = AudioNode;

/** Chrome ringing: a note with the odd overtones of struck metal. */
function ring(c: AudioContext, o: Out, freq: number, at: number, gain: number, decay = 0.9) {
  tone(c, o, { freq, at, attack: 0.002, decay, gain });
  tone(c, o, { freq: freq * 2.76, at, attack: 0.001, decay: decay * 0.5, gain: gain * 0.5 });
  tone(c, o, { freq: freq * 5.4, at, attack: 0.001, decay: decay * 0.25, gain: gain * 0.25 });
}

export type MercuryUploadSound = "catch" | "drip" | "plop" | "pull" | "done";

export function mercuryUploadSound(name: MercuryUploadSound, arg = 0): SoundDef {
  switch (name) {
    case "catch":
      return {
        category: "Mercury Upload",
        label: "Catch",
        play: (c, o) => {
          tone(c, o, { freq: 220, to: 150, glide: 0.05, attack: 0.003, decay: 0.09, gain: 0.12 });
          hiss(c, o, { filter: "highpass", freq: 5000, decay: 0.012, gain: 0.04 });
        },
      };
    case "drip":
      return {
        category: "Mercury Upload",
        label: "Drip",
        play: (c, o) => {
          hiss(c, o, { filter: "highpass", freq: 6000, decay: 0.01, gain: 0.03 });
          tone(c, o, { freq: 900, to: 1400, glide: 0.02, attack: 0.002, decay: 0.04, gain: 0.05 });
        },
      };
    case "plop": {
      const base = 300 + arg * 500;
      return {
        category: "Mercury Upload",
        label: "Plop",
        play: (c, o) => {
          tone(c, o, { freq: base, to: base * 2.1, glide: 0.05, attack: 0.003, decay: 0.12, gain: 0.13 });
          tone(c, o, { freq: base * 4.2, at: 0.01, attack: 0.002, decay: 0.05, gain: 0.03 });
          tone(c, o, { freq: base * 1.2, to: base * 2.4, glide: 0.05, at: 0.09, attack: 0.003, decay: 0.09, gain: 0.05 });
          ring(c, o, 1500 + arg * 900, 0.02, 0.03, 0.2);
        },
      };
    }
    case "pull":
      return {
        category: "Mercury Upload",
        label: "Pull together",
        play: (c, o) => {
          hiss(c, o, { filter: "bandpass", freq: 300, to: 2200, attack: 0.3, decay: 0.3, gain: 0.05, q: 0.8 });
          tone(c, o, { freq: 160, to: 420, glide: 0.4, attack: 0.1, decay: 0.3, gain: 0.12 });
          tone(c, o, { freq: 190, to: 130, glide: 0.06, at: 0.5, attack: 0.003, decay: 0.12, gain: 0.1 });
        },
      };
    case "done":
      return {
        category: "Mercury Upload",
        label: "Done",
        play: (c, o) => {
          tone(c, o, { freq: 140, to: 90, glide: 0.08, attack: 0.003, decay: 0.2, gain: 0.15 });
          ring(c, o, 1568, 0.02, 0.12, 0.9);
          ring(c, o, 2093, 0.12, 0.08, 0.7);
        },
      };
  }
}
```

--- components/mercury-upload/mercury-upload.tsx ---

```tsx
"use client";

import { useEffect, useLayoutEffect, useRef, useState, type DragEvent as RDragEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { audioAwake, playDef, useAutoplaySoundAllowed } from "@/lib/ui-sounds";
import { mercuryUploadSound, type MercuryUploadSound } from "./mercury-upload-sound";

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
  uniforms: "uniform vec4 uPool; uniform vec3 uHang; uniform vec4 uDrop[6]; uniform vec2 uRip[4];",
  thick: "8.0",
  shadow: [0, 3, 3, 0.45],
  map: `
float map(vec2 p){
  // the pool in the channel: a stadium that spreads from the middle, or a single bead once it has pulled together
  float d = uPool.w > 0.5 ? sdRound(p, uPool.xy, vec2(uPool.z + uPool.w, uPool.w), uPool.w) : 1e5;
  // the bead hanging from the file, and the drops falling from it; they neck as they part and merge as they land
  if (uHang.z > 0.3) d = min(d, length(p - uHang.xy) - uHang.z);
  for (int i = 0; i < 6; i++) {
    vec4 q = uDrop[i];
    if (q.z > 0.1) {
      float e = sdE(p, q);
      float kh = 5.0 * (1.0 - smoothstep(4.0, 22.0, q.y - uHang.y));
      d = smin(d, e, max(kh, 4.0 * (1.0 - smoothstep(0.0, 14.0, uPool.y - q.y))) + 0.01);
    }
  }
  return d;
}`,
  warp: `
  // every drop that lands sends ripples running both ways along the pool
  for (int i = 0; i < 4; i++) {
    vec2 r0 = uRip[i];
    if (r0.y >= 0.0 && r0.y < 1.0) {
      float dx = p.x - r0.x, s0 = sign(dx);
      float ph = abs(dx) - r0.y * 150.0;
      float wv = exp(-ph * ph / 40.0) * (1.0 - r0.y) * exp(-abs(p.y - uPool.y) / 12.0);
      sl.x += s0 * -ph / 6.0 * wv * 0.7;
    }
  }`,
});

type Phase = "idle" | "uploading" | "pulling" | "done";
interface Drop { x: number; y: number; vy: number; r: number; on: boolean }

export interface MercuryUploadProps {
  /** plays its own sounds (a thock as the file arrives, a tick as each bead lets go, a bubble as it lands that rises in pitch as the pool fills, a swell as the pool pulls together and a ring of chrome when it is done). They follow the site-wide sound switch */
  enableSound?: boolean;
  /** loudness of the sounds, 0 to 1 */
  volume?: number;
  /** uploads a sample file by itself until the first touch */
  autoplay?: boolean;
  /** called with the file the moment one is chosen or dropped */
  onUpload?: (file: File) => void;
  /** real progress from 0 to 1; leave it out and the pour runs on its own timing */
  progress?: number;
}

/**
 * MercuryUpload: a file upload that pours the file in as mercury.
 *
 * Choose or drop a file and its chip hangs above an empty channel. A bead of liquid metal swells under the chip,
 * stretches on a thinning neck, lets go and falls; the drop lengthens as it speeds up and, on landing, merges into
 * the pool below with a ripple that runs off both ways. Drop by drop the pool spreads from the middle of the channel
 * outward, which is the progress. When the last drop lands the whole pool draws itself together into a single round
 * bead, overshooting and settling, and a check is pressed into it.
 *
 * `onUpload(file)` fires when a file is chosen; the progress is simulated here (wire `progress` to your real upload
 * to drive it yourself, 0 to 1). `autoplay` uploads a sample file until the first real interaction. Reduced motion
 * fills the channel without the drops.
 */
export function MercuryUpload({ autoplay = false, enableSound = true, volume = 0.8, onUpload, progress }: MercuryUploadProps) {
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const chan = useRef<HTMLDivElement>(null);
  const chip = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const touched = useRef(false);
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  useLayoutEffect(() => { phaseRef.current = phase; }, [phase]);
  const prog = useRef(0);
  const ext = useRef<number | undefined>(progress);
  useLayoutEffect(() => { ext.current = progress; }, [progress]);
  const [pct, setPct] = useState(0);
  const [gl, setGl] = useState(true);
  const [over, setOver] = useState(false);
  const autoSoundOk = useAutoplaySoundAllowed();
  const soundCfg = useRef({ enableSound, volume, autoSoundOk });
  useLayoutEffect(() => { soundCfg.current = { enableSound, volume, autoSoundOk }; }, [enableSound, volume, autoSoundOk]);
  // Sound plays when asked for and the site-wide switch is on. A demo playing itself makes sound only where demos may, once the visitor has used the page.
  const sound = (name: MercuryUploadSound, arg?: number) => {
    const c = soundCfg.current;
    if (!c.enableSound) return;
    if (!touched.current && !(c.autoSoundOk && audioAwake())) return;
    playDef(`mercury-upload:${name}`, mercuryUploadSound(name, arg), Math.min(1, Math.max(0, c.volume)));
  };

  const begin = (name: string, bytes: number) => {
    const size = bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`;
    setFile({ name, size }); prog.current = 0; setPct(0); phaseRef.current = "uploading"; setPhase("uploading"); sound("catch");
  };
  const reset = () => { setFile(null); prog.current = 0; setPct(0); phaseRef.current = "idle"; setPhase("idle"); };

  useEffect(() => {
    const cv = cvs.current, st = wrap.current; if (!cv || !st) return;
    const w = glSetup(cv, FRAG);
    if (!w) setGl(false);
    const { g, U } = w ?? { g: null as unknown as WebGLRenderingContext, U: () => null };
    const uRes = U("uRes"), uDpr = U("uDpr"), uT = U("uT"), uFlow = U("uFlow"), uPool = U("uPool"), uHang = U("uHang"), uDrop = U("uDrop"), uRip = U("uRip");
    let dpr = 1, off: readonly [number, number] = [0, 0];
    const uOff = U("uOff");
    // the canvas covers the channel and the drop's path down from the chip: a narrow column and a strip
    const size = () => {
      if (!chan.current) return;
      const c = within(st, chan.current, 12);
      const f = fitCanvas(cv, st, { l: c.l, t: 40, r: c.r, b: c.b + 6 });
      dpr = f.dpr; off = f.off;
      if (g) g.viewport(0, 0, cv.width, cv.height);
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(st);
    const drops: Drop[] = [];
    const rips: { x: number; age: number }[] = [];
    let raf = 0, last = performance.now(), time = 1, hang = 0, shown = 0, half = 0, rad = 0, vHalf = 0, vRad = 0, pulled = 0, flow = 0;
    const D = new Float32Array(24), R = new Float32Array(8);
    const draw = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000); last = now;
      const sr = st.getBoundingClientRect(), k = sr.width / (st.offsetWidth || 1);
      const cr = chan.current!.getBoundingClientRect(), hr = chip.current?.getBoundingClientRect();
      const cx = (cr.left + cr.width / 2 - sr.left) / k, cy = (cr.top + cr.height / 2 - sr.top) / k, hw = cr.width / k / 2 - 4;
      const r0 = cr.height / k / 2 - 4;
      const sx = cx, sy = hr ? (hr.bottom - sr.top) / k + 1 : cy - 80;
      const ph = phaseRef.current;
      // the upload itself: yours if you pass `progress`, otherwise a believable one with pauses
      if (ph === "uploading") {
        if (ext.current !== undefined) prog.current = Math.max(prog.current, Math.min(1, ext.current));
        else prog.current = Math.min(1, prog.current + dt * (0.12 + 0.22 * Math.max(0, Math.sin(now / 420)) + 0.06 * Math.sin(now / 130)));
        setPct(Math.round(prog.current * 100));
      }
      // the pool follows what has actually landed, not the progress: it only grows when a drop arrives
      if (ph === "uploading" && !reduce) {
        // a bead swells under the chip; when it is heavy enough it falls, and another begins
        const owed = prog.current - shown;
        hang = Math.min(1, hang + dt * (owed > 0.02 ? 3.4 : 0.6));
        if (hang >= 1 && owed > 0.02 && drops.filter((d) => d.on).length < 6) {
          drops.push({ x: sx + (Math.random() - 0.5) * 1.5, y: sy + 9, vy: 20, r: 6, on: true });
          sound("drip");
          hang = 0.15;
        }
      } else hang = Math.max(0, hang - dt * 3);
      if (reduce && ph === "uploading") shown = prog.current;
      for (const d of drops) {
        if (!d.on) continue;
        d.vy += 1500 * dt; d.y += d.vy * dt;
        // it lands in the pool: what it carried is added, and a ripple runs out
        const surf = cy - (half > 0 || rad > 0.5 ? rad : -r0);
        if (d.y > surf - 2) {
          d.on = false;
          shown = Math.min(prog.current, shown + 0.075 + Math.random() * 0.03);
          sound("plop", shown);
          rips.push({ x: d.x, age: 0 }); if (rips.length > 4) rips.shift();
        }
      }
      for (let i = drops.length - 1; i >= 0; i--) if (!drops[i].on) drops.splice(i, 1);
      for (const r of rips) r.age += dt / 0.9;
      // when the last drop is in, the pool pulls itself together into one bead
      if (ph === "uploading" && prog.current >= 1 && (shown >= 0.999 || reduce) && !drops.length) { shown = 1; phaseRef.current = "pulling"; setPhase("pulling"); pulled = now; sound("pull"); }
      // the last sliver is too small to be worth a drop: the pool just takes it, so it can never wait on a bead that has stopped growing
      if (ph === "uploading" && prog.current >= 1 && shown < 1 && !drops.length && prog.current - shown <= 0.02) shown = Math.min(1, shown + 0.08);
      const wantHalf = ph === "pulling" || ph === "done" ? 0 : shown * hw - r0;
      const wantRad = ph === "pulling" || ph === "done" ? r0 * 2.1 : shown > 0.001 ? r0 : 0;
      if (ph === "pulling" || ph === "done") {
        vHalf += ((wantHalf - half) * 60 - vHalf * 9) * dt; half += vHalf * dt;
        vRad += ((wantRad - rad) * 170 - vRad * 11) * dt; rad += vRad * dt;
        if (ph === "pulling" && now - pulled > 1100) { phaseRef.current = "done"; setPhase("done"); sound("done"); }
      } else {
        half += (Math.max(0, wantHalf) - half) * Math.min(1, dt * 7); vHalf = 0;
        rad += (wantRad - rad) * Math.min(1, dt * 9); vRad = 0;
      }
      if (ph === "idle") { shown = 0; drops.length = 0; }
      flow += ((drops.length || ph === "pulling" ? 1 : 0) - flow) * Math.min(1, dt * 4);
      time += dt;
      if (g) {
        D.fill(0); drops.slice(0, 6).forEach((d, i) => { const st2 = Math.min(1.7, 1 + d.vy / 900); D.set([d.x, d.y, d.r / Math.sqrt(st2), d.r * st2], i * 4); });
        R.fill(-1); rips.forEach((r, i) => R.set([r.x, r.age], i * 2));
        g.clearColor(0, 0, 0, 0); g.clear(g.COLOR_BUFFER_BIT);
        g.uniform2f(uRes, cv.width, cv.height); g.uniform2f(uOff, off[0], off[1]); g.uniform1f(uDpr, dpr); g.uniform1f(uT, time); g.uniform1f(uFlow, flow * 0.5);
        g.uniform4f(uPool, cx, cy, Math.max(0, half), Math.max(0, rad));
        g.uniform3f(uHang, sx, sy + 1 + hang * 4.5, ph === "uploading" ? 2 + hang * 4.5 : 0);
        g.uniform4fv(uDrop, D); g.uniform2fv(uRip, R);
        // only two parts of the canvas ever hold metal: the channel, and the column the drops fall down
        g.enable(g.SCISSOR_TEST);
        const px = (v: number) => Math.round(v * dpr);
        const H = cv.height, chT = cy - r0 * 2.6 - 14 - off[1], chB = cy + r0 * 2.6 + 12 - off[1];
        g.scissor(0, H - px(chB), cv.width, px(chB - chT)); g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
        if (ph === "uploading" || drops.length) { const colL = sx - 16 - off[0]; g.scissor(px(colL), H - px(chT), px(32), px(chT)); g.drawArrays(g.TRIANGLE_STRIP, 0, 4); }
        g.disable(g.SCISSOR_TEST);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [reduce]);

  useEffect(() => {
    if (!autoplay) return;
    let live = true;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      await sleep(900);
      while (live && !touched.current) {
        begin("Q3-board-deck.pdf", 4_200_000);
        while (live && phaseRef.current !== "done") await sleep(200);
        await sleep(2600); if (!live || touched.current) break;
        reset(); await sleep(1400);
      }
    })();
    return () => { live = false; };
    // begin and reset only touch refs and state setters, so the demo restarts only when autoplay changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const pick = (f?: File | null) => { if (!f) return; touched.current = true; onUpload?.(f); begin(f.name, f.size); };
  const drop = (e: RDragEvent) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0]); };
  const done = phase === "done";

  return (
    <div
      ref={wrap}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
      className="relative w-full max-w-[460px] select-none overflow-hidden rounded-[28px] bg-[radial-gradient(120%_90%_at_50%_0%,#262628_0%,#141415_60%,#0c0c0d_100%)] px-6 pb-7 pt-7 shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_0_0_1px_#050506]"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif", outline: over ? "2px dashed rgba(255,255,255,.25)" : "none", outlineOffset: -8 }}
    >
      <input ref={picker} type="file" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
      <div className="flex h-[112px] items-start justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          {file ? (
            <motion.div key="chip" ref={chip} initial={{ opacity: 0, y: -14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="relative z-[2] flex max-w-full items-center gap-3 rounded-[16px] px-3.5 py-2.5" style={{ background: "linear-gradient(180deg,#2a2a2e,#1c1c1f)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px #050506, 0 10px 24px -14px rgba(0,0,0,.9)" }}>
              <span className="grid h-9 w-8 shrink-0 place-items-center rounded-[7px] bg-white/[.07] text-[9.5px] font-bold tracking-wide text-white/60">{file.name.split(".").pop()?.slice(0, 4).toUpperCase()}</span>
              <span className="min-w-0">
                <span className="block max-w-[220px] truncate text-[14px] font-medium text-[#f2f2f5]">{file.name}</span>
                <span className="block text-[12px] tabular-nums text-white/55">{done ? `${file.size} · Uploaded` : phase === "pulling" ? "Finishing" : `${file.size} · ${pct}%`}</span>
              </span>
            </motion.div>
          ) : (
            <motion.button key="pick" type="button" onClick={() => { touched.current = true; picker.current?.click(); }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mt-3 rounded-full px-5 py-2.5 text-[14px] font-medium text-[#e9e9ee] outline-none ring-1 ring-white/15 transition-colors hover:bg-white/[.06] focus-visible:ring-2 focus-visible:ring-white/50">
              Choose a file, or drop one here
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <div className="relative mx-auto h-[26px] w-full max-w-[320px]">
        <div ref={chan} className="absolute inset-0 rounded-full" style={{ background: "#09090a", boxShadow: "inset 0 2px 5px rgba(0,0,0,.9), inset 0 -1px 0 rgba(255,255,255,.06), 0 1px 0 rgba(255,255,255,.03)" }}>
          {!gl && <div aria-hidden className="absolute inset-y-[4px] left-1/2 -translate-x-1/2 rounded-full transition-[width]" style={{ width: `${pct}%`, background: "linear-gradient(180deg,#f2f3f8,#9a9eb0 55%,#5b5e6b)" }} />}
        </div>
        <AnimatePresence>
          {done && (
            <motion.svg key="ok" className="absolute left-1/2 top-1/2 z-[2] h-[22px] w-[22px] -translate-x-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden>
              <motion.path d="M6 12.5 10.2 16.5 18 8" stroke="rgba(20,20,24,.6)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} style={{ filter: "drop-shadow(0 1px 0 rgba(255,255,255,.5))" }} />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-5 flex h-6 items-center justify-center" aria-live="polite">
        {done ? (
          <button type="button" onClick={() => { touched.current = true; reset(); }} className="rounded-full px-3 py-1 text-[12.5px] text-white/55 outline-none hover:text-white/85 focus-visible:ring-2 focus-visible:ring-white/40">Upload another</button>
        ) : (
          <p className="m-0 text-[12.5px] text-white/55">{phase === "idle" ? "Nothing uploaded yet" : phase === "pulling" ? "Pulling together" : "Pouring it in"}</p>
        )}
      </div>
      <canvas ref={cvs} aria-hidden className="pointer-events-none absolute z-[1]" style={{ display: gl ? "block" : "none" }} />
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
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen the first tap anywhere on the page
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

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  const touch = (navigator.maxTouchPoints ?? 0) > 0 || window.matchMedia?.("(pointer: coarse)").matches;
  if (!touch) return;
  const wake = () => {
    if (ctx && ctx.state === "running") return;
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
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```
