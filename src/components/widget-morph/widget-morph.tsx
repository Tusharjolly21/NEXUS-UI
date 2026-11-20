"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import {
  type CSSProperties,
  type PointerEvent as RPointerEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type WidgetDay = {
  day: string;
  temp: number;
  sky: "sun" | "cloud" | "snow";
  hours: number[];
};
export type WidgetMorphProps = {
  /** which widget shows first: 0 night mode, 1 revenue, 2 weather, 3 now playing */
  start?: number;
  /** twelve monthly totals, in thousands */
  revenue?: number[];
  city?: string;
  forecast?: WidgetDay[];
  track?: { title: string; artist: string; length: number };
  onNightMode?: (on: boolean) => void;
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
  back: "M208 47.88v160.24a16 16 0 0 1-24.43 13.43L64 146.77V216a8 8 0 0 1-16 0V40a8 8 0 0 1 16 0v69.23l119.57-74.78A15.95 15.95 0 0 1 208 47.88",
  next: "M208 40v176a8 8 0 0 1-16 0v-69.23L72.43 221.55A15.95 15.95 0 0 1 48 208.12V47.88a15.95 15.95 0 0 1 24.43-13.43L192 109.23V40a8 8 0 0 1 16 0",
  sun: "M120 40V16a8 8 0 0 1 16 0v24a8 8 0 0 1-16 0m72 88a64 64 0 1 1-64-64a64.07 64.07 0 0 1 64 64m-16 0a48 48 0 1 0-48 48a48.05 48.05 0 0 0 48-48M58.34 69.66a8 8 0 0 0 11.32-11.32l-16-16a8 8 0 0 0-11.32 11.32Zm0 116.68l-16 16a8 8 0 0 0 11.32 11.32l16-16a8 8 0 0 0-11.32-11.32M192 72a8 8 0 0 0 5.66-2.34l16-16a8 8 0 0 0-11.32-11.32l-16 16A8 8 0 0 0 192 72m5.66 114.34a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32-11.32ZM48 128a8 8 0 0 0-8-8H16a8 8 0 0 0 0 16h24a8 8 0 0 0 8-8m80 80a8 8 0 0 0-8 8v24a8 8 0 0 0 16 0v-24a8 8 0 0 0-8-8m112-88h-24a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16",
  cloud:
    "M160 40a88.09 88.09 0 0 0-78.71 48.67A64 64 0 1 0 72 216h88a88 88 0 0 0 0-176m0 160H72a48 48 0 0 1 0-96c1.1 0 2.2 0 3.29.11A88 88 0 0 0 72 128a8 8 0 0 0 16 0a72 72 0 1 1 72 72",
  snow: "M223.77 150.09a8 8 0 0 1-5.86 9.68l-24.64 6l6.46 24.11a8 8 0 0 1-5.66 9.8a8.3 8.3 0 0 1-2.07.32a8 8 0 0 1-7.72-5.93l-7.72-28.8L136 141.86v46.83l21.66 21.65a8 8 0 0 1-11.32 11.32L128 203.31l-18.34 18.35a8 8 0 0 1-11.32-11.32L120 188.69v-46.83l-40.55 23.41l-7.72 28.8A8 8 0 0 1 64 200a8.3 8.3 0 0 1-2.08-.27a8 8 0 0 1-5.66-9.8l6.46-24.11l-24.64-6a8 8 0 0 1 3.82-15.54l29.45 7.23L112 128l-40.64-23.46l-29.45 7.23A8 8 0 0 1 40 112a8 8 0 0 1-1.91-15.77l24.64-6l-6.46-24.16a8 8 0 0 1 15.46-4.14l7.72 28.8L120 114.14V67.31L98.34 45.66a8 8 0 0 1 11.32-11.32L128 52.69l18.34-18.35a8 8 0 0 1 11.32 11.32L136 67.31v46.83l40.55-23.41l7.72-28.8a8 8 0 0 1 15.46 4.14l-6.46 24.11l24.64 6A8 8 0 0 1 216 112a8 8 0 0 1-1.91-.23l-29.45-7.23L144 128l40.64 23.46l29.45-7.23a8 8 0 0 1 9.68 5.86",
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

const DEFAULT_REVENUE = [31.2, 33.8, 32.1, 29.6, 30.4, 34.9, 36.2, 35.1, 38.4, 41.7, 40.2, 43.36];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DEFAULT_FORECAST: WidgetDay[] = [
  { day: "Today", temp: -4, sky: "sun", hours: [-9, -8, -6, -4, -3, -4, -6] },
  { day: "Wed", temp: -1, sky: "cloud", hours: [-6, -5, -3, -1, 0, -1, -3] },
  { day: "Thu", temp: 2, sky: "snow", hours: [-2, -1, 1, 2, 2, 0, -1] },
];
const HOURS = ["6", "9", "12", "15", "18", "21", "24"];
const TABS = [
  { name: "Night", h: 196 },
  { name: "Revenue", h: 232 },
  { name: "Weather", h: 238 },
  { name: "Music", h: 148 },
];
const INK = "#111113";
const MUTE = "#8e8e93";
const BLUE = "#2f6bff";

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
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 210,
                      damping: 27,
                      mass: 0.55 + (key % 3) * 0.1,
                    }
              }
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

// a smooth line through points, as an SVG path
const smooth = (pts: (readonly [number, number])[]) => {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`;
  }
  return d;
};

// the night sky dial: a window onto the sky that turns from day to night
function Sky({ night, reduce, uid }: { night: boolean; reduce: boolean; uid: string }) {
  const t = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 70, damping: 16 };
  const stars = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        x: 14 + ((i * 41 + 7) % 92),
        y: 12 + ((i * 23 + (i % 4) * 9) % 58),
        r: 0.6 + (i % 3) * 0.35,
      })),
    [],
  );
  return (
    <svg viewBox="0 0 120 120" width="112" height="112" aria-hidden="true" style={{ display: "block", flex: "none" }}>
      <defs>
        <clipPath id={`${uid}-sky`}>
          <circle cx="60" cy="60" r="56" />
        </clipPath>
        <linearGradient id={`${uid}-day`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bcdcff" />
          <stop offset="1" stopColor="#eef6ff" />
        </linearGradient>
        <linearGradient id={`${uid}-night`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1026" />
          <stop offset="1" stopColor="#2a2f5a" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${uid}-sky)`}>
        <rect width="120" height="120" fill={`url(#${uid}-day)`} />
        <motion.rect
          width="120"
          height="120"
          fill={`url(#${uid}-night)`}
          initial={false}
          animate={{ opacity: night ? 1 : 0 }}
          transition={{ duration: reduce ? 0 : 0.9 }}
        />
        {stars.map((s, i) => (
          <motion.circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#fff"
            initial={false}
            animate={{ opacity: night ? 0.9 : 0 }}
            transition={{
              duration: reduce ? 0 : 0.5,
              delay: reduce ? 0 : night ? 0.4 + i * 0.04 : 0,
            }}
          />
        ))}
        <motion.circle
          cx="60"
          r="15"
          fill="#ffd36b"
          initial={false}
          animate={{ cy: night ? 130 : 52 }}
          transition={t}
        />
        <motion.g
          initial={false}
          animate={{ y: night ? 0 : 90 }}
          transition={{ ...t, delay: reduce ? 0 : night ? 0.25 : 0 }}
        >
          <circle cx="64" cy="46" r="12" fill="#f1f0ea" />
          <circle cx="70" cy="42" r="11" fill="#141a3a" />
        </motion.g>
        {/* the hills */}
        <path
          d="M0 88 Q30 74 60 84 T120 80 V120 H0 Z"
          fill={night ? "#1a1f3d" : "#cfe3c9"}
          style={{ transition: "fill 0.9s" }}
        />
        <path
          d="M0 98 Q36 88 70 96 T120 94 V120 H0 Z"
          fill={night ? "#11152c" : "#b6d4ae"}
          style={{ transition: "fill 0.9s" }}
        />
      </g>
      <circle
        cx="60"
        cy="60"
        r="56"
        fill="none"
        stroke={night ? "rgba(255,255,255,0.12)" : "rgba(17,17,19,0.08)"}
        style={{ transition: "stroke 0.6s" }}
      />
    </svg>
  );
}

// a progress line that wiggles while it plays: the part already heard is a moving wave, the rest a flat line, and
// the wave relaxes flat when paused
function Squiggle({ progress, playing, reduce }: { progress: number; playing: boolean; reduce: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const played = useRef<SVGPathElement>(null);
  const rest = useRef<SVGPathElement>(null);
  const knob = useRef<SVGCircleElement>(null);
  const st = useRef({ amp: 0, phase: 0, p: progress, want: progress, playing });
  st.current.want = progress;
  st.current.playing = playing;
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const H = 16;
    const mid = H / 2;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const S = st.current;
      const W = box.current?.clientWidth ?? 200;
      const k = reduce ? 1 : Math.min(1, dt * 6);
      S.amp += ((S.playing && !reduce ? 3 : 0) - S.amp) * k;
      S.p += (S.want - S.p) * Math.min(1, dt * 8);
      if (!reduce) S.phase += dt * (S.playing ? 7 : 2);
      const x = Math.max(0, Math.min(W, S.p * W));
      // the wave, sampled every 2 px; it fades in from the start so the line leaves the edge cleanly
      let d = `M 0 ${mid}`;
      for (let px = 2; px <= x; px += 2) {
        const ease = Math.min(1, px / 10) * Math.min(1, (x - px) / 6 + 0.4);
        d += ` L ${px} ${(mid + Math.sin(px / 4.2 - S.phase) * S.amp * ease).toFixed(2)}`;
      }
      d += ` L ${x} ${mid}`;
      played.current?.setAttribute("d", d);
      rest.current?.setAttribute("d", `M ${Math.min(W, x + 6)} ${mid} L ${W} ${mid}`);
      knob.current?.setAttribute("cx", x.toFixed(2));
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);
  return (
    <div ref={box} style={{ position: "absolute", inset: 0 }}>
      <svg width="100%" height="16" style={{ display: "block", overflow: "visible" }} aria-hidden="true">
        <path ref={rest} fill="none" stroke="rgba(17,17,19,0.14)" strokeWidth="3" strokeLinecap="round" />
        <path ref={played} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle ref={knob} cy="8" r="5" fill={INK} />
      </svg>
    </div>
  );
}

/**
 * A wide widget card that turns into four. Pick one from the switch along the top and the card grows or shrinks to
 * its height on a spring while the contents cross-fade: night mode, where flicking the switch sets the sun behind the
 * hills, raises the moon and turns the card dark; revenue, with an area chart you can scrub as the total rolls; the
 * weather, a day's temperature curve for whichever day you pick; and a track with a scrubbable progress bar.
 */
export default function WidgetMorph({
  start = 0,
  revenue = DEFAULT_REVENUE,
  city = "Almaty",
  forecast = DEFAULT_FORECAST,
  track = { title: "Low Tide", artist: "Mara Lind", length: 214 },
  onNightMode,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: WidgetMorphProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const uid = "wm" + useId().replace(/:/g, "");
  const [idx, setIdx] = useState(start);
  const idxRef = useRef(idx);
  idxRef.current = idx;
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);

  const [night, setNight] = useState(false);
  const [rev, setRev] = useState<number | null>(null);
  const [day, setDay] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(72);

  const go = (n: number) => {
    const k = ((n % TABS.length) + TABS.length) % TABS.length;
    if (k === idxRef.current) return;
    setIdx(k);
    sfx.tick({ freq: 1700 + k * 160, gain: 0.03 });
  };
  const flick = (on: boolean) => {
    setNight(on);
    onNightMode?.(on);
    sfx.tick({ freq: on ? 1500 : 1100, gain: 0.045 });
    sfx.whoosh(on ? 1600 : 500, on ? 500 : 1600, {
      at: 0.05,
      dur: 0.7,
      gain: 0.02,
    });
  };
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setPos((p) => (p + 1) % track.length), 1000);
    return () => window.clearInterval(id);
  }, [playing, track.length]);

  // autoplay
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  const [ghostDown, setGhostDown] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const at = (sel: string, fx = 0.5, fy = 0.5) => {
      const s = card.current;
      const e = s?.querySelector(sel);
      if (!s || !e) return [0, 0] as const;
      const r = e.getBoundingClientRect();
      const b = s.getBoundingClientRect();
      return [r.left - b.left + r.width * fx, r.top - b.top + r.height * fy] as const;
    };
    const move = async (x: number, y: number, ms = 500) => {
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
    const tab = async (k: number) => {
      await move(...at(`[data-tab='${k}']`));
      await tap();
      go(k);
      await wait(800);
    };
    const run = async () => {
      await wait(1100);
      while (ok()) {
        await tab(0);
        await move(...at("[data-switch]"));
        await tap();
        flick(true);
        await wait(2000);
        await tap();
        flick(false);
        await wait(1100);
        if (!ok()) return;
        await tab(1);
        const [x0, y0] = at("[data-chart]", 0.03, 0.5);
        const [x1] = at("[data-chart]", 0.97, 0.5);
        await move(x0, y0, 400);
        await animate(0, 1, {
          duration: 1.8,
          ease: "easeInOut",
          onUpdate: (k) => {
            gx.set(x0 + (x1 - x0) * k);
            setRev(Math.round(k * (revenue.length - 1)));
          },
        });
        setRev(null);
        if (!ok()) return;
        await tab(2);
        for (const d of [1, 2, 0]) {
          await move(...at(`[data-day='${d}']`), 380);
          await tap();
          setDay(d);
          sfx.tick({ freq: 1800, gain: 0.03 });
          await wait(900);
        }
        if (!ok()) return;
        await tab(3);
        await move(...at("[data-play]"));
        await tap();
        setPlaying(true);
        await wait(2600);
        await tap();
        setPlaying(false);
        setGhost(false);
        await wait(900);
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

  const dark = idx === 0 && night;
  const fg = dark ? "#f5f5f7" : INK;
  const mute = dark ? "rgba(235,235,245,0.5)" : MUTE;
  const label: CSSProperties = {
    fontSize: 12.5,
    color: mute,
    transition: "color 0.6s",
  };

  // revenue chart
  const CW = 340;
  const CH = 96;
  const mn = Math.min(...revenue) * 0.96;
  const mx = Math.max(...revenue);
  const rp = revenue.map(
    (v, i) => [(i / (revenue.length - 1)) * CW, CH - 6 - ((v - mn) / (mx - mn || 1)) * (CH - 16)] as const,
  );
  const revPath = useMemo(() => smooth(rp), [revenue]); // eslint-disable-line react-hooks/exhaustive-deps
  const ri = rev ?? revenue.length - 1;
  const change = ((revenue[ri] - revenue[Math.max(0, ri - 1)]) / revenue[Math.max(0, ri - 1)]) * 100;

  // weather curve
  const f = forecast[day];
  const tmin = Math.min(...forecast.flatMap((d) => d.hours)) - 1;
  const tmax = Math.max(...forecast.flatMap((d) => d.hours)) + 1;
  const WH = 72;
  const wp = f.hours.map(
    (v, i) => [(i / (f.hours.length - 1)) * CW, WH - 4 - ((v - tmin) / (tmax - tmin)) * (WH - 12)] as const,
  );
  const wPath = smooth(wp);

  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 32 };
  const sign = (n: number) => `${n < 0 ? "−" : ""}${Math.abs(n)}`;

  const views = [
    // night mode
    <div key="n" style={{ display: "flex", alignItems: "center", gap: 18, height: "100%" }}>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div style={label}>Night mode</div>
        <div
          style={{
            position: "relative",
            height: 52,
            overflow: "hidden",
            marginTop: 4,
          }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={night ? "on" : "off"}
              initial={{ y: 40, opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -40, opacity: 0, filter: "blur(4px)" }}
              transition={{
                y: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.25 },
                filter: { duration: 0.25 },
              }}
              style={{
                fontSize: 46,
                fontWeight: 500,
                letterSpacing: "-0.05em",
                lineHeight: "52px",
              }}
            >
              {night ? "On" : "Off"}
            </motion.div>
          </AnimatePresence>
        </div>
        <div style={{ ...label, marginTop: 2 }}>{night ? "Until 07:00, calls silenced" : "Turns on at 22:00"}</div>
        <button
          type="button"
          data-switch
          role="switch"
          aria-checked={night}
          aria-label="Night mode"
          onClick={() => {
            touched.current = true;
            flick(!night);
          }}
          className="outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          style={{
            marginTop: "auto",
            position: "relative",
            width: 56,
            height: 32,
            borderRadius: 16,
            border: 0,
            background: night ? "#5e5ce6" : "rgba(17,17,19,0.1)",
            cursor: "pointer",
            transition: "background 0.35s",
          }}
        >
          <motion.span
            initial={false}
            animate={{ x: night ? 24 : 0 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 600, damping: 34 }}
            style={{
              position: "absolute",
              left: 3,
              top: 3,
              width: 26,
              height: 26,
              borderRadius: 13,
              background: "#fff",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
          />
        </button>
      </div>
      <Sky night={night} reduce={reduce} uid={uid} />
    </div>,
    // revenue
    <div key="r" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <div style={label}>{rev === null ? "Revenue, this month" : `Revenue, ${MONTHS[ri]}`}</div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: change >= 0 ? "#1f9d55" : "#d70015",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {change >= 0 ? "+" : "−"}
          {Math.abs(change).toFixed(1)}%
        </div>
      </div>
      <Roll
        text={`$${Math.round(revenue[ri] * 1000).toLocaleString("en-US")}`}
        reduce={reduce}
        style={{
          fontSize: 34,
          fontWeight: 500,
          letterSpacing: "-0.04em",
          marginTop: 4,
        }}
      />
      <div
        data-chart
        role="img"
        aria-label={`Revenue for the last ${revenue.length} months`}
        onPointerMove={(e: RPointerEvent<HTMLDivElement>) => {
          const r = e.currentTarget.getBoundingClientRect();
          setRev(
            Math.max(
              0,
              Math.min(revenue.length - 1, Math.round(((e.clientX - r.left) / r.width) * (revenue.length - 1))),
            ),
          );
        }}
        onPointerLeave={() => setRev(null)}
        style={{
          position: "relative",
          marginTop: "auto",
          height: CH,
          cursor: "crosshair",
          touchAction: "pan-y",
        }}
      >
        <svg
          viewBox={`0 0 ${CW} ${CH}`}
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          style={{ display: "block", overflow: "visible" }}
        >
          <defs>
            <linearGradient id={`${uid}-a`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={BLUE} stopOpacity="0.18" />
              <stop offset="1" stopColor={BLUE} stopOpacity="0" />
            </linearGradient>
            <clipPath id={`${uid}-c`}>
              <motion.rect
                x="0"
                y="-10"
                height={CH + 20}
                initial={reduce ? false : { width: 0 }}
                animate={{ width: CW }}
                transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
              />
            </clipPath>
          </defs>
          <g clipPath={`url(#${uid}-c)`}>
            <path d={`${revPath} L ${CW} ${CH} L 0 ${CH} Z`} fill={`url(#${uid}-a)`} />
            <path
              d={revPath}
              fill="none"
              stroke={BLUE}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
            />
          </g>
        </svg>
        <motion.div
          initial={false}
          animate={{
            left: `${(rp[ri][0] / CW) * 100}%`,
            opacity: rev === null ? 0 : 1,
          }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 38 }}
          style={{
            position: "absolute",
            top: -4,
            bottom: 0,
            width: 1,
            background: "rgba(17,17,19,0.12)",
            pointerEvents: "none",
          }}
        />
        <motion.span
          initial={false}
          animate={{ left: `${(rp[ri][0] / CW) * 100}%`, top: rp[ri][1] }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 38 }}
          style={{
            position: "absolute",
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
            borderRadius: 5,
            background: "#fff",
            boxShadow: `inset 0 0 0 2.5px ${BLUE}, 0 2px 6px rgba(47,107,255,0.35)`,
            pointerEvents: "none",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10.5,
          color: MUTE,
          marginTop: 8,
        }}
      >
        {MONTHS.filter((_, i) => i % 2 === 0).map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>,
    // weather
    <div key="w" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={label}>{city}</div>
          <Roll
            text={`${sign(f.temp)}°`}
            reduce={reduce}
            style={{
              fontSize: 40,
              fontWeight: 500,
              letterSpacing: "-0.05em",
              marginTop: 4,
            }}
          />
        </div>
        <div
          role="tablist"
          aria-label="Day"
          style={{
            display: "flex",
            gap: 2,
            padding: 3,
            borderRadius: 12,
            background: "#f2f2f4",
          }}
        >
          {forecast.map((d, i) => (
            <button
              key={d.day}
              type="button"
              role="tab"
              data-day={i}
              aria-selected={i === day}
              onClick={() => {
                touched.current = true;
                setDay(i);
                sfx.tick({ freq: 1800, gain: 0.03 });
              }}
              className="outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 5,
                height: 28,
                padding: "0 9px",
                borderRadius: 9,
                border: 0,
                background: "transparent",
                color: i === day ? INK : MUTE,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {i === day && (
                <motion.span
                  layoutId={`${uid}-day`}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 38 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 9,
                    background: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                />
              )}
              <span style={{ position: "relative", display: "flex" }}>
                <Ico d={d.sky === "sun" ? I.sun : d.sky === "cloud" ? I.cloud : I.snow} size={13} />
              </span>
              <span style={{ position: "relative" }}>{d.day}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginTop: "auto" }}>
        <svg
          viewBox={`-8 -14 ${CW + 16} ${WH + 18}`}
          width="100%"
          height={WH + 18}
          style={{ display: "block", overflow: "visible" }}
          aria-label={`Temperature through ${f.day.toLowerCase()}`}
          role="img"
        >
          <motion.path
            initial={false}
            animate={{ d: wPath }}
            transition={spring}
            fill="none"
            stroke={INK}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {wp.map(([x, y], i) => (
            <g key={i}>
              <motion.circle
                initial={false}
                animate={{ cx: x, cy: y }}
                transition={spring}
                r="3"
                fill="#fff"
                stroke={INK}
                strokeWidth="1.5"
              />
              <motion.text
                initial={false}
                animate={{ x, y: y - 9 }}
                transition={spring}
                textAnchor="middle"
                fontSize="10"
                fill={INK}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {sign(f.hours[i])}&deg;
              </motion.text>
            </g>
          ))}
        </svg>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10.5,
            color: MUTE,
            marginTop: 6,
          }}
        >
          {HOURS.map((h) => (
            <span key={h} style={{ width: 20, textAlign: "center" }}>
              {h}
            </span>
          ))}
        </div>
      </div>
    </div>,
    // music
    <div key="m" style={{ display: "flex", alignItems: "center", gap: 14, height: "100%" }}>
      <motion.div
        animate={playing && !reduce ? { rotate: 360 } : { rotate: 0 }}
        transition={playing && !reduce ? { duration: 12, repeat: Infinity, ease: "linear" } : { duration: 0.6 }}
        style={{
          width: 84,
          height: 84,
          borderRadius: 42,
          flex: "none",
          background:
            "radial-gradient(circle at 50% 50%, #fff 0 9%, #1c1c1e 10% 13%, transparent 14%), conic-gradient(from 30deg, #2d2a4a, #6a5acd, #ff9a8b, #2d2a4a)",
          boxShadow: "0 8px 20px -8px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(0,0,0,0.06)",
        }}
        aria-hidden="true"
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {track.title}
        </div>
        <div style={label}>{track.artist}</div>
        <div
          role="slider"
          tabIndex={0}
          aria-label="Position"
          aria-valuemin={0}
          aria-valuemax={track.length}
          aria-valuenow={pos}
          onPointerDown={(e) => {
            touched.current = true;
            const r = e.currentTarget.getBoundingClientRect();
            setPos(Math.round(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * track.length));
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") setPos((p) => Math.min(track.length, p + 5));
            else if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5));
          }}
          className="outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          style={{
            position: "relative",
            height: 16,
            marginTop: 8,
            cursor: "pointer",
            borderRadius: 4,
          }}
        >
          <Squiggle progress={pos / track.length} playing={playing} reduce={reduce} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 10.5,
            color: MUTE,
            fontVariantNumeric: "tabular-nums",
            marginTop: 2,
          }}
        >
          <span style={{ flex: 1 }}>
            {Math.floor(pos / 60)}:{String(pos % 60).padStart(2, "0")}
          </span>
          <span>
            {Math.floor(track.length / 60)}:{String(track.length % 60).padStart(2, "0")}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: INK }}>
        <button
          type="button"
          aria-label="Back to the start"
          onClick={() => {
            touched.current = true;
            setPos(0);
          }}
          className="outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            border: 0,
            background: "transparent",
            color: "inherit",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <Ico d={I.back} size={14} />
        </button>
        <motion.button
          type="button"
          data-play
          whileTap={{ scale: 0.9 }}
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => {
            touched.current = true;
            setPlaying((p) => !p);
            sfx.tick({ freq: 1200, gain: 0.04 });
          }}
          className="outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            border: 0,
            background: INK,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={playing ? "p" : "s"}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              style={{ display: "grid", marginLeft: playing ? 0 : 2 }}
            >
              <Ico d={playing ? I.pause : I.play} size={15} />
            </motion.span>
          </AnimatePresence>
        </motion.button>
        <button
          type="button"
          aria-label="Skip ahead"
          onClick={() => {
            touched.current = true;
            setPos((p) => Math.min(track.length, p + 30));
          }}
          className="outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            border: 0,
            background: "transparent",
            color: "inherit",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <Ico d={I.next} size={14} />
        </button>
      </div>
    </div>,
  ];

  return (
    <div
      className={`relative w-full max-w-[440px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
      }}
    >
      <div ref={card} onPointerDown={(e) => e.isTrusted && (touched.current = true)} style={{ position: "relative" }}>
        {/* the switch between widgets */}
        <div
          role="tablist"
          aria-label="Widget"
          style={{
            display: "flex",
            padding: 4,
            borderRadius: 14,
            background: "#ececee",
            marginBottom: 12,
          }}
        >
          {TABS.map((t, i) => (
            <button
              key={t.name}
              type="button"
              role="tab"
              data-tab={i}
              aria-selected={i === idx}
              onClick={() => {
                touched.current = true;
                go(i);
              }}
              className="outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              style={{
                position: "relative",
                flex: 1,
                height: 32,
                borderRadius: 10,
                border: 0,
                background: "transparent",
                color: i === idx ? INK : MUTE,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "color 0.2s",
              }}
            >
              {i === idx && (
                <motion.span
                  layoutId={`${uid}-tab`}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 38 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 10,
                    background: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 0 0 0.5px rgba(0,0,0,0.04)",
                  }}
                />
              )}
              <span style={{ position: "relative" }}>{t.name}</span>
            </button>
          ))}
        </div>

        {/* the widget: its real height animates, so nothing inside is ever stretched */}
        <motion.div
          initial={false}
          animate={{
            height: TABS[idx].h,
            backgroundColor: dark ? "#0d0e14" : "#ffffff",
            color: fg,
          }}
          transition={{
            height: reduce ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 30 },
            backgroundColor: { duration: 0.7 },
            color: { duration: 0.6 },
          }}
          style={{
            position: "relative",
            borderRadius: 28,
            overflow: "hidden",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 24px 48px -30px rgba(0,0,0,0.3)",
          }}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={idx}
              initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(6px)" }}
              transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: TABS[idx].h,
                padding: 22,
              }}
            >
              {views[idx]}
            </motion.div>
          </AnimatePresence>
        </motion.div>

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
              background: "rgba(17,17,19,0.16)",
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
