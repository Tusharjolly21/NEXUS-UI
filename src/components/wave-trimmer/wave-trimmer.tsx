"use client";

/* eslint-disable react-hooks/refs, react-hooks/purity, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import {
  type CSSProperties,
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type WaveNote = { t: number; f: number; d: number; g?: number };
export type WaveTrimmerProps = {
  title?: string;
  /** the clip, as notes the trimmer synthesises and draws; seconds and hertz */
  notes?: WaveNote[];
  duration?: number;
  /** spacing of the magnetic grid, in seconds */
  grid?: number;
  /** the shortest clip you can trim to, in seconds */
  minLength?: number;
  onTrim?: (start: number, end: number) => void;
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
  play: "M240 128a15.74 15.74 0 0 1-7.6 13.51L88.32 229.65a16 16 0 0 1-16.2.3A15.86 15.86 0 0 1 64 216.13V39.87a15.86 15.86 0 0 1 8.12-13.82a16 16 0 0 1 16.2.3l144.08 88.14A15.74 15.74 0 0 1 240 128",
  pause:
    "M216 48v160a16 16 0 0 1-16 16h-40a16 16 0 0 1-16-16V48a16 16 0 0 1 16-16h40a16 16 0 0 1 16 16M96 32H56a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h40a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16",
  loop: "M20 128a76.08 76.08 0 0 1 76-76h99l-3.52-3.51a12 12 0 1 1 17-17l24 24a12 12 0 0 1 0 17l-24 24a12 12 0 0 1-17-17L195 76H96a52.06 52.06 0 0 0-52 52a12 12 0 0 1-24 0m204-12a12 12 0 0 0-12 12a52.06 52.06 0 0 1-52 52H61l3.52-3.51a12 12 0 1 0-17-17l-24 24a12 12 0 0 0 0 17l24 24a12 12 0 1 0 17-17L61 204h99a76.08 76.08 0 0 0 76-76a12 12 0 0 0-12-12",
  trim: "M238.78 183.79L98.28 87.65A40.2 40.2 0 0 0 100 76a40 40 0 1 0-15.29 31.45l30 20.56l-30 20.56a40 40 0 1 0 3.57 59.74A39.73 39.73 0 0 0 100 180a40.2 40.2 0 0 0-1.72-11.66l37.72-25.8l89.22 61.06a12 12 0 0 0 13.56-19.81m-167.47 7.54A16 16 0 1 1 76 180a16 16 0 0 1-4.69 11.33M48.69 87.3a16 16 0 1 1 22.62 0a16 16 0 0 1-22.62 0m112.82 23.24a12 12 0 0 1 3.13-16.68l60.58-41.46a12 12 0 0 1 13.56 19.81l-60.59 41.46a12 12 0 0 1-16.68-3.13",
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

// a little tune at 120 bpm: a pentatonic line over a soft bass, so the trimmed part is something you can hear
const DEFAULT_NOTES: WaveNote[] = (() => {
  const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
  const line = [0, 2, 3, 4, -1, 3, 2, 0, 1, 2, 4, 5, 4, -1, 3, 2, 3, 4, 2, -1, 1, 0, 2, -1];
  const out: WaveNote[] = [];
  line.forEach((k, i) => {
    if (k >= 0)
      out.push({
        t: i * 0.5,
        f: scale[k],
        d: 0.42,
        g: 0.9 + (i % 4 === 0 ? 0.3 : 0),
      });
    if (i % 2 === 1 && k >= 0 && i % 6 !== 5)
      out.push({
        t: i * 0.5 + 0.25,
        f: scale[Math.min(5, k + 1)],
        d: 0.22,
        g: 0.45,
      });
  });
  for (let b = 0; b < 12; b++)
    out.push({
      t: b,
      f: [130.81, 146.83, 164.81, 130.81, 110, 130.81, 146.83, 98, 130.81, 164.81, 146.83, 130.81][b],
      d: 0.9,
      g: 0.75,
    });
  return out;
})();

const N = 84;
const H = 104;
const fmt = (t: number) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")}`;
type Sp = { x: number; v: number };
const spring = (s: Sp, to: number, k: number, d: number, dt: number) => {
  s.v += ((to - s.x) * k - s.v * d) * dt;
  s.x += s.v * dt;
};

/**
 * A trimmer for an audio clip. The waveform is a real little tune the component synthesises, so you hear exactly what
 * you keep. Drag either handle: while you hold it the waveform swells under it like a lens, the bars near your
 * finger spreading apart so you can place it precisely, and it moves more slowly there for fine control. The handles
 * are magnetic: they click onto every half beat with a tick, stretch on a rubber band past the ends of the clip or
 * when you push them too close together, and settle back when you let go. Play runs a playhead through the kept part,
 * lighting the bars as they sound. Trim lets everything outside fall away while the kept part springs out to fill the
 * width; Reset brings the whole clip back. Arrow keys move a focused handle, Shift for bigger steps; Space plays.
 */
export default function WaveTrimmer({
  title = "Morning idea",
  notes = DEFAULT_NOTES,
  duration = 12,
  grid = 0.5,
  minLength = 1,
  onTrim,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: WaveTrimmerProps) {
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
  const [sel, setSel] = useState({ s: 0, e: duration });
  const selRef = useRef(sel);
  selRef.current = sel;
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(true);
  const loopRef = useRef(loop);
  loopRef.current = loop;
  const [trimmed, setTrimmed] = useState<{ s: number; e: number } | null>(null);
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);
  const wave = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const hL = useRef<HTMLDivElement>(null);
  const hR = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const dimL = useRef<HTMLDivElement>(null);
  const dimR = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);

  // loudness of each bar, from the notes' envelopes and a little grain
  const amps = useMemo(() => {
    const a = new Array(N).fill(0).map((_, j) => {
      const t = ((j + 0.5) / N) * duration;
      let v = 0;
      for (const n of notes)
        if (t >= n.t - 0.02) v += (n.g ?? 1) * Math.exp(-(t - n.t) / (n.d * 0.55)) * (t < n.t ? 0.4 : 1);
      return v * (0.82 + 0.18 * Math.abs((Math.sin(j * 12.9898) * 43758.5453) % 1));
    });
    const m = Math.max(...a, 0.001);
    return a.map((v) => 0.08 + 0.92 * Math.pow(Math.min(1, v / m), 1.7));
  }, [notes, duration]);

  // nine bars for the little thumbnail in the header
  const thumb = useMemo(() => {
    const out: number[] = [];
    for (let k = 0; k < 9; k++) {
      const a = amps.slice(Math.floor((k * N) / 9), Math.floor(((k + 1) * N) / 9));
      out.push(a.reduce((x, y) => x + y, 0) / a.length);
    }
    const m = Math.max(...out);
    const lo = Math.min(...out);
    return out.map((v) => 0.25 + (0.75 * (v - lo)) / Math.max(0.001, m - lo));
  }, [amps]);

  // everything that moves lives here and is drawn every frame
  const st = useRef({
    s: { x: 0, v: 0 } as Sp,
    e: { x: duration, v: 0 } as Sp,
    v0: { x: 0, v: 0 } as Sp,
    v1: { x: duration, v: 0 } as Sp,
    lens: { x: 0, v: 0 } as Sp,
    focus: 0,
    fall: 0,
    trimFrom: null as null | { s: number; e: number },
    play: -1,
    drag: null as null | {
      which: "s" | "e";
      x: number;
      raw: number;
      snapped: number | null;
    },
    bump: { s: 0, e: 0 },
  });
  /** positions of bar edges across the width, swollen around the lens */
  const layout = (w: number) => {
    const S = st.current;
    const v0 = S.v0.x;
    const v1 = S.v1.x;
    const span = Math.max(0.2, v1 - v0);
    const lens = Math.max(0, S.lens.x);
    const c = (S.focus - v0) / span;
    // weight of every sample point along the clip, integrated into positions
    const M = 64;
    const xs: number[] = [0];
    let acc = 0;
    for (let k = 0; k < M; k++) {
      const u = (k + 0.5) / M;
      acc += 1 + lens * 2.6 * Math.exp(-(((u - c) / 0.07) ** 2));
      xs.push(acc);
    }
    const map = (t: number) => {
      const u = (t - v0) / span;
      if (u <= 0 || u >= 1) return u * w;
      const f = u * M;
      const k = Math.floor(f);
      return ((xs[k] + (xs[k + 1] - xs[k]) * (f - k)) / acc) * w;
    };
    const local = 1 + lens * 2.6;
    return { map, pxPerSec: (w / span) * (local / (acc / M)) };
  };

  useEffect(() => {
    const c = cv.current;
    const host = wave.current;
    if (!c || !host) return;
    const g = c.getContext("2d");
    if (!g) return;
    let raf = 0;
    let last = performance.now();
    let vis = true;
    const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting));
    io.observe(host);
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!vis) return;
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      const S = st.current;
      const sel0 = selRef.current;
      const snap = reduce;
      const tr = trimmedRef.current;
      if (snap) {
        S.s.x = sel0.s;
        S.e.x = sel0.e;
        S.v0.x = tr ? tr.s : 0;
        S.v1.x = tr ? tr.e : duration;
      } else {
        if (S.drag?.which !== "s") spring(S.s, sel0.s, 420, 26, dt);
        if (S.drag?.which !== "e") spring(S.e, sel0.e, 420, 26, dt);
        spring(S.v0, tr ? tr.s : 0, 120, 18, dt);
        spring(S.v1, tr ? tr.e : duration, 120, 18, dt);
      }
      spring(S.lens, S.drag ? 1 : 0, 220, 20, dt);
      S.fall = tr && S.trimFrom ? Math.min(2, S.fall + dt) : 0;
      S.bump.s *= Math.exp(-dt * 10);
      S.bump.e *= Math.exp(-dt * 10);
      const dpr = Math.min(2, devicePixelRatio || 1);
      const w = host.clientWidth;
      if (c.width !== Math.round(w * dpr)) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(H * dpr);
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, H);
      const { map } = layout(w);
      const sx = map(S.s.x);
      const ex = map(S.e.x);
      const ph = S.play;
      for (let j = 0; j < N; j++) {
        const t0 = (j / N) * duration;
        const t1 = ((j + 1) / N) * duration;
        let x0 = map(t0);
        let x1 = map(t1);
        const tm = (t0 + t1) / 2;
        const inside = tm >= S.s.x && tm <= S.e.x;
        let y = 0;
        let alpha = 1;
        // trimmed away: the bars outside drop and fade as the kept part opens out
        const out = S.trimFrom && (tm < S.trimFrom.s || tm > S.trimFrom.e);
        if (out) {
          const f = S.fall;
          y = 520 * f * f * (0.7 + ((j * 37) % 10) / 30);
          alpha = Math.max(0, 1 - f * 1.8);
          x0 += (tm < S.trimFrom!.s ? -1 : 1) * 30 * f;
          x1 += (tm < S.trimFrom!.s ? -1 : 1) * 30 * f;
        }
        if (x1 < -4 || x0 > w + 4 || alpha <= 0) continue;
        const bw = Math.max(1.4, (x1 - x0) * 0.6);
        const cx = (x0 + x1) / 2;
        const lit = ph >= 0 && inside && tm <= ph;
        const near = ph >= 0 && inside && Math.abs(tm - ph) < 0.18 ? 1 - Math.abs(tm - ph) / 0.18 : 0;
        const hgt = Math.max(4, amps[j] * (H - 22) * (1 + near * 0.18));
        g.globalAlpha = alpha;
        g.fillStyle = inside ? (lit ? "#ff9f0a" : ph >= 0 ? "#3a3a3c" : "#1d1d1f") : "#c7c7cc";
        const r = Math.min(bw / 2, 3);
        const top = H / 2 - hgt / 2 + y;
        g.beginPath();
        g.roundRect(cx - bw / 2, top, bw, hgt, r);
        g.fill();
      }
      g.globalAlpha = 1;
      // the frame, the handles and the dimmed outside follow the same mapping
      const bs = S.bump.s;
      const be = S.bump.e;
      if (hL.current) hL.current.style.transform = `translateX(${sx - 16}px) scale(${1 + bs * 0.18}, ${1 - bs * 0.08})`;
      if (hR.current) hR.current.style.transform = `translateX(${ex}px) scale(${1 + be * 0.18}, ${1 - be * 0.08})`;
      if (frame.current) {
        frame.current.style.left = `${sx}px`;
        frame.current.style.width = `${Math.max(0, ex - sx)}px`;
      }
      if (dimL.current) dimL.current.style.width = `${Math.max(0, sx)}px`;
      if (dimR.current) {
        dimR.current.style.left = `${ex}px`;
        dimR.current.style.width = `${Math.max(0, w - ex)}px`;
      }
      if (head.current) {
        head.current.style.opacity = ph >= 0 ? "1" : "0";
        head.current.style.transform = `translateX(${map(Math.max(S.s.x, Math.min(S.e.x, ph)))}px)`;
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [amps, duration, reduce]);
  const trimmedRef = useRef(trimmed);
  trimmedRef.current = trimmed;

  // ── playback: a scheduler that queues the notes a little ahead of the playhead ──
  const playRef = useRef<{
    t0: number;
    from: number;
    queued: number;
    raf: number;
  } | null>(null);
  const stop = () => {
    const p = playRef.current;
    if (p) cancelAnimationFrame(p.raf);
    playRef.current = null;
    st.current.play = -1;
    setPlaying(false);
  };
  const play = () => {
    stop();
    const { s } = selRef.current;
    const p = { t0: performance.now(), from: s, queued: s, raf: 0 };
    playRef.current = p;
    setPlaying(true);
    const tick = () => {
      const q = playRef.current;
      if (!q) return;
      const now = (performance.now() - q.t0) / 1000;
      const { s: s1, e: e1 } = selRef.current;
      const t = q.from + now;
      // queue up to 0.2 s ahead
      const until = Math.min(e1, t + 0.2);
      for (const n of notes) {
        if (n.t >= q.queued && n.t < until && n.t >= s1) {
          sfxRef.current.note(n.f, {
            at: Math.max(0, n.t - t),
            dur: Math.min(n.d, e1 - n.t + 0.05),
            gain: 0.05 * (n.g ?? 1) * (n.f < 200 ? 1.6 : 1),
            bell: n.f < 200 ? 0 : 0.35,
            type: n.f < 200 ? "triangle" : "sine",
          });
        }
      }
      q.queued = Math.max(q.queued, until);
      st.current.play = t;
      if (t >= e1) {
        if (loopRef.current) {
          q.t0 = performance.now();
          q.from = s1;
          q.queued = s1;
        } else {
          stop();
          return;
        }
      }
      q.raf = requestAnimationFrame(tick);
    };
    p.raf = requestAnimationFrame(tick);
  };
  useEffect(() => () => stop(), []);

  // ── dragging a handle ──
  const view = () => {
    const S = st.current;
    return { v0: S.v0.x, v1: S.v1.x };
  };
  const clampSel = (which: "s" | "e", raw: number) => {
    const { s, e } = selRef.current;
    const { v0, v1 } = view();
    const lo = which === "s" ? v0 : s + minLength;
    const hi = which === "s" ? e - minLength : v1;
    return { lo, hi, v: Math.max(lo, Math.min(hi, raw)) };
  };
  const setHandle = (which: "s" | "e", raw: number) => {
    const S = st.current;
    const d = S.drag;
    const { lo, hi, v } = clampSel(which, raw);
    // magnetic half beats
    const beat = Math.round(v / grid) * grid;
    let val = v;
    if (Math.abs(v - beat) < grid * 0.16 && beat >= lo - 1e-6 && beat <= hi + 1e-6) {
      val = beat;
      if (d && d.snapped !== beat) {
        d.snapped = beat;
        S.bump[which] = 1;
        sfxRef.current.tick({ freq: 3400, gain: 0.05 });
      }
    } else if (d) d.snapped = null;
    // past the limits it stretches on a rubber band
    const over = raw < lo ? raw - lo : raw > hi ? raw - hi : 0;
    const band = over ? Math.sign(over) * (1 - 1 / (Math.abs(over) / 0.6 + 1)) * 0.6 : 0;
    S[which].x = val + band;
    S[which].v = 0;
    setSel((p) => (p[which] === val ? p : { ...p, [which]: val }));
  };
  const down = (which: "s" | "e") => (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const S = st.current;
    S.focus = S[which].x;
    S.drag = { which, x: e.clientX, raw: S[which].x, snapped: null };
    sfx.tick({ freq: 1800, gain: 0.03 });
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const S = st.current;
    const d = S.drag;
    if (!d || !wave.current) return;
    // slower under the lens: a pixel is worth less time where the waveform is swollen
    const { pxPerSec } = layout(wave.current.clientWidth);
    d.raw += (e.clientX - d.x) / pxPerSec;
    d.x = e.clientX;
    S.focus += (d.raw - S.focus) * 0.3;
    setHandle(d.which, d.raw);
  };
  const up = () => {
    const S = st.current;
    if (!S.drag) return;
    S.drag = null;
    sfx.tick({ freq: 1200, gain: 0.025 });
  };
  const key = (which: "s" | "e") => (e: RKeyboardEvent<HTMLDivElement>) => {
    touched.current = true;
    const step = e.shiftKey ? grid : 0.1;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const cur = selRef.current[which];
      const { v } = clampSel(which, cur + (e.key === "ArrowRight" ? step : -step));
      setSel((p) => ({ ...p, [which]: Math.round(v * 10) / 10 }));
      sfx.tick({ freq: 2600, gain: 0.02 });
    }
  };

  const trim = () => {
    const { s, e } = selRef.current;
    if (trimmed || (s <= 0.01 && e >= duration - 0.01)) return;
    stop();
    st.current.trimFrom = { s, e };
    st.current.fall = 0;
    setTrimmed({ s, e });
    onTrim?.(s, e);
    sfx.whoosh(2400, 400, { dur: 0.6, gain: 0.05 });
    sfx.note(392, { at: 0.12, dur: 0.3, gain: 0.04 });
    sfx.note(587, { at: 0.24, dur: 0.4, gain: 0.04, bell: 0.5 });
  };
  const reset = () => {
    stop();
    st.current.trimFrom = null;
    setTrimmed(null);
    setSel({ s: 0, e: duration });
    sfx.whoosh(500, 2400, { dur: 0.5, gain: 0.04 });
  };

  // autoplay: drag the start in, the end in, play it, trim, reset
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  const [ghostDown, setGhostDown] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const pos = (el: Element | null | undefined) => {
      const c = card.current;
      if (!c || !el) return [0, 0] as const;
      const r = el.getBoundingClientRect();
      const cb = c.getBoundingClientRect();
      return [r.left - cb.left + r.width / 2, r.top - cb.top + r.height / 2] as const;
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
    const pull = async (which: "s" | "e", to: number, ms: number) => {
      const el = which === "s" ? hL.current : hR.current;
      if (!el || !wave.current) return;
      const [x, y] = pos(el);
      await go(x, y, 550);
      setGhostDown(true);
      const S = st.current;
      S.focus = S[which].x;
      S.drag = { which, x: 0, raw: S[which].x, snapped: null };
      const from = S[which].x;
      if (!card.current) return;
      const wl = wave.current.getBoundingClientRect();
      const cb = card.current.getBoundingClientRect();
      await animate(0, 1, {
        duration: ms / 1000,
        ease: [0.45, 0, 0.25, 1],
        onUpdate: (k) => {
          // the demo can be torn down mid-drag (the tile scrolls away), so the refs may already be empty
          if (!S.drag || !wave.current) return;
          const raw = from + (to - from) * k;
          S.drag.raw = raw;
          S.focus += (raw - S.focus) * 0.15;
          setHandle(which, raw);
          const { map } = layout(wave.current.clientWidth);
          gx.set(wl.left - cb.left + map(S[which].x) + (which === "s" ? -8 : 8));
        },
      });
      await wait(250);
      S.drag = null;
      setGhostDown(false);
    };
    const run = async () => {
      await wait(1200);
      while (ok()) {
        await pull("s", 2.5, 1300);
        if (!ok()) return;
        await wait(350);
        await pull("e", 7.0, 1300);
        if (!ok()) return;
        await go(...pos(card.current?.querySelector("[data-play]")));
        await tap();
        play();
        await wait(4800);
        if (!ok()) return;
        await go(...pos(card.current?.querySelector("[data-trim]")));
        await tap();
        trim();
        await wait(2200);
        if (!ok()) return;
        await go(...pos(card.current?.querySelector("[data-play]")));
        await tap();
        play();
        await wait(3000);
        stop();
        if (!ok()) return;
        await go(...pos(card.current?.querySelector("[data-trim]")));
        await tap();
        reset();
        setGhost(false);
        await wait(1800);
      }
    };
    run().catch((err) => {
      // torn down mid-step (the tile scrolled away): its elements are gone, so there is nothing to report
      if (alive) throw err;
    });
    return () => {
      alive = false;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const len = sel.e - sel.s;
  const whole = sel.s <= 0.01 && sel.e >= duration - 0.01;
  const handle = (which: "s" | "e") => (
    <div
      ref={which === "s" ? hL : hR}
      role="slider"
      tabIndex={0}
      aria-label={which === "s" ? "Start of the clip" : "End of the clip"}
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={Math.round(sel[which] * 10) / 10}
      aria-valuetext={fmt(sel[which])}
      onPointerDown={down(which)}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onKeyDown={key(which)}
      className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/70"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 16,
        height: H,
        borderRadius: which === "s" ? "10px 3px 3px 10px" : "3px 10px 10px 3px",
        background: "#ff9f0a",
        cursor: "ew-resize",
        touchAction: "none",
        display: "grid",
        placeItems: "center",
        transformOrigin: which === "s" ? "100% 50%" : "0 50%",
        boxShadow: "0 4px 10px -4px rgba(255,140,0,0.6)",
        zIndex: 3,
      }}
    >
      <span
        style={{
          width: 3,
          height: 22,
          borderRadius: 2,
          background: "rgba(255,255,255,0.9)",
        }}
      />
    </div>
  );

  return (
    <div
      className={`relative w-full max-w-[440px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#1d1d1f",
      }}
    >
      <div
        ref={card}
        tabIndex={-1}
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        onKeyDown={(e) => {
          if (e.key === " " && !(e.target instanceof HTMLButtonElement)) {
            e.preventDefault();
            touched.current = true;
            if (playing) stop();
            else play();
          }
        }}
        style={{
          position: "relative",
          borderRadius: 30,
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 30px 60px -34px rgba(0,0,0,0.35)",
          padding: "20px 22px 20px",
          outline: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* a thumbnail of the clip itself: the kept part in orange, following the handles, swaying while it plays */}
          <span
            aria-hidden="true"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "#f5f5f7",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
              display: "grid",
              placeItems: "center",
              flex: "none",
            }}
          >
            <svg width="26" height="22" viewBox="0 0 26 22">
              {thumb.map((a, k) => {
                const t = ((k + 0.5) / thumb.length) * duration;
                const kept = t >= sel.s && t <= sel.e;
                const h = Math.max(3, a * 20);
                return (
                  <motion.rect
                    key={k}
                    x={k * 3 + 0.5}
                    y={11 - h / 2}
                    width="2"
                    height={h}
                    rx="1"
                    animate={{
                      fill: kept ? "#ff9f0a" : "#c7c7cc",
                      scaleY: playing && kept && !reduce ? [1, 0.45 + ((k * 7) % 5) / 10, 1] : 1,
                    }}
                    transition={{
                      fill: { duration: 0.25 },
                      scaleY: playing
                        ? {
                            duration: 0.5 + (k % 3) * 0.12,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                        : { duration: 0.2 },
                    }}
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "50% 50%",
                    }}
                  />
                );
              })}
            </svg>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "#86868b",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {trimmed
                ? `Trimmed to ${(trimmed.e - trimmed.s).toFixed(1)}s of ${duration.toFixed(1)}s`
                : `Voice memo, ${duration.toFixed(1)}s`}
            </div>
          </div>
          <motion.button
            type="button"
            aria-pressed={loop}
            aria-label="Loop"
            whileTap={{ scale: 0.88 }}
            onClick={() => {
              touched.current = true;
              setLoop((l) => !l);
              sfx.tick({ freq: loop ? 1200 : 2400, gain: 0.03 });
            }}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              border: 0,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              background: loop ? "#fff4e5" : "#f5f5f7",
              color: loop ? "#ff8a00" : "#86868b",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            <Ico d={I.loop} size={15} />
          </motion.button>
        </div>

        {/* the waveform */}
        <div ref={wave} style={{ position: "relative", height: H, margin: "22px 16px 0" }}>
          <canvas ref={cv} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: H }} />
          <div
            ref={dimL}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              background: "linear-gradient(90deg, rgba(255,255,255,0.55), rgba(255,255,255,0.25))",
              pointerEvents: "none",
            }}
          />
          <div
            ref={dimR}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              background: "linear-gradient(270deg, rgba(255,255,255,0.55), rgba(255,255,255,0.25))",
              pointerEvents: "none",
            }}
          />
          <div
            ref={frame}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              borderTop: "3px solid #ff9f0a",
              borderBottom: "3px solid #ff9f0a",
              pointerEvents: "none",
              boxSizing: "border-box",
            }}
          />
          <div
            ref={head}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -6,
              bottom: -6,
              left: -1,
              width: 2,
              borderRadius: 1,
              background: "#1d1d1f",
              opacity: 0,
              pointerEvents: "none",
              zIndex: 2,
              boxShadow: "0 0 0 2px rgba(255,255,255,0.8)",
            }}
          />
          {handle("s")}
          {handle("e")}
        </div>

        {/* the numbers */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            margin: "18px 2px 16px",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <div>
            <div style={{ fontSize: 11.5, color: "#86868b" }}>Start</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{fmt(sel.s)}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11.5, color: "#86868b" }}>Length</div>
            <motion.div
              key={len.toFixed(1)}
              initial={{ y: reduce ? 0 : -4, opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.03em",
              }}
            >
              {len.toFixed(1)}s
            </motion.div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11.5, color: "#86868b" }}>End</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{fmt(sel.e)}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.button
            type="button"
            data-play
            aria-label={playing ? "Pause" : "Play the kept part"}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              touched.current = true;
              if (playing) stop();
              else play();
            }}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              border: 0,
              display: "grid",
              placeItems: "center",
              background: "#1d1d1f",
              color: "#fff",
              cursor: "pointer",
              flex: "none",
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={playing ? "p" : "s"}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: "spring", stiffness: 600, damping: 26 }}
                style={{ display: "grid", marginLeft: playing ? 0 : 2 }}
              >
                <Ico d={playing ? I.pause : I.play} size={19} />
              </motion.span>
            </AnimatePresence>
          </motion.button>
          <div
            style={{
              flex: 1,
              fontSize: 12.5,
              color: "#86868b",
              lineHeight: 1.35,
            }}
          >
            {trimmed
              ? "This is the new clip. Reset brings back the whole recording."
              : "Drag the handles. They click onto every half beat."}
          </div>
          <motion.button
            type="button"
            data-trim
            whileTap={{ scale: 0.93 }}
            disabled={!trimmed && whole}
            onClick={() => {
              touched.current = true;
              if (trimmed) reset();
              else trim();
            }}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              height: 40,
              padding: "0 16px",
              borderRadius: 20,
              border: 0,
              fontSize: 14,
              fontWeight: 650,
              cursor: !trimmed && whole ? "default" : "pointer",
              background: trimmed ? "#f5f5f7" : whole ? "#f5f5f7" : "#ff9f0a",
              color: trimmed ? "#1d1d1f" : whole ? "#c7c7cc" : "#fff",
              transition: "background 0.25s, color 0.25s",
              flex: "none",
            }}
          >
            {!trimmed && <Ico d={I.trim} size={15} />}
            {trimmed ? "Reset" : "Trim"}
          </motion.button>
        </div>

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
              background: "rgba(29,29,31,0.18)",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.85), 0 6px 14px -4px rgba(0,0,0,0.35)",
              pointerEvents: "none",
              zIndex: 9,
            }}
          />
        )}
      </div>
    </div>
  );
}
