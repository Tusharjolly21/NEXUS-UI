"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Public types ──────────────────────────────────────────────────────────────
export interface CTAButton {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface DotGridHeroProps {
  title?: string;
  subtitle?: string;
  primaryCTA?: CTAButton;
  secondaryCTA?: CTAButton;
  /** Average spacing between particles in px. @default 72 */
  dotGap?: number;
  /** Radius around cursor where particles repel (px). @default 120 */
  interactionRadius?: number;
  /** Repulsion force strength. @default 7 */
  repulsionStrength?: number;
  /** Spring constant pulling particles home. @default 0.065 */
  springK?: number;
  /** Velocity damping per frame (0–1). @default 0.80 */
  damping?: number;
  /** Particle colours. Defaults to multi-colour palette. */
  colors?: string[];
  /** Hero background colour. @default "#ffffff" */
  background?: string;
  /** Text colour. @default "#09090b" */
  textColor?: string;
  className?: string;
}

// ── Particle type (canvas-internal) ──────────────────────────────────────────
type Particle = {
  ox: number; oy: number;   // rest / origin
  x:  number; y:  number;   // current position
  vx: number; vy: number;   // velocity
  w:  number;               // dash width  (2–4 px)
  h:  number;               // dash height (7–16 px)
  rot: number;              // rotation radians (fixed)
  color: string;
  alpha: number;            // base opacity
};

const DEFAULT_COLORS = [
  "#4285f4", "#5b6ef5", "#7c3aed",
  "#1d4ed8", "#ea4335", "#dc2626",
  "#f97316", "#6366f1",
];

// ── Canvas particle field ─────────────────────────────────────────────────────
interface FieldProps {
  dotGap: number;
  interactionRadius: number;
  repulsionStrength: number;
  springK: number;
  damping: number;
  colors: string[];
  background: string;
  reduceMotion: boolean;
}

function ParticleField({
  dotGap,
  interactionRadius,
  repulsionStrength,
  springK,
  damping,
  colors,
  background,
  reduceMotion,
}: FieldProps) {
  const canvasRef    = React.useRef<HTMLCanvasElement>(null);
  const mouseRef     = React.useRef({ x: -9999, y: -9999, active: false });
  const particlesRef = React.useRef<Particle[]>([]);
  const rafRef       = React.useRef<number>(0);

  // ── Build / rebuild particle array to fill current canvas ──────────────────
  function buildParticles(W: number, H: number): Particle[] {
    const jitter  = dotGap * 0.55;
    const cols    = Math.ceil(W / dotGap) + 1;
    const rows    = Math.ceil(H / dotGap) + 1;
    const ps: Particle[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ox = c * dotGap + (Math.random() - 0.5) * jitter * 2;
        const oy = r * dotGap + (Math.random() - 0.5) * jitter * 2;
        ps.push({
          ox, oy,
          x: ox, y: oy,
          vx: 0, vy: 0,
          w:   1.8 + Math.random() * 1.6,
          h:   7   + Math.random() * 9,
          rot: Math.random() * Math.PI * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.55 + Math.random() * 0.35,
        });
      }
    }
    return ps;
  }

  // ── Mouse / touch tracking ──────────────────────────────────────────────────
  React.useEffect(() => {
    const updateMouse = (cx: number, cy: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: cx - r.left, y: cy - r.top, active: true };
    };
    const onMove  = (e: MouseEvent)  => updateMouse(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent)  => {
      if (e.touches[0]) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onLeave = () => { mouseRef.current.active = false; };

    window.addEventListener("mousemove",  onMove,  { passive: true });
    window.addEventListener("touchmove",  onTouch, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchend",   onLeave);
    return () => {
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("touchmove",  onTouch);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchend",   onLeave);
    };
  }, []);

  // ── Animation loop ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Capture non-null refs for use inside nested functions
    const cvs = canvas;
    const c   = ctx;

    let W = 0, H = 0;
    let dpr = 1;

    function resize() {
      dpr      = Math.min(window.devicePixelRatio ?? 1, 2);
      W        = cvs.offsetWidth;
      H        = cvs.offsetHeight;
      cvs.width  = W * dpr;
      cvs.height = H * dpr;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      particlesRef.current = buildParticles(W, H);
    }

    function draw() {
      c.clearRect(0, 0, W, H);

      const mx      = mouseRef.current.x;
      const my      = mouseRef.current.y;
      const active  = mouseRef.current.active && !reduceMotion;
      const ir      = interactionRadius;
      const ir2     = ir * ir;

      for (const p of particlesRef.current) {
        // ── Physics ──────────────────────────────────────────────────────────
        if (active) {
          const dx    = p.x - mx;
          const dy    = p.y - my;
          const dist2 = dx * dx + dy * dy;

          if (dist2 < ir2 && dist2 > 0.01) {
            const dist  = Math.sqrt(dist2);
            const force = ((ir - dist) / ir) ** 2 * repulsionStrength;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        p.vx += (p.ox - p.x) * springK;
        p.vy += (p.oy - p.y) * springK;
        p.vx *= damping;
        p.vy *= damping;
        p.x  += p.vx;
        p.y  += p.vy;

        // ── Draw dash ────────────────────────────────────────────────────────
        const speed   = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const stretch = Math.min(speed * 0.6, 6);
        const drawH   = p.h + stretch;

        c.save();
        c.translate(p.x, p.y);
        const velAngle = speed > 0.5 ? Math.atan2(p.vy, p.vx) + Math.PI / 2 : p.rot;
        c.rotate(speed > 0.5 ? velAngle : p.rot);
        c.globalAlpha = p.alpha;
        c.fillStyle   = p.color;

        const hw = p.w / 2;
        const hh = drawH / 2;
        const cr = hw;
        c.beginPath();
        c.moveTo(-hw + cr, -hh);
        c.lineTo( hw - cr, -hh);
        c.quadraticCurveTo( hw, -hh,  hw, -hh + cr);
        c.lineTo( hw,  hh - cr);
        c.quadraticCurveTo( hw,  hh,  hw - cr,  hh);
        c.lineTo(-hw + cr,  hh);
        c.quadraticCurveTo(-hw,  hh, -hw,  hh - cr);
        c.lineTo(-hw, -hh + cr);
        c.quadraticCurveTo(-hw, -hh, -hw + cr, -hh);
        c.closePath();
        c.fill();
        c.restore();
      }

      c.globalAlpha  = 1;
      rafRef.current = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(cvs);
    resize();
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [
    dotGap, interactionRadius, repulsionStrength,
    springK, damping, colors, reduceMotion,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{ pointerEvents: "none", background }}
    />
  );
}

// ── Hero component ─────────────────────────────────────────────────────────────
const FADE_UP = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0  },
};
const EASE = [0.22, 1, 0.36, 1] as const;

export function DotGridHero({
  title             = "Build interfaces\nthat ship.",
  subtitle          = "A motion-native component library for React. Animated, accessible, and production-ready out of the box.",
  primaryCTA        = { label: "Get started",         href: "#" },
  secondaryCTA      = { label: "Browse components",   href: "#" },
  dotGap            = 72,
  interactionRadius = 120,
  repulsionStrength = 7,
  springK           = 0.065,
  damping           = 0.80,
  colors            = DEFAULT_COLORS,
  background        = "#ffffff",
  textColor         = "#09090b",
  className,
}: DotGridHeroProps) {
  const reduceMotion = useReducedMotion() === true;

  const titleLines = title.split("\n");

  return (
    <section
      className={cn(
        "relative isolate flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden",
        className,
      )}
      style={{ background }}
    >
      {/* ── Particle canvas ── */}
      <ParticleField
        dotGap={dotGap}
        interactionRadius={interactionRadius}
        repulsionStrength={repulsionStrength}
        springK={springK}
        damping={damping}
        colors={colors}
        background={background}
        reduceMotion={reduceMotion}
      />

      {/* ── Hero content ── */}
      <motion.div
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      >
        {/* Title */}
        <motion.h1
          variants={FADE_UP}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-balance text-5xl font-bold tracking-[-0.025em] sm:text-6xl lg:text-7xl"
          style={{ color: textColor }}
        >
          {titleLines.map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < titleLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            variants={FADE_UP}
            transition={{ duration: 0.6, ease: EASE }}
            className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed"
            style={{ color: `${textColor}99` }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* CTAs */}
        <motion.div
          variants={FADE_UP}
          transition={{ duration: 0.55, ease: EASE }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {primaryCTA && (
            <a
              href={primaryCTA.href ?? "#"}
              onClick={primaryCTA.onClick}
              className={cn(
                "group inline-flex items-center gap-2 rounded-full px-6 py-2.5",
                "text-sm font-semibold shadow-sm",
                "transition-all duration-200 hover:gap-3 hover:opacity-90",
              )}
              style={{ background: textColor, color: background }}
            >
              {primaryCTA.label}
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
          )}

          {secondaryCTA && (
            <a
              href={secondaryCTA.href ?? "#"}
              onClick={secondaryCTA.onClick}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-6 py-2.5",
                "text-sm font-medium",
                "transition-all duration-200 hover:opacity-80",
              )}
              style={{
                borderColor: `${textColor}22`,
                color: `${textColor}bb`,
                background: `${textColor}08`,
              }}
            >
              {secondaryCTA.label}
            </a>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
