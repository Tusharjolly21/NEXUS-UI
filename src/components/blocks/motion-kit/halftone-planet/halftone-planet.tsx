"use client";

import { useEffect, useRef, type CSSProperties, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface HalftonePlanetProps {
  accent?: string;
  /** Accent used in dark mode. Defaults to Apple dark blue when `accent` is left at its default. */
  accentDark?: string;
  /** Dot colour in light mode. */
  ink?: string;
  /** Dot colour in dark mode. */
  inkDark?: string;
  /** Lets the bands of latitude drift so the planet reads as turning. */
  autoplay?: boolean;
  /** Called with the label of the button that was pressed. Buttons never navigate. */
  onAction?: (label: "primary" | "secondary") => void;
  className?: string;
}

const DEFAULT_ACCENT = "#0071e3";
const REST = { x: -0.5, y: -0.6 };
const ease = [0.16, 1, 0.3, 1] as const;
const WORDS = ["Payments", "that", "travel", "as", "far", "as", "you", "do."];
const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-[var(--mk-accent)] focus-visible:ring-offset-2 dark:focus-visible:ring-[var(--mk-accent-dark)] dark:focus-visible:ring-offset-black";

/**
 * Hero with a halftone planet behind the copy. The sphere is a grid of dots
 * whose size comes from lighting; the light follows the pointer (or a tap),
 * and slow bands of latitude drift round so it reads as turning. Plain canvas,
 * no libraries, paused when off screen and idle when nothing changes.
 */
export function HalftonePlanet({
  accent = DEFAULT_ACCENT,
  accentDark,
  ink = "#1d1d1f",
  inkDark = "#f5f5f7",
  autoplay = true,
  onAction,
  className,
}: HalftonePlanetProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const light = useRef({ x: REST.x, y: REST.y, tx: REST.x, ty: REST.y });
  const reduce = useReducedMotion();
  const spin = autoplay && !reduce;

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    let raf = 0;
    let visible = true;
    let t = 0;
    let dirty = true;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const isDark = () => document.documentElement.classList.contains("dark");
    let colour = isDark() ? inkDark : ink;

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(c);
    const resize = () => {
      c.width = Math.max(1, Math.round(c.offsetWidth * dpr));
      c.height = Math.max(1, Math.round(c.offsetHeight * dpr));
      dirty = true;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const mo = new MutationObserver(() => {
      colour = isDark() ? inkDark : ink;
      dirty = true;
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      const L = light.current;
      const moving = Math.abs(L.tx - L.x) > 0.001 || Math.abs(L.ty - L.y) > 0.001;
      if (!spin && !moving && !dirty) return;
      dirty = false;
      if (spin) t += 0.004;
      if (reduce) {
        L.x = L.tx;
        L.y = L.ty;
      } else {
        L.x += (L.tx - L.x) * 0.06;
        L.y += (L.ty - L.y) * 0.06;
      }
      const W = c.width;
      const H = c.height;
      ctx.clearRect(0, 0, W, H);
      const R = Math.min(W, H) * 0.46;
      const cx = W * 0.5;
      const cy = H * 0.52;
      // Keep roughly the same number of dots on small canvases.
      const gap = Math.max(6, Math.min(9, (R / dpr) / 26)) * dpr;
      const lz = Math.sqrt(Math.max(0.05, 1 - L.x * L.x - L.y * L.y));
      ctx.fillStyle = colour;
      for (let y = -R; y <= R; y += gap) {
        const row = Math.round(y / gap);
        for (let x = -R + (row % 2 ? gap / 2 : 0); x <= R; x += gap) {
          const d2 = x * x + y * y;
          if (d2 > R * R) continue;
          const nx = x / R;
          const ny = y / R;
          const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
          let lit = nx * L.x + ny * L.y + nz * lz;
          const lat = Math.asin(Math.max(-1, Math.min(1, ny)));
          const lon = Math.atan2(nx, nz) + t;
          const band = 0.55 + 0.45 * Math.sin(lat * 7 + Math.sin(lon * 2) * 0.8);
          lit = Math.max(0, lit) * band;
          const r = (0.4 + lit * 3.4) * dpr * (0.6 + nz * 0.4) * (gap / (9 * dpr));
          if (r < 0.35 * dpr) continue;
          ctx.globalAlpha = 0.25 + lit * 0.75;
          ctx.beginPath();
          ctx.arc(cx + x, cy + y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
    };
  }, [ink, inkDark, spin, reduce]);

  const aim = (e: ReactPointerEvent<HTMLElement>) => {
    const el = canvas.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
    const m = Math.hypot(nx, ny);
    const k = m > 0.95 ? 0.95 / m : 1;
    light.current.tx = nx * k;
    light.current.ty = ny * k;
  };
  const press = (label: "primary" | "secondary") => (e: ReactMouseEvent) => {
    e.preventDefault();
    onAction?.(label);
  };

  const dark = accentDark ?? (accent === DEFAULT_ACCENT ? "#0a84ff" : accent);
  const vars = { "--mk-accent": accent, "--mk-accent-dark": dark } as CSSProperties;

  return (
    <section
      style={vars}
      className={cn("@container relative w-full overflow-hidden bg-[#fbfbfd] px-5 py-16 dark:bg-black @2xl:py-28", className)}
      onPointerMove={aim}
      onPointerDown={aim}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        light.current.tx = REST.x;
        light.current.ty = REST.y;
      }}
    >
      <div className="relative mx-auto grid w-full max-w-[1120px] grid-cols-1 items-center gap-6 @4xl:grid-cols-2">
        <div className="relative z-10 flex flex-col items-start gap-5 @2xl:gap-6">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_#3a3a3c]"
          >
            <span className="text-[var(--mk-accent)] dark:text-[var(--mk-accent-dark)]" aria-hidden="true">●</span> Now in 40 countries
          </motion.span>
          <h1 className="m-0 text-[clamp(38px,7.4cqi,84px)] font-semibold leading-[0.98] tracking-[-0.055em] text-[#1d1d1f] dark:text-[#f5f5f7] @4xl:text-[clamp(44px,6.6cqi,84px)]">
            {WORDS.map((w, i) => (
              <motion.span
                key={i}
                className="mr-[0.22em] inline-block last:mr-0"
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.9, ease, delay: 0.1 + i * 0.06 }}
              >
                {w}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.5 }}
            className="m-0 max-w-[460px] text-[clamp(16px,2.4cqi,19px)] leading-[1.45] text-[#6e6e73] dark:text-[#a1a1a6]"
          >
            Accept cards and local methods in 40 countries from one integration. Move your pointer across the globe to light it up.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.65 }} className="flex flex-wrap gap-3">
            <motion.a
              href="#"
              onClick={press("primary")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className={cn("flex h-12 items-center rounded-full bg-[var(--mk-accent)] px-6 text-[15px] font-medium text-white dark:bg-[var(--mk-accent-dark)]", focusRing)}
            >
              Start accepting payments
            </motion.a>
            <motion.a
              href="#"
              onClick={press("secondary")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "flex h-12 items-center rounded-full bg-white px-6 text-[15px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.1)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_#3a3a3c]",
                focusRing,
              )}
            >
              See coverage
            </motion.a>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease, delay: 0.2 }}
          className="relative aspect-square w-full max-w-[min(520px,100%)] justify-self-center"
        >
          <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        </motion.div>
      </div>
    </section>
  );
}
