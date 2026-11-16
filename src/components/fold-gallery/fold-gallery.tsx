"use client";

/* eslint-disable react-hooks/immutability, react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type FoldPhoto = { src: string; title: string };
export type FoldGalleryProps = {
  photos?: FoldPhoto[];
  onChange?: (index: number) => void;
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
  prev: "M168.49 199.51a12 12 0 0 1-17 17l-80-80a12 12 0 0 1 0-17l80-80a12 12 0 0 1 17 17L97 128Z",
  next: "m184.49 136.49l-80 80a12 12 0 0 1-17-17L159 128L87.51 56.49a12 12 0 1 1 17-17l80 80a12 12 0 0 1-.02 17",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const PAINT: [string, string][] = [
  ["#f6d365", "#fd7a5c"],
  ["#5ee7df", "#3a6df0"],
  ["#d4fc79", "#2e8b57"],
  ["#fbc2eb", "#8a5cf6"],
];
function painted([a, b]: [string, string], i: number) {
  const c = document.createElement("canvas");
  c.width = 400;
  c.height = 528;
  const g = c.getContext("2d")!;
  const gr = g.createLinearGradient(0, 0, 400, 528);
  gr.addColorStop(0, a);
  gr.addColorStop(1, b);
  g.fillStyle = gr;
  g.fillRect(0, 0, 400, 528);
  g.fillStyle = "rgba(255,255,255,0.35)";
  for (let k = 0; k < 6; k++) {
    g.beginPath();
    g.arc(60 + ((k * 97 + i * 41) % 300), 80 + ((k * 151 + i * 67) % 380), 18 + k * 7, 0, Math.PI * 2);
    g.fill();
  }
  return c;
}

const NX = 56;
const NY = 28;
const ASP = 200 / 264; // the card is portrait

const VERT = `
attribute vec2 aP;
uniform float uA;      // how far it has turned, radians
uniform float uV;      // how fast it is turning
uniform float uCam;
uniform vec2 uView;
varying vec2 vUv;
varying float vShade;
varying float vEdge;
varying float vSpec;
void main(){
  float hx = ${(ASP / 2).toFixed(4)};
  float x = aP.x * hx * 2.0;
  float y = aP.y;
  float t = abs(x) / hx;
  // the outer parts lag the turn and curl back, like a soft sheet swept through the air
  float lag = clamp(uV * 0.11, -0.9, 0.9) * t * t;
  float a = uA - lag;
  // its corners flare as it bends
  float bend = abs(sin(uA)) * 0.12 + abs(lag) * 0.35;
  float yy = y * (1.0 + bend * t * t);
  float X = x * cos(a);
  float Z = -x * sin(a);
  // a soft bulge in the middle as it lifts
  Z += sin(uA) * sin(uA) * 0.06 * (1.0 - t * t);
  vec3 n = normalize(vec3(sin(a), 0.0, cos(a)));
  vec3 L = normalize(vec3(-0.5, 0.4, 0.9));
  vShade = abs(dot(n, L));
  vec3 h = normalize(L + vec3(0.0, 0.0, 1.0));
  vSpec = pow(abs(dot(n, h)), 40.0);
  vEdge = t;
  vUv = aP * vec2(1.0, 1.0) + 0.5;
  vUv.y = 0.5 - aP.y;
  float z = Z - uCam;
  gl_Position = vec4(X * uView.x, yy * uView.y, -0.001 * Z, -z);
}`;
const FRAG = `
precision highp float;
varying vec2 vUv;
varying float vShade;
varying float vEdge;
varying float vSpec;
uniform sampler2D uFront;
uniform sampler2D uBack;
uniform float uV;
uniform float uA;
vec3 tap(sampler2D s, vec2 uv){ return texture2D(s, clamp(uv, 0.001, 0.999)).rgb; }
void main(){
  vec2 uv = vUv;
  bool back = !gl_FrontFacing;
  if (back) uv.x = 1.0 - uv.x;
  // rounded corners
  vec2 q = abs(uv - 0.5) * vec2(${ASP.toFixed(4)}, 1.0);
  vec2 c = vec2(${(ASP / 2).toFixed(4)}, 0.5) - 0.045;
  float d = length(max(q - c, 0.0)) - 0.045;
  float alpha = 1.0 - smoothstep(-0.003, 0.002, d);
  if (alpha <= 0.0) discard;
  // blur along the sweep, stronger at the fast outer edges, with the colours pulled apart
  float s = clamp(abs(uV), 0.0, 14.0) * 0.0022 * (0.25 + vEdge);
  vec3 col = vec3(0.0);
  for (int i = -3; i <= 3; i++) {
    float o = float(i) * s;
    vec3 rgb;
    if (back) {
      rgb.r = tap(uBack, uv + vec2(o + s * 1.4, 0.0)).r;
      rgb.g = tap(uBack, uv + vec2(o, 0.0)).g;
      rgb.b = tap(uBack, uv + vec2(o - s * 1.4, 0.0)).b;
    } else {
      rgb.r = tap(uFront, uv + vec2(o + s * 1.4, 0.0)).r;
      rgb.g = tap(uFront, uv + vec2(o, 0.0)).g;
      rgb.b = tap(uFront, uv + vec2(o - s * 1.4, 0.0)).b;
    }
    col += rgb;
  }
  col /= 7.0;
  float turning = abs(sin(uA));
  col *= mix(1.0, 0.55 + 0.6 * vShade, turning);
  col += vSpec * 0.35 * turning;
  // a thin bright rim catches the light on the edge that leads
  col += smoothstep(0.92, 1.0, vEdge) * turning * 0.12;
  gl_FragColor = vec4(col * alpha, alpha);
}`;

type GL = {
  draw: (a: number, v: number) => void;
  setPair: (front: number, back: number) => void;
  size: (w: number, h: number) => void;
  dispose: () => void;
};

const pendingLose = new WeakMap<HTMLCanvasElement, ReturnType<typeof setTimeout>>();

function makeGL(canvas: HTMLCanvasElement, imgs: TexImageSource[]): GL | null {
  clearTimeout(pendingLose.get(canvas));
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl", {
      antialias: true,
      alpha: true,
      premultipliedAlpha: true,
    });
  } catch {
    gl = null;
  }
  if (!gl || gl.isContextLost()) return null;
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
  // a fine grid so the sheet can bend smoothly
  const verts: number[] = [];
  for (let j = 0; j < NY; j++)
    for (let i = 0; i < NX; i++) {
      const x0 = i / NX - 0.5;
      const x1 = (i + 1) / NX - 0.5;
      const y0 = j / NY - 0.5;
      const y1 = (j + 1) / NY - 0.5;
      verts.push(x0, y0, x1, y0, x1, y1, x0, y0, x1, y1, x0, y1);
    }
  const buf = g.createBuffer();
  g.bindBuffer(g.ARRAY_BUFFER, buf);
  g.bufferData(g.ARRAY_BUFFER, new Float32Array(verts), g.STATIC_DRAW);
  const loc = g.getAttribLocation(prog, "aP");
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
  const uA = U("uA");
  const uV = U("uV");
  const uCam = U("uCam");
  const uView = U("uView");
  g.uniform1i(U("uFront"), 0);
  g.uniform1i(U("uBack"), 1);
  g.enable(g.BLEND);
  g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA);
  let W = 1;
  let H = 1;
  return {
    size(w, h) {
      canvas.width = w;
      canvas.height = h;
      W = w;
      H = h;
      g.viewport(0, 0, w, h);
    },
    setPair(f, b) {
      g.activeTexture(g.TEXTURE0);
      g.bindTexture(g.TEXTURE_2D, tex[f % tex.length]);
      g.activeTexture(g.TEXTURE1);
      g.bindTexture(g.TEXTURE_2D, tex[b % tex.length]);
    },
    draw(a, v) {
      g.clearColor(0, 0, 0, 0);
      g.clear(g.COLOR_BUFFER_BIT);
      // a camera far enough back that the card fills about 80 percent of the height
      const cam = 3.2;
      const fy = (cam * 0.8) / 0.5 / 1.0;
      g.uniform1f(uCam, cam);
      g.uniform2f(uView, (fy * H) / W / 1.0 / 1, fy);
      g.uniform1f(uA, a);
      g.uniform1f(uV, v);
      g.drawArrays(g.TRIANGLES, 0, NX * NY * 6);
    },
    dispose() {
      pendingLose.set(
        canvas,
        setTimeout(() => g.getExtension("WEBGL_lose_context")?.loseContext(), 300),
      );
    },
  };
}

/**
 * A photo gallery that turns its pictures over like a sheet of something soft. Drag the photo sideways and it
 * swings round on its middle to show the next picture on its back; the outer edges lag behind the turn and curl,
 * the corners flare, and the fast-moving parts smear with the colours pulling apart, then everything springs flat.
 * Flick it to turn quickly; let go before halfway and it falls back. Arrow keys and the buttons turn it too.
 */
export default function FoldGallery({
  photos,
  onChange,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: FoldGalleryProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const list = useMemo(() => (photos && photos.length ? photos : null), [photos]);
  const titles = useMemo(() => (list ? list.map((p) => p.title) : ["Citrus", "Lagoon", "Meadow", "Orchid"]), [list]);
  const n = titles.length;
  const canvas = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const st = useRef({
    a: 0,
    v: 0,
    target: 0 as number | null,
    cur: 0,
    dir: 1,
    drag: false,
    fallback: false,
  });
  const glRef = useRef<GL | null>(null);
  const kick = useRef<() => void>(() => {});
  const touched = useRef(false);
  const [flat, setFlat] = useState(false);
  const flatAngle = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    let raf = 0;
    let running = false;
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
        im.onerror = () => res(painted(PAINT[0], 0));
        im.src = src;
      });
    void (async () => {
      const srcs = list ? await Promise.all(list.map((p) => load(p.src))) : PAINT.map(painted);
      const imgs = srcs.map((s) => {
        const c = document.createElement("canvas");
        // the photo is drawn once at twice the card's size, so a 4K source stays sharp without being kept in memory
        c.width = 800;
        c.height = 1056;
        const g = c.getContext("2d")!;
        const iw = (s as HTMLImageElement).naturalWidth || (s as HTMLCanvasElement).width;
        const ih = (s as HTMLImageElement).naturalHeight || (s as HTMLCanvasElement).height;
        const k = Math.max(800 / iw, 1056 / ih);
        g.imageSmoothingQuality = "high";
        g.drawImage(s, (800 - iw * k) / 2, (1056 - ih * k) / 2, iw * k, ih * k);
        return c;
      });
      if (!alive) return;
      const R = canvas.current ? makeGL(canvas.current, imgs) : null;
      const el = box.current;
      if (!R || !el) {
        st.current.fallback = true;
        setFlat(true);
        return;
      }
      glRef.current = R;
      const resize = () => {
        const dpr = Math.min(2, devicePixelRatio || 1);
        R.size(Math.round(el.clientWidth * dpr), Math.round(el.clientHeight * dpr));
        kick.current();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      let last = performance.now();
      const frame = (now: number) => {
        const dt = Math.min(0.04, (now - last) / 1000);
        last = now;
        const s = st.current;
        const prev = s.a;
        if (!s.drag && s.target !== null) {
          // a springy settle, a little underdamped so it bounces flat
          const k = reduce ? 400 : 20;
          const c = reduce ? 40 : 6;
          const acc = (s.target - s.a) * k - s.v * c;
          s.v += acc * dt;
          s.a += s.v * dt;
          if (Math.abs(s.target - s.a) < 0.002 && Math.abs(s.v) < 0.02) {
            s.a = s.target;
            s.v = 0;
            if (Math.abs(s.a) >= Math.PI - 0.01) {
              // the turn is complete: the back becomes the front
              s.cur = (s.cur + (s.a > 0 ? 1 : -1) + n) % n;
              s.a = 0;
              s.target = 0;
              setIdx(s.cur);
              onChangeRef.current?.(s.cur);
            }
          }
        } else if (s.drag) s.v = (s.a - prev) / Math.max(dt, 1e-3);
        const back = (s.cur + (s.a >= 0 ? 1 : -1) + n) % n;
        R.setPair(s.cur, back);
        R.draw(s.a, s.drag ? s.v : s.v);
        const moving = s.drag || Math.abs(s.v) > 0.01 || (s.target !== null && Math.abs(s.target - s.a) > 0.002);
        if (moving) raf = requestAnimationFrame(frame);
        else running = false;
      };
      kick.current = () => {
        if (running) return;
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      };
      kick.current();
      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        R.dispose();
      };
    })();
    return () => {
      alive = false;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, reduce, n]);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const turn = (dir: 1 | -1) => {
    const s = st.current;
    if (s.fallback) {
      const next = (idx + dir + n) % n;
      setIdx(next);
      onChange?.(next);
      return;
    }
    if (s.target !== 0 || Math.abs(s.a) > 0.01) return;
    s.target = dir * Math.PI;
    s.v = dir * 2;
    sfx.whoosh(dir > 0 ? 700 : 1600, dir > 0 ? 1600 : 700, {
      dur: 0.45,
      gain: 0.05,
    });
    sfx.tick({ at: 0.42, freq: 900, gain: 0.04 });
    kick.current();
  };

  const drag = useRef<{ x: number; a0: number } | null>(null);
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    const s = st.current;
    if (s.fallback) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, a0: s.a };
    s.drag = true;
    s.target = null;
    kick.current();
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const w = box.current?.clientWidth ?? 300;
    // drag left turns forward
    st.current.a = Math.max(-Math.PI, Math.min(Math.PI, d.a0 - ((e.clientX - d.x) / w) * Math.PI * 0.9));
  };
  const onUp = () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const s = st.current;
    s.drag = false;
    const fling = s.v * 0.18;
    const proj = s.a + fling;
    if (proj > Math.PI / 2) s.target = Math.PI;
    else if (proj < -Math.PI / 2) s.target = -Math.PI;
    else s.target = 0;
    if (s.target !== 0) sfx.whoosh(800, 1800, { dur: 0.35, gain: 0.05 });
    kick.current();
  };
  const onKey = (e: RKeyboardEvent) => {
    if (e.key === "ArrowRight") turn(1);
    else if (e.key === "ArrowLeft") turn(-1);
    else return;
    e.preventDefault();
    touched.current = true;
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      turn(1);
    }, 2600);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce, n]);

  const btn = (dir: 1 | -1) => (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        touched.current = true;
        turn(dir);
      }}
      aria-label={dir > 0 ? "Next picture" : "Previous picture"}
      className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        border: 0,
        background: "#fff",
        color: "#1d1d1f",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 4px 10px -6px rgba(0,0,0,0.3)",
      }}
    >
      <Ico d={dir > 0 ? I.next : I.prev} size={15} />
    </motion.button>
  );

  return (
    <div
      className={`relative w-full rounded-[24px] bg-[#f2f2f4] select-none ${className}`}
      style={{
        padding: "28px 16px 22px",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        justifyItems: "center",
      }}
    >
      <div
        ref={box}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${titles[idx]}, picture ${idx + 1} of ${n}. Drag sideways or use the arrow keys to turn it.`}
        tabIndex={0}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
        className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] rounded-2xl"
        style={{
          position: "relative",
          width: "min(100%, 560px)",
          height: 440,
          cursor: "grab",
          touchAction: "pan-y",
        }}
      >
        {/* the shadow on the floor */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "30%",
            right: "30%",
            bottom: 22,
            height: 26,
            borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(0,0,0,0.28), transparent)",
            filter: "blur(6px)",
          }}
        />
        <canvas
          ref={canvas}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: flat ? "none" : "block",
          }}
        />
        {flat && list && (
          <div
            ref={flatAngle}
            style={{
              position: "absolute",
              top: "10%",
              bottom: "10%",
              left: "50%",
              aspectRatio: `${ASP}`,
              transform: "translateX(-50%)",
              borderRadius: 18,
              overflow: "hidden",
            }}
          >
            <img src={list[idx].src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
      </div>
      <div
        style={{
          width: "min(100%, 360px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "#86868b",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {String(idx + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={idx}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#1d1d1f",
                letterSpacing: "-0.02em",
              }}
            >
              {titles[idx]}
            </motion.span>
          </AnimatePresence>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {btn(-1)}
          {btn(1)}
        </div>
      </div>
    </div>
  );
}
