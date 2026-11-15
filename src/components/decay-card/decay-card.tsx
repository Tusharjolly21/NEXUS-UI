"use client";

/* eslint-disable react-hooks/immutability, react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type DecayPhoto = { src: string; title: string; credit?: string };
/** Unsplash photos by Johny Goerend and Valdemaras D., at up to 3840 px */
const DEFAULT_PHOTOS: DecayPhoto[] = [
  {
    title: "Reine, Lofoten",
    credit: "Johny Goerend",
    src: "https://images.unsplash.com/photo-1593378026483-2a1fd46a35bd?fm=jpg&q=80&fit=max&w=3840&h=3840",
  },
  {
    title: "Ice cave",
    credit: "Valdemaras D.",
    src: "https://images.unsplash.com/photo-1576059620175-9b608f96797b?fm=jpg&q=80&fit=max&w=3840&h=3840",
  },
];

export type DecayCardProps = {
  /** pictures in pairs: the one on top rots away to show the next */
  photos?: DecayPhoto[];
  /** how far the card tilts, in degrees */
  tilt?: number;
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

const PAINT: [string, string][] = [
  ["#9fc5e8", "#3d5a80"],
  ["#f6bd60", "#84a59d"],
];
function painted([a, b]: [string, string]) {
  const c = document.createElement("canvas");
  c.width = 400;
  c.height = 560;
  const g = c.getContext("2d")!;
  const gr = g.createLinearGradient(0, 0, 0, 560);
  gr.addColorStop(0, a);
  gr.addColorStop(1, b);
  g.fillStyle = gr;
  g.fillRect(0, 0, 400, 560);
  g.fillStyle = b;
  g.beginPath();
  g.moveTo(0, 380);
  for (let x = 0; x <= 400; x += 20) g.lineTo(x, 360 - Math.sin(x / 50) * 60 - Math.sin(x / 13) * 10);
  g.lineTo(400, 560);
  g.lineTo(0, 560);
  g.fill();
  return c;
}

const VERT = `attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; vUv.y = 1.0 - vUv.y; gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `precision highp float;
varying vec2 vUv;
uniform sampler2D uA;
uniform sampler2D uB;
uniform float uP;        // 0: whole, 1: rotted right through
uniform vec2 uSeed;      // where the rot started
uniform float uTime;
uniform vec2 uTilt;      // the card's tilt, for a little parallax between the two pictures
uniform float uAsp;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 5; i++) { s += noise(p) * a; p = p * 2.03 + 11.7; a *= 0.5; }
  return s;
}

void main(){
  vec2 uv = vUv;
  vec2 q = vec2(uv.x * uAsp, uv.y);
  // the rot spreads outward from where it started, eating along the grain of a noise field
  float dist = length(q - vec2(uSeed.x * uAsp, uSeed.y));
  float n = fbm(q * 4.2) * 0.75 + fbm(q * 13.0 + 3.0) * 0.25;
  float field = dist * 0.85 + n * 0.55;
  float front = uP * 1.75 - 0.08;
  float e = field - front;          // < 0 means rotted away
  // the picture underneath sits a little deeper, so it shifts the other way as the card tilts
  vec3 b = texture2D(uB, uv - uTilt * 0.012).rgb;
  vec3 a = texture2D(uA, uv + uTilt * 0.004).rgb;
  // the surface that is about to go is scorched and curls darker; the very edge is charred and glows
  float scorch = smoothstep(0.16, 0.0, e) * step(0.0, e);
  a *= 1.0 - scorch * 0.55;
  a = mix(a, a * vec3(1.0, 0.82, 0.62), scorch * 0.6);
  float edge = smoothstep(0.018, 0.0, abs(e));
  float flick = 0.75 + 0.25 * noise(q * 30.0 + uTime * 4.0);
  vec3 ember = mix(vec3(1.0, 0.35, 0.05), vec3(1.0, 0.86, 0.5), smoothstep(0.008, 0.0, abs(e))) * flick;
  vec3 col = e < 0.0 ? b : a;
  // the inside rim of the hole: char and a soft shadow cast down onto the picture beneath
  float rim = smoothstep(-0.05, 0.0, e) * step(e, 0.0);
  col = mix(col, vec3(0.06, 0.04, 0.03), rim * 0.85);
  float shadow = smoothstep(-0.14, 0.0, e) * step(e, 0.0);
  col *= 1.0 - shadow * 0.35;
  col = mix(col, ember, edge * 0.9);
  col += ember * smoothstep(0.05, 0.0, abs(e)) * 0.1;
  gl_FragColor = vec4(col, 1.0);
}`;

type R = {
  draw: (p: number, seed: [number, number], time: number, tilt: [number, number]) => void;
  setPair: (a: number, b: number) => void;
  size: (w: number, h: number) => void;
  dispose: () => void;
};
const pendingLose = new WeakMap<HTMLCanvasElement, ReturnType<typeof setTimeout>>();

function makeGL(c: HTMLCanvasElement, imgs: TexImageSource[], asp: number): R | null {
  clearTimeout(pendingLose.get(c));
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = c.getContext("webgl", { antialias: false, alpha: false });
  } catch {
    gl = null;
  }
  if (!gl) return null;
  const g = gl;
  const sh = (t: number, src: string) => {
    const s = g.createShader(t)!;
    g.shaderSource(s, src);
    g.compileShader(s);
    if (!g.getShaderParameter(s, g.COMPILE_STATUS)) console.warn(g.getShaderInfoLog(s));
    return s;
  };
  const prog = g.createProgram()!;
  g.attachShader(prog, sh(g.VERTEX_SHADER, VERT));
  g.attachShader(prog, sh(g.FRAGMENT_SHADER, FRAG));
  g.linkProgram(prog);
  if (!g.getProgramParameter(prog, g.LINK_STATUS)) {
    console.warn(g.getProgramInfoLog(prog));
    return null;
  }
  g.useProgram(prog);
  const buf = g.createBuffer();
  g.bindBuffer(g.ARRAY_BUFFER, buf);
  g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
  const loc = g.getAttribLocation(prog, "p");
  g.enableVertexAttribArray(loc);
  g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
  const tex = imgs.map((im) => {
    const t = g.createTexture();
    g.bindTexture(g.TEXTURE_2D, t);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
    g.texImage2D(g.TEXTURE_2D, 0, g.RGB, g.RGB, g.UNSIGNED_BYTE, im);
    return t;
  });
  const U = (n: string) => g.getUniformLocation(prog, n);
  const uP = U("uP");
  const uSeed = U("uSeed");
  const uTime = U("uTime");
  const uTilt = U("uTilt");
  g.uniform1f(U("uAsp"), asp);
  g.uniform1i(U("uA"), 0);
  g.uniform1i(U("uB"), 1);
  return {
    size(w, h) {
      c.width = w;
      c.height = h;
      g.viewport(0, 0, w, h);
    },
    setPair(a, b) {
      g.activeTexture(g.TEXTURE0);
      g.bindTexture(g.TEXTURE_2D, tex[a % tex.length]);
      g.activeTexture(g.TEXTURE1);
      g.bindTexture(g.TEXTURE_2D, tex[b % tex.length]);
    },
    draw(p, seed, time, tilt) {
      g.uniform1f(uP, p);
      g.uniform2f(uSeed, seed[0], seed[1]);
      g.uniform1f(uTime, time);
      g.uniform2f(uTilt, tilt[0], tilt[1]);
      g.drawArrays(g.TRIANGLES, 0, 3);
    },
    dispose() {
      pendingLose.set(
        c,
        setTimeout(() => g.getExtension("WEBGL_lose_context")?.loseContext(), 300),
      );
    },
  };
}

const ASP = 280 / 380;

/**
 * A photo card that rots away from the inside. Hover it and a hole opens where the pointer came in, eating outward
 * along the grain of the picture with a scorched rim and a glowing, flickering edge that throws embers, until the
 * second picture underneath has taken the whole card; take the pointer away and it grows back. The card tilts in 3D
 * with a glare, the picture underneath sits a little deeper so the two shift against each other, and the type on it
 * stays put. Click (or Enter) to bring up the next pair of pictures.
 */
export default function DecayCard({
  photos = DEFAULT_PHOTOS,
  tilt = 8,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: DecayCardProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const list = useMemo(() => (photos && photos.length >= 2 ? photos : null), [photos]);
  const n = list ? list.length : 2;
  const cv = useRef<HTMLCanvasElement>(null);
  const sparks = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const st = useRef({
    p: 0,
    target: 0,
    seed: [0.5, 0.5] as [number, number],
    a: 0,
    embers: [] as {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      max: number;
    }[],
  });
  const [pair, setPair] = useState(0);
  // whether the picture underneath has taken over, for the caption on the card
  const [under, setUnder] = useState(false);
  const [noGL, setNoGL] = useState(false);
  const touched = useRef(false);
  const kick = useRef<() => void>(() => {});
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 150, damping: 18 });
  const sy = useSpring(py, { stiffness: 150, damping: 18 });
  const rY = useTransform(sx, (v) => (reduce ? 0 : v * tilt));
  const rX = useTransform(sy, (v) => (reduce ? 0 : -v * tilt));
  const gx = useTransform(sx, (v) => 50 + v * 45);
  const gy = useTransform(sy, (v) => 50 + v * 45);
  const glare = useMotionTemplate`radial-gradient(60% 50% at ${gx}% ${gy}%, rgba(255,255,255,0.28), transparent 70%)`;

  useEffect(() => {
    let alive = true;
    let cleanup = () => {};
    const load = (src: string) =>
      new Promise<CanvasImageSource>((res) => {
        const im = new Image();
        try {
          if (new URL(src, location.href).origin !== location.origin) im.crossOrigin = "anonymous";
        } catch {
          /* keep going */
        }
        im.decoding = "async";
        im.onload = () => res(im);
        im.onerror = () => res(painted(PAINT[0]));
        im.src = src;
      });
    void (async () => {
      const srcs = list ? await Promise.all(list.map((p) => load(p.src))) : PAINT.map(painted);
      const imgs = srcs.map((s) => {
        const c = document.createElement("canvas");
        // drawn once at about three times the card's size: a 4K photo stays sharp on any screen and isn't kept in memory
        c.width = 840;
        c.height = Math.round(840 / ASP);
        const g = c.getContext("2d")!;
        const iw = (s as HTMLImageElement).naturalWidth || (s as HTMLCanvasElement).width;
        const ih = (s as HTMLImageElement).naturalHeight || (s as HTMLCanvasElement).height;
        const k = Math.max(c.width / iw, c.height / ih);
        g.imageSmoothingQuality = "high";
        g.drawImage(s, (c.width - iw * k) / 2, (c.height - ih * k) / 2, iw * k, ih * k);
        return c;
      });
      if (!alive) return;
      const el = box.current;
      const R = cv.current ? makeGL(cv.current, imgs, ASP) : null;
      if (!R || !el) {
        setNoGL(true);
        return;
      }
      const resize = () => {
        const dpr = Math.min(2, devicePixelRatio || 1);
        R.size(Math.round(el.clientWidth * dpr), Math.round(el.clientHeight * dpr));
        if (sparks.current) {
          sparks.current.width = Math.round(el.clientWidth * dpr);
          sparks.current.height = Math.round(el.clientHeight * dpr);
        }
        kick.current();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      let raf = 0;
      let running = false;
      let last = performance.now();
      const t0 = last;
      let lastCrackle = 0;
      const frame = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const s = st.current;
        const going = s.target > s.p;
        // rot is slow and greedy; regrowth is a little quicker
        const rate = reduce ? 10 : going ? 0.42 : 0.6;
        s.p += Math.sign(s.target - s.p) * Math.min(Math.abs(s.target - s.p), dt * rate);
        const pairNow = pairRef.current;
        R.setPair(pairNow % n, (pairNow + 1) % n);
        R.draw(s.p, s.seed, (now - t0) / 1000, [sx.get(), sy.get()]);
        // embers leave the burning edge while it moves
        const sc = sparks.current;
        const ctx = sc?.getContext("2d");
        if (sc && ctx) {
          const W = sc.width;
          const H = sc.height;
          const moving = Math.abs(s.target - s.p) > 0.001 && s.p > 0.01 && s.p < 0.99;
          if (moving && !reduce) {
            const front = s.p * 1.75 - 0.08;
            // the front, roughly: a ragged ring round where the rot began
            const r0 = (front - 0.27) / 0.85;
            for (let k = 0; k < 5 && s.embers.length < 90 && r0 > 0; k++) {
              const ang = Math.random() * Math.PI * 2;
              const rr = r0 + (Math.random() - 0.5) * 0.12;
              const u = s.seed[0] + (Math.cos(ang) * rr) / ASP;
              const v = s.seed[1] + Math.sin(ang) * rr;
              if (u < 0 || u > 1 || v < 0 || v > 1) continue;
              s.embers.push({
                x: u * W,
                y: v * H,
                vx: (Math.random() - 0.5) * 40,
                vy: -20 - Math.random() * 60,
                life: 0,
                max: 0.4 + Math.random() * 0.7,
              });
            }
            if (now - lastCrackle > 70) {
              lastCrackle = now;
              sfx.tick({ freq: 2500 + Math.random() * 3000, gain: 0.012 });
            }
          }
          ctx.clearRect(0, 0, W, H);
          ctx.globalCompositeOperation = "lighter";
          s.embers = s.embers.filter((e) => {
            e.life += dt;
            if (e.life > e.max) return false;
            e.vy -= 30 * dt;
            e.vx += Math.sin(e.life * 9 + e.x) * 30 * dt;
            e.x += e.vx * dt * 2;
            e.y += e.vy * dt * 2;
            const t = 1 - e.life / e.max;
            const r = (0.8 + t * 1.2) * (W / 280);
            const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r * 3);
            g.addColorStop(0, `rgba(255,230,170,${t})`);
            g.addColorStop(0.35, `rgba(255,130,40,${t * 0.7})`);
            g.addColorStop(1, "rgba(255,80,20,0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(e.x, e.y, r * 3, 0, Math.PI * 2);
            ctx.fill();
            return true;
          });
          ctx.globalCompositeOperation = "source-over";
        }
        const busy =
          Math.abs(s.target - s.p) > 0.0005 ||
          s.embers.length > 0 ||
          Math.abs(sx.getVelocity()) > 0.001 ||
          Math.abs(sy.getVelocity()) > 0.001;
        if (busy) raf = requestAnimationFrame(frame);
        else running = false;
      };
      kick.current = () => {
        if (running) return;
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      };
      kick.current();
      const unsub = [sx.on("change", () => kick.current()), sy.on("change", () => kick.current())];
      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        unsub.forEach((u) => u());
        R.dispose();
      };
    })();
    return () => {
      alive = false;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, reduce, n]);

  const pairRef = useRef(0);
  pairRef.current = pair;

  const rot = (on: boolean, at?: [number, number]) => {
    const s = st.current;
    if (on && s.p < 0.02 && at) s.seed = at;
    if (s.target === (on ? 1 : 0)) return;
    s.target = on ? 1 : 0;
    setUnder(on);
    if (on) sfx.whoosh(2400, 300, { dur: 1.8, gain: 0.04 });
    else sfx.whoosh(300, 1600, { dur: 1.2, gain: 0.03 });
    kick.current();
  };
  const next = () => {
    const s = st.current;
    // whatever is showing becomes the new top picture
    const shown = s.p > 0.5 ? (pairRef.current + 1) % n : pairRef.current;
    const np = s.p > 0.5 ? shown : (shown + 1) % n;
    setPair(np);
    setUnder(false);
    pairRef.current = np;
    s.p = 0;
    s.target = 0;
    sfx.note(660, { dur: 0.2, gain: 0.04 });
    kick.current();
  };

  // autoplay: rot from a few places in turn, then grow back
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const run = async () => {
      const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
      await wait(900);
      const seeds: [number, number][] = [
        [0.45, 0.4],
        [0.7, 0.65],
        [0.3, 0.7],
      ];
      let k = 0;
      while (alive && !touched.current) {
        rot(true, seeds[k++ % seeds.length]);
        await wait(3600);
        if (!alive || touched.current) return;
        rot(false);
        await wait(2400);
      }
    };
    void run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const local = (e: { clientX: number; clientY: number }): [number, number] => {
    const r = box.current?.getBoundingClientRect();
    return r ? [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height] : [0.5, 0.5];
  };
  const onEnter = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    touched.current = true;
    rot(true, local(e));
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const [x, y] = local(e);
    px.set(x * 2 - 1);
    py.set(y * 2 - 1);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
    rot(false);
  };
  const onKey = (e: RKeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      touched.current = true;
      next();
    } else if (e.key === " ") {
      e.preventDefault();
      touched.current = true;
      rot(st.current.target < 0.5, [0.5, 0.5]);
    }
  };

  const shownPhoto: DecayPhoto = list
    ? list[(pair + (under ? 1 : 0)) % n]
    : { src: "", title: under ? "Meadow" : "Glacier" };

  return (
    <div
      className={`relative w-full rounded-[24px] bg-[#f2f2f4] ${className}`}
      style={{
        padding: "40px 16px",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        placeItems: "center",
        perspective: 1000,
      }}
    >
      <motion.div
        ref={box}
        role="button"
        tabIndex={0}
        aria-label={`${shownPhoto.title}. Press Enter for the next pictures, Space to let it rot.`}
        onPointerEnter={onEnter}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerDown={(e) => {
          touched.current = true;
          if (e.pointerType !== "mouse") rot(st.current.target < 0.5, local(e));
        }}
        onClick={(e) => {
          if ((e.nativeEvent as PointerEvent).pointerType === "mouse") next();
        }}
        onKeyDown={onKey}
        className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4"
        style={{
          position: "relative",
          width: "min(100%, 280px)",
          aspectRatio: `${ASP}`,
          borderRadius: 22,
          overflow: "hidden",
          rotateX: rX,
          rotateY: rY,
          transformStyle: "preserve-3d",
          boxShadow: "0 40px 60px -30px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.06)",
          cursor: "pointer",
          background: "#222",
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
        {noGL && list && (
          <img
            src={list[pair % n].src}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        <canvas
          ref={sparks}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />
        <motion.div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: glare,
            mixBlendMode: "soft-light",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.55) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 18,
            right: 18,
            bottom: 12,
            color: "#fff",
            pointerEvents: "none",
            height: 52,
            overflow: "hidden",
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={shownPhoto.title}
              initial={{ y: 22, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -22, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            >
              <div
                style={{
                  fontSize: 21,
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  textShadow: "0 2px 18px rgba(0,0,0,0.35)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {shownPhoto.title}
              </div>
              {shownPhoto.credit && (
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.78)",
                    marginTop: 2,
                  }}
                >
                  Photo by {shownPhoto.credit}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
