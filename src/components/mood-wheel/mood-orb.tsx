"use client";

/* eslint-disable react-hooks/refs, react-hooks/purity, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { type PointerEvent as RPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type Mood = {
  name: string;
  tint: string;
  warp: number;
  speed: number;
  freq: number;
};
export type MoodOrbProps = {
  question?: string;
  moods?: Mood[];
  defaultMood?: number;
  onLog?: (mood: Mood) => void;
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

// each mood has a colour it casts on the chrome, how churned the surface is, how fast it flows and how fine its folds are
const DEFAULT_MOODS: Mood[] = [
  { name: "Joyful", tint: "#ffb347", warp: 0.55, speed: 1.1, freq: 1.5 },
  { name: "Grateful", tint: "#f4a6a0", warp: 0.4, speed: 0.6, freq: 1.3 },
  { name: "Proud", tint: "#e8c15a", warp: 0.5, speed: 0.8, freq: 1.7 },
  { name: "Trusting", tint: "#8fb8ff", warp: 0.3, speed: 0.45, freq: 1.2 },
  { name: "Peaceful", tint: "#7fd4c8", warp: 0.18, speed: 0.28, freq: 1.0 },
  { name: "Disappointed", tint: "#7c8aa5", warp: 0.35, speed: 0.3, freq: 2.1 },
  { name: "Disapproving", tint: "#5c6b8a", warp: 0.6, speed: 0.5, freq: 2.4 },
  { name: "Frustrated", tint: "#ff6b4a", warp: 0.95, speed: 1.4, freq: 2.2 },
  { name: "Anxious", tint: "#a78bfa", warp: 1.1, speed: 1.8, freq: 2.8 },
  { name: "Startled", tint: "#e6f0ff", warp: 0.85, speed: 2.2, freq: 3.2 },
];

const VS = "attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }";
// a ball of liquid chrome: the sphere's normal is folded by a few rounds of domain warping, then it reflects a studio
// with a dark floor, a bright sky and soft bands in the mood's colour
const FS = `precision highp float;
uniform vec2 uRes; uniform float uDpr; uniform float uTime; uniform vec2 uC; uniform float uR; uniform vec2 uSq;
uniform vec3 uTint; uniform float uWarp; uniform float uFreq; uniform float uPulse;
vec3 env(vec3 d){
  // screen y points down, so turn it over: a dark floor below, a pale sky above, two black flags in the studio,
  // a thin warm glow at the horizon and a cool one behind
  vec3 r = vec3(d.x, -d.y, d.z);
  vec3 sky = mix(vec3(0.74, 0.79, 0.88), uTint, 0.14);
  vec3 c = mix(vec3(0.03, 0.035, 0.045), sky, smoothstep(-0.8, -0.2, r.y));
  c = mix(c, vec3(0.93, 0.95, 0.98), smoothstep(0.2, 0.9, r.y) * 0.7);
  c *= 1.0 - 0.88 * smoothstep(0.2, 0.03, abs(r.x + 0.36 + 0.25 * r.y));
  c *= 1.0 - 0.75 * smoothstep(0.14, 0.0, abs(r.x - 0.52 - 0.15 * r.y));
  c += vec3(0.95, 0.6, 0.3) * exp(-pow((r.y + 0.5) / 0.08, 2.0)) * 0.4;
  c += vec3(0.35, 0.45, 0.7) * smoothstep(0.2, 0.9, r.x * 0.5 - r.y * 0.5) * 0.25;
  c += vec3(1.0) * pow(max(0.0, dot(r, normalize(vec3(-0.35, 0.8, 0.5)))), 18.0) * 0.9;
  return c;
}
void main(){
  vec2 f = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  vec2 p = (f - uC) / (uR * uSq);
  float r = length(p);
    if (r > 1.0 + 1.5 / uR) {
    gl_FragColor = vec4(0.0);
    return;
  }
  vec3 n = vec3(p, sqrt(max(0.0, 1.0 - r * r)));
  float t = uTime;
  // turn slowly
  float ca = cos(t * 0.15); float sa = sin(t * 0.15);
  vec3 m = vec3(ca * n.x + sa * n.z, n.y, -sa * n.x + ca * n.z);
  vec3 q = m * uFreq;
  for (int i = 0; i < 3; i++) {
    q += uWarp * vec3(sin(q.y * 1.3 + t * 0.9), sin(q.z * 1.7 - t * 0.7), sin(q.x * 1.1 + t * 1.1));
  }
  vec3 bump = vec3(sin(q.x), sin(q.y + 1.3), sin(q.z + 2.1));
  vec3 nn = normalize(n + (0.62 + uPulse * 0.25) * bump * (0.3 + 0.7 * n.z));
  vec3 col = env(reflect(vec3(0.0, 0.0, -1.0), nn));
  // the rim catches more light, the very edge darkens like thick metal
  float fr = pow(1.0 - n.z, 3.0);
  col = mix(col, vec3(0.9, 0.92, 0.96), fr * 0.22);
  col *= 0.78 + 0.22 * smoothstep(0.0, 0.2, n.z);
  float a = clamp((1.0 - r) * uR * 1.2 + 0.5, 0.0, 1.0);
  gl_FragColor = vec4(col * a, a);
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
const H = 420;
const STEP = 0.3;

/**
 * A mood check-in: a ball of liquid chrome beside an arc of feelings. Scroll, drag the words or use the arrow keys and
 * the arc rolls around the ball, the chosen word framed in brackets, and the chrome changes with it: calm moods
 * flow slowly in soft colours, tense ones churn fast and fold tightly. Grab the ball and throw it across; it squashes
 * as it flies, lands on the other side on a spring, and the arc of words turns round to face it. Log saves the mood
 * with a pulse through the metal.
 */
export default function MoodOrb({
  question = "How are you feeling?",
  moods = DEFAULT_MOODS,
  defaultMood = 4,
  onLog,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: MoodOrbProps) {
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
  const [sel, setSel] = useState(defaultMood);
  const selRef = useRef(sel);
  selRef.current = sel;
  const [side, setSide] = useState<0 | 1>(0);
  const sideRef = useRef(side);
  sideRef.current = side;
  const [logged, setLogged] = useState<{ k: number; name: string } | null>(null);
  const [noGL, setNoGL] = useState(false);
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const words = useRef<(HTMLButtonElement | null)[]>([]);
  // springs the frame loop reads: the arc's roll, which side the ball is on, a held position while dragging, squash
  const st = useRef({
    roll: { x: defaultMood, v: 0 },
    sideK: { x: 0, v: 0 },
    hold: null as null | number,
    holdV: 0,
    pulse: 0,
    tint: hexRGB(moods[defaultMood].tint),
    warp: moods[defaultMood].warp,
    freq: moods[defaultMood].freq,
    speed: moods[defaultMood].speed,
    time: 0,
  });
  const [w, setW] = useState(440);

  const choose = (i: number) => {
    const n = Math.max(0, Math.min(moods.length - 1, i));
    if (n === selRef.current) return;
    setSel(n);
    sfxRef.current.tick({ freq: 1800 + n * 120, gain: 0.03 });
    sfxRef.current.note(330 * Math.pow(2, (n % 7) / 7), {
      dur: 0.25,
      gain: 0.025,
      bell: 0.3,
    });
  };
  const swap = (to: 0 | 1, v = 0) => {
    if (to !== sideRef.current) {
      setSide(to);
      sfxRef.current.whoosh(500, 2400, { dur: 0.5, gain: 0.04 });
    }
    st.current.sideK.v += v;
  };
  const log = () => {
    st.current.pulse = 1;
    setLogged({ k: Date.now(), name: moods[selRef.current].name });
    onLog?.(moods[selRef.current]);
    sfx.note(659, { dur: 0.25, gain: 0.04, bell: 0.5 });
    sfx.note(988, { at: 0.1, dur: 0.45, gain: 0.04, bell: 0.6 });
  };

  // the ball and the arc, every frame
  useEffect(() => {
    const el = card.current;
    const c = cv.current;
    if (!el || !c) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    const gl = c.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });
    let prog: WebGLProgram | null = null;
    if (gl) {
      const mk = (t: number, src: string) => {
        const s = gl.createShader(t)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s));
        return s;
      };
      prog = gl.createProgram()!;
      gl.attachShader(prog, mk(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) prog = null;
    }
    if (!gl || !prog) setNoGL(true);
    if (gl && prog) {
      gl.useProgram(prog);
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const la = gl.getAttribLocation(prog, "a");
      gl.enableVertexAttribArray(la);
      gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);
    }
    const U = (n: string) => (gl && prog ? gl.getUniformLocation(prog, n) : null);
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
      const m = moods[selRef.current];
      const snap = reduce;
      // mood: colour and character drift over
      const want = hexRGB(m.tint);
      const kf = snap ? 1 : Math.min(1, dt * 3);
      S.tint = S.tint.map((v, i) => v + (want[i] - v) * kf);
      S.warp += (m.warp - S.warp) * kf;
      S.freq += (m.freq - S.freq) * kf;
      S.speed += (m.speed - S.speed) * kf;
      S.time += snap ? 0 : dt * S.speed;
      S.pulse *= Math.exp(-dt * 3);
      if (snap) {
        S.roll.x = selRef.current;
        S.sideK.x = sideRef.current;
      } else {
        spring(S.roll, selRef.current, 140, 18, dt);
        if (S.hold === null) spring(S.sideK, sideRef.current, 120, 11, dt);
      }
      const W = el.clientWidth;
      const R = Math.min(96, W * 0.21);
      const leftX = R + 34;
      const rightX = W - R - 34;
      const k = S.hold ?? S.sideK.x;
      const cx = leftX + (rightX - leftX) * k;
      // on its way across the ball swells, as if it passes closer to you
      const mid = Math.sin(Math.PI * Math.max(0, Math.min(1, k)));
      const grow = 1 + 0.42 * mid;
      const cy = H * 0.5;
      // squash along the throw
      const vel = S.hold !== null ? S.holdV : S.sideK.v * (rightX - leftX);
      const sq = snap ? 0 : Math.max(-0.14, Math.min(0.14, vel / 5000));
      // the arc of words hugs the ball on its open side
      const base = Math.PI * Math.max(0, Math.min(1, k));
      const rad = R + 46;
      words.current.forEach((b, i) => {
        if (!b) return;
        const d = i - S.roll.x;
        const th = base + (k < 0.5 ? 1 : -1) * d * STEP;
        const x = cx + Math.cos(th) * rad;
        const y = cy + Math.sin(th) * rad;
        const fade = Math.max(0, 1 - Math.abs(d) * 0.2) * Math.max(0, 1 - mid * 1.6);
        const deg = ((th - base) * 180) / Math.PI;
        const anchor = Math.max(0, Math.min(1, k));
        b.style.transform = `translate(${x}px, ${y}px) translate(${-anchor * 100}%, -50%) rotate(${deg}deg) scale(${1 - Math.min(0.25, Math.abs(d) * 0.06)})`;
        b.style.transformOrigin = anchor > 0.5 ? "100% 50%" : "0% 50%";
        b.style.opacity = fade.toFixed(3);
        b.style.visibility = fade < 0.02 ? "hidden" : "visible";
      });
      if (!gl || !prog) {
        const fb = el.querySelector("[data-fallback]") as HTMLElement | null;
        if (fb) fb.style.transform = `translate(${cx - R}px, ${cy - R}px) scale(${grow})`;
        return;
      }
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
      gl.uniform1f(U("uTime"), S.time);
      gl.uniform2f(U("uC"), cx, cy);
      gl.uniform1f(U("uR"), R * grow * (1 + S.pulse * 0.06));
      gl.uniform2f(U("uSq"), 1 + Math.abs(sq), 1 - Math.abs(sq) * 0.7);
      gl.uniform3f(U("uTint"), S.tint[0], S.tint[1], S.tint[2]);
      gl.uniform1f(U("uWarp"), 0.32 + S.warp * 0.7);
      gl.uniform1f(U("uFreq"), S.freq);
      gl.uniform1f(U("uPulse"), S.pulse);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      const ext = gl?.getExtension("WEBGL_lose_context");
      window.setTimeout(() => ext?.loseContext(), 300);
    };
  }, [moods, reduce]);

  // grab the ball and throw it to the other side
  const grab = useRef<{
    x0: number;
    k0: number;
    lx: number;
    lt: number;
  } | null>(null);
  const span = () => {
    const W = card.current?.clientWidth ?? 440;
    const R = Math.min(96, W * 0.21);
    return W - 2 * (R + 34);
  };
  const onBall = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const S = st.current;
    grab.current = {
      x0: e.clientX,
      k0: S.sideK.x,
      lx: e.clientX,
      lt: performance.now(),
    };
    S.hold = S.sideK.x;
    S.holdV = 0;
    sfx.tick({ freq: 1400, gain: 0.03 });
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const g = grab.current;
    if (!g) return;
    const S = st.current;
    const raw = g.k0 + (e.clientX - g.x0) / span();
    S.hold = raw < 0 ? raw * 0.25 : raw > 1 ? 1 + (raw - 1) * 0.25 : raw;
    const now = performance.now();
    S.holdV = S.holdV * 0.6 + ((e.clientX - g.lx) / Math.max(1, now - g.lt)) * 1000 * 0.4;
    g.lx = e.clientX;
    g.lt = now;
  };
  const onUp = () => {
    const g = grab.current;
    if (!g) return;
    grab.current = null;
    const S = st.current;
    const k = S.hold ?? 0;
    const v = S.holdV / span();
    S.sideK.x = k;
    S.sideK.v = v;
    S.hold = null;
    const to: 0 | 1 = Math.abs(S.holdV) > 500 ? (S.holdV > 0 ? 1 : 0) : k > 0.5 ? 1 : 0;
    swap(to);
  };

  // autoplay: roll through a few moods, throw the ball across, log one
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  const [ghostDown, setGhostDown] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const ballXY = () => {
      const W = card.current?.clientWidth ?? 440;
      const R = Math.min(96, W * 0.21);
      return [sideRef.current ? W - R - 34 : R + 34, H * 0.5] as const;
    };
    const run = async () => {
      await wait(1100);
      while (ok()) {
        const seq = sideRef.current ? [7, 8, 9, 1] : [3, 2, 0, 5];
        for (const m of seq) {
          if (!ok()) return;
          choose(m);
          await wait(1500);
        }
        if (!ok()) return;
        // throw it across
        const [bx, by] = ballXY();
        setGhost(true);
        await Promise.all([animate(gx, bx, { duration: 0.6 }), animate(gy, by, { duration: 0.6 })]);
        setGhostDown(true);
        const S = st.current;
        const from = sideRef.current;
        S.hold = from;
        const R = Math.min(96, (card.current?.clientWidth ?? 440) * 0.21);
        let lastK: number = from;
        let lastT = performance.now();
        await animate(0, 1, {
          duration: 0.55,
          ease: [0.5, 0, 0.75, 0.6],
          onUpdate: (u) => {
            const k = from + (from ? -0.55 : 0.55) * u;
            const now = performance.now();
            S.holdV = ((k - lastK) * span()) / Math.max(0.001, (now - lastT) / 1000);
            lastK = k;
            lastT = now;
            S.hold = k;
            gx.set(R + 34 + span() * k);
          },
        });
        setGhostDown(false);
        S.sideK.x = S.hold ?? 0;
        S.sideK.v = S.holdV / span();
        S.hold = null;
        swap(from ? 0 : 1);
        setGhost(false);
        await wait(1600);
        if (!ok()) return;
        await wait(1200);
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

  const wheelAcc = useRef(0);
  const dragWords = useRef<{ y0: number; s0: number } | null>(null);
  const R = Math.min(96, w * 0.21);

  return (
    <div
      className={`relative w-full max-w-[460px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
      }}
    >
      <div
        ref={card}
        tabIndex={0}
        role="listbox"
        aria-label={question}
        aria-activedescendant={`mood-${sel}`}
        onPointerDown={(e) => {
          if (e.isTrusted) touched.current = true;
        }}
        onWheel={(e) => {
          touched.current = true;
          wheelAcc.current += e.deltaY;
          if (Math.abs(wheelAcc.current) > 36) {
            choose(selRef.current + Math.sign(wheelAcc.current));
            wheelAcc.current = 0;
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            touched.current = true;
            choose(selRef.current + (e.key === "ArrowDown" ? 1 : -1));
          } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            touched.current = true;
            swap(e.key === "ArrowRight" ? 1 : 0);
          } else if (e.key === "Enter") {
            touched.current = true;
            log();
          }
        }}
        className="outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        style={{
          position: "relative",
          height: H,
          borderRadius: 24,
          overflow: "hidden",
          background: "#181818",
          touchAction: "none",
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
            data-fallback
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: R * 2,
              height: R * 2,
              borderRadius: "50%",
              background: "radial-gradient(circle at 38% 28%, #f4f6fa, #9aa3b2 38%, #23252b 70%, #6b7280 96%)",
            }}
          />
        )}

        {/* the ball's handle */}
        <div
          aria-hidden="true"
          onPointerDown={onBall}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{
            position: "absolute",
            left: side ? w - 2 * R - 34 : 34,
            top: H / 2 - R,
            width: R * 2,
            height: R * 2,
            borderRadius: "50%",
            cursor: "grab",
            zIndex: 2,
          }}
        />

        {/* the arc of feelings */}
        <div
          onPointerDown={(e) => {
            touched.current = true;
            dragWords.current = { y0: e.clientY, s0: selRef.current };
          }}
          onPointerMove={(e) => {
            const d = dragWords.current;
            if (!d || e.buttons === 0) return;
            choose(Math.round(d.s0 + (e.clientY - d.y0) / 34));
          }}
          onPointerUp={() => (dragWords.current = null)}
          style={{ position: "absolute", inset: 0 }}
        >
          {moods.map((m, i) => {
            const on = i === sel;
            return (
              <button
                key={m.name}
                id={`mood-${i}`}
                ref={(b) => void (words.current[i] = b)}
                type="button"
                role="option"
                aria-selected={on}
                tabIndex={-1}
                onClick={() => {
                  touched.current = true;
                  if (i === selRef.current) log();
                  else choose(i);
                }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  border: 0,
                  background: "transparent",
                  padding: "4px 2px",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 400,
                  letterSpacing: "0",
                  color: on ? "#ffffff" : "rgba(255,255,255,0.42)",
                  transition: "color 0.25s",
                }}
              >
                {on && <span style={{ color: "rgba(255,255,255,0.75)", marginRight: 9 }}>[</span>}
                {m.name}
                {on && <span style={{ color: "rgba(255,255,255,0.75)", marginLeft: 9 }}>]</span>}
              </button>
            );
          })}
        </div>

        <span aria-live="polite" className="sr-only">
          {logged ? `Logged ${logged.name.toLowerCase()} for today` : ""}
        </span>

        {ghost && (
          <motion.span
            aria-hidden="true"
            animate={{ scale: ghostDown ? 0.78 : 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 26 }}
            style={{
              position: "absolute",
              left: -13,
              top: -13,
              x: gx,
              y: gy,
              width: 26,
              height: 26,
              borderRadius: 13,
              background: "rgba(255,255,255,0.22)",
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
