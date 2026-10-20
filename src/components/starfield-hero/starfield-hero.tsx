"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CTAConfig {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface InteractiveStarfieldHeroProps {
  /** Number of stars. */
  particleCount?: number;
  /** Stars within this many px of the pointer brighten toward `activeColor`. */
  interactionRadius?: number;
  /** Resting star colour (any CSS colour). */
  particleColor?: string;
  /** Star colour near the pointer and at full warp. */
  activeColor?: string;
  /** How snappy the warp and the steering feel: 0.1 (dreamlike) to 1 (snappy). */
  speed?: number;
  className?: string;
  /** Replaces the default hero content. */
  children?: ReactNode;
  /** Heading. Use \n for a line break; the second line is dimmed. */
  title?: string;
  subtitle?: string;
  primaryCTA?: CTAConfig;
  secondaryCTA?: CTAConfig;
  /** Label of the hold-to-warp button. Pass an empty string to hide it. */
  warpLabel?: string;
  /** Jumps to warp every few seconds until someone touches the hero. */
  autoplay?: boolean;
}

type Star = { x: number; y: number; z: number; tw: number };

const BASE = 0.045;
const WARP = 1.7;

function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let n = Math.imul(t ^ (t >>> 15), 1 | t);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

/** Resolves any CSS colour (names, hsl, variables) to rgb channels through the DOM. */
function resolveRgb(host: HTMLElement, css: string, fallback: number[]) {
  const s = document.createElement("span");
  s.style.color = css;
  s.style.display = "none";
  host.appendChild(s);
  const v = getComputedStyle(s).color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  s.remove();
  return v && v.length === 3 ? v : fallback;
}

/**
 * A hero in a deep starfield drawn on canvas. Stars drift toward you in 3D,
 * the vanishing point leans toward the pointer and stars near it brighten.
 * Press and hold anywhere (or the Warp button) to jump: stars stretch into
 * streaks, then on release the field brakes past a standstill, recoils a
 * touch and settles.
 */
export function InteractiveStarfieldHero({
  particleCount = 300,
  interactionRadius = 140,
  particleColor = "#9fc6ff",
  activeColor = "#ffffff",
  speed = 0.5,
  className,
  children,
  title = "Ship faster.\nBuild better.",
  subtitle = "A motion-native component library for React. Animated, accessible and production-ready.",
  primaryCTA = { label: "Get started", href: "#" },
  secondaryCTA = { label: "View components", href: "#" },
  warpLabel = "Hold to warp",
  autoplay = false,
}: InteractiveStarfieldHeroProps) {
  const still = useReducedMotion() === true;
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0.5, y: 0.5, px: 0, py: 0, inside: false });
  const warping = useRef(false);
  const touched = useRef(false);
  const [held, setHeld] = useState(false);
  const count = Math.max(20, Math.min(1200, Math.round(particleCount)));
  const snap = Math.max(0.1, Math.min(1, speed));

  const hold = (on: boolean) => {
    warping.current = on;
    setHeld(on);
  };

  useEffect(() => {
    const el = root.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx) return;
    const base = resolveRgb(el, particleColor, [159, 198, 255]);
    const hot = resolveRgb(el, activeColor, [255, 255, 255]);
    const mix = (k: number) =>
      `rgb(${Math.round(base[0] + (hot[0] - base[0]) * k)},${Math.round(base[1] + (hot[1] - base[1]) * k)},${Math.round(base[2] + (hot[2] - base[2]) * k)})`;

    const rand = rng(count * 13 + 5);
    const stars: Star[] = Array.from({ length: count }, () => ({ x: rand() * 2 - 1, y: rand() * 2 - 1, z: 0.05 + rand() * 0.95, tw: rand() * 6.28 }));
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

    let vx = 0.5;
    let vy = 0.5;
    let v = BASE;
    const draw = (time: number, dt: number) => {
      ctx.clearRect(0, 0, w, h);
      const cx = w * vx;
      const cy = h * vy;
      const f = Math.max(w, h) * 0.55;
      const warpK = Math.max(0, Math.min(1, (v - BASE) / (WARP - BASE)));
      const ir = Math.max(10, interactionRadius);
      const p = pointer.current;
      ctx.lineCap = "round";
      for (const s of stars) {
        const sx = cx + (s.x / s.z) * f;
        const sy = cy + (s.y / s.z) * f;
        if (sx < -40 || sy < -40 || sx > w + 40 || sy > h + 40) continue;
        const near = 1 - s.z;
        let glow = 0;
        if (p.inside) {
          const d = Math.hypot(sx - p.px, sy - p.py);
          if (d < ir) glow = (1 - d / ir) ** 2;
        }
        const twinkle = still ? 1 : 0.75 + 0.25 * Math.sin(time * 2 + s.tw);
        const alpha = Math.min(1, (0.4 + near * 0.75) * twinkle + glow * 0.6);
        const r = 0.55 + near * 1.9 + glow * 1.2;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = ctx.fillStyle = mix(Math.max(warpK, glow));
        // Streak from where the star was a moment ago; long only when moving fast.
        const z0 = Math.min(1.2, s.z + Math.abs(v) * Math.max(dt, 0.016) * 4.5);
        const tx = cx + (s.x / z0) * f;
        const ty = cy + (s.y / z0) * f;
        if (Math.hypot(sx - tx, sy - ty) > r * 1.5) {
          ctx.lineWidth = r * 1.4;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, 6.283);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (still) draw(0, 0);
    });
    ro.observe(cv);
    if (still) {
      draw(0, 0);
      return () => ro.disconnect();
    }

    let raf = 0;
    let last = performance.now();
    let time = 0;
    let vel = 0;
    let demo = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e?.isIntersecting ?? true;
    });
    io.observe(cv);
    // Warp spring: stiffer with `speed`, always underdamped so release brakes past zero.
    const k = 5 + snap * 22;
    const c = 2 * Math.sqrt(k) * 0.42;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;
      time += dt;
      let on = warping.current;
      const p = pointer.current;
      let gx = 0.5;
      let gy = 0.5;
      if (p.inside) {
        gx = 0.5 + (p.x - 0.5) * 0.45;
        gy = 0.5 + (p.y - 0.5) * 0.45;
      } else if (autoplay && !touched.current) {
        demo += dt;
        const phase = demo % 4.6;
        on = phase > 2.6 && phase < 4;
        gx = 0.5 + Math.sin(demo * 0.4) * 0.12;
        gy = 0.5 + Math.cos(demo * 0.3) * 0.08;
      }
      const lean = 1 - Math.exp(-dt * (1.5 + snap * 4));
      vx += (gx - vx) * lean;
      vy += (gy - vy) * lean;
      vel += (k * ((on ? WARP : BASE) - v) - c * vel) * dt;
      v = Math.max(-0.35, v + vel * dt);
      for (const s of stars) {
        s.z -= v * dt;
        if (s.z <= 0.03) {
          s.z += 0.97;
          s.x = rand() * 2 - 1;
          s.y = rand() * 2 - 1;
        } else if (s.z > 1) s.z -= 0.95;
      }
      draw(time, dt);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [still, count, particleColor, activeColor, interactionRadius, snap, autoplay]);

  const lines = (title ?? "").split("\n");

  return (
    <section
      ref={root}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        touched.current = true;
        pointer.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, px: e.clientX - r.left, py: e.clientY - r.top, inside: true };
      }}
      onPointerLeave={() => {
        pointer.current.inside = false;
        if (warping.current) hold(false);
      }}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("a,button")) return;
        touched.current = true;
        hold(true);
      }}
      onPointerUp={() => {
        if (warping.current) hold(false);
      }}
      className={cn(
        "relative isolate flex min-h-[calc(100svh-4rem)] select-none items-center overflow-hidden rounded-[24px] bg-[#030409] text-white",
        "shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]",
        className,
      )}
    >
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_80%_at_50%_50%,transparent_40%,rgba(3,4,9,.9)_100%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-2/3 bg-[linear-gradient(90deg,rgba(3,4,9,.7),transparent)]" />

      <div className="relative z-10 w-full px-6 py-16 sm:px-12 lg:px-16">
        {children ?? (
          <motion.div
            className="max-w-xl"
            initial={still ? false : "hidden"}
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="text-[40px] font-semibold leading-[1.02] tracking-[-0.05em] sm:text-[60px]"
            >
              {lines.map((line, i) => (
                <Fragment key={i}>
                  {i === 0 ? line : <span className="text-white/50">{line}</span>}
                  {i < lines.length - 1 && <br />}
                </Fragment>
              ))}
            </motion.h1>
            {subtitle ? (
              <motion.p
                variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
                className="mt-5 max-w-md text-[15px] leading-relaxed text-white/65"
              >
                {subtitle}
              </motion.p>
            ) : null}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              {primaryCTA ? (
                <motion.a
                  href={primaryCTA.href ?? "#"}
                  onClick={primaryCTA.onClick}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex h-11 items-center rounded-full bg-white px-5 text-[14px] font-semibold text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030409]"
                >
                  {primaryCTA.label}
                </motion.a>
              ) : null}
              {secondaryCTA ? (
                <motion.a
                  href={secondaryCTA.href ?? "#"}
                  onClick={secondaryCTA.onClick}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex h-11 items-center rounded-full border border-white/15 bg-white/[0.06] px-5 text-[14px] font-medium text-white/85 outline-none hover:bg-white/[0.1] focus-visible:ring-2 focus-visible:ring-[#0a84ff]"
                >
                  {secondaryCTA.label}
                </motion.a>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </div>

      {warpLabel ? (
        <motion.button
          type="button"
          aria-label={warpLabel}
          aria-pressed={held}
          animate={{ scale: held ? 0.94 : 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            touched.current = true;
            hold(true);
          }}
          onPointerUp={() => hold(false)}
          onPointerCancel={() => hold(false)}
          onKeyDown={(e) => {
            if ((e.key === " " || e.key === "Enter") && !e.repeat) {
              e.preventDefault();
              touched.current = true;
              hold(true);
            }
          }}
          onKeyUp={(e) => {
            if (e.key === " " || e.key === "Enter") hold(false);
          }}
          onBlur={() => hold(false)}
          className="absolute bottom-4 right-4 z-20 inline-flex h-9 touch-none items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3.5 text-[12px] font-medium text-white/85 backdrop-blur outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff]"
        >
          <svg aria-hidden viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M2 8h3M11 8h3M8 2v3M8 11v3M3.8 3.8l2 2M10.2 10.2l2 2M12.2 3.8l-2 2M5.8 10.2l-2 2" />
          </svg>
          {held ? "Warping" : warpLabel}
        </motion.button>
      ) : null}
    </section>
  );
}
