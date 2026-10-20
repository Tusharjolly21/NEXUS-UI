"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type ShootingStarsGridSpeed = "slow" | "normal" | "fast" | number;

export type ShootingStarsGridProps = {
  /** Content over the grid. Defaults to a short hero. */
  children?: ReactNode;
  /** Twinkling background stars. */
  starCount?: number;
  /** Shooting stars running along the grid at once. */
  shootingStarCount?: number;
  /** Grid cell size in px. */
  gridSize?: number;
  /** Preset or a duration multiplier (higher is slower). */
  speed?: ShootingStarsGridSpeed;
  /** Glow round the heads, the nodes they light and the pointer spotlight. */
  glow?: boolean;
  className?: string;
  /** Classes for the content wrapper. */
  contentClassName?: string;
  showGrid?: boolean;
  showStaticStars?: boolean;
  /** With reduced motion, draw one still frame instead of animating. */
  reducedMotionFallback?: boolean;
  /** Spotlight under the pointer, and shooting stars turn toward it at each node. */
  interactive?: boolean;
  /** Steers the shooting stars round a pretend pointer until someone moves over the grid. */
  autoplay?: boolean;
};

type Runner = { axis: 0 | 1; line: number; pos: number; dir: 1 | -1; v: number; len: number; wait: number; trail: number[] };

const SPEED_SCALE: Record<Exclude<ShootingStarsGridSpeed, number>, number> = { slow: 1.3, normal: 1, fast: 0.7 };

function subscribeTheme(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
/** Follows the site's class-based dark mode; false on the server and during hydration. */
function useIsDark() {
  return useSyncExternalStore(subscribeTheme, () => document.documentElement.classList.contains("dark"), () => false);
}

function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let n = Math.imul(t ^ (t >>> 15), 1 | t);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A grid where shooting stars run along the lines. At every node they cross
 * they may turn a corner, and each node they pass flashes and fades. Move
 * over it and a spotlight follows the pointer while the stars turn toward
 * you at each node.
 */
export function ShootingStarsGrid({
  children,
  starCount = 48,
  shootingStarCount = 6,
  gridSize = 44,
  speed = "normal",
  glow = true,
  className,
  contentClassName,
  showGrid = true,
  showStaticStars = true,
  reducedMotionFallback = true,
  interactive = true,
  autoplay = false,
}: ShootingStarsGridProps) {
  const reduce = useReducedMotion() === true;
  const still = reduce && reducedMotionFallback;
  const dark = useIsDark();
  const darkRef = useRef(dark);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0, y: 0, inside: false });
  const touched = useRef(false);
  const scale = typeof speed === "number" ? Math.max(0.35, speed) : SPEED_SCALE[speed] ?? 1;
  const g = Math.max(16, gridSize);
  const nStars = Math.max(0, Math.min(160, Math.round(starCount)));
  const nRunners = Math.max(0, Math.min(14, Math.round(shootingStarCount)));

  useEffect(() => {
    darkRef.current = dark;
  }, [dark]);
  // The live loop reads darkRef; a still frame has to be redrawn when the theme flips.
  const stillTheme = still ? dark : null;

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const rand = rng(nStars * 31 + nRunners * 997 + g);
    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (still) draw(0);
    });
    ro.observe(cv);

    const stars = Array.from({ length: nStars }, () => ({ x: rand(), y: rand(), r: 0.5 + rand() * 1.1, p: rand() * 6.28, s: 0.6 + rand() * 1.4 }));
    const flashes = new Map<number, number>();
    const spawn = (r: Runner, first: boolean) => {
      r.axis = rand() < 0.62 ? 0 : 1;
      const lanes = Math.max(1, Math.floor((r.axis === 0 ? h : w) / g));
      r.line = 1 + Math.floor(rand() * Math.max(1, lanes - 1));
      r.dir = rand() < 0.5 ? 1 : -1;
      const extent = r.axis === 0 ? w : h;
      r.len = 90 + rand() * 120;
      r.pos = r.dir === 1 ? -10 : extent + 10;
      r.v = (230 + rand() * 170) / scale;
      r.wait = first ? rand() * 3 * scale : (1.2 + rand() * 3.8) * scale;
      r.trail.length = 0;
    };
    const runners: Runner[] = Array.from({ length: nRunners }, () => {
      const r: Runner = { axis: 0, line: 1, pos: 0, dir: 1, v: 0, len: 100, wait: 0, trail: [] };
      spawn(r, true);
      return r;
    });
    const headX = (r: Runner) => (r.axis === 0 ? r.pos : r.line * g);
    const headY = (r: Runner) => (r.axis === 0 ? r.line * g : r.pos);

    let target: { x: number; y: number } | null = null;

    function draw(time: number) {
      const isDark = darkRef.current;
      const ink = isDark ? "125,211,252" : "0,113,227";
      ctx!.clearRect(0, 0, w, h);
      if (interactive && glow && target) {
        const sg = ctx!.createRadialGradient(target.x, target.y, 0, target.x, target.y, 200);
        sg.addColorStop(0, `rgba(${ink},${isDark ? 0.16 : 0.12})`);
        sg.addColorStop(1, `rgba(${ink},0)`);
        ctx!.fillStyle = sg;
        ctx!.fillRect(0, 0, w, h);
      }
      if (showGrid) {
        ctx!.strokeStyle = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,113,227,0.1)";
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        for (let x = g; x < w; x += g) {
          ctx!.moveTo(Math.round(x) + 0.5, 0);
          ctx!.lineTo(Math.round(x) + 0.5, h);
        }
        for (let y = g; y < h; y += g) {
          ctx!.moveTo(0, Math.round(y) + 0.5);
          ctx!.lineTo(w, Math.round(y) + 0.5);
        }
        ctx!.stroke();
      }
      if (showStaticStars) {
        for (const s of stars) {
          const a = 0.2 + 0.45 * (0.5 + 0.5 * Math.sin(time * s.s + s.p));
          ctx!.fillStyle = isDark ? `rgba(255,255,255,${a})` : `rgba(29,29,31,${a * 0.4})`;
          ctx!.beginPath();
          ctx!.arc(s.x * w, s.y * h, s.r, 0, 6.283);
          ctx!.fill();
        }
      }
      for (const [key, e] of flashes) {
        const nx = (key % 4096) * g;
        const ny = Math.floor(key / 4096) * g;
        // Pops a little larger than its rest size first: 1 + overshoot that dies with e.
        const pop = 1 + Math.sin((1 - e) * Math.PI) * 0.6;
        if (glow) {
          const fg = ctx!.createRadialGradient(nx, ny, 0, nx, ny, 14 * pop);
          fg.addColorStop(0, `rgba(${ink},${e * 0.55})`);
          fg.addColorStop(1, `rgba(${ink},0)`);
          ctx!.fillStyle = fg;
          ctx!.fillRect(nx - 16 * pop, ny - 16 * pop, 32 * pop, 32 * pop);
        }
        ctx!.fillStyle = isDark ? `rgba(255,255,255,${e})` : `rgba(0,113,227,${e})`;
        ctx!.beginPath();
        ctx!.arc(nx, ny, 1.6 * pop, 0, 6.283);
        ctx!.fill();
      }
      ctx!.lineCap = "round";
      for (const r of runners) {
        if (r.wait > 0 || r.trail.length < 4) continue;
        const t = r.trail;
        let hx = t[t.length - 2];
        let hy = t[t.length - 1];
        let dist = 0;
        for (let i = t.length - 4; i >= 0 && dist < r.len; i -= 2) {
          const x = t[i];
          const y = t[i + 1];
          const seg = Math.hypot(hx - x, hy - y);
          const k = 1 - dist / r.len;
          ctx!.strokeStyle = `rgba(${ink},${k * 0.9})`;
          ctx!.lineWidth = 1 + k * 0.8;
          ctx!.beginPath();
          ctx!.moveTo(hx, hy);
          ctx!.lineTo(x, y);
          ctx!.stroke();
          dist += seg;
          hx = x;
          hy = y;
        }
        const x = headX(r);
        const y = headY(r);
        if (glow) {
          const hg = ctx!.createRadialGradient(x, y, 0, x, y, 12);
          hg.addColorStop(0, `rgba(${ink},0.6)`);
          hg.addColorStop(1, `rgba(${ink},0)`);
          ctx!.fillStyle = hg;
          ctx!.fillRect(x - 12, y - 12, 24, 24);
        }
        ctx!.fillStyle = isDark ? "#fff" : "#0071e3";
        ctx!.beginPath();
        ctx!.arc(x, y, 1.8, 0, 6.283);
        ctx!.fill();
      }
    }

    if (still) {
      draw(0);
      return () => ro.disconnect();
    }

    let raf = 0;
    let last = performance.now();
    let time = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e?.isIntersecting ?? true;
    });
    io.observe(cv);

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;
      time += dt;
      const p = pointer.current;
      target = interactive
        ? p.inside
          ? { x: p.x, y: p.y }
          : autoplay && !touched.current
            ? { x: w * (0.5 + 0.32 * Math.sin(time * 0.5)), y: h * (0.5 + 0.28 * Math.sin(time * 0.8 + 1)) }
            : null
        : null;

      for (const [key, e] of flashes) {
        const next = e - dt * 1.1;
        if (next <= 0) flashes.delete(key);
        else flashes.set(key, next);
      }
      for (const r of runners) {
        if (r.wait > 0) {
          r.wait -= dt;
          continue;
        }
        const before = Math.floor(r.pos / g);
        r.pos += r.v * r.dir * dt;
        const after = Math.floor(r.pos / g);
        if (before !== after) {
          const node = r.dir === 1 ? after : before;
          const nodeAt = node * g;
          const ix = r.axis === 0 ? node : r.line;
          const iy = r.axis === 0 ? r.line : node;
          if (ix > 0 && iy > 0 && ix * g < w && iy * g < h) {
            flashes.set(iy * 4096 + ix, 1);
            let turn = rand() < 0.22;
            let ndir: 1 | -1 = rand() < 0.5 ? 1 : -1;
            if (target) {
              const tx = target.x - ix * g;
              const ty = target.y - iy * g;
              // Turn onto the cross line when most of the remaining distance lies across it.
              const across = r.axis === 0 ? ty : tx;
              const along = r.axis === 0 ? tx : ty;
              if (Math.abs(across) > g * 0.6 && Math.abs(across) > Math.abs(along) * 0.8 && rand() < 0.75) {
                turn = true;
                ndir = across > 0 ? 1 : -1;
              } else if (Math.abs(along) > g && Math.sign(along) !== r.dir && Math.abs(across) > g * 0.5) {
                turn = true;
                ndir = across > 0 ? 1 : -1;
              } else turn = false;
            }
            if (turn) {
              r.trail.push(ix * g, iy * g);
              r.line = r.axis === 0 ? ix : iy;
              r.axis = r.axis === 0 ? 1 : 0;
              const overshoot = Math.abs(r.pos - nodeAt);
              r.dir = ndir;
              r.pos = (r.axis === 0 ? ix : iy) * g + overshoot * ndir;
            }
          }
        }
        r.trail.push(headX(r), headY(r));
        if (r.trail.length > 120) r.trail.splice(0, r.trail.length - 120);
        const extent = r.axis === 0 ? w : h;
        if (r.pos < -r.len - 20 || r.pos > extent + r.len + 20) spawn(r, false);
      }
      draw(time);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [stillTheme, still, nStars, nRunners, g, scale, glow, showGrid, showStaticStars, interactive, autoplay]);

  return (
    <section
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        touched.current = true;
        pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top, inside: true };
      }}
      onPointerLeave={() => {
        pointer.current.inside = false;
      }}
      className={cn(
        "relative isolate min-h-[480px] w-full overflow-hidden rounded-[24px] text-[#1d1d1f] dark:text-[#f5f5f7]",
        "bg-[radial-gradient(120%_80%_at_50%_0%,#ffffff_0%,#f3f7fd_55%,#eaf1fb_100%)] dark:bg-[radial-gradient(120%_80%_at_50%_0%,#0d1324_0%,#080b14_55%,#05070c_100%)]",
        "shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]",
        className,
      )}
    >
      <canvas
        ref={canvas}
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full [mask-image:radial-gradient(ellipse_85%_80%_at_50%_45%,#000_40%,transparent)]"
      />
      <div className={cn("relative z-10 flex min-h-[inherit] w-full items-center justify-center px-6 py-16 sm:px-10", contentClassName)}>
        {children ?? <DefaultHero />}
      </div>
    </section>
  );
}

function DefaultHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="mx-auto flex max-w-2xl flex-col items-center text-center"
    >
      <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06)] dark:bg-white/10 dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]">
        <span className="size-1.5 rounded-full bg-[#0071e3] dark:bg-[#64d2ff]" />
        Motion background
      </span>
      <h2 className="text-[34px] font-semibold leading-[1.03] tracking-[-0.045em] [text-wrap:balance] sm:text-[52px]">
        Build interfaces that feel alive.
      </h2>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#6e6e73] [text-wrap:balance] dark:text-[#a1a1a6]">
        Animated components and templates for modern React apps. Copy them, own them.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <motion.a
          href="#"
          whileTap={{ scale: 0.95 }}
          className="inline-flex h-11 items-center rounded-full bg-[#0071e3] px-5 text-[14px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#0a84ff] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
        >
          Browse components
        </motion.a>
        <motion.a
          href="#"
          whileTap={{ scale: 0.95 }}
          className="inline-flex h-11 items-center rounded-full bg-white px-5 text-[14px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-white/10 dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.12)] dark:focus-visible:ring-[#0a84ff]"
        >
          View templates
        </motion.a>
      </div>
      <p className="mt-6 text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">Move over the grid. The stars turn toward you.</p>
    </motion.div>
  );
}
