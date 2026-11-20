"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */
/* eslint-disable @next/next/no-img-element -- the sample faces are small remote pictures with fixed sizes; swap in next/image where you use real photos */

import { AnimatePresence, LayoutGroup, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { type CSSProperties, type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type SleepStage = 0 | 1 | 2 | 3;
export type EnergySeries = { labels: string[]; values: number[]; note: string };
export type FocusBoardProps = {
  name?: string;
  avatar?: string;
  date?: string;
  /** energy for each range of the switch */
  energy?: { today: EnergySeries; week: EnergySeries; month: EnergySeries };
  /** focus session length in minutes */
  focusMinutes?: number;
  /** sleep stages every 15 minutes from bedtime: 0 awake, 1 REM, 2 light, 3 deep */
  sleep?: SleepStage[];
  /** bedtime in minutes after midnight, e.g. 23 * 60 + 4 */
  bedtime?: number;
  sleepNote?: string;
  track?: { title: string; subtitle: string; kind: string };
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
  fire: "M183.89 153.34a57.6 57.6 0 0 1-46.56 46.55a9 9 0 0 1-1.33.11a8 8 0 0 1-1.32-15.89c16.57-2.79 30.63-16.85 33.44-33.45a8 8 0 0 1 15.78 2.68ZM216 144a88 88 0 0 1-176 0c0-27.92 11-56.47 32.66-84.85a8 8 0 0 1 11.93-.89l24.12 23.41l22-60.41a8 8 0 0 1 12.63-3.41C165.21 36 216 84.55 216 144m-16 0c0-46.09-35.79-85.92-58.21-106.33l-22.27 61.07a8 8 0 0 1-13.09 3L80.06 76.16C64.09 99.21 56 122 56 144a72 72 0 0 0 144 0",
  timer:
    "M128 40a96 96 0 1 0 96 96a96.11 96.11 0 0 0-96-96m0 176a80 80 0 1 1 80-80a80.09 80.09 0 0 1-80 80m45.66-125.66a8 8 0 0 1 0 11.32l-40 40a8 8 0 0 1-11.32-11.32l40-40a8 8 0 0 1 11.32 0M96 16a8 8 0 0 1 8-8h48a8 8 0 0 1 0 16h-48a8 8 0 0 1-8-8",
  moon: "M240 96a8 8 0 0 1-8 8h-16v16a8 8 0 0 1-16 0v-16h-16a8 8 0 0 1 0-16h16V72a8 8 0 0 1 16 0v16h16a8 8 0 0 1 8 8m-96-40h8v8a8 8 0 0 0 16 0v-8h8a8 8 0 0 0 0-16h-8v-8a8 8 0 0 0-16 0v8h-8a8 8 0 0 0 0 16m72.77 97a8 8 0 0 1 1.43 8A96 96 0 1 1 95.07 37.8a8 8 0 0 1 10.6 9.06a88.07 88.07 0 0 0 103.47 103.47a8 8 0 0 1 7.63 2.67m-19.39 14.88c-1.79.09-3.59.14-5.38.14A104.11 104.11 0 0 1 88 64c0-1.79 0-3.59.14-5.38a80 80 0 1 0 109.24 109.24Z",
  wave: "M56 96v64a8 8 0 0 1-16 0V96a8 8 0 0 1 16 0m32-72a8 8 0 0 0-8 8v192a8 8 0 0 0 16 0V32a8 8 0 0 0-8-8m40 32a8 8 0 0 0-8 8v128a8 8 0 0 0 16 0V64a8 8 0 0 0-8-8m40 32a8 8 0 0 0-8 8v64a8 8 0 0 0 16 0V96a8 8 0 0 0-8-8m40-16a8 8 0 0 0-8 8v96a8 8 0 0 0 16 0V80a8 8 0 0 0-8-8",
  play: "M240 128a15.74 15.74 0 0 1-7.6 13.51L88.32 229.65a16 16 0 0 1-16.2.3A15.86 15.86 0 0 1 64 216.13V39.87a15.86 15.86 0 0 1 8.12-13.82a16 16 0 0 1 16.2.3l144.08 88.14A15.74 15.74 0 0 1 240 128",
  pause:
    "M216 48v160a16 16 0 0 1-16 16h-40a16 16 0 0 1-16-16V48a16 16 0 0 1 16-16h40a16 16 0 0 1 16 16M96 32H56a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h40a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16",
  open: "M216 48v48a8 8 0 0 1-16 0V67.31l-50.34 50.35a8 8 0 0 1-11.32-11.32L188.69 56H160a8 8 0 0 1 0-16h48a8 8 0 0 1 8 8m-109.66 90.34L56 188.69V160a8 8 0 0 0-16 0v48a8 8 0 0 0 8 8h48a8 8 0 0 0 0-16H67.31l50.35-50.34a8 8 0 0 0-11.32-11.32",
  close:
    "M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128L50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z",
  bell: "M168 224a8 8 0 0 1-8 8H96a8 8 0 1 1 0-16h64a8 8 0 0 1 8 8m53.85-32a15.8 15.8 0 0 1-13.85 8H48a16 16 0 0 1-13.8-24.06C39.75 166.38 48 139.34 48 104a80 80 0 1 1 160 0c0 35.33 8.26 62.38 13.81 71.94a15.89 15.89 0 0 1 .03 16.06ZM208 184c-7.73-13.27-16-43.95-16-80a64 64 0 1 0-128 0c0 36.06-8.28 66.74-16 80Z",
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

const DEFAULT_ENERGY = {
  today: {
    labels: ["8a", "10a", "12p", "2p", "4p", "6p", "8p"],
    values: [58, 74, 81, 62, 70, 66, 49],
    note: "Peaks before lunch",
  },
  week: {
    labels: ["M", "T", "W", "T", "F", "S", "S"],
    values: [62, 71, 58, 84, 76, 66, 73],
    note: "+6% vs last week",
  },
  month: {
    labels: ["W1", "W2", "W3", "W4"],
    values: [64, 69, 72, 70],
    note: "Steady all month",
  },
};
const DEFAULT_SLEEP: SleepStage[] = [
  0, 2, 2, 3, 3, 3, 2, 2, 1, 2, 3, 3, 2, 2, 1, 1, 2, 2, 3, 2, 2, 1, 1, 2, 2, 1, 2, 1, 1, 0, 2, 1,
];
const STAGE = ["Awake", "REM", "Light", "Deep"];
const ORANGE = "#ff8a3d";
const VIOLET = "#9b8cff";
const GREEN = "#34c759";
const LAVENDER = "#c9c3ff";
const SPRING = { type: "spring", stiffness: 300, damping: 32 } as const;
const T1 = "#f5f5f7";
const T2 = "rgba(235,235,245,0.5)";
const T3 = "rgba(235,235,245,0.3)";
const card: CSSProperties = {
  position: "relative",
  borderRadius: 20,
  background: "#18181a",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
  padding: 14,
  overflow: "hidden",
};
const iconDot: CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 12,
  background: "rgba(255,255,255,0.06)",
  color: "rgba(235,235,245,0.7)",
  display: "grid",
  placeItems: "center",
  flex: "none",
};

function Head({ icon, label, right }: { icon: string; label: string; right?: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12,
        color: T2,
        minHeight: 24,
      }}
    >
      <span style={iconDot}>
        <Ico d={icon} size={12} />
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {right}
    </div>
  );
}

function Roll({ text, reduce, style }: { text: string; reduce: boolean; style?: CSSProperties }) {
  const chars = [...text];
  return (
    <span
      aria-label={text}
      style={{
        display: "inline-flex",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        const key = chars.length - i;
        if (!/\d/.test(ch))
          return (
            <span key={`s${key}${ch}`} aria-hidden="true">
              {ch}
            </span>
          );
        return (
          <span
            key={`d${key}`}
            aria-hidden="true"
            style={{
              position: "relative",
              display: "inline-block",
              height: "1.1em",
              overflow: "hidden",
              lineHeight: 1.1,
            }}
          >
            <motion.span
              initial={false}
              animate={{ y: `${-Number(ch) * 10}%` }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 220,
                      damping: 24,
                      mass: 0.6 + (key % 3) * 0.12,
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

const fmtTime = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const hm = (m: number) => `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
const clock = (min: number) => {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

/**
 * A quiet personal dashboard on a dark board. Switch the range and the energy bars regrow; point at a bar and it
 * lights up with its value while the big number rolls to it. Drag round the focus ring to set the minutes, five at a
 * time, and start it to watch the ring drain. Last night's sleep is a grid of dots, one column per half hour; open it
 * and the card grows over the whole board into a full chart you can scrub, with the time in each stage. The sounds
 * card plays an ambient track whose waveform moves while it plays.
 */
export default function FocusBoard({
  name = "Mia",
  avatar = "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20curly%20hair/Medium-Dark/3D/woman_curly_hair_3d_medium-dark.png",
  date = "Tuesday, 18 November",
  energy = DEFAULT_ENERGY,
  focusMinutes = 25,
  sleep = DEFAULT_SLEEP,
  bedtime = 23 * 60 + 4,
  sleepNote = "You fell asleep 14 min faster than your weekly average.",
  track = {
    title: "Rain on glass",
    subtitle: "Ambient sound for focus",
    kind: "Rain",
  },
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: FocusBoardProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const uid = "fb" + useId().replace(/:/g, "");
  const touched = useRef(false);
  const board = useRef<HTMLDivElement>(null);

  // energy
  const [range, setRange] = useState<"today" | "week" | "month">("week");
  const series = energy[range];
  const [bar, setBar] = useState<number | null>(null);
  const avg = Math.round(series.values.reduce((a, b) => a + b, 0) / series.values.length);
  const pickBar = (i: number | null) => {
    setBar((b) => {
      if (b !== i && i !== null) sfx.tick({ freq: 1800 + i * 140, gain: 0.022 });
      return i;
    });
  };
  const pickRange = (r: "today" | "week" | "month") => {
    setRange((cur) => {
      if (cur !== r) sfx.tick({ freq: 2400, gain: 0.03 });
      return r;
    });
    setBar(null);
  };

  // focus timer
  const [mins, setMins] = useState(focusMinutes);
  const minsRef = useRef(mins);
  minsRef.current = mins;
  const [left, setLeft] = useState(focusMinutes * 60);
  const leftRef = useRef(left);
  leftRef.current = left;
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(
      () => {
        setLeft((l) => {
          if (l <= 1) {
            setRunning(false);
            sfx.note(784, { dur: 0.3, gain: 0.035, bell: 0.6 });
            sfx.note(1175, { at: 0.15, dur: 0.5, gain: 0.035, bell: 0.6 });
            return minsRef.current * 60;
          }
          return l - 1;
        });
      },
      1000 / (autoplay && !touched.current ? 30 : 1),
    );
    return () => window.clearInterval(id);
  }, [running, sfx, autoplay]);
  const setMinutes = (m: number) => {
    const n = Math.max(5, Math.min(60, Math.round(m / 5) * 5));
    if (n !== minsRef.current) sfx.tick({ freq: 2000 + n * 20, gain: 0.03 });
    setMins(n);
    setLeft(n * 60);
  };
  const toggleRun = () => {
    setRunning((r) => {
      sfx.note(r ? 440 : 659, { dur: 0.2, gain: 0.03, bell: 0.4 });
      return !r;
    });
  };
  const dial = useRef<SVGSVGElement>(null);
  const dialDrag = useRef(false);
  const dialAt = (e: { clientX: number; clientY: number }) => {
    const r = dial.current!.getBoundingClientRect();
    let f =
      (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) + Math.PI / 2) /
      (Math.PI * 2);
    if (f < 0) f += 1;
    setMinutes(f * 60);
  };
  // a sixty minute face, like a kitchen timer: the ring is the time left
  const progress = left / 3600;

  // sleep
  const [open, setOpen] = useState(false);
  const [scrub, setScrub] = useState<number | null>(null);
  const total = sleep.filter((s) => s !== 0).length * 15;
  const per = [0, 1, 2, 3].map((k) => sleep.filter((s) => s === k).length * 15);
  const cols = useMemo(() => {
    // one column per half hour: the deeper of its two quarters
    const out: SleepStage[] = [];
    for (let i = 0; i < sleep.length; i += 2) out.push(Math.max(sleep[i], sleep[i + 1] ?? 0) as SleepStage);
    return out;
  }, [sleep]);
  const toggleOpen = (o: boolean) => {
    setOpen(o);
    setScrub(null);
    sfx.whoosh(o ? 500 : 2000, o ? 2000 : 500, { dur: 0.4, gain: 0.025 });
  };

  // sounds
  const [playing, setPlaying] = useState(false);
  const toggleSound = () => {
    setPlaying((p) => {
      sfx.whoosh(p ? 1800 : 400, p ? 400 : 1800, { dur: 0.5, gain: 0.025 });
      return !p;
    });
  };

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
    const pos = (sel: string, fx = 0.5, fy = 0.5) => {
      const b = board.current;
      const e = b?.querySelector(sel);
      if (!b || !e) return [0, 0] as const;
      const r = e.getBoundingClientRect();
      const bb = b.getBoundingClientRect();
      return [r.left - bb.left + r.width * fx, r.top - bb.top + r.height * fy] as const;
    };
    const go = async (x: number, y: number, ms = 550) => {
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
        for (const i of [1, 3, 5]) {
          if (!ok()) return;
          await go(...pos(`[data-bar="${i}"]`, 0.5, 0.5), 420);
          pickBar(i);
          await wait(700);
        }
        pickBar(null);
        await go(...pos('[data-range="today"]'), 450);
        await tap();
        pickRange("today");
        await wait(1300);
        await go(...pos('[data-range="week"]'), 350);
        await tap();
        pickRange("week");
        await wait(900);
        if (!ok()) return;
        const [cx, cy] = pos("[data-dial]");
        const box = board.current?.querySelector("[data-dial]")?.getBoundingClientRect();
        const R = ((box?.width ?? 104) * 48) / 120;
        const f0 = leftRef.current / 3600;
        await go(
          cx + Math.cos(f0 * Math.PI * 2 - Math.PI / 2) * R,
          cy + Math.sin(f0 * Math.PI * 2 - Math.PI / 2) * R,
          500,
        );
        setGhostDown(true);
        await animate(f0, 0.75, {
          duration: 1.1,
          ease: [0.4, 0, 0.2, 1],
          onUpdate: (f) => {
            const a = f * Math.PI * 2 - Math.PI / 2;
            gx.set(cx + Math.cos(a) * R);
            gy.set(cy + Math.sin(a) * R);
            setMinutes(f * 60);
          },
        });
        setGhostDown(false);
        await go(...pos("[data-start]"), 400);
        await tap();
        setRunning(true);
        await wait(1500);
        if (!ok()) return;
        await go(...pos("[data-open]"), 500);
        await tap();
        toggleOpen(true);
        await wait(900);
        const [sx, sy0] = pos("[data-chart]", 0.05, 0.5);
        const [ex] = pos("[data-chart]", 0.95, 0.5);
        await go(sx, sy0, 500);
        await animate(0, 1, {
          duration: 1.8,
          ease: "easeInOut",
          onUpdate: (k) => {
            gx.set(sx + (ex - sx) * k);
            setScrub(Math.min(sleep.length - 1, Math.floor(k * sleep.length)));
          },
        });
        setScrub(null);
        await go(...pos("[data-close]"), 500);
        await tap();
        toggleOpen(false);
        await wait(1000);
        if (!ok()) return;
        await go(...pos("[data-play]"), 500);
        await tap();
        setPlaying(true);
        await wait(2600);
        await tap();
        setPlaying(false);
        setRunning(false);
        setMinutes(focusMinutes);
        setGhost(false);
        await wait(1600);
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

  // the night as a stepped line
  const SW = 300;
  const SH = 100;
  const sy = (s: number) => 8 + (s / 3) * (SH - 16);
  const sleepPath = useMemo(() => {
    const n = sleep.length;
    let d = `M 0 ${sy(sleep[0])}`;
    sleep.forEach((s, i) => (d += ` L ${(i / n) * SW} ${sy(s)} L ${((i + 1) / n) * SW} ${sy(s)}`));
    return d;
  }, [sleep]);
  const awakeRuns = useMemo(() => {
    const n = sleep.length;
    return sleep
      .map((s, i) => (s === 0 ? `M ${(i / n) * SW} ${sy(0)} L ${((i + 1) / n) * SW} ${sy(0)}` : ""))
      .join(" ");
  }, [sleep]);

  const shown = bar === null ? avg : series.values[bar];
  const maxV = 100;
  const end = bedtime + sleep.length * 15;

  return (
    <div
      className={`relative w-full max-w-[560px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: T1,
      }}
    >
      <div
        ref={board}
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        style={{
          position: "relative",
          borderRadius: 28,
          background: "#0d0d0e",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 30px 60px -30px rgba(0,0,0,0.6)",
          padding: 12,
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "4px 4px 12px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              background: "#232326",
              display: "grid",
              placeItems: "center",
              flex: "none",
            }}
          >
            <img src={avatar} alt="" width={24} height={24} draggable={false} style={{ width: 24, height: 24 }} />
          </span>
          <div style={{ flex: "1 1 120px", minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap" }}>Good morning, {name}</div>
            <div style={{ fontSize: 11.5, color: T2, whiteSpace: "nowrap" }}>{date}</div>
          </div>
          <div
            role="tablist"
            aria-label="Range"
            style={{
              display: "flex",
              padding: 3,
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
            }}
          >
            {(["today", "week", "month"] as const).map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                data-range={r}
                aria-selected={range === r}
                onClick={() => {
                  touched.current = true;
                  pickRange(r);
                }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                style={{
                  position: "relative",
                  height: 24,
                  padding: "0 11px",
                  borderRadius: 999,
                  border: 0,
                  background: "transparent",
                  color: range === r ? "#111" : T2,
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "color 0.2s",
                }}
              >
                {range === r && (
                  <motion.span
                    layoutId={`${uid}-seg`}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 38 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 999,
                      background: T1,
                    }}
                  />
                )}
                <span style={{ position: "relative" }}>{r[0].toUpperCase() + r.slice(1)}</span>
              </button>
            ))}
          </div>
          <span style={{ ...iconDot, width: 30, height: 30, borderRadius: 15 }}>
            <Ico d={I.bell} size={14} />
          </span>
        </div>

        <LayoutGroup id={uid}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 8,
              }}
            >
              {/* energy */}
              <div style={card}>
                <Head icon={I.fire} label="Energy" />
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 12,
                    marginTop: 12,
                  }}
                >
                  <div style={{ flex: "none", minWidth: 92 }}>
                    <div style={{ fontSize: 11, color: T3 }}>
                      {bar === null ? "Average energy" : series.labels[bar]}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        marginTop: 2,
                      }}
                    >
                      <Roll
                        text={String(shown)}
                        reduce={reduce}
                        style={{
                          fontSize: 38,
                          fontWeight: 500,
                          letterSpacing: "-0.04em",
                        }}
                      />
                      <span style={{ fontSize: 18, color: T2, marginLeft: 1 }}>%</span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: GREEN,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {series.note}
                    </div>
                  </div>
                  <div
                    role="group"
                    aria-label="Energy"
                    onPointerLeave={() => pickBar(null)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      gap: 4,
                      height: 96,
                    }}
                  >
                    {series.values.map((v, i) => {
                      const on = bar === i;
                      return (
                        <button
                          key={`${range}-${i}`}
                          type="button"
                          data-bar={i}
                          aria-label={`${series.labels[i]}, ${v}%`}
                          onPointerEnter={() => pickBar(i)}
                          onFocus={() => pickBar(i)}
                          onBlur={() => pickBar(null)}
                          className="outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                          style={{
                            flex: 1,
                            maxWidth: 12,
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 5,
                            border: 0,
                            padding: 0,
                            background: "transparent",
                            borderRadius: 7,
                            cursor: "pointer",
                          }}
                        >
                          <span
                            style={{
                              position: "relative",
                              flex: 1,
                              width: "100%",
                              borderRadius: 7,
                              background: "rgba(255,255,255,0.05)",
                            }}
                          >
                            <motion.span
                              initial={reduce ? false : { height: "0%" }}
                              animate={{
                                height: `${(v / maxV) * 100}%`,
                                opacity: bar === null || on ? 1 : 0.4,
                              }}
                              transition={{
                                height: reduce
                                  ? { duration: 0 }
                                  : {
                                      type: "spring",
                                      stiffness: 160,
                                      damping: 20,
                                      delay: i * 0.04,
                                    },
                                opacity: { duration: 0.2 },
                              }}
                              style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                bottom: 0,
                                borderRadius: 7,
                                background: `linear-gradient(180deg, #ffb37a, ${ORANGE} 45%, #c2410c)`,
                              }}
                            />
                            <AnimatePresence>
                              {on && (
                                <motion.span
                                  key="tip"
                                  initial={{ opacity: 0, y: 4, scale: 0.8 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 600,
                                    damping: 30,
                                  }}
                                  style={{
                                    position: "absolute",
                                    left: "50%",
                                    x: "-50%",
                                    bottom: `calc(${(v / maxV) * 100}% + 4px)`,
                                    padding: "1px 5px",
                                    borderRadius: 6,
                                    background: T1,
                                    color: "#111",
                                    fontSize: 9.5,
                                    fontWeight: 650,
                                    fontVariantNumeric: "tabular-nums",
                                    pointerEvents: "none",
                                  }}
                                >
                                  {v}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </span>
                          <span style={{ fontSize: 9.5, color: on ? T1 : T3 }}>{series.labels[i]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* sleep, compact */}
              <div style={{ position: "relative", minHeight: 160 }}>
                {!open && (
                  <motion.div
                    layoutId={`${uid}-sleep`}
                    transition={reduce ? { duration: 0 } : SPRING}
                    style={{ ...card, height: "100%" }}
                  >
                    <motion.div
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.12, duration: 0.2 }}
                    >
                      <Head
                        icon={I.moon}
                        label="Sleep"
                        right={
                          <button
                            type="button"
                            data-open
                            aria-label="Open last night's sleep"
                            onClick={() => {
                              touched.current = true;
                              toggleOpen(true);
                            }}
                            className="outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                            style={{ ...iconDot, border: 0, cursor: "pointer" }}
                          >
                            <Ico d={I.open} size={12} />
                          </button>
                        }
                      />
                      <div
                        style={{
                          fontSize: 30,
                          fontWeight: 500,
                          letterSpacing: "-0.03em",
                          fontVariantNumeric: "tabular-nums",
                          marginTop: 12,
                        }}
                      >
                        {hm(total)}
                      </div>
                      <div style={{ fontSize: 11, color: T3, marginTop: 1 }}>{hm(per[3])} deep</div>
                      <div
                        role="img"
                        aria-label={`Sleep last night: ${hm(total)}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: `repeat(${cols.length}, 1fr)`,
                          gap: 3,
                          marginTop: 12,
                        }}
                      >
                        {cols.map((s, c) => (
                          <div
                            key={c}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 3,
                              alignItems: "center",
                            }}
                          >
                            {[0, 1, 2, 3].map((row) => (
                              <motion.span
                                key={row}
                                initial={reduce ? false : { scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  delay: reduce ? 0 : 0.1 + c * 0.02 + row * 0.01,
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 26,
                                }}
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: 3,
                                  background: row === s ? (s === 0 ? ORANGE : VIOLET) : "rgba(255,255,255,0.09)",
                                }}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </div>

              {/* focus */}
              <div style={card}>
                <Head
                  icon={I.timer}
                  label="Focus"
                  right={
                    <span style={{ fontSize: 11, color: running ? GREEN : T3 }}>
                      {running ? "Focusing" : left < mins * 60 ? "Paused" : ""}
                    </span>
                  }
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginTop: 8,
                  }}
                >
                  <svg
                    ref={dial}
                    data-dial
                    viewBox="0 0 120 120"
                    width="104"
                    height="104"
                    role="slider"
                    tabIndex={0}
                    aria-label="Focus length"
                    aria-valuemin={5}
                    aria-valuemax={60}
                    aria-valuenow={mins}
                    aria-valuetext={`${mins} minutes`}
                    onPointerDown={(e) => {
                      if (running) return;
                      touched.current = true;
                      dialDrag.current = true;
                      (e.currentTarget as Element).setPointerCapture(e.pointerId);
                      dialAt(e);
                    }}
                    onPointerMove={(e) => dialDrag.current && dialAt(e)}
                    onPointerUp={() => (dialDrag.current = false)}
                    onKeyDown={(e) => {
                      touched.current = true;
                      if (e.key === "ArrowUp" || e.key === "ArrowRight") setMinutes(mins + 5);
                      else if (e.key === "ArrowDown" || e.key === "ArrowLeft") setMinutes(mins - 5);
                      else if (e.key === " " || e.key === "Enter") toggleRun();
                      else return;
                      e.preventDefault();
                    }}
                    className="outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    style={{
                      flex: "none",
                      cursor: running ? "default" : "grab",
                      touchAction: "none",
                      borderRadius: 60,
                    }}
                  >
                    <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke={GREEN}
                      strokeWidth="5"
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                      strokeDasharray={2 * Math.PI * 48}
                      initial={false}
                      animate={{
                        strokeDashoffset: 2 * Math.PI * 48 * (1 - Math.max(0.002, progress)),
                      }}
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 26 }}
                    />
                    <motion.circle
                      r="4.5"
                      fill={T1}
                      initial={false}
                      animate={{
                        cx: 60 + Math.cos(progress * Math.PI * 2 - Math.PI / 2) * 48,
                        cy: 60 + Math.sin(progress * Math.PI * 2 - Math.PI / 2) * 48,
                        opacity: running ? 0 : 1,
                      }}
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 26 }}
                    />
                  </svg>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 30,
                        fontWeight: 500,
                        letterSpacing: "-0.03em",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {fmtTime(left)}
                    </div>
                    <div style={{ fontSize: 11, color: T3, marginBottom: 8 }}>{mins} min session</div>
                    <motion.button
                      type="button"
                      data-start
                      whileTap={{ scale: 0.93 }}
                      onClick={() => {
                        touched.current = true;
                        toggleRun();
                      }}
                      className="outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                      style={{
                        height: 26,
                        padding: "0 13px",
                        borderRadius: 13,
                        border: 0,
                        background: running ? "rgba(255,255,255,0.1)" : T1,
                        color: running ? T1 : "#111",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {running ? "Pause" : "Start"}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* sounds */}
              <div style={card}>
                <Head
                  icon={I.wave}
                  label="Sounds"
                  right={<span style={{ fontSize: 11, color: T3 }}>{track.kind}</span>}
                />
                <div
                  aria-hidden="true"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    height: 40,
                    marginTop: 14,
                    overflow: "hidden",
                  }}
                >
                  {Array.from({ length: 80 }, (_, k) => {
                    const base = 0.18 + 0.7 * Math.abs(Math.sin(k * 0.9) * Math.cos(k * 0.37));
                    return (
                      <motion.span
                        key={k}
                        animate={
                          playing && !reduce
                            ? {
                                scaleY: [base, Math.min(1, base + 0.4), base * 0.55, base],
                              }
                            : { scaleY: base * 0.5 }
                        }
                        transition={
                          playing && !reduce
                            ? {
                                duration: 0.9 + (k % 5) * 0.14,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: (k % 7) * 0.05,
                              }
                            : { duration: 0.5 }
                        }
                        style={{
                          flex: "none",
                          width: 2,
                          height: "100%",
                          borderRadius: 1,
                          background: k < 22 ? LAVENDER : "rgba(255,255,255,0.18)",
                        }}
                      />
                    );
                  })}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  <motion.button
                    type="button"
                    data-play
                    aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      touched.current = true;
                      toggleSound();
                    }}
                    className="outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      border: 0,
                      background: T1,
                      color: "#111",
                      display: "grid",
                      placeItems: "center",
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
                        style={{
                          display: "grid",
                          marginLeft: playing ? 0 : 1.5,
                        }}
                      >
                        <Ico d={playing ? I.pause : I.play} size={12} />
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{track.title}</div>
                    <div style={{ fontSize: 11, color: T3 }}>{track.subtitle}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* sleep, opened over the whole board */}
            <AnimatePresence>
              {open && (
                <motion.div
                  key="sleep-open"
                  layoutId={`${uid}-sleep`}
                  transition={reduce ? { duration: 0 } : SPRING}
                  role="dialog"
                  aria-label="Last night's sleep"
                  style={{
                    ...card,
                    position: "absolute",
                    inset: 0,
                    zIndex: 3,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <motion.div
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    transition={{ delay: 0.15, duration: 0.25 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      minHeight: 0,
                    }}
                  >
                    <Head
                      icon={I.moon}
                      label="Sleep"
                      right={
                        <button
                          type="button"
                          data-close
                          aria-label="Close"
                          onClick={() => {
                            touched.current = true;
                            toggleOpen(false);
                          }}
                          className="outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                          style={{ ...iconDot, border: 0, cursor: "pointer" }}
                        >
                          <Ico d={I.close} size={12} />
                        </button>
                      }
                    />
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 12,
                        marginTop: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 38,
                            fontWeight: 500,
                            letterSpacing: "-0.04em",
                            lineHeight: 1,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {hm(total)}
                        </div>
                        <div style={{ fontSize: 11, color: T3, marginTop: 6 }}>
                          {clock(bedtime)} to {clock(end)}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 18 }}>
                        {[3, 2, 1, 0].map((k) => (
                          <div key={k}>
                            <div style={{ fontSize: 10.5, color: T3 }}>{STAGE[k]}</div>
                            <div
                              style={{
                                fontSize: 15,
                                fontWeight: 500,
                                fontVariantNumeric: "tabular-nums",
                                color: scrub !== null && sleep[scrub] === k ? (k === 0 ? ORANGE : VIOLET) : T1,
                                transition: "color 0.2s",
                              }}
                            >
                              {hm(per[k])}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        minHeight: 120,
                        maxHeight: 220,
                        marginTop: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flex: 1,
                          minHeight: 0,
                        }}
                      >
                        <div
                          aria-hidden="true"
                          style={{
                            position: "relative",
                            width: 36,
                            flex: "none",
                            fontSize: 10,
                            color: T3,
                          }}
                        >
                          {STAGE.map((st, k) => (
                            <span
                              key={st}
                              style={{
                                position: "absolute",
                                left: 0,
                                top: `${sy(k)}%`,
                                transform: "translateY(-50%)",
                              }}
                            >
                              {st}
                            </span>
                          ))}
                        </div>
                        <div
                          data-chart
                          role="img"
                          aria-label={`Sleep stages from ${clock(bedtime)} to ${clock(end)}`}
                          onPointerMove={(e) => {
                            const r = e.currentTarget.getBoundingClientRect();
                            setScrub(
                              Math.max(
                                0,
                                Math.min(sleep.length - 1, Math.floor(((e.clientX - r.left) / r.width) * sleep.length)),
                              ),
                            );
                          }}
                          onPointerLeave={() => setScrub(null)}
                          style={{
                            position: "relative",
                            flex: 1,
                            touchAction: "pan-y",
                          }}
                        >
                          <svg
                            viewBox={`0 0 ${SW} ${SH}`}
                            preserveAspectRatio="none"
                            width="100%"
                            height="100%"
                            style={{
                              position: "absolute",
                              inset: 0,
                              overflow: "visible",
                            }}
                          >
                            <defs>
                              <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor={VIOLET} stopOpacity="0.04" />
                                <stop offset="1" stopColor={VIOLET} stopOpacity="0.3" />
                              </linearGradient>
                              <clipPath id={`${uid}-c`}>
                                <motion.rect
                                  x="0"
                                  y="-10"
                                  height={SH + 20}
                                  initial={reduce ? false : { width: 0 }}
                                  animate={{ width: SW }}
                                  transition={{
                                    delay: 0.2,
                                    duration: 1.1,
                                    ease: [0.4, 0, 0.2, 1],
                                  }}
                                />
                              </clipPath>
                            </defs>
                            {[0, 1, 2, 3].map((s) => (
                              <line
                                key={s}
                                x1="0"
                                x2={SW}
                                y1={sy(s)}
                                y2={sy(s)}
                                stroke="rgba(255,255,255,0.06)"
                                strokeWidth="1"
                                vectorEffect="non-scaling-stroke"
                                strokeDasharray="2 4"
                              />
                            ))}
                            <g clipPath={`url(#${uid}-c)`}>
                              <path d={`${sleepPath} L ${SW} ${SH} L 0 ${SH} Z`} fill={`url(#${uid}-g)`} />
                              <path
                                d={sleepPath}
                                fill="none"
                                stroke={VIOLET}
                                strokeWidth="1.6"
                                vectorEffect="non-scaling-stroke"
                                strokeLinejoin="round"
                              />
                              <path
                                d={awakeRuns}
                                fill="none"
                                stroke={ORANGE}
                                strokeWidth="2.2"
                                vectorEffect="non-scaling-stroke"
                                strokeLinecap="round"
                              />
                            </g>
                          </svg>
                          <AnimatePresence>
                            {scrub !== null && (
                              <motion.div
                                key="scrub"
                                initial={{ opacity: 0 }}
                                animate={{
                                  opacity: 1,
                                  left: `${((scrub + 0.5) / sleep.length) * 100}%`,
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 600,
                                  damping: 40,
                                }}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  bottom: 0,
                                  width: 1,
                                  background: "rgba(255,255,255,0.6)",
                                  pointerEvents: "none",
                                }}
                              >
                                <span
                                  style={{
                                    position: "absolute",
                                    top: -2,
                                    left: 6,
                                    transform:
                                      scrub > sleep.length * 0.68 ? "translateX(calc(-100% - 12px))" : undefined,
                                    padding: "3px 7px",
                                    borderRadius: 7,
                                    background: T1,
                                    color: "#111",
                                    fontSize: 10.5,
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {clock(bedtime + scrub * 15)}, {STAGE[sleep[scrub]]}
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 10,
                          color: T3,
                          marginTop: 6,
                          paddingLeft: 44,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        <span>{clock(bedtime)}</span>
                        <span>{clock(bedtime + sleep.length * 7.5)}</span>
                        <span>{clock(end)}</span>
                      </div>
                    </div>
                    <div style={{ marginTop: "auto", paddingTop: 0 }} />
                    <div
                      style={{
                        marginTop: 12,
                        padding: "9px 12px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.04)",
                        fontSize: 11.5,
                        color: T2,
                      }}
                    >
                      {sleepNote}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </LayoutGroup>

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
