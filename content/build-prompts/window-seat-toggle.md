# Window Seat Toggle

Add the "Window Seat Toggle" component from Nexus UI to my project.

A light/dark theme switch drawn as an aeroplane window set in a piece of cabin wall. Outside it's a bright blue sky over a drifting sea of cumulus with the tip of a wing. Grab the shade's tab and pull it down: it follows your finger with a little resistance, and the light in the cabin follows it: the daylight on the wall and in the recess shrinks to the open strip of glass, the room's exposure drops, the sunlit shade glows warm, and near the bottom only a thin line of light leaks round its sides and under its lip. Let go past halfway and it snaps shut with a soft bounce, the cabin dims, and a moment later the shade glides back up by itself on a night sky of stars, a crescent moon, lilac clouds and amber city lights far below. Pull it again and it's day. Let go early and it springs back open. A click anywhere on the window runs the whole thing for you, and the view shifts slightly against your pointer. Applying the theme is your job, for example: <WindowSeatToggle onThemeChange={(t) => { document.documentElement.dataset.theme = t; }} /> Keyboard: focus the window; Space or Enter toggles, Arrow Down closes towards dark, Arrow Up opens towards light.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { WindowSeatToggle } from "@/components/window-seat-toggle";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/window-seat-toggle/index.ts ---

```ts
export { WindowSeatToggle } from "./window-seat-toggle";
export type { WindowSeatTheme, WindowSeatToggleProps } from "./window-seat-toggle";
```

--- components/window-seat-toggle/window-seat-toggle.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControls, type MotionValue } from "framer-motion";

export type WindowSeatTheme = "light" | "dark";
export type WindowSeatToggleProps = {
  /** the current theme (controlled) */
  theme?: WindowSeatTheme;
  /** the theme to start on (uncontrolled) */
  defaultTheme?: WindowSeatTheme;
  onThemeChange?: (theme: WindowSeatTheme) => void;
  labels?: { light?: string; dark?: string; lightHint?: string; darkHint?: string };
  autoplay?: boolean;
  className?: string;
};

// Phosphor (via Iconify), inlined
const ICON = {
  sun: { vb: 256, body: "<path fill=\"currentColor\" d=\"M120 40V16a8 8 0 0 1 16 0v24a8 8 0 0 1-16 0m8 24a64 64 0 1 0 64 64a64.07 64.07 0 0 0-64-64m-69.66 5.66a8 8 0 0 0 11.32-11.32l-16-16a8 8 0 0 0-11.32 11.32Zm0 116.68l-16 16a8 8 0 0 0 11.32 11.32l16-16a8 8 0 0 0-11.32-11.32M192 72a8 8 0 0 0 5.66-2.34l16-16a8 8 0 0 0-11.32-11.32l-16 16A8 8 0 0 0 192 72m5.66 114.34a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32-11.32ZM48 128a8 8 0 0 0-8-8H16a8 8 0 0 0 0 16h24a8 8 0 0 0 8-8m80 80a8 8 0 0 0-8 8v24a8 8 0 0 0 16 0v-24a8 8 0 0 0-8-8m112-88h-24a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16\"/>" },
  moon: { vb: 256, body: "<path fill=\"currentColor\" d=\"M240 96a8 8 0 0 1-8 8h-16v16a8 8 0 0 1-16 0v-16h-16a8 8 0 0 1 0-16h16V72a8 8 0 0 1 16 0v16h16a8 8 0 0 1 8 8m-96-40h8v8a8 8 0 0 0 16 0v-8h8a8 8 0 0 0 0-16h-8v-8a8 8 0 0 0-16 0v8h-8a8 8 0 0 0 0 16m65.14 94.33A88.07 88.07 0 0 1 105.67 46.86a8 8 0 0 0-10.6-9.06A96 96 0 1 0 218.2 160.93a8 8 0 0 0-9.06-10.6\"/>" },
} as const;

const STOP = Symbol("stop");
const TAU = Math.PI * 2;
const HZ = 0.56; // the horizon, as a share of the view's height
const TAB = 5; // how far the pull tab hangs below the shade's lip
const SHOW = 24; // how much of the shade shows when it's open
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const TOP = 28; // the window's top edge inside the panel (pt-7)
type RGB = [number, number, number];
const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
// small seeded random, so the sky looks the same on every visit
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
type Layer = { tile: HTMLCanvasElement; tw: number; th: number; y: number; speed: number; depth: number };
type Star = { x: number; y: number; r: number; a: number; w: number; p: number; c: string };

/**
 * A light/dark theme switch drawn as an aeroplane window set in a piece of cabin wall. Outside it's a bright
 * blue sky over a drifting sea of cumulus with the tip of a wing. Grab the shade's tab and pull it down: it
 * follows your finger with a little resistance, and the light in the cabin follows it: the daylight on the wall
 * and in the recess shrinks to the open strip of glass, the room's exposure drops, the sunlit shade glows warm, and
 * near the bottom only a thin line of light leaks round its sides and under its lip. Let go past halfway and it snaps
 * shut with a soft bounce, the cabin dims, and a moment later the shade glides back up by itself on a night
 * sky of stars, a crescent moon, lilac clouds and amber city lights far below. Pull it again and it's day.
 * Let go early and it springs back open. A click anywhere on the window runs the whole thing for you, and the
 * view shifts slightly against your pointer. Applying the theme is your job, for example:
 *   <WindowSeatToggle onThemeChange={(t) => { document.documentElement.dataset.theme = t; }} />
 * Keyboard: focus the window; Space or Enter toggles, Arrow Down closes towards dark, Arrow Up opens towards light.
 */
export function WindowSeatToggle({ theme, defaultTheme = "light", onThemeChange, labels, autoplay = false, className = "" }: WindowSeatToggleProps) {
  const reduced = !!useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(rootRef, { amount: 0.2 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  const [inner, setInner] = useState<WindowSeatTheme>(defaultTheme);
  const cur = theme ?? inner;
  const dark = cur === "dark";
  const curRef = useRef(cur);
  curRef.current = cur;
  const [announce, setAnnounce] = useState("");
  const set = useCallback(
    (t: WindowSeatTheme) => {
      if (theme === undefined) setInner(t);
      curRef.current = t;
      onThemeChange?.(t);
      setAnnounce(t === "dark" ? "Dark mode on" : "Dark mode off");
    },
    [theme, onThemeChange],
  );
  const L = { light: "Light", dark: "Dark", lightHint: "Pull the shade down for dark mode.", darkHint: "Pull it down again for daylight.", ...labels };

  // ─── size: the window scales down on narrow screens ───
  const [W, setW] = useState(340);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setW(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width + 48));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const winW = Math.round(clamp((W - 48) * 0.8, 168, 220));
  const winH = Math.round(winW * 1.36);
  const rO = Math.round(winW * 0.44);
  const F1 = Math.round(winW * 0.045);
  const T = F1 + Math.round(winW * 0.036);
  const vw = winW - 2 * T;
  const vh = winH - 2 * T;
  const rI = rO - T;
  const travel = vh - SHOW;

  // ─── the shade: 0 is open, 1 is shut ───
  const sp = useMotionValue(0);
  const veil = useMotionValue(0);
  const geo = useRef({ vh, travel, T, F1, winW });
  geo.current = { vh, travel, T, F1, winW };
  const shadeYOf = (p: number) => {
    const tr = geo.current.travel;
    return p < 0 ? -tr * (1 - p * 0.3) : p > 1 ? (p - 1) * tr * 0.12 : -tr * (1 - p);
  };
  const shadeY = useTransform(sp, shadeYOf);

  // ─── light: everything in the cabin follows how much glass the shade leaves open ───
  // nightL blends the light sources in step with the theme's colour fade; o is the open share of the glass
  const nightL = useMotionValue(dark ? 1 : 0);
  useEffect(() => {
    const c = animate(nightL, dark ? 1 : 0, { duration: reduced ? 0.25 : 0.7, ease: "easeOut" });
    return () => c.stop();
  }, [dark, reduced, nightL]);
  const lipOf = (p: number) => shadeYOf(p) + geo.current.vh - TAB; // the shade's bottom edge, in the pane
  const openOf = (p: number) => {
    const { vh: h } = geo.current;
    return clamp((h - lipOf(p)) / (h - (SHOW - TAB)), 0, 1);
  };
  // under reduced motion the shade cross-fades in as a veil, and the light follows that instead
  const LS = [sp, nightL, veil];
  const pn = (f: (o: number, p: number, n: number) => number) => ([p, n, v]: number[]) => f(Math.min(openOf(p), 1 - v), Math.max(clamp(p, 0, 1), v), n);
  // daylight in the room: a soft ambient fill plus light bouncing off the wall around the open part
  const dayAmb = useTransform(LS, pn((o, _p, n) => (1 - n) * (0.3 + 0.7 * Math.pow(o, 0.7))));
  const daySpill = useTransform(LS, pn((o, _p, n) => (1 - n) * Math.pow(o, 0.85)));
  const nightSpill = useTransform(LS, pn((o, _p, n) => n * Math.pow(o, 0.9)));
  // the exposure drop: the wall and label lose light as the glass is covered, a lot by day, a little at night
  const expo = useTransform(LS, pn((_o, p, n) => (1 - n) * 0.52 * Math.pow(p, 1.25) + n * 0.17 * p));
  const frameExpo = useTransform(LS, pn((_o, p, n) => (1 - n) * 0.44 * Math.pow(p, 1.25) + n * 0.14 * p));
  // direct light on the recess around the open part (the sun is up and to the right, so it lands low and left)
  const bevelDay = useTransform(LS, pn((o, _p, n) => (1 - n) * Math.pow(o, 0.45)));
  const bevelNight = useTransform(LS, pn((o, _p, n) => n * 0.7 * Math.pow(o, 0.6)));
  // the shade: lit from behind by the sun, darker on the cabin side as the room dims
  const shadeGlow = useTransform(LS, pn((o, _p, n) => (1 - n) * (0.55 + 0.45 * o)));
  const shadeShadow = useTransform(LS, pn((_o, p, n) => ((1 - n) * 0.24 + n * 0.1) * p));
  // light leaking round the edges once the shade is most of the way down
  const leakDay = useTransform(LS, pn((_o, p, n) => (1 - n) * smooth(0.42, 0.9, p)));
  const leakNight = useTransform(LS, pn((_o, p, n) => n * 0.55 * smooth(0.42, 0.9, p)));
  const rimH = useTransform(sp, (p) => clamp(lipOf(p), 0, geo.current.vh));
  const spillAt = (p: number) => {
    const { T: t, vh: h } = geo.current;
    const lip = clamp(lipOf(p), 0, h);
    return { cy: TOP + t + lip + (h - lip) / 2, ry: (h - lip) * 0.62 + 34 };
  };
  const daySpillBg = useTransform(sp, (p) => {
    const { cy, ry } = spillAt(p);
    const rx = geo.current.winW * 1.02;
    return `radial-gradient(${(rx * 0.55).toFixed(1)}px ${(ry * 0.7).toFixed(1)}px at 50% ${cy.toFixed(1)}px, rgba(255,247,226,.55), rgba(255,247,226,0) 70%), radial-gradient(${rx.toFixed(1)}px ${(ry * 1.25).toFixed(1)}px at 50% ${cy.toFixed(1)}px, rgba(150,198,255,.5), rgba(150,198,255,0) 72%)`;
  });
  const nightSpillBg = useTransform(sp, (p) => {
    const { cy, ry } = spillAt(p);
    const rx = geo.current.winW * 0.95;
    return `radial-gradient(${rx.toFixed(1)}px ${(ry * 1.15).toFixed(1)}px at 50% ${(cy - ry * 0.2).toFixed(1)}px, rgba(120,140,255,.34), rgba(120,140,255,0) 72%), radial-gradient(${(rx * 0.7).toFixed(1)}px ${(ry * 0.6).toFixed(1)}px at 50% ${(cy + ry * 0.45).toFixed(1)}px, rgba(255,170,90,.16), rgba(255,170,90,0) 72%)`;
  });
  const expoBg = useTransform(sp, (p) => {
    const { cy, ry } = spillAt(p);
    const o = openOf(p);
    const rx = geo.current.winW * (0.55 + 0.6 * o);
    return `radial-gradient(${rx.toFixed(1)}px ${(ry * 1.4).toFixed(1)}px at 50% ${cy.toFixed(1)}px, rgba(7,10,34,${(0.5 - 0.3 * (1 - o)).toFixed(3)}), rgba(7,10,34,1) 78%)`;
  });
  const bevelAt = (p: number) => {
    const { T: t, F1: f, vh: h } = geo.current;
    const lip = clamp(lipOf(p), 0, h);
    return { cy: t - f + lip + (h - lip) * 0.6, ry: (h - lip) * 0.62 + t * 2.4 };
  };
  const bevelDayBg = useTransform(sp, (p) => {
    const { cy, ry } = bevelAt(p);
    const rx = geo.current.winW * 0.62;
    return `radial-gradient(${rx.toFixed(1)}px ${ry.toFixed(1)}px at 38% ${cy.toFixed(1)}px, rgba(255,250,232,.95), rgba(255,236,196,.45) 45%, rgba(255,236,196,0) 75%)`;
  });
  const bevelNightBg = useTransform(sp, (p) => {
    const { cy, ry } = bevelAt(p);
    const rx = geo.current.winW * 0.6;
    return `radial-gradient(${rx.toFixed(1)}px ${ry.toFixed(1)}px at 50% ${cy.toFixed(1)}px, rgba(150,165,255,.55), rgba(150,165,255,0) 72%)`;
  });
  const thud = useMotionValue(0);
  const spAnim = useRef<AnimationPlaybackControls | null>(null);
  const busyRef = useRef(false);
  const dragRef = useRef<{ y0: number; p0: number; moved: number; t0: number; target: number } | null>(null);
  const ghostDrag = useRef<{ y0: number; p0: number } | null>(null);
  const ptr = useRef({ x: 0, y: 0 });
  const travelRef = useRef(travel);
  travelRef.current = travel;

  const to = (mv: MotionValue<number>, v: number | number[], o: Record<string, unknown>) =>
    new Promise<void>((res) => {
      const c = animate(mv, v as never, { ...o, onComplete: res } as never);
      if (mv === sp) spAnim.current = c;
    });
  const pause = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  // shut with a soft bounce off the sill, let time pass, then glide back up on the other sky
  const flip = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    spAnim.current?.stop();
    const next: WindowSeatTheme = curRef.current === "dark" ? "light" : "dark";
    if (reduced) {
      sp.set(0);
      await to(veil, 1, { duration: 0.14 });
      set(next);
      await pause(60);
      await to(veil, 0, { duration: 0.22 });
      busyRef.current = false;
      return;
    }
    const left = 1 - clamp(sp.get(), 0, 1);
    await to(sp, 1, { duration: 0.16 + 0.42 * left, ease: [0.5, 0, 0.9, 0.55] });
    void to(thud, [0, 1.6, -0.4, 0], { duration: 0.28 });
    await to(sp, [1, 0.955, 1, 0.988, 1], { duration: 0.42, times: [0, 0.28, 0.56, 0.78, 1], ease: ["easeOut", "easeIn", "easeOut", "easeIn"] });
    set(next);
    await pause(350);
    // from here a new press may reverse it, so let go of the switch
    busyRef.current = false;
    await to(sp, 0, { duration: 1.05, ease: [0.3, 0.05, 0.18, 1] });
    await to(sp, [0, -0.035, 0], { duration: 0.34, ease: "easeInOut" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, set]);
  const springBack = useCallback(() => {
    if (reduced) {
      sp.set(0);
      return;
    }
    spAnim.current?.stop();
    spAnim.current = animate(sp, 0, { type: "spring", stiffness: 300, damping: 11, restDelta: 0.001 });
  }, [reduced, sp]);
  const release = useCallback(
    (target: number) => {
      if (target > 0.5 || sp.get() > 0.5) void flip();
      else springBack();
    },
    [flip, springBack, sp],
  );
  const flipRef = useRef(flip);
  flipRef.current = flip;
  const releaseRef = useRef(release);
  releaseRef.current = release;

  // ─── dragging the tab ───
  const onShadeDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    if (busyRef.current) return;
    spAnim.current?.stop();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { y0: e.clientY, p0: sp.get(), moved: 0, t0: performance.now(), target: sp.get() };
  };
  const onShadeMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dy = e.clientY - d.y0;
    d.moved = Math.max(d.moved, Math.abs(dy));
    let raw = d.p0 + (dy / travelRef.current) * 0.92;
    if (raw < 0) raw *= 0.3;
    if (raw > 1) raw = 1 + (raw - 1) * 0.3;
    d.target = raw;
    if (reduced) sp.set(raw);
  };
  const onShadeUp = () => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    if (d.moved < 5 && performance.now() - d.t0 < 450) void flip();
    else release(d.target);
  };

  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " || e.key === "Enter") void flip();
    else if (e.key === "ArrowDown") {
      if (curRef.current === "light") void flip();
    } else if (e.key === "ArrowUp") {
      if (curRef.current === "dark") void flip();
    } else return;
    e.preventDefault();
  };

  // ─── the view: one canvas, painted every frame while it's on screen ───
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gs = useMotionValue(1);
  const go = useMotionValue(0);
  const nightRef = useRef(defaultTheme === "dark" || theme === "dark" ? 1 : 0);
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const w = vw;
    const h = vh;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    const mk = (cw: number, ch: number) => {
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(cw * dpr));
      c.height = Math.max(1, Math.round(ch * dpr));
      const g = c.getContext("2d")!;
      g.scale(dpr, dpr);
      return [c, g] as const;
    };
    const hz = h * HZ;

    // sky, sun and moon never move, so they're painted once per scene
    const sky = (night: boolean) => {
      const [c, g] = mk(w, h);
      const s = g.createLinearGradient(0, 0, 0, h);
      if (!night) {
        s.addColorStop(0, "#2b8cff");
        s.addColorStop(0.3, "#4a9dff");
        s.addColorStop(HZ, "#9fd4ff");
        s.addColorStop(1, "#d3eaff");
      } else {
        s.addColorStop(0, "#0b1033");
        s.addColorStop(0.3, "#16164a");
        s.addColorStop(HZ, "#2a1b5e");
        s.addColorStop(1, "#130e34");
      }
      g.fillStyle = s;
      g.fillRect(0, 0, w, h);
      if (!night) {
        // sun glare in the top corner, with soft rays falling across the glass
        const sx = w * 0.9;
        const sy = h * 0.05;
        g.save();
        g.translate(sx, sy);
        for (let i = 0; i < 7; i++) {
          const a = (104 + i * 13 + (i % 2) * 4) * (Math.PI / 180);
          const len = h * (0.8 + (i % 3) * 0.2);
          const rg = g.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len);
          rg.addColorStop(0, "rgba(255,248,220,.16)");
          rg.addColorStop(1, "rgba(255,248,220,0)");
          g.fillStyle = rg;
          g.beginPath();
          g.moveTo(0, 0);
          g.lineTo(Math.cos(a - 0.04) * len, Math.sin(a - 0.04) * len);
          g.lineTo(Math.cos(a + 0.04) * len, Math.sin(a + 0.04) * len);
          g.fill();
        }
        g.restore();
        const gl = g.createRadialGradient(sx, sy, 0, sx, sy, w * 1.05);
        gl.addColorStop(0, "rgba(255,255,255,1)");
        gl.addColorStop(0.08, "rgba(255,253,236,.96)");
        gl.addColorStop(0.2, "rgba(255,238,184,.5)");
        gl.addColorStop(0.45, "rgba(255,224,150,.14)");
        gl.addColorStop(1, "rgba(255,220,150,0)");
        g.fillStyle = gl;
        g.fillRect(0, 0, w, h);
      } else {
        // a violet glow along the horizon
        g.save();
        g.translate(w * 0.42, hz);
        g.scale(1, 0.32);
        const hg = g.createRadialGradient(0, 0, 0, 0, 0, w * 0.95);
        hg.addColorStop(0, "rgba(168,104,240,.5)");
        hg.addColorStop(1, "rgba(168,104,240,0)");
        g.fillStyle = hg;
        g.fillRect(-w, -w, w * 2, w * 2);
        g.restore();
        // a crescent moon, with its glow
        const mx = w * 0.7;
        const my = h * 0.15;
        const mr = w * 0.08;
        const mg = g.createRadialGradient(mx, my, 0, mx, my, mr * 5.5);
        mg.addColorStop(0, "rgba(222,208,255,.42)");
        mg.addColorStop(0.35, "rgba(190,170,255,.14)");
        mg.addColorStop(1, "rgba(190,170,255,0)");
        g.fillStyle = mg;
        g.fillRect(0, 0, w, h);
        const [mc, m] = mk(mr * 2 + 4, mr * 2 + 4);
        const c0 = mr + 2;
        const disc = m.createRadialGradient(c0 - mr * 0.3, c0 - mr * 0.3, 0, c0, c0, mr);
        disc.addColorStop(0, "#fffcef");
        disc.addColorStop(1, "#f4dfa8");
        m.fillStyle = disc;
        m.beginPath();
        m.arc(c0, c0, mr, 0, TAU);
        m.fill();
        m.globalCompositeOperation = "destination-out";
        m.beginPath();
        m.arc(c0 + mr * 0.45, c0 - mr * 0.22, mr * 0.88, 0, TAU);
        m.fill();
        g.drawImage(mc, mx - c0, my - c0, mr * 2 + 4, mr * 2 + 4);
      }
      return c;
    };

    // a seamless strip of cumulus: puffs lit from above, shaded underneath
    // Heaps of lobes, flattened by perspective, drawn far to near. Each lobe is lit on top and shaded
    // underneath, so the crevices between lobes read as cauliflower tops rather than a row of balls.
    const clouds = (seed: number, tw: number, th: number, base: number, rMin: number, rMax: number, step: number, gap: number, cols: [RGB, RGB, RGB], deck: boolean, sq: number, fadeDeck = true) => {
      const [c, g] = mk(tw, th);
      const R = rng(seed);
      if (deck) {
        const dg = g.createLinearGradient(0, base, 0, th);
        dg.addColorStop(0, rgba(cols[1], 1));
        dg.addColorStop(0.7, rgba(cols[2], 1));
        dg.addColorStop(1, rgba(cols[2], fadeDeck ? 0 : 1));
        g.fillStyle = dg;
        g.fillRect(0, base, tw, th);
      }
      const lobes: { x: number; y: number; r: number }[] = [];
      for (let x = 0; x < tw; x += step * (0.7 + R() * 0.9)) {
        if (R() < gap) continue;
        const r = rMin + R() * (rMax - rMin);
        const n = 3 + ((R() * 4) | 0);
        for (let i = 0; i < n; i++) {
          const u = n === 1 ? 0 : i / (n - 1) - 0.5;
          const rr = r * (1 - Math.abs(u) * 0.75) * (0.75 + R() * 0.35);
          lobes.push({ x: x + u * r * 2.2 + (R() - 0.5) * r * 0.4, y: base - rr * sq * (0.25 + (1 - Math.abs(u) * 1.6) * 0.75) + (R() - 0.3) * r * sq * 0.35, r: rr });
        }
      }
      lobes.sort((a, b) => a.y - b.y);
      for (const p of lobes)
        for (const dx of [-tw, 0, tw]) {
          const x = p.x + dx;
          if (x + p.r * 1.2 < 0 || x - p.r * 1.2 > tw) continue;
          const ry = p.r * sq;
          g.save();
          g.translate(x, p.y);
          g.scale(1, sq);
          // a soft fringe, then the lobe itself
          const fr = g.createRadialGradient(0, 0, p.r * 0.8, 0, 0, p.r * 1.18);
          fr.addColorStop(0, rgba(cols[0], 0.5));
          fr.addColorStop(1, rgba(cols[0], 0));
          g.fillStyle = fr;
          g.beginPath();
          g.arc(0, 0, p.r * 1.18, 0, TAU);
          g.fill();
          g.restore();
          const lg = g.createLinearGradient(x + p.r * 0.25, p.y - ry, x - p.r * 0.15, p.y + ry);
          lg.addColorStop(0, rgba(cols[0], 1));
          lg.addColorStop(0.45, rgba(cols[0], 1));
          lg.addColorStop(0.78, rgba(cols[1], 1));
          lg.addColorStop(1, rgba(cols[2], 1));
          g.fillStyle = lg;
          g.beginPath();
          g.ellipse(x, p.y, p.r, ry, 0, 0, TAU);
          g.fill();
        }
      return c;
    };
    const layers = (night: boolean): Layer[] => {
      const s = night ? 100 : 0;
      const W2 = Math.ceil(w * 2);
      const far = h * 0.16;
      const mid = h * 0.3;
      const near = h * 0.38;
      const g = night ? 0.32 : 0.04;
      return [
        {
          tile: clouds(s + 1, W2, far, far * 0.6, 6, 12, 15, g, night ? [[160, 146, 226], [104, 90, 186], [52, 40, 118]] : [[244, 249, 255], [220, 234, 252], [184, 210, 242]], !night, 0.42),
          tw: W2,
          th: far,
          y: hz - h * 0.06,
          speed: 3.5,
          depth: 2,
        },
        {
          tile: clouds(s + 2, W2, mid, mid * 0.45, 11, 20, 26, g + 0.04, night ? [[200, 186, 255], [139, 121, 219], [58, 45, 124]] : [[255, 255, 255], [238, 245, 255], [176, 202, 236]], !night, 0.58),
          tw: W2,
          th: mid,
          y: h * 0.55,
          speed: 8,
          depth: 4,
        },
        {
          tile: clouds(s + 3, W2, near, near * 0.45, 20, 36, 42, g + 0.08, night ? [[216, 204, 255], [152, 134, 230], [60, 46, 128]] : [[255, 255, 255], [243, 248, 255], [168, 195, 232]], !night, 0.74, false),
          tw: W2,
          th: near,
          y: h - near * 0.95,
          speed: 17,
          depth: 7,
        },
      ];
    };
    // amber towns far below, seen through the gaps at night
    const city = () => {
      const tw = Math.ceil(w * 2);
      const th = h * (1 - HZ);
      const [c, g] = mk(tw, th);
      const R = rng(77);
      const bg = g.createLinearGradient(0, 0, 0, th);
      bg.addColorStop(0, "rgba(42,28,96,0)");
      bg.addColorStop(0.1, "rgba(42,28,96,1)");
      bg.addColorStop(0.3, "#171040");
      bg.addColorStop(1, "#0b0822");
      g.fillStyle = bg;
      g.fillRect(0, 0, tw, th);
      const gauss = () => (R() + R() + R() - 1.5) / 1.5;
      for (let k = 0; k < 11; k++) {
        const cx = R() * tw;
        const v = 0.12 + R() * 0.85;
        const cy = th * v;
        const spread = (12 + R() * 22) * (0.4 + v);
        for (const dx of [-tw, 0, tw]) {
          const x0 = cx + dx;
          if (x0 + spread * 2 < 0 || x0 - spread * 2 > tw) continue;
          const gl = g.createRadialGradient(x0, cy, 0, x0, cy, spread * 1.6);
          gl.addColorStop(0, "rgba(255,166,64,.26)");
          gl.addColorStop(1, "rgba(255,166,64,0)");
          g.fillStyle = gl;
          g.fillRect(x0 - spread * 2, cy - spread * 2, spread * 4, spread * 4);
        }
        const dots = Math.round(18 + R() * 34);
        for (let i = 0; i < dots; i++) {
          const x = cx + gauss() * spread;
          const y = cy + gauss() * spread * 0.32;
          const r = (0.45 + R() * 0.7) * (0.55 + v * 0.7);
          g.fillStyle = ["#ffb547", "#ffd27f", "#ff9a3c", "#ffe2a8"][(R() * 4) | 0];
          for (const dx of [-tw, 0, tw]) {
            g.beginPath();
            g.arc(x + dx, y, r, 0, TAU);
            g.fill();
          }
        }
      }
      return c;
    };

    const skyD = sky(false);
    const skyN = sky(true);
    const layD = layers(false);
    const layN = layers(true);
    const cityT = city();
    const R = rng(9);
    const stars: Star[] = [];
    while (stars.length < 70) {
      const x = R() * w;
      const y = R() * hz * 0.96;
      if (Math.hypot(x - w * 0.7, y - h * 0.15) < w * 0.14) continue;
      stars.push({ x, y, r: 0.35 + Math.pow(R(), 3) * 1.2, a: 0.45 + R() * 0.55, w: 0.8 + R() * 2.6, p: R() * TAU, c: ["#ffffff", "#dfe6ff", "#fff1cf"][(R() * 3) | 0] });
    }
    const [offC, off] = mk(w, h);

    const tileAt = (g: CanvasRenderingContext2D, l: Layer, t: number, px: number, py: number) => {
      const x = ((((t * l.speed - px * l.depth) % l.tw) + l.tw) % l.tw) - l.tw;
      const y = l.y - py * l.depth * 0.5;
      g.drawImage(l.tile, x, y, l.tw, l.th);
      g.drawImage(l.tile, x + l.tw, y, l.tw, l.th);
    };
    const wing = (g: CanvasRenderingContext2D, night: boolean, t: number, ox: number, oy: number) => {
      const P = (u: number, v: number): [number, number] => [u * w + ox, v * h + oy];
      g.save();
      g.beginPath();
      g.moveTo(...P(-0.2, 0.87));
      g.quadraticCurveTo(...P(0.3, 0.755), ...P(0.74, 0.668));
      g.lineTo(...P(0.785, 0.66));
      g.lineTo(...P(0.805, 0.692));
      g.lineTo(...P(-0.2, 1.32));
      g.closePath();
      const a = P(0.34, 0.75);
      const b = P(0.46, 1.02);
      const gr = g.createLinearGradient(a[0], a[1], b[0], b[1]);
      if (!night) {
        gr.addColorStop(0, "#fbfdff");
        gr.addColorStop(0.3, "#dde5f2");
        gr.addColorStop(1, "#97a6c2");
      } else {
        gr.addColorStop(0, "#3c4180");
        gr.addColorStop(0.3, "#222652");
        gr.addColorStop(1, "#0e1028");
      }
      g.fillStyle = gr;
      g.fill();
      // panel lines: the flap hinge running out to the aileron, and the gaps between flap segments
      g.lineWidth = 0.8;
      g.strokeStyle = night ? "rgba(0,0,0,.4)" : "rgba(60,72,110,.3)";
      g.beginPath();
      g.moveTo(...P(-0.2, 1.17));
      g.lineTo(...P(0.71, 0.71));
      for (const u of [0.18, 0.46]) {
        const hv = 1.17 + ((u + 0.2) / 0.91) * (0.71 - 1.17);
        const tv = 1.32 + ((u + 0.2) / 1.005) * (0.692 - 1.32);
        g.moveTo(...P(u, hv));
        g.lineTo(...P(u - 0.012, tv));
      }
      g.stroke();
      // a faint sheen of sky along the top skin
      if (!night) {
        g.beginPath();
        g.moveTo(...P(-0.2, 0.905));
        g.quadraticCurveTo(...P(0.3, 0.79), ...P(0.72, 0.69));
        g.strokeStyle = "rgba(120,180,255,.13)";
        g.lineWidth = 9;
        g.stroke();
      }
      // the leading edge catches the light
      g.beginPath();
      g.moveTo(...P(-0.2, 0.87));
      g.quadraticCurveTo(...P(0.3, 0.755), ...P(0.74, 0.668));
      g.strokeStyle = night ? "rgba(200,186,255,.55)" : "rgba(255,255,255,.95)";
      g.lineWidth = 1.5;
      g.stroke();
      // a painted winglet
      g.beginPath();
      g.moveTo(...P(0.765, 0.664));
      g.lineTo(...P(0.806, 0.55));
      g.quadraticCurveTo(...P(0.816, 0.536), ...P(0.834, 0.539));
      g.lineTo(...P(0.822, 0.69));
      g.lineTo(...P(0.796, 0.694));
      g.closePath();
      const wa = P(0.8, 0.54);
      const wb = P(0.8, 0.69);
      const wg = g.createLinearGradient(wa[0], wa[1], wb[0], wb[1]);
      if (!night) {
        wg.addColorStop(0, "#ffb457");
        wg.addColorStop(0.5, "#ff6a5f");
        wg.addColorStop(1, "#e83f82");
      } else {
        wg.addColorStop(0, "#8a3f73");
        wg.addColorStop(1, "#4a1d50");
      }
      g.fillStyle = wg;
      g.fill();
      g.beginPath();
      g.moveTo(...P(0.765, 0.664));
      g.lineTo(...P(0.806, 0.55));
      g.strokeStyle = night ? "rgba(230,190,255,.45)" : "rgba(255,240,220,.9)";
      g.lineWidth = 1;
      g.stroke();
      // the red navigation light, and at night the white strobe's double flash
      const [lx, ly] = P(0.81, 0.684);
      const nl = g.createRadialGradient(lx, ly, 0, lx, ly, night ? 11 : 6);
      nl.addColorStop(0, "rgba(255,90,100,.95)");
      nl.addColorStop(1, "rgba(255,60,80,0)");
      g.fillStyle = nl;
      g.fillRect(lx - 12, ly - 12, 24, 24);
      g.fillStyle = "#ff4d5e";
      g.beginPath();
      g.arc(lx, ly, 1.4, 0, TAU);
      g.fill();
      if (night) {
        const s = t % 2.4;
        if (s < 0.06 || (s > 0.16 && s < 0.22)) {
          const sg = g.createRadialGradient(lx - 3, ly + 1, 0, lx - 3, ly + 1, 22);
          sg.addColorStop(0, "rgba(255,255,255,1)");
          sg.addColorStop(0.25, "rgba(235,240,255,.5)");
          sg.addColorStop(1, "rgba(235,240,255,0)");
          g.fillStyle = sg;
          g.fillRect(lx - 26, ly - 22, 46, 46);
        }
      }
      g.restore();
    };
    const paint = (g: CanvasRenderingContext2D, night: boolean, t: number, px: number, py: number) => {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.globalAlpha = 1;
      g.drawImage(night ? skyN : skyD, 0, 0, w, h);
      if (night) {
        for (const s of stars) {
          g.globalAlpha = s.a * (0.55 + 0.45 * Math.sin(t * s.w + s.p));
          g.fillStyle = s.c;
          g.beginPath();
          g.arc(s.x, s.y, s.r, 0, TAU);
          g.fill();
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          if (s.r > 1.1) g.fillRect(s.x - s.r * 2.6, s.y - 0.25, s.r * 5.2, 0.5), g.fillRect(s.x - 0.25, s.y - s.r * 2.6, 0.5, s.r * 5.2);
        }
        g.globalAlpha = 1;
        const tw = cityT.width / dpr;
        const x = ((((t * 6 - px * 3) % tw) + tw) % tw) - tw;
        g.drawImage(cityT, x, hz - py * 1.5, tw, h * (1 - HZ));
        g.drawImage(cityT, x + tw, hz - py * 1.5, tw, h * (1 - HZ));
      }
      for (const l of night ? layN : layD) tileAt(g, l, t, px, py);
      wing(g, night, t, -px * 10, -py * 5);
      if (!night) {
        // a faint lens flare that slides against the pointer
        const sx = w * 0.9;
        const sy = h * 0.05;
        const fx = w * 0.45 - px * 8;
        const fy = h * 0.55 - py * 8;
        const fl: [number, number, string][] = [
          [0.42, 11, "rgba(255,255,255,.1)"],
          [0.66, 5, "rgba(170,230,255,.18)"],
        ];
        for (const [k, r, c] of fl) {
          g.fillStyle = c;
          g.beginPath();
          g.arc(sx + (fx - sx) * k, sy + (fy - sy) * k, r, 0, TAU);
          g.fill();
        }
      }
    };

    let t = 12;
    let px = 0;
    let py = 0;
    let last = performance.now();
    let raf = 0;
    let dirty = true;
    const unsub = sp.on("change", () => (dirty = true));
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!inViewRef.current) return;
      // the shade follows a finger with a little lag, which reads as resistance
      const d = dragRef.current;
      const gd = ghostDrag.current;
      const target = d ? d.target : gd ? gd.p0 + ((gy.get() - gd.y0) / travelRef.current) * 0.92 : null;
      if (target !== null && !reduced) {
        const c = sp.get();
        const n = c + (target - c) * (1 - Math.exp(-dt * 16));
        if (Math.abs(n - c) > 1e-4) sp.set(n);
      }
      // the view changes in an instant behind a shut shade, otherwise it fades
      const want = curRef.current === "dark" ? 1 : 0;
      let nk = nightRef.current;
      if (nk !== want) {
        nk = !reduced && sp.get() > 0.96 ? want : want > nk ? Math.min(want, nk + dt / (reduced ? 0.25 : 0.7)) : Math.max(want, nk - dt / (reduced ? 0.25 : 0.7));
        nightRef.current = nk;
        dirty = true;
      }
      if (reduced) {
        if (!dirty) return;
      } else {
        t += dt;
        px += (ptr.current.x - px) * (1 - Math.exp(-dt * 4));
        py += (ptr.current.y - py) * (1 - Math.exp(-dt * 4));
      }
      dirty = false;
      if (nk < 1) paint(ctx, false, t, px, py);
      if (nk > 0) {
        if (nk >= 1) paint(ctx, true, t, px, py);
        else {
          paint(off, true, t, px, py);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.globalAlpha = nk;
          ctx.drawImage(offC, 0, 0);
          ctx.globalAlpha = 1;
        }
      }
      // the view dims as the shade covers it
      const p = clamp(sp.get(), 0, 1);
      if (p > 0.002) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = `rgba(8,10,34,${(0.45 * p).toFixed(3)})`;
        ctx.fillRect(0, 0, w, h);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vw, vh, reduced]);

  // ─── autoplay: pull it shut, night; pull again, day; then a short tug that springs back ───
  useEffect(() => {
    if (!autoplay || reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let alive = true;
    const own = new Set<AnimationPlaybackControls>();
    const abort = () => {
      if (!alive) return;
      alive = false;
      own.forEach((c) => c.stop());
      if (ghostDrag.current) {
        ghostDrag.current = null;
        releaseRef.current(sp.get());
      }
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
    const run = (mv: MotionValue<number>, v: number, duration: number, ease: [number, number, number, number] = [0.4, 0, 0.2, 1]) =>
      new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        if (Math.abs(mv.get() - v) < 0.01) return res();
        const c = animate(mv, v, { duration, ease, onComplete: () => (own.delete(c), res()) });
        own.add(c);
      });
    const toTab = async () => {
      const el = root.querySelector<HTMLElement>("[data-ws-tab]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      const x = r.left - b.left + r.width / 2;
      const y = r.top - b.top + r.height / 2;
      if (go.get() < 0.5) {
        gx.set(x + 34);
        gy.set(y - 30);
        await run(go, 1, 0.25);
      }
      await Promise.all([run(gx, x, 0.45), run(gy, y, 0.45)]);
    };
    const pull = async (amount: number, duration: number, hold = 90) => {
      await toTab();
      await run(gs, 0.82, 0.1);
      ghostDrag.current = { y0: gy.get(), p0: sp.get() };
      await run(gy, gy.get() + (travelRef.current * amount) / 0.92, duration, [0.45, 0.05, 0.35, 1]);
      await wait(hold);
      ghostDrag.current = null;
      releaseRef.current(sp.get());
      await run(gs, 1, 0.12);
      await run(go, 0, 0.3);
    };
    const idle = async () => {
      while (busyRef.current || Math.abs(sp.get()) > 0.02) await wait(60);
    };
    (async () => {
      await wait(300);
      while (alive) {
        await pull(0.72, 0.95);
        await idle();
        await wait(2200);
        await pull(0.75, 1.0);
        await idle();
        await wait(1800);
        await pull(0.32, 0.7, 260);
        await wait(2600);
      }
    })().catch((e) => e !== STOP && console.error(e));
    return () => {
      abort();
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced]);

  const ic = (k: keyof typeof ICON, s = 16) => <svg viewBox={`0 0 ${ICON[k].vb} ${ICON[k].vb}`} width={s} height={s} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON[k].body }} />;
  const fade = "transition-[background-color,box-shadow,color,opacity] duration-700 ease-out";
  const hintId = `${uid}-hint`;

  return (
    <div ref={rootRef} className={`relative w-full max-w-[360px] select-none overflow-hidden rounded-[34px] px-6 pb-6 pt-7 ${fade} ${className}`} style={{ backgroundColor: dark ? "#161a33" : "#e7ebf3", boxShadow: dark ? "inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px rgba(10,12,40,.4), 0 24px 46px -26px rgba(20,16,70,.75)" : "inset 0 1px 0 rgba(255,255,255,.9), 0 0 0 1px rgba(30,40,80,.06), 0 24px 46px -28px rgba(30,40,90,.4)" }}>
      {/* the cabin wall. By day: an ambient fill, plus daylight bouncing off the wall around whatever glass is
          still open, so it shrinks and slides down with the shade. At night the warm reading light above does
          most of the work, and the open glass lets in a little moonlight and city glow. */}
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: dayAmb, background: "linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0) 55%, rgba(30,40,80,.04))" }} />
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: daySpill, background: daySpillBg }} />
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: nightL, background: "radial-gradient(70% 34% at 50% -4%, rgba(255,186,110,.38), rgba(255,186,110,0) 72%), linear-gradient(180deg, rgba(26,31,58,0), rgba(10,12,32,.35))" }} />
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: nightSpill, background: nightSpillBg }} />

      {/* the window */}
      <motion.div
        role="switch"
        aria-checked={dark}
        aria-label="Dark mode"
        aria-describedby={hintId}
        tabIndex={0}
        onKeyDown={onKey}
        onClick={() => void flip()}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse" || dragRef.current) return;
          const r = e.currentTarget.getBoundingClientRect();
          ptr.current = { x: clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1), y: clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1) };
        }}
        onPointerLeave={() => (ptr.current = { x: 0, y: 0 })}
        className="relative z-[21] mx-auto cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-[#3d8bff]"
        style={{ width: winW, height: winH, borderRadius: rO, y: thud }}
      >
        {/* the plastic surround, then the bevel sloping into the pane */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 ${fade}`}
          style={{
            borderRadius: rO,
            backgroundColor: dark ? "#272c55" : "#f2f4f9",
            backgroundImage: "linear-gradient(180deg, rgba(0,0,30,.05), rgba(255,255,255,.12) 55%, rgba(255,255,255,.28))",
            boxShadow: dark
              ? "inset 0 1px 0 rgba(255,255,255,.12), inset 0 -1px 0 rgba(0,0,0,.3), 0 0 0 1px rgba(5,6,24,.35), 0 12px 24px -12px rgba(0,0,0,.6)"
              : "inset 0 1px 0 rgba(255,255,255,1), inset 0 -2px 3px rgba(30,40,80,.06), 0 0 0 1px rgba(30,40,80,.07), 0 12px 24px -14px rgba(30,40,90,.38)",
          }}
        />
        <div
          aria-hidden="true"
          className={`absolute ${fade}`}
          style={{
            inset: F1,
            borderRadius: rO - F1,
            backgroundColor: dark ? "#181c3e" : "#d9dfea",
            backgroundImage: "linear-gradient(180deg, rgba(0,0,30,.16), rgba(255,255,255,.06) 60%, rgba(255,255,255,.3))",
            boxShadow: dark ? "inset 0 3px 7px rgba(0,0,0,.45), inset 0 -1px 0 rgba(176,160,255,.28)" : "inset 0 3px 7px rgba(30,40,80,.22), inset 0 -1px 0 rgba(255,255,255,.9)",
          }}
        />
        {/* direct light on the recess around the open glass, and the frame dimming with the cabin */}
        <motion.div aria-hidden="true" className="pointer-events-none absolute" style={{ inset: F1, borderRadius: rO - F1, opacity: bevelDay, background: bevelDayBg }} />
        <motion.div aria-hidden="true" className="pointer-events-none absolute" style={{ inset: F1, borderRadius: rO - F1, opacity: bevelNight, background: bevelNightBg }} />
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#070a22]" style={{ borderRadius: rO, opacity: frameExpo }} />
        {/* the pane */}
        <div className="absolute overflow-hidden [isolation:isolate]" style={{ inset: T, borderRadius: rI, background: "#0b1033" }}>
          <canvas ref={cvRef} aria-hidden="true" className="absolute inset-0 block" style={{ width: vw, height: vh }} />
          {/* glass: a soft double reflection and the little breather hole */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(115deg, rgba(255,255,255,0) 28%, rgba(255,255,255,.13) 36%, rgba(255,255,255,0) 44%, rgba(255,255,255,0) 60%, rgba(255,255,255,.07) 64%, rgba(255,255,255,0) 68%)" }} />
          <span aria-hidden="true" className="pointer-events-none absolute left-1/2 h-[4px] w-[4px] -translate-x-1/2 rounded-full bg-[rgba(10,14,40,.4)] shadow-[0_1px_0_rgba(255,255,255,.45)]" style={{ bottom: 12 }} />
          {/* the shade */}
          <motion.div
            data-ws-shade
            aria-hidden="true"
            onPointerDown={onShadeDown}
            onPointerMove={onShadeMove}
            onPointerUp={onShadeUp}
            onPointerCancel={onShadeUp}
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-0 w-full cursor-grab touch-none active:cursor-grabbing"
            style={{ height: vh, y: shadeY }}
          >
            <div
              className="absolute inset-x-0 top-0"
              style={{
                height: vh - TAB,
                backgroundColor: "#f3efe6",
                backgroundImage:
                  "repeating-linear-gradient(180deg, rgba(255,255,255,.7) 0 1px, rgba(255,255,255,0) 1px 7px, rgba(110,96,70,.1) 7px 8px), linear-gradient(90deg, rgba(120,104,80,.14), rgba(255,255,255,0) 22%, rgba(255,255,255,0) 78%, rgba(120,104,80,.14))",
                boxShadow: "0 9px 16px -7px rgba(0,0,20,.5)",
              }}
            >
              <div className="absolute inset-x-0 bottom-0 h-[7px]" style={{ background: "linear-gradient(180deg, #fffdf8, #e4ddcf)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.9), inset 0 -1px 0 rgba(120,104,80,.25)" }} />
            </div>
            {/* the pull tab: a lip with a finger notch */}
            <div data-ws-tab className="absolute left-1/2 z-[1] -translate-x-1/2 rounded-b-[11px] rounded-t-[4px]" style={{ top: vh - TAB - 12, width: 66, height: TAB + 12, background: "linear-gradient(180deg, #ece6d9, #f8f5ee 45%, #ddd5c5)", boxShadow: "0 3px 6px -2px rgba(0,0,20,.45), inset 0 -1px 0 rgba(120,104,80,.3)" }}>
              <span className="absolute left-1/2 top-[5px] h-[7px] w-[30px] -translate-x-1/2 rounded-full" style={{ background: "linear-gradient(180deg, #cfc6b3, #e9e3d6)", boxShadow: "inset 0 2px 2px rgba(80,66,40,.3)" }} />
              <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[#0d1030]" style={{ opacity: shadeShadow }} />
              <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ opacity: nightL, background: "linear-gradient(180deg, rgba(14,18,48,.55), rgba(30,28,70,.5))" }} />
            </div>
            {/* the shade's light. By day the sun shines through it from behind (strongest towards the sun, up and to
                the right) and its cabin side darkens as the room does; at night the reading light catches its top. */}
            <motion.div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: vh - TAB, opacity: shadeGlow, background: "radial-gradient(120% 85% at 82% 4%, rgba(255,214,140,.75), rgba(255,214,140,0) 68%), linear-gradient(180deg, rgba(255,232,186,.18), rgba(255,236,200,.5))" }} />
            <motion.div className="pointer-events-none absolute inset-x-0 top-0 bg-[#0d1030]" style={{ height: vh - TAB, opacity: shadeShadow }} />
            <motion.div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: vh - TAB, opacity: nightL, background: "radial-gradient(90% 40% at 50% 0%, rgba(255,184,110,.3), rgba(255,184,110,0) 75%), linear-gradient(180deg, rgba(14,18,48,.6), rgba(30,28,70,.52))" }} />
            {/* light catching the lip and slipping out under it */}
            <motion.div className="pointer-events-none absolute inset-x-0" style={{ top: vh - TAB - 16, height: 16, opacity: leakDay, background: "linear-gradient(180deg, rgba(255,240,205,0), rgba(255,240,205,.6))" }} />
            <motion.div className="pointer-events-none absolute inset-x-0" style={{ top: vh - TAB - 16, height: 16, opacity: leakNight, background: "linear-gradient(180deg, rgba(160,175,255,0), rgba(160,175,255,.5))" }} />
            <motion.div className="pointer-events-none absolute inset-x-0 h-[2px]" style={{ top: vh - TAB, opacity: leakDay, background: "#fff8e6", boxShadow: "0 0 7px 2px rgba(255,236,190,.95), 0 0 18px 4px rgba(255,226,170,.5)" }} />
            <motion.div className="pointer-events-none absolute inset-x-0 h-[2px]" style={{ top: vh - TAB, opacity: leakNight, background: "#c9d2ff", boxShadow: "0 0 7px 2px rgba(150,165,255,.8)" }} />
          </motion.div>
          {/* under reduced motion the shade cross-fades instead of travelling */}
          <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: veil, backgroundColor: "#ece7dc", backgroundImage: "repeating-linear-gradient(180deg, rgba(255,255,255,.7) 0 1px, rgba(255,255,255,0) 1px 7px, rgba(110,96,70,.1) 7px 8px)" }} />
          {/* the recess: the pane sits deep in the wall */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ borderRadius: rI, boxShadow: "inset 0 10px 16px -6px rgba(0,0,25,.5), inset 0 -3px 8px -3px rgba(0,0,25,.3), inset 0 0 0 1.5px rgba(0,0,30,.22)" }} />
          {/* a shade never quite seals: a thin line of light creeps round its sides down to the lip */}
          <motion.div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0" style={{ height: rimH, opacity: leakDay, borderTopLeftRadius: rI, borderTopRightRadius: rI, boxShadow: "inset 2px 0 0 rgba(255,246,220,1), inset -2px 0 0 rgba(255,246,220,1), inset 7px 0 10px -3px rgba(255,228,170,.8), inset -7px 0 10px -3px rgba(255,228,170,.8)", WebkitMaskImage: "linear-gradient(180deg, transparent 0, #000 45%)", maskImage: "linear-gradient(180deg, transparent 0, #000 45%)" }} />
          <motion.div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0" style={{ height: rimH, opacity: leakNight, borderTopLeftRadius: rI, borderTopRightRadius: rI, boxShadow: "inset 1.5px 0 0 rgba(176,188,255,.9), inset -1.5px 0 0 rgba(176,188,255,.9)", WebkitMaskImage: "linear-gradient(180deg, transparent 0, #000 45%)", maskImage: "linear-gradient(180deg, transparent 0, #000 45%)" }} />
        </div>
      </motion.div>

      {/* the label */}
      <div className="relative mt-6 flex items-center gap-3 px-1">
        <span className={`relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full ${fade}`} style={{ backgroundColor: dark ? "#2b2a6e" : "#ffe9a8", color: dark ? "#d9ccff" : "#b45309", boxShadow: dark ? "inset 0 0 0 1px rgba(201,184,255,.3), 0 0 16px -4px rgba(150,120,255,.6)" : "inset 0 0 0 1px rgba(245,158,11,.35), 0 0 16px -4px rgba(255,190,60,.7)" }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={cur}
              className="grid place-items-center"
              initial={reduced ? { opacity: 0 } : { y: 18, rotate: -60, opacity: 0 }}
              animate={{ y: 0, rotate: 0, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { y: -18, rotate: 60, opacity: 0 }}
              transition={reduced ? { duration: 0.15 } : { type: "spring", stiffness: 380, damping: 22 }}
            >
              {ic(dark ? "moon" : "sun", 19)}
            </motion.span>
          </AnimatePresence>
        </span>
        <div className="min-w-0 flex-1">
          <span className="relative block h-[22px] overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={cur}
                className={`block text-[17px] font-semibold leading-[22px] tracking-[-0.01em] ${fade}`}
                style={{ color: dark ? "#f3f2ff" : "#1d1d1f" }}
                initial={reduced ? { opacity: 0 } : { y: 22, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduced ? { opacity: 0 } : { y: -22, opacity: 0 }}
                transition={reduced ? { duration: 0.15 } : { type: "spring", stiffness: 380, damping: 26 }}
              >
                {dark ? L.dark : L.light}
              </motion.span>
            </AnimatePresence>
          </span>
          <p id={hintId} className={`m-0 mt-0.5 text-[13px] leading-snug ${fade}`} style={{ color: dark ? "#b9bce0" : "#5a6072" }}>
            {dark ? L.darkHint : L.lightHint}
          </p>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      {/* the exposure drop: the wall and the label lose light as the glass is covered */}
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20" style={{ opacity: expo, background: expoBg }} />

      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-30 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-[#1d1d1f]/20 shadow-[0_4px_14px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
      />
    </div>
  );
}
```
