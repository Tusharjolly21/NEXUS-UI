# Effort Slider

Add the "Effort Slider" component from Nexus UI to my project.

An effort setting for an AI answer, from Faster to Smarter. Below the top level the track is a calm glowing fill with a few stars in it and a shimmer running through, coloured from cool teal up to violet, and the thumb is a spiral galaxy seen at an angle, like a telescope photograph: thousands of stars, dust lanes, pink star-forming knots, a warm core and diffraction spikes, maturing from a faint loose spiral into a bright grand-design one as you go. Reach the top and the slider transforms: a flash, a burst of sparks, and the fill breaks into a dense mosaic of violet, pink, cyan and white star pixels that cascade back from the thumb and then stream smoothly out of it from right to left in three depth layers, while dotted rays stream out of the thumb like a starburst and the level's name turns iridescent. Drag it and the thumb squashes with speed, throws a comet trail only when you really fling it, rings each level it passes and clicks into the nearest one with a little bounce. Keyboard: it's a slider, so the arrow keys move a level at a time and Home and End jump to the ends.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { EffortSlider } from "@/components/effort-slider";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/effort-slider/effort-slider.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  motionValue,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";

export type EffortLevel = {
  id: string;
  label: string;
  /** one line on what this level does, shown under the slider */
  description: string;
  /** the usual wait in seconds and the credits it uses, shown in the chips */
  estimate?: { seconds: number; credits: number };
  /** two colours for the fill at this level: the far end, then the bright end by the thumb */
  colors?: [string, string];
};
export type EffortSliderProps = {
  levels?: EffortLevel[];
  /** the selected level id (controlled) */
  value?: string;
  defaultValue?: string;
  onChange?: (id: string, level: EffortLevel) => void;
  title?: string;
  /** the id of the level to mark as recommended */
  recommended?: string;
  startLabel?: string;
  endLabel?: string;
  autoplay?: boolean;
  className?: string;
};

// Framework7 Icons (MIT) via Iconify, inlined
const ICON = {
  clock: { vb: 56, body: "<path fill=\"currentColor\" d=\"M28 51.906c13.055 0 23.906-10.828 23.906-23.906c0-13.055-10.875-23.906-23.93-23.906C14.899 4.094 4.095 14.945 4.095 28c0 13.078 10.828 23.906 23.906 23.906M15.719 30.531c-.914 0-1.618-.703-1.618-1.64c0-.914.704-1.618 1.618-1.618h10.64v-14.18a1.59 1.59 0 0 1 1.617-1.616c.915 0 1.641.703 1.641 1.617V28.89c0 .937-.727 1.64-1.64 1.64Z\"/>" },
  bolt: { vb: 56, body: "<path fill=\"currentColor\" d=\"M13.176 32.5h13.242l-6.984 18.984c-.915 2.414 1.593 3.703 3.187 1.735l21.281-26.625c.399-.492.61-.961.61-1.5c0-.89-.68-1.594-1.664-1.594H29.582L36.59 4.516c.89-2.414-1.594-3.703-3.188-1.711l-21.28 26.601c-.4.516-.634.985-.634 1.5c0 .914.703 1.594 1.688 1.594\"/>" },
  sparkles: { vb: 56, body: "<path fill=\"currentColor\" d=\"M26.688 12.66c.28 0 .421-.164.492-.422c.726-3.914.68-4.008 4.758-4.781c.28-.047.445-.21.445-.492c0-.281-.164-.445-.446-.492c-4.054-.82-3.937-.914-4.757-4.782c-.07-.257-.211-.421-.492-.421s-.422.164-.493.421c-.82 3.868-.68 3.961-4.757 4.782c-.258.046-.446.21-.446.492c0 .281.188.445.445.492c4.079.82 4.032.867 4.758 4.781c.07.258.211.422.492.422M15.344 28.785c.445 0 .75-.281.797-.703c.843-6.258 1.054-6.258 7.523-7.5c.422-.07.727-.352.727-.797c0-.422-.305-.726-.727-.797c-6.469-.89-6.703-1.101-7.523-7.476c-.047-.422-.352-.727-.797-.727c-.422 0-.727.305-.774.75c-.773 6.281-1.101 6.258-7.523 7.453c-.422.094-.727.375-.727.797c0 .469.305.727.82.797c6.376 1.031 6.657 1.195 7.43 7.453c.047.469.352.75.774.75m15.89 25.946c.61 0 1.055-.446 1.172-1.079c1.664-12.843 3.469-14.789 16.172-16.195c.656-.07 1.102-.562 1.102-1.172s-.446-1.078-1.102-1.172c-12.703-1.406-14.508-3.351-16.172-16.195c-.117-.633-.562-1.055-1.172-1.055s-1.054.422-1.148 1.055c-1.664 12.844-3.492 14.789-16.172 16.195c-.68.094-1.125.563-1.125 1.172c0 .61.445 1.102 1.125 1.172c12.656 1.664 14.414 3.375 16.172 16.195c.094.633.539 1.078 1.148 1.078\"/>" },
} as const;

const LEVELS: EffortLevel[] = [
  { id: "low", label: "Low", description: "Answers in seconds. Good for quick lookups and rewrites.", estimate: { seconds: 4, credits: 1 }, colors: ["#16cfc0", "#38b6ff"] },
  { id: "medium", label: "Medium", description: "Weighs a couple of approaches before it answers.", estimate: { seconds: 20, credits: 3 }, colors: ["#3b78ff", "#7a5cff"] },
  { id: "high", label: "High", description: "Plans the answer, checks its work and fixes mistakes.", estimate: { seconds: 75, credits: 8 }, colors: ["#8f5bff", "#e255ff"] },
  { id: "max", label: "Max", description: "Thinks it through. Can take a few minutes.", estimate: { seconds: 240, credits: 20 }, colors: ["#6a5cff", "#ff5cd0"] },
];
// used for levels you pass without colours, spread from cool to hot
const SPECTRUM: [string, string][] = [
  ["#16cfc0", "#38b6ff"],
  ["#3b78ff", "#7a5cff"],
  ["#8f5bff", "#e255ff"],
  ["#6a5cff", "#ff5cd0"],
];

const STOP = Symbol("stop");
const TH = 56; // the track's hit area
const SH = 30; // the visible strip
const SR = 11; // the strip's corner radius
const R0 = 16; // the thumb's core size, which the rings and sparks start from
const GR = 46; // the galaxy's radius at the top level
const TILT = -0.3; // the angle of its long axis
const INCL = 0.5; // how far it is tilted away from us (1 is face on)
const BX = 32; // the canvas bleeds past the track so the rays and sparks have room
const BY = 46;

type RGB = [number, number, number];
const hex = (h: string): RGB => {
  const s = h.replace("#", "");
  const f = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
  return [parseInt(f.slice(0, 2), 16), parseInt(f.slice(2, 4), 16), parseInt(f.slice(4, 6), 16)];
};
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const rgba = (c: RGB, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const mod = (a: number, b: number) => ((a % b) + b) % b;
const WHITE: RGB = [255, 255, 255];
// the galaxy's own palette
const G_WHITE: RGB = [240, 246, 255];
const G_CYAN: RGB = [104, 226, 255];
const G_PINK: RGB = [255, 96, 206];
const G_VIOLET: RGB = [146, 98, 255];
const G_INDIGO: RGB = [72, 56, 230];
const G_DUSK: RGB = [28, 20, 86];
const fmtTime = (s: number) => {
  if (s < 59.5) return `${Math.max(1, Math.round(s))} s`;
  const m = s / 60;
  return `${m < 10 ? m.toFixed(1).replace(/\.0$/, "") : Math.round(m)} min`;
};

/**
 * An effort setting for an AI answer, from Faster to Smarter. Below the top level the track is a calm
 * glowing fill with a few stars in it and a shimmer running through, coloured from cool teal up to violet,
 * and the thumb is a spiral galaxy seen at an angle, like a telescope photograph: thousands of stars, dust
 * lanes, pink star-forming knots, a warm core and diffraction spikes, maturing from a faint loose spiral
 * into a bright grand-design one as you go. Reach the top and the slider transforms: a flash, a burst of
 * sparks, and the fill breaks into a dense
 * mosaic of violet, pink, cyan and white star pixels that cascade back from the thumb and then stream smoothly
 * out of it from right to left in three depth layers,
 * while dotted rays stream out of the thumb like a starburst and the level's name turns iridescent. Drag it
 * and the thumb squashes with speed, throws a comet trail only when you really fling it, rings each level it
 * passes and clicks into the nearest one with a little bounce.
 * Keyboard: it's a slider, so the arrow keys move a level at a time and Home and End jump to the ends.
 */
export function EffortSlider({
  levels = LEVELS,
  value,
  defaultValue,
  onChange,
  title = "Effort",
  recommended,
  startLabel = "Faster",
  endLabel = "Smarter",
  autoplay = false,
  className = "",
}: EffortSliderProps) {
  const reduced = !!useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const n = Math.max(2, levels.length);
  const rec = recommended ?? (levels === LEVELS ? "medium" : undefined);
  const recIndex = rec ? levels.findIndex((l) => l.id === rec) : -1;
  const palettes = useMemo(
    () => levels.map((l, i) => (l.colors ?? SPECTRUM[Math.round((i / Math.max(1, levels.length - 1)) * (SPECTRUM.length - 1))]).map(hex) as [RGB, RGB]),
    [levels],
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(rootRef, { amount: 0.2 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  const indexOf = (id?: string) => {
    const i = id === undefined ? -1 : levels.findIndex((l) => l.id === id);
    return i < 0 ? Math.min(1, n - 1) : i;
  };
  const controlled = value !== undefined;
  const [own, setOwn] = useState(() => indexOf(defaultValue ?? rec));
  const index = controlled ? indexOf(value) : own;

  // where the thumb wants to be (in level units) and where it is, on a spring
  const target = useMotionValue(index);
  const spring = useSpring(target, { stiffness: 420, damping: 19, mass: 0.85 });
  const pos: MotionValue<number> = reduced ? target : spring;

  const [live, setLive] = useState(index); // the level under the thumb right now
  const liveRef = useRef(index);
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const pointerFocus = useRef(false);
  const ripples = useRef<{ x: number; t0: number }[]>([]);
  const burst = useRef(0);
  const kickRef = useRef(-10); // when the thumb last clicked into a level
  const flashRef = useRef(-10); // when the galaxy last switched on

  const [trackW, setTrackW] = useState(0);
  const room = useRef({ l: 20, r: 20 }); // space between the track and the card's edges, for fading the rays
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setTrackW(Math.round(e.contentRect.width));
      const root = rootRef.current;
      if (root) {
        const tr = el.getBoundingClientRect();
        const rr = root.getBoundingClientRect();
        room.current = { l: tr.left - rr.left, r: rr.right - tr.right };
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const pad = R0 + 4;
  const xOf = useCallback((p: number, w: number) => pad + (p / (n - 1)) * Math.max(1, w - pad * 2), [n, pad]);

  // follow outside changes when someone else owns the value
  useEffect(() => {
    if (!draggingRef.current) target.set(index);
  }, [index, target]);

  // the level under the thumb: ripples, the click, the galaxy and the label all follow it
  useEffect(() => {
    const unsub = pos.on("change", (v) => {
      const i = clamp(Math.round(v), 0, n - 1);
      if (i === liveRef.current) return;
      liveRef.current = i;
      setLive(i);
      const now = performance.now();
      ripples.current.push({ x: i, t0: now });
      kickRef.current = now;
      if (i === n - 1) {
        burst.current = 64;
        flashRef.current = now;
      }
    });
    return unsub;
  }, [pos, n]);

  // the galaxy switches on at the top level: 0 is the calm fill, 1 the full mosaic
  const gal = useMotionValue(index === n - 1 ? 1 : 0);
  const galOn = live === n - 1;
  useEffect(() => {
    if (reduced) {
      gal.set(galOn ? 1 : 0);
      return;
    }
    const c = animate(gal, galOn ? 1 : 0, galOn ? { duration: 1.15, ease: [0.22, 0.6, 0.3, 1] } : { duration: 0.55, ease: [0.5, 0, 0.7, 0.4] });
    return () => c.stop();
  }, [galOn, reduced, gal]);

  const commit = useCallback(
    (i: number) => {
      const k = clamp(Math.round(i), 0, n - 1);
      target.set(k);
      if (!controlled) setOwn(k);
      if (k !== index) onChange?.(levels[k].id, levels[k]);
    },
    [n, target, controlled, index, onChange, levels],
  );

  // ─── rolling estimate chips ───
  const secs = useMotionValue(levels[index]?.estimate?.seconds ?? 0);
  const creds = useMotionValue(levels[index]?.estimate?.credits ?? 0);
  const secText = useTransform(secs, fmtTime);
  const credText = useTransform(creds, (c) => `${Math.round(c)} ${Math.round(c) === 1 ? "credit" : "credits"}`);
  useEffect(() => {
    const est = levels[live]?.estimate;
    if (!est) return;
    if (reduced) {
      secs.set(est.seconds);
      creds.set(est.credits);
      return;
    }
    const a = animate(secs, est.seconds, { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] });
    const b = animate(creds, est.credits, { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] });
    return () => {
      a.stop();
      b.stop();
    };
  }, [live, levels, reduced, secs, creds]);

  // colours that follow the thumb continuously
  const paletteAt = useCallback(
    (p: number): [RGB, RGB] => {
      const q = clamp(p, 0, n - 1);
      const i = Math.floor(q);
      const j = Math.min(n - 1, i + 1);
      const f = q - i;
      return [mix(palettes[i][0], palettes[j][0], f), mix(palettes[i][1], palettes[j][1], f)];
    },
    [palettes, n],
  );
  const labelColor = useTransform(pos, (p) => {
    const [a, b] = paletteAt(p);
    return rgba(mix(mix(a, b, 0.6), WHITE, 0.32), 1);
  });
  const cardShadow = useTransform([pos, gal] as MotionValue<number>[], ([p, g]: number[]) => {
    const [, b] = paletteAt(p);
    const f = clamp(p / (n - 1), 0, 1);
    const glow = mix(b, G_VIOLET, g * 0.6);
    return `0 0 0 1px rgba(255,255,255,${(0.07 + g * 0.06).toFixed(3)}), 0 30px 64px -30px ${rgba(glow, 0.5 + f * 0.3 + g * 0.2)}, 0 0 ${Math.round(g * 40)}px -12px ${rgba(G_CYAN, g * 0.35)}`;
  });
  const nebula = useTransform([pos, gal] as MotionValue<number>[], ([p, g]: number[]) => {
    const [a, b] = paletteAt(p);
    const f = clamp(p / (n - 1), 0, 1);
    return `radial-gradient(60% 70% at ${14 + f * 72}% 0%, ${rgba(b, 0.22 + f * 0.1)}, transparent 70%), radial-gradient(55% 60% at ${86 - f * 60}% 112%, ${rgba(a, 0.16)}, transparent 70%), radial-gradient(45% 55% at 92% 38%, ${rgba(G_CYAN, g * 0.2)}, transparent 70%), radial-gradient(55% 50% at 70% 100%, ${rgba(G_PINK, g * 0.18)}, transparent 70%)`;
  });

  // ─── the canvas: the fill, the galaxy mosaic, the thumb, rays, trail and sparks ───
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv || trackW <= 0) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const CW = trackW + BX * 2;
    const CH = TH + BY * 2;
    cv.width = Math.round(CW * dpr);
    cv.height = Math.round(CH * dpr);

    const fillC = document.createElement("canvas");
    fillC.width = cv.width;
    fillC.height = cv.height;
    const fillCtx = fillC.getContext("2d");
    const cy = TH / 2;
    const top = cy - SH / 2;
    const bot = cy + SH / 2;
    let seed = 1337;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

    // a few stars inside the calm fill
    const stars = Array.from({ length: Math.max(10, Math.round(trackW / 10)) }, () => ({
      x: 6 + rnd() * (trackW - 12),
      y: top + 5 + rnd() * (SH - 10),
      s: rnd() < 0.25 ? 1.6 : 1,
      ph: rnd() * Math.PI * 2,
      sp: 1.2 + rnd() * 3,
    }));
    // the galaxy mosaic: square star pixels of mixed sizes on a loose grid. They stream right to left out of the
    // thumb in three depth layers; every pixel in a layer moves at the same speed, so the field flows as one
    // and the bigger, nearer pixels slide past the smaller, farther ones.
    type Px = { x0: number; y: number; s: number; v: number; ph: number; sp: number; tw: number; ci: number; k: number };
    const pxs: Px[] = [];
    const step = 3.1;
    const wrap = trackW + 48; // pixels wrap round behind the thumb, so new ones always emerge from it
    for (let gx = 0; gx < wrap; gx += step)
      for (let gy = top + 2.4; gy < bot - 2.2; gy += step) {
        if (rnd() > 0.62) continue;
        const r = rnd();
        const layer = r < 0.5 ? 0 : r < 0.84 ? 1 : 2;
        const s = layer === 0 ? (rnd() < 0.6 ? 1.4 : 1.9) : layer === 1 ? (rnd() < 0.6 ? 2.3 : 2.9) : rnd() < 0.7 ? 3.5 : 4.4;
        pxs.push({
          x0: gx + (rnd() - 0.5) * 1.2,
          y: gy + (rnd() - 0.5) * 1,
          s,
          v: [20, 38, 64][layer] * (0.94 + rnd() * 0.12),
          ph: rnd() * Math.PI * 2,
          sp: 0.8 + rnd() * 1.8,
          tw: rnd() < 0.5 ? 1 : 0,
          ci: rnd(),
          k: rnd(),
        });
      }
    pxs.sort((a, b) => a.s - b.s); // far layers first, near ones on top
    const galCol = (ci: number, xr: number): RGB => {
      let c: RGB;
      if (ci < 0.06 + 0.2 * xr * xr) c = G_WHITE;
      else if (ci < 0.32) c = G_CYAN;
      else if (ci < 0.6) c = G_PINK;
      else if (ci < 0.84) c = G_VIOLET;
      else c = G_INDIGO;
      return mix(c, G_DUSK, (1 - xr) * 0.5);
    };
    // ─── the thumb: a spiral galaxy seen at an angle, painted once per level from the same stars ───
    // Every level uses the same stars, so moving between levels reads as one galaxy maturing: a loose,
    // faint young spiral at the quick end, a bright grand-design spiral with dust lanes, pink star-forming
    // knots and a warm core at the top.
    const GS = Math.ceil((GR * 2 + 10) * dpr); // sprite size in device pixels
    const softDot = (c: RGB) => {
      const d = document.createElement("canvas");
      d.width = d.height = 32;
      const g = d.getContext("2d");
      if (g) {
        const rg = g.createRadialGradient(16, 16, 0, 16, 16, 16);
        rg.addColorStop(0, rgba(c, 1));
        rg.addColorStop(0.3, rgba(c, 0.5));
        rg.addColorStop(1, rgba(c, 0));
        g.fillStyle = rg;
        g.fillRect(0, 0, 32, 32);
      }
      return d;
    };
    const gauss = () => {
      const u = Math.max(1e-6, rnd());
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd());
    };
    type GStar = { u: number; arm: number; g1: number; g2: number; kind: number; k: number; th: number };
    const gstars: GStar[] = Array.from({ length: 3200 }, () => ({ u: rnd(), arm: rnd() < 0.5 ? 0 : 1, g1: gauss(), g2: gauss(), kind: rnd(), k: rnd(), th: rnd() * Math.PI * 2 }));
    const gknots = Array.from({ length: 30 }, () => ({ u: rnd(), arm: rnd() < 0.5 ? 0 : 1, g1: gauss(), m: 3 + Math.floor(rnd() * 5), k: rnd(), j: Array.from({ length: 8 }, () => [gauss(), gauss()]) }));
    const OLD: RGB = [255, 222, 178];
    const YOUNG: RGB = [196, 218, 255];
    const HII: RGB = [255, 104, 186];
    const sprites = Array.from({ length: n }, (_, li) => {
      const lf = n > 1 ? li / (n - 1) : 1;
      const [a0, a1] = paletteAt(li);
      const c = document.createElement("canvas");
      c.width = c.height = GS;
      const g = c.getContext("2d");
      if (!g) return c;
      g.setTransform(dpr, 0, 0, dpr, GS / 2, GS / 2);
      const armTint = mix(mix(a0, a1, 0.6), YOUNG, 0.45);
      const dArm = softDot(armTint);
      const dYoung = softDot(YOUNG);
      const dOld = softDot(OLD);
      const dHii = softDot(HII);
      const tanP = 0.5 - lf * 0.12; // the arms wind tighter as it matures
      const spread = 0.5 - lf * 0.3; // and get more coherent
      const inArms = 0.3 + lf * 0.5;
      const rIn = GR * 0.1;
      const hScale = 0.3; // exponential disk
      const radius = (u: number) => -hScale * Math.log(1 - u * (1 - Math.exp(-1 / hScale))) * GR;
      const armAngle = (r: number, arm: number) => arm * Math.PI + Math.log(Math.max(r, rIn) / rIn) / tanP;
      const bright = 0.62 + lf * 0.38;
      const place = (st: GStar) => {
        const r = Math.max(0, radius(st.u) + st.g2 * GR * 0.025);
        const arm = st.kind < inArms;
        const ang = arm ? armAngle(r, st.arm) + st.g1 * spread * (0.45 + 0.7 * (r / GR)) : st.th;
        return { r, arm, x: Math.cos(ang) * r, y: Math.sin(ang) * r };
      };
      g.globalCompositeOperation = "lighter";
      // diffuse starlight: thousands of faint soft dots, warm and old in the middle, young and blue in the arms
      for (const st of gstars) {
        const { r, arm, x, y } = place(st);
        const rr = r / GR;
        const dimg = rr < 0.22 ? dOld : arm ? (st.k < 0.5 ? dArm : dYoung) : st.k < 0.5 ? dOld : dArm;
        const sz = 2.8 + (1 - rr) * 3.6;
        g.globalAlpha = (arm ? 0.17 : 0.09) * bright * (1.1 - rr * 0.55);
        g.drawImage(dimg, x - sz / 2, y - sz / 2, sz, sz);
      }
      // dust lanes along the inner edge of each arm take light away
      g.globalCompositeOperation = "destination-out";
      for (const st of gstars) {
        if (st.kind > inArms || st.k < 0.55) continue;
        const r = radius(st.u);
        const rr = r / GR;
        if (rr < 0.16 || rr > 0.8) continue;
        const ang = armAngle(r, st.arm) - 0.32 + st.g1 * spread * 0.25;
        const sz = 2.2 + (1 - rr) * 1.6;
        g.globalAlpha = (0.14 + lf * 0.22) * (1 - Math.abs(rr - 0.45));
        g.drawImage(dOld, Math.cos(ang) * r - sz / 2, Math.sin(ang) * r - sz / 2, sz, sz);
      }
      g.globalCompositeOperation = "lighter";
      // resolved stars: crisp points scattered through the disk, most of them in the arms
      for (const st of gstars) {
        if (st.k > 0.3 + lf * 0.12) continue;
        const { r, arm, x, y } = place(st);
        const rr = r / GR;
        if (rr < 0.12) continue;
        const col = arm ? mix(YOUNG, armTint, st.k * 2) : mix(OLD, YOUNG, rr);
        g.globalAlpha = (arm ? 0.8 : 0.45) * bright * (1 - rr * 0.4);
        g.fillStyle = rgba(mix(col, WHITE, 0.35), 1);
        const z = st.k < 0.04 ? 1.1 : 0.7;
        g.fillRect(x - z / 2, y - z / 2, z, z);
      }
      // pink star-forming knots strung along the arms, more of them as it matures
      for (const kn of gknots) {
        if (kn.k > 0.2 + lf * 0.8) continue;
        const r = GR * (0.3 + kn.u * 0.55);
        const ang = armAngle(r, kn.arm) + kn.g1 * spread * 0.3;
        const kx = Math.cos(ang) * r;
        const ky = Math.sin(ang) * r;
        g.globalAlpha = 0.16 * bright;
        g.drawImage(dHii, kx - 2.6, ky - 2.6, 5.2, 5.2);
        for (let m = 0; m < kn.m; m++) {
          const [jx, jy] = kn.j[m];
          g.globalAlpha = 0.55 * bright;
          g.fillStyle = rgba(m % 3 === 0 ? WHITE : mix(HII, WHITE, 0.3), 1);
          g.fillRect(kx + jx * 0.9 - 0.4, ky + jy * 0.9 - 0.4, 0.8, 0.8);
        }
      }
      // the inner disk's glow, which the bulge sits in
      g.globalAlpha = 1;
      const ig = g.createRadialGradient(0, 0, 0, 0, 0, GR * 0.42);
      ig.addColorStop(0, rgba(OLD, 0.5 * bright));
      ig.addColorStop(0.4, rgba(mix(OLD, armTint, 0.5), 0.16 * bright));
      ig.addColorStop(1, rgba(armTint, 0));
      g.fillStyle = ig;
      g.fillRect(-GR, -GR, GR * 2, GR * 2);
      return c;
    });

    type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; c: RGB; s: number };
    const sparks: Spark[] = [];
    const embers: Spark[] = [];
    const DOT: RGB = [190, 196, 255];

    let raf = 0;
    let last = performance.now();
    let t = 0;
    let prevX = -1;
    let vel = 0;
    let trail = 0;
    let sc = 1;
    let rot = 0;
    let rayRot = 0;
    let acc = 0;
    let drawn = false;
    let lastKey = "";

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!inViewRef.current && drawn) return;
      const p = clamp(pos.get(), 0, n - 1);
      const G = gal.get();
      if (reduced) {
        // nothing twinkles with reduced motion, so only redraw when something changed
        const key = `${p.toFixed(3)}|${G.toFixed(3)}|${focusRef.current}|${draggingRef.current}|${hoverRef.current}`;
        if (drawn && key === lastKey) return;
        lastKey = key;
      }
      drawn = true;
      if (!reduced) t += dt;
      const f = p / (n - 1);
      const [c0, c1] = paletteAt(p);
      const x = xOf(p, trackW);
      const roomL = room.current.l;
      const roomR = room.current.r;
      const edgeFade = (px: number) => clamp(Math.min(px + roomL, trackW + roomR - px) / 14 - 0.1, 0, 1);

      // speed of the thumb, for the squash and the comet trail
      if (prevX >= 0 && dt > 0) {
        const inst = (x - prevX) / dt;
        vel += (inst - vel) * Math.min(1, dt * 14);
      }
      prevX = x;
      const speed = Math.abs(vel);
      const wantTrail = !reduced && speed > 650 ? Math.min(170, (speed - 500) * 0.16) : 0;
      trail += (wantTrail - trail) * Math.min(1, dt * (wantTrail > trail ? 18 : 7));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, CW, CH);
      ctx.translate(BX, BY);

      // ─── the strip ───
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.roundRect(0, top, trackW, SH, SR);
      ctx.fillStyle = "rgba(255,255,255,.045)";
      ctx.fill();
      ctx.strokeStyle = `rgba(255,255,255,${(0.08 + G * 0.06).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0.5, top + 0.5, trackW - 1, SH - 1, SR - 0.5);
      ctx.clip();

      // the calm fill: a smooth glow up to the thumb, a shimmer and a few stars. It's drawn on its own layer
      // and faded out under the galaxy, so it never ends in a hard edge
      const calm = 1 - G * 0.88;
      const gReach = GR * (0.62 + 0.38 * f);
      const fx = x + gReach * 0.5;
      if (calm > 0.01 && fx > 1 && fillCtx) {
        const fctx = fillCtx;
        fctx.setTransform(1, 0, 0, 1, 0, 0);
        fctx.globalCompositeOperation = "source-over";
        fctx.clearRect(0, 0, fillC.width, fillC.height);
        fctx.setTransform(dpr, 0, 0, dpr, BX * dpr, BY * dpr);
        const band = fctx.createLinearGradient(0, 0, fx, 0);
        band.addColorStop(0, rgba(c0, 0.04 * calm));
        band.addColorStop(0.55, rgba(mix(c0, c1, 0.45), (0.26 + f * 0.08) * calm));
        band.addColorStop(1, rgba(c1, (0.78 + f * 0.12) * calm));
        fctx.fillStyle = band;
        fctx.fillRect(0, top, fx, SH);
        // a soft top light, as if the fill were glass
        const sheen = fctx.createLinearGradient(0, top, 0, bot);
        sheen.addColorStop(0, `rgba(255,255,255,${(0.12 * calm).toFixed(3)})`);
        sheen.addColorStop(0.45, "rgba(255,255,255,0)");
        fctx.fillStyle = sheen;
        fctx.fillRect(0, top, fx, SH);
        if (!reduced) {
          fctx.globalCompositeOperation = "lighter";
          const sx = mod(t * 120, fx + 160) - 80;
          const sh = fctx.createLinearGradient(sx - 50, 0, sx + 50, 0);
          sh.addColorStop(0, "rgba(255,255,255,0)");
          sh.addColorStop(0.5, `rgba(255,255,255,${(0.1 * calm * (0.4 + f)).toFixed(3)})`);
          sh.addColorStop(1, "rgba(255,255,255,0)");
          fctx.fillStyle = sh;
          fctx.fillRect(0, top, fx, SH);
        }
        fctx.globalCompositeOperation = "lighter";
        for (const s of stars) {
          if (s.x > fx - 4) continue;
          const near = s.x / Math.max(1, fx);
          const tw = reduced ? 0.8 : 0.5 + 0.5 * Math.sin(t * s.sp + s.ph);
          const a = (0.15 + 0.7 * near) * tw * calm;
          if (a < 0.03) continue;
          fctx.fillStyle = rgba(mix(c1, WHITE, 0.7), a);
          fctx.fillRect(s.x, s.y, s.s, s.s);
        }
        fctx.globalCompositeOperation = "source-over";
        // fade it out under the galaxy
        fctx.globalCompositeOperation = "destination-in";
        const m0 = Math.max(0, x - gReach * 0.4);
        const mk = fctx.createLinearGradient(m0, 0, fx, 0);
        mk.addColorStop(0, "rgba(0,0,0,1)");
        mk.addColorStop(1, "rgba(0,0,0,0)");
        fctx.fillStyle = mk;
        fctx.fillRect(-BX, top - 2, CW + BX, SH + 4); // destination-in clears whatever it doesn't cover
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(fillC, 0, 0);
        ctx.restore();
      }

      // the galaxy mosaic: cascades back from the thumb, twinkles and drifts away from it
      if (G > 0.002) {
        const xEnd = Math.max(8, x + 2);
        ctx.globalCompositeOperation = "lighter";
        // a deep glow under the pixels
        const deep = ctx.createLinearGradient(0, 0, xEnd, 0);
        deep.addColorStop(0, rgba(G_INDIGO, 0.05 * G));
        deep.addColorStop(0.6, rgba(G_VIOLET, 0.16 * G));
        deep.addColorStop(1, rgba(G_PINK, 0.32 * G));
        ctx.fillStyle = deep;
        ctx.fillRect(0, top, xEnd, SH);
        for (const q of pxs) {
          // a steady right-to-left stream at sub-pixel precision, so it glides rather than ticking
          const px = reduced ? q.x0 : mod(q.x0 - q.v * t, wrap) - 24;
          if (px > xEnd + 3 || px < -6) continue;
          const xr = clamp(px / xEnd, 0, 1);
          const d = (1 - xr) * 0.82 + q.k * 0.13;
          const vis = reduced ? G : clamp((G * 1.15 - d) / 0.2, 0, 1);
          if (vis <= 0) continue;
          let a = (0.12 + 0.88 * Math.pow(xr, 1.25)) * vis;
          if (q.tw && !reduced) a *= 0.62 + 0.38 * (0.5 + 0.5 * Math.sin(t * q.sp + q.ph));
          a *= clamp((xEnd + 3 - px) / 12, 0, 1); // born out of the thumb's glow
          a *= clamp((px + 6) / 26, 0, 1); // and gone softly at the far end
          if (a < 0.02) continue;
          const pop = 1 - vis;
          const col = mix(galCol(q.ci, xr), WHITE, pop * 0.85);
          const sz = q.s * (0.78 + 0.45 * xr) * (1 + pop * 0.9);
          ctx.fillStyle = rgba(col, Math.min(1, a * (1 + pop)));
          ctx.fillRect(px - sz / 2, q.y - sz / 2, sz, sz);
          // the nearest pixels leave a faint streak behind them, which sells the speed
          if (!reduced && q.s > 3 && a > 0.25) {
            const tl = sz * 2.6;
            const sg = ctx.createLinearGradient(px + sz / 2, 0, px + sz / 2 + tl, 0);
            sg.addColorStop(0, rgba(col, a * 0.32));
            sg.addColorStop(1, rgba(col, 0));
            ctx.fillStyle = sg;
            ctx.fillRect(px + sz / 2, q.y - sz * 0.32, tl, sz * 0.64);
          }
        }
        ctx.globalCompositeOperation = "source-over";
      }

      // a light wave down the fill each time the thumb passes a level
      const nowMs = performance.now();
      ripples.current = ripples.current.filter((r) => nowMs - r.t0 < 900);
      if (!reduced) {
        ctx.globalCompositeOperation = "lighter";
        for (const r of ripples.current) {
          const age = (nowMs - r.t0) / 900;
          const rx = xOf(r.x, trackW);
          const front = age * 220;
          const fade = Math.pow(1 - age, 1.8);
          for (const dir of [-1]) {
            const wx = rx + dir * front;
            const wg = ctx.createLinearGradient(wx - 16, 0, wx + 16, 0);
            wg.addColorStop(0, "rgba(255,255,255,0)");
            wg.addColorStop(0.5, rgba(mix(c1, WHITE, 0.5), 0.32 * fade));
            wg.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = wg;
            ctx.fillRect(wx - 16, top, 32, SH);
          }
        }
        ctx.globalCompositeOperation = "source-over";
      }

      // the comet trail, only when it's really flung
      if (trail > 2) {
        const dir = vel >= 0 ? 1 : -1;
        const bx = x - dir * trail;
        ctx.globalCompositeOperation = "lighter";
        const tg = ctx.createLinearGradient(x, 0, bx, 0);
        tg.addColorStop(0, rgba(WHITE, 0.75));
        tg.addColorStop(0.25, rgba(mix(c1, WHITE, 0.3), 0.5));
        tg.addColorStop(1, rgba(c1, 0));
        ctx.fillStyle = tg;
        ctx.beginPath();
        ctx.moveTo(x, cy - R0 * 0.62);
        ctx.quadraticCurveTo(x - dir * trail * 0.35, cy - 2, bx, cy);
        ctx.quadraticCurveTo(x - dir * trail * 0.35, cy + 2, x, cy + R0 * 0.62);
        ctx.closePath();
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
        // embers shed along it
        if (embers.length < 90)
          for (let k = 0; k < 3; k++) {
            const ex = x - dir * Math.random() * trail * 0.8;
            embers.push({ x: ex, y: cy + (Math.random() - 0.5) * SH * 0.7, vx: -dir * (10 + Math.random() * 30), vy: (Math.random() - 0.5) * 30, life: 0, max: 0.35 + Math.random() * 0.45, c: Math.random() < 0.4 ? WHITE : Math.random() < 0.5 ? c1 : G_CYAN, s: 1 + Math.random() * 2 });
          }
      }

      // the flash as the galaxy switches on
      const fAge = (nowMs - flashRef.current) / 1000;
      if (!reduced && fAge >= 0 && fAge < 0.42) {
        // a white flash that runs back down the strip from the thumb
        const k = fAge / 0.42;
        const reach = 40 + k * trackW * 0.9;
        const fl = ctx.createLinearGradient(x, 0, x - reach, 0);
        fl.addColorStop(0, `rgba(255,255,255,${(0.75 * Math.pow(1 - k, 1.5)).toFixed(3)})`);
        fl.addColorStop(0.6, `rgba(255,220,250,${(0.25 * Math.pow(1 - k, 1.5)).toFixed(3)})`);
        fl.addColorStop(1, "rgba(255,255,255,0)");
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = fl;
        ctx.fillRect(Math.max(0, x - reach), top, Math.min(x, reach) + R0, SH);
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.restore();

      // level dots, and a tick on the recommended one
      for (let i = 0; i < n; i++) {
        const dx = xOf(i, trackW);
        if (Math.abs(dx - x) < GR * (0.62 + 0.38 * f) * 0.75 + 2) continue;
        const passed = dx < x;
        if (i === recIndex) {
          ctx.fillStyle = passed ? "rgba(255,255,255,.8)" : "rgba(220,224,255,.55)";
          ctx.beginPath();
          ctx.roundRect(dx - 1, cy - 6, 2, 12, 1);
          ctx.fill();
          continue;
        }
        ctx.beginPath();
        ctx.arc(dx, cy, passed ? 1.7 : 1.9, 0, Math.PI * 2);
        ctx.fillStyle = passed ? `rgba(255,255,255,${(0.8 - G * 0.4).toFixed(3)})` : rgba(DOT, 0.45);
        ctx.fill();
      }
      // a ring from each level the thumb clicks through
      if (!reduced)
        for (const r of ripples.current) {
          const age = (nowMs - r.t0) / 900;
          if (age > 0.65) continue;
          const rx = xOf(r.x, trackW);
          const k = age / 0.65;
          ctx.strokeStyle = rgba(mix(c1, WHITE, 0.4), 0.7 * Math.pow(1 - k, 1.5));
          ctx.lineWidth = 1.5 * (1 - k) + 0.4;
          ctx.beginPath();
          ctx.arc(rx, cy, R0 + 2 + k * 18, 0, Math.PI * 2);
          ctx.stroke();
        }

      // ─── the thumb ───
      const want = draggingRef.current ? 1.1 : hoverRef.current ? 1.05 : 1;
      sc += (want - sc) * Math.min(1, dt * 14 || 1);
      const kAge = (nowMs - kickRef.current) / 1000;
      const kick = reduced || kAge > 0.8 ? 0 : 0.1 * Math.exp(-kAge * 7) * Math.cos(kAge * 26);
      const R = R0 * sc * (1 + kick) * (1 + G * 0.045 * Math.sin(t * 5));
      // squash along the direction of travel
      const sq = reduced ? 0 : clamp(speed / 2400, 0, 0.3);
      const sxs = 1 + sq;
      const sys = 1 - sq * 0.55;
      rot += reduced ? 0 : dt * (0.22 + f * 0.32 + G * 0.3 + (draggingRef.current ? 0.5 : 0));
      rayRot += dt * (0.12 + G * 0.1);
      const tc0 = mix(c0, G_CYAN, G * 0.6);
      const tc1 = mix(c1, G_VIOLET, G * 0.35);

      const gk = 0.62 + 0.38 * f; // the galaxy grows with the level
      const gw = GR * gk * (R / R0); // its radius on screen, with the hover, drag and click scale
      ctx.globalCompositeOperation = "lighter";
      // scattered light around it, flattened like the disk
      ctx.save();
      ctx.translate(x, cy);
      ctx.rotate(TILT);
      ctx.scale(1, 0.62);
      const hr = gw * (1.5 + G * 0.4);
      const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, hr);
      halo.addColorStop(0, rgba(mix(tc1, WHITE, 0.2), 0.22 * (0.4 + f) + G * 0.12));
      halo.addColorStop(0.45, rgba(tc0, 0.07 * (0.5 + f) + G * 0.05));
      halo.addColorStop(1, rgba(tc0, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(-hr, -hr, hr * 2, hr * 2);
      ctx.restore();

      if (G > 0.02) {
        const rays = 22;
        const flow = reduced ? 0 : mod(t * 15, 3.6);
        for (let k = 0; k < rays; k++) {
          const ang = rayRot + (k / rays) * Math.PI * 2 + (k % 2 ? 0.07 : 0);
          const long = k % 2 === 0;
          const L = R * (long ? 2.7 + 0.6 * Math.sin(k * 1.9 + 0.6) : 1.35 + 0.3 * Math.sin(k * 2.3)) * (0.35 + 0.65 * G);
          const col = k % 3 === 0 ? G_CYAN : k % 3 === 1 ? G_WHITE : G_PINK;
          const ca = Math.cos(ang);
          const sa = Math.sin(ang);
          // start just outside the tilted galaxy in this direction
          const ea = ang - TILT;
          const eA = gw * 0.78;
          const eB = gw * 0.78 * INCL;
          const d0 = Math.max(R + 4, 1 / Math.sqrt((Math.cos(ea) / eA) ** 2 + (Math.sin(ea) / eB) ** 2) + 3);
          for (let d = d0 + flow; d < d0 + L; d += 3.6) {
            const q = (d - d0) / L;
            const px = x + ca * d;
            const py = cy + sa * d;
            const a = Math.min(1, G * 1.15 * Math.pow(1 - q, 0.8)) * edgeFade(px) * (reduced ? 0.95 : 0.75 + 0.25 * Math.sin(t * 6 + k));
            if (a < 0.03) continue;
            const s = q < 0.3 ? 1.9 : q < 0.65 ? 1.5 : 1.2;
            ctx.fillStyle = rgba(col, a);
            ctx.fillRect(px - s / 2, py - s / 2, s, s);
          }
        }
      }
      // the flash ring
      if (!reduced && fAge >= 0 && fAge < 0.75) {
        const k = fAge / 0.75;
        ctx.strokeStyle = rgba(G_WHITE, 0.85 * Math.pow(1 - k, 1.6));
        ctx.lineWidth = 2.6 * (1 - k) + 0.4;
        ctx.beginPath();
        ctx.arc(x, cy, R + 4 + Math.pow(k, 0.6) * 64, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = rgba(G_PINK, 0.5 * Math.pow(1 - k, 2));
        ctx.lineWidth = 6 * (1 - k);
        ctx.beginPath();
        ctx.arc(x, cy, R + 2 + Math.pow(k, 0.7) * 40, 0, Math.PI * 2);
        ctx.stroke();
      }

      // the galaxy: the painted disk turned in its own plane, tilted away from us, squashed with speed
      ctx.save();
      ctx.translate(x, cy);
      ctx.scale(sxs, sys);
      ctx.rotate(TILT);
      ctx.save();
      ctx.scale(gw / GR, (gw / GR) * INCL);
      ctx.rotate(-rot);
      const lo = Math.floor(p);
      const hi = Math.min(n - 1, lo + 1);
      const w = p - lo;
      const sw = GS / dpr;
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 1 - w;
      ctx.drawImage(sprites[lo], -sw / 2, -sw / 2, sw, sw);
      if (w > 0.002) {
        ctx.globalAlpha = w;
        ctx.drawImage(sprites[hi], -sw / 2, -sw / 2, sw, sw);
      }
      if (G > 0.01) {
        // at the top it burns brighter
        ctx.globalAlpha = 0.25 * G;
        ctx.drawImage(sprites[n - 1], -sw / 2, -sw / 2, sw, sw);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
      // the bulge: a warm, rounder glow of old stars at the centre
      ctx.save();
      ctx.scale(1, 0.72);
      const breathe = reduced ? 1 : 1 + 0.06 * Math.sin(t * 1.4);
      const br = gw * (0.3 + 0.06 * f) * breathe;
      const bulge = ctx.createRadialGradient(0, 0, 0, 0, 0, br);
      bulge.addColorStop(0, rgba([255, 248, 232], 0.95));
      bulge.addColorStop(0.18, rgba([255, 232, 196], 0.55 + 0.25 * f));
      bulge.addColorStop(0.5, rgba(mix([255, 214, 170], tc1, 0.35), 0.16 + 0.1 * f));
      bulge.addColorStop(1, rgba(tc1, 0));
      ctx.fillStyle = bulge;
      ctx.fillRect(-br, -br, br * 2, br * 2);
      ctx.restore();
      ctx.restore();
      // the nucleus, with diffraction spikes like a telescope photograph: six long, two short
      {
        const core = ctx.createRadialGradient(x, cy, 0, x, cy, 3.2 + f * 1.4 + G * 1.6);
        core.addColorStop(0, "rgba(255,255,255,1)");
        core.addColorStop(0.45, rgba([255, 244, 226], 0.7));
        core.addColorStop(1, "rgba(255,240,220,0)");
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(x, cy, 3.2 + f * 1.4 + G * 1.6, 0, Math.PI * 2);
        ctx.fill();
        const L = (4 + 22 * Math.pow(f, 1.3) + G * 18) * (reduced ? 1 : 0.96 + 0.04 * Math.sin(t * 2.1));
        const spike = (ang: number, len: number, wid: number, alpha: number) => {
          const ca = Math.cos(ang);
          const sa = Math.sin(ang);
          const ex = x + ca * len;
          const ey = cy + sa * len;
          const sg = ctx.createLinearGradient(x, cy, ex, ey);
          sg.addColorStop(0, rgba(WHITE, alpha));
          sg.addColorStop(0.35, rgba(mix(tc1, WHITE, 0.55), alpha * 0.45));
          sg.addColorStop(1, rgba(tc1, 0));
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.moveTo(x - sa * wid, cy + ca * wid);
          ctx.lineTo(ex, ey);
          ctx.lineTo(x + sa * wid, cy - ca * wid);
          ctx.closePath();
          ctx.fill();
        };
        for (let k = 0; k < 6; k++) spike(-Math.PI / 2 + (k * Math.PI) / 3, L * (k % 3 === 0 ? 1 : 0.86), 0.75, 0.55 + 0.35 * f);
        spike(0, L * 0.42, 0.5, 0.35 + 0.3 * f);
        spike(Math.PI, L * 0.42, 0.5, 0.35 + 0.3 * f);
      }
      ctx.globalCompositeOperation = "source-over";
      if (focusRef.current) {
        ctx.strokeStyle = "rgba(255,255,255,.95)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, cy, gw * 0.9 + 5, gw * 0.9 * INCL + 7, TILT, 0, Math.PI * 2);
        ctx.stroke();
      }

      // pixel sparks off the galaxy, and the trail's embers
      if (!reduced) {
        if (liveRef.current === n - 1 && G > 0.6) acc += dt * 9;
        let spawn = Math.floor(acc) + burst.current;
        acc -= Math.floor(acc);
        const strong = burst.current > 0;
        burst.current = 0;
        while (spawn-- > 0 && sparks.length < 160) {
          const ang = Math.random() * Math.PI * 2;
          const v = (strong ? 70 : 25) + Math.random() * (strong ? 190 : 55);
          const r = Math.random();
          sparks.push({ x: x + Math.cos(ang) * R, y: cy + Math.sin(ang) * R, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, life: 0, max: 0.5 + Math.random() * 0.8, c: r < 0.3 ? G_WHITE : r < 0.55 ? G_CYAN : r < 0.8 ? G_PINK : G_VIOLET, s: 1 + Math.random() * 2.2 });
        }
        ctx.globalCompositeOperation = "lighter";
        for (const list of [sparks, embers]) {
          for (let i = list.length - 1; i >= 0; i--) {
            const s = list[i];
            s.life += dt;
            if (s.life > s.max) {
              list.splice(i, 1);
              continue;
            }
            s.vx *= 1 - dt * 2.2;
            s.vy *= 1 - dt * 2.2;
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            const a = (1 - s.life / s.max) * edgeFade(s.x);
            if (a < 0.03) continue;
            ctx.fillStyle = rgba(s.c, a);
            const z = s.s * (1 - (s.life / s.max) * 0.4);
            ctx.fillRect(Math.round(s.x - z / 2), Math.round(s.y - z / 2), Math.max(1, Math.round(z)), Math.max(1, Math.round(z)));
          }
        }
      }
      ctx.globalCompositeOperation = "source-over";
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [trackW, n, reduced, pos, gal, paletteAt, xOf, recIndex]);

  // ─── pointer and keyboard ───
  const rawAt = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return target.get();
    const r = el.getBoundingClientRect();
    return clamp(((clientX - r.left - pad) / Math.max(1, r.width - pad * 2)) * (n - 1), 0, n - 1);
  };
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerFocus.current = true;
    focusRef.current = false;
    e.currentTarget.focus({ preventScroll: true });
    pointerFocus.current = false;
    draggingRef.current = true;
    setDragging(true);
    target.set(rawAt(e.clientX));
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    target.set(rawAt(e.clientX));
  };
  const onUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    kickRef.current = performance.now();
    commit(target.get());
  };
  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    const cur = Math.round(target.get());
    let next = cur;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = cur + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = cur - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    else if (e.key === "PageUp") next = cur + 2;
    else if (e.key === "PageDown") next = cur - 2;
    else return;
    e.preventDefault();
    focusRef.current = true;
    commit(next);
  };

  // ─── autoplay: a slow climb to the galaxy, a fling back down for the comet, then the middle ───
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gs = useMotionValue(1);
  const go = useMotionValue(0);
  const commitRef = useRef(commit);
  commitRef.current = commit;
  useEffect(() => {
    if (!autoplay || reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let alive = true;
    const ownAnims = new Set<AnimationPlaybackControls>();
    const abort = () => {
      if (!alive) return;
      alive = false;
      ownAnims.forEach((c) => c.stop());
      animate(go, 0, { duration: 0.2 });
      if (draggingRef.current) {
        draggingRef.current = false;
        setDragging(false);
        commitRef.current(target.get());
      }
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
    const run = (mv: MotionValue<number>, v: number, duration: number) =>
      new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        if (Math.abs(mv.get() - v) < 0.001) return res();
        const c = animate(mv, v, { duration, ease: [0.4, 0, 0.2, 1], onComplete: () => (ownAnims.delete(c), res()) });
        ownAnims.add(c);
      });
    const geo = () => {
      const tr = trackRef.current!.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      return { X: (v: number) => tr.left - b.left + pad + (v / (n - 1)) * (tr.width - pad * 2), Y: tr.top - b.top + TH / 2 };
    };
    const dragTo = async (to: number, dur: number, ease: [number, number, number, number] = [0.45, 0, 0.35, 1]) => {
      const { X, Y } = geo();
      const from = target.get();
      if (go.get() < 0.5) {
        gx.set(X(from) + 34);
        gy.set(Y + 46);
        await run(go, 1, 0.25);
      }
      await Promise.all([run(gx, X(from), 0.45), run(gy, Y, 0.45)]);
      await run(gs, 0.78, 0.1);
      draggingRef.current = true;
      setDragging(true);
      const ap = motionValue(from);
      await new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        const c = animate(ap, to, {
          duration: dur,
          ease,
          onUpdate: (v) => {
            target.set(v);
            gx.set(X(v));
          },
          onComplete: () => (ownAnims.delete(c), res()),
        });
        ownAnims.add(c);
      });
      draggingRef.current = false;
      setDragging(false);
      kickRef.current = performance.now();
      commitRef.current(to);
      await run(gs, 1, 0.12);
    };
    (async () => {
      await wait(900);
      while (alive) {
        if (Math.round(target.get()) !== 0) {
          await dragTo(0, 0.8);
          await wait(500);
        }
        await dragTo(n - 1, 3.2);
        await run(go, 0, 0.3);
        await wait(3400);
        await dragTo(0, 0.38, [0.5, 0, 0.3, 1]);
        await wait(700);
        await dragTo(Math.min(1, n - 1), 1);
        await run(go, 0, 0.3);
        await wait(2000);
      }
    })().catch((e) => e !== STOP && console.error(e));
    return () => {
      abort();
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced, n]);

  const ic = (k: keyof typeof ICON, s = 14) => <svg viewBox={`0 0 ${ICON[k].vb} ${ICON[k].vb}`} width={s} height={s} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON[k].body }} />;
  const lvl = levels[live] ?? levels[0];
  const recX = recIndex >= 0 && trackW > 0 ? xOf(recIndex, trackW) : 0;
  const recAlign = recIndex === 0 ? "start" : recIndex === n - 1 ? "end" : "center";

  return (
    <motion.div
      ref={rootRef}
      className={`relative w-full max-w-[460px] select-none overflow-hidden rounded-[26px] bg-[#0a0920] px-5 pb-5 pt-5 text-white sm:px-6 ${className}`}
      style={{ boxShadow: cardShadow }}
    >
      {/* a faint nebula that follows the level, and a few fixed stars */}
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: nebula }} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 12% 22%, #fff, transparent), radial-gradient(1px 1px at 78% 14%, #fff, transparent), radial-gradient(1px 1px at 64% 78%, rgba(255,255,255,.7), transparent), radial-gradient(1.5px 1.5px at 30% 86%, rgba(255,255,255,.6), transparent), radial-gradient(1px 1px at 90% 58%, rgba(255,255,255,.8), transparent), radial-gradient(1px 1px at 46% 10%, rgba(255,255,255,.6), transparent)",
        }}
      />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <p id={`${uid}-t`} className="m-0 flex items-baseline gap-2 text-[16px] font-medium tracking-[-0.01em] text-white/75">
          {title}
          <AnimatePresence mode="popLayout" initial={false}>
            {galOn ? (
              <motion.span
                key="gal"
                className="bg-clip-text text-[16px] font-semibold text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #7fe6ff, #b199ff, #ff86dc, #ffd1f2, #7fe6ff)", backgroundSize: "200% 100%" }}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6, filter: "blur(4px)", scale: 0.9 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)", scale: 1, backgroundPosition: ["0% 50%", "100% 50%"] }}
                exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
                transition={{ default: { duration: 0.35 }, backgroundPosition: { duration: 3.2, repeat: Infinity, ease: "linear" } }}
              >
                {lvl.label}
              </motion.span>
            ) : (
              <motion.span key="lvl" className="text-[16px] font-semibold" style={{ color: labelColor }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }}>
                {lvl.label}
              </motion.span>
            )}
          </AnimatePresence>
        </p>
        <motion.span className="grid h-7 w-7 place-items-center rounded-full bg-white/[.07]" style={{ color: labelColor }} aria-hidden="true">
          {ic("sparkles", 15)}
        </motion.span>
      </div>

      <div className="relative z-10 mt-4 flex justify-between text-[13px] text-white/65">
        <span>{startLabel}</span>
        <span>{endLabel}</span>
      </div>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-labelledby={`${uid}-t`}
        aria-valuemin={0}
        aria-valuemax={n - 1}
        aria-valuenow={live}
        aria-valuetext={`${lvl.label}. ${lvl.description}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerEnter={() => (hoverRef.current = true)}
        onPointerLeave={() => (hoverRef.current = false)}
        onKeyDown={onKey}
        onFocus={(e) => (focusRef.current = !pointerFocus.current && e.currentTarget.matches(":focus-visible"))}
        onBlur={() => (focusRef.current = false)}
        className={`relative outline-none [touch-action:none] ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ height: TH }}
      >
        <canvas ref={cvRef} aria-hidden="true" className="pointer-events-none absolute" style={{ left: -BX, top: -BY, width: trackW + BX * 2, height: TH + BY * 2 }} />
      </div>

      <div className="relative z-10 -mt-1 h-[20px]" aria-hidden={recIndex < 0}>
        {recIndex >= 0 && trackW > 0 && (
          <span
            className="absolute top-0 whitespace-nowrap text-[12px] text-white/60"
            style={recAlign === "start" ? { left: recX - 10 } : recAlign === "end" ? { right: trackW - recX - 10 } : { left: recX, transform: "translateX(-50%)" }}
          >
            Recommended
          </span>
        )}
      </div>

      <div className="relative z-10 mt-3 border-t border-white/[.08] pt-4">
        {/* every description sits in the same cell, so the card keeps the height of the longest one */}
        <div className="grid">
          {levels.map((l) => (
            <p key={l.id} aria-hidden="true" className="invisible col-start-1 row-start-1 m-0 text-[14px] leading-[1.5]">
              {l.description}
            </p>
          ))}
          <div className="relative col-start-1 row-start-1">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={lvl.id}
                className="m-0 text-[14px] leading-[1.5] text-white/85"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(4px)" }}
                transition={{ duration: 0.28 }}
                aria-live="polite"
              >
                {lvl.description}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
        {lvl.estimate && (
          <div className="mt-3 flex flex-wrap gap-2 text-[12.5px] font-medium tabular-nums">
            <span className="flex items-center gap-1.5 rounded-full bg-white/[.08] py-1 pl-2 pr-2.5 text-white/90 ring-1 ring-inset ring-white/10">
              <motion.span className="flex" style={{ color: labelColor }}>
                {ic("clock", 13)}
              </motion.span>
              <span className="sr-only">Usually takes</span>
              <motion.span>{secText}</motion.span>
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/[.08] py-1 pl-2 pr-2.5 text-white/90 ring-1 ring-inset ring-white/10">
              <motion.span className="flex" style={{ color: labelColor }}>
                {ic("bolt", 13)}
              </motion.span>
              <motion.span>{credText}</motion.span>
            </span>
          </div>
        )}
      </div>

      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-30 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-white/20 shadow-[0_4px_14px_rgba(0,0,0,.3)] backdrop-blur-[2px]"
      />
    </motion.div>
  );
}
```

--- components/effort-slider/index.ts ---

```ts
export { EffortSlider } from "./effort-slider";
export type { EffortLevel, EffortSliderProps } from "./effort-slider";
```
