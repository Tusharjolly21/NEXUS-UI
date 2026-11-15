"use client";

/* eslint-disable react-hooks/refs, react-hooks/purity, react-hooks/immutability, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion } from "framer-motion";
import { type PointerEvent as RPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type RingDay = {
  label: string;
  move: number;
  exercise: number;
  run: number;
};
export type ActivityRingsProps = {
  /** a week of days, oldest first: calories, minutes and kilometres */
  days?: RingDay[];
  goals?: { move: number; exercise: number; run: number };
  /** Soft sounds: a chime as each ring closes. They also follow the site-wide sound switch. */
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
  move: "M173.79 51.48a221.3 221.3 0 0 0-41.67-34.34a8 8 0 0 0-8.24 0a221.3 221.3 0 0 0-41.67 34.34C54.59 80.48 40 112.47 40 144a88 88 0 0 0 176 0c0-31.53-14.59-63.52-42.21-92.52M96 184c0-27.67 22.53-47.28 32-54.3c9.48 7 32 26.63 32 54.3a32 32 0 0 1-64 0",
  exercise:
    "m213.85 125.46l-112 120a8 8 0 0 1-13.69-7l14.66-73.33l-57.63-21.64a8 8 0 0 1-3-13l112-120a8 8 0 0 1 13.69 7l-14.7 73.41l57.63 21.61a8 8 0 0 1 3 12.95Z",
  run: "M70.8 184H32a8 8 0 0 1 0-16h38.8a8 8 0 1 1 0 16m32 16H48a8 8 0 0 0 0 16h54.8a8 8 0 1 0 0-16m128.36-33.37l-28.63-14.31A47.74 47.74 0 0 1 176 109.39V80a8 8 0 0 0-7.93-8A48.05 48.05 0 0 1 120 24.07a8 8 0 0 0-12.83-6.44L45.11 64.68a4 4 0 0 0-.41 6l51.44 51.44a8.19 8.19 0 0 1 .6 11.09a8 8 0 0 1-11.71.43l-53-53a4 4 0 0 0-6.44 1.09a16 16 0 0 0 3.12 18.22L142.4 213.66a8 8 0 0 0 5.66 2.34H224a16 16 0 0 0 16-16v-19.06a15.92 15.92 0 0 0-8.84-14.31",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const RINGS = [
  {
    key: "move",
    name: "Move",
    unit: "kcal",
    a: "#e8164a",
    b: "#ff5c8a",
    track: "rgba(232,22,74,.2)",
    text: "#ff4f7f",
    icon: I.move,
  },
  {
    key: "exercise",
    name: "Exercise",
    unit: "min",
    a: "#7fdb12",
    b: "#ccff52",
    track: "rgba(127,219,18,.2)",
    text: "#a8f03a",
    icon: I.exercise,
  },
  {
    key: "run",
    name: "Running",
    unit: "km",
    a: "#13d6e8",
    b: "#7af6ff",
    track: "rgba(19,214,232,.2)",
    text: "#4fe9f7",
    icon: I.run,
  },
] as const;
type Key = (typeof RINGS)[number]["key"];

const DEFAULT_DAYS: RingDay[] = [
  { label: "M", move: 420, exercise: 22, run: 3.1 },
  { label: "T", move: 610, exercise: 41, run: 5.4 },
  { label: "W", move: 380, exercise: 18, run: 0 },
  { label: "T", move: 702, exercise: 64, run: 8.2 },
  { label: "F", move: 545, exercise: 30, run: 4.6 },
  { label: "S", move: 860, exercise: 75, run: 10.4 },
  { label: "S", move: 512, exercise: 34, run: 5.2 },
];

/**
 * Activity rings, the kind a watch closes as you move, exercise and run.
 *
 * Three rings, each painted along its length from a deep to a bright shade with a soft sheen and a fine grain, a
 * rounded tip that casts a shadow on the ring under it, and an arrow at its start. Past the goal a ring carries on
 * round a second time, its tip riding over the first lap; when a ring closes it flashes and throws a spray of sparks
 * from the top with a chime. Point at a ring and the others dim while the middle reads its numbers. Pick a day from
 * the week below, each drawn as tiny rings, and the big rings turn to that day on springs while the numbers count.
 *   <ActivityRings goals={{ move: 600, exercise: 30, run: 5 }} />
 */
export default function ActivityRings({
  days = DEFAULT_DAYS,
  goals = { move: 600, exercise: 30, run: 5 },
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: ActivityRingsProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const rootRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const touched = useRef(false);
  const [day, setDay] = useState(days.length - 1);
  const [hover, setHover] = useState<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  hoverRef.current = hover;
  const p = [useMotionValue(0), useMotionValue(0), useMotionValue(0)];
  const dimMv = [useMotionValue(1), useMotionValue(1), useMotionValue(1)];
  const sparks = useRef<
    {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      col: string;
      s: number;
    }[]
  >([]);
  const flashes = useRef([0, 0, 0]);
  const [size, setSize] = useState(240);
  const frac = (k: Key, d: RingDay) => d[k] / goals[k];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize(Math.min(240, el.clientWidth - 72)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── drawing ──
  const noise = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const im = g.createImageData(128, 128);
    for (let i = 0; i < im.data.length; i += 4) {
      const v = Math.random() * 255;
      im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
      im.data[i + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    return c;
  }, []);
  const draw = () => {
    const cv = cvRef.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const S = size;
    if (cv.width !== Math.round(S * dpr)) {
      cv.width = cv.height = Math.round(S * dpr);
    }
    const g = cv.getContext("2d")!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, S, S);
    const c = S / 2;
    const w = S * 0.085,
      gap = S * 0.012;
    const radii = [c - w / 2 - 6, c - w * 1.5 - gap - 6, c - w * 2.5 - gap * 2 - 6];
    const top = -Math.PI / 2;
    RINGS.forEach((ring, k) => {
      const r = radii[k];
      const v = Math.max(0, p[k].get());
      const dimA = dimMv[k].get();
      g.save();
      g.globalAlpha = dimA;
      // the track
      g.strokeStyle = ring.track;
      g.lineWidth = w;
      g.beginPath();
      g.arc(c, c, r, 0, Math.PI * 2);
      g.stroke();
      if (v > 0.002) {
        // the colour runs along the ring, deep at the start, bright at the tip
        const grad = typeof g.createConicGradient === "function" ? g.createConicGradient(top, c, c) : null;
        if (grad) {
          grad.addColorStop(0, ring.a);
          grad.addColorStop(Math.min(0.999, Math.max(0.05, v)), ring.b);
          grad.addColorStop(1, ring.b);
        }
        const stroke = grad ?? ring.a;
        const end = top + Math.PI * 2 * v;
        g.lineCap = "round";
        g.lineWidth = w;
        g.strokeStyle = stroke;
        g.beginPath();
        g.arc(c, c, r, top, Math.min(end, top + Math.PI * 2 - 0.0001));
        g.stroke();
        // the tip: its own round end, with a shadow falling back onto the ring beneath
        const tip = (from: number, paint: string | CanvasGradient) => {
          g.save();
          g.shadowColor = "rgba(0,0,0,.55)";
          g.shadowBlur = w * 0.55;
          g.shadowOffsetX = Math.cos(end + Math.PI / 2) * w * 0.12;
          g.shadowOffsetY = Math.sin(end + Math.PI / 2) * w * 0.12;
          // the same paint as the ring under it, so only the shadow shows
          g.strokeStyle = paint;
          g.beginPath();
          g.arc(c, c, r, from, end);
          g.stroke();
          g.restore();
        };
        if (v > 1) {
          // a second lap rides over the first, in the bright shade the first lap ended on, so there's no seam
          g.strokeStyle = ring.b;
          g.beginPath();
          g.arc(c, c, r, top, end);
          g.stroke();
          tip(end - 0.35, ring.b);
        } else if (v > 0.03) tip(end - Math.min(0.3, Math.PI * 2 * v * 0.5), stroke);
        // a sheen along the outer edge
        g.globalCompositeOperation = "source-atop";
        g.strokeStyle = "rgba(255,255,255,.16)";
        g.lineWidth = w * 0.28;
        g.beginPath();
        g.arc(c, c, r + w * 0.24, top, end);
        g.stroke();
        g.globalCompositeOperation = "source-over";
        // the arrow at the start, the way a watch shows it
        g.save();
        g.translate(c + Math.cos(top) * r, c + Math.sin(top) * r);
        g.strokeStyle = "rgba(0,0,0,.7)";
        g.lineWidth = Math.max(1.6, w * 0.13);
        g.lineCap = "round";
        g.lineJoin = "round";
        const a = w * 0.2;
        g.beginPath();
        g.moveTo(-a * 0.4, -a);
        g.lineTo(a * 0.6, 0);
        g.lineTo(-a * 0.4, a);
        g.stroke();
        g.restore();
      }
      // a flash as it closes
      const f = flashes.current[k];
      if (f > 0) {
        g.globalCompositeOperation = "lighter";
        g.strokeStyle = ring.b;
        g.globalAlpha = f * 0.6;
        g.lineWidth = w * (1 + f * 0.6);
        g.beginPath();
        g.arc(c, c, r, 0, Math.PI * 2);
        g.stroke();
        g.globalCompositeOperation = "source-over";
      }
      g.restore();
    });
    // a fine grain over the rings only
    if (noise) {
      g.save();
      g.globalCompositeOperation = "source-atop";
      g.globalAlpha = 0.07;
      g.fillStyle = g.createPattern(noise, "repeat")!;
      g.fillRect(0, 0, S, S);
      g.restore();
    }
    // sparks
    g.save();
    g.globalCompositeOperation = "lighter";
    for (const s of sparks.current) {
      g.globalAlpha = Math.max(0, s.life);
      g.fillStyle = s.col;
      g.beginPath();
      g.arc(s.x, s.y, s.s * (0.5 + s.life * 0.5), 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  };
  const drawRef = useRef(draw);
  drawRef.current = draw;

  // a loop runs only while something is moving
  const raf = useRef(0);
  const running = useRef(false);
  const kick = () => {
    if (running.current) return;
    running.current = true;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      for (let k = 0; k < 3; k++) flashes.current[k] = Math.max(0, flashes.current[k] - dt * 2.2);
      sparks.current = sparks.current.filter((s) => (s.life -= dt * 1.4) > 0);
      for (const s of sparks.current) {
        s.vy += 260 * dt;
        s.vx *= 0.98;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
      }
      drawRef.current();
      const moving =
        p.some((m) => m.isAnimating()) ||
        dimMv.some((m) => m.isAnimating()) ||
        sparks.current.length > 0 ||
        flashes.current.some((f) => f > 0);
      if (moving) raf.current = requestAnimationFrame(frame);
      else running.current = false;
    };
    raf.current = requestAnimationFrame(frame);
  };
  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // ── turning to a day ──
  const closed = useRef([false, false, false]);
  const go = (i: number, first = false) => {
    const d = days[i];
    RINGS.forEach((ring, k) => {
      const target = frac(ring.key, d);
      const from = p[k].get();
      if (reduce) p[k].set(target);
      else {
        const ctl = animate(p[k], target, {
          type: "spring",
          stiffness: 60,
          damping: 15,
          delay: k * 0.08 + (first ? 0.3 : 0),
          restDelta: 0.0005,
        });
        // when it closes on the way, it celebrates
        if (from < 1 && target >= 1) {
          closed.current[k] = false;
          const unsub = p[k].on("change", (v) => {
            if (v >= 1 && !closed.current[k]) {
              closed.current[k] = true;
              celebrate(k);
              unsub();
            }
          });
          ctl.then(() => unsub());
        }
      }
    });
    kick();
  };
  const celebrate = (k: number) => {
    flashes.current[k] = 1;
    const S = size,
      c = S / 2,
      w = S * 0.085,
      gap = S * 0.012;
    const r = [c - w / 2 - 6, c - w * 1.5 - gap - 6, c - w * 2.5 - gap * 2 - 6][k];
    const ring = RINGS[k];
    for (let i = 0; i < 26; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      const sp = 60 + Math.random() * 140;
      sparks.current.push({
        x: c + Math.cos(-Math.PI / 2) * r,
        y: c + Math.sin(-Math.PI / 2) * r,
        vx: Math.cos(a) * sp + (Math.random() - 0.5) * 60,
        vy: Math.sin(a) * sp,
        life: 1,
        col: Math.random() < 0.5 ? ring.b : "#ffffff",
        s: 1 + Math.random() * 1.8,
      });
    }
    sfx.note([784, 988, 1175][k], { dur: 0.6, gain: 0.035, bell: 0.8 });
    sfx.note([1568, 1976, 2349][k], {
      at: 0.08,
      dur: 0.5,
      gain: 0.02,
      bell: 0.8,
    });
    kick();
  };
  useEffect(() => {
    if (inView) go(day, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);
  const pick = (i: number) => {
    touched.current = true;
    unlockAudio();
    if (i === day) return;
    setDay(i);
    sfx.tick({ freq: 1500, gain: 0.02 });
    go(i);
  };
  // hovering one ring dims the others
  useEffect(() => {
    dimMv.forEach((m, k) =>
      animate(m, hover == null || hover === k ? 1 : 0.28, {
        duration: reduce ? 0 : 0.25,
      }),
    );
    kick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hover]);
  const onMove = (e: RPointerEvent) => {
    const b = cvRef.current!.getBoundingClientRect();
    const x = e.clientX - b.left - b.width / 2,
      y = e.clientY - b.top - b.height / 2;
    const d = Math.hypot(x, y) / (b.width / 2);
    const k = d > 0.83 ? 0 : d > 0.64 ? 1 : d > 0.44 ? 2 : null;
    if (k !== hoverRef.current) setHover(k);
  };

  // autoplay: the week goes by
  useEffect(() => {
    if (!autoplay || !inView) return;
    let i = day;
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      i = (i + 1) % days.length;
      setDay(i);
      go(i);
    }, 2800);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView]);

  const d = days[day];
  const h = hover != null ? RINGS[hover] : null;
  return (
    <div
      ref={rootRef}
      onPointerDown={() => {
        touched.current = true;
        unlockAudio();
      }}
      className={`relative w-full max-w-[380px] overflow-hidden rounded-[28px] p-5 text-white ${className}`}
      style={{
        background: "radial-gradient(120% 80% at 50% 0%, #1c1c22 0%, #0b0b0e 60%, #050506 100%)",
        boxShadow: "0 0 0 1px rgba(255,255,255,.06), 0 30px 60px -30px rgba(0,0,0,.6)",
      }}
    >
      <div className="flex items-baseline justify-between">
        <div className="text-[17px] font-semibold tracking-[-0.01em]">Activity</div>
        <div className="text-[13px] text-white/50">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Today"][day] ?? ""}
        </div>
      </div>
      <div className="relative mx-auto mt-3 grid place-items-center" style={{ width: size, height: size }}>
        <canvas
          ref={cvRef}
          aria-hidden="true"
          style={{ width: size, height: size }}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        />
        <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            {h && (
              <motion.div
                key={h.key}
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.18 }}
              >
                <div className="text-[12px] font-medium" style={{ color: h.text }}>
                  {h.name}
                </div>
                <div className="text-[20px] font-semibold tabular-nums">{fmt(d[h.key])}</div>
                <div className="text-[11px] text-white/50 tabular-nums">
                  of {goals[h.key]} {h.unit}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* the numbers */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {RINGS.map((ring, k) => (
          <button
            key={ring.key}
            type="button"
            onPointerEnter={() => setHover(k)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(k)}
            onBlur={() => setHover(null)}
            className="rounded-[14px] bg-white/[.06] px-3 py-2.5 text-left outline-none transition-colors hover:bg-white/[.1] focus-visible:shadow-[0_0_0_2px_#0a84ff]"
            aria-label={`${ring.name}: ${fmt(d[ring.key])} of ${goals[ring.key]} ${ring.unit}`}
          >
            <div className="flex items-center gap-1 text-[12px] font-medium" style={{ color: ring.text }}>
              <Ico d={ring.icon} size={12} />
              {ring.name}
            </div>
            <div className="mt-1 text-[17px] font-semibold tabular-nums">
              <Count value={d[ring.key]} reduce={reduce} />
              <span className="ml-0.5 text-[11px] font-medium text-white/45">{ring.unit}</span>
            </div>
          </button>
        ))}
      </div>
      {/* the week */}
      <div className="mt-3 flex justify-between rounded-[16px] bg-white/[.04] p-1.5" role="radiogroup" aria-label="Day">
        {days.map((x, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={i === day}
            aria-label={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i] ?? x.label}
            onClick={() => pick(i)}
            onKeyDown={(e) => {
              const n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
              if (n) {
                e.preventDefault();
                const j = (i + n + days.length) % days.length;
                pick(j);
                (e.currentTarget.parentElement?.children[j] as HTMLElement | undefined)?.focus();
              }
            }}
            tabIndex={i === day ? 0 : -1}
            className="relative flex flex-1 flex-col items-center gap-1 rounded-[12px] py-1.5 outline-none focus-visible:shadow-[0_0_0_2px_#0a84ff]"
          >
            {i === day && (
              <motion.span
                layoutId="ring-day"
                className="absolute inset-0 rounded-[12px] bg-white/[.1]"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className={`relative text-[11px] font-semibold ${i === day ? "text-white" : "text-white/45"}`}>
              {x.label}
            </span>
            <Mini day={x} goals={goals} />
          </button>
        ))}
      </div>
    </div>
  );
}

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

/** a number that counts to its new value */
function Count({ value, reduce }: { value: number; reduce: boolean }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reduce) {
      setShown(value);
      from.current = value;
      return;
    }
    const a = animate(from.current, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(v),
    });
    from.current = value;
    return () => a.stop();
  }, [value, reduce]);
  return <span>{Number.isInteger(value) ? Math.round(shown) : shown.toFixed(1)}</span>;
}

/** the day's three rings, small */
function Mini({ day, goals }: { day: RingDay; goals: { move: number; exercise: number; run: number } }) {
  const S = 26,
    c = S / 2,
    w = 3;
  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} className="relative" aria-hidden="true">
      {RINGS.map((ring, k) => {
        const r = c - w / 2 - 0.5 - k * (w + 1);
        const v = Math.min(1, day[ring.key] / goals[ring.key]);
        const len = 2 * Math.PI * r;
        return (
          <g key={ring.key} transform={`rotate(-90 ${c} ${c})`}>
            <circle cx={c} cy={c} r={r} fill="none" stroke={ring.track} strokeWidth={w} />
            {v > 0 && (
              <circle
                cx={c}
                cy={c}
                r={r}
                fill="none"
                stroke={ring.b}
                strokeWidth={w}
                strokeLinecap="round"
                strokeDasharray={`${len * v} ${len}`}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
