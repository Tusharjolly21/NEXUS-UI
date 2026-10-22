"use client";
import { useCallback, useEffect, useEffectEvent, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface SandTimerProps {
  /** How long the full glass takes to run out, in seconds. */
  seconds?: number;
  /** Turns the glass over by itself when it is nearly empty, until someone presses the button. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
}

const COLS = 70, ROWS = 120, CELL = 2;
const MID = ROWS / 2;
const NECK = 2; // cells wide at the narrowest point
// a narrow, warm palette: fine sand reads as one material, not confetti
const SAND = [0xd9b47c, 0xd6b078, 0xdcb880, 0xd3ac73, 0xdab67e];

/** Half-width of the glass at each row, in cells. */
function halfWidth(y: number) {
  const t = Math.abs(y + 0.5 - MID) / MID; // 0 at the neck, 1 at the ends
  let w = NECK / 2 + (COLS / 2 - 1 - NECK / 2) * Math.pow(t, 0.55);
  if (t > 0.86) w *= Math.sqrt(Math.max(0, 1 - ((t - 0.86) / 0.16) ** 2)); // round the ends
  return w;
}
const inside = (x: number, y: number) => y >= 0 && y < ROWS && Math.abs(x + 0.5 - COLS / 2) <= halfWidth(y);

/** Small seeded generator so the sand lays down and slides the same way every time. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Outline of the glass, traced from the same halfWidth the simulation uses. */
function glassPath(inset = 0) {
  const pts: string[] = [];
  for (let y = 0; y <= ROWS; y += 1) {
    const w = Math.max(0.6, halfWidth(Math.min(ROWS - 1, y)) + 0.5 - inset);
    pts.push(`${((COLS / 2 - w) * CELL).toFixed(1)},${(y * CELL).toFixed(1)}`);
  }
  for (let y = ROWS; y >= 0; y -= 1) {
    const w = Math.max(0.6, halfWidth(Math.min(ROWS - 1, y)) + 0.5 - inset);
    pts.push(`${((COLS / 2 + w) * CELL).toFixed(1)},${(y * CELL).toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z`;
}

/**
 * A session timer that is a real hourglass. Every grain is simulated: it
 * piles, slides off the slope and funnels through the neck at exactly the rate
 * that empties the top as the time runs out. "Stay signed in" turns the glass
 * over, and whatever had already fallen becomes the new top.
 */
export function SandTimer({ seconds = 30, autoplay = false, enableSound = true }: SandTimerProps) {
  const play = useSound(enableSound);
  const canvas = useRef<HTMLCanvasElement>(null);
  const grid = useRef(new Uint32Array(COLS * ROWS)); // 0 = empty, else colour
  const total = useRef(0);
  const top = useRef(0);
  const paused = useRef(false);
  const alive = useRef(true);
  const [left, setLeft] = useState(seconds);
  const [flips, setFlips] = useState(0);
  const turn = useAnimationControls();
  const touched = useRef(false);
  const started = useRef(false); // the visitor has turned the glass at least once
  const reduce = useReducedMotion();
  const ranOut = useEffectEvent(() => {
    if (started.current) play("done");
  });

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    const rng = mulberry32(0x5a17d);
    const g = grid.current;
    g.fill(0);
    let n = 0;
    for (let y = 0; y < MID - 1; y++) for (let x = 0; x < COLS; x++) {
      if (inside(x, y) && y > ROWS * 0.08) { g[y * COLS + x] = SAND[(rng() * SAND.length) | 0]; n++; }
    }
    total.current = n;

    const c = canvas.current!;
    c.width = COLS; c.height = ROWS;
    const ctx = c.getContext("2d")!;
    const img = ctx.createImageData(COLS, ROWS);
    const px = new Uint32Array(img.data.buffer);
    let raf = 0, last = performance.now(), lastLeft = last, tokens = 0, tick = 0, flowing = 0, empty = false;
    let onScreen = true;

    const frame = (now: number, simulate: boolean) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (simulate && !paused.current) {
        // the neck lets grains through at exactly total/seconds per second
        tokens = Math.min(4, tokens + (dt * total.current) / seconds);
        tick++;
        for (let pass = 0; pass < 2; pass++) {
          for (let y = ROWS - 2; y >= 0; y--) {
            const ltr = (y + tick + pass) % 2 === 0;
            for (let k = 0; k < COLS; k++) {
              const x = ltr ? k : COLS - 1 - k;
              const i = y * COLS + x;
              const v = g[i];
              if (!v) continue;
              const throughNeck = y === MID - 1;
              const tryMove = (nx: number, ny: number) => {
                if (!inside(nx, ny) || g[ny * COLS + nx]) return false;
                if (throughNeck) { if (tokens < 1) return false; tokens -= 1; flowing = 6; }
                g[ny * COLS + nx] = v; g[i] = 0; return true;
              };
              if (tryMove(x, y + 1)) continue;
              const d = rng() < 0.5 ? -1 : 1;
              if (tryMove(x + d, y + 1)) continue;
              tryMove(x - d, y + 1);
            }
          }
        }
      }
      let t = 0;
      for (let i = 0; i < MID * COLS; i++) if (g[i]) t++;
      top.current = t;
      for (let i = 0; i < g.length; i++) {
        const v = g[i];
        if (!v) { px[i] = 0; continue; }
        // grains in free fall are drawn as the stream below, not as loose dots
        const cy = (i / COLS) | 0, cx = i % COLS;
        if (cy >= MID && Math.abs(cx + 0.5 - COLS / 2) < 3 && i + COLS < g.length && !g[i + COLS]) { px[i] = 0; continue; }
        // light the exposed surface and shade deeper sand, so the pile has form
        const above = i >= COLS ? g[i - COLS] : 0, deep = i >= COLS * 4 && g[i - COLS * 4] ? 1 : 0;
        const lift = !above ? 26 : deep ? -10 : 0;
        const r = Math.min(255, Math.max(0, (v >> 16) + lift)), gg = Math.min(255, Math.max(0, ((v >> 8) & 255) + lift)), bb = Math.min(255, Math.max(0, (v & 255) + lift * 0.8));
        px[i] = 0xff000000 | (bb << 16) | (gg << 8) | r;
      }
      ctx.putImageData(img, 0, 0);
      // a falling stream reads as one thread, not a dotted line of grains
      if (flowing > 0) {
        flowing--;
        let y = MID;
        const c0 = COLS / 2 - 1;
        while (y < ROWS - 1 && !(g[(y + 1) * COLS + c0] && g[(y + 2) * COLS + c0] && g[(y + 1) * COLS + c0 + 1])) y++;
        ctx.fillStyle = "rgba(214,176,120,.95)";
        ctx.fillRect(c0 + 0.25, MID - 1, 1.5, y - MID + 2);
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      frame(now, true);
      // keep the readout in step with the sand, five times a second
      if (now - lastLeft >= 200) {
        lastLeft = now;
        const l = Math.ceil((top.current / Math.max(1, total.current)) * seconds);
        setLeft(l);
        if (l <= 0 && !empty) ranOut();
        empty = l <= 0;
      }
    };
    const start = () => {
      if (raf || !onScreen || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // paint the full glass once without advancing time, so a tile that never scrolls into view is not blank
    frame(last, false);
    start();

    const io = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1]?.isIntersecting ?? true;
      if (onScreen) start(); else stop();
    });
    io.observe(c);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [seconds]);

  // Turn the glass over: animate 180°, then flip the grid and snap back to 0°
  // (the glass is symmetrical, so nobody can tell).
  const flip = useCallback(async () => {
    if (paused.current) return;
    paused.current = true;
    try {
      if (!reduce) await turn.start({ rotate: 180, transition: { type: "spring", stiffness: 140, damping: 16 } });
    } catch {
      /* animation was interrupted */
    }
    if (!alive.current) return;
    const g = grid.current, f = new Uint32Array(g.length);
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) f[(ROWS - 1 - y) * COLS + (COLS - 1 - x)] = g[y * COLS + x];
    g.set(f);
    turn.set({ rotate: 0 });
    paused.current = false;
    setFlips((n) => n + 1);
  }, [turn, reduce]);

  useEffect(() => {
    if (!autoplay || reduce) return;
    const id = setInterval(() => {
      if (touched.current) { clearInterval(id); return; }
      if (top.current < total.current * 0.45) void flip();
    }, 1500);
    return () => clearInterval(id);
  }, [autoplay, reduce, flip]);

  const out = left <= 0;
  const mm = Math.floor(left / 60), ss = String(left % 60).padStart(2, "0");
  return (
    <div className="flex w-[340px] max-w-full flex-col items-center rounded-[28px] bg-white px-6 pb-6 pt-7 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]">
      <div className="flex w-full items-baseline justify-between">
        <span className="text-[14px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{out ? "Session expired" : "Session ends in"}</span>
        <span className={`text-[22px] font-semibold tabular-nums tracking-[-0.02em] ${out ? "text-[#ff3b30] dark:text-[#ff453a]" : "text-[#1d1d1f] dark:text-[#f5f5f7]"}`} aria-live="polite">{mm}:{ss}</span>
      </div>
      <motion.div animate={turn} className="relative my-6" style={{ width: COLS * CELL + 24, height: ROWS * CELL + 28 }}>
        {/* caps */}
        <div className="absolute inset-x-0 top-0 h-[10px] rounded-[5px] bg-gradient-to-b from-[#e8e8ed] to-[#c7c7cc] shadow-[0_1px_2px_rgba(0,0,0,.15)] dark:from-[#48484a] dark:to-[#3a3a3c] dark:shadow-[0_1px_2px_rgba(0,0,0,.5)]" />
        <div className="absolute inset-x-0 bottom-0 h-[10px] rounded-[5px] bg-gradient-to-b from-[#d2d2d7] to-[#aeaeb2] shadow-[0_2px_6px_rgba(0,0,0,.2)] dark:from-[#3a3a3c] dark:to-[#2c2c2e] dark:shadow-[0_2px_6px_rgba(0,0,0,.6)]" />
        {[0, 1].map((s) => <div key={s} className="absolute top-[8px] h-[calc(100%-16px)] w-[3px] rounded-full bg-gradient-to-r from-[#d2d2d7] to-[#aeaeb2] dark:from-[#48484a] dark:to-[#3a3a3c]" style={{ [s ? "right" : "left"]: 4 } as CSSProperties} />)}
        <canvas ref={canvas} className="absolute left-[12px] top-[14px]" style={{ width: COLS * CELL, height: ROWS * CELL, filter: "contrast(1.04) saturate(1.05)", clipPath: `path("${glassPath(0.7)}")` }} aria-hidden="true" />
        <svg className="pointer-events-none absolute left-[12px] top-[14px]" width={COLS * CELL} height={ROWS * CELL} aria-hidden="true">
          <path d={glassPath()} strokeWidth="1.4" className="fill-[rgba(160,190,220,.06)] stroke-[rgba(0,0,0,.18)] dark:fill-[rgba(160,190,220,.08)] dark:stroke-[rgba(255,255,255,.28)]" />
          <path d={glassPath(0.55)} fill="none" strokeWidth="2" strokeLinecap="round" strokeDasharray="34 400" strokeDashoffset="-18" className="stroke-[rgba(255,255,255,.75)] dark:stroke-[rgba(255,255,255,.5)]" />
        </svg>
      </motion.div>
      <div className="flex w-full gap-2">
        <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={() => { touched.current = true; started.current = true; play("tap"); void flip(); }} className="h-11 flex-1 rounded-full bg-[#0071e3] text-[15px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#0a84ff] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]">
          Stay signed in
        </motion.button>
        <button type="button" className="h-11 rounded-full bg-[#f0f0f3] px-4 text-[15px] font-medium text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]">Sign out</button>
      </div>
      <AnimatePresence>
        {flips > 0 && <motion.span key={flips} className="mt-3 text-[12px] text-[#86868b] dark:text-[#98989d]" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>Turned over {flips}×. The time that had fallen is yours again.</motion.span>}
      </AnimatePresence>
    </div>
  );
}
