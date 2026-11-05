# Clock Picker

Add the "Clock Picker" component from Nexus UI to my project.

A time picker on a real clock face. Drag either hand: it trails your finger on a spring, the hour hand creeps as the minute hand goes round, and the numbers swell as a hand passes. Let go mid-spin and it coasts, then ticks into place. Wind past twelve and the AM/PM flap flips; the dial's sky follows the hour so night looks like night. Tap a number to jump the hour, or the minute track to set minutes. Keyboard: focus a hand and use the arrow keys (Page Up/Down for an hour, A/P for AM/PM).

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { ClockPicker } from "@/components/clock-picker";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/clock-picker/clock-picker.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
} from "react";
import {
  AnimatePresence,
  animate,
  frame,
  motion,
  motionValue,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";

export type ClockPickerProps = {
  /** Starting time, 24-hour "HH:MM". */
  defaultValue?: string;
  /** Minutes the minute hand snaps to when you let go. */
  step?: number;
  /** Small line above the title. */
  label?: string;
  title?: string;
  /** Show "Rings in 7 hr 30 min" under the time. */
  countdown?: boolean;
  /** Soft watch ticks while the hands move (only after someone touches it). */
  sound?: boolean;
  /** Called with "HH:MM" (24-hour) once the hands settle. */
  onChange?: (value: string) => void;
  autoplay?: boolean;
  className?: string;
};

// Phosphor (via Iconify), inlined
const ICON: Record<"sun" | "horizon" | "moon", { vb: number; body: string }> = {
  sun: { vb: 256, body: "<path fill=\"currentColor\" d=\"M120 40V16a8 8 0 0 1 16 0v24a8 8 0 0 1-16 0m8 24a64 64 0 1 0 64 64a64.07 64.07 0 0 0-64-64m-69.66 5.66a8 8 0 0 0 11.32-11.32l-16-16a8 8 0 0 0-11.32 11.32Zm0 116.68l-16 16a8 8 0 0 0 11.32 11.32l16-16a8 8 0 0 0-11.32-11.32M192 72a8 8 0 0 0 5.66-2.34l16-16a8 8 0 0 0-11.32-11.32l-16 16A8 8 0 0 0 192 72m5.66 114.34a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32-11.32ZM48 128a8 8 0 0 0-8-8H16a8 8 0 0 0 0 16h24a8 8 0 0 0 8-8m80 80a8 8 0 0 0-8 8v24a8 8 0 0 0 16 0v-24a8 8 0 0 0-8-8m112-88h-24a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16\"/>" },
  horizon: { vb: 256, body: "<path fill=\"currentColor\" d=\"M248 160a8 8 0 0 1-8 8H16a8 8 0 0 1 0-16h40.45a74 74 0 0 1-.45-8a72 72 0 0 1 144 0a74 74 0 0 1-.45 8H240a8 8 0 0 1 8 8m-40 32H48a8 8 0 0 0 0 16h160a8 8 0 0 0 0-16M80.84 59.58a8 8 0 0 0 14.32-7.16l-8-16a8 8 0 0 0-14.32 7.16Zm-60.42 43.58l16 8a8 8 0 1 0 7.16-14.31l-16-8a8 8 0 1 0-7.16 14.31M216 112a8 8 0 0 0 3.57-.84l16-8a8 8 0 1 0-7.16-14.31l-16 8A8 8 0 0 0 216 112m-51.58-48.84a8 8 0 0 0 10.74-3.58l8-16a8 8 0 0 0-14.32-7.16l-8 16a8 8 0 0 0 3.58 10.74\"/>" },
  moon: { vb: 256, body: "<path fill=\"currentColor\" d=\"M240 96a8 8 0 0 1-8 8h-16v16a8 8 0 0 1-16 0v-16h-16a8 8 0 0 1 0-16h16V72a8 8 0 0 1 16 0v16h16a8 8 0 0 1 8 8m-96-40h8v8a8 8 0 0 0 16 0v-8h8a8 8 0 0 0 0-16h-8v-8a8 8 0 0 0-16 0v8h-8a8 8 0 0 0 0 16m65.14 94.33A88.07 88.07 0 0 1 105.67 46.86a8 8 0 0 0-10.6-9.06A96 96 0 1 0 218.2 160.93a8 8 0 0 0-9.06-10.6\"/>" },
};

const DAY = 1440;
const HALF = 720;
const mod = (a: number, n: number) => ((a % n) + n) % n;
/** signed shortest turn from b to a, in degrees */
const turn = (a: number, b: number) => mod(a - b + 180, 360) - 180;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smooth = (x: number) => x * x * (3 - 2 * x);
const bump = (d: number, w: number) => (d >= w ? 0 : smooth(1 - d / w));
const parse = (s?: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s ?? "");
  return m ? mod(+m[1] * 60 + +m[2], DAY) : 450;
};
const fmt24 = (v: number) => `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
const h12 = (v: number) => {
  const h = Math.floor(v / 60) % 12;
  return h === 0 ? 12 : h;
};

// ─── the sky inside the dial, by hour of day ───
type RGB = [number, number, number];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const css = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const SKY: [number, RGB, RGB][] = [
  [0, hex("#161b38"), hex("#272b55")],
  [4.6, hex("#1e2350"), hex("#3c3470")],
  [5.9, hex("#f4b7a4"), hex("#c99ac4")],
  [7.2, hex("#fff1e2"), hex("#ffd9c4")],
  [9.5, hex("#ffffff"), hex("#eaf1fb")],
  [15, hex("#ffffff"), hex("#f2f0ea")],
  [17.4, hex("#fff0d6"), hex("#ffc9a3")],
  [18.9, hex("#f59a86"), hex("#8b70c2")],
  [20.3, hex("#2a2b5e"), hex("#1c1e42")],
  [24, hex("#161b38"), hex("#272b55")],
];
const skyAt = (hr: number): [RGB, RGB] => {
  for (let i = 0; i < SKY.length - 1; i++) {
    const [h0, t0, b0] = SKY[i];
    const [h1, t1, b1] = SKY[i + 1];
    if (hr >= h0 && hr <= h1) {
      const k = smooth((hr - h0) / (h1 - h0));
      return [mix(t0, t1, k), mix(b0, b1, k)];
    }
  }
  return [SKY[0][1], SKY[0][2]];
};
/** WCAG relative luminance */
const lin = (v: number) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : Math.pow((v / 255 + 0.055) / 1.055, 2.4));
const lum = (c: RGB) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
const INK_DAY = hex("#1d1d1f");
const INK_NIGHT = hex("#f5f5f7");
const ACC_DAY = hex("#0071e3");
const ACC_NIGHT = hex("#6cb2ff");

const STARS: [number, number, number][] = [
  [-0.32, -0.3, 1.6], [0.12, -0.42, 1.2], [0.36, -0.18, 1.8], [-0.12, -0.12, 1], [0.24, 0.3, 1.3],
  [-0.38, 0.12, 1.2], [-0.2, 0.38, 1.5], [0.42, 0.08, 1], [0.02, 0.44, 1.1], [-0.46, -0.06, 0.9],
];

const STOP = Symbol("stop");
type Hand = "m" | "h";

/**
 * A time picker on a real clock face. Drag either hand: it trails your finger on a spring, the hour
 * hand creeps as the minute hand goes round, and the numbers swell as a hand passes. Let go mid-spin and
 * it coasts, then ticks into place. Wind past twelve and the AM/PM flap flips; the dial's sky follows
 * the hour so night looks like night. Tap a number to jump the hour, or the minute track to set minutes.
 * Keyboard: focus a hand and use the arrow keys (Page Up/Down for an hour, A/P for AM/PM).
 */
export function ClockPicker({
  defaultValue = "07:30",
  step = 5,
  label = "Alarm",
  title = "Wake up",
  countdown = true,
  sound = true,
  onChange,
  autoplay = false,
  className = "",
}: ClockPickerProps) {
  const reduced = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const litRef = useRef<HTMLDivElement>(null);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const inView = useInView(rootRef, { amount: 0.25 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [size, setSize] = useState(292);
  const R = size / 2;
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize(Math.round(clamp(e.contentRect.width, 220, 292))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // total minutes, continuous and unbounded while moving; both hands are read from it like a real movement
  const start = parse(defaultValue);
  const tm = useMotionValue(start);
  const target = useRef(start);
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const minDeg = useTransform(tm, (t) => t * 6);
  const hourDeg = useTransform(tm, (t) => t * 0.5);
  // how lifted / how lively each hand is (0.3 resting, 1 held)
  const liftM = useMotionValue(0);
  const liftH = useMotionValue(0);
  const actM = useMotionValue(0.3);
  const actH = useMotionValue(0.3);

  const inkMv = useMotionValue(0);
  const inkTo = useRef(-1);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  const [v, setV] = useState(start);
  const vRef = useRef(start);
  const [dir, setDir] = useState(1);
  const [said, setSaid] = useState(start);
  const committed = useRef(start);

  // ─── painting the dial (numerals, sky, minute track) straight onto the DOM, once per frame ───
  const geo = useRef({ R });
  geo.current.R = R;
  const paint = useCallback(() => {
    const t = tm.get();
    const R = geo.current.R;
    const mA = mod(t * 6, 360);
    const hA = mod(t * 0.5, 360);
    const hr = mod(t, DAY) / 60;
    const [top, bot] = skyAt(hr);
    const L = lum(mix(top, bot, 0.5));
    // ink flips between dark and light where both read about equally (luminance ~0.18), with a little
    // hysteresis, and crossfades over a third of a second rather than passing through an unreadable grey
    const want = L < 0.165 ? 1 : L > 0.195 ? 0 : inkTo.current < 0 ? +(L < 0.18) : inkTo.current;
    if (want !== inkTo.current) {
      const first = inkTo.current < 0;
      inkTo.current = want;
      if (reducedRef.current || first) inkMv.jump(want);
      else animate(inkMv, want, { duration: 0.35, ease: "easeOut" });
    }
    const night = inkMv.get();
    const dark = clamp((0.14 - L) / 0.08, 0, 1);
    const ink = mix(INK_DAY, INK_NIGHT, night);
    const acc = mix(ACC_DAY, ACC_NIGHT, night);
    const face = faceRef.current;
    if (face) {
      face.style.setProperty("--ink", css(ink));
      face.style.setProperty("--ink-soft", css(ink, 0.34 + night * 0.12));
      face.style.setProperty("--acc", css(acc));
    }
    if (skyRef.current) skyRef.current.style.background = `radial-gradient(130% 110% at 50% 0%, ${css(top)} 0%, ${css(bot)} 100%)`;
    // the sun crosses the dial from the 9 (6 am) over the 12 (noon) to the 3 (6 pm)
    if (glowRef.current) {
      const th = ((hr - 12) / 6) * (Math.PI / 2);
      const up = clamp(Math.sin(((hr - 5.5) / 13) * Math.PI) * 1.6, 0, 1) * (1 - dark);
      glowRef.current.style.transform = `translate(${Math.sin(th) * R * 0.5}px, ${-Math.cos(th) * R * 0.5}px) translate(-50%, -50%)`;
      glowRef.current.style.opacity = String(up);
    }
    if (starsRef.current) starsRef.current.style.opacity = String(dark);
    const deg = mA < 0.05 ? 0 : mA;
    const mask = `conic-gradient(#000 ${deg}deg, transparent ${deg}deg)`;
    if (litRef.current) {
      litRef.current.style.maskImage = mask;
      litRef.current.style.webkitMaskImage = mask;
    }
    const am = actM.get();
    const ah = actH.get();
    const rNum = R * 0.7;
    for (let i = 1; i <= 12; i++) {
      const el = numRefs.current[i];
      if (!el) continue;
      const a = i * 30;
      const bm = bump(Math.abs(turn(mA, a)), 34) * am;
      const bh = bump(Math.abs(turn(hA, a)), 30) * ah;
      const s = 1 + 0.5 * bm + 0.32 * bh;
      const r = rNum + R * (0.04 * bm + 0.02 * bh);
      const rad = (a * Math.PI) / 180;
      el.style.transform = `translate(${Math.sin(rad) * r}px, ${-Math.cos(rad) * r}px) translate(-50%, -50%) scale(${s})`;
      const c = mix(ink, acc, clamp(bm * 1.1, 0, 1));
      el.style.color = css(c, clamp(0.72 + 0.28 * Math.max(bm, bh), 0, 1));
    }
  }, [tm, actM, actH, inkMv]);

  useEffect(() => {
    let queued = false;
    const q = () => {
      if (queued) return;
      queued = true;
      frame.render(() => {
        queued = false;
        paint();
      });
    };
    paint();
    const offs = [tm.on("change", q), actM.on("change", q), actH.on("change", q), inkMv.on("change", q)];
    return () => offs.forEach((f) => f());
  }, [paint, tm, actM, actH, inkMv, size]);

  // ─── sound: a tiny watch tick, only once someone has touched it ───
  const audio = useRef<AudioContext | null>(null);
  const noise = useRef<AudioBuffer | null>(null);
  const lastTick = useRef(0);
  const arm = useCallback(() => {
    if (!sound || audio.current) return;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ac = new AC();
    const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.025), ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 6);
    audio.current = ac;
    noise.current = buf;
  }, [sound]);
  const tick = useCallback((big: boolean) => {
    const ac = audio.current;
    const buf = noise.current;
    if (!ac || !buf) return;
    if (ac.state === "suspended") void ac.resume();
    const now = performance.now();
    if (now - lastTick.current < 34) return;
    lastTick.current = now;
    const src = ac.createBufferSource();
    src.buffer = buf;
    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = big ? 2300 : 3400;
    bp.Q.value = 3.5;
    const g = ac.createGain();
    g.gain.value = big ? 0.22 : 0.12;
    src.connect(bp).connect(g).connect(ac.destination);
    src.start();
  }, []);

  // readout + ticks follow the moving value
  useEffect(() => {
    let idx = Math.round(tm.get() / step);
    return tm.on("change", (t) => {
      const nv = mod(Math.round(t), DAY);
      if (nv !== vRef.current) {
        const d = turn(nv / 4, vRef.current / 4); // shortest way round a 24h dial, in quarter-degrees
        vRef.current = nv;
        setDir(d >= 0 ? 1 : -1);
        setV(nv);
      }
      const ni = Math.round(t / step);
      if (ni !== idx) {
        tick(mod(ni * step, 60) === 0);
        idx = ni;
      }
    });
  }, [tm, step, tick]);

  const commit = useCallback(() => {
    const nv = mod(Math.round(tm.get()), DAY);
    setSaid(nv);
    if (nv !== committed.current) {
      committed.current = nv;
      onChangeRef.current?.(fmt24(nv));
    }
  }, [tm]);

  const settle = useCallback(
    (to: number, soft = false) => {
      target.current = to;
      anim.current?.stop();
      if (reduced) {
        tm.jump(mod(to, DAY));
        target.current = mod(to, DAY);
        commit();
        return;
      }
      const c = animate(tm, to, {
        type: "spring",
        stiffness: soft ? 170 : 380,
        damping: soft ? 22 : 21,
        mass: 1,
        restDelta: 0.002,
        restSpeed: 0.05,
        onComplete: () => {
          if (anim.current !== c) return;
          anim.current = null;
          // fold the extra turns away; both hands look identical a whole day later
          const n = mod(to, DAY);
          tm.jump(n);
          target.current = n;
          commit();
        },
      });
      anim.current = c;
    },
    [tm, reduced, commit],
  );

  // ─── pointer: pick a hand, let it trail the finger on a spring, fling, snap ───
  type Drag = { hand: Hand; jump: boolean; a0: number; lastA: number; goal: number; m0: number; hist: [number, number][]; sx: number; sy: number; moved: boolean; t0: number };
  const drag = useRef<Drag | null>(null);
  const where = (cx: number, cy: number) => {
    const r = faceRef.current!.getBoundingClientRect();
    const x = cx - (r.left + r.width / 2);
    const y = cy - (r.top + r.height / 2);
    return { a: mod((Math.atan2(x, -y) * 180) / Math.PI, 360), r: Math.hypot(x, y) / (r.width / 2) };
  };
  const liftOf = (h: Hand) => (h === "m" ? liftM : liftH);
  const actOf = (h: Hand) => (h === "m" ? actM : actH);
  const spring = { type: "spring" as const, stiffness: 420, damping: 26 };

  const down = useCallback(
    (cx: number, cy: number) => {
      if (!faceRef.current) return;
      const { a, r } = where(cx, cy);
      const t = tm.get();
      const dM = Math.abs(turn(a, mod(t * 6, 360)));
      const dH = Math.abs(turn(a, mod(t * 0.5, 360)));
      const nearM = dM < 24 && r > 0.22;
      const nearH = dH < 24 && r > 0.14 && r < 0.78;
      let hand: Hand;
      let jump = false;
      if (nearM && nearH) hand = r > 0.48 ? "m" : "h";
      else if (nearM) hand = "m";
      else if (nearH) hand = "h";
      else {
        hand = r >= 0.8 ? "m" : "h";
        jump = true;
      }
      anim.current?.stop();
      anim.current = null;
      let goal = t;
      if (jump) goal = hand === "m" ? t + turn(a, mod(t * 6, 360)) / 6 : t + turn(a, mod(t * 0.5, 360)) * 2;
      drag.current = { hand, jump, a0: a, lastA: a, goal, m0: mod(Math.round(target.current), 60), hist: [[performance.now(), goal]], sx: cx, sy: cy, moved: false, t0: performance.now() };
      if (!reduced) {
        animate(liftOf(hand), 1, spring);
        animate(actOf(hand), 1, spring);
        if (jump) anim.current = animate(tm, goal, { type: "spring", stiffness: 520, damping: 34 });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tm, reduced],
  );

  const move = useCallback(
    (cx: number, cy: number) => {
      const d = drag.current;
      if (!d) return;
      if (!d.moved && Math.hypot(cx - d.sx, cy - d.sy) > 5) d.moved = true;
      if (!d.moved) return;
      const { a } = where(cx, cy);
      const da = turn(a, d.lastA);
      d.lastA = a;
      d.goal += d.hand === "m" ? da / 6 : da * 2;
      const now = performance.now();
      d.hist.push([now, d.goal]);
      while (d.hist.length > 2 && now - d.hist[0][0] > 110) d.hist.shift();
      if (reduced) tm.set(d.goal);
      else anim.current = animate(tm, d.goal, { type: "spring", stiffness: 640, damping: 40, mass: 0.7 });
    },
    [tm, reduced],
  );

  const up = useCallback(() => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    let to: number;
    if (!d.moved) {
      // a tap: the minute track sets minutes the short way round, a number sets the hour (same AM/PM)
      if (d.hand === "m") to = Math.round(d.goal / step) * step;
      else {
        const H = mod(Math.round(d.a0 / 30), 12);
        const base = Math.floor(mod(target.current, DAY) / HALF) * HALF;
        to = base + H * 60 + d.m0;
        const cur = tm.get();
        to += Math.round((cur - to) / DAY) * DAY; // stay on the same day so it travels the short way
      }
    } else {
      const now = performance.now();
      const [t0, g0] = d.hist[0];
      const [t1, g1] = d.hist[d.hist.length - 1];
      const vel = now - t1 > 90 || t1 - t0 < 16 ? 0 : ((g1 - g0) / (t1 - t0)) * 1000; // minutes per second
      if (d.hand === "m") {
        const proj = d.goal + clamp(vel * 0.22, -360, 360);
        to = Math.round(proj / step) * step;
      } else {
        const proj = d.goal + clamp(vel * 0.16, -720, 720);
        to = Math.round((proj - d.m0) / 60) * 60 + d.m0;
      }
    }
    if (!reduced) {
      animate(liftOf(d.hand), 0, { type: "spring", stiffness: 300, damping: 18 });
      animate(actOf(d.hand), 0.3, { type: "spring", stiffness: 120, damping: 20, delay: 0.25 });
    }
    settle(to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tm, step, reduced, settle]);

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    arm();
    e.currentTarget.setPointerCapture(e.pointerId);
    down(e.clientX, e.clientY);
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => move(e.clientX, e.clientY);
  const onUp = () => up();

  // ─── AM/PM: a whole half-day later the hands look the same, so only the flap moves ───
  const pm = v >= HALF;
  const skyOldRef = useRef<HTMLDivElement>(null);
  const togglePM = useCallback(() => {
    // the sky can't tween a gradient, so lay the old one on top and fade it away
    const face = faceRef.current;
    if (face && skyRef.current && skyOldRef.current && !reduced) {
      const old = skyOldRef.current;
      old.style.background = skyRef.current.style.background;
      old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, easing: "ease-out", fill: "forwards" });
      face.dataset.fade = "1";
      window.setTimeout(() => delete face.dataset.fade, 720);
    }
    const shift = mod(target.current, DAY) >= HALF ? -HALF : HALF;
    const moving = !!anim.current;
    anim.current?.stop();
    anim.current = null;
    tm.jump(tm.get() + shift);
    if (moving) settle(target.current + shift);
    else {
      target.current += shift;
      commit();
    }
  }, [tm, settle, commit, reduced]);

  // ─── keyboard on the hands ───
  const onKey = (hand: Hand) => (e: RKeyboardEvent<HTMLDivElement>) => {
    arm();
    const k = e.key;
    let d = 0;
    if (k === "ArrowUp" || k === "ArrowRight") d = hand === "m" ? step : 60;
    else if (k === "ArrowDown" || k === "ArrowLeft") d = hand === "m" ? -step : -60;
    else if (k === "PageUp") d = hand === "m" ? 60 : 180;
    else if (k === "PageDown") d = hand === "m" ? -60 : -180;
    else if ((k === "a" || k === "A") && mod(target.current, DAY) >= HALF) return e.preventDefault(), togglePM();
    else if ((k === "p" || k === "P") && mod(target.current, DAY) < HALF) return e.preventDefault(), togglePM();
    else return;
    e.preventDefault();
    const base = hand === "m" ? Math.round(target.current / step) * step : target.current;
    settle(base + d);
  };

  // ─── autoplay: a ghost finger winds the minute hand, drags the hour past noon, flips to night and back ───
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gs = useMotionValue(1);
  const go = useMotionValue(0);
  useEffect(() => {
    if (!autoplay || reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let alive = true;
    const running = new Set<AnimationPlaybackControls>();
    const abort = () => {
      if (!alive) return;
      alive = false;
      running.forEach((c) => c.stop());
      if (drag.current) up();
      animate(go, 0, { duration: 0.2 });
    };
    const onTouch = (e: Event) => e.isTrusted && abort();
    root.addEventListener("pointerdown", onTouch, true);
    root.addEventListener("keydown", onTouch, true);
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        let left = ms;
        let lastT = performance.now();
        const tk = () => {
          if (!alive) return rej(STOP);
          const t = performance.now();
          if (inViewRef.current) left -= t - lastT;
          lastT = t;
          if (left <= 0) res();
          else setTimeout(tk, Math.min(60, Math.max(16, left)));
        };
        tk();
      });
    const run = (mv: MotionValue<number>, to: number, duration: number, ease: [number, number, number, number] = [0.4, 0, 0.2, 1]) =>
      new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        if (Math.abs(mv.get() - to) < 0.01) return res();
        const c = animate(mv, to, { duration, ease, onComplete: () => (running.delete(c), res()) });
        running.add(c);
      });
    // finger position on the dial, in root coordinates, from an angle and a radius fraction
    const centre = () => {
      const f = faceRef.current!.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      return { x: f.left - b.left + f.width / 2, y: f.top - b.top + f.height / 2, R: f.width / 2, bx: b.left, by: b.top };
    };
    const put = (deg: number, rr: number) => {
      const c = centre();
      const rad = (deg * Math.PI) / 180;
      gx.set(c.x + Math.sin(rad) * c.R * rr);
      gy.set(c.y - Math.cos(rad) * c.R * rr);
    };
    const client = () => {
      const b = root.getBoundingClientRect();
      return [b.left + gx.get(), b.top + gy.get()] as const;
    };
    const phi = motionValue(0);
    const arrive = async (deg: number, rr: number) => {
      put(deg + 14, rr + 0.25);
      const tx = gx.get();
      const ty = gy.get();
      put(deg, rr);
      const ex = gx.get();
      const ey = gy.get();
      gx.set(tx);
      gy.set(ty);
      await run(go, 1, 0.25);
      await Promise.all([run(gx, ex, 0.5), run(gy, ey, 0.5)]);
    };
    const press = async () => {
      await run(gs, 0.8, 0.1);
      down(...client());
    };
    const release = async () => {
      up();
      await run(gs, 1, 0.12);
    };
    const sweep = async (from: number, to: number, rr: number, dur: number, ease: [number, number, number, number]) => {
      phi.set(from);
      const off = phi.on("change", (p) => {
        put(p, rr);
        move(...client());
      });
      try {
        await run(phi, to, dur, ease);
      } finally {
        off();
      }
    };
    const tapAt = async (deg: number, rr: number) => {
      await arrive(deg, rr);
      await press();
      await wait(90);
      await release();
    };
    (async () => {
      await wait(1000);
      while (alive) {
        // 1. wind the minute hand round twice and flick it
        let m = mod(tm.get() * 6, 360);
        await arrive(m, 0.5);
        await press();
        await sweep(m, m + 470, 0.5, 2.1, [0.45, 0, 0.55, 1]);
        await sweep(m + 470, m + 520, 0.5, 0.11, [0.3, 0, 0.7, 1]);
        await release();
        await run(go, 0, 0.3);
        await wait(1100);
        // 2. drag the hour hand past twelve
        const h = mod(target.current * 0.5, 360);
        await arrive(h, 0.32);
        await press();
        await sweep(h, h + (360 - h) + 40, 0.32, 1.7, [0.45, 0, 0.4, 1]);
        await wait(120);
        await release();
        await run(go, 0, 0.3);
        await wait(1200);
        // 3. flip the flap to AM: the middle of the night
        const flap = root.querySelector<HTMLElement>("[data-flap]");
        if (flap) {
          const r = flap.getBoundingClientRect();
          const b = root.getBoundingClientRect();
          const fx = r.left - b.left + r.width / 2;
          const fy = r.top - b.top + r.height / 2;
          gx.set(fx + 30);
          gy.set(fy + 40);
          await run(go, 1, 0.25);
          await Promise.all([run(gx, fx, 0.45), run(gy, fy, 0.45)]);
          await run(gs, 0.8, 0.1);
          togglePM();
          await run(gs, 1, 0.12);
          await run(go, 0, 0.3);
        }
        await wait(1900);
        // 4. tap the 7 to bring the morning back, then the half-hour mark
        await tapAt(210, 0.7);
        await run(go, 0, 0.3);
        await wait(1100);
        m = 180;
        await tapAt(m, 0.9);
        await run(go, 0, 0.3);
        await wait(2400);
      }
    })().catch((e) => e !== STOP && console.error(e));
    return () => {
      abort();
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced]);

  // ─── derived bits for render ───
  const H = h12(v);
  const mm = v % 60;
  const hr = v / 60;
  const icon: keyof typeof ICON = hr >= 7 && hr < 17.2 ? "sun" : (hr >= 5.2 && hr < 7) || (hr >= 17.2 && hr < 19.6) ? "horizon" : "moon";
  const iconColor = icon === "sun" ? "#ff9f0a" : icon === "horizon" ? "#ff6a3d" : "#5e5ce6";
  const now = new Date();
  const left = mod(said - (now.getHours() * 60 + now.getMinutes()), DAY) || DAY;
  const lh = Math.floor(left / 60);
  const lm = left % 60;
  const spoken = `${h12(said)}:${String(said % 60).padStart(2, "0")} ${said >= HALF ? "PM" : "AM"}`;

  // hand geometry in px
  const LM = R * 0.56;
  const LH = R * 0.37;
  const shadowXM = useTransform(liftM, (l) => 1.2 + l * 4.5);
  const shadowYM = useTransform(liftM, (l) => 2 + l * 8);
  const shadowXH = useTransform(liftH, (l) => 1.2 + l * 4.5);
  const shadowYH = useTransform(liftH, (l) => 2 + l * 8);
  const blurM = useTransform(liftM, (l) => 1.4 + l * 3.2);
  const blurH = useTransform(liftH, (l) => 1.4 + l * 3.2);
  const shadowFilterM = useMotionTemplate`blur(${blurM}px)`;
  const shadowFilterH = useMotionTemplate`blur(${blurH}px)`;
  const scaleM = useTransform(liftM, (l) => 1 + l * 0.035);
  const scaleH = useTransform(liftH, (l) => 1 + l * 0.05);

  const ticks = (
    <svg viewBox="-100 -100 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i * 6 * Math.PI) / 180;
        const major = i % 5 === 0;
        const r0 = major ? 85.5 : 89;
        const r1 = 93;
        return (
          <line
            key={i}
            x1={Math.sin(a) * r0}
            y1={-Math.cos(a) * r0}
            x2={Math.sin(a) * r1}
            y2={-Math.cos(a) * r1}
            stroke="currentColor"
            strokeWidth={major ? 2.1 : 1.05}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );

  const handBar = (len: number, w: number, tail: number, color: string, knob: boolean) => (
    <>
      <span className="absolute rounded-full" style={{ left: -w / 2, top: -len, width: w, height: len + tail, background: color }} />
      {knob && <span className="absolute rounded-full" style={{ left: -8, top: -len - 8, width: 16, height: 16, background: color }} />}
    </>
  );

  return (
    <div
      ref={rootRef}
      className={`relative w-full max-w-[360px] select-none overflow-hidden rounded-[32px] bg-white px-5 pb-6 pt-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="m-0 text-[13px] font-medium text-[#6e6e73]">{label}</p>
          <h3 className="m-0 text-[22px] font-semibold leading-tight tracking-[-0.025em]">{title}</h3>
        </div>
        <div className="relative grid h-9 w-9 place-items-center rounded-full bg-[#f5f5f7]" aria-hidden="true">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.svg
              key={icon}
              viewBox={`0 0 ${ICON[icon].vb} ${ICON[icon].vb}`}
              width={20}
              height={20}
              style={{ color: iconColor }}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, rotate: -40, scale: 0.6 }}
              animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -14, rotate: 40, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 380, damping: 24 }}
              dangerouslySetInnerHTML={{ __html: ICON[icon].body }}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* readout: rolling digits and the AM/PM flap */}
      <div className="mt-3 flex items-end justify-center gap-2.5">
        <div className="flex items-baseline text-[64px] font-semibold leading-none tracking-[-0.045em] tabular-nums" aria-hidden="true">
          <Digit value={H >= 10 ? 1 : null} dir={dir} reduced={reduced} />
          <Digit value={H % 10} dir={dir} reduced={reduced} />
          <span className="relative -top-[0.06em] mx-[0.02em] text-[#1d1d1f]/80">:</span>
          <Digit value={Math.floor(mm / 10)} dir={dir} reduced={reduced} />
          <Digit value={mm % 10} dir={dir} reduced={reduced} />
        </div>
        <Flap pm={pm} onToggle={togglePM} reduced={reduced} />
      </div>
      <p className="m-0 mt-1.5 h-[18px] text-center text-[13px] text-[#6e6e73] tabular-nums">
        {countdown && (
          <>
            Rings in {lh > 0 && `${lh} hr `}
            {lm} min
          </>
        )}
      </p>
      <p className="sr-only" aria-live="polite">
        {spoken}
      </p>

      {/* the dial */}
      <div ref={wrapRef} className="mt-5 flex w-full justify-center">
        <div
          ref={faceRef}
          role="group"
          aria-label={`Time, ${spoken}`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className="relative shrink-0 cursor-grab rounded-full [touch-action:none] active:cursor-grabbing [&[data-fade]_*]:[transition:color_.6s,background-color_.6s,opacity_.6s]"
          style={{ width: size, height: size, ["--ink" as string]: "#1d1d1f", ["--ink-soft" as string]: "rgba(29,29,31,.34)", ["--acc" as string]: "#0071e3" }}
        >
          <div ref={skyRef} className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,.06),inset_0_-10px_24px_rgba(0,0,0,.06),0_22px_44px_-26px_rgba(0,0,0,.5)]" />
          <div ref={skyOldRef} className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,.06),inset_0_-10px_24px_rgba(0,0,0,.06)]" style={{ opacity: 0 }} aria-hidden="true" />
          <div className="absolute inset-0 overflow-hidden rounded-full" aria-hidden="true">
            <div
              ref={glowRef}
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{ width: size * 0.95, height: size * 0.95, background: "radial-gradient(circle, rgba(255,218,150,.55) 0%, rgba(255,218,150,.18) 35%, rgba(255,218,150,0) 62%)" }}
            />
            <div ref={starsRef} className="absolute inset-0" style={{ opacity: 0 }}>
              {STARS.map(([x, y, s], i) => (
                <motion.span
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{ left: `${50 + x * 100}%`, top: `${50 + y * 100}%`, width: s * 2, height: s * 2 }}
                  animate={reduced ? undefined : { opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 2.2 + (i % 4) * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                />
              ))}
            </div>
          </div>
          <div className="absolute inset-0" style={{ color: "var(--ink-soft)" }}>
            {ticks}
          </div>
          <div ref={litRef} className="absolute inset-0" style={{ color: "var(--acc)" }}>
            {ticks}
          </div>
          {Array.from({ length: 13 }, (_, i) =>
            i === 0 ? null : (
              <span
                key={i}
                ref={(el) => {
                  numRefs.current[i] = el;
                }}
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 font-medium leading-none tabular-nums tracking-[-0.02em]"
                style={{ fontSize: Math.round(R * 0.15), willChange: "transform" }}
              >
                {i}
              </span>
            ),
          )}

          {/* shadows, in screen space so they always fall the same way */}
          <motion.div className="pointer-events-none absolute inset-0" style={{ x: shadowXH, y: shadowYH, filter: shadowFilterH, opacity: 0.22 }} aria-hidden="true">
            <motion.div className="absolute left-1/2 top-1/2 h-0 w-0" style={{ rotate: hourDeg }}>
              {handBar(LH, 9, 10, "#000", false)}
            </motion.div>
          </motion.div>
          <motion.div className="pointer-events-none absolute inset-0" style={{ x: shadowXM, y: shadowYM, filter: shadowFilterM, opacity: 0.2 }} aria-hidden="true">
            <motion.div className="absolute left-1/2 top-1/2 h-0 w-0" style={{ rotate: minDeg }}>
              {handBar(LM, 4.5, 14, "#000", true)}
            </motion.div>
          </motion.div>

          {/* hour hand */}
          <motion.div className="absolute left-1/2 top-1/2 h-0 w-0" style={{ rotate: hourDeg, scale: scaleH }}>
            {handBar(LH, 9, 10, "var(--ink)", false)}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Hour"
              aria-valuemin={1}
              aria-valuemax={12}
              aria-valuenow={h12(said)}
              aria-valuetext={`${h12(said)} ${said >= HALF ? "PM" : "AM"}`}
              onKeyDown={onKey("h")}
              onFocus={() => animate(actH, 1, spring)}
              onBlur={() => animate(actH, 0.3, spring)}
              className="absolute rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
              style={{ left: -14, top: -LH - 6, width: 28, height: 28 }}
            />
          </motion.div>

          {/* minute hand */}
          <motion.div className="absolute left-1/2 top-1/2 h-0 w-0" style={{ rotate: minDeg, scale: scaleM }}>
            {handBar(LM, 4.5, 14, "var(--acc)", true)}
            <span className="absolute rounded-full bg-white" style={{ left: -3, top: -LM - 3, width: 6, height: 6 }} />
            <div
              role="slider"
              tabIndex={0}
              aria-label="Minutes"
              aria-valuemin={0}
              aria-valuemax={59}
              aria-valuenow={said % 60}
              aria-valuetext={`${said % 60} minutes`}
              onKeyDown={onKey("m")}
              onFocus={() => animate(actM, 1, spring)}
              onBlur={() => animate(actM, 0.3, spring)}
              className="absolute rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
              style={{ left: -14, top: -LM - 14, width: 28, height: 28 }}
            />
          </motion.div>

          {/* centre cap */}
          <span className="pointer-events-none absolute left-1/2 top-1/2 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_1px_3px_rgba(0,0,0,.3)]" style={{ background: "var(--ink)" }} />
          <span className="pointer-events-none absolute left-1/2 top-1/2 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "var(--acc)" }} />
          {/* crystal */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(70% 45% at 50% 8%, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 70%)", mixBlendMode: "soft-light" }}
            aria-hidden="true"
          />
        </div>
      </div>

      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-30 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-[#1d1d1f]/20 shadow-[0_4px_14px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
      />
    </div>
  );
}

/** One rolling digit. New digits come in from below when time goes forward, from above when it goes back. */
function Digit({ value, dir, reduced }: { value: number | null; dir: number; reduced: boolean }) {
  return (
    <motion.span
      className="relative inline-block h-[1em] overflow-hidden text-center"
      initial={false}
      animate={{ width: value === null ? 0 : "0.6em" }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      style={{ lineHeight: 1 }}
    >
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        {value !== null && (
          <motion.span
            key={value}
            custom={dir}
            className="absolute inset-x-0 top-0 block"
            variants={{
              enter: (d: number) => (reduced ? { opacity: 0 } : { y: d > 0 ? "0.75em" : "-0.75em", opacity: 0, filter: "blur(4px)" }),
              rest: { y: 0, opacity: 1, filter: "blur(0px)" },
              leave: (d: number) => (reduced ? { opacity: 0 } : { y: d > 0 ? "-0.75em" : "0.75em", opacity: 0, filter: "blur(4px)" }),
            }}
            initial="enter"
            animate="rest"
            exit="leave"
            transition={{ type: "spring", stiffness: 520, damping: 34, mass: 0.6 }}
          >
            {value}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  );
}

/** The AM/PM flap: a card that turns over on its top hinge. */
function Flap({ pm, onToggle, reduced }: { pm: boolean; onToggle: () => void; reduced: boolean }) {
  const [st, setSt] = useState<{ flips: number; faces: [string, string] }>({ flips: 0, faces: [pm ? "PM" : "AM", pm ? "AM" : "PM"] });
  const last = useRef(pm);
  useEffect(() => {
    if (last.current === pm) return;
    last.current = pm;
    setSt((s) => {
      const n = s.flips + 1;
      const faces: [string, string] = [s.faces[0], s.faces[1]];
      faces[n % 2] = pm ? "PM" : "AM";
      return { flips: n, faces };
    });
  }, [pm]);
  const { flips, faces } = st;
  return (
    <button
      type="button"
      data-flap
      onClick={onToggle}
      aria-label={pm ? "PM, switch to AM" : "AM, switch to PM"}
      className="relative mb-[7px] h-[34px] w-[54px] rounded-[10px] outline-none [perspective:300px] focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
    >
      <motion.span
        className="absolute inset-0 block [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateX: -flips * 180 }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 18 }}
      >
        {faces.map((f, i) => (
          <span
            key={i}
            className="absolute inset-0 grid place-items-center rounded-[10px] bg-[#1d1d1f] text-[15px] font-semibold tracking-[0.02em] text-white [backface-visibility:hidden] shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_6px_14px_-8px_rgba(0,0,0,.6)]"
            style={{ transform: i === 1 ? "rotateX(180deg)" : undefined }}
          >
            {f}
            <span className="absolute inset-x-0 top-1/2 h-px bg-black/40" />
          </span>
        ))}
      </motion.span>
    </button>
  );
}
```

--- components/clock-picker/index.ts ---

```ts
export { ClockPicker } from "./clock-picker";
export type { ClockPickerProps } from "./clock-picker";
```
