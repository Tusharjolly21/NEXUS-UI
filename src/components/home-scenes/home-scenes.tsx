"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import {
  type CSSProperties,
  type MouseEvent as RMouseEvent,
  type PointerEvent as RPointerEvent,
  type ReactNode,
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type HomeScenesProps = {
  /** time the Goodnight scene says it started */
  bedtime?: string;
  onSceneChange?: (scene: string, on: boolean) => void;
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
  lock: "M208 80h-32V56a48 48 0 0 0-96 0v24H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16M96 56a32 32 0 0 1 64 0v24H96Z",
  open: "M224 96v112a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16V96a16 16 0 0 1 16-16h32V56a48.05 48.05 0 0 1 48-48c23.2 0 43.32 16.15 47.84 38.41a8 8 0 0 1-15.68 3.18C157.2 35 143.37 24 128 24a32 32 0 0 0-32 32v24h112a16 16 0 0 1 16 16",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
  moon: "M233.54 142.23a8 8 0 0 0-8-2a88.08 88.08 0 0 1-109.8-109.8a8 8 0 0 0-10-10a104.84 104.84 0 0 0-52.91 37A104 104 0 0 0 136 224a103.1 103.1 0 0 0 62.52-20.88a104.84 104.84 0 0 0 37-52.91a8 8 0 0 0-1.98-7.98m-44.64 48.11A88 88 0 0 1 65.66 67.11a89 89 0 0 1 31.4-26A106 106 0 0 0 96 56a104.11 104.11 0 0 0 104 104a106 106 0 0 0 14.92-1.06a89 89 0 0 1-26.02 31.4",
  bulb: "M176 232a8 8 0 0 1-8 8H88a8 8 0 0 1 0-16h80a8 8 0 0 1 8 8m40-128a87.55 87.55 0 0 1-33.64 69.21A16.24 16.24 0 0 0 176 186v6a16 16 0 0 1-16 16H96a16 16 0 0 1-16-16v-6a16 16 0 0 0-6.23-12.66A87.59 87.59 0 0 1 40 104.49C39.74 56.83 78.26 17.14 125.88 16A88 88 0 0 1 216 104m-16 0a72 72 0 0 0-73.74-72c-39 .92-70.47 33.39-70.26 72.39a71.65 71.65 0 0 0 27.64 56.3A32 32 0 0 1 96 186v6h64v-6a32.15 32.15 0 0 1 12.47-25.35A71.65 71.65 0 0 0 200 104m-16.11-9.34a57.6 57.6 0 0 0-46.56-46.55a8 8 0 0 0-2.66 15.78c16.57 2.79 30.63 16.85 33.44 33.45A8 8 0 0 0 176 104a9 9 0 0 0 1.35-.11a8 8 0 0 0 6.54-9.23",
  sun: "M240 152h-40.45a74 74 0 0 0 .45-8a72 72 0 0 0-144 0a74 74 0 0 0 .45 8H16a8 8 0 0 0 0 16h224a8 8 0 0 0 0-16m-168-8a56 56 0 1 1 111.41 8H72.59a56 56 0 0 1-.59-8m144 56a8 8 0 0 1-8 8H48a8 8 0 0 1 0-16h160a8 8 0 0 1 8 8M72.84 43.58a8 8 0 0 1 14.32-7.16l8 16a8 8 0 0 1-14.32 7.16Zm-56 48.84a8 8 0 0 1 10.74-3.57l16 8a8 8 0 0 1-7.16 14.31l-16-8a8 8 0 0 1-3.58-10.74m192 15.16a8 8 0 0 1 3.58-10.73l16-8a8 8 0 1 1 7.16 14.31l-16 8a8 8 0 0 1-10.74-3.58m-48-55.16l8-16a8 8 0 0 1 14.32 7.16l-8 16a8 8 0 1 1-14.32-7.16",
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

type RGB = [number, number, number];
const hex = (h: string): RGB => [
  parseInt(h.slice(1, 3), 16) / 255,
  parseInt(h.slice(3, 5), 16) / 255,
  parseInt(h.slice(5, 7), 16) / 255,
];
const PAL = {
  lock: ["#1f6bff", "#57b4ff", "#a8dcff", "#3a46ff"].map(hex),
  night: ["#ffd76e", "#ff74d4", "#9a6bff", "#4f86ff"].map(hex),
  heat: ["#ffbf5c", "#ff6b3d", "#ff5fa8", "#ffd76e"].map(hex),
  room: ["#ff7ad9", "#a86bff", "#ffa46b", "#6b8cff"].map(hex),
};
const DUR = 1450;
/** the moment the ring has covered the whole card: contents swap here, hidden under the blur */
const PEAK = 0.6;

/* ------------------------------------------------------------------ the light: a small WebGL pass per card */

const VS = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FS = `precision mediump float;
uniform vec2 uRes;uniform vec2 uO;uniform float uR,uT,uK,uEdge,uAmb,uStar,uDpr;uniform vec3 uC0,uC1,uC2,uC3;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}
void main(){
  vec2 px=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y);
  vec2 dv=px-uO;
  float d=length(dv);
  float side=abs(dv.x)/max(d,1.);
  float ang=atan(dv.y,dv.x);
  float r=uR+(fbm(vec2(ang*2.2,uT*.5))-.5)*8.*uDpr;
  float s=d-r;
  // the travelling ring: a warm halo outside, a bright hairline, a blue band just inside
  vec3 warm=mix(uC0,uC1,smoothstep(.5,.97,side));
  vec3 cool=mix(uC3,uC2,smoothstep(.35,1.,side));
  float halo=exp(-max(s,0.)/(38.*uDpr))*smoothstep(-3.*uDpr,3.*uDpr,s);
  float line=exp(-abs(s)/(2.2*uDpr));
  float inner=exp(-max(-s,0.)/(20.*uDpr))*smoothstep(3.*uDpr,-3.*uDpr,s);
  float deep=smoothstep(3.*uDpr,-60.*uDpr,s);
  vec3 ring=(warm*halo*1.15+mix(warm,vec3(1.),.45)*line*.7+cool*inner*.9+cool*deep*.06)*uK;
  // light left at the card's edges afterwards: warm above, pink left, cool right, violet below
  float sc=min(34.*uDpr,min(uRes.x,uRes.y)*.16);
  float wob=.55+.45*fbm(px/(60.*uDpr)+vec2(uT*.18,-uT*.12));
  vec3 edge=(uC0*exp(-px.y/sc)+uC2*exp(-(uRes.y-px.y)/sc)*.8+uC1*exp(-px.x/sc)*.9+uC3*exp(-(uRes.x-px.x)/sc)*.8)*wob*(uEdge+uAmb);
  // stars, thicker inside the ring
  vec2 cell=floor(px/(1.5*uDpr));
  float tw=.5+.5*sin(uT*7.+h(cell+3.1)*40.);
  float star=step(.9962,h(cell))*tw*uStar*(s<0.?1.:.35);
  vec3 o=ring+edge+vec3(star)*.85;
  float a=clamp(max(o.r,max(o.g,o.b)),0.,1.);
  gl_FragColor=vec4(o,a);
}`;

type Frame = {
  r: number;
  k: number;
  edge: number;
  amb: number;
  star: number;
  ox: number;
  oy: number;
  t: number;
};

function makeGlow(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", {
    premultipliedAlpha: true,
    alpha: true,
    antialias: false,
  });
  if (!gl) return null;
  const sh = (t: number, s: string) => {
    const o = gl.createShader(t)!;
    gl.shaderSource(o, s);
    gl.compileShader(o);
    return o;
  };
  const pr = gl.createProgram()!;
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
  gl.useProgram(pr);
  const b = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n: string) => gl.getUniformLocation(pr, n);
  const u = {
    res: U("uRes"),
    o: U("uO"),
    r: U("uR"),
    t: U("uT"),
    k: U("uK"),
    edge: U("uEdge"),
    amb: U("uAmb"),
    star: U("uStar"),
    dpr: U("uDpr"),
    c: [U("uC0"), U("uC1"), U("uC2"), U("uC3")],
  };
  return {
    draw(f: Frame, pal: RGB[]) {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(u.res, w, h);
      gl.uniform2f(u.o, f.ox * dpr, f.oy * dpr);
      gl.uniform1f(u.r, f.r * dpr);
      gl.uniform1f(u.t, f.t);
      gl.uniform1f(u.k, f.k);
      gl.uniform1f(u.edge, f.edge);
      gl.uniform1f(u.amb, f.amb);
      gl.uniform1f(u.star, f.star);
      gl.uniform1f(u.dpr, dpr);
      pal.forEach((c, i) => gl.uniform3f(u.c[i], c[0], c[1], c[2]));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    clear() {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    },
    lose() {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

/* ------------------------------------------------------------------ a card that can send a distortion wave through itself */

type WaveHandle = { fire: (x: number, y: number) => void };
type WaveCardProps = {
  palette: RGB[];
  ambient?: boolean;
  reduce: boolean;
  radius: number;
  style?: CSSProperties;
  children: ReactNode;
  label: string;
};

const ss = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * The card's contents are drawn twice: a sharp copy, and a blurred, darkened copy that is only shown inside a circle.
 * A wave grows that circle from the press point out past the far corner while the light layer draws its rim, then the
 * blurred copy fades away to leave the new contents sharp.
 */
const WaveCard = forwardRef<WaveHandle, WaveCardProps>(function WaveCard(
  { palette, ambient = false, reduce, radius, style, children, label },
  ref,
) {
  const box = useRef<HTMLDivElement>(null);
  const sharp = useRef<HTMLDivElement>(null);
  const soft = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const st = useRef({
    start: -1,
    ox: 0.5,
    oy: 0.5,
    ambient,
    palette,
    visible: true,
  });
  const kick = useRef<() => void>(() => {});
  st.current.palette = palette;
  st.current.ambient = ambient;

  useImperativeHandle(ref, () => ({
    fire(x, y) {
      if (reduce) return;
      st.current.start = performance.now();
      st.current.ox = x;
      st.current.oy = y;
      kick.current();
    },
  }));
  useEffect(() => kick.current(), [ambient]);
  useEffect(() => {
    soft.current?.setAttribute("inert", "");
  }, []);

  useEffect(() => {
    if (reduce) return;
    let glow: ReturnType<typeof makeGlow> | undefined;
    let raf = 0;
    let running = false;
    let amb = st.current.ambient ? 1 : 0;
    let tick = 0;
    const t0 = performance.now();
    const io = new IntersectionObserver(([e]) => {
      st.current.visible = e.isIntersecting;
      if (e.isIntersecting) start();
    });
    if (box.current) io.observe(box.current);

    const frame = () => {
      const now = performance.now();
      const s = st.current;
      const p = s.start < 0 ? 1 : Math.min(1, (now - s.start) / DUR);
      const active = s.start >= 0 && p < 1;
      amb += ((s.ambient ? 1 : 0) - amb) * 0.03;
      const el = box.current;
      const W = el?.clientWidth ?? 1;
      const H = el?.clientHeight ?? 1;
      const ox = s.ox * W;
      const oy = s.oy * H;
      const far =
        Math.max(Math.hypot(ox, oy), Math.hypot(W - ox, oy), Math.hypot(ox, H - oy), Math.hypot(W - ox, H - oy)) + 36;

      // timeline: a breath of colour at the press, the ring sweeping out, then the blur clearing
      const q = Math.max(0, Math.min(1, (p - 0.07) / (PEAK - 0.07)));
      // mostly ease-out, so the dome rises quickly and slows as it reaches the far edge
      const grow = 0.35 * (q * q * (3 - 2 * q)) + 0.65 * (1 - (1 - q) ** 2.6);
      const r = active ? 4 + 22 * ss(0, 0.1, p) + grow * far : 0;
      const k = active ? ss(0.01, 0.12, p) * (1 - ss(PEAK - 0.08, PEAK + 0.04, p)) : 0;
      const edge = active ? ss(PEAK - 0.16, PEAK, p) * (1 - ss(PEAK + 0.04, 1, p) * 0.75) * 1.25 : 0;
      const star = active ? ss(0.01, 0.14, p) * (1 - ss(0.7, 1, p)) : amb * 0.12;
      const split = active ? ss(0, 0.12, p) * (1 - ss(0.66, 0.98, p)) : 0;
      const clear = active ? 1 - ss(PEAK, 0.93, p) : 0;

      const sh = sharp.current;
      const sf = soft.current;
      if (sh && sf) {
        if (active) {
          // a light red and blue fringe on the text, as if seen through a lens
          const a = (split * 1.15).toFixed(2);
          const o = (split * 0.55).toFixed(3);
          sh.style.textShadow =
            split > 0.01 ? `${a}px 0 0 rgba(255,70,120,${o}), -${a}px 0 0 rgba(70,170,255,${o})` : "none";
          if (p < PEAK) {
            const feather = 18;
            const m = `radial-gradient(circle at ${ox.toFixed(1)}px ${oy.toFixed(1)}px, #000 ${Math.max(0, r - feather).toFixed(1)}px, transparent ${r.toFixed(1)}px)`;
            if (sf.style.visibility !== "visible") sf.style.visibility = "visible";
            sf.style.opacity = "1";
            sf.style.webkitMaskImage = m;
            sf.style.maskImage = m;
          } else {
            if (sf.style.maskImage !== "none") {
              sf.style.webkitMaskImage = "none";
              sf.style.maskImage = "none";
            }
            sf.style.opacity = (clear * clear * (3 - 2 * clear)).toFixed(3);
          }
          el!.style.transform = `scale(${(1 + 0.01 * Math.sin(Math.PI * Math.min(1, p / 0.85))).toFixed(4)})`;
        } else if (sf.style.visibility !== "hidden") {
          sh.style.textShadow = "none";
          sf.style.visibility = "hidden";
          if (el) el.style.transform = "none";
        }
      }

      const lit = active || amb > 0.01;
      if (lit && glow === undefined && canvas.current) glow = makeGlow(canvas.current);
      tick++;
      if (glow && (active || tick % 2 === 0)) {
        if (lit)
          glow.draw(
            {
              r,
              k,
              edge: active ? edge : 0,
              amb: amb * (active ? Math.max(0, 1 - edge) : 1) * 0.42,
              star,
              ox,
              oy,
              t: (now - t0) / 1000,
            },
            s.palette,
          );
        else glow.clear();
      }
      if ((active || s.ambient || amb > 0.01) && s.visible) raf = requestAnimationFrame(frame);
      else running = false;
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    kick.current = start;
    start();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      glow?.lose();
    };
  }, [reduce]);

  return (
    <section
      ref={box}
      aria-label={label}
      style={{
        position: "relative",
        borderRadius: radius,
        background: "#1c1c1e",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
        overflow: "hidden",
        isolation: "isolate",
        ...style,
      }}
    >
      <div ref={sharp} style={{ position: "relative", zIndex: 1, height: "100%" }}>
        {children}
      </div>
      <div
        ref={soft}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          visibility: "hidden",
          pointerEvents: "none",
          background: "rgba(14,18,44,0.62)",
          borderRadius: radius,
          filter: "blur(12px) brightness(0.78)",
          willChange: "opacity",
        }}
      >
        {children}
      </div>
      {!reduce && (
        <canvas
          ref={canvas}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            mixBlendMode: "screen",
            zIndex: 3,
          }}
        />
      )}
    </section>
  );
});

/* ------------------------------------------------------------------ small pieces */

const Spinner = ({ size = 18, color = "rgba(255,255,255,0.85)" }: { size?: number; color?: string }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, ease: "linear", duration: 0.9 }}
    aria-hidden="true"
    style={{ display: "block", flex: "none" }}
  >
    <circle cx="10" cy="10" r="7.5" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.2" />
    <path d="M10 2.5a7.5 7.5 0 0 1 7.5 7.5" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </motion.svg>
);

function Roll({ text, reduce, style }: { text: string; reduce: boolean; style?: CSSProperties }) {
  const chars = [...text];
  const box = {
    display: "inline-block",
    height: "1.1em",
    lineHeight: 1.1,
    overflow: "hidden",
  } as const;
  return (
    <span
      aria-label={text}
      style={{
        display: "inline-flex",
        alignItems: "flex-end",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        const key = chars.length - i;
        if (!/\d/.test(ch))
          return (
            <span key={`s${key}${ch}`} aria-hidden="true" style={box}>
              {ch}
            </span>
          );
        return (
          <span key={`d${key}`} aria-hidden="true" style={{ ...box, position: "relative" }}>
            <motion.span
              initial={false}
              animate={{ y: `${-Number(ch) * 10}%` }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 180, damping: 24 }}
              style={{ display: "flex", flexDirection: "column" }}
            >
              {"0123456789".split("").map((d) => (
                <span key={d} style={{ height: "1.1em" }}>
                  {d}
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

const btn: CSSProperties = {
  width: "100%",
  height: 44,
  borderRadius: 999,
  border: 0,
  background: "#f2f2f4",
  color: "#1d1d1f",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};
const ring =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#5ea0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1e]";

/** where a click landed, as a fraction of the card it is in */
const originOf = (e: RMouseEvent | null, card: HTMLElement | null): [number, number] => {
  const t = e?.currentTarget as HTMLElement | undefined;
  if (t && typeof t.animate === "function" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    t.animate(
      [
        { transform: "scale(1)", filter: "brightness(1)" },
        {
          transform: "scale(1.035, 1.09)",
          filter: "brightness(1.18)",
          offset: 0.3,
        },
        { transform: "scale(1)", filter: "brightness(1)" },
      ],
      { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  if (!card) return [0.5, 0.5];
  const r = card.getBoundingClientRect();
  if (!e || (e.clientX === 0 && e.clientY === 0)) {
    const t = (e?.currentTarget as HTMLElement | undefined)?.getBoundingClientRect();
    if (!t) return [0.5, 0.8];
    return [(t.left + t.width / 2 - r.left) / r.width, (t.top + t.height / 2 - r.top) / r.height];
  }
  return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
};

/* ------------------------------------------------------------------ the dashboard */

const ARC_START = 135;
const ARC_SWEEP = 270;
const polar = (cx: number, cy: number, r: number, deg: number) => [
  cx + r * Math.cos((deg * Math.PI) / 180),
  cy + r * Math.sin((deg * Math.PI) / 180),
];
const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  return `M${x0} ${y0}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
};

type Lock = "unlocked" | "locking" | "locked";
type Heat = "hold" | "starting" | "boost";
const LIGHTS = [
  { name: "Ceiling", bright: 100, evening: 30 },
  { name: "Floor lamp", bright: 70, evening: 45 },
  { name: "Shelf strip", bright: 65, evening: 20 },
];

// prefers-reduced-motion as an external store: the server and the first client render agree on "no preference",
// then the real value is read right after hydration, so reduced-motion visitors don't get a hydration mismatch
const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReduce = (notify: () => void) => {
  const q = window.matchMedia(REDUCE_QUERY);
  q.addEventListener("change", notify);
  return () => q.removeEventListener("change", notify);
};
const getReduce = () => window.matchMedia(REDUCE_QUERY).matches;
const getReduceOnServer = () => false;

/**
 * A home dashboard where every change arrives as a wave of light. Run Goodnight, lock the door, boost the heating
 * or switch the living room to evening, and a soft aurora spreads through that card from where you pressed: the
 * contents blur, bend and split into colour as it passes, and the new state settles out of it sharp. Cards that are
 * left on keep a faint glow at their edges. Running Goodnight also locks the front door a moment later.
 */
export default function HomeScenes({
  bedtime = "10:42 PM",
  onSceneChange,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: HomeScenesProps) {
  const reduce = useSyncExternalStore(subscribeReduce, getReduce, getReduceOnServer);
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const touched = useRef(false);
  const wrap = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(true);
  const lockW = useRef<WaveHandle>(null);
  const nightW = useRef<WaveHandle>(null);
  const heatW = useRef<WaveHandle>(null);
  const roomW = useRef<WaveHandle>(null);
  const lockEl = useRef<HTMLDivElement>(null);
  const nightEl = useRef<HTMLDivElement>(null);
  const heatEl = useRef<HTMLDivElement>(null);
  const roomEl = useRef<HTMLDivElement>(null);

  const [lock, setLock] = useState<Lock>("unlocked");
  const [night, setNight] = useState(false);
  const [heat, setHeat] = useState<Heat>("hold");
  const [evening, setEvening] = useState(false);
  const [levels, setLevels] = useState(LIGHTS.map((l) => l.bright));
  const lockRef = useRef(lock);
  lockRef.current = lock;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWide(el.clientWidth >= 600));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** send a wave through a card, and swap its contents as the wave peaks */
  const wave = (w: WaveHandle | null, o: [number, number], swap: () => void, pitch: number) => {
    w?.fire(o[0], o[1]);
    sfx.whoosh(300, 1800, { dur: 0.6, gain: 0.04 });
    later(
      () => {
        swap();
        sfx.note(pitch, { dur: 0.5, gain: 0.035, bell: 0.6 });
      },
      reduce ? 0 : DUR * PEAK,
    );
  };

  const doLock = (o: [number, number]) => {
    if (lockRef.current !== "unlocked") return;
    setLock("locking");
    later(() => wave(lockW.current, o, () => setLock("locked"), 988), reduce ? 300 : 1200);
  };
  const unlock = (o: [number, number]) => wave(lockW.current, o, () => setLock("unlocked"), 659);

  const runNight = (o: [number, number]) => {
    wave(nightW.current, o, () => setNight(true), 784);
    onSceneChange?.("Goodnight", true);
    later(() => doLock([0.88, 0.5]), 700);
  };
  const endNight = (o: [number, number]) => {
    wave(nightW.current, o, () => setNight(false), 587);
    onSceneChange?.("Goodnight", false);
  };
  const boost = (o: [number, number]) => {
    if (heat !== "hold") return;
    setHeat("starting");
    later(() => wave(heatW.current, o, () => setHeat("boost"), 880), reduce ? 200 : 750);
  };
  const endBoost = (o: [number, number]) => wave(heatW.current, o, () => setHeat("hold"), 659);
  const toggleRoom = (o: [number, number]) => {
    const next = !evening;
    wave(
      roomW.current,
      o,
      () => {
        setEvening(next);
        setLevels(LIGHTS.map((l) => (next ? l.evening : l.bright)));
      },
      next ? 698 : 932,
    );
    onSceneChange?.(next ? "Evening" : "Bright and awake", true);
  };

  // autoplay: a short evening routine, then back to how it started
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      await wait(1200);
      while (ok()) {
        runNight([0.5, 0.92]);
        await wait(3400);
        if (!ok()) break;
        boost([0.5, 0.86]);
        await wait(2600);
        if (!ok()) break;
        toggleRoomRef.current([0.85, 0.2]);
        await wait(3000);
        if (!ok()) break;
        endNight([0.5, 0.92]);
        await wait(900);
        if (!ok()) break;
        endBoostRef.current([0.5, 0.86]);
        await wait(900);
        if (!ok()) break;
        toggleRoomRef.current([0.85, 0.2]);
        await wait(900);
        if (!ok()) break;
        unlock([0.5, 0.5]);
        await wait(3000);
      }
    })().catch((err) => {
      // torn down mid-step (the tile scrolled away): its elements are gone, so there is nothing to report
      if (alive) throw err;
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);
  const toggleRoomRef = useRef(toggleRoom);
  toggleRoomRef.current = toggleRoom;
  const endBoostRef = useRef(endBoost);
  endBoostRef.current = endBoost;

  /* thermostat dial */
  const temp = heat === "boost" ? 74 : 68;
  const tv = useMotionValue(68);
  useEffect(() => {
    const c = animate(tv, temp, reduce ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 16 });
    return () => c.stop();
  }, [temp, tv, reduce]);
  const valueDeg = useTransform(tv, (t) => ARC_START + ((t - 60) / 20) * ARC_SWEEP);
  const knobX = useTransform(valueDeg, (d) => polar(80, 80, 62, d)[0]);
  const knobY = useTransform(valueDeg, (d) => polar(80, 80, 62, d)[1]);
  const valueArc = useTransform(valueDeg, (d) => arcPath(80, 80, 62, ARC_START, Math.max(ARC_START + 0.5, d)));
  const gid = useId().replace(/:/g, "");

  const font = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif";
  const sub: CSSProperties = { fontSize: 12.5, color: "#8e8e93" };
  const mark = () => (touched.current = true);

  const nightRows = night
    ? [
        ["Lights", "All off"],
        ["Front door", lock === "locked" ? "Locked" : "Locking"],
        ["Thermostat", "66°"],
        ["Alarm", "7:00 AM"],
      ]
    : [
        ["Lights", "6 on"],
        ["Front door", lock === "locked" ? "Locked" : "Unlocked"],
        ["Thermostat", "71°"],
        ["Alarm", "Not set"],
      ];

  /* ---------------------------------------------------------------- cards */

  const lockCard = (
    <div ref={lockEl}>
      <WaveCard
        ref={lockW}
        palette={PAL.lock}
        ambient={lock === "locked"}
        reduce={reduce}
        radius={999}
        label="Front door"
        style={{ height: 76 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            height: 76,
            padding: "0 14px 0 14px",
          }}
        >
          <motion.span
            initial={false}
            animate={{
              background: lock === "locked" ? "rgba(255,255,255,0.08)" : "#2f7bf6",
            }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              color: "#fff",
              flex: "none",
            }}
          >
            <Ico d={lock === "locked" ? I.check : lock === "locking" ? I.lock : I.open} size={20} />
          </motion.span>
          <div style={{ flex: 1, minWidth: 0 }} aria-live="polite">
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#fff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {lock === "locked"
                ? "Front door locked"
                : lock === "locking"
                  ? "Locking front door"
                  : "Front door unlocked"}
            </div>
            <div style={{ ...sub, marginTop: 2 }}>
              {lock === "locked" ? "Deadbolt, just now" : lock === "locking" ? "Deadbolt turning" : "Deadbolt open"}
            </div>
          </div>
          <AnimatePresence mode="popLayout" initial={false}>
            {lock === "locking" ? (
              <motion.span
                key="spin"
                initial={{ opacity: 0, scale: 0.6, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "tween", duration: 0.25 }}
                style={{ padding: "0 10px", display: "block" }}
              >
                <Spinner size={22} />
              </motion.span>
            ) : (
              <motion.button
                key={lock}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, filter: "blur(3px)" }}
                transition={{ type: "tween", duration: 0.22 }}
                type="button"
                onClick={(e) => {
                  mark();
                  const o = originOf(e, lockEl.current);
                  if (lock === "unlocked") doLock(o);
                  else unlock(o);
                }}
                className={ring}
                style={{
                  height: 34,
                  borderRadius: 999,
                  border: 0,
                  padding: "0 16px",
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: font,
                }}
              >
                {lock === "unlocked" ? "Lock" : "Unlock"}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </WaveCard>
    </div>
  );

  const nightCard = (
    <div ref={nightEl} style={{ flex: 1, display: "flex" }}>
      <WaveCard
        ref={nightW}
        palette={PAL.night}
        ambient={night}
        reduce={reduce}
        radius={30}
        label="Goodnight scene"
        style={{ flex: 1 }}
      >
        <div
          style={{
            padding: "22px 18px 18px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: "100%",
            boxSizing: "border-box",
          }}
        >
          <motion.span
            initial={false}
            animate={{
              background: night ? "#7c6bff" : "rgba(255,255,255,0.08)",
            }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              color: "#fff",
            }}
          >
            <Ico d={night ? I.check : I.moon} size={night ? 18 : 20} />
          </motion.span>
          <div style={{ ...sub, marginTop: 12, fontSize: 13 }}>
            {night ? (
              <>
                On since <span style={{ color: "#fff", fontWeight: 500 }}>{bedtime}</span>
              </>
            ) : (
              <>
                Scene for <span style={{ color: "#fff", fontWeight: 500 }}>the whole home</span>
              </>
            )}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 650,
              color: "#fff",
              letterSpacing: "-0.02em",
              marginTop: 2,
            }}
          >
            Goodnight
          </div>
          <div
            style={{
              width: "100%",
              marginTop: 16,
              borderRadius: 18,
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.025)",
            }}
          >
            {nightRows.map(([k, v], i) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  height: 42,
                  padding: "0 14px",
                  borderTop: i ? "1px solid rgba(255,255,255,0.06)" : 0,
                  fontSize: 13.5,
                }}
              >
                <span style={{ color: "#8e8e93" }}>{k}</span>
                <span className="tabular-nums" style={{ color: "#fff", fontWeight: 500 }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minHeight: 14 }} />
          <button
            type="button"
            onClick={(e) => {
              mark();
              const o = originOf(e, nightEl.current);
              if (night) endNight(o);
              else runNight(o);
            }}
            className={ring}
            style={{ ...btn, fontFamily: font }}
          >
            {night ? "Done" : "Run scene"}
          </button>
        </div>
      </WaveCard>
    </div>
  );

  const heatCard = (
    <div ref={heatEl}>
      <WaveCard
        ref={heatW}
        palette={PAL.heat}
        ambient={heat === "boost"}
        reduce={reduce}
        radius={30}
        label="Hallway thermostat"
      >
        <div style={{ padding: "18px 18px 18px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Hallway</span>
            <motion.span
              initial={false}
              animate={{
                background: heat === "boost" ? "rgba(255,140,60,0.18)" : "rgba(255,255,255,0.08)",
                color: heat === "boost" ? "#ffb070" : "#c7c7cc",
              }}
              style={{
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 999,
                padding: "4px 10px",
              }}
            >
              {heat === "boost" ? "Boost" : "Auto"}
            </motion.span>
          </div>
          <div
            style={{
              position: "relative",
              width: 160,
              height: 140,
              margin: "6px auto 0",
            }}
          >
            <svg
              width={160}
              height={160}
              viewBox="0 0 160 160"
              aria-hidden="true"
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <defs>
                <linearGradient id={`${gid}-heat`} x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0" stopColor="#ffd27a" />
                  <stop offset="0.6" stopColor="#ff8a3d" />
                  <stop offset="1" stopColor="#ff5f8f" />
                </linearGradient>
              </defs>
              <path
                d={arcPath(80, 80, 62, ARC_START, ARC_START + ARC_SWEEP)}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={8}
                strokeLinecap="round"
              />
              <motion.path d={valueArc} fill="none" stroke="#f2f2f4" strokeWidth={8} strokeLinecap="round" />
              <motion.path
                d={valueArc}
                fill="none"
                stroke={`url(#${gid}-heat)`}
                strokeWidth={8}
                strokeLinecap="round"
                initial={false}
                animate={{ opacity: heat === "boost" ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.circle cx={knobX} cy={knobY} r={6} fill="#fff" stroke="#1c1c1e" strokeWidth={2.5} />
            </svg>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 46,
                textAlign: "center",
                color: "#fff",
              }}
              aria-live="polite"
            >
              <Roll
                text={`${temp}°`}
                reduce={reduce}
                style={{
                  fontSize: 38,
                  fontWeight: 650,
                  letterSpacing: "-0.03em",
                  justifyContent: "center",
                }}
              />
              <div style={{ ...sub, fontSize: 12, marginTop: 1 }}>{heat === "boost" ? "Boosting" : "Holding"}</div>
            </div>
            <span
              style={{
                position: "absolute",
                left: 30,
                top: 128,
                ...sub,
                fontSize: 11,
              }}
            >
              60
            </span>
            <span
              style={{
                position: "absolute",
                right: 30,
                top: 128,
                ...sub,
                fontSize: 11,
              }}
            >
              80
            </span>
          </div>
          <div
            style={{
              ...sub,
              textAlign: "center",
              marginTop: 12,
              display: "flex",
              justifyContent: "center",
              gap: 14,
            }}
          >
            {heat === "boost" ? (
              <span>Back to 68° at 11:12 PM</span>
            ) : (
              <>
                <span>Outside 41°</span>
                <span>Humidity 38%</span>
              </>
            )}
          </div>
          <button
            type="button"
            disabled={heat === "starting"}
            onClick={(e) => {
              mark();
              const o = originOf(e, heatEl.current);
              if (heat === "boost") endBoost(o);
              else boost(o);
            }}
            className={ring}
            style={{
              ...btn,
              marginTop: 14,
              fontFamily: font,
              opacity: heat === "starting" ? 0.75 : 1,
              cursor: heat === "starting" ? "default" : "pointer",
            }}
          >
            {heat === "starting" ? (
              <>
                <Spinner size={15} color="#1d1d1f" />
                Starting
              </>
            ) : heat === "boost" ? (
              "Done"
            ) : (
              "Boost for 30 min"
            )}
          </button>
        </div>
      </WaveCard>
    </div>
  );

  const roomCard = (
    <div ref={roomEl} style={{ flex: 1, display: "flex" }}>
      <WaveCard
        ref={roomW}
        palette={PAL.room}
        ambient={evening}
        reduce={reduce}
        radius={30}
        label="Living room"
        style={{ flex: 1 }}
      >
        <div style={{ padding: "16px 18px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                display: "grid",
                placeItems: "center",
                color: evening ? "#ffc58a" : "#fff",
              }}
            >
              <Ico d={I.bulb} size={18} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Living room</div>
              <div style={{ ...sub, fontSize: 12 }}>{evening ? "4 lights, dimmed" : "4 lights, all on"}</div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                mark();
                toggleRoom(originOf(e, roomEl.current));
              }}
              className={ring}
              style={{
                height: 32,
                borderRadius: 999,
                border: 0,
                padding: "0 13px",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: font,
              }}
            >
              <Ico d={evening ? I.bulb : I.sun} size={14} />
              {evening ? "Bright" : "Evening"}
            </button>
          </div>
          <div
            style={{
              fontSize: 21,
              fontWeight: 650,
              color: "#fff",
              letterSpacing: "-0.02em",
              margin: "16px 0 10px",
            }}
          >
            {evening ? "Soft evening" : "Bright and awake"}
          </div>
          {LIGHTS.map((l, i) => (
            <LightRow
              key={l.name}
              name={l.name}
              value={levels[i]}
              warm={evening}
              reduce={reduce}
              onChange={(v) => {
                mark();
                setLevels((ls) => ls.map((x, j) => (j === i ? v : x)));
              }}
            />
          ))}
        </div>
      </WaveCard>
    </div>
  );

  return (
    <div
      ref={wrap}
      className={`w-full ${className}`}
      style={{ maxWidth: 760, fontFamily: font }}
      onPointerDown={(e) => e.isTrusted && mark()}
      onKeyDown={mark}
    >
      <div
        style={{
          borderRadius: 34,
          background: "#000",
          padding: wide ? 18 : 12,
          display: "grid",
          gridTemplateColumns: wide ? "1fr 1fr" : "1fr",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {lockCard}
          {nightCard}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {heatCard}
          {roomCard}
        </div>
      </div>
    </div>
  );
}

function LightRow({
  name,
  value,
  warm,
  reduce,
  onChange,
}: {
  name: string;
  value: number;
  warm: boolean;
  reduce: boolean;
  onChange: (v: number) => void;
}) {
  const mv = useMotionValue(value);
  const track = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(false);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (drag) return;
    const c = animate(mv, value, reduce ? { duration: 0 } : { type: "spring", stiffness: 90, damping: 18 });
    return () => c.stop();
  }, [value, drag, mv, reduce]);
  useEffect(() => mv.on("change", (v) => setShown(Math.round(v))), [mv]);
  const width = useTransform(mv, (v) => `${v}%`);
  const set = (e: RPointerEvent) => {
    const r = track.current!.getBoundingClientRect();
    const v = Math.round(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * 100);
    mv.set(v);
    onChange(v);
  };
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "88px 1fr 40px",
        alignItems: "center",
        gap: 10,
        height: 30,
        fontSize: 12.5,
      }}
    >
      <span style={{ color: "#8e8e93" }}>{name}</span>
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label={name}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          setDrag(true);
          set(e);
        }}
        onPointerMove={(e) => drag && set(e)}
        onPointerUp={() => setDrag(false)}
        onPointerCancel={() => setDrag(false)}
        onKeyDown={(e) => {
          const d =
            e.key === "ArrowRight" || e.key === "ArrowUp" ? 5 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -5 : 0;
          if (!d) return;
          e.preventDefault();
          onChange(Math.max(0, Math.min(100, value + d)));
        }}
        className="outline-none focus-visible:ring-2 focus-visible:ring-[#5ea0ff]"
        style={{
          position: "relative",
          height: 18,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          touchAction: "none",
          borderRadius: 6,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 4,
            borderRadius: 4,
            background: "rgba(255,255,255,0.1)",
          }}
        />
        <motion.div
          style={{
            position: "absolute",
            left: 0,
            width,
            height: 4,
            borderRadius: 4,
            background: warm ? "linear-gradient(90deg,#ffb36b,#ffd9a8)" : "#f2f2f4",
          }}
        />
        <motion.div
          style={{
            position: "absolute",
            left: width,
            width: 12,
            height: 12,
            marginLeft: -6,
            borderRadius: 999,
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
          }}
        />
      </div>
      <span className="tabular-nums" style={{ color: "#fff", textAlign: "right" }}>
        {shown}%
      </span>
    </div>
  );
}
