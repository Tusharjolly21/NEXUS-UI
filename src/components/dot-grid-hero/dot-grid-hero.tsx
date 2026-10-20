"use client";

import { Fragment, useEffect, useRef, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CTAButton {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface DotGridHeroProps {
  /** Hero heading. Use \n for line breaks. */
  title?: string;
  /** Supporting paragraph under the heading. */
  subtitle?: string;
  /** Main action, drawn as a filled pill. */
  primaryCTA?: CTAButton;
  /** Secondary action, drawn as a text link with a chevron. */
  secondaryCTA?: CTAButton;
  /** Average spacing between dashes in px. */
  dotGap?: number;
  /** Radius around the pointer where dashes turn and get pushed, in px. */
  interactionRadius?: number;
  /** How hard the pointer pushes dashes away. */
  repulsionStrength?: number;
  /** Spring pulling dashes back to their spot (per frame). */
  springK?: number;
  /** Velocity kept per frame, 0 to 1. Lower settles faster. */
  damping?: number;
  /** Dash colours. */
  colors?: string[];
  /** Hero background. Defaults to white, or black in dark mode. */
  background?: string;
  /** Heading colour. Defaults to the theme's primary text colour. */
  textColor?: string;
  /** Caption at the bottom edge. Pass an empty string to hide it. */
  hint?: string;
  /** Sweeps a pretend pointer through the field and sends a ripple every few seconds until someone moves over it. */
  autoplay?: boolean;
  className?: string;
}

type Dash = { ox: number; oy: number; x: number; y: number; vx: number; vy: number; a: number; av: number; rest: number; len: number; w: number; color: string; alpha: number; k: number };
type Ring = { x: number; y: number; r: number };

const DEFAULT_COLORS = ["#0a84ff", "#5e5ce6", "#bf5af2", "#ff375f", "#ff9f0a", "#30d158"];

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

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/**
 * A hero over a field of coloured dashes, like iron filings round a magnet.
 * Near the pointer every dash swings to point at it and is pushed aside, then
 * wobbles back to its own heading on a spring. Click anywhere and a ripple
 * rolls out, kicking and spinning the dashes it passes.
 */
export function DotGridHero({
  title = "Build interfaces\nthat ship.",
  subtitle = "A motion-native component library for React. Animated, accessible and production-ready out of the box.",
  primaryCTA = { label: "Get started", href: "#" },
  secondaryCTA = { label: "Browse components", href: "#" },
  dotGap = 44,
  interactionRadius = 140,
  repulsionStrength = 5,
  springK = 0.06,
  damping = 0.82,
  colors = DEFAULT_COLORS,
  background,
  textColor,
  hint = "Move to steer the field. Click to send a ripple.",
  autoplay = false,
  className,
}: DotGridHeroProps) {
  const still = useReducedMotion() === true;
  const dark = useIsDark();
  const darkRef = useRef(dark);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0, y: 0, inside: false });
  const rings = useRef<Ring[]>([]);
  const touched = useRef(false);
  const palette = (colors.length ? colors : DEFAULT_COLORS).join("|");
  const gap = Math.max(18, dotGap);

  useEffect(() => {
    darkRef.current = dark;
  }, [dark]);
  // The live loop reads darkRef; a still frame has to be redrawn when the theme flips.
  const stillTheme = still ? dark : null;

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const tones = palette.split("|");
    let w = 0;
    let h = 0;
    let dashes: Dash[] = [];
    const build = () => {
      const rand = rng(Math.round(w) * 3 + Math.round(h) * 7 + gap);
      const out: Dash[] = [];
      const cols = Math.ceil(w / gap) + 1;
      const rowsN = Math.ceil(h / gap) + 1;
      for (let r = 0; r < rowsN; r++) {
        for (let c = 0; c < cols; c++) {
          const ox = c * gap + (rand() - 0.5) * gap * 0.9;
          const oy = r * gap + (rand() - 0.5) * gap * 0.9;
          const rest = rand() * Math.PI;
          out.push({ ox, oy, x: ox, y: oy, vx: 0, vy: 0, a: rest, av: 0, rest, len: 7 + rand() * 8, w: 2 + rand() * 1.4, color: tones[Math.floor(rand() * tones.length)], alpha: 0.5 + rand() * 0.4, k: 0 });
        }
      }
      dashes = out;
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (still) draw();
    });
    ro.observe(cv);

    function draw() {
      const isDark = darkRef.current;
      ctx!.clearRect(0, 0, w, h);
      for (const d of dashes) {
        // Dashes near the pointer grow and brighten as they turn toward it.
        const len = d.len * (1 + d.k * 0.9);
        const hl = len / 2;
        const hw = d.w / 2;
        ctx!.save();
        ctx!.translate(d.x, d.y);
        ctx!.rotate(d.a);
        ctx!.globalAlpha = Math.min(1, (d.alpha + d.k * 0.4) * (isDark ? 1.1 : 1));
        ctx!.fillStyle = d.color;
        ctx!.beginPath();
        ctx!.roundRect(-hl, -hw, len, d.w, hw);
        ctx!.fill();
        ctx!.restore();
      }
      ctx!.globalAlpha = 1;
    }

    if (still) {
      draw();
      return () => ro.disconnect();
    }

    let raf = 0;
    let last = performance.now();
    let time = 0;
    let demoClock = 0;
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
      const f = dt * 60;
      const p = pointer.current;
      let mx = 0;
      let my = 0;
      let active = false;
      if (p.inside) {
        mx = p.x;
        my = p.y;
        active = true;
      } else if (autoplay && !touched.current) {
        mx = w * (0.5 + 0.38 * Math.sin(time * 0.55));
        my = h * (0.5 + 0.32 * Math.sin(time * 0.9 + 0.6));
        active = true;
        demoClock += dt;
        if (demoClock > 3.2) {
          demoClock = 0;
          rings.current.push({ x: mx, y: my, r: 0 });
        }
      }
      const ir = Math.max(20, interactionRadius);
      const reach = ir * 1.9;
      const rs = rings.current;
      for (let i = rs.length - 1; i >= 0; i--) {
        rs[i].r += 620 * dt;
        if (rs[i].r > Math.hypot(w, h)) rs.splice(i, 1);
      }

      for (const d of dashes) {
        let face = 0;
        let target = d.rest;
        if (active) {
          const dx = d.x - mx;
          const dy = d.y - my;
          const dist = Math.hypot(dx, dy);
          if (dist < reach && dist > 0.01) {
            face = (1 - dist / reach) ** 1.5;
            target = Math.atan2(dy, dx);
            if (dist < ir) {
              const force = ((ir - dist) / ir) ** 2 * repulsionStrength;
              d.vx += (dx / dist) * force * f;
              d.vy += (dy / dist) * force * f;
            }
          }
        }
        for (const ring of rs) {
          const dx = d.x - ring.x;
          const dy = d.y - ring.y;
          const dist = Math.hypot(dx, dy) || 1;
          const band = 1 - Math.abs(dist - ring.r) / 36;
          if (band > 0) {
            const fall = Math.max(0.15, 1 - ring.r / 900);
            d.vx += (dx / dist) * band * 2.4 * fall * f;
            d.vy += (dy / dist) * band * 2.4 * fall * f;
            d.av += band * 0.09 * fall * f;
          }
        }
        d.k += (face - d.k) * Math.min(1, 0.2 * f);
        d.vx += (d.ox - d.x) * springK * f;
        d.vy += (d.oy - d.y) * springK * f;
        const keep = Math.pow(damping, f);
        d.vx *= keep;
        d.vy *= keep;
        d.x += d.vx * f;
        d.y += d.vy * f;
        // Dashes are symmetric, so aim for whichever end is nearer the target heading.
        let err = wrap(target - d.a);
        if (Math.abs(err) > Math.PI / 2) err = wrap(err + Math.PI);
        const rest = wrap(d.rest - d.a);
        d.av += (err * 0.16 * face + (Math.abs(rest) > Math.PI / 2 ? wrap(rest + Math.PI) : rest) * 0.025 * (1 - face)) * f;
        d.av *= Math.pow(0.86, f);
        d.a += d.av * f;
      }
      draw();
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [stillTheme, still, palette, gap, interactionRadius, repulsionStrength, springK, damping, autoplay]);

  const lines = title.split("\n");
  const tint = textColor ? { color: textColor } : undefined;

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
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("a,button")) return;
        const r = e.currentTarget.getBoundingClientRect();
        touched.current = true;
        rings.current.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 0 });
      }}
      className={cn(
        "relative isolate flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden",
        !background && "bg-white dark:bg-black",
        className,
      )}
      style={background ? { background } : undefined}
    >
      <canvas
        ref={canvas}
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full [mask-image:radial-gradient(ellipse_90%_85%_at_50%_50%,#000_55%,transparent)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_34%_26%_at_50%_42%,rgba(255,255,255,.75),transparent)] dark:bg-[radial-gradient(ellipse_34%_26%_at_50%_42%,rgba(0,0,0,.7),transparent)]" style={background ? { display: "none" } : undefined} />

      <motion.div
        className="relative z-10 mx-auto max-w-3xl px-6 py-20 text-center"
        initial={still ? false : "hidden"}
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.h1
          variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className={cn("text-[40px] font-semibold leading-[1.02] tracking-[-0.05em] [text-wrap:balance] sm:text-[64px]", !textColor && "text-[#1d1d1f] dark:text-[#f5f5f7]")}
          style={tint}
        >
          {lines.map((line, i) => (
            <Fragment key={i}>
              {line}
              {i < lines.length - 1 && <br />}
            </Fragment>
          ))}
        </motion.h1>
        {subtitle ? (
          <motion.p
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className={cn("mx-auto mt-5 max-w-xl text-[16px] leading-relaxed sm:text-[18px]", !textColor && "text-[#6e6e73] dark:text-[#a1a1a6]")}
            style={textColor ? { color: textColor, opacity: 0.7 } : undefined}
          >
            {subtitle}
          </motion.p>
        ) : null}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
        >
          {primaryCTA ? (
            <motion.a
              href={primaryCTA.href ?? "#"}
              onClick={primaryCTA.onClick}
              whileTap={{ scale: 0.95 }}
              className="inline-flex h-11 items-center rounded-full bg-[#0071e3] px-6 text-[15px] font-medium text-white outline-none hover:bg-[#0077ed] focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#0a84ff] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
            >
              {primaryCTA.label}
            </motion.a>
          ) : null}
          {secondaryCTA ? (
            <a
              href={secondaryCTA.href ?? "#"}
              onClick={secondaryCTA.onClick}
              className="group inline-flex items-center gap-1 rounded-md text-[15px] font-medium text-[#0066cc] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:text-[#2997ff] dark:focus-visible:ring-[#0a84ff]"
            >
              {secondaryCTA.label}
              <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3.5 10.5 8 6 12.5" />
              </svg>
            </a>
          ) : null}
        </motion.div>
      </motion.div>
      {hint ? <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{hint}</p> : null}
    </section>
  );
}
